# Miyabi (雅)

**一つのコマンドで全てが完結する自律型開発フレームワーク**

Zero-learning-cost CLI for autonomous AI development. Designed for both humans and AI agents (Claude Code, Devin, etc.)

---

## 🌸 プログラムが苦手な方へ

**プログラミングの知識がなくても大丈夫！**

Claude Code（AIアシスタント）が全自動でセットアップしてくれます。

### 👉 超簡単セットアップ（3ステップ）

1. **Claude Codeをインストール**
   - VS Code拡張機能、または
   - https://claude.ai/code からダウンロード

2. **Claude Codeを起動して、この魔法の言葉を入力：**
   ```
   /setup-miyabi

   Miyabiをセットアップしてください
   ```

3. **Claude Codeの質問に答えるだけ！**
   - あとは全部AIがやってくれます
   - 所要時間: 約10分

### 📖 詳しいガイド

👉 **[プログラムが苦手な方向けガイド](./FOR_NON_PROGRAMMERS.md)**

- Claude Codeの使い方
- 画面のスクリーンショット付き
- よくある質問と回答
- 成功事例

---

## 🚀 Quick Start

### 🌸 初めての方へ

**プログラミング初心者でも大丈夫！**

超丁寧なセットアップガイドを用意しました：

📖 **[完全セットアップガイド（日本語）](./SETUP_GUIDE.md)**

画像付きで一つ一つ解説しています。所要時間: **約5分**

または、対話型セットアップウィザードを実行：

```bash
npx miyabi
# → 「🌸 初めての方（セットアップガイド）」を選択
```

### For Humans

```bash
# Interactive mode - just run miyabi
npx miyabi

# Direct commands
npx miyabi init my-project    # New project
npx miyabi install            # Add to existing project
npx miyabi status             # Check status
npx miyabi config             # Configure settings
```

### For AI Agents (Claude Code / Autonomous Systems)

```bash
# AI mode with --ai flag (non-interactive)
npx miyabi --ai init my-project --private
npx miyabi --ai install --skip-confirm
npx miyabi --ai status --json
npx miyabi --ai config --token=ghp_xxx --auto-label --auto-review
```

**Important for AI Agents:**
- Always use `--ai` flag for non-interactive mode
- Use `--json` for machine-readable output
- Use `--skip-confirm` to bypass confirmations
- Read AI_INSTRUCTIONS.md first for full context

## 📖 AI Instructions

**If you are an AI agent (Claude Code, Devin, etc.), please read this section carefully:**

### Overview
Miyabi is a CLI tool that sets up complete autonomous development infrastructure with:
- 53 GitHub labels (state machine)
- 10+ GitHub Actions workflows
- GitHub Projects V2 integration
- AI-powered issue labeling
- Webhook-based event routing

### Architecture
```
User creates Issue
  ↓
[Webhook Router] → Detects event type
  ↓
[Label State Machine] → Manages state transitions
  ↓
[Agent Coordinator] → Assigns to appropriate agent
  ↓
[Specialized Agents] → Execute tasks
  ↓
PR created automatically
```

### Key Files to Read Before Using
1. `/templates/labels.yml` - All 53 labels and their meanings
2. `/templates/workflows/` - Available workflows
3. `/src/config/loader.ts` - Configuration system
4. `/src/auth/github-oauth.ts` - Authentication flow

### AI Mode Commands
```bash
# Setup new project (non-interactive)
npx miyabi --ai init project-name \
  --private \
  --no-welcome-issue \
  --skip-projects

# Configure without prompts
npx miyabi --ai config \
  --token=$GITHUB_TOKEN \
  --default-private=true \
  --auto-label=true \
  --auto-review=true \
  --language=ja

# Get status as JSON
npx miyabi --ai status --json --format=compact

# Install to existing project
npx miyabi --ai install \
  --skip-confirm \
  --merge-labels \
  --backup-workflows
```

### Configuration File (.miyabi.yml)
AI agents can read/write this file directly:

```yaml
github:
  token: ghp_xxxxx
  defaultPrivate: true
  defaultOrg: my-org
project:
  defaultLanguage: typescript
  defaultFramework: react
  gitignoreTemplate: Node
  licenseTemplate: mit
workflows:
  autoLabel: true
  autoReview: true
  autoSync: false
cli:
  language: ja
  theme: default
  verboseErrors: false
```

### Error Handling for AI
When errors occur, Miyabi provides structured error messages:

```json
{
  "error": {
    "type": "authentication",
    "message": "GITHUB_TOKEN not found",
    "solutions": [
      "Set GITHUB_TOKEN environment variable",
      "Run: export GITHUB_TOKEN=ghp_your_token",
      "Or use: npx miyabi config --token=ghp_xxx"
    ]
  }
}
```

### Best Practices for AI Agents
1. **Always read configuration first**: Check `.miyabi.yml` or use `miyabi config --show`
2. **Use --ai mode**: Prevents interactive prompts
3. **Parse JSON output**: Use `--json` flag for all status commands
4. **Check token validity**: Before any GitHub operations
5. **Handle rate limits**: GitHub API has rate limits, check remaining quota

### Label State Machine
Understanding labels is crucial for AI agents:

**States:**
- `📥 state:pending` → Initial state
- `🔍 state:analyzing` → Agent analyzing
- `🏗️ state:implementing` → Code being written
- `👀 state:reviewing` → Under review
- `✅ state:done` → Completed
- `🚫 state:blocked` → Blocked
- `⏸️ state:paused` → Paused

**Types:**
- `🐛 type:bug` → Bug fix
- `✨ type:feature` → New feature
- `📚 type:docs` → Documentation
- `♻️ type:refactor` → Refactoring
- `🧪 type:test` → Testing

**Priority:**
- `📊 priority:P0-Critical` → Critical
- `⚠️ priority:P1-High` → High
- `📊 priority:P2-Medium` → Medium
- `📊 priority:P3-Low` → Low

**Agents:**
- `🤖 agent:coordinator` → Task coordination
- `🤖 agent:codegen` → Code generation
- `🤖 agent:review` → Code review
- `🤖 agent:issue` → Issue management
- `🤖 agent:pr` → PR management
- `🤖 agent:deploy` → Deployment

### Workflow Events
AI agents can trigger these workflows:

```yaml
# Issue opened → Auto-label
# PR opened → Auto-review
# Label changed → State transition
# Comment with /assign → Agent assignment
# Push to main → Deploy
```

---

## 💡 Features

### For Humans
- **Interactive Mode**: Simple prompts, no configuration needed
- **One Command**: `npx miyabi` does everything
- **Japanese Support**: Full Japanese UI and messages
- **Configuration Wizard**: Easy setup with guided prompts

### For AI Agents
- **Non-Interactive Mode**: `--ai` flag for automation
- **JSON Output**: Machine-readable responses
- **Programmatic API**: Import as module
- **Environment Variables**: Full env var support

### Shared Features
- **Zero Learning Cost**: No concepts to learn
- **GitHub Integration**: Full GitHub API support
- **State Machine**: Label-based workflow
- **Webhook Router**: Event-driven automation

## 📊 Commands

### `init <project-name>`
Create new project with full automation setup.

**Human mode:**
```bash
npx miyabi init my-project
# → Interactive prompts for all options
```

**AI mode:**
```bash
npx miyabi --ai init my-project --private --no-welcome
```

**What it does:**
- ✅ Creates GitHub repository
- ✅ Sets up 53 labels
- ✅ Deploys workflows
- ✅ Creates GitHub Projects V2
- ✅ Initializes local npm project
- ✅ Creates welcome Issue (optional)

### `install`
Add Miyabi to existing project.

**Human mode:**
```bash
cd existing-project
npx miyabi install
# → Interactive confirmation
```

**AI mode:**
```bash
npx miyabi --ai install --skip-confirm --merge-labels
```

**What it does:**
- ✅ Analyzes project structure
- ✅ Merges labels (non-destructive)
- ✅ Auto-labels existing Issues
- ✅ Deploys workflows (skips conflicts)
- ✅ Links to Projects V2

### `status`
Check agent status and activity.

**Human mode:**
```bash
npx miyabi status
# → Interactive table view

npx miyabi status --watch
# → Auto-refresh every 10s
```

**AI mode:**
```bash
npx miyabi --ai status --json
# → JSON output for parsing
```

**Output (human):**
```
┌──────────────┬────────┬─────────────┐
│ Agent        │ Status │ Current Task│
├──────────────┼────────┼─────────────┤
│ Coordinator  │ Active │ #123        │
│ CodeGen      │ Idle   │ -           │
│ Review       │ Active │ #124        │
└──────────────┴────────┴─────────────┘
```

**Output (AI):**
```json
{
  "agents": [
    {"name": "coordinator", "status": "active", "task": "#123"},
    {"name": "codegen", "status": "idle", "task": null},
    {"name": "review", "status": "active", "task": "#124"}
  ]
}
```

### `config`
Configure Miyabi settings.

**Human mode:**
```bash
npx miyabi config
# → Interactive wizard

npx miyabi config --show
# → Display current config

npx miyabi config --reset
# → Reset to defaults
```

**AI mode:**
```bash
npx miyabi --ai config \
  --token=ghp_xxx \
  --default-private=true \
  --auto-label=true \
  --language=ja
```

## 🔧 Configuration

### Environment Variables
```bash
# GitHub token (highest priority)
export GITHUB_TOKEN=ghp_your_token_here

# Webhook secret (for webhook router)
export WEBHOOK_SECRET=your_secret

# Anthropic API key (for AI labeling)
export ANTHROPIC_API_KEY=sk-ant-xxx
```

### Config File (.miyabi.yml)
Created automatically by `miyabi config`:

```yaml
github:
  token: ghp_xxxxx              # GitHub Personal Access Token
  defaultPrivate: true          # Create private repos by default
  defaultOrg: my-org            # Default organization

project:
  defaultLanguage: typescript   # Default language
  defaultFramework: react       # Default framework
  gitignoreTemplate: Node       # .gitignore template
  licenseTemplate: mit          # License template

workflows:
  autoLabel: true               # Auto-label new issues
  autoReview: true              # Auto-review PRs
  autoSync: false               # Auto-sync to Projects

cli:
  language: ja                  # UI language (ja/en)
  theme: default                # Theme (default/minimal)
  verboseErrors: false          # Show verbose errors
```

### Priority Order
1. Command-line flags (`--token=xxx`)
2. Environment variables (`GITHUB_TOKEN`)
3. Config file (`.miyabi.yml`)
4. Default values

## 🤖 AI Agent Integration

### Using as a Module (Programmatic API)

```typescript
import { init, install, status, config } from 'miyabi';

// Initialize new project
await init('my-project', {
  private: true,
  skipWelcome: true,
  token: process.env.GITHUB_TOKEN,
});

// Install to existing project
await install({
  skipConfirm: true,
  mergeLabels: true,
  token: process.env.GITHUB_TOKEN,
});

// Get status
const statusData = await status({ json: true });
console.log(statusData);

// Configure
await config({
  token: 'ghp_xxx',
  autoLabel: true,
  autoReview: true,
  language: 'ja',
});
```

### Claude Code Specific Instructions

If you are Claude Code:

1. **Before first use**, read:
   - This README.md (full context)
   - `/templates/labels.yml` (label definitions)
   - `/src/config/loader.ts` (config system)

2. **When user says "setup miyabi"**:
   ```bash
   npx miyabi --ai init project-name --private --token=$GITHUB_TOKEN
   ```

3. **When user says "check status"**:
   ```bash
   npx miyabi --ai status --json
   ```

4. **When creating issues programmatically**:
   - Use appropriate labels from `/templates/labels.yml`
   - Set initial state to `📥 state:pending`
   - Add phase label `🎯 phase:planning`
   - Add priority (default `📊 priority:P2-Medium`)

5. **Error handling**:
   - If `GITHUB_TOKEN not found`, guide user to set it
   - If rate limit hit, wait and retry
   - If webhook fails, check `WEBHOOK_SECRET`

## 📋 Requirements

- **Node.js** >= 18.0.0
- **git** CLI
- **gh** CLI (GitHub CLI)
- **GitHub** account

## 🐛 Troubleshooting

### GITHUB_TOKEN not found

**Human:**
```bash
# Option 1: Use config command
npx miyabi config

# Option 2: Set environment variable
export GITHUB_TOKEN=ghp_your_token
```

**AI:**
```bash
npx miyabi --ai config --token=ghp_xxx
```

### OAuth App not configured

**Solution:** Use Personal Access Token instead
1. Go to: https://github.com/settings/tokens/new
2. Select scopes: `repo`, `workflow`, `write:packages`, `delete:packages`, `admin:org`, `project`
3. Generate token
4. Set in config: `npx miyabi config` (or `--ai config --token=xxx`)

### Templates directory missing

**Solution:** Reinstall miyabi
```bash
npm uninstall -g miyabi
npx miyabi@latest
```

### Rate limit exceeded

**Solution:** Wait or use authenticated requests
```bash
# Check rate limit
gh api rate_limit

# Use authenticated token
export GITHUB_TOKEN=ghp_xxx
```

## 📝 Development

### Local Development

# Clone repository
git clone https://github.com/ShunsukeHayashi/Autonomous-Operations.git
cd Autonomous-Operations/packages/cli

# Install dependencies
npm install

# Build
npm run build

# Test locally
npm link
miyabi --help
```

### Testing

```bash
# Run tests
npm test

# Run in dev mode
npm run dev

# Clean build artifacts
npm run clean
```

## 📚 Documentation

- [Getting Started Guide](../../docs/GETTING_STARTED.md)
- [Agent Operations Manual](../../docs/AGENT_OPERATIONS_MANUAL.md)
- [Webhook Event Bus](../../docs/WEBHOOK_EVENT_BUS.md)
- [Testing Guide](../../docs/TESTING_GUIDE.md)

## 🔗 Links

- **GitHub**: https://github.com/ShunsukeHayashi/Autonomous-Operations
- **npm**: https://www.npmjs.com/package/miyabi
- **Issues**: https://github.com/ShunsukeHayashi/Autonomous-Operations/issues
- **Discussions**: https://github.com/ShunsukeHayashi/Autonomous-Operations/discussions

## 📄 License

MIT © Shunsuke Hayashi

## 🙏 Acknowledgments

Built with:
- [Commander.js](https://github.com/tj/commander.js) - CLI framework
- [Inquirer.js](https://github.com/SBoudrias/Inquirer.js) - Interactive prompts
- [Chalk](https://github.com/chalk/chalk) - Terminal styling
- [Octokit](https://github.com/octokit/octokit.js) - GitHub API client
- [@anthropic-ai/sdk](https://github.com/anthropics/anthropic-sdk-typescript) - Anthropic API

---

**Note:** This README is AI-friendly. If you're an AI agent, all necessary context is provided above. Start by reading the "AI Instructions" section.
