# Task階層構造の可視化 - 詳細設計書

## 1. 概要

### 1.1 目的
Issue内のTask/Sub-task/Todoの階層的な依存関係をダッシュボードで視覚的に表示する。

### 1.2 ユースケース

```
Issue #100: ユーザー認証機能の実装
├─ Task 1: データベース設計 ⚙️ depends on []
│  ├─ Sub-task 1.1: スキーマ定義
│  └─ Sub-task 1.2: マイグレーション作成 ⚙️ depends on [1.1]
├─ Task 2: API実装 ⚙️ depends on [Task 1]
│  ├─ Sub-task 2.1: エンドポイント実装
│  └─ Sub-task 2.2: テスト作成 ⚙️ depends on [2.1]
└─ Task 3: フロントエンド実装 ⚙️ depends on [Task 2]
   ├─ Sub-task 3.1: ログインフォーム
   └─ Sub-task 3.2: セッション管理 ⚙️ depends on [3.1]
```

### 1.3 可視化イメージ

```
┌────────────────────────────────────────────────────────────┐
│ Issue #100: ユーザー認証機能                                 │
│ [+] 展開/折りたたみ                                         │
└──┬─────────────────────────────────────────────────────────┘
   │
   ├──→ Task 1: DB設計 ────────────────┐
   │    ├─→ Sub 1.1: スキーマ          │
   │    └─→ Sub 1.2: マイグレーション  │ (depends on 1.1)
   │                                    │
   ├──→ Task 2: API実装 ←──────────────┘ (depends on Task 1)
   │    ├─→ Sub 2.1: エンドポイント
   │    └─→ Sub 2.2: テスト (depends on 2.1)
   │
   └──→ Task 3: FE実装 (depends on Task 2)
        ├─→ Sub 3.1: フォーム
        └─→ Sub 3.2: セッション (depends on 3.1)
```

---

## 2. データモデル

### 2.1 型定義

```typescript
/**
 * Task階層のノードタイプ
 */
export type TaskNodeType = 'issue' | 'task' | 'subtask' | 'todo';

/**
 * Task階層ノード
 */
export interface TaskNode {
  id: string;                    // "issue-100-task-1-subtask-1"
  type: TaskNodeType;            // "subtask"
  parentId: string | null;       // "issue-100-task-1"
  position: { x: number; y: number };
  data: {
    title: string;
    description?: string;
    status: 'pending' | 'in_progress' | 'completed' | 'blocked';
    assignee?: string;
    dueDate?: string;
    dependencies: string[];      // ["issue-100-task-1-subtask-1"]
    estimatedHours?: number;
    actualHours?: number;
    tags?: string[];
  };
}

/**
 * Task階層エッジ
 */
export interface TaskEdge {
  id: string;
  source: string;                // 親ノードID or 依存元
  target: string;                // 子ノードID or 依存先
  type: 'hierarchy' | 'dependency' | 'blocking';
  label?: string;
  style?: {
    stroke: string;
    strokeWidth: number;
    strokeDasharray?: string;
  };
}

/**
 * Issue全体のTask階層データ
 */
export interface TaskHierarchyData {
  issueId: string;
  nodes: TaskNode[];
  edges: TaskEdge[];
  metadata: {
    totalTasks: number;
    completedTasks: number;
    blockedTasks: number;
    estimatedTotalHours: number;
    actualTotalHours: number;
  };
}
```

### 2.2 Issue本文のパース仕様

#### 2.2.1 Markdown形式（推奨）

```markdown
## Task 1: データベース設計

### Sub-task 1.1: スキーマ定義
- [ ] users テーブル作成
- [ ] posts テーブル作成

### Sub-task 1.2: マイグレーション作成
⚙️ Depends on: Sub-task 1.1

## Task 2: API実装
⚙️ Depends on: Task 1

### Sub-task 2.1: エンドポイント実装
- [ ] POST /api/login
- [ ] GET /api/user

### Sub-task 2.2: テスト作成
⚙️ Depends on: Sub-task 2.1
```

#### 2.2.2 チェックリスト形式（簡易版）

```markdown
## Tasks

- [ ] Task 1: データベース設計
  - [ ] Sub-task 1.1: スキーマ定義
  - [ ] Sub-task 1.2: マイグレーション作成 (depends on 1.1)
- [ ] Task 2: API実装 (depends on Task 1)
  - [ ] Sub-task 2.1: エンドポイント実装
  - [ ] Sub-task 2.2: テスト作成 (depends on 2.1)
```

#### 2.2.3 YAML Front Matter形式（構造化）

```markdown
---
tasks:
  - id: task-1
    title: データベース設計
    subtasks:
      - id: subtask-1-1
        title: スキーマ定義
      - id: subtask-1-2
        title: マイグレーション作成
        depends_on: [subtask-1-1]
  - id: task-2
    title: API実装
    depends_on: [task-1]
    subtasks:
      - id: subtask-2-1
        title: エンドポイント実装
      - id: subtask-2-2
        title: テスト作成
        depends_on: [subtask-2-1]
---

# Issue本文
ユーザー認証機能を実装します。
```

---

## 3. パーサー実装

### 3.1 TaskHierarchyParser クラス

**ファイル**: `packages/dashboard-server/src/utils/task-hierarchy-parser.ts`

```typescript
import matter from 'gray-matter';

export class TaskHierarchyParser {
  /**
   * Issue本文からTask階層データを抽出
   */
  parse(issueBody: string, issueNumber: number): TaskHierarchyData {
    // 1. YAML Front Matter形式を優先
    const yamlData = this.parseYAML(issueBody, issueNumber);
    if (yamlData) {
      return yamlData;
    }

    // 2. Markdown形式をパース
    const markdownData = this.parseMarkdown(issueBody, issueNumber);
    if (markdownData) {
      return markdownData;
    }

    // 3. チェックリスト形式をパース
    const checklistData = this.parseChecklist(issueBody, issueNumber);
    if (checklistData) {
      return checklistData;
    }

    // 4. デフォルト: 空のTask階層
    return {
      issueId: `issue-${issueNumber}`,
      nodes: [],
      edges: [],
      metadata: {
        totalTasks: 0,
        completedTasks: 0,
        blockedTasks: 0,
        estimatedTotalHours: 0,
        actualTotalHours: 0,
      },
    };
  }

  /**
   * YAML Front Matter形式のパース
   */
  private parseYAML(body: string, issueNumber: number): TaskHierarchyData | null {
    try {
      const { data } = matter(body);
      if (!data.tasks || !Array.isArray(data.tasks)) {
        return null;
      }

      const nodes: TaskNode[] = [];
      const edges: TaskEdge[] = [];

      data.tasks.forEach((task: any, taskIndex: number) => {
        const taskId = `issue-${issueNumber}-task-${taskIndex + 1}`;

        // Task node
        nodes.push({
          id: taskId,
          type: 'task',
          parentId: `issue-${issueNumber}`,
          position: { x: 0, y: 0 }, // レイアウトエンジンで計算
          data: {
            title: task.title,
            description: task.description,
            status: task.status || 'pending',
            dependencies: task.depends_on || [],
            estimatedHours: task.estimated_hours,
            tags: task.tags,
          },
        });

        // Hierarchy edge (Issue → Task)
        edges.push({
          id: `hierarchy-issue-${issueNumber}-to-${taskId}`,
          source: `issue-${issueNumber}`,
          target: taskId,
          type: 'hierarchy',
          style: {
            stroke: '#6B7280',
            strokeWidth: 2,
          },
        });

        // Dependency edges (Task → Task)
        if (task.depends_on) {
          task.depends_on.forEach((depId: string) => {
            edges.push({
              id: `dep-${taskId}-depends-${depId}`,
              source: `issue-${issueNumber}-${depId}`,
              target: taskId,
              type: 'dependency',
              label: '⚙️ depends on',
              style: {
                stroke: '#FB923C',
                strokeWidth: 2.5,
                strokeDasharray: '5,5',
              },
            });
          });
        }

        // Sub-tasks
        if (task.subtasks && Array.isArray(task.subtasks)) {
          task.subtasks.forEach((subtask: any, subtaskIndex: number) => {
            const subtaskId = `${taskId}-subtask-${subtaskIndex + 1}`;

            nodes.push({
              id: subtaskId,
              type: 'subtask',
              parentId: taskId,
              position: { x: 0, y: 0 },
              data: {
                title: subtask.title,
                status: subtask.status || 'pending',
                dependencies: subtask.depends_on || [],
              },
            });

            // Hierarchy edge (Task → Sub-task)
            edges.push({
              id: `hierarchy-${taskId}-to-${subtaskId}`,
              source: taskId,
              target: subtaskId,
              type: 'hierarchy',
              style: {
                stroke: '#6B7280',
                strokeWidth: 1.5,
              },
            });

            // Dependency edges (Sub-task → Sub-task)
            if (subtask.depends_on) {
              subtask.depends_on.forEach((depId: string) => {
                const depFullId = depId.startsWith('subtask-')
                  ? `${taskId}-${depId}`
                  : `issue-${issueNumber}-${depId}`;

                edges.push({
                  id: `dep-${subtaskId}-depends-${depFullId}`,
                  source: depFullId,
                  target: subtaskId,
                  type: 'dependency',
                  label: '⚙️',
                  style: {
                    stroke: '#FB923C',
                    strokeWidth: 2,
                    strokeDasharray: '3,3',
                  },
                });
              });
            }
          });
        }
      });

      return {
        issueId: `issue-${issueNumber}`,
        nodes,
        edges,
        metadata: this.calculateMetadata(nodes),
      };
    } catch (error) {
      console.warn('YAML parsing failed:', error);
      return null;
    }
  }

  /**
   * Markdown形式のパース
   */
  private parseMarkdown(body: string, issueNumber: number): TaskHierarchyData | null {
    const nodes: TaskNode[] = [];
    const edges: TaskEdge[] = [];

    // ## Task N: タイトル
    const taskPattern = /^##\s+Task\s+(\d+):\s+(.+)$/gm;
    // ### Sub-task N.M: タイトル
    const subtaskPattern = /^###\s+Sub-task\s+(\d+)\.(\d+):\s+(.+)$/gm;
    // ⚙️ Depends on: ...
    const dependsPattern = /⚙️\s*Depends\s+on:\s*(.+)$/gm;

    let currentTaskId: string | null = null;
    const lines = body.split('\n');

    lines.forEach((line, index) => {
      // Task detection
      const taskMatch = taskPattern.exec(line);
      if (taskMatch) {
        const taskNumber = taskMatch[1];
        const taskTitle = taskMatch[2];
        currentTaskId = `issue-${issueNumber}-task-${taskNumber}`;

        nodes.push({
          id: currentTaskId,
          type: 'task',
          parentId: `issue-${issueNumber}`,
          position: { x: 0, y: 0 },
          data: {
            title: taskTitle,
            status: 'pending',
            dependencies: [],
          },
        });

        edges.push({
          id: `hierarchy-issue-${issueNumber}-to-${currentTaskId}`,
          source: `issue-${issueNumber}`,
          target: currentTaskId,
          type: 'hierarchy',
          style: { stroke: '#6B7280', strokeWidth: 2 },
        });

        return;
      }

      // Sub-task detection
      const subtaskMatch = subtaskPattern.exec(line);
      if (subtaskMatch && currentTaskId) {
        const taskNumber = subtaskMatch[1];
        const subtaskNumber = subtaskMatch[2];
        const subtaskTitle = subtaskMatch[3];
        const subtaskId = `issue-${issueNumber}-task-${taskNumber}-subtask-${subtaskNumber}`;

        nodes.push({
          id: subtaskId,
          type: 'subtask',
          parentId: currentTaskId,
          position: { x: 0, y: 0 },
          data: {
            title: subtaskTitle,
            status: 'pending',
            dependencies: [],
          },
        });

        edges.push({
          id: `hierarchy-${currentTaskId}-to-${subtaskId}`,
          source: currentTaskId,
          target: subtaskId,
          type: 'hierarchy',
          style: { stroke: '#6B7280', strokeWidth: 1.5 },
        });
      }

      // Dependency detection
      const dependsMatch = dependsPattern.exec(line);
      if (dependsMatch && currentTaskId) {
        const dependsOnText = dependsMatch[1];
        // "Task 1" or "Sub-task 1.1"
        const depPattern = /(Task|Sub-task)\s+(\d+(?:\.\d+)?)/g;
        let depMatch;

        while ((depMatch = depPattern.exec(dependsOnText)) !== null) {
          const depType = depMatch[1];
          const depNumber = depMatch[2];

          let sourceId: string;
          if (depType === 'Task') {
            sourceId = `issue-${issueNumber}-task-${depNumber}`;
          } else {
            // Sub-task
            const [taskNum, subtaskNum] = depNumber.split('.');
            sourceId = `issue-${issueNumber}-task-${taskNum}-subtask-${subtaskNum}`;
          }

          edges.push({
            id: `dep-${currentTaskId}-depends-${sourceId}`,
            source: sourceId,
            target: currentTaskId,
            type: 'dependency',
            label: '⚙️ depends on',
            style: {
              stroke: '#FB923C',
              strokeWidth: 2.5,
              strokeDasharray: '5,5',
            },
          });
        }
      }
    });

    return nodes.length > 0
      ? {
          issueId: `issue-${issueNumber}`,
          nodes,
          edges,
          metadata: this.calculateMetadata(nodes),
        }
      : null;
  }

  /**
   * チェックリスト形式のパース
   */
  private parseChecklist(body: string, issueNumber: number): TaskHierarchyData | null {
    const nodes: TaskNode[] = [];
    const edges: TaskEdge[] = [];

    // - [ ] Task 1: タイトル
    // - [ ] Task 1: タイトル (depends on Task 2)
    const taskPattern = /^-\s+\[[ x]\]\s+Task\s+(\d+):\s+(.+?)(?:\s+\(depends\s+on\s+(.+?)\))?$/gim;
    // - [ ] Sub-task 1.1: タイトル
    const subtaskPattern = /^  -\s+\[[ x]\]\s+Sub-task\s+(\d+)\.(\d+):\s+(.+?)(?:\s+\(depends\s+on\s+(.+?)\))?$/gim;

    let match;

    // Parse Tasks
    while ((match = taskPattern.exec(body)) !== null) {
      const taskNumber = match[1];
      const taskTitle = match[2];
      const dependsOn = match[3];

      const taskId = `issue-${issueNumber}-task-${taskNumber}`;

      nodes.push({
        id: taskId,
        type: 'task',
        parentId: `issue-${issueNumber}`,
        position: { x: 0, y: 0 },
        data: {
          title: taskTitle,
          status: 'pending',
          dependencies: [],
        },
      });

      edges.push({
        id: `hierarchy-issue-${issueNumber}-to-${taskId}`,
        source: `issue-${issueNumber}`,
        target: taskId,
        type: 'hierarchy',
        style: { stroke: '#6B7280', strokeWidth: 2 },
      });

      if (dependsOn) {
        const depNumbers = dependsOn.split(',').map(s => s.trim());
        depNumbers.forEach(depNum => {
          const sourceId = `issue-${issueNumber}-task-${depNum.replace('Task ', '')}`;
          edges.push({
            id: `dep-${taskId}-depends-${sourceId}`,
            source: sourceId,
            target: taskId,
            type: 'dependency',
            label: '⚙️',
            style: {
              stroke: '#FB923C',
              strokeWidth: 2.5,
              strokeDasharray: '5,5',
            },
          });
        });
      }
    }

    // Parse Sub-tasks
    taskPattern.lastIndex = 0; // Reset regex
    while ((match = subtaskPattern.exec(body)) !== null) {
      const taskNumber = match[1];
      const subtaskNumber = match[2];
      const subtaskTitle = match[3];
      const dependsOn = match[4];

      const subtaskId = `issue-${issueNumber}-task-${taskNumber}-subtask-${subtaskNumber}`;
      const parentTaskId = `issue-${issueNumber}-task-${taskNumber}`;

      nodes.push({
        id: subtaskId,
        type: 'subtask',
        parentId: parentTaskId,
        position: { x: 0, y: 0 },
        data: {
          title: subtaskTitle,
          status: 'pending',
          dependencies: [],
        },
      });

      edges.push({
        id: `hierarchy-${parentTaskId}-to-${subtaskId}`,
        source: parentTaskId,
        target: subtaskId,
        type: 'hierarchy',
        style: { stroke: '#6B7280', strokeWidth: 1.5 },
      });

      if (dependsOn) {
        const depPattern = /(\d+)\.(\d+)/;
        const depMatch = depPattern.exec(dependsOn);
        if (depMatch) {
          const depTaskNum = depMatch[1];
          const depSubtaskNum = depMatch[2];
          const sourceId = `issue-${issueNumber}-task-${depTaskNum}-subtask-${depSubtaskNum}`;

          edges.push({
            id: `dep-${subtaskId}-depends-${sourceId}`,
            source: sourceId,
            target: subtaskId,
            type: 'dependency',
            label: '⚙️',
            style: {
              stroke: '#FB923C',
              strokeWidth: 2,
              strokeDasharray: '3,3',
            },
          });
        }
      }
    }

    return nodes.length > 0
      ? {
          issueId: `issue-${issueNumber}`,
          nodes,
          edges,
          metadata: this.calculateMetadata(nodes),
        }
      : null;
  }

  /**
   * メタデータ計算
   */
  private calculateMetadata(nodes: TaskNode[]) {
    return {
      totalTasks: nodes.filter(n => n.type === 'task').length,
      completedTasks: nodes.filter(n => n.type === 'task' && n.data.status === 'completed').length,
      blockedTasks: nodes.filter(n => n.type === 'task' && n.data.status === 'blocked').length,
      estimatedTotalHours: nodes.reduce((sum, n) => sum + (n.data.estimatedHours || 0), 0),
      actualTotalHours: nodes.reduce((sum, n) => sum + (n.data.actualHours || 0), 0),
    };
  }
}
```

---

## 4. レイアウトエンジン

### 4.1 階層構造レイアウト

**ファイル**: `packages/dashboard-server/src/utils/hierarchical-layout.ts`

```typescript
import dagre from 'dagre';

export class HierarchicalLayoutEngine {
  /**
   * Task階層に最適化されたレイアウトを計算
   */
  computeLayout(hierarchyData: TaskHierarchyData): TaskHierarchyData {
    const dagreGraph = new dagre.graphlib.Graph();
    dagreGraph.setDefaultEdgeLabel(() => ({}));

    // 階層構造に最適化された設定
    dagreGraph.setGraph({
      rankdir: 'TB',    // Top to Bottom (縦レイアウト)
      nodesep: 60,      // 横の間隔
      ranksep: 100,     // 縦の間隔
      marginx: 40,
      marginy: 40,
      edgesep: 20,      // エッジの間隔
    });

    // ノードを追加
    hierarchyData.nodes.forEach(node => {
      const width = this.getNodeWidth(node.type);
      const height = this.getNodeHeight(node.type);
      dagreGraph.setNode(node.id, { width, height });
    });

    // エッジを追加
    hierarchyData.edges.forEach(edge => {
      dagreGraph.setEdge(edge.source, edge.target);
    });

    // レイアウト計算
    dagre.layout(dagreGraph);

    // ポジション適用
    const layoutedNodes = hierarchyData.nodes.map(node => {
      const pos = dagreGraph.node(node.id);
      const width = this.getNodeWidth(node.type);
      const height = this.getNodeHeight(node.type);

      return {
        ...node,
        position: {
          x: pos.x - width / 2,
          y: pos.y - height / 2,
        },
      };
    });

    return {
      ...hierarchyData,
      nodes: layoutedNodes,
    };
  }

  private getNodeWidth(type: TaskNodeType): number {
    switch (type) {
      case 'issue': return 400;
      case 'task': return 300;
      case 'subtask': return 250;
      case 'todo': return 200;
      default: return 250;
    }
  }

  private getNodeHeight(type: TaskNodeType): number {
    switch (type) {
      case 'issue': return 120;
      case 'task': return 100;
      case 'subtask': return 80;
      case 'todo': return 60;
      default: return 80;
    }
  }
}
```

---

## 5. フロントエンド実装

### 5.1 TaskNode コンポーネント

**ファイル**: `packages/dashboard/src/components/nodes/TaskNode.tsx`

```tsx
import React from 'react';
import { Handle, Position } from 'reactflow';
import type { TaskNode as TaskNodeType } from '../../types';

interface TaskNodeProps {
  data: TaskNodeType['data'];
  type: TaskNodeType['type'];
}

export const TaskNode: React.FC<TaskNodeProps> = ({ data, type }) => {
  const getStatusColor = () => {
    switch (data.status) {
      case 'completed': return 'bg-green-100 border-green-500';
      case 'in_progress': return 'bg-blue-100 border-blue-500';
      case 'blocked': return 'bg-red-100 border-red-500';
      default: return 'bg-gray-100 border-gray-300';
    }
  };

  const getTypeEmoji = () => {
    switch (type) {
      case 'task': return '📋';
      case 'subtask': return '📝';
      case 'todo': return '✅';
      default: return '📌';
    }
  };

  return (
    <div
      className={`
        px-4 py-3 rounded-lg border-2 shadow-md
        ${getStatusColor()}
        min-w-[200px] max-w-[350px]
      `}
    >
      <Handle type="target" position={Position.Top} />

      <div className="flex items-start gap-2">
        <span className="text-2xl">{getTypeEmoji()}</span>
        <div className="flex-1">
          <div className="font-semibold text-sm text-gray-800">
            {data.title}
          </div>

          {data.description && (
            <div className="text-xs text-gray-600 mt-1">
              {data.description}
            </div>
          )}

          <div className="flex items-center gap-2 mt-2 text-xs">
            {data.estimatedHours && (
              <span className="px-2 py-0.5 bg-purple-100 rounded-full">
                ⏱️ {data.estimatedHours}h
              </span>
            )}

            {data.dependencies.length > 0 && (
              <span className="px-2 py-0.5 bg-orange-100 rounded-full">
                ⚙️ {data.dependencies.length} deps
              </span>
            )}
          </div>
        </div>
      </div>

      <Handle type="source" position={Position.Bottom} />
    </div>
  );
};
```

### 5.2 階層表示の折りたたみ機能

**ファイル**: `packages/dashboard/src/components/HierarchyToggle.tsx`

```tsx
import React, { useState } from 'react';
import type { TaskNode } from '../types';

interface HierarchyToggleProps {
  issueId: string;
  nodes: TaskNode[];
  onToggle: (collapsed: boolean) => void;
}

export const HierarchyToggle: React.FC<HierarchyToggleProps> = ({
  issueId,
  nodes,
  onToggle,
}) => {
  const [collapsed, setCollapsed] = useState(false);

  const handleToggle = () => {
    const newState = !collapsed;
    setCollapsed(newState);
    onToggle(newState);
  };

  const taskCount = nodes.filter(n => n.type === 'task').length;
  const subtaskCount = nodes.filter(n => n.type === 'subtask').length;

  return (
    <button
      onClick={handleToggle}
      className="
        flex items-center gap-2 px-3 py-1.5
        bg-white border border-gray-300 rounded-lg
        hover:bg-gray-50 transition
      "
    >
      <span className="text-sm font-medium">
        {collapsed ? '▶️' : '▼'} Task階層
      </span>
      <span className="text-xs text-gray-600">
        {taskCount} tasks, {subtaskCount} subtasks
      </span>
    </button>
  );
};
```

---

## 6. 統合

### 6.1 FlowCanvas への統合

**ファイル**: `packages/dashboard/src/components/FlowCanvas.tsx`

```typescript
// TaskHierarchyParser のインポート
import { TaskHierarchyParser } from '../utils/task-hierarchy-parser';

// WebSocket handler に追加
const { connected } = useWebSocket(
  // onGraphUpdate
  (event) => {
    // 既存のグラフデータ + Task階層データを統合
    const baseGraph = event.baseGraph;  // Issue, Agent, State
    const taskHierarchy = event.taskHierarchy;  // Task, Sub-task, Todo

    const allNodes = [...baseGraph.nodes, ...taskHierarchy.nodes];
    const allEdges = [...baseGraph.edges, ...taskHierarchy.edges];

    setNodes(allNodes);
    setEdges(allEdges);
  },
  // ...他のハンドラー
);
```

### 6.2 サーバー側の統合

**ファイル**: `packages/dashboard-server/src/graph-builder.ts`

```typescript
async buildFullGraph(): Promise<GraphData> {
  const issues = await this.fetchOpenIssues();

  // 既存のグラフ生成
  const baseGraph = {
    nodes: [...issueNodes, ...agentNodes, ...stateNodes],
    edges: [...issueToAgentEdges, ...agentToStateEdges, ...stateFlowEdges],
  };

  // Task階層データを追加
  const parser = new TaskHierarchyParser();
  const layoutEngine = new HierarchicalLayoutEngine();

  const taskHierarchyData: TaskHierarchyData[] = [];

  for (const issue of issues) {
    const hierarchyData = parser.parse(issue.body, issue.number);
    const layoutedData = layoutEngine.computeLayout(hierarchyData);
    taskHierarchyData.push(layoutedData);
  }

  // 統合
  const allNodes = [
    ...baseGraph.nodes,
    ...taskHierarchyData.flatMap(h => h.nodes),
  ];

  const allEdges = [
    ...baseGraph.edges,
    ...taskHierarchyData.flatMap(h => h.edges),
  ];

  return { nodes: allNodes, edges: allEdges };
}
```

---

## 7. まとめ

### 7.1 実装優先順位

**フェーズ1: 基本実装** (4時間)
1. ✅ TaskHierarchyParser 実装
2. ✅ YAML形式パース対応
3. ✅ TaskNode コンポーネント実装
4. ✅ 階層レイアウト計算

**フェーズ2: 拡張機能** (3時間)
1. ✅ Markdown形式パース対応
2. ✅ チェックリスト形式パース対応
3. ✅ 折りたたみ/展開機能
4. ✅ 依存関係エッジの強調

**フェーズ3: 最適化** (2時間)
1. ✅ レイアウトアルゴリズム最適化
2. ✅ パフォーマンスチューニング
3. ✅ エラーハンドリング

### 7.2 期待される効果

- ✅ Task/Sub-task単位での進捗可視化
- ✅ ボトルネック特定の容易化
- ✅ 依存関係の明確化
- ✅ チーム全体での状況共有

---

🌸 **Miyabi Dashboard** - Task階層を美しく可視化
