/**
 * Task Scheduler Tests
 *
 * Tests for priority-based scheduling with DAG dependencies
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { TaskScheduler } from '../../agents/coordinator/task-scheduler.js';
import type { TaskGroup } from '../../scripts/operations/task-grouper.js';

describe('TaskScheduler', () => {
  let scheduler: TaskScheduler;
  let testGroups: TaskGroup[];

  beforeEach(() => {
    testGroups = [
      {
        groupId: 'group-1',
        tasks: [
          {
            id: 'task-1',
            title: 'Task 1',
            description: 'Test',
            type: 'feature',
            priority: 1,
            dependencies: [],
          },
        ],
        agent: 'CodeGenAgent',
        priority: 1,
        estimatedDurationMs: 60000,
        worktreePath: '.worktrees/group-1',
        level: 0,
      },
      {
        groupId: 'group-2',
        tasks: [
          {
            id: 'task-2',
            title: 'Task 2',
            description: 'Test',
            type: 'feature',
            priority: 1,
            dependencies: ['task-1'],
          },
        ],
        agent: 'CodeGenAgent',
        priority: 1,
        estimatedDurationMs: 90000,
        worktreePath: '.worktrees/group-2',
        level: 1,
      },
      {
        groupId: 'group-3',
        tasks: [
          {
            id: 'task-3',
            title: 'Task 3',
            description: 'Test',
            type: 'test',
            priority: 2,
            dependencies: [],
          },
        ],
        agent: 'ReviewAgent',
        priority: 2,
        estimatedDurationMs: 30000,
        worktreePath: '.worktrees/group-3',
        level: 0,
      },
    ];

    scheduler = new TaskScheduler(testGroups);
  });

  describe('initialization', () => {
    it('should initialize with correct state', () => {
      const state = scheduler.getState();

      expect(state.status).toBe('idle');
      expect(state.totalGroups).toBe(3);
      expect(state.completedGroups).toBe(0);
      expect(state.runningGroups).toBe(0);
      expect(state.waitingGroups).toBe(3);
      expect(state.failedGroups).toBe(0);
    });

    it('should respect max concurrency config', () => {
      const scheduler = new TaskScheduler(testGroups, { maxConcurrency: 2 });
      const state = scheduler.getState();

      expect(state.maxConcurrency).toBe(2);
    });
  });

  describe('getNextGroup', () => {
    it('should return level 0 groups first', () => {
      const nextGroup = scheduler.getNextGroup();

      expect(nextGroup).not.toBeNull();
      expect(nextGroup!.level).toBe(0);
    });

    it('should prioritize high priority tasks', () => {
      const nextGroup = scheduler.getNextGroup();

      expect(nextGroup).not.toBeNull();
      // Priority 1 is higher priority than 2
      expect(nextGroup!.priority).toBe(1);
    });

    it('should return null when at max concurrency', () => {
      const scheduler = new TaskScheduler(testGroups, { maxConcurrency: 1 });

      // Start first group
      const first = scheduler.getNextGroup();
      expect(first).not.toBeNull();
      scheduler.startGroup(first!.groupId);

      // Should return null (at max concurrency)
      const second = scheduler.getNextGroup();
      expect(second).toBeNull();
    });

    it('should not return groups with unmet dependencies', () => {
      // Start and complete group-1
      const first = scheduler.getNextGroup();
      expect(first!.groupId).toBe('group-1');
      scheduler.startGroup(first!.groupId);

      // group-2 (level 1) should not be available yet
      const next = scheduler.getNextGroup();
      expect(next?.groupId).not.toBe('group-2');
    });

    it('should return null when no groups available', () => {
      // Complete all groups
      for (const group of testGroups) {
        scheduler.startGroup(group.groupId);
        scheduler.completeGroup(group.groupId);
      }

      const nextGroup = scheduler.getNextGroup();
      expect(nextGroup).toBeNull();
    });
  });

  describe('startGroup', () => {
    it('should mark group as running', () => {
      const group = scheduler.getNextGroup();
      scheduler.startGroup(group!.groupId);

      const state = scheduler.getState();
      expect(state.runningGroups).toBe(1);
      expect(state.waitingGroups).toBe(2);
      expect(state.status).toBe('running');
    });

    it('should throw error for non-waiting group', () => {
      const group = scheduler.getNextGroup();
      scheduler.startGroup(group!.groupId);

      // Try to start same group again
      expect(() => scheduler.startGroup(group!.groupId)).toThrow();
    });
  });

  describe('completeGroup', () => {
    it('should mark group as completed', () => {
      const group = scheduler.getNextGroup();
      scheduler.startGroup(group!.groupId);
      scheduler.completeGroup(group!.groupId);

      const state = scheduler.getState();
      expect(state.completedGroups).toBe(1);
      expect(state.runningGroups).toBe(0);
    });

    it('should update status to completed when all done', () => {
      // Complete all groups
      for (const group of testGroups) {
        scheduler.startGroup(group.groupId);
        scheduler.completeGroup(group.groupId);
      }

      const state = scheduler.getState();
      expect(state.status).toBe('completed');
      expect(state.completedGroups).toBe(3);
    });
  });

  describe('failGroup', () => {
    it('should retry group if under max retries', () => {
      const scheduler = new TaskScheduler(testGroups, { maxRetries: 2 });

      const group = scheduler.getNextGroup();
      scheduler.startGroup(group!.groupId);
      scheduler.failGroup(group!.groupId, 'Test error');

      const state = scheduler.getState();
      // Should be back in waiting state for retry
      expect(state.waitingGroups).toBeGreaterThan(0);
      expect(state.runningGroups).toBe(0);
      expect(state.failedGroups).toBe(0);
    });

    it('should mark as failed after max retries', () => {
      const scheduler = new TaskScheduler(testGroups, { maxRetries: 0 });

      const group = scheduler.getNextGroup();
      scheduler.startGroup(group!.groupId);
      scheduler.failGroup(group!.groupId, 'Test error');

      const state = scheduler.getState();
      expect(state.failedGroups).toBe(1);
      expect(state.runningGroups).toBe(0);
    });

    it('should set status to failed when all done with failures', () => {
      const scheduler = new TaskScheduler(testGroups, { maxRetries: 0 });

      // Fail all groups
      for (const group of testGroups) {
        scheduler.startGroup(group.groupId);
        scheduler.failGroup(group.groupId, 'Test error');
      }

      const state = scheduler.getState();
      expect(state.status).toBe('failed');
      expect(state.failedGroups).toBe(3);
    });
  });

  describe('getProgress', () => {
    it('should return 0 when no groups completed', () => {
      const progress = scheduler.getProgress();
      expect(progress).toBe(0);
    });

    it('should return correct percentage', () => {
      const group = scheduler.getNextGroup();
      scheduler.startGroup(group!.groupId);
      scheduler.completeGroup(group!.groupId);

      const progress = scheduler.getProgress();
      expect(progress).toBeCloseTo(33.33, 1); // 1 of 3 groups
    });

    it('should return 100 when all completed', () => {
      for (const group of testGroups) {
        scheduler.startGroup(group.groupId);
        scheduler.completeGroup(group.groupId);
      }

      const progress = scheduler.getProgress();
      expect(progress).toBe(100);
    });
  });

  describe('getEstimatedTimeRemaining', () => {
    it('should return null when no groups completed', () => {
      const remaining = scheduler.getEstimatedTimeRemaining();
      expect(remaining).toBeNull();
    });

    it('should estimate time based on completed groups', () => {
      const group = scheduler.getNextGroup();
      scheduler.startGroup(group!.groupId);

      // Wait a bit
      setTimeout(() => {
        scheduler.completeGroup(group!.groupId);

        const remaining = scheduler.getEstimatedTimeRemaining();
        expect(remaining).toBeGreaterThan(0);
      }, 10);
    });
  });

  describe('hasWorkRemaining', () => {
    it('should return true when work remaining', () => {
      expect(scheduler.hasWorkRemaining()).toBe(true);
    });

    it('should return true when groups are running', () => {
      const group = scheduler.getNextGroup();
      scheduler.startGroup(group!.groupId);

      expect(scheduler.hasWorkRemaining()).toBe(true);
    });

    it('should return false when all completed', () => {
      for (const group of testGroups) {
        scheduler.startGroup(group.groupId);
        scheduler.completeGroup(group.groupId);
      }

      expect(scheduler.hasWorkRemaining()).toBe(false);
    });
  });

  describe('canAcceptWork', () => {
    it('should return true when slots available', () => {
      // Status is idle initially, not running
      const group = scheduler.getNextGroup();
      scheduler.startGroup(group!.groupId);

      // Now status should be running
      expect(scheduler.canAcceptWork()).toBe(true);
    });

    it('should return false when at max concurrency', () => {
      const scheduler = new TaskScheduler(testGroups, { maxConcurrency: 1 });

      const group = scheduler.getNextGroup();
      scheduler.startGroup(group!.groupId);

      expect(scheduler.canAcceptWork()).toBe(false);
    });
  });

  describe('generateProgressSummary', () => {
    it('should generate formatted summary', () => {
      const summary = scheduler.generateProgressSummary();

      expect(summary).toContain('Scheduler Progress');
      expect(summary).toContain('Status:');
      expect(summary).toContain('Progress:');
      expect(summary).toContain('Groups:');
      expect(summary).toContain('Timing:');
      expect(summary).toContain('Concurrency:');
    });

    it('should show progress percentage', () => {
      const group = scheduler.getNextGroup();
      scheduler.startGroup(group!.groupId);
      scheduler.completeGroup(group!.groupId);

      const summary = scheduler.generateProgressSummary();
      expect(summary).toContain('33.3%'); // 1 of 3
    });
  });

  describe('getFailedGroups', () => {
    it('should return empty array when no failures', () => {
      const failed = scheduler.getFailedGroups();
      expect(failed).toHaveLength(0);
    });

    it('should return failed groups', () => {
      const scheduler = new TaskScheduler(testGroups, { maxRetries: 0 });

      const group = scheduler.getNextGroup();
      scheduler.startGroup(group!.groupId);
      scheduler.failGroup(group!.groupId, 'Test error');

      const failed = scheduler.getFailedGroups();
      expect(failed).toHaveLength(1);
      expect(failed[0].status).toBe('failed');
      expect(failed[0].error).toBe('Test error');
    });
  });

  describe('pause and resume', () => {
    it('should pause scheduler', () => {
      const group = scheduler.getNextGroup();
      scheduler.startGroup(group!.groupId);

      scheduler.pause();

      const state = scheduler.getState();
      expect(state.status).toBe('paused');
    });

    it('should resume scheduler', () => {
      const group = scheduler.getNextGroup();
      scheduler.startGroup(group!.groupId);

      scheduler.pause();
      scheduler.resume();

      const state = scheduler.getState();
      expect(state.status).toBe('running');
    });
  });
});
