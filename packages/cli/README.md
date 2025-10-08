# @agentic-os/cli

Zero-learning-cost CLI for Agentic OS - Autonomous development framework.

## Installation

```bash
npx agentic-os init my-project
```

That's it! No configuration needed.

## Commands

### `init <project-name>`

Create a new project with full Agentic OS automation (5 min setup).

```bash
npx agentic-os init my-awesome-project
```

**What it does:**
- ✅ Creates GitHub repository
- ✅ Sets up 53 labels (state machine)
- ✅ Deploys 12+ GitHub Actions workflows
- ✅ Creates GitHub Projects V2
- ✅ Initializes local npm project
- ✅ Creates welcome Issue

**After setup:**
```bash
cd my-awesome-project
gh issue create --title "Add feature X" --body "Description"
# → AI agents automatically create PR within minutes
```

### `install`

Install Agentic OS into an existing project (non-destructive).

```bash
cd existing-project
npx agentic-os install
```

**What it does:**
- ✅ Analyzes project structure
- ✅ Merges labels with existing
- ✅ Auto-labels existing Issues
- ✅ Deploys workflows (skips conflicts)
- ✅ Links to Projects V2

### `status`

Check agent status and recent activity.

```bash
npx agentic-os status

# Watch mode (auto-refresh every 10s)
npx agentic-os status --watch
```

## Features

### Zero Learning Cost
- No configuration files
- No concept to learn
- Just create Issues

### Invisible Agents
- You never see agents
- You only see PRs appearing
- "気づいたら終わっている"

### Full Automation
- Issue → Analysis → Implementation → Review → PR
- State transitions via labels
- Real-time progress tracking

## How It Works

```
1. Create Issue
   ↓
2. IssueAgent analyzes and labels
   ↓
3. CoordinatorAgent breaks down tasks
   ↓
4. CodeGenAgent implements
   ↓
5. ReviewAgent checks quality
   ↓
6. PRAgent creates Pull Request
   ↓
7. Done! ✅
```

## Requirements

- Node.js >= 18
- GitHub account
- git CLI
- gh CLI (GitHub CLI)

## Development Status

**Current Version:** 0.1.0 (Beta)

**Implemented:**
- [x] CLI structure
- [x] Command framework
- [x] GitHub OAuth (Device Flow)
- [ ] Repository setup
- [ ] Labels deployment
- [ ] Workflows deployment
- [ ] Projects V2 integration
- [ ] Local project setup
- [ ] Auto-labeling AI
- [ ] npm package publication

## License

MIT
