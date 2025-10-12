#!/usr/bin/env tsx
/**
 * Miyabi Agent Visualization Dashboard - Server
 *
 * Real-time WebSocket server for Agent execution visualization
 */

import express from 'express';
import { createServer } from 'http';
import { Server as SocketServer } from 'socket.io';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import { GraphBuilder } from './graph-builder.js';
import { WebhookHandler } from './webhook-handler.js';
import { validateDashboardEventMiddleware } from './validation/event-validators.js';
import { throttleEventMiddleware } from './middleware/throttle.js';
import { globalRateLimiter } from './middleware/rate-limiter.js';
import { GraphDebouncer } from './services/graph-debouncer.js';
import { LayoutEngine } from '../../dashboard/src/services/LayoutEngine.js';
import type {
  AgentStartedEvent,
  AgentProgressEvent,
  AgentCompletedEvent,
  AgentErrorEvent,
  StateTransitionEvent,
  TaskDiscoveredEvent,
  CoordinatorAnalyzingEvent,
  CoordinatorDecomposingEvent,
  CoordinatorAssigningEvent,
} from './types.js';

// Load environment variables
dotenv.config();

// Configuration
const PORT = process.env.PORT || 3001;
const DASHBOARD_URL = process.env.DASHBOARD_URL || 'http://localhost:5173';
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const GITHUB_WEBHOOK_SECRET = process.env.GITHUB_WEBHOOK_SECRET || 'dev-secret';

// Parse repository from env or git remote
const REPOSITORY = process.env.REPOSITORY || 'ShunsukeHayashi/Miyabi';
const [REPO_OWNER, REPO_NAME] = REPOSITORY.split('/');

if (!GITHUB_TOKEN) {
  console.error('❌ GITHUB_TOKEN is required');
  process.exit(1);
}

// Initialize Express app
const app = express();
const httpServer = createServer(app);

// Initialize Socket.IO with CORS
const io = new SocketServer(httpServer, {
  cors: {
    origin: DASHBOARD_URL,
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// Initialize Graph Builder
const graphBuilder = new GraphBuilder(GITHUB_TOKEN, REPO_OWNER, REPO_NAME);

// Initialize WebHook Handler
const webhookHandler = new WebhookHandler(
  GITHUB_WEBHOOK_SECRET,
  io,
  graphBuilder
);

// Initialize LayoutEngine
const layoutEngine = new LayoutEngine();

// Initialize GraphDebouncer
const graphDebouncer = new GraphDebouncer((event) => {
  io.emit('graph:update', event);
});

// Event History Storage (in-memory, can be replaced with Redis/DB)
interface EventHistoryEntry {
  id: string;
  event: any;
  timestamp: string;
}

const eventHistory: EventHistoryEntry[] = [];
const MAX_HISTORY_SIZE = 1000;

function addToEventHistory(event: any): void {
  const entry: EventHistoryEntry = {
    id: `${Date.now()}-${Math.random().toString(36).substring(7)}`,
    event,
    timestamp: new Date().toISOString(),
  };

  eventHistory.unshift(entry);  // Add to beginning

  // Trim to max size
  if (eventHistory.length > MAX_HISTORY_SIZE) {
    eventHistory.splice(MAX_HISTORY_SIZE);
  }
}

// ============================================================================
// Device Tracking (Multi-Device Development)
// ============================================================================

interface DeviceState {
  device: {
    identifier: string;
    hostname: string;
    platform: string;
    arch: string;
    nodeVersion: string;
  };
  status: 'online' | 'offline' | 'idle';
  lastActivity: string;
  recentActivities: Array<{
    event: string;
    timestamp: string;
    branch: string;
    commit: string;
  }>;
  currentBranch?: string;
  totalEvents: number;
}

const deviceStates = new Map<string, DeviceState>();
const DEVICE_TIMEOUT_MS = 300000; // 5 minutes - mark as idle
const DEVICE_OFFLINE_MS = 600000; // 10 minutes - mark as offline
const MAX_RECENT_ACTIVITIES = 20;

/**
 * Update device state from webhook payload
 */
function updateDeviceState(payload: any): void {
  const { device, event, timestamp, git } = payload;

  if (!device || !device.identifier) {
    console.warn('⚠️  No device identifier in payload');
    return;
  }

  const identifier = device.identifier;
  const existingState = deviceStates.get(identifier);

  const activity = {
    event,
    timestamp,
    branch: git?.branch || 'unknown',
    commit: git?.commit?.short_hash || 'unknown',
  };

  const newState: DeviceState = {
    device: {
      identifier: device.identifier,
      hostname: device.hostname || 'unknown',
      platform: device.platform || 'unknown',
      arch: device.arch || 'unknown',
      nodeVersion: device.nodeVersion || 'unknown',
    },
    status: 'online',
    lastActivity: timestamp,
    recentActivities: existingState
      ? [activity, ...existingState.recentActivities].slice(0, MAX_RECENT_ACTIVITIES)
      : [activity],
    currentBranch: git?.branch,
    totalEvents: existingState ? existingState.totalEvents + 1 : 1,
  };

  deviceStates.set(identifier, newState);

  console.log(`📱 Device updated: ${identifier} (${device.platform}) - ${event} on ${git?.branch}`);

  // Broadcast device state update
  io.emit('device:update', {
    identifier,
    state: newState,
    timestamp: new Date().toISOString(),
  });
}

/**
 * Check device status and update to idle/offline
 */
function checkDeviceStatus(): void {
  const now = Date.now();

  for (const [identifier, state] of deviceStates.entries()) {
    const lastActivityTime = new Date(state.lastActivity).getTime();
    const timeSinceActivity = now - lastActivityTime;

    let newStatus: 'online' | 'offline' | 'idle' = state.status;

    if (timeSinceActivity > DEVICE_OFFLINE_MS) {
      newStatus = 'offline';
    } else if (timeSinceActivity > DEVICE_TIMEOUT_MS) {
      newStatus = 'idle';
    }

    if (newStatus !== state.status) {
      state.status = newStatus;
      deviceStates.set(identifier, state);

      console.log(`📱 Device status changed: ${identifier} → ${newStatus}`);

      io.emit('device:status-change', {
        identifier,
        status: newStatus,
        lastActivity: state.lastActivity,
        timestamp: new Date().toISOString(),
      });
    }
  }
}

// Check device status every minute
setInterval(checkDeviceStatus, 60000);

/**
 * Get all device states
 */
function getAllDeviceStates(): DeviceState[] {
  return Array.from(deviceStates.values());
}

// ============================================================================
// Rate Limit Management
// ============================================================================

let rateLimitedUntil: number = 0; // Timestamp when rate limit expires
let rateLimitHitCount: number = 0; // Number of times rate limit was hit
const RATE_LIMIT_COOLDOWN = 60000; // Default 60 seconds cooldown

/**
 * Check if we are currently rate limited
 */
function isRateLimited(): boolean {
  const now = Date.now();
  if (now < rateLimitedUntil) {
    const remainingSeconds = Math.ceil((rateLimitedUntil - now) / 1000);
    console.log(`⏳ Rate limited for ${remainingSeconds} more seconds`);
    return true;
  }
  return false;
}

/**
 * Set rate limit backoff based on Retry-After header
 */
function setRateLimitBackoff(retryAfterSeconds?: number): void {
  const cooldown = retryAfterSeconds ? retryAfterSeconds * 1000 : RATE_LIMIT_COOLDOWN;
  rateLimitedUntil = Date.now() + cooldown;
  rateLimitHitCount++;

  console.error(`🚫 Rate limit detected (hit #${rateLimitHitCount})`);
  console.error(`⏰ Backing off for ${Math.ceil(cooldown / 1000)} seconds`);
  console.error(`📅 Rate limit expires at: ${new Date(rateLimitedUntil).toISOString()}`);

  // Alert if rate limit is hit too frequently
  if (rateLimitHitCount >= 3) {
    console.error('⚠️  WARNING: Rate limit hit multiple times! Consider increasing cache TTL.');
  }
}

/**
 * Handle GitHub API errors with rate limit detection
 */
function handleGitHubError(error: any): { useMock: boolean; error: any } {
  // Check for rate limit errors
  if (
    error.status === 403 ||
    error.message?.includes('rate limit') ||
    error.message?.includes('secondary rate limit')
  ) {
    // Extract retry-after header if available
    const retryAfter = error.response?.headers?.['retry-after'];
    const retryAfterSeconds = retryAfter ? parseInt(retryAfter, 10) : undefined;

    setRateLimitBackoff(retryAfterSeconds);
    return { useMock: true, error };
  }

  // Other errors - don't use mock
  return { useMock: false, error };
}

// ============================================================================
// Middleware
// ============================================================================

app.use(
  cors({
    origin: DASHBOARD_URL,
    credentials: true,
  })
);

app.use(express.json());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
});

app.use('/api/', limiter);

// ============================================================================
// Mock Data (for development when rate limited)
// ============================================================================

function getMockGraph() {
  return {
    nodes: [
      // Issue nodes
      {
        id: 'issue-47',
        type: 'issue',
        position: { x: 100, y: 100 },
        data: {
          number: 47,
          title: 'Security Audit Report - 2025-10-10',
          state: '📥 state:pending',
          labels: ['security', 'audit', '📥 state:pending', '📝 priority:P3-Low'],
          priority: '📝 priority:P3-Low',
          assignedAgents: ['issue'],
          url: 'https://github.com/ShunsukeHayashi/Miyabi/issues/47',
        },
      },
      {
        id: 'issue-58',
        type: 'issue',
        position: { x: 100, y: 300 },
        data: {
          number: 58,
          title: '🐛 Bug: miyabi init creates incomplete project setup',
          state: '📥 state:pending',
          labels: ['bug', '⚠️ priority:P1-High', '📥 state:pending'],
          priority: '⚠️ priority:P1-High',
          assignedAgents: ['coordinator'],
          url: 'https://github.com/ShunsukeHayashi/Miyabi/issues/58',
        },
      },
      {
        id: 'issue-56',
        type: 'issue',
        position: { x: 100, y: 500 },
        data: {
          number: 56,
          title: '[STRATEGIC] Miyabi SaaS Platform Development',
          state: '📥 state:pending',
          labels: ['enhancement', '📥 state:pending'],
          priority: undefined,
          assignedAgents: [],
          url: 'https://github.com/ShunsukeHayashi/Miyabi/issues/56',
        },
      },
      // Agent nodes
      {
        id: 'agent-coordinator',
        type: 'agent',
        position: { x: 500, y: 100 },
        data: {
          name: 'CoordinatorAgent',
          agentId: 'coordinator',
          status: 'idle',
          progress: 0,
        },
      },
      {
        id: 'agent-codegen',
        type: 'agent',
        position: { x: 500, y: 250 },
        data: {
          name: 'CodeGenAgent',
          agentId: 'codegen',
          status: 'idle',
          progress: 0,
        },
      },
      {
        id: 'agent-issue',
        type: 'agent',
        position: { x: 500, y: 400 },
        data: {
          name: 'IssueAgent',
          agentId: 'issue',
          status: 'idle',
          progress: 0,
        },
      },
      // State nodes
      {
        id: 'state-pending',
        type: 'state',
        position: { x: 900, y: 200 },
        data: {
          label: 'state:pending',
          emoji: '📥',
          count: 3,
          color: '#E4E4E4',
          description: 'Issue created, awaiting triage',
        },
      },
    ],
    edges: [
      // Issue to Agent
      {
        id: 'issue-58-to-agent-coordinator',
        source: 'issue-58',
        target: 'agent-coordinator',
        type: 'issue-to-agent',
        animated: true,
      },
      {
        id: 'issue-47-to-agent-issue',
        source: 'issue-47',
        target: 'agent-issue',
        type: 'issue-to-agent',
        animated: true,
      },
      // Dependencies (from Issue #58)
      {
        id: 'dep-58-depends-47',
        source: 'issue-47',
        target: 'issue-58',
        type: 'depends-on',
        label: 'depends on',
        animated: false,
        style: {
          stroke: '#FB923C',
          strokeWidth: 2,
          strokeDasharray: '5,5',
        },
      },
      {
        id: 'dep-58-blocks-56',
        source: 'issue-58',
        target: 'issue-56',
        type: 'blocks',
        label: 'blocks',
        animated: false,
        style: {
          stroke: '#EF4444',
          strokeWidth: 2,
          strokeDasharray: '10,5',
        },
      },
    ],
  };
}

// ============================================================================
// HTTP API Endpoints
// ============================================================================

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    repository: REPOSITORY,
  });
});

// Get full graph
app.get('/api/graph', async (req, res) => {
  try {
    // Check if we're currently rate limited
    if (isRateLimited()) {
      console.log('⚠️  Rate limited - returning mock data');
      const mockGraph = getMockGraph();
      return res.json(mockGraph);
    }

    const graph = await graphBuilder.buildFullGraph();
    res.json(graph);
  } catch (error: any) {
    console.error('❌ Error building graph:', error);

    const { useMock, error: handledError } = handleGitHubError(error);

    if (useMock) {
      const mockGraph = getMockGraph();
      return res.json(mockGraph);
    }

    res.status(500).json({ error: handledError.message });
  }
});

// Get graph for specific issue
app.get('/api/issues/:number/flow', async (req, res) => {
  try {
    const issueNumber = parseInt(req.params.number, 10);
    const graph = await graphBuilder.buildIssueGraph(issueNumber);
    res.json(graph);
  } catch (error: any) {
    console.error(`❌ Error building graph for issue:`, error);
    res.status(500).json({ error: error.message });
  }
});

// Manual refresh endpoint (for local development without webhooks)
app.post('/api/refresh', async (req, res) => {
  try {
    console.log('🔄 Manual graph refresh triggered');

    // Check if rate limited
    if (isRateLimited()) {
      console.log('⚠️  Rate limited - returning mock data');
      const mockGraph = getMockGraph();
      io.emit('graph:update', {
        ...mockGraph,
        timestamp: new Date().toISOString(),
      });
      return res.json({
        success: true,
        message: 'Rate limited - using cached/mock data',
        rateLimited: true,
      });
    }

    // Clear cache to force fresh data
    graphBuilder.clearCache();

    const graph = await graphBuilder.buildFullGraph();

    // Broadcast to all connected clients
    io.emit('graph:update', {
      nodes: graph.nodes,
      edges: graph.edges,
      timestamp: new Date().toISOString(),
    });

    res.json({ success: true, message: 'Graph refreshed', rateLimited: false });
  } catch (error: any) {
    console.error('❌ Error refreshing graph:', error);

    const { useMock, error: handledError } = handleGitHubError(error);

    if (useMock) {
      const mockGraph = getMockGraph();
      io.emit('graph:update', {
        ...mockGraph,
        timestamp: new Date().toISOString(),
      });
      return res.json({
        success: true,
        message: 'Rate limited - using mock data',
        rateLimited: true,
      });
    }

    res.status(500).json({ error: handledError.message });
  }
});

// Agent event endpoint (called from .claude/hooks)
app.post('/api/agent-event', (req, res) => {
  try {
    const { eventType, agentId, issueNumber, progress, message, error, result, tasks, analysis, subtasks, assignments } = req.body;

    const timestamp = new Date().toISOString();

    console.log(`📡 Agent event: ${eventType} - ${agentId || 'system'} on #${issueNumber || 'N/A'}`);

    // Emit appropriate event based on type
    switch (eventType) {
      case 'task:discovered':
        io.emit('task:discovered', { tasks, timestamp });
        break;

      case 'coordinator:analyzing':
        io.emit('coordinator:analyzing', { issueNumber, title: req.body.title, analysis, timestamp });
        break;

      case 'coordinator:decomposing':
        io.emit('coordinator:decomposing', { issueNumber, subtasks, timestamp });
        break;

      case 'coordinator:assigning':
        io.emit('coordinator:assigning', { issueNumber, assignments, timestamp });
        break;

      case 'started':
        io.emit('agent:started', { agentId, issueNumber, parameters: req.body.parameters, timestamp });
        break;

      case 'progress':
        io.emit('agent:progress', { agentId, issueNumber, progress, message, timestamp });
        break;

      case 'completed':
        io.emit('agent:completed', { agentId, issueNumber, result, timestamp });
        // Refresh graph after completion (with rate limit check and debounce)
        if (!isRateLimited() && !pendingGraphUpdate) {
          // Use debounced update to avoid rapid API calls
          pendingGraphUpdate = setTimeout(async () => {
            try {
              console.log('🔄 Refreshing graph after agent completion');
              const graph = await graphBuilder.buildFullGraph();
              io.emit('graph:update', { nodes: graph.nodes, edges: graph.edges, timestamp: new Date().toISOString() });
            } catch (error: any) {
              console.error('❌ Error refreshing graph:', error);
              const { useMock } = handleGitHubError(error);
              if (useMock) {
                io.emit('graph:update', { ...getMockGraph(), timestamp: new Date().toISOString() });
              }
            } finally {
              pendingGraphUpdate = null;
            }
          }, GRAPH_UPDATE_DEBOUNCE);
        } else {
          console.log('⏭️  Skipping graph refresh (rate limited or already pending)');
        }
        break;

      case 'error':
        io.emit('agent:error', { agentId, issueNumber, error, timestamp });
        break;

      default:
        console.warn(`⚠️  Unknown event type: ${eventType}`);
    }

    res.json({ success: true, message: 'Event received' });
  } catch (error: any) {
    console.error('❌ Error processing agent event:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============================================================================
// New API Endpoints (Section 3.1)
// ============================================================================

// 1. POST /api/workflow/trigger - Manual workflow start
app.post('/api/workflow/trigger', async (req, res) => {
  try {
    const { issueNumber, agentId, parameters } = req.body;

    if (!issueNumber || typeof issueNumber !== 'number') {
      return res.status(400).json({
        success: false,
        error: 'Invalid request: issueNumber (number) is required',
      });
    }

    console.log(`🎯 Manual workflow triggered for issue #${issueNumber}`);

    // Emit task:discovered event
    const event = {
      eventType: 'task:discovered',
      issueNumber,
      taskDetails: {
        title: `Manual workflow for issue #${issueNumber}`,
        priority: 'P1-High',
        triggeredManually: true,
      },
      timestamp: new Date().toISOString(),
    };

    io.emit('task:discovered', event);
    addToEventHistory(event);

    // If specific agent requested, start it
    if (agentId) {
      const startEvent = {
        eventType: 'started',
        agentId,
        issueNumber,
        parameters,
        timestamp: new Date().toISOString(),
      };
      io.emit('agent:started', startEvent);
      addToEventHistory(startEvent);
    }

    res.json({
      success: true,
      message: 'Workflow triggered',
      workflowId: `workflow-${issueNumber}-${Date.now()}`,
      estimatedCompletion: new Date(Date.now() + 300000).toISOString(),  // +5 min
    });
  } catch (error: any) {
    console.error('❌ Error triggering workflow:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// 2. GET /api/agents/status - All agent status
app.get('/api/agents/status', (req, res) => {
  // TODO: Track agent status in real-time (currently returns mock data)
  res.json({
    success: true,
    agents: [
      {
        agentId: 'coordinator',
        status: 'idle',
        currentTask: null,
        statistics: {
          totalTasks: 0,
          successRate: 0,
          avgDuration: 0,
        },
      },
      {
        agentId: 'codegen',
        status: 'idle',
        currentTask: null,
        statistics: {
          totalTasks: 0,
          successRate: 0,
          avgDuration: 0,
        },
      },
      {
        agentId: 'review',
        status: 'idle',
        currentTask: null,
        statistics: {
          totalTasks: 0,
          successRate: 0,
          avgDuration: 0,
        },
      },
      {
        agentId: 'issue',
        status: 'idle',
        currentTask: null,
        statistics: {
          totalTasks: 0,
          successRate: 0,
          avgDuration: 0,
        },
      },
      {
        agentId: 'pr',
        status: 'idle',
        currentTask: null,
        statistics: {
          totalTasks: 0,
          successRate: 0,
          avgDuration: 0,
        },
      },
      {
        agentId: 'deployment',
        status: 'idle',
        currentTask: null,
        statistics: {
          totalTasks: 0,
          successRate: 0,
          avgDuration: 0,
        },
      },
      {
        agentId: 'test',
        status: 'idle',
        currentTask: null,
        statistics: {
          totalTasks: 0,
          successRate: 0,
          avgDuration: 0,
        },
      },
    ],
  });
});

// 3. POST /api/layout/recalculate - Force layout recalculation
app.post('/api/layout/recalculate', async (req, res) => {
  try {
    console.log('🔧 Manual layout recalculation triggered');

    const { algorithm, options } = req.body;

    // Get current graph
    const graph = await graphBuilder.buildFullGraph();

    // Recalculate layout
    const layoutResult = layoutEngine.calculateLayout(graph.nodes, graph.edges);

    // Broadcast updated graph
    const updateEvent = {
      eventType: 'graph:update',
      nodes: layoutResult.nodes,
      edges: layoutResult.edges,
      timestamp: new Date().toISOString(),
    };

    io.emit('graph:update', updateEvent);
    addToEventHistory(updateEvent);

    res.json({
      success: true,
      message: 'Layout recalculated',
      nodes: layoutResult.nodes,
      calculationTime: 0,  // TODO: measure actual time
    });
  } catch (error: any) {
    console.error('❌ Error recalculating layout:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// 4. GET /api/devices - Get all connected devices
app.get('/api/devices', (req, res) => {
  try {
    const devices = getAllDeviceStates();

    res.json({
      success: true,
      devices,
      total: devices.length,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('❌ Error fetching devices:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// 5. GET /api/devices/:identifier - Get specific device state
app.get('/api/devices/:identifier', (req, res) => {
  try {
    const { identifier } = req.params;
    const device = deviceStates.get(identifier);

    if (!device) {
      return res.status(404).json({
        success: false,
        error: `Device not found: ${identifier}`,
      });
    }

    res.json({
      success: true,
      device,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('❌ Error fetching device:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// 6. GET /api/events/history - Event history with pagination
app.get('/api/events/history', (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit as string) || 50, 200);
    const offset = parseInt(req.query.offset as string) || 0;
    const eventType = req.query.eventType as string;
    const agentId = req.query.agentId as string;
    const issueNumber = req.query.issueNumber ? parseInt(req.query.issueNumber as string) : undefined;

    // Filter events
    let filtered = eventHistory;

    if (eventType) {
      filtered = filtered.filter(e => e.event.eventType === eventType);
    }

    if (agentId) {
      filtered = filtered.filter(e => e.event.agentId === agentId);
    }

    if (issueNumber) {
      filtered = filtered.filter(e => e.event.issueNumber === issueNumber);
    }

    // Paginate
    const total = filtered.length;
    const events = filtered.slice(offset, offset + limit);

    res.json({
      success: true,
      events,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total,
      },
    });
  } catch (error: any) {
    console.error('❌ Error fetching event history:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============================================================================
// Local WebHook Endpoint (for Git Hooks)
// ============================================================================

/**
 * Local WebHook endpoint for receiving events from local Git hooks
 * This endpoint receives pre-push, post-push, pre-commit, post-commit events
 */
app.post('/api/webhook/local', express.json(), (req, res) => {
  try {
    const payload = req.body;
    const { event, timestamp, device, git, project } = payload;

    if (!event || !timestamp) {
      return res.status(400).json({
        success: false,
        error: 'Invalid payload: event and timestamp are required',
      });
    }

    console.log(`\n📥 Local WebHook Received`);
    console.log(`   Event: ${event}`);
    console.log(`   Device: ${device?.identifier || 'unknown'}`);
    console.log(`   Branch: ${git?.branch || 'unknown'}`);
    console.log(`   Commit: ${git?.commit?.short_hash || 'unknown'}`);
    console.log(`   Timestamp: ${timestamp}\n`);

    // Store event in history
    const historyEntry = {
      eventType: `local:${event}`,
      ...payload,
    };
    addToEventHistory(historyEntry);

    // Update device state
    updateDeviceState(payload);

    // Broadcast to all connected clients
    io.emit('local:webhook', {
      eventType: `local:${event}`,
      ...payload,
    });

    // For post-push events, trigger a graph refresh
    if (event === 'post-push' && !isRateLimited()) {
      console.log('🔄 Triggering graph refresh after post-push event');

      // Debounced graph update
      if (!pendingGraphUpdate) {
        pendingGraphUpdate = setTimeout(async () => {
          try {
            const graph = await graphBuilder.buildFullGraph();
            io.emit('graph:update', {
              nodes: graph.nodes,
              edges: graph.edges,
              timestamp: new Date().toISOString(),
            });
            console.log('✅ Graph refreshed after post-push');
          } catch (error: any) {
            console.error('❌ Error refreshing graph:', error);
            const { useMock } = handleGitHubError(error);
            if (useMock) {
              io.emit('graph:update', {
                ...getMockGraph(),
                timestamp: new Date().toISOString(),
              });
            }
          } finally {
            pendingGraphUpdate = null;
          }
        }, GRAPH_UPDATE_DEBOUNCE);
      }
    }

    res.json({
      success: true,
      message: `Local webhook ${event} received`,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('❌ Error processing local webhook:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// GitHub WebHook endpoint
app.use(webhookHandler.getMiddleware());

// ============================================================================
// WebSocket Connection Debouncing
// ============================================================================

let pendingGraphUpdate: NodeJS.Timeout | null = null;
const GRAPH_UPDATE_DEBOUNCE = 2000; // 2 seconds debounce
const connectedClients = new Set<string>();

/**
 * Debounced graph update - prevents multiple rapid API calls
 */
function scheduleGraphUpdate(socket: any): void {
  // If already rate limited, send mock data immediately
  if (isRateLimited()) {
    console.log(`⚠️  Rate limited - sending mock data to ${socket.id}`);
    socket.emit('graph:update', {
      ...getMockGraph(),
      timestamp: new Date().toISOString(),
    });
    return;
  }

  // Clear existing pending update
  if (pendingGraphUpdate) {
    console.log(`🔄 Debouncing graph update for ${socket.id}`);
    return; // Don't schedule a new update, use the existing one
  }

  // Schedule new update
  pendingGraphUpdate = setTimeout(async () => {
    console.log(`📊 Executing debounced graph update for ${connectedClients.size} clients`);

    try {
      const graph = await graphBuilder.buildFullGraph();
      const updateData = {
        nodes: graph.nodes,
        edges: graph.edges,
        timestamp: new Date().toISOString(),
      };

      // Broadcast to all connected clients
      io.emit('graph:update', updateData);
    } catch (error: any) {
      console.error('❌ Error in debounced graph update:', error);

      const { useMock } = handleGitHubError(error);

      if (useMock) {
        const mockData = {
          ...getMockGraph(),
          timestamp: new Date().toISOString(),
        };
        io.emit('graph:update', mockData);
      }
    } finally {
      pendingGraphUpdate = null;
    }
  }, GRAPH_UPDATE_DEBOUNCE);
}

// ============================================================================
// WebSocket Event Handlers
// ============================================================================

io.on('connection', (socket) => {
  console.log(`🔌 Client connected: ${socket.id} (total: ${connectedClients.size + 1})`);
  connectedClients.add(socket.id);

  // Send initial graph data (debounced)
  scheduleGraphUpdate(socket);

  // Send current device states
  const devices = getAllDeviceStates();
  socket.emit('devices:initial', {
    devices,
    timestamp: new Date().toISOString(),
  });

  // Subscribe to specific issue
  socket.on('subscribe', (data: { issueNumber?: number }) => {
    if (data.issueNumber) {
      const room = `issue-${data.issueNumber}`;
      socket.join(room);
      console.log(`📥 Client ${socket.id} subscribed to ${room}`);
    }
  });

  // Unsubscribe from issue
  socket.on('unsubscribe', (data: { issueNumber?: number }) => {
    if (data.issueNumber) {
      const room = `issue-${data.issueNumber}`;
      socket.leave(room);
      console.log(`📤 Client ${socket.id} unsubscribed from ${room}`);
    }
  });

  socket.on('disconnect', () => {
    connectedClients.delete(socket.id);
    console.log(`🔌 Client disconnected: ${socket.id} (total: ${connectedClients.size})`);
  });
});

// ============================================================================
// Agent Event Emitters (called from agent scripts)
// ============================================================================

/**
 * Emit agent started event
 */
export function emitAgentStarted(event: AgentStartedEvent) {
  io.emit('agent:started', event);
  io.to(`issue-${event.issueNumber}`).emit('agent:started', event);
  console.log(
    `🤖 Agent ${event.agentId} started on issue #${event.issueNumber}`
  );
}

/**
 * Emit agent progress event
 */
export function emitAgentProgress(event: AgentProgressEvent) {
  io.emit('agent:progress', event);
  io.to(`issue-${event.issueNumber}`).emit('agent:progress', event);
  console.log(
    `📊 Agent ${event.agentId} progress: ${event.progress}% on issue #${event.issueNumber}`
  );
}

/**
 * Emit agent completed event
 */
export function emitAgentCompleted(event: AgentCompletedEvent) {
  io.emit('agent:completed', event);
  io.to(`issue-${event.issueNumber}`).emit('agent:completed', event);
  console.log(
    `✅ Agent ${event.agentId} completed issue #${event.issueNumber}`
  );
}

/**
 * Emit agent error event
 */
export function emitAgentError(event: AgentErrorEvent) {
  io.emit('agent:error', event);
  io.to(`issue-${event.issueNumber}`).emit('agent:error', event);
  console.error(
    `❌ Agent ${event.agentId} error on issue #${event.issueNumber}: ${event.error}`
  );
}

/**
 * Emit state transition event
 */
export function emitStateTransition(event: StateTransitionEvent) {
  io.emit('state:transition', event);
  io.to(`issue-${event.issueNumber}`).emit('state:transition', event);
  console.log(
    `🔄 Issue #${event.issueNumber} state: ${event.from} → ${event.to}`
  );
}

// ============================================================================
// Start Server
// ============================================================================

httpServer.listen(PORT, async () => {
  console.log('');
  console.log('🚀 Miyabi Dashboard Server Started');
  console.log('─'.repeat(50));
  console.log(`📡 HTTP Server:     http://localhost:${PORT}`);
  console.log(`🔌 WebSocket:       ws://localhost:${PORT}`);
  console.log(`🪝 GitHub WebHook:  http://localhost:${PORT}/api/webhook/github`);
  console.log(`🔗 Local WebHook:   http://localhost:${PORT}/api/webhook/local`);
  console.log(`📊 Repository:      ${REPOSITORY}`);
  console.log(`🎨 Frontend:        ${DASHBOARD_URL}`);
  console.log('─'.repeat(50));
  console.log('📊 Monitoring Mode: ACTIVE');
  console.log('🎧 Listening for:');
  console.log('   • Git Hook Events (pre-push, post-push, pre-commit, post-commit)');
  console.log('   • Agent Events (started, progress, completed, error)');
  console.log('   • GitHub WebHook Events (issues, PRs, labels)');
  console.log('─'.repeat(50));
  console.log('');

  // Warm up cache in background for faster initial requests
  graphBuilder.warmupCache().catch((error) => {
    console.warn('⚠️  Cache warmup failed:', error);
  });
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('📴 SIGTERM received, shutting down gracefully...');

  // Clean up GraphBuilder resources
  graphBuilder.destroy();

  // Close pending graph updates
  if (pendingGraphUpdate) {
    clearTimeout(pendingGraphUpdate);
    pendingGraphUpdate = null;
    console.log('🧹 Cleared pending graph update');
  }

  // Close HTTP server
  httpServer.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});

// Handle SIGINT (Ctrl+C) as well
process.on('SIGINT', () => {
  console.log('\n📴 SIGINT received, shutting down gracefully...');

  // Clean up GraphBuilder resources
  graphBuilder.destroy();

  // Close pending graph updates
  if (pendingGraphUpdate) {
    clearTimeout(pendingGraphUpdate);
    pendingGraphUpdate = null;
    console.log('🧹 Cleared pending graph update');
  }

  // Close HTTP server
  httpServer.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});
