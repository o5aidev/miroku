/**
 * Task Grouper Tests
 *
 * Tests for task grouping algorithm for parallel execution
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { TaskGrouper } from '../../scripts/operations/task-grouper.js';
import type { Task, DAG } from '../../agents/types/index.js';

describe('TaskGrouper', () => {
  let grouper: TaskGrouper;

  beforeEach(() => {
    grouper = new TaskGrouper();
  });

  describe('groupTasks', () => {
    it('should group tasks by DAG level and agent type', () => {
      const tasks: Task[] = [
        {
          id: 'task-1',
          title: 'Task 1',
          description: 'Test task 1',
          type: 'feature',
          priority: 1,
          assignedAgent: 'CodeGenAgent',
          dependencies: [],
          estimatedDuration: 10,
        },
        {
          id: 'task-2',
          title: 'Task 2',
          description: 'Test task 2',
          type: 'feature',
          priority: 1,
          assignedAgent: 'CodeGenAgent',
          dependencies: ['task-1'],
          estimatedDuration: 15,
        },
        {
          id: 'task-3',
          title: 'Task 3',
          description: 'Test task 3',
          type: 'test',
          priority: 2,
          assignedAgent: 'ReviewAgent',
          dependencies: [],
          estimatedDuration: 5,
        },
      ];

      const dag: DAG = {
        nodes: tasks,
        edges: [{ from: 'task-1', to: 'task-2' }],
        levels: [
          ['task-1', 'task-3'], // Level 0
          ['task-2'],            // Level 1
        ],
      };

      const groups = grouper.groupTasks(tasks, dag, '.worktrees');

      expect(groups.length).toBeGreaterThan(0);

      // Check that all tasks are included
      const allTaskIds = groups.flatMap(g => g.tasks.map(t => t.id));
      expect(allTaskIds).toContain('task-1');
      expect(allTaskIds).toContain('task-2');
      expect(allTaskIds).toContain('task-3');

      // Check that tasks are grouped by level
      const level0Groups = groups.filter(g => g.level === 0);
      const level1Groups = groups.filter(g => g.level === 1);

      expect(level0Groups.length).toBeGreaterThan(0);
      expect(level1Groups.length).toBeGreaterThan(0);
    });

    it('should create single group for small task set', () => {
      const tasks: Task[] = [
        {
          id: 'task-1',
          title: 'Task 1',
          description: 'Test',
          type: 'feature',
          priority: 1,
          assignedAgent: 'CodeGenAgent',
          dependencies: [],
          estimatedDuration: 10,
        },
        {
          id: 'task-2',
          title: 'Task 2',
          description: 'Test',
          type: 'feature',
          priority: 1,
          assignedAgent: 'CodeGenAgent',
          dependencies: [],
          estimatedDuration: 10,
        },
      ];

      const dag: DAG = {
        nodes: tasks,
        edges: [],
        levels: [['task-1', 'task-2']],
      };

      const groups = grouper.groupTasks(tasks, dag, '.worktrees');

      // Should create single group for 2 tasks (under maxGroupSize)
      expect(groups.length).toBe(1);
      expect(groups[0].tasks.length).toBe(2);
    });

    it('should split large task sets into balanced groups', () => {
      const tasks: Task[] = Array.from({ length: 25 }, (_, i) => ({
        id: `task-${i + 1}`,
        title: `Task ${i + 1}`,
        description: 'Test',
        type: 'feature' as const,
        priority: 1,
        assignedAgent: 'CodeGenAgent' as const,
        dependencies: [],
        estimatedDuration: 10,
      }));

      const dag: DAG = {
        nodes: tasks,
        edges: [],
        levels: [tasks.map(t => t.id)],
      };

      const groups = grouper.groupTasks(tasks, dag, '.worktrees');

      // Should split into multiple groups (maxGroupSize = 10)
      expect(groups.length).toBeGreaterThan(1);

      // Check that all tasks are included
      const totalTasks = groups.reduce((sum, g) => sum + g.tasks.length, 0);
      expect(totalTasks).toBe(25);

      // Check that groups are balanced
      for (const group of groups) {
        expect(group.tasks.length).toBeLessThanOrEqual(10);
      }
    });

    it('should separate tasks by agent type', () => {
      const tasks: Task[] = [
        {
          id: 'task-1',
          title: 'Code task',
          description: 'Test',
          type: 'feature',
          priority: 1,
          assignedAgent: 'CodeGenAgent',
          dependencies: [],
          estimatedDuration: 10,
        },
        {
          id: 'task-2',
          title: 'Review task',
          description: 'Test',
          type: 'test',
          priority: 1,
          assignedAgent: 'ReviewAgent',
          dependencies: [],
          estimatedDuration: 10,
        },
      ];

      const dag: DAG = {
        nodes: tasks,
        edges: [],
        levels: [['task-1', 'task-2']],
      };

      const groups = grouper.groupTasks(tasks, dag, '.worktrees');

      // Should create separate groups for different agent types
      const codeGenGroups = groups.filter(g => g.agent === 'CodeGenAgent');
      const reviewGroups = groups.filter(g => g.agent === 'ReviewAgent');

      expect(codeGenGroups.length).toBe(1);
      expect(reviewGroups.length).toBe(1);
    });

    it('should calculate estimated duration for groups', () => {
      const tasks: Task[] = [
        {
          id: 'task-1',
          title: 'Task 1',
          description: 'Test',
          type: 'feature',
          priority: 1,
          assignedAgent: 'CodeGenAgent',
          dependencies: [],
          estimatedDuration: 10, // minutes
        },
        {
          id: 'task-2',
          title: 'Task 2',
          description: 'Test',
          type: 'feature',
          priority: 1,
          assignedAgent: 'CodeGenAgent',
          dependencies: [],
          estimatedDuration: 20, // minutes
        },
      ];

      const dag: DAG = {
        nodes: tasks,
        edges: [],
        levels: [['task-1', 'task-2']],
      };

      const groups = grouper.groupTasks(tasks, dag, '.worktrees');

      // Should sum task durations (converted to ms)
      expect(groups[0].estimatedDurationMs).toBe(30 * 60000); // 30 minutes in ms
    });
  });

  describe('calculateOptimalConcurrency', () => {
    it('should return positive concurrency value', () => {
      const tasks: Task[] = [
        {
          id: 'task-1',
          title: 'Task 1',
          description: 'Test',
          type: 'feature',
          priority: 1,
          assignedAgent: 'CodeGenAgent',
          dependencies: [],
        },
      ];

      const dag: DAG = {
        nodes: tasks,
        edges: [],
        levels: [['task-1']],
      };

      const groups = grouper.groupTasks(tasks, dag, '.worktrees');
      const concurrency = grouper.calculateOptimalConcurrency(groups);

      expect(concurrency).toBeGreaterThan(0);
      expect(Number.isInteger(concurrency)).toBe(true);
    });

    it('should not exceed max concurrent groups config', () => {
      const grouper = new TaskGrouper({ maxConcurrentGroups: 3 });

      const tasks: Task[] = Array.from({ length: 20 }, (_, i) => ({
        id: `task-${i + 1}`,
        title: `Task ${i + 1}`,
        description: 'Test',
        type: 'feature' as const,
        priority: 1,
        assignedAgent: 'CodeGenAgent' as const,
        dependencies: [],
      }));

      const dag: DAG = {
        nodes: tasks,
        edges: [],
        levels: [tasks.map(t => t.id)],
      };

      const groups = grouper.groupTasks(tasks, dag, '.worktrees');
      const concurrency = grouper.calculateOptimalConcurrency(groups);

      expect(concurrency).toBeLessThanOrEqual(3);
    });
  });

  describe('validateGroups', () => {
    it('should validate correct groups', () => {
      const tasks: Task[] = [
        {
          id: 'task-1',
          title: 'Task 1',
          description: 'Test',
          type: 'feature',
          priority: 1,
          assignedAgent: 'CodeGenAgent',
          dependencies: [],
        },
      ];

      const dag: DAG = {
        nodes: tasks,
        edges: [],
        levels: [['task-1']],
      };

      const groups = grouper.groupTasks(tasks, dag, '.worktrees');
      const validation = grouper.validateGroups(groups);

      expect(validation.valid).toBe(true);
      expect(validation.errors).toHaveLength(0);
    });

    it('should detect empty groups', () => {
      const validation = grouper.validateGroups([
        {
          groupId: 'group-1',
          tasks: [],
          agent: 'CodeGenAgent',
          priority: 1,
          estimatedDurationMs: 0,
          worktreePath: '.worktrees/group-1',
          level: 0,
        },
      ]);

      expect(validation.valid).toBe(false);
      expect(validation.errors).toContain('Found 1 empty groups');
    });

    it('should warn about undersized groups', () => {
      const validation = grouper.validateGroups([
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
          estimatedDurationMs: 10000,
          worktreePath: '.worktrees/group-1',
          level: 0,
        },
      ]);

      // Should warn if < minGroupSize (default: 3)
      expect(validation.warnings.length).toBeGreaterThan(0);
      expect(validation.warnings[0]).toContain('below min size');
    });
  });

  describe('generateSummary', () => {
    it('should generate summary with task counts', () => {
      const tasks: Task[] = [
        {
          id: 'task-1',
          title: 'Task 1',
          description: 'Test',
          type: 'feature',
          priority: 1,
          assignedAgent: 'CodeGenAgent',
          dependencies: [],
          estimatedDuration: 10,
        },
        {
          id: 'task-2',
          title: 'Task 2',
          description: 'Test',
          type: 'feature',
          priority: 1,
          assignedAgent: 'CodeGenAgent',
          dependencies: [],
          estimatedDuration: 20,
        },
      ];

      const dag: DAG = {
        nodes: tasks,
        edges: [],
        levels: [['task-1', 'task-2']],
      };

      const groups = grouper.groupTasks(tasks, dag, '.worktrees');
      const summary = grouper.generateSummary(groups);

      expect(summary).toContain('Total Tasks: 2');
      expect(summary).toContain('Total Groups:');
      expect(summary).toContain('Optimal Concurrency:');
      expect(summary).toContain('Estimated Duration:');
    });

    it('should include agent breakdown', () => {
      const tasks: Task[] = [
        {
          id: 'task-1',
          title: 'Code task',
          description: 'Test',
          type: 'feature',
          priority: 1,
          assignedAgent: 'CodeGenAgent',
          dependencies: [],
        },
        {
          id: 'task-2',
          title: 'Review task',
          description: 'Test',
          type: 'test',
          priority: 1,
          assignedAgent: 'ReviewAgent',
          dependencies: [],
        },
      ];

      const dag: DAG = {
        nodes: tasks,
        edges: [],
        levels: [['task-1', 'task-2']],
      };

      const groups = grouper.groupTasks(tasks, dag, '.worktrees');
      const summary = grouper.generateSummary(groups);

      expect(summary).toContain('Groups by Agent:');
      expect(summary).toContain('CodeGenAgent');
      expect(summary).toContain('ReviewAgent');
    });
  });
});
