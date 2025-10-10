# Claude Code プロジェクト設定

このファイルは、Claude Codeが自動的に参照するプロジェクトコンテキストファイルです。

## プロジェクト概要

**Miyabi** - 一つのコマンドで全てが完結する自律型開発フレームワーク

完全自律型AI開発オペレーションプラットフォーム。GitHub as OS アーキテクチャに基づき、Issue作成からコード実装、PR作成、デプロイまでを完全自動化します。

## アーキテクチャ

### コアコンポーネント

1. **Agent System** (via [miyabi-agent-sdk](https://www.npmjs.com/package/miyabi-agent-sdk))
   - CoordinatorAgent: タスク統括・DAG分解
   - CodeGenAgent: AI駆動コード生成 (Claude Sonnet 4)
   - ReviewAgent: コード品質レビュー (100点満点スコアリング)
   - IssueAgent: Issue分析・ラベリング (AI推論)
   - PRAgent: Pull Request自動作成 (Conventional Commits)
   - DeploymentAgent: CI/CDデプロイ自動化 (Firebase/Vercel/AWS)
   - TestAgent: テスト自動実行 (Vitest/Jest/Playwright)

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
- `docs/AGENT_OPERATIONS_MANUAL.md`: Agent運用マニュアル
- `docs/GITHUB_OS_INTEGRATION.md`: GitHub OS完全統合ガイド
- `docs/LABEL_SYSTEM_GUIDE.md`: **53ラベル体系の完全ガイド** ⭐
- `docs/AGENT_SDK_LABEL_INTEGRATION.md`: **Agent SDK × Label System統合** ⭐
- `docs/CODEX_MIYABI_INTEGRATION.md`: **Codex × Miyabi 統合アーキテクチャ** 🔗
- `docs/SAAS_BUSINESS_MODEL.md`: SaaS事業化戦略 (16,000行)
- `docs/MARKET_ANALYSIS_2025.md`: 市場調査レポート 2025 (8,000行)
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

# Agent実行（自動Issue処理）
npm run agents:parallel:exec -- --issues=5 --concurrency=3
```

## 環境変数

```bash
GITHUB_TOKEN=ghp_xxx        # GitHubアクセストークン
ANTHROPIC_API_KEY=sk-ant-xxx  # Claude APIキー（オプション）
DEVICE_IDENTIFIER=MacBook   # デバイス識別子
```

## 関連リンク

- **Dashboard**: https://shunsukehayashi.github.io/Miyabi/
- **Repository (Miyabi)**: https://github.com/ShunsukeHayashi/Miyabi
- **Repository (Codex)**: https://github.com/ShunsukeHayashi/codex
- **NPM Package (CLI)**: https://www.npmjs.com/package/miyabi
- **NPM Package (SDK)**: https://www.npmjs.com/package/miyabi-agent-sdk
- **Landing Page**: https://shunsukehayashi.github.io/Miyabi/landing.html

---

**このファイルはClaude Codeが自動参照します。プロジェクトのコンテキストとして常に最新に保ってください。**
