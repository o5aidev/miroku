/**
 * Plans.md Generation Test
 *
 * Tests the Plans.md auto-generation feature (Feler's 7-hour session pattern)
 * from OpenAI Dev Day.
 */

import { describe, it, expect } from 'vitest';
import { PlansGenerator } from '../../agents/utils/plans-generator.js';
import { TaskDecomposition, Issue, Task, DAG } from '../../agents/types/index.js';

describe('Plans.md Generation', () => {
  const mockIssue: Issue = {
    number: 98,
    title: 'OpenAI Dev Day開発手法の統合 - スナップショットテスト・Plans.md・/reviewループ実装',
    body: `# OpenAI Dev Day 開発手法の統合実装

## 📋 概要

OpenAI Dev DayでCodexチームが実演した開発手法を統合し、AI時代の開発効率を最大化します。

**3つの核心的アプローチ**:
1. **スナップショットテスト統合** - Nacho's Approach
2. **Plans.md自動生成** - Feler's 7-hour Session
3. **/review コマンド実装** - Daniel's Review Loop

## 📊 実装タスク（16個）

### Phase 1: スナップショットテスト統合（4タスク）

- [x] Phase 1.1: スナップショットテスト仕様定義
- [x] Phase 1.2: ReviewAgent実装確認
- [ ] Phase 1.3: スナップショット機能実装
- [ ] Phase 1.4: CI/CDパイプライン統合`,
    state: 'open',
    labels: ['✨ type:feature', '🔥 priority:P0-Critical'],
    createdAt: '2025-10-12T00:00:00Z',
    updatedAt: '2025-10-12T00:00:00Z',
    url: 'https://github.com/ShunsukeHayashi/Miyabi/issues/98',
  };

  const mockTasks: Task[] = [
    {
      id: 'task-98-0',
      title: 'Phase 1.3: スナップショット機能実装',
      description: 'ReviewAgentに視覚的検証機能追加',
      type: 'feature',
      priority: 0,
      severity: 'Sev.2-High',
      impact: 'High',
      assignedAgent: 'CodeGenAgent',
      dependencies: [],
      estimatedDuration: 120,
      status: 'completed',
    },
    {
      id: 'task-98-1',
      title: 'Phase 1.4: CI/CDパイプライン統合',
      description: 'GitHub Actionsでスナップショット検証',
      type: 'feature',
      priority: 1,
      severity: 'Sev.2-High',
      impact: 'High',
      assignedAgent: 'CodeGenAgent',
      dependencies: ['task-98-0'],
      estimatedDuration: 60,
      status: 'running',
    },
    {
      id: 'task-98-2',
      title: 'Phase 2.1: Plans.mdフォーマット設計',
      description: 'DAG → Markdown変換仕様定義',
      type: 'docs',
      priority: 2,
      severity: 'Sev.3-Medium',
      impact: 'Medium',
      assignedAgent: 'CodeGenAgent',
      dependencies: [],
      estimatedDuration: 90,
      status: 'idle',
    },
  ];

  const mockDAG: DAG = {
    nodes: mockTasks,
    edges: [
      { from: 'task-98-0', to: 'task-98-1' },
    ],
    levels: [
      ['task-98-0', 'task-98-2'], // Level 0: independent tasks
      ['task-98-1'],               // Level 1: depends on task-98-0
    ],
  };

  const mockDecomposition: TaskDecomposition = {
    originalIssue: mockIssue,
    tasks: mockTasks,
    dag: mockDAG,
    estimatedTotalDuration: 270,
    hasCycles: false,
    recommendations: [
      'Consider running Phase 1.3 and Phase 2.1 in parallel',
      'Phase 1.4 depends on Phase 1.3, schedule accordingly',
    ],
  };

  describe('Initial Plan Generation', () => {
    it('should generate valid Plans.md markdown', () => {
      const plans = PlansGenerator.generateInitialPlan(mockDecomposition);

      // Verify header
      expect(plans).toContain('# Execution Plan: Issue #98');
      expect(plans).toContain('OpenAI Dev Day開発手法の統合');

      // Verify sections
      expect(plans).toContain('## Overview');
      expect(plans).toContain('## DAG Visualization');
      expect(plans).toContain('## Task Breakdown');
      expect(plans).toContain('## Progress');
      expect(plans).toContain('## Decisions Log');
      expect(plans).toContain('## Recommendations');

      // Verify metadata
      expect(plans).toContain('Total Tasks**: 3');
      expect(plans).toContain('Estimated Duration**: 270 minutes');

      // Log for inspection
      console.log('\n📋 Generated Plans.md Preview:');
      console.log('='.repeat(60));
      console.log(plans.split('\n').slice(0, 30).join('\n'));
      console.log('...');
      console.log('='.repeat(60));
    });

    it('should include Mermaid DAG visualization', () => {
      const plans = PlansGenerator.generateInitialPlan(mockDecomposition);

      // Verify Mermaid syntax
      expect(plans).toContain('```mermaid');
      expect(plans).toContain('graph TD');
      expect(plans).toContain('task-98-0');
      expect(plans).toContain('task-98-1');
      expect(plans).toContain('-->');

      // Verify styling classes
      expect(plans).toContain('classDef completed');
      expect(plans).toContain('classDef running');
      expect(plans).toContain('classDef failed');
      expect(plans).toContain('classDef pending');
    });

    it('should show execution levels', () => {
      const plans = PlansGenerator.generateInitialPlan(mockDecomposition);

      // Verify levels
      expect(plans).toContain('### Execution Levels');
      expect(plans).toContain('**Level 1**');
      expect(plans).toContain('**Level 2**');
      expect(plans).toContain('can run in parallel');
    });

    it('should list tasks with details', () => {
      const plans = PlansGenerator.generateInitialPlan(mockDecomposition);

      // Verify task details
      expect(plans).toContain('Phase 1.3: スナップショット機能実装');
      expect(plans).toContain('Agent: `CodeGenAgent`');
      expect(plans).toContain('Est. Duration');
      expect(plans).toContain('Dependencies');
      expect(plans).toContain('Severity: Sev.2-High');
    });

    it('should include progress tracking', () => {
      const plans = PlansGenerator.generateInitialPlan(mockDecomposition);

      // Verify progress section
      expect(plans).toContain('### Current Status');
      expect(plans).toContain('✅ Completed');
      expect(plans).toContain('▶️  Running');
      expect(plans).toContain('⏸️  Pending');

      // Verify progress bar
      expect(plans).toMatch(/████/);
    });

    it('should reference Feler\'s OpenAI Dev Day pattern', () => {
      const plans = PlansGenerator.generateInitialPlan(mockDecomposition);

      // Verify attribution
      expect(plans).toContain('Feler\'s 7-hour Session');
      expect(plans).toContain('OpenAI Dev Day');
      expect(plans).toContain('Maintain trajectory');
    });

    it('should include recommendations', () => {
      const plans = PlansGenerator.generateInitialPlan(mockDecomposition);

      // Verify recommendations
      expect(plans).toContain('## Recommendations');
      expect(plans).toContain('Consider running Phase 1.3 and Phase 2.1 in parallel');
    });
  });

  describe('Format Validation', () => {
    it('should generate valid markdown structure', () => {
      const plans = PlansGenerator.generateInitialPlan(mockDecomposition);

      // Count headers
      const h1Count = (plans.match(/^# /gm) || []).length;
      const h2Count = (plans.match(/^## /gm) || []).length;
      const h3Count = (plans.match(/^### /gm) || []).length;

      expect(h1Count).toBeGreaterThan(0); // At least one main header
      expect(h2Count).toBeGreaterThan(5);  // Multiple sections
      expect(h3Count).toBeGreaterThan(0);  // Subsections

      console.log(`\n📊 Markdown Structure:
   H1 Headers: ${h1Count}
   H2 Headers: ${h2Count}
   H3 Headers: ${h3Count}
   Total Lines: ${plans.split('\n').length}`);
    });

    it('should not exceed reasonable file size', () => {
      const plans = PlansGenerator.generateInitialPlan(mockDecomposition);
      const sizeInKB = new TextEncoder().encode(plans).length / 1024;

      // Reasonable limit: < 100KB for documentation
      expect(sizeInKB).toBeLessThan(100);

      console.log(`\n📏 File Size: ${sizeInKB.toFixed(2)} KB`);
    });
  });

  describe('Special Cases', () => {
    it('should handle issues with no dependencies', () => {
      const simpleTasks: Task[] = [
        {
          id: 'task-1',
          title: 'Simple task',
          description: 'No dependencies',
          type: 'feature',
          priority: 0,
          assignedAgent: 'CodeGenAgent',
          dependencies: [],
          estimatedDuration: 30,
          status: 'idle',
        },
      ];

      const simpleDAG: DAG = {
        nodes: simpleTasks,
        edges: [],
        levels: [['task-1']],
      };

      const simpleDecomp: TaskDecomposition = {
        originalIssue: mockIssue,
        tasks: simpleTasks,
        dag: simpleDAG,
        estimatedTotalDuration: 30,
        hasCycles: false,
        recommendations: [],
      };

      const plans = PlansGenerator.generateInitialPlan(simpleDecomp);

      expect(plans).toContain('Dependencies: None');
      expect(plans).toContain('Total Tasks**: 1');
    });

    it('should handle complex dependency graphs', () => {
      const complexTasks: Task[] = [
        { id: 'A', title: 'Task A', description: '', type: 'feature', priority: 0, assignedAgent: 'CodeGenAgent', dependencies: [], estimatedDuration: 30, status: 'idle' },
        { id: 'B', title: 'Task B', description: '', type: 'feature', priority: 1, assignedAgent: 'CodeGenAgent', dependencies: ['A'], estimatedDuration: 30, status: 'idle' },
        { id: 'C', title: 'Task C', description: '', type: 'feature', priority: 2, assignedAgent: 'CodeGenAgent', dependencies: ['A'], estimatedDuration: 30, status: 'idle' },
        { id: 'D', title: 'Task D', description: '', type: 'feature', priority: 3, assignedAgent: 'CodeGenAgent', dependencies: ['B', 'C'], estimatedDuration: 30, status: 'idle' },
      ];

      const complexDAG: DAG = {
        nodes: complexTasks,
        edges: [
          { from: 'A', to: 'B' },
          { from: 'A', to: 'C' },
          { from: 'B', to: 'D' },
          { from: 'C', to: 'D' },
        ],
        levels: [['A'], ['B', 'C'], ['D']],
      };

      const complexDecomp: TaskDecomposition = {
        originalIssue: mockIssue,
        tasks: complexTasks,
        dag: complexDAG,
        estimatedTotalDuration: 120,
        hasCycles: false,
        recommendations: [],
      };

      const plans = PlansGenerator.generateInitialPlan(complexDecomp);

      expect(plans).toContain('**Level 1**');
      expect(plans).toContain('**Level 2**');
      expect(plans).toContain('**Level 3**');
      expect(plans).toContain('Total Tasks**: 4');
    });
  });
});
