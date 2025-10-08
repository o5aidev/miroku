# GitHub Webhooks Integration

## 🎯 概要

GitHub Webhooks を**イベントバス / IPC（プロセス間通信）**として活用し、イベント駆動型の Agent 自動起動システムを実現します。

**OS Mapping**: `GitHub Webhooks → Event Bus / IPC (Inter-Process Communication)`

---

## 📋 アーキテクチャ

```
┌─────────────────────────────────────────────────────────────┐
│                     GitHub Events                            │
│                    (Event Sources)                           │
├─────────────────────────────────────────────────────────────┤
│  Issues  │  PRs  │  Push  │  Comments  │  Reviews  │  ...   │
└────┬─────┴───┬───┴────┬───┴──────┬─────┴─────┬─────┴────────┘
     │         │        │          │           │
     │         │        │          │           │
     ▼         ▼        ▼          ▼           ▼
┌─────────────────────────────────────────────────────────────┐
│                    Event Router                              │
│              (agents/orchestrator/event-router.ts)           │
├─────────────────────────────────────────────────────────────┤
│  • Route events to agents                                    │
│  • Priority calculation                                      │
│  • Task creation                                             │
└────┬─────┬──────┬──────┬──────┬──────┬──────┬──────────────┘
     │     │      │      │      │      │      │
     ▼     ▼      ▼      ▼      ▼      ▼      ▼
┌─────────────────────────────────────────────────────────────┐
│                     Agent Pool                               │
├─────────────────────────────────────────────────────────────┤
│  CodeGen  │ Review │  Docs  │   CI   │ Deploy │ Metrics    │
└─────────────────────────────────────────────────────────────┘
```

---

## 🚀 イベントルーティング

### Issue Events

| Event | Action | Agent | Task | Priority |
|-------|--------|-------|------|----------|
| `issues` | `opened` (bug label) | CodeGenAgent | fix_bug | 2 (High) |
| `issues` | `opened` (feature label) | CodeGenAgent | implement_feature | 3 (Medium) |
| `issues` | `opened` (docs label) | DocsAgent | update_docs | 4 (Low) |
| `issues` | `opened` (no label) | CoordinatorAgent | triage_issue | 3 (Medium) |
| `issues` | `labeled` (ready/approved) | CodeGenAgent | start_task | 2 (High) |
| `issues` | `closed` | MetricsAgent | record_completion | 5 (Lowest) |

### Pull Request Events

| Event | Action | Agent | Task | Priority |
|-------|--------|-------|------|----------|
| `pull_request` | `opened` | ReviewAgent | review_pr | 2 (High) |
| `pull_request` | `synchronize` | ReviewAgent | review_pr | 3 (Medium) |
| `pull_request` | `closed` (merged) | DeploymentAgent | deploy | 1 (Critical) |

### Push Events

| Event | Branch | Agent | Task | Priority |
|-------|--------|-------|------|----------|
| `push` | `main`/`master` | CIAgent | run_ci | 1 (Critical) |
| `push` | other | - | - | - |

### Comment Events

| Event | Condition | Agent | Task | Priority |
|-------|-----------|-------|------|----------|
| `issue_comment` | contains `@agent` | CoordinatorAgent | respond_to_comment | 2 (High) |

### Review Events

| Event | State | Agent | Task | Priority |
|-------|-------|-------|------|----------|
| `pull_request_review` | `changes_requested` | CodeGenAgent | address_review_comments | 2 (High) |

---

## 🔧 セットアップ

### 1. GitHub Actions による自動リスニング

Webhook イベントは GitHub Actions で自動的にリッスンされます。追加設定は不要です。

**ワークフロー:**
- `.github/workflows/webhook-agent-dispatch.yml` - 全イベントをルーティング
- `.github/workflows/auto-assign-agent.yml` - ラベルベースの自動割り当て

### 2. ラベルの設定

以下のラベルを Repository に作成してください:

#### Agent 指定ラベル
- `agent:codegen` - CodeGenAgent を割り当て
- `agent:review` - ReviewAgent を割り当て
- `agent:docs` - DocsAgent を割り当て

#### タスクタイプラベル
- `bug` - バグ修正（高優先度）
- `feature` - 新機能実装（中優先度）
- `documentation` - ドキュメント更新（低優先度）

#### ステータスラベル
- `ready` - Agent 実行準備完了
- `approved` - Guardian 承認済み

#### 優先度ラベル
- `critical` / `urgent` - 最優先（Priority 1）
- `high-priority` - 高優先度（Priority 2）
- `medium-priority` - 中優先度（Priority 3）
- `low-priority` - 低優先度（Priority 4）

---

## 📊 使い方

### 自動イベントルーティング

#### Issue 作成時

```
1. Issue が作成される
2. webhook-agent-dispatch.yml が自動実行
3. EventRouter がラベルを分析
4. 適切な Agent にタスクを割り当て
5. タスク情報を artifact として保存
```

**例:**
```bash
# Issue #123 に "bug" ラベルを付けて作成
→ CodeGenAgent に fix_bug タスクが割り当てられる（Priority 2）
```

#### ラベル追加時

```
1. Issue に "agent:codegen" ラベルを追加
2. auto-assign-agent.yml が自動実行
3. CodeGenAgent がコメントで割り当てを通知
4. タスクがキューに追加
```

**例:**
```bash
# Issue #456 に "ready" ラベルを追加
→ CodeGenAgent に start_task が割り当てられる
→ Issue にコメントが自動投稿される
```

### プログラムから使用

```typescript
import { EventRouter } from './agents/orchestrator/event-router.js';

const router = new EventRouter();

// Webhook event payload から
const tasks = await router.route({
  type: 'issues',
  action: 'opened',
  payload: {
    issue: {
      number: 123,
      title: 'Fix authentication bug',
      body: '...',
      labels: [{ name: 'bug' }],
    },
  },
});

console.log(`Routed to ${tasks.length} agent(s):`);
for (const task of tasks) {
  console.log(`  ${task.agent}: ${task.taskType} (priority: ${task.priority})`);
}
```

---

## 🎨 使用パターン

### Pattern 1: Issue → Agent 自動割り当て

```
1. 開発者が Issue を作成（ラベル: "bug"）
2. EventRouter が自動検知
3. CodeGenAgent に fix_bug タスクを割り当て
4. Agent が自動的にタスクを実行（並列システム実装後）
5. PR 作成、テスト、マージまで自動化
```

### Pattern 2: PR レビュー自動化

```
1. Agent が PR を作成
2. ReviewAgent が自動的にレビュー開始
3. コードスキャン、テスト結果を分析
4. 承認またはコメントで変更要求
5. 変更要求の場合、CodeGenAgent が自動修正
```

### Pattern 3: デプロイパイプライン

```
1. PR が main にマージ
2. DeploymentAgent が自動起動
3. ビルド、テスト、デプロイを実行
4. 成功/失敗を Issue にコメント
5. メトリクスを Projects V2 に記録
```

### Pattern 4: コメント駆動実行

```
1. 開発者が Issue に "@agent please implement this" とコメント
2. CoordinatorAgent が検知
3. タスクを分析して適切な Agent に委譲
4. Agent が実装を開始
```

---

## 📈 統合フロー

### 完全自動化フロー（将来実装）

```
Issue 作成
  ↓
EventRouter がルーティング
  ↓
TaskOrchestrator がタスクをキューに追加
  ↓
WorkerRegistry が利用可能な Worker を検索
  ↓
TaskToolWrapper が Claude Code Task tool で実行
  ↓
Git Worktree で分離環境作成
  ↓
Agent がタスク実行
  ↓
PR 作成、テスト実行
  ↓
ReviewAgent がレビュー
  ↓
main にマージ
  ↓
DeploymentAgent がデプロイ
  ↓
MetricsAgent が完了を記録
  ↓
Discussions に成功事例を投稿
```

---

## 🔧 API リファレンス

### EventRouter

#### `route(event: WebhookEvent): Promise<AgentTask[]>`

Webhook イベントを Agent タスクにルーティングします。

**Parameters:**
```typescript
interface WebhookEvent {
  type: 'issues' | 'pull_request' | 'push' | 'issue_comment' | 'pull_request_review';
  action?: string;
  payload: any;  // GitHub webhook payload
}
```

**Returns:**
```typescript
interface AgentTask {
  agent: string;        // Agent 名
  priority: number;     // 1 (Critical) ~ 5 (Lowest)
  taskType: string;     // タスクタイプ
  payload: any;         // タスク固有のデータ
}[]
```

#### `getPriority(labels: string[]): number`

ラベルから優先度を計算します。

| Labels | Priority |
|--------|----------|
| `critical`, `urgent` | 1 |
| `high-priority`, `bug` | 2 |
| `medium-priority`, `feature` | 3 |
| `low-priority`, `documentation` | 4 |
| (default) | 5 |

---

## 🎯 Phase B: 完了基準

- [x] `EventRouter` 実装完了
- [x] Issue イベントルーティング
- [x] PR イベントルーティング
- [x] Push イベントルーティング
- [x] Comment イベントルーティング
- [x] 優先度計算ロジック
- [x] GitHub Actions ワークフロー（自動ルーティング）
- [x] GitHub Actions ワークフロー（ラベルベース割り当て）
- [x] ドキュメント完成

---

## 🔗 統合ポイント

### Projects V2 との連携

```typescript
// Agent タスク完了時に Projects V2 を更新
import { ProjectsV2Client } from './agents/github/projects-v2.js';

async function onTaskComplete(task: AgentTask, result: TaskResult) {
  const client = new ProjectsV2Client(token, config);
  await client.initialize();

  const issueNodeId = await client.getIssueNodeId(task.payload.issueNumber);
  const itemId = await client.addIssueToProject(issueNodeId);

  await client.updateFieldValue(itemId, agentFieldId, task.agent);
  await client.updateFieldValue(itemId, durationFieldId, result.duration);
  await client.updateStatus(itemId, 'Done');
}
```

### Discussions との連携

```typescript
// タスク失敗時に Discussions に質問を投稿
import { DiscussionsClient } from './agents/github/discussions.js';

async function onTaskError(task: AgentTask, error: Error) {
  const client = new DiscussionsClient(token, config);
  await client.initialize();

  await client.createAgentQuestion(
    `Help needed: ${task.taskType} failed`,
    `Agent encountered an error while processing Issue #${task.payload.issueNumber}:\n\n${error.message}`
  );
}
```

---

## 🚨 トラブルシューティング

### Workflow が実行されない

**原因**: GitHub Actions が有効化されていない

**解決策**:
1. Repository → Settings → Actions
2. "Allow all actions and reusable workflows" を選択
3. Save

### Agent が割り当てられない

**原因**: ラベルが正しく設定されていない

**解決策**:
1. Issue に `bug`, `feature`, `documentation` のいずれかを追加
2. または `agent:codegen`, `agent:review`, `agent:docs` を追加
3. または `ready` ラベルを追加

### 優先度が期待通りでない

**原因**: 優先度ラベルが不足

**解決策**:
Priority ラベルを追加:
- `critical` / `urgent` → Priority 1
- `high-priority` → Priority 2
- `medium-priority` → Priority 3
- `low-priority` → Priority 4

---

## 📚 次のステップ

Phase B 完了後:
- **並列システム Phase 1-2**: TaskOrchestrator + TaskToolWrapper 実装
- **Phase E**: GitHub Pages ダッシュボード（可視化）

これにより、EventRouter → TaskOrchestrator → TaskToolWrapper → Agent 実行の完全自動フローが実現します。

詳細:
- [Issue #5](https://github.com/YOUR_USERNAME/Autonomous-Operations/issues/5) - Full OS Integration
- [Issue #6](https://github.com/YOUR_USERNAME/Autonomous-Operations/issues/6) - Parallel Work System
- [PARALLEL_WORK_ARCHITECTURE.md](./PARALLEL_WORK_ARCHITECTURE.md)

---

## 🎨 イベントルーティング詳細

### Issue Events: 完全マッピング

```typescript
issues.opened + label:bug
  → CodeGenAgent.fix_bug (Priority: 2)

issues.opened + label:feature
  → CodeGenAgent.implement_feature (Priority: 3)

issues.opened + label:documentation
  → DocsAgent.update_docs (Priority: 4)

issues.opened + no_label
  → CoordinatorAgent.triage_issue (Priority: 3)

issues.labeled + label:ready
  → CodeGenAgent.start_task (Priority: 2)

issues.labeled + label:approved
  → CodeGenAgent.start_task (Priority: 2)

issues.closed
  → MetricsAgent.record_completion (Priority: 5)
```

### PR Events: 完全マッピング

```typescript
pull_request.opened
  → ReviewAgent.review_pr (Priority: 2)

pull_request.synchronize
  → ReviewAgent.review_pr (Priority: 3)

pull_request.closed + merged:true
  → DeploymentAgent.deploy (Priority: 1)
```

### Comment Events: パターンマッチング

```typescript
issue_comment.created + body contains "@agent"
  → CoordinatorAgent.respond_to_comment (Priority: 2)

issue_comment.created + body contains "/agent"
  → CoordinatorAgent.respond_to_comment (Priority: 2)
```

---

## 💡 ベストプラクティス

### 1. 適切なラベル付け

Issue 作成時に適切なラベルを付けることで、Agent が自動的に最適なタスクを開始します。

```
✓ Good: Issue + "bug" label → CodeGenAgent.fix_bug (Priority 2)
✗ Bad:  Issue + no label   → CoordinatorAgent.triage_issue (Priority 3, 遅延)
```

### 2. 優先度の明示

緊急タスクには `critical` または `urgent` ラベルを追加します。

```
✓ Good: Issue + "bug" + "critical" → Priority 1
✓ Good: Issue + "feature" + "high-priority" → Priority 2
```

### 3. Agent への直接割り当て

特定の Agent を使用したい場合は `agent:*` ラベルを使用します。

```
✓ Good: Issue + "agent:codegen" → CodeGenAgent に直接割り当て
```

### 4. 段階的実行

`ready` ラベルで Agent 実行タイミングをコントロールします。

```
1. Issue 作成（ラベルなし） → 自動割り当てなし
2. 設計・議論
3. "ready" ラベル追加 → Agent 実行開始
```

---

## 🏁 まとめ

Phase B で実現すること:
- ✅ イベント駆動型アーキテクチャ
- ✅ 自動 Agent 割り当て
- ✅ 優先度ベースのタスクルーティング
- ✅ GitHub Actions との完全統合
- ✅ 拡張可能なイベントルーター

次のステップ:
- TaskOrchestrator でタスクキュー管理（Issue #6 Phase 1）
- TaskToolWrapper で Claude Code 統合（Issue #6 Phase 2）
- 完全自動化フロー実現
