/**
 * IssueAnalyzer Priority Detection Test
 *
 * Tests the priority determination logic for GitHub Issues
 */

import { IssueAnalyzer } from '../utils/issue-analyzer';
import { Issue } from '../types/index';

// Test utilities
function assert(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(`❌ Assertion failed: ${message}`);
  }
}

function assertEqual<T>(actual: T, expected: T, message: string): void {
  if (actual !== expected) {
    throw new Error(`❌ ${message}\n   Expected: ${expected}\n   Actual: ${actual}`);
  }
}

// ============================================================================
// Priority Detection Tests
// ============================================================================

console.log('\n🧪 IssueAnalyzer Priority Detection Tests\n');

// Test 1: P0-Critical label detection
(() => {
  const labels = ['priority:P0-Critical', 'type:bug'];
  const priority = IssueAnalyzer.determinePriority(labels, 'Critical bug', '');
  assertEqual(priority, 0, 'P0-Critical label should return priority 0');
  console.log('✅ Test 1 passed: P0-Critical label detection');
})();

// Test 2: P1-High label detection
(() => {
  const labels = ['priority:P1-High', 'type:feature'];
  const priority = IssueAnalyzer.determinePriority(labels, 'Important feature', '');
  assertEqual(priority, 1, 'P1-High label should return priority 1');
  console.log('✅ Test 2 passed: P1-High label detection');
})();

// Test 3: P2-Normal label detection
(() => {
  const labels = ['priority:P2-Normal', 'type:refactor'];
  const priority = IssueAnalyzer.determinePriority(labels, 'Code refactoring', '');
  assertEqual(priority, 2, 'P2-Normal label should return priority 2');
  console.log('✅ Test 3 passed: P2-Normal label detection');
})();

// Test 4: P3-Low label detection
(() => {
  const labels = ['priority:P3-Low', 'type:docs'];
  const priority = IssueAnalyzer.determinePriority(labels, 'Update docs', '');
  assertEqual(priority, 3, 'P3-Low label should return priority 3');
  console.log('✅ Test 4 passed: P3-Low label detection');
})();

// Test 5: Keyword-based P0 detection (critical)
(() => {
  const labels: string[] = [];
  const priority = IssueAnalyzer.determinePriority(
    labels,
    'Critical production outage',
    'This is a critical emergency that needs immediate attention'
  );
  assertEqual(priority, 0, 'Critical keywords should return priority 0');
  console.log('✅ Test 5 passed: Keyword-based P0 detection (critical)');
})();

// Test 6: Keyword-based P0 detection (urgent)
(() => {
  const labels: string[] = [];
  const priority = IssueAnalyzer.determinePriority(
    labels,
    'Urgent bug fix required',
    'This is blocking production deployment'
  );
  assertEqual(priority, 0, 'Urgent/blocking keywords should return priority 0');
  console.log('✅ Test 6 passed: Keyword-based P0 detection (urgent)');
})();

// Test 7: Keyword-based P1 detection
(() => {
  const labels: string[] = [];
  const priority = IssueAnalyzer.determinePriority(
    labels,
    'High priority feature request',
    'This is important and should be done ASAP'
  );
  assertEqual(priority, 1, 'High priority keywords should return priority 1');
  console.log('✅ Test 7 passed: Keyword-based P1 detection');
})();

// Test 8: Keyword-based P3 detection
(() => {
  const labels: string[] = [];
  const priority = IssueAnalyzer.determinePriority(
    labels,
    'Nice to have enhancement',
    'This is a low priority feature that can be done later'
  );
  assertEqual(priority, 3, 'Low priority keywords should return priority 3');
  console.log('✅ Test 8 passed: Keyword-based P3 detection');
})();

// Test 9: Default priority (P2) when no indicators
(() => {
  const labels: string[] = [];
  const priority = IssueAnalyzer.determinePriority(
    labels,
    'Regular feature request',
    'Implement feature X'
  );
  assertEqual(priority, 2, 'Default priority should be 2 (P2-Normal)');
  console.log('✅ Test 9 passed: Default priority (P2)');
})();

// Test 10: Label takes precedence over keywords
(() => {
  const labels = ['priority:P3-Low'];
  const priority = IssueAnalyzer.determinePriority(
    labels,
    'Critical bug',
    'This is urgent and critical'
  );
  assertEqual(priority, 3, 'Label should take precedence over keywords');
  console.log('✅ Test 10 passed: Label precedence over keywords');
})();

// Test 11: determinePriorityFromIssue() helper
(() => {
  const issue: Issue = {
    number: 123,
    title: 'Critical security vulnerability',
    body: 'This is an emergency security issue',
    state: 'open',
    labels: [],
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
    url: 'https://github.com/test/test/issues/123',
  };

  const priority = IssueAnalyzer.determinePriorityFromIssue(issue);
  assertEqual(priority, 0, 'Security vulnerability should be P0 priority');
  console.log('✅ Test 11 passed: determinePriorityFromIssue() helper');
})();

// ============================================================================
// Integration Test: Multiple Issues with Different Priorities
// ============================================================================

console.log('\n🔄 Integration Test: Multiple Issues\n');

(() => {
  const issues: Issue[] = [
    {
      number: 270,
      title: 'Production database corruption',
      body: 'Critical issue affecting all users',
      state: 'open',
      labels: ['priority:P0-Critical', 'type:bug'],
      createdAt: '2025-01-01T00:00:00Z',
      updatedAt: '2025-01-01T00:00:00Z',
      url: 'https://github.com/test/test/issues/270',
    },
    {
      number: 271,
      title: 'Add new analytics feature',
      body: 'Important feature for product roadmap',
      state: 'open',
      labels: ['priority:P1-High', 'type:feature'],
      createdAt: '2025-01-01T00:00:00Z',
      updatedAt: '2025-01-01T00:00:00Z',
      url: 'https://github.com/test/test/issues/271',
    },
    {
      number: 272,
      title: 'Update README documentation',
      body: 'Nice to have documentation update',
      state: 'open',
      labels: ['priority:P3-Low', 'type:docs'],
      createdAt: '2025-01-01T00:00:00Z',
      updatedAt: '2025-01-01T00:00:00Z',
      url: 'https://github.com/test/test/issues/272',
    },
    {
      number: 273,
      title: 'Refactor authentication module',
      body: 'Regular code cleanup task',
      state: 'open',
      labels: ['priority:P2-Normal', 'type:refactor'],
      createdAt: '2025-01-01T00:00:00Z',
      updatedAt: '2025-01-01T00:00:00Z',
      url: 'https://github.com/test/test/issues/273',
    },
  ];

  const priorities = issues.map((issue) => ({
    number: issue.number,
    priority: IssueAnalyzer.determinePriorityFromIssue(issue),
  }));

  // Expected order: 270 (P0), 271 (P1), 273 (P2), 272 (P3)
  assertEqual(priorities[0].priority, 0, 'Issue #270 should be P0');
  assertEqual(priorities[1].priority, 1, 'Issue #271 should be P1');
  assertEqual(priorities[2].priority, 3, 'Issue #272 should be P3');
  assertEqual(priorities[3].priority, 2, 'Issue #273 should be P2');

  // Sort by priority (lower = higher priority)
  const sorted = [...priorities].sort((a, b) => a.priority - b.priority);

  console.log('   Priority order (sorted):');
  sorted.forEach((item, idx) => {
    const priorityLabels = ['🔥 P0-Critical', '🚨 P1-High', '📌 P2-Normal', '📝 P3-Low'];
    console.log(`      ${idx + 1}. Issue #${item.number} - ${priorityLabels[item.priority]}`);
  });

  assertEqual(sorted[0].number, 270, 'Issue #270 should be first (P0)');
  assertEqual(sorted[1].number, 271, 'Issue #271 should be second (P1)');
  assertEqual(sorted[2].number, 273, 'Issue #273 should be third (P2)');
  assertEqual(sorted[3].number, 272, 'Issue #272 should be fourth (P3)');

  console.log('✅ Integration test passed: Multiple issues sorted correctly');
})();

// ============================================================================
// Edge Cases
// ============================================================================

console.log('\n🔧 Edge Case Tests\n');

// Test 12: Empty labels and content
(() => {
  const priority = IssueAnalyzer.determinePriority([], '', '');
  assertEqual(priority, 2, 'Empty input should return default priority (P2)');
  console.log('✅ Test 12 passed: Empty labels and content');
})();

// Test 13: Case insensitivity
(() => {
  const priority = IssueAnalyzer.determinePriority(
    [],
    'CRITICAL BUG',
    'THIS IS URGENT AND BLOCKING'
  );
  assertEqual(priority, 0, 'Keywords should be case insensitive');
  console.log('✅ Test 13 passed: Case insensitivity');
})();

// Test 14: Multiple priority keywords (first match wins)
(() => {
  const priority = IssueAnalyzer.determinePriority(
    [],
    'Critical bug with nice to have improvement',
    'This is critical and urgent but also a nice to have'
  );
  assertEqual(priority, 0, 'First matching keyword (critical) should win');
  console.log('✅ Test 14 passed: Multiple priority keywords');
})();

// ============================================================================
// Summary
// ============================================================================

console.log('\n✅ All tests passed!\n');
console.log('📊 Summary:');
console.log('   - Label-based detection: 4 tests ✅');
console.log('   - Keyword-based detection: 4 tests ✅');
console.log('   - Helper methods: 1 test ✅');
console.log('   - Integration test: 1 test ✅');
console.log('   - Edge cases: 3 tests ✅');
console.log('   - Total: 14 tests ✅\n');
