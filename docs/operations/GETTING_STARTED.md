# はじめてのAutonomous Operations

**完全自律型AI開発オペレーションプラットフォーム - 初心者向け完全ガイド**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-20+-green.svg)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8+-blue.svg)](https://www.typescriptlang.org/)

**最終更新**: 2025-10-08
**バージョン**: 2.0.0
**対象読者**: 初心者〜中級者
**所要時間**: 約45分

---

## 📚 目次

1. [はじめに](#1-はじめに)
2. [前提条件](#2-前提条件)
3. [セットアップ](#3-セットアップ)
4. [動作確認](#4-動作確認)
5. [初回Agent実行](#5-初回agent実行)
6. [Claude Code 統合](#6-claude-code-統合)
7. [よくある質問](#7-よくある質問)
8. [次のステップ](#8-次のステップ)
9. [トラブルシューティング](#9-トラブルシューティング)

---

## 1. はじめに

### 1.1 Autonomous Operationsとは？

Autonomous Operations は、**人間の介入を最小限に抑える完全自律型AI開発オペレーション**を実現するための統合プラットフォームです。

```
従来の開発フロー:
  Issue作成 → 人間が実装 → 人間がテスト → 人間がレビュー → 人間がデプロイ
  ⏱️ 所要時間: 数日〜数週間

Autonomous Operationsのフロー:
  Issue作成 → AI Agent自動実装 → 自動テスト → 自動レビュー → Draft PR作成 → 人間承認 → 自動デプロイ
  ⏱️ 所要時間: 数分〜数時間
```

### 1.2 このガイドで学べること

このガイドを読むことで、以下のスキルが身につきます：

✅ プロジェクトのセットアップと初期化
✅ 環境変数とAPI Keysの適切な設定
✅ 初回Agent実行とその結果確認
✅ GitHub Actions統合とCI/CD自動化
✅ Claude Codeとの連携とカスタムコマンド活用
✅ トラブルシューティングと問題解決

### 1.3 主要機能の概要

#### Agent階層システム

```
┌─────────────────────────────────────┐
│  Human Layer (戦略・承認)            │
│  TechLead / PO / CISO               │
└────────────┬────────────────────────┘
             │ Escalation
┌────────────┴────────────────────────┐
│  Coordinator Layer (統括)           │
│  CoordinatorAgent                   │
│  - タスク分解・DAG構築               │
│  - 並行実行制御                     │
└────────────┬────────────────────────┘
             │ Assignment
┌────────────┴────────────────────────┐
│  Specialist Layer (実行)            │
│  CodeGenAgent / ReviewAgent /       │
│  IssueAgent / PRAgent /             │
│  DeploymentAgent                    │
└─────────────────────────────────────┘
```

#### 完全自律型ワークフロー

```mermaid
graph LR
    A[Issue作成] --> B[IssueAgent分析]
    B --> C[CoordinatorAgent<br/>タスク分解]
    C --> D[並行実行]
    D --> E1[CodeGenAgent]
    D --> E2[ReviewAgent]
    D --> E3[TestAgent]
    E1 --> F{品質スコア<br/>≥80点?}
    E2 --> F
    E3 --> F
    F -->|Yes| G[PRAgent<br/>Draft PR作成]
    F -->|No| H[自動修正<br/>またはエスカレーション]
    H --> E1
    G --> I[人間レビュー]
    I --> J[Merge承認]
    J --> K[DeploymentAgent<br/>自動デプロイ]
```

### 1.4 組織設計原則5原則

Autonomous Operationsは、組織設計原則5原則に基づいて設計されています：

| 原則 | 実装内容 | 効果 |
|------|---------|------|
| **1. 責任と権限の明確化** | Agent階層・Label体系・CODEOWNERS | 誰が何をするか明確 |
| **2. 結果重視** | quality_score・KPI自動収集 | 客観的な成果評価 |
| **3. 階層の明確化** | Coordinator-Specialist階層 | エスカレーションパス明確 |
| **4. 誤解・錯覚の排除** | 構造化プロトコル・完了条件チェック | 曖昧さを排除 |
| **5. 感情的判断の排除** | 数値ベース判定（80点基準等） | データ駆動の意思決定 |

---

## 2. 前提条件

### 2.1 必須ソフトウェア

以下のソフトウェアがインストールされていることを確認してください：

#### Node.js 20以上

```bash
# バージョン確認
node -v
# 期待される出力: v20.x.x 以上

# インストールされていない場合
# macOS (Homebrew)
brew install node@20

# Windows (Winget)
winget install OpenJS.NodeJS.LTS

# Linux (apt)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
```

#### npm 10以上

```bash
# バージョン確認
npm -v
# 期待される出力: 10.x.x 以上

# アップグレード
npm install -g npm@latest
```

#### Git 2.40以上

```bash
# バージョン確認
git --version
# 期待される出力: git version 2.40.x 以上

# インストール
# macOS (Homebrew)
brew install git

# Windows (Winget)
winget install Git.Git

# Linux (apt)
sudo apt-get install git
```

#### GitHub CLI (gh) - オプションだが推奨

```bash
# バージョン確認
gh --version
# 期待される出力: gh version 2.40.x 以上

# インストール
# macOS (Homebrew)
brew install gh

# Windows (Winget)
winget install GitHub.cli

# Linux (apt)
sudo apt install gh
```

### 2.2 必須アカウント

#### GitHubアカウント

1. [github.com](https://github.com) でアカウント作成
2. 新規リポジトリの作成権限を確認
3. Personal Access Token（PAT）作成の準備

#### Anthropic APIアカウント

1. [console.anthropic.com](https://console.anthropic.com/) でアカウント作成
2. 課金設定を完了（クレジットカード登録）
3. Claude Sonnet 4へのアクセス権限を確認

**💡 ヒント**: 初回利用時は$5〜$20程度のクレジットが無料で付与される場合があります。

### 2.3 推奨環境

| 項目 | 推奨スペック | 最低スペック |
|------|------------|------------|
| **OS** | macOS 13+, Windows 11, Ubuntu 22.04+ | macOS 11+, Windows 10, Ubuntu 20.04+ |
| **CPU** | 8コア以上 | 4コア以上 |
| **メモリ** | 16GB以上 | 8GB以上 |
| **ディスク** | 50GB以上の空き容量 | 20GB以上の空き容量 |
| **ネットワーク** | 安定したインターネット接続 | 必須 |

### 2.4 推奨エディタ

- **Visual Studio Code** (推奨)
- **Cursor** (AI統合エディタ)
- **Claude Code CLI** (コマンドライン)

---

## 3. セットアップ

### 3.1 Template Repositoryからの作成

#### Option A: GitHubテンプレート機能を使用（推奨）

1. **テンプレートリポジトリにアクセス**

   ```
   https://github.com/ShunsukeHayashi/Autonomous-Operations
   ```

2. **"Use this template" をクリック**

   ![Use Template Button](./docs/images/use-template.png)

3. **新規リポジトリ情報を入力**

   - **Repository name**: `my-autonomous-project` (任意の名前)
   - **Description**: `AI-driven autonomous development system` (任意)
   - **Visibility**: `Public` または `Private`

4. **"Create repository from template" をクリック**

#### Option B: GitHub CLI を使用

```bash
# テンプレートから新規リポジトリ作成
gh repo create my-autonomous-project \
  --template ShunsukeHayashi/Autonomous-Operations \
  --public \
  --clone

# ディレクトリ移動
cd my-autonomous-project
```

#### Option C: 手動でClone

```bash
# テンプレートをClone
git clone https://github.com/ShunsukeHayashi/Autonomous-Operations.git my-autonomous-project

# ディレクトリ移動
cd my-autonomous-project

# リモート設定変更
git remote remove origin
git remote add origin https://github.com/YOUR_USERNAME/my-autonomous-project.git
```

### 3.2 Clone とディレクトリ移動

既にリポジトリを作成している場合：

```bash
# リポジトリをClone
git clone https://github.com/YOUR_USERNAME/my-autonomous-project.git

# ディレクトリ移動
cd my-autonomous-project

# ブランチ確認
git branch
# 期待される出力: * main

# リモート確認
git remote -v
# 期待される出力:
# origin  https://github.com/YOUR_USERNAME/my-autonomous-project.git (fetch)
# origin  https://github.com/YOUR_USERNAME/my-autonomous-project.git (push)
```

### 3.3 初期化スクリプト実行

#### ステップ1: スクリプト実行権限付与

```bash
chmod +x scripts/init-project.sh
```

#### ステップ2: 初期化スクリプト実行

```bash
./scripts/init-project.sh
```

#### ステップ3: プロンプトに従って情報入力

```bash
🚀 Autonomous Operations - プロジェクト初期化
================================================

📝 プロジェクト情報を入力してください
========================================

プロジェクト名 (例: my-awesome-project): my-autonomous-project ⏎
GitHub オーナー名 (例: your-username): your-username ⏎
プロジェクト説明 (任意): AI-driven autonomous development system ⏎
デバイス識別子 (デフォルト: MacBook-Pro.local): MacBook Pro 16-inch ⏎
```

#### ステップ4: スクリプトが自動実行する処理

```bash
🔧 設定を適用しています...
========================================
📦 package.json を更新中...
✅ 完了

📄 README.md を更新中...
✅ 完了

🔐 .env ファイルを生成中...
✅ .env ファイルを作成しました

⚙️  Claude Code 設定を生成中...
✅ .claude/settings.local.json を作成しました

📁 必要なディレクトリを作成中...
✅ ディレクトリ構造を作成しました
```

#### ステップ5: API Keys設定オプション

```bash
🔑 API Keysを設定してください
========================================

今すぐAPIキーを入力しますか？ (y/N): y ⏎

GitHub Token (ghp_...): ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx ⏎
Anthropic API Key (sk-ant-...): sk-ant-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx ⏎

✅ GitHub Tokenを設定しました
✅ Anthropic API Keyを設定しました
```

**💡 ヒント**: API Keysをスキップした場合は、後で `.env` ファイルを手動編集してください。

#### ステップ6: 依存関係インストール

```bash
📦 依存関係をインストール中...
========================================

> npm install

added 324 packages, and audited 325 packages in 12s

✅ 依存関係をインストールしました
```

#### ステップ7: 動作確認

```bash
🧪 動作確認を実行中...
========================================
✅ TypeScript: エラーなし
✅ Tests: 合格
```

#### ステップ8: 完了メッセージ

```bash
🎉 初期化完了！
========================================

次のステップ：

1. APIキーの設定確認:
   vim .env

2. GitHub Secretsの設定 (GitHub Actions用):
   - Repository Settings → Secrets and variables → Actions
   - ANTHROPIC_API_KEY を追加
   - GITHUB_TOKEN は自動で利用可能

3. 動作確認:
   npm run verify

4. 初回Agent実行 (Claude Code内で):
   /agent-run --help

5. ドキュメントを確認:
   - GETTING_STARTED.md (このファイル)
   - docs/AGENT_OPERATIONS_MANUAL.md (運用マニュアル)
```

### 3.4 API Keys 設定

#### GitHub Personal Access Token (PAT) の作成

1. **GitHubにログイン** → [Settings](https://github.com/settings/tokens)

2. **Developer settings → Personal access tokens → Tokens (classic)**

3. **"Generate new token (classic)" をクリック**

4. **トークン設定**
   - **Note**: `Autonomous Operations - Development`
   - **Expiration**: `90 days` (推奨)
   - **Select scopes**:
     - ✅ `repo` (Full control of private repositories)
     - ✅ `workflow` (Update GitHub Action workflows)
     - ✅ `write:packages` (Upload packages to GitHub Package Registry)
     - ✅ `read:org` (Read org and team membership)

5. **"Generate token" をクリック**

6. **トークンをコピー** (一度しか表示されません！)

   ```
   ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   ```

7. **`.env` ファイルに追加**

   ```bash
   vim .env
   ```

   ```env
   GITHUB_TOKEN=ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   ```

#### Anthropic API Key の作成

1. **Anthropic Consoleにログイン** → [API Keys](https://console.anthropic.com/settings/keys)

2. **"Create Key" をクリック**

3. **キー設定**
   - **Name**: `Autonomous Operations Dev`
   - **Type**: `API Key`

4. **キーをコピー**

   ```
   sk-ant-api03-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   ```

5. **`.env` ファイルに追加**

   ```bash
   vim .env
   ```

   ```env
   ANTHROPIC_API_KEY=sk-ant-api03-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   ```

#### .env ファイルの最終確認

```bash
# .env ファイルの内容確認
cat .env
```

期待される出力：

```env
# Autonomous Operations - Environment Variables
# Generated: 2025-10-08

# GitHub Configuration
GITHUB_TOKEN=ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
REPOSITORY=your-username/my-autonomous-project

# Anthropic API
ANTHROPIC_API_KEY=sk-ant-api03-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Device Identifier
DEVICE_IDENTIFIER=MacBook Pro 16-inch

# Optional: Logging Level
LOG_LEVEL=info
```

**⚠️ 重要**: `.env` ファイルは `.gitignore` に含まれているため、Gitにコミットされません。秘密情報を安全に保管してください。

### 3.5 GitHub Secrets 設定

GitHub Actions でAgentを自動実行するために、リポジトリにSecretsを設定します。

#### ステップ1: リポジトリ設定にアクセス

```
https://github.com/YOUR_USERNAME/my-autonomous-project/settings/secrets/actions
```

または、GitHub CLI:

```bash
gh repo view --web
# Settings → Secrets and variables → Actions
```

#### ステップ2: ANTHROPIC_API_KEY を追加

1. **"New repository secret" をクリック**

2. **Secret設定**
   - **Name**: `ANTHROPIC_API_KEY`
   - **Secret**: `sk-ant-api03-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

3. **"Add secret" をクリック**

#### ステップ3: GITHUB_TOKEN 確認

`GITHUB_TOKEN` は GitHub Actions によって自動的に提供されるため、手動設定は不要です。

**✅ 設定完了**: GitHub Actions で Autonomous Agent が実行可能になりました。

---

## 4. 動作確認

### 4.1 npm run verify

プロジェクトが正しくセットアップされたことを確認します。

```bash
npm run verify
```

期待される出力：

```bash
🚀 Autonomous Operations - System Verification
================================================

✅ Environment Variables Check
   GITHUB_TOKEN: ✓ Set (ghp_****...****)
   ANTHROPIC_API_KEY: ✓ Set (sk-ant-****...****)
   REPOSITORY: ✓ Set (your-username/my-autonomous-project)
   DEVICE_IDENTIFIER: ✓ Set (MacBook Pro 16-inch)

✅ Node.js Version: v20.10.0
✅ npm Version: 10.2.3
✅ TypeScript Version: 5.8.3

🔍 Running TypeScript Compilation...
✅ TypeScript: 0 errors

🧪 Running Tests...
✅ Tests: 7 passed, 7 total

📂 Directory Structure Check:
   ✓ .ai/logs/
   ✓ .ai/parallel-reports/
   ✓ .ai/issues/
   ✓ .claude/
   ✓ scripts/

🎉 All checks passed! System is ready.
```

### 4.2 TypeScript チェック

TypeScript のコンパイルエラーがないことを確認します。

```bash
npm run typecheck
```

期待される出力：

```bash
> autonomous-operations@2.0.0 typecheck
> tsc --noEmit

✅ No TypeScript errors found.
```

**⚠️ エラーが出た場合**:

```bash
❌ Error: TS2307: Cannot find module '@anthropic-ai/sdk' or its corresponding type declarations.
```

**解決策**:

```bash
# 依存関係を再インストール
rm -rf node_modules package-lock.json
npm install
```

### 4.3 Tests

テストスイートが正常に動作することを確認します。

```bash
npm test
```

期待される出力：

```bash
> autonomous-operations@2.0.0 test
> vitest

 ✓ tests/agents/base-agent.test.ts (3)
   ✓ BaseAgent initialization
   ✓ BaseAgent logging
   ✓ BaseAgent error handling

 ✓ tests/agents/coordinator-agent.test.ts (2)
   ✓ Task decomposition
   ✓ DAG construction

 ✓ tests/scripts/parallel-executor.test.ts (2)
   ✓ Parallel execution
   ✓ Concurrency control

 Test Files  3 passed (3)
      Tests  7 passed (7)
   Start at  12:34:56
   Duration  1.23s
```

**💡 ヒント**: 特定のテストのみ実行する場合：

```bash
# CoordinatorAgent のテストのみ
npm test -- coordinator-agent

# Watch モード（ファイル変更時に自動再実行）
npm test -- --watch
```

### 4.4 CLI 動作確認

Autonomous Agent システムのCLIが動作することを確認します。

```bash
npm run agents:parallel:exec -- --help
```

期待される出力：

```bash
🤖 Autonomous Operations - Parallel Executor

Usage:
  npm run agents:parallel:exec -- [options]

Options:
  --issue <number>           Single issue number to process
  --issues <n1,n2,...>       Multiple issue numbers (comma-separated)
  --concurrency <number>     Number of concurrent executions (default: 2)
  --dry-run                  Run without making changes
  --log-level <level>        Log level: debug, info, warn, error (default: info)
  --help                     Show this help message

Examples:
  # Process single issue
  npm run agents:parallel:exec -- --issue 123

  # Process multiple issues with concurrency
  npm run agents:parallel:exec -- --issues 123,124,125 --concurrency 3

  # Dry run (no changes)
  npm run agents:parallel:exec -- --issue 123 --dry-run

Environment Variables:
  GITHUB_TOKEN          GitHub Personal Access Token (required)
  ANTHROPIC_API_KEY     Anthropic API Key (required)
  REPOSITORY            GitHub repository (owner/repo format)
  DEVICE_IDENTIFIER     Device identifier for logs
```

**✅ すべての確認が完了したら、次は初回Agent実行です！**

---

## 5. 初回Agent実行

### 5.1 Issue作成方法

#### 方法A: GitHub Web UI から作成（初心者向け）

1. **リポジトリのIssuesページにアクセス**

   ```
   https://github.com/YOUR_USERNAME/my-autonomous-project/issues
   ```

2. **"New issue" をクリック**

3. **Issue情報を入力**

   - **Title**: `Add user authentication feature`

   - **Description**:
     ```markdown
     ## 概要
     ユーザー認証機能を実装する

     ## 詳細
     - ログイン機能
     - サインアップ機能
     - パスワードリセット機能

     ## 受け入れ条件
     - [ ] ユーザーがメールアドレスとパスワードでログインできる
     - [ ] 新規ユーザーがアカウント作成できる
     - [ ] パスワードリセットメールが送信される
     ```

4. **Labelを追加** (右側のメニュー)
   - `✨feature`
   - `⭐Sev.2-High`
   - `🤖agent-execute` ← これが重要！

5. **"Submit new issue" をクリック**

#### 方法B: GitHub CLI から作成（推奨）

```bash
# Issue作成
gh issue create \
  --title "Add user authentication feature" \
  --body "$(cat <<'EOF'
## 概要
ユーザー認証機能を実装する

## 詳細
- ログイン機能
- サインアップ機能
- パスワードリセット機能

## 受け入れ条件
- [ ] ユーザーがメールアドレスとパスワードでログインできる
- [ ] 新規ユーザーがアカウント作成できる
- [ ] パスワードリセットメールが送信される
EOF
)" \
  --label "✨feature,⭐Sev.2-High,🤖agent-execute"
```

期待される出力：

```bash
Creating issue in your-username/my-autonomous-project

https://github.com/your-username/my-autonomous-project/issues/1
```

#### 方法C: Issueテンプレートを使用

プロジェクトに `.github/ISSUE_TEMPLATE/autonomous-agent-task.md` がある場合：

1. **New issue → 🤖 Autonomous Agent Task を選択**

2. **テンプレートに従って入力**

3. **Submit**

### 5.2 Label付与

#### 自動でLabelが付与される場合

IssueAgent が自動的にIssue内容を分析し、適切なLabelを付与します：

- **業務カテゴリ**: `✨feature`, `🐛bug`, `🔧refactor`, `📝docs`
- **Severity**: `🔥Sev.1-Critical`, `⭐Sev.2-High`, `➡️Sev.3-Medium`, `💤Sev.4-Low`, `📝Sev.5-Trivial`
- **Agent**: `🤖CodeGenAgent`, `🤖ReviewAgent`, etc.
- **実行トリガー**: `🤖agent-execute`

#### 手動でLabelを追加する場合

```bash
# GitHub CLI
gh issue edit 1 --add-label "🤖agent-execute"

# Web UI
Issue画面 → Labels → 🤖agent-execute をクリック
```

**💡 重要**: `🤖agent-execute` Labelを付けることで、GitHub Actions が自動的にAgentを実行します。

### 5.3 Agent実行の確認

#### 方法A: GitHub Actions の進捗確認（自動実行）

1. **Actionsタブにアクセス**

   ```
   https://github.com/YOUR_USERNAME/my-autonomous-project/actions
   ```

2. **"Autonomous Agent Execution" ワークフローを確認**

   ```
   Autonomous Agent Execution
   ├─ Check Agent Trigger ✅ (5秒)
   └─ Execute Autonomous Agents ⏳ (進行中)
      ├─ Checkout repository ✅
      ├─ Setup Node.js ✅
      ├─ Install dependencies ✅
      ├─ Run TypeScript compilation check ✅
      ├─ Create agent configuration ✅
      └─ Execute CoordinatorAgent ⏳ (進行中)
   ```

3. **ログを確認**

   "Execute CoordinatorAgent" ステップをクリックすると、詳細ログが表示されます：

   ```bash
   🚀 Starting Autonomous Agent execution for Issue #1

   🤖 Autonomous Operations - Parallel Executor
   ✅ Configuration loaded
      Device: GitHub Actions Runner
      Repository: your-username/my-autonomous-project
      Concurrency: 3

   ✅ Fetched Issue #1: Add user authentication feature

   ================================================================================
   🚀 Executing Issue #1: Add user authentication feature
   ================================================================================

   [CoordinatorAgent] 🔍 Decomposing Issue #1
   [CoordinatorAgent]    Found 5 tasks:
                          - Implement login endpoint
                          - Implement signup endpoint
                          - Implement password reset endpoint
                          - Add authentication middleware
                          - Write integration tests

   [CoordinatorAgent] 🔗 Building task dependency graph (DAG)
   [CoordinatorAgent]    Graph: 5 nodes, 4 edges, 3 levels
   [CoordinatorAgent] ✅ No circular dependencies found

   [CodeGenAgent] 🧠 Generating code with Claude AI
   [CodeGenAgent]    Generated 8 files:
                      - src/auth/login.ts
                      - src/auth/signup.ts
                      - src/auth/password-reset.ts
                      - src/middleware/auth.ts
                      - tests/auth/login.test.ts
                      - tests/auth/signup.test.ts
                      - tests/auth/password-reset.test.ts
                      - tests/middleware/auth.test.ts

   [ReviewAgent] 📊 Calculating quality score
   [ReviewAgent]    ESLint: 0 errors ✅
   [ReviewAgent]    TypeScript: 0 errors ✅
   [ReviewAgent]    Security: 0 vulnerabilities ✅
   [ReviewAgent]    Score: 92/100 ✅ (Threshold: 80)

   [PRAgent] 🚀 Creating Pull Request
   [PRAgent] ✅ PR created: #2 (draft)

   ✅ Issue #1 completed successfully
      Duration: 3 minutes 45 seconds
      Quality Score: 92/100
      Files Generated: 8
      Tests Generated: 4
   ```

#### 方法B: ローカル実行（手動テスト）

```bash
# Issue #1 を処理
npm run agents:parallel:exec -- --issue 1
```

**実行ログの見方**:

```bash
🤖 Autonomous Operations - Parallel Executor
✅ Configuration loaded
   Device: MacBook Pro 16-inch
   Repository: your-username/my-autonomous-project
   Concurrency: 2

🔍 Fetching Issue #1...
✅ Issue #1: Add user authentication feature
   Author: your-username
   Created: 2025-10-08T12:00:00Z
   Labels: ✨feature, ⭐Sev.2-High, 🤖agent-execute

================================================================================
🚀 Executing Issue #1
================================================================================

[12:34:56] [CoordinatorAgent] 🔍 Analyzing Issue...
[12:34:58] [CoordinatorAgent] ✅ Decomposed into 5 tasks
[12:34:59] [CoordinatorAgent] 🔗 Building DAG...
[12:35:00] [CoordinatorAgent] ✅ DAG: 5 nodes, 4 edges, 3 levels

[12:35:01] [CodeGenAgent] 🧠 Starting code generation...
[12:35:45] [CodeGenAgent] ✅ Generated 8 files

[12:35:46] [ReviewAgent] 📊 Running quality checks...
[12:36:10] [ReviewAgent] ✅ Quality score: 92/100

[12:36:11] [PRAgent] 🚀 Creating Pull Request...
[12:36:15] [PRAgent] ✅ PR #2 created (draft)

================================================================================
✅ Issue #1 Completed Successfully
================================================================================
   Duration: 1 minute 19 seconds
   Quality Score: 92/100
   PR: #2
```

#### Dry Run（変更を行わずに確認のみ）

```bash
npm run agents:parallel:exec -- --issue 1 --dry-run
```

Dry Run では実際のファイル書き込みやPR作成は行われず、実行計画のみが表示されます。

### 5.4 結果の確認

#### Pull Request の確認

1. **PRページにアクセス**

   ```
   https://github.com/YOUR_USERNAME/my-autonomous-project/pulls
   ```

2. **Draft PR を確認**

   ```
   🤖 feat: autonomous agent implementation for issue #1
   #2 opened by github-actions[bot] • Draft
   ```

3. **PR内容を確認**

   ```markdown
   ## 🤖 Autonomous Agent Execution Report

   **Issue**: #1
   **Triggered by**: your-username
   **Execution Date**: 2025-10-08T12:34:56Z

   ### Summary

   This PR was automatically generated by the Autonomous Operations Agent system.

   ### Changes

   - Code generated by CodeGenAgent
   - Quality checked by ReviewAgent (score ≥80)
   - Tests generated automatically

   ### Test Results

   ```
   ✅ ESLint: Passed (0 errors)
   ✅ TypeScript: Passed (0 errors)
   ✅ Security Scan: Passed (0 vulnerabilities)
   ✅ Quality Score: 92/100
   ✅ Test Coverage: 85%
   ```

   ### Checklist

   - [x] Code generated
   - [x] Tests generated
   - [x] Quality check passed
   - [ ] Manual review required
   - [ ] Ready to merge

   ### Related Issues

   Closes #1
   ```

4. **Files changed タブで変更内容を確認**

   - `src/auth/login.ts` (新規)
   - `src/auth/signup.ts` (新規)
   - `src/auth/password-reset.ts` (新規)
   - `src/middleware/auth.ts` (新規)
   - `tests/auth/login.test.ts` (新規)
   - etc.

#### 実行ログの確認

```bash
# ローカル実行ログ
cat .ai/logs/$(date +%Y-%m-%d).md

# 実行レポート (JSON)
cat .ai/parallel-reports/agents-parallel-*.json | jq
```

**実行レポートの例**:

```json
{
  "session_id": "session-1759552488828",
  "device_identifier": "MacBook Pro 16-inch",
  "timestamp": "2025-10-08T12:34:56Z",
  "issues_processed": 1,
  "total_duration_ms": 79234,
  "summary": {
    "total": 1,
    "completed": 1,
    "failed": 0,
    "success_rate": 100.0
  },
  "results": [
    {
      "issue_number": 1,
      "status": "completed",
      "quality_score": 92,
      "duration_ms": 79234,
      "files_generated": 8,
      "pr_number": 2
    }
  ]
}
```

#### Issue にコメントが自動追加される

```markdown
## ✅ Autonomous Agent Execution Complete

**Status**: Success
**Duration**: 1 minute 19 seconds
**Branch**: `agent/issue-1-123456789`

### Actions Taken

- ✅ Issue analyzed by IssueAgent
- ✅ Code generated by CodeGenAgent
- ✅ Quality checked by ReviewAgent (92/100)
- ✅ Pull Request created (#2, draft)

### Next Steps

1. Review the generated code in PR #2
2. Check test results
3. Approve or request changes
4. Merge when ready

[View Pull Request →](#2)

---

🤖 Executed by Autonomous Operations Agent System
```

**✅ おめでとうございます！初回Agent実行が完了しました。**

---

## 6. Claude Code 統合

### 6.1 Claude Code とは？

Claude Code は、Anthropic が提供する AI コーディングアシスタントです。Autonomous Operations は Claude Code と深く統合されており、カスタムコマンド、Agent定義、Hooksを活用できます。

### 6.2 カスタムコマンド

#### /test - テスト実行

```bash
# Claude Code内で実行
/test
```

実行内容：

```bash
npm run typecheck  # TypeScript型チェック
npm test           # Vitestテストスイート
```

**使用例**:

```
User: コードを変更したのでテストを実行してください

Claude: /test コマンドを実行します。

[実行結果]
✅ TypeScript: 0 errors
✅ Tests: 7 passed, 7 total
```

#### /agent-run - Agent実行

```bash
# Claude Code内で実行
/agent-run --issue 123
```

実行内容：

```bash
npm run agents:parallel:exec -- --issue 123
```

**オプション**:

```bash
# 単一Issue
/agent-run --issue 123

# 複数Issue並行実行
/agent-run --issues 123,124,125 --concurrency 3

# Dry run
/agent-run --issue 123 --dry-run
```

**使用例**:

```
User: Issue #123 を Agent に実行させてください

Claude: /agent-run --issue 123 を実行します。

[実行中...]
🚀 Executing Issue #123...
[CoordinatorAgent] 🔍 Decomposing Issue #123
[CodeGenAgent] 🧠 Generating code...
[ReviewAgent] 📊 Quality score: 88/100 ✅
[PRAgent] 🚀 PR #124 created
✅ Completed successfully
```

#### /verify - 動作確認

```bash
# Claude Code内で実行
/verify
```

実行内容：

```bash
npm run typecheck
npm test
npm run agents:parallel:exec -- --help
```

**使用例**:

```
User: システムが正常に動作しているか確認してください

Claude: /verify コマンドで動作確認を実行します。

[実行結果]
✅ TypeScript: 0 errors
✅ Tests: 7 passed
✅ CLI: Ready
🎉 All checks passed
```

#### /deploy - デプロイ

```bash
# Claude Code内で実行
/deploy
```

実行内容：

```bash
# Staging環境へデプロイ
npm run deploy:staging

# Production環境へデプロイ（CTOエスカレーション必須）
npm run deploy:production
```

**使用例**:

```
User: Staging環境にデプロイしてください

Claude: /deploy コマンドでデプロイを実行します。

[実行中...]
🚀 Deploying to staging...
✅ Build successful
✅ Tests passed
✅ Deployed to https://staging.my-app.com
```

### 6.3 Agent定義の利用

`.claude/agents/` ディレクトリには、各Agentの定義と動作仕様が記載されています。

#### CoordinatorAgent

```bash
# Claude Code内で参照
@.claude/agents/coordinator-agent.md
```

**内容抜粋**:

```markdown
# CoordinatorAgent

## 責任範囲
- タスク分解・優先順位付け
- Agent種別自動判定
- 並行度算出
- 依存関係管理 (DAG構築)
- エスカレーション判断

## 実行権限
🟢 オーケストレーション

## エスカレーション先
TechLead (循環依存検出時)
```

**使用例**:

```
User: Issue #123 を複数のタスクに分解してください

Claude: @.claude/agents/coordinator-agent.md の仕様に従って分解します。

[分解結果]
Task 1: Implement login endpoint (Priority: 1)
Task 2: Implement signup endpoint (Priority: 1)
Task 3: Add authentication middleware (Priority: 2, depends on Task 1)
Task 4: Write integration tests (Priority: 3, depends on Task 1,2,3)
```

#### CodeGenAgent

```bash
@.claude/agents/codegen-agent.md
```

**内容抜粋**:

```markdown
# CodeGenAgent

## 責任範囲
- AI駆動コード生成
- テスト自動生成
- TypeScript型定義作成
- ドキュメント生成

## 実行権限
🔵 コード生成

## エスカレーション条件
- TypeScriptコンパイルエラー（自動修正不能）
- アーキテクチャ整合性違反
- セキュリティリスク検出
```

#### ReviewAgent

```bash
@.claude/agents/review-agent.md
```

**品質スコア計算**:

```typescript
quality_score = 100
  - (eslint_errors × 20)
  - (ts_errors × 30)
  - (critical_vulnerabilities × 40)

合格ライン: 80点以上
```

### 6.4 Hooks の活用

#### auto-format.sh - 自動フォーマット

コミット前に自動的にコードをフォーマットします。

```bash
# Gitフックとして登録
ln -s ../../.claude/hooks/auto-format.sh .git/hooks/pre-commit
```

**動作**:

```bash
git commit -m "feat: add authentication"

# Hookが実行される
[pre-commit hook] Running ESLint...
✅ ESLint: 0 errors

[pre-commit hook] Running Prettier...
✅ Prettier: Formatted 3 files

[main 1a2b3c4] feat: add authentication
 3 files changed, 120 insertions(+)
```

#### log-commands.sh - コマンドログ

すべてのコマンドを `.ai/logs/` に記録します（LDD準拠）。

```bash
# Claude Code設定で有効化
{
  "hooks": {
    "userPromptSubmit": ".claude/hooks/log-commands.sh"
  }
}
```

**ログ例**:

```yaml
# .ai/logs/2025-10-08.md

tool_invocations:
  - timestamp: "2025-10-08T12:34:56Z"
    command: "npm run typecheck"
    workdir: "/Users/shunsuke/Dev/my-autonomous-project"
    status: "passed"
    notes: "TypeScript compilation successful"

  - timestamp: "2025-10-08T12:35:20Z"
    command: "npm test"
    workdir: "/Users/shunsuke/Dev/my-autonomous-project"
    status: "passed"
    notes: "7 tests passed"
```

#### validate-typescript.sh - TypeScript検証

TypeScriptコンパイルエラーをチェックします。

```bash
# 手動実行
.claude/hooks/validate-typescript.sh
```

**出力例**:

```bash
🔍 Validating TypeScript...

Running: tsc --noEmit

✅ TypeScript validation passed (0 errors)
```

### 6.5 プロジェクトコンテキストの活用

Claude Code は `.claude/settings.local.json` を参照してプロジェクトコンテキストを理解します。

```json
{
  "projectContext": "my-autonomous-project - AI-driven autonomous development system",
  "workingDirectory": "/Users/shunsuke/Dev/my-autonomous-project",
  "preferredStyle": {
    "language": "TypeScript",
    "typeMode": "strict",
    "commitMessage": "conventional",
    "documentation": "JSDoc",
    "testing": "Vitest"
  },
  "env": {
    "DEVICE_IDENTIFIER": "MacBook Pro 16-inch"
  }
}
```

**効果**:

- Claude は TypeScript strict mode を前提にコード生成
- コミットメッセージは Conventional Commits 形式
- テストは Vitest で記述
- JSDoc 形式のドキュメントを自動生成

---

## 7. よくある質問

### 7.1 セットアップ関連

#### Q1: `npm install` でエラーが出ます

**エラー例**:

```bash
npm ERR! code ENOENT
npm ERR! syscall open
npm ERR! path /Users/shunsuke/Dev/my-autonomous-project/package.json
npm ERR! errno -2
```

**原因**: 間違ったディレクトリで実行している

**解決策**:

```bash
# プロジェクトルートに移動
cd /Users/shunsuke/Dev/my-autonomous-project

# 再実行
npm install
```

#### Q2: API Key が認識されません

**エラー例**:

```bash
❌ Error: ANTHROPIC_API_KEY is required for CodeGenAgent
```

**原因**: `.env` ファイルが正しく設定されていない

**解決策**:

```bash
# .envファイルの確認
cat .env

# APIキーが正しく設定されているか確認
# 期待される形式:
# ANTHROPIC_API_KEY=sk-ant-api03-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# 設定されていない場合は編集
vim .env
```

#### Q3: GitHub Actions が実行されません

**原因**: Repository Secrets が設定されていない

**解決策**:

1. Repository Settings → Secrets and variables → Actions
2. `ANTHROPIC_API_KEY` を追加
3. 値: `sk-ant-api03-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

### 7.2 Agent実行関連

#### Q4: Agent実行が失敗します

**エラー例**:

```bash
❌ Failed to fetch issue #123: Not Found
```

**原因**:
- Issue番号が間違っている
- Issue が存在しない
- GitHub Token の権限が不足

**解決策**:

```bash
# Issue番号を確認
gh issue list

# GitHub Token権限を確認（repo, workflow スコープが必要）
gh auth status

# 必要に応じてToken再生成
gh auth login
```

#### Q5: 品質スコアが80点未満で失敗します

**エラー例**:

```bash
[ReviewAgent] ❌ Quality score: 65/100 (Failed)
  - ESLint errors: 15
  - TypeScript errors: 3
```

**原因**: 自動生成されたコードに修正不能なエラーがある

**解決策**:

```bash
# 手動でエラーを修正
npm run lint -- --fix

# TypeScriptエラーを確認
npm run typecheck

# 修正後、再実行
npm run agents:parallel:exec -- --issue 123
```

#### Q6: 並行実行でエラーが出ます

**エラー例**:

```bash
❌ Error: Too many concurrent tasks (max: 10)
```

**原因**: `--concurrency` の値が大きすぎる

**解決策**:

```bash
# 並行度を調整（推奨: 2-5）
npm run agents:parallel:exec -- --issues 123,124,125 --concurrency 3
```

### 7.3 Claude Code統合関連

#### Q7: カスタムコマンドが動作しません

**原因**: `.claude/` ディレクトリが正しくセットアップされていない

**解決策**:

```bash
# .claude/ディレクトリ構造を確認
ls -R .claude/

# 期待される構造:
# .claude/
# ├── agents/
# ├── commands/
# ├── hooks/
# └── settings.local.json

# commands/ ディレクトリが空の場合、Gitから復元
git checkout .claude/commands/
```

#### Q8: Hooksが実行されません

**原因**: スクリプトに実行権限がない

**解決策**:

```bash
# 実行権限を付与
chmod +x .claude/hooks/*.sh

# Gitフックとして登録（オプション）
ln -s ../../.claude/hooks/auto-format.sh .git/hooks/pre-commit
```

### 7.4 GitHub Actions関連

#### Q9: Workflow が実行されないIssueがあります

**原因**: `🤖agent-execute` Labelが付与されていない

**解決策**:

```bash
# Labelを追加
gh issue edit 123 --add-label "🤖agent-execute"

# または、Issueにコメント
gh issue comment 123 --body "/agent"
```

#### Q10: Draft PR が作成されません

**原因**: コード変更が検出されなかった

**解決策**:

1. GitHub Actions の実行ログを確認
2. "Check for generated code changes" ステップを確認
3. `has_changes=false` の場合、Issue内容が不十分

```bash
# Issueの説明を詳細化
gh issue edit 123 --body "$(cat <<'EOF'
## 詳細
[より具体的な要件を記載]

## 実装ファイル
- src/auth/login.ts
- src/auth/signup.ts

## テストファイル
- tests/auth/login.test.ts
EOF
)"
```

### 7.5 デバッグ関連

#### Q11: 詳細なログを確認したい

**解決策**:

```bash
# デバッグレベルでログ出力
npm run agents:parallel:exec -- --issue 123 --log-level debug

# 実行ログを確認
cat .ai/logs/$(date +%Y-%m-%d).md

# JSONレポートを確認
cat .ai/parallel-reports/agents-parallel-*.json | jq
```

#### Q12: エスカレーションが頻発します

**原因**:
- Issue内容が曖昧
- アーキテクチャが複雑
- セキュリティリスクが高い

**解決策**:

```bash
# エスカレーション履歴を確認
cat .ai/logs/$(date +%Y-%m-%d).md | grep -i "escalation"

# エスカレーション理由を分析
# 例: "Circular dependency detected" → Issue間の依存関係を修正
# 例: "Critical vulnerability found" → 脆弱なパッケージを更新
```

---

## 8. 次のステップ

### 8.1 運用マニュアルを読む

より詳細な運用方法を学びます：

```bash
# ドキュメントを開く
open docs/AGENT_OPERATIONS_MANUAL.md
# または
cat docs/AGENT_OPERATIONS_MANUAL.md | less
```

**学べる内容**:

- Agent階層構造の詳細
- 並行実行システムの仕組み
- 組織設計原則5原則の実装
- LDD（ログ駆動開発）プロトコル
- エスカレーションフロー
- KPI定義と測定方法

### 8.2 実践的な演習

#### 演習1: 複数Issue並行処理

```bash
# Issue #1, #2, #3 を同時に処理
npm run agents:parallel:exec -- --issues 1,2,3 --concurrency 3
```

**学習目標**:
- 並行実行の動作確認
- タスク依存関係の理解
- 実行レポートの読み方

#### 演習2: カスタムAgentの作成

```bash
# 新規Agentファイルを作成
touch .claude/agents/my-custom-agent.md
```

**内容例**:

```markdown
# MyCustomAgent

## 責任範囲
- カスタム機能の実装

## 実行権限
🔵 カスタム実行

## エスカレーション条件
- カスタムエラー → TechLead
```

#### 演習3: GitHub Actions Workflowのカスタマイズ

```bash
# Workflowファイルを編集
vim .github/workflows/autonomous-agent.yml
```

**カスタマイズ例**:
- 並行度を変更（`--concurrency 5`）
- ログレベルを変更（`--log-level debug`）
- 通知先を追加（Slack, Discord等）

### 8.3 コントリビューション

プロジェクトへの貢献方法を学びます：

```bash
# コントリビューションガイドを確認
cat CONTRIBUTING.md
```

**貢献方法**:
- バグ報告
- 機能要望
- ドキュメント改善
- コード貢献

**PR作成の流れ**:

```bash
# 1. ブランチ作成
git checkout -b feature/my-awesome-feature

# 2. 変更をコミット
git add .
git commit -m "feat: add my awesome feature

🤖 Generated with Claude Code
Co-Authored-By: Claude <noreply@anthropic.com>"

# 3. Push
git push origin feature/my-awesome-feature

# 4. Draft PR作成
gh pr create --draft \
  --title "feat: add my awesome feature" \
  --body "## Summary
[変更内容の説明]

## Test Plan
- [ ] Unit tests
- [ ] Integration tests

## Checklist
- [x] TypeScript compiled
- [x] Tests passed
- [ ] Manual review"
```

### 8.4 リソース

#### 公式ドキュメント

- [README.md](README.md) - プロジェクト概要
- [AGENTS.md](AGENTS.md) - Agent運用プロトコル
- [docs/AGENT_OPERATIONS_MANUAL.md](docs/AGENT_OPERATIONS_MANUAL.md) - 完全運用マニュアル
- [docs/AUTONOMOUS_WORKFLOW_INTEGRATION.md](docs/AUTONOMOUS_WORKFLOW_INTEGRATION.md) - ワークフロー統合ガイド
- [docs/REPOSITORY_OVERVIEW.md](docs/REPOSITORY_OVERVIEW.md) - リポジトリ概要

#### 外部リソース

- [Anthropic Claude API Documentation](https://docs.anthropic.com/)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)
- [Vitest Documentation](https://vitest.dev/)

#### コミュニティ

- **GitHub Discussions**: プロジェクトのDiscussionsで質問・議論
- **GitHub Issues**: バグ報告・機能要望
- **GitHub Pull Requests**: コード貢献

---

## 9. トラブルシューティング

### 9.1 一般的な問題

#### 問題1: Node.jsバージョンが古い

**症状**:

```bash
npm ERR! engine Unsupported engine
npm ERR! required: {"node":">=20.0.0"}
npm ERR! actual: {"npm":"9.1.0","node":"v18.12.0"}
```

**解決策**:

```bash
# Node.jsをアップグレード
# macOS (Homebrew)
brew upgrade node

# Windows (Winget)
winget upgrade OpenJS.NodeJS.LTS

# または、nvmを使用（推奨）
nvm install 20
nvm use 20
```

#### 問題2: 依存関係の競合

**症状**:

```bash
npm ERR! code ERESOLVE
npm ERR! ERESOLVE unable to resolve dependency tree
```

**解決策**:

```bash
# package-lock.jsonとnode_modulesを削除
rm -rf node_modules package-lock.json

# 再インストール
npm install

# それでも失敗する場合、強制インストール
npm install --legacy-peer-deps
```

#### 問題3: TypeScriptコンパイルエラー

**症状**:

```bash
❌ Error TS2307: Cannot find module '@anthropic-ai/sdk'
```

**解決策**:

```bash
# 型定義を再インストール
npm install --save-dev @types/node

# tsconfig.jsonを確認
cat tsconfig.json

# 期待される設定:
# {
#   "compilerOptions": {
#     "target": "ES2020",
#     "module": "ESNext",
#     "moduleResolution": "node",
#     "strict": true
#   }
# }
```

#### 問題4: Gitコミットがブロックされる

**症状**:

```bash
husky > pre-commit hook failed (add --no-verify to bypass)
```

**解決策**:

```bash
# エラー内容を確認
npm run lint

# エラーを修正
npm run lint -- --fix

# 再度コミット
git commit -m "fix: resolve linting errors"

# 緊急時のみ: Hookをスキップ（非推奨）
git commit --no-verify -m "emergency fix"
```

### 9.2 Agent実行エラー

#### エラー1: Issue取得失敗

**症状**:

```bash
❌ Failed to fetch issue #123: Not Found
```

**解決策**:

```bash
# Issueが存在するか確認
gh issue view 123

# 存在しない場合はIssue番号を修正
npm run agents:parallel:exec -- --issue 124

# GitHub Token権限を確認
gh auth status
# Scopes: repo, workflow が必要
```

#### エラー2: Claude API レート制限

**症状**:

```bash
❌ Error: Rate limit exceeded (429)
Retry-After: 60 seconds
```

**解決策**:

```bash
# 1分待機後、再実行
sleep 60
npm run agents:parallel:exec -- --issue 123

# または、並行度を下げる
npm run agents:parallel:exec -- --issues 123,124,125 --concurrency 1
```

#### エラー3: 循環依存検出

**症状**:

```bash
❌ Error: Circular dependency detected: Issue #300 → #270 → #300
```

**解決策**:

```bash
# Issue本文から相互依存を削除
gh issue edit 300 --body "$(cat <<'EOF'
## 依存関係
- Depends on: #270
(#300 への依存を削除)
EOF
)"

# 再実行
npm run agents:parallel:exec -- --issue 300
```

#### エラー4: 品質スコア不合格

**症状**:

```bash
[ReviewAgent] ❌ Quality score: 65/100 (Failed)
  - ESLint errors: 15 (-300 points)
  - TypeScript errors: 3 (-90 points)
```

**解決策**:

```bash
# エラーを手動修正
npm run lint -- --fix
npm run typecheck

# 修正内容を確認
git diff

# コミット
git add .
git commit -m "fix: resolve linting and type errors"

# 再実行
npm run agents:parallel:exec -- --issue 123
```

### 9.3 GitHub Actions エラー

#### エラー1: Workflow がトリガーされない

**原因**:
- Label が正しくない
- Workflow ファイルが存在しない

**解決策**:

```bash
# Workflowファイルを確認
cat .github/workflows/autonomous-agent.yml

# Label を確認
gh issue view 123 --json labels

# 🤖agent-execute Label を追加
gh issue edit 123 --add-label "🤖agent-execute"
```

#### エラー2: Secret が設定されていない

**症状**:

```bash
❌ Error: ANTHROPIC_API_KEY is required
```

**解決策**:

1. Repository Settings → Secrets and variables → Actions
2. "New repository secret"
3. Name: `ANTHROPIC_API_KEY`
4. Secret: `sk-ant-api03-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

#### エラー3: Workflow 実行がタイムアウト

**症状**:

```bash
❌ Error: The job running on runner GitHub Actions XX has exceeded the maximum execution time of 360 minutes.
```

**解決策**:

```yaml
# .github/workflows/autonomous-agent.yml を編集
jobs:
  execute-agents:
    timeout-minutes: 60  # 60分に短縮
```

### 9.4 Claude Code 統合エラー

#### エラー1: カスタムコマンドが認識されない

**原因**: `.claude/commands/` に該当ファイルが存在しない

**解決策**:

```bash
# コマンドファイルを確認
ls -la .claude/commands/

# 期待されるファイル:
# - agent-run.md
# - deploy.md
# - test.md
# - verify.md

# ファイルが無い場合、Gitから復元
git checkout .claude/commands/
```

#### エラー2: Agent定義が読み込まれない

**原因**: `.claude/agents/` に該当ファイルが存在しない

**解決策**:

```bash
# Agent定義ファイルを確認
ls -la .claude/agents/

# 期待されるファイル:
# - coordinator-agent.md
# - codegen-agent.md
# - review-agent.md
# - issue-agent.md
# - pr-agent.md
# - deployment-agent.md

# ファイルが無い場合、Gitから復元
git checkout .claude/agents/
```

### 9.5 パフォーマンス問題

#### 問題1: Agent実行が遅い

**症状**: Issue処理に10分以上かかる

**解決策**:

```bash
# 並行度を上げる
npm run agents:parallel:exec -- --issues 123,124,125 --concurrency 5

# Claude API のモデルを確認（claude-sonnet-4が最速）
cat scripts/parallel-executor.ts | grep "model:"
```

#### 問題2: メモリ不足

**症状**:

```bash
❌ Error: JavaScript heap out of memory
```

**解決策**:

```bash
# Node.jsのメモリ制限を増やす
export NODE_OPTIONS="--max-old-space-size=4096"

# 再実行
npm run agents:parallel:exec -- --issue 123
```

### 9.6 サポート

#### 問題が解決しない場合

1. **GitHub Issueを作成**

   ```bash
   gh issue create \
     --title "[Support] Issue実行エラー" \
     --body "$(cat <<'EOF'
   ## 問題の詳細
   [問題の説明]

   ## 再現手順
   1. npm run agents:parallel:exec -- --issue 123
   2. [エラー発生]

   ## 環境情報
   - OS: macOS 13.5
   - Node.js: v20.10.0
   - npm: 10.2.3

   ## エラーログ
   ```
   [ログを貼り付け]
   ```
   EOF
   )" \
     --label "🐛bug,❓question"
   ```

2. **ログを添付**

   ```bash
   # 実行ログをファイルに保存
   npm run agents:parallel:exec -- --issue 123 > execution.log 2>&1

   # GitHub Issueに添付
   gh issue create --body "$(cat execution.log)"
   ```

3. **コミュニティに質問**

   - GitHub Discussions
   - Stack Overflow (タグ: `autonomous-operations`)

---

## 📝 まとめ

このガイドでは、Autonomous Operations プロジェクトのセットアップから初回Agent実行まで、すべてのステップを詳細に解説しました。

### 習得したスキル

✅ プロジェクトの初期化とセットアップ
✅ API Keys の設定と管理
✅ Agent の実行と結果確認
✅ Claude Code との統合
✅ トラブルシューティング

### 次のステップ

1. **運用マニュアルを読む** → [AGENT_OPERATIONS_MANUAL.md](docs/AGENT_OPERATIONS_MANUAL.md)
2. **実践的な演習を行う** → 複数Issue並行処理、カスタムAgent作成
3. **プロジェクトに貢献する** → [CONTRIBUTING.md](CONTRIBUTING.md)

### フィードバックをお待ちしています

このガイドに関するフィードバックや改善提案は、GitHub Issueでお知らせください：

```bash
gh issue create \
  --title "[Docs] GETTING_STARTED.md フィードバック" \
  --label "📝docs,💡enhancement"
```

---

**最終更新**: 2025-10-08
**ドキュメント管理者**: AI Operations Lead
**次回レビュー予定**: 2025-10-15

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>
