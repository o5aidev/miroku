import { useEffect, useRef, useState } from 'react';
import cytoscape, { Core, NodeSingular, EdgeSingular } from 'cytoscape';
import type { EntityRelationGraph } from '../types/entity-relation-graph';

// Node colors by entity type
const NODE_COLORS: Record<string, string> = {
  Issue: '#58a6ff',
  Task: '#3fb950',
  Agent: '#d29922',
  Command: '#f85149',
  Label: '#a371f7',
  DiscordCommunity: '#ec6cb9',
  PR: '#bc8cff',
  QualityReport: '#56d364',
  Deployment: '#ff7b72',
};

// Status colors for borders
const STATUS_COLORS: Record<string, string> = {
  pending: '#8b949e',
  in_progress: '#f0883e',
  completed: '#3fb950',
  failed: '#f85149',
  blocked: '#f0883e',
};

// Edge colors by relation type
const EDGE_COLORS: Record<string, { color: string; lineStyle: string }> = {
  'analyzed-by': { color: '#58a6ff', lineStyle: 'solid' },
  'decomposed-into': { color: '#3fb950', lineStyle: 'solid' },
  'tagged-with': { color: '#a371f7', lineStyle: 'dashed' },
  'creates': { color: '#56d364', lineStyle: 'solid' },
  'assigned-to': { color: '#d29922', lineStyle: 'solid' },
  'depends-on': { color: '#8b949e', lineStyle: 'dashed' },
  'executes': { color: '#f0883e', lineStyle: 'solid' },
  'generates': { color: '#bc8cff', lineStyle: 'solid' },
  'invoked-by': { color: '#f85149', lineStyle: 'dotted' },
  'notifies-to': { color: '#ec6cb9', lineStyle: 'dashed' },
};

type LayoutType = 'cose' | 'breadthfirst' | 'circle' | 'grid';

export function SessionGraphView() {
  const cyRef = useRef<Core | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [graphData, setGraphData] = useState<EntityRelationGraph | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentLayout, setCurrentLayout] = useState<LayoutType>('cose');

  // Filter states
  const [filters, setFilters] = useState({
    Issue: true,
    Task: true,
    Agent: true,
    Command: true,
    Label: true,
    DiscordCommunity: true,
  });

  // Load graph data
  useEffect(() => {
    loadGraphData();
  }, []);

  // Initialize Cytoscape
  useEffect(() => {
    if (!graphData || !containerRef.current) return;

    const elements = convertToElements(graphData);

    cyRef.current = cytoscape({
      container: containerRef.current,
      elements,
      style: getCytoscapeStyle(),
      layout: getLayoutConfig(currentLayout),
      wheelSensitivity: 0.2,
    });

    // Event listeners
    cyRef.current.on('tap', 'node', (evt) => {
      const node = evt.target;
      console.log('Node clicked:', node.data());
    });

    cyRef.current.on('tap', 'edge', (evt) => {
      const edge = evt.target;
      console.log('Edge clicked:', edge.data());
    });

    return () => {
      cyRef.current?.destroy();
    };
  }, [graphData, currentLayout]);

  // Apply filters
  useEffect(() => {
    if (!cyRef.current) return;

    cyRef.current.nodes().forEach((node: NodeSingular) => {
      const type = node.data('type');
      const shouldShow = filters[type as keyof typeof filters];
      node.style('display', shouldShow ? 'element' : 'none');
    });

    // Hide edges if either endpoint is hidden
    cyRef.current.edges().forEach((edge: EdgeSingular) => {
      const source = edge.source();
      const target = edge.target();
      if (source.style('display') === 'none' || target.style('display') === 'none') {
        edge.style('display', 'none');
      } else {
        edge.style('display', 'element');
      }
    });
  }, [filters]);

  async function loadGraphData() {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/session-graph.json');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      // The JSON structure has a 'graph' property containing nodes and edges
      const graphData = data.graph || data;
      setGraphData(graphData);
    } catch (err) {
      console.error('Error loading graph:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }

  function convertToElements(graph: EntityRelationGraph) {
    const elements: any[] = [];

    // Convert nodes
    graph.nodes.forEach((node) => {
      elements.push({
        group: 'nodes',
        data: {
          id: node.id,
          label: node.label,
          type: node.type,
          status: node.status || 'pending',
          metadata: node.metadata,
        },
      });
    });

    // Convert edges
    graph.edges.forEach((edge) => {
      elements.push({
        group: 'edges',
        data: {
          id: edge.id,
          source: edge.source,
          target: edge.target,
          label: edge.label,
          relationType: edge.relationType,
          metadata: edge.metadata,
        },
      });
    });

    return elements;
  }

  function getCytoscapeStyle(): any {
    return [
      {
        selector: 'node',
        style: {
          'background-color': (ele: any) => NODE_COLORS[ele.data('type')] || '#8b949e',
          'border-width': 3,
          'border-color': (ele: any) => STATUS_COLORS[ele.data('status')] || '#30363d',
          label: 'data(label)',
          'text-valign': 'center',
          'text-halign': 'center',
          'font-size': '10px',
          'font-weight': 'bold',
          color: '#f0f6fc',
          'text-outline-width': 2,
          'text-outline-color': '#0d1117',
          width: 60,
          height: 60,
        },
      },
      {
        selector: 'node:selected',
        style: {
          'border-width': 5,
          'border-color': '#f0883e',
        },
      },
      {
        selector: 'edge',
        style: {
          width: 2,
          'line-color': (ele: any) => {
            const relType = ele.data('relationType');
            return EDGE_COLORS[relType]?.color || '#30363d';
          },
          'line-style': (ele: any) => {
            const relType = ele.data('relationType');
            return EDGE_COLORS[relType]?.lineStyle || 'solid';
          },
          'target-arrow-shape': 'triangle',
          'target-arrow-color': (ele: any) => {
            const relType = ele.data('relationType');
            return EDGE_COLORS[relType]?.color || '#30363d';
          },
          'curve-style': 'bezier',
          label: 'data(label)',
          'font-size': '8px',
          color: '#8b949e',
          'text-outline-width': 1,
          'text-outline-color': '#0d1117',
          'text-rotation': 'autorotate',
        },
      },
      {
        selector: 'edge:selected',
        style: {
          width: 4,
          'line-color': '#f0883e',
          'target-arrow-color': '#f0883e',
        },
      },
    ];
  }

  function getLayoutConfig(layout: LayoutType) {
    const baseConfig = {
      name: layout,
      animate: true,
      animationDuration: 500,
      padding: 50,
    };

    if (layout === 'cose') {
      return {
        ...baseConfig,
        nodeRepulsion: 8000,
        idealEdgeLength: 100,
        edgeElasticity: 100,
        gravity: 1,
      };
    } else if (layout === 'breadthfirst') {
      return {
        ...baseConfig,
        directed: true,
        spacingFactor: 1.5,
      };
    } else if (layout === 'circle') {
      return {
        ...baseConfig,
        radius: 300,
      };
    } else if (layout === 'grid') {
      return {
        ...baseConfig,
        rows: 3,
      };
    }

    return baseConfig;
  }

  function changeLayout(layout: LayoutType) {
    setCurrentLayout(layout);
    if (!cyRef.current) return;
    cyRef.current.layout(getLayoutConfig(layout)).run();
  }

  function fitGraph() {
    if (!cyRef.current) return;
    cyRef.current.fit(undefined, 50);
  }

  function resetZoom() {
    if (!cyRef.current) return;
    cyRef.current.zoom(1);
    cyRef.current.center();
  }

  function toggleFilter(type: keyof typeof filters) {
    setFilters((prev) => ({ ...prev, [type]: !prev[type] }));
  }

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800">
        <div className="text-center">
          <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-purple-500 border-t-transparent" />
          <p className="text-white">Loading graph data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-full items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800">
        <div className="rounded-lg bg-red-500/20 border border-red-500 p-6 text-white">
          <h3 className="text-lg font-bold mb-2">Error loading graph data</h3>
          <p className="text-sm">{error}</p>
          <p className="text-xs mt-2 text-white/70">
            Make sure session-graph.json exists in the public directory
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full w-full">
      {/* Sidebar */}
      <div className="w-64 bg-slate-900 border-r border-white/10 p-4 overflow-y-auto">
        <h2 className="text-white font-semibold mb-4">Session Graph</h2>

        {/* Stats */}
        {graphData && (
          <div className="bg-slate-800 rounded-lg p-3 mb-4 text-sm">
            <div className="text-white/70 mb-1">Session ID</div>
            <div className="text-xs text-purple-400 font-mono">
              {graphData.sessionId.substring(0, 8)}...
            </div>
            <div className="mt-3 space-y-1">
              <div className="flex justify-between text-white/90">
                <span>Nodes:</span>
                <span className="font-semibold">{graphData.nodes.length}</span>
              </div>
              <div className="flex justify-between text-white/90">
                <span>Edges:</span>
                <span className="font-semibold">{graphData.edges.length}</span>
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="mb-4">
          <h3 className="text-sm font-semibold text-white/70 uppercase mb-2">
            Node Types
          </h3>
          <div className="space-y-1">
            {Object.entries(filters).map(([type, checked]) => (
              <label
                key={type}
                className="flex items-center gap-2 p-2 rounded hover:bg-slate-800 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => toggleFilter(type as keyof typeof filters)}
                  className="rounded"
                />
                <span className="text-sm text-white">{type}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Layouts */}
        <div className="mb-4">
          <h3 className="text-sm font-semibold text-white/70 uppercase mb-2">
            Layouts
          </h3>
          <div className="space-y-1">
            {(['cose', 'breadthfirst', 'circle', 'grid'] as LayoutType[]).map((layout) => (
              <button
                key={layout}
                onClick={() => changeLayout(layout)}
                className={`w-full text-left px-3 py-1.5 rounded text-sm transition ${
                  currentLayout === layout
                    ? 'bg-purple-600 text-white'
                    : 'bg-slate-800 text-white/90 hover:bg-slate-700'
                }`}
              >
                {layout === 'cose' && '🌀 Force-Directed'}
                {layout === 'breadthfirst' && '📊 Hierarchical'}
                {layout === 'circle' && '⭕ Circle'}
                {layout === 'grid' && '📐 Grid'}
              </button>
            ))}
          </div>
        </div>

        {/* Controls */}
        <div className="space-y-2">
          <button
            onClick={fitGraph}
            className="w-full bg-slate-800 hover:bg-slate-700 text-white py-2 rounded text-sm transition"
          >
            🔍 Fit to View
          </button>
          <button
            onClick={resetZoom}
            className="w-full bg-slate-800 hover:bg-slate-700 text-white py-2 rounded text-sm transition"
          >
            🔄 Reset Zoom
          </button>
          <button
            onClick={loadGraphData}
            className="w-full bg-purple-600 hover:bg-purple-500 text-white py-2 rounded text-sm transition"
          >
            🔃 Refresh
          </button>
        </div>

        {/* Legend */}
        <div className="mt-6">
          <h3 className="text-sm font-semibold text-white/70 uppercase mb-2">
            Legend
          </h3>
          <div className="space-y-2 text-xs">
            {Object.entries(NODE_COLORS).slice(0, 6).map(([type, color]) => (
              <div key={type} className="flex items-center gap-2">
                <div
                  className="w-4 h-4 rounded"
                  style={{ backgroundColor: color }}
                />
                <span className="text-white/80">{type}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Graph Container */}
      <div className="flex-1 relative bg-gradient-to-br from-slate-900 to-slate-800">
        <div ref={containerRef} className="w-full h-full" />
      </div>
    </div>
  );
}
