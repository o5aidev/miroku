import { useMemo } from 'react';
import type { GraphNode, IssueNodeData, AgentNodeData, StateNodeData } from '../types';
import { AGENT_CONFIGS } from '../types';

interface SidebarProps {
  selectedNode: GraphNode | null;
  onClose: () => void;
}

export function Sidebar({ selectedNode, onClose }: SidebarProps) {
  const content = useMemo(() => {
    if (!selectedNode) return null;

    switch (selectedNode.type) {
      case 'issue': {
        const data = selectedNode.data as IssueNodeData;
        return (
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <span className="text-4xl">📋</span>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Issue #{data.number}</h2>
                <p className="mt-1 text-sm text-gray-600">{data.title}</p>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <h3 className="text-xs font-semibold uppercase text-gray-500">Status</h3>
                <p className="mt-1 rounded bg-gray-100 px-2 py-1 text-sm font-medium">
                  {data.state || 'Unknown'}
                </p>
              </div>

              {data.priority && (
                <div>
                  <h3 className="text-xs font-semibold uppercase text-gray-500">Priority</h3>
                  <p className="mt-1 rounded bg-orange-100 px-2 py-1 text-sm font-medium text-orange-800">
                    {data.priority}
                  </p>
                </div>
              )}

              {data.severity && (
                <div>
                  <h3 className="text-xs font-semibold uppercase text-gray-500">Severity</h3>
                  <p className="mt-1 rounded bg-red-100 px-2 py-1 text-sm font-medium text-red-800">
                    {data.severity}
                  </p>
                </div>
              )}

              {data.assignedAgents.length > 0 && (
                <div>
                  <h3 className="text-xs font-semibold uppercase text-gray-500">
                    Assigned Agents ({data.assignedAgents.length})
                  </h3>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {data.assignedAgents.map((agentId) => {
                      const config =
                        AGENT_CONFIGS[agentId as keyof typeof AGENT_CONFIGS];
                      return (
                        <span
                          key={agentId}
                          className="flex items-center gap-1 rounded bg-purple-100 px-2 py-1 text-xs font-medium text-purple-800"
                        >
                          {config?.emoji || '🤖'} {config?.name || agentId}
                        </span>
                      );
                    })}
                  </div>
                </div>
              )}

              {data.labels && data.labels.length > 0 && (
                <div>
                  <h3 className="text-xs font-semibold uppercase text-gray-500">
                    Labels ({data.labels.length})
                  </h3>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {data.labels.map((label) => (
                      <span
                        key={label}
                        className="rounded bg-blue-100 px-2 py-1 text-xs text-blue-800"
                      >
                        {label}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <a
                  href={data.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded bg-blue-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-600"
                >
                  <span>View on GitHub</span>
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                    />
                  </svg>
                </a>
              </div>
            </div>
          </div>
        );
      }

      case 'agent': {
        const data = selectedNode.data as AgentNodeData;
        const config = AGENT_CONFIGS[data.agentId as keyof typeof AGENT_CONFIGS];
        return (
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <span className="text-4xl">{config?.emoji || '🤖'}</span>
              <div>
                <h2 className="text-xl font-bold text-gray-900">{data.name}</h2>
                <p className="mt-1 text-sm text-gray-600">{config?.description}</p>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <h3 className="text-xs font-semibold uppercase text-gray-500">Status</h3>
                <div className="mt-1">
                  {data.status === 'running' && (
                    <span className="flex items-center gap-2 rounded bg-green-100 px-3 py-1.5 text-sm font-semibold text-green-800">
                      <span className="h-2 w-2 animate-pulse rounded-full bg-green-600"></span>
                      Running
                    </span>
                  )}
                  {data.status === 'idle' && (
                    <span className="rounded bg-gray-100 px-3 py-1.5 text-sm font-semibold text-gray-800">
                      Idle
                    </span>
                  )}
                  {data.status === 'error' && (
                    <span className="rounded bg-red-100 px-3 py-1.5 text-sm font-semibold text-red-800">
                      Error
                    </span>
                  )}
                  {data.status === 'completed' && (
                    <span className="rounded bg-emerald-100 px-3 py-1.5 text-sm font-semibold text-emerald-800">
                      ✓ Completed
                    </span>
                  )}
                </div>
              </div>

              {data.currentIssue && (
                <div>
                  <h3 className="text-xs font-semibold uppercase text-gray-500">
                    Current Issue
                  </h3>
                  <p className="mt-1 rounded bg-blue-100 px-2 py-1 text-sm font-medium text-blue-800">
                    #{data.currentIssue}
                  </p>
                </div>
              )}

              {data.status === 'running' && (
                <div>
                  <h3 className="text-xs font-semibold uppercase text-gray-500">Progress</h3>
                  <div className="mt-2">
                    <div className="h-3 w-full rounded-full bg-gray-200">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500"
                        style={{ width: `${data.progress}%` }}
                      />
                    </div>
                    <p className="mt-1 text-right text-sm font-semibold text-gray-700">
                      {data.progress}%
                    </p>
                  </div>
                </div>
              )}

              {data.lastActivity && (
                <div>
                  <h3 className="text-xs font-semibold uppercase text-gray-500">
                    Last Activity
                  </h3>
                  <p className="mt-1 text-sm text-gray-600">{data.lastActivity}</p>
                </div>
              )}
            </div>
          </div>
        );
      }

      case 'state': {
        const data = selectedNode.data as StateNodeData;
        return (
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <span className="text-4xl">{data.emoji}</span>
              <div>
                <h2 className="text-xl font-bold text-gray-900">{data.label}</h2>
                <p className="mt-1 text-sm text-gray-600">{data.description}</p>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <h3 className="text-xs font-semibold uppercase text-gray-500">
                  Issues in this state
                </h3>
                <p
                  className="mt-1 inline-block rounded-full px-4 py-2 text-2xl font-bold text-white"
                  style={{ backgroundColor: data.color }}
                >
                  {data.count}
                </p>
              </div>
            </div>
          </div>
        );
      }

      default:
        return null;
    }
  }, [selectedNode]);

  if (!selectedNode) return null;

  return (
    <div className="absolute right-0 top-0 z-20 h-full w-80 border-l border-gray-200 bg-white shadow-2xl">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-200 p-4">
        <h3 className="text-sm font-semibold uppercase text-gray-500">Details</h3>
        <button
          onClick={onClose}
          className="rounded p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
          aria-label="Close sidebar"
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>

      {/* Content */}
      <div className="overflow-y-auto p-4" style={{ height: 'calc(100% - 60px)' }}>
        {content}
      </div>
    </div>
  );
}
