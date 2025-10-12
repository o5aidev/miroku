# 📘 Dashboard仕様書 - 補足（Addendum）

**作成日:** 2025-10-12
**バージョン:** v1.1.0
**目的:** 第1回レビューで発見された問題1-3の修正

---

## 📡 追加: サーバーサイドAPI完全定義（問題1の解決）

### 既存エンドポイント

#### 1. `POST /api/agent-event`

**目的:** 外部からイベントを送信してWebSocketブロードキャスト

**Request:**
```typescript
POST http://localhost:3001/api/agent-event
Content-Type: application/json

{
  eventType: string,  // 'started', 'progress', 'completed', etc.
  timestamp: string,  // ISO 8601
  agentId?: string,
  issueNumber?: number,
  // ... other event-specific fields
}
```

**Response:**
```typescript
{
  success: true | false,
  message: string,
  timestamp: string,
  event: {
    // Echo back the processed event
  }
}
```

**エラーレスポンス:**
```typescript
// 400 Bad Request
{
  success: false,
  error: 'Validation failed',
  details: {
    field: 'agentId',
    message: 'Invalid agent ID'
  }
}

// 500 Internal Server Error
{
  success: false,
  error: 'Internal server error',
  message: string
}
```

---

#### 2. `GET /api/graph`

**目的:** 現在のグラフデータ取得

**Request:**
```
GET http://localhost:3001/api/graph
```

**Response:**
```typescript
{
  nodes: GraphNode[],
  edges: GraphEdge[],
  timestamp: string,
  metadata: {
    totalIssues: number,
    totalAgents: number,
    totalStates: number
  }
}
```

---

#### 3. `POST /api/refresh`

**目的:** キャッシュクリア + グラフ再構築

**Request:**
```
POST http://localhost:3001/api/refresh
Content-Type: application/json

{}  // Empty body
```

**Response:**
```typescript
{
  success: true,
  message: 'Graph refreshed',
  timestamp: string,
  stats: {
    cacheCleared: true,
    nodesRebuilt: number,
    edgesRebuilt: number
  }
}
```

---

### 新規エンドポイント（追加）

#### 4. `POST /api/workflow/trigger`

**目的:** 手動でワークフロー開始

**Request:**
```typescript
POST http://localhost:3001/api/workflow/trigger
Content-Type: application/json

{
  issueNumber: number,    // 必須
  forceRestart?: boolean  // オプション（default: false）
}
```

**Response:**
```typescript
{
  success: true,
  message: 'Workflow triggered',
  issueNumber: number,
  workflowId: string,  // UUID
  estimatedDuration: string,  // e.g., "5-10 minutes"
  steps: [
    'task:discovered',
    'coordinator:analyzing',
    'coordinator:decomposing',
    'coordinator:assigning',
    'agent:started'
  ]
}
```

**エラーレスポンス:**
```typescript
// 404 Not Found
{
  success: false,
  error: 'Issue not found',
  issueNumber: number
}

// 409 Conflict
{
  success: false,
  error: 'Workflow already running',
  issueNumber: number,
  currentWorkflowId: string
}
```

---

#### 5. `GET /api/agents/status`

**目的:** 全エージェントの現在状態取得

**Request:**
```
GET http://localhost:3001/api/agents/status
```

**Response:**
```typescript
{
  agents: [
    {
      agentId: 'coordinator',
      name: 'CoordinatorAgent',
      status: 'idle' | 'running' | 'error' | 'completed',
      currentIssue: number | null,
      progress: number,  // 0-100
      lastActivity: string,  // ISO 8601
      uptime: number,  // seconds
      tasksCompleted: number,
      tasksF


: number
    },
    // ... all 7 agents
  ],
  timestamp: string,
  summary: {
    totalAgents: 7,
    running: number,
    idle: number,
    error: number
  }
}
```

---

#### 6. `POST /api/layout/recalculate`

**目的:** レイアウト再計算トリガー

**Request:**
```typescript
POST http://localhost:3001/api/layout/recalculate
Content-Type: application/json

{
  algorithm?: 'hierarchical' | 'dagre' | 'force-directed',  // default: hierarchical
  options?: {
    nodeSpacing?: number,      // default: 250
    layerSpacing?: number,     // default: 300
    avoidCollisions?: boolean  // default: true
  }
}
```

**Response:**
```typescript
{
  success: true,
  message: 'Layout recalculated',
  algorithm: 'hierarchical',
  nodesUpdated: number,
  executionTime: number,  // milliseconds
  layout: {
    nodes: [
      {
        id: string,
        position: { x: number, y: number }
      },
      // ...
    ]
  }
}
```

---

#### 7. `GET /api/events/history`

**目的:** 過去のイベント履歴取得

**Request:**
```
GET http://localhost:3001/api/events/history?limit=100&offset=0&type=agent:started
```

**Query Parameters:**
- `limit`: 取得件数（default: 50, max: 500）
- `offset`: オフセット（default: 0）
- `type`: イベントタイプでフィルター（オプション）
- `agentId`: エージェントIDでフィルター（オプション）
- `issueNumber`: Issue番号でフィルター（オプション）
- `startDate`: 開始日時（ISO 8601）
- `endDate`: 終了日時（ISO 8601）

**Response:**
```typescript
{
  events: [
    {
      id: string,  // UUID
      eventType: string,
      timestamp: string,
      agentId?: string,
      issueNumber?: number,
      data: object  // イベント固有データ
    },
    // ...
  ],
  pagination: {
    total: number,
    limit: number,
    offset: number,
    hasMore: boolean
  }
}
```

---

## 🛡️ 追加: バリデーションルール定義（問題2の解決）

### バリデーション関数群

```typescript
// packages/dashboard-server/src/validation/event-validators.ts

import { z } from 'zod';  // Zodバリデーションライブラリ使用

// Agent ID検証
const VALID_AGENT_IDS = [
  'coordinator', 'codegen', 'review',
  'issue', 'pr', 'deployment', 'test'
] as const;

export const AgentIdSchema = z.enum(VALID_AGENT_IDS);

export function validateAgentId(agentId: string): boolean {
  return VALID_AGENT_IDS.includes(agentId as any);
}

// Progress検証
export const ProgressSchema = z.number()
  .int()
  .min(0)
  .max(100);

export function validateProgress(progress: number): boolean {
  return (
    typeof progress === 'number' &&
    Number.isInteger(progress) &&
    progress >= 0 &&
    progress <= 100 &&
    !isNaN(progress)
  );
}

// Timestamp検証
export const TimestampSchema = z.string().datetime();

export function validateTimestamp(timestamp: string): boolean {
  try {
    const date = new Date(timestamp);
    return !isNaN(date.getTime()) && date.toISOString() === timestamp;
  } catch {
    return false;
  }
}

// Issue Number検証
export const IssueNumberSchema = z.number().int().positive();

export function validateIssueNumber(issueNumber: number): boolean {
  return (
    typeof issueNumber === 'number' &&
    Number.isInteger(issueNumber) &&
    issueNumber > 0
  );
}

// Event Type検証
const VALID_EVENT_TYPES = [
  'started', 'progress', 'completed', 'error',
  'transition', 'graph:update',
  'task:discovered', 'coordinator:analyzing',
  'coordinator:decomposing', 'coordinator:assigning'
] as const;

export const EventTypeSchema = z.enum(VALID_EVENT_TYPES);

export function validateEventType(eventType: string): boolean {
  return VALID_EVENT_TYPES.includes(eventType as any);
}
```

### イベント別スキーマ定義

```typescript
// Agent Started Event
export const AgentStartedEventSchema = z.object({
  eventType: z.literal('started'),
  timestamp: TimestampSchema,
  agentId: AgentIdSchema,
  issueNumber: IssueNumberSchema,
  parameters: z.object({
    taskTitle: z.string().min(1).max(500),
    taskDescription: z.string().max(5000).optional(),
    priority: z.enum(['P0-Critical', 'P1-High', 'P2-Medium', 'P3-Low']),
    context: z.string().max(1000).optional(),
    estimatedDuration: z.string().regex(/^\d+[mhd]$/).optional(),
    config: z.record(z.any()).optional()
  }).optional()
});

// Agent Progress Event
export const AgentProgressEventSchema = z.object({
  eventType: z.literal('progress'),
  timestamp: TimestampSchema,
  agentId: AgentIdSchema,
  issueNumber: IssueNumberSchema,
  progress: ProgressSchema,
  message: z.string().max(500).optional()
});

// Agent Completed Event
export const AgentCompletedEventSchema = z.object({
  eventType: z.literal('completed'),
  timestamp: TimestampSchema,
  agentId: AgentIdSchema,
  issueNumber: IssueNumberSchema,
  duration: z.string().regex(/^\d+[msh]\s\d+[msh]$/).optional(),
  result: z.object({
    success: z.boolean(),
    labelsAdded: z.array(z.string()).optional(),
    prCreated: z.boolean().optional(),
    prNumber: z.number().int().positive().optional(),
    summary: z.string().max(1000).optional()
  })
});

// Agent Error Event
export const AgentErrorEventSchema = z.object({
  eventType: z.literal('error'),
  timestamp: TimestampSchema,
  agentId: AgentIdSchema,
  issueNumber: IssueNumberSchema,
  error: z.string().min(1).max(1000),
  stackTrace: z.string().max(5000).optional(),
  code: z.string().regex(/^[A-Z_0-9]+$/).optional()
});

// Union type for all events
export const DashboardEventSchema = z.discriminatedUnion('eventType', [
  AgentStartedEventSchema,
  AgentProgressEventSchema,
  AgentCompletedEventSchema,
  AgentErrorEventSchema,
  // ... other event schemas
]);
```

### API Router での使用例

```typescript
// packages/dashboard-server/src/api/routes.ts

import { DashboardEventSchema } from '../validation/event-validators.js';

router.post('/agent-event', async (req, res) => {
  try {
    // Zodによるバリデーション
    const validatedEvent = DashboardEventSchema.parse(req.body);

    // WebSocketブロードキャスト
    io.emit(validatedEvent.eventType, validatedEvent);

    res.json({
      success: true,
      message: 'Event broadcasted',
      timestamp: new Date().toISOString(),
      event: validatedEvent
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      // バリデーションエラー
      res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: error.errors.map(e => ({
          field: e.path.join('.'),
          message: e.message
        }))
      });
    } else {
      // その他のエラー
      res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: error.message
      });
    }
  }
});
```

---

## ⏱️ 追加: レート制限・スロットリング仕様（問題3の解決）

### 1. Progress イベントのスロットリング

**目的:** 同一agentIdからの高頻度progressイベントを制限

**実装:**
```typescript
// packages/dashboard-server/src/middleware/throttle.ts

import { Request, Response, NextFunction } from 'express';

interface ThrottleState {
  lastEventTime: Map<string, number>;
}

const state: ThrottleState = {
  lastEventTime: new Map()
};

export const THROTTLE_CONFIG = {
  'progress': 1000,        // 1秒に1回まで (per agentId)
  'agent:progress': 1000,
  'graph:update': 2000,    // 2秒に1回まで (global)
  'agent:started': 500,    // 0.5秒に1回まで (per agentId)
  'agent:completed': 500
};

export function createThrottleMiddleware(eventType: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    const throttleMs = THROTTLE_CONFIG[eventType];
    if (!throttleMs) {
      // スロットリング不要
      return next();
    }

    const key = eventType === 'graph:update'
      ? 'global'
      : `${eventType}:${req.body.agentId || 'unknown'}`;

    const now = Date.now();
    const lastTime = state.lastEventTime.get(key) || 0;

    if (now - lastTime < throttleMs) {
      // Too frequent - reject
      return res.status(429).json({
        success: false,
        error: 'Rate limit exceeded',
        message: `Please wait ${throttleMs}ms between requests`,
        retryAfter: throttleMs - (now - lastTime)
      });
    }

    // Update last event time
    state.lastEventTime.set(key, now);
    next();
  };
}

// 使用例
router.post('/agent-event',
  createThrottleMiddleware('progress'),  // 動的に決定
  handleAgentEvent
);
```

### 2. Graph Update のデバウンス

**目的:** 複数の更新を一定時間まとめて処理

**実装:**
```typescript
// packages/dashboard-server/src/services/graph-debouncer.ts

import { debounce } from 'lodash';

const GRAPH_UPDATE_DEBOUNCE_MS = 500;

class GraphDebouncer {
  private pendingUpdates: Set<string> = new Set();
  private debouncedEmit: () => void;

  constructor(private io: any) {
    this.debouncedEmit = debounce(() => {
      this.flushUpdates();
    }, GRAPH_UPDATE_DEBOUNCE_MS);
  }

  addUpdate(nodeId: string): void {
    this.pendingUpdates.add(nodeId);
    this.debouncedEmit();
  }

  private async flushUpdates(): Promise<void> {
    if (this.pendingUpdates.size === 0) return;

    console.log(`📊 Flushing ${this.pendingUpdates.size} graph updates`);

    // Fetch latest graph data
    const graphData = await this.buildGraph();

    // Emit to all clients
    this.io.emit('graph:update', {
      ...graphData,
      timestamp: new Date().toISOString()
    });

    // Clear pending
    this.pendingUpdates.clear();
  }

  private async buildGraph(): Promise<any> {
    // Build graph from GraphBuilder
    // ...
  }
}

export const graphDebouncer = new GraphDebouncer(io);
```

### 3. レート制限ヘッダー

**実装:**
```typescript
// レスポンスに制限情報を含める
res.setHeader('X-RateLimit-Limit', '60');        // 1分あたり60リクエスト
res.setHeader('X-RateLimit-Remaining', '45');
res.setHeader('X-RateLimit-Reset', '1634567890');  // Unix timestamp
```

### 4. IP別レート制限（グローバル）

**実装:**
```typescript
// packages/dashboard-server/src/middleware/rate-limiter.ts

import rateLimit from 'express-rate-limit';

export const globalRateLimiter = rateLimit({
  windowMs: 60 * 1000,  // 1分
  max: 100,             // 最大100リクエスト/分
  message: {
    success: false,
    error: 'Too many requests',
    message: 'Please try again later'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// app.ts で適用
app.use('/api', globalRateLimiter);
```

---

## 📊 追加: パフォーマンス指標

### 目標値

| 指標 | 目標 | 測定方法 |
|------|------|----------|
| API レスポンスタイム | < 100ms (p95) | `/api/graph` |
| WebSocket遅延 | < 50ms | Event送信→UI更新 |
| レイアウト計算時間 | < 200ms | 100ノード時 |
| メモリ使用量 | < 500MB | サーバープロセス |
| クライアントFPS | > 55 FPS | アニメーション中 |

### モニタリングエンドポイント

```typescript
// GET /api/metrics
{
  uptime: number,  // seconds
  memory: {
    heapUsed: number,  // MB
    heapTotal: number,
    external: number
  },
  requests: {
    total: number,
    byEndpoint: {
      '/api/agent-event': number,
      '/api/graph': number,
      // ...
    }
  },
  websocket: {
    connected: number,
    totalEvents: number,
    byType: {
      'agent:started': number,
      'agent:progress': number,
      // ...
    }
  },
  cache: {
    size: number,
    hitRate: number,  // 0-1
    missRate: number
  }
}
```

---

## 🎯 まとめ

### 修正完了項目

1. ✅ **問題1: サーバーAPI定義**
   - 既存3エンドポイント詳細化
   - 新規4エンドポイント追加
   - エラーレスポンス定義

2. ✅ **問題2: バリデーションルール**
   - Zod スキーマ定義
   - 10個のバリデーション関数
   - API統合方法

3. ✅ **問題3: レート制限**
   - イベント別スロットリング
   - Graph Updateデバウンス
   - IP別グローバル制限

### 追加ファイル

1. `packages/dashboard-server/src/validation/event-validators.ts`
2. `packages/dashboard-server/src/middleware/throttle.ts`
3. `packages/dashboard-server/src/services/graph-debouncer.ts`
4. `packages/dashboard-server/src/middleware/rate-limiter.ts`

---

**次のステップ: 第2回レビュー実施**

---

**End of Addendum v1.1.0**
