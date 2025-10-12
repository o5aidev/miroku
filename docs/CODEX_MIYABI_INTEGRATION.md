# Codex × Miyabi 統合アーキテクチャ

**Autonomous Development Platform Architecture**

Version: 1.0.0
Date: 2025-10-10
Author: Shunsuke Hayashi

---

## 📋 Executive Summary

**Miyabi** と **Codex** は統合された自律型開発プラットフォームを構成しています。

- **Codex**: Rust製のCLI + Agent orchestration engine (GitHub: ShunsukeHayashi/codex)
- **Miyabi**: TypeScript製のGitHub統合層 + 組織設計原則実装 (GitHub: ShunsukeHayashi/Miyabi)
- **miyabi-agent-sdk**: 両者を繋ぐAgent SDK (npm: miyabi-agent-sdk)

---

## 🏗️ Part 1: アーキテクチャ全体像

### 1.1 Repository Structure

```
┌─────────────────────────────────────────────────────────────┐
│                     Ecosystem Overview                       │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │  Repository 1: Autonomous-Operations               │    │
│  │  (GitHub: ShunsukeHayashi/Miyabi)                  │    │
│  ├────────────────────────────────────────────────────┤    │
│  │  - GitHub as OS Integration (15 components)        │    │
│  │  - 53 Label System (組織設計原則)                   │    │
│  │  - CLI Package (packages/cli/)                     │    │
│  │  - Documentation (docs/)                           │    │
│  │  - Workflows (.github/workflows/)                  │    │
│  │  - Claude Code Plugin (.claude-plugin/)            │    │
│  └────────────────────────────────────────────────────┘    │
│                          │                                   │
│                          │ depends on                        │
│                          ↓                                   │
│  ┌────────────────────────────────────────────────────┐    │
│  │  NPM Package: miyabi-agent-sdk                     │    │
│  │  (npm: miyabi-agent-sdk@0.1.0-alpha.2)             │    │
│  ├────────────────────────────────────────────────────┤    │
│  │  - 7 Autonomous Agents                             │    │
│  │  - Agent Orchestration Logic                       │    │
│  │  - Claude API Integration                          │    │
│  │  - GitHub Octokit Integration                      │    │
│  └────────────────────────────────────────────────────┘    │
│                          ↑                                   │
│                          │ published from                    │
│                          │                                   │
│  ┌────────────────────────────────────────────────────┐    │
│  │  Repository 2: codex                               │    │
│  │  (GitHub: ShunsukeHayashi/codex)                   │    │
│  ├────────────────────────────────────────────────────┤    │
│  │  ├── codex-rs/          (Rust CLI)                 │    │
│  │  │   ├── cli/           (Command-line interface)   │    │
│  │  │   ├── core/          (Core logic)               │    │
│  │  │   └── tui/           (Terminal UI)              │    │
│  │  │                                                  │    │
│  │  └── codex-miyabi/      (TypeScript Integration)   │    │
│  │      └── packages/                                  │    │
│  │          ├── miyabi-agent-sdk/    ← SOURCE         │    │
│  │          ├── miyabi-mcp-server/                    │    │
│  │          └── github-integration/                   │    │
│  └────────────────────────────────────────────────────┘    │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

### 1.2 Dependency Flow

```
Autonomous-Operations (Miyabi)
    ↓ npm install
miyabi-agent-sdk@0.1.0-alpha.2
    ↑ npm publish
codex/codex-miyabi/packages/miyabi-agent-sdk/
    ← developed in
codex repository
```

**Key Point**: miyabi-agent-sdkは**codexリポジトリで開発**され、**npmに公開**され、**Miyabiプロジェクトから依存**される。

---

## 🎯 Part 2: プロジェクト役割分担

### 2.1 Codex (codexリポジトリ)

**Purpose**: AI Agent orchestration engine + CLI

**Technologies**:
- **Rust** (codex-rs/): CLI, TUI, コア実行エンジン
- **TypeScript** (codex-miyabi/): Agent SDK, MCP Server, GitHub統合

**Key Features**:
1. **Agent Orchestration**: 7つのAgentを階層的に実行
2. **Model Context Protocol (MCP)**: Claude との高度な統合
3. **Sandbox Execution**: 安全なコード実行環境
4. **CLI Interface**: `codex` コマンドで全機能にアクセス

**GitHub**: https://github.com/ShunsukeHayashi/codex

---

### 2.2 Miyabi (Autonomous-Operationsリポジトリ)

**Purpose**: GitHub as OS platform + 組織設計原則実装

**Technologies**:
- **TypeScript**: GitHub統合、CLI、Workflow生成
- **GitHub Actions**: CI/CD自動化
- **Node.js**: CLI実行環境

**Key Features**:
1. **GitHub as OS**: 15コンポーネント統合 (Issues, Actions, Projects, Webhooks, Pages, etc.)
2. **53 Label System**: 組織設計原則に基づく構造化ラベル
3. **CLI Package** (`miyabi`): プロジェクト初期化、ステータス確認、Agent実行
4. **Claude Code Plugin**: Slash commands, Agents, Hooks

**GitHub**: https://github.com/ShunsukeHayashi/Miyabi (Autonomous-Operations)

---

### 2.3 miyabi-agent-sdk (npmパッケージ)

**Purpose**: Agent実装の共通基盤

**Technologies**:
- **TypeScript**: Agent実装
- **@anthropic-ai/sdk**: Claude API統合
- **@octokit/rest**: GitHub API統合

**Key Features**:
1. **7つのAgent実装**:
   - CoordinatorAgent
   - CodeGenAgent
   - ReviewAgent
   - IssueAgent
   - PRAgent
   - DeploymentAgent
   - TestAgent

2. **Agent Base Classes**: 共通インターフェース
3. **GitHub Integration**: Octokit wrapper
4. **Claude Integration**: Anthropic SDK wrapper

**NPM**: https://www.npmjs.com/package/miyabi-agent-sdk

**Source**: codex/codex-miyabi/packages/miyabi-agent-sdk/

---

## 🔄 Part 3: Integration Flow

### 3.1 Development Workflow

```
┌─────────────────────────────────────────────────────────┐
│ Step 1: Agent Development (codex repo)                  │
└─────────────────────────────────────────────────────────┘
Developer works in:
  codex/codex-miyabi/packages/miyabi-agent-sdk/src/

Changes:
  - agents/coordinator.ts
  - agents/codegen.ts
  - agents/review.ts
  - etc.

┌─────────────────────────────────────────────────────────┐
│ Step 2: Build & Test                                    │
└─────────────────────────────────────────────────────────┘
cd codex/codex-miyabi/packages/miyabi-agent-sdk
pnpm build
pnpm test

┌─────────────────────────────────────────────────────────┐
│ Step 3: Version Bump & Publish to npm                   │
└─────────────────────────────────────────────────────────┘
# In codex/codex-miyabi/packages/miyabi-agent-sdk/
npm version 0.1.0-alpha.3
npm publish --access public --tag alpha

Published to: https://www.npmjs.com/package/miyabi-agent-sdk

┌─────────────────────────────────────────────────────────┐
│ Step 4: Update Miyabi Dependency                        │
└─────────────────────────────────────────────────────────┘
# In Autonomous-Operations/packages/cli/
cd packages/cli
pnpm add miyabi-agent-sdk@^0.1.0-alpha.3

┌─────────────────────────────────────────────────────────┐
│ Step 5: Use Updated SDK in Miyabi                       │
└─────────────────────────────────────────────────────────┘
# In Autonomous-Operations/
import { CoordinatorAgent } from 'miyabi-agent-sdk';

const coordinator = new CoordinatorAgent(octokit, config);
await coordinator.execute();
```

---

### 3.2 Runtime Execution Flow

```
┌──────────────────────────────────────────────────────┐
│  User runs: npx miyabi auto                          │
└──────────────────────────────────────────────────────┘
                    ↓
┌──────────────────────────────────────────────────────┐
│  Miyabi CLI (packages/cli/src/commands/auto.ts)      │
└──────────────────────────────────────────────────────┘
                    ↓ import
┌──────────────────────────────────────────────────────┐
│  miyabi-agent-sdk                                    │
│  (node_modules/miyabi-agent-sdk/)                    │
└──────────────────────────────────────────────────────┘
                    ↓ instantiate
┌──────────────────────────────────────────────────────┐
│  CoordinatorAgent                                    │
│  - Analyze pending issues                           │
│  - Create DAG (task decomposition)                   │
│  - Assign to specialist agents                       │
└──────────────────────────────────────────────────────┘
                    ↓ delegate
┌─────────────┬──────────────┬──────────────┐
│ IssueAgent  │ CodeGenAgent │ ReviewAgent  │
│             │              │              │
│ - Analyze   │ - Generate   │ - Review     │
│ - Classify  │ - Test       │ - Score      │
│ - Label     │ - Document   │ - Suggest    │
└─────────────┴──────────────┴──────────────┘
                    ↓ parallel execution
┌──────────────────────────────────────────────────────┐
│  GitHub API                                          │
│  - Issues, PRs, Actions, Projects, Webhooks         │
└──────────────────────────────────────────────────────┘
                    ↓ updates
┌──────────────────────────────────────────────────────┐
│  GitHub Repository                                   │
│  - Labels updated                                    │
│  - Code committed                                    │
│  - PR created                                        │
│  - CI/CD triggered                                   │
└──────────────────────────────────────────────────────┘
```

---

## 🧩 Part 4: Agent Architecture

### 4.1 Agent Hierarchy (from Codex)

```
┌─────────────────────────────────────────────────────┐
│          Layer 1: Coordinator (指揮層)              │
├─────────────────────────────────────────────────────┤
│  CoordinatorAgent                                   │
│  - Issue分析・DAG分解                               │
│  - Critical Path特定                                │
│  - Agent割り当て                                    │
└─────────────────────────────────────────────────────┘
                    ↓ delegates
┌─────────────────────────────────────────────────────┐
│        Layer 2: Specialist (専門実行層)             │
├─────────────────────────────────────────────────────┤
│  ┌────────────┐  ┌────────────┐  ┌────────────┐   │
│  │ IssueAgent │  │ CodeGenAgent│  │ ReviewAgent│   │
│  └────────────┘  └────────────┘  └────────────┘   │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐   │
│  │  PRAgent   │  │ Deployment │  │ TestAgent  │   │
│  │            │  │   Agent    │  │            │   │
│  └────────────┘  └────────────┘  └────────────┘   │
└─────────────────────────────────────────────────────┘
                    ↓ uses
┌─────────────────────────────────────────────────────┐
│        Layer 3: Support (支援層)                    │
├─────────────────────────────────────────────────────┤
│  - GitHub API Client (Octokit)                      │
│  - Claude API Client (Anthropic SDK)                │
│  - MCP Server (Model Context Protocol)              │
│  - Sandbox Execution Environment                    │
└─────────────────────────────────────────────────────┘
```

---

### 4.2 Agent Details

#### CoordinatorAgent (指揮Agent)

**Role**: タスク統括・並列実行制御

**Inputs**:
- GitHub Issue (number, title, body, labels)

**Process**:
1. Issue内容を分析 (Claude Sonnet 4)
2. タスクをDAG (Directed Acyclic Graph) に分解
3. Critical Pathを特定
4. 各タスクを適切なSpecialist Agentに割り当て
5. 並列実行可能なタスクを特定
6. 実行順序を決定

**Outputs**:
- Task DAG (JSON)
- Agent assignments
- Execution plan

**Example**:
```typescript
import { CoordinatorAgent } from 'miyabi-agent-sdk';

const coordinator = new CoordinatorAgent(octokit, {
  anthropicApiKey: process.env.ANTHROPIC_API_KEY,
  owner: 'ShunsukeHayashi',
  repo: 'Miyabi'
});

const plan = await coordinator.analyzeIssue(42);
// → {
//     tasks: [
//       { id: 'A', agent: 'codegen', parallel: false },
//       { id: 'B', agent: 'test', parallel: true },
//       { id: 'C', agent: 'review', parallel: false }
//     ],
//     criticalPath: ['A', 'C'],
//     estimatedTime: '4 hours'
//   }
```

---

#### CodeGenAgent (コード生成Agent)

**Role**: AI駆動コード生成

**Inputs**:
- Task description
- Existing codebase context

**Process**:
1. Task要件を分析
2. 既存コードを読み込み (MCP経由)
3. Claude Sonnet 4でコード生成
4. TypeScript strict mode準拠
5. ユニットテスト自動生成
6. 生成コードをファイルに書き込み

**Outputs**:
- Generated code files
- Test files
- Documentation

**Example**:
```typescript
import { CodeGenAgent } from 'miyabi-agent-sdk';

const codegen = new CodeGenAgent(octokit, config);

const result = await codegen.generateCode({
  task: 'Add dark mode toggle to settings page',
  files: ['src/components/Settings.tsx']
});

// → {
//     files: [
//       { path: 'src/components/Settings.tsx', content: '...' },
//       { path: 'src/components/Settings.test.tsx', content: '...' }
//     ],
//     testsGenerated: 5,
//     coverage: 85%
//   }
```

---

#### ReviewAgent (コード品質判定Agent)

**Role**: コード品質レビュー・スコアリング

**Inputs**:
- Changed files (diff)
- PR description

**Process**:
1. 変更内容を分析
2. 静的解析 (ESLint, TypeScript)
3. セキュリティスキャン (SAST)
4. 品質スコア算出 (100点満点)
   - Code quality: 40点
   - Test coverage: 30点
   - Security: 20点
   - Documentation: 10点
5. 改善提案生成

**Outputs**:
- Quality score (0-100)
- Issues list
- Improvement suggestions

**Example**:
```typescript
import { ReviewAgent } from 'miyabi-agent-sdk';

const reviewer = new ReviewAgent(octokit, config);

const review = await reviewer.reviewPR(123);

// → {
//     score: 85,
//     breakdown: {
//       quality: 35/40,
//       coverage: 25/30,
//       security: 18/20,
//       docs: 7/10
//     },
//     issues: [
//       { type: 'warning', message: 'Unused variable at line 42' }
//     ],
//     suggestions: [
//       'Add JSDoc comments for public functions'
//     ]
//   }
```

---

#### IssueAgent (Issue分析・ラベル管理Agent)

**Role**: Issue自動分類・ラベル推論

**Inputs**:
- Issue title & body

**Process**:
1. Issue内容を分析 (Claude Sonnet 4)
2. 53ラベル体系から適切なラベルを推論
   - STATE: pending → analyzing → implementing → ...
   - TYPE: feature, bug, docs, refactor, ...
   - PRIORITY: P0-Critical, P1-High, P2-Medium, P3-Low
   - SEVERITY: Sev.1-Critical ~ Sev.4-Low
3. タスク複雑度推定 (小/中/大/特大)
4. 推定工数算出

**Outputs**:
- Inferred labels (array)
- Complexity estimate
- Estimated hours

**Example**:
```typescript
import { IssueAgent } from 'miyabi-agent-sdk';

const issueAgent = new IssueAgent(octokit, config);

const analysis = await issueAgent.analyzeIssue(42);

// → {
//     labels: [
//       '📥 state:pending',
//       '✨ type:feature',
//       '⚠️ priority:P1-High',
//       '📊 severity:Sev.3-Medium'
//     ],
//     complexity: '中',
//     estimatedHours: 8
//   }
```

---

#### PRAgent (Pull Request自動作成Agent)

**Role**: PR自動生成・管理

**Inputs**:
- Branch name
- Changed files
- Commit history

**Process**:
1. コミット履歴を分析
2. 変更内容をサマリー化 (Claude)
3. Conventional Commits準拠のPR titleを生成
4. PR descriptionを生成
   - Summary
   - Test plan
   - Breaking changes
5. Draft PRを作成
6. レビュワー自動割り当て

**Outputs**:
- PR URL
- PR number

**Example**:
```typescript
import { PRAgent } from 'miyabi-agent-sdk';

const prAgent = new PRAgent(octokit, config);

const pr = await prAgent.createPR({
  branch: 'feature/dark-mode',
  base: 'main',
  issue: 42
});

// → {
//     url: 'https://github.com/ShunsukeHayashi/Miyabi/pull/123',
//     number: 123,
//     title: 'feat: Add dark mode toggle to settings page',
//     reviewers: ['user1', 'user2']
//   }
```

---

#### DeploymentAgent (CI/CDデプロイ自動化Agent)

**Role**: デプロイ管理・ヘルスチェック

**Inputs**:
- Environment (dev, staging, prod)
- Deploy target (Firebase, Vercel, AWS, etc.)

**Process**:
1. デプロイ前チェック
   - Tests passing
   - Coverage >= 80%
   - No security vulnerabilities
2. デプロイ実行 (Firebase CLI, Vercel CLI, etc.)
3. ヘルスチェック
   - HTTP status code
   - Response time
   - Error rate
4. 失敗時は自動Rollback

**Outputs**:
- Deploy status
- Deploy URL
- Health check results

**Example**:
```typescript
import { DeploymentAgent } from 'miyabi-agent-sdk';

const deployer = new DeploymentAgent(octokit, config);

const deployment = await deployer.deploy({
  env: 'production',
  target: 'firebase'
});

// → {
//     status: 'success',
//     url: 'https://miyabi-prod.web.app',
//     healthCheck: {
//       statusCode: 200,
//       responseTime: 120,
//       errorRate: 0
//     }
//   }
```

---

#### TestAgent (テスト自動実行Agent)

**Role**: テスト実行・カバレッジレポート

**Inputs**:
- Test command (npm test, vitest, jest, etc.)

**Process**:
1. テスト実行 (Vitest, Jest, Playwright)
2. カバレッジ計測
3. 失敗テストを分析
4. カバレッジレポート生成 (HTML, JSON)
5. 80%+カバレッジ目標達成チェック

**Outputs**:
- Test results (passed, failed, skipped)
- Coverage % (statements, lines, functions, branches)
- Coverage report path

**Example**:
```typescript
import { TestAgent } from 'miyabi-agent-sdk';

const tester = new TestAgent(octokit, config);

const testResult = await tester.runTests();

// → {
//     passed: 230,
//     failed: 4,
//     skipped: 0,
//     coverage: {
//       statements: 82.5,
//       lines: 81.3,
//       functions: 78.9,
//       branches: 75.2
//     },
//     reportPath: 'coverage/index.html'
//   }
```

---

## 🔗 Part 5: Integration Points

### 5.1 Miyabi → miyabi-agent-sdk

**Where**: packages/cli/src/commands/auto.ts

**How**:
```typescript
import {
  CoordinatorAgent,
  CodeGenAgent,
  ReviewAgent,
  IssueAgent,
  PRAgent,
  DeploymentAgent,
  TestAgent
} from 'miyabi-agent-sdk';

export async function autoCommand() {
  const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });

  const config = {
    anthropicApiKey: process.env.ANTHROPIC_API_KEY,
    owner: 'ShunsukeHayashi',
    repo: 'Miyabi'
  };

  // Step 1: Analyze pending issues
  const issueAgent = new IssueAgent(octokit, config);
  const pendingIssues = await issueAgent.findPendingIssues();

  // Step 2: For each issue, create execution plan
  const coordinator = new CoordinatorAgent(octokit, config);
  for (const issue of pendingIssues) {
    const plan = await coordinator.analyzeIssue(issue.number);

    // Step 3: Execute plan
    await executeAgentPlan(plan, octokit, config);
  }
}

async function executeAgentPlan(plan, octokit, config) {
  for (const task of plan.tasks) {
    switch (task.agent) {
      case 'codegen':
        const codegen = new CodeGenAgent(octokit, config);
        await codegen.execute(task);
        break;
      case 'review':
        const reviewer = new ReviewAgent(octokit, config);
        await reviewer.execute(task);
        break;
      // ... etc
    }
  }
}
```

---

### 5.2 miyabi-agent-sdk → Codex (MCP)

**Where**: codex/codex-miyabi/packages/miyabi-mcp-server/

**How**: Model Context Protocol (MCP) を使用してCodex Rust CLIと通信

```typescript
// In miyabi-agent-sdk/src/agents/codegen.ts
import { MCPClient } from '../mcp/client';

export class CodeGenAgent {
  private mcpClient: MCPClient;

  async generateCode(task: Task): Promise<GeneratedCode> {
    // Use MCP to request code generation from Codex
    const result = await this.mcpClient.request({
      method: 'codex.generateCode',
      params: {
        task: task.description,
        context: task.files
      }
    });

    return result;
  }
}
```

**MCP Server** (codex-miyabi/packages/miyabi-mcp-server/):
```typescript
import { MCPServer } from '@modelcontextprotocol/server';

const server = new MCPServer({
  name: 'miyabi-mcp-server',
  version: '0.1.0'
});

server.registerMethod('codex.generateCode', async (params) => {
  // Call Codex Rust CLI
  const result = await execCodexCLI(['generate', params.task]);
  return result;
});

server.listen(3000);
```

---

### 5.3 Codex → GitHub

**Where**: codex/codex-miyabi/packages/github-integration/

**How**: Octokit を使用してGitHub APIと通信

```typescript
import { Octokit } from '@octokit/rest';

export class GitHubIntegration {
  private octokit: Octokit;

  async createPR(params: PRParams): Promise<PR> {
    const { data } = await this.octokit.pulls.create({
      owner: params.owner,
      repo: params.repo,
      title: params.title,
      body: params.body,
      head: params.branch,
      base: params.base
    });

    return data;
  }

  async addLabels(issue: number, labels: string[]): Promise<void> {
    await this.octokit.issues.addLabels({
      owner: this.owner,
      repo: this.repo,
      issue_number: issue,
      labels
    });
  }
}
```

---

## 📦 Part 6: Package Management

### 6.1 miyabi-agent-sdk Versioning

**Current Version**: 0.1.0-alpha.2

**Version Strategy**:
- **alpha**: 0.1.0-alpha.x (Active development, breaking changes allowed)
- **beta**: 0.1.0-beta.x (API stable, bug fixes)
- **rc**: 0.1.0-rc.x (Release candidate)
- **stable**: 0.1.0 (Production-ready)

**dist-tags on npm**:
```bash
npm dist-tag ls miyabi-agent-sdk

# Output:
alpha: 0.1.0-alpha.2
latest: 0.1.0-alpha.1
```

**Publishing New Version**:
```bash
# In codex/codex-miyabi/packages/miyabi-agent-sdk/
npm version 0.1.0-alpha.3
npm publish --access public --tag alpha

# Update latest tag (when stable)
npm dist-tag add miyabi-agent-sdk@0.1.0 latest
```

---

### 6.2 Miyabi Dependency Update

**Current**: packages/cli/package.json
```json
{
  "dependencies": {
    "miyabi-agent-sdk": "^0.1.0-alpha.2"
  }
}
```

**Updating**:
```bash
# In Autonomous-Operations/packages/cli/
pnpm add miyabi-agent-sdk@^0.1.0-alpha.3

# Verify
pnpm list miyabi-agent-sdk
# → miyabi-agent-sdk 0.1.0-alpha.3
```

---

## 🚀 Part 7: Development Workflow

### 7.1 Feature Development

#### Scenario: Add new Agent (e.g., DocGeneratorAgent)

**Step 1: Develop in codex repo**
```bash
cd codex/codex-miyabi/packages/miyabi-agent-sdk/

# Create new agent
touch src/agents/docgenerator.ts

# Implement
cat > src/agents/docgenerator.ts <<EOF
import { Agent } from '../base/agent';

export class DocGeneratorAgent extends Agent {
  async execute(task: Task): Promise<Result> {
    // Generate documentation using Claude
    const docs = await this.generateDocs(task.files);
    return { docs };
  }

  private async generateDocs(files: string[]): Promise<string> {
    // Implementation...
  }
}
EOF

# Add to index
echo "export { DocGeneratorAgent } from './agents/docgenerator';" >> src/index.ts

# Test
pnpm test

# Build
pnpm build
```

**Step 2: Publish to npm**
```bash
npm version 0.1.0-alpha.3
npm publish --access public --tag alpha
```

**Step 3: Update Miyabi**
```bash
cd ~/Dev/Autonomous-Operations/packages/cli/
pnpm add miyabi-agent-sdk@^0.1.0-alpha.3

# Use new agent
cat > src/commands/docs.ts <<EOF
import { DocGeneratorAgent } from 'miyabi-agent-sdk';

export async function docsCommand() {
  const agent = new DocGeneratorAgent(octokit, config);
  await agent.execute({ files: ['src/**/*.ts'] });
}
EOF
```

**Step 4: Commit & Push**
```bash
git add .
git commit -m "feat: Add DocGeneratorAgent via miyabi-agent-sdk@0.1.0-alpha.3"
git push
```

---

### 7.2 Bug Fix Workflow

#### Scenario: Fix bug in CodeGenAgent

**Step 1: Fix in codex repo**
```bash
cd codex/codex-miyabi/packages/miyabi-agent-sdk/

# Fix bug
vim src/agents/codegen.ts

# Test
pnpm test

# Build
pnpm build
```

**Step 2: Publish patch version**
```bash
npm version 0.1.0-alpha.3
npm publish --access public --tag alpha
```

**Step 3: Update Miyabi (automatic with ^)**
```bash
cd ~/Dev/Autonomous-Operations/packages/cli/

# If using ^0.1.0-alpha.2, npm install will pick up 0.1.0-alpha.3
pnpm install

# Verify
pnpm list miyabi-agent-sdk
# → miyabi-agent-sdk 0.1.0-alpha.3
```

---

## 📚 Part 8: Documentation Strategy

### 8.1 Repository Documentation

#### codex repo
- **README.md**: Codex overview, installation, usage
- **codex-miyabi/packages/miyabi-agent-sdk/README.md**: SDK documentation
- **codex-miyabi/packages/miyabi-agent-sdk/API.md**: API reference

#### Miyabi repo (Autonomous-Operations)
- **README.md**: Miyabi overview, quickstart
- **docs/CODEX_MIYABI_INTEGRATION.md** ← THIS FILE
- **docs/AGENT_OPERATIONS_MANUAL.md**: Agent運用マニュアル
- **docs/AGENT_SDK_LABEL_INTEGRATION.md**: Agent SDK × Label System統合

---

### 8.2 Cross-Repository Links

**In Miyabi README.md**:
```markdown
## Agent System

Miyabi uses [miyabi-agent-sdk](https://www.npmjs.com/package/miyabi-agent-sdk) for autonomous agent orchestration.

For SDK development, see [codex repository](https://github.com/ShunsukeHayashi/codex).
```

**In codex README.md**:
```markdown
## Miyabi Integration

The miyabi-agent-sdk is used by [Miyabi](https://github.com/ShunsukeHayashi/Miyabi) for GitHub-native autonomous development.
```

---

## 🎯 Part 9: Roadmap

### Phase 1: Current (Alpha) ✅

- ✅ 7つのAgent実装完了
- ✅ npm package公開 (miyabi-agent-sdk@0.1.0-alpha.2)
- ✅ Miyabi統合完了 (packages/cli/package.json)

### Phase 2: Beta (Month 1-2)

- [ ] API安定化 (Breaking changes禁止)
- [ ] 包括的ドキュメント作成
- [ ] 100% test coverage
- [ ] npm tag: beta

### Phase 3: RC (Month 3)

- [ ] Production deployments (10+ users)
- [ ] Bug fixes only
- [ ] npm tag: rc

### Phase 4: Stable v1.0 (Month 4+)

- [ ] Production-ready
- [ ] SemVer準拠 (1.0.0)
- [ ] npm tag: latest
- [ ] Public announcement

---

## 📞 Part 10: Support & Contributing

### 10.1 Issues

**miyabi-agent-sdk bugs**: Report in [codex repo](https://github.com/ShunsukeHayashi/codex/issues)

**Miyabi integration bugs**: Report in [Miyabi repo](https://github.com/ShunsukeHayashi/Miyabi/issues)

### 10.2 Contributing

**Agent development**: Contribute to [codex repo](https://github.com/ShunsukeHayashi/codex)

**GitHub integration**: Contribute to [Miyabi repo](https://github.com/ShunsukeHayashi/Miyabi)

---

## 🏁 Conclusion

Codex と Miyabi は統合されたエコシステムを形成:

- **Codex**: Agent orchestration engine (Rust + TypeScript)
- **miyabi-agent-sdk**: Agent実装の共通基盤 (npm package)
- **Miyabi**: GitHub as OS platform (TypeScript)

**Development Flow**:
```
Develop in codex → Publish to npm → Use in Miyabi
```

**Runtime Flow**:
```
User runs miyabi → Imports SDK → Executes Agents → Updates GitHub
```

---

**Document Version**: 1.0.0
**Last Updated**: 2025-10-10
**Author**: Shunsuke Hayashi
**Contact**: supernovasyun@gmail.com

---

🌸 **Miyabi × Codex** - Seamless Integration, Autonomous Development
