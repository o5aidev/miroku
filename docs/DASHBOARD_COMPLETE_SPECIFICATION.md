# 🎯 Dashboard Complete Specification
## 完全な再現性を持つレイアウト・イベントシステム定義書

**作成日:** 2025-10-12
**バージョン:** 1.0.0
**ステータス:** Draft (第1回レビュー前)

---

## 📋 目次

1. [全イベントタイプの完全リスト](#1-全イベントタイプの完全リスト)
2. [イベント発火条件と状態遷移](#2-イベント発火条件と状態遷移)
3. [Webhook API仕様（リクエスト/レスポンス）](#3-webhook-api仕様)
4. [ノード配置の数式定義](#4-ノード配置の数式定義)
5. [エッジ配置の数式定義](#5-エッジ配置の数式定義)
6. [レイアウトアルゴリズム選択](#6-レイアウトアルゴリズム選択)
7. [完全な場合分け](#7-完全な場合分け)

---

## 1. 全イベントタイプの完全リスト

### 1.1 基本イベントカテゴリ（10種類）

| # | イベント名 | WebSocket名 | 発火タイミング | 優先度 |
|---|-----------|-------------|---------------|-------|
| 1 | GraphUpdate | `graph:update` | グラフ全体更新時 | HIGH |
| 2 | AgentStarted | `agent:started` | Agent実行開始時 | HIGH |
| 3 | AgentProgress | `agent:progress` | Agent進捗更新時 | MEDIUM |
| 4 | AgentCompleted | `agent:completed` | Agent完了時 | HIGH |
| 5 | AgentError | `agent:error` | Agent失敗時 | CRITICAL |
| 6 | StateTransition | `state:transition` | Issue状態変化時 | HIGH |
| 7 | TaskDiscovered | `task:discovered` | タスク発見時 | HIGH |
| 8 | CoordinatorAnalyzing | `coordinator:analyzing` | 分析フェーズ | MEDIUM |
| 9 | CoordinatorDecomposing | `coordinator:decomposing` | 分解フェーズ | MEDIUM |
| 10 | CoordinatorAssigning | `coordinator:assigning` | 割り当てフェーズ | MEDIUM |

### 1.2 エージェントタイプ（7種類）

```typescript
type AgentType =
  | 'coordinator'    // タスク統括・DAG分解
  | 'codegen'        // コード生成
  | 'review'         // コード品質レビュー
  | 'issue'          // Issue分析・ラベリング
  | 'pr'             // PR作成・管理
  | 'deployment'     // デプロイ自動化
  | 'test';          // テスト自動実行
```

### 1.3 状態タイプ（8種類）

```typescript
type StateType =
  | 'pending'        // 📥 新規作成、トリアージ待ち
  | 'analyzing'      // 🔍 Coordinator分析中
  | 'implementing'   // 🏗️ Specialist実装中
  | 'reviewing'      // 👀 ReviewAgent確認中
  | 'done'           // ✅ 完了
  | 'blocked'        // 🔴 ブロック中
  | 'failed'         // 🛑 失敗
  | 'paused';        // ⏸️ 一時停止
```

---

## 2. イベント発火条件と状態遷移

### 2.1 状態遷移マトリクス

```
[State Machine Diagram]

           TaskDiscovered
                 ↓
         +---------------+
         |   pending     | ← 初期状態
         +---------------+
                 ↓
        CoordinatorAnalyzing
                 ↓
         +---------------+
         |   analyzing   |
         +---------------+
                 ↓
        CoordinatorDecomposing
                 ↓
         +---------------+
         | decomposing   | (内部状態)
         +---------------+
                 ↓
        CoordinatorAssigning
                 ↓
         +---------------+
         | implementing  |
         +---------------+
                 ↓
          AgentStarted (codegen/pr/etc)
                 ↓
         +---------------+
         |   reviewing   |
         +---------------+
                 ↓
          AgentCompleted
                 ↓
         +---------------+
         |     done      | ← 最終状態（成功）
         +---------------+

エラー時:
  Any State → AgentError → failed
  Any State → (manual) → paused
  Any State → (dependency) → blocked
```

### 2.2 イベント発火条件表

| イベント | 前提条件 | トリガー | 結果状態 |
|---------|----------|---------|---------|
| `task:discovered` | なし | GitHubから新Issueを検出 | `pending` |
| `coordinator:analyzing` | `pending` | CoordinatorがIssueを選択 | `analyzing` |
| `coordinator:decomposing` | `analyzing` | 分析完了後 | (内部) |
| `coordinator:assigning` | 分解完了 | Agent選択完了 | `implementing` |
| `agent:started` | `implementing` | Specialist起動 | `implementing` |
| `agent:progress` | Agent実行中 | 進捗更新 | (変化なし) |
| `agent:completed` | Agent実行中 | 正常終了 | `reviewing` → `done` |
| `agent:error` | Agent実行中 | エラー発生 | `failed` |
| `state:transition` | 任意 | Label変更時 | 新状態 |

### 2.3 並行実行パターン

```
Issue #100: pending
  ↓
  CoordinatorAgent analyzes (#100)
  ↓
  Decompose into 3 subtasks:
    - Subtask A (codegen)
    - Subtask B (test)
    - Subtask C (review)
  ↓
  [並行実行]
  ├─ CodeGenAgent starts (Subtask A)
  ├─ TestAgent starts (Subtask B)
  └─ ReviewAgent waits (depends on A, B)
  ↓
  All complete → Done
```

---

## 3. Webhook API仕様

### 3.1 エンドポイント

```
POST http://localhost:3001/api/agent-event
Content-Type: application/json
```

### 3.2 全イベント型定義

#### 3.2.1 `graph:update`

**Request:**
```typescript
{
  eventType: 'graph:update',
  timestamp: '2025-10-12T12:34:56.789Z',
  nodes: GraphNode[],  // 全ノード配列
  edges: GraphEdge[]   // 全エッジ配列
}
```

**Response:**
```typescript
{
  success: true,
  message: 'Graph updated',
  timestamp: '2025-10-12T12:34:56.789Z'
}
```

**発火時のUI動作:**
- 全ノード・エッジを再描画
- レイアウトアルゴリズムを再実行
- アニメーションなし（即座に更新）

---

#### 3.2.2 `agent:started`

**Request:**
```typescript
{
  eventType: 'started',  // 'agent:started'のalias
  timestamp: '2025-10-12T12:34:56.789Z',
  agentId: 'codegen' | 'review' | 'pr' | 'deployment' | 'coordinator',
  issueNumber: 100,
  parameters: {
    taskTitle: string,
    taskDescription?: string,
    priority: 'P0-Critical' | 'P1-High' | 'P2-Medium' | 'P3-Low',
    context?: string,
    estimatedDuration?: string,
    config?: Record<string, any>
  }
}
```

**Response:**
```typescript
{
  success: true,
  message: 'Agent started',
  agentId: 'codegen',
  issueNumber: 100
}
```

**発火時のUI動作:**
1. **Agent Nodeの更新:**
   - `status: 'idle' → 'running'`
   - `currentIssue: 100`
   - `progress: 0`
   - `parameters` を保存

2. **Thinking Bubbleの表示:**
   - Agent上部に吹き出し表示
   - 初期メッセージ: "コード構造を分析中..."

3. **Particle Flow起動:**
   - Issue → Agent へのエッジに粒子アニメーション開始
   - 5秒間継続

4. **Explanation Panel更新:**
   - タイトル: "💻 {AgentName}が実行開始"
   - 詳細: タスク情報、パラメータ

5. **Auto Focus:**
   - カメラが該当Agentにズーム (zoom: 1.2, duration: 800ms)

6. **System Metrics更新:**
   - "Running Agents" +1

---

#### 3.2.3 `agent:progress`

**Request:**
```typescript
{
  eventType: 'progress',  // 'agent:progress'のalias
  timestamp: '2025-10-12T12:34:56.789Z',
  agentId: 'codegen',
  issueNumber: 100,
  progress: 0-100,  // パーセント
  message?: string  // オプショナル詳細メッセージ
}
```

**Response:**
```typescript
{
  success: true,
  message: 'Progress updated',
  agentId: 'codegen',
  progress: 45
}
```

**発火時のUI動作:**
1. **Progress Bar更新:**
   - Agentノード内の進捗バーを `progress` 値に更新
   - スムーズなアニメーション (300ms transition)

2. **Thinking Bubble更新（動的）:**
   - CodeGen:
     - 0-30%: "コードベースを分析中..."
     - 30-60%: "コードを生成中..."
     - 60-100%: "テストを実行中..."
   - Review:
     - 0-40%: "コード品質を分析中..."
     - 40-70%: "セキュリティスキャン実行中..."
     - 70-100%: "レビューコメント作成中..."
   - PR:
     - 0-50%: "コミットメッセージ作成中..."
     - 50-100%: "Pull Request作成中..."
   - Deployment:
     - 0-30%: "ビルドを実行中..."
     - 30-70%: "テストを実行中..."
     - 70-100%: "デプロイ中..."

3. **System Metrics更新なし** (状態変化なし)

---

#### 3.2.4 `agent:completed`

**Request:**
```typescript
{
  eventType: 'completed',  // 'agent:completed'のalias
  timestamp: '2025-10-12T12:34:56.789Z',
  agentId: 'codegen',
  issueNumber: 100,
  duration?: string,  // e.g., "2m 34s"
  result: {
    success: true,
    labelsAdded?: string[],
    prCreated?: boolean,
    prNumber?: number,
    summary?: string
  }
}
```

**Response:**
```typescript
{
  success: true,
  message: 'Agent completed',
  agentId: 'codegen',
  issueNumber: 100
}
```

**発火時のUI動作:**
1. **Celebration Effect発火🎉:**
   - 50個のカラフル紙吹雪が画面全体に降る
   - 中央に成功カード表示 ("タスク完了！")
   - 3秒後に自動消滅

2. **Agent Node更新:**
   - `status: 'running' → 'completed'`
   - `progress: 100`
   - `currentIssue: undefined`
   - 3秒後に `status: 'completed' → 'idle'`

3. **Thinking Bubble消去:**
   - 2秒後にフェードアウト

4. **Workflow Stage更新:**
   - 全ステージに緑チェックマーク
   - `currentStage: null`
   - `completedStages: ['discovery', 'analysis', 'decomposition', 'assignment', 'execution']`

5. **Explanation Panel更新:**
   - タイトル: "✅ タスク完了！"
   - 詳細: 処理時間、結果、次のステップ

6. **System Metrics更新:**
   - "Running Agents" -1
   - "Completed" +1
   - "Success Rate" 再計算

---

#### 3.2.5 `agent:error`

**Request:**
```typescript
{
  eventType: 'error',  // 'agent:error'のalias
  timestamp: '2025-10-12T12:34:56.789Z',
  agentId: 'codegen',
  issueNumber: 100,
  error: string,        // エラーメッセージ
  stackTrace?: string,  // オプショナル
  code?: string         // エラーコード
}
```

**Response:**
```typescript
{
  success: true,
  message: 'Error logged',
  agentId: 'codegen',
  issueNumber: 100
}
```

**発火時のUI動作:**
1. **Agent Node更新:**
   - `status: 'running' → 'error'`
   - `currentIssue: undefined`
   - 赤色のエラーインジケーター表示

2. **Error Notification表示:**
   - 画面右上に赤い通知バー
   - アイコン: ❌
   - メッセージ: "{AgentName} failed on Issue #{issueNumber}: {error}"
   - 10秒後または手動クローズで消滅

3. **Thinking Bubble更新:**
   - "❌ エラーが発生しました"
   - 5秒後に消滅

4. **Explanation Panel更新:**
   - タイトル: "❌ 実行失敗"
   - 詳細: エラーメッセージ、対処方法

5. **State Transition:**
   - Issue #100の状態を `failed` に変更
   - 該当Issueノードに赤い枠線

6. **System Metrics更新:**
   - "Running Agents" -1
   - "Success Rate" 再計算（失敗としてカウント）

---

#### 3.2.6 `state:transition`

**Request:**
```typescript
{
  eventType: 'transition',  // 'state:transition'のalias
  timestamp: '2025-10-12T12:34:56.789Z',
  issueNumber: 100,
  from: 'pending',
  to: 'analyzing',
  agent?: 'coordinator',  // オプショナル
  reason?: string
}
```

**Response:**
```typescript
{
  success: true,
  message: 'State transition logged',
  issueNumber: 100,
  from: 'pending',
  to: 'analyzing'
}
```

**発火時のUI動作:**
1. **Issue Node更新:**
   - Labelを `from` → `to` に変更
   - 色も状態に応じて変化

2. **Edge Animation:**
   - Issue → State へのエッジを2秒間アニメーション (`animated: true`)

3. **Activity Log追加:**
   - "🔄 Issue #100: {from} → {to}"

4. **Explanation Panel更新:**
   - タイトル: "🔄 状態変化"
   - 詳細: "{from} から {to} へ遷移しました"

---

#### 3.2.7 `task:discovered`

**Request:**
```typescript
{
  eventType: 'task:discovered',
  timestamp: '2025-10-12T12:34:56.789Z',
  tasks: [
    {
      issueNumber: 100,
      title: string,
      priority: 'P0-Critical' | 'P1-High' | 'P2-Medium' | 'P3-Low',
      labels: string[]
    },
    // ... more tasks
  ]
}
```

**Response:**
```typescript
{
  success: true,
  message: 'Tasks discovered',
  count: 3
}
```

**発火時のUI動作:**
1. **Workflow Stage更新:**
   - `currentStage: 'discovery'`
   - `completedStages: []`

2. **Activity Log追加:**
   - "{tasks.length} tasks discovered and queued for processing"
   - 各タスクを200msずつ遅延して個別追加

3. **Explanation Panel更新:**
   - タイトル: "📥 タスク発見フェーズ"
   - 詳細:
     - "GitHubから{tasks.length}個のIssueを読み込みました"
     - 各タスクのリスト表示

4. **Graph Update (if needed):**
   - 新規Issueノードを追加
   - レイアウト再計算

---

#### 3.2.8 `coordinator:analyzing`

**Request:**
```typescript
{
  eventType: 'coordinator:analyzing',
  timestamp: '2025-10-12T12:34:56.789Z',
  issueNumber: 100,
  title: string,
  analysis: {
    type: 'Bug Fix' | 'Feature' | 'Enhancement' | 'Refactoring' | 'Documentation',
    priority: 'P0-Critical' | 'P1-High' | 'P2-Medium' | 'P3-Low',
    complexity: 'Low' | 'Medium' | 'High' | 'Very High',
    estimatedTime: string  // e.g., "2-4 hours"
  }
}
```

**Response:**
```typescript
{
  success: true,
  message: 'Analysis logged',
  issueNumber: 100
}
```

**発火時のUI動作:**
1. **Workflow Stage更新:**
   - `currentStage: 'analysis'`
   - `completedStages: ['discovery']`

2. **Issue Node Highlight:**
   - 緑色の枠線 (3px solid #10B981)
   - ボックスシャドウ (0 0 20px rgba(16, 185, 129, 0.5))
   - 2秒後に解除

3. **Auto Focus:**
   - Coordinator Agentにズーム

4. **Explanation Panel更新:**
   - タイトル: "🔍 Issue分析中"
   - 詳細:
     - "CoordinatorAgentがIssue #{issueNumber}の内容を詳しく分析しています。"
     - "タイプ: {analysis.type} - このタスクの種類を判定"
     - "優先度: {analysis.priority} - 緊急度を評価"
     - "複雑度: {analysis.complexity} - 難易度を算出"
     - ""
     - "次のステップ：この分析結果に基づいて、タスクをサブタスクに分解します。"

---

#### 3.2.9 `coordinator:decomposing`

**Request:**
```typescript
{
  eventType: 'coordinator:decomposing',
  timestamp: '2025-10-12T12:34:56.789Z',
  issueNumber: 100,
  subtasks: [
    {
      id: 'subtask-1',
      title: 'Investigate root cause',
      type: 'investigation',
      dependencies: []  // subtask IDの配列
    },
    {
      id: 'subtask-2',
      title: 'Implement fix',
      type: 'code-fix',
      dependencies: ['subtask-1']
    },
    {
      id: 'subtask-3',
      title: 'Add tests',
      type: 'testing',
      dependencies: ['subtask-2']
    }
  ]
}
```

**Response:**
```typescript
{
  success: true,
  message: 'Decomposition logged',
  issueNumber: 100,
  subtaskCount: 3
}
```

**発火時のUI動作:**
1. **Workflow Stage更新:**
   - `currentStage: 'decomposition'`
   - `completedStages: ['discovery', 'analysis']`

2. **Activity Log追加:**
   - "🧩 CoordinatorAgent decomposed Issue #{issueNumber} into {subtasks.length} subtasks"
   - 各サブタスクを150msずつ遅延して個別追加
     - "  ├─ Subtask 1: {title} [{type}]"

3. **Explanation Panel更新:**
   - タイトル: "🧩 タスク分解中"
   - 詳細:
     - "CoordinatorAgentがIssue #{issueNumber}を{subtasks.length}個のサブタスクに分解しました。"
     - "大きなタスクを小さく分けることで、各Specialist Agentが効率的に処理できます。"
     - サブタスクリスト表示

---

#### 3.2.10 `coordinator:assigning`

**Request:**
```typescript
{
  eventType: 'coordinator:assigning',
  timestamp: '2025-10-12T12:34:56.789Z',
  issueNumber: 100,
  assignments: [
    {
      agentId: 'codegen',
      taskId: 'subtask-2',
      reason: 'Best for code implementation tasks'
    },
    {
      agentId: 'review',
      taskId: 'subtask-3',
      reason: 'Quality assurance specialist'
    }
  ]
}
```

**Response:**
```typescript
{
  success: true,
  message: 'Assignments logged',
  issueNumber: 100,
  assignmentCount: 2
}
```

**発火時のUI動作:**
1. **Workflow Stage更新:**
   - `currentStage: 'assignment'`
   - `completedStages: ['discovery', 'analysis', 'decomposition']`

2. **Auto Focus (Sequential):**
   - 各割り当てられたAgentに順番にズーム
   - 500ms間隔

3. **Activity Log追加:**
   - "🎯 CoordinatorAgent assigning tasks for Issue #{issueNumber}"
   - 各割り当てを500msずつ遅延して追加
     - "  🤖 {agentId}: {reason}"

4. **Explanation Panel更新:**
   - タイトル: "🎯 Agent割り当て中"
   - 詳細:
     - "CoordinatorAgentが各サブタスクに最適なSpecialist Agentを選択しています。"
     - "各Agentの専門性を考慮して、最も効率的な組み合わせを決定します。"
     - 割り当てリスト表示
       - "{agentId} ← 理由: {reason}"

---

## 4. ノード配置の数式定義

### 4.1 現在の配置ロジック（Linear Layout）

**Issue Nodes:**
```
x(issue, i) = 100
y(issue, i) = i × 600 + 100

where:
  i = issueのインデックス (0-based)
```

**Agent Nodes:**
```
x(agent, i) = 650
y(agent, i) = i × 600 + 100

where:
  i = agentのインデックス (0-based)
```

**State Nodes:**
```
x(state, i) = 1250
y(state, i) = i × 600 + 100

where:
  i = stateのインデックス (0-based)
```

**問題点:**
- ノード数が増えると縦に長くなりすぎる
- 重なりが発生しやすい
- 視認性が悪い

### 4.2 改善案: Hierarchical Layout（階層的配置）

**レイヤー定義:**
```
Layer 0: Issue Nodes        (x = 100)
Layer 1: Coordinator Agent  (x = 400)
Layer 2: Specialist Agents  (x = 700-1000, grid配置)
Layer 3: State Nodes        (x = 1300)
```

**Issue Nodes (Layer 0):**
```
x(issue, i) = LAYER_0_X = 100
y(issue, i) = i × NODE_VERTICAL_SPACING + TOP_MARGIN

where:
  NODE_VERTICAL_SPACING = 250  // 600 → 250に削減
  TOP_MARGIN = 100
```

**Coordinator Agent (Layer 1):**
```
x(coordinator) = LAYER_1_X = 400
y(coordinator) = (totalIssues / 2) × NODE_VERTICAL_SPACING + TOP_MARGIN

// 中央配置
```

**Specialist Agents (Layer 2 - Grid Layout):**
```
agents = ['codegen', 'review', 'pr', 'deployment', 'test']  // 5個
COLS = 2  // 2列グリッド
ROW_HEIGHT = 300
COL_WIDTH = 350

x(agent, i) = LAYER_2_X + (i % COLS) × COL_WIDTH
y(agent, i) = LAYER_2_Y + floor(i / COLS) × ROW_HEIGHT

where:
  LAYER_2_X = 700
  LAYER_2_Y = 100
  i = agentのインデックス

例:
  codegen   (i=0): x=700,  y=100
  review    (i=1): x=1050, y=100
  pr        (i=2): x=700,  y=400
  deployment(i=3): x=1050, y=400
  test      (i=4): x=700,  y=700
```

**State Nodes (Layer 3 - Vertical Flow):**
```
states = ['pending', 'analyzing', 'implementing', 'reviewing', 'done']
LAYER_3_X = 1400

x(state, i) = LAYER_3_X
y(state, i) = i × STATE_VERTICAL_SPACING + TOP_MARGIN

where:
  STATE_VERTICAL_SPACING = 200
```

### 4.3 衝突回避アルゴリズム

**Overlap Detection:**
```typescript
function detectOverlap(node1: Node, node2: Node): boolean {
  const NODE_WIDTH = 150;
  const NODE_HEIGHT = 100;
  const MARGIN = 50;  // 最小間隔

  const dx = Math.abs(node1.position.x - node2.position.x);
  const dy = Math.abs(node1.position.y - node2.position.y);

  return (
    dx < NODE_WIDTH + MARGIN &&
    dy < NODE_HEIGHT + MARGIN
  );
}
```

**Collision Resolution:**
```typescript
function resolveCollision(node1: Node, node2: Node): void {
  // Y軸方向にずらす（優先）
  const offset = 150;
  node2.position.y += offset;

  // 再度衝突チェック
  if (detectOverlap(node1, node2)) {
    // X軸方向にもずらす
    node2.position.x += 200;
  }
}
```

---

## 5. エッジ配置の数式定義

### 5.1 エッジタイプ別スタイル

**Issue → Agent:**
```typescript
{
  type: 'issue-to-agent',
  animated: true,
  style: {
    stroke: '#8B5CF6',      // Purple
    strokeWidth: 2,
    strokeDasharray: '5,5'
  }
}
```

**Agent → State:**
```typescript
{
  type: 'agent-to-state',
  animated: false,
  style: {
    stroke: '#10B981',      // Green
    strokeWidth: 2
  }
}
```

**State Flow:**
```typescript
{
  type: 'state-flow',
  animated: false,
  label: '→',
  style: {
    stroke: '#6B7280',      // Gray
    strokeWidth: 1,
    strokeDasharray: '2,2'
  }
}
```

**Dependency:**
```typescript
// Depends On
{
  type: 'depends-on',
  label: 'depends on',
  style: {
    stroke: '#FB923C',      // Orange
    strokeWidth: 2,
    strokeDasharray: '5,5'
  }
}

// Blocks
{
  type: 'blocks',
  label: 'blocks',
  style: {
    stroke: '#EF4444',      // Red
    strokeWidth: 2,
    strokeDasharray: '10,5'
  }
}

// Related To
{
  type: 'related-to',
  label: 'related',
  style: {
    stroke: '#94A3B8',      // Light Gray
    strokeWidth: 1,
    strokeDasharray: '2,2'
  }
}
```

### 5.2 エッジ接続ポイント計算

**Control Point (Bezier Curve):**
```typescript
function calculateControlPoint(
  source: Position,
  target: Position
): Position {
  const dx = target.x - source.x;
  const dy = target.y - source.y;

  return {
    x: source.x + dx / 2,
    y: source.y + dy / 2
  };
}
```

**Edge Path (SVG Path):**
```typescript
function generateEdgePath(
  source: Position,
  target: Position,
  type: EdgeType
): string {
  if (type === 'state-flow') {
    // 直線
    return `M ${source.x} ${source.y} L ${target.x} ${target.y}`;
  } else {
    // ベジェ曲線
    const cp = calculateControlPoint(source, target);
    return `M ${source.x} ${source.y} Q ${cp.x} ${cp.y} ${target.x} ${target.y}`;
  }
}
```

---

## 6. レイアウトアルゴリズム選択

### 6.1 候補アルゴリズム

| アルゴリズム | 適用シーン | メリット | デメリット |
|------------|----------|---------|----------|
| **Hierarchical (推奨)** | 階層構造が明確 | 視認性高い | 柔軟性低い |
| Dagre | DAG構造 | 自動レイアウト | 制御しにくい |
| Force-Directed | 複雑なネットワーク | 美しい | 不安定 |
| Grid | 規則的配置 | 整然 | 単調 |
| Manual | 特殊ケース | 完全制御 | 保守困難 |

### 6.2 採用: Hierarchical Layout + Grid Hybrid

**理由:**
1. ワークフローの流れが明確（Issue → Coordinator → Specialists → State）
2. Specialist AgentsはGrid配置で整然
3. 再現性が高い（数式で完全定義可能）
4. パフォーマンスが良い（計算コスト低）

**実装方針:**
```typescript
function calculateLayout(
  issues: Issue[],
  agents: Agent[],
  states: State[]
): Layout {
  // Layer 0: Issues (vertical)
  const issueNodes = issues.map((issue, i) => ({
    id: `issue-${issue.number}`,
    position: {
      x: 100,
      y: i * 250 + 100
    }
  }));

  // Layer 1: Coordinator (center)
  const coordinatorNode = {
    id: 'agent-coordinator',
    position: {
      x: 400,
      y: (issues.length / 2) * 250 + 100
    }
  };

  // Layer 2: Specialists (grid)
  const specialistNodes = agents
    .filter(a => a.id !== 'coordinator')
    .map((agent, i) => ({
      id: `agent-${agent.id}`,
      position: {
        x: 700 + (i % 2) * 350,
        y: 100 + Math.floor(i / 2) * 300
      }
    }));

  // Layer 3: States (vertical flow)
  const stateNodes = states.map((state, i) => ({
    id: `state-${state.name}`,
    position: {
      x: 1400,
      y: i * 200 + 100
    }
  }));

  return {
    nodes: [
      ...issueNodes,
      coordinatorNode,
      ...specialistNodes,
      ...stateNodes
    ]
  };
}
```

---

## 7. 完全な場合分け

### 7.1 イベント処理フローチャート

```
[Webhook Request Received]
         ↓
    Parse eventType
         ↓
    ┌────┴────┐
    │ Switch  │
    └────┬────┘
         ↓
    ┌─────────────────────────────────────┐
    │ Case: 'graph:update'                │
    │  1. Replace all nodes/edges         │
    │  2. Recalculate layout              │
    │  3. Update ReactFlow                │
    └─────────────────────────────────────┘
         ↓
    ┌─────────────────────────────────────┐
    │ Case: 'started' (agent:started)     │
    │  1. Find agent node by agentId      │
    │  2. Update status → 'running'       │
    │  3. Set currentIssue, progress=0    │
    │  4. Store parameters                │
    │  5. Show thinking bubble            │
    │  6. Activate particle flow          │
    │  7. Update explanation panel        │
    │  8. Auto focus camera               │
    │  9. Increment metrics (running+1)   │
    └─────────────────────────────────────┘
         ↓
    ┌─────────────────────────────────────┐
    │ Case: 'progress' (agent:progress)   │
    │  1. Find agent node by agentId      │
    │  2. Update progress value           │
    │  3. Update thinking message         │
    │     - Switch by progress ranges     │
    │  4. No metrics update               │
    └─────────────────────────────────────┘
         ↓
    ┌─────────────────────────────────────┐
    │ Case: 'completed' (agent:completed) │
    │  1. Trigger celebration effect 🎉  │
    │  2. Update status → 'completed'     │
    │  3. Set progress = 100              │
    │  4. Clear currentIssue              │
    │  5. Clear thinking bubble (2s)      │
    │  6. Mark all stages complete        │
    │  7. Update explanation panel        │
    │  8. Update metrics                  │
    │     - running -1                    │
    │     - completed +1                  │
    │     - Recalc success rate           │
    │  9. Reset to 'idle' after 3s        │
    └─────────────────────────────────────┘
         ↓
    ┌─────────────────────────────────────┐
    │ Case: 'error' (agent:error)         │
    │  1. Update status → 'error'         │
    │  2. Clear currentIssue              │
    │  3. Show error notification         │
    │  4. Update thinking bubble (error)  │
    │  5. Update explanation panel        │
    │  6. Highlight issue node (red)      │
    │  7. Update metrics (failed +1)      │
    └─────────────────────────────────────┘
         ↓
    ┌─────────────────────────────────────┐
    │ Case: 'transition' (state)          │
    │  1. Find issue node by issueNumber  │
    │  2. Update state label (from→to)    │
    │  3. Animate edge (2s)               │
    │  4. Add activity log                │
    │  5. Update explanation panel        │
    └─────────────────────────────────────┘
         ↓
    ┌─────────────────────────────────────┐
    │ Case: 'task:discovered'             │
    │  1. Update workflow stage           │
    │     - currentStage = 'discovery'    │
    │     - completedStages = []          │
    │  2. Add activity log (batch)        │
    │     - Staggered 200ms per task      │
    │  3. Update explanation panel        │
    │     - Show task list                │
    │  4. Add new issue nodes (if needed) │
    │  5. Recalculate layout              │
    └─────────────────────────────────────┘
         ↓
    ┌─────────────────────────────────────┐
    │ Case: 'coordinator:analyzing'       │
    │  1. Update stage → 'analysis'       │
    │  2. Mark 'discovery' complete       │
    │  3. Highlight issue node (green)    │
    │  4. Auto focus coordinator          │
    │  5. Update explanation panel        │
    │     - Show analysis details         │
    │  6. Remove highlight after 2s       │
    └─────────────────────────────────────┘
         ↓
    ┌─────────────────────────────────────┐
    │ Case: 'coordinator:decomposing'     │
    │  1. Update stage → 'decomposition'  │
    │  2. Mark 'analysis' complete        │
    │  3. Add activity log (subtasks)     │
    │     - Staggered 150ms per subtask   │
    │  4. Update explanation panel        │
    │     - Show subtask list             │
    └─────────────────────────────────────┘
         ↓
    ┌─────────────────────────────────────┐
    │ Case: 'coordinator:assigning'       │
    │  1. Update stage → 'assignment'     │
    │  2. Mark 'decomposition' complete   │
    │  3. Sequential auto focus           │
    │     - Each agent, 500ms interval    │
    │  4. Add activity log (assignments)  │
    │     - Staggered 500ms per agent     │
    │  5. Update explanation panel        │
    │     - Show assignment list          │
    └─────────────────────────────────────┘
         ↓
    [WebSocket Event Emitted to Client]
         ↓
    [UI Updates Complete]
```

### 7.2 エラーハンドリング

```typescript
// 全イベント共通のエラーハンドリング
try {
  // Event処理
} catch (error) {
  console.error('Event processing failed:', error);

  // Fallback動作
  showErrorToast({
    title: 'イベント処理エラー',
    message: error.message,
    type: 'error',
    duration: 5000
  });

  // ログ送信（本番環境）
  if (process.env.NODE_ENV === 'production') {
    sendErrorLog({
      event: eventType,
      error: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    });
  }
}
```

---

## 📝 第1回レビューチェックリスト

- [ ] 全10イベントタイプが網羅されているか
- [ ] 全7エージェントタイプが定義されているか
- [ ] 全8状態タイプが定義されているか
- [ ] Webhook API仕様が完全か（リクエスト/レスポンス）
- [ ] 各イベントのUI動作が具体的に記述されているか
- [ ] ノード配置の数式が明確か
- [ ] エッジ配置のロジックが明確か
- [ ] レイアウトアルゴリズムの選定理由が明確か
- [ ] 場合分けが網羅的か
- [ ] エラーハンドリングが考慮されているか

---

**次のステップ:**
1. この仕様書を徹底的にレビュー
2. 不足している要素を追記
3. 第2回レビューで最終確認
4. 実装開始

---

**End of Draft v1.0.0**
