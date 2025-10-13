/**
 * Agent Types and Interfaces
 *
 * Core type definitions for the Autonomous Operations Agent system
 */

// ============================================================================
// Base Types
// ============================================================================

export type AgentStatus = 'idle' | 'running' | 'completed' | 'failed' | 'escalated';

export type EscalationTarget = 'TechLead' | 'PO' | 'CISO' | 'CTO' | 'DevOps';

export type AgentType =
  | 'CoordinatorAgent'
  | 'CodeGenAgent'
  | 'ReviewAgent'
  | 'IssueAgent'
  | 'PRAgent'
  | 'DeploymentAgent'
  | 'AutoFixAgent';

export type Severity =
  | 'Sev.1-Critical'
  | 'Sev.2-High'
  | 'Sev.3-Medium'
  | 'Sev.4-Low'
  | 'Sev.5-Trivial';

export type ImpactLevel = 'Critical' | 'High' | 'Medium' | 'Low';

// ============================================================================
// Task & Issue Types
// ============================================================================

export interface Task {
  id: string;
  title: string;
  description: string;
  type: 'feature' | 'bug' | 'refactor' | 'docs' | 'test' | 'deployment';
  priority: number;
  severity?: Severity;
  impact?: ImpactLevel;
  assignedAgent?: AgentType;
  dependencies: string[]; // Task IDs
  estimatedDuration?: number; // minutes
  status?: AgentStatus;
  startTime?: number;
  endTime?: number;
  metadata?: Record<string, any>;
}

export interface Issue {
  number: number;
  title: string;
  body: string;
  state: 'open' | 'closed';
  labels: string[];
  assignee?: string;
  createdAt: string;
  updatedAt: string;
  url: string;
}

export interface DAG {
  nodes: Task[];
  edges: Array<{ from: string; to: string }>;
  levels: string[][]; // Topologically sorted levels
}

// ============================================================================
// Agent Result Types
// ============================================================================

export interface AgentResult {
  status: 'success' | 'failed' | 'escalated';
  data?: any;
  error?: string;
  metrics?: Partial<AgentMetrics>;
  escalation?: EscalationInfo;
}

export interface AgentMetrics {
  taskId: string;
  agentType: AgentType;
  durationMs: number;
  qualityScore?: number;
  linesChanged?: number;
  testsAdded?: number;
  coveragePercent?: number;
  errorsFound?: number;
  timestamp: string;
}

export interface EscalationInfo {
  reason: string;
  target: EscalationTarget;
  severity: Severity;
  context: Record<string, any>;
  timestamp: string;
}

// ============================================================================
// Quality Assessment Types
// ============================================================================

export interface QualityReport {
  score: number; // 0-100
  passed: boolean; // score >= 80
  issues: QualityIssue[];
  recommendations: string[];
  breakdown: {
    eslintScore: number;
    typeScriptScore: number;
    securityScore: number;
    testCoverageScore: number;
  };
}

export interface QualityIssue {
  type: 'eslint' | 'typescript' | 'security' | 'coverage';
  severity: 'critical' | 'high' | 'medium' | 'low';
  message: string;
  file?: string;
  line?: number;
  column?: number;
  scoreImpact: number; // Points deducted
}

// ============================================================================
// Coordinator Types
// ============================================================================

export interface TaskDecomposition {
  originalIssue: Issue;
  tasks: Task[];
  dag: DAG;
  estimatedTotalDuration: number;
  hasCycles: boolean;
  recommendations: string[];
}

export interface ExecutionPlan {
  sessionId: string;
  deviceIdentifier: string;
  concurrency: number;
  tasks: Task[];
  dag: DAG;
  estimatedDuration: number;
  startTime: number;
}

export interface ExecutionReport {
  sessionId: string;
  deviceIdentifier: string;
  startTime: number;
  endTime: number;
  totalDurationMs: number;
  summary: {
    total: number;
    completed: number;
    failed: number;
    escalated: number;
    successRate: number;
  };
  tasks: TaskResult[];
  metrics: AgentMetrics[];
  escalations: EscalationInfo[];
}

export interface TaskResult {
  taskId: string;
  status: AgentStatus;
  agentType: AgentType;
  durationMs: number;
  result?: AgentResult;
  error?: string;
}

// ============================================================================
// Code Generation Types
// ============================================================================

export interface CodeSpec {
  feature: string;
  requirements: string[];
  context: {
    existingFiles: string[];
    architecture: string;
    dependencies: string[];
  };
  constraints: string[];
}

export interface GeneratedCode {
  files: Array<{
    path: string;
    content: string;
    type: 'new' | 'modified';
  }>;
  tests: Array<{
    path: string;
    content: string;
  }>;
  documentation: string;
  summary: string;
}

// ============================================================================
// Review Types
// ============================================================================

export interface ReviewRequest {
  files: string[];
  branch: string;
  context: string;
}

export interface ReviewResult {
  qualityReport: QualityReport;
  approved: boolean;
  escalationRequired: boolean;
  escalationTarget?: EscalationTarget;
  comments: ReviewComment[];
}

export interface ReviewComment {
  file: string;
  line: number;
  severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
  message: string;
  suggestion?: string;
}

// ============================================================================
// PR Types
// ============================================================================

export interface PRRequest {
  title: string;
  body: string;
  baseBranch: string;
  headBranch: string;
  draft: boolean;
  issueNumber?: number;
  labels?: string[];
  reviewers?: string[];
}

export interface PRResult {
  number: number;
  url: string;
  state: 'draft' | 'open' | 'merged' | 'closed';
  createdAt: string;
}

// ============================================================================
// Deployment Types
// ============================================================================

export interface DeploymentConfig {
  environment: 'staging' | 'production';
  version: string;
  projectId: string;
  targets: string[]; // Firebase targets: ['hosting', 'functions']
  skipTests?: boolean;
  autoRollback: boolean;
  healthCheckUrl: string;
}

export interface DeploymentResult {
  environment: 'staging' | 'production';
  version: string;
  projectId: string;
  deploymentUrl: string;
  deployedAt: string;
  durationMs: number;
  status: 'success' | 'failed' | 'rolled_back';
}

// ============================================================================
// Log-Driven Development (LDD) Types
// ============================================================================

export interface CodexPromptChain {
  intent: string;
  plan: string[];
  implementation: string[];
  verification: string[];
}

export interface ToolInvocation {
  command: string;
  workdir: string;
  timestamp: string;
  status: 'passed' | 'failed';
  notes: string;
  output?: string;
  error?: string;
}

export interface LDDLog {
  sessionId: string;
  date: string;
  deviceIdentifier: string;
  codexPromptChain: CodexPromptChain;
  toolInvocations: ToolInvocation[];
  memoryBankUpdates: string[];
  nextSteps: string;
}

// ============================================================================
// Parallel Execution Types
// ============================================================================

export interface WorkerPool {
  maxConcurrency: number;
  activeWorkers: number;
  queue: Task[];
  running: Map<string, Task>;
  completed: Map<string, TaskResult>;
  failed: Map<string, TaskResult>;
}

export interface ProgressStatus {
  total: number;
  completed: number;
  running: number;
  waiting: number;
  failed: number;
  percentage: number;
}

// ============================================================================
// Configuration Types
// ============================================================================

export interface AgentConfig {
  deviceIdentifier: string;
  githubToken: string;
  useTaskTool: boolean;
  useWorktree: boolean;
  worktreeBasePath?: string;
  logDirectory: string;
  reportDirectory: string;
  techLeadGithubUsername?: string;
  cisoGithubUsername?: string;
  poGithubUsername?: string;
  // Deployment config
  firebaseProductionProject?: string;
  firebaseStagingProject?: string;
  productionUrl?: string;
  stagingUrl?: string;
}

export interface ExecutionOptions {
  issues?: number[];
  todos?: string[];
  concurrency: number;
  dryRun?: boolean;
  ignoreDependencies?: boolean;
  timeout?: number; // minutes
}

// ============================================================================
// Error Types
// ============================================================================

export class AgentError extends Error {
  constructor(
    message: string,
    public agentType: AgentType,
    public taskId?: string,
    public cause?: Error
  ) {
    super(message);
    this.name = 'AgentError';
  }
}

export class EscalationError extends Error {
  constructor(
    message: string,
    public target: EscalationTarget,
    public severity: Severity,
    public context: Record<string, any>
  ) {
    super(message);
    this.name = 'EscalationError';
  }
}

export class CircularDependencyError extends Error {
  constructor(
    message: string,
    public cycle: string[]
  ) {
    super(message);
    this.name = 'CircularDependencyError';
  }
}

// ============================================================================
// Discord Community Types (E13)
// ============================================================================

export interface DiscordCommunity {
  // Identification
  serverId: string;
  serverName: string;

  // Channels
  channels: DiscordChannel[];

  // Roles
  roles: DiscordRole[];

  // Members
  members: number;

  // Webhook integrations
  webhooks: WebhookConfig[];

  // Bot integrations
  botIntegrations: BotConfig[];

  // Metadata
  createdAt: string;
}

export interface DiscordChannel {
  id: string;
  name: string; // e.g., "#announcements"
  type: 'text' | 'voice' | 'forum';
  category: string; // e.g., "Information & Announcements"
  purpose: string;
}

export interface DiscordRole {
  id: string;
  name: string; // e.g., "🌱 Newcomer"
  level: number; // 1-5
  requirements: string;
}

export interface WebhookConfig {
  channelId: string;
  webhookUrl: string;
  triggerEvents: string[]; // e.g., ['issue.created', 'pr.merged']
}

export interface BotConfig {
  name: string; // e.g., "MEE6", "GitHub Bot", "Custom Miyabi Bot"
  enabled: boolean;
  commands: BotCommand[];
}

export interface BotCommand {
  name: string; // e.g., "/miyabi status"
  description: string;
  usage: string;
}

// ============================================================================
// Goal-Oriented TDD + Consumption-Driven + Infinite Feedback Loop Types
// ============================================================================

/**
 * Goal-Oriented TDD: テストゴール定義
 * 各セッションが達成すべきゴールを明確に定義
 */
export interface GoalDefinition {
  id: string;
  title: string;
  description: string;

  // Success criteria
  successCriteria: SuccessCriteria;

  // Test specifications
  testSpecs: TestSpecification[];

  // Acceptance criteria
  acceptanceCriteria: string[];

  // Metrics thresholds
  metricsThresholds: MetricsThreshold;

  // Priority & deadline
  priority: number;
  deadline?: string;

  // Context
  context: {
    issueNumber?: number;
    taskId?: string;
    previousAttempts: number;
    feedbackHistory: FeedbackRecord[];
  };
}

/**
 * Success criteria for goal validation
 */
export interface SuccessCriteria {
  // Code quality
  minQualityScore: number; // 0-100
  maxEslintErrors: number;
  maxTypeScriptErrors: number;
  maxSecurityIssues: number;

  // Test coverage
  minTestCoverage: number; // 0-100
  minTestsPassed: number;

  // Performance
  maxBuildTimeMs?: number;
  maxResponseTimeMs?: number;

  // Business metrics
  customMetrics?: Array<{
    name: string;
    threshold: number;
    operator: 'gte' | 'lte' | 'eq';
  }>;
}

/**
 * Test specification for TDD
 */
export interface TestSpecification {
  id: string;
  name: string;
  description: string;
  type: 'unit' | 'integration' | 'e2e' | 'snapshot' | 'performance';

  // Test details
  testFile: string;
  testFunction: string;
  expectedBehavior: string;

  // Dependencies
  dependencies: string[];

  // Status
  status: 'pending' | 'passed' | 'failed' | 'skipped';
  failureCount?: number;
  lastRun?: string;
}

/**
 * Metrics thresholds for goal validation
 */
export interface MetricsThreshold {
  qualityScore: number;
  testCoverage: number;
  buildTime: number;
  codeSize: number;
  cyclomaticComplexity: number;
}

/**
 * Consumption-Driven: 成果消費・検証レポート
 * 実行結果を消費し、ゴールに対する達成度を評価
 */
export interface ConsumptionReport {
  goalId: string;
  sessionId: string;
  timestamp: string;

  // Validation results
  validationResults: ValidationResult[];

  // Overall assessment
  overallScore: number; // 0-100
  goalAchieved: boolean;

  // Metrics
  actualMetrics: ActualMetrics;

  // Gap analysis
  gaps: GapAnalysis[];

  // Recommendations
  recommendations: string[];

  // Next actions
  nextActions: NextAction[];
}

/**
 * Validation result for each success criterion
 */
export interface ValidationResult {
  criterion: string;
  expected: number | string;
  actual: number | string;
  passed: boolean;
  scoreImpact: number;
  feedback: string;
}

/**
 * Actual metrics collected from execution
 */
export interface ActualMetrics {
  qualityScore: number;
  eslintErrors: number;
  typeScriptErrors: number;
  securityIssues: number;
  testCoverage: number;
  testsPassed: number;
  testsFailed: number;
  buildTimeMs: number;
  responseTimeMs?: number;
  linesOfCode: number;
  cyclomaticComplexity: number;
  customMetrics?: Record<string, number>;
}

/**
 * Gap analysis between expected and actual
 */
export interface GapAnalysis {
  metric: string;
  expected: number;
  actual: number;
  gap: number;
  gapPercentage: number;
  severity: 'critical' | 'high' | 'medium' | 'low';
  rootCause?: string;
}

/**
 * Next action to close the gap
 */
export interface NextAction {
  id: string;
  type: 'refactor' | 'fix' | 'improve' | 'optimize' | 'test' | 'refine_goal';
  description: string;
  priority: number;
  estimatedImpact: number; // Expected score improvement
  targetMetric: string;
}

/**
 * Infinite Feedback Loop: フィードバックループ制御
 */
export interface FeedbackLoop {
  loopId: string;
  goalId: string;

  // Loop state
  iteration: number;
  maxIterations: number;
  startTime: string;
  lastIterationTime: string;

  // Loop status
  status: 'running' | 'converged' | 'diverged' | 'max_iterations_reached' | 'escalated';

  // Iteration history
  iterations: IterationRecord[];

  // Convergence tracking
  convergenceMetrics: ConvergenceMetrics;

  // Auto-refinement
  autoRefinementEnabled: boolean;
  refinementHistory: GoalRefinement[];
}

/**
 * Record of each iteration
 */
export interface IterationRecord {
  iteration: number;
  timestamp: string;
  goalDefinition: GoalDefinition;
  consumptionReport: ConsumptionReport;
  feedback: FeedbackRecord;
  durationMs: number;
  scoreImprovement: number;
}

/**
 * Feedback record for continuous improvement
 */
export interface FeedbackRecord {
  timestamp: string;
  type: 'positive' | 'constructive' | 'corrective' | 'escalation';
  score: number;

  // Feedback content
  summary: string;
  details: string[];
  codeExamples?: Array<{
    issue: string;
    current: string;
    suggested: string;
  }>;

  // Action items
  actionItems: NextAction[];

  // References
  references?: string[];
}

/**
 * Convergence metrics for loop control
 */
export interface ConvergenceMetrics {
  scoreHistory: number[];
  scoreVariance: number;
  improvementRate: number; // Score improvement per iteration
  isConverging: boolean;
  estimatedIterationsToConverge?: number;
}

/**
 * Goal refinement for continuous improvement
 */
export interface GoalRefinement {
  timestamp: string;
  reason: string;

  // Original goal
  originalGoal: GoalDefinition;

  // Refined goal
  refinedGoal: GoalDefinition;

  // Changes
  changes: Array<{
    field: string;
    before: any;
    after: any;
    reason: string;
  }>;

  // Expected impact
  expectedImpact: string;
}

/**
 * Escalation information for error handling
 */
export interface Escalation {
  loopId: string;
  reason: string;
  escalationLevel: EscalationTarget;
  severity: 'low' | 'medium' | 'high' | 'critical';
  context: Record<string, any>;
}
