# Agentic OS

**Autonomous AI development framework. Zero configuration. Zero learning curve.**

## Quick Start

```bash
npx agentic-os init my-project
```

That's it. You now have a fully automated AI development environment.

## What You Get

- **6 AI agents** that automatically handle your Issues
- **Automatic Issue → PR pipeline** (no manual coding needed)
- **AI-powered labeling** (no manual categorization)
- **Real-time monitoring** via GitHub Projects

## How to Use

### 1. Create an Issue

```bash
gh issue create --title "Add user authentication" --body "Email/password login"
```

### 2. Wait

The agents automatically:
- Analyze and label the Issue
- Break down into tasks
- Implement the feature
- Review code quality
- Create Pull Request

### 3. Review and Merge

A PR appears within 10-15 minutes. Review, approve, merge. Done.

## Commands

```bash
# Create new project
npx agentic-os init my-project

# Add to existing project
npx agentic-os install

# Monitor agents
npx agentic-os status --watch
```

## Advanced Features

```bash
# Auto-create Issue from commit
git commit -m "feat: New feature #auto"

# Auto-create Issue from PR comment
# Comment: @agentic-os test this component
```

## Documentation

- [Getting Started](docs/GETTING_STARTED.md) - 5-minute guide
- [Architecture](docs/system-architecture.puml) - System design
- [CLI Reference](packages/cli/README.md) - Command details

## Requirements

- Node.js >= 18
- GitHub account
- git CLI
- gh CLI

## License

MIT

---

**That's all you need to know.** Create Issues, get PRs.

🤖 Powered by Claude AI
