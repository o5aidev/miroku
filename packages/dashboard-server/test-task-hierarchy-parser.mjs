#!/usr/bin/env node
/**
 * Test Task Hierarchy Parser - Verification script
 *
 * Usage:
 *   node test-task-hierarchy-parser.mjs
 *
 * Tests:
 * 1. Markdown format parsing (## Task, ### Sub-task)
 * 2. Checklist format parsing (- [ ] Task)
 * 3. Dependency extraction
 * 4. Hierarchy edge generation
 * 5. Metadata calculation
 */

import { TaskHierarchyParser } from './dist/utils/utils/task-hierarchy-parser.js';

console.log('📋 Testing Task Hierarchy Parser\n');
console.log('═'.repeat(60));

const parser = new TaskHierarchyParser();

// Test cases
const testCases = [
  {
    name: 'Markdown Format - Simple Tasks',
    issueNumber: 100,
    body: `
## Task 1: Database Design

Basic database schema for user authentication.

## Task 2: API Implementation
⚙️ Depends on: Task 1

REST API endpoints for auth.
`,
    expected: {
      nodeCount: 2,
      taskCount: 2,
      subtaskCount: 0,
      dependencyEdges: 1,
    },
  },
  {
    name: 'Markdown Format - With Sub-tasks',
    issueNumber: 101,
    body: `
## Task 1: Database Design

### Sub-task 1.1: Schema Definition
Define user and post tables.

### Sub-task 1.2: Migration Scripts
⚙️ Depends on: Sub-task 1.1

Create migration files.

## Task 2: API Implementation
⚙️ Depends on: Task 1

### Sub-task 2.1: Endpoints
Create POST /login and GET /user.

### Sub-task 2.2: Tests
⚙️ Depends on: Sub-task 2.1
`,
    expected: {
      nodeCount: 6,
      taskCount: 2,
      subtaskCount: 4,
      dependencyEdges: 3,
    },
  },
  {
    name: 'Checklist Format - Simple',
    issueNumber: 102,
    body: `
## Tasks

- [ ] Task 1: Database Setup
- [ ] Task 2: API Development (depends on Task 1)
- [x] Task 3: Frontend Implementation (depends on Task 2)
`,
    expected: {
      nodeCount: 3,
      taskCount: 3,
      subtaskCount: 0,
      dependencyEdges: 2,
    },
  },
  {
    name: 'Checklist Format - With Sub-tasks',
    issueNumber: 103,
    body: `
- [ ] Task 1: Backend Setup
  - [ ] Sub-task 1.1: Database Schema
  - [ ] Sub-task 1.2: Migrations (depends on 1.1)
- [ ] Task 2: API Development (depends on Task 1)
  - [ ] Sub-task 2.1: Endpoints
  - [x] Sub-task 2.2: Tests (depends on 2.1)
`,
    expected: {
      nodeCount: 6,
      taskCount: 2,
      subtaskCount: 4,
      dependencyEdges: 3,
    },
  },
  {
    name: 'No Tasks (Empty Body)',
    issueNumber: 104,
    body: `
Just a regular issue without any tasks.

This is a description.
`,
    expected: {
      nodeCount: 0,
      taskCount: 0,
      subtaskCount: 0,
      dependencyEdges: 0,
    },
  },
];

console.log('\n🧪 Running Test Cases\n');

let passed = 0;
let failed = 0;

for (const testCase of testCases) {
  console.log(`\n📋 Test: ${testCase.name}`);
  console.log(`  Issue #${testCase.issueNumber}`);

  const result = parser.parse(testCase.body, testCase.issueNumber);

  const actualTaskCount = result.nodes.filter((n) => n.type === 'task').length;
  const actualSubtaskCount = result.nodes.filter((n) => n.type === 'subtask').length;
  const actualDependencyEdges = result.edges.filter((e) => e.type === 'dependency').length;

  console.log(`  Nodes: ${result.nodes.length} (expected: ${testCase.expected.nodeCount})`);
  console.log(`  Tasks: ${actualTaskCount} (expected: ${testCase.expected.taskCount})`);
  console.log(`  Sub-tasks: ${actualSubtaskCount} (expected: ${testCase.expected.subtaskCount})`);
  console.log(`  Dependency Edges: ${actualDependencyEdges} (expected: ${testCase.expected.dependencyEdges})`);
  console.log(`  Metadata: ${result.metadata.totalTasks} tasks, ${result.metadata.completedTasks} completed`);

  // Verify expectations
  const nodeCountMatch = result.nodes.length === testCase.expected.nodeCount;
  const taskCountMatch = actualTaskCount === testCase.expected.taskCount;
  const subtaskCountMatch = actualSubtaskCount === testCase.expected.subtaskCount;
  const dependencyEdgesMatch = actualDependencyEdges === testCase.expected.dependencyEdges;

  if (nodeCountMatch && taskCountMatch && subtaskCountMatch && dependencyEdgesMatch) {
    console.log('  ✅ PASS');
    passed++;

    // Show sample nodes
    if (result.nodes.length > 0) {
      console.log('  Sample nodes:');
      result.nodes.slice(0, 2).forEach((node) => {
        console.log(`    - ${node.id} (${node.type}): ${node.data.title}`);
      });
    }
  } else {
    console.log('  ❌ FAIL');
    if (!nodeCountMatch) {
      console.log(`    Expected ${testCase.expected.nodeCount} nodes, got ${result.nodes.length}`);
    }
    if (!taskCountMatch) {
      console.log(`    Expected ${testCase.expected.taskCount} tasks, got ${actualTaskCount}`);
    }
    if (!subtaskCountMatch) {
      console.log(`    Expected ${testCase.expected.subtaskCount} subtasks, got ${actualSubtaskCount}`);
    }
    if (!dependencyEdgesMatch) {
      console.log(`    Expected ${testCase.expected.dependencyEdges} dependency edges, got ${actualDependencyEdges}`);
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

// Display parser capabilities
console.log('\n' + '═'.repeat(60));
console.log('📚 Supported Formats\n');

console.log('1. Markdown Format:');
console.log('   ## Task 1: Title');
console.log('   ### Sub-task 1.1: Subtitle');
console.log('   ⚙️ Depends on: Task 2\n');

console.log('2. Checklist Format:');
console.log('   - [ ] Task 1: Title');
console.log('   - [ ] Task 2: Title (depends on Task 1)');
console.log('     - [ ] Sub-task 2.1: Subtitle\n');

console.log('3. YAML Front Matter (requires gray-matter):');
console.log('   ---');
console.log('   tasks:');
console.log('     - id: task-1');
console.log('       title: Database Design');
console.log('   ---\n');

console.log('═'.repeat(60));
