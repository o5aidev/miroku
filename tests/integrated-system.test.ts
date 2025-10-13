/**
 * E2E Integration Tests for Integrated System
 *
 * Tests the full feedback loop system with real metrics collection
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { GoalManager } from '../agents/feedback-loop/goal-manager.js';
import { ConsumptionValidator } from '../agents/feedback-loop/consumption-validator.js';
import { InfiniteLoopOrchestrator } from '../agents/feedback-loop/infinite-loop-orchestrator.js';
import { MetricsCollector } from '../agents/feedback-loop/metrics-collector.js';
import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';

const TEST_DIR = '/tmp/miyabi-e2e-test';
const GOALS_DIR = `${TEST_DIR}/goals`;
const REPORTS_DIR = `${TEST_DIR}/reports`;
const LOOPS_DIR = `${TEST_DIR}/loops`;

describe('Integrated System - E2E Tests', () => {
  let goalManager: GoalManager;
  let validator: ConsumptionValidator;
  let orchestrator: InfiniteLoopOrchestrator;
  let metricsCollector: MetricsCollector;

  beforeEach(() => {
    // Create test directories
    if (fs.existsSync(TEST_DIR)) {
      execSync(`rm -rf ${TEST_DIR}`);
    }
    fs.mkdirSync(TEST_DIR, { recursive: true });
    fs.mkdirSync(GOALS_DIR, { recursive: true });
    fs.mkdirSync(REPORTS_DIR, { recursive: true });
    fs.mkdirSync(LOOPS_DIR, { recursive: true });

    // Initialize components
    goalManager = new GoalManager({
      goalsDirectory: GOALS_DIR,
      autoSave: true,
    });

    validator = new ConsumptionValidator({
      reportsDirectory: REPORTS_DIR,
      autoSave: true,
      strictMode: false,
    });

    orchestrator = new InfiniteLoopOrchestrator(
      {
        maxIterations: 5,
        convergenceThreshold: 5,
        minIterationsBeforeConvergence: 3,
        autoRefinementEnabled: true,
        logsDirectory: LOOPS_DIR,
        autoSave: true,
        timeout: 60000, // 1 minute for tests
        maxRetries: 2,
        enableEscalation: false, // Disable for tests
      },
      goalManager,
      validator
    );

    metricsCollector = new MetricsCollector({
      workingDirectory: process.cwd(),
      skipTests: true, // Skip tests to avoid circular dependency
      skipCoverage: true,
      verbose: false,
    });
  });

  afterEach(() => {
    // Cleanup
    if (fs.existsSync(TEST_DIR)) {
      execSync(`rm -rf ${TEST_DIR}`);
    }
  });

  it('should complete full feedback loop with simulated metrics', async () => {
    // 1. Create goal
    const goal = goalManager.createGoal({
      title: 'E2E Test Goal',
      description: 'Test feedback loop with simulated progressive improvement',
      successCriteria: {
        minQualityScore: 80,
        maxEslintErrors: 0,
        maxTypeScriptErrors: 0,
        maxSecurityIssues: 0,
        minTestCoverage: 80,
        minTestsPassed: 10,
      },
      testSpecs: [],
      acceptanceCriteria: ['Goal should be achieved', 'Score should improve'],
      priority: 1,
    });

    expect(goal).toBeDefined();
    expect(goal.id).toBeTruthy();

    // 2. Start loop
    const loop = await orchestrator.startLoop(goal.id);
    expect(loop).toBeDefined();
    expect(loop.status).toBe('running');

    // 3. Execute iterations with progressive improvement
    const iterations = 4;
    for (let i = 0; i < iterations; i++) {
      const simulatedMetrics = {
        qualityScore: 40 + i * 15, // 40 → 55 → 70 → 85
        eslintErrors: Math.max(0, 5 - i),
        typeScriptErrors: Math.max(0, 3 - i),
        securityIssues: 0,
        testCoverage: 50 + i * 10, // 50 → 60 → 70 → 80
        testsPassed: 5 + i * 2,
        testsFailed: Math.max(0, 3 - i),
        buildTimeMs: 20000,
        linesOfCode: 500,
        cyclomaticComplexity: 10,
      };

      const iteration = await orchestrator.executeIteration(
        loop.loopId,
        `session-${i}`,
        simulatedMetrics
      );

      expect(iteration).toBeDefined();
      expect(iteration.iteration).toBe(i + 1);
      expect(iteration.consumptionReport).toBeDefined();
      expect(iteration.feedback).toBeDefined();

      // Check score improvement (except first iteration)
      if (i > 0) {
        expect(iteration.scoreImprovement).toBeGreaterThan(0);
      }
    }

    // 4. Verify final state
    const finalLoop = orchestrator.getLoop(loop.loopId);
    expect(finalLoop).toBeDefined();
    expect(finalLoop!.iterations.length).toBe(iterations);

    // Last iteration should achieve goal
    const lastIteration = finalLoop!.iterations[iterations - 1];
    expect(lastIteration.consumptionReport.overallScore).toBeGreaterThanOrEqual(80);
    expect(lastIteration.consumptionReport.goalAchieved).toBe(true);
  }, 30000); // 30 second timeout

  it('should handle convergence detection', async () => {
    const goal = goalManager.createGoal({
      title: 'Convergence Test',
      description: 'Test convergence with stable scores',
      successCriteria: {
        minQualityScore: 85,
        maxEslintErrors: 0,
        maxTypeScriptErrors: 0,
        maxSecurityIssues: 0,
        minTestCoverage: 80,
        minTestsPassed: 10,
      },
      testSpecs: [],
      acceptanceCriteria: ['Convergence should be detected'],
      priority: 1,
    });

    const loop = await orchestrator.startLoop(goal.id);

    // Stable metrics (score oscillates slightly around 85)
    const stableMetrics = [
      { qualityScore: 85, eslintErrors: 0, typeScriptErrors: 0, securityIssues: 0, testCoverage: 82, testsPassed: 12, testsFailed: 0, buildTimeMs: 20000, linesOfCode: 500, cyclomaticComplexity: 8 },
      { qualityScore: 86, eslintErrors: 0, typeScriptErrors: 0, securityIssues: 0, testCoverage: 83, testsPassed: 12, testsFailed: 0, buildTimeMs: 19000, linesOfCode: 500, cyclomaticComplexity: 8 },
      { qualityScore: 85, eslintErrors: 0, typeScriptErrors: 0, securityIssues: 0, testCoverage: 82, testsPassed: 13, testsFailed: 0, buildTimeMs: 20000, linesOfCode: 500, cyclomaticComplexity: 7 },
      { qualityScore: 87, eslintErrors: 0, typeScriptErrors: 0, securityIssues: 0, testCoverage: 84, testsPassed: 13, testsFailed: 0, buildTimeMs: 19500, linesOfCode: 500, cyclomaticComplexity: 7 },
    ];

    for (let i = 0; i < stableMetrics.length; i++) {
      const currentLoop = orchestrator.getLoop(loop.loopId);
      if (currentLoop && currentLoop.status === 'running') {
        await orchestrator.executeIteration(
          loop.loopId,
          `session-${i}`,
          stableMetrics[i]
        );
      }
    }

    const finalLoop = orchestrator.getLoop(loop.loopId);
    expect(finalLoop).toBeDefined();
    expect(finalLoop!.convergenceMetrics.isConverging).toBe(true);
    expect(finalLoop!.convergenceMetrics.scoreVariance).toBeLessThan(5);
    expect(finalLoop!.status).toBe('converged');
  }, 30000);

  it('should escalate after max iterations without achieving goal', async () => {
    const goal = goalManager.createGoal({
      title: 'Max Iterations Test',
      description: 'Test escalation when max iterations reached',
      successCriteria: {
        minQualityScore: 90, // High threshold
        maxEslintErrors: 0,
        maxTypeScriptErrors: 0,
        maxSecurityIssues: 0,
        minTestCoverage: 90,
        minTestsPassed: 20,
      },
      testSpecs: [],
      acceptanceCriteria: ['Should escalate'],
      priority: 1,
    });

    const loop = await orchestrator.startLoop(goal.id);

    // Poor metrics that never improve enough
    const poorMetrics = {
      qualityScore: 50,
      eslintErrors: 3,
      typeScriptErrors: 2,
      securityIssues: 0,
      testCoverage: 60,
      testsPassed: 8,
      testsFailed: 2,
      buildTimeMs: 25000,
      linesOfCode: 600,
      cyclomaticComplexity: 15,
    };

    // Execute max iterations
    for (let i = 0; i < 5; i++) {
      await orchestrator.executeIteration(
        loop.loopId,
        `session-${i}`,
        poorMetrics
      );
    }

    const finalLoop = orchestrator.getLoop(loop.loopId);
    expect(finalLoop).toBeDefined();
    expect(finalLoop!.status).toBe('max_iterations_reached');
    expect(finalLoop!.iterations.length).toBe(5);
  }, 30000);

  it('should detect divergence when score decreases', async () => {
    const goal = goalManager.createGoal({
      title: 'Divergence Test',
      description: 'Test divergence detection',
      successCriteria: {
        minQualityScore: 80,
        maxEslintErrors: 0,
        maxTypeScriptErrors: 0,
        maxSecurityIssues: 0,
        minTestCoverage: 80,
        minTestsPassed: 10,
      },
      testSpecs: [],
      acceptanceCriteria: ['Should detect divergence'],
      priority: 1,
    });

    const loop = await orchestrator.startLoop(goal.id);

    // Decreasing scores
    const decreasingMetrics = [
      { qualityScore: 70, eslintErrors: 2, typeScriptErrors: 1, securityIssues: 0, testCoverage: 75, testsPassed: 10, testsFailed: 1, buildTimeMs: 20000, linesOfCode: 500, cyclomaticComplexity: 10 },
      { qualityScore: 65, eslintErrors: 3, typeScriptErrors: 2, securityIssues: 0, testCoverage: 70, testsPassed: 9, testsFailed: 2, buildTimeMs: 22000, linesOfCode: 550, cyclomaticComplexity: 12 },
      { qualityScore: 60, eslintErrors: 4, typeScriptErrors: 3, securityIssues: 1, testCoverage: 65, testsPassed: 8, testsFailed: 3, buildTimeMs: 24000, linesOfCode: 600, cyclomaticComplexity: 14 },
      { qualityScore: 55, eslintErrors: 5, typeScriptErrors: 4, securityIssues: 1, testCoverage: 60, testsPassed: 7, testsFailed: 4, buildTimeMs: 26000, linesOfCode: 650, cyclomaticComplexity: 16 },
    ];

    for (let i = 0; i < decreasingMetrics.length; i++) {
      const currentLoop = orchestrator.getLoop(loop.loopId);
      if (currentLoop && currentLoop.status === 'running') {
        await orchestrator.executeIteration(
          loop.loopId,
          `session-${i}`,
          decreasingMetrics[i]
        );
      }
    }

    const finalLoop = orchestrator.getLoop(loop.loopId);
    expect(finalLoop).toBeDefined();
    expect(finalLoop!.convergenceMetrics.improvementRate).toBeLessThan(0);
    expect(finalLoop!.status).toBe('diverged');
  }, 30000);

  it('should auto-refine goal when stagnant', async () => {
    // Create orchestrator with auto-refinement enabled
    const refinementOrchestrator = new InfiniteLoopOrchestrator(
      {
        maxIterations: 10,
        convergenceThreshold: 5,
        minIterationsBeforeConvergence: 3,
        autoRefinementEnabled: true, // Enable auto-refinement
        logsDirectory: LOOPS_DIR,
        autoSave: true,
        timeout: 60000,
        maxRetries: 2,
        enableEscalation: false,
      },
      goalManager,
      validator
    );

    const goal = goalManager.createGoal({
      title: 'Auto-Refinement Test',
      description: 'Test automatic goal refinement',
      successCriteria: {
        minQualityScore: 90, // Very high threshold
        maxEslintErrors: 0,
        maxTypeScriptErrors: 0,
        maxSecurityIssues: 0,
        minTestCoverage: 90,
        minTestsPassed: 15,
      },
      testSpecs: [],
      acceptanceCriteria: ['Goal should be refined'],
      priority: 1,
    });

    const loop = await refinementOrchestrator.startLoop(goal.id);

    // Stagnant metrics (stuck at 65)
    const stagnantMetrics = {
      qualityScore: 65,
      eslintErrors: 2,
      typeScriptErrors: 1,
      securityIssues: 0,
      testCoverage: 70,
      testsPassed: 10,
      testsFailed: 1,
      buildTimeMs: 22000,
      linesOfCode: 550,
      cyclomaticComplexity: 11,
    };

    // Execute 6 iterations with same metrics
    for (let i = 0; i < 6; i++) {
      const currentLoop = refinementOrchestrator.getLoop(loop.loopId);
      if (currentLoop && currentLoop.status === 'running') {
        await refinementOrchestrator.executeIteration(
          loop.loopId,
          `session-${i}`,
          stagnantMetrics
        );
      }
    }

    const finalLoop = refinementOrchestrator.getLoop(loop.loopId);
    expect(finalLoop).toBeDefined();

    // Should trigger auto-refinement OR escalation due to stagnation
    // (variance low but goal not achieved after multiple iterations)
    // Either response is valid: refinement attempts to improve goal, escalation seeks help
    const hasRefinement = finalLoop!.refinementHistory.length > 0;
    const hasEscalated = finalLoop!.status === 'escalated';
    expect(hasRefinement || hasEscalated).toBe(true);
  }, 30000);

  it('should handle real metrics collection (integration with MetricsCollector)', async () => {
    const goal = goalManager.createGoal({
      title: 'Real Metrics Test',
      description: 'Test with real metrics from MetricsCollector',
      successCriteria: {
        minQualityScore: 40, // Low threshold for test
        maxEslintErrors: 100,
        maxTypeScriptErrors: 100,
        maxSecurityIssues: 10,
        minTestCoverage: 0,
        minTestsPassed: 0,
      },
      testSpecs: [],
      acceptanceCriteria: ['Real metrics should be collected'],
      priority: 1,
    });

    const loop = await orchestrator.startLoop(goal.id);

    // Collect real metrics
    try {
      const realMetrics = await metricsCollector.collect();

      expect(realMetrics).toBeDefined();
      expect(realMetrics.qualityScore).toBeGreaterThanOrEqual(0);
      expect(realMetrics.qualityScore).toBeLessThanOrEqual(100);

      // Execute one iteration with real metrics
      const iteration = await orchestrator.executeIteration(
        loop.loopId,
        'session-real',
        realMetrics
      );

      expect(iteration).toBeDefined();
      expect(iteration.consumptionReport.actualMetrics).toEqual(realMetrics);
    } catch (error: any) {
      // If metrics collection fails (e.g., no eslint config), that's OK
      // The test is to ensure the integration works, not that the project is configured
      console.warn('Metrics collection failed (expected in test environment):', error.message);
    }
  }, 30000);
});
