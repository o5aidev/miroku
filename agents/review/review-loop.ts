/**
 * ReviewLoop - Interactive Code Review Loop
 *
 * Implements Daniel's Review Loop from OpenAI Dev Day:
 * - Iterative review → fix → re-review cycle
 * - Goal: Achieve quality score ≥ 80 before PR
 * - Max 10 iterations with auto-escalation
 * - Interactive user prompts for "pls fix", "continue", "skip"
 *
 * Expected outcomes:
 * - PR quality improvement (OpenAI: 70% more PRs)
 * - Reduced human reviewer burden
 * - Higher first-time approval rate
 */

import { ReviewAgent } from './review-agent.js';
import { AgentConfig, Task, QualityReport, QualityIssue } from '../types/index.js';
import { createInterface } from 'readline';
import { execSync } from 'child_process';

export interface ReviewLoopOptions {
  threshold?: number; // Passing score threshold (default: 80)
  maxIterations?: number; // Max review iterations (default: 10)
  autoFix?: boolean; // Enable auto-fix mode (default: false)
  verbose?: boolean; // Verbose logging (default: false)
}

export interface ReviewLoopResult {
  passed: boolean;
  iterations: number;
  finalScore: number;
  finalReport: QualityReport;
  exitReason: 'SUCCESS' | 'MAX_ITERATIONS' | 'USER_SKIP';
}

export class ReviewLoop {
  private agent: ReviewAgent;
  private threshold: number;
  private maxIterations: number;
  private autoFix: boolean;
  private verbose: boolean;

  constructor(config: AgentConfig, options: ReviewLoopOptions = {}) {
    this.agent = new ReviewAgent(config);
    this.threshold = options.threshold ?? 80;
    this.maxIterations = options.maxIterations ?? 10;
    this.autoFix = options.autoFix ?? false;
    this.verbose = options.verbose ?? false;
  }

  /**
   * Execute interactive review loop
   */
  async execute(): Promise<ReviewLoopResult> {
    console.log('\n🔍 ReviewAgent starting interactive review loop...\n');
    console.log(`📊 Configuration:`);
    console.log(`   - Threshold: ${this.threshold}/100`);
    console.log(`   - Max iterations: ${this.maxIterations}`);
    console.log(`   - Auto-fix: ${this.autoFix ? 'enabled' : 'disabled'}\n`);

    let iteration = 0;
    let passed = false;
    let finalReport: QualityReport | null = null;
    let exitReason: 'SUCCESS' | 'MAX_ITERATIONS' | 'USER_SKIP' = 'MAX_ITERATIONS';

    while (iteration < this.maxIterations && !passed) {
      iteration++;
      console.log(`\n${'='.repeat(60)}`);
      console.log(`🔄 Review iteration ${iteration}/${this.maxIterations}`);
      console.log(`${'='.repeat(60)}\n`);

      // Run review
      finalReport = await this.runReview(iteration);

      // Check if passed
      if (finalReport.score >= this.threshold) {
        passed = true;
        exitReason = 'SUCCESS';
        this.displaySuccess(finalReport);
        break;
      }

      // Display issues
      this.displayResults(finalReport, false);

      // Check if max iterations reached
      if (iteration >= this.maxIterations) {
        this.displayEscalation(finalReport);
        exitReason = 'MAX_ITERATIONS';
        break;
      }

      // Prompt user for action
      const action = await this.promptUser();

      if (action === 'skip') {
        console.log('\n⏭️  Review skipped by user.\n');
        console.log(`⚠️  WARNING: Quality score is below threshold (${finalReport.score}/${this.threshold}).`);
        console.log('Proceeding without passing review may lead to PR rejections.\n');
        exitReason = 'USER_SKIP';
        break;
      }

      if (action === 'fix') {
        await this.attemptAutoFix(finalReport);
      }

      // Continue to next iteration
    }

    return {
      passed,
      iterations: iteration,
      finalScore: finalReport?.score ?? 0,
      finalReport: finalReport!,
      exitReason,
    };
  }

  /**
   * Run review using ReviewAgent
   */
  private async runReview(iteration: number): Promise<QualityReport> {
    const task: Task = {
      id: `review-loop-${iteration}`,
      title: 'Interactive Code Review',
      description: 'Comprehensive code quality review',
      type: 'test',
      priority: 1,
      severity: 'Sev.3-Medium',
      impact: 'High',
      assignedAgent: 'ReviewAgent',
      dependencies: [],
      estimatedDuration: 15,
      status: 'in-progress',
    };

    try {
      const result = await this.agent.execute(task);

      if (result.status === 'success' || result.status === 'escalated') {
        return result.data.qualityReport;
      } else {
        throw new Error(`Review failed: ${result.error}`);
      }
    } catch (error) {
      console.error(`❌ Review execution failed: ${(error as Error).message}`);
      // Return a failing report
      return {
        score: 0,
        passed: false,
        issues: [{
          type: 'eslint',
          severity: 'critical',
          message: `Review execution error: ${(error as Error).message}`,
          scoreImpact: 100,
        }],
        recommendations: ['Fix review execution error'],
        breakdown: {
          eslintScore: 0,
          typeScriptScore: 0,
          securityScore: 0,
          testCoverageScore: 0,
        },
      };
    }
  }

  /**
   * Display review results
   */
  private displayResults(report: QualityReport, isSuccess: boolean): void {
    console.log('📊 Analysis Results:');
    console.log('┌─────────────────┬───────┐');
    console.log('│ Metric          │ Score │');
    console.log('├─────────────────┼───────┤');
    console.log(`│ ESLint          │ ${this.formatScore(report.breakdown.eslintScore)}/100│`);
    console.log(`│ TypeScript      │ ${this.formatScore(report.breakdown.typeScriptScore)}/100│`);
    console.log(`│ Security        │ ${this.formatScore(report.breakdown.securityScore)}/100│`);
    console.log(`│ Test Coverage   │ ${this.formatScore(report.breakdown.testCoverageScore)}/100│`);
    console.log('├─────────────────┼───────┤');
    console.log(`│ Overall Quality │ ${this.formatScore(report.score)}/100│`);
    console.log('└─────────────────┴───────┘\n');

    if (isSuccess) {
      console.log(`✅ Review PASSED (threshold: ${this.threshold})\n`);
    } else {
      console.log(`❌ Review FAILED (threshold: ${this.threshold})\n`);
      this.displayIssues(report);
    }
  }

  /**
   * Display issues in readable format
   */
  private displayIssues(report: QualityReport): void {
    if (report.issues.length === 0) {
      console.log('✨ No issues found!\n');
      return;
    }

    console.log(`🔍 Found ${report.issues.length} issues:\n`);

    // Group issues by severity
    const critical = report.issues.filter(i => i.severity === 'critical');
    const high = report.issues.filter(i => i.severity === 'high');
    const medium = report.issues.filter(i => i.severity === 'medium');
    const low = report.issues.filter(i => i.severity === 'low');

    let index = 1;

    const displayGroup = (issues: QualityIssue[], label: string) => {
      if (issues.length === 0) return;

      for (const issue of issues) {
        const location = issue.file && issue.line ? ` ${issue.file}:${issue.line}` : '';
        console.log(`${index}. [${issue.type.toUpperCase()}]${location}`);
        console.log(`   ${issue.message}`);
        if (this.verbose && issue.column) {
          console.log(`   Column: ${issue.column}`);
        }
        console.log('');
        index++;
      }
    };

    if (critical.length > 0) {
      console.log('🚨 Critical Issues:');
      displayGroup(critical, 'CRITICAL');
    }

    if (high.length > 0) {
      console.log('⚠️  High Priority Issues:');
      displayGroup(high, 'HIGH');
    }

    if (medium.length > 0 && this.verbose) {
      console.log('📋 Medium Priority Issues:');
      displayGroup(medium, 'MEDIUM');
    }

    if (low.length > 0 && this.verbose) {
      console.log('📝 Low Priority Issues:');
      displayGroup(low, 'LOW');
    }

    console.log('💡 Next steps:');
    console.log('1. Fix the issues above manually');
    console.log('2. Type "continue" to re-review after your fixes');
    console.log('3. Or type "pls fix" for automatic fixes (where possible)');
    console.log('4. Or type "skip" to skip review and proceed anyway\n');
  }

  /**
   * Display success message
   */
  private displaySuccess(report: QualityReport): void {
    this.displayResults(report, true);

    console.log('🎉 All checks passed! Your code is ready for PR.\n');
    console.log('📊 Final Breakdown:');
    console.log(`   - ESLint: ${report.breakdown.eslintScore}/100`);
    console.log(`   - TypeScript: ${report.breakdown.typeScriptScore}/100`);
    console.log(`   - Security: ${report.breakdown.securityScore}/100`);
    console.log(`   - Test Coverage: ${report.breakdown.testCoverageScore}/100\n`);

    console.log('💡 Suggested next steps:');
    console.log('1. Create PR: gh pr create');
    console.log('2. Or continue working on additional changes\n');
  }

  /**
   * Display escalation message
   */
  private displayEscalation(report: QualityReport): void {
    console.log(`\n⚠️  Max iterations (${this.maxIterations}) reached without passing review.\n`);
    console.log(`Current score: ${report.score}/100 (threshold: ${this.threshold})\n`);
    console.log('🚨 Escalating to human reviewer.\n');

    const criticalIssues = report.issues.filter(i => i.severity === 'critical');
    if (criticalIssues.length > 0) {
      console.log('Outstanding critical issues:');
      criticalIssues.forEach((issue, i) => {
        console.log(`${i + 1}. [${issue.type.toUpperCase()}] ${issue.message}`);
        if (issue.file && issue.line) {
          console.log(`   Location: ${issue.file}:${issue.line}`);
        }
      });
      console.log('');
    }

    console.log('Please address these issues manually or consult with your team lead.\n');
  }

  /**
   * Prompt user for action
   */
  private async promptUser(): Promise<'continue' | 'fix' | 'skip'> {
    const rl = createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    return new Promise((resolve) => {
      rl.question('> ', (answer) => {
        rl.close();

        const input = answer.trim().toLowerCase();

        if (input === 'pls fix' || input === 'fix') {
          resolve('fix');
        } else if (input === 'skip') {
          resolve('skip');
        } else {
          // Default to continue
          resolve('continue');
        }
      });
    });
  }

  /**
   * Attempt automatic fixes
   */
  private async attemptAutoFix(report: QualityReport): Promise<void> {
    console.log('\n🔧 Attempting automatic fixes...\n');

    let fixedCount = 0;
    let manualCount = 0;

    // Only auto-fix ESLint issues (safe)
    const eslintIssues = report.issues.filter(i => i.type === 'eslint');

    if (eslintIssues.length > 0) {
      try {
        // Run eslint --fix
        execSync('npx eslint --fix "src/**/*.ts" "agents/**/*.ts" "tests/**/*.test.ts"', {
          stdio: 'inherit',
          cwd: process.cwd(),
        });

        fixedCount += eslintIssues.length;
        console.log(`✅ Fixed ${eslintIssues.length} ESLint issues automatically\n`);
      } catch (error) {
        console.log(`⚠️  ESLint auto-fix encountered errors (some issues may be fixed)\n`);
      }
    }

    // Count issues that require manual fixes
    const securityIssues = report.issues.filter(i => i.type === 'security');
    const typeScriptIssues = report.issues.filter(i => i.type === 'typescript');

    manualCount = securityIssues.length + typeScriptIssues.length;

    if (securityIssues.length > 0) {
      console.log(`⚠️  ${securityIssues.length} security issues require manual fixes`);
    }
    if (typeScriptIssues.length > 0) {
      console.log(`⚠️  ${typeScriptIssues.length} TypeScript issues require manual fixes`);
    }

    console.log(`\n${fixedCount}/${report.issues.length} issues fixed automatically.`);
    if (manualCount > 0) {
      console.log(`Please fix remaining ${manualCount} issues manually.\n`);
    }
  }

  /**
   * Format score with proper padding
   */
  private formatScore(score: number): string {
    return score.toString().padStart(2, ' ');
  }
}
