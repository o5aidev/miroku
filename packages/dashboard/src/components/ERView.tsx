import { useCallback, useMemo } from 'react';
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

import { EntityNode } from './nodes/EntityNode';
import { RelationNode } from './nodes/RelationNode';
import type { GraphNode, GraphEdge } from '../types';

const nodeTypes: NodeTypes = {
  entity: EntityNode,
  relation: RelationNode,
};

// Mock data representing Miyabi's entity-relationship structure
const mockNodes: GraphNode[] = [
  // Entities
  {
    id: 'entity-issue',
    type: 'entity',
    position: { x: 100, y: 100 },
    data: {
      name: 'Issue',
      icon: '📋',
      description: 'GitHub Issues managed by agents',
      primaryKey: { name: 'number', type: 'integer' },
      attributes: [
        { name: 'title', type: 'string', required: true },
        { name: 'state', type: 'string', required: true },
        { name: 'body', type: 'text' },
        { name: 'created_at', type: 'timestamp', required: true },
        { name: 'updated_at', type: 'timestamp' },
      ],
      count: 142,
    },
  },
  {
    id: 'entity-agent',
    type: 'entity',
    position: { x: 600, y: 100 },
    data: {
      name: 'Agent',
      icon: '🤖',
      description: 'Autonomous agents in the system',
      primaryKey: { name: 'id', type: 'string' },
      attributes: [
        { name: 'name', type: 'string', required: true },
        { name: 'type', type: 'enum', required: true },
        { name: 'status', type: 'enum', required: true },
        { name: 'progress', type: 'integer' },
        { name: 'last_activity', type: 'timestamp' },
      ],
      count: 7,
    },
  },
  {
    id: 'entity-label',
    type: 'entity',
    position: { x: 100, y: 400 },
    data: {
      name: 'Label',
      icon: '🏷️',
      description: '53-label system for state management',
      primaryKey: { name: 'name', type: 'string' },
      attributes: [
        { name: 'category', type: 'string', required: true },
        { name: 'color', type: 'string', required: true },
        { name: 'description', type: 'text' },
        { name: 'emoji', type: 'string' },
      ],
      count: 53,
    },
  },
  {
    id: 'entity-pr',
    type: 'entity',
    position: { x: 350, y: 700 },
    data: {
      name: 'Pull Request',
      icon: '🔀',
      description: 'Code changes created by agents',
      primaryKey: { name: 'number', type: 'integer' },
      attributes: [
        { name: 'title', type: 'string', required: true },
        { name: 'state', type: 'enum', required: true },
        { name: 'base', type: 'string', required: true },
        { name: 'head', type: 'string', required: true },
        { name: 'merged', type: 'boolean' },
      ],
      count: 89,
    },
  },
  {
    id: 'entity-state',
    type: 'entity',
    position: { x: 900, y: 400 },
    data: {
      name: 'State',
      icon: '🔄',
      description: 'Workflow states in the system',
      primaryKey: { name: 'name', type: 'string' },
      attributes: [
        { name: 'emoji', type: 'string', required: true },
        { name: 'color', type: 'string', required: true },
        { name: 'order', type: 'integer', required: true },
      ],
      count: 8,
    },
  },

  // Relationships
  {
    id: 'rel-issue-agent',
    type: 'relation',
    position: { x: 370, y: 100 },
    data: {
      name: 'assigned_to',
      icon: '👤',
      cardinality: '1:N',
      description: 'Agent assignment',
    },
  },
  {
    id: 'rel-issue-label',
    type: 'relation',
    position: { x: 100, y: 280 },
    data: {
      name: 'has_label',
      icon: '🔖',
      cardinality: 'N:M',
    },
  },
  {
    id: 'rel-issue-pr',
    type: 'relation',
    position: { x: 250, y: 500 },
    data: {
      name: 'resolves',
      icon: '✅',
      cardinality: '1:N',
    },
  },
  {
    id: 'rel-agent-state',
    type: 'relation',
    position: { x: 750, y: 280 },
    data: {
      name: 'transitions',
      icon: '🔄',
      cardinality: 'N:M',
    },
  },
];

const mockEdges: GraphEdge[] = [
  // Issue to assigned_to relation
  {
    id: 'e-issue-rel-issue-agent',
    source: 'entity-issue',
    target: 'rel-issue-agent',
    type: 'smoothstep',
    style: { stroke: '#8B5CF6', strokeWidth: 2 },
    markerEnd: { type: MarkerType.Arrow, color: '#8B5CF6' },
  },
  // assigned_to relation to Agent
  {
    id: 'e-rel-issue-agent-agent',
    source: 'rel-issue-agent',
    target: 'entity-agent',
    type: 'smoothstep',
    style: { stroke: '#8B5CF6', strokeWidth: 2 },
    markerEnd: { type: MarkerType.Arrow, color: '#8B5CF6' },
  },
  // Issue to has_label relation
  {
    id: 'e-issue-rel-issue-label',
    source: 'entity-issue',
    target: 'rel-issue-label',
    type: 'smoothstep',
    style: { stroke: '#10B981', strokeWidth: 2 },
    markerEnd: { type: MarkerType.Arrow, color: '#10B981' },
  },
  // has_label relation to Label
  {
    id: 'e-rel-issue-label-label',
    source: 'rel-issue-label',
    target: 'entity-label',
    type: 'smoothstep',
    style: { stroke: '#10B981', strokeWidth: 2 },
    markerEnd: { type: MarkerType.Arrow, color: '#10B981' },
  },
  // Issue to resolves relation
  {
    id: 'e-issue-rel-issue-pr',
    source: 'entity-issue',
    target: 'rel-issue-pr',
    type: 'smoothstep',
    style: { stroke: '#F59E0B', strokeWidth: 2 },
    markerEnd: { type: MarkerType.Arrow, color: '#F59E0B' },
  },
  // resolves relation to PR
  {
    id: 'e-rel-issue-pr-pr',
    source: 'rel-issue-pr',
    target: 'entity-pr',
    type: 'smoothstep',
    style: { stroke: '#F59E0B', strokeWidth: 2 },
    markerEnd: { type: MarkerType.Arrow, color: '#F59E0B' },
  },
  // Agent to transitions relation
  {
    id: 'e-agent-rel-agent-state',
    source: 'entity-agent',
    target: 'rel-agent-state',
    type: 'smoothstep',
    style: { stroke: '#EC4899', strokeWidth: 2 },
    markerEnd: { type: MarkerType.Arrow, color: '#EC4899' },
  },
  // transitions relation to State
  {
    id: 'e-rel-agent-state-state',
    source: 'rel-agent-state',
    target: 'entity-state',
    type: 'smoothstep',
    style: { stroke: '#EC4899', strokeWidth: 2 },
    markerEnd: { type: MarkerType.Arrow, color: '#EC4899' },
  },
];

export function ERView() {
  const [nodes, , onNodesChange] = useNodesState<GraphNode>(mockNodes as any);
  const [edges, setEdges, onEdgesChange] = useEdgesState<GraphEdge>(mockEdges as any);

  const onConnect = useCallback(
    (connection: Connection) => setEdges((eds) => addEdge(connection, eds)),
    [setEdges]
  );

  const stats = useMemo(() => {
    const entities = nodes.filter((n) => n.type === 'entity');
    const relations = nodes.filter((n) => n.type === 'relation');
    const totalRecords = entities.reduce((sum, e) => {
      const data = e.data as any;
      return sum + (data.count || 0);
    }, 0);

    return { entities: entities.length, relations: relations.length, totalRecords };
  }, [nodes]);

  return (
    <div className="flex h-full w-full flex-col">
      {/* Stats Bar */}
      <div className="z-20 bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-3 shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-white">
              Entity-Relationship Diagram
            </h2>
            <p className="text-xs text-white/80">
              Miyabi システムのデータモデル構造
            </p>
          </div>
          <div className="flex gap-6 text-white">
            <div className="text-center">
              <div className="text-2xl font-bold">{stats.entities}</div>
              <div className="text-xs text-white/80">Entities</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{stats.relations}</div>
              <div className="text-xs text-white/80">Relations</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">
                {stats.totalRecords.toLocaleString()}
              </div>
              <div className="text-xs text-white/80">Total Records</div>
            </div>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="absolute left-4 top-20 z-10 rounded-lg bg-white p-3 shadow-lg">
        <h3 className="mb-2 text-xs font-bold text-gray-700">Legend</h3>
        <div className="space-y-2 text-xs">
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 rounded border-2 border-indigo-600 bg-white" />
            <span>Entity</span>
          </div>
          <div className="flex items-center gap-2">
            <div
              className="h-4 w-4 bg-pink-500"
              style={{ transform: 'rotate(45deg)' }}
            />
            <span>Relationship</span>
          </div>
          <div className="space-y-1 border-t border-gray-200 pt-2">
            <div className="flex items-center gap-2">
              <span className="text-green-600">1:N</span>
              <span className="text-gray-600">One-to-Many</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-purple-600">N:M</span>
              <span className="text-gray-600">Many-to-Many</span>
            </div>
          </div>
        </div>
      </div>

      {/* React Flow Canvas */}
      <div className="flex-1">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          fitView
          attributionPosition="bottom-left"
        >
          <Background />
          <Controls />
          <MiniMap
            nodeColor={(node) => {
              if (node.type === 'entity') return '#4F46E5';
              if (node.type === 'relation') return '#EC4899';
              return '#9CA3AF';
            }}
          />
        </ReactFlow>
      </div>
    </div>
  );
}
