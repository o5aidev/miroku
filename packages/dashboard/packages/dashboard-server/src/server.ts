/**
 * Miyabi Dashboard Server
 * WebSocket + HTTP API for real-time agent visualization
 */

import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { Octokit } from '@octokit/rest';
import dotenv from 'dotenv';

dotenv.config();

// ============================================================================
// Types
// ============================================================================

interface AgentStartedEvent {
  eventType: 'started';
  agentId: string;
  issueNumber: number;
  parameters?: Record<string, any>;
}

interface AgentProgressEvent {
  eventType: 'progress';
  agentId: string;
  issueNumber: number;
  progress: number;
  message?: string;
}

interface AgentCompletedEvent {
  eventType: 'completed';
  agentId: string;
  issueNumber: number;
  result: {
    success: boolean;
    labelsAdded?: string[];
    prCreated?: boolean;
    prNumber?: number;
  };
}

interface AgentErrorEvent {
  eventType: 'error';
  agentId: string;
  issueNumber: number;
  error: string;
}

type AgentEvent =
  | AgentStartedEvent
  | AgentProgressEvent
  | AgentCompletedEvent
  | AgentErrorEvent;

// ============================================================================
// Server Setup
// ============================================================================

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: ['http://localhost:5173', 'http://localhost:3000'],
    methods: ['GET', 'POST'],
  },
});

const PORT = process.env.DASHBOARD_PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// GitHub client (optional - for fetching real data)
const octokit = process.env.GITHUB_TOKEN
  ? new Octokit({ auth: process.env.GITHUB_TOKEN })
  : null;

// ============================================================================
// WebSocket Connection Management
// ============================================================================

io.on('connection', (socket) => {
  console.log('🔌 Client connected:', socket.id);

  socket.on('disconnect', () => {
    console.log('🔌 Client disconnected:', socket.id);
  });
});

// ============================================================================
// API Endpoints
// ============================================================================

/**
 * POST /api/agent-event
 * Receive agent events from pre-hooks and broadcast to all connected clients
 */
app.post('/api/agent-event', (req, res) => {
  const event: AgentEvent = req.body;
  const timestamp = new Date().toISOString();

  console.log(\`📡 Agent event received: \${event.eventType} - \${event.agentId}\`);

  // Add timestamp
  const enrichedEvent = { ...event, timestamp };

  // Broadcast to all connected clients
  switch (event.eventType) {
    case 'started':
      io.emit('agent:started', enrichedEvent);
      console.log(\`  ✅ Started: \${event.agentId} on Issue #\${event.issueNumber}\`);
      if (event.parameters) {
        console.log(\`  📋 Parameters:\`, JSON.stringify(event.parameters, null, 2));
      }
      break;

    case 'progress':
      io.emit('agent:progress', enrichedEvent);
      console.log(\`  📈 Progress: \${event.agentId} - \${event.progress}%\`);
      break;

    case 'completed':
      io.emit('agent:completed', enrichedEvent);
      console.log(\`  ✅ Completed: \${event.agentId} - Issue #\${event.issueNumber}\`);
      break;

    case 'error':
      io.emit('agent:error', enrichedEvent);
      console.error(\`  ❌ Error: \${event.agentId} - \${event.error}\`);
      break;
  }

  res.json({ success: true, timestamp });
});

/**
 * GET /api/graph
 * Fetch current graph state from GitHub (Issues, Agents, States)
 */
app.get('/api/graph', async (req, res) => {
  try {
    // Return minimal agent nodes for now
    const agentNodes = [
      {
        id: 'agent-coordinator',
        type: 'agent',
        position: { x: 100, y: 100 },
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
        position: { x: 400, y: 100 },
        data: {
          name: 'CodeGenAgent',
          agentId: 'codegen',
          status: 'idle',
          progress: 0,
        },
      },
      {
        id: 'agent-review',
        type: 'agent',
        position: { x: 700, y: 100 },
        data: {
          name: 'ReviewAgent',
          agentId: 'review',
          status: 'idle',
          progress: 0,
        },
      },
    ];

    res.json({
      nodes: agentNodes,
      edges: [],
    });
  } catch (error: any) {
    console.error('Failed to fetch graph:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/refresh
 * Trigger graph refresh and broadcast to all clients
 */
app.post('/api/refresh', async (req, res) => {
  try {
    console.log('🔄 Manual refresh triggered');

    // Fetch graph data
    const graphResponse = await fetch(\`http://localhost:\${PORT}/api/graph\`);
    const graphData = await graphResponse.json();

    // Broadcast to all clients
    io.emit('graph:update', {
      ...graphData,
      timestamp: new Date().toISOString(),
    });

    res.json({ success: true, message: 'Graph refreshed' });
  } catch (error: any) {
    console.error('Failed to refresh graph:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /health
 * Health check endpoint
 */
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    connections: io.engine.clientsCount,
  });
});

// ============================================================================
// Start Server
// ============================================================================

httpServer.listen(PORT, () => {
  console.log('🚀 Miyabi Dashboard Server');
  console.log(\`📡 HTTP API: http://localhost:\${PORT}\`);
  console.log(\`🔌 WebSocket: ws://localhost:\${PORT}\`);
  console.log(\`👀 Health: http://localhost:\${PORT}/health\`);
  console.log('');
  console.log('Ready to receive agent events! 🤖');
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, closing server...');
  httpServer.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});
