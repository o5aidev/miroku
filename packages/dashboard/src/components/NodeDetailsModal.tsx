import { useEffect, useState } from 'react';
import type { GraphNode } from '../types';

export interface NodeDetailsModalProps {
  node: GraphNode | null;
  onClose: () => void;
}

interface EventHistoryEntry {
  timestamp: string;
  type: string;
  message: string;
  icon: string;
}

export function NodeDetailsModal({ node, onClose }: NodeDetailsModalProps) {
  const [eventHistory, setEventHistory] = useState<EventHistoryEntry[]>([]);

  useEffect(() => {
    if (!node) return;

    // Generate mock event history based on node type and data
    const history: EventHistoryEntry[] = [];

    if (node.type === 'agent') {
      const agentData = node.data as any;
      history.push({
        timestamp: new Date().toISOString(),
        type: 'agent:created',
        message: `Agent ${agentData.agentId} initialized`,
        icon: '🔧',
      });

      if (agentData.status === 'running') {
        history.push({
          timestamp: new Date().toISOString(),
          type: 'agent:started',
          message: `Started working on Issue #${agentData.currentIssue}`,
          icon: '🚀',
        });
      }

      if (agentData.status === 'completed') {
        history.push({
          timestamp: new Date().toISOString(),
          type: 'agent:completed',
          message: `Task completed successfully`,
          icon: '✅',
        });
      }
    } else if (node.type === 'issue') {
      const issueData = node.data as any;
      history.push({
        timestamp: new Date().toISOString(),
        type: 'issue:created',
        message: `Issue #${issueData.number} created: ${issueData.title}`,
        icon: '📝',
      });

      if (issueData.state) {
        history.push({
          timestamp: new Date().toISOString(),
          type: 'state:transition',
          message: `State changed to: ${issueData.state}`,
          icon: '🔄',
        });
      }
    }

    setEventHistory(history.reverse());
  }, [node]);

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
      const colors: Record<string, string> = {
        idle: 'bg-gray-500',
        running: 'bg-purple-500',
        completed: 'bg-green-500',
        error: 'bg-red-500',
      };
      return (
        <span
          className={`${colors[status]} rounded-full px-3 py-1 text-xs font-bold text-white`}
        >
          {status.toUpperCase()}
        </span>
      );
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
            <div className="mb-6 rounded-lg bg-purple-50 p-4">
              <h3 className="mb-3 text-sm font-bold text-purple-900">Agent 詳細</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-purple-700">Agent ID</p>
                  <p className="font-mono text-sm text-purple-900">{nodeData.agentId}</p>
                </div>
                {nodeData.currentIssue && (
                  <div>
                    <p className="text-xs text-purple-700">Current Issue</p>
                    <p className="font-mono text-sm text-purple-900">#{nodeData.currentIssue}</p>
                  </div>
                )}
                {nodeData.progress !== undefined && (
                  <div>
                    <p className="text-xs text-purple-700">Progress</p>
                    <div className="mt-1 h-2 w-full rounded-full bg-purple-200">
                      <div
                        className="h-2 rounded-full bg-purple-600 transition-all duration-300"
                        style={{ width: `${nodeData.progress}%` }}
                      />
                    </div>
                    <p className="mt-1 text-right text-xs text-purple-700">{nodeData.progress}%</p>
                  </div>
                )}
                {nodeData.parameters && Object.keys(nodeData.parameters).length > 0 && (
                  <div>
                    <p className="mb-2 text-xs text-purple-700">Parameters</p>
                    <pre className="max-h-32 overflow-auto rounded bg-purple-900 p-2 text-xs text-purple-50">
                      {JSON.stringify(nodeData.parameters, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Issue-specific info */}
          {node.type === 'issue' && (
            <div className="mb-6 rounded-lg bg-blue-50 p-4">
              <h3 className="mb-3 text-sm font-bold text-blue-900">Issue 詳細</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-blue-700">Number</p>
                  <p className="font-mono text-sm text-blue-900">#{nodeData.number}</p>
                </div>
                <div>
                  <p className="text-xs text-blue-700">Title</p>
                  <p className="text-sm text-blue-900">{nodeData.title}</p>
                </div>
                {nodeData.state && (
                  <div>
                    <p className="text-xs text-blue-700">State</p>
                    <p className="font-mono text-sm text-blue-900">{nodeData.state}</p>
                  </div>
                )}
                {nodeData.priority && (
                  <div>
                    <p className="text-xs text-blue-700">Priority</p>
                    <p className="font-mono text-sm text-blue-900">{nodeData.priority}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Event History */}
          <div className="rounded-lg bg-gray-50 p-4">
            <h3 className="mb-3 text-sm font-bold text-gray-700">イベント履歴</h3>
            <div className="space-y-2">
              {eventHistory.length === 0 ? (
                <p className="text-sm text-gray-500">No events recorded yet</p>
              ) : (
                eventHistory.map((event, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-3 rounded border border-gray-200 bg-white p-3"
                  >
                    <span className="text-xl">{event.icon}</span>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{event.message}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(event.timestamp).toLocaleString('ja-JP')}
                      </p>
                    </div>
                    <span className="rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-600">
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
