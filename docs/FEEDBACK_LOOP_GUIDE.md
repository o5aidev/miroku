# 🔄 Feedback Loop System - Complete Guide

**Goal-Oriented TDD + Consumption-Driven + Infinite Feedback Loop**

無限に改善を繰り返す、自己進化型開発システム

---

## 📋 概要

このシステムは、以下の3つの要素を統合した革新的な開発フレームワークです：

### 1. **Goal-Oriented TDD** (ゴール指向テスト駆動開発)
- 明確なゴール定義
- 成功条件の明示化
- テスト仕様の構造化

### 2. **Consumption-Driven** (消費ドリブン評価)
- 実行結果を即座に消費・検証
- ギャップ分析による課題抽出
- 次のアクション自動提案

### 3. **Infinite Feedback Loop** (無限フィードバックループ)
- 自動継続サイクル
- 収束判定による最適化
- ゴール自動洗練化

---

## 🏗️ アーキテクチャ

```
┌──────────────────────────────────────────────────────────┐
│ Goal-Oriented TDD + Consumption-Driven Feedback Loop     │
│ - テストゴール定義 → 実行 → 消費・検証 → フィードバック      │
│ - 無限ループで継続的改善                                    │
└──────────────────────────────────────────────────────────┘
                    │
        ┌───────────┼───────────┬───────────┐
        │           │           │           │
        ▼           ▼           ▼           ▼
┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐
│ Goal        │ │ Session     │ │ Consumption │ │ Feedback    │
│ Definition  │ │ Execution   │ │ Validation  │ │ Generation  │
│             │ │             │ │             │ │             │
│ - Test Spec │ │ - Run Code  │ │ - Validate  │ │ - Improve   │
│ - Success   │ │ - Output    │ │ - Measure   │ │ - Refine    │
│   Criteria  │ │   Capture   │ │ - Score     │ │ - Loop Back │
└─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘
        │                                             │
        └─────────────────────────────────────────────┘
                   Infinite Loop (改善サイクル)
```

---

## 🚀 使い方

### 基本的な使用例

```typescript
import { GoalManager } from './agents/feedback-loop/goal-manager.js';
import { ConsumptionValidator } from './agents/feedback-loop/consumption-validator.js';
import { InfiniteLoopOrchestrator } from './agents/feedback-loop/infinite-loop-orchestrator.js';

// 1. Initialize components
const goalManager = new GoalManager({
  goalsDirectory: './data/goals',
  autoSave: true,
});

const consumptionValidator = new ConsumptionValidator({
  reportsDirectory: './data/consumption-reports',
  autoSave: true,
  strictMode: false,
});

const loopOrchestrator = new InfiniteLoopOrchestrator(
  {
    maxIterations: 10,
    convergenceThreshold: 5,
    minIterationsBeforeConvergence: 3,
    autoRefinementEnabled: true,
    logsDirectory: './data/feedback-loops',
    autoSave: true,
  },
  goalManager,
  consumptionValidator
);

// 2. Define goal
const goal = goalManager.createGoal({
  title: 'Implement User Authentication Feature',
  description: 'Create a secure user authentication system with JWT tokens',
  successCriteria: {
    minQualityScore: 85,
    maxEslintErrors: 0,
    maxTypeScriptErrors: 0,
    maxSecurityIssues: 0,
    minTestCoverage: 80,
    minTestsPassed: 10,
  },
  testSpecs: [
    // Define your test specifications
  ],
  acceptanceCriteria: [
    'User can register with email and password',
    'User can login and receive JWT token',
    'Protected routes require valid JWT token',
  ],
  priority: 1,
  issueNumber: 123,
});

// 3. Start infinite feedback loop
const loop = await loopOrchestrator.startLoop(goal.id);

// 4. Execute iterations
while (loopOrchestrator.shouldContinue(loop.loopId)) {
  const iteration = await loopOrchestrator.executeIteration(
    loop.loopId,
    sessionId,
    actualMetrics
  );

  console.log(`Score: ${iteration.consumptionReport.overallScore}/100`);
  console.log(`Goal Achieved: ${iteration.consumptionReport.goalAchieved}`);

  if (iteration.consumptionReport.goalAchieved) {
    break;
  }
}
```

---

## 📊 コンポーネント詳細

### 1. GoalManager

**責任**: ゴール定義の作成・管理

**主要メソッド**:
- `createGoal()` - 新しいゴールを作成
- `getGoal(id)` - IDでゴールを取得
- `updateGoalProgress()` - ゴールの進捗を更新
- `isGoalAchieved()` - ゴール達成判定
- `getGoalStatus()` - ゴールのステータス取得

**使用例**:
```typescript
const goal = goalManager.createGoal({
  title: 'Feature Implementation',
  successCriteria: {
    minQualityScore: 85,
    minTestCoverage: 80,
    maxEslintErrors: 0,
  },
  testSpecs: [/* ... */],
  acceptanceCriteria: [/* ... */],
});
```

### 2. ConsumptionValidator

**責任**: 実行結果の消費・検証

**主要メソッド**:
- `validate()` - ゴールに対する検証実行
- `getReport()` - レポート取得
- `getScoreTrend()` - スコア推移取得

**検証項目**:
- Quality Score (品質スコア)
- ESLint Errors (ESLintエラー)
- TypeScript Errors (TypeScriptエラー)
- Security Issues (セキュリティ問題)
- Test Coverage (テストカバレッジ)
- Tests Passed (テスト合格数)

**使用例**:
```typescript
const report = consumptionValidator.validate(
  goal,
  {
    qualityScore: 75,
    eslintErrors: 2,
    typeScriptErrors: 1,
    securityIssues: 0,
    testCoverage: 85,
    testsPassed: 12,
    testsFailed: 0,
    buildTimeMs: 15000,
    linesOfCode: 500,
    cyclomaticComplexity: 8,
  },
  sessionId
);

console.log(report.overallScore); // 78
console.log(report.goalAchieved); // false
console.log(report.gaps); // [{ metric: 'Quality Score', gap: 10, ... }]
console.log(report.nextActions); // [{ type: 'fix', description: '...', ... }]
```

### 3. InfiniteLoopOrchestrator

**責任**: 無限フィードバックループの制御

**主要メソッド**:
- `startLoop()` - ループ開始
- `executeIteration()` - 1イテレーション実行
- `shouldContinue()` - 継続判定
- `stopLoop()` - ループ停止

**ループステータス**:
- `running` - 実行中
- `converged` - 収束 (ゴール達成)
- `diverged` - 発散 (改善が見られない)
- `max_iterations_reached` - 最大イテレーション到達
- `escalated` - エスカレーション必要

**使用例**:
```typescript
const loop = await loopOrchestrator.startLoop(goalId);

while (loopOrchestrator.shouldContinue(loop.loopId)) {
  const iteration = await loopOrchestrator.executeIteration(
    loop.loopId,
    sessionId,
    actualMetrics
  );

  // Handle feedback
  console.log(iteration.feedback.summary);
  console.log(iteration.feedback.details);

  // Apply improvements based on feedback
  // ...

  // Check convergence
  if (iteration.consumptionReport.goalAchieved) {
    console.log('🎉 Goal achieved!');
    break;
  }
}
```

---

## 🔄 動作フロー

### イテレーションサイクル

```
1. ゴール定義
   ↓
2. セッション実行 (コード実装・テスト)
   ↓
3. 実行結果収集 (メトリクス取得)
   ↓
4. 消費・検証 (ゴールと比較)
   ↓
5. ギャップ分析 (課題抽出)
   ↓
6. フィードバック生成 (改善提案)
   ↓
7. 次のアクション提案
   ↓
8. ゴール洗練化 (必要に応じて)
   ↓
9. 収束判定
   ↓
   ├─ YES → ゴール達成 ✅
   └─ NO  → Step 2へ戻る 🔄
```

### 収束判定

システムは以下の条件で収束を判定します：

1. **スコア分散** - 過去5イテレーションのスコア分散が閾値以下
2. **改善率** - イテレーションごとの改善率が0.5ポイント未満
3. **最小イテレーション** - 最低3イテレーション実行済み
4. **ゴール達成** - 成功条件をすべて満たしている

---

## 📈 メトリクス

### 収集されるメトリクス

```typescript
interface ActualMetrics {
  // Code Quality
  qualityScore: number;         // 0-100
  eslintErrors: number;         // ESLintエラー数
  typeScriptErrors: number;     // TypeScriptエラー数
  securityIssues: number;       // セキュリティ問題数

  // Testing
  testCoverage: number;         // テストカバレッジ (%)
  testsPassed: number;          // 合格テスト数
  testsFailed: number;          // 失敗テスト数

  // Performance
  buildTimeMs: number;          // ビルド時間 (ms)
  responseTimeMs?: number;      // レスポンスタイム (ms)

  // Code Metrics
  linesOfCode: number;          // コード行数
  cyclomaticComplexity: number; // 循環的複雑度

  // Custom Metrics
  customMetrics?: Record<string, number>;
}
```

---

## 🎯 成功基準の定義

### 推奨設定

```typescript
const successCriteria: SuccessCriteria = {
  // Quality (品質)
  minQualityScore: 85,        // 85点以上

  // Errors (エラー)
  maxEslintErrors: 0,         // ESLintエラー0個
  maxTypeScriptErrors: 0,     // TypeScriptエラー0個
  maxSecurityIssues: 0,       // セキュリティ問題0個

  // Testing (テスト)
  minTestCoverage: 80,        // カバレッジ80%以上
  minTestsPassed: 10,         // 10個以上のテスト合格

  // Performance (パフォーマンス)
  maxBuildTimeMs: 30000,      // ビルド時間30秒以内
  maxResponseTimeMs: 1000,    // レスポンス1秒以内

  // Custom Metrics (カスタムメトリクス)
  customMetrics: [
    {
      name: 'Bundle Size',
      threshold: 500,         // 500KB以下
      operator: 'lte',
    },
  ],
};
```

---

## 🔧 設定オプション

### GoalManagerConfig

```typescript
{
  goalsDirectory: string;  // ゴール保存ディレクトリ
  autoSave: boolean;       // 自動保存有効化
}
```

### ConsumptionValidatorConfig

```typescript
{
  reportsDirectory: string;  // レポート保存ディレクトリ
  autoSave: boolean;         // 自動保存有効化
  strictMode: boolean;       // 厳格モード (全条件必須)
}
```

### InfiniteLoopConfig

```typescript
{
  maxIterations: number;                 // 最大イテレーション数
  convergenceThreshold: number;          // 収束判定の分散閾値
  minIterationsBeforeConvergence: number; // 収束判定前の最小イテレーション
  autoRefinementEnabled: boolean;        // 自動ゴール洗練化
  logsDirectory: string;                 // ログ保存ディレクトリ
  autoSave: boolean;                     // 自動保存有効化
}
```

---

## 🧪 テスト実行

### デモを実行

```bash
# TypeScript実行
tsx agents/feedback-loop/feedback-loop-demo.ts
```

### 期待される出力

```
╔══════════════════════════════════════════════════════════════╗
║  Goal-Oriented TDD + Consumption-Driven Feedback Loop Demo   ║
╚══════════════════════════════════════════════════════════════╝

📋 Step 1: Initializing components...
✅ Components initialized

🎯 Step 2: Defining goal...
✅ Goal created: goal-implement-user-authentication-feature-1728806400000
   Title: Implement User Authentication Feature
   Success Criteria: Quality >= 85, Coverage >= 80%

🔄 Step 3: Starting infinite feedback loop...
✅ Loop started: loop-goal-implement-user-authentication-feature-1728806400000-1728806401000
   Max Iterations: 10
   Auto Refinement: Enabled

📊 Step 4: Simulating iterations...

🔄 Iteration 1/5
   Session: session-1
   📊 Score: 45/100
   📈 Improvement: +45.0
   ✅ Goal Achieved: No
   ⚠️  Needs improvement. Score: 45/100. Focus on 3 high-priority gap(s).
   ⚠️  Gaps:
      - Quality Score: 40.0 (critical)
      - ESLint Errors: 15.0 (critical)
      - Test Coverage: 50.0 (critical)
   🎯 Next Actions:
      - Fix 15 ESLint error(s) - target: 0
      - Add unit tests to increase coverage from 30% to 80%

🔄 Iteration 2/5
   ...

🏁 Loop stopped: converged

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📈 Final Report

Loop ID: loop-goal-implement-user-authentication-feature-1728806400000-1728806401000
Status: converged
Total Iterations: 5
Start Time: 2025-10-13T06:30:00.000Z
End Time: 2025-10-13T06:30:05.000Z

Convergence Metrics:
  Score History: [45, 58, 72, 83, 88]
  Score Variance: 214.40
  Improvement Rate: 10.75 pts/iteration
  Is Converging: false

Final State:
  Overall Score: 88/100
  Goal Achieved: true
  Gaps Remaining: 0

✅ Demo completed successfully!

🎉 Goal-Oriented TDD + Consumption-Driven + Infinite Feedback Loop system is operational!
```

---

## 🔗 統合

### Water Spider Patternとの統合

Water Spider Pattern (自動継続システム) と統合することで、完全自律実行が可能になります：

```typescript
// Water Spider + Feedback Loop 統合例
import { WaterSpiderAgent } from '../water-spider/water-spider-agent.js';

const waterSpider = new WaterSpiderAgent({
  // Water Spider config
});

const feedbackLoop = new InfiniteLoopOrchestrator({
  // Feedback Loop config
});

// Water Spiderがセッション継続を検知
// → Feedback Loopが自動的にイテレーション実行
// → 無限に改善を繰り返す
```

---

## 📁 ファイル構成

```
agents/feedback-loop/
├── goal-manager.ts                   // ゴール管理
├── consumption-validator.ts          // 消費・検証
├── infinite-loop-orchestrator.ts     // ループ制御
└── feedback-loop-demo.ts             // デモ

agents/types/index.ts                 // 型定義
└── Goal-Oriented TDD Types          // 新規追加された型

docs/
└── FEEDBACK_LOOP_GUIDE.md           // 本ドキュメント
```

---

## 🎓 ベストプラクティス

### 1. ゴール定義

- **明確な成功条件** - 曖昧さのない数値目標
- **現実的な閾値** - 達成可能な範囲で設定
- **段階的な目標** - 大きなゴールは分割

### 2. イテレーション実行

- **頻繁な実行** - 小さな改善を積み重ねる
- **メトリクス収集** - 正確なデータで判定
- **フィードバック活用** - 提案に基づいて改善

### 3. 収束制御

- **早期終了を避ける** - 最低3イテレーションは実行
- **発散を検知** - スコアが下がり続けたら介入
- **自動洗練化** - 停滞時はゴールを調整

---

## 🐛 トラブルシューティング

### スコアが改善しない

**原因**: ゴールが非現実的すぎる
**解決策**: `minQualityScore`を10ポイント下げる

### 収束しない

**原因**: `convergenceThreshold`が厳しすぎる
**解決策**: 閾値を5→10に緩める

### イテレーションが遅い

**原因**: メトリクス収集に時間がかかる
**解決策**: 並列実行、キャッシュ活用

---

## 📚 参考資料

- **Goal-Oriented TDD**: https://martinfowler.com/articles/practical-test-pyramid.html
- **Consumption-Driven Development**: https://www.thoughtworks.com/insights/blog/fitness-function-driven-development
- **Feedback Loops**: https://en.wikipedia.org/wiki/Control_theory

---

## 🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>
