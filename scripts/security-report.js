#!/usr/bin/env tsx
/**
 * Security Report Generator
 *
 * Generates comprehensive weekly security reports including:
 * - npm audit results (vulnerability scanning)
 * - Dependabot alerts
 * - CodeQL analysis results
 * - Secret scanning alerts
 * - Security metrics and trends
 *
 * Usage:
 *   npm run security:report           # Generate and display report
 *   npm run security:report -- --save # Save to file
 *   npm run security:report -- --github # Create GitHub issue
 */
import { Octokit } from '@octokit/rest';
import { execSync } from 'child_process';
import { writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';
// -----------------------------------------------------------------------------
// Configuration
// -----------------------------------------------------------------------------
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const GITHUB_REPO = process.env.GITHUB_REPOSITORY || 'shunsukekyou/Autonomous-Operations';
const [owner, repo] = GITHUB_REPO.split('/');
// -----------------------------------------------------------------------------
// Utility Functions
// -----------------------------------------------------------------------------
/**
 * Execute npm audit and parse results
 */
function runNpmAudit() {
    console.log('🔍 Running npm audit...');
    try {
        const output = execSync('npm audit --json', {
            encoding: 'utf-8',
            stdio: ['pipe', 'pipe', 'pipe'], // Suppress stderr
        });
        return JSON.parse(output);
    }
    catch (error) {
        // npm audit exits with non-zero code if vulnerabilities found
        if (error.stdout) {
            try {
                return JSON.parse(error.stdout);
            }
            catch {
                console.warn('⚠️ Failed to parse npm audit output');
                return null;
            }
        }
        console.warn('⚠️ npm audit failed:', error.message);
        return null;
    }
}
/**
 * Fetch Dependabot alerts from GitHub
 */
async function fetchDependabotAlerts(octokit) {
    console.log('🔍 Fetching Dependabot alerts...');
    try {
        const { data } = await octokit.dependabot.listAlertsForRepo({
            owner,
            repo,
            state: 'open',
            per_page: 100,
        });
        return data;
    }
    catch (error) {
        console.warn('⚠️ Failed to fetch Dependabot alerts:', error.message);
        return [];
    }
}
/**
 * Fetch CodeQL alerts from GitHub
 */
async function fetchCodeQLAlerts(octokit) {
    console.log('🔍 Fetching CodeQL alerts...');
    try {
        const { data } = await octokit.codeScanning.listAlertsForRepo({
            owner,
            repo,
            state: 'open',
            per_page: 100,
        });
        return data;
    }
    catch (error) {
        console.warn('⚠️ Failed to fetch CodeQL alerts:', error.message);
        return [];
    }
}
/**
 * Fetch Secret Scanning alerts from GitHub
 */
async function fetchSecretScanningAlerts(octokit) {
    console.log('🔍 Fetching Secret Scanning alerts...');
    try {
        const { data } = await octokit.secretScanning.listAlertsForRepo({
            owner,
            repo,
            state: 'open',
            per_page: 100,
        });
        return data;
    }
    catch (error) {
        console.warn('⚠️ Failed to fetch Secret Scanning alerts:', error.message);
        return [];
    }
}
/**
 * Calculate security score (0-100)
 */
function calculateSecurityScore(report) {
    let score = 100;
    // Deduct points based on severity
    score -= report.summary.criticalCount * 40;
    score -= report.summary.highCount * 20;
    score -= report.summary.moderateCount * 10;
    score -= report.summary.lowCount * 5;
    // Minimum score is 0
    return Math.max(0, score);
}
/**
 * Generate recommendations based on findings
 */
function generateRecommendations(report) {
    const recommendations = [];
    if (report.summary.criticalCount > 0) {
        recommendations.push('🚨 **URGENT**: Fix critical vulnerabilities immediately');
    }
    if (report.summary.highCount > 0) {
        recommendations.push('⚠️ Address high-severity vulnerabilities within 7 days');
    }
    if (report.dependabotAlerts.length > 0) {
        recommendations.push(`📦 Review and merge ${report.dependabotAlerts.length} Dependabot PRs`);
    }
    if (report.codeqlAlerts.length > 0) {
        recommendations.push(`🔍 Review ${report.codeqlAlerts.length} CodeQL findings`);
    }
    if (report.secretScanningAlerts.length > 0) {
        recommendations.push(`🔐 **CRITICAL**: Rotate ${report.secretScanningAlerts.length} exposed secrets`);
    }
    if (report.summary.totalVulnerabilities === 0) {
        recommendations.push('✅ No vulnerabilities detected - keep up the good work!');
    }
    else if (report.summary.securityScore >= 80) {
        recommendations.push('✅ Security posture is good - continue monitoring');
    }
    else if (report.summary.securityScore >= 60) {
        recommendations.push('⚠️ Security posture needs improvement');
    }
    else {
        recommendations.push('🚨 Security posture requires immediate attention');
    }
    return recommendations;
}
/**
 * Format report as Markdown
 */
function formatReportAsMarkdown(report) {
    const lines = [];
    lines.push('# 🔒 Weekly Security Report');
    lines.push('');
    lines.push(`**Generated**: ${report.generatedAt}`);
    lines.push('');
    // Summary
    lines.push('## 📊 Summary');
    lines.push('');
    lines.push(`**Security Score**: ${report.summary.securityScore}/100`);
    lines.push('');
    lines.push('| Severity | Count |');
    lines.push('|----------|-------|');
    lines.push(`| Critical | ${report.summary.criticalCount} |`);
    lines.push(`| High     | ${report.summary.highCount} |`);
    lines.push(`| Moderate | ${report.summary.moderateCount} |`);
    lines.push(`| Low      | ${report.summary.lowCount} |`);
    lines.push(`| **Total** | **${report.summary.totalVulnerabilities}** |`);
    lines.push('');
    // npm audit results
    if (report.npmAudit) {
        lines.push('## 📦 npm Audit Results');
        lines.push('');
        const meta = report.npmAudit.metadata;
        if (meta.vulnerabilities.total > 0) {
            lines.push(`Found **${meta.vulnerabilities.total}** vulnerabilities:`);
            lines.push('');
            lines.push('| Severity | Count |');
            lines.push('|----------|-------|');
            lines.push(`| Critical | ${meta.vulnerabilities.critical} |`);
            lines.push(`| High     | ${meta.vulnerabilities.high} |`);
            lines.push(`| Moderate | ${meta.vulnerabilities.moderate} |`);
            lines.push(`| Low      | ${meta.vulnerabilities.low} |`);
            lines.push('');
            // List top vulnerabilities
            const vulns = Object.entries(report.npmAudit.vulnerabilities).slice(0, 5);
            if (vulns.length > 0) {
                lines.push('### Top Vulnerabilities');
                lines.push('');
                vulns.forEach(([name, details]) => {
                    lines.push(`- **${name}** (${details.severity})`);
                    lines.push(`  - Range: \`${details.range}\``);
                    lines.push(`  - Fix available: ${details.fixAvailable ? '✅' : '❌'}`);
                });
                lines.push('');
            }
        }
        else {
            lines.push('✅ No vulnerabilities found in npm dependencies');
            lines.push('');
        }
    }
    // Dependabot alerts
    if (report.dependabotAlerts.length > 0) {
        lines.push('## 🤖 Dependabot Alerts');
        lines.push('');
        lines.push(`Found **${report.dependabotAlerts.length}** open alerts:`);
        lines.push('');
        report.dependabotAlerts.slice(0, 10).forEach(alert => {
            const pkg = alert.security_vulnerability.package.name;
            const severity = alert.security_advisory.severity;
            const summary = alert.security_advisory.summary;
            const cve = alert.security_advisory.cve_id || 'N/A';
            lines.push(`### #${alert.number} - ${pkg} (${severity})`);
            lines.push(`- **Summary**: ${summary}`);
            lines.push(`- **CVE**: ${cve}`);
            lines.push(`- **Vulnerable Range**: \`${alert.security_vulnerability.vulnerable_version_range}\``);
            lines.push('');
        });
    }
    // CodeQL alerts
    if (report.codeqlAlerts.length > 0) {
        lines.push('## 🔍 CodeQL Alerts');
        lines.push('');
        lines.push(`Found **${report.codeqlAlerts.length}** open alerts:`);
        lines.push('');
        report.codeqlAlerts.slice(0, 10).forEach(alert => {
            const location = alert.most_recent_instance?.location;
            lines.push(`### #${alert.number} - ${alert.rule.id} (${alert.rule.severity})`);
            lines.push(`- **Description**: ${alert.rule.description}`);
            if (location) {
                lines.push(`- **Location**: \`${location.path}:${location.start_line}\``);
            }
            lines.push('');
        });
    }
    // Secret scanning alerts
    if (report.secretScanningAlerts.length > 0) {
        lines.push('## 🔐 Secret Scanning Alerts');
        lines.push('');
        lines.push(`🚨 **CRITICAL**: Found **${report.secretScanningAlerts.length}** exposed secrets!`);
        lines.push('');
        lines.push('**Immediate Actions Required**:');
        lines.push('1. Rotate all exposed secrets immediately');
        lines.push('2. Review commit history for unauthorized access');
        lines.push('3. Update secret management practices');
        lines.push('');
    }
    // Recommendations
    lines.push('## 💡 Recommendations');
    lines.push('');
    report.recommendations.forEach(rec => {
        lines.push(`- ${rec}`);
    });
    lines.push('');
    // Trends
    if (report.trends.weekOverWeek.vulnerabilities !== 0) {
        lines.push('## 📈 Trends (Week over Week)');
        lines.push('');
        const trend = report.trends.weekOverWeek.vulnerabilities;
        const emoji = trend > 0 ? '📈' : '📉';
        const direction = trend > 0 ? 'increased' : 'decreased';
        lines.push(`${emoji} Vulnerabilities ${direction} by ${Math.abs(trend)}`);
        lines.push(`✅ Fixed ${report.trends.weekOverWeek.fixed} issues this week`);
        lines.push('');
    }
    // Footer
    lines.push('---');
    lines.push('');
    lines.push('🤖 Generated by Security Report System');
    lines.push('Co-Authored-By: Claude <noreply@anthropic.com>');
    return lines.join('\n');
}
/**
 * Create GitHub issue with security report
 */
async function createGitHubIssue(octokit, report, markdown) {
    console.log('📝 Creating GitHub issue...');
    const title = `🔒 Weekly Security Report - ${new Date().toISOString().split('T')[0]}`;
    const labels = ['security', 'automated', 'report'];
    // Add priority label based on severity
    if (report.summary.criticalCount > 0) {
        labels.push('priority:critical');
    }
    else if (report.summary.highCount > 0) {
        labels.push('priority:high');
    }
    try {
        const { data } = await octokit.issues.create({
            owner,
            repo,
            title,
            body: markdown,
            labels,
        });
        console.log(`✅ Created issue #${data.number}: ${data.html_url}`);
    }
    catch (error) {
        console.error('❌ Failed to create GitHub issue:', error.message);
        throw error;
    }
}
// -----------------------------------------------------------------------------
// Main Function
// -----------------------------------------------------------------------------
async function main() {
    console.log('🔒 Security Report Generator');
    console.log('━'.repeat(50));
    console.log('');
    // Parse arguments
    const args = process.argv.slice(2);
    const saveToFile = args.includes('--save');
    const createIssue = args.includes('--github');
    // Initialize report
    const report = {
        generatedAt: new Date().toISOString(),
        summary: {
            totalVulnerabilities: 0,
            criticalCount: 0,
            highCount: 0,
            moderateCount: 0,
            lowCount: 0,
            securityScore: 100,
        },
        dependabotAlerts: [],
        codeqlAlerts: [],
        secretScanningAlerts: [],
        recommendations: [],
        trends: {
            weekOverWeek: {
                vulnerabilities: 0,
                fixed: 0,
            },
        },
    };
    // Run npm audit
    const auditResult = runNpmAudit();
    if (auditResult) {
        report.npmAudit = auditResult;
        const meta = auditResult.metadata.vulnerabilities;
        report.summary.criticalCount += meta.critical;
        report.summary.highCount += meta.high;
        report.summary.moderateCount += meta.moderate;
        report.summary.lowCount += meta.low;
    }
    // Fetch GitHub security data if token is available
    if (GITHUB_TOKEN) {
        const octokit = new Octokit({ auth: GITHUB_TOKEN });
        // Fetch alerts
        report.dependabotAlerts = await fetchDependabotAlerts(octokit);
        report.codeqlAlerts = await fetchCodeQLAlerts(octokit);
        report.secretScanningAlerts = await fetchSecretScanningAlerts(octokit);
        // Update summary
        report.dependabotAlerts.forEach(alert => {
            const severity = alert.security_advisory.severity.toLowerCase();
            if (severity === 'critical')
                report.summary.criticalCount++;
            else if (severity === 'high')
                report.summary.highCount++;
            else if (severity === 'moderate')
                report.summary.moderateCount++;
            else if (severity === 'low')
                report.summary.lowCount++;
        });
        report.codeqlAlerts.forEach(alert => {
            const severity = alert.rule.severity.toLowerCase();
            if (severity === 'critical' || severity === 'error')
                report.summary.criticalCount++;
            else if (severity === 'high' || severity === 'warning')
                report.summary.highCount++;
            else
                report.summary.moderateCount++;
        });
        // Secret scanning is always critical
        report.summary.criticalCount += report.secretScanningAlerts.length;
    }
    else {
        console.warn('⚠️ GITHUB_TOKEN not set - skipping GitHub security checks');
    }
    // Calculate totals
    report.summary.totalVulnerabilities =
        report.summary.criticalCount +
            report.summary.highCount +
            report.summary.moderateCount +
            report.summary.lowCount;
    // Calculate security score
    report.summary.securityScore = calculateSecurityScore(report);
    // Generate recommendations
    report.recommendations = generateRecommendations(report);
    // Format as markdown
    const markdown = formatReportAsMarkdown(report);
    // Display report
    console.log('');
    console.log(markdown);
    console.log('');
    // Save to file if requested
    if (saveToFile) {
        const reportsDir = join(process.cwd(), 'reports');
        if (!existsSync(reportsDir)) {
            mkdirSync(reportsDir, { recursive: true });
        }
        const filename = `security-report-${new Date().toISOString().split('T')[0]}.md`;
        const filepath = join(reportsDir, filename);
        writeFileSync(filepath, markdown, 'utf-8');
        console.log(`✅ Report saved to: ${filepath}`);
        console.log('');
    }
    // Create GitHub issue if requested
    if (createIssue && GITHUB_TOKEN) {
        const octokit = new Octokit({ auth: GITHUB_TOKEN });
        await createGitHubIssue(octokit, report, markdown);
    }
    // Exit with appropriate code
    if (report.summary.criticalCount > 0) {
        console.log('🚨 CRITICAL vulnerabilities detected!');
        process.exit(1);
    }
    else if (report.summary.highCount > 0) {
        console.log('⚠️ HIGH severity vulnerabilities detected');
        process.exit(1);
    }
    else {
        console.log('✅ Security check passed');
        process.exit(0);
    }
}
// -----------------------------------------------------------------------------
// Entry Point
// -----------------------------------------------------------------------------
main().catch(error => {
    console.error('❌ Error generating security report:', error);
    process.exit(1);
});
//# sourceMappingURL=security-report.js.map