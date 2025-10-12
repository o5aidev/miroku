# Miyabi Community FAQ ❓

**Frequently Asked Questions** about Miyabi and our Discord community.

**Last Updated**: 2025-10-12

---

## 🚀 Getting Started

### Q: What is Miyabi?

**A**: Miyabi is an AI-driven autonomous development framework that automates the entire software development lifecycle. It uses 7 specialized AI agents to handle everything from issue analysis to code generation, testing, review, and deployment.

**Key Features**:
- 🤖 7 AI Autonomous Agents
- 🔄 Complete workflow automation (Issue → PR → Deployment)
- 🏗️ GitHub as OS architecture (15-component integration)
- ⚡ 72% efficiency improvement through parallel execution

### Q: How do I install Miyabi?

**A**: Installation is simple:

```bash
# Run directly (recommended)
npx miyabi

# Or install globally
npm install -g miyabi
miyabi
```

For detailed setup instructions, see our [Setup Guide](https://github.com/ShunsukeHayashi/Miyabi/blob/main/docs/SETUP_GUIDE.md).

### Q: What are the system requirements?

**A**: Minimum requirements:

- **Node.js** >= 18.0.0 (recommended: v20 LTS)
- **Git** CLI installed
- **GitHub Account** with Personal Access Token
- **Platform**: macOS, Linux, or Windows (WSL2 recommended)

Optional:
- **gh CLI** - GitHub CLI (recommended for authentication)

### Q: Is Miyabi free?

**A**: Yes! Miyabi is open-source under the Apache 2.0 License. The core framework is completely free to use.

**Note**: You'll need your own API keys for:
- **GitHub API** (free for public repos, rate limits apply)
- **Anthropic Claude API** (for AI agents - paid API)

### Q: Can I use Miyabi for private/commercial projects?

**A**: Yes! The Apache 2.0 License allows commercial use. However:

- ✅ You can use Miyabi commercially
- ✅ You can modify the source code
- ✅ You can distribute modified versions
- ⚠️ You must give credit and indicate changes
- ⚠️ "Miyabi" is a trademark claimed by Shunsuke Hayashi
- ⚠️ No liability or warranty provided

See [LICENSE](https://github.com/ShunsukeHayashi/Miyabi/blob/main/LICENSE) for full details.

---

## 🤖 AI Agents

### Q: What are the 7 AI agents?

**A**: Miyabi uses specialized agents for different tasks:

1. **CoordinatorAgent** - Task decomposition and parallel execution
2. **IssueAgent** - Issue analysis and 53-label classification
3. **CodeGenAgent** - AI-driven code generation (Claude Sonnet 4)
4. **ReviewAgent** - Code quality assessment (80+ score required)
5. **PRAgent** - Pull Request creation (Conventional Commits)
6. **DeploymentAgent** - CI/CD deployment automation
7. **TestAgent** - Automated testing (80%+ coverage target)

### Q: Which AI model does Miyabi use?

**A**: Miyabi uses **Claude Sonnet 4** by Anthropic for code generation and analysis. This requires an Anthropic API key.

**Why Claude?**:
- Excellent code generation quality
- Strong reasoning capabilities
- Long context window (200K tokens)
- Follows instructions precisely

### Q: Can I use a different AI model (GPT-4, Gemini, etc.)?

**A**: Currently, Miyabi is designed specifically for Claude Sonnet 4. Support for other models is on the roadmap but not yet implemented.

**Want to contribute?** Check our [Agent SDK](https://www.npmjs.com/package/miyabi-agent-sdk) and help add multi-model support!

### Q: How much does it cost to run the AI agents?

**A**: Costs depend on your usage:

- **GitHub API**: Free for public repos (60 requests/hour without auth, 5,000/hour with token)
- **Anthropic Claude API**: ~$0.003 per 1K input tokens, ~$0.015 per 1K output tokens

**Estimated cost per task**:
- Simple task: $0.05 - $0.15
- Medium task: $0.15 - $0.50
- Complex task: $0.50 - $2.00

**Tip**: Use the `--dry-run` flag to preview actions without making API calls.

---

## 💻 Usage & Features

### Q: How do I create a new project with Miyabi?

**A**: Use the interactive CLI:

```bash
npx miyabi

# Then select:
# - 🆕 Create new project
# - Enter project name
# - Choose settings (public/private, etc.)
```

Miyabi will automatically:
- Create GitHub repository
- Set up 53 labels
- Deploy 26 GitHub Actions workflows
- Create Projects V2 board
- Clone locally
- Create Welcome Issue

### Q: Can I add Miyabi to an existing project?

**A**: Yes! Run:

```bash
cd your-existing-project
npx miyabi

# Then select:
# - 📦 Add to existing project
# - Choose installation options
```

**Recommended**: Use `--dry-run` first to preview changes:

```bash
npx miyabi install --dry-run
```

### Q: What is the 53-label system?

**A**: Miyabi uses a structured 53-label system based on organizational design principles:

- **STATE** (8 labels): Lifecycle management (`📥 state:pending`, `✅ state:done`)
- **AGENT** (6 labels): Agent assignment (`🤖 agent:codegen`, `🤖 agent:review`)
- **PRIORITY** (4 labels): Priority levels (`🔥 priority:P0-Critical` to `📝 priority:P3-Low`)
- **TYPE** (7 labels): Issue types (`✨ type:feature`, `🐛 type:bug`)
- **SEVERITY** (4 labels): Escalation levels (`🚨 severity:Sev.1-Critical`)
- **PHASE** (5 labels): Project phases (`🎯 phase:planning`, `🚀 phase:deployment`)
- **SPECIAL** (7 labels): Special operations (`🔐 security`, `💰 cost-watch`)
- **TRIGGER** (4 labels): Automation triggers (`🤖 trigger:agent-execute`)
- **QUALITY** (4 labels): Quality scores (`⭐ quality:excellent` 90-100 points)
- **COMMUNITY** (4 labels): Community engagement (`👋 good-first-issue`)

See [Label System Guide](https://github.com/ShunsukeHayashi/Miyabi/blob/main/docs/LABEL_SYSTEM_GUIDE.md) for details.

### Q: How do I run agents manually?

**A**: Use the CLI:

```bash
# Run specific agent
npx miyabi agent run <agent-name> --issue=123

# Examples:
npx miyabi agent run codegen --issue=123
npx miyabi agent run review --issue=123
npx miyabi agent run issue --issue=123
```

### Q: Can agents run in parallel?

**A**: Yes! Miyabi uses DAG (Directed Acyclic Graph) analysis to identify tasks that can run in parallel, achieving up to 72% efficiency improvement.

**Control parallelism**:

```bash
export MIYABI_PARALLEL_AGENTS=3  # Max 3 agents at once
```

### Q: What is "GitHub as OS"?

**A**: Miyabi treats GitHub as an operating system, using its components as infrastructure:

- **Issues**: Task management
- **Actions**: Execution environment
- **Projects V2**: Data persistence
- **Webhooks**: Event bus
- **Pages**: Dashboard
- **Packages**: Distribution
- **Discussions**: Message queue
- And 8 more components...

This eliminates the need for separate databases, task queues, or deployment platforms.

---

## 🔧 Troubleshooting

### Q: I'm getting "GITHUB_TOKEN not found" error

**A**: Set your GitHub token using one of these methods:

**Method 1: gh CLI (Recommended)**
```bash
gh auth login
# Miyabi will automatically use 'gh auth token'
```

**Method 2: Environment Variable**
```bash
export GITHUB_TOKEN=ghp_your_token_here
```

**Method 3: .env File**
```bash
echo "GITHUB_TOKEN=ghp_your_token_here" > .env
```

### Q: Agent execution is failing with "Anthropic API error"

**A**: Ensure your Anthropic API key is set:

```bash
export ANTHROPIC_API_KEY=sk-ant-your-key-here
```

**Common issues**:
- ❌ Invalid API key format
- ❌ Insufficient API credits
- ❌ Rate limit exceeded
- ❌ API key not set in environment

### Q: Tests are failing after code generation

**A**: The ReviewAgent requires 80%+ test coverage and 80+ quality score. If tests fail:

1. **Check error messages** in PR comments
2. **Review generated tests** - may need manual adjustment
3. **Run locally**: `npm test`
4. **Adjust configuration** if needed

**Note**: AI-generated code may require human review and adjustment.

### Q: PR creation is failing

**A**: Common causes:

- ❌ Branch already exists: `git branch -D feature/issue-123`
- ❌ No changes to commit: Ensure code was generated
- ❌ GitHub API rate limit: Wait or use authenticated requests
- ❌ Insufficient permissions: Check token scopes

### Q: How do I handle merge conflicts?

**A**: Miyabi tries to auto-merge, but conflicts may occur:

1. **Resolve manually**: 
   ```bash
   git checkout feature/issue-123
   git merge main
   # Resolve conflicts
   git commit
   ```

2. **Or create new PR** from updated branch

3. **Or use worktrees** for isolation (advanced)

### Q: Installation fails on Windows

**A**: Windows users should use **WSL2** (Windows Subsystem for Linux):

```bash
# In PowerShell (Admin):
wsl --install

# Then install Node.js in WSL:
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Run Miyabi in WSL:
npx miyabi
```

**Note**: Native Windows support is limited. WSL2 is strongly recommended.

---

## 🔐 Security & Privacy

### Q: Is my code/data secure?

**A**: Miyabi follows security best practices:

- ✅ **Open-source**: Code is auditable
- ✅ **Local execution**: Code generation happens in your environment
- ✅ **No data collection**: Miyabi doesn't send data to external servers (except AI APIs)
- ✅ **Token security**: Uses gh CLI or environment variables
- ✅ **HTTPS only**: All GitHub API calls use HTTPS

**Important**: Your code is sent to Anthropic's Claude API for generation. Review their [Privacy Policy](https://www.anthropic.com/privacy).

### Q: What permissions does Miyabi need?

**A**: Required GitHub token permissions:

- ✅ `repo` - Full control of private repositories
- ✅ `workflow` - Update GitHub Action workflows
- ✅ `read:project`, `write:project` - Access projects

**Why these permissions?**:
- Create/update issues, PRs, labels
- Deploy GitHub Actions workflows
- Manage Projects V2 boards

### Q: Can I use Miyabi in air-gapped/offline environments?

**A**: No. Miyabi requires internet access for:

- GitHub API calls
- Anthropic Claude API calls
- npm package downloads

**Partial workaround**: Use a proxy or cache for npm, but AI agent execution still needs API access.

### Q: How do I report security vulnerabilities?

**A**: Please report security issues privately:

1. **Do NOT** create public GitHub issues
2. **Email** via GitHub profile (click author name)
3. **Include**: Description, impact, reproduction steps
4. **Wait** for response before public disclosure

See [SECURITY.md](https://github.com/ShunsukeHayashi/Miyabi/blob/main/SECURITY.md) for full policy.

---

## 💬 Community

### Q: How do I get help?

**A**: Multiple support channels:

1. **Discord**: 
   - `#support-english` for English
   - `#support-japanese` for Japanese (日本語)
2. **GitHub Discussions**: [Ask questions](https://github.com/ShunsukeHayashi/Miyabi/discussions)
3. **GitHub Issues**: [Report bugs](https://github.com/ShunsukeHayashi/Miyabi/issues)
4. **Documentation**: [Read the docs](https://github.com/ShunsukeHayashi/Miyabi#readme)

### Q: Can I contribute to Miyabi?

**A**: Yes! Contributions are welcome:

**Ways to contribute**:
- 💻 Code: Submit PRs
- 📚 Documentation: Improve docs
- 🐛 Bug Reports: Report issues
- 💡 Feature Requests: Suggest improvements
- 🌍 Translations: Translate docs
- 🤝 Community: Help others in Discord

See [CONTRIBUTING.md](https://github.com/ShunsukeHayashi/Miyabi/blob/main/CONTRIBUTING.md).

### Q: How do I earn community roles?

**A**: Roles are earned through:

- 🤝 Consistently helping others
- 💻 Contributing code or documentation
- 📚 Creating tutorials and guides
- 🐛 Reporting bugs with clear reproduction
- 🎨 Participating in hackathons

**Roles available**:
- 🌟 Active Contributor
- 🎖️ Core Contributor
- 💎 Beta Tester
- 🏆 Champion (monthly top contributor)
- 🎓 Mentor

### Q: Are there community events?

**A**: Yes! Regular events include:

- **Weekly Office Hours** - Live Q&A (Fridays)
- **Monthly Hackathons** - Build projects, win prizes
- **Code Review Sessions** - Learn from experts
- **Agent Showcase** - Demo custom agents

Check `#events` channel for schedule!

### Q: Can I hire someone to help with Miyabi?

**A**: Community members may offer consulting services. However:

- ⚠️ The Miyabi project does not provide paid support
- ⚠️ Any consulting is between you and the individual
- ⚠️ Verify credentials before hiring
- ⚠️ Use `#job-board` channel (if available)

---

## 🚀 Advanced Topics

### Q: Can I create custom agents?

**A**: Yes! Use the [Miyabi Agent SDK](https://www.npmjs.com/package/miyabi-agent-sdk):

```bash
npm install miyabi-agent-sdk

# Then create custom agent:
import { BaseAgent } from 'miyabi-agent-sdk';

class MyCustomAgent extends BaseAgent {
  async execute() {
    // Your logic here
  }
}
```

See [Agent Development Guide](https://github.com/ShunsukeHayashi/Miyabi/tree/main/packages/miyabi-agent-sdk).

### Q: How does the DAG (Directed Acyclic Graph) work?

**A**: CoordinatorAgent builds a DAG to:

1. **Analyze dependencies** between tasks
2. **Identify parallel tasks** (no dependencies)
3. **Optimize Critical Path** (longest dependency chain)
4. **Schedule execution** for maximum efficiency

**Example**:
```
Task A (independent) ──┐
Task B (depends on A)  ├─→ Execute
Task C (independent) ──┘
```
→ Tasks A and C run in parallel, then B runs.

### Q: What is Git Worktree integration?

**A**: Miyabi uses Git Worktrees for parallel agent execution:

```
.worktrees/
├── issue-270/  (CodeGenAgent)
├── issue-271/  (ReviewAgent)
└── issue-272/  (DeploymentAgent)
```

**Benefits**:
- 🔄 Parallel execution without conflicts
- 🗂️ Isolated directories per agent
- ⏪ Easy rollback (just delete worktree)
- 🐛 Simplified debugging

### Q: Can I integrate Miyabi with CI/CD pipelines?

**A**: Yes! Miyabi can be triggered from:

- **GitHub Actions**: Use `.github/workflows/miyabi-auto.yml`
- **GitLab CI**: Run `npx miyabi` in pipeline
- **Jenkins**: Execute as shell command
- **CircleCI**: Add to config.yml

**Example GitHub Action**:
```yaml
name: Miyabi Auto
on:
  issues:
    types: [opened, labeled]
jobs:
  run-miyabi:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - run: npx miyabi agent run issue --issue=${{ github.event.issue.number }}
```

---

## 📚 Additional Resources

### Q: Where can I find more documentation?

**A**: Official resources:

- 📖 [GitHub README](https://github.com/ShunsukeHayashi/Miyabi#readme)
- 📦 [NPM Package](https://www.npmjs.com/package/miyabi)
- 🤖 [Agent SDK](https://www.npmjs.com/package/miyabi-agent-sdk)
- 🔌 [Claude Code Integration](https://github.com/ShunsukeHayashi/Miyabi/blob/main/packages/cli/CLAUDE.md)
- 🌐 [Landing Page](https://shunsukehayashi.github.io/Miyabi/landing.html)
- 🦀 [Codex (Subproject)](https://github.com/ShunsukeHayashi/codex)

### Q: Is there a roadmap?

**A**: Yes! Check:

- [GitHub Issues](https://github.com/ShunsukeHayashi/Miyabi/issues) for planned features
- [GitHub Projects](https://github.com/ShunsukeHayashi/Miyabi/projects) for roadmap board
- `#announcements` in Discord for updates

**Upcoming features** (tentative):
- Multi-model AI support (GPT-4, Gemini)
- Visual workflow editor
- SaaS platform (miyabi.dev)
- Plugin marketplace

### Q: Where can I see examples?

**A**: Example projects:

- [Miyabi Dashboard](https://shunsukehayashi.github.io/Miyabi/) - Built with Miyabi
- `#showcase` channel - Community projects
- GitHub Topics: Search `topic:miyabi`

---

## ❓ Still Have Questions?

If your question wasn't answered here:

1. **Search Discord history**: Press Ctrl/Cmd + K
2. **Ask in `#general-dev`**: Community members can help
3. **Create GitHub Discussion**: For complex questions
4. **Update this FAQ**: Submit a PR to help others!

---

🌸 **Miyabi Community** - Building the Future Together

🤖 Powered by Claude AI • 🔒 Apache 2.0 License • 💖 Made with Love

---

**Found an error or want to add a question?** Submit a PR to improve this FAQ!

**Last Updated**: 2025-10-12
