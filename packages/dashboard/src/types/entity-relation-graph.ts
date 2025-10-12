/**
 * Entity-Relation Graph Types
 * Defines the structure for session activity tracking and visualization
 */

export type EntityType =
  | 'Issue'
  | 'Task'
  | 'Agent'
  | 'PR'
  | 'Label'
  | 'QualityReport'
  | 'Command'
  | 'Escalation'
  | 'Deployment'
  | 'LDDLog'
  | 'DAG'
  | 'Worktree'
  | 'DiscordCommunity';

export type RelationType =
  | 'analyzed-by'
  | 'decomposed-into'
  | 'tagged-with'
  | 'creates'
  | 'assigned-to'
  | 'depends-on'
  | 'part-of'
  | 'runs-in'
  | 'executes'
  | 'generates'
  | 'creates-report'
  | 'triggers-escalation'
  | 'performs'
  | 'logs-to'
  | 'invoked-by'
  | 'notifies-to'
  | 'deployed-to'
  | 'references'
  | 'blocks'
  | 'succeeded-by'
  | 'precedes'
  | 'merges-to'
  | 'reviewed-by'
  | 'approved-by'
  | 'rejected-by'
  | 'comments-on'
  | 'watches'
  | 'subscribes-to'
  | 'mentions'
  | 'links-to'
  | 'duplicates'
  | 'related-to'
  | 'child-of'
  | 'parent-of';

export type NodeStatus =
  | 'pending'
  | 'in_progress'
  | 'completed'
  | 'failed'
  | 'blocked'
  | 'skipped'
  | 'cancelled';

export interface BaseNode {
  id: string;
  type: EntityType;
  label: string;
  metadata: Record<string, any>;
  status?: NodeStatus;
  timestamp: string;
}

export interface IssueNode extends BaseNode {
  type: 'Issue';
  metadata: {
    number: number;
    title: string;
    state: string;
    labels: string[];
    [key: string]: any;
  };
}

export interface TaskNode extends BaseNode {
  type: 'Task';
  metadata: {
    taskId: string;
    description: string;
    assignee?: string;
    estimatedHours?: number;
    [key: string]: any;
  };
}

export interface AgentNode extends BaseNode {
  type: 'Agent';
  metadata: {
    agentType: string;
    version?: string;
    [key: string]: any;
  };
}

export interface CommandNode extends BaseNode {
  type: 'Command';
  metadata: {
    toolName: string;
    parameters?: Record<string, any>;
    output?: string;
    exitCode?: number;
    [key: string]: any;
  };
}

export interface LabelNode extends BaseNode {
  type: 'Label';
  metadata: {
    category: string;
    color: string;
    [key: string]: any;
  };
}

export interface DiscordCommunityNode extends BaseNode {
  type: 'DiscordCommunity';
  metadata: {
    serverId?: string;
    memberCount?: number;
    [key: string]: any;
  };
}

export type EntityNode =
  | IssueNode
  | TaskNode
  | AgentNode
  | CommandNode
  | LabelNode
  | DiscordCommunityNode
  | BaseNode;

export interface EntityEdge {
  id: string;
  source: string;
  target: string;
  relationType: RelationType;
  label: string;
  metadata?: Record<string, any>;
  timestamp: string;
}

export interface EntityRelationGraph {
  sessionId: string;
  timestamp: string;
  nodes: EntityNode[];
  edges: EntityEdge[];
  metadata: {
    source: string;
    issueNumber?: number;
    branchName?: string;
    deviceIdentifier?: string;
    [key: string]: any;
  };
}

export interface SessionActivity {
  type: 'tool' | 'agent' | 'comment' | 'task' | 'event';
  timestamp: string;
  data: Record<string, any>;
}
