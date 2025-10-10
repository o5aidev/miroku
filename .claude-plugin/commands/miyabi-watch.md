# Miyabi Watch Mode (監視モード)

**リアルタイムGitHubイベント監視 - Webhookベースの継続的モニタリング**

## 概要

Watch Mode (監視モード) は、GitHub Webhooks を利用してリアルタイムでイベントを監視し、変更を検知して通知・ダッシュボード更新を行います。

**3つのモードとの違い**:
- **Water Spider** (蜘蛛): ポーリング型・執行型 - 定期的にIssueを検出して自動実行
- **Amembo** (水黽): ポーリング型・監視型 - 定期的にIssueをスキャンしてレポート
- **Watch** (監視): **Webhook型・リアルタイム型** - イベント発生時に即座に反応

## 使い方

### 基本実行

```bash
# デフォルト設定でWatchモード起動
/miyabi-watch
```

### イベント指定

```bash
# Issueイベントのみ監視
/miyabi-watch --events issues

# PR + Issue を監視
/miyabi-watch --events issues,pull_request

# すべてのイベント監視
/miyabi-watch --events all
```

### 通知先指定

```bash
# Slack通知
/miyabi-watch --notify slack --slack-webhook https://hooks.slack.com/...

# Discord通知
/miyabi-watch --notify discord --discord-webhook https://discord.com/api/webhooks/...

# Email通知
/miyabi-watch --notify email --email team@example.com
```

## MCPツール

### `miyabi__watch`

Watch継続監視モードを起動

**パラメータ**:
- `events` (string[]): 監視対象イベント（デフォルト: ['issues', 'pull_request', 'push']）
- `notifyChannels` (string[]): 通知チャンネル（'slack' | 'discord' | 'email' | 'console'）
- `dashboardUpdate` (boolean): ダッシュボード自動更新（デフォルト: true）
- `logLevel` ('debug' | 'info' | 'warn' | 'error'): ログレベル（デフォルト: 'info'）

**戻り値**:
```typescript
{
  status: 'watching' | 'stopped' | 'error';
  startedAt: string;           // ISO 8601 timestamp
  eventsReceived: number;      // 受信イベント総数
  lastEvent: {
    type: string;              // 'issues', 'pull_request', etc.
    action: string;            // 'opened', 'closed', etc.
    timestamp: string;
    details: object;
  };
  webhookUrl: string;          // Webhook受信URL
  subscribedEvents: string[];  // 監視中のイベント一覧
}
```

## 動作フロー

### 起動フロー

```
Watch起動
    ↓
GitHub Webhook設定確認
    ↓
├─ 設定済み → 既存Webhook使用
└─ 未設定 → 新規Webhook作成
    ↓
ローカルサーバー起動（ポート: 3939）
    ↓
ngrok/localtunnel起動（外部アクセス用）
    ↓
Webhook URLをGitHubに登録
    ↓
監視開始（待機状態）
```

### イベント処理フロー

```
GitHub Event発生
    ↓
Webhook POST受信
    ↓
イベント種別判定
├─ issues → Issue処理
├─ pull_request → PR処理
├─ push → Push処理
└─ その他 → 汎用処理
    ↓
ラベル解析・優先度判定
    ↓
通知判定
├─ P0/P1 → 即座に通知
├─ P2 → 集約して通知（5分ごと）
└─ P3 → 日次サマリーで通知
    ↓
通知送信
├─ Slack
├─ Discord
├─ Email
└─ Console（ローカル）
    ↓
ダッシュボード更新
├─ GitHub Pages更新
├─ メトリクス書き込み
└─ グラフ再描画
    ↓
ログ記録
```

## 監視対象イベント

### Issues イベント

```typescript
{
  action: 'opened' | 'closed' | 'reopened' | 'labeled' | 'unlabeled',
  issue: {
    number: number;
    title: string;
    state: 'open' | 'closed';
    labels: string[];
  }
}
```

**通知トリガー**:
- `opened` + `🔥 priority:P0-Critical` → **即座に通知**
- `labeled` + `🤖 agent:*` → Agent割り当て通知
- `closed` → 完了通知（P0/P1のみ）

### Pull Request イベント

```typescript
{
  action: 'opened' | 'closed' | 'merged' | 'review_requested',
  pull_request: {
    number: number;
    title: string;
    state: 'open' | 'closed';
    merged: boolean;
  }
}
```

**通知トリガー**:
- `opened` → PR作成通知
- `merged` → マージ通知（全PR）
- `review_requested` → レビュー依頼通知

### Push イベント

```typescript
{
  ref: string;           // 'refs/heads/main'
  commits: Array<{
    message: string;
    author: string;
  }>;
}
```

**通知トリガー**:
- `ref === 'refs/heads/main'` → mainブランチへのpush通知
- `commits.length > 10` → 大量コミット警告

## 通知フォーマット

### Slack通知例

```json
{
  "text": "🔥 [P0-Critical] New Issue Opened",
  "blocks": [
    {
      "type": "header",
      "text": {
        "type": "plain_text",
        "text": "🔥 Priority: P0-Critical"
      }
    },
    {
      "type": "section",
      "text": {
        "type": "mrkdwn",
        "text": "*#42: Production API timeout error*\n\n📥 State: pending\n🤖 Agent: Not assigned yet\n\n<https://github.com/ShunsukeHayashi/Miyabi/issues/42|View Issue>"
      }
    },
    {
      "type": "actions",
      "elements": [
        {
          "type": "button",
          "text": {
            "type": "plain_text",
            "text": "Assign Agent"
          },
          "url": "https://github.com/ShunsukeHayashi/Miyabi/issues/42"
        }
      ]
    }
  ]
}
```

### Discord Embed例

```json
{
  "embeds": [
    {
      "title": "🔥 [P0-Critical] New Issue Opened",
      "description": "**#42: Production API timeout error**",
      "color": 16711680,
      "fields": [
        {
          "name": "State",
          "value": "📥 pending",
          "inline": true
        },
        {
          "name": "Agent",
          "value": "Not assigned",
          "inline": true
        },
        {
          "name": "Priority",
          "value": "🔥 P0-Critical",
          "inline": true
        }
      ],
      "url": "https://github.com/ShunsukeHayashi/Miyabi/issues/42",
      "timestamp": "2025-10-10T15:30:00.000Z"
    }
  ]
}
```

## ダッシュボード更新

Watch Mode は GitHub Pages ダッシュボードをリアルタイム更新します。

### 更新される情報

1. **リアルタイムメトリクス** (`metrics/realtime.json`):
```json
{
  "timestamp": "2025-10-10T15:30:00+09:00",
  "openIssues": 18,
  "byState": {
    "pending": 5,
    "analyzing": 3,
    "implementing": 6,
    "reviewing": 3,
    "done": 1
  },
  "byPriority": {
    "P0": 2,
    "P1": 5,
    "P2": 8,
    "P3": 3
  }
}
```

2. **イベントログ** (`logs/events.jsonl`):
```jsonl
{"timestamp":"2025-10-10T15:30:00+09:00","type":"issues","action":"opened","issue":42,"priority":"P0"}
{"timestamp":"2025-10-10T15:32:15+09:00","type":"issues","action":"labeled","issue":42,"label":"🤖 agent:codegen"}
{"timestamp":"2025-10-10T16:45:30+09:00","type":"pull_request","action":"opened","pr":15,"title":"Fix API timeout"}
```

3. **グラフデータ** (`data/charts.json`):
```json
{
  "issueVelocity": [
    { "date": "2025-10-10", "opened": 5, "closed": 3 }
  ],
  "agentUtilization": {
    "codegen": 45,
    "review": 30,
    "coordinator": 15
  }
}
```

## CLI実装例

```typescript
// packages/cli/src/commands/watch.ts
import { Command } from 'commander';
import express from 'express';
import { Webhooks } from '@octokit/webhooks';
import localtunnel from 'localtunnel';

export const watchCommand = new Command('watch')
  .description('🌸 Watch継続監視モード（Webhook型）')
  .option('--events <events...>', '監視イベント', ['issues', 'pull_request', 'push'])
  .option('--notify <channels...>', '通知チャンネル', ['console'])
  .option('--port <port>', 'Webhookサーバーポート', '3939')
  .action(async (options) => {
    const app = express();
    const webhooks = new Webhooks({
      secret: process.env.GITHUB_WEBHOOK_SECRET || 'miyabi-secret'
    });

    // Webhook受信エンドポイント
    app.post('/webhook', express.json(), async (req, res) => {
      try {
        await webhooks.verifyAndReceive({
          id: req.headers['x-github-delivery'] as string,
          name: req.headers['x-github-event'] as any,
          signature: req.headers['x-hub-signature-256'] as string,
          payload: req.body
        });
        res.status(200).send('OK');
      } catch (error) {
        res.status(400).send('Invalid signature');
      }
    });

    // Issuesイベント処理
    webhooks.on('issues.opened', async ({ payload }) => {
      const { issue } = payload;
      console.log(`🆕 Issue opened: #${issue.number} - ${issue.title}`);

      // ラベル解析
      const priorityLabel = issue.labels.find(l => l.name.includes('priority:'));
      const isPriority = priorityLabel?.name.includes('P0') || priorityLabel?.name.includes('P1');

      // 通知送信
      if (isPriority) {
        await sendNotification(options.notify, {
          title: `🔥 [${priorityLabel.name}] New Issue`,
          body: `#${issue.number}: ${issue.title}`,
          url: issue.html_url
        });
      }

      // ダッシュボード更新
      await updateDashboard();
    });

    // サーバー起動
    const server = app.listen(options.port, () => {
      console.log(`🌸 Miyabi Watch Mode started on port ${options.port}`);
    });

    // localtunnel起動（外部アクセス用）
    const tunnel = await localtunnel({ port: options.port });
    console.log(`🌐 Webhook URL: ${tunnel.url}/webhook`);
    console.log(`👉 Register this URL as GitHub Webhook`);

    // Ctrl+C で終了
    process.on('SIGINT', () => {
      console.log('\n🛑 Stopping Watch Mode...');
      server.close();
      tunnel.close();
      process.exit(0);
    });
  });
```

## Webhook設定（GitHub）

### 自動設定（推奨）

```bash
# CLI が自動的に Webhook を設定
/miyabi-watch --auto-setup
```

内部で以下を実行:
```bash
gh api repos/ShunsukeHayashi/Miyabi/hooks \
  -X POST \
  -f url="https://your-tunnel.loca.lt/webhook" \
  -f content_type="json" \
  -f events[]="issues" \
  -f events[]="pull_request" \
  -f events[]="push"
```

### 手動設定

1. GitHub リポジトリ → Settings → Webhooks → Add webhook
2. **Payload URL**: `https://your-tunnel.loca.lt/webhook`
3. **Content type**: `application/json`
4. **Secret**: `miyabi-secret`（オプション）
5. **Events**: Individual events を選択
   - [x] Issues
   - [x] Pull requests
   - [x] Pushes
6. **Active**: ✅

## ユースケース

### 1. P0/P1 Issue即座通知

```bash
# Slackに即座通知
/miyabi-watch --events issues --notify slack --slack-webhook https://hooks.slack.com/...
```

### 2. PR作成時のレビュー依頼自動化

```bash
# PRが作成されたら自動的にレビュワー割り当て
/miyabi-watch --events pull_request --auto-assign-reviewers
```

### 3. ダッシュボードリアルタイム更新

```bash
# GitHub Pagesをリアルタイム更新
/miyabi-watch --dashboard-update
```

### 4. 開発中の継続監視

```bash
# ターミナルでリアルタイムログ表示
/miyabi-watch --notify console --log-level debug
```

## パフォーマンス

- **レイテンシ**: 1-3秒（GitHubイベント発生から通知まで）
- **API消費**: 0（Webhookはレート制限外）
- **推奨稼働時間**: 24/7運用可能

## セキュリティ

### Webhook Secret検証

```typescript
import crypto from 'crypto';

function verifySignature(payload: string, signature: string, secret: string): boolean {
  const hmac = crypto.createHmac('sha256', secret);
  const digest = 'sha256=' + hmac.update(payload).digest('hex');
  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(digest));
}
```

### 環境変数

```bash
GITHUB_WEBHOOK_SECRET=your-secret-here  # Webhook署名検証用
SLACK_WEBHOOK_URL=https://hooks.slack.com/...
DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/...
```

## 3モード比較表

| 特性 | Water Spider | Amembo | **Watch** |
|------|-------------|---------|-----------|
| **アーキテクチャ** | ポーリング | ポーリング | **Webhook** |
| **実行モデル** | 定期実行 | 定期実行 | **イベント駆動** |
| **レイテンシ** | 60秒 | 60秒 | **1-3秒** |
| **API消費** | 多 | 少 | **0（レート制限外）** |
| **用途** | Issue自動処理 | 状態レポート | **リアルタイム通知** |
| **稼働形態** | バッチ | バッチ | **常駐サーバー** |
| **通知** | なし | なし | **Slack/Discord/Email** |
| **ダッシュボード** | 更新なし | 更新なし | **リアルタイム更新** |

## トラブルシューティング

### Webhookが受信されない

```bash
# localtunnel の URL を確認
curl https://your-tunnel.loca.lt/webhook
# → "OK" が返ればサーバー起動中

# GitHub Webhook設定を確認
gh api repos/ShunsukeHayashi/Miyabi/hooks
```

### 通知が届かない

```bash
# Webhook URL を直接テスト
curl -X POST https://your-slack-webhook.com \
  -H "Content-Type: application/json" \
  -d '{"text":"Test from Miyabi"}'
```

### ポート競合

```bash
# 別ポートで起動
/miyabi-watch --port 4040
```

## 関連コマンド

- `/miyabi-auto` - Water Spider 全自動モード（ポーリング型）
- `/miyabi-amembo` - Amembo 軽量監視モード（ポーリング型）
- `/miyabi-status` - プロジェクト全体ステータス

## 実装ステータス

- [x] コマンド定義
- [x] MCP ツール仕様
- [ ] CLI 実装（packages/cli/src/commands/watch.ts）
- [ ] Webhook サーバー実装
- [ ] localtunnel/ngrok 統合
- [ ] Slack/Discord 通知実装
- [ ] ダッシュボード更新ロジック
- [ ] ユニットテスト
- [ ] E2E テスト

---

**🌸 Watch Mode** - リアルタイムで、常に見守る

イベント駆動で即座に反応、チームの動きを逃さない継続監視。
