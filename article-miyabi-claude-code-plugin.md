# Miyabi × Claude Code Plugin リリース 🌸 - 一つのコマンドで開発が完結する時代へ

## はじめに

こんにちは、Miyabi開発者の Shunsuke Hayashi です。

開発者の皆さん、こんな経験はありませんか？

- Issue作成からPR作成まで、手作業が多すぎる
- レビュー待ちで開発が止まる
- テストやデプロイの自動化がまだ不十分
- 複数のIssueを並行して処理したいが、ブランチの切り替えが面倒

今日は、そんな課題を解決する新しいツール **Miyabi Claude Code Plugin** をリリースしたので、その紹介をさせてください。

---

## Miyabiとは？

**Miyabi（雅）** は、**"Beauty in Autonomous Development"** - 美しい自律型開発を実現するフレームワークです。

「一つのコマンドで全てが完結する」というコンセプトのもと、Issue作成からコード実装、PR作成、デプロイまでを**完全自動化**します。

```bash
# たったこれだけで、全てが始まる
npx miyabi
```

### コアコンセプト

Miyabiは「GitHub as OS」というアーキテクチャに基づいています。GitHubの15のコンポーネント（Issues、Actions、Projects V2、Webhooks、Pages、Packages等）を統合し、一つの巨大なオペレーティングシステムとして扱います。

その上で動作する**7つの自律Agent**が、開発プロセスのあらゆるタスクを自動実行します。

---

## 🎉 Claude Code Plugin 統合 - v0.8.2 リリース

そして本日、**Miyabi v0.8.2** がリリースされました。

最大の特徴は、**Claude Code Plugin統合**です。

[Claude Code](https://claude.ai/code) は、Anthropic社が提供するAIペアプログラミングツールです。Miyabiは、このClaude Codeと深く統合され、開発フローの中でシームレスに利用できるようになりました。

### セットアップ方法

Miyabiプロジェクトでは、`.claude/`ディレクトリが自動的にセットアップされます。このディレクトリには、Claude Codeが認識する設定ファイル、カスタムコマンド、Agent定義、MCP Server統合が含まれています。

```bash
# 新規プロジェクト作成時に自動セットアップ
npx miyabi init my-awesome-app

# 既存プロジェクトに追加
cd my-existing-project
npx miyabi install
```

これだけで、Miyabiの全機能がClaude Codeから利用可能になります。

---

## 主要機能

### 1. 8つのSlash Commands

インストール後、以下のコマンドが利用可能になります：

| コマンド | 機能 |
|---------|------|
| `/miyabi-init` | 新規プロジェクト作成（53ラベル、26ワークフロー自動セットアップ） |
| `/miyabi-status` | ステータス確認（リアルタイムIssue/PR状態表示） |
| `/miyabi-auto` | Water Spider自動モード（Issue自動処理） |
| `/miyabi-todos` | TODO検出→Issue化（コード内TODO自動検出） |
| `/miyabi-agent` | Agent実行（7つのAgentから選択実行） |
| `/miyabi-docs` | ドキュメント生成（README/API/Architecture docs） |
| `/miyabi-deploy` | デプロイ実行（staging/production デプロイ） |
| `/miyabi-test` | テスト実行（unit/integration/e2e テスト） |

### 2. 7つの自律Agent

MiyabiのコアとなるAgentシステム。それぞれが専門的な役割を持ち、自律的に判断・実行します。

| Agent | 役割 | 主な機能 |
|:-----:|:----:|:---------|
| 🎯 **CoordinatorAgent** | タスク統括 | DAG分解、並列実行制御、進捗管理 |
| 🏷️ **IssueAgent** | Issue分析 | 53ラベル自動分類、優先度判定 |
| 💻 **CodeGenAgent** | コード生成 | Claude Sonnet 4による高品質実装 |
| 🔍 **ReviewAgent** | 品質判定 | 静的解析、セキュリティスキャン、100点満点スコアリング |
| 📝 **PRAgent** | PR作成 | Conventional Commits準拠、Draft PR自動生成 |
| 🚀 **DeploymentAgent** | デプロイ | Firebase自動デプロイ・Rollback |
| 🧪 **TestAgent** | テスト | Vitest自動実行、80%+カバレッジ |

### 3. 4つのEvent Hooks（Plugin限定機能）

Claude Code Pluginとして使用すると、以下のイベントフックが自動実行されます：

| Hook | タイミング | 実行内容 |
|------|----------|---------|
| `pre-commit` | コミット前 | ✅ Lint実行<br>✅ Type check<br>✅ テスト実行 |
| `post-commit` | コミット後 | ✅ コミット情報表示<br>✅ メトリクス更新 |
| `pre-pr` | PR作成前 | ✅ Rebase確認<br>✅ テスト実行<br>✅ カバレッジ確認<br>✅ Conventional Commits検証 |
| `post-test` | テスト後 | ✅ カバレッジレポート生成<br>✅ HTMLレポート出力<br>✅ 結果アーカイブ |

### 4. 11のMCP Tools

Model Context Protocol (MCP) ツールによって、Agentとの統合がシームレスに行われます。

主要なMCPツール：
- `miyabi__docs` - ドキュメント自動生成
- `miyabi__deploy` - デプロイ実行
- `miyabi__test` - テスト実行
- `miyabi__status` - ステータス確認
- `miyabi__todos` - TODO検出
- その他6つのツール

---

## 🏗️ Git Worktree並列実行アーキテクチャ

Miyabiの最大の技術的特徴は、**Git Worktree並列実行アーキテクチャ**です。

従来のブランチ切り替えではなく、各Issueごとに独立したWorktreeを作成し、完全に並列で処理を実行します。

### アーキテクチャ図

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

### メリット

1. **真の並列実行** - 各IssueがWorktreeで独立して動作
2. **コンフリクトの最小化** - 独立したディレクトリで作業
3. **簡単なロールバック** - Worktree単位で破棄可能
4. **デバッグが容易** - 各Worktreeで独立したログ
5. **スケーラビリティ** - Worktree数に制限なし

### 実行例

```bash
# 3つのIssueを並列処理（concurrency=2で同時実行数制限）
npm run agents:parallel:exec -- --issues=270,271,272 --concurrency=2
```

各Worktree内で、Claude Codeが自動的にAgentを実行し、コード生成・テスト・レビューを完了します。

---

## 📊 パフォーマンス・品質指標

### 並列実行効率: **72%向上**

```
従来のシーケンシャル実行:
A → B → C → D → E → F   (36時間)

Miyabiの並列実行:
     ┌─ B ─┐
A ──┤      ├─ F         (26時間)
     └─ E ─┘
     ↓ 72%効率化 (-10時間)
```

### その他の指標

| 指標 | 数値 |
|------|------|
| 🧪 **テストカバレッジ** | 83.78% |
| ⭐ **品質スコア基準** | 80点以上でマージ可能 |
| ⚡ **平均処理時間** | 10-15分（Issue → PR） |
| 🎯 **成功率** | 95%+（自動PR作成） |

---

## 実際の使い方

### Step 1: Miyabiプロジェクト作成

```bash
# ターミナルで実行
npx miyabi init my-awesome-app
```

### Step 2: Claude Codeでプロジェクトを開く

作成されたプロジェクトをClaude Codeで開くと、自動的に`.claude/`ディレクトリが認識され、Miyabiのカスタムコマンドが利用可能になります。

### Step 3: カスタムコマンドの利用

Claude Code内で、以下のようなカスタムコマンドが利用可能になります：

```bash
/miyabi-status    # プロジェクト状態確認
/miyabi-auto      # 自動モード起動
/miyabi-todos     # TODO検出
/miyabi-agent     # Agent実行
```

### Step 4: 自動モード起動

```bash
/miyabi-auto --interval=10 --max-duration=60
```

Water Spider（ウォータースパイダー）モードが起動し、10秒ごとにシステム状態を監視。Issueを自動処理します。

### Step 5: レビュー & マージ

Agentが作成したPRをレビューして、マージするだけ。

---

## 53ラベル体系 - "Everything starts with an Issue. Labels define the state."

MiyabiのもうひとつのコアコンセプトがLabel Systemです。

**10のカテゴリ、53のラベル**で、Issueの状態を完全に管理します。

### 状態遷移フロー

```
📥 pending → 🔍 analyzing → 🏗️ implementing → 👀 reviewing → ✅ done
```

### 主要カテゴリ

1. **STATE** (8個): ライフサイクル管理 - `📥 state:pending`, `✅ state:done`
2. **AGENT** (6個): Agent割り当て - `🤖 agent:coordinator`, `🤖 agent:codegen`
3. **PRIORITY** (4個): 優先度管理 - `🔥 priority:P0-Critical` ～ `📝 priority:P3-Low`
4. **TYPE** (7個): Issue分類 - `✨ type:feature`, `🐛 type:bug`, `📚 type:docs`
5. **SEVERITY** (4個): 深刻度 - `🚨 severity:Sev.1-Critical`

その他、PHASE、SPECIAL、TRIGGER、QUALITY、COMMUNITYカテゴリがあります。

詳細は [LABEL_SYSTEM_GUIDE.md](https://github.com/ShunsukeHayashi/Miyabi/blob/main/docs/LABEL_SYSTEM_GUIDE.md) をご覧ください。

---

## 組織設計原則（Organizational Design Principles）

Miyabiは、単なるツールではなく、**組織設計理論に基づいた自律型システム**です。

以下の5原則に基づいて設計されています：

1. **責任の明確化** - 各AgentがIssueに対する責任を負う
2. **権限の委譲** - Agentは自律的に判断・実行可能
3. **階層の設計** - CoordinatorAgent → 各専門Agent
4. **結果の評価** - 品質スコア、カバレッジ、実行時間で評価
5. **曖昧性の排除** - DAGによる依存関係明示、状態ラベルで進捗可視化

この設計思想により、Agentは「指示待ち」ではなく、**自ら考えて動く**ことができます。

---

## セキュリティ・品質管理

### 多層セキュリティ対策

| 対策カテゴリ | 実装内容 |
|------------|---------|
| 🔍 **静的解析** | CodeQL（GitHub Advanced Security）<br>ESLint セキュリティルール<br>TypeScript strict mode |
| 🔒 **シークレット管理** | Gitleaks統合<br>`.env`ファイル自動除外<br>GitHub Secrets推奨<br>gh CLI優先認証 |
| 📦 **依存関係** | Dependabot自動PR<br>npm audit統合<br>SBOM生成（CycloneDX）<br>OpenSSF Scorecard |
| 🔐 **アクセス制御** | CODEOWNERS自動生成<br>ブランチ保護ルール<br>最小権限の原則<br>2FA推奨 |

### ReviewAgentによる品質判定

ReviewAgentは、以下の基準でコードを100点満点で評価します：

- **80点以上**: マージ可能
- **60-79点**: 改善推奨
- **59点以下**: 再実装必要

評価項目：
- 静的解析結果
- セキュリティスキャン結果
- テストカバレッジ
- コードの複雑度
- ドキュメントの充実度

---

## 今後の展望

### ロードマップ（予定）

**v0.15.0（2025年Q1予定）**
- Package export設定の最適化
- テスト成功率を80%+に向上

**v0.16.0（2025年Q2予定）**
- Integration test scripts実装
- テスト成功率を100%に到達

**v1.0.0（2025年Q3予定）**
- 安定版リリース
- エンタープライズサポート
- マルチリポジトリ対応

### コミュニティ

Miyabi Community Discordを準備中です。開発者同士の交流、週次Office Hours、月次ハッカソンを計画しています。

詳細は [Discord Community Plan](https://github.com/ShunsukeHayashi/Miyabi/blob/main/DISCORD_COMMUNITY_PLAN.md) をご覧ください。

---

## まとめ

Miyabi Claude Code Pluginは、**開発プロセスの完全自動化**を実現します。

**たった一つのコマンド**で、Issue作成からPR作成、デプロイまでが完結する世界。それが、Miyabiが目指す **"Beauty in Autonomous Development"** です。

### 今すぐ試す

```bash
# ターミナルで実行
npx miyabi

# 新規プロジェクト作成
npx miyabi init my-awesome-app

# 既存プロジェクトに追加
cd my-existing-project
npx miyabi install
```

### リンク

- **GitHub**: https://github.com/ShunsukeHayashi/Autonomous-Operations
- **npm**: https://www.npmjs.com/package/miyabi
- **Dashboard**: https://shunsukehayashi.github.io/Miyabi/
- **X (Twitter)**: [@The_AGI_WAY](https://x.com/The_AGI_WAY)

### あなたのフィードバックを待っています

GitHub Starをいただけると、開発の励みになります。

[![GitHub Stars](https://img.shields.io/github/stars/ShunsukeHayashi/Autonomous-Operations?style=social)](https://github.com/ShunsukeHayashi/Autonomous-Operations)

バグ報告や機能要望は、[GitHub Issues](https://github.com/ShunsukeHayashi/Autonomous-Operations/issues) へお願いします。

---

🌸 **Miyabi** - Beauty in Autonomous Development

🤖 Powered by Claude AI • 🔒 Apache 2.0 License • 💖 Made with Love

---

**Author**: Shunsuke Hayashi
**Website**: https://note.ambitiousai.co.jp/
**Contact**: [@The_AGI_WAY](https://x.com/The_AGI_WAY)

