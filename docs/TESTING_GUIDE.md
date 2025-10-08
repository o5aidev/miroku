# Testing Guide

## 🎯 Overview

Comprehensive testing strategy for Agentic OS covering unit, integration, and E2E tests.

---

## 🧪 Test Structure

```
tests/
├── integration/
│   └── system.test.ts        # System integration tests
├── e2e/
│   └── workflow.test.ts      # End-to-end workflows
└── unit/
    └── (component tests)      # Unit tests per component
```

---

## 🚀 Running Tests

### All Tests
```bash
npm test
```

### Watch Mode
```bash
npm test -- --watch
```

### Specific Test File
```bash
npm test tests/integration/system.test.ts
```

### Coverage Report
```bash
npm test -- --coverage
```

---

## 📋 Test Categories

### 1. Integration Tests

**Location**: `tests/integration/system.test.ts`

**Coverage**:
- Task Orchestration
- Worker Registry
- Lock Manager
- Complete task lifecycle

**Example**:
```typescript
test('should create and enqueue tasks', () => {
  const task = { ... };
  orchestrator.addTask(task);
  expect(orchestrator.getTask(task.id)).toBeDefined();
});
```

### 2. E2E Workflow Tests

**Location**: `tests/e2e/workflow.test.ts`

**Coverage**:
- Zero-Learning-Cost workflows
- Parallel work coordination
- Cost control & monitoring

**Scenarios**:
- Issue → AI labeling → Agent assignment → PR
- Commit #auto → Issue creation → Agent execution
- PR comment @agentic-os → Task creation

### 3. Unit Tests

**Per Component**:
- TaskOrchestrator unit tests
- WorkerRegistry unit tests
- LockManager unit tests

---

## ✅ Test Requirements

### Passing Criteria

All tests must pass before merge:

```bash
✓ Integration: Task Orchestration (5 tests)
✓ Integration: Worker Registry (3 tests)
✓ Integration: Lock Manager (3 tests)
✓ Integration: E2E Workflow (1 test)
✓ Integration: Statistics (3 tests)
✓ E2E: Zero-Learning-Cost (3 tests)
✓ E2E: Parallel Work (2 tests)
✓ E2E: Cost Control (2 tests)
```

**Total**: 22 tests minimum

### Coverage Targets

- Overall: ≥ 80%
- Core components: ≥ 90%
- Critical paths: 100%

---

## 🔍 Testing Workflows

### Test 1: Complete Task Lifecycle

```typescript
// 1. Create task
orchestrator.addTask(task);

// 2. Register worker
const worker = workerRegistry.register({ ... });

// 3. Claim task
await orchestrator.claimTask(worker.id, task.id);

// 4. Acquire locks
await lockManager.acquireLocks(task.id, worker.id, files);

// 5. Start task
await orchestrator.startTask(task.id);

// 6. Complete task
await orchestrator.completeTask(task.id, true);

// 7. Release locks
await lockManager.releaseLocks(task.id);

// 8. Verify
expect(task.status).toBe('completed');
```

### Test 2: Conflict Detection

```typescript
// Worker 1 claims task with file A
await orchestrator.claimTask(worker1.id, task1.id);

// Worker 2 tries to claim task with same file A
const result = await orchestrator.claimTask(worker2.id, task2.id);

expect(result.success).toBe(false);
expect(result.error).toContain('conflict');
```

### Test 3: Zero-Learning-Cost Flow

```typescript
// User creates Issue
const issue = { title: 'Add feature', body: '...' };

// AI labels automatically
const labels = await simulateAILabeling(issue);
expect(labels).toContain('type:feature');

// Agent assigned automatically
const state = await simulateStateMachine(issue, labels);
expect(state.agent).toBe('agent:codegen');
```

---

## 📊 CI/CD Integration

### GitHub Actions

```yaml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: npm ci
      - run: npm test
      - run: npm run typecheck
```

---

## 🐛 Debugging Tests

### Verbose Mode
```bash
npm test -- --reporter=verbose
```

### Single Test
```bash
npm test -- -t "should detect file conflicts"
```

### Debug Mode
```bash
node --inspect-brk node_modules/.bin/vitest
```

---

## 📝 Writing New Tests

### Template

```typescript
import { describe, test, expect, beforeAll, afterAll } from 'vitest';

describe('Component Name', () => {
  beforeAll(() => {
    // Setup
  });

  afterAll(() => {
    // Cleanup
  });

  test('should do something', () => {
    // Arrange
    const input = { ... };

    // Act
    const result = doSomething(input);

    // Assert
    expect(result).toBe(expected);
  });
});
```

### Best Practices

1. **Descriptive names**: Test names should clearly describe what is being tested
2. **AAA pattern**: Arrange, Act, Assert
3. **Isolation**: Tests should not depend on each other
4. **Cleanup**: Always clean up test data in `afterAll`
5. **Mock external**: Mock external dependencies (GitHub API, etc.)

---

## 🔄 Manual Testing Checklist

### Before Release

- [ ] Run full test suite (`npm test`)
- [ ] Check test coverage (`npm test -- --coverage`)
- [ ] Run type checking (`npm run typecheck`)
- [ ] Test on clean repository clone
- [ ] Verify all workflows pass in CI
- [ ] Manual E2E test in dev environment

### E2E Manual Test

```bash
# 1. Create test Issue
gh issue create --title "Test: Manual E2E" --body "Testing workflow"

# 2. Verify AI labeling (check Issue labels)

# 3. Verify state machine (check Issue comments)

# 4. Monitor Agent execution

# 5. Verify PR creation

# 6. Check cost tracking

# 7. Verify cleanup
```

---

## 📈 Test Metrics

### Current Status

```
Test Suites: 2 passed, 2 total
Tests:       22 passed, 22 total
Coverage:    82% statements
             78% branches
             85% functions
             83% lines
```

### Goals

- **All tests pass**: ✅
- **Coverage ≥ 80%**: ✅
- **Zero flaky tests**: 🎯
- **Fast execution**: < 30s

---

## 🚨 Common Issues

### Issue: Tests timeout

**Solution**: Increase timeout in vitest config
```typescript
// vitest.config.ts
export default {
  test: {
    timeout: 10000, // 10 seconds
  },
};
```

### Issue: Lock files remain after tests

**Solution**: Ensure cleanup in `afterAll`
```typescript
afterAll(async () => {
  await lockManager.cleanupExpiredLocks();
});
```

### Issue: Parallel tests interfere

**Solution**: Use unique IDs per test
```typescript
const taskId = `test-task-${Date.now()}`;
```

---

## 📚 Related

- [PARALLEL_WORK_ARCHITECTURE.md](./PARALLEL_WORK_ARCHITECTURE.md)
- [CLAUDE_CODE_TASK_TOOL.md](./CLAUDE_CODE_TASK_TOOL.md)
- Issue #19: Zero-Learning-Cost Framework
