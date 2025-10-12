import { useMemo } from 'react';
import type { GraphNode } from '../types';

interface StatsPanelProps {
  nodes: GraphNode[];
}

interface StatCard {
  label: string;
  value: number | string;
  icon: string;
  color: string;
  bgColor: string;
}

export function StatsPanel({ nodes }: StatsPanelProps) {
  const stats = useMemo(() => {
    const issueNodes = nodes.filter((n) => n.type === 'issue');
    const agentNodes = nodes.filter((n) => n.type === 'agent');
    const stateNodes = nodes.filter((n) => n.type === 'state');

    // Count issues by state
    const issuesByState: Record<string, number> = {};
    issueNodes.forEach((node) => {
      const data = node.data as any;
      const state = data.state || 'unknown';
      issuesByState[state] = (issuesByState[state] || 0) + 1;
    });

    // Count agents by status
    const runningAgents = agentNodes.filter((n) => (n.data as any).status === 'running').length;
    const idleAgents = agentNodes.filter((n) => (n.data as any).status === 'idle').length;
    const errorAgents = agentNodes.filter((n) => (n.data as any).status === 'error').length;

    // Count by priority
    const p0Issues = issueNodes.filter((n) => (n.data as any).priority?.includes('P0')).length;
    const p1Issues = issueNodes.filter((n) => (n.data as any).priority?.includes('P1')).length;

    // Count completed issues
    const completedIssues = issueNodes.filter((n) => {
      const data = n.data as any;
      return data.state?.includes('done') || data.state?.includes('completed');
    }).length;

    const statCards: StatCard[] = [
      {
        label: 'Total Issues',
        value: issueNodes.length,
        icon: '📋',
        color: '#3B82F6',
        bgColor: '#EFF6FF',
      },
      {
        label: 'Running Agents',
        value: runningAgents,
        icon: '🤖',
        color: '#10B981',
        bgColor: '#D1FAE5',
      },
      {
        label: 'Completed',
        value: completedIssues,
        icon: '✅',
        color: '#22C55E',
        bgColor: '#DCFCE7',
      },
      {
        label: 'Critical (P0/P1)',
        value: p0Issues + p1Issues,
        icon: '🔥',
        color: '#EF4444',
        bgColor: '#FEE2E2',
      },
      {
        label: 'Idle Agents',
        value: idleAgents,
        icon: '💤',
        color: '#6B7280',
        bgColor: '#F3F4F6',
      },
      {
        label: 'Errors',
        value: errorAgents,
        icon: '⚠️',
        color: '#F59E0B',
        bgColor: '#FEF3C7',
      },
    ];

    return {
      cards: statCards,
      issuesByState,
      totalAgents: agentNodes.length,
      totalStates: stateNodes.length,
    };
  }, [nodes]);

  return (
    <div className="border-b border-white/10 px-2 py-1.5 backdrop-blur-lg bg-gray-900/80">
      <div className="grid grid-cols-3 gap-1.5 md:grid-cols-6">
        {stats.cards.map((card) => (
          <div
            key={card.label}
            className="relative rounded p-[1px]"
            style={{
              background: `linear-gradient(135deg, ${card.color}40, ${card.color}20)`,
            }}
          >
            <div className="relative rounded bg-gray-900/90 px-2 py-1">
              <div className="flex items-center gap-1.5">
                <div className="text-sm" style={{ filter: `drop-shadow(0 0 2px ${card.color}40)` }}>
                  {card.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[9px] font-semibold uppercase tracking-wide text-gray-400 truncate">{card.label}</p>
                  <p className="text-base font-bold" style={{ color: card.color }}>
                    {card.value}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
