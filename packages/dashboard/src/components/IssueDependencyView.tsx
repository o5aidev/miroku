import { useCallback, useEffect, useMemo, useState } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
  type Connection,
  type NodeTypes,
  BackgroundVariant,
} from 'reactflow';
import 'reactflow/dist/style.css';
import dagre from 'dagre';

import { IssueNode } from './nodes/IssueNode';
import type { GraphNode, GraphEdge } from '../types';
import { useAccessibilityPreferences } from '../hooks/useAccessibilityPreferences';

// Dagre layout for dependency graph (top-to-bottom)
const getLayoutedElements = (nodes: GraphNode[], edges: GraphEdge[]) => {
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));

  // Top-to-bottom layout for dependency hierarchy
  dagreGraph.setGraph({
    rankdir: 'TB', // Top to Bottom
    nodesep: 120,
    ranksep: 180,
    marginx: 40,
    marginy: 40,
  });

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, {
      width: 320,
      height: 180,
    });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  const layoutedNodes = nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    return {
      ...node,
      position: {
        x: nodeWithPosition.x - 160,
        y: nodeWithPosition.y - 90,
      },
    };
  });

  return layoutedNodes;
};

type DependencyFilter = 'all' | 'depends' | 'blocks' | 'related';

export function IssueDependencyView() {
  const [nodes, setNodes, onNodesChange] = useNodesState<GraphNode>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<GraphEdge>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<DependencyFilter>('all');
  const { prefersHighContrast } = useAccessibilityPreferences();

  // Fetch graph data
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const res = await fetch('http://localhost:3001/api/graph');
        const data = await res.json();

        // Filter to only Issue nodes
        const issueNodes = data.nodes.filter((n: GraphNode) => n.type === 'issue');

        // Filter to only dependency edges (depends on, blocks, related to)
        const dependencyEdges = data.edges.filter((e: GraphEdge) =>
          e.id.startsWith('dep-')
        );

        setNodes(issueNodes);
        setEdges(dependencyEdges);
        setLoading(false);
      } catch (error) {
        console.error('Failed to fetch graph data:', error);
        setLoading(false);
      }
    };

    loadData();
  }, [setNodes, setEdges]);

  // Apply layout when nodes change
  useEffect(() => {
    if (nodes.length > 0 && edges.length > 0) {
      const layouted = getLayoutedElements(nodes as any, edges as any);
      setNodes(layouted as any);
    }
  }, [edges.length]); // Only re-layout when edge count changes

  // Filter edges based on filter
  const filteredEdges = useMemo(() => {
    if (filter === 'all') return edges;

    return edges.filter((edge) => {
      if (filter === 'depends') return edge.id.includes('-depends-');
      if (filter === 'blocks') return edge.id.includes('-blocks-');
      if (filter === 'related') return edge.id.includes('-related-');
      return true;
    });
  }, [edges, filter]);

  // Statistics
  const stats = useMemo(() => {
    const totalIssues = nodes.length;
    const totalDeps = edges.length;

    const dependsCount = edges.filter((e) => e.id.includes('-depends-')).length;
    const blocksCount = edges.filter((e) => e.id.includes('-blocks-')).length;
    const relatedCount = edges.filter((e) => e.id.includes('-related-')).length;

    // Isolated issues (no dependencies)
    const connectedIssueIds = new Set<string>();
    edges.forEach((e) => {
      connectedIssueIds.add(e.source);
      connectedIssueIds.add(e.target);
    });
    const isolatedCount = nodes.filter((n) => !connectedIssueIds.has(n.id)).length;

    return {
      totalIssues,
      totalDeps,
      dependsCount,
      blocksCount,
      relatedCount,
      isolatedCount,
    };
  }, [nodes, edges]);

  const nodeTypes: NodeTypes = useMemo(
    () => ({
      issue: (props: any) => <IssueNode {...props} agentStatuses={{}} />,
    }),
    []
  );

  const onConnect = useCallback(
    (connection: Connection) => setEdges((eds) => addEdge(connection, eds)),
    [setEdges]
  );

  if (loading) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800">
        <div className="text-center">
          <div className="mb-4 text-4xl">🔗</div>
          <div className="text-lg font-semibold text-white">Loading dependencies...</div>
          <div className="mt-2 text-sm text-white/70">Analyzing Issue relationships</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full w-full flex-col">
      {/* Stats Header */}
      <div
        className="z-20 border-b shadow-lg"
        style={{
          background: prefersHighContrast
            ? 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)'
            : 'linear-gradient(135deg, #7c3aed 0%, #2563eb 100%)',
          borderBottomColor: prefersHighContrast ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.2)',
        }}
      >
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="flex items-center gap-2 text-xl font-bold text-white">
                <span>🔗</span>
                <span>Issue Dependency Graph</span>
              </h2>
              <p className="mt-1 text-sm text-white/80">
                All Issues with dependency relationships
              </p>
            </div>

            {/* Filter Controls */}
            <div className="flex gap-3">
              <button
                onClick={() => setFilter('all')}
                className={`rounded-lg px-4 py-2 text-sm font-semibold transition-all ${
                  filter === 'all'
                    ? 'bg-white text-purple-600 shadow-lg'
                    : 'bg-white/10 text-white hover:bg-white/20'
                }`}
              >
                All ({stats.totalDeps})
              </button>
              <button
                onClick={() => setFilter('depends')}
                className={`rounded-lg px-4 py-2 text-sm font-semibold transition-all ${
                  filter === 'depends'
                    ? 'bg-orange-500 text-white shadow-lg'
                    : 'bg-white/10 text-white hover:bg-white/20'
                }`}
              >
                ⚙️ Depends ({stats.dependsCount})
              </button>
              <button
                onClick={() => setFilter('blocks')}
                className={`rounded-lg px-4 py-2 text-sm font-semibold transition-all ${
                  filter === 'blocks'
                    ? 'bg-red-500 text-white shadow-lg'
                    : 'bg-white/10 text-white hover:bg-white/20'
                }`}
              >
                🚫 Blocks ({stats.blocksCount})
              </button>
              <button
                onClick={() => setFilter('related')}
                className={`rounded-lg px-4 py-2 text-sm font-semibold transition-all ${
                  filter === 'related'
                    ? 'bg-gray-500 text-white shadow-lg'
                    : 'bg-white/10 text-white hover:bg-white/20'
                }`}
              >
                🔗 Related ({stats.relatedCount})
              </button>
            </div>
          </div>

          {/* Stats Bar */}
          <div className="mt-4 flex gap-6 text-white">
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold">{stats.totalIssues}</span>
              <span className="text-sm text-white/80">Total Issues</span>
            </div>
            <div className="h-8 w-px bg-white/20" />
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold">{stats.totalDeps}</span>
              <span className="text-sm text-white/80">Dependencies</span>
            </div>
            <div className="h-8 w-px bg-white/20" />
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold">{stats.isolatedCount}</span>
              <span className="text-sm text-white/80">Isolated</span>
            </div>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="absolute left-4 top-24 z-10 rounded-lg border bg-white p-3 shadow-xl"
        style={{
          borderColor: prefersHighContrast ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)',
          backgroundColor: prefersHighContrast ? '#1e293b' : 'white',
        }}
      >
        <h3 className={`mb-3 text-xs font-bold uppercase tracking-wider ${
          prefersHighContrast ? 'text-white' : 'text-gray-700'
        }`}>
          Legend
        </h3>
        <div className="space-y-2 text-xs">
          <div className="flex items-center gap-2">
            <div className="h-3 w-8 rounded bg-orange-500" />
            <span className={prefersHighContrast ? 'text-white/90' : 'text-gray-700'}>
              ⚙️ Depends on
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-8 rounded bg-red-500" />
            <span className={prefersHighContrast ? 'text-white/90' : 'text-gray-700'}>
              🚫 Blocks
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-8 rounded bg-gray-400" />
            <span className={prefersHighContrast ? 'text-white/90' : 'text-gray-700'}>
              🔗 Related to
            </span>
          </div>
          <div className="mt-3 border-t pt-2" style={{
            borderColor: prefersHighContrast ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
          }}>
            <div className="flex items-center gap-2">
              <span className="text-purple-600">📋</span>
              <span className={prefersHighContrast ? 'text-white/90' : 'text-gray-600'}>
                Issue node
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Empty State */}
      {nodes.length === 0 && !loading && (
        <div className="flex flex-1 items-center justify-center">
          <div className="text-center">
            <div className="mb-4 text-6xl">🔗</div>
            <h3 className="mb-2 text-xl font-bold text-white">No Dependencies Found</h3>
            <p className="text-sm text-white/70">
              No issues have dependency relationships defined.
            </p>
            <p className="mt-2 text-xs text-white/50">
              Use "Depends on #XXX", "Blocks #YYY", or "Related to #ZZZ" in issue descriptions
            </p>
          </div>
        </div>
      )}

      {/* React Flow Canvas */}
      {nodes.length > 0 && (
        <div className="flex-1">
          <ReactFlow
            nodes={nodes}
            edges={filteredEdges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            nodeTypes={nodeTypes}
            fitView
            attributionPosition="bottom-left"
            minZoom={0.1}
            maxZoom={1.5}
          >
            <Background
              variant={BackgroundVariant.Dots}
              gap={20}
              size={2}
              color={prefersHighContrast ? '#475569' : '#6366f1'}
            />
            <Controls className="!bg-white/90 !backdrop-blur !border !border-gray-200 !shadow-xl" />
            <MiniMap
              className={`!border ${
                prefersHighContrast
                  ? '!bg-slate-800/90 !border-white/20'
                  : '!bg-gray-900/90 !border-gray-700'
              }`}
              nodeColor={(node) => {
                if (node.type === 'issue') return '#8B5CF6';
                return '#6B7280';
              }}
            />
          </ReactFlow>
        </div>
      )}
    </div>
  );
}
