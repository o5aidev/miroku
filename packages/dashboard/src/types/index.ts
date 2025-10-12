/**
 * Type definitions for Dashboard Frontend
 * (Shared with dashboard-server)
 */

import type { Node, Edge } from 'reactflow';

// ============================================================================
// Node Data Types
// ============================================================================

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

export type AgentStatus = 'idle' | 'running' | 'error' | 'completed';

export interface AgentParameters {
  taskId?: string;
  taskTitle?: string;
  taskDescription?: string;
  priority?: string;
  estimatedDuration?: string;
  dependencies?: string[];
  config?: Record<string, any>;
  environment?: string;
  [key: string]: any;
}

export interface AgentNodeData {
  name: string;
  agentId: string;
  status: AgentStatus;
  currentIssue?: number;
  progress: number;
  lastActivity?: string;
  parameters?: AgentParameters;
}

export interface StateNodeData {
  label: string;
  emoji: string;
  count: number;
  color: string;
  description: string;
}

// ============================================================================
// Entity-Relation Node Data Types
// ============================================================================

export interface AttributeData {
  name: string;
  type: string;
  required?: boolean;
  unique?: boolean;
}

export interface EntityNodeData {
  name: string;
  icon: string;
  description?: string;
  primaryKey?: AttributeData;
  attributes?: AttributeData[];
  count?: number;
}

export interface RelationNodeData {
  name: string;
  icon?: string;
  cardinality?: '1:1' | '1:N' | 'N:M';
  description?: string;
}

// ============================================================================
// React Flow Node Types
// ============================================================================

export type IssueNode = Node<IssueNodeData, 'issue'>;
export type AgentNode = Node<AgentNodeData, 'agent'>;
export type StateNode = Node<StateNodeData, 'state'>;
export type EntityNode = Node<EntityNodeData, 'entity'>;
export type RelationNode = Node<RelationNodeData, 'relation'>;

export type GraphNode = IssueNode | AgentNode | StateNode | EntityNode | RelationNode;

// Edge types
export type EdgeType =
  | 'issue-to-agent'
  | 'agent-to-state'
  | 'state-flow'
  | 'depends-on'
  | 'blocks'
  | 'related-to';

export type GraphEdge = Edge<{
  type?: EdgeType;
  style?: {
    stroke?: string;
    strokeWidth?: number;
    strokeDasharray?: string;
  };
}>;

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
  parameters?: AgentParameters;
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
// Agent Configuration
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
// State Configuration
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
