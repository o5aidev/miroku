/**
 * Type definitions for Agent Visualization Dashboard Server
 */

// ============================================================================
// Node Types
// ============================================================================

export interface BaseNode {
  id: string;
  type: string;
  position?: { x: number; y: number };
  data: unknown;
}

export interface IssueNodeData {
  number: number;
  title: string;
  state: string;
  labels: string[];
  priority?: string;
  severity?: string;
  assignedAgents: string[];
  url: string;
}

export interface IssueNode extends BaseNode {
  type: 'issue';
  data: IssueNodeData;
}

export type AgentStatus = 'idle' | 'running' | 'error' | 'completed';

export interface AgentNodeData {
  name: string;
  agentId: string;
  status: AgentStatus;
  currentIssue?: number;
  progress: number;
  lastActivity?: string;
}

export interface AgentNode extends BaseNode {
  type: 'agent';
  data: AgentNodeData;
}

export interface StateNodeData {
  label: string;
  emoji: string;
  count: number;
  color: string;
  description: string;
}

export interface StateNode extends BaseNode {
  type: 'state';
  data: StateNodeData;
}

export type GraphNode = IssueNode | AgentNode | StateNode | DeviceNode;

// ============================================================================
// Edge Types
// ============================================================================

export interface BaseEdge {
  id: string;
  source: string;
  target: string;
  type?: string;
  animated?: boolean;
  label?: string;
}

export type EdgeType =
  | 'issue-to-agent'
  | 'agent-to-state'
  | 'state-flow'
  | 'depends-on'    // Issue dependency
  | 'blocks'        // Issue blocks another
  | 'related-to'    // Related issues
  // ReactFlow visual edge types
  | 'default'
  | 'straight'
  | 'step'
  | 'smoothstep'
  | 'simplebezier';

export interface GraphEdge extends BaseEdge {
  type: EdgeType;
  style?: {
    stroke?: string;
    strokeWidth?: number;
    strokeDasharray?: string;
  };
  markerEnd?: {
    type: 'arrow' | 'arrowclosed';
    color?: string;
  };
  labelBgStyle?: {
    fill?: string;
    fillOpacity?: number;
  };
  labelStyle?: {
    fill?: string;
    fontSize?: number;
    fontWeight?: number;
  };
}

// ============================================================================
// Graph Data
// ============================================================================

export interface GraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

// ============================================================================
// WebSocket Events
// ============================================================================

export interface AgentStartedEvent {
  agentId: string;
  issueNumber: number;
  timestamp: string;
}

export interface AgentProgressEvent {
  agentId: string;
  issueNumber: number;
  progress: number;
  message?: string;
  timestamp: string;
}

export interface AgentCompletedEvent {
  agentId: string;
  issueNumber: number;
  result: {
    success: boolean;
    labelsAdded?: string[];
    prCreated?: boolean;
    prNumber?: number;
  };
  timestamp: string;
}

export interface AgentErrorEvent {
  agentId: string;
  issueNumber: number;
  error: string;
  timestamp: string;
}

export interface StateTransitionEvent {
  issueNumber: number;
  from: string;
  to: string;
  agent?: string;
  timestamp: string;
}

export interface GraphUpdateEvent {
  nodes: GraphNode[];
  edges: GraphEdge[];
  timestamp: string;
}

export interface TaskDiscoveredEvent {
  tasks: Array<{
    issueNumber: number;
    title: string;
    priority: string;
    labels: string[];
  }>;
  timestamp: string;
}

export interface CoordinatorAnalyzingEvent {
  issueNumber: number;
  title: string;
  analysis: {
    type: string;
    priority: string;
    complexity: string;
    estimatedTime: string;
  };
  timestamp: string;
}

export interface CoordinatorDecomposingEvent {
  issueNumber: number;
  subtasks: Array<{
    id: string;
    title: string;
    type: string;
    dependencies: string[];
  }>;
  timestamp: string;
}

export interface CoordinatorAssigningEvent {
  issueNumber: number;
  assignments: Array<{
    agentId: string;
    taskId: string;
    reason: string;
  }>;
  timestamp: string;
}

// ============================================================================
// GitHub WebHook Events
// ============================================================================

export interface GitHubWebhookIssuePayload {
  action: 'opened' | 'closed' | 'reopened' | 'labeled' | 'unlabeled' | 'assigned';
  issue: {
    number: number;
    title: string;
    state: 'open' | 'closed';
    labels: Array<{ name: string; color: string }>;
    html_url: string;
  };
  label?: {
    name: string;
    color: string;
  };
  repository: {
    name: string;
    owner: { login: string };
  };
}

export interface GitHubWebhookPRPayload {
  action: 'opened' | 'closed' | 'synchronize' | 'labeled';
  pull_request: {
    number: number;
    title: string;
    state: 'open' | 'closed';
    html_url: string;
  };
  repository: {
    name: string;
    owner: { login: string };
  };
}

// ============================================================================
// Agent Types
// ============================================================================

export type AgentType =
  | 'coordinator'
  | 'codegen'
  | 'review'
  | 'issue'
  | 'pr'
  | 'deployment'
  | 'test';

export interface AgentConfig {
  id: AgentType;
  name: string;
  emoji: string;
  color: string;
  description: string;
}

export const AGENT_CONFIGS: Record<AgentType, AgentConfig> = {
  coordinator: {
    id: 'coordinator',
    name: 'CoordinatorAgent',
    emoji: '🎯',
    color: '#FF79C6',
    description: 'Task orchestration and DAG decomposition',
  },
  codegen: {
    id: 'codegen',
    name: 'CodeGenAgent',
    emoji: '💻',
    color: '#00D9FF',
    description: 'AI-driven code generation',
  },
  review: {
    id: 'review',
    name: 'ReviewAgent',
    emoji: '👀',
    color: '#00FF88',
    description: 'Code quality review and scoring',
  },
  issue: {
    id: 'issue',
    name: 'IssueAgent',
    emoji: '📋',
    color: '#8B88FF',
    description: 'Issue analysis and labeling',
  },
  pr: {
    id: 'pr',
    name: 'PRAgent',
    emoji: '🔀',
    color: '#FF79C6',
    description: 'Pull request management',
  },
  deployment: {
    id: 'deployment',
    name: 'DeploymentAgent',
    emoji: '🚀',
    color: '#FF4444',
    description: 'CI/CD deployment automation',
  },
  test: {
    id: 'test',
    name: 'TestAgent',
    emoji: '🧪',
    color: '#FBCA04',
    description: 'Automated testing',
  },
};

// ============================================================================
// Device Tracking (Multi-Device Development)
// ============================================================================

export interface DeviceInfo {
  identifier: string;
  hostname: string;
  platform: string;
  arch: string;
  nodeVersion: string;
}

export interface DeviceActivity {
  event: 'pre-push' | 'post-push' | 'pre-commit' | 'post-commit';
  timestamp: string;
  git: {
    branch: string;
    commit: {
      hash: string;
      short_hash: string;
      message: string;
    };
  };
}

export interface DeviceState {
  device: DeviceInfo;
  status: 'online' | 'offline' | 'idle';
  lastActivity: string;
  recentActivities: DeviceActivity[];
  currentBranch?: string;
  totalEvents: number;
}

export interface DeviceNodeData {
  identifier: string;
  hostname: string;
  platform: string;
  status: 'online' | 'offline' | 'idle';
  lastActivity: string;
  currentBranch?: string;
  totalEvents: number;
}

export interface DeviceNode extends BaseNode {
  type: 'device';
  data: DeviceNodeData;
}

// ============================================================================
// Label State Machine
// ============================================================================

export interface LabelStateConfig {
  name: string;
  emoji: string;
  color: string;
  description: string;
}

export const STATE_LABELS: Record<string, LabelStateConfig> = {
  pending: {
    name: 'state:pending',
    emoji: '📥',
    color: '#E4E4E4',
    description: 'Issue created, awaiting triage',
  },
  analyzing: {
    name: 'state:analyzing',
    emoji: '🔍',
    color: '#0E8A16',
    description: 'CoordinatorAgent analyzing',
  },
  implementing: {
    name: 'state:implementing',
    emoji: '🏗️',
    color: '#1D76DB',
    description: 'Specialist Agents working',
  },
  reviewing: {
    name: 'state:reviewing',
    emoji: '👀',
    color: '#FBCA04',
    description: 'ReviewAgent conducting checks',
  },
  done: {
    name: 'state:done',
    emoji: '✅',
    color: '#2EA44F',
    description: 'Completed successfully',
  },
  blocked: {
    name: 'state:blocked',
    emoji: '🔴',
    color: '#D73A4A',
    description: 'Blocked - requires intervention',
  },
  failed: {
    name: 'state:failed',
    emoji: '🛑',
    color: '#B60205',
    description: 'Execution failed',
  },
  paused: {
    name: 'state:paused',
    emoji: '⏸️',
    color: '#D4C5F9',
    description: 'Paused - waiting',
  },
};

// ============================================================================
// Task Hierarchy Types
// ============================================================================

/**
 * Task階層のノードタイプ
 */
export type TaskNodeType = 'issue' | 'task' | 'subtask' | 'todo';

/**
 * Task階層ノード
 */
export interface TaskNode {
  id: string; // "issue-100-task-1-subtask-1"
  type: TaskNodeType; // "subtask"
  parentId: string | null; // "issue-100-task-1"
  position: { x: number; y: number };
  data: {
    title: string;
    description?: string;
    status: 'pending' | 'in_progress' | 'completed' | 'blocked';
    assignee?: string;
    dueDate?: string;
    dependencies: string[]; // ["issue-100-task-1-subtask-1"]
    estimatedHours?: number;
    actualHours?: number;
    tags?: string[];
  };
}

/**
 * Task階層エッジ
 */
export interface TaskEdge {
  id: string;
  source: string; // 親ノードID or 依存元
  target: string; // 子ノードID or 依存先
  type: 'hierarchy' | 'dependency' | 'blocking';
  label?: string;
  style?: {
    stroke: string;
    strokeWidth: number;
    strokeDasharray?: string;
  };
}

/**
 * Issue全体のTask階層データ
 */
export interface TaskHierarchyData {
  issueId: string;
  nodes: TaskNode[];
  edges: TaskEdge[];
  metadata: {
    totalTasks: number;
    completedTasks: number;
    blockedTasks: number;
    estimatedTotalHours: number;
    actualTotalHours: number;
  };
}
