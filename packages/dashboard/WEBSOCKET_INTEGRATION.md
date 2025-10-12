# WebSocket双方向通信ガイド

Dashboard UI ↔ Agents System間の双方向通信機能の使い方

## 概要

ダッシュボードのUIボタンをクリックすることで、agentsシステムに直接コマンドを送信し、リアルタイムで結果を受け取ることができます。

## アーキテクチャ

```
┌─────────────────────┐          WebSocket (port 8080)          ┌─────────────────────┐
│  Dashboard (React)  │ ◄────────────────────────────────────► │  Agents System      │
│                     │                                          │                     │
│  ImprovementsPanel  │  UIクリック → コマンド送信               │  WebSocketServer    │
│  useAgentWebSocket  │  レスポンス受信 ← 実行結果               │  AgentRegistry      │
└─────────────────────┘                                          └─────────────────────┘
```

## 実装ファイル

### フロントエンド (Dashboard)
- **`packages/dashboard/src/hooks/useAgentWebSocket.ts`** - WebSocket通信フック
  - 自動接続・再接続機能
  - ハートビート (30秒ごとにping)
  - コマンド/クエリ送信
  - レスポンスハンドリング

- **`packages/dashboard/src/components/ImprovementsPanel.tsx`** - UI統合
  - 4つのアクションボタン
  - WebSocket接続状態表示
  - 実行ログ表示 (最新10件)

### バックエンド (Agents System)
- **`agents/websocket-server.ts`** - WebSocketサーバー
  - ポート8080で待ち受け
  - 6つのコマンド処理
  - ブロードキャスト機能

## セットアップ & 起動方法

### 1. WebSocketサーバーを起動

```bash
# ターミナル1: Agents System WebSocketサーバー起動
cd /Users/shunsuke/Dev/Autonomous-Operations
tsx agents/websocket-server.ts

# または環境変数でポート指定
WS_PORT=8080 tsx agents/websocket-server.ts
```

出力例:
```
[WebSocket] Server listening on port 8080
[WebSocket] Dashboard can connect to ws://localhost:8080
```

### 2. ダッシュボードを起動

```bash
# ターミナル2: Dashboard起動
cd /Users/shunsuke/Dev/Autonomous-Operations/packages/dashboard
npm run dev
```

### 3. ブラウザでアクセス

1. http://localhost:5173 を開く
2. 右上の **🚀** ボタンをクリックして「Improvements Stats」ビューに切り替え
3. WebSocket接続状態を確認: **🟢 WebSocket接続**

## 利用可能なコマンド

### 1. 🧪 テスト実行 (`run-test`)
- **説明**: Phase 1-5の改善機能テストを実行
- **実行内容**:
  - IToolCreatorインターフェーステスト (14件)
  - エラークラステスト (27件)
  - リトライロジックテスト (27件)
  - TTLCacheテスト (50件)
  - 合計: 118テスト
- **レスポンス例**:
  ```json
  {
    "type": "result",
    "data": {
      "testName": "improvements-test",
      "status": "passed",
      "duration": 1073,
      "tests": {
        "total": 157,
        "passed": 157,
        "failed": 0
      }
    }
  }
  ```

### 2. 🔁 リトライテスト (`retry-test`)
- **説明**: Exponential Backoffリトライ機能のテスト
- **実行内容**: 最大3回のリトライを試行し、2回目で成功するシミュレーション
- **レスポンス例**:
  ```json
  {
    "type": "result",
    "data": {
      "status": "success",
      "attempts": 2,
      "message": "Retry succeeded on attempt 2"
    }
  }
  ```

### 3. 💾 キャッシュ情報 (`cache-info`)
- **説明**: TTLCacheの現在の状態を取得
- **実行内容**: キャッシュサイズ、ヒット率、エビクション数を表示
- **レスポンス例**:
  ```json
  {
    "type": "result",
    "data": {
      "cache": {
        "size": 23,
        "maxSize": 100,
        "hits": 156,
        "misses": 42,
        "hitRate": 0.788,
        "evictions": 3
      }
    }
  }
  ```

### 4. 📊 統計更新 (`get-stats`)
- **説明**: Phase 1-5の全統計情報を取得
- **実行内容**: 型安全性、エラーハンドリング、キャッシュ、テスト、セキュリティの統計
- **レスポンス例**:
  ```json
  {
    "type": "stats",
    "data": {
      "typeSafety": { "anyTypeCount": 0, "interfaceCount": 1 },
      "errorHandling": { "totalRetries": 12, "successfulRetries": 10 },
      "cache": { "size": 23, "hitRate": 0.788 },
      "tests": { "totalTests": 157, "passedTests": 157 },
      "security": { "avgSecurityScore": 94.5 }
    }
  }
  ```

## 実行ログの見方

実行ログは最新10件が表示され、3種類の色分けがされています:

- **青色 (info)**: 実行開始メッセージ
- **緑色 (success)**: 成功メッセージ
- **赤色 (error)**: エラーメッセージ

例:
```
16:45:23  テスト実行を開始...                    [青色]
16:45:24  テスト完了: 157/157 成功               [緑色]
16:45:30  WebSocket未接続です                   [赤色]
```

## トラブルシューティング

### 1. 🔴 WebSocket切断
**原因**: WebSocketサーバーが起動していない

**解決策**:
```bash
tsx agents/websocket-server.ts
```

### 2. WebSocket未接続エラー
**原因**: 接続が確立される前にボタンをクリックした

**解決策**:
- **🟢 WebSocket接続** が表示されるまで待つ
- または **🔄 再接続** ボタンをクリック

### 3. Response timeout
**原因**: サーバーからのレスポンスが10秒以内に返ってこない

**解決策**:
- サーバーログを確認: `[WebSocket] Received: ...`
- サーバーが正常に動作しているか確認

### 4. ポート8080が使用中
**エラー**: `EADDRINUSE: address already in use :::8080`

**解決策**:
```bash
# ポート8080を使用中のプロセスを確認
lsof -i :8080

# プロセスを終了
kill -9 <PID>

# または別のポートを使用
WS_PORT=8081 tsx agents/websocket-server.ts
```

## 技術仕様

### WebSocketメッセージフォーマット

**送信 (Dashboard → Agents)**
```typescript
interface DashboardMessage {
  type: 'command' | 'query' | 'ping';
  command?: string;
  payload?: any;
  timestamp: number;
}
```

**受信 (Agents → Dashboard)**
```typescript
interface AgentResponse {
  type: 'result' | 'error' | 'stats' | 'pong' | 'broadcast';
  data?: any;
  error?: string;
  timestamp: number;
}
```

### 自動機能

1. **自動再接続**: 切断時、3秒後に自動的に再接続
2. **ハートビート**: 30秒ごとに`ping`を送信して接続維持
3. **タイムアウト**: レスポンス待機時間は10秒

## 開発者向け情報

### 新しいコマンドの追加方法

1. **サーバー側** (`agents/websocket-server.ts`):
```typescript
private async handleCommand(command: string, payload: any): Promise<AgentResponse> {
  switch (command) {
    case 'my-new-command':
      return await this.myNewCommandHandler(payload);
    // ...
  }
}

private async myNewCommandHandler(payload: any): Promise<AgentResponse> {
  // コマンド実装
  return {
    type: 'result',
    data: { ... },
    timestamp: Date.now(),
  };
}
```

2. **クライアント側** (`ImprovementsPanel.tsx`):
```typescript
const handleMyNewCommand = async () => {
  if (!wsState.connected) {
    addLog('WebSocket未接続です', 'error');
    return;
  }

  setIsExecuting(true);
  addLog('コマンド実行中...', 'info');

  try {
    const response = await wsActions.sendCommand('my-new-command', { ... });
    if (response.type === 'result') {
      addLog('成功しました', 'success');
    }
  } catch (error) {
    addLog(`エラー: ${error.message}`, 'error');
  } finally {
    setIsExecuting(false);
  }
};
```

3. **UIボタン追加**:
```tsx
<button
  onClick={handleMyNewCommand}
  disabled={!wsState.connected || isExecuting}
  className="btn-action btn-custom"
>
  🎯 My Command
</button>
```

## まとめ

このWebSocket双方向通信により:
- ✅ ダッシュボードから直接agentsシステムを操作可能
- ✅ リアルタイムでテスト実行・統計取得
- ✅ 実行ログで操作履歴を確認
- ✅ 自動再接続でロバストな通信

Phase 1-5の改善機能を実際に動作させながら確認できます！
