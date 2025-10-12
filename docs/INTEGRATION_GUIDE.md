# 🔗 Integration Guide: Water Spider + Feedback Loop

**Complete Autonomous Development System**

24/7自律実行 × 無限品質改善の完全統合ガイド

---

## 📋 概要

このガイドは、以下2つのシステムの統合方法を説明します：

### 1. **Water Spider Pattern** 🕷️
- トヨタ生産方式の「資材補充係」パターン
- Claude Codeセッションの自動継続
- Tmux + Webhook通信による監視

### 2. **Feedback Loop System** 🔄
- Goal-Oriented TDD
- Consumption-Driven Validation
- Infinite Feedback Loop

---

## 🏗️ 統合アーキテクチャ

```
┌──────────────────────────────────────────────────────────────┐
│                    CoordinatorAgent                           │
│              (オーケストレーション層)                            │
└──────────────────────────────────────────────────────────────┘
                             │
        ┌────────────────────┴─────────────────────┐
        │                                          │
        ▼                                          ▼
┌────────────────────┐                  ┌────────────────────┐
│  Water Spider      │◄────────────────►│  Feedback Loop     │
│  Auto-Continue     │   統合通信         │  Quality Control   │
└────────────────────┘                  └────────────────────┘
        │                                          │
        ▼                                          ▼
┌────────────────────┐                  ┌────────────────────┐
│ Tmux Sessions      │                  │ Goal Manager       │
│ - Session Monitor  │                  │ - Goal Tracking    │
│ - Auto Continue    │                  │ - Validation       │
│ - Webhook Status   │                  │ - Convergence      │
└────────────────────┘                  └────────────────────┘
        │                                          │
        └──────────────────┬───────────────────────┘
                           │
                           ▼
                  ┌─────────────────┐
                  │  Worktrees       │
                  │  - Issue #XXX    │
                  │  - Claude Code   │
                  │  - Auto Execute  │
                  └─────────────────┘
```

---

## 🚀 統合セットアップ

### Step 1: 前提条件確認

```bash
# Tmuxインストール確認
which tmux

# Node.js バージョン確認
node --version  # v18以上推奨

# TypeScript実行環境確認
npx tsx --version
```

### Step 2: 初期設定

```bash
# 1. リポジトリクローン
git clone https://github.com/ShunsukeHayashi/Miyabi.git
cd Miyabi

# 2. 依存関係インストール
npm install

# 3. 環境変数設定
cat > .env <<EOF
GITHUB_TOKEN=ghp_xxx
DEVICE_IDENTIFIER=YourMacBook
EOF

# 4. Worktree作成 (オプション)
git worktree add .worktrees/issue-123 -b issue-123
```

### Step 3: 統合起動

#### オプション A: 完全自動起動

```bash
# Water Spider + Feedback Loopを統合起動
npm run integrated:start
```

#### オプション B: 個別起動

```bash
# Terminal 1: Webhook Server起動
npm run webhook:server

# Terminal 2: Water Spider起動
npm run water-spider:start

# Terminal 3: Feedback Loop監視 (自動的にWorktree内で実行)
cd .worktrees/issue-123
npm run feedback-loop:monitor
```

---

## 🔄 統合ワークフロー

### フルサイクル

```
1. Issue作成
   │
   ▼
2. CoordinatorAgent: Issue分析
   │
   ▼
3. Worktree作成 (issue-123)
   │
   ▼
4. GoalManager: ゴール定義
   │   - 成功条件設定
   │   - テスト仕様定義
   │
   ▼
5. WaterSpider: セッション監視開始
   │   - Tmuxセッション作成
   │   - 5秒間隔で監視
   │
   ▼
6. Feedback Loop: イテレーション開始
   │   ┌─────────────────────┐
   │   │ Iteration N         │
   │   │ 1. Code実装         │
   │   │ 2. Test実行         │
   │   │ 3. Metrics収集      │
   │   │ 4. Validation       │
   │   │ 5. Gap分析          │
   │   │ 6. Feedback生成     │
   │   │ 7. Goal Refinement  │
   │   └─────────────────────┘
   │          │
   │          ▼
   │   収束判定: ゴール達成?
   │          │
   │          ├─ NO ─► Continue (Step 6へ戻る)
   │          │
   │          └─ YES ─► 次へ
   │
   ▼
7. WaterSpider: セッション継続
   │   - アイドル検知
   │   - "続けてください"送信
   │   - 自動再開
   │
   ▼
8. 収束達成 → PR作成
   │
   ▼
9. マージ → デプロイ
```

---

## 🎯 統合設定

### 統合設定ファイル

`integrated-config.json`:

```json
{
  "waterSpider": {
    "monitorInterval": 5000,
    "maxIdleTime": 30000,
    "autoRestart": true,
    "webhookUrl": "http://localhost:3002"
  },
  "feedbackLoop": {
    "maxIterations": 10,
    "convergenceThreshold": 5,
    "minIterationsBeforeConvergence": 3,
    "autoRefinementEnabled": true
  },
  "integration": {
    "syncInterval": 10000,
    "autoEscalation": true,
    "maxConcurrentSessions": 4
  }
}
```

### TypeScript設定例

```typescript
import { WaterSpiderAgent } from './agents/water-spider/water-spider-agent.js';
import { InfiniteLoopOrchestrator } from './agents/feedback-loop/infinite-loop-orchestrator.js';
import { GoalManager } from './agents/feedback-loop/goal-manager.js';
import { ConsumptionValidator } from './agents/feedback-loop/consumption-validator.js';

// Initialize components
const goalManager = new GoalManager({
  goalsDirectory: './data/goals',
  autoSave: true,
});

const validator = new ConsumptionValidator({
  reportsDirectory: './data/reports',
  autoSave: true,
  strictMode: false,
});

const feedbackLoop = new InfiniteLoopOrchestrator(
  {
    maxIterations: 10,
    convergenceThreshold: 5,
    minIterationsBeforeConvergence: 3,
    autoRefinementEnabled: true,
    logsDirectory: './data/loops',
    autoSave: true,
  },
  goalManager,
  validator
);

const waterSpider = new WaterSpiderAgent({
  deviceIdentifier: 'MacBook',
  githubToken: process.env.GITHUB_TOKEN || '',
  useTaskTool: false,
  useWorktree: true,
  logDirectory: './logs',
  reportDirectory: './reports',
  monitorInterval: 5000,
  maxIdleTime: 30000,
  autoRestart: true,
  webhookUrl: 'http://localhost:3002',
});

// Start integrated system
async function startIntegratedSystem() {
  // 1. Create goal for Issue
  const goal = goalManager.createGoal({
    title: 'Issue #123: Feature Implementation',
    successCriteria: {
      minQualityScore: 85,
      maxEslintErrors: 0,
      maxTypeScriptErrors: 0,
      maxSecurityIssues: 0,
      minTestCoverage: 80,
      minTestsPassed: 10,
    },
    testSpecs: [/* ... */],
    acceptanceCriteria: [/* ... */],
    priority: 1,
    issueNumber: 123,
  });

  // 2. Start feedback loop
  const loop = await feedbackLoop.startLoop(goal.id);

  // 3. Start Water Spider monitoring
  const task = {
    id: 'issue-123',
    title: 'Feature Implementation',
    description: 'Implement feature with quality goals',
    type: 'feature' as const,
    priority: 1,
    severity: 'Sev.3-Medium' as const,
    impact: 'High' as const,
    assignedAgent: 'WaterSpiderAgent' as const,
    dependencies: [],
    estimatedDuration: 0,
    status: 'running' as const,
  };

  await waterSpider.execute(task);

  // 4. Monitor and sync
  while (feedbackLoop.shouldContinue(loop.loopId)) {
    // Water Spider ensures session continuity
    // Feedback Loop ensures quality improvement
    await sleep(5000);
  }

  console.log('🎉 Goal achieved with autonomous execution!');
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

startIntegratedSystem();
```

---

## 📊 統合監視ダッシュボード

### リアルタイム状態確認

```bash
# 統合ステータス確認
curl http://localhost:3002/api/integrated/status | jq

# 出力例:
{
  "timestamp": "2025-10-13T07:00:00.000Z",
  "waterSpider": {
    "status": "running",
    "activeSessions": 3,
    "totalContinues": 42
  },
  "feedbackLoop": {
    "activeLoops": 2,
    "totalIterations": 15,
    "averageScore": 87.5
  },
  "integration": {
    "syncStatus": "healthy",
    "lastSync": "2025-10-13T06:59:55.000Z"
  }
}
```

---

## 🔧 トラブルシューティング

### 問題1: Water Spiderがセッションを検知しない

**症状**: セッション監視が動作しない

**原因**: Tmuxセッションが作成されていない

**解決策**:
```bash
# セッション確認
npm run tmux:list

# セッション作成
npm run tmux:create

# 再起動
npm run water-spider:start
```

### 問題2: Feedback Loopが収束しない

**症状**: イテレーションが10回到達してもゴール未達成

**原因**: ゴール設定が厳しすぎる

**解決策**:
```typescript
// 成功条件を緩める
const goal = goalManager.createGoal({
  successCriteria: {
    minQualityScore: 80, // 85 → 80に下げる
    minTestCoverage: 70, // 80 → 70に下げる
  },
});
```

### 問題3: Webhook通信エラー

**症状**: `ECONNREFUSED` エラー

**原因**: Webhookサーバーが起動していない

**解決策**:
```bash
# Webhookサーバー起動確認
lsof -i:3002

# 起動していない場合
npm run webhook:server
```

---

## 📈 パフォーマンス最適化

### 並列実行数の調整

```typescript
// 低スペックマシン (4コア以下)
const config = {
  integration: {
    maxConcurrentSessions: 2,
  },
};

// 高スペックマシン (8コア以上)
const config = {
  integration: {
    maxConcurrentSessions: 6,
  },
};
```

### メモリ使用量の最適化

```bash
# Node.jsヒープサイズ調整
export NODE_OPTIONS="--max-old-space-size=4096"

# 再起動
npm run integrated:start
```

---

## 🎓 ベストプラクティス

### 1. ゴール設定

✅ **DO**:
- 現実的な閾値設定
- 段階的な目標
- 明確な成功条件

❌ **DON'T**:
- 100点満点を目指す (85-90点が現実的)
- 曖昧な条件
- 達成不可能な目標

### 2. セッション管理

✅ **DO**:
- 定期的なセッションクリーンアップ
- ログのローテーション
- リソース監視

❌ **DON'T**:
- セッションの放置
- ログの無制限蓄積

### 3. イテレーション制御

✅ **DO**:
- 早期の収束判定
- 適切な最大イテレーション数 (10-20)
- 自動洗練化の活用

❌ **DON'T**:
- 無限ループの放置
- 発散の無視

---

## 📚 関連ドキュメント

- [FEEDBACK_LOOP_GUIDE.md](./FEEDBACK_LOOP_GUIDE.md) - Feedback Loop完全ガイド
- [WATER_SPIDER_GUIDE.md](./WATER_SPIDER_GUIDE.md) - Water Spider完全ガイド
- [AGENT_OPERATIONS_MANUAL.md](./AGENT_OPERATIONS_MANUAL.md) - Agent運用マニュアル

---

## 🔗 npm Scripts一覧

```bash
# Feedback Loop
npm run feedback-loop:demo           # デモ実行
npm run feedback-loop:docs           # ドキュメント表示

# Water Spider
npm run water-spider:start           # 起動
npm run water-spider:create-sessions # セッション作成
npm run water-spider:list            # セッション一覧

# Tmux
npm run tmux:create                  # 全セッション作成
npm run tmux:kill                    # 全セッション終了
npm run tmux:list                    # セッション一覧

# Webhook
npm run webhook:server               # サーバー起動

# 統合 (将来追加)
npm run integrated:start             # 統合システム起動
npm run integrated:status            # ステータス確認
npm run integrated:stop              # 統合システム停止
```

---

## 🎉 期待される効果

### Before (統合前)
- ❌ セッション停止で手動継続必要
- ❌ 品質改善が一度きり
- ❌ 人間の介入が頻繁に必要

### After (統合後)
- ✅ 完全自律実行 (24/7)
- ✅ 無限品質改善
- ✅ 人間の介入ゼロ
- ✅ ゴール達成まで自動継続

---

**🤖 Generated with [Claude Code](https://claude.com/claude-code)**

**Co-Authored-By: Claude <noreply@anthropic.com>**
