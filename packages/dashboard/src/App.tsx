import { useState } from 'react';
import { FlowCanvas } from './components/FlowCanvas';
import { FlowCanvasMock } from './components/FlowCanvasMock';
import { ERView } from './components/ERView';
import { IssueDependencyView } from './components/IssueDependencyView';
import { ImprovementsPanel } from './components/ImprovementsPanel';
import { DevicePanel } from './components/DevicePanel';
import { SessionGraphView } from './components/SessionGraphView';
import { useAccessibilityPreferences } from './hooks/useAccessibilityPreferences';

type ViewMode = 'flow' | 'flow-mock' | 'er' | 'issue-dependencies' | 'improvements' | 'session-graph';

function App() {
  const [viewMode, setViewMode] = useState<ViewMode>('flow');
  const [showDevicePanel, setShowDevicePanel] = useState(true);
  const { prefersHighContrast } = useAccessibilityPreferences();

  return (
    <div className="flex h-screen w-full flex-col">
      {/* Minimal Header */}
      <header
        className="z-20 border-b border-white/10"
        style={{
          background: prefersHighContrast
            ? 'linear-gradient(135deg, #312e81 0%, #1e293b 100%)'
            : 'linear-gradient(135deg, #9333ea 0%, #2563eb 100%)',
        }}
      >
        <div className="container mx-auto flex items-center justify-between gap-2 px-3 py-1.5 sm:gap-4 sm:px-4">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <span className="text-base sm:text-xl" aria-hidden>
              🤖
            </span>
            <h1 className="text-sm font-semibold text-white sm:text-base">Miyabi</h1>

            {/* View Mode Switcher - Desktop */}
            <div className="ml-2 hidden items-center gap-0.5 rounded bg-white/10 p-0.5 sm:flex">
              <button
                onClick={() => setViewMode('flow')}
                title="Agent Flow"
                className={`rounded px-2 py-0.5 text-xs transition-all ${
                  viewMode === 'flow'
                    ? 'bg-white text-purple-600 shadow-sm'
                    : 'text-white/90 hover:bg-white/10'
                }`}
              >
                🔄
              </button>
              <button
                onClick={() => setViewMode('flow-mock')}
                title="Flow (Mock)"
                className={`rounded px-2 py-0.5 text-xs transition-all ${
                  viewMode === 'flow-mock'
                    ? 'bg-white text-purple-600 shadow-sm'
                    : 'text-white/90 hover:bg-white/10'
                }`}
              >
                🎭
              </button>
              <button
                onClick={() => setViewMode('er')}
                title="ER Diagram"
                className={`rounded px-2 py-0.5 text-xs transition-all ${
                  viewMode === 'er'
                    ? 'bg-white text-purple-600 shadow-sm'
                    : 'text-white/90 hover:bg-white/10'
                }`}
              >
                📊
              </button>
              <button
                onClick={() => setViewMode('issue-dependencies')}
                title="Issue Dependencies"
                className={`rounded px-2 py-0.5 text-xs transition-all ${
                  viewMode === 'issue-dependencies'
                    ? 'bg-white text-purple-600 shadow-sm'
                    : 'text-white/90 hover:bg-white/10'
                }`}
              >
                🔗
              </button>
              <button
                onClick={() => setViewMode('improvements')}
                title="Improvements Stats"
                className={`rounded px-2 py-0.5 text-xs transition-all ${
                  viewMode === 'improvements'
                    ? 'bg-white text-purple-600 shadow-sm'
                    : 'text-white/90 hover:bg-white/10'
                }`}
              >
                🚀
              </button>
              <button
                onClick={() => setViewMode('session-graph')}
                title="Session Graph"
                className={`rounded px-2 py-0.5 text-xs transition-all ${
                  viewMode === 'session-graph'
                    ? 'bg-white text-purple-600 shadow-sm'
                    : 'text-white/90 hover:bg-white/10'
                }`}
              >
                🌸
              </button>
            </div>
          </div>

          {/* View switcher - Mobile */}
          <div className="flex items-center gap-0.5 rounded bg-white/10 p-0.5 sm:hidden">
            <button
              onClick={() => setViewMode('flow')}
              className={`rounded px-1.5 py-0.5 text-xs transition ${
                viewMode === 'flow'
                  ? 'bg-white text-purple-600 shadow'
                  : 'text-white/90 hover:bg-white/10'
              }`}
            >
              🔄
            </button>
            <button
              onClick={() => setViewMode('flow-mock')}
              className={`rounded px-1.5 py-0.5 text-xs transition ${
                viewMode === 'flow-mock'
                  ? 'bg-white text-purple-600 shadow'
                  : 'text-white/90 hover:bg-white/10'
              }`}
            >
              🎭
            </button>
            <button
              onClick={() => setViewMode('er')}
              className={`rounded px-1.5 py-0.5 text-xs transition ${
                viewMode === 'er'
                  ? 'bg-white text-purple-600 shadow'
                  : 'text-white/90 hover:bg-white/10'
              }`}
            >
              📊
            </button>
            <button
              onClick={() => setViewMode('issue-dependencies')}
              className={`rounded px-1.5 py-0.5 text-xs transition ${
                viewMode === 'issue-dependencies'
                  ? 'bg-white text-purple-600 shadow'
                  : 'text-white/90 hover:bg-white/10'
              }`}
            >
              🔗
            </button>
            <button
              onClick={() => setViewMode('improvements')}
              className={`rounded px-1.5 py-0.5 text-xs transition ${
                viewMode === 'improvements'
                  ? 'bg-white text-purple-600 shadow'
                  : 'text-white/90 hover:bg-white/10'
              }`}
            >
              🚀
            </button>
            <button
              onClick={() => setViewMode('session-graph')}
              className={`rounded px-1.5 py-0.5 text-xs transition ${
                viewMode === 'session-graph'
                  ? 'bg-white text-purple-600 shadow'
                  : 'text-white/90 hover:bg-white/10'
              }`}
            >
              🌸
            </button>
          </div>

          <div className="flex items-center gap-1 sm:gap-1.5">
            <button
              onClick={() => setShowDevicePanel(!showDevicePanel)}
              title="Toggle Device Panel"
              className={`rounded px-2 py-0.5 text-xs transition-colors sm:px-2.5 sm:py-1 ${
                showDevicePanel
                  ? 'bg-purple-500/20 text-purple-300 hover:bg-purple-500/30'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              📱
            </button>
            <a
              href="https://github.com/ShunsukeHayashi/Miyabi"
              target="_blank"
              rel="noopener noreferrer"
              title="GitHub Repository"
              className="rounded bg-white/10 px-2 py-0.5 text-xs text-white transition-colors hover:bg-white/20 sm:px-2.5 sm:py-1"
            >
              <span className="hidden sm:inline">GitHub</span>
              <span className="sm:hidden">GH</span>
            </a>
            <a
              href="https://shunsukehayashi.github.io/Miyabi/"
              target="_blank"
              rel="noopener noreferrer"
              title="Documentation"
              className="rounded bg-white/10 px-2 py-0.5 text-xs text-white transition-colors hover:bg-white/20 sm:px-2.5 sm:py-1"
            >
              Docs
            </a>
          </div>
        </div>
      </header>

      {/* Main content - Conditional rendering based on view mode */}
      <div className="flex flex-1 overflow-hidden">
        {/* Main Canvas */}
        <div className="flex-1 overflow-hidden">
          {viewMode === 'flow' && <FlowCanvas />}
          {viewMode === 'flow-mock' && <FlowCanvasMock />}
          {viewMode === 'er' && <ERView />}
          {viewMode === 'issue-dependencies' && <IssueDependencyView />}
          {viewMode === 'improvements' && (
            <div className="h-full overflow-y-auto bg-gradient-to-br from-slate-900 to-slate-800 p-4">
              <ImprovementsPanel />
            </div>
          )}
          {viewMode === 'session-graph' && <SessionGraphView />}
        </div>

        {/* Device Panel Sidebar */}
        {showDevicePanel && (
          <div className="w-80 border-l border-white/10 bg-gradient-to-br from-slate-900 to-slate-800">
            <DevicePanel />
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
