/**
 * useAgentWebSocket - WebSocket通信フック
 *
 * ダッシュボード ↔ agentsシステム間の双方向通信を提供
 */

import { useState, useEffect, useCallback, useRef } from 'react';

interface DashboardMessage {
  type: 'command' | 'query' | 'ping';
  command?: string;
  payload?: any;
  timestamp: number;
}

interface AgentResponse {
  type: 'result' | 'error' | 'stats' | 'pong' | 'broadcast';
  data?: any;
  error?: string;
  timestamp: number;
}

export interface WebSocketState {
  connected: boolean;
  connecting: boolean;
  error: string | null;
  lastResponse: AgentResponse | null;
  lastUpdate: Date | null;
}

export interface WebSocketActions {
  sendCommand: (command: string, payload?: any) => Promise<AgentResponse>;
  sendQuery: (command: string, payload?: any) => Promise<AgentResponse>;
  disconnect: () => void;
  reconnect: () => void;
}

const WS_URL = 'ws://localhost:8080';
const RECONNECT_DELAY = 3000; // 3秒後に再接続
const HEARTBEAT_INTERVAL = 30000; // 30秒ごとにping

/**
 * Agent WebSocket通信フック
 */
export function useAgentWebSocket(): [WebSocketState, WebSocketActions] {
  const [state, setState] = useState<WebSocketState>({
    connected: false,
    connecting: false,
    error: null,
    lastResponse: null,
    lastUpdate: null,
  });

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimerRef = useRef<NodeJS.Timeout | null>(null);
  const heartbeatTimerRef = useRef<NodeJS.Timeout | null>(null);
  const responseCallbacksRef = useRef<Map<number, (response: AgentResponse) => void>>(new Map());
  const connectingRef = useRef<boolean>(false);

  /**
   * WebSocket接続を確立
   */
  const connect = useCallback(() => {
    // すでに接続中なら何もしない
    if (wsRef.current?.readyState === WebSocket.OPEN || connectingRef.current) {
      return;
    }

    connectingRef.current = true;
    setState((prev: WebSocketState) => ({ ...prev, connecting: true, error: null }));

    try {
      const ws = new WebSocket(WS_URL);

      ws.onopen = () => {
        console.log('[WebSocket] Connected to agents system');
        connectingRef.current = false;
        setState((prev: WebSocketState) => ({
          ...prev,
          connected: true,
          connecting: false,
          error: null,
          lastUpdate: new Date(),
        }));

        // ハートビート開始
        if (heartbeatTimerRef.current) {
          clearInterval(heartbeatTimerRef.current);
        }
        heartbeatTimerRef.current = setInterval(() => {
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ type: 'ping', timestamp: Date.now() }));
          }
        }, HEARTBEAT_INTERVAL);
      };

      ws.onmessage = (event) => {
        try {
          const response: AgentResponse = JSON.parse(event.data);
          console.log('[WebSocket] Received:', response.type, response);

          setState((prev: WebSocketState) => ({
            ...prev,
            lastResponse: response,
            lastUpdate: new Date(),
          }));

          // Promiseコールバックを実行
          const callback = responseCallbacksRef.current.get(response.timestamp);
          if (callback) {
            callback(response);
            responseCallbacksRef.current.delete(response.timestamp);
          }
        } catch (error) {
          console.error('[WebSocket] Parse error:', error);
        }
      };

      ws.onerror = (error) => {
        console.error('[WebSocket] Error:', error);
        connectingRef.current = false;
        setState((prev: WebSocketState) => ({
          ...prev,
          error: 'WebSocket接続エラー',
          connecting: false,
        }));
      };

      ws.onclose = () => {
        console.log('[WebSocket] Disconnected');
        connectingRef.current = false;
        setState((prev: WebSocketState) => ({
          ...prev,
          connected: false,
          connecting: false,
        }));

        // ハートビート停止
        if (heartbeatTimerRef.current) {
          clearInterval(heartbeatTimerRef.current);
          heartbeatTimerRef.current = null;
        }

        // 自動再接続
        if (!reconnectTimerRef.current) {
          reconnectTimerRef.current = setTimeout(() => {
            reconnectTimerRef.current = null;
            console.log('[WebSocket] Attempting to reconnect...');
            connect();
          }, RECONNECT_DELAY);
        }
      };

      wsRef.current = ws;
    } catch (error) {
      console.error('[WebSocket] Connection error:', error);
      connectingRef.current = false;
      setState((prev: WebSocketState) => ({
        ...prev,
        error: '接続に失敗しました',
        connecting: false,
      }));
    }
  }, []); // No dependencies - stable function

  /**
   * WebSocket接続を切断
   */
  const disconnect = useCallback(() => {
    if (reconnectTimerRef.current) {
      clearTimeout(reconnectTimerRef.current);
      reconnectTimerRef.current = null;
    }

    if (heartbeatTimerRef.current) {
      clearInterval(heartbeatTimerRef.current);
      heartbeatTimerRef.current = null;
    }

    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }

    connectingRef.current = false;
    setState((prev: WebSocketState) => ({
      ...prev,
      connected: false,
      connecting: false,
    }));
  }, []);

  /**
   * 再接続
   */
  const reconnect = useCallback(() => {
    disconnect();
    setTimeout(() => connect(), 500);
  }, [disconnect, connect]);

  /**
   * メッセージ送信（汎用）
   */
  const sendMessage = useCallback(
    (message: DashboardMessage): Promise<AgentResponse> => {
      return new Promise((resolve, reject) => {
        if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
          reject(new Error('WebSocket is not connected'));
          return;
        }

        try {
          const timestamp = Date.now();
          const messageWithTimestamp = { ...message, timestamp };

          // コールバックを登録
          responseCallbacksRef.current.set(timestamp, resolve);

          // 送信
          wsRef.current.send(JSON.stringify(messageWithTimestamp));

          // タイムアウト設定（10秒）
          setTimeout(() => {
            if (responseCallbacksRef.current.has(timestamp)) {
              responseCallbacksRef.current.delete(timestamp);
              reject(new Error('Response timeout'));
            }
          }, 10000);
        } catch (error) {
          reject(error);
        }
      });
    },
    []
  );

  /**
   * コマンド送信
   */
  const sendCommand = useCallback(
    (command: string, payload?: any): Promise<AgentResponse> => {
      return sendMessage({
        type: 'command',
        command,
        payload,
        timestamp: Date.now(),
      });
    },
    [sendMessage]
  );

  /**
   * クエリ送信
   */
  const sendQuery = useCallback(
    (command: string, payload?: any): Promise<AgentResponse> => {
      return sendMessage({
        type: 'query',
        command,
        payload,
        timestamp: Date.now(),
      });
    },
    [sendMessage]
  );

  // 初回マウント時に接続
  useEffect(() => {
    connect();

    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  return [
    state,
    {
      sendCommand,
      sendQuery,
      disconnect,
      reconnect,
    },
  ];
}
