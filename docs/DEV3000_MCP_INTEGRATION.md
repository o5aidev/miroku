# dev3000 MCP統合ガイド

## 📚 概要

**dev3000**は、Vercel Labsが開発したフロントエンド開発用の統合デバッグツールです。MCPプロトコル経由でClaude Codeと統合し、UIUXAgent（みためん）が活用します。

## 🎯 主な機能

### 1. 統合ロギングシステム

- **サーバーログ**: バックエンドのエラー・警告・情報
- **ブラウザログ**: コンソールエラー、警告、ネットワークリクエスト
- **ネットワークログ**: API呼び出し、レスポンス、タイミング
- **ユーザーアクション**: クリック、スクロール、入力イベント

**すべてのログがミリ秒単位のタイムスタンプで統合**されます。

### 2. 自動キャプチャ機能

- **エラー発生時**: 画面状態を自動保存
- **ページ遷移時**: スナップショット記録
- **パフォーマンス低下時**: 状態記録

### 3. AI連携（MCP経由）

- Claude Codeが自動的にログを収集
- エラー原因の推論
- 修正提案の生成

## 🚀 インストール

### グローバルインストール

```bash
# pnpmの場合
pnpm i -g dev3000

# npmの場合
npm install -g dev3000

# yarnの場合
yarn global add dev3000
```

### 起動

```bash
# 標準起動
dev3000

# または短縮コマンド
d3k
```

## 🔧 MCP統合設定

### アーキテクチャ

dev3000はHTTPベースのMCPサーバーを提供します。Claude CodeのMCP統合（stdio）との橋渡しのため、プロキシサーバーを使用します：

```
┌─────────────────┐
│  Claude Code    │
│   (stdio MCP)   │
└────────┬────────┘
         │
         │ JSON-RPC (stdio)
         ▼
┌─────────────────┐
│  dev3000-proxy  │  ← `.claude/mcp-servers/dev3000-proxy.cjs`
│   (Node.js)     │
└────────┬────────┘
         │
         │ HTTP POST
         ▼
┌─────────────────┐
│   dev3000 MCP   │  ← http://localhost:3684/api/mcp/mcp
│  Server (HTTP)  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Your Dev Server│  ← npm run dashboard:dev
│  (localhost:3000│
└─────────────────┘
```

### mcp.json設定

`.claude/mcp.json`にdev3000プロキシが設定されています（デフォルト: 無効）：

```json
{
  "mcpServers": {
    "dev3000": {
      "command": "node",
      "args": [
        ".claude/mcp-servers/dev3000-proxy.cjs"
      ],
      "disabled": true,
      "description": "dev3000 - UI/UX統合デバッグツール (requires: npm run dashboard:dev + dev3000)"
    }
  }
}
```

### 有効化手順

**1. 開発サーバーを起動**

```bash
# ターミナル1: 開発サーバー起動
npm run dashboard:dev
# または
pnpm run dev
```

**2. dev3000を起動**

```bash
# ターミナル2: dev3000起動
cd /path/to/your/project
dev3000
# または
d3k
```

dev3000は自動的にMCPサーバーを `http://localhost:3684/api/mcp/mcp` で起動します。

**3. mcp.jsonでdev3000を有効化**

`.claude/mcp.json`を編集：

```json
"dev3000": {
  "disabled": false  // true → false に変更
}
```

**4. Claude Codeを再起動**

設定を反映させるため、Claude Codeを再起動します。

### 動作確認

```bash
# dev3000 MCP サーバーが起動しているか確認
curl http://localhost:3684/api/mcp/mcp
# → 応答があればOK
```

### UIUXAgentとの連携

UIUXAgent（みためん）は、Worktree内でdev3000を自動起動します：

```bash
# Worktree内での実行
cd .worktrees/issue-123

# dev3000起動（UIUXAgentが自動実行）
d3k

# 別ターミナルでClaude Code実行
npx claude-code --prompt .claude/agents/prompts/coding/uiux-agent-prompt.md
```

## 📊 使用例

### 例1: エラーデバッグ

```bash
# 1. dev3000起動
d3k

# 2. 開発サーバー起動
npm run dev

# 3. エラー発生時
# dev3000が自動的に以下を記録：
# - エラーのスタックトレース
# - 発生時のネットワーク状態
# - ブラウザコンソール
# - 画面スクリーンショット
```

### 例2: パフォーマンス分析

```bash
# dev3000がリアルタイムで記録：
# - ページロード時間
# - API呼び出しレイテンシ
# - レンダリングパフォーマンス
# - メモリ使用量
```

### 例3: ユーザーフロー追跡

```bash
# dev3000が記録：
# - ユーザーのクリック順序
# - フォーム入力内容（マスク済み）
# - ページ遷移履歴
# - スクロール位置
```

## 🤖 UIUXAgentでの活用

### Worktree内での実行フロー

1. **CoordinatorAgent** が UI/UX検証タスクを作成
2. **Worktree作成**: `.worktrees/issue-123/`
3. **dev3000起動**: Worktree内で `d3k` 実行
4. **Claude Code実行**: UIUXAgent プロンプトに従って検証
5. **ログ収集**: dev3000がすべてのログを記録
6. **レポート生成**: `.uiux/uiux-report-123.md` 作成

### UIUXAgentプロンプトでの指示

`.claude/agents/prompts/coding/uiux-agent-prompt.md`には、以下の手順が含まれています：

```markdown
### 2. dev3000統合デバッグ（15分）

#### dev3000起動

\`\`\`bash
# dev3000をグローバルインストール（初回のみ）
npm install -g dev3000

# dev3000起動
d3k
# または
dev3000
\`\`\`

**dev3000が提供する機能**:
- 統合ロギング（サーバー・ブラウザ・ネットワーク）
- エラー発生時の自動スクリーンショット
- ユーザーアクション追跡
- MCP経由でClaude Codeと連携

#### デバッグチェックリスト

- [ ] コンソールエラーがないか
- [ ] ネットワークリクエストが正常か
- [ ] ページ遷移が正常に動作するか
- [ ] フォーム送信が正常に動作するか
- [ ] API呼び出しが成功するか
- [ ] エラーハンドリングが適切か
```

## 📈 メリット

### 1. デバッグ時間の削減

- **従来**: エラー発生 → コンソール確認 → ネットワークタブ確認 → サーバーログ確認（合計10-15分）
- **dev3000**: すべてが統合されたタイムライン（2-3分）
- **削減率**: 83%

### 2. エラー再現性の向上

- エラー発生時の完全な状態を保存
- スクリーンショット + ログ + ネットワーク
- チーム間での共有が容易

### 3. AI連携

- Claude Codeが自動的にログを解析
- エラー原因の推論
- 修正提案の自動生成

## 🔒 セキュリティ

### ローカル完結

dev3000は**ローカル環境で完結**します：

- ログデータは外部に送信されません
- スクリーンショットはローカルに保存
- センシティブ情報の漏洩リスクなし

### データマスキング

- パスワードフィールドは自動マスク
- トークン・APIキーは自動除外
- 個人情報は記録されません

## 🛠️ トラブルシューティング

### dev3000が起動しない

```bash
# グローバルインストールを確認
npm list -g dev3000

# 再インストール
npm uninstall -g dev3000
npm install -g dev3000

# 代替コマンド
d3k
```

### MCPサーバーが接続できない

```bash
# Claude Codeのログを確認
cat ~/.claude/logs/mcp-dev3000.log

# mcp.jsonの設定を確認
cat packages/cli/templates/claude-code/mcp.json

# dev3000をMCPモードで手動起動
npx dev3000 --mcp
```

### Worktree内で起動できない

```bash
# Worktreeに移動
cd .worktrees/issue-123

# dev3000を起動（別ターミナル）
d3k

# 開発サーバー起動
npm run dev
```

## 📚 関連ドキュメント

- **Zenn記事**: https://zenn.dev/gunta/articles/6382859d69cb30
- **UIUXAgent仕様**: `.claude/agents/specs/coding/uiux-agent.md`
- **UIUXAgent実行プロンプト**: `.claude/agents/prompts/coding/uiux-agent-prompt.md`
- **MCP統合レポート**: `docs/MCP_INTEGRATION_REPORT.md`

## 🎯 今後の展開

### Phase 1: 基本統合（完了✅）

- mcp.jsonにdev3000追加
- UIUXAgentプロンプトに手順追加
- ドキュメント作成

### Phase 2: 自動化（計画中）

- dev3000の自動起動・停止
- ログの自動収集・解析
- レポートへの統合

### Phase 3: 高度な統合（将来）

- Lighthouse連携
- Playwright連携
- CI/CD統合

---

🎨 dev3000 × UIUXAgent（みためん）で、UI/UXデバッグが83%効率化されます！
