import { useCallback, useState, useMemo } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
  type Connection,
  type NodeTypes,
  MarkerType,
} from 'reactflow';
import 'reactflow/dist/style.css';

import { IssueNode } from './nodes/IssueNode';
import { AgentNode } from './nodes/AgentNode';
import { StateNode } from './nodes/StateNode';
import { StatsPanel } from './StatsPanel';
import { ActivityLog, type ActivityLogEntry } from './ActivityLog';
import type { GraphNode, GraphEdge } from '../types';

// Mock data with parameters
const mockNodes: GraphNode[] = [
  {
    id: 'agent-coordinator',
    type: 'agent',
    position: { x: 100, y: 100 },
    data: {
      name: 'CoordinatorAgent',
      agentId: 'coordinator',
      status: 'running',
      currentIssue: 47,
      progress: 65,
      parameters: {
        taskId: 'TASK-001',
        taskTitle: 'Implement authentication system',
        priority: 'P0-Critical',
        estimatedDuration: '4 hours',
        environment: 'production',
        dependencies: ['TASK-002', 'TASK-003'],
      },
    },
  },
  {
    id: 'agent-codegen',
    type: 'agent',
    position: { x: 400, y: 100 },
    data: {
      name: 'CodeGenAgent',
      agentId: 'codegen',
      status: 'running',
      currentIssue: 58,
      progress: 40,
      parameters: {
        taskId: 'TASK-002',
        taskTitle: 'Generate user registration component',
        priority: 'P1-High',
        framework: 'React',
        typescript: true,
        testCoverage: '80%',
      },
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
      parameters: {
        qualityThreshold: 85,
        checks: ['security', 'performance', 'style'],
        autoFix: true,
      },
    },
  },
  {
    id: 'issue-47',
    type: 'issue',
    position: { x: 100, y: 300 },
    data: {
      number: 47,
      title: 'Implement authentication system',
      state: 'state:implementing',
      labels: ['type:feature', 'priority:P0-Critical'],
      priority: 'priority:P0-Critical',
      assignedAgents: ['coordinator'],
      url: 'https://github.com/example/repo/issues/47',
    },
  },
  {
    id: 'issue-58',
    type: 'issue',
    position: { x: 400, y: 300 },
    data: {
      number: 58,
      title: 'User registration component',
      state: 'state:implementing',
      labels: ['type:feature', 'priority:P1-High'],
      priority: 'priority:P1-High',
      assignedAgents: ['codegen'],
      url: 'https://github.com/example/repo/issues/58',
    },
  },
  {
    id: 'issue-56',
    type: 'issue',
    position: { x: 700, y: 300 },
    data: {
      number: 56,
      title: '[BACKLOG] Dashboard performance improvements',
      state: 'state:pending',
      labels: ['type:enhancement', 'priority:P2-Medium'],
      priority: 'priority:P2-Medium',
      assignedAgents: [], // No agent assigned - backlog
      url: 'https://github.com/example/repo/issues/56',
    },
  },
  {
    id: 'issue-55',
    type: 'issue',
    position: { x: 1000, y: 300 },
    data: {
      number: 55,
      title: '[BACKLOG] Add dark mode support',
      state: 'state:pending',
      labels: ['type:feature', 'priority:P3-Low'],
      priority: 'priority:P3-Low',
      assignedAgents: [], // No agent assigned - backlog
      url: 'https://github.com/example/repo/issues/55',
    },
  },
];

const mockEdges: GraphEdge[] = [
  {
    id: 'e-agent-coordinator-issue-47',
    source: 'agent-coordinator',
    target: 'issue-47',
    type: 'smoothstep',
    animated: true,
    style: { stroke: '#8B5CF6', strokeWidth: 2 },
    markerEnd: { type: MarkerType.ArrowClosed, color: '#8B5CF6' },
  },
  {
    id: 'e-agent-codegen-issue-58',
    source: 'agent-codegen',
    target: 'issue-58',
    type: 'smoothstep',
    animated: true,
    style: { stroke: '#00D9FF', strokeWidth: 2 },
    markerEnd: { type: MarkerType.ArrowClosed, color: '#00D9FF' },
  },
];

export function FlowCanvasMock() {
  const [nodes, , onNodesChange] = useNodesState<GraphNode>(mockNodes as any);
  const [edges, setEdges, onEdgesChange] = useEdgesState<GraphEdge>(mockEdges as any);
  const [activities] = useState<ActivityLogEntry[]>([
    {
      id: '1',
      type: 'agent:started',
      message: 'CoordinatorAgent started working on Issue #47 - Implement authentication system',
      timestamp: new Date().toISOString(),
      icon: '🤖',
      color: '#10B981',
    },
    {
      id: '2',
      type: 'agent:started',
      message: 'CodeGenAgent started working on Issue #58 - User registration component',
      timestamp: new Date().toISOString(),
      icon: '🤖',
      color: '#10B981',
    },
  ]);

  // Build agent status map
  const agentStatusMap = useMemo(() => {
    const statusMap: Record<string, { status: string; progress?: number }> = {};
    nodes.filter(n => n.type === 'agent').forEach(agent => {
      const data = agent.data as any;
      statusMap[data.agentId] = {
        status: data.status || 'idle',
        progress: data.progress
      };
    });
    return statusMap;
  }, [nodes]);

  // Define node types with agent status
  const nodeTypes: NodeTypes = useMemo(() => ({
    issue: (props: any) => <IssueNode {...props} agentStatuses={agentStatusMap} />,
    agent: AgentNode,
    state: StateNode,
  }), [agentStatusMap]);

  // Filter out agent nodes - show only issue nodes with agent badges
  const filteredNodes = useMemo(() => {
    return nodes.filter(n => n.type !== 'agent');
  }, [nodes]);

  const onConnect = useCallback(
    (connection: Connection) => setEdges((eds) => addEdge(connection, eds)),
    [setEdges]
  );

  const onNodeClick = useCallback((_: React.MouseEvent, node: any) => {
    console.log('Node clicked:', node);
  }, []);

  return (
    <div className="flex h-screen w-full flex-col">
      {/* Stats Panel */}
      <StatsPanel nodes={nodes as any} />

      {/* Main content area */}
      <div className="relative flex flex-1 overflow-hidden">
        {/* Info banner */}
        <div className="absolute left-4 top-4 z-10 rounded-lg bg-blue-500 p-3 text-white shadow-lg">
          <p className="text-sm font-semibold">📊 Mock Data Mode</p>
          <p className="text-xs">Click on agents to see parameters</p>
        </div>

        {/* React Flow Canvas */}
        <div className="flex-1">
          <ReactFlow
            nodes={filteredNodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeClick={onNodeClick}
            nodeTypes={nodeTypes}
            fitView
            attributionPosition="bottom-left"
          >
            <Background />
            <Controls />
            <MiniMap />
          </ReactFlow>
        </div>
      </div>

      {/* Activity Log */}
      <ActivityLog activities={activities} />
    </div>
  );
}
