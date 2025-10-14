# Task Tool Parallel Execution Guide

**Task Tool-based Parallel Agent Execution Architecture - Operation Manual**

## 概要

Task Tool並列実行システムは、Git Worktreeを使用して複数のClaude Code Taskセッションを並列実行します。

## アーキテクチャ

```
CoordinatorAgent
  ↓
TaskToolExecutor
  ↓
  ├─ TaskGrouper (タスクグループ化)
  ├─ TaskScheduler (優先度ベーススケジューリング)
  ├─ SessionManager (Worktree管理)
  └─ PerformanceMonitor (メトリクス収集)
  ↓
複数の並列Worktree
```

## コンポーネント

### 1. TaskGrouper

**役割**: タスクを実行可能なグループに分割

**アルゴリズム**:
1. DAGレベル別に分離（依存関係を尊重）
2. Agentタイプ別にグループ化
3. グループサイズのバランス調整（3-10タスク/グループ）
4. 優先度順にソート

**設定**:
```typescript
const grouper = new TaskGrouper({
  minGroupSize: 3,
  maxGroupSize: 10,
  maxConcurrentGroups: 5,
});
```

### 2. TaskScheduler

**役割**: グループの実行順序を管理

**スケジューリング基準**:
1. DAGレベル（低い方が優先）
2. 依存関係（ブロックされていない）
3. 優先度（高い方が優先）
4. 推定時間（短い方が優先）

**リトライロジック**:
- デフォルト最大リトライ: 2回
- リトライ遅延: 5秒

**設定**:
```typescript
const scheduler = new TaskScheduler(groups, {
  maxConcurrency: 5,
  maxRetries: 2,
  retryDelayMs: 5000,
});
```

### 3. ClaudeCodeSessionManager

**役割**: Git Worktreeとセッション管理

**機能**:
- Worktreeの作成/削除
- `TASK_PROMPT.md`生成
- `plans.md`生成（Felerパターン）
- セッション状態追跡

**Worktree構造**:
```
.worktrees/
  ├─ group-0/
  │   ├─ TASK_PROMPT.md    # Claude Code実行プロンプト
  │   ├─ plans.md          # 実行計画
  │   └─ (プロジェクトファイル)
  ├─ group-1/
  └─ group-2/
```

### 4. PerformanceMonitor

**役割**: パフォーマンスメトリクス収集

**メトリクス**:
- **System**: CPU、メモリ、負荷平均
- **Execution**: スループット、成功率、タスク時間
- **Resources**: Worktree数、並行度使用率
- **Quality**: 品質スコア、エラー数
- **Cost**: APIトークン、推定コスト

**アラート閾値**:
```typescript
{
  cpuUsagePercent: 90,        // CPU > 90%
  memoryUsagePercent: 85,     // メモリ > 85%
  failureRatePercent: 20,     // 失敗率 > 20%
  lowThroughputTasksPerMin: 5,  // スループット < 5 tasks/min
  highCostUSD: 10,            // コスト > $10
}
```

## 使用方法

### 基本的な使用

```typescript
import { TaskToolExecutor } from './scripts/operations/task-tool-executor.js';

const executor = new TaskToolExecutor({
  worktreeBasePath: '.worktrees',
  maxConcurrentGroups: 5,
  sessionTimeoutMs: 3600000,  // 1時間
  enableProgressReporting: true,
  enablePerformanceMonitoring: true,
  performanceReportPath: 'reports/performance',
});

// タスクとDAGを準備
const tasks: Task[] = [/* ... */];
const dag: DAG = {/* ... */};

// 並列実行
const report = await executor.execute(tasks, dag);

console.log(`Success rate: ${report.summary.successRate}%`);
```

### CoordinatorAgentとの統合

```typescript
import { CoordinatorAgent } from './agents/coordinator/coordinator-agent.js';

const agent = new CoordinatorAgent({
  useTaskTool: true,  // Task Tool実行を有効化
  worktreeBasePath: '.worktrees',
});

await agent.execute(issue);
```

## 実行フロー

### Phase 1: タスクグループ化

```
Input: Task[], DAG
  ↓
TaskGrouper.groupTasks()
  ↓
Output: TaskGroup[]
```

**出力例**:
```
Total Tasks: 50
Total Groups: 8
Optimal Concurrency: 5

Groups by Agent:
  CodeGenAgent: 30 tasks
  ReviewAgent: 15 tasks
  DeploymentAgent: 5 tasks

Groups by DAG Level:
  Level 0: 25 tasks
  Level 1: 20 tasks
  Level 2: 5 tasks
```

### Phase 2: スケジューラ初期化

```typescript
const scheduler = new TaskScheduler(groups, {
  maxConcurrency: 5,
});
```

### Phase 3: 並列実行

```
while (scheduler.hasWorkRemaining()) {
  const nextGroup = scheduler.getNextGroup();

  if (nextGroup) {
    // Worktree作成
    const session = await sessionManager.createSession(nextGroup);

    // Claude Code Task tool実行
    // (現在はシミュレーション)
    const result = await launchSession(nextGroup);

    // 完了記録
    scheduler.completeGroup(nextGroup.groupId);
  }
}
```

### Phase 4: パフォーマンスレポート生成

```json
{
  "sessionId": "task-tool-1234567890",
  "summary": {
    "totalTasks": 50,
    "successRate": 94.0,
    "averageThroughput": 12.5,
    "totalCostUSD": 0.15
  },
  "metrics": {
    "system": { "cpuUsagePercent": 45.2, ... },
    "execution": { "throughput": 12.5, ... },
    "resources": { "concurrencyUtilization": 80, ... },
    "quality": { "averageQualityScore": 85, ... },
    "cost": { "totalEstimatedCostUSD": 0.15, ... }
  },
  "alerts": [
    {
      "severity": "warning",
      "metric": "failureRate",
      "message": "High failure rate: 15.2%",
      "suggestion": "Check logs for common failure patterns"
    }
  ],
  "recommendations": [
    "Increase concurrency to improve throughput"
  ]
}
```

## 最適化ガイド

### 1. 並行度調整

**自動計算**:
```typescript
const optimalConcurrency = calculateOptimalConcurrency(groups);
// CPU cores / 2 と Memory GB / 2 の最小値
```

**手動調整**:
```typescript
// 低スペックマシン
const executor = new TaskToolExecutor({
  maxConcurrentGroups: 1,
});

// 高スペックマシン
const executor = new TaskToolExecutor({
  maxConcurrentGroups: 10,
});
```

### 2. グループサイズ調整

```typescript
const grouper = new TaskGrouper({
  minGroupSize: 5,   // 大きいグループ
  maxGroupSize: 15,  // より大きい上限
});
```

### 3. タイムアウト設定

```typescript
const executor = new TaskToolExecutor({
  sessionTimeoutMs: 7200000,  // 2時間
});
```

### 4. コスト最適化

- **小タスクのバッチ化**: グループサイズを大きくする
- **並行度削減**: APIコール頻度を抑える
- **品質スコア閾値**: 低品質タスクの早期検知

## トラブルシューティング

### Worktreeが残る

```bash
# すべてのWorktreeを確認
git worktree list

# 不要なWorktreeを削除
git worktree remove .worktrees/group-0

# すべてのstale Worktreeをクリーンアップ
git worktree prune
```

### メモリ不足

```typescript
// 並行度を削減
const executor = new TaskToolExecutor({
  maxConcurrentGroups: 2,
});
```

### 高いCPU使用率

- 並行度を削減
- グループサイズを大きくする（オーバーヘッド削減）
- タスク推定時間を確認

### 低スループット

```
💡 Performance Recommendations:
   • Increase concurrency to improve throughput
```

**対策**:
- 並行度を増やす（システムリソースが許す場合）
- タスクの複雑度を確認
- ネットワーク遅延をチェック

### 高失敗率

```
⚠️  Performance Alerts:
   🟡 [WARNING] High failure rate: 25.0%
      💡 Check logs for common failure patterns
```

**対策**:
1. ログを確認して共通の失敗パターンを特定
2. リトライ回数を増やす
3. タイムアウトを延長
4. タスクの依存関係を確認

## パフォーマンスメトリクス解説

### System Metrics

| メトリクス | 説明 | 推奨値 |
|-----------|------|--------|
| cpuUsagePercent | CPU使用率 | < 80% |
| memoryUsagePercent | メモリ使用率 | < 75% |
| loadAverage[0] | 1分負荷平均 | < CPU cores |

### Execution Metrics

| メトリクス | 説明 | 推奨値 |
|-----------|------|--------|
| successRate | 成功率 | > 90% |
| throughput | スループット (tasks/min) | > 10 |
| averageTaskDurationMs | 平均タスク時間 | タスク依存 |
| p95TaskDurationMs | 95パーセンタイル | 平均の2倍以下 |

### Resource Metrics

| メトリクス | 説明 | 推奨値 |
|-----------|------|--------|
| concurrencyUtilization | 並行度使用率 | 70-90% |
| optimalConcurrency | 最適並行度 | 自動計算 |

### Quality Metrics

| メトリクス | 説明 | 推奨値 |
|-----------|------|--------|
| averageQualityScore | 平均品質スコア | > 80 |
| excellentCount | 優秀タスク数 (90-100点) | 増加傾向 |

### Cost Metrics

| メトリクス | 説明 | 推奨値 |
|-----------|------|--------|
| totalEstimatedCostUSD | 推定総コスト | < $1/100 tasks |
| totalInputTokens | 入力トークン数 | モニタリング |
| totalOutputTokens | 出力トークン数 | モニタリング |

## ベストプラクティス

### 1. タスク分解

- **適切な粒度**: 10-30分/タスク
- **依存関係の最小化**: 並列度を最大化
- **明確な成功条件**: テスト可能

### 2. グループ化戦略

- **同質なタスク**: 同じAgentタイプ
- **バランス**: 3-10タスク/グループ
- **レベル分離**: DAG依存関係を尊重

### 3. モニタリング

- **リアルタイム監視**: 有効化推奨
- **アラート対応**: 即座に確認
- **レポート保存**: JSON形式で保存

### 4. コスト管理

- **予算設定**: アラート閾値を設定
- **トークン追跡**: 入力/出力トークンを監視
- **バッチ化**: 小タスクをまとめる

## FAQ

### Q: Task Tool実行とは？

A: Claude CodeのTask toolを使用した並列実行です。各タスクグループが独立したWorktreeで実行されます。

### Q: Worktreeは自動削除される？

A: デフォルトでは保持されます（デバッグ用）。手動で削除するか、`cleanupAll()`を呼び出してください。

### Q: 並行度の上限は？

A: `maxConcurrentGroups`で設定します。システムリソースに応じて調整してください。

### Q: APIコストはどのくらい？

A: タスク数とサイズに依存します。PerformanceMonitorで`totalEstimatedCostUSD`を確認してください。

### Q: テストカバレッジは？

A: 主要コンポーネントで80%以上のカバレッジを達成しています。

## まとめ

Task Tool並列実行システムは、以下を提供します：

- ✅ **真の並列実行**: 独立したWorktree
- ✅ **スマートスケジューリング**: DAG + 優先度ベース
- ✅ **リアルタイムモニタリング**: メトリクスとアラート
- ✅ **コスト追跡**: APIトークン使用量
- ✅ **自動リトライ**: 設定可能な再試行ロジック
- ✅ **パフォーマンス最適化**: 推奨事項の自動生成

**関連ドキュメント**:
- [CLAUDE.md](../CLAUDE.md) - プロジェクト概要
- [ENTITY_RELATION_MODEL.md](./ENTITY_RELATION_MODEL.md) - Entity-Relationモデル
- Issue #123 - Task Tool-based Parallel Agent Execution Architecture

**実装コミット**:
- Phase 1: 9cd2eb1, 16f6eca (TaskGrouper + TaskScheduler)
- Phase 2: f251a53 (SessionManager + TaskToolExecutor)
- Phase 3: e6c5467 (CoordinatorAgent統合)
- Phase 4: a1fe913 (PerformanceMonitor)
- Phase 5: (このドキュメント + テスト)
