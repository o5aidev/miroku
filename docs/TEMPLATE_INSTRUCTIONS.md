# Autonomous Operations - テンプレート使用ガイド

**バージョン**: v1.0.0
**最終更新**: 2025年10月8日

---

## 📖 このテンプレートについて

Autonomous Operationsは、**Claude Codeを使用して人間とAutonomous Agentが協奏しながら開発を進める**ためのプロジェクトテンプレートです。

このリポジトリを新規プロジェクトのベースとして使用することで、以下がすぐに利用可能になります：

- ✅ **6種類のSpecialist Agent** (CodeGen, Review, Issue, PR, Deployment, Coordinator)
- ✅ **GitHub Actions統合** (Issue → Agent → PR の自動フロー)
- ✅ **Claude Code最適化** (カスタムコマンド、hooks、Agent定義)
- ✅ **Log-Driven Development (LDD)** 準拠のロギング
- ✅ **品質スコアリングシステム** (80点基準)
- ✅ **組織設計原則に基づくエスカレーションフロー**

---

## 🚀 3ステップで始める

### ステップ 1: このテンプレートから新規リポジトリを作成

#### 方法A: GitHub UI経由

1. このリポジトリページで **"Use this template"** ボタンをクリック
2. リポジトリ名とオーナーを設定
3. "Create repository from template" をクリック

#### 方法B: GitHub CLI経由

```bash
gh repo create my-new-project --template ShunsukeHayashi/Autonomous-Operations --public
cd my-new-project
```

### ステップ 2: プロジェクトを初期化

```bash
# 初期化スクリプトを実行
./scripts/init-project.sh
```

このスクリプトは以下を対話的に実行します：

- プロジェクト名の設定
- GitHubオーナー名の設定
- `.env` ファイルの生成
- `.claude/settings.local.json` の生成
- 必要なディレクトリの作成
- 依存関係のインストール
- 動作確認

### ステップ 3: APIキーを設定

#### 必須: GitHub Personal Access Token

1. https://github.com/settings/tokens/new にアクセス
2. **Token name**: `Autonomous-Operations`
3. **Scopes**:
   - `repo` (全て)
   - `workflow`
   - `read:org`
4. "Generate token" をクリック
5. 生成されたトークンを `.env` に設定:

```bash
GITHUB_TOKEN=ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

#### 必須: Anthropic API Key

1. https://console.anthropic.com/settings/keys にアクセス
2. "Create Key" をクリック
3. キー名を設定 (例: `Autonomous-Operations`)
4. 生成されたAPIキーを `.env` に設定:

```bash
ANTHROPIC_API_KEY=sk-ant-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

#### オプション: Firebase設定 (デプロイ機能を使用する場合)

```bash
FIREBASE_PROJECT_ID=your-firebase-project-id
FIREBASE_TOKEN=your-firebase-token
```

---

## ✅ 動作確認

すべての設定が完了したら、以下のコマンドで動作を確認します：

```bash
# 全確認を実行
npm run verify

# または個別に確認
npm run typecheck    # TypeScriptエラー確認
npm test -- --run    # テスト実行
npm run agents:parallel:exec -- --help  # CLI動作確認
```

**期待される結果**:
- ✅ TypeScript: 0 errors
- ✅ Tests: 6/6 passed
- ✅ CLI: ヘルプメッセージ表示

---

## 🤖 Agent実行方法

### 方法A: GitHub Actions経由 (推奨)

1. **GitHubリポジトリでSecretsを設定**:
   - Settings → Secrets and variables → Actions
   - `ANTHROPIC_API_KEY` を追加

2. **Issueを作成**:
   ```markdown
   # 新機能: ユーザー認証の実装

   ## 要件
   - ログイン画面
   - JWT認証
   - ユニットテスト
   ```

3. **ラベルを追加**: `🤖agent-execute`

4. **自動実行**: GitHub ActionsがAgentを起動し、Draft PRを作成

### 方法B: ローカル実行

```bash
# Issue番号を指定して実行
npm run agents:parallel:exec -- --issue 123

# 複数Issue同時実行
npm run agents:parallel:exec -- --issues 123,124,125 --concurrency 3

# ドライラン（実際には実行しない）
npm run agents:parallel:exec -- --issue 123 --dry-run
```

### 方法C: Claude Code内で実行

```bash
# Claude Codeセッション内で
/agent-run --issue 123
```

---

## 📁 プロジェクト構造

初期化後、以下の構造になります：

```
my-new-project/
├── .ai/                          # AI Agent出力
│   ├── logs/                     # LDDログ (日次)
│   ├── parallel-reports/         # 実行レポート
│   └── issues/                   # Issue分析結果
├── .claude/                      # Claude Code設定
│   ├── agents/                   # Agent定義
│   │   └── codegen-agent.md
│   ├── commands/                 # カスタムコマンド
│   │   ├── test.md
│   │   ├── agent-run.md
│   │   └── verify.md
│   ├── hooks/                    # 実行hooks
│   │   └── log-commands.sh
│   ├── settings.example.json     # 設定テンプレート
│   └── settings.local.json       # ローカル設定 (gitignore済み)
├── .github/
│   ├── workflows/
│   │   └── autonomous-agent.yml  # Agent自動実行ワークフロー
│   └── ISSUE_TEMPLATE/
│       └── agent-task.md         # Agentタスク用テンプレート
├── agents/                       # Agent実装
│   ├── types/index.ts
│   ├── base-agent.ts
│   ├── coordinator/
│   ├── codegen/
│   ├── review/
│   ├── issue/
│   ├── pr/
│   └── deployment/
├── scripts/
│   ├── init-project.sh           # 初期化スクリプト
│   └── parallel-executor.ts      # CLI実行ツール
├── tests/                        # テストスイート
├── docs/                         # ドキュメント
│   ├── AGENT_OPERATIONS_MANUAL.md
│   ├── AUTONOMOUS_WORKFLOW_INTEGRATION.md
│   └── REPOSITORY_OVERVIEW.md
├── .env                          # 環境変数 (gitignore済み)
├── package.json
├── tsconfig.json
└── README.md
```

---

## 🎨 カスタマイズ方法

### 新しいAgentを追加する

1. **Agent実装を作成**:

```typescript
// agents/my-custom/my-custom-agent.ts
import { BaseAgent } from '../base-agent';

export class MyCustomAgent extends BaseAgent {
  async execute(task: Task): Promise<AgentResult> {
    // 実装
  }
}
```

2. **Agent定義を作成**:

```markdown
<!-- .claude/agents/my-custom-agent.md -->
---
name: MyCustomAgent
authority: 🔵実行権限
escalation: TechLead
---

## 役割
カスタム処理を実行

## 成功条件
- ✅ 処理完了
```

3. **Coordinatorに登録**:

```typescript
// agents/coordinator/coordinator-agent.ts
async assignAgent(task: Task): Promise<AgentType> {
  if (task.type === 'custom') return 'MyCustomAgent';
  // ...
}
```

### 新しいコマンドを追加する

```markdown
<!-- .claude/commands/my-command.md -->
---
description: カスタムコマンド
---

# My Custom Command

実行内容の説明

\`\`\`bash
npm run my-custom-script
\`\`\`
```

使用方法:

```bash
# Claude Code内で
/my-command
```

---

## 📊 品質基準

すべてのAgent生成コードは以下の基準を満たす必要があります：

| 項目 | 基準 | 配点 |
|------|------|------|
| ESLintエラー | 0件 | -20点/件 |
| TypeScriptエラー | 0件 | -30点/件 |
| 重大な脆弱性 | 0件 | -40点/件 |
| テストカバレッジ | ≥80% | 基準値 |

**合格ライン**: 80点以上

品質チェック:

```bash
npm run typecheck    # TypeScriptエラー確認
npm run lint         # ESLintエラー確認
npm test -- --coverage  # カバレッジ確認
```

---

## 🔧 トラブルシューティング

### Q1: `npm run typecheck` でエラーが出る

```bash
# 依存関係を再インストール
rm -rf node_modules package-lock.json
npm install
```

### Q2: GitHub Actionsが動作しない

- **Secretsが設定されているか確認**:
  - Settings → Secrets and variables → Actions
  - `ANTHROPIC_API_KEY` が存在するか確認

- **Workflowが有効か確認**:
  - Actions タブ → "I understand my workflows, go ahead and enable them"

### Q3: Agentが無限ループする

- **タスクの循環依存を確認**:
  ```typescript
  // CoordinatorAgentはDAG構築時に循環を検出
  const decomposition = await coordinator.decomposeIssue(issue);
  if (decomposition.hasCycles) {
    // エラーハンドリング
  }
  ```

### Q4: `.env` ファイルが読み込まれない

```bash
# ファイル名・形式を確認
ls -la .env
cat .env | grep -v "^#" | grep -v "^$"

# 環境変数が正しく設定されているか確認
node -e "require('dotenv').config(); console.log(process.env.GITHUB_TOKEN)"
```

---

## 🌟 ベストプラクティス

### 1. Issueの書き方

**Good Example**:

```markdown
# 新機能: ユーザープロフィール編集

## 要件
- [ ] プロフィール編集画面UI
- [ ] プロフィール更新API
- [ ] バリデーション実装
- [ ] ユニットテスト作成

## 技術スタック
- React + TypeScript
- REST API

## 制約
- パスワード変更は別機能として実装
```

**Bad Example**:

```markdown
# プロフィール編集できるようにして
```

### 2. ブランチ戦略

- `main`: プロダクション
- `develop`: 開発ブランチ
- `feature/agent-generated-*`: Agent生成ブランチ
- `fix/agent-*`: Agent修正ブランチ

### 3. コミットメッセージ

Conventional Commits形式を使用:

```
feat: ユーザープロフィール編集機能を追加
fix: ログイン時の認証エラーを修正
refactor: コード品質向上のためリファクタリング
test: ユニットテストを追加
docs: READMEを更新

🤖 Generated with Claude Code

Co-Authored-By: Claude <noreply@anthropic.com>
```

---

## 📚 関連ドキュメント

- [GETTING_STARTED.md](./GETTING_STARTED.md) - 初心者向け完全ガイド
- [QUICKSTART.md](./QUICKSTART.md) - 5分クイックスタート
- [docs/AGENT_OPERATIONS_MANUAL.md](./docs/AGENT_OPERATIONS_MANUAL.md) - Agent運用マニュアル
- [CONTRIBUTING.md](./CONTRIBUTING.md) - 貢献ガイドライン
- [DEPLOYMENT.md](./DEPLOYMENT.md) - デプロイガイド

---

## 🤝 サポート

### コミュニティ

- GitHub Issues: バグ報告・機能リクエスト
- GitHub Discussions: 質問・議論

### 商用サポート

エンタープライズ向けサポートについては、リポジトリオーナーにお問い合わせください。

---

## 📄 ライセンス

MIT License - 詳細は [LICENSE](./LICENSE) をご覧ください。

---

**🎉 Autonomous Operationsへようこそ！**

このテンプレートを使って、AIと人間が協奏する新しい開発体験をお楽しみください。

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>
