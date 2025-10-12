# ❓ Miyabi Community - Frequently Asked Questions

---

## 📚 General Questions

### What is Miyabi?

**Miyabi** is an autonomous AI development framework built on Claude Code and GitHub. It enables developers to create self-organizing systems powered by AI agents that can automatically handle tasks like code generation, testing, deployment, and more.

### Is Miyabi free to use?

Yes! Miyabi is **100% open source** under the MIT License. You can use it for personal or commercial projects at no cost.

### What languages are supported?

The Miyabi community supports both **English** and **日本語 (Japanese)**. Feel free to communicate in whichever language you're comfortable with!

### Who maintains Miyabi?

Miyabi is maintained by [@ShunsukeHayashi](https://github.com/ShunsukeHayashi) and the open-source community. Anyone can contribute via GitHub!

---

## 🔧 Technical Questions

### What are the system requirements?

To use Miyabi, you need:
- **Node.js 18+** (LTS recommended)
- **Git** (version control)
- **GitHub CLI (`gh`)** - for GitHub integration
- **GitHub account** - to host repositories
- **Claude Code** (optional, but recommended for advanced features)

### How do I install Miyabi?

```bash
# Quick start - Create new project
npx miyabi init my-project

# Or install in existing project
cd existing-project
npx miyabi install
```

For detailed instructions, see: [Getting Started Guide](https://github.com/ShunsukeHayashi/Miyabi)

### Can I use Miyabi without Claude Code?

**Partially.** Some features work standalone via the Agent SDK, but full autonomous operation requires Claude Code integration.

**Without Claude Code:**
- ✅ CLI commands work
- ✅ Manual agent execution
- ✅ Label management
- ❌ Full autonomous mode

**With Claude Code:**
- ✅ Full autonomous execution
- ✅ Worktree-based parallel processing
- ✅ AI-powered code generation

### What's the difference between `miyabi` (CLI) and `miyabi-agent-sdk`?

- **`miyabi` (CLI)**: Command-line tool for project setup and management
- **`miyabi-agent-sdk`**: Library for building custom agents programmatically

**Usage:**
```bash
# CLI - For end users
npx miyabi init my-project

# SDK - For agent developers
npm install miyabi-agent-sdk
```

### How do I report a bug?

1. **Search existing issues** on [GitHub Issues](https://github.com/ShunsukeHayashi/Miyabi/issues)
2. If not found, create a new issue with:
   - Clear description of the problem
   - Steps to reproduce
   - Expected vs actual behavior
   - System info (OS, Node version, etc.)
3. Or report in **#bug-reports** on Discord

### Where can I find documentation?

- **GitHub Docs**: https://github.com/ShunsukeHayashi/Miyabi/tree/main/docs
- **NPM Package**: https://www.npmjs.com/package/miyabi
- **Discord #tutorials**: Step-by-step guides from the community

---

## 🤖 Agent Questions

### What are agents in Miyabi?

**Agents** are autonomous AI workers that handle specific tasks:

- **CoordinatorAgent**: Task decomposition and orchestration
- **CodeGenAgent**: AI-driven code generation (uses Claude)
- **ReviewAgent**: Code quality checking (static analysis, security)
- **IssueAgent**: GitHub Issue analysis and labeling
- **PRAgent**: Pull Request creation
- **DeploymentAgent**: CI/CD automation
- **TestAgent**: Automated testing

### Can I create my own agents?

Yes! Use the `miyabi-agent-sdk`:

```typescript
import { BaseAgent } from 'miyabi-agent-sdk';

class MyCustomAgent extends BaseAgent {
  async execute(task) {
    // Your custom logic here
  }
}
```

Check out the [Agent Development Guide](https://github.com/ShunsukeHayashi/Miyabi/tree/main/docs) for details.

### How do agents decide what to do?

Agents follow the **53-label system** based on organizational design principles:
- **STATE labels**: Track lifecycle (`pending` → `analyzing` → `implementing` → `done`)
- **AGENT labels**: Assign responsibility (`agent:codegen`, `agent:review`, etc.)
- **PRIORITY labels**: Determine execution order (`P0-Critical` → `P3-Low`)

For full details: [Label System Guide](https://github.com/ShunsukeHayashi/Miyabi/blob/main/docs/LABEL_SYSTEM_GUIDE.md)

---

## 🚀 Getting Started

### I'm a complete beginner. Where do I start?

Welcome! Follow these steps:

1. **Read the #welcome channel** - Get oriented
2. **Introduce yourself in #introductions** - Say hello!
3. **Check out #tutorials** - Start with "Getting Started with Miyabi in 5 Minutes"
4. **Ask questions in #beginners** - No question is too basic
5. **Join a study session** - Saturday collaborative learning

### I'm an experienced developer. How can I contribute?

Great! Here's how:

1. **Check GitHub Issues** - Look for `good-first-issue` or `help-wanted` labels
2. **Review PRs** - Help review pull requests in **#code-review**
3. **Write tutorials** - Share your knowledge in **#tutorials**
4. **Build agents** - Create custom agents and showcase in **#agent-showcase**
5. **Join hackathons** - Monthly community hackathons

### What's the best way to learn Miyabi?

**Hands-on approach:**
1. Install Miyabi: `npx miyabi init my-test-project`
2. Create a GitHub Issue in your new repo
3. Watch the agents automatically handle it
4. Experiment with different label combinations
5. Join #ask-experts to discuss what you learned

---

## 🎪 Community Events

### Are there any community events?

Yes! Regular events include:

**Weekly:**
- **Monday**: Weekly Update (5-10 min announcements)
- **Wednesday**: Office Hours (1 hour live Q&A)
- **Saturday**: Study Session (2 hours collaborative coding)

**Monthly:**
- **First Saturday**: Community Hackathon (24 hours)
- **Second Wednesday**: Tech Talk (guest speakers)
- **Third Saturday**: Contribution Sprint (fix bugs together)

Check **#events** for schedules!

### How do I participate in hackathons?

1. Watch for announcements in **#events** and **#hackathons**
2. Form teams or go solo
3. Build something cool with Miyabi
4. Submit by deadline
5. Demo your project in **#showcase**

Prizes and recognition for top projects!

---

## 🛠️ Troubleshooting

### `npx miyabi init` fails with authentication error

**Solution:**
1. Install GitHub CLI: `brew install gh` (Mac) or [download](https://cli.github.com/)
2. Authenticate: `gh auth login`
3. Ensure your token has `repo` and `workflow` scopes
4. Try again: `npx miyabi init my-project`

### Labels aren't being created

**Possible causes:**
- GitHub token lacks `repo` scope
- Repository doesn't exist
- Network issues

**Solution:**
```bash
# Check token permissions
gh auth status

# Manually create labels
gh label create "📥 state:pending" --color E4E4E4
```

Or ask in **#installation-issues** for help!

### Agent isn't executing my Issue

**Check:**
1. Does the Issue have a `state:pending` label?
2. Is the repository configured with `.miyabi.yml`?
3. Are GitHub Actions enabled?
4. Check Actions tab for error logs

Still stuck? Ask in **#help** with:
- Issue number
- Repository name
- Error messages (if any)

---

## 💬 Discord Questions

### How do I get roles?

**Automatic roles** (via MEE6):
- `@Member` - Everyone (default)
- `@Active` - Weekly participation
- `@Regular` - Monthly active contributor
- `@Veteran` - 3+ months membership

**Contribution roles**:
- `@Contributor` - Submit a PR on GitHub
- Ping a moderator with your PR link

**Interest roles** (self-assign):
React to messages in **#roles** to get:
- `@TypeScript`, `@Python`, `@Go`
- `@AI/ML`, `@DevOps`, `@Frontend`, `@Backend`

### Can I DM moderators?

Yes, for:
- Reporting rule violations
- Private concerns
- Urgent issues

**Don't DM for:**
- General questions (use channels)
- Technical support (use #help)

---

## 🔗 Additional Resources

- **GitHub Repository**: https://github.com/ShunsukeHayashi/Miyabi
- **NPM Package**: https://www.npmjs.com/package/miyabi
- **Agent SDK**: https://www.npmjs.com/package/miyabi-agent-sdk
- **Landing Page**: https://shunsukehayashi.github.io/Miyabi/landing.html
- **Dashboard**: https://shunsukehayashi.github.io/Miyabi/

---

## Still have questions?

- **General questions**: Ask in **#help**
- **Technical questions**: Try **#ask-experts**
- **Installation issues**: Go to **#installation-issues**
- **Community questions**: Ask in **#general**

---

**This FAQ is updated regularly. Last update: 2025-10-12**

🌸 **Welcome to Miyabi Community!** 🌸
