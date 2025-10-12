import { useMemo } from 'react';
import type { GraphNode } from '../types';

export interface SystemMetric {
  label: string;
  labelJa: string;
  value: string | number;
  icon: string;
  color: string;
  trend?: 'up' | 'down' | 'stable';
}

export interface SystemMetricsDashboardProps {
  nodes: GraphNode[];
  startTime: Date;
}

export function SystemMetricsDashboard({ nodes, startTime }: SystemMetricsDashboardProps) {
  const metrics = useMemo(() => {
    // Calculate system metrics
    const agentNodes = nodes.filter((n) => n.type === 'agent');
    const issueNodes = nodes.filter((n) => n.type === 'issue');

    const runningAgents = agentNodes.filter(
      (n) => (n.data as any).status === 'running'
    ).length;

    const totalTasks = issueNodes.length;
    const completedTasks = issueNodes.filter((n) =>
      (n.data as any).state?.includes('done')
    ).length;

    const successRate =
      totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    // Calculate uptime
    const uptime = Math.floor((Date.now() - startTime.getTime()) / 1000);
    const hours = Math.floor(uptime / 3600);
    const minutes = Math.floor((uptime % 3600) / 60);
    const seconds = uptime % 60;
    const uptimeStr = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

    // Calculate average task duration (mock for now)
    const avgDuration = completedTasks > 0 ? '2m 34s' : '---';

    const metricsData: SystemMetric[] = [
      {
        label: 'Uptime',
        labelJa: '稼働時間',
        value: uptimeStr,
        icon: '⏱️',
        color: '#3B82F6',
      },
      {
        label: 'Active Agents',
        labelJa: '実行中Agent',
        value: runningAgents,
        icon: '🤖',
        color: '#8B5CF6',
        trend: runningAgents > 0 ? 'up' : 'stable',
      },
      {
        label: 'Success Rate',
        labelJa: '成功率',
        value: `${successRate}%`,
        icon: '✅',
        color: successRate >= 80 ? '#10B981' : successRate >= 50 ? '#F59E0B' : '#EF4444',
        trend: successRate >= 80 ? 'up' : successRate >= 50 ? 'stable' : 'down',
      },
      {
        label: 'Tasks Completed',
        labelJa: '完了タスク',
        value: `${completedTasks}/${totalTasks}`,
        icon: '📊',
        color: '#6366F1',
      },
      {
        label: 'Avg Duration',
        labelJa: '平均処理時間',
        value: avgDuration,
        icon: '⚡',
        color: '#F59E0B',
      },
    ];

    return metricsData;
  }, [nodes, startTime]);

  return (
    <div className="fixed right-4 top-4 z-20 w-80">
      {/* Header */}
      <div className="rounded-t-xl bg-gradient-to-r from-blue-600 to-purple-600 p-3 shadow-lg">
        <div className="flex items-center gap-2">
          <span className="text-2xl">📊</span>
          <div>
            <h3 className="text-sm font-bold text-white">System Metrics</h3>
            <p className="text-xs text-blue-100">リアルタイムシステム状態</p>
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="rounded-b-xl bg-white/95 p-4 shadow-lg backdrop-blur-sm">
        <div className="space-y-3">
          {metrics.map((metric, index) => (
            <div
              key={index}
              className="flex items-center justify-between rounded-lg border border-gray-200 p-3 transition-all hover:border-gray-300 hover:shadow-md"
            >
              {/* Icon and Label */}
              <div className="flex items-center gap-3">
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-lg text-xl"
                  style={{ backgroundColor: `${metric.color}20` }}
                >
                  {metric.icon}
                </div>
                <div>
                  <p className="text-xs text-gray-500">{metric.labelJa}</p>
                  <p className="text-xs font-medium text-gray-600">{metric.label}</p>
                </div>
              </div>

              {/* Value and Trend */}
              <div className="flex items-center gap-2">
                <span
                  className="text-lg font-bold"
                  style={{ color: metric.color }}
                >
                  {metric.value}
                </span>
                {metric.trend && (
                  <span className="text-sm">
                    {metric.trend === 'up' && '📈'}
                    {metric.trend === 'down' && '📉'}
                    {metric.trend === 'stable' && '➡️'}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Live indicator */}
        <div className="mt-3 flex items-center justify-center gap-2 border-t border-gray-200 pt-3">
          <div className="h-2 w-2 animate-pulse rounded-full bg-green-500"></div>
          <span className="text-xs font-medium text-gray-600">Live Update</span>
        </div>
      </div>
    </div>
  );
}
