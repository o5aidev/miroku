/**
 * Entity-Relation Graph Visualization
 * Uses Cytoscape.js to render Entity-Relation graphs from session data
 */

let cy = null; // Cytoscape instance
let graphData = null; // Loaded graph data

// Entity type to color mapping
const NODE_COLORS = {
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

// Node status to border color mapping
const STATUS_COLORS = {
  pending: '#8b949e',
  in_progress: '#f0883e',
  completed: '#3fb950',
  failed: '#f85149',
  blocked: '#f0883e',
};

// Relation type to edge style mapping
const EDGE_STYLES = {
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

/**
 * Initialize Cytoscape graph
 */
function initGraph(data) {
  const container = document.getElementById('cy');

  // Convert data to Cytoscape format
  const elements = convertToElements(data.graph);

  // Initialize Cytoscape
  cy = cytoscape({
    container: container,
    elements: elements,
    style: getCytoscapeStyle(),
    layout: {
      name: 'cose',
      animate: true,
      animationDuration: 500,
      padding: 50,
      nodeRepulsion: 8000,
      idealEdgeLength: 100,
      edgeElasticity: 100,
      nestingFactor: 1.2,
      gravity: 1,
    },
    wheelSensitivity: 0.2,
  });

  // Add event listeners
  cy.on('tap', 'node', function (evt) {
    const node = evt.target;
    showNodeInfo(node);
  });

  cy.on('tap', 'edge', function (evt) {
    const edge = evt.target;
    showEdgeInfo(edge);
  });

  // Update stats
  updateStats(data);

  // Hide loading
  document.getElementById('loading').style.display = 'none';
}

/**
 * Convert graph data to Cytoscape elements format
 */
function convertToElements(graph) {
  const elements = [];

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

/**
 * Get Cytoscape style definition
 */
function getCytoscapeStyle() {
  return [
    // Node styles
    {
      selector: 'node',
      style: {
        'background-color': function (ele) {
          return NODE_COLORS[ele.data('type')] || '#8b949e';
        },
        'border-width': 3,
        'border-color': function (ele) {
          return STATUS_COLORS[ele.data('status')] || '#30363d';
        },
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
    // Highlighted node style
    {
      selector: 'node:selected',
      style: {
        'border-width': 5,
        'border-color': '#f0883e',
      },
    },
    // Edge styles
    {
      selector: 'edge',
      style: {
        width: 2,
        'line-color': function (ele) {
          const relType = ele.data('relationType');
          return EDGE_STYLES[relType]?.color || '#30363d';
        },
        'line-style': function (ele) {
          const relType = ele.data('relationType');
          return EDGE_STYLES[relType]?.lineStyle || 'solid';
        },
        'target-arrow-shape': 'triangle',
        'target-arrow-color': function (ele) {
          const relType = ele.data('relationType');
          return EDGE_STYLES[relType]?.color || '#30363d';
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
    // Highlighted edge style
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

/**
 * Show node information
 */
function showNodeInfo(node) {
  const data = node.data();
  console.log('Node clicked:', data);

  // TODO: Display in a popup or sidebar
  alert(`Node: ${data.label}\nType: ${data.type}\nStatus: ${data.status}`);
}

/**
 * Show edge information
 */
function showEdgeInfo(edge) {
  const data = edge.data();
  console.log('Edge clicked:', data);

  // TODO: Display in a popup or sidebar
  alert(`Relation: ${data.label}\nType: ${data.relationType}`);
}

/**
 * Update statistics display
 */
function updateStats(data) {
  document.getElementById('stat-nodes').textContent = data.graph.nodes.length;
  document.getElementById('stat-edges').textContent = data.graph.edges.length;
  document.getElementById('stat-session').textContent = data.sessionId.substring(0, 8) + '...';
}

/**
 * Change graph layout
 */
function changeLayout(layoutName) {
  if (!cy) return;

  const layoutOptions = {
    name: layoutName,
    animate: true,
    animationDuration: 500,
    padding: 50,
  };

  // Add layout-specific options
  if (layoutName === 'cose') {
    layoutOptions.nodeRepulsion = 8000;
    layoutOptions.idealEdgeLength = 100;
    layoutOptions.edgeElasticity = 100;
    layoutOptions.gravity = 1;
  } else if (layoutName === 'breadthfirst') {
    layoutOptions.directed = true;
    layoutOptions.spacingFactor = 1.5;
  } else if (layoutName === 'circle') {
    layoutOptions.radius = 300;
  } else if (layoutName === 'grid') {
    layoutOptions.rows = 3;
  }

  cy.layout(layoutOptions).run();
}

/**
 * Fit graph to viewport
 */
function fitGraph() {
  if (!cy) return;
  cy.fit(null, 50);
}

/**
 * Reset zoom
 */
function resetZoom() {
  if (!cy) return;
  cy.zoom(1);
  cy.center();
}

/**
 * Refresh graph data
 */
async function refreshGraph() {
  document.getElementById('loading').style.display = 'block';
  document.getElementById('error').style.display = 'none';

  try {
    const response = await fetch('session-graph.json');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    graphData = await response.json();

    // Re-initialize graph
    if (cy) {
      cy.destroy();
    }
    initGraph(graphData);
  } catch (error) {
    console.error('Error refreshing graph:', error);
    document.getElementById('loading').style.display = 'none';
    const errorEl = document.getElementById('error');
    errorEl.textContent = `Error loading graph data: ${error.message}`;
    errorEl.style.display = 'block';
  }
}

/**
 * Apply filters
 */
function applyFilters() {
  if (!cy) return;

  const filters = {
    issue: document.getElementById('filter-issue').checked,
    task: document.getElementById('filter-task').checked,
    agent: document.getElementById('filter-agent').checked,
    command: document.getElementById('filter-command').checked,
    label: document.getElementById('filter-label').checked,
    discord: document.getElementById('filter-discord').checked,
  };

  // Show/hide nodes based on filters
  cy.nodes().forEach((node) => {
    const type = node.data('type');
    const shouldShow =
      (type === 'Issue' && filters.issue) ||
      (type === 'Task' && filters.task) ||
      (type === 'Agent' && filters.agent) ||
      (type === 'Command' && filters.command) ||
      (type === 'Label' && filters.label) ||
      (type === 'DiscordCommunity' && filters.discord);

    if (shouldShow) {
      node.style('display', 'element');
    } else {
      node.style('display', 'none');
    }
  });

  // Hide edges if either endpoint is hidden
  cy.edges().forEach((edge) => {
    const source = edge.source();
    const target = edge.target();
    if (source.style('display') === 'none' || target.style('display') === 'none') {
      edge.style('display', 'none');
    } else {
      edge.style('display', 'element');
    }
  });
}

/**
 * Load graph data on page load
 */
async function loadGraph() {
  try {
    const response = await fetch('session-graph.json');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    graphData = await response.json();
    initGraph(graphData);
  } catch (error) {
    console.error('Error loading graph:', error);
    document.getElementById('loading').style.display = 'none';
    const errorEl = document.getElementById('error');
    errorEl.textContent = `Error loading graph data: ${error.message}. Make sure session-graph.json exists.`;
    errorEl.style.display = 'block';
  }
}

// Attach filter event listeners
document.querySelectorAll('.filter-item input[type="checkbox"]').forEach((checkbox) => {
  checkbox.addEventListener('change', applyFilters);
});

// Load graph on page load
window.addEventListener('DOMContentLoaded', loadGraph);
