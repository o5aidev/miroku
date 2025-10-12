import { useMemo } from 'react';
import type { GraphNode } from '../types';
import type { ActivityLogEntry } from './ActivityLog';

export interface NodeDetailsModalProps {
  node: GraphNode | null;
  onClose: () => void;
  activities?: ActivityLogEntry[];
}

interface EventHistoryEntry {
  timestamp: string;
  type: string;
  message: string;
  icon: string;
  color?: string;
}

export function NodeDetailsModal({ node, onClose, activities = [] }: NodeDetailsModalProps) {
  // Filter activities related to this node
  const eventHistory = useMemo(() => {
    if (!node) return [];

    const nodeData = node.data as any;
    const filtered: EventHistoryEntry[] = [];

    // Filter activities related to this node
    activities.forEach((activity) => {
      let isRelated = false;

      if (node.type === 'agent') {
        // Agent-related events
        if (
          activity.message.includes(nodeData.agentId) ||
          activity.message.includes(nodeData.name) ||
          activity.type === 'agent:started' ||
          activity.type === 'agent:progress' ||
          activity.type === 'agent:completed' ||
          activity.type === 'agent:error'
        ) {
          isRelated = true;
        }
      } else if (node.type === 'issue') {
        // Issue-related events
        if (
          activity.message.includes(`#${nodeData.number}`) ||
          activity.message.includes(`Issue ${nodeData.number}`)
        ) {
          isRelated = true;
        }
      } else if (node.type === 'state') {
        // State-related events
        if (
          activity.type === 'state:transition' ||
          activity.message.includes(nodeData.label) ||
          activity.message.includes(nodeData.name)
        ) {
          isRelated = true;
        }
      }

      if (isRelated) {
        filtered.push({
          timestamp: activity.timestamp,
          type: activity.type,
          message: activity.message,
          icon: activity.icon,
          color: activity.color,
        });
      }
    });

    // Always add initial creation event if no events found
    if (filtered.length === 0) {
      if (node.type === 'agent') {
        filtered.push({
          timestamp: new Date().toISOString(),
          type: 'agent:initialized',
          message: `${nodeData.name || nodeData.agentId} initialized and ready`,
          icon: '🔧',
          color: '#6366F1',
        });
      } else if (node.type === 'issue') {
        filtered.push({
          timestamp: new Date().toISOString(),
          type: 'issue:loaded',
          message: `Issue #${nodeData.number}: ${nodeData.title}`,
          icon: '📋',
          color: '#3B82F6',
        });
      }
    }

    return filtered;
  }, [node, activities]);

  if (!node) return null;

  const nodeData = node.data as any;

  // Get node type specific details
  const getNodeIcon = () => {
    if (node.type === 'agent') return '🤖';
    if (node.type === 'issue') return '📋';
    if (node.type === 'state') return '🔵';
    return '❓';
  };

  const getNodeTitle = () => {
    if (node.type === 'agent') return `${nodeData.name || nodeData.agentId}`;
    if (node.type === 'issue') return `Issue #${nodeData.number}`;
    if (node.type === 'state') return nodeData.name || 'State Node';
    return 'Unknown Node';
  };

  const getStatusBadge = () => {
    if (node.type === 'agent') {
      const status = nodeData.status || 'idle';
      const colors: Record<string, { bg: string; text: string; border: string }> = {
        idle: { bg: 'bg-gray-100', text: 'text-gray-700', border: 'border-gray-300' },
        running: { bg: 'bg-purple-500', text: 'text-white', border: 'border-purple-600' },
        completed: { bg: 'bg-green-500', text: 'text-white', border: 'border-green-600' },
        error: { bg: 'bg-red-500', text: 'text-white', border: 'border-red-600' },
      };
      const colorSet = colors[status];
      const isActive = status === 'running';

      return (
        <span
          className={`${colorSet.bg} ${colorSet.text} ${colorSet.border} rounded-full border-2 px-4 py-1.5 text-xs font-bold shadow-lg ${
            isActive ? 'animate-pulse' : ''
          }`}
        >
          {isActive && '🔥 '}
          {status.toUpperCase()}
          {isActive && ` ${nodeData.progress || 0}%`}
        </span>
      );
    } else if (node.type === 'issue') {
      const state = nodeData.state;
      if (state) {
        const isPending = state.includes('pending');
        const isDone = state.includes('done');
        const isInProgress = !isPending && !isDone;

        return (
          <span
            className={`rounded-full border-2 px-4 py-1.5 text-xs font-bold shadow-lg ${
              isDone
                ? 'bg-green-100 text-green-700 border-green-300'
                : isInProgress
                ? 'bg-blue-100 text-blue-700 border-blue-300 animate-pulse'
                : 'bg-gray-100 text-gray-700 border-gray-300'
            }`}
          >
            {state}
          </span>
        );
      }
    }
    return null;
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed left-1/2 top-1/2 z-50 w-full max-w-2xl -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between rounded-t-2xl bg-gradient-to-r from-purple-600 to-blue-600 p-6">
          <div className="flex items-center gap-3">
            <div className="text-4xl">{getNodeIcon()}</div>
            <div>
              <h2 className="text-2xl font-bold text-white">{getNodeTitle()}</h2>
              <p className="text-sm text-purple-100">
                {node.type === 'issue' && nodeData.title}
                {node.type === 'agent' && `Specialist Agent - ${nodeData.agentId}`}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {getStatusBadge()}
            <button
              onClick={onClose}
              className="rounded-full bg-white/20 p-2 text-white transition-colors hover:bg-white/30"
            >
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="max-h-[70vh] overflow-y-auto p-6">
          {/* Basic Info */}
          <div className="mb-6 rounded-lg bg-gray-50 p-4">
            <h3 className="mb-3 text-sm font-bold text-gray-700">基本情報</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-500">Node ID</p>
                <p className="font-mono text-sm text-gray-900">{node.id}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Type</p>
                <p className="font-mono text-sm text-gray-900">{node.type}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Position</p>
                <p className="font-mono text-sm text-gray-900">
                  ({Math.round(node.position.x)}, {Math.round(node.position.y)})
                </p>
              </div>
            </div>
          </div>

          {/* Agent-specific info */}
          {node.type === 'agent' && (
            <div className={`mb-6 rounded-lg p-4 border-2 ${
              nodeData.status === 'running'
                ? 'bg-purple-50 border-purple-300 shadow-lg'
                : nodeData.status === 'completed'
                ? 'bg-green-50 border-green-300'
                : nodeData.status === 'error'
                ? 'bg-red-50 border-red-300'
                : 'bg-gray-50 border-gray-200'
            }`}>
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-sm font-bold text-purple-900">Agent 詳細</h3>
                {nodeData.status === 'running' && (
                  <span className="flex items-center gap-1 text-xs font-semibold text-purple-600 animate-pulse">
                    <span className="inline-block h-2 w-2 rounded-full bg-purple-600"></span>
                    ACTIVE
                  </span>
                )}
              </div>
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-purple-700">Agent ID</p>
                  <p className="font-mono text-sm text-purple-900">{nodeData.agentId}</p>
                </div>
                <div>
                  <p className="text-xs text-purple-700">Status</p>
                  <p className="font-mono text-sm text-purple-900 font-bold">
                    {(nodeData.status || 'idle').toUpperCase()}
                  </p>
                </div>
                {nodeData.currentIssue && (
                  <div className="rounded-lg bg-purple-100 p-3 border-2 border-purple-300">
                    <p className="text-xs text-purple-700 font-semibold mb-1">🎯 Current Task</p>
                    <p className="font-mono text-sm text-purple-900 font-bold">
                      Issue #{nodeData.currentIssue}
                    </p>
                  </div>
                )}
                {nodeData.progress !== undefined && nodeData.status === 'running' && (
                  <div className="rounded-lg bg-white p-3 border-2 border-purple-200">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs text-purple-700 font-semibold">📊 Progress</p>
                      <p className="text-sm font-bold text-purple-900">{nodeData.progress}%</p>
                    </div>
                    <div className="h-3 w-full rounded-full bg-purple-200 overflow-hidden">
                      <div
                        className="h-3 rounded-full bg-gradient-to-r from-purple-500 to-purple-600 transition-all duration-500 ease-out"
                        style={{ width: `${nodeData.progress}%` }}
                      />
                    </div>
                  </div>
                )}
                {nodeData.parameters && Object.keys(nodeData.parameters).length > 0 && (
                  <div>
                    <p className="mb-2 text-xs text-purple-700 font-semibold">⚙️ Parameters</p>
                    <pre className="max-h-32 overflow-auto rounded bg-purple-900 p-3 text-xs text-purple-50 font-mono">
                      {JSON.stringify(nodeData.parameters, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Issue-specific info */}
          {node.type === 'issue' && (
            <div className="mb-6 rounded-lg bg-blue-50 p-4 border-2 border-blue-200">
              <h3 className="mb-3 text-sm font-bold text-blue-900">Issue 詳細</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-blue-700">Number</p>
                  <p className="font-mono text-sm text-blue-900">#{nodeData.number}</p>
                </div>
                <div>
                  <p className="text-xs text-blue-700">Title</p>
                  <p className="text-sm text-blue-900 font-semibold">{nodeData.title}</p>
                </div>
                {nodeData.state && (
                  <div>
                    <p className="text-xs text-blue-700">State</p>
                    <p className="font-mono text-sm text-blue-900 font-bold">{nodeData.state}</p>
                  </div>
                )}
                {nodeData.priority && (
                  <div>
                    <p className="text-xs text-blue-700">Priority</p>
                    <p className="font-mono text-sm text-blue-900 font-bold">{nodeData.priority}</p>
                  </div>
                )}
                {nodeData.assignedAgents && nodeData.assignedAgents.length > 0 && (
                  <div className="rounded-lg bg-blue-100 p-3 border-2 border-blue-300">
                    <p className="text-xs text-blue-700 font-semibold mb-2">🤖 Assigned Agents</p>
                    <div className="flex flex-wrap gap-2">
                      {nodeData.assignedAgents.map((agent: string, idx: number) => (
                        <span
                          key={idx}
                          className="rounded-full bg-blue-600 px-3 py-1 text-xs font-semibold text-white"
                        >
                          {agent}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {nodeData.url && (
                  <div>
                    <a
                      href={nodeData.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
                    >
                      <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                      </svg>
                      View on GitHub
                    </a>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Event History - Real-time updates */}
          <div className="rounded-lg bg-gray-50 p-4">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-bold text-gray-700">イベント履歴</h3>
              <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-semibold text-blue-700">
                {eventHistory.length} events
              </span>
            </div>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {eventHistory.length === 0 ? (
                <p className="text-sm text-gray-500">No events recorded yet</p>
              ) : (
                eventHistory.map((event, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-3 rounded border border-gray-200 bg-white p-3 transition-all hover:shadow-md"
                    style={{ borderLeftWidth: '4px', borderLeftColor: event.color || '#6B7280' }}
                  >
                    <span className="text-xl">{event.icon}</span>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{event.message}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(event.timestamp).toLocaleString('ja-JP', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                          second: '2-digit',
                        })}
                      </p>
                    </div>
                    <span
                      className="rounded-full px-2 py-1 text-xs font-semibold"
                      style={{
                        backgroundColor: `${event.color}20` || '#F3F4F6',
                        color: event.color || '#6B7280'
                      }}
                    >
                      {event.type}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 rounded-b-2xl border-t border-gray-200 bg-gray-50 p-4">
          <button
            onClick={onClose}
            className="rounded-lg bg-gray-200 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-300"
          >
            閉じる
          </button>
        </div>
      </div>
    </>
  );
}
