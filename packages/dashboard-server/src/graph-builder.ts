/**
 * Graph Builder - Constructs graph data from GitHub Issues/PRs
 */

import { Octokit } from '@octokit/rest';
import type {
  GraphData,
  IssueNode,
  AgentNode,
  StateNode,
  GraphEdge,
  AgentType,
} from './types.js';
import { AGENT_CONFIGS, STATE_LABELS } from './types.js';

export class GraphBuilder {
  private octokit: Octokit;
  private owner: string;
  private repo: string;

  // LRU Cache for API responses with access tracking
  private cache: Map<string, { data: any; timestamp: number; lastAccess: number }> = new Map();
  private readonly CACHE_TTL: number;
  private readonly CACHE_MAX_SIZE = 100; // Maximum cache entries
  private cleanupInterval: NodeJS.Timeout | null = null;

  constructor(githubToken: string, owner: string, repo: string) {
    this.octokit = new Octokit({ auth: githubToken });
    this.owner = owner;
    this.repo = repo;

    // Use environment variable for cache TTL, default to 5 minutes (production-friendly)
    this.CACHE_TTL = process.env.GRAPH_CACHE_TTL
      ? parseInt(process.env.GRAPH_CACHE_TTL, 10)
      : 300000; // 5 minutes default

    // Periodically clean up old cache entries
    this.cleanupInterval = setInterval(() => this.cleanupCache(), 60000);

    console.log(`📦 GraphBuilder initialized with ${this.CACHE_TTL / 1000}s cache TTL`);
  }

  /**
   * Clean up resources (prevent memory leaks)
   */
  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
      console.log('🧹 GraphBuilder cleanup interval cleared');
    }
    this.cache.clear();
    console.log('🗑️  GraphBuilder resources destroyed');
  }

  /**
   * Fetch data with LRU caching to prevent rate limit issues
   */
  private async fetchWithCache<T>(
    key: string,
    fetchFn: () => Promise<T>
  ): Promise<T> {
    const cached = this.cache.get(key);
    const now = Date.now();

    // Return cached data if still valid
    if (cached && now - cached.timestamp < this.CACHE_TTL) {
      console.log(`📦 Cache HIT for key: ${key}`);
      // Update last access time for LRU
      cached.lastAccess = now;
      return cached.data as T;
    }

    console.log(`🔍 Cache MISS for key: ${key} - fetching from API`);

    try {
      const data = await fetchFn();

      // Store in cache with LRU tracking
      this.cache.set(key, { data, timestamp: now, lastAccess: now });

      // Enforce cache size limit with LRU eviction
      if (this.cache.size > this.CACHE_MAX_SIZE) {
        this.evictLRU();
      }

      return data;
    } catch (error: any) {
      // If we have stale cache data, use it as fallback
      if (cached) {
        console.warn(`⚠️  API error, using stale cache for key: ${key}`);
        return cached.data as T;
      }
      throw error;
    }
  }

  /**
   * Evict least recently used cache entry
   */
  private evictLRU(): void {
    let oldestKey: string | null = null;
    let oldestTime = Infinity;

    // Find the least recently accessed entry
    for (const [key, value] of this.cache.entries()) {
      if (value.lastAccess < oldestTime) {
        oldestTime = value.lastAccess;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this.cache.delete(oldestKey);
      console.log(`🗑️  LRU eviction: removed ${oldestKey}`);
    }
  }

  /**
   * Clean up expired cache entries
   */
  private cleanupCache(): void {
    const now = Date.now();
    let cleaned = 0;

    for (const [key, value] of this.cache.entries()) {
      if (now - value.timestamp > this.CACHE_TTL) {
        this.cache.delete(key);
        cleaned++;
      }
    }

    if (cleaned > 0) {
      console.log(`🧹 Cleaned ${cleaned} expired cache entries`);
    }
  }

  /**
   * Clear all cache entries (useful for manual refresh)
   */
  public clearCache(): void {
    this.cache.clear();
    console.log('🗑️  Cache cleared');
  }

  /**
   * Warm up cache with common queries
   * Call this on application startup for 50-70% faster initial requests
   */
  public async warmupCache(): Promise<void> {
    console.log('🔥 Warming up cache...');

    try {
      // Prefetch open issues in background
      const warmupPromises = [
        this.fetchOpenIssues().catch((err) => {
          console.warn('⚠️  Cache warmup failed for open issues:', err.message);
        }),
      ];

      await Promise.allSettled(warmupPromises);

      console.log(`✅ Cache warmup completed (${this.cache.size} entries)`);
    } catch (error) {
      console.warn('⚠️  Cache warmup failed:', error);
      // Don't throw - warmup failure shouldn't block startup
    }
  }

  /**
   * Build full graph from all open issues
   */
  async buildFullGraph(): Promise<GraphData> {
    const issues = await this.fetchOpenIssues();

    const issueNodes: IssueNode[] = issues.map((issue, index) =>
      this.createIssueNode(issue, index)
    );

    const agentNodes: AgentNode[] = this.createAgentNodes();
    const stateNodes: StateNode[] = this.createStateNodes(issues);

    const edges: GraphEdge[] = [
      ...this.createIssueToAgentEdges(issueNodes),
      ...this.createAgentToStateEdges(issueNodes),
      ...this.createStateFlowEdges(),
      ...this.createDependencyEdges(issues), // Add dependency edges
    ];

    return {
      nodes: [...issueNodes, ...agentNodes, ...stateNodes],
      edges,
    };
  }

  /**
   * Build graph for specific issue
   */
  async buildIssueGraph(issueNumber: number): Promise<GraphData> {
    const issue = await this.fetchIssue(issueNumber);

    const issueNode = this.createIssueNode(issue, 0);

    // Extract label names from GitHub label objects
    const labels = Array.isArray(issue.labels)
      ? issue.labels.map((l: any) => (typeof l === 'string' ? l : l.name))
      : [];

    const assignedAgents = this.getAssignedAgents(labels);

    const agentNodes = assignedAgents.map((agentId) =>
      this.createAgentNode(agentId)
    );

    const currentState = this.getCurrentState(labels);
    const stateNode = currentState
      ? this.createStateNode(currentState, 1)
      : null;

    const edges: GraphEdge[] = [
      ...assignedAgents.map((agentId) =>
        this.createIssueToAgentEdge(issueNode.id, agentId)
      ),
      ...(stateNode
        ? assignedAgents.map((agentId) =>
            this.createAgentToStateEdge(agentId, stateNode.id)
          )
        : []),
    ];

    return {
      nodes: [
        issueNode,
        ...agentNodes,
        ...(stateNode ? [stateNode] : []),
      ],
      edges,
    };
  }

  /**
   * Fetch all open issues with pagination (with caching)
   */
  private async fetchOpenIssues() {
    const cacheKey = `issues:${this.owner}/${this.repo}:open`;

    return this.fetchWithCache(cacheKey, async () => {
      console.log('🔍 Fetching all open issues with pagination...');
      const allIssues: any[] = [];
      let page = 1;
      const perPage = 100; // Maximum allowed by GitHub API

      while (true) {
        const { data } = await this.octokit.issues.listForRepo({
          owner: this.owner,
          repo: this.repo,
          state: 'open',
          per_page: perPage,
          page,
        });

        allIssues.push(...data);

        console.log(`📄 Fetched page ${page}: ${data.length} issues (total: ${allIssues.length})`);

        // Break if we received fewer issues than requested (last page)
        if (data.length < perPage) {
          break;
        }

        page++;

        // Safety limit: prevent infinite loops (max 1000 issues = 10 pages)
        if (page > 10) {
          console.warn('⚠️  Reached maximum pagination limit (10 pages / 1000 issues)');
          break;
        }
      }

      console.log(`✅ Total issues fetched: ${allIssues.length}`);
      return allIssues;
    });
  }

  /**
   * Fetch specific issue (with caching)
   */
  private async fetchIssue(issueNumber: number) {
    const cacheKey = `issue:${this.owner}/${this.repo}:${issueNumber}`;

    return this.fetchWithCache(cacheKey, async () => {
      const { data } = await this.octokit.issues.get({
        owner: this.owner,
        repo: this.repo,
        issue_number: issueNumber,
      });
      return data;
    });
  }

  /**
   * Create issue node
   */
  private createIssueNode(issue: any, index: number): IssueNode {
    // Extract label names from GitHub label objects
    const labels = Array.isArray(issue.labels)
      ? issue.labels.map((l: any) => (typeof l === 'string' ? l : l.name))
      : [];

    const priority = labels.find((l: string) => l.includes('priority:'));
    const severity = labels.find((l: string) => l.includes('severity:'));
    const state = labels.find((l: string) => l.includes('state:')) || 'state:pending';
    const assignedAgents = this.getAssignedAgents(labels);

    return {
      id: `issue-${issue.number}`,
      type: 'issue',
      position: { x: 100, y: index * 600 + 100 },
      data: {
        number: issue.number,
        title: issue.title,
        state,
        labels,
        priority,
        severity,
        assignedAgents,
        url: issue.html_url,
      },
    };
  }

  /**
   * Create all agent nodes
   */
  private createAgentNodes(): AgentNode[] {
    const agents: AgentType[] = [
      'coordinator',
      'codegen',
      'review',
      'issue',
      'pr',
      'deployment',
    ];

    return agents.map((agentId, index) => this.createAgentNode(agentId, index));
  }

  /**
   * Create single agent node
   */
  private createAgentNode(agentId: string, index: number = 0): AgentNode {
    // Validate agentId is a valid AgentType
    const validAgentId = agentId as AgentType;
    const config = AGENT_CONFIGS[validAgentId];

    // Fallback to coordinator if invalid agent type
    if (!config) {
      console.warn(`⚠️  Invalid agent type: ${agentId}, using coordinator as fallback`);
      return this.createAgentNode('coordinator', index);
    }

    return {
      id: `agent-${validAgentId}`,
      type: 'agent',
      position: { x: 650, y: index * 600 + 100 },
      data: {
        name: config.name,
        agentId: validAgentId,
        status: 'idle',
        progress: 0,
      },
    };
  }

  /**
   * Create state nodes from issues
   */
  private createStateNodes(issues: any[]): StateNode[] {
    const stateCounts = new Map<string, number>();

    // Count issues per state
    issues.forEach((issue) => {
      // Extract label names from GitHub label objects
      const labels = Array.isArray(issue.labels)
        ? issue.labels.map((l: any) => (typeof l === 'string' ? l : l.name))
        : [];

      const state = this.getCurrentState(labels) || 'pending';
      stateCounts.set(state, (stateCounts.get(state) || 0) + 1);
    });

    // Create nodes
    return Array.from(stateCounts.entries()).map(([state, count], index) =>
      this.createStateNode(state, count, index)
    );
  }

  /**
   * Create single state node
   */
  private createStateNode(
    state: string,
    count: number = 0,
    index: number = 0
  ): StateNode {
    const config = STATE_LABELS[state] || STATE_LABELS.pending;

    return {
      id: `state-${state}`,
      type: 'state',
      position: { x: 1250, y: index * 600 + 100 },
      data: {
        label: config.name,
        emoji: config.emoji,
        count,
        color: config.color,
        description: config.description,
      },
    };
  }

  /**
   * Create edges from issues to agents
   */
  private createIssueToAgentEdges(issueNodes: IssueNode[]): GraphEdge[] {
    const edges: GraphEdge[] = [];

    issueNodes.forEach((issueNode) => {
      issueNode.data.assignedAgents.forEach((agentId) => {
        edges.push(this.createIssueToAgentEdge(issueNode.id, agentId));
      });
    });

    return edges;
  }

  private createIssueToAgentEdge(issueId: string, agentId: string): GraphEdge {
    return {
      id: `${issueId}-to-${agentId}`,
      source: issueId,
      target: `agent-${agentId}`,
      type: 'smoothstep', // Smooth curved edges for better flow
      animated: true,
      style: {
        stroke: '#8B5CF6', // Purple gradient
        strokeWidth: 3,    // Thicker for visibility
      },
      markerEnd: {
        type: 'arrowclosed' as const,
        color: '#8B5CF6',
      },
      label: '→',
      labelBgStyle: {
        fill: '#1F2937',
        fillOpacity: 0.8,
      },
      labelStyle: {
        fill: '#A78BFA',
        fontSize: 12,
        fontWeight: 600,
      },
    };
  }

  /**
   * Create edges from agents to states
   */
  private createAgentToStateEdges(issueNodes: IssueNode[]): GraphEdge[] {
    const edges: GraphEdge[] = [];

    issueNodes.forEach((issueNode) => {
      const state = this.getCurrentState(issueNode.data.labels);
      if (state) {
        issueNode.data.assignedAgents.forEach((agentId) => {
          edges.push(this.createAgentToStateEdge(agentId, `state-${state}`));
        });
      }
    });

    return edges;
  }

  private createAgentToStateEdge(agentId: string, stateId: string): GraphEdge {
    return {
      id: `agent-${agentId}-to-${stateId}`,
      source: `agent-${agentId}`,
      target: stateId,
      type: 'smoothstep', // Smooth curved edges
      animated: false,
      style: {
        stroke: '#10B981', // Green for completion flow
        strokeWidth: 2.5,
      },
      markerEnd: {
        type: 'arrowclosed' as const,
        color: '#10B981',
      },
      labelBgStyle: {
        fill: '#1F2937',
        fillOpacity: 0.8,
      },
      labelStyle: {
        fill: '#34D399',
        fontSize: 11,
        fontWeight: 500,
      },
    };
  }

  /**
   * Create state flow edges (pending → analyzing → implementing → ...)
   */
  private createStateFlowEdges(): GraphEdge[] {
    const stateFlow = [
      'pending',
      'analyzing',
      'implementing',
      'reviewing',
      'done',
    ];

    // Color gradient for state flow progression
    const flowColors = ['#6366F1', '#10B981', '#F59E0B', '#8B5CF6', '#22C55E'];

    return stateFlow.slice(0, -1).map((state, index) => ({
      id: `state-flow-${state}-to-${stateFlow[index + 1]}`,
      source: `state-${state}`,
      target: `state-${stateFlow[index + 1]}`,
      type: 'smoothstep' as const, // Smooth curves
      animated: true, // Animated to show flow
      style: {
        stroke: flowColors[index],
        strokeWidth: 2,
        strokeDasharray: '5,5', // Dashed to indicate workflow progression
      },
      markerEnd: {
        type: 'arrowclosed' as const,
        color: flowColors[index],
      },
      label: '→',
      labelBgStyle: {
        fill: '#1F2937',
        fillOpacity: 0.9,
      },
      labelStyle: {
        fill: flowColors[index],
        fontSize: 14,
        fontWeight: 700,
      },
    }));
  }

  /**
   * Extract assigned agents from labels
   */
  private getAssignedAgents(labels: string[]): string[] {
    return labels
      .filter((label) => label.includes('agent:'))
      .map((label) => label.replace('🤖 agent:', '').replace('agent:', '').trim());
  }

  /**
   * Get current state from labels
   */
  private getCurrentState(labels: string[]): string | null {
    const stateLabel = labels.find((l) => l.includes('state:'));
    if (!stateLabel) return null;

    return stateLabel
      .replace(/^[^\s]+\s+state:/, '')
      .replace('state:', '')
      .trim();
  }

  /**
   * Parse issue dependencies from body text (optimized single-pass)
   * Supports: "Depends on #123", "Blocked by #456", "Blocks #789", "Related to #111"
   */
  private parseDependencies(body: string | null): {
    dependsOn: number[];
    blocks: number[];
    relatedTo: number[];
  } {
    if (!body) {
      return { dependsOn: [], blocks: [], relatedTo: [] };
    }

    const dependsOnSet = new Set<number>();
    const blocksSet = new Set<number>();
    const relatedToSet = new Set<number>();

    // Single unified regex with named capture groups for all dependency types
    // Matches: (depends on|requires|needs|blocked by|waiting for|blocks|blocking|related to|see also) #123
    const unifiedPattern = /(?:(depends on|requires|needs|blocked by|waiting for)|(blocks|blocking)|(related to|see also))\s+#(\d+)/gi;

    let match;
    while ((match = unifiedPattern.exec(body)) !== null) {
      const issueNumber = parseInt(match[4], 10);

      // Determine which category based on which capture group matched
      if (match[1]) {
        // depends on / requires / needs / blocked by / waiting for
        dependsOnSet.add(issueNumber);
      } else if (match[2]) {
        // blocks / blocking
        blocksSet.add(issueNumber);
      } else if (match[3]) {
        // related to / see also
        relatedToSet.add(issueNumber);
      }
    }

    return {
      dependsOn: Array.from(dependsOnSet),
      blocks: Array.from(blocksSet),
      relatedTo: Array.from(relatedToSet),
    };
  }

  /**
   * Create dependency edges between issues (with validation)
   */
  private createDependencyEdges(issues: any[]): GraphEdge[] {
    const edges: GraphEdge[] = [];

    // Create a Set of valid issue numbers for O(1) lookup
    const validIssueNumbers = new Set(issues.map((issue) => issue.number));

    issues.forEach((issue) => {
      const deps = this.parseDependencies(issue.body);

      // "depends on" edges (this issue depends on another)
      deps.dependsOn.forEach((depIssueNumber) => {
        // Validate that the referenced issue exists
        if (!validIssueNumbers.has(depIssueNumber)) {
          console.warn(
            `⚠️  Issue #${issue.number} references non-existent issue #${depIssueNumber} (depends on)`
          );
          return;
        }

        edges.push({
          id: `dep-${issue.number}-depends-${depIssueNumber}`,
          source: `issue-${depIssueNumber}`,
          target: `issue-${issue.number}`,
          type: 'smoothstep' as const,
          label: '⚙️ depends on',
          animated: false,
          style: {
            stroke: '#FB923C', // Orange for dependencies
            strokeWidth: 2.5,
            strokeDasharray: '5,5',
          },
          markerEnd: {
            type: 'arrowclosed' as const,
            color: '#FB923C',
          },
          labelBgStyle: {
            fill: '#1F2937',
            fillOpacity: 0.9,
          },
          labelStyle: {
            fill: '#FDBA74',
            fontSize: 11,
            fontWeight: 600,
          },
        });
      });

      // "blocks" edges (this issue blocks another)
      deps.blocks.forEach((blockedIssueNumber) => {
        // Validate that the referenced issue exists
        if (!validIssueNumbers.has(blockedIssueNumber)) {
          console.warn(
            `⚠️  Issue #${issue.number} references non-existent issue #${blockedIssueNumber} (blocks)`
          );
          return;
        }

        edges.push({
          id: `dep-${issue.number}-blocks-${blockedIssueNumber}`,
          source: `issue-${issue.number}`,
          target: `issue-${blockedIssueNumber}`,
          type: 'smoothstep' as const,
          label: '🚫 blocks',
          animated: false,
          style: {
            stroke: '#EF4444', // Red for blocking
            strokeWidth: 3,
            strokeDasharray: '10,5',
          },
          markerEnd: {
            type: 'arrowclosed' as const,
            color: '#EF4444',
          },
          labelBgStyle: {
            fill: '#1F2937',
            fillOpacity: 0.9,
          },
          labelStyle: {
            fill: '#FCA5A5',
            fontSize: 11,
            fontWeight: 700,
          },
        });
      });

      // "related to" edges (bidirectional)
      deps.relatedTo.forEach((relatedIssueNumber) => {
        // Validate that the referenced issue exists
        if (!validIssueNumbers.has(relatedIssueNumber)) {
          console.warn(
            `⚠️  Issue #${issue.number} references non-existent issue #${relatedIssueNumber} (related to)`
          );
          return;
        }

        edges.push({
          id: `dep-${issue.number}-related-${relatedIssueNumber}`,
          source: `issue-${issue.number}`,
          target: `issue-${relatedIssueNumber}`,
          type: 'step' as const, // Step for subtle connections
          label: '🔗 related',
          animated: false,
          style: {
            stroke: '#94A3B8', // Gray for related
            strokeWidth: 1.5,
            strokeDasharray: '3,3',
          },
          markerEnd: {
            type: 'arrow' as const,
            color: '#94A3B8',
          },
          labelBgStyle: {
            fill: '#1F2937',
            fillOpacity: 0.8,
          },
          labelStyle: {
            fill: '#CBD5E1',
            fontSize: 10,
            fontWeight: 500,
          },
        });
      });
    });

    return edges;
  }
}
