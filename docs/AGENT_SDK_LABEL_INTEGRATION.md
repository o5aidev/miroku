# Agent SDK × Label System - 完全統合ガイド

**miyabi-agent-sdk と53ラベル体系の連携設計**

---

## 📖 目次

1. [統合の動機](#統合の動機)
2. [アーキテクチャ概要](#アーキテクチャ概要)
3. [7つのAgentとLabel連携](#7つのagentとlabel連携)
4. [実装ガイド](#実装ガイド)
5. [コード例](#コード例)
6. [トラブルシューティング](#トラブルシューティング)

---

## 統合の動機

### 🎯 Why? なぜAgent SDKとLabel Systemを統合するのか

#### **課題1: Agentの責任範囲が曖昧**

**Before**:
```typescript
// どのAgentがこのIssueを担当すべき？
const issue = await octokit.issues.get({ issue_number: 123 });
// → 判断ロジックが各所に散在、重複実装
```

**After (Label System導入後)**:
```typescript
const issue = await octokit.issues.get({ issue_number: 123 });
const labels = issue.data.labels.map(l => l.name);

if (labels.includes('🤖 agent:coordinator')) {
  // CoordinatorAgentが担当
} else if (labels.includes('🤖 agent:codegen')) {
  // CodeGenAgentが担当
}
```

**利点**:
- ✅ **責任の明確化**: Labelを見れば誰が担当か一目瞭然
- ✅ **冪等性**: 同じIssueを複数Agentが重複処理しない
- ✅ **監査可能性**: GitHub UIで処理履歴が視覚的に確認可能

---

#### **課題2: 状態管理がバラバラ**

**Before**:
```typescript
// データベースに状態保存
await db.issues.update({
  id: 123,
  status: 'analyzing'  // → DB依存、GitHub外でのデータ管理
});
```

**After (Label System導入後)**:
```typescript
// Labelで状態管理
await octokit.issues.addLabels({
  issue_number: 123,
  labels: ['🔍 state:analyzing']  // → GitHub自体が状態保持
});
```

**利点**:
- ✅ **Single Source of Truth**: GitHub Issuesが唯一の真実の源
- ✅ **外部DB不要**: GitHub APIのみで完結
- ✅ **リアルタイム同期**: Webhook経由で即座に状態変更検知

---

#### **課題3: 優先度判断が手動**

**Before**:
```typescript
// 人間が毎回優先度を判断
if (issueTitle.includes('urgent')) {
  priority = 'high';
}
```

**After (Agent SDK + Label System)**:
```typescript
import { IssueAgent } from 'miyabi-agent-sdk';

const agent = new IssueAgent(octokit);
const labels = await agent.inferLabels(issue);
// → AI が自動で priority:P0-Critical などを推定
```

**利点**:
- ✅ **自動トリアージ**: AI が Issue内容から優先度・深刻度を推定
- ✅ **一貫性**: 人間の主観に左右されない
- ✅ **スケーラビリティ**: 1000 Issuesでも瞬時に分類

---

### 🔗 統合の価値

| 観点 | Label System単体 | Agent SDK単体 | **統合後** |
|------|-----------------|--------------|----------|
| **責任明確化** | ✅ 可視化のみ | ⚠️ コード内のみ | ✅ **可視化+自動実行** |
| **状態管理** | ✅ GitHub中心 | ⚠️ DB依存 | ✅ **GitHub完結** |
| **自動化** | ⚠️ 手動付与 | ✅ AI推論 | ✅ **AI自動付与** |
| **監査性** | ✅ GitHub UI | ❌ ログのみ | ✅ **GitHub UI完全対応** |
| **スケール** | ⚠️ 手動限界 | ✅ 自動化 | ✅ **完全自律** |

**結論**: Label System は「可視化」、Agent SDK は「自動化」を提供。
統合により **可視化+自動化** を同時達成。

---

## アーキテクチャ概要

### 🏗️ 3層アーキテクチャ

```
┌─────────────────────────────────────────────────────────┐
│                     GitHub Issues                        │
│  ┌──────────────────────────────────────────────────┐  │
│  │  Issue #123: Add dark mode                       │  │
│  │  📥 state:pending                                 │  │
│  │  ✨ type:feature                                  │  │
│  │  ⚠️ priority:P1-High                             │  │
│  │  🤖 agent:coordinator  ← Label Layer             │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
                         ↓
                    GitHub Webhook
                         ↓
┌─────────────────────────────────────────────────────────┐
│           Agent SDK (miyabi-agent-sdk)                   │
│  ┌──────────────────────────────────────────────────┐  │
│  │  CoordinatorAgent                                 │  │
│  │    - readLabels()  ← Label読み取り               │  │
│  │    - updateLabels() ← Label更新                  │  │
│  │    - executeIfAssigned() ← 担当判定             │  │
│  └──────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────┐  │
│  │  IssueAgent                                       │  │
│  │    - inferLabels() ← AI推論                      │  │
│  │    - inferPriority() ← 優先度推定                │  │
│  │    - inferSeverity() ← 深刻度推定                │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
                         ↓
                  GitHub API (Octokit)
                         ↓
┌─────────────────────────────────────────────────────────┐
│                   Label Definitions                      │
│              (.github/labels.yml)                        │
│  - 53ラベル定義                                          │
│  - 状態遷移ルール                                         │
│  - エスカレーションルール                                  │
└─────────────────────────────────────────────────────────┘
```

---

## 7つのAgentとLabel連携

### 1️⃣ **CoordinatorAgent** × Label System

#### 役割
- Issueを受け取り、依存関係を分析してDAG（Directed Acyclic Graph）を構築
- Specialist Agentsに適切にタスクを分配

#### Label連携

**読み取るLabel**:
- `📥 state:pending` - トリアージ対象
- `🔄 dependencies` - 依存関係あり
- `💰 cost-watch` - コスト監視が必要

**更新するLabel**:
```typescript
// Phase 1: 分析開始
await octokit.issues.addLabels({
  issue_number,
  labels: ['🔍 state:analyzing', '🤖 agent:coordinator']
});

// Phase 2: DAG分解完了、Specialist割り当て
await octokit.issues.removeLabel({
  issue_number,
  name: '🔍 state:analyzing'
});
await octokit.issues.addLabels({
  issue_number,
  labels: ['🏗️ state:implementing', '🤖 agent:codegen']
});
```

#### コード例

```typescript
import { CoordinatorAgent } from 'miyabi-agent-sdk';

const coordinator = new CoordinatorAgent(octokit, {
  anthropicApiKey: process.env.ANTHROPIC_API_KEY
});

// Label-based実行判定
const issue = await octokit.issues.get({ issue_number: 123 });
const labels = issue.data.labels.map(l => l.name);

if (labels.includes('📥 state:pending')) {
  // トリアージ開始
  await coordinator.analyzeIssue(issue.data);

  // 状態更新
  await coordinator.updateState(issue.data.number, 'analyzing');
}
```

---

### 2️⃣ **IssueAgent** × Label System

#### 役割
- Issueの内容を分析し、適切なLabelを自動推定
- `type`, `priority`, `severity` の自動付与

#### Label連携

**推定するLabel**:
- `✨ type:feature` / `🐛 type:bug` / `📚 type:docs`
- `🔥 priority:P0-Critical` / `⚠️ priority:P1-High` / `📊 priority:P2-Medium` / `📝 priority:P3-Low`
- `🚨 severity:Sev.1-Critical` / `⚠️ severity:Sev.2-High`
- `👋 good-first-issue` (適格な場合)

#### コード例

```typescript
import { IssueAgent } from 'miyabi-agent-sdk';

const issueAgent = new IssueAgent(octokit, {
  anthropicApiKey: process.env.ANTHROPIC_API_KEY
});

// AI推論によるLabel自動付与
const issue = await octokit.issues.get({ issue_number: 123 });
const inferredLabels = await issueAgent.inferLabels({
  title: issue.data.title,
  body: issue.data.body
});

// 推定されたLabelを付与
await octokit.issues.addLabels({
  issue_number: 123,
  labels: inferredLabels  // ['🐛 type:bug', '🔥 priority:P0-Critical', ...]
});
```

#### AI推論ロジック

```typescript
// packages/miyabi-agent-sdk/src/agents/issue-agent.ts
async inferLabels(issue: Issue): Promise<string[]> {
  const prompt = `
以下のIssueを分析し、適切なLabelを推定してください。

Title: ${issue.title}
Body: ${issue.body}

以下の観点で分類:
1. Type (type:feature / type:bug / type:docs / type:refactor / type:test)
2. Priority (priority:P0-Critical / priority:P1-High / priority:P2-Medium / priority:P3-Low)
3. Severity (severity:Sev.1-Critical / severity:Sev.2-High / severity:Sev.3-Medium / severity:Sev.4-Low)
4. Special (security / cost-watch / dependencies / good-first-issue)

JSON形式で返してください:
{ "labels": ["type:bug", "priority:P1-High", ...] }
`;

  const response = await this.claude.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1024,
    messages: [{ role: 'user', content: prompt }]
  });

  const result = JSON.parse(response.content[0].text);
  return result.labels.map(l => this.convertToEmojiLabel(l));
}
```

---

### 3️⃣ **CodeGenAgent** × Label System

#### 役割
- Claude Sonnet 4を使用してコード生成
- TypeScript/JavaScript/Python/Go対応

#### Label連携

**読み取るLabel**:
- `🤖 agent:codegen` - 自分が担当
- `✨ type:feature` / `🐛 type:bug` - タスク種別
- `🔥 priority:P0-Critical` - 緊急度

**更新するLabel**:
```typescript
// コード生成開始
await octokit.issues.addLabels({
  issue_number,
  labels: ['🏗️ state:implementing', '🏗️ phase:implementation']
});

// PR作成完了
await octokit.issues.removeLabel({
  issue_number,
  name: '🏗️ state:implementing'
});
await octokit.issues.addLabels({
  issue_number,
  labels: ['👀 state:reviewing']
});
```

#### コード例

```typescript
import { CodeGenAgent } from 'miyabi-agent-sdk';

const codeGen = new CodeGenAgent(octokit, {
  anthropicApiKey: process.env.ANTHROPIC_API_KEY
});

// Label-based実行判定
const issue = await octokit.issues.get({ issue_number: 123 });
const labels = issue.data.labels.map(l => l.name);

if (labels.includes('🤖 agent:codegen') && labels.includes('🏗️ state:implementing')) {
  // コード生成実行
  const generatedCode = await codeGen.generateCode({
    issue: issue.data,
    language: 'typescript'
  });

  // PR作成
  await codeGen.createPullRequest({
    issue_number: 123,
    code: generatedCode,
    branch: `feature/issue-${123}`
  });

  // 状態更新
  await octokit.issues.addLabels({
    issue_number: 123,
    labels: ['👀 state:reviewing', '🤖 agent:review']
  });
}
```

---

### 4️⃣ **ReviewAgent** × Label System

#### 役割
- 静的解析、セキュリティスキャン、品質スコアリング
- 品質スコア80点以上でPR承認

#### Label連携

**読み取るLabel**:
- `🤖 agent:review` - 自分が担当
- `👀 state:reviewing` - レビュー中
- `🔐 security` - セキュリティチェック強化

**更新するLabel**:
```typescript
// 品質チェック結果に応じて
const qualityScore = await reviewAgent.calculateQualityScore(pr);

if (qualityScore >= 90) {
  await octokit.issues.addLabels({
    issue_number,
    labels: ['⭐ quality:excellent']
  });
} else if (qualityScore >= 80) {
  await octokit.issues.addLabels({
    issue_number,
    labels: ['✅ quality:good']
  });
} else if (qualityScore >= 60) {
  await octokit.issues.addLabels({
    issue_number,
    labels: ['⚠️ quality:needs-improvement']
  });
} else {
  await octokit.issues.addLabels({
    issue_number,
    labels: ['🔴 quality:poor', '🔴 state:blocked']
  });
}
```

#### コード例

```typescript
import { ReviewAgent } from 'miyabi-agent-sdk';

const reviewer = new ReviewAgent(octokit, {
  anthropicApiKey: process.env.ANTHROPIC_API_KEY
});

// Label-based実行判定
const issue = await octokit.issues.get({ issue_number: 123 });
const labels = issue.data.labels.map(l => l.name);

if (labels.includes('🤖 agent:review') && labels.includes('👀 state:reviewing')) {
  // PRを取得
  const prs = await octokit.pulls.list({
    state: 'open',
    head: `feature/issue-${123}`
  });

  if (prs.data.length > 0) {
    const pr = prs.data[0];

    // 品質チェック実行
    const qualityReport = await reviewer.reviewPullRequest(pr);

    // 品質スコアに応じてLabel付与
    await reviewer.updateQualityLabel(123, qualityReport.score);

    // 80点以上でPR承認
    if (qualityReport.score >= 80) {
      await octokit.pulls.createReview({
        pull_number: pr.number,
        event: 'APPROVE',
        body: `✅ Quality Score: ${qualityReport.score}/100\n\n${qualityReport.summary}`
      });

      await octokit.issues.addLabels({
        issue_number: 123,
        labels: ['✅ state:done']
      });
    }
  }
}
```

---

### 5️⃣ **PRAgent** × Label System

#### 役割
- Conventional Commits準拠のPR自動作成
- Draft PR生成から本番マージまで

#### Label連携

**読み取るLabel**:
- `🤖 agent:pr` - 自分が担当
- `🏗️ state:implementing` - 実装完了
- `✨ type:feature` / `🐛 type:bug` - PR種別判定

**更新するLabel**:
```typescript
// PR作成完了
await octokit.issues.addLabels({
  issue_number,
  labels: ['👀 state:reviewing', '🤖 agent:review']
});

// PRマージ完了
await octokit.issues.addLabels({
  issue_number,
  labels: ['✅ state:done']
});
```

#### コード例

```typescript
import { PRAgent } from 'miyabi-agent-sdk';

const prAgent = new PRAgent(octokit);

// Label-based実行判定
const issue = await octokit.issues.get({ issue_number: 123 });
const labels = issue.data.labels.map(l => l.name);

if (labels.includes('🤖 agent:pr') && labels.includes('🏗️ state:implementing')) {
  // PR作成
  const pr = await prAgent.createPullRequest({
    issue_number: 123,
    title: await prAgent.generateTitle(issue.data, labels),  // Label-based title生成
    body: await prAgent.generateBody(issue.data),
    draft: true
  });

  // 状態更新
  await octokit.issues.addLabels({
    issue_number: 123,
    labels: ['👀 state:reviewing', '🤖 agent:review']
  });
}

// Conventional Commits準拠のタイトル生成
async generateTitle(issue: Issue, labels: string[]): Promise<string> {
  let type = 'chore';
  if (labels.includes('✨ type:feature')) type = 'feat';
  else if (labels.includes('🐛 type:bug')) type = 'fix';
  else if (labels.includes('📚 type:docs')) type = 'docs';
  else if (labels.includes('🔧 type:refactor')) type = 'refactor';
  else if (labels.includes('🧪 type:test')) type = 'test';

  return `${type}: ${issue.title} (#${issue.number})`;
}
```

---

### 6️⃣ **DeploymentAgent** × Label System

#### 役割
- Firebase/Cloud自動デプロイ
- ヘルスチェック、自動Rollback

#### Label連携

**読み取るLabel**:
- `🤖 agent:deployment` - 自分が担当
- `🚀 trigger:deploy-staging` - staging自動デプロイ
- `🚀 trigger:deploy-production` - production自動デプロイ（Guardian承認必須）

**更新するLabel**:
```typescript
// デプロイ開始
await octokit.issues.addLabels({
  issue_number,
  labels: ['🚀 phase:deployment']
});

// デプロイ成功
await octokit.issues.addLabels({
  issue_number,
  labels: ['📊 phase:monitoring']
});

// デプロイ失敗
await octokit.issues.addLabels({
  issue_number,
  labels: ['🛑 state:failed', '🚨 severity:Sev.1-Critical']
});
```

#### コード例

```typescript
import { DeploymentAgent } from 'miyabi-agent-sdk';

const deployAgent = new DeploymentAgent(octokit);

// Label-based実行判定
const issue = await octokit.issues.get({ issue_number: 123 });
const labels = issue.data.labels.map(l => l.name);

if (labels.includes('🚀 trigger:deploy-staging')) {
  // staging環境へデプロイ
  await deployAgent.deploy({
    environment: 'staging',
    issue_number: 123
  });

  await octokit.issues.addLabels({
    issue_number: 123,
    labels: ['🚀 phase:deployment']
  });

  // ヘルスチェック
  const health = await deployAgent.healthCheck('staging');
  if (health.success) {
    await octokit.issues.addLabels({
      issue_number: 123,
      labels: ['📊 phase:monitoring']
    });
  } else {
    // Rollback
    await deployAgent.rollback('staging');
    await octokit.issues.addLabels({
      issue_number: 123,
      labels: ['🛑 state:failed', '🚨 severity:Sev.1-Critical']
    });
  }
}
```

---

### 7️⃣ **TestAgent** × Label System

#### 役割
- Vitest/Playwright/Jest自動テスト実行
- 80%+カバレッジ目標

#### Label連携

**読み取るLabel**:
- `🧪 type:test` - テスト関連
- `🧪 phase:testing` - テストフェーズ

**更新するLabel**:
```typescript
// テスト実行結果に応じて
const coverage = await testAgent.runTests();

if (coverage >= 80) {
  await octokit.issues.addLabels({
    issue_number,
    labels: ['✅ quality:good']
  });
} else {
  await octokit.issues.addLabels({
    issue_number,
    labels: ['⚠️ quality:needs-improvement']
  });
}
```

---

## 実装ガイド

### セットアップ

#### 1. Agent SDK インストール

```bash
npm install miyabi-agent-sdk
```

#### 2. Label定義の同期

```bash
# .github/labels.yml をGitHubに同期
npx miyabi setup --sync-labels
```

#### 3. 環境変数設定

```bash
export GITHUB_TOKEN=ghp_xxxxx
export ANTHROPIC_API_KEY=sk-ant-xxxxx
```

### 基本的な使い方

#### シナリオ: 新規Issueの自動処理

```typescript
import { Octokit } from '@octokit/rest';
import {
  CoordinatorAgent,
  IssueAgent,
  CodeGenAgent,
  ReviewAgent,
  PRAgent
} from 'miyabi-agent-sdk';

const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });

// 1. Issueを取得
const issue = await octokit.issues.get({
  owner: 'ShunsukeHayashi',
  repo: 'Miyabi',
  issue_number: 123
});

// 2. IssueAgentでLabel自動推定
const issueAgent = new IssueAgent(octokit, {
  anthropicApiKey: process.env.ANTHROPIC_API_KEY
});

const inferredLabels = await issueAgent.inferLabels(issue.data);
await octokit.issues.addLabels({
  issue_number: 123,
  labels: inferredLabels
});

// 3. CoordinatorAgentで分析
const coordinator = new CoordinatorAgent(octokit, {
  anthropicApiKey: process.env.ANTHROPIC_API_KEY
});

await coordinator.analyzeIssue(issue.data);
await coordinator.updateState(123, 'analyzing');

// 4. CodeGenAgentで実装
const codeGen = new CodeGenAgent(octokit, {
  anthropicApiKey: process.env.ANTHROPIC_API_KEY
});

const generatedCode = await codeGen.generateCode({
  issue: issue.data,
  language: 'typescript'
});

// 5. PRAgentでPR作成
const prAgent = new PRAgent(octokit);
const pr = await prAgent.createPullRequest({
  issue_number: 123,
  title: `feat: ${issue.data.title}`,
  body: generatedCode.summary,
  draft: true
});

// 6. ReviewAgentで品質チェック
const reviewer = new ReviewAgent(octokit, {
  anthropicApiKey: process.env.ANTHROPIC_API_KEY
});

const qualityReport = await reviewer.reviewPullRequest(pr);
await reviewer.updateQualityLabel(123, qualityReport.score);

// 7. 80点以上で自動マージ
if (qualityReport.score >= 80) {
  await octokit.pulls.merge({
    pull_number: pr.number,
    merge_method: 'squash'
  });

  await octokit.issues.addLabels({
    issue_number: 123,
    labels: ['✅ state:done']
  });
}
```

---

## コード例

### Label-based Agent Dispatcher

```typescript
// scripts/agent-dispatcher.ts
import { Octokit } from '@octokit/rest';
import * as Agents from 'miyabi-agent-sdk';

export class AgentDispatcher {
  constructor(private octokit: Octokit) {}

  async dispatch(issueNumber: number): Promise<void> {
    const issue = await this.octokit.issues.get({ issue_number: issueNumber });
    const labels = issue.data.labels.map(l => l.name);

    // Label-based routing
    if (labels.includes('🤖 agent:coordinator')) {
      await this.runCoordinator(issue.data);
    } else if (labels.includes('🤖 agent:codegen')) {
      await this.runCodeGen(issue.data);
    } else if (labels.includes('🤖 agent:review')) {
      await this.runReview(issue.data);
    } else if (labels.includes('🤖 agent:pr')) {
      await this.runPR(issue.data);
    } else if (labels.includes('🤖 agent:deployment')) {
      await this.runDeployment(issue.data);
    } else {
      // デフォルト: IssueAgentでトリアージ
      await this.runIssueTriage(issue.data);
    }
  }

  private async runCoordinator(issue: any) {
    const agent = new Agents.CoordinatorAgent(this.octokit, {
      anthropicApiKey: process.env.ANTHROPIC_API_KEY!
    });
    await agent.analyzeIssue(issue);
  }

  // ... 他のAgent実行メソッド
}
```

### GitHub Actions統合

```yaml
# .github/workflows/autonomous-agent.yml
name: Autonomous Agent Execution

on:
  issues:
    types: [labeled]

jobs:
  dispatch:
    if: contains(github.event.label.name, 'trigger:agent-execute')
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Install dependencies
        run: |
          npm install miyabi-agent-sdk @octokit/rest

      - name: Execute Agent
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}
        run: |
          node -e "
          const { AgentDispatcher } = require('./scripts/agent-dispatcher.ts');
          const { Octokit } = require('@octokit/rest');

          const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });
          const dispatcher = new AgentDispatcher(octokit);

          dispatcher.dispatch(${{ github.event.issue.number }});
          "
```

---

## トラブルシューティング

### Q1: Labelが重複して付与される

**原因**: 同じAgentが複数回実行されている

**解決策**: Label確認を追加

```typescript
const labels = issue.data.labels.map(l => l.name);
if (labels.includes('🔍 state:analyzing')) {
  console.log('Already analyzing, skipping...');
  return;
}
```

### Q2: Agent SDKがLabelを認識しない

**原因**: Label名の不一致（絵文字あり/なし）

**解決策**: Aliasを使用

```typescript
// labels.yml で定義
- name: "🤖 agent:coordinator"
  aliases: ["coordinator", "agent:coordinator"]

// コードで使用
const hasCoordinator = labels.some(l =>
  l.includes('coordinator') || l.includes('🤖 agent:coordinator')
);
```

### Q3: 品質スコアがおかしい

**原因**: ReviewAgentの設定不足

**解決策**: 明示的な設定

```typescript
const reviewer = new ReviewAgent(octokit, {
  anthropicApiKey: process.env.ANTHROPIC_API_KEY,
  qualityThreshold: {
    coverage: 80,
    lintErrors: 0,
    securityVulns: 0
  }
});
```

---

## まとめ

### 🎯 統合の3大メリット

1. **可視化** - GitHub UI上でAgent処理状況が一目瞭然
2. **自動化** - AI推論による自動Label付与
3. **スケーラビリティ** - 1000 Issuesでも破綻しない

### 📚 関連ドキュメント

- [LABEL_SYSTEM_GUIDE.md](./LABEL_SYSTEM_GUIDE.md) - Label体系の完全ガイド
- [AGENT_OPERATIONS_MANUAL.md](./AGENT_OPERATIONS_MANUAL.md) - Agent運用マニュアル
- [miyabi-agent-sdk README](https://www.npmjs.com/package/miyabi-agent-sdk) - SDK公式ドキュメント

---

**Miyabi Agent SDK × Label System** - Beauty in Autonomous Development 🌸
