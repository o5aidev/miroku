# Miyabi Amembo Mode (アメンボモード)

**軽量Issue監視 - Water Strider が水面を軽やかに滑るように、Issueの状態を素早くスキャン**

## 概要

Amembo (水黽) は、Water Spider の軽量版です。Issue を自動処理するのではなく、Issue の状態を高速でスキャンし、レポートを生成します。

**Water Spider との違い**:
- **Water Spider** (蜘蛛): 重厚・執行型 - Issueを検出して自動実行
- **Amembo** (水黽): 軽量・監視型 - Issueをスキャンして状態レポート

## 使い方

### 基本実行

```bash
# デフォルト設定でAmemboモード起動
/miyabi-amembo
```

### オプション指定

```bash
# 最大50件のIssueをスキャン
/miyabi-amembo --max-issues 50

# 特定ラベルのみスキャン
/miyabi-amembo --label "🔥 priority:P0-Critical"

# JSON形式で出力
/miyabi-amembo --format json
```

## MCPツール

### `miyabi__amembo`

Amembo軽量監視モードを起動

**パラメータ**:
- `maxIssues` (number): 最大スキャンIssue数（デフォルト: 20）
- `labels` (string[]): フィルタリングラベル（オプション）
- `format` ('text' | 'json' | 'markdown'): 出力形式（デフォルト: 'markdown'）
- `includeClosedIssues` (boolean): クローズ済みIssueも含める（デフォルト: false）

**戻り値**:
```typescript
{
  scannedAt: string;           // ISO 8601 timestamp
  totalIssues: number;         // スキャンした総Issue数
  byState: {
    pending: number;
    analyzing: number;
    implementing: number;
    reviewing: number;
    done: number;
  };
  byPriority: {
    'P0-Critical': number;
    'P1-High': number;
    'P2-Medium': number;
    'P3-Low': number;
  };
  byAgent: {
    coordinator: number;
    codegen: number;
    review: number;
    issue: number;
    pr: number;
    deployment: number;
    test: number;
  };
  topIssues: Array<{
    number: number;
    title: string;
    state: string;
    priority: string;
    assignedAgent: string;
    updatedAt: string;
  }>;
}
```

## 動作フロー

```
Amembo起動
    ↓
GitHub Issues API呼び出し
    ↓
Open Issues取得（最大20件）
    ↓
ラベル解析
├─ STATE ラベル抽出
├─ PRIORITY ラベル抽出
└─ AGENT ラベル抽出
    ↓
集計処理
├─ 状態別カウント
├─ 優先度別カウント
└─ Agent割り当て別カウント
    ↓
レポート生成
├─ Markdown形式（デフォルト）
├─ JSON形式（--format json）
└─ Text形式（--format text）
    ↓
出力・表示
```

## 出力例

### Markdown形式（デフォルト）

```markdown
# 🌸 Miyabi Amembo Report

**Scanned at**: 2025-10-10T15:30:00+09:00
**Total Issues**: 18

## 📊 By State

| State | Count | % |
|-------|-------|---|
| 📥 pending | 5 | 27.8% |
| 🔍 analyzing | 3 | 16.7% |
| 🏗️ implementing | 6 | 33.3% |
| 👀 reviewing | 3 | 16.7% |
| ✅ done | 1 | 5.5% |

## 🔥 By Priority

| Priority | Count |
|----------|-------|
| P0-Critical | 2 |
| P1-High | 5 |
| P2-Medium | 8 |
| P3-Low | 3 |

## 🤖 By Agent

| Agent | Count |
|-------|-------|
| coordinator | 2 |
| codegen | 7 |
| review | 4 |
| issue | 3 |
| pr | 2 |

## 🔝 Top Priority Issues

1. **#42** - [P0] Production API timeout error
   - State: 🏗️ implementing
   - Agent: 🤖 codegen
   - Updated: 2 hours ago

2. **#38** - [P0] Database connection pool exhausted
   - State: 👀 reviewing
   - Agent: 🤖 review
   - Updated: 5 hours ago
```

### JSON形式（--format json）

```json
{
  "scannedAt": "2025-10-10T15:30:00+09:00",
  "totalIssues": 18,
  "byState": {
    "pending": 5,
    "analyzing": 3,
    "implementing": 6,
    "reviewing": 3,
    "done": 1
  },
  "byPriority": {
    "P0-Critical": 2,
    "P1-High": 5,
    "P2-Medium": 8,
    "P3-Low": 3
  },
  "byAgent": {
    "coordinator": 2,
    "codegen": 7,
    "review": 4,
    "issue": 3,
    "pr": 2,
    "deployment": 0,
    "test": 0
  },
  "topIssues": [
    {
      "number": 42,
      "title": "Production API timeout error",
      "state": "implementing",
      "priority": "P0-Critical",
      "assignedAgent": "codegen",
      "updatedAt": "2025-10-10T13:30:00+09:00"
    }
  ]
}
```

## ユースケース

### 1. 朝会前の状況確認

```bash
# 朝一でIssue状況をスキャン
/miyabi-amembo

# → P0が2件、implementingが6件、などが一目瞭然
```

### 2. CI/CDパイプライン統合

```yaml
# .github/workflows/daily-report.yml
name: Daily Amembo Report
on:
  schedule:
    - cron: '0 0 * * *'  # 毎日0時

jobs:
  amembo-scan:
    runs-on: ubuntu-latest
    steps:
      - name: Run Amembo
        run: |
          npx miyabi amembo --format json > report.json

      - name: Post to Slack
        uses: slackapi/slack-github-action@v1
        with:
          payload-file-path: report.json
```

### 3. ダッシュボード連携

```bash
# JSON形式で出力してダッシュボードに送信
/miyabi-amembo --format json | curl -X POST https://dashboard.example.com/api/metrics
```

### 4. 特定ラベルのみ監視

```bash
# P0/P1のみスキャン
/miyabi-amembo --label "🔥 priority:P0-Critical" --label "⚠️ priority:P1-High"

# セキュリティ関連のみ
/miyabi-amembo --label "🔐 security"

# Agent別
/miyabi-amembo --label "🤖 agent:codegen"
```

## CLI実装例

```typescript
// packages/cli/src/commands/amembo.ts
import { Command } from 'commander';
import { Octokit } from '@octokit/rest';

export const amemboCommand = new Command('amembo')
  .description('🌸 Amembo軽量Issue監視モード')
  .option('--max-issues <number>', '最大スキャンIssue数', '20')
  .option('--label <labels...>', 'フィルタリングラベル')
  .option('--format <format>', '出力形式 (text|json|markdown)', 'markdown')
  .option('--include-closed', 'クローズ済みIssueも含める', false)
  .action(async (options) => {
    const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });

    const { data: issues } = await octokit.issues.listForRepo({
      owner: 'ShunsukeHayashi',
      repo: 'Miyabi',
      state: options.includeClosed ? 'all' : 'open',
      per_page: parseInt(options.maxIssues),
      labels: options.label?.join(',')
    });

    // ラベル解析・集計
    const report = analyzeIssues(issues);

    // フォーマット別出力
    if (options.format === 'json') {
      console.log(JSON.stringify(report, null, 2));
    } else if (options.format === 'markdown') {
      console.log(formatMarkdown(report));
    } else {
      console.log(formatText(report));
    }
  });
```

## パフォーマンス

- **実行時間**: 2-5秒（GitHub API 1-2リクエスト）
- **レート制限**: 1回の実行で1-2リクエスト消費
- **推奨頻度**: 10分に1回まで（レート制限考慮）

## Water Spider との使い分け

| 特性 | Water Spider | Amembo |
|------|-------------|---------|
| **目的** | Issue自動処理 | Issue状態監視 |
| **実行時間** | 数分〜数時間 | 2-5秒 |
| **API消費** | 多（Agent実行含む） | 少（1-2リクエスト） |
| **実行頻度** | 1時間に1回 | 10分に1回 |
| **用途** | 夜間バッチ処理 | リアルタイム監視 |
| **出力** | PR作成、コミット | レポート生成 |

## トラブルシューティング

### Issue数が少ない

```bash
# maxIssues を増やす
/miyabi-amembo --max-issues 100
```

### ラベルが認識されない

```bash
# ラベル名を完全一致で指定（絵文字含む）
/miyabi-amembo --label "🔥 priority:P0-Critical"
```

### JSON出力が失敗する

```bash
# フォーマット指定を確認
/miyabi-amembo --format json  # ✅ 正しい
/miyabi-amembo --format JSON  # ❌ 大文字は不可
```

## 関連コマンド

- `/miyabi-auto` - Water Spider 全自動モード
- `/miyabi-watch` - 継続監視モード（リアルタイム）
- `/miyabi-status` - プロジェクト全体ステータス

## 実装ステータス

- [x] コマンド定義
- [x] MCP ツール仕様
- [ ] CLI 実装（packages/cli/src/commands/amembo.ts）
- [ ] MCP Server 実装（mcp-servers/miyabi-integration.js）
- [ ] ユニットテスト
- [ ] E2E テスト

---

**🌸 Amembo** - 軽やかに、素早く、Issue の状態を把握

水黽のように水面を滑るスピード感で、プロジェクトの健全性をチェック。
