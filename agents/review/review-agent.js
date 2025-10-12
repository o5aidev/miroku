/**
 * ReviewAgent - Code Quality Assessment Agent
 *
 * Responsibilities:
 * - Static code analysis (ESLint, TypeScript)
 * - Security vulnerability scanning
 * - Quality scoring (0-100, passing threshold: 80)
 * - Review comments generation
 * - Escalation to CISO for critical security issues
 *
 * Scoring System:
 * - Base: 100 points
 * - ESLint error: -20 points each
 * - TypeScript error: -30 points each
 * - Critical security vulnerability: -40 points each
 * - Passing threshold: ≥80 points
 */
import { BaseAgent } from '../base-agent.js';
import * as fs from 'fs';
import * as path from 'path';
export class ReviewAgent extends BaseAgent {
    constructor(config) {
        super('ReviewAgent', config);
    }
    /**
     * Main execution: Review code and assess quality (OPTIMIZED: Parallel Analysis)
     *
     * Performance: 3x faster with parallel execution
     * - Before: 10-20s (ESLint) + 10-20s (TS) + 10-20s (Security) = 30-60s
     * - After: max(10-20s, 10-20s, 10-20s) = 10-20s
     */
    async execute(task) {
        this.log('🔍 ReviewAgent starting code review (parallel analysis)');
        try {
            // 1. Create review request from task
            const reviewRequest = await this.createReviewRequest(task);
            // 2. Run all analyses in parallel (3x faster!)
            this.log('⚡ Running ESLint, TypeScript, and Security scans in parallel');
            const [eslintIssues, typeScriptIssues, securityIssues] = await Promise.all([
                this.runESLint(reviewRequest.files),
                this.runTypeScriptCheck(reviewRequest.files),
                this.runSecurityScan(reviewRequest.files),
            ]);
            // 3. Calculate quality score
            const qualityReport = this.calculateQualityScore(eslintIssues, typeScriptIssues, securityIssues);
            // 4. Generate review comments
            const comments = this.generateReviewComments(eslintIssues, typeScriptIssues, securityIssues);
            // 5. Determine if escalation is needed
            const escalationRequired = await this.checkEscalation(qualityReport);
            const reviewResult = {
                qualityReport,
                approved: qualityReport.passed,
                escalationRequired,
                escalationTarget: escalationRequired ? this.determineEscalationTarget('security') : undefined,
                comments,
            };
            // 6. Escalate if critical security issues found
            if (escalationRequired) {
                await this.escalate(`Critical security issues found: ${securityIssues.filter(i => i.severity === 'critical').length} critical vulnerabilities`, 'CISO', 'Sev.1-Critical', {
                    qualityScore: qualityReport.score,
                    criticalIssues: securityIssues.filter(i => i.severity === 'critical').length,
                });
            }
            this.log(`✅ Review complete: Score ${qualityReport.score}/100 (${qualityReport.passed ? 'PASSED' : 'FAILED'})`);
            return {
                status: escalationRequired ? 'escalated' : 'success',
                data: reviewResult,
                metrics: {
                    taskId: task.id,
                    agentType: this.agentType,
                    durationMs: Date.now() - this.startTime,
                    qualityScore: qualityReport.score,
                    errorsFound: qualityReport.issues.length,
                    timestamp: new Date().toISOString(),
                },
            };
        }
        catch (error) {
            this.log(`❌ Review failed: ${error.message}`);
            throw error;
        }
    }
    // ============================================================================
    // Review Request Creation
    // ============================================================================
    /**
     * Create review request from task
     */
    async createReviewRequest(task) {
        this.log('📋 Creating review request');
        // Get files to review from task metadata or scan changed files
        let files = [];
        if (task.metadata?.files) {
            files = task.metadata.files;
        }
        else {
            // Scan for recently modified files
            files = await this.getRecentlyModifiedFiles();
        }
        return {
            files,
            branch: task.metadata?.branch || 'main',
            context: task.description || '',
        };
    }
    /**
     * Get recently modified TypeScript files
     */
    async getRecentlyModifiedFiles() {
        const files = [];
        const scanDir = async (dir) => {
            try {
                const entries = await fs.promises.readdir(dir, { withFileTypes: true });
                for (const entry of entries) {
                    const fullPath = path.join(dir, entry.name);
                    if (entry.isDirectory() && !entry.name.startsWith('.') && entry.name !== 'node_modules') {
                        await scanDir(fullPath);
                    }
                    else if (entry.isFile() && (entry.name.endsWith('.ts') || entry.name.endsWith('.tsx'))) {
                        files.push(fullPath);
                    }
                }
            }
            catch (error) {
                // Ignore errors
            }
        };
        await scanDir(process.cwd());
        return files;
    }
    // ============================================================================
    // Static Analysis - ESLint
    // ============================================================================
    /**
     * Run ESLint on files
     */
    async runESLint(files) {
        this.log('🔧 Running ESLint analysis');
        const issues = [];
        try {
            const result = await this.executeCommand('npx eslint --format json ' + files.map(f => `"${f}"`).join(' '), { timeout: 60000 });
            await this.logToolInvocation('eslint', result.code === 0 ? 'passed' : 'failed', `ESLint completed with ${result.code === 0 ? 'no' : 'some'} issues`, result.stdout);
            // Parse ESLint JSON output
            if (result.stdout) {
                try {
                    const eslintResults = JSON.parse(result.stdout);
                    for (const fileResult of eslintResults) {
                        for (const message of fileResult.messages || []) {
                            issues.push({
                                type: 'eslint',
                                severity: message.severity === 2 ? 'high' : 'medium',
                                message: message.message,
                                file: fileResult.filePath,
                                line: message.line,
                                column: message.column,
                                scoreImpact: message.severity === 2 ? 20 : 10,
                            });
                        }
                    }
                }
                catch (parseError) {
                    this.log(`⚠️  Failed to parse ESLint output`);
                }
            }
        }
        catch (error) {
            this.log(`⚠️  ESLint execution failed: ${error.message}`);
            await this.logToolInvocation('eslint', 'failed', 'ESLint execution error', undefined, error.message);
        }
        this.log(`   Found ${issues.length} ESLint issues`);
        return issues;
    }
    // ============================================================================
    // Static Analysis - TypeScript
    // ============================================================================
    /**
     * Run TypeScript type checking
     */
    async runTypeScriptCheck(_files) {
        this.log('📘 Running TypeScript type checking');
        const issues = [];
        try {
            const result = await this.executeCommand('npx tsc --noEmit --pretty false', { timeout: 60000 });
            await this.logToolInvocation('typescript', result.code === 0 ? 'passed' : 'failed', `TypeScript check ${result.code === 0 ? 'passed' : 'found errors'}`, result.stdout + result.stderr);
            // Parse TypeScript errors
            const errorPattern = /(.+?)\((\d+),(\d+)\):\s*error\s+TS\d+:\s*(.+)/g;
            const output = result.stdout + result.stderr;
            let match;
            while ((match = errorPattern.exec(output)) !== null) {
                issues.push({
                    type: 'typescript',
                    severity: 'high',
                    message: match[4].trim(),
                    file: match[1].trim(),
                    line: parseInt(match[2]),
                    column: parseInt(match[3]),
                    scoreImpact: 30,
                });
            }
        }
        catch (error) {
            this.log(`⚠️  TypeScript check failed: ${error.message}`);
            await this.logToolInvocation('typescript', 'failed', 'TypeScript check execution error', undefined, error.message);
        }
        this.log(`   Found ${issues.length} TypeScript errors`);
        return issues;
    }
    // ============================================================================
    // Security Scanning
    // ============================================================================
    /**
     * Run security vulnerability scan (OPTIMIZED: Parallel sub-scans)
     *
     * Performance: Runs all 3 security scans in parallel
     */
    async runSecurityScan(files) {
        this.log('🔒 Running security scan (parallel)');
        // Run all security scans in parallel
        const [secretIssues, vulnIssues, auditIssues] = await Promise.all([
            this.scanForSecrets(files),
            this.scanForVulnerabilities(files),
            this.runNpmAudit(),
        ]);
        const issues = [...secretIssues, ...vulnIssues, ...auditIssues];
        this.log(`   Found ${issues.length} security issues (${issues.filter(i => i.severity === 'critical').length} critical)`);
        return issues;
    }
    /**
     * Scan for hardcoded secrets
     */
    async scanForSecrets(files) {
        const issues = [];
        const secretPatterns = [
            { pattern: /(?:api[_-]?key|apikey)[\s]*[:=][\s]*['"]([^'"]+)['"]/gi, name: 'API Key' },
            { pattern: /(?:password|passwd|pwd)[\s]*[:=][\s]*['"]([^'"]+)['"]/gi, name: 'Password' },
            { pattern: /(?:secret|token)[\s]*[:=][\s]*['"]([^'"]+)['"]/gi, name: 'Secret/Token' },
            { pattern: /(?:sk-[a-zA-Z0-9]{20,})/g, name: 'Anthropic API Key' },
            { pattern: /(?:ghp_[a-zA-Z0-9]{36,})/g, name: 'GitHub Token' },
        ];
        for (const file of files) {
            try {
                const content = await fs.promises.readFile(file, 'utf-8');
                const lines = content.split('\n');
                for (let i = 0; i < lines.length; i++) {
                    const line = lines[i];
                    for (const { pattern, name } of secretPatterns) {
                        if (pattern.test(line)) {
                            issues.push({
                                type: 'security',
                                severity: 'critical',
                                message: `Possible hardcoded ${name} detected`,
                                file,
                                line: i + 1,
                                scoreImpact: 40,
                            });
                        }
                    }
                }
            }
            catch (error) {
                // Ignore file read errors
            }
        }
        return issues;
    }
    /**
     * Scan for common vulnerabilities
     */
    async scanForVulnerabilities(files) {
        const issues = [];
        const vulnPatterns = [
            { pattern: /eval\s*\(/g, name: 'Use of eval()', severity: 'critical' },
            { pattern: /innerHTML\s*=/g, name: 'XSS risk: innerHTML assignment', severity: 'high' },
            { pattern: /document\.write\s*\(/g, name: 'XSS risk: document.write', severity: 'high' },
            { pattern: /exec\s*\(/g, name: 'Command injection risk', severity: 'high' },
        ];
        for (const file of files) {
            try {
                const content = await fs.promises.readFile(file, 'utf-8');
                const lines = content.split('\n');
                for (let i = 0; i < lines.length; i++) {
                    const line = lines[i];
                    for (const { pattern, name, severity } of vulnPatterns) {
                        if (pattern.test(line)) {
                            issues.push({
                                type: 'security',
                                severity,
                                message: name,
                                file,
                                line: i + 1,
                                scoreImpact: severity === 'critical' ? 40 : 20,
                            });
                        }
                    }
                }
            }
            catch (error) {
                // Ignore file read errors
            }
        }
        return issues;
    }
    /**
     * Run npm audit for dependency vulnerabilities
     */
    async runNpmAudit() {
        const issues = [];
        try {
            const result = await this.executeCommand('npm audit --json', { timeout: 30000 });
            await this.logToolInvocation('npm_audit', result.code === 0 ? 'passed' : 'failed', 'npm audit completed', result.stdout);
            if (result.stdout) {
                try {
                    const audit = JSON.parse(result.stdout);
                    if (audit.vulnerabilities) {
                        for (const [pkgName, vuln] of Object.entries(audit.vulnerabilities)) {
                            const v = vuln;
                            if (v.severity === 'critical' || v.severity === 'high') {
                                issues.push({
                                    type: 'security',
                                    severity: v.severity,
                                    message: `Dependency vulnerability in ${pkgName}: ${v.via[0]?.title || 'Unknown issue'}`,
                                    scoreImpact: v.severity === 'critical' ? 40 : 20,
                                });
                            }
                        }
                    }
                }
                catch (parseError) {
                    // Ignore parse errors
                }
            }
        }
        catch (error) {
            this.log(`⚠️  npm audit failed: ${error.message}`);
        }
        return issues;
    }
    // ============================================================================
    // Quality Scoring
    // ============================================================================
    /**
     * Calculate overall quality score
     */
    calculateQualityScore(eslintIssues, typeScriptIssues, securityIssues) {
        this.log('📊 Calculating quality score');
        let score = 100;
        // Deduct points for each issue
        const allIssues = [...eslintIssues, ...typeScriptIssues, ...securityIssues];
        for (const issue of allIssues) {
            score -= issue.scoreImpact;
        }
        // Ensure score doesn't go below 0
        score = Math.max(0, score);
        // Calculate breakdown
        const eslintScore = 100 - eslintIssues.reduce((sum, i) => sum + i.scoreImpact, 0);
        const typeScriptScore = 100 - typeScriptIssues.reduce((sum, i) => sum + i.scoreImpact, 0);
        const securityScore = 100 - securityIssues.reduce((sum, i) => sum + i.scoreImpact, 0);
        // Generate recommendations
        const recommendations = [];
        if (eslintScore < 80)
            recommendations.push('Fix ESLint errors to improve code quality');
        if (typeScriptScore < 80)
            recommendations.push('Fix TypeScript errors for type safety');
        if (securityScore < 80)
            recommendations.push('Address security vulnerabilities immediately');
        if (score < 80)
            recommendations.push('Overall quality below threshold - review all issues');
        return {
            score: Math.round(score),
            passed: score >= 80,
            issues: allIssues,
            recommendations,
            breakdown: {
                eslintScore: Math.max(0, Math.round(eslintScore)),
                typeScriptScore: Math.max(0, Math.round(typeScriptScore)),
                securityScore: Math.max(0, Math.round(securityScore)),
                testCoverageScore: 100, // TODO: Implement actual coverage check
            },
        };
    }
    // ============================================================================
    // Review Comments
    // ============================================================================
    /**
     * Generate review comments for GitHub PR
     */
    generateReviewComments(eslintIssues, typeScriptIssues, securityIssues) {
        const comments = [];
        const allIssues = [...eslintIssues, ...typeScriptIssues, ...securityIssues];
        for (const issue of allIssues) {
            if (issue.file && issue.line) {
                comments.push({
                    file: issue.file,
                    line: issue.line,
                    severity: issue.severity,
                    message: `**[${issue.type.toUpperCase()}]** ${issue.message}`,
                    suggestion: this.generateSuggestion(issue),
                });
            }
        }
        return comments;
    }
    /**
     * Generate fix suggestion for issue
     */
    generateSuggestion(issue) {
        if (issue.type === 'security' && issue.message.includes('hardcoded')) {
            return 'Move this secret to environment variables using process.env.SECRET_NAME';
        }
        if (issue.type === 'security' && issue.message.includes('eval')) {
            return 'Replace eval() with safer alternatives like JSON.parse() or Function constructor';
        }
        if (issue.type === 'typescript' && issue.message.includes('implicitly has')) {
            return 'Add explicit type annotation';
        }
        return undefined;
    }
    // ============================================================================
    // Escalation
    // ============================================================================
    /**
     * Check if escalation is required
     */
    async checkEscalation(qualityReport) {
        // Escalate if critical security issues found
        const criticalSecurityIssues = qualityReport.issues.filter(i => i.type === 'security' && i.severity === 'critical');
        if (criticalSecurityIssues.length > 0) {
            this.log(`🚨 ${criticalSecurityIssues.length} critical security issues require escalation`);
            return true;
        }
        // Escalate if quality score is very low (<50)
        if (qualityReport.score < 50) {
            this.log(`🚨 Quality score ${qualityReport.score} is critically low - escalation required`);
            return true;
        }
        return false;
    }
}
//# sourceMappingURL=review-agent.js.map