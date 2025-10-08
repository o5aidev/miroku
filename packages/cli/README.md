# ✨ Miyabi

**一つのコマンドで全てが完結する自律型開発フレームワーク**

Zero-learning-cost CLI for autonomous development - AI agents handle your GitHub Issues automatically.

## Installation

```bash
npx miyabi
```

That's it! No configuration needed.

## Commands

### Interactive Mode (Recommended)

```bash
npx miyabi
```

Simply run `miyabi` and follow the interactive prompts!

### Direct Commands

#### `init <project-name>`

Create a new project with full automation (5 min setup).

```bash
npx miyabi init my-awesome-project
# or
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

#### `install`

Install automation into an existing project (non-destructive).

```bash
cd existing-project
npx miyabi install
```

**What it does:**
- ✅ Analyzes project structure
- ✅ Merges labels with existing
- ✅ Auto-labels existing Issues
- ✅ Deploys workflows (skips conflicts)
- ✅ Links to Projects V2

#### `status`

Check agent status and recent activity.

```bash
npx miyabi status

# Watch mode (auto-refresh every 10s)
npx miyabi status --watch
```

#### `sprint start <sprint-name>`

Start a new sprint with interactive planning and task management.

```bash
npx miyabi sprint start "Sprint-2025-Q1"

# With custom duration (default: 14 days)
npx miyabi sprint start "Sprint-Jan" -d 7

# Initialize project structure (directories and starter files)
npx miyabi sprint start "Sprint-Jan" --init

# Dry run (preview without creating)
npx miyabi sprint start "Sprint-Jan" --dry-run
```

**What it does:**
- ✅ Creates GitHub milestone with due date
- ✅ Interactive task planning (title, description, priority, type)
- ✅ Batch creates Issues with proper labels
- ✅ Links all issues to the sprint milestone
- ✅ Optional: Initialize project structure (src/, tests/, docs/, etc.)

**After sprint start:**
```bash
# AI agents automatically start working on sprint tasks
npx miyabi status
# → View real-time progress
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

## Configuration

### GitHub OAuth Setup (Required for Maintainers)

If you're forking this project or setting up your own instance, you need to create a GitHub OAuth App:

1. **Create OAuth App**
   - Go to https://github.com/settings/developers
   - Click "OAuth Apps" → "New OAuth App"

2. **Configure OAuth App**
   ```
   Application name: Your CLI Name
   Homepage URL: https://github.com/YOUR_USERNAME/YOUR_REPO
   Authorization callback URL: http://localhost
   ```

3. **Enable Device Flow**
   - ✅ Check "Enable Device Flow" in your OAuth App settings
   - This is required for CLI authentication

4. **Set Environment Variable**
   ```bash
   # For development
   export AGENTIC_OS_CLIENT_ID=your_client_id_here

   # Or add to .env file
   echo "AGENTIC_OS_CLIENT_ID=your_client_id_here" >> .env
   ```

**Note:** The official `miyabi` package has OAuth pre-configured. You only need this if you're building your own CLI.

## Development Status

**Current Version:** 0.1.0 (Beta)

**Implemented:**
- [x] CLI structure
- [x] Command framework
- [x] GitHub OAuth (Device Flow)
- [x] Repository setup
- [x] Labels deployment (53 labels)
- [x] Local project setup
- [ ] Workflows deployment
- [ ] Projects V2 integration (requires read:org scope)
- [ ] Auto-labeling AI

**Tested & Working:**
- ✅ OAuth authentication flow
- ✅ Repository creation
- ✅ Label state machine setup
- ✅ Welcome Issue creation

## License

MIT
