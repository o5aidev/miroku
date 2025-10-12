# 🌸 Miyabi Claude Code Plugin

**完全自律型AI開発オペレーションプラットフォーム**

GitHub as OS アーキテクチャに基づき、Issue作成からコード実装、PR作成、デプロイまでを完全自動化する Claude Code 公式プラグイン。

[![Version](https://img.shields.io/badge/version-0.8.2-blue.svg)](https://github.com/ShunsukeHayashi/Miyabi)
[![License](https://img.shields.io/badge/license-Apache--2.0-green.svg)](LICENSE)
[![Claude Code](https://img.shields.io/badge/Claude%20Code-Plugin-purple.svg)](https://docs.claude.com/claude-code)

## ✨ 特徴

- **7つの自律型Agent**: Coordinator, CodeGen, Review, Issue, PR, Deployment, Test
- **8つのSlashコマンド**: `/miyabi-init`, `/miyabi-status`, `/miyabi-auto` など
- **4つの自動化Hooks**: pre-commit, post-commit, pre-pr, post-test
- **GitHub as OS統合**: Issues, Actions, Projects V2, Webhooks, Pages を OS として活用
- **53ラベル体系**: 組織設計原則に基づく構造化ラベルシステム

## 🚀 インストール

### Claude Code でインストール

```bash
# Marketplace を追加
/plugin marketplace add ShunsukeHayashi/Miyabi

# Plugin をインストール
/plugin install miyabi
```

### または、直接 Git URL から

```bash
/plugin marketplace add https://github.com/ShunsukeHayashi/Miyabi.git
/plugin install miyabi
```

## 📦 Plugin バリエーション

### 1. **miyabi** (完全パッケージ) - 推奨

全機能を含むフルセット。

```bash
/plugin install miyabi
```

**含まれるもの:**
- 7つの Agent
- 8つの Slash コマンド
- 4つの Hook
- MCP Server統合

### 2. **miyabi-core** (コア機能のみ)

基本機能のみのライト版。

```bash
/plugin install miyabi-core
```

**含まれるもの:**
- `/miyabi-init` - プロジェクト初期化
- `/miyabi-status` - ステータス確認
- `/miyabi-auto` - 自動モード

### 3. **miyabi-agents-only** (Agent定義のみ)

Agent定義のみを使いたい場合。

```bash
/plugin install miyabi-agents-only
```

**含まれるもの:**
- 7つの Agent定義（CoordinatorAgent, CodeGenAgent, ReviewAgent, IssueAgent, PRAgent, DeploymentAgent, TestAgent）

## 🛠️ 使い方

### 1. 新規プロジェクト作成

```bash
/miyabi-init
```

対話的にプロジェクトをセットアップします:
- GitHub リポジトリ作成
- 53ラベル自動設定
- GitHub Actions ワークフロー展開
- Projects V2 作成

### 2. プロジェクトステータス確認

```bash
/miyabi-status
```

現在のプロジェクト状態を表示:
- Open Issues 数
- Agent 実行状態
- テストカバレッジ
- デプロイステータス

### 3. 自動モード起動 (Water Spider)

```bash
/miyabi-auto
```

全自律モードで継続的にIssueを処理:
1. Pending Issue 検出
2. IssueAgent による分析
3. CoordinatorAgent による DAG 分解
4. CodeGenAgent によるコード実装
5. ReviewAgent による品質チェック
6. PRAgent による PR 作成
7. DeploymentAgent によるデプロイ

### 4. TODO 検出と Issue 化

```bash
/miyabi-todos
```

コードベース内の TODO コメントを検出し、自動的に GitHub Issue として作成。

### 5. Agent 実行

```bash
/miyabi-agent
```

特定の Agent を手動で実行:
- `coordinator` - タスク統括
- `codegen` - コード生成
- `review` - コード品質判定
- `issue` - Issue分析
- `pr` - PR作成
- `deployment` - デプロイ
- `test` - テスト実行

### 6. ドキュメント生成

```bash
/miyabi-docs
```

コードベースから自動的にドキュメントを生成。

### 7. デプロイ実行

```bash
/miyabi-deploy
```

Firebase/Cloud へのデプロイを実行。

### 8. テスト実行

```bash
/miyabi-test
```

プロジェクトのテストを実行し、カバレッジレポートを生成。

## 🎯 自動化 Hooks

### pre-commit

コミット前に自動実行:
- Lint チェック
- Type チェック
- テスト実行

### post-commit

コミット後に自動実行:
- コミット情報表示
- メトリクス更新

### pre-pr

PR作成前に自動実行:
- Rebase 確認
- テスト実行
- カバレッジチェック (80%+)
- Conventional Commits 検証

### post-test

テスト後に自動実行:
- カバレッジレポート生成
- テスト結果アーカイブ
- メトリクス更新

## 🤖 Agent 一覧

### CoordinatorAgent
**役割**: タスク統括・並列実行制御

- DAG (Directed Acyclic Graph) ベースのタスク分解
- Critical Path 特定と並列実行最適化
- Agent 間の調整

### CodeGenAgent
**役割**: AI駆動コード生成

- Claude Sonnet 4 による高品質コード生成
- TypeScript strict mode 完全対応
- テストコード自動生成

### ReviewAgent
**役割**: コード品質判定

- 静的解析・セキュリティスキャン
- 品質スコアリング (100点満点、80点以上で合格)
- 改善提案生成

### IssueAgent
**役割**: Issue分析・ラベル管理

- 組織設計原則53ラベル体系による自動分類
- タスク複雑度推定 (小/中/大/特大)
- 優先度・深刻度推定

### PRAgent
**役割**: Pull Request自動作成

- Conventional Commits 準拠
- Draft PR 自動生成
- レビュワー自動割り当て

### DeploymentAgent
**役割**: CI/CDデプロイ自動化

- Firebase 自動デプロイ・ヘルスチェック
- 自動 Rollback 機能
- 環境管理 (dev/staging/prod)

### TestAgent
**役割**: テスト自動実行

- Vitest 実行・カバレッジレポート
- 80%+ カバレッジ目標
- E2E テスト (Playwright)

## 📊 GitHub as OS アーキテクチャ

Miyabi は「GitHub を OS として扱う」設計思想のもと、以下を統合:

| コンポーネント | OS機能 | Miyabiでの用途 |
|---------------|--------|----------------|
| **Issues** | タスクキュー | Issue駆動開発 |
| **Actions** | 実行エンジン | CI/CD自動化 |
| **Projects V2** | データベース | 進捗管理 |
| **Webhooks** | イベントバス | リアルタイム連携 |
| **Pages** | ダッシュボード | メトリクス表示 |
| **Packages** | パッケージマネージャー | NPM配布 |
| **Discussions** | メッセージキュー | コミュニティBot |
| **Labels** | 状態管理 | 53ラベル体系 |

## 🏷️ Label System (53ラベル)

**"Everything starts with an Issue. Labels define the state."**

### 10のカテゴリ

1. **STATE** (8個): ライフサイクル管理
   - `📥 state:pending` → `🔍 state:analyzing` → `🏗️ state:implementing` → `👀 state:reviewing` → `✅ state:done`

2. **AGENT** (6個): Agent割り当て
   - `🤖 agent:coordinator`, `🤖 agent:codegen`, `🤖 agent:review`, etc.

3. **PRIORITY** (4個): 優先度管理
   - `🔥 priority:P0-Critical`, `⚠️ priority:P1-High`, `📊 priority:P2-Medium`, `📝 priority:P3-Low`

4. **TYPE** (7個): Issue分類
   - `✨ type:feature`, `🐛 type:bug`, `📚 type:docs`, `🔧 type:refactor`, etc.

5. **SEVERITY** (4個): 深刻度・エスカレーション
   - `🚨 severity:Sev.1-Critical` ～ `📝 severity:Sev.4-Low`

6. **PHASE** (5個): プロジェクトフェーズ
   - `🎯 phase:planning`, `🏗️ phase:development`, `🚀 phase:deployment`, etc.

7. **SPECIAL** (7個): 特殊操作
   - `🔐 security`, `💰 cost-watch`, `🔄 dependencies`, etc.

8. **TRIGGER** (4個): 自動化トリガー
   - `🤖 trigger:agent-execute`, `⏰ trigger:scheduled`, etc.

9. **QUALITY** (4個): 品質スコア
   - `⭐ quality:excellent` (90-100点), `✅ quality:good` (80-89点), etc.

10. **COMMUNITY** (4個): コミュニティ
    - `👋 good-first-issue`, `🙏 help-wanted`, `🎓 learning`, etc.

詳細: [LABEL_SYSTEM_GUIDE.md](https://github.com/ShunsukeHayashi/Miyabi/blob/main/docs/LABEL_SYSTEM_GUIDE.md)

## 📚 ドキュメント

- [LABEL_SYSTEM_GUIDE.md](https://github.com/ShunsukeHayashi/Miyabi/blob/main/docs/LABEL_SYSTEM_GUIDE.md) - 53ラベル体系完全ガイド
- [AGENT_SDK_LABEL_INTEGRATION.md](https://github.com/ShunsukeHayashi/Miyabi/blob/main/docs/AGENT_SDK_LABEL_INTEGRATION.md) - Agent SDK統合ガイド
- [DISCORD_SETUP_GUIDE.md](https://github.com/ShunsukeHayashi/Miyabi/blob/main/docs/DISCORD_SETUP_GUIDE.md) - Discord コミュニティセットアップ
- [AGENT_OPERATIONS_MANUAL.md](https://github.com/ShunsukeHayashi/Miyabi/blob/main/docs/AGENT_OPERATIONS_MANUAL.md) - Agent運用マニュアル
- [GITHUB_OS_INTEGRATION.md](https://github.com/ShunsukeHayashi/Miyabi/blob/main/docs/GITHUB_OS_INTEGRATION.md) - GitHub OS統合ガイド

## 🔧 必要な環境

- **Node.js**: >=18.0.0
- **Git**: 任意のバージョン
- **GitHub CLI** (`gh`): 最新版推奨
- **Claude Code**: >=2.0.0

## 🔐 環境変数

```bash
# GitHub Personal Access Token (必須)
GITHUB_TOKEN=ghp_xxxxx

# Anthropic API Key (Agent実行時に必須)
ANTHROPIC_API_KEY=sk-ant-xxxxx

# オプション
MIYABI_LOG_LEVEL=info
MIYABI_PARALLEL_AGENTS=3
```

## 🎓 組織設計原則 5原則

Miyabi は株式会社組織設計の理論に基づいた自律型組織設計を実装:

1. **責任の明確化** - 各AgentがIssueに対する責任を負う
2. **権限の委譲** - Agentは自律的に判断・実行可能
3. **階層の設計** - CoordinatorAgent → 各専門Agent
4. **結果の評価** - 品質スコア、カバレッジ、実行時間で評価
5. **曖昧性の排除** - DAGによる依存関係明示、状態ラベルで進捗可視化

## 📈 パフォーマンス

- **並列実行効率**: 72% (Phase A → B/E並列化で36h → 26h)
- **Critical Path最適化**: DAGベース依存関係解析
- **テストカバレッジ**: 100% (234/234テスト成功)
- **レート制限対応**: Exponential backoff実装済み

## 🌐 リンク

- **Repository**: https://github.com/ShunsukeHayashi/Miyabi
- **NPM Package**: https://www.npmjs.com/package/miyabi
- **Dashboard**: https://shunsukehayashi.github.io/Miyabi/
- **Landing Page**: https://shunsukehayashi.github.io/Miyabi/landing.html
- **Issues**: https://github.com/ShunsukeHayashi/Miyabi/issues
- **Discussions**: https://github.com/ShunsukeHayashi/Miyabi/discussions

## 🤝 コントリビューション

コントリビューションを歓迎します！

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

詳細: [CONTRIBUTING.md](https://github.com/ShunsukeHayashi/Miyabi/blob/main/CONTRIBUTING.md)

## 📝 ライセンス

Apache License 2.0 - [LICENSE](https://github.com/ShunsukeHayashi/Miyabi/blob/main/LICENSE) をご覧ください。

## 👤 作者

**Shunsuke Hayashi**

- GitHub: [@ShunsukeHayashi](https://github.com/ShunsukeHayashi)
- Email: supernovasyun@gmail.com

## 🙏 謝辞

- Anthropic Claude Team - Claude Code Plugin システム
- GitHub Team - GitHub as OS アーキテクチャ
- 組織設計原則コミュニティ - 自律型組織設計理論

---

**🌸 Miyabi** - Beauty in Autonomous Development

Made with ❤️ by [Shunsuke Hayashi](https://github.com/ShunsukeHayashi)
