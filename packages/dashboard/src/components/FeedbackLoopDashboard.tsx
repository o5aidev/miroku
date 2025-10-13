/**
 * FeedbackLoopDashboard - Real-time Feedback Loop Visualization
 *
 * Displays:
 * - Loop status and iterations
 * - Quality score trends
 * - Convergence metrics
 * - Worktree status
 * - Parallel execution progress
 */

import React, { useState, useEffect } from 'react';
import type { FeedbackLoop, IterationRecord, WorktreeInfo, ExecutionProgress } from '../../../../agents/types/index';

interface FeedbackLoopData {
  loops: FeedbackLoop[];
  worktrees: WorktreeInfo[];
  progress: ExecutionProgress;
}

interface FeedbackLoopDashboardProps {
  refreshInterval?: number; // milliseconds
}

export const FeedbackLoopDashboard: React.FC<FeedbackLoopDashboardProps> = ({
  refreshInterval = 5000,
}) => {
  const [data, setData] = useState<FeedbackLoopData | null>(null);
  const [selectedLoop, setSelectedLoop] = useState<FeedbackLoop | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch data from backend API
  const fetchData = async () => {
    try {
      const response = await fetch('/api/feedback-loops');
      if (!response.ok) throw new Error('Failed to fetch data');

      const jsonData = await response.json();
      setData(jsonData);
      setError(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Polling effect
  useEffect(() => {
    fetchData();

    const interval = setInterval(fetchData, refreshInterval);

    return () => clearInterval(interval);
  }, [refreshInterval]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900">
        <div className="text-white text-xl">Loading Feedback Loop Dashboard...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900">
        <div className="text-red-500 text-xl">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="container mx-auto">
        <header className="mb-8">
          <h1 className="text-4xl font-bold mb-2">🔄 Feedback Loop Dashboard</h1>
          <p className="text-gray-400">Real-time monitoring of Goal-Oriented TDD + Consumption-Driven + Infinite Feedback Loop</p>
        </header>

        {/* Execution Progress */}
        {data?.progress && <ExecutionProgressPanel progress={data.progress} />}

        {/* Worktree Status */}
        {data?.worktrees && <WorktreeStatusPanel worktrees={data.worktrees} />}

        {/* Active Loops */}
        {data?.loops && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {data.loops.map((loop) => (
              <LoopCard
                key={loop.loopId}
                loop={loop}
                onClick={() => setSelectedLoop(loop)}
              />
            ))}
          </div>
        )}

        {/* Loop Details Modal */}
        {selectedLoop && (
          <LoopDetailsModal
            loop={selectedLoop}
            onClose={() => setSelectedLoop(null)}
          />
        )}
      </div>
    </div>
  );
};

// ExecutionProgressPanel Component
const ExecutionProgressPanel: React.FC<{ progress: ExecutionProgress }> = ({ progress }) => {
  const statusColors = {
    completed: 'bg-green-500',
    running: 'bg-blue-500',
    pending: 'bg-gray-500',
    failed: 'bg-red-500',
    timeout: 'bg-yellow-500',
  };

  return (
    <div className="bg-gray-800 rounded-lg p-6 mb-6">
      <h2 className="text-2xl font-bold mb-4">📊 Execution Progress</h2>

      <div className="mb-4">
        <div className="flex justify-between text-sm mb-2">
          <span>Progress</span>
          <span>{progress.percentage.toFixed(1)}%</span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-4">
          <div
            className="bg-blue-500 h-4 rounded-full transition-all duration-300"
            style={{ width: `${progress.percentage}%` }}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <StatCard label="Total" value={progress.total} color="bg-gray-700" />
        <StatCard label="Completed" value={progress.completed} color={statusColors.completed} />
        <StatCard label="Running" value={progress.running} color={statusColors.running} />
        <StatCard label="Pending" value={progress.pending} color={statusColors.pending} />
        <StatCard label="Failed" value={progress.failed} color={statusColors.failed} />
      </div>
    </div>
  );
};

// WorktreeStatusPanel Component
const WorktreeStatusPanel: React.FC<{ worktrees: WorktreeInfo[] }> = ({ worktrees }) => {
  return (
    <div className="bg-gray-800 rounded-lg p-6 mb-6">
      <h2 className="text-2xl font-bold mb-4">📁 Worktree Status</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {worktrees.map((worktree) => (
          <div
            key={worktree.issueNumber}
            className="bg-gray-700 rounded-lg p-4 border-l-4 border-blue-500"
          >
            <div className="flex justify-between items-center mb-2">
              <span className="font-semibold">Issue #{worktree.issueNumber}</span>
              <StatusBadge status={worktree.status} />
            </div>
            <div className="text-sm text-gray-400">
              <div>Branch: {worktree.branch}</div>
              <div>Path: {worktree.path.replace(process.cwd(), '.')}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// LoopCard Component
const LoopCard: React.FC<{ loop: FeedbackLoop; onClick: () => void }> = ({ loop, onClick }) => {
  const latestIteration = loop.iterations[loop.iterations.length - 1];
  const currentScore = latestIteration?.consumptionReport.overallScore || 0;

  return (
    <div
      className="bg-gray-800 rounded-lg p-6 cursor-pointer hover:bg-gray-750 transition-colors"
      onClick={onClick}
    >
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold">Loop #{loop.loopId.slice(-6)}</h3>
        <StatusBadge status={loop.status} />
      </div>

      <div className="mb-4">
        <div className="flex justify-between text-sm mb-2">
          <span>Quality Score</span>
          <span className="font-semibold">{currentScore}/100</span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-3">
          <div
            className={`h-3 rounded-full ${
              currentScore >= 80
                ? 'bg-green-500'
                : currentScore >= 60
                ? 'bg-yellow-500'
                : 'bg-red-500'
            }`}
            style={{ width: `${currentScore}%` }}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <div className="text-gray-400">Iterations</div>
          <div className="font-semibold">{loop.iteration}</div>
        </div>
        <div>
          <div className="text-gray-400">Variance</div>
          <div className="font-semibold">{loop.convergenceMetrics.scoreVariance.toFixed(2)}</div>
        </div>
      </div>

      {loop.convergenceMetrics.isConverging && (
        <div className="mt-4 text-green-500 text-sm">
          ✓ Converging
        </div>
      )}
    </div>
  );
};

// LoopDetailsModal Component
const LoopDetailsModal: React.FC<{ loop: FeedbackLoop; onClose: () => void }> = ({ loop, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg p-8 max-w-4xl w-full max-h-screen overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold">Loop Details</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-2xl"
          >
            ×
          </button>
        </div>

        <div className="mb-6">
          <h3 className="text-xl font-semibold mb-2">Goal: {loop.goalId}</h3>
          <StatusBadge status={loop.status} />
        </div>

        {/* Score Trend Chart */}
        <div className="mb-6">
          <h3 className="text-xl font-semibold mb-4">Quality Score Trend</h3>
          <ScoreTrendChart iterations={loop.iterations} />
        </div>

        {/* Iterations Table */}
        <div className="mb-6">
          <h3 className="text-xl font-semibold mb-4">Iterations</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-700">
                <tr>
                  <th className="p-2 text-left">Iteration</th>
                  <th className="p-2 text-left">Score</th>
                  <th className="p-2 text-left">Improvement</th>
                  <th className="p-2 text-left">Goal Achieved</th>
                </tr>
              </thead>
              <tbody>
                {loop.iterations.map((iteration: IterationRecord, index: number) => (
                  <tr key={index} className="border-b border-gray-700">
                    <td className="p-2">{iteration.iteration}</td>
                    <td className="p-2">{iteration.consumptionReport.overallScore}</td>
                    <td className="p-2">{iteration.scoreImprovement > 0 ? `+${iteration.scoreImprovement.toFixed(2)}` : iteration.scoreImprovement.toFixed(2)}</td>
                    <td className="p-2">
                      {iteration.consumptionReport.goalAchieved ? '✓' : '✗'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Convergence Metrics */}
        <div>
          <h3 className="text-xl font-semibold mb-4">Convergence Metrics</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-700 rounded p-4">
              <div className="text-gray-400 text-sm">Score Variance</div>
              <div className="text-2xl font-semibold">{loop.convergenceMetrics.scoreVariance.toFixed(2)}</div>
            </div>
            <div className="bg-gray-700 rounded p-4">
              <div className="text-gray-400 text-sm">Improvement Rate</div>
              <div className="text-2xl font-semibold">{loop.convergenceMetrics.improvementRate.toFixed(2)}/iter</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ScoreTrendChart Component
const ScoreTrendChart: React.FC<{ iterations: IterationRecord[] }> = ({ iterations }) => {
  if (iterations.length === 0) return null;

  const maxScore = 100;
  const height = 200;

  return (
    <div className="bg-gray-700 rounded p-4" style={{ height: `${height}px` }}>
      <svg width="100%" height={height} viewBox={`0 0 ${iterations.length * 50} ${height}`}>
        {/* Grid lines */}
        {[0, 25, 50, 75, 100].map((score) => (
          <line
            key={score}
            x1="0"
            y1={height - (score / maxScore) * height}
            x2={iterations.length * 50}
            y2={height - (score / maxScore) * height}
            stroke="#374151"
            strokeWidth="1"
            strokeDasharray="4"
          />
        ))}

        {/* Score line */}
        <polyline
          points={iterations
            .map(
              (iter, i) =>
                `${i * 50 + 25},${height - (iter.consumptionReport.overallScore / maxScore) * height}`
            )
            .join(' ')}
          fill="none"
          stroke="#3b82f6"
          strokeWidth="2"
        />

        {/* Score points */}
        {iterations.map((iter, i) => (
          <circle
            key={i}
            cx={i * 50 + 25}
            cy={height - (iter.consumptionReport.overallScore / maxScore) * height}
            r="4"
            fill="#3b82f6"
          />
        ))}
      </svg>
    </div>
  );
};

// StatCard Component
const StatCard: React.FC<{ label: string; value: number; color: string }> = ({ label, value, color }) => {
  return (
    <div className={`${color} rounded-lg p-4 text-center`}>
      <div className="text-2xl font-bold">{value}</div>
      <div className="text-sm text-gray-300">{label}</div>
    </div>
  );
};

// StatusBadge Component
const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const statusColors: Record<string, string> = {
    running: 'bg-blue-500',
    converged: 'bg-green-500',
    diverged: 'bg-red-500',
    max_iterations_reached: 'bg-yellow-500',
    escalated: 'bg-orange-500',
    active: 'bg-blue-500',
    idle: 'bg-gray-500',
    completed: 'bg-green-500',
    failed: 'bg-red-500',
    cleanup: 'bg-gray-600',
  };

  const color = statusColors[status] || 'bg-gray-500';

  return (
    <span className={`${color} text-white text-xs px-3 py-1 rounded-full font-semibold`}>
      {status}
    </span>
  );
};

export default FeedbackLoopDashboard;
