/**
 * BaseAgent - Base class for all Autonomous Operations Agents
 *
 * Provides core functionality:
 * - Escalation mechanism
 * - Metrics recording
 * - Error handling
 * - Logging
 */

import {
  AgentType,
  AgentResult,
  AgentMetrics,
  EscalationTarget,
  EscalationInfo,
  Severity,
  Task,
  AgentConfig,
  AgentError,
  EscalationError,
  CodexPromptChain,
  ToolInvocation,
} from './types/index.js';
import { logger, type AgentName } from './ui/index.js';
import * as fs from 'fs';
import * as path from 'path';

export abstract class BaseAgent {
  protected config: AgentConfig;
  protected agentType: AgentType;
  protected currentTask?: Task;
  protected startTime: number = 0;
  protected logs: ToolInvocation[] = [];

  constructor(agentType: AgentType, config: AgentConfig) {
    this.agentType = agentType;
    this.config = config;
  }

  /**
   * Convert AgentType to AgentName for UI
   */
  private getAgentName(): AgentName {
    const nameMap: Record<string, AgentName> = {
      'CoordinatorAgent': 'CoordinatorAgent',
      'CodeGenAgent': 'CodeGenAgent',
      'ReviewAgent': 'ReviewAgent',
      'IssueAgent': 'IssueAgent',
      'PRAgent': 'PRAgent',
      'DeploymentAgent': 'DeploymentAgent',
    };
    return nameMap[this.agentType] || 'CoordinatorAgent';
  }

  // ============================================================================
  // Abstract Methods (Must be implemented by subclasses)
  // ============================================================================

  /**
   * Main execution method - must be implemented by each Agent
   */
  abstract execute(task: Task): Promise<AgentResult>;

  // ============================================================================
  // Core Functionality
  // ============================================================================

  /**
   * Run the agent with full lifecycle management
   */
  async run(task: Task): Promise<AgentResult> {
    this.currentTask = task;
    this.startTime = Date.now();

    const agentName = this.getAgentName();
    logger.agent(agentName, `Starting task: ${task.id}`);

    try {
      // Pre-execution validation
      await this.validateTask(task);

      // Main execution
      const result = await this.execute(task);

      // Post-execution processing
      await this.recordMetrics(result);
      await this.updateLDDLog(result);

      logger.agent(agentName, `Completed task: ${task.id}`);
      logger.success(`Task ${task.id} completed successfully`);

      return result;
    } catch (error) {
      return await this.handleError(error as Error);
    }
  }

  /**
   * Validate task before execution
   */
  protected async validateTask(task: Task): Promise<void> {
    if (!task.id) {
      throw new AgentError('Task ID is required', this.agentType);
    }

    if (!task.title) {
      throw new AgentError('Task title is required', this.agentType, task.id);
    }

    // Check dependencies are resolved
    if (task.dependencies && task.dependencies.length > 0) {
      logger.warning(`Task ${task.id} has ${task.dependencies.length} dependencies`);
    }
  }

  // ============================================================================
  // Escalation Mechanism
  // ============================================================================

  /**
   * Escalate issue to appropriate human authority
   */
  protected async escalate(
    reason: string,
    target: EscalationTarget,
    severity: Severity = 'Sev.2-High',
    context: Record<string, any> = {}
  ): Promise<void> {
    const escalationInfo: EscalationInfo = {
      reason,
      target,
      severity,
      context: {
        ...context,
        agentType: this.agentType,
        taskId: this.currentTask?.id,
        timestamp: new Date().toISOString(),
      },
      timestamp: new Date().toISOString(),
    };

    logger.error(`ESCALATION to ${target}: ${reason}`);
    logger.error(`Severity: ${severity}`);
    logger.muted(`Context: ${JSON.stringify(context, null, 2)}`);

    // Record escalation
    await this.recordEscalation(escalationInfo);

    // Create GitHub Issue comment or new Issue
    if (this.config.githubToken) {
      await this.notifyEscalation(escalationInfo);
    }

    throw new EscalationError(reason, target, severity, escalationInfo.context);
  }

  /**
   * Determine appropriate escalation target based on issue type
   */
  protected determineEscalationTarget(issueType: string): EscalationTarget {
    const escalationMap: Record<string, EscalationTarget> = {
      security: 'CISO',
      architecture: 'TechLead',
      deployment: 'DevOps',
      business: 'PO',
      infrastructure: 'CTO',
    };

    return escalationMap[issueType] || 'TechLead';
  }

  /**
   * Notify escalation target via GitHub
   */
  private async notifyEscalation(escalation: EscalationInfo): Promise<void> {
    // TODO: Implement GitHub notification
    // - Create Issue comment with @mention
    // - Or create new escalation Issue
    logger.info(`Escalation notification sent to ${escalation.target}`);
  }

  // ============================================================================
  // Metrics & Monitoring
  // ============================================================================

  /**
   * Record agent execution metrics
   */
  protected async recordMetrics(result: AgentResult): Promise<void> {
    const durationMs = Date.now() - this.startTime;

    const metrics: AgentMetrics = {
      taskId: this.currentTask?.id || 'unknown',
      agentType: this.agentType,
      durationMs,
      qualityScore: result.metrics?.qualityScore,
      linesChanged: result.metrics?.linesChanged,
      testsAdded: result.metrics?.testsAdded,
      coveragePercent: result.metrics?.coveragePercent,
      errorsFound: result.metrics?.errorsFound,
      timestamp: new Date().toISOString(),
    };

    // Save to metrics file
    const metricsDir = path.join(this.config.reportDirectory, 'metrics');
    await this.ensureDirectory(metricsDir);

    const metricsFile = path.join(
      metricsDir,
      `${this.agentType}-${Date.now()}.json`
    );

    await fs.promises.writeFile(metricsFile, JSON.stringify(metrics, null, 2));

    logger.info(`Metrics recorded: ${metricsFile}`);
  }

  /**
   * Record escalation to file
   */
  private async recordEscalation(escalation: EscalationInfo): Promise<void> {
    const escalationsDir = path.join(this.config.reportDirectory, 'escalations');
    await this.ensureDirectory(escalationsDir);

    const escalationFile = path.join(
      escalationsDir,
      `escalation-${Date.now()}.json`
    );

    await fs.promises.writeFile(
      escalationFile,
      JSON.stringify(escalation, null, 2)
    );
  }

  // ============================================================================
  // Log-Driven Development (LDD)
  // ============================================================================

  /**
   * Update LDD log with execution details
   */
  protected async updateLDDLog(result: AgentResult): Promise<void> {
    const date = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const logFile = path.join(this.config.logDirectory, `${date}.md`);

    const codexPromptChain: CodexPromptChain = {
      intent: `${this.agentType} execution for task ${this.currentTask?.id}`,
      plan: this.currentTask?.description
        ? [this.currentTask.description]
        : ['Execute task'],
      implementation: result.data?.files?.map((f: any) => f.path) || [],
      verification: [`Status: ${result.status}`, `Duration: ${Date.now() - this.startTime}ms`],
    };

    const lddEntry = this.formatLDDEntry(codexPromptChain, this.logs);

    // Append to log file
    await this.appendToFile(logFile, lddEntry);
  }

  /**
   * Format LDD entry for markdown log
   */
  private formatLDDEntry(
    promptChain: CodexPromptChain,
    invocations: ToolInvocation[]
  ): string {
    return `
## ${this.agentType} - ${new Date().toISOString()}

### Intent
${promptChain.intent}

### Plan
${promptChain.plan.map((p, i) => `${i + 1}. ${p}`).join('\n')}

### Implementation
${promptChain.implementation.map((impl) => `- ${impl}`).join('\n')}

### Verification
${promptChain.verification.map((v) => `- ${v}`).join('\n')}

### Tool Invocations
\`\`\`json
${JSON.stringify(invocations, null, 2)}
\`\`\`

---
`;
  }

  /**
   * Log tool invocation
   */
  protected async logToolInvocation(
    command: string,
    status: 'passed' | 'failed',
    notes: string,
    output?: string,
    error?: string
  ): Promise<void> {
    const invocation: ToolInvocation = {
      command,
      workdir: process.cwd(),
      timestamp: new Date().toISOString(),
      status,
      notes,
      output,
      error,
    };

    this.logs.push(invocation);
  }

  // ============================================================================
  // Error Handling
  // ============================================================================

  /**
   * Handle execution errors
   */
  private async handleError(error: Error): Promise<AgentResult> {
    logger.error(`Error in ${this.agentType}: ${error.message}`, error);

    // Log error
    await this.logToolInvocation(
      'error_handling',
      'failed',
      error.message,
      undefined,
      error.stack
    );

    // Determine if escalation is needed
    if (this.shouldEscalate(error)) {
      const target = this.determineEscalationTarget(this.categorizeError(error));
      await this.escalate(
        `Unhandled error: ${error.message}`,
        target,
        'Sev.2-High',
        { error: error.stack }
      );
    }

    return {
      status: 'failed',
      error: error.message,
    };
  }

  /**
   * Determine if error should trigger escalation
   */
  private shouldEscalate(error: Error): boolean {
    // Don't escalate if already an EscalationError
    if (error instanceof EscalationError) {
      return false;
    }

    // Escalate critical errors
    const criticalPatterns = [
      /security/i,
      /authentication/i,
      /authorization/i,
      /data loss/i,
      /corruption/i,
    ];

    return criticalPatterns.some((pattern) => pattern.test(error.message));
  }

  /**
   * Categorize error type for escalation routing
   */
  private categorizeError(error: Error): string {
    const message = error.message.toLowerCase();

    if (message.includes('security') || message.includes('vulnerability')) {
      return 'security';
    }
    if (message.includes('deploy') || message.includes('build')) {
      return 'deployment';
    }
    if (message.includes('architecture') || message.includes('design')) {
      return 'architecture';
    }

    return 'technical';
  }

  // ============================================================================
  // Utility Methods
  // ============================================================================

  /**
   * Log message with agent context (uses RichLogger)
   */
  protected log(message: string): void {
    const agentName = this.getAgentName();
    logger.agent(agentName, message);
  }

  /**
   * Ensure directory exists
   */
  protected async ensureDirectory(dirPath: string): Promise<void> {
    try {
      await fs.promises.mkdir(dirPath, { recursive: true });
    } catch (error) {
      // Directory might already exist
    }
  }

  /**
   * Append content to file
   */
  protected async appendToFile(filePath: string, content: string): Promise<void> {
    await this.ensureDirectory(path.dirname(filePath));

    try {
      await fs.promises.appendFile(filePath, content, 'utf-8');
    } catch (error) {
      logger.warning(`Failed to append to ${filePath}: ${error}`);
    }
  }

  /**
   * Execute shell command
   */
  protected async executeCommand(
    command: string,
    options: { cwd?: string; timeout?: number } = {}
  ): Promise<{ stdout: string; stderr: string; code: number }> {
    const { spawn } = await import('child_process');

    return new Promise((resolve, reject) => {
      const proc = spawn('sh', ['-c', command], {
        cwd: options.cwd || process.cwd(),
      });

      let stdout = '';
      let stderr = '';

      proc.stdout.on('data', (data) => {
        stdout += data.toString();
      });

      proc.stderr.on('data', (data) => {
        stderr += data.toString();
      });

      proc.on('close', (code) => {
        resolve({ stdout, stderr, code: code || 0 });
      });

      proc.on('error', (error) => {
        reject(error);
      });

      // Timeout handling
      if (options.timeout) {
        setTimeout(() => {
          proc.kill('SIGTERM');
          reject(new Error(`Command timeout after ${options.timeout}ms`));
        }, options.timeout);
      }
    });
  }

  /**
   * Sleep for specified milliseconds
   */
  protected sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Retry operation with exponential backoff
   */
  protected async retry<T>(
    operation: () => Promise<T>,
    maxRetries: number = 3,
    baseDelay: number = 1000
  ): Promise<T> {
    let lastError: Error | undefined;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error as Error;
        const delay = baseDelay * Math.pow(2, attempt);

        logger.warning(`Retry ${attempt + 1}/${maxRetries} after ${delay}ms: ${lastError.message}`);

        if (attempt < maxRetries - 1) {
          await this.sleep(delay);
        }
      }
    }

    throw lastError;
  }

  /**
   * Safely truncate a string without breaking Unicode surrogate pairs
   *
   * JavaScript strings are UTF-16, where some characters (like emojis) are
   * represented as surrogate pairs (two 16-bit code units). Using substring()
   * can break these pairs, creating invalid JSON.
   *
   * @param str - The string to truncate
   * @param maxLength - Maximum length in characters (not bytes)
   * @returns Safely truncated string
   */
  protected safeTruncate(str: string, maxLength: number): string {
    if (str.length <= maxLength) {
      return str;
    }

    // Truncate to maxLength
    let truncated = str.substring(0, maxLength);

    // Check if we cut in the middle of a surrogate pair
    // High surrogates are in range 0xD800-0xDBFF
    // Low surrogates are in range 0xDC00-0xDFFF
    const lastCharCode = truncated.charCodeAt(truncated.length - 1);

    // If the last character is a high surrogate (start of a pair), remove it
    if (lastCharCode >= 0xD800 && lastCharCode <= 0xDBFF) {
      truncated = truncated.substring(0, truncated.length - 1);
    }

    return truncated;
  }

  // ============================================================================
  // Getters
  // ============================================================================

  getAgentType(): AgentType {
    return this.agentType;
  }

  getCurrentTask(): Task | undefined {
    return this.currentTask;
  }

  getConfig(): AgentConfig {
    return this.config;
  }
}
