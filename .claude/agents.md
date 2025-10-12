# Verification Scripts - Auto-Loop Pattern

This document defines automated verification workflows for Claude Code agents, implementing patterns from OpenAI Dev Day.

## Overview

OpenAI Dev Day demonstrated that **verification scripts + auto-loop** is the key to perfect quality:

1. Make change
2. Run verification script
3. If fail, analyze diff and iterate
4. Repeat until all checks pass
5. Only then mark task as complete

**Use unique terminology**: "exec verify" for automatic verification loops.

## Core Principle

> "The agent keeps running until it's perfect, just like the senior engineer who checks their work before submitting."
>
> — OpenAI Dev Day, Nacho's Approach

### Success Metrics from OpenAI

- **Nacho's UI Work**: Pixel-perfect results through snapshot loops
- **Feler's Refactor**: 15k lines, 150M tokens, 7 hours → Perfect
- **Daniel's Reviews**: 70% more PRs with first-time approval

## Verification Scripts

### For UI Changes

When implementing UI changes (React, Vue, Svelte, etc.):

```bash
# Step 1: Generate snapshots
npm run snapshot:generate

# Step 2: Compare with expected
npm run snapshot:compare

# Step 3: If diff > 2%, iterate
if [ $? -ne 0 ]; then
  echo "Snapshot diff detected - iterating"
  # Analyze diff
  git diff tests/**/__snapshots__
  # Make adjustments
  # Repeat from Step 1
fi
```

**Auto-Loop Pattern**:
- Loop until snapshot diff ≤ 2%
- Maximum 10 iterations
- Log each iteration for debugging

**Package.json scripts**:
```json
{
  "snapshot:generate": "vitest run --reporter=verbose --update",
  "snapshot:compare": "vitest run --reporter=verbose",
  "snapshot:ui": "vitest --ui"
}
```

### For API Changes

When implementing API changes (REST, GraphQL, etc.):

```bash
# Step 1: Run integration tests
npm run api:test:integration

# Step 2: Run load tests
npm run api:load-test

# Step 3: Verify performance
npm run benchmark:compare -- --compare-with=main

# Step 4: If any fail, iterate
if [ $? -ne 0 ]; then
  echo "API tests failed - iterating"
  # Analyze failures
  cat test-results/integration.log
  # Fix issues
  # Repeat from Step 1
fi
```

**Auto-Loop Pattern**:
- Loop until all tests pass
- Performance degradation < 10%
- Response time < 200ms (P95)

**Package.json scripts**:
```json
{
  "api:test:integration": "vitest run tests/integration --reporter=verbose",
  "api:test:e2e": "playwright test",
  "api:load-test": "k6 run tests/load/api-load-test.js"
}
```

### For Performance Changes

When optimizing performance:

```bash
# Step 1: Baseline measurement
npm run benchmark -- --baseline

# Step 2: Make optimization
# (Edit code)

# Step 3: Compare with baseline
npm run benchmark:compare -- --compare-with=baseline

# Step 4: If improvement < 20%, iterate
IMPROVEMENT=$(cat benchmark-results/improvement.txt)
if [ "$IMPROVEMENT" -lt 20 ]; then
  echo "Insufficient improvement ($IMPROVEMENT%) - iterating"
  # Try different approach
  # Repeat from Step 2
fi
```

**Auto-Loop Pattern**:
- Loop until ≥20% improvement
- No quality degradation
- Maximum 5 iterations

**Package.json scripts**:
```json
{
  "benchmark": "tsx agents/benchmark/performance-benchmark.ts",
  "benchmark:compare": "tsx agents/benchmark/performance-benchmark.ts --compare-with",
  "perf:profile": "tsx scripts/cicd/performance-optimizer.ts profile"
}
```

### For Security Changes

When fixing security issues:

```bash
# Step 1: Run security scan
npm run security:scan

# Step 2: Run dependency audit
npm run security:audit

# Step 3: Verify no secrets
grep -r "api.*key\|token\|password" src/ || echo "No secrets found"

# Step 4: If any critical issues, iterate
CRITICAL=$(jq '.vulnerabilities.critical' security-report.json)
if [ "$CRITICAL" -gt 0 ]; then
  echo "$CRITICAL critical vulnerabilities - iterating"
  # Fix vulnerabilities
  # Repeat from Step 1
fi
```

**Auto-Loop Pattern**:
- Loop until 0 critical vulnerabilities
- 0 hardcoded secrets
- Maximum 3 iterations

**Package.json scripts**:
```json
{
  "security:scan": "tsx scripts/security/security-manager.ts scan-secrets",
  "security:audit": "npm audit && npm audit --package-lock-only"
}
```

## Agent-Specific Workflows

### CodeGenAgent

**Responsibility**: Generate high-quality code with tests

**Verification Workflow**:

```typescript
// agents/codegen/codegen-agent.ts

async execute(task: Task): Promise<AgentResult> {
  let iteration = 0;
  let passed = false;
  const MAX_ITERATIONS = 10;

  while (!passed && iteration < MAX_ITERATIONS) {
    iteration++;
    this.log(`🔄 CodeGen iteration ${iteration}/${MAX_ITERATIONS}`);

    // 1. Generate code
    const code = await this.generateCode(task);
    await this.writeCode(code);

    // 2. Exec verify (unique terminology!)
    const verifyResult = await this.execVerify();

    if (verifyResult.passed) {
      passed = true;
      this.log('✅ Code generation successful');
    } else {
      // 3. Analyze failures and iterate
      await this.analyzeFailures(verifyResult);
      await this.refinePrompt(verifyResult);
    }
  }

  if (!passed) {
    throw new Error(`Max iterations (${MAX_ITERATIONS}) reached`);
  }

  return { status: 'success', data: { code, iterations: iteration } };
}

private async execVerify(): Promise<VerifyResult> {
  // Run all verification scripts
  const results = await Promise.all([
    this.runLinter(),
    this.runTypeCheck(),
    this.runTests(),
  ]);

  return {
    passed: results.every(r => r.passed),
    results,
  };
}
```

**Success Criteria**:
- TypeScript compilation: 0 errors
- ESLint: 0 errors (warnings OK)
- Tests: 100% passing
- Coverage: ≥80%

### ReviewAgent

**Responsibility**: Ensure code quality before PR

**Verification Workflow**:

Uses the `/review` command (see `.claude/commands/review.md`):

```typescript
// agents/review/review-loop.ts

async execute(): Promise<ReviewLoopResult> {
  let iteration = 0;
  let passed = false;
  const MAX_ITERATIONS = 10;

  while (iteration < MAX_ITERATIONS && !passed) {
    iteration++;
    this.log(`🔍 Review iteration ${iteration}/${MAX_ITERATIONS}`);

    // 1. Run comprehensive review
    const report = await this.runReview(iteration);

    // 2. Check if passed
    if (report.score >= this.threshold) {
      passed = true;
      this.displaySuccess(report);
      break;
    }

    // 3. Display issues and prompt user
    this.displayResults(report, false);

    // 4. Handle user action
    const action = await this.promptUser();

    if (action === 'skip') {
      break;
    }

    if (action === 'fix') {
      await this.attemptAutoFix(report);
    }
  }

  return {
    passed,
    iterations: iteration,
    finalScore: report.score,
  };
}
```

**Success Criteria**:
- Overall quality score: ≥80/100
- ESLint score: ≥80/100
- TypeScript score: ≥80/100
- Security score: ≥80/100
- Test coverage: ≥80%

### DeploymentAgent

**Responsibility**: Deploy with zero-downtime and auto-rollback

**Verification Workflow**:

```typescript
// agents/deployment/deployment-agent.ts

async execute(task: Task): Promise<AgentResult> {
  this.log('🚀 Starting deployment workflow');

  // 1. Pre-deployment verification
  await this.execVerify();

  // 2. Build production bundle
  await this.buildProduction();

  // 3. Run smoke tests
  await this.runSmokeTests();

  // 4. Deploy to staging
  const stagingUrl = await this.deployToStaging();

  // 5. Health check loop
  let healthCheckPassed = false;
  let attempts = 0;
  const MAX_ATTEMPTS = 5;

  while (!healthCheckPassed && attempts < MAX_ATTEMPTS) {
    attempts++;
    this.log(`🏥 Health check attempt ${attempts}/${MAX_ATTEMPTS}`);

    healthCheckPassed = await this.healthCheck(stagingUrl);

    if (!healthCheckPassed) {
      await this.sleep(5000); // Wait 5 seconds
    }
  }

  if (!healthCheckPassed) {
    // Auto-rollback
    this.log('❌ Health check failed - rolling back');
    await this.rollback();
    throw new Error('Deployment failed - rolled back');
  }

  this.log('✅ Health check passed - deploying to production');
  const productionUrl = await this.deployToProduction();

  return {
    status: 'success',
    data: {
      stagingUrl,
      productionUrl,
      healthCheckAttempts: attempts,
    },
  };
}

private async execVerify(): Promise<void> {
  // Run all pre-deployment checks
  await this.runCommand('npm run verify:all');
  await this.runCommand('npm run build');
  await this.runCommand('npm run test:smoke');
}
```

**Success Criteria**:
- Pre-deployment verification: PASS
- Build: SUCCESS
- Smoke tests: 100% passing
- Health check: 200 OK
- Response time: < 500ms

### CoordinatorAgent

**Responsibility**: Task decomposition and DAG management

**Verification Workflow**:

```typescript
// agents/coordinator/coordinator-agent.ts

async execute(issue: Issue): Promise<AgentResult> {
  this.log('📋 Starting task decomposition');

  // 1. Decompose issue into tasks
  const { tasks, dag } = await this.decomposeIssue(issue);

  // 2. Verify DAG validity
  const hasCycles = DAGManager.detectCycles(dag);
  if (hasCycles) {
    throw new Error('Circular dependencies detected in DAG');
  }

  // 3. Generate execution plan
  const plan = await this.generateExecPlan(issue, dag);

  // 4. Write Plans.md to worktree
  const worktreePath = `.worktrees/issue-${issue.number}`;
  await this.writePlansToWorktree(plan, issue.number, worktreePath);

  this.log('✅ Task decomposition complete');

  return {
    status: 'success',
    data: {
      tasks,
      dag,
      plan,
    },
  };
}
```

**Success Criteria**:
- Task count: > 0
- DAG validity: No cycles
- Plans.md: Generated
- All tasks assigned to agents

## Unique Terminology

Use these terms consistently to help Claude Code recognize special operations:

| Term | Meaning | Usage |
|------|---------|-------|
| **exec verify** | Execute verification loop | `await this.execVerify()` |
| **exec plan** | Execute with execution plan | `const plan = await this.execPlan(issue)` |
| **exec review** | Execute review loop | `/review` command |
| **auto-loop** | Automatic iteration until success | While loop with max iterations |

## Best Practices

### 1. Always Set Max Iterations

Prevent infinite loops by setting a maximum iteration count:

```typescript
const MAX_ITERATIONS = 10;
let iteration = 0;

while (!passed && iteration < MAX_ITERATIONS) {
  iteration++;
  // ... verification logic
}

if (iteration >= MAX_ITERATIONS) {
  throw new Error('Max iterations reached - escalating to human');
}
```

### 2. Log Each Iteration

Make debugging easier by logging progress:

```typescript
this.log(`🔄 Iteration ${iteration}/${MAX_ITERATIONS}`);
this.log(`   Current score: ${score}/100`);
this.log(`   Issues found: ${issues.length}`);
```

### 3. Use Unique Terminology

Help Claude Code recognize special operations:

```typescript
// ✅ Good - uses unique terminology
await this.execVerify();
const plan = await this.execPlan(issue);

// ❌ Bad - generic terms
await this.verify();
const plan = await this.plan(issue);
```

### 4. Fail Fast

Exit early if unrecoverable error:

```typescript
if (error.code === 'ECONNREFUSED') {
  throw new Error('Service unavailable - cannot continue');
}

if (criticalIssues.length > 0) {
  await this.escalate('Critical security issues found');
  throw new Error('Manual intervention required');
}
```

### 5. Measure Improvement

Track metrics across iterations:

```typescript
const metrics = {
  iteration,
  scoreBefore: previousScore,
  scoreAfter: currentScore,
  improvement: currentScore - previousScore,
  issuesFixed: previousIssues.length - currentIssues.length,
};

this.log(`📊 Improvement: +${metrics.improvement} points`);
```

## Integration with Package.json

Add verification scripts to `package.json`:

```json
{
  "scripts": {
    // Verification scripts
    "verify:all": "npm run lint && npm run typecheck && npm run test && npm run security:scan",
    "lint": "eslint src/**/*.ts",
    "typecheck": "tsc --noEmit",
    "test": "vitest run",
    "security:scan": "tsx scripts/security/security-manager.ts scan-secrets",

    // Snapshot testing
    "snapshot:generate": "vitest run --reporter=verbose --update",
    "snapshot:compare": "vitest run --reporter=verbose",
    "snapshot:ui": "vitest --ui",

    // API testing
    "api:test:integration": "vitest run tests/integration --reporter=verbose",
    "api:test:e2e": "playwright test",

    // Performance
    "benchmark": "tsx agents/benchmark/performance-benchmark.ts",
    "benchmark:compare": "tsx agents/benchmark/performance-benchmark.ts --compare-with",

    // Deployment
    "deploy:staging": "tsx scripts/cicd/deploy-staging.ts",
    "deploy:production": "tsx scripts/cicd/deploy-production.ts",
    "health-check": "tsx scripts/cicd/health-check.ts"
  }
}
```

## Troubleshooting

### Issue: Infinite loop detected

**Cause**: No exit condition or max iterations not set

**Solution**:
```typescript
let iteration = 0;
const MAX_ITERATIONS = 10;

while (!passed && iteration < MAX_ITERATIONS) {
  iteration++;
  // ... verification logic
}

if (iteration >= MAX_ITERATIONS) {
  throw new Error('Max iterations reached - escalating to human');
}
```

### Issue: Verification script fails silently

**Cause**: Script exits with code 0 even on failure

**Solution**:
```bash
# Always use explicit exit codes
npm run test || exit 1
npm run lint || exit 1
```

### Issue: Auto-loop takes too long

**Cause**: Complex verification or slow tests

**Solution**:
- Run expensive checks less frequently
- Use parallel execution where possible
- Set shorter timeout for individual checks

```typescript
// Run fast checks in every iteration
await this.runLinter(); // Fast

// Run slow checks every N iterations
if (iteration % 3 === 0) {
  await this.runFullTestSuite(); // Slow
}
```

### Issue: Tests pass locally but fail in CI

**Cause**: Environment differences

**Solution**:
- Use CI=true environment variable
- Mock external services
- Use deterministic random seeds

```typescript
if (process.env.CI === 'true') {
  // Use CI-specific config
  config.timeout = 60000; // Longer timeout in CI
}
```

## Real-World Example: OpenAI Dev Day

### Feler's 7-Hour Refactor

**Context**: Refactor 15k lines of code using 150M tokens

**Approach**:
1. Break into 50+ small tasks
2. Each task: implement → verify → iterate
3. Auto-loop until tests pass
4. Move to next task only after success

**Result**: Perfect refactor in one session, no regressions

**Key Insight**: "Don't move on until it's perfect"

### Nacho's Pixel-Perfect UI

**Context**: Frontend development with exact design specs

**Approach**:
1. Implement UI component
2. Generate snapshot
3. Compare with design (diff %)
4. If diff > 2%, iterate
5. Loop until pixel-perfect

**Result**: Zero design feedback cycles

**Key Insight**: "Snapshot testing + auto-loop = pixel-perfect results"

### Daniel's Review Loop

**Context**: Ensure PR-ready code before submission

**Approach**:
1. Run comprehensive review
2. Calculate quality score (0-100)
3. If score < 80, show issues
4. User fixes or types "pls fix"
5. Re-review automatically
6. Loop until score ≥ 80

**Result**: 70% more PRs with first-time approval

**Key Insight**: "Review before submitting, not after"

## Conclusion

The auto-loop pattern is the foundation of autonomous development:

1. **Make change**
2. **Run verification** (`exec verify`)
3. **If fail, iterate** (auto-loop)
4. **Only proceed when perfect**

This approach, demonstrated at OpenAI Dev Day, enables truly autonomous development where agents deliver production-ready code without human intervention.

---

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>
