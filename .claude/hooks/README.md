# Claude Code Hooks - Agent Dashboard Integration

## 概要

`.claude/hooks/`には、Agent実行時にMiyabi Dashboardへイベントを送信するhookスクリプトがあります。

---

## 利用可能なHook

### `agent-event.sh`

Agent実行イベントをダッシュボードにリアルタイム送信します。

**使用方法:**
```bash
./agent-event.sh <event_type> <agent_id> <issue_number> [options]
```

**イベントタイプ:**

| Type | Description | Usage |
|------|-------------|-------|
| `started` | Agent開始 | `./agent-event.sh started coordinator 47` |
| `progress` | 進捗更新 | `./agent-event.sh progress codegen 58 50 "Generating code..."` |
| `completed` | 完了 | `./agent-event.sh completed review 47 '{"success":true}'` |
| `error` | エラー | `./agent-event.sh error issue 47 "Failed to parse"` |

---

## Agent IDリスト

| Agent ID | Name | Description |
|----------|------|-------------|
| `coordinator` | CoordinatorAgent | タスク統括・DAG分解 |
| `codegen` | CodeGenAgent | AI駆動コード生成 |
| `review` | ReviewAgent | コード品質レビュー |
| `issue` | IssueAgent | Issue分析・ラベリング |
| `pr` | PRAgent | Pull Request作成 |
| `deployment` | DeploymentAgent | CI/CDデプロイ |
| `test` | TestAgent | テスト実行 |

---

## TypeScriptからの使用

### 基本的な使用

```typescript
import {
  emitAgentStarted,
  emitAgentProgress,
  emitAgentCompleted,
  emitAgentError,
} from '../scripts/dashboard-events.js';

async function executeAgent(issueNumber: number) {
  await emitAgentStarted('coordinator', issueNumber);

  try {
    // ... agent logic
    await emitAgentProgress('coordinator', issueNumber, 50, 'Processing...');

    // ... more logic
    await emitAgentCompleted('coordinator', issueNumber, { success: true });
  } catch (error) {
    await emitAgentError('coordinator', issueNumber, error);
    throw error;
  }
}
```

### 自動追跡（推奨）

```typescript
import { withAgentTracking } from '../scripts/dashboard-events.js';

async function executeAgent(issueNumber: number) {
  return await withAgentTracking('coordinator', issueNumber, async (progress) => {
    progress(10, 'Starting analysis...');

    // Step 1: Analyze
    const analysis = await analyzeIssue(issueNumber);
    progress(30, 'Analysis complete');

    // Step 2: Create tasks
    const tasks = await createTasks(analysis);
    progress(60, 'Tasks created');

    // Step 3: Assign agents
    await assignAgents(tasks);
    progress(100, 'Completed!');

    return { success: true, tasks };
  });
}
```

---

## 実際の統合例

### 例1: IssueAgent (`scripts/ai-label-issue.ts`)

```typescript
import { withAgentTracking } from './dashboard-events.js';

async function main() {
  const issueNumber = parseInt(process.argv[2], 10);

  await withAgentTracking('issue', issueNumber, async (progress) => {
    progress(10, 'Fetching issue data...');
    const issue = await fetchIssue(issueNumber);

    progress(30, 'Analyzing with Claude AI...');
    const suggestion = await analyzeIssueWithAI(issue);

    progress(60, 'Applying labels...');
    await applyLabels(issueNumber, suggestion.labels);

    progress(80, 'Adding analysis comment...');
    await addComment(issueNumber, suggestion.reasoning);

    progress(100, 'Completed!');
    return { success: true, labelsApplied: suggestion.labels };
  });
}
```

**ダッシュボードでの表示:**
```
Issue #47 → 🤖 IssueAgent (Running - 60%)
             "Applying labels..."
```

---

### 例2: CoordinatorAgent

```typescript
import { withAgentTracking } from './dashboard-events.js';

async function coordinateTask(issueNumber: number) {
  await withAgentTracking('coordinator', issueNumber, async (progress) => {
    progress(10, 'Analyzing dependencies...');
    const deps = await analyzeDependencies(issueNumber);

    progress(30, 'Building DAG...');
    const dag = await buildDAG(deps);

    progress(50, 'Assigning specialist agents...');
    const assignments = await assignSpecialists(dag);

    progress(80, 'Creating sub-tasks...');
    await createSubTasks(assignments);

    progress(100, 'Coordination complete!');
    return { success: true, subTasks: assignments.length };
  });
}
```

---

## 環境変数

### `DASHBOARD_URL`

ダッシュボードサーバーのURL（デフォルト: `http://localhost:3001`）

```bash
export DASHBOARD_URL=https://dashboard.miyabi.dev
```

### `DEBUG`

デバッグログを有効化

```bash
export DEBUG=1
npm run ai:label ShunsukeHayashi Miyabi 47
```

出力:
```
📡 Agent event sent: started - issue on #47
📡 Agent event sent: progress - issue on #47
📡 Agent event sent: completed - issue on #47
```

---

## トラブルシューティング

### イベントが送信されない

**原因1: ダッシュボードサーバーが起動していない**
```bash
# サーバーを起動
pnpm dashboard:server
```

**原因2: Hookスクリプトに実行権限がない**
```bash
chmod +x .claude/hooks/agent-event.sh
```

**原因3: `curl`コマンドがない**
```bash
# macOS/Linux: 通常はインストール済み
which curl

# Windows: WSLまたはGit Bashを使用
```

### ダッシュボードにイベントが表示されない

**デバッグモードで確認:**
```bash
DEBUG=1 npm run ai:label ShunsukeHayashi Miyabi 47
```

**サーバーログを確認:**
```bash
# バックエンドのログ
tail -f packages/dashboard-server/logs/*.log

# または直接確認
pnpm dashboard:server
# → "📡 Agent event: started - issue on #47" と表示されるはず
```

**手動でテスト:**
```bash
# Hook直接実行
./.claude/hooks/agent-event.sh started coordinator 47

# curlで直接送信
curl -X POST http://localhost:3001/api/agent-event \
  -H "Content-Type: application/json" \
  -d '{"eventType":"started","agentId":"coordinator","issueNumber":47}'
```

---

## 今後の拡張

### 計画中の機能

- [ ] Agent間の依存関係追跡
- [ ] エラーの自動リトライ
- [ ] Slack/Discord通知連携
- [ ] メトリクス収集（実行時間、成功率）
- [ ] Agent実行履歴の永続化

### カスタムHooks

独自のHookを追加できます：

```bash
# .claude/hooks/custom-event.sh
#!/bin/bash
# Custom event processing
curl -X POST http://localhost:3001/api/custom-event \
  -H "Content-Type: application/json" \
  -d '{"type":"custom","data":"..."}'
```

---

## 関連ドキュメント

- [Agent Visualization Dashboard](../../docs/AGENT_VISUALIZATION_DASHBOARD.md)
- [Dashboard Server README](../../packages/dashboard-server/README.md)
- [Dependency Visualization](../../docs/DEPENDENCY_VISUALIZATION.md)
- [WebHook Setup](../../packages/dashboard-server/WEBHOOK_SETUP.md)
