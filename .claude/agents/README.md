# Agent Documentation Structure

このディレクトリには、Miyabiプロジェクトで使用される各Agentの仕様書と実行プロンプトが格納されています。

## ディレクトリ構造

```
.claude/agents/
├── specs/          # Agent仕様書（役割・権限・エスカレーション条件）
│   ├── coordinator-agent.md
│   ├── codegen-agent.md
│   ├── review-agent.md
│   ├── deployment-agent.md
│   ├── pr-agent.md
│   └── issue-agent.md
│
└── prompts/        # Worktree実行プロンプト（Claude Code用）
    ├── coordinator-agent-prompt.md
    ├── codegen-agent-prompt.md
    ├── review-agent-prompt.md
    ├── deployment-agent-prompt.md
    ├── pr-agent-prompt.md
    └── issue-agent-prompt.md
```

## ファイルの種類

### 1. Agent仕様書 (`specs/`)

各Agentの**アーキテクチャドキュメント**です。以下の情報を含みます：

- **役割**: Agentの責務範囲
- **権限レベル**: 🔴統括権限 / 🔵実行権限 / 🟢分析権限
- **エスカレーション条件**: どのような場合に誰にエスカレーションするか
- **成功条件**: 何をもって成功とするか
- **技術仕様**: 使用するアルゴリズム・API・モデル
- **メトリクス**: 実行時間・成功率などのKPI

#### 例: `specs/codegen-agent.md`

```markdown
---
name: CodeGenAgent
description: AI駆動コード生成Agent - Claude Sonnet 4による自動コード生成
authority: 🔵実行権限
escalation: TechLead (アーキテクチャ問題時)
---

## 役割
GitHub Issueの内容を解析し、Claude Sonnet 4 APIを使用して必要なコード実装を自動生成します。

## 責任範囲
- Issue内容の理解と要件抽出
- TypeScriptコード自動生成（Strict mode準拠）
- ユニットテスト自動生成（Vitest）
...
```

### 2. 実行プロンプト (`prompts/`)

**Git Worktree内でClaude Codeが実行する際の具体的な手順書**です。以下の情報を含みます：

- **Task情報のテンプレート**: `{{TASK_ID}}`, `{{ISSUE_NUMBER}}` などの変数
- **実行手順**: ステップバイステップの作業手順
- **実装例**: 具体的なTypeScriptコード例
- **テスト作成手順**: Vitestテストの書き方
- **Success Criteria**: 完了条件のチェックリスト
- **トラブルシューティング**: よくある問題と解決方法
- **Output Format**: JSON形式の結果レポート

#### 例: `prompts/codegen-agent-prompt.md`

```markdown
# CodeGenAgent Worktree Execution Prompt

あなたはWorktree内で実行されている**CodeGenAgent**です。
このWorktreeは`{{WORKTREE_PATH}}`に配置されており、`{{BRANCH_NAME}}`ブランチで作業しています。

## Task情報
- **Task ID**: {{TASK_ID}}
- **Issue Number**: {{ISSUE_NUMBER}}
...

## 実行手順

### 1. 要件分析（5分）
...

### 2. コード設計（10分）
...
```

## 使い分け

| ファイルタイプ | 対象読者 | 目的 | いつ読む？ |
|------------|---------|------|-----------|
| **specs/** | 人間（開発者・アーキテクト） | Agentの設計・役割・権限を理解する | アーキテクチャレビュー時 |
| **prompts/** | Claude Code（AI実行環境） | Worktree内で実際に作業を実行する | Git Worktree並列実行時 |

## Agent一覧

### CoordinatorAgent

- **役割**: タスク統括・並行実行制御
- **権限**: 🔴統括権限（タスク分解・Agent割り当てを決定）
- **実装**: DAG構築、トポロジカルソート、並行実行制御

**ファイル**:
- `specs/coordinator-agent.md` - アーキテクチャ仕様
- `prompts/coordinator-agent-prompt.md` - Worktree実行手順

### CodeGenAgent

- **役割**: AI駆動コード生成
- **権限**: 🔵実行権限（コード生成を直接実行可能）
- **実装**: Claude Sonnet 4 API、TypeScript strict mode、BaseAgentパターン

**ファイル**:
- `specs/codegen-agent.md` - アーキテクチャ仕様
- `prompts/codegen-agent-prompt.md` - Worktree実行手順

### ReviewAgent

- **役割**: コード品質レビュー
- **権限**: 🔵実行権限（品質判定を実行可能）
- **実装**: ESLint、TypeScript型チェック、セキュリティスキャン、100点満点スコアリング

**ファイル**:
- `specs/review-agent.md` - アーキテクチャ仕様
- `prompts/review-agent-prompt.md` - Worktree実行手順

### IssueAgent

- **役割**: Issue分析・Label管理
- **権限**: 🟢分析権限（Issue分析・Label付与を実行可能）
- **実装**: 53ラベル体系、キーワードベース判定、依存関係抽出

**ファイル**:
- `specs/issue-agent.md` - アーキテクチャ仕様
- `prompts/issue-agent-prompt.md` - Worktree実行手順

### PRAgent

- **役割**: Pull Request自動作成
- **権限**: 🔵実行権限（PR作成を直接実行可能）
- **実装**: Conventional Commits準拠、GitHub API統合

**ファイル**:
- `specs/pr-agent.md` - アーキテクチャ仕様
- `prompts/pr-agent-prompt.md` - Worktree実行手順

### DeploymentAgent

- **役割**: CI/CDデプロイ自動化
- **権限**: 🔵実行権限（デプロイを直接実行可能）
- **実装**: Firebase/Vercel/AWS、ヘルスチェック、自動ロールバック

**ファイル**:
- `specs/deployment-agent.md` - アーキテクチャ仕様
- `prompts/deployment-agent-prompt.md` - Worktree実行手順

## Worktree実行フロー

1. **CoordinatorAgent**がIssueを分解してDAGを構築
2. 各タスクに対して**Worktree**を作成（`.worktrees/issue-{N}/`）
3. Worktree内で**Claude Code**が起動
4. Claude Codeが該当するAgent promptを読み込んで実行
5. 実行完了後、結果をmainブランチにマージ

```bash
# 実行例
npm run agents:parallel:exec -- --issues=270,271,272 --concurrency=2

# Worktree構成
.worktrees/
├── issue-270/  # CoordinatorAgent実行
├── issue-271/  # CodeGenAgent実行
└── issue-272/  # ReviewAgent実行
```

## 新しいAgentの追加

新しいAgentを追加する場合は、以下の2つのファイルを作成してください：

1. **`specs/your-agent.md`** - Agent仕様書
   ```markdown
   ---
   name: YourAgent
   description: Agent description
   authority: 🔵実行権限
   escalation: TechLead
   ---

   ## 役割
   ...
   ```

2. **`prompts/your-agent-prompt.md`** - 実行プロンプト
   ```markdown
   # YourAgent Worktree Execution Prompt

   あなたはWorktree内で実行されている**YourAgent**です。

   ## Task情報
   - **Task ID**: {{TASK_ID}}
   ...

   ## 実行手順
   ...
   ```

## 参照

- [CLAUDE.md](../../CLAUDE.md) - プロジェクト全体の設定
- [AGENT_OPERATIONS_MANUAL.md](../../docs/AGENT_OPERATIONS_MANUAL.md) - Agent運用マニュアル
- [LABEL_SYSTEM_GUIDE.md](../../docs/LABEL_SYSTEM_GUIDE.md) - 53ラベル体系

---

🤖 Generated with Claude Code
