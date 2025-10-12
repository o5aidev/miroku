/**
 * IssueAgent - GitHub Issue Analysis & Management Agent
 *
 * Responsibilities:
 * - Analyze GitHub Issues automatically
 * - Determine issue type (feature/bug/refactor/docs/test)
 * - Assess Severity (Sev.1-5)
 * - Assess Impact (Critical/High/Medium/Low)
 * - Apply Organizational (組織設計) theory label system (65 labels)
 * - Assign appropriate team members (via CODEOWNERS)
 * - Extract task dependencies
 *
 * Issue #41: Added retry logic with exponential backoff for all GitHub API calls
 */
import { BaseAgent } from '../base-agent.js';
import { withRetry } from '../../utils/retry.js';
import { getGitHubClient, withGitHubCache } from '../../utils/api-client.js';
export class IssueAgent extends BaseAgent {
    octokit;
    owner = '';
    repo = '';
    constructor(config) {
        super('IssueAgent', config);
        if (!config.githubToken) {
            throw new Error('GITHUB_TOKEN is required for IssueAgent');
        }
        // Use singleton GitHub client with connection pooling
        this.octokit = getGitHubClient(config.githubToken);
        // Parse repo from git remote
        this.parseRepository();
    }
    /**
     * Main execution: Analyze Issue and apply labels
     */
    async execute(task) {
        this.log('🔍 IssueAgent starting issue analysis');
        try {
            // 1. Fetch Issue from GitHub
            const issueNumber = task.metadata?.issueNumber;
            if (!issueNumber) {
                throw new Error('Issue number is required in task metadata');
            }
            const issue = await this.fetchIssue(issueNumber);
            // 2. Analyze Issue content
            const analysis = await this.analyzeIssue(issue);
            // 3-5. Apply labels, assign team members, and add comment (parallel for performance)
            await Promise.all([
                this.applyLabels(issueNumber, analysis.labels),
                this.assignTeamMembers(issueNumber, analysis.assignees),
                this.addAnalysisComment(issueNumber, analysis),
            ]);
            this.log(`✅ Issue analysis complete: ${analysis.labels.length} labels applied`);
            return {
                status: 'success',
                data: {
                    issue,
                    analysis,
                },
                metrics: {
                    taskId: task.id,
                    agentType: this.agentType,
                    durationMs: Date.now() - this.startTime,
                    timestamp: new Date().toISOString(),
                },
            };
        }
        catch (error) {
            this.log(`❌ Issue analysis failed: ${error.message}`);
            throw error;
        }
    }
    // ============================================================================
    // GitHub API Operations
    // ============================================================================
    /**
     * Fetch Issue from GitHub (with LRU cache + automatic retry)
     */
    async fetchIssue(issueNumber) {
        this.log(`📥 Fetching Issue #${issueNumber}`);
        try {
            // Use LRU cache to avoid repeated API calls for same issue
            const cacheKey = `issue:${this.owner}/${this.repo}/${issueNumber}`;
            const response = await withGitHubCache(cacheKey, async () => {
                return await withRetry(async () => {
                    return await this.octokit.issues.get({
                        owner: this.owner,
                        repo: this.repo,
                        issue_number: issueNumber,
                    });
                });
            });
            await this.logToolInvocation('github_api_get_issue', 'passed', `Fetched Issue #${issueNumber}`, this.safeTruncate(JSON.stringify(response.data), 500));
            return {
                number: response.data.number,
                title: response.data.title,
                body: response.data.body || '',
                state: response.data.state,
                labels: response.data.labels.map((l) => typeof l === 'string' ? l : l.name),
                assignee: response.data.assignee?.login,
                createdAt: response.data.created_at,
                updatedAt: response.data.updated_at,
                url: response.data.html_url,
            };
        }
        catch (error) {
            await this.logToolInvocation('github_api_get_issue', 'failed', `Failed to fetch Issue #${issueNumber}`, undefined, error.message);
            throw error;
        }
    }
    /**
     * Apply labels to Issue (with automatic retry on transient failures)
     */
    async applyLabels(issueNumber, labels) {
        this.log(`🏷️  Applying ${labels.length} labels to Issue #${issueNumber}`);
        try {
            await withRetry(async () => {
                await this.octokit.issues.addLabels({
                    owner: this.owner,
                    repo: this.repo,
                    issue_number: issueNumber,
                    labels,
                });
            });
            await this.logToolInvocation('github_api_add_labels', 'passed', `Applied labels: ${labels.join(', ')}`, labels.join(', '));
        }
        catch (error) {
            await this.logToolInvocation('github_api_add_labels', 'failed', 'Failed to apply labels', undefined, error.message);
            throw error;
        }
    }
    /**
     * Assign team members to Issue (with automatic retry on transient failures)
     */
    async assignTeamMembers(issueNumber, assignees) {
        if (assignees.length === 0)
            return;
        this.log(`👥 Assigning ${assignees.length} team members to Issue #${issueNumber}`);
        try {
            await withRetry(async () => {
                await this.octokit.issues.addAssignees({
                    owner: this.owner,
                    repo: this.repo,
                    issue_number: issueNumber,
                    assignees,
                });
            });
            await this.logToolInvocation('github_api_add_assignees', 'passed', `Assigned: ${assignees.join(', ')}`, assignees.join(', '));
        }
        catch (error) {
            await this.logToolInvocation('github_api_add_assignees', 'failed', 'Failed to assign team members', undefined, error.message);
            // Don't throw - assignment is optional
            this.log(`⚠️  Failed to assign: ${error.message}`);
        }
    }
    /**
     * Add analysis comment to Issue (with automatic retry on transient failures)
     */
    async addAnalysisComment(issueNumber, analysis) {
        this.log(`💬 Adding analysis comment to Issue #${issueNumber}`);
        const comment = this.formatAnalysisComment(analysis);
        try {
            await withRetry(async () => {
                await this.octokit.issues.createComment({
                    owner: this.owner,
                    repo: this.repo,
                    issue_number: issueNumber,
                    body: comment,
                });
            });
            await this.logToolInvocation('github_api_create_comment', 'passed', 'Added analysis comment', this.safeTruncate(comment, 200));
        }
        catch (error) {
            await this.logToolInvocation('github_api_create_comment', 'failed', 'Failed to add comment', undefined, error.message);
            // Don't throw - comment is optional
        }
    }
    // ============================================================================
    // Issue Analysis
    // ============================================================================
    /**
     * Analyze Issue and determine classification
     */
    async analyzeIssue(issue) {
        this.log('🧠 Analyzing Issue content');
        const analysis = {
            type: this.determineIssueType(issue),
            severity: this.determineSeverity(issue),
            impact: this.determineImpact(issue),
            responsibility: this.determineResponsibility(issue),
            agentType: 'CodeGenAgent', // Default
            labels: [],
            assignees: [],
            dependencies: this.extractDependencies(issue),
            estimatedDuration: 0,
        };
        // Determine appropriate Agent
        analysis.agentType = this.determineAgent(analysis.type);
        // Estimate duration
        analysis.estimatedDuration = this.estimateDuration(issue, analysis.type);
        // Build Organizational label set
        analysis.labels = this.buildLabelSet(analysis);
        // Determine assignees from CODEOWNERS or responsibility
        analysis.assignees = await this.determineAssignees(analysis);
        return analysis;
    }
    /**
     * Determine issue type from title and body
     */
    determineIssueType(issue) {
        const text = (issue.title + ' ' + issue.body).toLowerCase();
        // Check existing labels first
        for (const label of issue.labels) {
            if (label.includes('feature'))
                return 'feature';
            if (label.includes('bug'))
                return 'bug';
            if (label.includes('refactor'))
                return 'refactor';
            if (label.includes('documentation'))
                return 'docs';
            if (label.includes('test'))
                return 'test';
            if (label.includes('deployment'))
                return 'deployment';
        }
        // Keyword detection
        if (text.match(/\b(bug|fix|error|issue|problem|broken)\b/))
            return 'bug';
        if (text.match(/\b(feature|add|new|implement|create)\b/))
            return 'feature';
        if (text.match(/\b(refactor|cleanup|improve|optimize)\b/))
            return 'refactor';
        if (text.match(/\b(doc|documentation|readme|guide)\b/))
            return 'docs';
        if (text.match(/\b(test|spec|coverage)\b/))
            return 'test';
        if (text.match(/\b(deploy|release|ci|cd)\b/))
            return 'deployment';
        return 'feature'; // Default
    }
    /**
     * Determine Severity (Sev.1-5)
     */
    determineSeverity(issue) {
        const text = (issue.title + ' ' + issue.body).toLowerCase();
        // Check existing labels
        for (const label of issue.labels) {
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
        // Keyword-based detection
        if (text.match(/\b(critical|urgent|emergency|blocking|blocker|production|data loss|security breach)\b/)) {
            return 'Sev.1-Critical';
        }
        if (text.match(/\b(high priority|asap|important|major|broken)\b/)) {
            return 'Sev.2-High';
        }
        if (text.match(/\b(minor|small|trivial|typo|cosmetic)\b/)) {
            return 'Sev.4-Low';
        }
        if (text.match(/\b(nice to have|enhancement|suggestion)\b/)) {
            return 'Sev.5-Trivial';
        }
        return 'Sev.3-Medium'; // Default
    }
    /**
     * Determine Impact level
     */
    determineImpact(issue) {
        const text = (issue.title + ' ' + issue.body).toLowerCase();
        // Check existing labels
        for (const label of issue.labels) {
            if (label.includes('影響度-Critical'))
                return 'Critical';
            if (label.includes('影響度-High'))
                return 'High';
            if (label.includes('影響度-Medium'))
                return 'Medium';
            if (label.includes('影響度-Low'))
                return 'Low';
        }
        // Keyword-based detection
        if (text.match(/\b(all users|entire system|complete failure|data loss)\b/)) {
            return 'Critical';
        }
        if (text.match(/\b(many users|major feature|main functionality)\b/)) {
            return 'High';
        }
        if (text.match(/\b(some users|workaround exists|minor feature)\b/)) {
            return 'Medium';
        }
        return 'Low'; // Default
    }
    /**
     * Determine responsibility assignment
     */
    determineResponsibility(issue) {
        const text = (issue.title + ' ' + issue.body).toLowerCase();
        // Security issues → CISO
        if (text.match(/\b(security|vulnerability|exploit|breach|cve)\b/)) {
            return 'CISO';
        }
        // Architecture/design → TechLead
        if (text.match(/\b(architecture|design|pattern|refactor)\b/)) {
            return 'TechLead';
        }
        // Business/product → PO
        if (text.match(/\b(business|product|feature|requirement)\b/)) {
            return 'PO';
        }
        // DevOps/deployment → DevOps
        if (text.match(/\b(deploy|ci|cd|infrastructure|pipeline)\b/)) {
            return 'DevOps';
        }
        return 'Developer'; // Default
    }
    /**
     * Determine appropriate Agent
     */
    determineAgent(type) {
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
     * Extract dependency Issue numbers (#123 format)
     */
    extractDependencies(issue) {
        const dependencyPattern = /#(\d+)/g;
        const matches = [...issue.body.matchAll(dependencyPattern)];
        return matches.map(m => `issue-${m[1]}`);
    }
    /**
     * Estimate task duration (minutes)
     */
    estimateDuration(issue, type) {
        const baseEstimates = {
            feature: 120,
            bug: 60,
            refactor: 90,
            docs: 30,
            test: 45,
            deployment: 30,
        };
        let estimate = baseEstimates[type];
        // Adjust based on complexity indicators
        const text = (issue.title + ' ' + issue.body).toLowerCase();
        if (text.match(/\b(large|major|complex|multiple)\b/))
            estimate *= 2;
        if (text.match(/\b(quick|small|minor|simple)\b/))
            estimate *= 0.5;
        return Math.round(estimate);
    }
    // ============================================================================
    // Organizational Label System (組織設計原則65ラベル体系)
    // ============================================================================
    /**
     * Build complete label set based on Organizational theory
     */
    buildLabelSet(analysis) {
        const labels = [];
        // 1. Issue Type (業務カテゴリ)
        const typeLabels = {
            feature: '✨feature',
            bug: '🐛bug',
            refactor: '🔧refactor',
            docs: '📚documentation',
            test: '🧪test',
            deployment: '🚀deployment',
        };
        labels.push(typeLabels[analysis.type]);
        // 2. Severity (深刻度)
        labels.push(`${this.getSeverityEmoji(analysis.severity)}${analysis.severity}`);
        // 3. Impact (影響度)
        labels.push(`📊影響度-${analysis.impact}`);
        // 4. Responsibility (責任者)
        const responsibilityLabels = {
            Developer: '👤担当-開発者',
            TechLead: '👥担当-テックリード',
            PO: '👑担当-PO',
            CISO: '👑担当-PO', // Map to PO for now
            DevOps: '👤担当-開発者',
            AIAgent: '🤖担当-AI Agent',
        };
        labels.push(responsibilityLabels[analysis.responsibility]);
        // 5. Agent Type
        const agentLabels = {
            CoordinatorAgent: '🎯CoordinatorAgent',
            CodeGenAgent: '🤖CodeGenAgent',
            ReviewAgent: '🔍ReviewAgent',
            IssueAgent: '📋IssueAgent',
            PRAgent: '🔀PRAgent',
            DeploymentAgent: '🚀DeploymentAgent',
            AutoFixAgent: '🔧AutoFixAgent',
        };
        labels.push(agentLabels[analysis.agentType]);
        // 6. Security flag if responsibility is CISO
        if (analysis.responsibility === 'CISO') {
            labels.push('🔒Security-審査必要');
        }
        return labels;
    }
    /**
     * Get emoji for Severity
     */
    getSeverityEmoji(severity) {
        const emojiMap = {
            'Sev.1-Critical': '🔥',
            'Sev.2-High': '⭐',
            'Sev.3-Medium': '➡️',
            'Sev.4-Low': '🟢',
            'Sev.5-Trivial': '⬇️',
        };
        return emojiMap[severity];
    }
    /**
     * Determine assignees from CODEOWNERS or responsibility
     */
    async determineAssignees(analysis) {
        const assignees = [];
        // Map responsibility to GitHub usernames (from config)
        const responsibilityMap = {
            Developer: undefined, // Let CODEOWNERS handle
            TechLead: this.config.techLeadGithubUsername,
            PO: this.config.poGithubUsername,
            CISO: this.config.cisoGithubUsername,
            DevOps: undefined,
            AIAgent: undefined,
        };
        const assignee = responsibilityMap[analysis.responsibility];
        if (assignee) {
            assignees.push(assignee);
        }
        return assignees;
    }
    // ============================================================================
    // Comment Formatting
    // ============================================================================
    /**
     * Format analysis comment for GitHub
     */
    formatAnalysisComment(analysis) {
        return `## 🤖 IssueAgent Analysis

**Issue Type**: ${analysis.type}
**Severity**: ${analysis.severity}
**Impact**: ${analysis.impact}
**Responsibility**: ${analysis.responsibility}
**Assigned Agent**: ${analysis.agentType}
**Estimated Duration**: ${analysis.estimatedDuration} minutes

### Applied Labels
${analysis.labels.map(l => `- \`${l}\``).join('\n')}

${analysis.dependencies.length > 0 ? `### Dependencies
${analysis.dependencies.map(d => `- #${d.replace('issue-', '')}`).join('\n')}` : ''}

---

🤖 Generated with Claude Code
Co-Authored-By: Claude <noreply@anthropic.com>`;
    }
    // ============================================================================
    // Repository Parsing
    // ============================================================================
    /**
     * Parse repository owner and name from git remote
     */
    parseRepository() {
        try {
            // Try to read from package.json or git config
            // For now, set defaults
            this.owner = 'user';
            this.repo = 'repository';
            // TODO: Implement actual parsing from git remote
            this.log(`📦 Repository: ${this.owner}/${this.repo}`);
        }
        catch (error) {
            this.log(`⚠️  Failed to parse repository: ${error.message}`);
        }
    }
}
//# sourceMappingURL=issue-agent.js.map