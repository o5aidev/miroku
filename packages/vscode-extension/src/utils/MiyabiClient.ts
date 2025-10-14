/**
 * Miyabi Client - WebSocket & HTTP client for Miyabi Dashboard Server
 */

import { io, Socket } from 'socket.io-client';
import { EventEmitter } from 'events';

export interface MiyabiIssue {
  number: number;
  title: string;
  state: string;
  labels: string[];
  priority?: string;
  assignedAgents: string[];
  url: string;
}

export interface MiyabiAgent {
  agentId: string;
  status: 'idle' | 'running' | 'error' | 'completed';
  currentIssue?: number;
  progress: number;
}

export interface MiyabiStatus {
  repository: {
    owner: string;
    name: string;
    url: string;
  };
  issues: {
    total: number;
    byState: Record<string, number>;
  };
  summary: {
    totalOpen: number;
    activeAgents: number;
    blocked: number;
  };
}

export class MiyabiClient extends EventEmitter {
  private socket?: Socket;
  private baseUrl: string;

  constructor(baseUrl: string) {
    super();
    this.baseUrl = baseUrl;
  }

  /**
   * Connect to WebSocket server
   */
  connect(): void {
    if (this.socket?.connected) {
      return;
    }

    this.socket = io(this.baseUrl, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    this.socket.on('connect', () => {
      console.log('[Miyabi] Connected to server');
      this.emit('connected');
    });

    this.socket.on('disconnect', () => {
      console.log('[Miyabi] Disconnected from server');
      this.emit('disconnected');
    });

    // Listen to real-time events
    this.socket.on('graph:update', (data) => {
      this.emit('issue:update', data);
    });

    this.socket.on('agent:started', (data) => {
      this.emit('agent:update', data);
    });

    this.socket.on('agent:progress', (data) => {
      this.emit('agent:update', data);
    });

    this.socket.on('agent:completed', (data) => {
      this.emit('agent:update', data);
    });

    this.socket.on('agent:error', (data) => {
      this.emit('agent:update', data);
    });

    this.socket.on('state:transition', (data) => {
      this.emit('status:update', data);
    });
  }

  /**
   * Disconnect from WebSocket server
   */
  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = undefined;
    }
  }

  /**
   * Get project status via HTTP
   */
  async getStatus(): Promise<MiyabiStatus> {
    const response = await fetch(`${this.baseUrl}/api/status`);
    if (!response.ok) {
      throw new Error(`Failed to fetch status: ${response.statusText}`);
    }
    return response.json() as Promise<MiyabiStatus>;
  }

  /**
   * Get issues via HTTP
   */
  async getIssues(): Promise<MiyabiIssue[]> {
    const response = await fetch(`${this.baseUrl}/api/graph`);
    if (!response.ok) {
      throw new Error(`Failed to fetch issues: ${response.statusText}`);
    }
    const data = (await response.json()) as { nodes: any[] };

    // Extract issues from graph nodes
    return data.nodes
      .filter((node: any) => node.type === 'issue')
      .map((node: any) => ({
        number: node.data.number,
        title: node.data.title,
        state: node.data.state,
        labels: node.data.labels || [],
        priority: node.data.priority,
        assignedAgents: node.data.assignedAgents || [],
        url: node.data.url,
      }));
  }

  /**
   * Get agents via HTTP
   */
  async getAgents(): Promise<MiyabiAgent[]> {
    const response = await fetch(`${this.baseUrl}/api/agents/status`);
    if (!response.ok) {
      throw new Error(`Failed to fetch agents: ${response.statusText}`);
    }
    const data = (await response.json()) as { agents: MiyabiAgent[] };
    return data.agents || [];
  }

  /**
   * Run agent on issue
   */
  async runAgent(agentId: string, issueNumber: number): Promise<void> {
    const response = await fetch(`${this.baseUrl}/api/workflow/trigger`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        issueNumber,
        agentId,
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to run agent: ${response.statusText}`);
    }
  }

  /**
   * Refresh graph manually
   */
  async refreshGraph(): Promise<void> {
    const response = await fetch(`${this.baseUrl}/api/refresh`, {
      method: 'POST',
    });

    if (!response.ok) {
      throw new Error(`Failed to refresh graph: ${response.statusText}`);
    }
  }
}
