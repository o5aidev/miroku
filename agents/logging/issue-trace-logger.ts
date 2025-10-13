/**
 * Issue Trace Logger
 *
 * Complete lifecycle tracking for GitHub Issues through the agent system.
 *
 * Features:
 * - State transition tracking (pending → analyzing → implementing → reviewing → done)
 * - Agent execution recording (Coordinator, CodeGen, Review, PR, Deployment)
 * - Quality report aggregation (100-point scoring)
 * - Pull request tracking (Conventional Commits)
 * - Deployment history (Firebase/Vercel/AWS)
 * - Escalation tracking (TechLead/PO/CISO/CTO)
 * - Label change history (53-label system)
 * - File-based persistence (JSON)
 * - Dashboard synchronization (optional)
 */

import { randomUUID } from 'crypto';
import { promises as fs } from 'fs';
import * as path from 'path';
import type {
  IssueTraceLog,
  IssueTraceLogConfig,
  IssueState,
  StateTransition,
  AgentExecution,
  LabelChange,
  TraceNote,
  Issue,
  AgentType,
  TaskDecomposition,
  QualityReport,
  PRResult,
  DeploymentResult,
  EscalationInfo,
  AgentResult,
  AgentMetrics,
} from '../types/index.js';

/**
 * Issue Trace Logger - Main class for tracking Issue lifecycle
 */
export class IssueTraceLogger {
  private config: IssueTraceLogConfig;
  private activeLogs: Map<number, IssueTraceLog>; // issueNumber -> log

  constructor(config: IssueTraceLogConfig) {
    this.config = config;
    this.activeLogs = new Map();
  }

  // ============================================================================
  // Core Lifecycle Methods
  // ============================================================================

  /**
   * Start tracing an Issue
   * @param issue GitHub Issue to trace
   * @param sessionId Session ID for this trace
   * @param deviceIdentifier Device identifier
   * @returns Trace ID (UUID)
   */
  async startTrace(
    issue: Issue,
    sessionId: string,
    deviceIdentifier: string
  ): Promise<string> {
    const traceId = randomUUID();
    const now = new Date().toISOString();

    const log: IssueTraceLog = {
      // Issue identification
      issueNumber: issue.number,
      issueTitle: issue.title,
      issueUrl: issue.url,
      issueBody: issue.body,

      // Trace metadata
      traceId,
      sessionId,
      deviceIdentifier,

      // Timing
      startTime: now,
      endTime: undefined,
      durationMs: undefined,

      // Current state
      currentState: 'pending',

      // Initialize arrays
      stateTransitions: [],
      agentExecutions: [],
      qualityReports: [],
      pullRequests: [],
      deployments: [],
      escalations: [],
      labelHistory: [],
      notes: [],

      // Optional fields
      taskDecomposition: undefined,
      worktreeInfo: undefined,
    };

    // Record initial state transition
    log.stateTransitions.push({
      from: 'pending',
      to: 'pending',
      timestamp: now,
      triggeredBy: 'system',
      reason: 'Issue trace started',
    });

    // Store in memory
    this.activeLogs.set(issue.number, log);

    // Save to file if enabled
    if (this.config.enableFileLogging) {
      await this.saveToFile(log);
    }

    return traceId;
  }

  /**
   * End tracing an Issue
   * @param issueNumber Issue number
   */
  async endTrace(issueNumber: number): Promise<void> {
    const log = this.activeLogs.get(issueNumber);
    if (!log) {
      throw new Error(`No active trace found for issue #${issueNumber}`);
    }

    const now = new Date().toISOString();
    log.endTime = now;
    log.durationMs = new Date(now).getTime() - new Date(log.startTime).getTime();

    // Save final state
    if (this.config.enableFileLogging) {
      await this.saveToFile(log);
    }

    // Remove from active logs
    this.activeLogs.delete(issueNumber);
  }

  /**
   * Get trace log for an Issue
   * @param issueNumber Issue number
   * @returns IssueTraceLog or null if not found
   */
  async getTrace(issueNumber: number): Promise<IssueTraceLog | null> {
    // Check active logs first
    const activeLog = this.activeLogs.get(issueNumber);
    if (activeLog) {
      return activeLog;
    }

    // Try loading from file
    if (this.config.enableFileLogging) {
      return await this.loadFromFile(issueNumber);
    }

    return null;
  }

  // ============================================================================
  // State Management
  // ============================================================================

  /**
   * Record a state transition
   * @param issueNumber Issue number
   * @param from Previous state
   * @param to New state
   * @param triggeredBy Who/what triggered the transition
   * @param reason Optional reason
   */
  async recordStateTransition(
    issueNumber: number,
    from: IssueState,
    to: IssueState,
    triggeredBy: AgentType | 'manual' | 'system',
    reason?: string
  ): Promise<void> {
    const log = this.ensureLogExists(issueNumber);

    const transition: StateTransition = {
      from,
      to,
      timestamp: new Date().toISOString(),
      triggeredBy,
      reason,
    };

    log.stateTransitions.push(transition);
    log.currentState = to;

    if (this.config.enableFileLogging) {
      await this.saveToFile(log);
    }
  }

  // ============================================================================
  // Agent Execution Tracking
  // ============================================================================

  /**
   * Start tracking an agent execution
   * @param issueNumber Issue number
   * @param agentType Agent type
   * @param worktreePath Optional worktree path
   * @returns Execution ID (UUID)
   */
  async startAgentExecution(
    issueNumber: number,
    agentType: AgentType,
    worktreePath?: string
  ): Promise<string> {
    const log = this.ensureLogExists(issueNumber);
    const executionId = randomUUID();

    const execution: AgentExecution = {
      executionId,
      agentType,
      startTime: new Date().toISOString(),
      endTime: undefined,
      durationMs: undefined,
      status: 'running',
      result: undefined,
      metrics: undefined,
      error: undefined,
      logs: [],
      worktreePath,
    };

    log.agentExecutions.push(execution);

    if (this.config.enableFileLogging) {
      await this.saveToFile(log);
    }

    return executionId;
  }

  /**
   * End tracking an agent execution
   * @param issueNumber Issue number
   * @param executionId Execution ID
   * @param result Agent result
   * @param metrics Optional metrics
   */
  async endAgentExecution(
    issueNumber: number,
    executionId: string,
    result: AgentResult,
    metrics?: AgentMetrics
  ): Promise<void> {
    const log = this.ensureLogExists(issueNumber);

    const execution = log.agentExecutions.find((e) => e.executionId === executionId);
    if (!execution) {
      throw new Error(`Execution ${executionId} not found for issue #${issueNumber}`);
    }

    const now = new Date().toISOString();
    execution.endTime = now;
    execution.durationMs = new Date(now).getTime() - new Date(execution.startTime).getTime();
    execution.status = result.status === 'success' ? 'completed' : result.status;
    execution.result = result;
    execution.metrics = metrics;
    execution.error = result.error;

    if (this.config.enableFileLogging) {
      await this.saveToFile(log);
    }
  }

  // ============================================================================
  // Data Recording
  // ============================================================================

  /**
   * Record task decomposition
   */
  async recordTaskDecomposition(
    issueNumber: number,
    decomposition: TaskDecomposition
  ): Promise<void> {
    const log = this.ensureLogExists(issueNumber);
    log.taskDecomposition = decomposition;

    if (this.config.enableFileLogging) {
      await this.saveToFile(log);
    }
  }

  /**
   * Record quality report
   */
  async recordQualityReport(issueNumber: number, report: QualityReport): Promise<void> {
    const log = this.ensureLogExists(issueNumber);
    log.qualityReports.push(report);

    if (this.config.enableFileLogging) {
      await this.saveToFile(log);
    }
  }

  /**
   * Record pull request
   */
  async recordPullRequest(issueNumber: number, pr: PRResult): Promise<void> {
    const log = this.ensureLogExists(issueNumber);
    log.pullRequests.push(pr);

    if (this.config.enableFileLogging) {
      await this.saveToFile(log);
    }
  }

  /**
   * Record deployment
   */
  async recordDeployment(issueNumber: number, deployment: DeploymentResult): Promise<void> {
    const log = this.ensureLogExists(issueNumber);
    log.deployments.push(deployment);

    if (this.config.enableFileLogging) {
      await this.saveToFile(log);
    }
  }

  /**
   * Record escalation
   */
  async recordEscalation(issueNumber: number, escalation: EscalationInfo): Promise<void> {
    const log = this.ensureLogExists(issueNumber);
    log.escalations.push(escalation);

    if (this.config.enableFileLogging) {
      await this.saveToFile(log);
    }
  }

  /**
   * Record label change
   */
  async recordLabelChange(
    issueNumber: number,
    action: 'added' | 'removed',
    label: string,
    changedBy: AgentType | 'manual' | 'system',
    reason?: string
  ): Promise<void> {
    const log = this.ensureLogExists(issueNumber);

    const change: LabelChange = {
      timestamp: new Date().toISOString(),
      action,
      label,
      changedBy,
      reason,
    };

    log.labelHistory.push(change);

    if (this.config.enableFileLogging) {
      await this.saveToFile(log);
    }
  }

  /**
   * Add a note/comment
   */
  async addNote(
    issueNumber: number,
    author: AgentType | 'human' | 'system',
    content: string,
    severity?: 'info' | 'warning' | 'error' | 'critical'
  ): Promise<void> {
    const log = this.ensureLogExists(issueNumber);

    const note: TraceNote = {
      timestamp: new Date().toISOString(),
      author,
      content,
      severity,
    };

    log.notes.push(note);

    if (this.config.enableFileLogging) {
      await this.saveToFile(log);
    }
  }

  // ============================================================================
  // Storage
  // ============================================================================

  /**
   * Save trace log to file
   */
  private async saveToFile(log: IssueTraceLog): Promise<void> {
    const filePath = this.getLogFilePath(log.issueNumber);
    const dir = path.dirname(filePath);

    // Ensure directory exists
    await fs.mkdir(dir, { recursive: true });

    // Write log file
    await fs.writeFile(filePath, JSON.stringify(log, null, 2), 'utf-8');
  }

  /**
   * Load trace log from file
   */
  private async loadFromFile(issueNumber: number): Promise<IssueTraceLog | null> {
    const filePath = this.getLogFilePath(issueNumber);

    try {
      const data = await fs.readFile(filePath, 'utf-8');
      return JSON.parse(data) as IssueTraceLog;
    } catch (error) {
      // File doesn't exist or is invalid
      return null;
    }
  }

  /**
   * Get file path for a log
   */
  private getLogFilePath(issueNumber: number): string {
    return path.join(this.config.logDirectory, `issue-${issueNumber}.json`);
  }

  // ============================================================================
  // Utility
  // ============================================================================

  /**
   * Ensure log exists for an issue (load from file if needed)
   */
  private ensureLogExists(issueNumber: number): IssueTraceLog {
    let log = this.activeLogs.get(issueNumber);

    if (!log) {
      throw new Error(
        `No active trace found for issue #${issueNumber}. Call startTrace() first.`
      );
    }

    return log;
  }
}

/**
 * Create a default configuration for IssueTraceLogger
 */
export function createDefaultConfig(logDirectory: string): IssueTraceLogConfig {
  return {
    logDirectory,
    enableFileLogging: true,
    enableDashboardSync: false,
    retentionDays: 90,
    compressionEnabled: false,
  };
}

/**
 * Singleton instance for global access
 */
let globalLogger: IssueTraceLogger | null = null;

/**
 * Initialize the global logger
 */
export function initGlobalLogger(config: IssueTraceLogConfig): IssueTraceLogger {
  globalLogger = new IssueTraceLogger(config);
  return globalLogger;
}

/**
 * Get the global logger
 */
export function getGlobalLogger(): IssueTraceLogger {
  if (!globalLogger) {
    throw new Error('Global logger not initialized. Call initGlobalLogger() first.');
  }
  return globalLogger;
}
