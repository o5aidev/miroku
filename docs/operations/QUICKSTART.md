# 🚀 5分で始める Autonomous Operations

最速でAutonomous Operationsを立ち上げ、初回Agent実行まで完了させるクイックスタートガイド。

---

## ⏱️ タイムライン

- **1分**: テンプレート作成
- **2分**: セットアップ
- **2分**: 動作確認 & 初回実行
- **合計**: 5分

---

## 📋 準備するもの

事前に以下を準備してください:

1. ✅ Node.js 20+ インストール済み (`node --version`)
2. ✅ GitHubアカウント
3. ✅ [GitHub Personal Access Token](https://github.com/settings/tokens/new) (scopes: `repo`, `workflow`)
4. ✅ [Anthropic API Key](https://console.anthropic.com/settings/keys)

---

## ステップ 1: テンプレート作成 (1分)

### 方法A: GitHub UI

1. このリポジトリページで **"Use this template"** → **"Create a new repository"**
2. リポジトリ名を入力 (例: `my-autonomous-project`)
3. **"Create repository"** をクリック

### 方法B: GitHub CLI (推奨)

```bash
gh repo create my-autonomous-project \
  --template ShunsukeHayashi/Autonomous-Operations \
  --public \
  --clone

cd my-autonomous-project
```

---

## ステップ 2: セットアップ (2分)

### 初期化スクリプト実行

```bash
./scripts/init-project.sh
```

### 対話的に入力

```
プロジェクト名: my-autonomous-project
GitHub オーナー名: your-username
プロジェクト説明: My awesome project
デバイス識別子: (Enter - デフォルト使用)

今すぐAPIキーを入力しますか? (y/N): y

GitHub Token: ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
Anthropic API Key: sk-ant-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### 自動実行内容

- ✅ 依存関係インストール (`npm install`)
- ✅ `.env` ファイル生成
- ✅ TypeScriptコンパイル確認
- ✅ テスト実行

**期待される出力**:

```
🎉 初期化完了！
✅ TypeScript: エラーなし
✅ Tests: 合格
```

### GitHub Secrets 設定

```bash
# GitHub リポジトリで設定
gh secret set ANTHROPIC_API_KEY
# 貼り付け: sk-ant-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

---

## ステップ 3: 動作確認 (1分)

### 全確認を一括実行

```bash
npm run verify
```

**期待される出力**:

```
=== 1. 環境設定 ===
-rw-r--r-- .env

=== 2. TypeScript ===
> tsc --noEmit
(エラーなし)

=== 3. テスト ===
✓ tests/coordinator.test.ts  (6 tests) 4ms
Test Files  1 passed (1)
     Tests  6 passed (6)

=== 4. CLI ===
Autonomous Operations - Parallel Executor
Usage: ...

=== ✅ 全確認完了 ===
```

---

## ステップ 4: 初回Agent実行 (1分)

### 方法A: Web UI経由 (簡単)

1. **GitHubリポジトリで新規Issue作成**

```markdown
タイトル: [DEMO] Hello World機能の実装

本文:
## 要件
- [ ] hello.ts ファイル作成
- [ ] Hello World関数実装
- [ ] ユニットテスト作成

## 技術スタック
TypeScript
```

2. **ラベル追加**: `🤖agent-execute` を選択

3. **自動実行開始** (GitHub Actions)
   - Actions タブで実行状況確認
   - 約3-5分で完了
   - Draft PR が自動作成される

### 方法B: Claude Code経由 (最速)

```bash
# Claude Code起動
claude

# Issue作成コマンド実行
/create-issue
```

対話的に入力:

```
Issue タイトル: Hello World機能の実装
Issue タイプ: 1 (feature)
要件:
> hello.ts ファイル作成
> Hello World関数実装
> ユニットテスト作成
>

Agent自動実行を有効にしますか? (y/n): y
優先度: 2 (Medium)

✅ Issue作成完了
Issue番号: #1
URL: https://github.com/your-username/my-autonomous-project/issues/1

🤖 Agent実行が開始されます (約3-5分)
```

### 方法C: ローカル実行 (即座)

```bash
# Issue番号を指定して実行
npm run agents:parallel:exec -- --issue 1

# ドライラン (実際には実行しない)
npm run agents:parallel:exec -- --issue 1 --dry-run
```

---

## ✅ 成功確認

### 1. Pull Request が作成された

```bash
gh pr list
```

**期待される出力**:

```
#2  feat: Hello World機能の実装 (draft)  agent-generated-issue-1
```

### 2. コードが生成された

```bash
ls -la src/
```

**期待される出力**:

```
-rw-r--r-- hello.ts
-rw-r--r-- hello.test.ts
```

### 3. ログが記録された

```bash
ls -la .ai/logs/
```

**期待される出力**:

```
-rw-r--r-- 2025-10-08.md
```

### 4. 品質レポート確認

```bash
cat .ai/parallel-reports/report-issue-1.json | jq '.qualityReport.score'
```

**期待される出力**:

```json
85
```

**✅ スコア ≥80 で合格！**

---

## 🎉 完了！

おめでとうございます！Autonomous Operationsが正常に動作しています。

### 次のステップ

1. **PRをレビュー**: 生成されたコードを確認
2. **Agentログを読む**: `.ai/logs/` で実行詳細を確認
3. **本格的な機能開発**: 実際のIssueを作成してAgentに任せる
4. **カスタマイズ**: `.claude/` 設定をプロジェクトに合わせて調整

---

## 📚 詳細ガイド

もっと詳しく知りたい場合:

- [GETTING_STARTED.md](./GETTING_STARTED.md) - 完全ガイド (3,000語)
- [docs/AGENT_OPERATIONS_MANUAL.md](./docs/AGENT_OPERATIONS_MANUAL.md) - Agent運用マニュアル
- [TEMPLATE_INSTRUCTIONS.md](./TEMPLATE_INSTRUCTIONS.md) - テンプレート使用方法

---

## ❓ 問題が発生した場合

### TypeScriptエラー

```bash
rm -rf node_modules package-lock.json
npm install
npm run typecheck
```

### テスト失敗

```bash
npm test -- --clearCache
npm test -- --run
```

### Agent実行エラー

```bash
# ログ確認
cat .ai/logs/$(date +%Y-%m-%d).md

# 環境変数確認
cat .env | grep -v "^#" | grep -v "^$"
```

### GitHub Actions 動作しない

1. Settings → Actions → "I understand my workflows, go ahead and enable them"
2. Settings → Secrets → `ANTHROPIC_API_KEY` が設定されているか確認

---

## 💡 Tips

### Claude Code コマンド

```bash
/test              # テスト実行
/agent-run         # Agent実行
/verify            # 動作確認
/deploy staging    # Staging デプロイ
/security-scan     # セキュリティスキャン
/generate-docs     # ドキュメント生成
```

### GitHub CLI便利コマンド

```bash
# Issue一覧
gh issue list --label "🤖agent-execute"

# PR確認
gh pr view 2

# PR差分確認
gh pr diff 2

# PR マージ
gh pr merge 2 --squash
```

### ローカルAgent実行

```bash
# 複数Issue同時実行
npm run agents:parallel:exec -- --issues 1,2,3 --concurrency 3

# 特定Agentのみ実行
npm run agents:parallel:exec -- --issue 1 --agent CodeGenAgent
```

---

## 🤖 Agent実行フロー

```
Issue作成
  ↓
🤖agent-execute ラベル追加
  ↓
GitHub Actions トリガー
  ↓
CoordinatorAgent (タスク分解)
  ↓
CodeGenAgent (コード生成)
  ↓
ReviewAgent (品質チェック ≥80点)
  ↓
PRAgent (Draft PR作成)
  ↓
通知 (GitHub/Slack)
```

---

## 📊 期待されるタイミング

| アクション | 時間 |
|-----------|------|
| 初期化スクリプト | 30秒 |
| npm install | 1分 |
| TypeScript確認 | 10秒 |
| テスト実行 | 5秒 |
| Agent実行 (Issue → PR) | 3-5分 |
| デプロイ (staging) | 2-3分 |

---

## 🎯 成功の定義

以下がすべて ✅ なら成功:

- [ ] TypeScript: 0エラー
- [ ] Tests: すべて合格
- [ ] Issue作成可能
- [ ] Agent自動実行
- [ ] Draft PR作成
- [ ] 品質スコア ≥80
- [ ] ログ記録
- [ ] Claude Codeコマンド動作

---

**🚀 Happy Autonomous Operations!**

質問・問題は [GitHub Issues](https://github.com/your-username/my-autonomous-project/issues) で報告してください。

---

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>
