#!/usr/bin/env node
/**
 * Test Label Auto-Assignment - Verification script
 *
 * Usage:
 *   node test-label-auto-assign.mjs
 *
 * Tests:
 * 1. Agent inference from Issue title/body
 * 2. State inference from Issue title/body
 * 3. Confidence scoring
 * 4. Edge cases (no matches, multiple matches)
 */

import { LabelAutoAssigner } from './dist/utils/utils/label-auto-assign.js';

console.log('🏷️  Testing Label Auto-Assignment\n');
console.log('═'.repeat(60));

const assigner = new LabelAutoAssigner();

// Test cases
const testCases = [
  {
    name: 'Code Generation Issue (Pending)',
    issue: {
      number: 1,
      title: 'Implement user authentication feature',
      body: 'Need to add JWT-based authentication. Create login and signup endpoints.',
      labels: [],
      state: 'open',
    },
    expected: {
      agent: 'codegen',
      state: 'pending', // Task to do, not started yet
    },
  },
  {
    name: 'Code Generation Issue (In Progress)',
    issue: {
      number: 2,
      title: 'WIP: User authentication feature',
      body: 'Currently implementing JWT-based authentication. Working on login endpoint.',
      labels: [],
      state: 'open',
    },
    expected: {
      agent: 'codegen',
      state: 'implementing', // Actively working
    },
  },
  {
    name: 'Code Review Issue (Pending)',
    issue: {
      number: 3,
      title: 'Review and refactor API module',
      body: 'Code quality needs improvement. Run linter and fix security issues.',
      labels: [],
      state: 'open',
    },
    expected: {
      agent: 'review',
      state: 'pending', // Review not started yet
    },
  },
  {
    name: 'Code Review Issue (In Progress)',
    issue: {
      number: 4,
      title: 'Review API module quality',
      body: 'Reviewing and refactoring. Checking code quality and security. Running lint checks.',
      labels: [],
      state: 'open',
    },
    expected: {
      agent: 'review',
      state: 'reviewing', // Actively reviewing
    },
  },
  {
    name: 'Deployment Issue',
    issue: {
      number: 5,
      title: 'Deploy to production',
      body: 'Release v2.0 to Firebase. Setup CI/CD pipeline.',
      labels: [],
      state: 'open',
    },
    expected: {
      agent: 'deployment',
      state: 'pending',
    },
  },
  {
    name: 'Blocked Issue',
    issue: {
      number: 6,
      title: 'Fix database connection',
      body: 'This is blocked by #123. Waiting for infrastructure team.',
      labels: [{ name: 'blocker' }],
      state: 'open',
    },
    expected: {
      agent: null,
      state: 'blocked',
    },
  },
  {
    name: 'Coordination Issue (Planning)',
    issue: {
      number: 7,
      title: 'Plan Q4 roadmap',
      body: 'Currently planning and scoping. Decompose tasks, identify dependencies, and schedule work.',
      labels: [],
      state: 'open',
    },
    expected: {
      agent: 'coordinator',
      state: 'analyzing', // Actively planning
    },
  },
  {
    name: 'Testing Issue (Pending)',
    issue: {
      number: 8,
      title: 'Add unit tests for payment module',
      body: 'Write Jest tests to achieve 80% coverage.',
      labels: [],
      state: 'open',
    },
    expected: {
      agent: 'test',
      state: 'pending', // Task to do
    },
  },
  {
    name: 'Testing Issue (In Progress)',
    issue: {
      number: 9,
      title: 'Unit tests for payment module',
      body: 'WIP: Writing Vitest specs. Currently testing payment flow.',
      labels: [],
      state: 'open',
    },
    expected: {
      agent: 'test',
      state: 'implementing', // Actively writing tests
    },
  },
  {
    name: 'Generic Issue (no clear keywords)',
    issue: {
      number: 10,
      title: 'Update documentation',
      body: 'Need to update README.',
      labels: [],
      state: 'open',
    },
    expected: {
      agent: null,
      state: 'pending',
    },
  },
];

console.log('\n🧪 Running Test Cases\n');

let passed = 0;
let failed = 0;

for (const testCase of testCases) {
  console.log(`\n📋 Test: ${testCase.name}`);
  console.log(`  Issue #${testCase.issue.number}: ${testCase.issue.title}`);

  const result = assigner.autoAssignLabels(testCase.issue);

  console.log(`  Inferred Agent: ${result.agent || 'null'} (confidence: ${((result.confidence?.agent || 0) * 100).toFixed(0)}%)`);
  console.log(`  Inferred State: ${result.state || 'null'} (confidence: ${((result.confidence?.state || 0) * 100).toFixed(0)}%)`);

  // Check expectations
  const agentMatch =
    result.agent === testCase.expected.agent ||
    (testCase.expected.agent === null && !result.agent);
  const stateMatch = result.state === testCase.expected.state;

  if (agentMatch && stateMatch) {
    console.log('  ✅ PASS');
    passed++;
  } else {
    console.log('  ❌ FAIL');
    if (!agentMatch) {
      console.log(
        `    Expected agent: ${testCase.expected.agent}, got: ${result.agent}`
      );
    }
    if (!stateMatch) {
      console.log(
        `    Expected state: ${testCase.expected.state}, got: ${result.state}`
      );
    }
    failed++;
  }
}

// Summary
console.log('\n' + '═'.repeat(60));
console.log('📊 Test Summary\n');
console.log(`  Total: ${testCases.length}`);
console.log(`  ✅ Passed: ${passed}`);
console.log(`  ❌ Failed: ${failed}`);

if (failed === 0) {
  console.log('\n🎉 All tests passed!');
} else {
  console.log(`\n⚠️  ${failed} test(s) failed`);
  process.exit(1);
}

// Display supported agents and states
console.log('\n' + '═'.repeat(60));
console.log('📚 Supported Agents and States\n');

console.log('Agents:');
assigner.getSupportedAgents().forEach((agent) => {
  const keywords = assigner.getAgentKeywords(agent);
  console.log(`  • ${agent}: ${keywords.slice(0, 5).join(', ')}...`);
});

console.log('\nStates:');
assigner.getSupportedStates().forEach((state) => {
  const keywords = assigner.getStateKeywords(state);
  console.log(`  • ${state}: ${keywords.slice(0, 5).join(', ')}...`);
});

console.log('\n' + '═'.repeat(60));
