/**
 * Legend Panel
 *
 * Explains the meaning of colors, icons, and node types in the dashboard.
 * Helps first-time users understand the visualization immediately.
 */

import { useState } from 'react';
import { useAccessibilityPreferences } from '../hooks/useAccessibilityPreferences';
import { useMediaQuery } from '../hooks/useMediaQuery';

export function LegendPanel() {
  const [isExpanded, setIsExpanded] = useState(false);
  const { prefersHighContrast } = useAccessibilityPreferences();
  const isCompactLayout = useMediaQuery('(max-width: 1280px)');

  const collapsedPositionClass = isCompactLayout ? 'fixed bottom-6 right-4 z-20' : 'fixed bottom-20 left-4 z-20';
  const expandedPositionClass = isCompactLayout ? 'fixed bottom-6 inset-x-4 z-30' : 'fixed bottom-20 left-4 z-20';
  const expandedWidthClass = isCompactLayout ? 'w-auto max-w-md mx-auto' : 'w-80';
  const backgroundStyle = prefersHighContrast
    ? {
        background: 'rgba(15, 23, 42, 0.95)',
        border: '1px solid rgba(226, 232, 240, 0.35)',
      }
    : {
        background: 'rgba(255, 255, 255, 1)',
        border: '1px solid rgba(229, 231, 235, 1)',
      };

  if (!isExpanded) {
    return (
      <div className={collapsedPositionClass}>
        <button
          onClick={() => setIsExpanded(true)}
          className="flex items-center gap-2 rounded-lg bg-white px-4 py-3 shadow-xl transition-all hover:shadow-2xl"
        >
          <span className="text-xl">📖</span>
          <span className="text-sm font-semibold text-gray-700">凡例を表示</span>
        </button>
      </div>
    );
  }

  return (
    <div
      className={`${expandedPositionClass} ${expandedWidthClass} rounded-xl shadow-2xl`}
      style={backgroundStyle}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between border-b border-gray-200 p-4 rounded-t-xl"
        style={{
          background: prefersHighContrast
            ? 'linear-gradient(135deg, #1f2937 0%, #0f172a 100%)'
            : 'linear-gradient(135deg, #a855f7 0%, #6366f1 100%)',
          borderColor: prefersHighContrast ? 'rgba(226, 232, 240, 0.35)' : undefined,
        }}
      >
        <div className="flex items-center gap-2">
          <span className="text-2xl">📖</span>
          <div>
            <h3 className="text-sm font-bold text-white">凡例 / Legend</h3>
            <p className="text-xs text-white/80">各要素の意味</p>
          </div>
        </div>
        <button
          onClick={() => setIsExpanded(false)}
          className="rounded-lg p-1 text-white transition-colors hover:bg-white/20"
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Content */}
      <div className="max-h-96 overflow-y-auto p-4">
        {/* Node Types */}
        <section className="mb-4">
          <h4 className="mb-2 text-xs font-bold text-gray-700">ノードの種類</h4>
          <div className="space-y-2">
            <div className="flex items-center gap-3 rounded-lg bg-blue-50 p-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white shadow">
                <span className="text-xl">📋</span>
              </div>
              <div className="flex-1">
                <div className="text-xs font-semibold text-gray-800">Issue Node</div>
                <div className="text-[10px] text-gray-600">GitHubから読み込んだタスク</div>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-lg bg-purple-50 p-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-900 shadow">
                <span className="text-xl">🤖</span>
              </div>
              <div className="flex-1">
                <div className="text-xs font-semibold text-gray-800">Agent Node</div>
                <div className="text-[10px] text-gray-600">タスクを実行するAIエージェント</div>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-lg bg-green-50 p-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100 shadow">
                <span className="text-xl">📊</span>
              </div>
              <div className="flex-1">
                <div className="text-xs font-semibold text-gray-800">State Node</div>
                <div className="text-[10px] text-gray-600">タスクの状態（pending, done等）</div>
              </div>
            </div>
          </div>
        </section>

        {/* Agent Status */}
        <section className="mb-4">
          <h4 className="mb-2 text-xs font-bold text-gray-700">Agentの状態</h4>
          <div className="space-y-2">
            <div className="flex items-center gap-3 rounded-lg bg-gray-50 p-2">
              <div className="h-3 w-3 rounded-full bg-gray-500"></div>
              <div className="flex-1">
                <div className="text-xs font-semibold text-gray-800">IDLE（待機中）</div>
                <div className="text-[10px] text-gray-600">タスクを待っている状態</div>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-lg bg-green-50 p-2">
              <div className="h-3 w-3 animate-pulse rounded-full bg-green-500"></div>
              <div className="flex-1">
                <div className="text-xs font-semibold text-gray-800">RUNNING（実行中）</div>
                <div className="text-[10px] text-gray-600">タスクを実行中。プログレスバー表示</div>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-lg bg-blue-50 p-2">
              <div className="h-3 w-3 rounded-full bg-blue-500"></div>
              <div className="flex-1">
                <div className="text-xs font-semibold text-gray-800">COMPLETED（完了）</div>
                <div className="text-[10px] text-gray-600">タスク完了。3秒後にIDLEへ</div>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-lg bg-red-50 p-2">
              <div className="h-3 w-3 rounded-full bg-red-500"></div>
              <div className="flex-1">
                <div className="text-xs font-semibold text-gray-800">ERROR（エラー）</div>
                <div className="text-[10px] text-gray-600">実行中にエラーが発生</div>
              </div>
            </div>
          </div>
        </section>

        {/* Edge Types */}
        <section className="mb-4">
          <h4 className="mb-2 text-xs font-bold text-gray-700">接続線の種類</h4>
          <div className="space-y-2">
            <div className="flex items-center gap-3 rounded-lg bg-orange-50 p-2">
              <div className="h-0.5 w-8 animate-pulse bg-red-500"></div>
              <div className="flex-1">
                <div className="text-xs font-semibold text-gray-800">Issue → Agent</div>
                <div className="text-[10px] text-gray-600">Issueが割り当てられた時にアニメーション</div>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-lg bg-purple-50 p-2">
              <div className="h-0.5 w-8 bg-purple-500"></div>
              <div className="flex-1">
                <div className="text-xs font-semibold text-gray-800">Agent → State</div>
                <div className="text-[10px] text-gray-600">Agentが状態を更新</div>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-lg bg-gray-50 p-2">
              <div className="h-0.5 w-8 border-t-2 border-dashed border-gray-400"></div>
              <div className="flex-1">
                <div className="text-xs font-semibold text-gray-800">State Flow</div>
                <div className="text-[10px] text-gray-600">状態遷移の流れ（pending → done）</div>
              </div>
            </div>
          </div>
        </section>

        {/* Agent Types */}
        <section>
          <h4 className="mb-2 text-xs font-bold text-gray-700">Agentの役割</h4>
          <div className="space-y-2">
            <div className="rounded-lg bg-red-50 p-2">
              <div className="flex items-center gap-2">
                <span className="text-lg">🎯</span>
                <span className="text-xs font-semibold text-gray-800">CoordinatorAgent</span>
              </div>
              <div className="text-[10px] text-gray-600">タスクを分析・分解し、最適なAgentに割り当て</div>
            </div>

            <div className="rounded-lg bg-purple-50 p-2">
              <div className="flex items-center gap-2">
                <span className="text-lg">💻</span>
                <span className="text-xs font-semibold text-gray-800">CodeGenAgent</span>
              </div>
              <div className="text-[10px] text-gray-600">AIでコードを自動生成（Claude Sonnet 4使用）</div>
            </div>

            <div className="rounded-lg bg-blue-50 p-2">
              <div className="flex items-center gap-2">
                <span className="text-lg">👀</span>
                <span className="text-xs font-semibold text-gray-800">ReviewAgent</span>
              </div>
              <div className="text-[10px] text-gray-600">コード品質をレビューしスコアリング（100点満点）</div>
            </div>

            <div className="rounded-lg bg-green-50 p-2">
              <div className="flex items-center gap-2">
                <span className="text-lg">📝</span>
                <span className="text-xs font-semibold text-gray-800">PRAgent</span>
              </div>
              <div className="text-[10px] text-gray-600">Pull Requestを自動作成（Conventional Commits準拠）</div>
            </div>

            <div className="rounded-lg bg-yellow-50 p-2">
              <div className="flex items-center gap-2">
                <span className="text-lg">🚀</span>
                <span className="text-xs font-semibold text-gray-800">DeploymentAgent</span>
              </div>
              <div className="text-[10px] text-gray-600">Firebase/Vercel/AWSに自動デプロイ</div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
