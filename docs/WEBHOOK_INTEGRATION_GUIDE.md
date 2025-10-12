# Miyabi Webhook Integration Guide

## 概要

Miyabiのローカル環境WebHook統合システムは、Git操作（commit、push）を自動的に検知し、ローカル環境情報をダッシュボードにリアルタイムで送信します。

### 特徴

- **Git Hooks統合**: Pre-push、Post-commit フックによる自動トリガー
- **ローカル環境情報収集**: コミット情報、システム情報、プロジェクトメトリクスを自動収集
- **セキュリティ重視**: 機密情報を除外、URLのサニタイズ、環境変数の除外
- **マルチターゲット対応**: ダッシュボード、Slack、Discord への同時送信
- **隠しファイル管理**: `.webhook-config.json` は `.gitignore` で管理され、リポジトリにコミットされない

## アーキテクチャ

```
┌─────────────────────────────────────────────────────────┐
│ Git Operations (commit, push)                            │
└───────────────────┬─────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────────────┐
│ Git Hooks (.git/hooks/)                                  │
│ - pre-push                                               │
│ - post-commit                                            │
└───────────────────┬─────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────────────┐
│ Local Environment Collector                              │
│ (scripts/local-env-collector.ts)                        │
│                                                          │
│ Collects:                                                │
│ - Git info (branch, commit, author, stats)              │
│ - Device info (hostname, OS, Node version)              │
│ - Project info (name, version, path)                    │
└───────────────────┬─────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────────────┐
│ Webhook Dispatcher                                       │
│ - POST to Dashboard Server (/api/webhook/local)         │
│ - POST to Slack Webhook (optional)                      │
│ - POST to Discord Webhook (optional)                    │
└─────────────────────────────────────────────────────────┘
```

## セットアップ

### 1. 必要なファイルの確認

WebHook統合には以下のファイルが必要です：

```
Autonomous-Operations/
├── .webhook-config.json          # 設定ファイル（隠しファイル）
├── .git/hooks/
│   ├── pre-push                  # Pre-pushフック
│   └── post-commit               # Post-commitフック
└── scripts/
    └── local-env-collector.ts    # ローカル環境情報収集スクリプト
```

### 2. `.webhook-config.json` の設定

`.webhook-config.json` はローカル環境専用の設定ファイルです。このファイルは **必ず `.gitignore` に追加し、リポジトリにコミットしないでください**。

#### デフォルト設定

```json
{
  "dashboard_endpoint": "http://localhost:3001/api/webhook/local",
  "device_identifier": "MacBook",
  "notifications_enabled": true,
  "webhook_targets": {
    "dashboard_server": {
      "url": "http://localhost:3001/api/webhook/local",
      "enabled": true,
      "events": ["pre-push", "post-push", "pre-commit", "post-commit"]
    },
    "slack": {
      "url": "",
      "enabled": false,
      "events": ["post-push"]
    },
    "discord": {
      "url": "",
      "enabled": false,
      "events": ["post-push"]
    }
  },
  "collect_metrics": {
    "git_stats": true,
    "system_info": true,
    "project_info": true,
    "timestamp": true
  },
  "security": {
    "exclude_secrets": true,
    "exclude_env_vars": true,
    "sanitize_paths": true
  }
}
```

#### 設定項目の説明

| 項目 | 説明 |
|------|------|
| `dashboard_endpoint` | ダッシュボードサーバーのエンドポイント |
| `device_identifier` | デバイス識別子（複数デバイスを区別するため） |
| `notifications_enabled` | WebHook通知の有効/無効 |
| `webhook_targets.*.url` | 各ターゲットのWebHook URL |
| `webhook_targets.*.enabled` | 各ターゲットの有効/無効 |
| `webhook_targets.*.events` | 送信するイベントの種類 |
| `collect_metrics.*` | 収集するメトリクスの選択 |
| `security.*` | セキュリティ設定 |

### 3. Git Hooksの確認

Git Hooksが正しく設定されているか確認します：

```bash
# Pre-pushフックの確認
ls -l .git/hooks/pre-push

# Post-commitフックの確認
ls -l .git/hooks/post-commit

# 実行権限の確認（-rwxr-xr-x であるべき）
```

実行権限がない場合は、以下のコマンドで付与します：

```bash
chmod +x .git/hooks/pre-push
chmod +x .git/hooks/post-commit
```

### 4. ダッシュボードサーバーの起動

WebHookを受信するために、ダッシュボードサーバーを起動します：

```bash
# ダッシュボードサーバーを起動（ポート3001）
cd packages/dashboard-server
npm run dev
```

または、プロジェクトルートから：

```bash
npm run dashboard:server
```

サーバーが起動すると、以下のエンドポイントが利用可能になります：

- **WebHook受信**: `http://localhost:3001/api/webhook/local`
- **Socket.IO**: `ws://localhost:3001` (リアルタイム通知)

### 5. 動作確認

#### 5.1 手動テスト

WebHook収集スクリプトを手動で実行してテストします：

```bash
# Pre-push イベントのテスト
tsx scripts/local-env-collector.ts pre-push

# Post-commit イベントのテスト
tsx scripts/local-env-collector.ts post-commit
```

#### 5.2 Git操作によるテスト

実際のGit操作でWebHookがトリガーされることを確認します：

```bash
# コミットしてPost-commitフックをテスト
git add .
git commit -m "test: webhook integration test"

# pushしてPre-pushフックをテスト
git push
```

### 6. トラブルシューティング

#### WebHookが送信されない

**症状**: Git操作後にWebHookが送信されない

**確認事項**:
1. `.webhook-config.json` が存在するか
2. `notifications_enabled` が `true` になっているか
3. ダッシュボードサーバーが起動しているか
4. Git Hooksに実行権限があるか

```bash
# 設定ファイルの確認
cat .webhook-config.json

# Git Hooksの確認
ls -la .git/hooks/ | grep -E "(pre-push|post-commit)"
```

#### tsxコマンドが見つからない

**症状**: `tsx: command not found`

**解決策**: `tsx` をインストールします

```bash
# グローバルインストール
npm install -g tsx

# または、プロジェクトのdevDependenciesとして
npm install --save-dev tsx
```

#### ダッシュボードサーバーに接続できない

**症状**: `fetch failed: ECONNREFUSED`

**解決策**: ダッシュボードサーバーを起動します

```bash
cd packages/dashboard-server
npm run dev
```

または、`.webhook-config.json` のエンドポイントURLが正しいか確認します：

```json
{
  "dashboard_endpoint": "http://localhost:3001/api/webhook/local"
}
```

#### セキュリティ警告

**症状**: 機密情報がWebHookペイロードに含まれている可能性

**解決策**: `.webhook-config.json` のセキュリティ設定を有効にします

```json
{
  "security": {
    "exclude_secrets": true,
    "exclude_env_vars": true,
    "sanitize_paths": true
  }
}
```

## Webhook Payload仕様

### Pre-Push / Post-Push イベント

```typescript
interface LocalEnvPayload {
  event: 'pre-push' | 'post-push';
  timestamp: string; // ISO 8601形式
  device: {
    identifier: string; // デバイス識別子
    hostname: string;
    platform: string; // 'darwin', 'linux', 'win32'
    arch: string; // 'x64', 'arm64'
    nodeVersion: string; // 'v18.0.0'
  };
  git: {
    branch: string; // 'main', 'feat/webhook-integration'
    commit: {
      hash: string; // フルハッシュ
      short_hash: string; // 短縮ハッシュ
      message: string; // コミットメッセージ
      author: {
        name: string;
        email: string;
      };
      date: string; // ISO 8601形式
    };
    remote: {
      url: string; // リモートURL（サニタイズ済み）
      name: string; // 'origin'
    };
    stats: {
      files_changed: number;
      insertions: number;
      deletions: number;
    };
  };
  project: {
    name: string; // プロジェクト名
    path: string; // プロジェクトパス（サニタイズ設定に依存）
    package_version?: string; // package.jsonのバージョン
  };
}
```

### Post-Commit イベント

Post-Commitイベントのペイロードは、Pre-Push/Post-Pushと同じ構造です。

```typescript
interface LocalEnvPayload {
  event: 'post-commit';
  // ... 同じフィールド
}
```

## カスタマイズ

### Slackへの通知

Slack WebHook URLを設定することで、Slackへの通知が可能です：

1. Slack AppでIncoming Webhookを有効化
2. Webhook URLを取得
3. `.webhook-config.json` に設定

```json
{
  "webhook_targets": {
    "slack": {
      "url": "https://hooks.slack.com/services/YOUR/WEBHOOK/URL",
      "enabled": true,
      "events": ["post-push"]
    }
  }
}
```

### Discordへの通知

Discord WebHook URLを設定することで、Discordへの通知が可能です：

1. Discordサーバー設定でWebhookを作成
2. Webhook URLを取得
3. `.webhook-config.json` に設定

```json
{
  "webhook_targets": {
    "discord": {
      "url": "https://discord.com/api/webhooks/YOUR/WEBHOOK/URL",
      "enabled": true,
      "events": ["post-push"]
    }
  }
}
```

### カスタムイベント

新しいGit Hookを追加する場合：

1. `.git/hooks/` に新しいフックスクリプトを作成
2. `local-env-collector.ts` でイベントタイプを追加
3. `.webhook-config.json` の `events` 配列に追加

例：`pre-commit` イベントの追加

```bash
# .git/hooks/pre-commit を作成
#!/bin/bash
tsx scripts/local-env-collector.ts pre-commit
```

```json
{
  "webhook_targets": {
    "dashboard_server": {
      "events": ["pre-push", "post-push", "pre-commit", "post-commit"]
    }
  }
}
```

## セキュリティベストプラクティス

### 1. `.webhook-config.json` を必ず `.gitignore` に追加

```bash
# .gitignoreに追加されているか確認
grep "webhook-config" .gitignore

# 追加されていない場合は追加
echo ".webhook-config.json" >> .gitignore
```

### 2. Webhook URLにアクセストークンを含めない

```json
// ❌ 悪い例
{
  "dashboard_endpoint": "http://localhost:3001/api/webhook/local?token=secret"
}

// ✅ 良い例
{
  "dashboard_endpoint": "http://localhost:3001/api/webhook/local"
}
```

代わりに、環境変数やHTTPヘッダーでトークンを渡します。

### 3. サニタイズ設定を有効化

```json
{
  "security": {
    "exclude_secrets": true,
    "exclude_env_vars": true,
    "sanitize_paths": true
  }
}
```

### 4. 本番環境でのエンドポイント変更

本番環境では、ローカルホストではなく実際のサーバーURLを使用します：

```json
{
  "dashboard_endpoint": "https://miyabi-dashboard.example.com/api/webhook/local"
}
```

## FAQ

### Q: WebHookが遅い

**A**: 非同期送信を有効にするか、WebHookターゲットを減らしてください。また、ダッシュボードサーバーのパフォーマンスを確認してください。

### Q: WebHookを一時的に無効にしたい

**A**: `.webhook-config.json` の `notifications_enabled` を `false` に設定します：

```json
{
  "notifications_enabled": false
}
```

### Q: 特定のブランチでのみWebHookを有効にしたい

**A**: Git Hookスクリプト内でブランチチェックを追加します：

```bash
# .git/hooks/pre-push
BRANCH=$(git rev-parse --abbrev-ref HEAD)
if [ "$BRANCH" != "main" ]; then
  echo "Skipping webhook (not on main branch)"
  exit 0
fi
```

### Q: WebHookのログを確認したい

**A**: `local-env-collector.ts` は標準出力にログを出力します。Git Hookの出力を確認してください。

## 関連ドキュメント

- [GITHUB_OS_INTEGRATION.md](./GITHUB_OS_INTEGRATION.md) - GitHub OS統合ガイド
- [AGENT_OPERATIONS_MANUAL.md](./AGENT_OPERATIONS_MANUAL.md) - Agent運用マニュアル
- [LABEL_SYSTEM_GUIDE.md](./LABEL_SYSTEM_GUIDE.md) - 53ラベル体系ガイド

## まとめ

Miyabi WebHook統合により、ローカル開発環境からリアルタイムでプロジェクト情報をダッシュボードに送信できます。Git Hooksを活用することで、手動操作なしに自動的にWebHookがトリガーされ、チーム全体の開発状況を可視化できます。

セキュリティ設定を適切に行い、機密情報がリポジトリやWebHookペイロードに含まれないように注意してください。
