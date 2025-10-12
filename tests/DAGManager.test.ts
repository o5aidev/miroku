/**
 * DAGManager Tests
 *
 * Tests for graph algorithms and DAG operations
 */

import { describe, it, expect } from 'vitest';
import { DAGManager } from '../agents/utils/dag-manager.js';
import { Task } from '../agents/types/index.js';

describe('DAGManager', () => {
  // Helper function to create mock tasks
  const createTask = (
    id: string,
    dependencies: string[] = [],
    estimatedDuration: number = 30
  ): Task => ({
    id,
    title: `Task ${id}`,
    description: `Description for ${id}`,
    type: 'feature',
    priority: 1,
    severity: 'Sev.3-Medium',
    impact: 'Medium',
    assignedAgent: 'CodeGenAgent',
    dependencies,
    estimatedDuration,
    status: 'idle',
  });

  describe('buildDAG', () => {
    it('should build DAG for independent tasks', () => {
      const tasks = [
        createTask('task-1'),
        createTask('task-2'),
        createTask('task-3'),
      ];

      const dag = DAGManager.buildDAG(tasks);

      expect(dag.nodes).toHaveLength(3);
      expect(dag.edges).toHaveLength(0);
      expect(dag.levels).toHaveLength(1);
      expect(dag.levels[0]).toHaveLength(3);
    });

    it('should build DAG with simple dependencies', () => {
      const tasks = [
        createTask('task-1'),
        createTask('task-2', ['task-1']),
        createTask('task-3', ['task-2']),
      ];

      const dag = DAGManager.buildDAG(tasks);

      expect(dag.nodes).toHaveLength(3);
      expect(dag.edges).toHaveLength(2);
      expect(dag.levels).toHaveLength(3);
      expect(dag.levels[0]).toEqual(['task-1']);
      expect(dag.levels[1]).toEqual(['task-2']);
      expect(dag.levels[2]).toEqual(['task-3']);
    });

    it('should handle parallel branches', () => {
      const tasks = [
        createTask('task-1'),
        createTask('task-2', ['task-1']),
        createTask('task-3', ['task-1']),
        createTask('task-4', ['task-2', 'task-3']),
      ];

      const dag = DAGManager.buildDAG(tasks);

      expect(dag.nodes).toHaveLength(4);
      expect(dag.edges).toHaveLength(4);
      expect(dag.levels).toHaveLength(3);
      expect(dag.levels[0]).toEqual(['task-1']);
      expect(dag.levels[1]).toContain('task-2');
      expect(dag.levels[1]).toContain('task-3');
      expect(dag.levels[2]).toEqual(['task-4']);
    });
  });

  describe('detectCycles', () => {
    it('should return false for acyclic graph', () => {
      const tasks = [
        createTask('task-1'),
        createTask('task-2', ['task-1']),
        createTask('task-3', ['task-2']),
      ];

      const dag = DAGManager.buildDAG(tasks);
      const hasCycles = DAGManager.detectCycles(dag);

      expect(hasCycles).toBe(false);
    });

    it('should detect simple cycle', () => {
      const tasks = [
        createTask('task-1', ['task-2']),
        createTask('task-2', ['task-1']),
      ];

      const dag = DAGManager.buildDAG(tasks);
      const hasCycles = DAGManager.detectCycles(dag);

      expect(hasCycles).toBe(true);
    });

    it('should detect complex cycle', () => {
      const tasks = [
        createTask('task-1'),
        createTask('task-2', ['task-1']),
        createTask('task-3', ['task-2']),
        createTask('task-4', ['task-3']),
        createTask('task-5', ['task-4', 'task-2']), // Creates cycle via task-2
      ];

      // Manually create cycle
      const dag = {
        nodes: tasks,
        edges: [
          { from: 'task-1', to: 'task-2' },
          { from: 'task-2', to: 'task-3' },
          { from: 'task-3', to: 'task-4' },
          { from: 'task-4', to: 'task-2' }, // Back edge creating cycle
        ],
        levels: [[]],
      };

      const hasCycles = DAGManager.detectCycles(dag);

      expect(hasCycles).toBe(true);
    });
  });

  describe('findCyclePath', () => {
    it('should return empty array for acyclic graph', () => {
      const tasks = [
        createTask('task-1'),
        createTask('task-2', ['task-1']),
      ];

      const dag = DAGManager.buildDAG(tasks);
      const cyclePath = DAGManager.findCyclePath(dag);

      expect(cyclePath).toEqual([]);
    });

    it('should find cycle path', () => {
      const tasks = [
        createTask('task-1'),
        createTask('task-2'),
      ];

      // Manually create cycle
      const dag = {
        nodes: tasks,
        edges: [
          { from: 'task-1', to: 'task-2' },
          { from: 'task-2', to: 'task-1' },
        ],
        levels: [[]],
      };

      const cyclePath = DAGManager.findCyclePath(dag);

      expect(cyclePath.length).toBeGreaterThan(0);
      expect(cyclePath).toContain('task-1');
      expect(cyclePath).toContain('task-2');
    });
  });

  describe('generateRecommendations', () => {
    it('should recommend high parallelism', () => {
      const tasks = [
        createTask('task-1'),
        createTask('task-2'),
        createTask('task-3'),
        createTask('task-4'),
      ];

      const dag = DAGManager.buildDAG(tasks);
      const recommendations = DAGManager.generateRecommendations(tasks, dag);

      expect(recommendations.some(r => r.includes('parallelism'))).toBe(true);
    });

    it('should recommend for critical tasks', () => {
      const criticalTask = createTask('task-1');
      criticalTask.severity = 'Sev.1-Critical';

      const tasks = [criticalTask, createTask('task-2')];

      const dag = DAGManager.buildDAG(tasks);
      const recommendations = DAGManager.generateRecommendations(tasks, dag);

      expect(recommendations.some(r => r.includes('critical'))).toBe(true);
    });

    it('should recommend for long tasks', () => {
      const tasks = [
        createTask('task-1', [], 120), // 2 hours
        createTask('task-2', [], 30),
      ];

      const dag = DAGManager.buildDAG(tasks);
      const recommendations = DAGManager.generateRecommendations(tasks, dag);

      expect(recommendations.some(r => r.includes('hour'))).toBe(true);
    });

    it('should recommend for dependency bottlenecks', () => {
      const tasks = [
        createTask('task-1'),
        createTask('task-2'),
        createTask('task-3'),
        createTask('task-4'),
        createTask('task-5', ['task-1', 'task-2', 'task-3', 'task-4']), // 4 dependencies
      ];

      const dag = DAGManager.buildDAG(tasks);
      const recommendations = DAGManager.generateRecommendations(tasks, dag);

      expect(recommendations.some(r => r.includes('bottleneck'))).toBe(true);
    });
  });

  describe('calculateCriticalPath', () => {
    it('should calculate for independent tasks', () => {
      const tasks = [
        createTask('task-1', [], 30),
        createTask('task-2', [], 30),
        createTask('task-3', [], 30),
      ];

      const dag = DAGManager.buildDAG(tasks);
      const criticalPath = DAGManager.calculateCriticalPath(tasks, dag);

      // All independent, so max is just one task's duration
      expect(criticalPath).toBe(30);
    });

    it('should calculate for sequential tasks', () => {
      const tasks = [
        createTask('task-1', [], 30),
        createTask('task-2', ['task-1'], 30),
        createTask('task-3', ['task-2'], 30),
      ];

      const dag = DAGManager.buildDAG(tasks);
      const criticalPath = DAGManager.calculateCriticalPath(tasks, dag);

      // Sequential: 30 + 30 + 30 = 90
      expect(criticalPath).toBe(90);
    });

    it('should calculate for parallel branches', () => {
      const tasks = [
        createTask('task-1', [], 10),
        createTask('task-2', ['task-1'], 20), // Branch 1: 10 + 20 = 30
        createTask('task-3', ['task-1'], 50), // Branch 2: 10 + 50 = 60 (critical)
      ];

      const dag = DAGManager.buildDAG(tasks);
      const criticalPath = DAGManager.calculateCriticalPath(tasks, dag);

      // Longest path is through task-3
      expect(criticalPath).toBe(60);
    });
  });

  describe('getStatistics', () => {
    it('should return correct statistics', () => {
      const tasks = [
        createTask('task-1', [], 30),
        createTask('task-2', ['task-1'], 30),
        createTask('task-3', ['task-1'], 30),
        createTask('task-4', ['task-2', 'task-3'], 30),
      ];

      const dag = DAGManager.buildDAG(tasks);
      const stats = DAGManager.getStatistics(tasks, dag);

      expect(stats.totalTasks).toBe(4);
      expect(stats.totalEdges).toBe(4);
      expect(stats.levels).toBe(3);
      expect(stats.maxParallelism).toBe(2); // task-2 and task-3 in parallel
      expect(stats.hasCycles).toBe(false);
      expect(stats.criticalPathDuration).toBe(90); // 30 + 30 + 30
    });
  });
});
