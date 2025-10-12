import { memo, useState } from 'react';
import { Handle, Position } from 'reactflow';
import type { IssueNodeData } from '../../types';

interface Props {
  data: IssueNodeData;
  // NEW: Add agent status data
  agentStatuses?: Record<string, { status: string; progress?: number }>;
}

export const IssueNode = memo(({ data, agentStatuses = {} }: Props) => {
  const [isHovered, setIsHovered] = useState(false);

  // Check if agent is assigned
  const hasAssignedAgent = data.assignedAgents && data.assignedAgents.length > 0;

  const getPriorityGradient = (priority?: string): string => {
    if (!priority) return 'linear-gradient(135deg, #9ca3af 0%, #d1d5db 100%)';
    if (priority.includes('P0')) return 'linear-gradient(135deg, #ef4444 0%, #f87171 50%, #fca5a5 100%)';
    if (priority.includes('P1')) return 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 50%, #fcd34d 100%)';
    if (priority.includes('P2')) return 'linear-gradient(135deg, #3b82f6 0%, #60a5fa 50%, #93c5fd 100%)';
    return 'linear-gradient(135deg, #10b981 0%, #34d399 50%, #6ee7b7 100%)';
  };

  const getPriorityGlow = (priority?: string): string => {
    // Reduced intensity for glow effects
    if (!priority) return '0 0 10px rgba(156, 163, 175, 0.2)';
    if (priority.includes('P0')) return '0 0 15px rgba(239, 68, 68, 0.3)';
    if (priority.includes('P1')) return '0 0 15px rgba(245, 158, 11, 0.3)';
    if (priority.includes('P2')) return '0 0 15px rgba(59, 130, 246, 0.3)';
    return '0 0 15px rgba(16, 185, 129, 0.3)';
  };

  const getPriorityEmoji = (priority?: string): string => {
    if (!priority) return '📋';
    if (priority.includes('P0')) return '🔥';
    if (priority.includes('P1')) return '⚡';
    if (priority.includes('P2')) return '💎';
    return '✨';
  };

  // NEW: Get agent icon and color
  const getAgentDisplay = (agentId: string): { icon: string; name: string; color: string } => {
    const displays: Record<string, { icon: string; name: string; color: string }> = {
      coordinator: { icon: '🎯', name: 'Coordinator', color: '#8B5CF6' },
      codegen: { icon: '💻', name: 'CodeGen', color: '#3B82F6' },
      review: { icon: '👀', name: 'Review', color: '#10B981' },
      pr: { icon: '🔀', name: 'PR', color: '#F59E0B' },
      deployment: { icon: '🚀', name: 'Deploy', color: '#EC4899' },
      test: { icon: '🧪', name: 'Test', color: '#6366F1' },
    };
    return displays[agentId] || { icon: '🤖', name: agentId, color: '#6B7280' };
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'running': return '#10B981';
      case 'completed': return '#22C55E';
      case 'error': return '#EF4444';
      default: return '#6B7280';
    }
  };

  return (
    <div
      className="relative min-w-[280px] transition-all duration-300"
      style={{
        filter: `drop-shadow(${getPriorityGlow(data.priority)})`,
        opacity: hasAssignedAgent ? 1 : 0.5,
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Handle
        type="target"
        position={Position.Left}
        className="!bg-gradient-to-r !from-blue-500 !to-cyan-500 !w-3 !h-3 !border-2 !border-white !shadow-md transition-all duration-200 hover:!scale-110"
      />

      {/* Main Card */}
      <div
        className="relative rounded-xl p-[2px] transition-all duration-300"
        style={{
          background: getPriorityGradient(data.priority),
          transform: isHovered ? 'scale(1.02) translateY(-2px)' : 'scale(1)',
        }}
      >
        <div className="relative rounded-xl bg-gradient-to-br from-white/95 via-gray-50/95 to-white/95 backdrop-blur-xl p-3 shadow-lg">
          {/* Content */}
          <div className="relative z-10">
            {/* Header */}
            <div className="flex items-start gap-2 mb-2">
              <div className="text-xl">
                {getPriorityEmoji(data.priority)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 mb-1">
                  <h3 className="text-sm font-bold text-gray-800">
                    #{data.number}
                  </h3>
                  {data.priority && (
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide bg-gray-800 text-white">
                      {data.priority.split(':')[1] || data.priority}
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-700 font-medium leading-snug line-clamp-2">
                  {data.title}
                </p>
              </div>
            </div>

            {/* Tags & Status */}
            <div className="flex flex-wrap gap-1 mt-2">
              {data.state && (
                <span className="px-2 py-0.5 rounded bg-indigo-100 text-indigo-700 text-[10px] font-semibold uppercase tracking-wide">
                  {data.state.includes(':') ? data.state.split(':')[1] : data.state}
                </span>
              )}
            </div>

            {/* Agent Badges - Compact design */}
            {data.assignedAgents && data.assignedAgents.length > 0 ? (
              <div className="mt-2 space-y-1">
                {data.assignedAgents.map((agentId) => {
                  const display = getAgentDisplay(agentId);
                  const agentStatus = agentStatuses[agentId] || { status: 'idle' };
                  const isWorking = agentStatus.status === 'running';
                  const progress = agentStatus.progress || 0;

                  return (
                    <div
                      key={agentId}
                      className="relative flex items-center gap-1 p-1 rounded transition-all duration-200"
                      style={{
                        background: isWorking
                          ? `linear-gradient(90deg, ${display.color}08 0%, ${display.color}03 100%)`
                          : 'linear-gradient(90deg, #f9fafb 0%, #f3f4f6 100%)',
                        border: isWorking ? `1px solid ${display.color}40` : '1px solid #e5e7eb',
                        boxShadow: isWorking ? `0 0 2px ${display.color}10` : 'none',
                      }}
                    >
                      {/* Agent Icon */}
                      <div
                        className="flex-shrink-0 text-sm"
                        style={{
                          filter: isWorking ? `drop-shadow(0 0 1px ${display.color}40)` : 'none',
                        }}
                      >
                        {display.icon}
                      </div>

                      {/* Agent Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <span className="text-[9px] font-semibold text-gray-600 truncate">
                            {display.name}
                          </span>
                          {isWorking && (
                            <span className="text-[9px] font-bold" style={{ color: display.color }}>
                              {progress}%
                            </span>
                          )}
                        </div>

                        {/* Progress Bar */}
                        {isWorking && (
                          <div className="mt-0.5 h-0.5 w-full rounded-full bg-gray-200 overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all duration-300"
                              style={{
                                width: `${progress}%`,
                                background: `linear-gradient(90deg, ${display.color}, ${display.color}dd)`,
                                boxShadow: `0 0 1px ${display.color}20`,
                              }}
                            />
                          </div>
                        )}
                      </div>

                      {/* Status Indicator */}
                      <div
                        className="flex-shrink-0 w-1 h-1 rounded-full"
                        style={{
                          backgroundColor: getStatusColor(agentStatus.status),
                          boxShadow: isWorking ? `0 0 1px ${getStatusColor(agentStatus.status)}30` : 'none',
                        }}
                      />
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="mt-2">
                <div className="relative flex items-center gap-1 p-1 rounded bg-gray-100 border border-gray-300">
                  <div className="flex-shrink-0 text-sm">⚪</div>
                  <div className="flex-1 min-w-0">
                    <span className="text-[9px] font-semibold text-gray-500">未割り当て (Backlog)</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <Handle
        type="source"
        position={Position.Right}
        className="!bg-gradient-to-r !from-blue-500 !to-cyan-500 !w-3 !h-3 !border-2 !border-white !shadow-md transition-all duration-200 hover:!scale-110"
      />
    </div>
  );
});

IssueNode.displayName = 'IssueNode';
