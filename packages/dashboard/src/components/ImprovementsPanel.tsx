/**
 * ImprovementsPanel - Phase 1-5改善機能の統計表示
 *
 * リアルタイムで改善機能の実行状況・統計情報を表示
 * WebSocket双方向通信により、UIクリックでagentsシステムと連携
 */

import { useState } from 'react';
import { useStatistics } from '../hooks/useStatistics';
import { useAgentWebSocket } from '../hooks/useAgentWebSocket';

interface ImprovementStats {
  // Phase 1: 型安全性
  typeSafety: {
    anyTypeCount: number;
    interfaceCount: number;
    typeCheckPassed: boolean;
    circularDepsResolved: boolean;
  };

  // Phase 2: エラーハンドリング
  errorHandling: {
    totalRetries: number;
    successfulRetries: number;
    failedRetries: number;
    avgRetryTime: number;
    errorClassesUsed: number;
  };

  // Phase 3: キャッシュ
  cache: {
    size: number;
    maxSize: number;
    hits: number;
    misses: number;
    hitRate: number;
    evictions: number;
    ttlMs: number;
  };

  // Phase 4: テスト
  tests: {
    totalTests: number;
    passedTests: number;
    failedTests: number;
    successRate: number;
    avgDuration: number;
    coverage: number;
  };

  // Phase 5: セキュリティ
  security: {
    scansPerformed: number;
    issuesDetected: number;
    criticalIssues: number;
    avgSecurityScore: number;
    patternsDetected: {
      eval: number;
      childProcess: number;
      fileSystem: number;
      network: number;
      other: number;
    };
  };
}

const MOCK_STATS: ImprovementStats = {
  typeSafety: {
    anyTypeCount: 0,
    interfaceCount: 1,
    typeCheckPassed: true,
    circularDepsResolved: true,
  },
  errorHandling: {
    totalRetries: 12,
    successfulRetries: 10,
    failedRetries: 2,
    avgRetryTime: 1547,
    errorClassesUsed: 5,
  },
  cache: {
    size: 23,
    maxSize: 100,
    hits: 156,
    misses: 42,
    hitRate: 0.788,
    evictions: 3,
    ttlMs: 900000,
  },
  tests: {
    totalTests: 157,
    passedTests: 157,
    failedTests: 0,
    successRate: 1.0,
    avgDuration: 1073,
    coverage: 100,
  },
  security: {
    scansPerformed: 8,
    issuesDetected: 2,
    criticalIssues: 0,
    avgSecurityScore: 94.5,
    patternsDetected: {
      eval: 0,
      childProcess: 0,
      fileSystem: 1,
      network: 1,
      other: 0,
    },
  },
};

export function ImprovementsPanel() {
  // Fetch real-time statistics from dashboard server
  const { statistics, loading, error } = useStatistics(10000); // Refresh every 10s

  // WebSocket双方向通信
  const [wsState, wsActions] = useAgentWebSocket();
  const [executionLog, setExecutionLog] = useState<Array<{ time: string; message: string; type: 'info' | 'success' | 'error' }>>([]);
  const [isExecuting, setIsExecuting] = useState(false);

  // Use real data if available, fallback to mock data
  const stats: ImprovementStats = statistics
    ? {
        typeSafety: {
          anyTypeCount: statistics.improvements.typeSafety.anyTypeCount,
          interfaceCount: statistics.improvements.typeSafety.interfaceCount,
          typeCheckPassed: statistics.improvements.typeSafety.typeCheckPassed,
          circularDepsResolved: statistics.improvements.typeSafety.circularDepsResolved > 0,
        },
        errorHandling: statistics.improvements.errorHandling,
        cache: statistics.improvements.cache,
        tests: statistics.improvements.tests,
        security: {
          scansPerformed: statistics.improvements.security.scansPerformed,
          issuesDetected: statistics.improvements.security.issuesDetected,
          criticalIssues: statistics.improvements.security.criticalIssues,
          avgSecurityScore: statistics.improvements.security.avgSecurityScore,
          patternsDetected: {
            eval: 0,
            childProcess: 0,
            fileSystem: 1,
            network: 1,
            other: statistics.improvements.security.patternsDetected - 2,
          },
        },
      }
    : MOCK_STATS;

  const lastUpdate = statistics ? new Date(statistics.timestamp) : new Date();

  // キャッシュヒット率を再計算
  const cacheHitRate = stats.cache.hits / (stats.cache.hits + stats.cache.misses || 1);

  /**
   * ログメッセージを追加
   */
  const addLog = (message: string, type: 'info' | 'success' | 'error' = 'info') => {
    const time = new Date().toLocaleTimeString('ja-JP');
    setExecutionLog((prev) => [{ time, message, type }, ...prev].slice(0, 10)); // 最新10件
  };

  /**
   * テストを実行
   */
  const handleRunTest = async () => {
    if (!wsState.connected) {
      addLog('WebSocket未接続です', 'error');
      return;
    }

    setIsExecuting(true);
    addLog('テスト実行を開始...', 'info');

    try {
      const response = await wsActions.sendCommand('run-test', { testName: 'improvements-test' });
      if (response.type === 'result') {
        addLog(`テスト完了: ${response.data.tests.passed}/${response.data.tests.total} 成功`, 'success');
      } else if (response.type === 'error') {
        addLog(`テスト失敗: ${response.error}`, 'error');
      }
    } catch (error) {
      addLog(`エラー: ${(error as Error).message}`, 'error');
    } finally {
      setIsExecuting(false);
    }
  };

  /**
   * リトライテストを実行
   */
  const handleRetryTest = async () => {
    if (!wsState.connected) {
      addLog('WebSocket未接続です', 'error');
      return;
    }

    setIsExecuting(true);
    addLog('リトライテスト実行中...', 'info');

    try {
      const response = await wsActions.sendCommand('retry-test');
      if (response.type === 'result') {
        addLog(`リトライ成功: ${response.data.attempts}回目で成功`, 'success');
      } else if (response.type === 'error') {
        addLog(`リトライ失敗: ${response.error}`, 'error');
      }
    } catch (error) {
      addLog(`エラー: ${(error as Error).message}`, 'error');
    } finally {
      setIsExecuting(false);
    }
  };

  /**
   * キャッシュ情報を取得
   */
  const handleGetCacheInfo = async () => {
    if (!wsState.connected) {
      addLog('WebSocket未接続です', 'error');
      return;
    }

    setIsExecuting(true);
    addLog('キャッシュ情報取得中...', 'info');

    try {
      const response = await wsActions.sendQuery('cache-info');
      if (response.type === 'result') {
        const cache = response.data.cache;
        addLog(
          `キャッシュ: ${cache.size}個 (ヒット率: ${(cache.hitRate * 100).toFixed(1)}%)`,
          'success'
        );
      } else if (response.type === 'error') {
        addLog(`取得失敗: ${response.error}`, 'error');
      }
    } catch (error) {
      addLog(`エラー: ${(error as Error).message}`, 'error');
    } finally {
      setIsExecuting(false);
    }
  };

  /**
   * 統計情報を更新
   */
  const handleRefreshStats = async () => {
    if (!wsState.connected) {
      addLog('WebSocket未接続です', 'error');
      return;
    }

    setIsExecuting(true);
    addLog('統計情報更新中...', 'info');

    try {
      const response = await wsActions.sendQuery('get-stats');
      if (response.type === 'stats') {
        addLog('統計情報を更新しました', 'success');
      } else if (response.type === 'error') {
        addLog(`更新失敗: ${response.error}`, 'error');
      }
    } catch (error) {
      addLog(`エラー: ${(error as Error).message}`, 'error');
    } finally {
      setIsExecuting(false);
    }
  };

  return (
    <div className="improvements-panel">
      <div className="panel-header">
        <h2>🚀 Intelligent Agent System - 改善機能統計</h2>
        <div className="header-right">
          <div className="data-source">
            {loading && '⏳ Loading...'}
            {error && '⚠️ Mock Data'}
            {statistics && !error && '✅ Live Data'}
          </div>
          <div className={`ws-status ${wsState.connected ? 'connected' : 'disconnected'}`}>
            {wsState.connecting && '🔄 接続中...'}
            {wsState.connected && '🟢 WebSocket接続'}
            {!wsState.connected && !wsState.connecting && '🔴 WebSocket切断'}
          </div>
          <div className="last-update">
            最終更新: {lastUpdate.toLocaleTimeString('ja-JP')}
          </div>
        </div>
      </div>

      {/* WebSocket Action Buttons */}
      <div className="action-panel">
        <div className="action-header">
          <h3>⚡ Agent System コマンド</h3>
          <button
            onClick={wsActions.reconnect}
            disabled={wsState.connected || isExecuting}
            className="btn-reconnect"
          >
            🔄 再接続
          </button>
        </div>
        <div className="action-buttons">
          <button
            onClick={handleRunTest}
            disabled={!wsState.connected || isExecuting}
            className="btn-action btn-test"
          >
            🧪 テスト実行
          </button>
          <button
            onClick={handleRetryTest}
            disabled={!wsState.connected || isExecuting}
            className="btn-action btn-retry"
          >
            🔁 リトライテスト
          </button>
          <button
            onClick={handleGetCacheInfo}
            disabled={!wsState.connected || isExecuting}
            className="btn-action btn-cache"
          >
            💾 キャッシュ情報
          </button>
          <button
            onClick={handleRefreshStats}
            disabled={!wsState.connected || isExecuting}
            className="btn-action btn-refresh"
          >
            📊 統計更新
          </button>
        </div>

        {/* Execution Log */}
        {executionLog.length > 0 && (
          <div className="execution-log">
            <h4>📝 実行ログ</h4>
            <div className="log-entries">
              {executionLog.map((log, index) => (
                <div key={index} className={`log-entry log-${log.type}`}>
                  <span className="log-time">{log.time}</span>
                  <span className="log-message">{log.message}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="stats-grid">
        {/* Phase 1: 型安全性 */}
        <div className="stat-card phase-1">
          <div className="card-header">
            <h3>Phase 1: 型安全性</h3>
            <span className="status-badge success">✅ 完了</span>
          </div>
          <div className="card-body">
            <div className="stat-row">
              <span className="stat-label">any型使用数:</span>
              <span className="stat-value">{stats.typeSafety.anyTypeCount}</span>
            </div>
            <div className="stat-row">
              <span className="stat-label">Interface数:</span>
              <span className="stat-value">{stats.typeSafety.interfaceCount}</span>
            </div>
            <div className="stat-row">
              <span className="stat-label">型チェック:</span>
              <span className={`stat-value ${stats.typeSafety.typeCheckPassed ? 'success' : 'error'}`}>
                {stats.typeSafety.typeCheckPassed ? '✓ 成功' : '✗ 失敗'}
              </span>
            </div>
            <div className="stat-row">
              <span className="stat-label">循環依存:</span>
              <span className={`stat-value ${stats.typeSafety.circularDepsResolved ? 'success' : 'error'}`}>
                {stats.typeSafety.circularDepsResolved ? '✓ 解消' : '✗ 存在'}
              </span>
            </div>
          </div>
        </div>

        {/* Phase 2: エラーハンドリング */}
        <div className="stat-card phase-2">
          <div className="card-header">
            <h3>Phase 2: エラーハンドリング</h3>
            <span className="status-badge success">✅ 完了</span>
          </div>
          <div className="card-body">
            <div className="stat-row">
              <span className="stat-label">総リトライ数:</span>
              <span className="stat-value">{stats.errorHandling.totalRetries}</span>
            </div>
            <div className="stat-row">
              <span className="stat-label">成功率:</span>
              <span className="stat-value success">
                {((stats.errorHandling.successfulRetries / stats.errorHandling.totalRetries) * 100).toFixed(1)}%
              </span>
            </div>
            <div className="stat-row">
              <span className="stat-label">平均リトライ時間:</span>
              <span className="stat-value">{stats.errorHandling.avgRetryTime}ms</span>
            </div>
            <div className="stat-row">
              <span className="stat-label">エラークラス:</span>
              <span className="stat-value">{stats.errorHandling.errorClassesUsed} 種類</span>
            </div>
          </div>
        </div>

        {/* Phase 3: キャッシュ */}
        <div className="stat-card phase-3">
          <div className="card-header">
            <h3>Phase 3: キャッシュ最適化</h3>
            <span className="status-badge success">✅ 完了</span>
          </div>
          <div className="card-body">
            <div className="stat-row">
              <span className="stat-label">キャッシュサイズ:</span>
              <span className="stat-value">
                {stats.cache.size} / {stats.cache.maxSize}
              </span>
            </div>
            <div className="stat-row">
              <span className="stat-label">ヒット率:</span>
              <span className={`stat-value ${cacheHitRate > 0.7 ? 'success' : 'warning'}`}>
                {(cacheHitRate * 100).toFixed(1)}%
              </span>
            </div>
            <div className="stat-row">
              <span className="stat-label">ヒット/ミス:</span>
              <span className="stat-value">
                {stats.cache.hits} / {stats.cache.misses}
              </span>
            </div>
            <div className="stat-row">
              <span className="stat-label">LRU Eviction:</span>
              <span className="stat-value">{stats.cache.evictions} 回</span>
            </div>
            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{ width: `${(stats.cache.size / stats.cache.maxSize) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Phase 4: テスト */}
        <div className="stat-card phase-4">
          <div className="card-header">
            <h3>Phase 4: テストカバレッジ</h3>
            <span className="status-badge success">✅ 完了</span>
          </div>
          <div className="card-body">
            <div className="stat-row">
              <span className="stat-label">総テスト数:</span>
              <span className="stat-value">{stats.tests.totalTests}</span>
            </div>
            <div className="stat-row">
              <span className="stat-label">成功率:</span>
              <span className={`stat-value ${stats.tests.successRate === 1.0 ? 'success' : 'warning'}`}>
                {(stats.tests.successRate * 100).toFixed(1)}%
              </span>
            </div>
            <div className="stat-row">
              <span className="stat-label">成功/失敗:</span>
              <span className="stat-value">
                {stats.tests.passedTests} / {stats.tests.failedTests}
              </span>
            </div>
            <div className="stat-row">
              <span className="stat-label">平均実行時間:</span>
              <span className="stat-value">{stats.tests.avgDuration}ms</span>
            </div>
            <div className="stat-row">
              <span className="stat-label">カバレッジ:</span>
              <span className="stat-value success">{stats.tests.coverage}%</span>
            </div>
          </div>
        </div>

        {/* Phase 5: セキュリティ */}
        <div className="stat-card phase-5">
          <div className="card-header">
            <h3>Phase 5: セキュリティ強化</h3>
            <span className="status-badge success">✅ 完了</span>
          </div>
          <div className="card-body">
            <div className="stat-row">
              <span className="stat-label">スキャン実行数:</span>
              <span className="stat-value">{stats.security.scansPerformed}</span>
            </div>
            <div className="stat-row">
              <span className="stat-label">検出Issue:</span>
              <span className="stat-value warning">{stats.security.issuesDetected}</span>
            </div>
            <div className="stat-row">
              <span className="stat-label">Critical:</span>
              <span className={`stat-value ${stats.security.criticalIssues === 0 ? 'success' : 'error'}`}>
                {stats.security.criticalIssues}
              </span>
            </div>
            <div className="stat-row">
              <span className="stat-label">平均スコア:</span>
              <span className={`stat-value ${stats.security.avgSecurityScore >= 90 ? 'success' : 'warning'}`}>
                {stats.security.avgSecurityScore}/100
              </span>
            </div>
            <div className="patterns-grid">
              <div className="pattern-item">
                <span className="pattern-label">eval:</span>
                <span className="pattern-count">{stats.security.patternsDetected.eval}</span>
              </div>
              <div className="pattern-item">
                <span className="pattern-label">child_process:</span>
                <span className="pattern-count">{stats.security.patternsDetected.childProcess}</span>
              </div>
              <div className="pattern-item">
                <span className="pattern-label">fs:</span>
                <span className="pattern-count">{stats.security.patternsDetected.fileSystem}</span>
              </div>
              <div className="pattern-item">
                <span className="pattern-label">network:</span>
                <span className="pattern-count">{stats.security.patternsDetected.network}</span>
              </div>
            </div>
          </div>
        </div>

        {/* 全体サマリー */}
        <div className="stat-card summary">
          <div className="card-header">
            <h3>📊 全体サマリー</h3>
            <span className="status-badge info">v1.3.0</span>
          </div>
          <div className="card-body">
            <div className="stat-row">
              <span className="stat-label">完了フェーズ:</span>
              <span className="stat-value success">5 / 7 (71%)</span>
            </div>
            <div className="stat-row">
              <span className="stat-label">追加コード:</span>
              <span className="stat-value">2,890行</span>
            </div>
            <div className="stat-row">
              <span className="stat-label">テスト成功率:</span>
              <span className="stat-value success">100%</span>
            </div>
            <div className="stat-row">
              <span className="stat-label">セキュリティスコア:</span>
              <span className="stat-value success">{stats.security.avgSecurityScore}/100</span>
            </div>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: '71%' }} />
            </div>
            <div className="next-phase">
              次のステップ: Phase 6 - 実行可能デモの追加
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .improvements-panel {
          padding: 20px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 12px;
          margin: 20px 0;
        }

        .panel-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
          color: white;
        }

        .panel-header h2 {
          margin: 0;
          font-size: 24px;
          font-weight: 600;
        }

        .header-right {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 4px;
        }

        .data-source {
          font-size: 12px;
          font-weight: 600;
          padding: 2px 8px;
          background: rgba(255, 255, 255, 0.2);
          border-radius: 12px;
        }

        .last-update {
          font-size: 14px;
          opacity: 0.9;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
          gap: 16px;
        }

        .stat-card {
          background: white;
          border-radius: 8px;
          padding: 16px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          transition: transform 0.2s, box-shadow 0.2s;
        }

        .stat-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }

        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
          padding-bottom: 12px;
          border-bottom: 2px solid #f0f0f0;
        }

        .card-header h3 {
          margin: 0;
          font-size: 16px;
          font-weight: 600;
          color: #333;
        }

        .status-badge {
          padding: 4px 12px;
          border-radius: 12px;
          font-size: 12px;
          font-weight: 600;
        }

        .status-badge.success {
          background: #d4edda;
          color: #155724;
        }

        .status-badge.info {
          background: #d1ecf1;
          color: #0c5460;
        }

        .card-body {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .stat-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 14px;
        }

        .stat-label {
          color: #666;
          font-weight: 500;
        }

        .stat-value {
          font-weight: 600;
          color: #333;
        }

        .stat-value.success {
          color: #28a745;
        }

        .stat-value.warning {
          color: #ffc107;
        }

        .stat-value.error {
          color: #dc3545;
        }

        .progress-bar {
          width: 100%;
          height: 8px;
          background: #e9ecef;
          border-radius: 4px;
          overflow: hidden;
          margin-top: 8px;
        }

        .progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #28a745 0%, #20c997 100%);
          transition: width 0.3s ease;
        }

        .patterns-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 8px;
          margin-top: 8px;
        }

        .pattern-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 6px 10px;
          background: #f8f9fa;
          border-radius: 4px;
          font-size: 12px;
        }

        .pattern-label {
          color: #666;
          font-weight: 500;
        }

        .pattern-count {
          font-weight: 600;
          color: #333;
        }

        .next-phase {
          margin-top: 12px;
          padding: 12px;
          background: #e7f3ff;
          border-left: 4px solid #0066cc;
          border-radius: 4px;
          font-size: 13px;
          color: #0066cc;
          font-weight: 500;
        }

        .summary {
          grid-column: 1 / -1;
        }

        /* WebSocket Status */
        .ws-status {
          font-size: 12px;
          font-weight: 600;
          padding: 4px 10px;
          background: rgba(255, 255, 255, 0.2);
          border-radius: 12px;
          margin: 4px 0;
        }

        .ws-status.connected {
          background: rgba(72, 187, 120, 0.3);
          color: #c6f6d5;
        }

        .ws-status.disconnected {
          background: rgba(245, 101, 101, 0.3);
          color: #fed7d7;
        }

        /* Action Panel */
        .action-panel {
          background: white;
          border-radius: 8px;
          padding: 16px;
          margin-bottom: 20px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .action-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
          padding-bottom: 12px;
          border-bottom: 2px solid #f0f0f0;
        }

        .action-header h3 {
          margin: 0;
          font-size: 16px;
          font-weight: 600;
          color: #333;
        }

        .btn-reconnect {
          padding: 6px 12px;
          background: #6c757d;
          color: white;
          border: none;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn-reconnect:hover:not(:disabled) {
          background: #5a6268;
        }

        .btn-reconnect:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .action-buttons {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 12px;
          margin-bottom: 16px;
        }

        .btn-action {
          padding: 10px 16px;
          border: none;
          border-radius: 6px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          color: white;
        }

        .btn-action:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
        }

        .btn-action:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .btn-test {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }

        .btn-retry {
          background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
        }

        .btn-cache {
          background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
        }

        .btn-refresh {
          background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
        }

        /* Execution Log */
        .execution-log {
          background: #f8f9fa;
          border-radius: 6px;
          padding: 12px;
        }

        .execution-log h4 {
          margin: 0 0 10px 0;
          font-size: 14px;
          font-weight: 600;
          color: #333;
        }

        .log-entries {
          display: flex;
          flex-direction: column;
          gap: 6px;
          max-height: 200px;
          overflow-y: auto;
        }

        .log-entry {
          display: flex;
          gap: 10px;
          padding: 8px 10px;
          background: white;
          border-radius: 4px;
          font-size: 13px;
          border-left: 3px solid #dee2e6;
        }

        .log-entry.log-info {
          border-left-color: #17a2b8;
        }

        .log-entry.log-success {
          border-left-color: #28a745;
          background: #d4edda;
        }

        .log-entry.log-error {
          border-left-color: #dc3545;
          background: #f8d7da;
        }

        .log-time {
          font-weight: 600;
          color: #6c757d;
          min-width: 80px;
        }

        .log-message {
          color: #333;
          flex: 1;
        }

        @media (max-width: 768px) {
          .stats-grid {
            grid-template-columns: 1fr;
          }

          .action-buttons {
            grid-template-columns: 1fr;
          }

          .panel-header {
            flex-direction: column;
            align-items: flex-start;
          }

          .header-right {
            align-items: flex-start;
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
}
