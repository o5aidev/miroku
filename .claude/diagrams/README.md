# .claude/ アーキテクチャ図 - PlantUML

`.claude` ディレクトリの構造とAutonomous Operationsシステムのアーキテクチャを可視化したPlantUML図です。

## 📊 図の一覧

| 図 | ファイル | 種別 | 説明 |
|----|---------|------|------|
| **1. ディレクトリ構造図** | `claude-directory-structure.puml` | パッケージ図 | .claudeディレクトリの階層構造を可視化 |
| **2. Agent階層図** | `agent-architecture.puml` | クラス図 | 6つのAgentの権限・エスカレーション関係を可視化 |
| **3. Agent実行フロー図** | `agent-execution-flow.puml` | シーケンス図 | Issue作成からPR作成までのパイプラインを可視化 |
| **4. Worktree並列実行図** | `worktree-workflow.puml` | アクティビティ図 | Git Worktree並列実行の仕組みを可視化 |
| **5. MCP統合図** | `mcp-integration.puml` | コンポーネント図 | 4つのMCPサーバーとClaude Code統合を可視化 |

---

## 1. ディレクトリ構造図

**ファイル**: `claude-directory-structure.puml`

### 概要

`.claude` ディレクトリの階層構造を可視化したパッケージ図です。

### 主要要素

- **agents/specs/** - Agent仕様定義（7ファイル、2,213行）
- **agents/prompts/** - Worktree実行プロンプト（6ファイル、3,042行）
- **commands/** - スラッシュコマンド（9ファイル、3,078行）
- **mcp-servers/** - MCPサーバー実装（5ファイル）

### 表示内容

- 総ファイル数: 39ファイル
- 総行数: 8,333行
- ファイル種別: .md, .json, .sh, .js

---

## 2. Agent階層とエスカレーション図

**ファイル**: `agent-architecture.puml`

### 概要

6つのAgentの階層構造、権限レベル、エスカレーション関係を可視化したクラス図です。

### 階層構造

```
Human Layer (TechLead/PO/CISO/CTO)
    ↑ Escalation
Coordinator Layer (CoordinatorAgent)
    ↓ Assignment
Specialist Layer (CodeGen/Review/Issue/PR/Deployment)
```

### 権限レベル

| 権限 | Agent | 説明 |
|------|-------|------|
| 🔴 統括権限 | CoordinatorAgent | タスク分解・Agent割り当て・リソース配分を決定可能 |
| 🔵 実行権限 | CodeGenAgent, IssueAgent, PRAgent | コード生成・PR作成を直接実行可能 |
| 🟡 判定権限 | ReviewAgent | 品質合否判定を実行可能 (80点基準) |
| 🔴 実行権限 (Staging) | DeploymentAgent | Staging環境への即座デプロイ可能 |
| 🟡 承認後実行 (Production) | DeploymentAgent | CTO承認後のみProduction環境へデプロイ可能 |

### エスカレーション例

- CoordinatorAgent → TechLead (循環依存検出)
- ReviewAgent → CISO (Critical脆弱性検出)
- DeploymentAgent → CTO (本番デプロイ失敗)

---

## 3. Agent実行フロー図

**ファイル**: `agent-execution-flow.puml`

### 概要

Issue作成からDraft PR作成までの完全な実行フローを可視化したシーケンス図です。

### フェーズ

1. **Phase 1: Issue作成・分析** - IssueAgentによる53ラベル自動付与
2. **Phase 2: タスク分解・DAG構築** - CoordinatorAgentによるタスク分解
3. **Phase 3: コード生成** - CodeGenAgentによるTypeScriptコード生成
4. **Phase 4: コード品質レビュー** - ReviewAgentによる品質スコア算出
5. **Phase 5: Pull Request作成** - PRAgentによるDraft PR作成
6. **Phase 6: 完了レポート** - ExecutionReport生成

### 成功条件

- IssueAgent: Label付与成功率 100%
- CodeGenAgent: TypeScriptエラー 0件
- ReviewAgent: 品質スコア ≥80点
- PRAgent: Draft PR作成成功率 100%

---

## 4. Worktree並列実行図

**ファイル**: `worktree-workflow.puml`

### 概要

Git Worktreeを使った並列実行の仕組みを可視化したアクティビティ図です。

### Worktree戦略

```
.worktrees/
├── issue-270/  (Worktree #1 - CodeGenAgent)
├── issue-271/  (Worktree #2 - ReviewAgent)
└── issue-272/  (Worktree #3 - DeploymentAgent)
```

### メリット

1. **独立したディレクトリ** - コンフリクト最小化
2. **ブランチ完全分離** - 並列実行の真の実現
3. **簡単なロールバック** - Worktree単位で破棄可能
4. **デバッグが容易** - 各Worktreeで独立したログ
5. **スケーラビリティ** - Worktree数に制限なし

### 並行度の調整

- 低スペックマシン: `concurrency=1`
- 通常マシン: `concurrency=2-3`
- 高スペックマシン: `concurrency=5`

### Worktree管理コマンド

```bash
# 一覧表示
git worktree list

# 削除
git worktree remove .worktrees/issue-270

# クリーンアップ
git worktree prune
```

---

## 5. MCP統合アーキテクチャ図

**ファイル**: `mcp-integration.puml`

### 概要

4つのMCPサーバーとClaude Codeの統合を可視化したコンポーネント図です。

### MCPサーバー一覧

| MCP Server | 機能 | 依存 | 設定ファイル |
|-----------|------|------|-------------|
| **miyabi-integration** | プロジェクト統合・Agent制御 | GitHub API | .claude/mcp-servers/miyabi-integration.js |
| **discord-community** | コミュニティ管理・通知 | Discord API | .claude/mcp-servers/discord-integration.js |
| **github-enhanced** | GitHub拡張操作 | GitHub API | @modelcontextprotocol/server-github |
| **filesystem** | ファイルシステムアクセス | Workspace | @modelcontextprotocol/server-filesystem |

### 提供ツール例

**miyabi-integration**:
- `miyabi_status` - プロジェクトステータス取得
- `miyabi_agent_run` - Agent実行制御
- `miyabi_issue_analyze` - Issue分析
- `miyabi_pr_create` - PR作成
- `miyabi_deploy` - デプロイ実行

**discord-community**:
- `discord_announce` - アナウンス送信
- `discord_github_event` - GitHubイベント通知
- `discord_support_message` - サポートメッセージ送信

### 環境変数

必須環境変数（`.env` ファイルで管理）:

```bash
# GitHub
GITHUB_TOKEN=ghp_xxx
REPOSITORY=owner/repo

# Discord
DISCORD_BOT_TOKEN=xxx
DISCORD_GUILD_ID=xxx
DISCORD_ANNOUNCE_CHANNEL=xxx
DISCORD_GITHUB_CHANNEL=xxx
DISCORD_SUPPORT_JP_CHANNEL=xxx
DISCORD_SUPPORT_EN_CHANNEL=xxx
```

---

## 🚀 PlantUML図の使い方

### 1. PlantUMLのインストール

```bash
# Homebrewでインストール (macOS)
brew install plantuml

# または
npm install -g node-plantuml
```

### 2. PNG画像に変換

```bash
# 単一ファイル変換
plantuml claude-directory-structure.puml

# 全ファイル変換
plantuml *.puml

# SVG形式で出力
plantuml -tsvg *.puml
```

### 3. VS Code拡張機能

**推奨拡張機能**: PlantUML

```json
// settings.json
{
  "plantuml.server": "https://www.plantuml.com/plantuml",
  "plantuml.render": "PlantUMLServer"
}
```

**使い方**:
1. `.puml` ファイルを開く
2. `Cmd+Shift+P` → "PlantUML: Preview Current Diagram"
3. リアルタイムプレビュー表示

### 4. オンラインビューア

ブラウザで確認: https://www.plantuml.com/plantuml/uml/

1. `.puml` ファイルの内容をコピー
2. テキストエリアに貼り付け
3. "Submit" をクリック

---

## 📝 図の更新方法

### 1. .pumlファイルを編集

```bash
# VS Codeで開く
code claude-directory-structure.puml

# リアルタイムプレビューを確認しながら編集
```

### 2. 変更内容の反映

```bash
# PNG画像を再生成
plantuml *.puml

# Git commit
git add .claude/diagrams/*.puml
git commit -m "docs: update PlantUML diagrams"
```

### 3. レビュー

- 図の整合性を確認
- レイアウトの調整
- 凡例の更新

---

## 📚 PlantUML構文リファレンス

### パッケージ図

```plantuml
package "Package Name" {
  file "file.md"
  folder "directory"
}
```

### クラス図

```plantuml
class ClassName {
  - privateField: type
  + publicMethod(): type
}

ClassA <|-- ClassB : "extends"
ClassA --> ClassB : "uses"
ClassA ..> ClassB : "depends"
```

### シーケンス図

```plantuml
Actor -> Component: message
activate Component
Component --> Actor: response
deactivate Component
```

### アクティビティ図

```plantuml
start
:Activity;
if (condition?) then (yes)
  :Action A;
else (no)
  :Action B;
endif
stop
```

### コンポーネント図

```plantuml
component "Component Name" {
  [Subcomponent]
}

ComponentA --> ComponentB : "uses"
```

---

## 🔗 関連ドキュメント

- [.claude/README.md](../README.md) - .claudeディレクトリ概要
- [CLAUDE.md](../../CLAUDE.md) - プロジェクト全体概要
- [docs/ENTITY_RELATION_MODEL.md](../../docs/ENTITY_RELATION_MODEL.md) - Entity-Relationモデル
- [docs/AGENT_OPERATIONS_MANUAL.md](../../docs/AGENT_OPERATIONS_MANUAL.md) - Agent運用マニュアル

---

## 📊 統計情報

- **総PlantUML図数**: 5図
- **総行数**: 約800行
- **カバレッジ**:
  - ディレクトリ構造: ✅ 完全
  - Agent階層: ✅ 完全
  - 実行フロー: ✅ 完全
  - Worktree並列実行: ✅ 完全
  - MCP統合: ✅ 完全

---

**最終更新**: 2025-10-12

**管理**: Claude Code Autonomous System
