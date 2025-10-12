# Discord MCP Server Setup Guide

このガイドでは、Miyabiプロジェクトのコミュニティ運営用Discord MCP serverのセットアップ方法を説明します。

## 前提条件

- Discord アカウント
- Miyabi Discord サーバー（Guild ID: `1199878847466836059`）
- 管理者権限

---

## 1. Discord Bot の作成とトークン取得

### 1.1 Discord Developer Portal でアプリケーションを作成

1. **Discord Developer Portal** にアクセス:
   ```
   https://discord.com/developers/applications
   ```

2. **New Application** をクリック

3. アプリケーション名を入力（例: `Miyabi Community Bot`）

4. **Create** をクリック

### 1.2 Bot を追加

1. 左メニューから **Bot** を選択

2. **Add Bot** をクリック → **Yes, do it!** で確認

3. Bot の設定:
   - **Public Bot**: OFF（推奨：プライベートBotとして運用）
   - **Requires OAuth2 Code Grant**: OFF
   - **Privileged Gateway Intents**:
     - ✅ **PRESENCE INTENT** - ON（オンラインメンバー数取得用）
     - ✅ **SERVER MEMBERS INTENT** - ON（メンバー情報取得用）
     - ✅ **MESSAGE CONTENT INTENT** - ON（メッセージ読み取り用）

### 1.3 Bot トークンをコピー

1. **Token** セクションで **Reset Token** をクリック

2. 表示されたトークンをコピー（この後 `.env` に設定します）

   ⚠️ **重要**: トークンは1度しか表示されません。必ずコピーしてください。

   ```
   例: MTI5NzE4NDI0MjE4NjI4MDk2MA.GxYz-A.abcdef1234567890ABCDEF...
   ```

---

## 2. Bot をサーバーに招待

### 2.1 OAuth2 URL を生成

1. 左メニューから **OAuth2** → **URL Generator** を選択

2. **Scopes** を選択:
   - ✅ `bot`

3. **Bot Permissions** を選択:
   - ✅ **View Channels** (チャンネル閲覧)
   - ✅ **Send Messages** (メッセージ送信)
   - ✅ **Embed Links** (埋め込みリンク)
   - ✅ **Attach Files** (ファイル添付)
   - ✅ **Read Message History** (メッセージ履歴読み取り)
   - ✅ **Add Reactions** (リアクション追加)
   - ✅ **Manage Events** (イベント管理)

4. 生成された URL をコピー

   ```
   例: https://discord.com/api/oauth2/authorize?client_id=1297184242186280960&permissions=277025508416&scope=bot
   ```

### 2.2 Bot を招待

1. コピーした URL をブラウザで開く

2. **Miyabi Community Server** を選択（Guild ID: `1199878847466836059`）

3. **認証** をクリック

4. Discord サーバーで Bot が参加したことを確認

---

## 3. チャンネル ID の取得

### 3.1 Discord で開発者モードを有効化

1. Discord アプリを開く

2. **ユーザー設定** (⚙️) → **詳細設定** (Advanced) → **開発者モード** (Developer Mode) を **ON**

### 3.2 チャンネル ID をコピー

必要なチャンネルを右クリック → **ID をコピー** (Copy ID)

以下のチャンネルの ID を取得してください:

- **📢 announcements** - リリース告知用
- **🔗 github-updates** - GitHub イベント通知用
- **🇯🇵 日本語サポート** - 日本語質問チャンネル
- **🇬🇧 English Support** - 英語質問チャンネル

例:
```
📢 announcements: 1234567890123456789
🔗 github-updates: 9876543210987654321
🇯🇵 日本語サポート: 1111222233334444555
🇬🇧 English Support: 5555444433332222111
```

---

## 4. 環境変数の設定

プロジェクトルートの `.env` ファイルに以下を追加:

```bash
# ============================================================================
# Discord Community Configuration (Subproject)
# ============================================================================

# Discord Bot Token (get from https://discord.com/developers/applications)
DISCORD_BOT_TOKEN=MTI5NzE4NDI0MjE4NjI4MDk2MA.GxYz-A.abcdef1234567890ABCDEF...

# Discord Server (Guild) ID - Miyabi Community Server
DISCORD_GUILD_ID=1199878847466836059

# Channel IDs (to be configured after server setup)
DISCORD_ANNOUNCE_CHANNEL=1234567890123456789
DISCORD_GITHUB_CHANNEL=9876543210987654321
DISCORD_SUPPORT_JP_CHANNEL=1111222233334444555
DISCORD_SUPPORT_EN_CHANNEL=5555444433332222111
```

⚠️ **セキュリティ注意**:
- `.env` ファイルは `.gitignore` に含まれているため、Gitにコミットされません
- Bot トークンは絶対に公開リポジトリにコミットしないでください

---

## 5. MCP Server の動作確認

### 5.1 依存関係のインストール

MCP SDK が必要です:

```bash
npm install @modelcontextprotocol/sdk
```

### 5.2 MCP Server の起動テスト

```bash
node .claude/mcp-servers/discord-integration.js
```

正常に起動すると:
```
Discord Integration MCP Server running on stdio
```

### 5.3 Claude Code での利用

Claude Code を再起動すると、`.claude/mcp-config.json` の設定が読み込まれ、以下のツールが利用可能になります:

#### 利用可能なツール:

1. **discord_send_message** - メッセージ送信
   ```javascript
   // 使用例
   channel_id: "announce" または チャンネルID
   content: "メッセージ本文"
   embed: { title: "タイトル", description: "説明", ... }
   ```

2. **discord_announce_release** - リリース告知
   ```javascript
   version: "v0.8.0"
   title: "New Release!"
   changelog: "変更内容..."
   download_url: "https://github.com/..."
   ```

3. **discord_notify_github_event** - GitHub イベント通知
   ```javascript
   event_type: "issue_opened" | "pr_merged" | ...
   number: 42
   title: "Issue/PR タイトル"
   author: "username"
   url: "https://github.com/..."
   ```

4. **discord_get_stats** - サーバー統計取得
   ```javascript
   stat_type: "members" | "online" | "channels" | "all"
   ```

5. **discord_create_event** - イベント作成
   ```javascript
   name: "イベント名"
   description: "説明"
   start_time: "2025-10-15T19:00:00+09:00"
   ```

6. **discord_get_recent_messages** - 最近のメッセージ取得
   ```javascript
   channel_id: "support" または チャンネルID
   limit: 10
   ```

7. **discord_add_reaction** - リアクション追加
   ```javascript
   channel_id: "チャンネルID"
   message_id: "メッセージID"
   emoji: "👍"
   ```

---

## 6. トラブルシューティング

### エラー: `DISCORD_BOT_TOKEN not set`

→ `.env` ファイルに `DISCORD_BOT_TOKEN` が設定されているか確認

### エラー: `Discord API error: 401 - Unauthorized`

→ Bot トークンが正しいか確認。Discord Developer Portal で Reset Token してコピーし直す

### エラー: `Discord API error: 403 - Missing Permissions`

→ Bot に必要な権限が付与されているか確認:
- Discord サーバーで Bot のロール権限を確認
- OAuth2 URL で適切な permissions が選択されているか確認

### エラー: `Discord API error: 404 - Unknown Channel`

→ チャンネル ID が正しいか確認:
- Discord で開発者モードが有効になっているか
- チャンネルを右クリック → ID をコピーで正しい ID を取得

### Bot がオフライン

→ MCP Server は stdio 通信のため、Bot は常時オンラインではありません。
　 Claude Code がツールを呼び出したときに API 経由で Discord にアクセスします。

---

## 7. セキュリティのベストプラクティス

1. **Bot Token の管理**
   - `.env` ファイルは絶対にコミットしない
   - Token が漏洩した場合は即座に Reset Token
   - 定期的に Token をローテーション

2. **権限の最小化**
   - 必要最小限の Bot Permissions のみ付与
   - Administrator 権限は付与しない

3. **Rate Limit 対策**
   - Discord API は Rate Limit あり（50 requests/second）
   - MCP Server は自動的に 429 エラーをハンドリング

4. **監査ログ**
   - Discord サーバーの監査ログで Bot の動作を定期確認

---

## 次のステップ

✅ Discord Bot Token 取得完了
✅ Bot をサーバーに招待完了
✅ チャンネル ID 取得完了
✅ `.env` 設定完了

→ **Discord Community Plan の実装** (DISCORD_COMMUNITY_PLAN.md 参照)

コミュニティ運営の詳細は以下のドキュメントを参照:
- `DISCORD_COMMUNITY_PLAN.md` - コミュニティ戦略
- Issue #52 - Discord サーバーセットアップタスク

---

## 参考リンク

- Discord Developer Portal: https://discord.com/developers/applications
- Discord API Documentation: https://discord.com/developers/docs/intro
- Discord.js Guide: https://discordjs.guide/
- MCP SDK Documentation: https://github.com/modelcontextprotocol/sdk

---

**作成日**: 2025-10-10
**更新日**: 2025-10-10
**バージョン**: 1.0.0
