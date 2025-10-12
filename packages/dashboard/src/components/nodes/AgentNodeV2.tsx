import { memo, useState } from 'react';
import { Handle, Position } from 'reactflow';
import type { AgentNodeData } from '../../types';
import { AGENT_CONFIGS } from '../../types';

interface Props {
  data: AgentNodeData;
}

export const AgentNode = memo(({ data }: Props) => {
  const config = AGENT_CONFIGS[data.agentId as keyof typeof AGENT_CONFIGS];
  const [showParams, setShowParams] = useState(false);

  const getGlowColor = () => {
    switch (data.status) {
      case 'running': return '0 0 30px rgba(34, 197, 94, 0.6), 0 0 60px rgba(34, 197, 94, 0.3)';
      case 'completed': return '0 0 30px rgba(16, 185, 129, 0.6)';
      case 'error': return '0 0 30px rgba(239, 68, 68, 0.6)';
      default: return 'none';
    }
  };

  const getBackgroundGradient = () => {
    switch (data.status) {
      case 'running':
        return 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
      case 'completed':
        return 'linear-gradient(135deg, #10b981 0%, #059669 100%)';
      case 'error':
        return 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)';
      default:
        return 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)';
    }
  };

  return (
    <div className="relative min-w-[280px]" style={{ filter: `drop-shadow(${getGlowColor()})` }}>
      <Handle
        type="target"
        position={Position.Left}
        className="!bg-purple-600 !w-4 !h-4 !border-4 !border-white"
      />

      {/* Main Card */}
      <div
        className="relative overflow-hidden rounded-3xl p-[3px] transition-all duration-500"
        style={{
          background: getBackgroundGradient(),
          transform: data.status === 'running' ? 'scale(1.05)' : 'scale(1)',
        }}
      >
        {/* Glassmorphism effect */}
        <div className="relative rounded-3xl bg-gray-900/90 backdrop-blur-xl p-6">
          {/* Animated background particles for running state */}
          {data.status === 'running' && (
            <div className="absolute inset-0 overflow-hidden rounded-3xl">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-pulse" />
            </div>
          )}

          {/* Content */}
          <div className="relative z-10">
            {/* Header with Icon and Status */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="text-5xl">{config?.emoji || '🤖'}</div>
                <div>
                  <h3 className="text-lg font-bold text-white">{data.name}</h3>
                  <p className="text-xs text-gray-400">{config?.description}</p>
                </div>
              </div>
            </div>

            {/* Status Badge with Animation */}
            <div className="flex items-center gap-2 mb-3">
              {data.status === 'running' && (
                <>
                  <div className="relative">
                    <div className="h-3 w-3 rounded-full bg-green-500 animate-ping absolute" />
                    <div className="h-3 w-3 rounded-full bg-green-500 relative" />
                  </div>
                  <span className="text-sm font-semibold text-green-400">RUNNING</span>
                </>
              )}
              {data.status === 'idle' && (
                <span className="text-sm font-medium text-gray-400">● IDLE</span>
              )}
              {data.status === 'completed' && (
                <span className="text-sm font-semibold text-emerald-400">✓ COMPLETED</span>
              )}
              {data.status === 'error' && (
                <span className="text-sm font-semibold text-red-400">✗ ERROR</span>
              )}
            </div>

            {/* Current Issue */}
            {data.currentIssue && (
              <div className="mb-3 rounded-xl bg-white/5 border border-white/10 px-3 py-2">
                <div className="text-xs text-gray-400 mb-1">Current Task</div>
                <div className="text-sm font-mono text-white">Issue #{data.currentIssue}</div>
              </div>
            )}

            {/* Progress Bar */}
            {data.status === 'running' && (
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-gray-400">Progress</span>
                  <span className="text-xs font-bold text-white">{data.progress}%</span>
                </div>
                <div className="h-3 rounded-full bg-gray-800 overflow-hidden relative">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-green-400 to-blue-500 transition-all duration-1000 ease-out relative"
                    style={{ width: `${data.progress}%` }}
                  >
                    {/* Shimmer effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse" />
                  </div>
                </div>
              </div>
            )}

            {/* Parameters */}
            {data.parameters && Object.keys(data.parameters).length > 0 && (
              <div className="mt-4">
                <button
                  onClick={() => setShowParams(!showParams)}
                  className="w-full flex items-center justify-between rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 px-3 py-2 transition-all"
                >
                  <span className="text-xs font-semibold text-gray-300">
                    {showParams ? '▼' : '▶'} PARAMETERS
                  </span>
                  <span className="text-xs text-gray-500">
                    {Object.keys(data.parameters).length} items
                  </span>
                </button>

                {showParams && (
                  <div className="mt-2 space-y-2 max-h-48 overflow-y-auto rounded-lg bg-black/30 p-3">
                    {Object.entries(data.parameters).map(([key, value]) => (
                      <div key={key} className="border-l-2 border-purple-500 pl-3">
                        <div className="text-xs font-mono font-bold text-purple-300">{key}</div>
                        <div className="text-xs font-mono text-gray-400 mt-1 break-words">
                          {typeof value === 'object'
                            ? JSON.stringify(value)
                            : String(value)}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <Handle
        type="source"
        position={Position.Right}
        className="!bg-purple-600 !w-4 !h-4 !border-4 !border-white"
      />
    </div>
  );
});

AgentNode.displayName = 'AgentNode';
