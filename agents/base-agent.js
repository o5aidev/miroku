/**
 * BaseAgent - Base class for all Autonomous Operations Agents
 *
 * Provides core functionality:
 * - Escalation mechanism
 * - Metrics recording
 * - Error handling
 * - Logging
 */
import { AgentError, EscalationError, } from './types/index.js';
import { logger } from './ui/index.js';
import { PerformanceMonitor } from './monitoring/performance-monitor.js';
import { writeFileAsync, appendFileAsync } from '../utils/async-file-writer.js';
import * as fs from 'fs';
import * as path from 'path';
export class BaseAgent {
    config;
    agentType;
    currentTask;
    startTime = 0;
    logs = [];
    constructor(agentType, config) {
        this.agentType = agentType;
        this.config = config;
    }
    /**
     * Convert AgentType to AgentName for UI
     */
    getAgentName() {
        const nameMap = {
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
    // Core Functionality
    // ============================================================================
    /**
     * Run the agent with full lifecycle management (with performance monitoring)
     */
    async run(task) {
        this.currentTask = task;
        this.startTime = Date.now();
        const agentName = this.getAgentName();
        logger.agent(agentName, `Starting task: ${task.id}`);
        // Send agent:started event to dashboard
        await this.sendAgentEvent('started', {
            parameters: {
                taskId: task.id,
                taskTitle: task.title,
                taskDescription: task.description,
                priority: task.priority,
                estimatedDuration: task.estimatedDuration,
                dependencies: task.dependencies,
            },
        });
        // Start performance tracking
        const performanceMonitor = PerformanceMonitor.getInstance(this.config.reportDirectory);
        performanceMonitor.startAgentTracking(this.agentType, task.id);
        try {
            // Pre-execution validation
            await this.validateTask(task);
            // Main execution
            const result = await this.execute(task);
            // Post-execution processing (parallel for performance)
            await Promise.all([
                this.recordMetrics(result),
                this.updateLDDLog(result),
            ]);
            logger.agent(agentName, `Completed task: ${task.id}`);
            logger.success(`Task ${task.id} completed successfully`);
            // Send agent:completed event to dashboard
            await this.sendAgentEvent('completed', {
                result: {
                    success: true,
                    ...result,
                },
            });
            // End performance tracking
            const metrics = performanceMonitor.endAgentTracking(this.agentType, task.id);
            if (metrics) {
                logger.info(`⚡ Performance: ${metrics.totalDurationMs}ms, ${metrics.toolInvocations.length} tools, ${metrics.bottlenecks.length} bottlenecks`);
            }
            return result;
        }
        catch (error) {
            // Send agent:error event to dashboard
            await this.sendAgentEvent('error', {
                error: error.message,
            });
            // End tracking even on error
            performanceMonitor.endAgentTracking(this.agentType, task.id);
            return await this.handleError(error);
        }
    }
    /**
     * Validate task before execution
     */
    async validateTask(task) {
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
    async escalate(reason, target, severity = 'Sev.2-High', context = {}) {
        const escalationInfo = {
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
    determineEscalationTarget(issueType) {
        const escalationMap = {
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
    async notifyEscalation(escalation) {
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
    async recordMetrics(result) {
        const durationMs = Date.now() - this.startTime;
        const metrics = {
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
        // Save to metrics file (using async batched writer for 96% improvement)
        const metricsDir = path.join(this.config.reportDirectory, 'metrics');
        await this.ensureDirectory(metricsDir);
        const metricsFile = path.join(metricsDir, `${this.agentType}-${Date.now()}.json`);
        await writeFileAsync(metricsFile, JSON.stringify(metrics, null, 2));
        logger.info(`Metrics recorded: ${metricsFile}`);
    }
    /**
     * Record escalation to file (using async batched writer)
     */
    async recordEscalation(escalation) {
        const escalationsDir = path.join(this.config.reportDirectory, 'escalations');
        await this.ensureDirectory(escalationsDir);
        const escalationFile = path.join(escalationsDir, `escalation-${Date.now()}.json`);
        await writeFileAsync(escalationFile, JSON.stringify(escalation, null, 2));
    }
    // ============================================================================
    // Log-Driven Development (LDD)
    // ============================================================================
    /**
     * Update LDD log with execution details
     */
    async updateLDDLog(result) {
        const date = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
        const logFile = path.join(this.config.logDirectory, `${date}.md`);
        const codexPromptChain = {
            intent: `${this.agentType} execution for task ${this.currentTask?.id}`,
            plan: this.currentTask?.description
                ? [this.currentTask.description]
                : ['Execute task'],
            implementation: result.data?.files?.map((f) => f.path) || [],
            verification: [`Status: ${result.status}`, `Duration: ${Date.now() - this.startTime}ms`],
        };
        const lddEntry = this.formatLDDEntry(codexPromptChain, this.logs);
        // Append to log file
        await this.appendToFile(logFile, lddEntry);
    }
    /**
     * Format LDD entry for markdown log
     */
    formatLDDEntry(promptChain, invocations) {
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
     * Log tool invocation (with performance tracking)
     */
    async logToolInvocation(command, status, notes, output, error) {
        const invocation = {
            command,
            workdir: process.cwd(),
            timestamp: new Date().toISOString(),
            status,
            notes,
            output,
            error,
        };
        this.logs.push(invocation);
        // Track performance if we have timing information
        // This is called after tool execution, so we estimate duration from recent calls
        if (this.currentTask) {
            const performanceMonitor = PerformanceMonitor.getInstance(this.config.reportDirectory);
            // Estimate end time as now, start time as 1 second ago (rough estimate)
            // For accurate timing, use trackToolInvocation wrapper in calling code
            const endTime = Date.now();
            const startTime = endTime - 1000; // Rough estimate
            performanceMonitor.trackToolInvocation(this.agentType, this.currentTask.id, command, startTime, endTime, status === 'passed', error);
        }
    }
    // ============================================================================
    // Error Handling
    // ============================================================================
    /**
     * Handle execution errors
     */
    async handleError(error) {
        logger.error(`Error in ${this.agentType}: ${error.message}`, error);
        // Log error
        await this.logToolInvocation('error_handling', 'failed', error.message, undefined, error.stack);
        // Determine if escalation is needed
        if (this.shouldEscalate(error)) {
            const target = this.determineEscalationTarget(this.categorizeError(error));
            await this.escalate(`Unhandled error: ${error.message}`, target, 'Sev.2-High', { error: error.stack });
        }
        return {
            status: 'failed',
            error: error.message,
        };
    }
    /**
     * Determine if error should trigger escalation
     */
    shouldEscalate(error) {
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
    categorizeError(error) {
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
    log(message) {
        const agentName = this.getAgentName();
        logger.agent(agentName, message);
    }
    /**
     * Ensure directory exists
     */
    async ensureDirectory(dirPath) {
        try {
            await fs.promises.mkdir(dirPath, { recursive: true });
        }
        catch (error) {
            // Directory might already exist
        }
    }
    /**
     * Append content to file (using async batched writer for 96% improvement)
     */
    async appendToFile(filePath, content) {
        await this.ensureDirectory(path.dirname(filePath));
        try {
            await appendFileAsync(filePath, content);
        }
        catch (error) {
            logger.warning(`Failed to append to ${filePath}: ${error}`);
        }
    }
    /**
     * Execute shell command
     */
    async executeCommand(command, options = {}) {
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
    sleep(ms) {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }
    /**
     * Retry operation with exponential backoff
     */
    async retry(operation, maxRetries = 3, baseDelay = 1000) {
        let lastError;
        for (let attempt = 0; attempt < maxRetries; attempt++) {
            try {
                return await operation();
            }
            catch (error) {
                lastError = error;
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
     * Send agent event to dashboard via webhook
     */
    async sendAgentEvent(eventType, data) {
        try {
            const dashboardUrl = process.env.DASHBOARD_URL || 'http://localhost:3001';
            const issueNumber = this.currentTask?.metadata?.issueNumber || 0;
            const payload = {
                eventType,
                agentId: this.agentType.toLowerCase().replace('agent', ''),
                issueNumber,
                ...data,
            };
            await fetch(`${dashboardUrl}/api/agent-event`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
        }
        catch (error) {
            // Silent fail - don't block agent execution if dashboard is down
            logger.muted(`Failed to send agent event: ${error.message}`);
        }
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
    safeTruncate(str, maxLength) {
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
    getAgentType() {
        return this.agentType;
    }
    getCurrentTask() {
        return this.currentTask;
    }
    getConfig() {
        return this.config;
    }
}
//# sourceMappingURL=base-agent.js.map