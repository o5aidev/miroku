# Plans.md Format Specification

**Version**: 1.0.0
**Purpose**: 長時間セッション（7時間+）での軌道維持
**Inspiration**: OpenAI Dev Day - Feler's 7-hour Session (1億5000万トークン処理)

## 📋 フォーマット定義

### 基本構造

```markdown
# Execution Plan - Issue #XXX

## Overview
[Issue概要 - 1-2文で簡潔に]

## Tasks
### Level 0 (並行実行可能)
- [ ] Task 1: [タスク名]
  - Agent: CodeGenAgent
  - Duration: 60分
  - Status: pending

### Level 1 (Level 0完了後)
- [ ] Task 2: [タスク名]
  - Agent: ReviewAgent
  - Duration: 20分
  - Status: pending
  - Dependencies: Task 1

## Progress
- Total: 5 tasks
- Completed: 2/5 (40%)
- In Progress: 1
- Pending: 2
- Failed: 0

## Decisions
### 2025-10-12 15:30
- **Decision**: Use Vitest for snapshot testing
- **Reason**: Already installed, better TypeScript integration
- **Alternatives**: Jest (more popular but heavier)

### 2025-10-12 16:00
- **Decision**: Exclude timestamps from snapshots
- **Reason**: Avoid false positives in CI/CD
- **Implementation**: Use `expect.any(Number)` for dynamic fields

## Timeline
- Started: 2025-10-12 14:00
- Last Update: 2025-10-12 16:30
- Expected Completion: 2025-10-12 19:00 (5h total)
```

## 📊 セクション詳細

### 1. Overview

**目的**: Issueの目標を1-2文で明確化

**内容**:
- Issue番号とタイトル
- 実装する機能の概要
- 期待される成果

**例**:
```markdown
## Overview
CoordinatorAgentに「生きたドキュメント」Plans.md自動生成機能を実装。
7時間セッションでも軌道維持を可能にする。
```

### 2. Tasks

**目的**: タスクをDAGレベル別に整理

**構造**:
```markdown
### Level N (並行実行可能 | Level N-1完了後)
- [ ] Task ID: タスク名
  - Agent: 担当Agent名
  - Duration: 推定時間（分）
  - Status: pending | in_progress | completed | failed
  - Dependencies: 依存タスク（Level > 0の場合）
```

**ステータス遷移**:
```
pending → in_progress → completed
                      ↓
                    failed (リトライ可能)
```

**並行実行判定**:
- Level 0: 常に並行実行可能
- Level 1+: 前Levelのすべてのタスク完了後

### 3. Progress

**目的**: 進捗状況の可視化

**メトリクス**:
- **Total**: 総タスク数
- **Completed**: 完了タスク数 / 総タスク数 (%)
- **In Progress**: 実行中タスク数
- **Pending**: 待機中タスク数
- **Failed**: 失敗タスク数

**計算式**:
```typescript
const percentage = Math.round((completed / total) * 100);
```

### 4. Decisions

**目的**: 技術的意思決定の記録（Felerパターン）

**構造**:
```markdown
### [Timestamp]
- **Decision**: 決定内容
- **Reason**: 決定理由
- **Alternatives**: 代替案（任意）
- **Implementation**: 実装詳細（任意）
```

**重要性**:
- 長時間セッションで「なぜこの技術を選んだか」を忘れない
- 後続タスクで矛盾した決定を避ける
- レビュワーが文脈を理解しやすい

**例**:
```markdown
### 2025-10-12 15:30
- **Decision**: Use Vitest for snapshot testing
- **Reason**: Already installed, better TypeScript integration
- **Alternatives**: Jest (more popular but heavier)
```

### 5. Timeline

**目的**: スケジュール管理

**項目**:
- **Started**: 実行開始時刻
- **Last Update**: 最終更新時刻（タスク完了・失敗時に更新）
- **Expected Completion**: 推定完了時刻

**推定完了時刻計算**:
```typescript
const totalDuration = tasks.reduce((sum, task) => sum + task.estimatedDuration, 0);
const expectedCompletion = new Date(started.getTime() + totalDuration * 60 * 1000);
```

## 🔄 更新タイミング

### 初回生成（Issue分析後）

```typescript
const plan = await coordinator.generateExecPlan(issue, dag);
await coordinator.writePlansToWorktree(plan, issue.number, worktreePath);
```

**生成内容**:
- すべてのタスクは `pending`
- Progress: 0/N (0%)
- Decisions: 空配列
- Timeline: Started と Expected Completion のみ

### タスク開始時

```typescript
plan.tasks[level].tasks[index].status = 'in_progress';
plan.progress.inProgress++;
plan.progress.pending--;
plan.timeline.lastUpdate = new Date().toISOString();
```

### タスク完了時

```typescript
plan.tasks[level].tasks[index].status = 'completed';
plan.progress.completed++;
plan.progress.inProgress--;
plan.timeline.lastUpdate = new Date().toISOString();

// Markdown更新
const checkbox = `- [x] Task ${taskId}`;  // [ ] → [x]
```

### 技術的決定時

```typescript
plan.decisions.push({
  timestamp: new Date().toISOString(),
  decision: 'Use Vitest for snapshot testing',
  reason: 'Already installed, better TypeScript integration',
  alternatives: ['Jest'],
});
```

## 🎯 期待される効果

### 1. 長時間セッションの実現

**現状**: 1-2時間で迷子
```
開始 → タスク1 → タスク2 → 「あれ、何やってたんだっけ？」
```

**改善後**: plans.md参照 → 7時間でも軌道維持
```
開始 → plans.md確認 → タスク1 → plans.md更新 → タスク2 → plans.md確認 → 完了
         ↑                              ↑
         常に全体像把握          進捗確認・方向修正
```

### 2. ドキュメントの自動整備

**現状**:
- ドキュメント書き忘れ
- 後から「なぜこうしたか」分からない

**改善後**:
- plans.md自動生成 → 常に最新
- Decisions セクション → 技術選定の理由が残る

### 3. 意思決定ログの記録

**Felerパターン**:
```markdown
### 2025-10-12 15:30
- **Decision**: Use Exponential Backoff for API retries
- **Reason**: Avoid rate limiting, better UX
- **Alternatives**: Linear retry (simpler but inefficient)
- **Implementation**: `retryDelayMs = baseDelay * Math.pow(2, attemptCount)`
```

→ 3時間後に「なぜExponential Backoffを選んだか」をすぐ思い出せる

## 🛠️ TypeScript型定義

```typescript
// agents/types/execution-plan.ts

export interface ExecutionPlan {
  overview: string;
  tasks: TaskLevel[];
  progress: ProgressSummary;
  decisions: DecisionLog[];
  timeline: Timeline;
}

export interface TaskLevel {
  level: number;
  tasks: Task[];
  canRunInParallel: boolean;
}

export interface Task {
  id: string;
  title: string;
  assignedAgent: string;
  estimatedDuration: number;  // 分
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  dependencies: string[];
}

export interface ProgressSummary {
  total: number;
  completed: number;
  inProgress: number;
  pending: number;
  failed: number;
  percentage: number;  // 0-100
}

export interface DecisionLog {
  timestamp: string;  // ISO 8601
  decision: string;
  reason: string;
  alternatives?: string[];
  implementation?: string;
}

export interface Timeline {
  started: string;  // ISO 8601
  lastUpdate: string;  // ISO 8601
  expectedCompletion: string;  // ISO 8601
}
```

## 📚 参考資料

- **OpenAI Dev Day - Feler's 7-hour Session**: Plans.mdによる軌道維持
- **Nacho's Approach**: Auto-loop + Snapshot Testing
- **Kahn's Algorithm**: タスク依存関係解決（既存実装）

## 🔗 関連ファイル

- `agents/types/execution-plan.ts` - 型定義（新規作成）
- `agents/coordinator/coordinator-agent.ts` - Plans.md生成ロジック（追加）
- `tests/CoordinatorAgent.test.ts` - テスト（追加）

---

**このフォーマット仕様は、Task 2.3（Plans.md生成機能実装）で使用されます。**
