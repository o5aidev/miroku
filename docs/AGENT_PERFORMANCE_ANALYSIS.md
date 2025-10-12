# Agent Performance Analysis & Optimization Strategy

**Date**: 2025-10-11
**Analysis Target**: Miyabi Agent System (BaseAgent + 6 Specialist Agents)
**Current Status**: ⚠️ Multiple Critical Performance Bottlenecks Identified

---

## 📊 Executive Summary

| Agent | Critical Issues | Estimated Impact | Priority |
|-------|----------------|------------------|----------|
| **CodeGenAgent** | Sequential Claude API calls for test generation | **30-60s per issue** | 🔴 Critical |
| **ReviewAgent** | Sequential static analysis (ESLint + TS + Security) | **30-60s per review** | 🔴 Critical |
| **BaseAgent** | Synchronous metrics/logs after every task | **100-500ms × N tasks** | 🟡 High |
| **IssueAgent** | Sequential regex matching, GitHub API calls | **2-5s per issue** | 🟢 Medium |
| **CoordinatorAgent** | **Simulation code only - not calling real agents!** | **Cannot measure** | 🔴 Critical |

**Total Performance Loss**: **60-120 seconds per issue** (mostly from CodeGen + Review)

---

## 🔴 Critical Issue #1: CodeGenAgent Sequential Test Generation

### Problem

**File**: `agents/codegen/codegen-agent.ts:402-447`

```typescript
// ❌ CRITICAL BOTTLENECK
for (const file of generatedCode.files) {
  const testPrompt = `Generate comprehensive unit tests...`;

  const response = await this.anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 4000,
    messages: [{ role: 'user', content: testPrompt }],
  });

  // ... process response
}
```

**Issues:**
- **Sequential Claude API calls** - Each file waits for previous test generation
- **No streaming API** - Waits for complete response (unlike `ai-label-issue.ts` which uses streaming)
- **No parallelization** - 3 files = 3 × 10-20 seconds = **30-60 seconds wasted**

### Solution

```typescript
// ✅ OPTIMIZED: Parallel test generation with streaming
private async generateTests(
  generatedCode: GeneratedCode,
  _spec: CodeSpec
): Promise<Array<{ path: string; content: string }>> {
  this.log('🧪 Generating unit tests (parallel)');

  // Generate all tests in parallel
  const testPromises = generatedCode.files.map(async (file) => {
    const testPrompt = `Generate comprehensive unit tests for the following TypeScript code:

\`\`\`typescript
${file.content}
\`\`\`

Requirements:
1. Use Vitest as the testing framework
2. Test all public methods
3. Include edge cases
4. Mock external dependencies
5. Aim for >80% coverage

Generate the test file:`;

    try {
      // Use streaming API for faster TTFB
      let fullText = '';
      const stream = await this.anthropic.messages.stream({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 4000,
        messages: [{ role: 'user', content: testPrompt }],
      });

      for await (const chunk of stream) {
        if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta') {
          fullText += chunk.delta.text;
        }
      }

      const testPath = file.path.replace(/\.ts$/, '.test.ts');
      const codeMatch = fullText.match(/```(?:typescript|ts)\s*\n([\s\S]*?)```/);

      if (codeMatch) {
        return {
          path: testPath,
          content: codeMatch[1].trim(),
        };
      }

      return null;
    } catch (error) {
      this.log(`⚠️  Failed to generate tests for ${file.path}: ${(error as Error).message}`);
      return null;
    }
  });

  // Wait for all tests to complete in parallel
  const tests = await Promise.all(testPromises);
  return tests.filter((t): t is { path: string; content: string } => t !== null);
}
```

**Performance Gain**: 30-60 seconds → **10-20 seconds** (**3x faster**)

---

## 🔴 Critical Issue #2: ReviewAgent Sequential Static Analysis

### Problem

**File**: `agents/review/review-agent.ts:40-60`

```typescript
// ❌ CRITICAL BOTTLENECK
// 2. Run static analysis
const eslintIssues = await this.runESLint(reviewRequest.files);          // 10-20s
const typeScriptIssues = await this.runTypeScriptCheck(reviewRequest.files); // 10-20s

// 3. Run security scan
const securityIssues = await this.runSecurityScan(reviewRequest.files);  // 10-20s
```

**Issues:**
- **Sequential execution** - Each analysis waits for previous to complete
- **Total time**: 10-20s + 10-20s + 10-20s = **30-60 seconds**
- ESLint, TypeScript, and Security scans are independent and can run in parallel

### Solution

```typescript
// ✅ OPTIMIZED: Parallel static analysis
async execute(task: Task): Promise<AgentResult> {
  this.log('🔍 ReviewAgent starting code review');

  try {
    const reviewRequest = await this.createReviewRequest(task);

    // Run all analysis in parallel
    const [eslintIssues, typeScriptIssues, securityIssues] = await Promise.all([
      this.runESLint(reviewRequest.files),
      this.runTypeScriptCheck(reviewRequest.files),
      this.runSecurityScan(reviewRequest.files),
    ]);

    // ... rest of code
  }
}
```

**Additional Optimization**: Parallel security scans within `runSecurityScan()`

```typescript
// ✅ OPTIMIZED: Parallel security scans
private async runSecurityScan(files: string[]): Promise<QualityIssue[]> {
  this.log('🔒 Running security scan (parallel)');

  // Run all security scans in parallel
  const [secretIssues, vulnIssues, auditIssues] = await Promise.all([
    this.scanForSecrets(files),
    this.scanForVulnerabilities(files),
    this.runNpmAudit(),
  ]);

  const issues = [...secretIssues, ...vulnIssues, ...auditIssues];
  this.log(`   Found ${issues.length} security issues`);
  return issues;
}
```

**Performance Gain**: 30-60 seconds → **10-20 seconds** (**3x faster**)

---

## 🟡 High Priority #3: BaseAgent Synchronous Metrics/Logs

### Problem

**File**: `agents/base-agent.ts:190-217, 244-261`

```typescript
// ❌ BLOCKS EXECUTION
protected async recordMetrics(result: AgentResult): Promise<void> {
  const metrics: AgentMetrics = { /* ... */ };

  const metricsFile = path.join(metricsDir, `${this.agentType}-${Date.now()}.json`);

  // Synchronous file write - blocks task completion
  await fs.promises.writeFile(metricsFile, JSON.stringify(metrics, null, 2));

  logger.info(`Metrics recorded: ${metricsFile}`);
}

protected async updateLDDLog(result: AgentResult): Promise<void> {
  const lddEntry = this.formatLDDEntry(codexPromptChain, this.logs);

  // Synchronous file append - blocks task completion
  await this.appendToFile(logFile, lddEntry);
}
```

**Issues:**
- **Blocks task completion** - Every agent waits for file I/O before returning
- **No batching** - One file write per task
- **Multiplied across all agents** - 6 agents × 10 tasks = 60 file writes
- **Impact**: 100-500ms per task × N tasks = **significant cumulative delay**

### Solution

```typescript
// ✅ OPTIMIZED: Async metrics queue with batching
class MetricsQueue {
  private queue: Array<{ file: string; data: any }> = [];
  private flushInterval: NodeJS.Timeout;
  private flushing: boolean = false;

  constructor() {
    // Flush every 5 seconds or when queue reaches 10 items
    this.flushInterval = setInterval(() => this.flush(), 5000);
  }

  add(file: string, data: any): void {
    this.queue.push({ file, data });

    // Flush immediately if queue is large
    if (this.queue.length >= 10) {
      this.flush();
    }
  }

  private async flush(): Promise<void> {
    if (this.flushing || this.queue.length === 0) return;

    this.flushing = true;
    const batch = [...this.queue];
    this.queue = [];

    // Write all files in parallel
    await Promise.all(
      batch.map(({ file, data }) =>
        fs.promises.writeFile(file, JSON.stringify(data, null, 2)).catch(console.error)
      )
    );

    this.flushing = false;
  }

  destroy(): void {
    clearInterval(this.flushInterval);
    this.flush(); // Final flush
  }
}

// Global metrics queue (singleton)
const metricsQueue = new MetricsQueue();

// In BaseAgent:
protected async recordMetrics(result: AgentResult): Promise<void> {
  const metrics: AgentMetrics = { /* ... */ };
  const metricsFile = path.join(metricsDir, `${this.agentType}-${Date.now()}.json`);

  // Non-blocking - queue for async write
  metricsQueue.add(metricsFile, metrics);

  // Return immediately - don't wait for file I/O
}
```

**Performance Gain**: **100-500ms per task eliminated** → Immediate return

---

## 🔴 Critical Issue #4: CoordinatorAgent Simulation Only

### Problem

**File**: `agents/coordinator/coordinator-agent.ts:568-602`

```typescript
// ❌ SIMULATION CODE - NOT CALLING REAL AGENTS!
private async executeLevelParallel(
  taskIds: string[],
  allTasks: Task[],
  _concurrency: number
): Promise<TaskResult[]> {
  // ...

  const results = await Promise.all(
    tasks.map(async (task) => {
      const startTime = Date.now();
      this.log(`   🏃 Executing: ${task.id} (${task.assignedAgent})`);

      // ❌ Simulate execution - NOT REAL!
      await this.sleep(Math.random() * 1000 + 500);

      return {
        taskId: task.id,
        status: 'completed' as AgentStatus,
        // ...
        result: {
          status: 'success' as const,
          data: { simulated: true }, // ❌ SIMULATED!
        },
      };
    })
  );

  return results;
}
```

**Issues:**
- **Line 584**: `await this.sleep(Math.random() * 1000 + 500)` - Fake delay
- **Line 595**: `data: { simulated: true }` - Not calling actual agents
- **Comment says**: "TODO: integrate with actual agents"
- **Cannot measure real performance** - All timing data is fake

### Solution

```typescript
// ✅ OPTIMIZED: Call real specialist agents
private async executeLevelParallel(
  taskIds: string[],
  allTasks: Task[],
  _concurrency: number
): Promise<TaskResult[]> {
  const tasks = taskIds
    .map((id) => allTasks.find((t) => t.id === id))
    .filter((t): t is Task => t !== undefined);

  // Import real agent implementations
  const { CodeGenAgent } = await import('../codegen/codegen-agent.js');
  const { DeploymentAgent } = await import('../deployment/deployment-agent.js');
  const { ReviewAgent } = await import('../review/review-agent.js');

  const results = await Promise.all(
    tasks.map(async (task) => {
      const startTime = Date.now();
      this.log(`   🏃 Executing: ${task.id} (${task.assignedAgent})`);

      let agent: BaseAgent;

      // Instantiate appropriate agent
      switch (task.assignedAgent) {
        case 'CodeGenAgent':
          agent = new CodeGenAgent(this.config);
          break;
        case 'DeploymentAgent':
          agent = new DeploymentAgent(this.config);
          break;
        case 'ReviewAgent':
          agent = new ReviewAgent(this.config);
          break;
        default:
          agent = new CodeGenAgent(this.config); // Default
      }

      // Execute real agent
      const result = await agent.execute(task);
      const durationMs = Date.now() - startTime;

      return {
        taskId: task.id,
        status: result.status === 'success' ? ('completed' as AgentStatus) : ('failed' as AgentStatus),
        agentType: task.assignedAgent,
        durationMs,
        result,
      };
    })
  );

  return results;
}
```

**Performance Gain**: Unknown (currently unmeasurable due to simulation)

---

## 🟢 Medium Priority #5: IssueAgent Regex Optimization

### Problem

**File**: `agents/issue/issue-agent.ts:292-428`

Multiple regex patterns executed sequentially:

```typescript
// ❌ INEFFICIENT: Multiple regex passes
private determineIssueType(issue: Issue): Task['type'] {
  const text = (issue.title + ' ' + issue.body).toLowerCase();

  // First pass
  if (text.match(/\b(bug|fix|error|issue|problem|broken)\b/)) return 'bug';
  // Second pass
  if (text.match(/\b(feature|add|new|implement|create)\b/)) return 'feature';
  // Third pass
  if (text.match(/\b(refactor|cleanup|improve|optimize)\b/)) return 'refactor';
  // ... more passes
}
```

### Solution

```typescript
// ✅ OPTIMIZED: Single regex pass with capture groups
private determineIssueType(issue: Issue): Task['type'] {
  const text = (issue.title + ' ' + issue.body).toLowerCase();

  // Check labels first (fast path)
  for (const label of issue.labels) {
    if (label.includes('feature')) return 'feature';
    if (label.includes('bug')) return 'bug';
    // ...
  }

  // Single regex with alternation
  const typePattern = /\b(bug|fix|error|issue|problem|broken|feature|add|new|implement|create|refactor|cleanup|improve|optimize|doc|documentation|readme|guide|test|spec|coverage|deploy|release|ci|cd)\b/;
  const match = text.match(typePattern);

  if (match) {
    const keyword = match[1];
    if (['bug', 'fix', 'error', 'issue', 'problem', 'broken'].includes(keyword)) return 'bug';
    if (['feature', 'add', 'new', 'implement', 'create'].includes(keyword)) return 'feature';
    if (['refactor', 'cleanup', 'improve', 'optimize'].includes(keyword)) return 'refactor';
    if (['doc', 'documentation', 'readme', 'guide'].includes(keyword)) return 'docs';
    if (['test', 'spec', 'coverage'].includes(keyword)) return 'test';
    if (['deploy', 'release', 'ci', 'cd'].includes(keyword)) return 'deployment';
  }

  return 'feature'; // Default
}
```

**Performance Gain**: 5-10ms per issue (minor but cumulative)

---

## 📈 Additional Optimizations

### 6. CodeGenAgent: Parallel File Operations

**File**: `agents/codegen/codegen-agent.ts:161-180, 528-552`

```typescript
// ❌ CURRENT: Sequential file scanning and writing
private async getExistingFiles(): Promise<string[]> {
  const files: string[] = [];
  const scanDir = async (dir: string) => {
    const entries = await fs.promises.readdir(dir, { withFileTypes: true });
    for (const entry of entries) {
      // Sequential processing
      if (entry.isDirectory()) {
        await scanDir(fullPath);
      }
    }
  };
  await scanDir(process.cwd());
  return files;
}

// ✅ OPTIMIZED: Parallel file scanning with fast-glob
import fg from 'fast-glob';

private async getExistingFiles(): Promise<string[]> {
  // Use fast-glob for parallel directory scanning
  const files = await fg(['**/*.ts', '**/*.tsx'], {
    cwd: process.cwd(),
    ignore: ['node_modules', '.git', 'dist', 'build'],
    absolute: true,
  });
  return files.slice(0, 50);
}

// ✅ OPTIMIZED: Parallel file writing
private async writeGeneratedFiles(generatedCode: GeneratedCode): Promise<void> {
  this.log('💾 Writing generated files to disk (parallel)');

  // Create all directories first
  const dirs = new Set([
    ...generatedCode.files.map(f => path.dirname(f.path)),
    ...generatedCode.tests.map(t => path.dirname(t.path)),
  ]);

  await Promise.all([...dirs].map(dir => this.ensureDirectory(dir)));

  // Write all files in parallel
  await Promise.all([
    ...generatedCode.files.map(file =>
      fs.promises.writeFile(
        path.join(process.cwd(), file.path),
        file.content,
        'utf-8'
      ).then(() => this.log(`   ✍️  Wrote: ${file.path}`))
    ),
    ...generatedCode.tests.map(test =>
      fs.promises.writeFile(
        path.join(process.cwd(), test.path),
        test.content,
        'utf-8'
      ).then(() => this.log(`   ✍️  Wrote test: ${test.path}`))
    ),
  ]);
}
```

### 7. ReviewAgent: Parallel File Scanning for Security

**File**: `agents/review/review-agent.ts:313-393`

```typescript
// ✅ OPTIMIZED: Parallel file scanning for secrets and vulnerabilities
private async scanForSecrets(files: string[]): Promise<QualityIssue[]> {
  // Read all files in parallel
  const fileContents = await Promise.all(
    files.map(async (file) => {
      try {
        const content = await fs.promises.readFile(file, 'utf-8');
        return { file, content };
      } catch {
        return null;
      }
    })
  );

  const issues: QualityIssue[] = [];

  // Process all files (already in memory)
  for (const item of fileContents) {
    if (!item) continue;

    const lines = item.content.split('\n');
    // ... pattern matching
  }

  return issues;
}
```

---

## 📊 Performance Impact Summary

### Before Optimizations

```
Single Issue Processing Pipeline:
1. IssueAgent: 2-5 seconds
2. CoordinatorAgent: (unmeasurable - simulation)
3. CodeGenAgent: 60-90 seconds
   - Code generation: 5-10s
   - Test generation (sequential): 30-60s ❌
   - Documentation: 5-10s
   - File operations: 5-10s
4. ReviewAgent: 30-60 seconds ❌
   - ESLint (sequential): 10-20s
   - TypeScript (sequential): 10-20s
   - Security (sequential): 10-20s
5. BaseAgent metrics: 100-500ms × 4 agents = 400-2000ms ❌

Total: ~95-160 seconds per issue
```

### After All Optimizations

```
Single Issue Processing Pipeline:
1. IssueAgent: 2-5 seconds (regex optimized)
2. CoordinatorAgent: (real timing after integration)
3. CodeGenAgent: 20-30 seconds ✅
   - Code generation: 5-10s
   - Test generation (parallel): 10-20s ✅ (3x faster)
   - Documentation: 5-10s
   - File operations (parallel): <1s ✅
4. ReviewAgent: 10-20 seconds ✅
   - All analyses (parallel): 10-20s ✅ (3x faster)
5. BaseAgent metrics: <10ms (async queue) ✅

Total: ~35-60 seconds per issue
```

**Overall Performance Gain**: **95-160s → 35-60s** (**2.5-3x faster**)

---

## 🎯 Implementation Priority

### Phase 1: Critical Fixes (Week 1)

1. **CodeGenAgent**: Parallel test generation with streaming API
2. **ReviewAgent**: Parallel static analysis (ESLint + TS + Security)
3. **CoordinatorAgent**: Integrate real agent execution (remove simulation)

**Expected Impact**: **60-90 seconds saved** per issue

### Phase 2: High Priority (Week 2)

4. **BaseAgent**: Async metrics queue with batching
5. **CodeGenAgent**: Parallel file operations
6. **ReviewAgent**: Parallel file scanning

**Expected Impact**: **Additional 10-20 seconds saved**

### Phase 3: Polish (Week 3)

7. **IssueAgent**: Regex optimization
8. **All Agents**: Add performance monitoring
9. **Documentation**: Update performance docs

**Expected Impact**: **Minor but cumulative improvements**

---

## 🧪 Testing Strategy

### Benchmarking

```bash
# Before optimizations
time npm run agents:parallel:exec -- --issues 60,61,62 --concurrency 1

# After each optimization phase
time npm run agents:parallel:exec -- --issues 60,61,62 --concurrency 1

# Compare results
```

### Metrics to Track

- **End-to-end issue processing time**
- **Per-agent execution time**
- **Claude API call count and duration**
- **File I/O operations count**
- **Memory usage**

---

## 📝 Related Files

- `docs/PERFORMANCE_OPTIMIZATIONS.md` - Dashboard & script optimizations (already completed)
- `agents/base-agent.ts` - Base class for all agents
- `agents/codegen/codegen-agent.ts` - Code generation agent
- `agents/review/review-agent.ts` - Code review agent
- `agents/coordinator/coordinator-agent.ts` - Task orchestration
- `scripts/ai-label-issue.ts` - Example of streaming API usage

---

**Last Updated**: 2025-10-11
**Status**: ⚠️ Ready for implementation
**Estimated ROI**: **2.5-3x faster issue processing** (95-160s → 35-60s)
