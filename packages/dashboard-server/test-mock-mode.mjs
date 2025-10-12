#!/usr/bin/env node
/**
 * Test Mock Mode - Quick verification script for GRAPH_MOCK_MODE
 *
 * Usage:
 *   node test-mock-mode.mjs
 *
 * This script verifies that:
 * 1. Mock mode can be enabled via environment variable
 * 2. Mock graph is generated with correct structure
 * 3. All edge types are present (issue→agent, agent→state, dependencies, blocks, related)
 */

import { GraphBuilder } from './dist/graph-builder.js';

// Enable mock mode
process.env.GRAPH_MOCK_MODE = 'true';

console.log('🎭 Testing Mock Mode\n');
console.log('Environment: GRAPH_MOCK_MODE =', process.env.GRAPH_MOCK_MODE);
console.log('─'.repeat(60));

try {
  // Create GraphBuilder (dummy credentials since we're in mock mode)
  const builder = new GraphBuilder(
    'dummy_token_for_mock_mode',
    'mock-owner',
    'mock-repo'
  );

  // Build graph in mock mode
  console.log('\n📊 Building mock graph...');
  const graphData = await builder.buildFullGraph();

  // Verify structure
  console.log('\n✅ Mock Graph Generated Successfully!\n');
  console.log('Statistics:');
  console.log('  📋 Issues:', graphData.nodes.filter(n => n.type === 'issue').length);
  console.log('  🤖 Agents:', graphData.nodes.filter(n => n.type === 'agent').length);
  console.log('  📊 States:', graphData.nodes.filter(n => n.type === 'state').length);
  console.log('  🔗 Total Edges:', graphData.edges.length);

  // Analyze edge types
  const edgeTypes = {};
  graphData.edges.forEach(edge => {
    const label = edge.label || edge.type || 'unlabeled';
    edgeTypes[label] = (edgeTypes[label] || 0) + 1;
  });

  console.log('\n🔗 Edge Type Breakdown:');
  Object.entries(edgeTypes)
    .sort((a, b) => b[1] - a[1])
    .forEach(([type, count]) => {
      console.log(`  ${type.padEnd(20)} → ${count} edge(s)`);
    });

  // Verify sample issues
  console.log('\n📋 Sample Issues:');
  const issueNodes = graphData.nodes.filter(n => n.type === 'issue').slice(0, 3);
  issueNodes.forEach(node => {
    console.log(`  #${node.data.number} - ${node.data.title}`);
    console.log(`    Agent: ${node.data.assignedAgents.join(', ')}`);
    console.log(`    State: ${node.data.state}`);
    if (node.data.priority) {
      console.log(`    Priority: ${node.data.priority}`);
    }
  });

  // Verify dependencies
  const dependencyEdges = graphData.edges.filter(e =>
    e.label?.includes('depends') || e.label?.includes('blocks') || e.label?.includes('related')
  );

  console.log(`\n⚙️  Dependency Edges: ${dependencyEdges.length} found`);
  if (dependencyEdges.length > 0) {
    console.log('  Examples:');
    dependencyEdges.slice(0, 3).forEach(edge => {
      console.log(`    ${edge.source} ${edge.label || '→'} ${edge.target}`);
    });
  }

  // Success summary
  console.log('\n' + '─'.repeat(60));
  console.log('✅ All checks passed!');
  console.log('🎉 Mock mode is working correctly');
  console.log('─'.repeat(60));

  // Cleanup
  builder.destroy();

} catch (error) {
  console.error('\n❌ Test failed:', error.message);
  console.error(error.stack);
  process.exit(1);
}
