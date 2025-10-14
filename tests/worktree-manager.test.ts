/**
 * WorktreeManager Tests
 *
 * Tests for Git worktree creation, agent assignment, and execution context generation
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { WorktreeManager } from '../agents/worktree/worktree-manager.js';
import type { Issue, Task, AgentConfig } from '../agents/types/index.js';
import * as fs from 'fs';
import * as path from 'path';

describe('WorktreeManager - Agent Assignment', () => {
  let manager: WorktreeManager;
  const testBasePath = '.worktrees-test';

  beforeEach(() => {
    // Create test worktree directory
    if (!fs.existsSync(testBasePath)) {
      fs.mkdirSync(testBasePath, { recursive: true });
    }

    manager = new WorktreeManager({
      basePath: testBasePath,
      repoRoot: process.cwd(),
      mainBranch: 'main',
      branchPrefix: 'test-issue-',
      autoCleanup: false,
      maxIdleTime: 3600000,
      enableLogging: false,
    });
  });

  afterEach(() => {
    // Cleanup test worktrees
    if (fs.existsSync(testBasePath)) {
      fs.rmSync(testBasePath, { recursive: true, force: true });
    }
  });

  describe('Agent Assignment', () => {
    it('should create worktree with agent assignment', async () => {
      const issue: Issue = {
        number: 100,
        title: 'Test Issue',
        body: 'Test issue body',
        state: 'open',
        labels: ['type:feature'],
        createdAt: '2025-01-01T00:00:00Z',
        updatedAt: '2025-01-01T00:00:00Z',
        url: 'https://github.com/test/repo/issues/100',
      };

      const task: Task = {
        id: 'task-100-0',
        title: 'Implement feature',
        description: 'Test task',
        type: 'feature',
        priority: 1,
        assignedAgent: 'CodeGenAgent',
        dependencies: [],
        estimatedDuration: 30,
        status: 'idle',
      };

      const config: Partial<AgentConfig> = {
        deviceIdentifier: 'test-device',
        useWorktree: true,
        worktreeBasePath: testBasePath,
        logDirectory: '.ai/logs',
        reportDirectory: '.ai/reports',
      };

      // Mock git commands (since we can't actually create git worktrees in tests)
      vi.spyOn(manager as any, 'checkRemoteBranch').mockReturnValue(false);
      vi.mock('child_process', () => ({
        execSync: vi.fn(),
      }));

      const worktreeInfo = await manager.createWorktree(issue, {
        agentType: 'CodeGenAgent',
        executionContext: {
          task,
          issue,
          config,
          promptPath: '.claude/agents/prompts/coding/codegen-agent-prompt.md',
        },
      });

      expect(worktreeInfo.agentType).toBe('CodeGenAgent');
      expect(worktreeInfo.agentStatus).toBe('idle');
      expect(worktreeInfo.executionContext).toBeDefined();
      expect(worktreeInfo.executionContext?.task.id).toBe('task-100-0');
    });

    it('should update agent status', async () => {
      const issue: Issue = {
        number: 101,
        title: 'Test Issue',
        body: 'Test issue body',
        state: 'open',
        labels: [],
        createdAt: '2025-01-01T00:00:00Z',
        updatedAt: '2025-01-01T00:00:00Z',
        url: 'https://github.com/test/repo/issues/101',
      };

      vi.spyOn(manager as any, 'checkRemoteBranch').mockReturnValue(false);

      await manager.createWorktree(issue, {
        agentType: 'CodeGenAgent',
      });

      manager.updateAgentStatus(101, 'executing');
      const worktree = manager.getWorktree(101);

      expect(worktree?.agentStatus).toBe('executing');
    });

    it('should filter worktrees by agent type', async () => {
      const issue1: Issue = {
        number: 102,
        title: 'Feature Issue',
        body: 'Test',
        state: 'open',
        labels: [],
        createdAt: '2025-01-01T00:00:00Z',
        updatedAt: '2025-01-01T00:00:00Z',
        url: 'https://github.com/test/repo/issues/102',
      };

      const issue2: Issue = {
        number: 103,
        title: 'Review Issue',
        body: 'Test',
        state: 'open',
        labels: [],
        createdAt: '2025-01-01T00:00:00Z',
        updatedAt: '2025-01-01T00:00:00Z',
        url: 'https://github.com/test/repo/issues/103',
      };

      vi.spyOn(manager as any, 'checkRemoteBranch').mockReturnValue(false);

      await manager.createWorktree(issue1, { agentType: 'CodeGenAgent' });
      await manager.createWorktree(issue2, { agentType: 'ReviewAgent' });

      const codegenWorktrees = manager.getWorktreesByAgent('CodeGenAgent');
      const reviewWorktrees = manager.getWorktreesByAgent('ReviewAgent');

      expect(codegenWorktrees.length).toBe(1);
      expect(reviewWorktrees.length).toBe(1);
      expect(codegenWorktrees[0].issueNumber).toBe(102);
      expect(reviewWorktrees[0].issueNumber).toBe(103);
    });

    it('should filter worktrees by agent status', async () => {
      const issue: Issue = {
        number: 104,
        title: 'Test Issue',
        body: 'Test',
        state: 'open',
        labels: [],
        createdAt: '2025-01-01T00:00:00Z',
        updatedAt: '2025-01-01T00:00:00Z',
        url: 'https://github.com/test/repo/issues/104',
      };

      vi.spyOn(manager as any, 'checkRemoteBranch').mockReturnValue(false);

      await manager.createWorktree(issue, { agentType: 'CodeGenAgent' });
      manager.updateAgentStatus(104, 'executing');

      const executingWorktrees = manager.getWorktreesByAgentStatus('executing');

      expect(executingWorktrees.length).toBe(1);
      expect(executingWorktrees[0].issueNumber).toBe(104);
    });
  });

  describe('Agent Statistics', () => {
    it('should provide agent statistics', async () => {
      const issues: Issue[] = [
        {
          number: 200,
          title: 'Issue 1',
          body: 'Test',
          state: 'open',
          labels: [],
          createdAt: '2025-01-01T00:00:00Z',
          updatedAt: '2025-01-01T00:00:00Z',
          url: 'https://github.com/test/repo/issues/200',
        },
        {
          number: 201,
          title: 'Issue 2',
          body: 'Test',
          state: 'open',
          labels: [],
          createdAt: '2025-01-01T00:00:00Z',
          updatedAt: '2025-01-01T00:00:00Z',
          url: 'https://github.com/test/repo/issues/201',
        },
        {
          number: 202,
          title: 'Issue 3',
          body: 'Test',
          state: 'open',
          labels: [],
          createdAt: '2025-01-01T00:00:00Z',
          updatedAt: '2025-01-01T00:00:00Z',
          url: 'https://github.com/test/repo/issues/202',
        },
      ];

      vi.spyOn(manager as any, 'checkRemoteBranch').mockReturnValue(false);

      await manager.createWorktree(issues[0], { agentType: 'CodeGenAgent' });
      await manager.createWorktree(issues[1], { agentType: 'ReviewAgent' });
      await manager.createWorktree(issues[2], { agentType: 'CodeGenAgent' });

      manager.updateAgentStatus(200, 'executing');
      manager.updateAgentStatus(201, 'completed');

      const stats = manager.getAgentStatistics();

      expect(stats.totalWithAgent).toBe(3);
      expect(stats.totalWithoutAgent).toBe(0);
      expect(stats.byAgent['CodeGenAgent']).toBe(2);
      expect(stats.byAgent['ReviewAgent']).toBe(1);
      expect(stats.byAgentStatus['executing']).toBe(1);
      expect(stats.byAgentStatus['completed']).toBe(1);
    });
  });

  describe('Execution Context Generation', () => {
    it('should write execution context files to worktree', async () => {
      const issue: Issue = {
        number: 300,
        title: 'Test Issue with Context',
        body: 'This is a test issue for context generation',
        state: 'open',
        labels: ['type:feature', 'priority:P1-High'],
        createdAt: '2025-01-01T00:00:00Z',
        updatedAt: '2025-01-01T00:00:00Z',
        url: 'https://github.com/test/repo/issues/300',
      };

      const task: Task = {
        id: 'task-300-0',
        title: 'Implement feature X',
        description: 'Detailed task description',
        type: 'feature',
        priority: 1,
        severity: 'Sev.2-High',
        impact: 'High',
        assignedAgent: 'CodeGenAgent',
        dependencies: [],
        estimatedDuration: 60,
        status: 'idle',
      };

      const config: Partial<AgentConfig> = {
        deviceIdentifier: 'test-macbook',
        useWorktree: true,
        worktreeBasePath: testBasePath,
        logDirectory: '.ai/logs',
        reportDirectory: '.ai/reports',
      };

      vi.spyOn(manager as any, 'checkRemoteBranch').mockReturnValue(false);

      const worktreeInfo = await manager.createWorktree(issue, {
        agentType: 'CodeGenAgent',
        executionContext: {
          task,
          issue,
          config,
          promptPath: '.claude/agents/prompts/coding/codegen-agent-prompt.md',
          metadata: { testKey: 'testValue' },
        },
      });

      // Create the worktree directory for testing
      if (!fs.existsSync(worktreeInfo.path)) {
        fs.mkdirSync(worktreeInfo.path, { recursive: true });
      }

      await manager.writeExecutionContext(300);

      // Check JSON context file
      const jsonPath = path.join(worktreeInfo.path, '.agent-context.json');
      expect(fs.existsSync(jsonPath)).toBe(true);

      const jsonContent = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));
      expect(jsonContent.agentType).toBe('CodeGenAgent');
      expect(jsonContent.task.id).toBe('task-300-0');
      expect(jsonContent.issue.number).toBe(300);

      // Check Markdown context file
      const mdPath = path.join(worktreeInfo.path, 'EXECUTION_CONTEXT.md');
      expect(fs.existsSync(mdPath)).toBe(true);

      const mdContent = fs.readFileSync(mdPath, 'utf-8');
      expect(mdContent).toContain('# Agent Execution Context');
      expect(mdContent).toContain('## Issue Information');
      expect(mdContent).toContain('Test Issue with Context');
      expect(mdContent).toContain('CodeGenAgent');
    });

    it('should handle execution context with all fields', async () => {
      const issue: Issue = {
        number: 301,
        title: 'Complex Issue',
        body: 'Complex issue body with multiple lines\nand different sections',
        state: 'open',
        labels: ['type:bug', 'severity:critical'],
        createdAt: '2025-01-01T00:00:00Z',
        updatedAt: '2025-01-02T12:30:00Z',
        url: 'https://github.com/test/repo/issues/301',
      };

      const task: Task = {
        id: 'task-301-0',
        title: 'Fix critical bug',
        description: 'Urgent bug fix required',
        type: 'bug',
        priority: 0,
        severity: 'Sev.1-Critical',
        impact: 'Critical',
        assignedAgent: 'CodeGenAgent',
        dependencies: ['task-300-0'],
        estimatedDuration: 120,
        status: 'idle',
        metadata: {
          relatedPRs: ['#150', '#152'],
          urgentFlag: true,
        },
      };

      const config: Partial<AgentConfig> = {
        deviceIdentifier: 'ci-server',
        useWorktree: true,
        worktreeBasePath: testBasePath,
        logDirectory: '.ai/logs/ci',
        reportDirectory: '.ai/reports/ci',
      };

      vi.spyOn(manager as any, 'checkRemoteBranch').mockReturnValue(false);

      const worktreeInfo = await manager.createWorktree(issue, {
        agentType: 'CodeGenAgent',
        executionContext: {
          task,
          issue,
          config,
          promptPath: '.claude/agents/prompts/coding/codegen-agent-prompt.md',
        },
      });

      if (!fs.existsSync(worktreeInfo.path)) {
        fs.mkdirSync(worktreeInfo.path, { recursive: true });
      }

      await manager.writeExecutionContext(301);

      const jsonPath = path.join(worktreeInfo.path, '.agent-context.json');
      const jsonContent = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));

      expect(jsonContent.task.dependencies).toContain('task-300-0');
      expect(jsonContent.task.severity).toBe('Sev.1-Critical');
      expect(jsonContent.issue.labels).toContain('type:bug');
      expect(jsonContent.issue.labels).toContain('severity:critical');
    });
  });

  describe('Set Execution Context', () => {
    it('should set execution context for existing worktree', async () => {
      const issue: Issue = {
        number: 400,
        title: 'Test Issue',
        body: 'Test',
        state: 'open',
        labels: [],
        createdAt: '2025-01-01T00:00:00Z',
        updatedAt: '2025-01-01T00:00:00Z',
        url: 'https://github.com/test/repo/issues/400',
      };

      vi.spyOn(manager as any, 'checkRemoteBranch').mockReturnValue(false);

      await manager.createWorktree(issue, { agentType: 'CodeGenAgent' });

      const newContext = {
        task: {
          id: 'task-400-updated',
          title: 'Updated task',
          description: 'Updated',
          type: 'feature' as const,
          priority: 1,
          assignedAgent: 'CodeGenAgent' as const,
          dependencies: [],
          estimatedDuration: 45,
          status: 'idle' as const,
        },
        issue,
        config: { deviceIdentifier: 'test' },
      };

      manager.setExecutionContext(400, newContext);

      const worktree = manager.getWorktree(400);
      expect(worktree?.executionContext?.task.id).toBe('task-400-updated');
    });
  });
});
