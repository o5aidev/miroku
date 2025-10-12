# Claude Code プロジェクト設定

このファイルは、Claude Codeが自動的に参照するプロジェクトコンテキストファイルです。

## プロジェクト概要

**Miyabi** - 一つのコマンドで全てが完結する自律型開発フレームワーク

完全自律型AI開発オペレーションプラットフォーム。GitHub as OS アーキテクチャに基づき、Issue作成からコード実装、PR作成、デプロイまでを完全自動化します。

### 📚 統合ドキュメント

プロジェクトのすべてのコンポーネントはEntity-Relationモデルで統合的に管理されています：

- **[ENTITY_RELATION_MODEL.md](docs/ENTITY_RELATION_MODEL.md)** - 12種類のEntity定義と27の関係性マップ ⭐⭐⭐
- **[TEMPLATE_MASTER_INDEX.md](docs/TEMPLATE_MASTER_INDEX.md)** - 88ファイルの統合テンプレートインデックス ⭐⭐⭐
- **[LABEL_SYSTEM_GUIDE.md](docs/LABEL_SYSTEM_GUIDE.md)** - 53ラベル体系完全ガイド ⭐⭐⭐

## アーキテクチャ

### コアコンポーネント

1. **Agent System** - 全21個のAgent（Coding: 7個 | Business: 14個）

   **🔧 Coding Agents（7個）** - 開発運用・自動化
   - CoordinatorAgent: タスク統括・DAG分解
   - CodeGenAgent: AI駆動コード生成 (Claude Sonnet 4)
   - ReviewAgent: コード品質レビュー (100点満点スコアリング)
   - IssueAgent: Issue分析・ラベリング (AI推論)
   - PRAgent: Pull Request自動作成 (Conventional Commits)
   - DeploymentAgent: CI/CDデプロイ自動化 (Firebase/Vercel/AWS)

   **💼 Business Agents（14個）** - ビジネス戦略・マーケティング・営業
   - 🎯 戦略・企画系（6個）: AIEntrepreneur, ProductConcept, ProductDesign, FunnelDesign, Persona, SelfAnalysis
   - 📢 マーケティング系（5個）: MarketResearch, Marketing, ContentCreation, SNSStrategy, YouTube
   - 💼 営業・顧客管理系（3個）: Sales, CRM, Analytics

   **Agent Directory**: `.claude/agents/` ([README](.claude/agents/README.md))
   - `specs/coding/` - コーディング系Agent仕様（7個）
   - `specs/business/` - ビジネス系Agent仕様（14個）
   - `prompts/coding/` - コーディング系実行プロンプト（6個）
   - `prompts/business/` - ビジネス系実行プロンプト（将来追加）

   **SDK Integration**:
   - npm: `miyabi-agent-sdk@^0.1.0-alpha.2`
   - Source: [codex repository](https://github.com/ShunsukeHayashi/codex)
   - Dependencies: `@anthropic-ai/sdk`, `@octokit/rest`

2. **GitHub OS Integration**
   - Projects V2: データ永続化層
   - Webhooks: イベントバス
   - Actions: 実行エンジン
   - Discussions: メッセージキュー
   - Pages: ダッシュボード
   - Packages: パッケージ配布

3. **CLI Package** (`packages/cli/`)
   - `miyabi init`: 新規プロジェクト作成
   - `miyabi install`: 既存プロジェクトに追加
   - `miyabi status`: ステータス確認

## 重要なファイル

### 設定ファイル
- `.miyabi.yml`: プロジェクト設定（GitHubトークンは環境変数推奨）
- `.github/workflows/`: 自動化ワークフロー
- `.github/labels.yml`: 構造化された53ラベル体系

### ドキュメント

**コアドキュメント（必読）**:
- `docs/ENTITY_RELATION_MODEL.md`: **Entity-Relationモデル定義** ⭐⭐⭐
- `docs/TEMPLATE_MASTER_INDEX.md`: **テンプレート統合インデックス** ⭐⭐⭐
- `docs/LABEL_SYSTEM_GUIDE.md`: **53ラベル体系完全ガイド** ⭐⭐⭐
- `docs/AGENT_OPERATIONS_MANUAL.md`: **Agent運用マニュアル** ⭐⭐

**統合ガイド**:
- `docs/GITHUB_OS_INTEGRATION.md`: GitHub OS完全統合ガイド
- `docs/AGENT_SDK_LABEL_INTEGRATION.md`: Agent SDK × Label System統合
- `docs/CODEX_MIYABI_INTEGRATION.md`: Codex × Miyabi 統合アーキテクチャ

**ビジネス資料**:
- `docs/SAAS_BUSINESS_MODEL.md`: SaaS事業化戦略 (16,000行)
- `docs/MARKET_ANALYSIS_2025.md`: 市場調査レポート 2025 (8,000行)

**CLI**:
- `packages/cli/README.md`: CLI使用方法

### コアコード
- `agents/`: 各Agentの実装
- `scripts/`: 運用スクリプト
- `packages/`: NPMパッケージ

## 開発ガイドライン

### TypeScript
- Strict mode必須
- ESM形式（import/export）
- `__dirname` → `fileURLToPath(import.meta.url)` 使用

### テスト
- Vitest使用
- カバレッジ目標: 80%以上
- ユニットテスト必須

### コミット規約
- Conventional Commits準拠
- `feat:`, `fix:`, `chore:`, `docs:`, etc.
- Co-Authored-By: Claude <noreply@anthropic.com>

### セキュリティ
- トークンは環境変数
- `.miyabi.yml`は`.gitignore`に追加
- Dependabot有効
- CodeQL有効

## Label System - 53ラベル体系

**"Everything starts with an Issue. Labels define the state."**

Labelはオペレーティングシステムの状態管理機構として機能します。
全ての自動化はLabelを確認してIssue/PRの状態を判断し、適切なアクションを実行します。

### 状態遷移フロー
```
📥 pending → 🔍 analyzing → 🏗️ implementing → 👀 reviewing → ✅ done
```

### 10のカテゴリ（53ラベル）

1. **STATE** (8個): ライフサイクル管理 - `📥 state:pending`, `✅ state:done`
2. **AGENT** (6個): Agent割り当て - `🤖 agent:coordinator`, `🤖 agent:codegen`
3. **PRIORITY** (4個): 優先度管理 - `🔥 priority:P0-Critical` ～ `📝 priority:P3-Low`
4. **TYPE** (7個): Issue分類 - `✨ type:feature`, `🐛 type:bug`, `📚 type:docs`
5. **SEVERITY** (4個): 深刻度・エスカレーション - `🚨 severity:Sev.1-Critical`
6. **PHASE** (5個): プロジェクトフェーズ - `🎯 phase:planning`, `🚀 phase:deployment`
7. **SPECIAL** (7個): 特殊操作 - `🔐 security`, `💰 cost-watch`, `🔄 dependencies`
8. **TRIGGER** (4個): 自動化トリガー - `🤖 trigger:agent-execute`
9. **QUALITY** (4個): 品質スコア - `⭐ quality:excellent` (90-100点)
10. **COMMUNITY** (4個): コミュニティ - `👋 good-first-issue`, `🙏 help-wanted`

### Agent × Label 連携

- **IssueAgent**: AI推論で `type`, `priority`, `severity` を自動推定
- **CoordinatorAgent**: `state:pending` → `state:analyzing` へ遷移、Specialist割り当て
- **CodeGenAgent**: `agent:codegen` + `state:implementing` で実行
- **ReviewAgent**: 品質スコア80点以上で `quality:good` 付与
- **PRAgent**: Conventional Commits準拠のPRタイトル生成（Label-based）
- **DeploymentAgent**: `trigger:deploy-staging` で即座にデプロイ

### 詳細ドキュメント
- [ENTITY_RELATION_MODEL.md](docs/ENTITY_RELATION_MODEL.md) - **Entity-Relationモデル定義**
- [TEMPLATE_MASTER_INDEX.md](docs/TEMPLATE_MASTER_INDEX.md) - **テンプレート統合インデックス**
- [LABEL_SYSTEM_GUIDE.md](docs/LABEL_SYSTEM_GUIDE.md) - 53ラベル完全解説
- [AGENT_SDK_LABEL_INTEGRATION.md](docs/AGENT_SDK_LABEL_INTEGRATION.md) - SDK連携ガイド

## 組織設計原則5原則

1. **責任の明確化**: 各Agentの役割を明確に定義（Labelで可視化）
2. **権限の明確化**: Agent毎の実行権限を制限（AGENT Labelで制御）
3. **階層の明確化**: Coordinator → Specialist の階層構造
4. **結果の明確化**: 成功条件・KPIを数値化（QUALITY Label）
5. **曖昧性の排除**: YAML/JSON形式で構造化（labels.yml）

## 実行例

```bash
# 新規プロジェクト作成
npx miyabi init my-project

# 既存プロジェクトに追加
cd existing-project
npx miyabi install

# ステータス確認
npx miyabi status

# Agent実行（自動Issue処理）- Worktreeベース並列実行
npm run agents:parallel:exec -- --issues=5 --concurrency=3
```

## 環境変数

```bash
GITHUB_TOKEN=ghp_xxx        # GitHubアクセストークン
DEVICE_IDENTIFIER=MacBook   # デバイス識別子
```

## Git Worktree並列実行アーキテクチャ

**重要**: このプロジェクトは、Anthropic APIの直接使用を廃止し、**Git Worktree + Claude Code統合**に移行しました。

### アーキテクチャ概要

```
┌─────────────────────────────────────────────────────────┐
│ CoordinatorAgent (Main Process)                          │
│ - Issue分析・Task分解                                      │
│ - DAG構築・依存関係解決                                     │
│ - Worktree作成・管理                                       │
└─────────────────────────────────────────────────────────┘
                    │
        ┌───────────┼───────────┐
        │           │           │
        ▼           ▼           ▼
┌─────────────┐ ┌─────────────┐ ┌─────────────┐
│ Worktree #1 │ │ Worktree #2 │ │ Worktree #3 │
│ Issue #270  │ │ Issue #271  │ │ Issue #272  │
│             │ │             │ │             │
│ Claude Code │ │ Claude Code │ │ Claude Code │
│ Execution   │ │ Execution   │ │ Execution   │
└─────────────┘ └─────────────┘ └─────────────┘
        │           │           │
        └───────────┼───────────┘
                    │
                    ▼
            ┌─────────────┐
            │ Merge Back  │
            │ to Main     │
            └─────────────┘
```

### 実行フロー

1. **CoordinatorAgent起動**
   ```bash
   npm run agents:parallel:exec -- --issues=270,271,272 --concurrency=2
   ```

2. **各IssueにWorktreeを作成**
   - `.worktrees/issue-270/` - Issue #270専用Worktree
   - `.worktrees/issue-271/` - Issue #271専用Worktree
   - `.worktrees/issue-272/` - Issue #272専用Worktree

3. **Worktree内でClaude Code実行**
   - 各WorktreeでClaude Codeセッションが起動
   - `.claude/prompts/worktree-agent-execution.md`プロンプトに従って実行
   - Agent固有の処理を実行（CodeGen, Review, Deploy等）

4. **結果をマージ**
   - 各Worktreeでの作業をmainブランチにマージ
   - コンフリクト解決（自動 or 手動）
   - 統合テスト実行

### Worktree内での実行

各Worktree内では、以下のプロンプトファイルが使用されます：

**汎用プロンプト**:
- `.claude/prompts/worktree-agent-execution.md` - 全Agent共通の実行テンプレート

**Agent専用プロンプト** (`.claude/agents/prompts/coding/`): 各AgentタイプごとにWorktree実行の詳細な手順を定義
- `.claude/agents/prompts/coding/coordinator-agent-prompt.md` - CoordinatorAgent実行ガイド（タスク分解・DAG構築）
- `.claude/agents/prompts/coding/codegen-agent-prompt.md` - CodeGenAgent実行ガイド（コード生成）
- `.claude/agents/prompts/coding/review-agent-prompt.md` - ReviewAgent実行ガイド（品質レビュー）
- `.claude/agents/prompts/coding/deployment-agent-prompt.md` - DeploymentAgent実行ガイド（デプロイ）
- `.claude/agents/prompts/coding/pr-agent-prompt.md` - PRAgent実行ガイド（PR作成）
- `.claude/agents/prompts/coding/issue-agent-prompt.md` - IssueAgent実行ガイド（Issue分析・ラベリング）

**Agent仕様ドキュメント** (`.claude/agents/specs/coding/` | `.claude/agents/specs/business/`): 各Agentの役割・権限・エスカレーション条件を定義

*Coding Agents（7個）*:
- `.claude/agents/specs/coding/coordinator-agent.md` - CoordinatorAgent仕様
- `.claude/agents/specs/coding/codegen-agent.md` - CodeGenAgent仕様
- `.claude/agents/specs/coding/review-agent.md` - ReviewAgent仕様
- `.claude/agents/specs/coding/deployment-agent.md` - DeploymentAgent仕様
- `.claude/agents/specs/coding/pr-agent.md` - PRAgent仕様
- `.claude/agents/specs/coding/issue-agent.md` - IssueAgent仕様
- `.claude/agents/specs/coding/hooks-integration.md` - Hooks統合ガイド

*Business Agents（14個）*:
- `.claude/agents/specs/business/ai-entrepreneur-agent.md` - AIEntrepreneurAgent仕様（8フェーズビジネスプラン）
- `.claude/agents/specs/business/product-concept-agent.md` - ProductConceptAgent仕様
- `.claude/agents/specs/business/product-design-agent.md` - ProductDesignAgent仕様
- `.claude/agents/specs/business/funnel-design-agent.md` - FunnelDesignAgent仕様
- `.claude/agents/specs/business/persona-agent.md` - PersonaAgent仕様
- `.claude/agents/specs/business/self-analysis-agent.md` - SelfAnalysisAgent仕様
- `.claude/agents/specs/business/market-research-agent.md` - MarketResearchAgent仕様
- `.claude/agents/specs/business/marketing-agent.md` - MarketingAgent仕様
- `.claude/agents/specs/business/content-creation-agent.md` - ContentCreationAgent仕様
- `.claude/agents/specs/business/sns-strategy-agent.md` - SNSStrategyAgent仕様
- `.claude/agents/specs/business/youtube-agent.md` - YouTubeAgent仕様
- `.claude/agents/specs/business/sales-agent.md` - SalesAgent仕様
- `.claude/agents/specs/business/crm-agent.md` - CRMAgent仕様
- `.claude/agents/specs/business/analytics-agent.md` - AnalyticsAgent仕様

各プロンプトには以下が含まれます：
- Agent固有の実行手順（ステップバイステップ）
- TypeScript strict mode + BaseAgentパターンのガイドライン
- テスト作成・ドキュメント生成の指示
- 成功基準とチェックリスト
- コーディング規約とベストプラクティス
- トラブルシューティングガイド
- JSON形式の出力フォーマット

### Agent別の処理

#### CodeGenAgent（Worktree内）
```bash
cd .worktrees/issue-270
# Claude Codeが以下を実行：
# 1. 要件分析
# 2. コード生成（TypeScript + Tests）
# 3. ドキュメント生成
# 4. Git commit
```

#### ReviewAgent（Worktree内）
```bash
cd .worktrees/issue-271
# Claude Codeが以下を実行：
# 1. ESLint + TypeScript型チェック
# 2. セキュリティスキャン
# 3. 品質スコアリング（100点満点）
# 4. レビューコメント生成
```

#### DeploymentAgent（Worktree内）
```bash
cd .worktrees/issue-272
# Claude Codeが以下を実行：
# 1. ビルド + テスト
# 2. Firebase/Vercelデプロイ
# 3. ヘルスチェック
# 4. ロールバック準備
```

### Claude Code統合のメリット

1. **並列実行の真の実現** - 各IssueがWorktreeで独立
2. **コンフリクトの最小化** - 独立したディレクトリ
3. **簡単なロールバック** - Worktree単位で破棄可能
4. **デバッグが容易** - 各Worktreeで独立したログ
5. **スケーラビリティ** - Worktree数に制限なし

### トラブルシューティング

**Worktreeが残ったままの場合**
```bash
# すべてのWorktreeを確認
git worktree list

# 不要なWorktreeを削除
git worktree remove .worktrees/issue-270

# すべてのstaleなWorktreeをクリーンアップ
git worktree prune
```

**並列実行数の調整**
```bash
# 低スペックマシン: concurrency=1
npm run agents:parallel:exec -- --issues=270 --concurrency=1

# 高スペックマシン: concurrency=5
npm run agents:parallel:exec -- --issues=270,271,272,273,274 --concurrency=5
```

## Entity-Relation Model

### 🔗 12種類のコアEntity

すべてのプロジェクトコンポーネントは以下のEntityで統合的に管理されています：

| ID | Entity | 説明 | 型定義 |
|----|--------|------|--------|
| E1 | **Issue** | GitHub Issue | `agents/types/index.ts:54-64` |
| E2 | **Task** | 分解されたタスク | `agents/types/index.ts:37-52` |
| E3 | **Agent** | 自律実行Agent | `agents/types/index.ts:15-22` |
| E4 | **PR** | Pull Request | `agents/types/index.ts:240-257` |
| E5 | **Label** | GitHub Label（53個） | `docs/LABEL_SYSTEM_GUIDE.md` |
| E6 | **QualityReport** | 品質レポート | `agents/types/index.ts:108-130` |
| E7 | **Command** | Claude Codeコマンド | `.claude/commands/*.md` |
| E8 | **Escalation** | エスカレーション | `agents/types/index.ts:96-102` |
| E9 | **Deployment** | デプロイ情報 | `agents/types/index.ts:262-281` |
| E10 | **LDDLog** | LDDログ | `agents/types/index.ts:284-312` |
| E11 | **DAG** | タスク依存グラフ | `agents/types/index.ts:66-70` |
| E12 | **Worktree** | Git Worktree | `CLAUDE.md` (本ファイル) |

### 📊 27の関係性

**Issue処理フロー**:
- R1: Issue --analyzed-by-→ Agent (IssueAgent)
- R2: Issue --decomposed-into-→ Task[] (CoordinatorAgent)
- R3: Issue --tagged-with-→ Label[]
- R4: Issue --creates-→ PR

**Agent実行**:
- R9: Agent --executes-→ Task
- R10: Agent --generates-→ PR
- R11: Agent --creates-→ QualityReport
- R12: Agent --triggers-→ Escalation
- R13: Agent --performs-→ Deployment
- R14: Agent --logs-to-→ LDDLog
- R15: Agent --invoked-by-→ Command

**詳細**: [ENTITY_RELATION_MODEL.md](docs/ENTITY_RELATION_MODEL.md)

### 📁 88ファイルの統合テンプレート

すべてのテンプレートはEntity-Relationモデルに基づいて整合的に管理されています：

- **Coding Agent仕様** (7ファイル): `.claude/agents/specs/coding/\*-agent.md`
- **Business Agent仕様** (14ファイル): `.claude/agents/specs/business/\*-agent.md`
- **Coding Agent実行プロンプト** (6ファイル): `.claude/agents/prompts/coding/\*-agent-prompt.md`
- **Business Agent実行プロンプト** (将来追加): `.claude/agents/prompts/business/\*-agent-prompt.md`
- **Claude Codeコマンド** (9ファイル): `.claude/commands/\*.md`
- **型定義** (5ファイル): `agents/types/\*.ts`
- **ドキュメント** (20+ファイル): `docs/\*.md`

**詳細**: [TEMPLATE_MASTER_INDEX.md](docs/TEMPLATE_MASTER_INDEX.md)

---

## 関連リンク

**プロジェクト**:
- **Dashboard**: https://shunsukehayashi.github.io/Miyabi/
- **Repository (Miyabi)**: https://github.com/ShunsukeHayashi/Miyabi
- **Repository (Codex)**: https://github.com/ShunsukeHayashi/codex
- **Landing Page**: https://shunsukehayashi.github.io/Miyabi/landing.html

**NPMパッケージ**:
- **CLI**: https://www.npmjs.com/package/miyabi
- **SDK**: https://www.npmjs.com/package/miyabi-agent-sdk

**ドキュメント**:
- **Entity-Relationモデル**: [ENTITY_RELATION_MODEL.md](docs/ENTITY_RELATION_MODEL.md)
- **テンプレート統合**: [TEMPLATE_MASTER_INDEX.md](docs/TEMPLATE_MASTER_INDEX.md)
- **Label体系**: [LABEL_SYSTEM_GUIDE.md](docs/LABEL_SYSTEM_GUIDE.md)

---

## タスク管理プロトコル

**重要**: このプロジェクトでは、構造化されたTodo管理を全セッションで実施します。

### プロトコル概要

Claude Codeセッション中のタスク管理は、以下の構造化ルールに従います：

**詳細仕様**: [`.claude/prompts/task-management-protocol.md`](.claude/prompts/task-management-protocol.md)

### 適用ルール

1. **Todo作成基準**
   - ✅ 複数ステップ（3以上）が必要なタスク
   - ✅ 複雑なタスク（実装 + テスト + ドキュメント）
   - ✅ ユーザーが複数タスクをリスト形式で提供
   - ❌ 単純な1ステップタスク
   - ❌ 純粋な質問・情報提供

2. **ステータス管理**
   ```
   pending → in_progress → completed
   ```
   - 同時に`in_progress`は**1つのみ**
   - 完了したタスクは**即座に**`completed`に変更
   - エラー時は`in_progress`のまま維持

3. **Todo構造**
   ```typescript
   {
     content: "【カテゴリ】タスク内容 - 詳細",
     status: "pending" | "in_progress" | "completed",
     activeForm: "【実施中 - カテゴリ】進行状況"
   }
   ```

4. **更新タイミング**
   - タスク開始時（pending → in_progress）
   - サブタスク完了時（進捗報告）
   - メインタスク完了時（in_progress → completed）
   - 新規タスク発見時（追加）

### 実装例

```typescript
// Phase型タスク
[
  {
    content: "【Phase 1】型安全性の向上 - IToolCreator interface作成",
    status: "completed",
    activeForm: "【完了 - Phase 1】IToolCreator interface作成完了✅"
  },
  {
    content: "【Phase 2】エラーハンドリング強化 - 5種類のエラークラス実装",
    status: "in_progress",
    activeForm: "【実装中 - Phase 2】Exponential Backoff実装中"
  },
  {
    content: "【Phase 3】キャッシュ最適化 - TTLCache実装",
    status: "pending",
    activeForm: "【待機中 - Phase 3】TTLCache実装準備"
  }
]
```

### 禁止事項

❌ **やってはいけないこと:**
- 複数タスクをまとめて`completed`に変更（バッチ更新禁止）
- テスト失敗時に`completed`にする
- 部分的な実装で`completed`にする
- 複数のタスクを同時に`in_progress`にする

✅ **推奨される動作:**
- タスク開始前に必ず`in_progress`に変更
- 完全完了後に即座に`completed`に変更
- ブロックされたら`in_progress`のまま維持
- 新規タスク発見時に即座に追加

---

**このファイルはClaude Codeが自動参照します。プロジェクトのコンテキストとして常に最新に保ってください。**
