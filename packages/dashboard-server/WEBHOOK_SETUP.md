# GitHub WebHook セットアップガイド

## 🎯 概要

GitHub WebHookを設定すると、Issue/PRの作成・ラベル変更時に自動的にダッシュボードが更新されます。

---

## 🏠 ローカル開発（WebHookなし）

**ローカル開発ではWebHook不要です。** 以下の方法で動作します：

### 1. 初期読み込み
- ダッシュボード起動時に全Issueを取得してグラフ構築

### 2. 手動リフレッシュ
- ダッシュボード左上の🔄ボタンをクリック
- または別ターミナルで：
  ```bash
  curl -X POST http://localhost:3001/api/refresh
  ```

### 3. テスト用スクリプト
```bash
# Issueにラベルを追加
gh issue edit 47 --add-label "🤖 agent:coordinator"

# ダッシュボードの🔄ボタンをクリックして更新
```

---

## 🌐 本番環境（WebHook使用）

### Step 1: サーバーを公開URLでデプロイ

#### Option A: Railway
```bash
cd packages/dashboard-server
railway login
railway init
railway up
```

#### Option B: Render
```bash
# render.yaml作成済み
git push
# Renderが自動デプロイ
```

#### Option C: ngrok (開発用)
```bash
# ローカルサーバーを起動
pnpm dashboard:server

# 別のターミナルで
ngrok http 3001

# 表示されたURLをメモ (例: https://abc123.ngrok.io)
```

---

### Step 2: GitHub WebHook設定

1. **リポジトリ設定を開く**
   ```
   https://github.com/ShunsukeHayashi/Miyabi/settings/hooks
   ```

2. **Add webhook をクリック**

3. **設定項目**

   **Payload URL:**
   ```
   https://your-server.com/api/webhook/github
   ```
   - Railway: `https://your-app.up.railway.app/api/webhook/github`
   - Render: `https://miyabi-dashboard.onrender.com/api/webhook/github`
   - ngrok: `https://abc123.ngrok.io/api/webhook/github`

   **Content type:**
   ```
   application/json
   ```

   **Secret:**
   - `.env`の`GITHUB_WEBHOOK_SECRET`と同じ値を設定
   - 例: `dev-secret-miyabi-dashboard`

   **Which events would you like to trigger this webhook?**
   - ☑️ Issues
   - ☑️ Pull requests
   - ☑️ Issue comments (optional)
   - ☑️ Label (optional)

   または「Let me select individual events」で：
   - ☑️ Issues
   - ☑️ Pull requests

4. **Add webhook をクリック**

---

### Step 3: 動作確認

1. **WebHook配信を確認**
   ```
   Settings > Webhooks > Recent Deliveries
   ```
   - ✅ 緑のチェックマーク = 成功
   - ❌ 赤いX = 失敗（Response tabでエラー確認）

2. **テストWebHook送信**
   - WebHook詳細ページ > Recent Deliveries
   - 任意の配信を選択 > Redeliver

3. **実際のイベントでテスト**
   ```bash
   # 新しいIssueを作成
   gh issue create --title "Test WebHook" --body "Testing dashboard integration"

   # ダッシュボードに即座に反映されるはず
   ```

---

## 🔧 トラブルシューティング

### WebHook配信が失敗する

**原因1: サーバーが到達不可能**
```bash
# サーバーログを確認
pnpm dashboard:server

# ヘルスチェック
curl https://your-server.com/health
```

**原因2: Secretが一致しない**
- GitHub Webhook設定のSecretと`.env`の`GITHUB_WEBHOOK_SECRET`を確認

**原因3: パスが間違っている**
- Payload URLが `/api/webhook/github` で終わっているか確認

### ローカルでWebHookをテストしたい

**ngrokを使用:**
```bash
# Terminal 1: サーバー起動
pnpm dashboard:server

# Terminal 2: ngrokトンネル
ngrok http 3001

# ngrokのURLをGitHub Webhookに設定
# 例: https://abc123.ngrok.io/api/webhook/github
```

### ダッシュボードが更新されない

**手動リフレッシュを試す:**
```bash
curl -X POST http://localhost:3001/api/refresh
```

**WebSocket接続を確認:**
- ダッシュボード左上が「Connected」（緑）になっているか
- ブラウザのConsoleでエラーがないか確認

**サーバーログを確認:**
```bash
# バックエンドのログ
tail -f packages/dashboard-server/logs/*.log
```

---

## 📊 イベント処理フロー

```
GitHub Issue作成
  ↓
WebHook送信 (POST /api/webhook/github)
  ↓
webhook-handler.ts がイベント受信
  ↓
GraphBuilder でグラフ再構築
  ↓
Socket.IO で全クライアントに配信
  ↓
ダッシュボードがリアルタイム更新
```

---

## 🔐 セキュリティ

### Secret検証

WebHookは署名検証されます：

```typescript
// @octokit/webhooks が自動的に検証
const webhooks = new Webhooks({
  secret: process.env.GITHUB_WEBHOOK_SECRET
});
```

### CORS制限

フロントエンドからのアクセスのみ許可：

```typescript
app.use(cors({
  origin: process.env.DASHBOARD_URL, // http://localhost:5173
  credentials: true
}));
```

### Rate Limiting

API Endpointは15分間に100リクエストまで：

```typescript
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});
```

---

## 📝 サポートされるイベント

| イベント | トリガー | 動作 |
|---------|---------|------|
| `issues.opened` | Issue作成 | 新しいIssue Nodeを追加 |
| `issues.labeled` | ラベル追加 | State遷移 or Agent割り当て |
| `issues.closed` | Issue完了 | Nodeを削除 |
| `pull_request.opened` | PR作成 | PR Node追加（未実装） |

---

## 🚀 次のステップ

1. ✅ ローカルで手動リフレッシュをテスト
2. ✅ ngrokで一時的にWebHookをテスト
3. ✅ 本番環境（Railway/Render）にデプロイ
4. ✅ 本番WebHookを設定

---

**問題が解決しない場合:**
- GitHub Issue: https://github.com/ShunsukeHayashi/Miyabi/issues
- Discussions: https://github.com/ShunsukeHayashi/Miyabi/discussions
