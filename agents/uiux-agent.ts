/**
 * UIUXAgent - Frontend UI/UX Optimization Agent
 *
 * Responsibilities:
 * - UI/UX debugging with dev3000 integration
 * - Performance optimization (Core Web Vitals, Lighthouse)
 * - Accessibility validation (WCAG 2.1 Level AA)
 * - Responsive design verification
 * - UI regression testing
 *
 * Character Name: みためん (Mitamen)
 * Color: 🟢 実行役 (Executor)
 * Parallel Execution: ✅ Possible with other executors/analyzers
 */

import { BaseAgent } from './base-agent.js';
import type { AgentResult, Task, AgentConfig } from './types/index.js';
import * as path from 'path';
import * as fs from 'fs/promises';

interface UIUXMetrics {
  performance: number;
  accessibility: number;
  bestPractices: number;
  seo: number;
  coreWebVitals: {
    lcp: number;
    fid: number;
    cls: number;
  };
  issues: {
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
}

interface UIUXReportData {
  metrics: UIUXMetrics;
  lighthouseReport?: string;
  accessibilityViolations: Array<{
    id: string;
    impact: string;
    description: string;
    nodes: Array<{ html: string; target: string[] }>;
  }>;
  responsiveIssues: Array<{
    device: string;
    status: 'pass' | 'warning' | 'fail';
    issues: string[];
  }>;
  improvements: Array<{
    priority: 'critical' | 'high' | 'medium' | 'low';
    title: string;
    description: string;
    fixCode?: string;
  }>;
}

export class UIUXAgent extends BaseAgent {
  constructor(config: AgentConfig) {
    super('UIUXAgent', config);
  }

  /**
   * Main execution method for UI/UX validation
   */
  async execute(task: Task): Promise<AgentResult> {
    this.log('🎨 UIUXAgent (みためん) starting UI/UX validation');

    try {
      const startTime = Date.now();

      // Phase 1: Validate task requirements
      await this.validateUIUXTask(task);

      // Phase 2: Run UI/UX validation suite
      const reportData = await this.runUIUXValidation(task);

      // Phase 3: Generate detailed report
      const reportPath = await this.generateUIUXReport(task, reportData);

      // Phase 4: Record metrics
      const duration = Date.now() - startTime;

      this.log(`✅ UI/UX validation completed in ${duration}ms`);
      this.log(`📊 Performance: ${reportData.metrics.performance}/100`);
      this.log(`♿ Accessibility: ${reportData.metrics.accessibility}/100`);

      // Check if validation passed
      const passed = this.isValidationPassed(reportData.metrics);

      if (!passed) {
        this.log(`⚠️ UI/UX validation requires improvements`);
        this.log(`   Critical: ${reportData.metrics.issues.critical}`);
        this.log(`   High: ${reportData.metrics.issues.high}`);
      }

      return {
        status: passed ? 'success' : 'needs_improvement',
        data: {
          reportPath,
          metrics: reportData.metrics,
          passed,
          improvementsCount: reportData.improvements.length,
        },
        metrics: {
          taskId: task.id,
          agentType: this.agentType,
          durationMs: duration,
          qualityScore: this.calculateOverallScore(reportData.metrics),
          timestamp: new Date().toISOString(),
        },
      };
    } catch (error) {
      await this.escalate(
        `UI/UX validation failed: ${(error as Error).message}`,
        'TechLead',
        'Sev.2-High',
        { error: (error as Error).stack },
      );
      throw error;
    }
  }

  /**
   * Validate task requirements for UI/UX validation
   */
  private async validateUIUXTask(task: Task): Promise<void> {
    this.log('🔍 Validating UI/UX task requirements');

    // Check if task involves frontend changes
    const frontendPatterns = [
      /frontend/i,
      /ui/i,
      /ux/i,
      /design/i,
      /component/i,
      /page/i,
      /style/i,
      /css/i,
      /accessibility/i,
      /responsive/i,
    ];

    const isFrontendTask = frontendPatterns.some(pattern =>
      pattern.test(task.title) || pattern.test(task.description || ''),
    );

    if (!isFrontendTask) {
      this.log('⚠️ Warning: Task does not appear to be a frontend task');
    }

    // Check if dev server can be started
    const hasDevScript = await this.checkDevScript();
    if (!hasDevScript) {
      this.log('⚠️ Warning: No dev script found in package.json');
    }
  }

  /**
   * Check if package.json has a dev script
   */
  private async checkDevScript(): Promise<boolean> {
    try {
      const packageJsonPath = path.join(process.cwd(), 'package.json');
      const content = await fs.readFile(packageJsonPath, 'utf-8');
      const packageJson = JSON.parse(content) as { scripts?: { dev?: string; start?: string } };
      return Boolean(packageJson.scripts?.dev) || Boolean(packageJson.scripts?.start);
    } catch {
      return false;
    }
  }

  /**
   * Run comprehensive UI/UX validation suite
   *
   * This method coordinates multiple validation steps:
   * 1. dev3000 integration debugging
   * 2. Lighthouse performance audit
   * 3. Accessibility validation (axe-core)
   * 4. Responsive design verification
   * 5. UI regression testing
   *
   * NOTE: Actual validation is performed in Worktree by Claude Code session
   * This method provides the orchestration and result aggregation
   */
  private async runUIUXValidation(_task: Task): Promise<UIUXReportData> {
    this.log('🚀 Running UI/UX validation suite');

    // Placeholder for actual validation results
    // In production, this would:
    // 1. Start dev3000 for integrated logging
    // 2. Run Lighthouse audit
    // 3. Execute Playwright accessibility tests
    // 4. Perform responsive design tests
    // 5. Capture screenshots and metrics

    const reportData: UIUXReportData = {
      metrics: {
        performance: 0,
        accessibility: 0,
        bestPractices: 0,
        seo: 0,
        coreWebVitals: {
          lcp: 0,
          fid: 0,
          cls: 0,
        },
        issues: {
          critical: 0,
          high: 0,
          medium: 0,
          low: 0,
        },
      },
      accessibilityViolations: [],
      responsiveIssues: [],
      improvements: [],
    };

    // Check if .uiux directory exists (created by Worktree Claude Code session)
    const uiuxDir = path.join(process.cwd(), '.uiux');
    const dirExists = await fs.access(uiuxDir).then(() => true).catch(() => false);

    if (dirExists) {
      this.log('📁 Found .uiux directory, loading validation results');
      await this.loadValidationResults(uiuxDir, reportData);
    } else {
      this.log('⚠️ No .uiux directory found');
      this.log('   UI/UX validation should be performed in Worktree');
      this.log('   See: .claude/agents/prompts/coding/uiux-agent-prompt.md');
    }

    return reportData;
  }

  /**
   * Load validation results from .uiux directory
   */
  private async loadValidationResults(
    uiuxDir: string,
    reportData: UIUXReportData,
  ): Promise<void> {
    try {
      // Load Lighthouse report
      const lighthouseFile = path.join(uiuxDir, 'lighthouse-report.json');
      const lighthouseExists = await fs.access(lighthouseFile).then(() => true).catch(() => false);

      if (lighthouseExists) {
        const lighthouseContent = await fs.readFile(lighthouseFile, 'utf-8');
        const lighthouse = JSON.parse(lighthouseContent) as {
          categories?: {
            performance?: { score: number };
            accessibility?: { score: number };
            'best-practices'?: { score: number };
            seo?: { score: number };
          };
          audits?: {
            'largest-contentful-paint'?: { numericValue: number };
            'max-potential-fid'?: { numericValue: number };
            'cumulative-layout-shift'?: { numericValue: number };
          };
        };
        reportData.metrics.performance = Math.round((lighthouse.categories?.performance?.score ?? 0) * 100);
        reportData.metrics.accessibility = Math.round((lighthouse.categories?.accessibility?.score ?? 0) * 100);
        reportData.metrics.bestPractices = Math.round((lighthouse.categories?.['best-practices']?.score ?? 0) * 100);
        reportData.metrics.seo = Math.round((lighthouse.categories?.seo?.score ?? 0) * 100);

        // Extract Core Web Vitals
        reportData.metrics.coreWebVitals.lcp = (lighthouse.audits?.['largest-contentful-paint']?.numericValue ?? 0) / 1000;
        reportData.metrics.coreWebVitals.fid = lighthouse.audits?.['max-potential-fid']?.numericValue ?? 0;
        reportData.metrics.coreWebVitals.cls = lighthouse.audits?.['cumulative-layout-shift']?.numericValue ?? 0;

        this.log(`✅ Loaded Lighthouse report`);
      }

      // Load accessibility results
      const a11yFile = path.join(uiuxDir, 'accessibility.json');
      const a11yExists = await fs.access(a11yFile).then(() => true).catch(() => false);

      if (a11yExists) {
        const a11yContent = await fs.readFile(a11yFile, 'utf-8');
        const a11y = JSON.parse(a11yContent) as { violations?: UIUXReportData['accessibilityViolations'] };
        reportData.accessibilityViolations = a11y.violations ?? [];

        // Count issues by impact
        reportData.accessibilityViolations.forEach(violation => {
          const impact = violation.impact?.toLowerCase() ?? 'low';
          if (impact === 'critical') {reportData.metrics.issues.critical++;} else if (impact === 'serious' || impact === 'high') {reportData.metrics.issues.high++;} else if (impact === 'moderate' || impact === 'medium') {reportData.metrics.issues.medium++;} else {reportData.metrics.issues.low++;}
        });

        this.log(`✅ Loaded accessibility results (${reportData.accessibilityViolations.length} violations)`);
      }
    } catch (error) {
      this.log(`⚠️ Warning: Failed to load validation results: ${(error as Error).message}`);
    }
  }

  /**
   * Generate comprehensive UI/UX report
   */
  private async generateUIUXReport(
    task: Task,
    reportData: UIUXReportData,
  ): Promise<string> {
    this.log('📝 Generating UI/UX report');

    const uiuxDir = path.join(this.config.reportDirectory, 'uiux');
    await this.ensureDirectory(uiuxDir);

    const issueNumber = task.metadata?.issueNumber || 'unknown';
    const reportPath = path.join(uiuxDir, `uiux-report-${issueNumber}.md`);

    const report = this.formatUIUXReport(task, reportData);
    await fs.writeFile(reportPath, report, 'utf-8');

    this.log(`✅ Report generated: ${reportPath}`);

    return reportPath;
  }

  /**
   * Format UI/UX report in Markdown
   */
  private formatUIUXReport(task: Task, data: UIUXReportData): string {
    const issueNumber = task.metadata?.issueNumber || 'unknown';
    const date = new Date().toISOString();

    return `# UI/UX改善レポート - Issue #${issueNumber}

**Task**: ${task.title}
**Date**: ${date}
**Agent**: UIUXAgent（みためん）

## 🎯 総合スコア

| 項目 | スコア | 判定 |
|------|--------|------|
| パフォーマンス | ${data.metrics.performance}/100 | ${this.getGrade(data.metrics.performance)} |
| アクセシビリティ | ${data.metrics.accessibility}/100 | ${this.getGrade(data.metrics.accessibility)} |
| ベストプラクティス | ${data.metrics.bestPractices}/100 | ${this.getGrade(data.metrics.bestPractices)} |
| SEO | ${data.metrics.seo}/100 | ${this.getGrade(data.metrics.seo)} |

## 🚀 パフォーマンス

### Core Web Vitals
- **LCP**: ${data.metrics.coreWebVitals.lcp.toFixed(2)}s ${this.getLCPStatus(data.metrics.coreWebVitals.lcp)} (目標: < 2.5s)
- **FID**: ${data.metrics.coreWebVitals.fid.toFixed(0)}ms ${this.getFIDStatus(data.metrics.coreWebVitals.fid)} (目標: < 100ms)
- **CLS**: ${data.metrics.coreWebVitals.cls.toFixed(3)} ${this.getCLSStatus(data.metrics.coreWebVitals.cls)} (目標: < 0.1)

## ♿ アクセシビリティ

### 検出された問題

- **Critical**: ${data.metrics.issues.critical}件
- **High**: ${data.metrics.issues.high}件
- **Medium**: ${data.metrics.issues.medium}件
- **Low**: ${data.metrics.issues.low}件

${this.formatAccessibilityViolations(data.accessibilityViolations)}

## 📱 レスポンシブデザイン

${this.formatResponsiveIssues(data.responsiveIssues)}

## 🎯 改善提案

${this.formatImprovements(data.improvements)}

## 📊 メトリクス

- **実行時間**: ${Date.now() - this.startTime}ms
- **検出された問題数**: ${data.metrics.issues.critical + data.metrics.issues.high + data.metrics.issues.medium + data.metrics.issues.low}件
- **総合スコア**: ${this.calculateOverallScore(data.metrics)}/100

---

🤖 このレポートはUIUXAgent（みためん）により自動生成されました。
`;
  }

  /**
   * Format accessibility violations
   */
  private formatAccessibilityViolations(violations: UIUXReportData['accessibilityViolations']): string {
    if (violations.length === 0) {
      return '✅ アクセシビリティ違反は検出されませんでした。';
    }

    return violations.slice(0, 10).map((violation, index) => {
      const impactStr = violation.impact ?? 'unknown';
      const descStr = violation.description ?? 'No description';
      const nodesCount = violation.nodes.length;
      const htmlSamples = violation.nodes.slice(0, 3).map(node => node.html).join('\n');

      return `
### ${index + 1}. ${violation.id}

- **Impact**: ${impactStr}
- **Description**: ${descStr}
- **Affected Elements**: ${nodesCount}件

\`\`\`html
${htmlSamples}
\`\`\`
`;
    }).join('\n');
  }

  /**
   * Format responsive design issues
   */
  private formatResponsiveIssues(issues: UIUXReportData['responsiveIssues']): string {
    if (issues.length === 0) {
      return '✅ レスポンシブデザインの問題は検出されませんでした。';
    }

    return `
| デバイス | ステータス | 問題点 |
|---------|-----------|--------|
${issues.map(issue => `| ${issue.device} | ${this.getStatusEmoji(issue.status)} ${issue.status} | ${issue.issues.join(', ')} |`).join('\n')}
`;
  }

  /**
   * Format improvements
   */
  private formatImprovements(improvements: UIUXReportData['improvements']): string {
    if (improvements.length === 0) {
      return '✅ 改善提案はありません。';
    }

    return improvements.map((improvement, index) => {
      const emoji = this.getPriorityEmoji(improvement.priority);
      const fixCodeBlock = improvement.fixCode
        ? `\n**修正コード例**:\n\`\`\`typescript\n${improvement.fixCode}\n\`\`\`\n`
        : '';

      return `
### ${emoji} ${index + 1}. ${improvement.title}

${improvement.description}

${fixCodeBlock}
`;
    }).join('\n');
  }

  /**
   * Calculate overall score from metrics
   */
  private calculateOverallScore(metrics: UIUXMetrics): number {
    return Math.round(
      (metrics.performance + metrics.accessibility + metrics.bestPractices + metrics.seo) / 4,
    );
  }

  /**
   * Check if validation passed
   */
  private isValidationPassed(metrics: UIUXMetrics): boolean {
    // All scores should be >= 80, and no critical issues
    return (
      metrics.performance >= 80 &&
      metrics.accessibility >= 80 &&
      metrics.bestPractices >= 80 &&
      metrics.seo >= 80 &&
      metrics.issues.critical === 0
    );
  }

  /**
   * Get grade emoji for score
   */
  private getGrade(score: number): string {
    if (score >= 90) {return '⭐⭐⭐ Excellent';}
    if (score >= 80) {return '⭐⭐ Good';}
    if (score >= 70) {return '⭐ Acceptable';}
    return '⚠️ Needs Improvement';
  }

  /**
   * Get LCP status emoji
   */
  private getLCPStatus(lcp: number): string {
    if (lcp <= 2.5) {return '✅';}
    if (lcp <= 4.0) {return '⚠️';}
    return '❌';
  }

  /**
   * Get FID status emoji
   */
  private getFIDStatus(fid: number): string {
    if (fid <= 100) {return '✅';}
    if (fid <= 300) {return '⚠️';}
    return '❌';
  }

  /**
   * Get CLS status emoji
   */
  private getCLSStatus(cls: number): string {
    if (cls <= 0.1) {return '✅';}
    if (cls <= 0.25) {return '⚠️';}
    return '❌';
  }

  /**
   * Get status emoji
   */
  private getStatusEmoji(status: 'pass' | 'warning' | 'fail'): string {
    const emojiMap = {
      pass: '✅',
      warning: '⚠️',
      fail: '❌',
    };
    return emojiMap[status] || '❓';
  }

  /**
   * Get priority emoji
   */
  private getPriorityEmoji(priority: string): string {
    const emojiMap: Record<string, string> = {
      critical: '🚨',
      high: '⚠️',
      medium: '📝',
      low: '💡',
    };
    return emojiMap[priority] ?? '📌';
  }
}
