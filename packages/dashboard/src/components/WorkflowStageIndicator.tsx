/**
 * Workflow Stage Indicator
 *
 * Displays the current stage of the autonomous workflow in an intuitive visual format.
 * Shows 5 main stages with progress indication and Japanese explanations.
 */

export interface WorkflowStage {
  id: string;
  name: string;
  nameJa: string;
  description: string;
  icon: string;
  color: string;
}

const WORKFLOW_STAGES: WorkflowStage[] = [
  {
    id: 'discovery',
    name: 'Task Discovery',
    nameJa: 'タスク発見',
    description: 'GitHubからIssueを読み込んで、処理すべきタスクを発見します',
    icon: '📥',
    color: '#6366F1', // Indigo
  },
  {
    id: 'analysis',
    name: 'Analysis',
    nameJa: '分析',
    description: 'CoordinatorAgentがIssueを分析し、タイプ・優先度・複雑度を判定します',
    icon: '🔍',
    color: '#10B981', // Green
  },
  {
    id: 'decomposition',
    name: 'Task Decomposition',
    nameJa: 'タスク分解',
    description: 'Issueを複数のサブタスクに分解し、実行可能な単位にします',
    icon: '🧩',
    color: '#F59E0B', // Amber
  },
  {
    id: 'assignment',
    name: 'Agent Assignment',
    nameJa: 'Agent割り当て',
    description: '各サブタスクに最適なSpecialist Agentを選択・割り当てます',
    icon: '🎯',
    color: '#8B5CF6', // Purple
  },
  {
    id: 'execution',
    name: 'Execution',
    nameJa: '実行',
    description: 'Specialist Agentがタスクを実行し、コード生成・レビュー・PRを作成します',
    icon: '💻',
    color: '#EC4899', // Pink
  },
];

export interface WorkflowStageIndicatorProps {
  currentStage: string | null;
  completedStages: string[];
}

export function WorkflowStageIndicator({ currentStage, completedStages }: WorkflowStageIndicatorProps) {
  return (
    <div className="border-b border-white/10 px-2 py-1 backdrop-blur-lg bg-gray-900/80">
      {/* Compact Stage Progress */}
      <div className="flex items-center gap-1">
        {WORKFLOW_STAGES.map((stage, index) => {
          const isCompleted = completedStages.includes(stage.id);
          const isActive = currentStage === stage.id;

          return (
            <div key={stage.id} className="flex flex-1 items-center">
              {/* Compact Stage Card */}
              <div
                className={`relative flex flex-1 flex-col items-center rounded p-[1px] transition-all duration-200 ${
                  isActive ? '' : isCompleted ? '' : 'opacity-50'
                }`}
                style={{
                  background: isActive
                    ? `linear-gradient(135deg, ${stage.color}60, ${stage.color}40)`
                    : isCompleted
                    ? 'linear-gradient(135deg, #10b98140, #34d39940)'
                    : 'linear-gradient(135deg, #6b728040, #9ca3af40)',
                }}
              >
                <div className="w-full rounded bg-gray-900/90 px-1.5 py-1">
                  {/* Icon */}
                  <div className="relative flex justify-center">
                    <span
                      className="text-base"
                      style={{
                        filter: isActive
                          ? `drop-shadow(0 0 2px ${stage.color}60)`
                          : isCompleted
                          ? 'drop-shadow(0 0 2px rgba(16, 185, 129, 0.4))'
                          : 'none',
                      }}
                    >
                      {stage.icon}
                    </span>
                    {isCompleted && (
                      <div className="absolute -right-1 -top-0.5 flex h-3 w-3 items-center justify-center rounded-full bg-green-500 text-[8px] text-white font-bold">
                        ✓
                      </div>
                    )}
                  </div>

                  {/* Stage Name */}
                  <div className="text-center mt-0.5">
                    <div
                      className={`text-[9px] font-semibold truncate ${
                        isActive || isCompleted ? 'text-white' : 'text-gray-500'
                      }`}
                    >
                      {stage.nameJa}
                    </div>
                  </div>
                </div>
              </div>

              {/* Arrow Connector */}
              {index < WORKFLOW_STAGES.length - 1 && (
                <div className="flex-shrink-0 px-0.5">
                  <svg
                    className={`h-3 w-3 transition-all duration-200 ${
                      isCompleted ? 'text-green-400' : 'text-gray-600'
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={3}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
