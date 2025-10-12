/**
 * CoordinatorAgent - The Orchestrator of Autonomous Operations
 *
 * Responsibilities:
 * - Task decomposition (Issue → Tasks)
 * - DAG construction (dependency graph)
 * - Topological sorting
 * - Agent assignment
 * - Parallel execution control
 * - Progress monitoring
 *
 * This is the MOST IMPORTANT agent in the hierarchy.
 */
import { BaseAgent } from '../base-agent.js';
export class CoordinatorAgent extends BaseAgent {
    constructor(config) {
        super('CoordinatorAgent', config);
    }
    /**
     * Main execution: Coordinate full task lifecycle
     */
    async execute(task) {
        this.log('🎯 CoordinatorAgent starting orchestration');
        try {
            // 1. If task has issue reference, decompose it
            const issue = await this.fetchIssue(task);
            if (!issue) {
                return {
                    status: 'failed',
                    error: 'No Issue found for coordination',
                };
            }
            // 2. Decompose Issue into Tasks
            const decomposition = await this.decomposeIssue(issue);
            // 3. Build DAG and check for cycles
            const dag = decomposition.dag;
            if (decomposition.hasCycles) {
                await this.escalate(`Circular dependency detected in Issue #${issue.number}`, 'TechLead', 'Sev.2-High', { cycle: decomposition.tasks.map((t) => t.id) });
            }
            // 4. Create execution plan
            const plan = await this.createExecutionPlan(decomposition.tasks, dag);
            // 5. Execute tasks in parallel (respecting dependencies)
            const report = await this.executeParallel(plan);
            this.log(`✅ Orchestration complete: ${report.summary.successRate}% success rate`);
            return {
                status: 'success',
                data: report,
                metrics: {
                    taskId: task.id,
                    agentType: this.agentType,
                    durationMs: report.totalDurationMs,
                    timestamp: new Date().toISOString(),
                },
            };
        }
        catch (error) {
            this.log(`❌ Orchestration failed: ${error.message}`);
            throw error;
        }
    }
    // ============================================================================
    // Task Decomposition
    // ============================================================================
    /**
     * Decompose GitHub Issue into executable Tasks
     */
    async decomposeIssue(issue) {
        this.log(`🔍 Decomposing Issue #${issue.number}: ${issue.title}`);
        // Extract task information from Issue body
        const tasks = await this.extractTasks(issue);
        // Build dependency graph
        const dag = await this.buildDAG(tasks);
        // Check for circular dependencies
        const hasCycles = this.detectCycles(dag);
        // Estimate total duration
        const estimatedTotalDuration = tasks.reduce((sum, task) => sum + task.estimatedDuration, 0);
        // Generate recommendations
        const recommendations = this.generateRecommendations(tasks, dag);
        return {
            originalIssue: issue,
            tasks,
            dag,
            estimatedTotalDuration,
            hasCycles,
            recommendations,
        };
    }
    /**
     * Extract tasks from Issue body
     * Supports formats:
     * - [ ] Task description
     * - 1. Task description
     * - ## Task Title
     */
    async extractTasks(issue) {
        const tasks = [];
        const lines = issue.body.split('\n');
        let taskCounter = 0;
        for (const line of lines) {
            // Match checkbox tasks: - [ ] or - [x]
            const checkboxMatch = line.match(/^-\s*\[[ x]\]\s+(.+)$/i);
            if (checkboxMatch) {
                tasks.push(this.createTask(issue, checkboxMatch[1], taskCounter++));
                continue;
            }
            // Match numbered tasks: 1. Task or 1) Task
            const numberedMatch = line.match(/^\d+[\.)]\s+(.+)$/);
            if (numberedMatch) {
                tasks.push(this.createTask(issue, numberedMatch[1], taskCounter++));
                continue;
            }
            // Match heading tasks: ## Task Title
            const headingMatch = line.match(/^##\s+(.+)$/);
            if (headingMatch) {
                tasks.push(this.createTask(issue, headingMatch[1], taskCounter++));
                continue;
            }
        }
        // If no tasks found, create a single task from the issue
        if (tasks.length === 0) {
            tasks.push(this.createTask(issue, issue.title, 0));
        }
        this.log(`   Found ${tasks.length} tasks`);
        return tasks;
    }
    /**
     * Create Task from Issue information
     */
    createTask(issue, title, index) {
        // Detect dependencies in title (e.g., "Task A (depends: #270)")
        const dependencyMatch = title.match(/#(\d+)/g);
        const dependencies = dependencyMatch
            ? dependencyMatch.map((d) => d.replace('#', 'issue-'))
            : [];
        // Determine task type from labels or title
        const type = this.determineTaskType(issue.labels, title);
        // Determine severity
        const severity = this.determineSeverity(issue.labels);
        // Determine impact
        const impact = this.determineImpact(issue.labels);
        // Assign agent based on task type
        const assignedAgent = this.assignAgent(type);
        // Estimate duration (rough heuristic)
        const estimatedDuration = this.estimateDuration(title, type);
        return {
            id: `task-${issue.number}-${index}`,
            title: title.trim(),
            description: `Task from Issue #${issue.number}`,
            type,
            priority: index,
            severity,
            impact,
            assignedAgent,
            dependencies,
            estimatedDuration,
            status: 'idle',
            metadata: {
                issueNumber: issue.number,
                issueUrl: issue.url,
            },
        };
    }
    /**
     * Determine task type from labels or title
     */
    determineTaskType(labels, title) {
        const lowerTitle = title.toLowerCase();
        if (labels.includes('✨feature') || lowerTitle.includes('feature')) {
            return 'feature';
        }
        if (labels.includes('🐛bug') || lowerTitle.includes('bug') || lowerTitle.includes('fix')) {
            return 'bug';
        }
        if (labels.includes('🔧refactor') || lowerTitle.includes('refactor')) {
            return 'refactor';
        }
        if (labels.includes('📚documentation') || lowerTitle.includes('doc')) {
            return 'docs';
        }
        if (labels.includes('🧪test') || lowerTitle.includes('test')) {
            return 'test';
        }
        if (labels.includes('🚀deployment') || lowerTitle.includes('deploy')) {
            return 'deployment';
        }
        return 'feature'; // Default
    }
    /**
     * Determine severity from labels
     */
    determineSeverity(labels) {
        for (const label of labels) {
            if (label.includes('Sev.1-Critical'))
                return 'Sev.1-Critical';
            if (label.includes('Sev.2-High'))
                return 'Sev.2-High';
            if (label.includes('Sev.3-Medium'))
                return 'Sev.3-Medium';
            if (label.includes('Sev.4-Low'))
                return 'Sev.4-Low';
            if (label.includes('Sev.5-Trivial'))
                return 'Sev.5-Trivial';
        }
        return 'Sev.3-Medium'; // Default
    }
    /**
     * Determine impact from labels
     */
    determineImpact(labels) {
        for (const label of labels) {
            if (label.includes('影響度-Critical'))
                return 'Critical';
            if (label.includes('影響度-High'))
                return 'High';
            if (label.includes('影響度-Medium'))
                return 'Medium';
            if (label.includes('影響度-Low'))
                return 'Low';
        }
        return 'Medium'; // Default
    }
    /**
     * Assign Agent based on task type
     */
    assignAgent(type) {
        const agentMap = {
            feature: 'CodeGenAgent',
            bug: 'CodeGenAgent',
            refactor: 'CodeGenAgent',
            docs: 'CodeGenAgent',
            test: 'CodeGenAgent',
            deployment: 'DeploymentAgent',
        };
        return agentMap[type];
    }
    /**
     * Estimate task duration (minutes)
     */
    estimateDuration(title, type) {
        // Rough heuristics
        const baseEstimates = {
            feature: 60, // 1 hour
            bug: 30, // 30 min
            refactor: 45,
            docs: 20,
            test: 30,
            deployment: 15,
        };
        let estimate = baseEstimates[type];
        // Adjust based on keywords
        const lowerTitle = title.toLowerCase();
        if (lowerTitle.includes('large') || lowerTitle.includes('major')) {
            estimate *= 2;
        }
        if (lowerTitle.includes('quick') || lowerTitle.includes('minor')) {
            estimate *= 0.5;
        }
        return Math.round(estimate);
    }
    // ============================================================================
    // DAG Construction
    // ============================================================================
    /**
     * Build Directed Acyclic Graph from tasks
     */
    async buildDAG(tasks) {
        this.log('🔗 Building task dependency graph (DAG)');
        const nodes = tasks;
        const edges = [];
        // Build edges from dependencies
        for (const task of tasks) {
            for (const depId of task.dependencies) {
                // Find dependency task
                const depTask = tasks.find((t) => t.id === depId || t.metadata?.issueNumber === parseInt(depId.replace('issue-', '')));
                if (depTask) {
                    edges.push({ from: depTask.id, to: task.id });
                }
            }
        }
        // Topological sort
        const levels = this.topologicalSort(nodes, edges);
        this.log(`   Graph: ${nodes.length} nodes, ${edges.length} edges, ${levels.length} levels`);
        return { nodes, edges, levels };
    }
    /**
     * Topological sort - returns task IDs grouped by execution level
     */
    topologicalSort(tasks, edges) {
        const inDegree = new Map();
        const adjList = new Map();
        // Initialize
        for (const task of tasks) {
            inDegree.set(task.id, 0);
            adjList.set(task.id, []);
        }
        // Build adjacency list and in-degree count
        for (const edge of edges) {
            adjList.get(edge.from).push(edge.to);
            inDegree.set(edge.to, (inDegree.get(edge.to) || 0) + 1);
        }
        // Kahn's algorithm for topological sorting
        const levels = [];
        let currentLevel = tasks
            .filter((t) => inDegree.get(t.id) === 0)
            .map((t) => t.id);
        while (currentLevel.length > 0) {
            levels.push([...currentLevel]);
            const nextLevel = [];
            for (const taskId of currentLevel) {
                const neighbors = adjList.get(taskId) || [];
                for (const neighbor of neighbors) {
                    const newInDegree = (inDegree.get(neighbor) || 0) - 1;
                    inDegree.set(neighbor, newInDegree);
                    if (newInDegree === 0) {
                        nextLevel.push(neighbor);
                    }
                }
            }
            currentLevel = nextLevel;
        }
        return levels;
    }
    /**
     * Detect circular dependencies using DFS
     */
    detectCycles(dag) {
        const visited = new Set();
        const recursionStack = new Set();
        const adjList = new Map();
        for (const node of dag.nodes) {
            adjList.set(node.id, []);
        }
        for (const edge of dag.edges) {
            adjList.get(edge.from).push(edge.to);
        }
        const hasCycle = (nodeId) => {
            visited.add(nodeId);
            recursionStack.add(nodeId);
            const neighbors = adjList.get(nodeId) || [];
            for (const neighbor of neighbors) {
                if (!visited.has(neighbor)) {
                    if (hasCycle(neighbor))
                        return true;
                }
                else if (recursionStack.has(neighbor)) {
                    return true; // Cycle detected
                }
            }
            recursionStack.delete(nodeId);
            return false;
        };
        for (const node of dag.nodes) {
            if (!visited.has(node.id)) {
                if (hasCycle(node.id)) {
                    this.log(`🔴 Circular dependency detected!`);
                    return true;
                }
            }
        }
        this.log(`✅ No circular dependencies found`);
        return false;
    }
    /**
     * Generate recommendations for task execution
     */
    generateRecommendations(tasks, dag) {
        const recommendations = [];
        // Check for high parallelism opportunities
        const maxLevelSize = Math.max(...dag.levels.map((l) => l.length));
        if (maxLevelSize > 3) {
            recommendations.push(`High parallelism opportunity: Level with ${maxLevelSize} independent tasks`);
        }
        // Check for critical path
        const criticalTasks = tasks.filter((t) => t.severity === 'Sev.1-Critical' || t.impact === 'Critical');
        if (criticalTasks.length > 0) {
            recommendations.push(`${criticalTasks.length} critical tasks require immediate attention`);
        }
        // Check for long duration tasks
        const longTasks = tasks.filter((t) => t.estimatedDuration > 60);
        if (longTasks.length > 0) {
            recommendations.push(`${longTasks.length} tasks estimated >1 hour - consider breaking down`);
        }
        return recommendations;
    }
    // ============================================================================
    // Execution Planning & Control
    // ============================================================================
    /**
     * Create execution plan
     */
    async createExecutionPlan(tasks, dag) {
        const sessionId = `session-${Date.now()}`;
        const deviceIdentifier = this.config.deviceIdentifier || 'unknown';
        const concurrency = Math.min(tasks.length, 5); // Max 5 parallel
        const estimatedDuration = tasks.reduce((sum, task) => sum + task.estimatedDuration, 0);
        return {
            sessionId,
            deviceIdentifier,
            concurrency,
            tasks,
            dag,
            estimatedDuration,
            startTime: Date.now(),
        };
    }
    /**
     * Execute tasks in parallel (respecting DAG levels)
     */
    async executeParallel(plan) {
        this.log(`⚡ Starting parallel execution (concurrency: ${plan.concurrency})`);
        const results = [];
        const startTime = Date.now();
        // Execute level by level
        for (let levelIdx = 0; levelIdx < plan.dag.levels.length; levelIdx++) {
            const level = plan.dag.levels[levelIdx];
            this.log(`📍 Executing level ${levelIdx + 1}/${plan.dag.levels.length} (${level.length} tasks)`);
            // Execute tasks in this level in parallel
            const levelResults = await this.executeLevelParallel(level, plan.tasks, plan.concurrency);
            results.push(...levelResults);
            // Update progress
            this.logProgress(results, plan.tasks.length);
        }
        const endTime = Date.now();
        // Generate report
        const report = {
            sessionId: plan.sessionId,
            deviceIdentifier: plan.deviceIdentifier,
            startTime,
            endTime,
            totalDurationMs: endTime - startTime,
            summary: {
                total: plan.tasks.length,
                completed: results.filter((r) => r.status === 'completed').length,
                failed: results.filter((r) => r.status === 'failed').length,
                escalated: results.filter((r) => r.status === 'escalated').length,
                successRate: (results.filter((r) => r.status === 'completed').length / plan.tasks.length) * 100,
            },
            tasks: results,
            metrics: [],
            escalations: [],
        };
        // Save report
        await this.saveExecutionReport(report);
        return report;
    }
    /**
     * Execute all tasks in a level in parallel (OPTIMIZED: Real agent execution)
     *
     * Performance: Now calls actual specialist agents instead of simulation
     */
    async executeLevelParallel(taskIds, allTasks, _concurrency) {
        const tasks = taskIds
            .map((id) => allTasks.find((t) => t.id === id))
            .filter((t) => t !== undefined);
        // Execute real agents in parallel
        const results = await Promise.all(tasks.map(async (task) => {
            const startTime = Date.now();
            this.log(`   🏃 Executing: ${task.id} (${task.assignedAgent})`);
            try {
                // Instantiate and execute the appropriate specialist agent
                const agent = await this.createSpecialistAgent(task.assignedAgent);
                const result = await agent.execute(task);
                const durationMs = Date.now() - startTime;
                return {
                    taskId: task.id,
                    status: result.status === 'success' ? 'completed' : 'failed',
                    agentType: task.assignedAgent,
                    durationMs,
                    result,
                };
            }
            catch (error) {
                const durationMs = Date.now() - startTime;
                this.log(`   ❌ Task ${task.id} failed: ${error.message}`);
                return {
                    taskId: task.id,
                    status: 'failed',
                    agentType: task.assignedAgent,
                    durationMs,
                    result: {
                        status: 'failed',
                        error: error.message,
                    },
                };
            }
        }));
        return results;
    }
    /**
     * Create a specialist agent instance based on agent type
     */
    async createSpecialistAgent(agentType) {
        // Dynamically import agents to avoid circular dependencies
        switch (agentType) {
            case 'CodeGenAgent': {
                const { CodeGenAgent } = await import('../codegen/codegen-agent.js');
                return new CodeGenAgent(this.config);
            }
            case 'DeploymentAgent': {
                const { DeploymentAgent } = await import('../deployment/deployment-agent.js');
                return new DeploymentAgent(this.config);
            }
            case 'ReviewAgent': {
                const { ReviewAgent } = await import('../review/review-agent.js');
                return new ReviewAgent(this.config);
            }
            case 'IssueAgent': {
                const { IssueAgent } = await import('../issue/issue-agent.js');
                return new IssueAgent(this.config);
            }
            case 'PRAgent': {
                const { PRAgent } = await import('../pr/pr-agent.js');
                return new PRAgent(this.config);
            }
            default: {
                // Default to CodeGenAgent for unknown types
                const { CodeGenAgent } = await import('../codegen/codegen-agent.js');
                return new CodeGenAgent(this.config);
            }
        }
    }
    /**
     * Log execution progress
     */
    logProgress(results, total) {
        const completed = results.filter((r) => r.status === 'completed').length;
        const failed = results.filter((r) => r.status === 'failed').length;
        const running = 0; // Not tracked yet
        const waiting = total - results.length;
        this.log(`📊 Progress: Completed ${completed}/${total} | Running ${running} | Waiting ${waiting} | Failed ${failed}`);
    }
    /**
     * Save execution report to file
     */
    async saveExecutionReport(report) {
        const reportsDir = this.config.reportDirectory;
        await this.ensureDirectory(reportsDir);
        const timestamp = new Date().toISOString().replace(/:/g, '-');
        const reportFile = `${reportsDir}/execution-report-${timestamp}.json`;
        await this.appendToFile(reportFile, JSON.stringify(report, null, 2));
        this.log(`📄 Execution report saved: ${reportFile}`);
    }
    // ============================================================================
    // Helper Methods
    // ============================================================================
    /**
     * Fetch Issue from GitHub (or local metadata)
     */
    async fetchIssue(task) {
        // Check if task has issue metadata
        if (task.metadata?.issueNumber) {
            // TODO: Fetch from GitHub API
            // For now, return mock issue
            return {
                number: task.metadata.issueNumber,
                title: task.title,
                body: task.description,
                state: 'open',
                labels: [],
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                url: task.metadata.issueUrl || '',
            };
        }
        return null;
    }
}
//# sourceMappingURL=coordinator-agent.js.map