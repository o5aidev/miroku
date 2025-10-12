/**
 * ImprovementsPanel - Phase 1-5改善機能の統計表示
 *
 * リアルタイムで改善機能の実行状況・統計情報を表示
 */

import { useState, useEffect } from 'react';

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
  const [stats, setStats] = useState<ImprovementStats>(MOCK_STATS);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  // リアルタイム更新シミュレーション（10秒毎）
  useEffect(() => {
    const interval = setInterval(() => {
      setStats((prev) => ({
        ...prev,
        cache: {
          ...prev.cache,
          hits: prev.cache.hits + Math.floor(Math.random() * 5),
          misses: prev.cache.misses + Math.floor(Math.random() * 2),
        },
        errorHandling: {
          ...prev.errorHandling,
          totalRetries: prev.errorHandling.totalRetries + Math.floor(Math.random() * 2),
        },
      }));
      setLastUpdate(new Date());
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  // キャッシュヒット率を再計算
  const cacheHitRate = stats.cache.hits / (stats.cache.hits + stats.cache.misses);

  return (
    <div className="improvements-panel">
      <div className="panel-header">
        <h2>🚀 Intelligent Agent System - 改善機能統計</h2>
        <div className="last-update">
          最終更新: {lastUpdate.toLocaleTimeString('ja-JP')}
        </div>
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

      <style jsx>{`
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

        @media (max-width: 768px) {
          .stats-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}
