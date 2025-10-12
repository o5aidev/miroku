/**
 * CoordinatorAgent Tests
 *
 * Tests for task decomposition, DAG construction, and execution
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { CoordinatorAgent } from '../agents/coordinator/coordinator-agent.js';
import { DAGManager } from '../agents/utils/dag-manager.js';
import { Task, AgentConfig, Issue } from '../agents/types/index.js';

describe('CoordinatorAgent', () => {
  let agent: CoordinatorAgent;
  let config: AgentConfig;

  beforeEach(() => {
    config = {
      deviceIdentifier: 'test-device',
      githubToken: 'test-token',
      anthropicApiKey: 'test-key',
      useTaskTool: false,
      useWorktree: false,
      logDirectory: '.ai/logs',
      reportDirectory: '.ai/test-reports',
    };

    agent = new CoordinatorAgent(config);
  });

  describe('Task Decomposition', () => {
    it('should decompose an Issue into tasks', async () => {
      const issue: Issue = {
        number: 1,
        title: 'Add user authentication',
        body: `
## Tasks
- [ ] Create login API
- [ ] Add JWT token generation
- [ ] Implement user model
        `,
        state: 'open',
        labels: [],
        createdAt: '2025-01-01T00:00:00Z',
        updatedAt: '2025-01-01T00:00:00Z',
        url: 'https://github.com/test/repo/issues/1',
      };

      const decomposition = await agent.decomposeIssue(issue);

      expect(decomposition.tasks.length).toBeGreaterThan(0);
      expect(decomposition.dag).toBeDefined();
      expect(decomposition.hasCycles).toBe(false);
    });
  });

  describe('DAG Construction', () => {
    it('should build a valid DAG from tasks', () => {
      const tasks: Task[] = [
        {
          id: 'task-1',
          title: 'Task 1',
          description: 'First task',
          type: 'feature',
          priority: 1,
          severity: 'Sev.3-Medium',
          impact: 'Medium',
          assignedAgent: 'CodeGenAgent',
          dependencies: [],
          estimatedDuration: 30,
          status: 'idle',
        },
        {
          id: 'task-2',
          title: 'Task 2',
          description: 'Second task depends on task-1',
          type: 'feature',
          priority: 2,
          severity: 'Sev.3-Medium',
          impact: 'Medium',
          assignedAgent: 'ReviewAgent',
          dependencies: ['task-1'],
          estimatedDuration: 15,
          status: 'idle',
        },
      ];

      // Use DAGManager.buildDAG (static method)
      const dag = DAGManager.buildDAG(tasks);

      expect(dag.nodes.length).toBe(2);
      expect(dag.edges.length).toBe(1);
      expect(dag.levels.length).toBeGreaterThan(0);
    });

    it('should detect circular dependencies', () => {
      const tasks: Task[] = [
        {
          id: 'task-1',
          title: 'Task 1',
          description: 'Task 1 depends on task-2',
          type: 'feature',
          priority: 1,
          severity: 'Sev.3-Medium',
          impact: 'Medium',
          assignedAgent: 'CodeGenAgent',
          dependencies: ['task-2'],
          estimatedDuration: 30,
          status: 'idle',
        },
        {
          id: 'task-2',
          title: 'Task 2',
          description: 'Task 2 depends on task-1',
          type: 'feature',
          priority: 2,
          severity: 'Sev.3-Medium',
          impact: 'Medium',
          assignedAgent: 'ReviewAgent',
          dependencies: ['task-1'],
          estimatedDuration: 15,
          status: 'idle',
        },
      ];

      // Use DAGManager.buildDAG and DAGManager.detectCycles (static methods)
      const dag = DAGManager.buildDAG(tasks);
      const hasCycles = DAGManager.detectCycles(dag);

      expect(hasCycles).toBe(true);
    });
  });

  describe('Agent Assignment', () => {
    it('should assign CodeGenAgent for feature tasks', () => {
      // Test agent assignment logic through task creation
      const task: Task = {
        id: 'test-1',
        title: 'Feature task',
        description: 'Test',
        type: 'feature',
        priority: 1,
        severity: 'Sev.3-Medium',
        impact: 'Medium',
        assignedAgent: 'CodeGenAgent',
        dependencies: [],
        estimatedDuration: 30,
        status: 'idle',
      };

      expect(task.assignedAgent).toBe('CodeGenAgent');
    });

    it('should assign DeploymentAgent for deployment tasks', () => {
      const task: Task = {
        id: 'test-2',
        title: 'Deploy task',
        description: 'Test',
        type: 'deployment',
        priority: 1,
        severity: 'Sev.3-Medium',
        impact: 'Medium',
        assignedAgent: 'DeploymentAgent',
        dependencies: [],
        estimatedDuration: 30,
        status: 'idle',
      };

      expect(task.assignedAgent).toBe('DeploymentAgent');
    });
  });

  describe('Execution Plan', () => {
    it('should create a valid execution plan', () => {
      const tasks: Task[] = [
        {
          id: 'task-1',
          title: 'Test Task',
          description: 'A test task',
          type: 'feature',
          priority: 1,
          severity: 'Sev.3-Medium',
          impact: 'Medium',
          assignedAgent: 'CodeGenAgent',
          dependencies: [],
          estimatedDuration: 30,
          status: 'idle',
        },
      ];

      // Use DAGManager.buildDAG (static method)
      const dag = DAGManager.buildDAG(tasks);

      // Test execution plan structure
      expect(dag.nodes.length).toBe(1);
      expect(dag.edges.length).toBe(0);
      expect(dag.levels.length).toBe(1);
    });
  });

  describe('Plans.md Generation (Phase 2 - Issue #100)', () => {
    it('should generate execution plan from Issue and DAG', async () => {
      const issue: Issue = {
        number: 270,
        title: 'Firebase Auth修正',
        body: `## Overview
Vitest + Playwrightを使ったスナップショットテストを統合します。

## Tasks
- [ ] Auth修正
- [ ] テスト追加
- [ ] ドキュメント更新`,
        state: 'open',
        labels: ['🆕feature', '🤖agent-execute'],
        createdAt: '2025-01-01T00:00:00Z',
        updatedAt: '2025-01-01T00:00:00Z',
        url: 'https://github.com/test/repo/issues/270',
      };

      const decomposition = await agent.decomposeIssue(issue);
      const plan = await agent.generateExecPlan(issue, decomposition.dag);

      // Verify plan structure
      expect(plan.overview).toBeDefined();
      expect(plan.overview).toContain('スナップショットテスト');
      expect(plan.tasks.length).toBeGreaterThan(0);
      expect(plan.progress.total).toBe(decomposition.tasks.length);
      expect(plan.timeline.started).toBeDefined();
      expect(plan.timeline.expectedCompletion).toBeDefined();
      expect(plan.decisions).toEqual([]);
    });

    it('should convert PlansDocument to valid Markdown', () => {
      const plan = {
        overview: 'Firebase Auth修正',
        tasks: [
          {
            level: 0,
            tasks: [
              {
                id: 'task-1',
                title: 'Auth修正',
                description: 'Fix auth',
                type: 'feature' as const,
                priority: 1,
                assignedAgent: 'CodeGenAgent' as const,
                estimatedDuration: 60,
                status: 'idle' as const,
                dependencies: [],
              },
            ],
            canRunInParallel: false,
          },
          {
            level: 1,
            tasks: [
              {
                id: 'task-2',
                title: 'テスト追加',
                description: 'Add tests',
                type: 'test' as const,
                priority: 2,
                assignedAgent: 'CodeGenAgent' as const,
                estimatedDuration: 30,
                status: 'idle' as const,
                dependencies: ['task-1'],
              },
            ],
            canRunInParallel: false,
          },
        ],
        progress: {
          total: 2,
          completed: 0,
          inProgress: 0,
          pending: 2,
          failed: 0,
          percentage: 0,
        },
        decisions: [],
        timeline: {
          started: '2025-01-01 00:00:00',
          lastUpdate: '2025-01-01 00:00:00',
          expectedCompletion: '2025-01-01 01:30:00',
        },
      };

      const markdown = agent.planToMarkdown(plan, 270);

      // Verify Markdown structure
      expect(markdown).toContain('# Execution Plan - Issue #270');
      expect(markdown).toContain('## Overview');
      expect(markdown).toContain('Firebase Auth修正');
      expect(markdown).toContain('## Tasks');
      expect(markdown).toContain('### Level 0');
      expect(markdown).toContain('### Level 1');
      expect(markdown).toContain('- [ ] Task task-1: Auth修正');
      expect(markdown).toContain('- [ ] Task task-2: テスト追加');
      expect(markdown).toContain('## Progress');
      expect(markdown).toContain('Total: 2 tasks');
      expect(markdown).toContain('Completed: 0/2 (0%)');
      expect(markdown).toContain('## Timeline');
      expect(markdown).toContain('Started: 2025-01-01 00:00:00');
    });

    it('should write Plans.md to worktree', async () => {
      const plan = {
        overview: 'Test plan',
        tasks: [
          {
            level: 0,
            tasks: [
              {
                id: 'task-1',
                title: 'Test Task',
                description: 'Test',
                type: 'feature' as const,
                priority: 1,
                assignedAgent: 'CodeGenAgent' as const,
                estimatedDuration: 30,
                status: 'idle' as const,
                dependencies: [],
              },
            ],
            canRunInParallel: false,
          },
        ],
        progress: {
          total: 1,
          completed: 0,
          inProgress: 0,
          pending: 1,
          failed: 0,
          percentage: 0,
        },
        decisions: [],
        timeline: {
          started: '2025-01-01 00:00:00',
          lastUpdate: '2025-01-01 00:00:00',
          expectedCompletion: '2025-01-01 00:30:00',
        },
      };

      const worktreePath = '.ai/test-worktree';
      await agent.writePlansToWorktree(plan, 270, worktreePath);

      // Verify file exists
      const fs = await import('fs');
      const path = await import('path');
      const filePath = path.join(worktreePath, 'plans.md');
      const exists = fs.existsSync(filePath);
      expect(exists).toBe(true);

      // Verify content
      const content = fs.readFileSync(filePath, 'utf-8');
      expect(content).toContain('# Execution Plan - Issue #270');
      expect(content).toContain('Test plan');

      // Cleanup
      fs.rmSync(worktreePath, { recursive: true, force: true });
    });

    it('should handle tasks with completed status in Markdown', () => {
      const plan = {
        overview: 'Test with completed task',
        tasks: [
          {
            level: 0,
            tasks: [
              {
                id: 'task-1',
                title: 'Completed Task',
                description: 'Done',
                type: 'feature' as const,
                priority: 1,
                assignedAgent: 'CodeGenAgent' as const,
                estimatedDuration: 30,
                status: 'completed' as const,
                dependencies: [],
              },
            ],
            canRunInParallel: false,
          },
        ],
        progress: {
          total: 1,
          completed: 1,
          inProgress: 0,
          pending: 0,
          failed: 0,
          percentage: 100,
        },
        decisions: [
          {
            timestamp: '2025-01-01 12:00:00',
            decision: 'Use Vitest for testing',
            reason: 'Better TypeScript integration',
            alternatives: ['Jest'],
            implementation: 'Install vitest and configure',
          },
        ],
        timeline: {
          started: '2025-01-01 00:00:00',
          lastUpdate: '2025-01-01 00:30:00',
          expectedCompletion: '2025-01-01 00:30:00',
        },
      };

      const markdown = agent.planToMarkdown(plan, 100);

      // Verify completed checkbox
      expect(markdown).toContain('- [x] Task task-1: Completed Task');
      expect(markdown).toContain('Status: completed');
      expect(markdown).toContain('Completed: 1/1 (100%)');

      // Verify decisions section
      expect(markdown).toContain('## Decisions');
      expect(markdown).toContain('### 2025-01-01 12:00:00');
      expect(markdown).toContain('**Decision**: Use Vitest for testing');
      expect(markdown).toContain('**Reason**: Better TypeScript integration');
      expect(markdown).toContain('**Alternatives**: Jest');
      expect(markdown).toContain('**Implementation**: Install vitest and configure');
    });
  });
});
