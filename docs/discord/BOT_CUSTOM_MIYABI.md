# Custom Miyabi Bot Specification 🤖🌸

**Status**: Planned (Future Implementation)
**Purpose**: Miyabi-specific Discord commands and automation
**Tech Stack**: Discord.js v14+ | TypeScript | Node.js 20+

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Core Features](#core-features)
3. [Command Specification](#command-specification)
4. [Architecture](#architecture)
5. [Implementation Roadmap](#implementation-roadmap)
6. [API Integration](#api-integration)

---

## 🎯 Overview

**Custom Miyabi Bot** extends MEE6 and GitHub Bot with Miyabi-specific functionality.

### Goals

1. **Quick Documentation Access** - Search docs without leaving Discord
2. **Agent Status** - Check Miyabi agent status and metrics
3. **Interactive Setup** - Guide new users through installation
4. **Command Shortcuts** - Run Miyabi CLI commands from Discord
5. **Community Engagement** - Automated welcome tours, quizzes

### Non-Goals

- ❌ Not a replacement for MEE6 (leveling) or GitHub Bot (notifications)
- ❌ Not a music bot or general-purpose utility bot
- ❌ Won't execute user code (security risk)

---

## ✨ Core Features

### 1. Documentation Search `/miyabi docs`

**Purpose**: Search official Miyabi documentation

**Usage**:
```
/miyabi docs [query]
```

**Examples**:
```
/miyabi docs agent
/miyabi docs label system
/miyabi docs github os
```

**Response Format**:
```
📚 **Documentation Results for "agent"**

1. **Agent System Overview**
   Miyabi uses 7 specialized AI agents...
   → [Read more](https://github.com/ShunsukeHayashi/Miyabi#agents)

2. **Agent SDK Documentation**
   Create custom agents with the Agent SDK...
   → [NPM Package](https://www.npmjs.com/package/miyabi-agent-sdk)

3. **Agent Configuration**
   Configure agents in `.miyabi.yml`...
   → [Configuration Guide](https://github.com/ShunsukeHayashi/Miyabi/blob/main/docs/CONFIGURATION.md)

💡 Tip: Use `/miyabi agent <name>` for specific agent info
```

---

### 2. Agent Information `/miyabi agent`

**Purpose**: Get details about specific Miyabi agents

**Usage**:
```
/miyabi agent [agent-name]
```

**Examples**:
```
/miyabi agent codegen
/miyabi agent review
/miyabi agent coordinator
```

**Response Format** (CodeGenAgent example):
```
🤖 **CodeGenAgent** - AI-Driven Code Generation

**Purpose**: Generates production-ready code using Claude Sonnet 4

**Capabilities**:
• TypeScript/JavaScript (Node.js, React, Vue, etc.)
• Python (FastAPI, Flask, Django, etc.)
• Rust, Go, Java (experimental)
• Test generation (Vitest, Jest, Pytest)
• Documentation generation (JSDoc, TSDoc)

**Configuration**:
```yaml
agents:
  codegen:
    model: claude-sonnet-4
    maxTokens: 4096
    temperature: 0.2
```

**Related Commands**:
• `/miyabi docs agent sdk` - Create custom agents
• `/miyabi status` - Check agent status

**Links**:
→ [Agent Specification](https://github.com/ShunsukeHayashi/Miyabi/blob/main/.claude/agents/specs/coding/codegen-agent.md)
→ [Usage Examples](https://github.com/ShunsukeHayashi/Miyabi#codegen-agent)
```

---

### 3. Service Status `/miyabi status`

**Purpose**: Check Miyabi services and dependencies

**Usage**:
```
/miyabi status
```

**Response Format**:
```
📊 **Miyabi Service Status**

**Core Services**:
✅ GitHub API - Operational (12ms)
✅ Anthropic Claude API - Operational (245ms)
✅ NPM Registry - Operational (45ms)

**Latest Release**:
🚀 v0.4.0 (2 days ago)
→ [Changelog](https://github.com/ShunsukeHayashi/Miyabi/releases/tag/v0.4.0)

**Known Issues**: None

**Links**:
• [GitHub Status](https://www.githubstatus.com/)
• [Anthropic Status](https://status.anthropic.com/)
• [NPM Status](https://status.npmjs.org/)

Last updated: 2 minutes ago
```

---

### 4. Interactive Setup `/miyabi setup`

**Purpose**: Guide users through Miyabi installation

**Usage**:
```
/miyabi setup
```

**Flow**:

**Step 1: Prerequisites Check**
```
🚀 **Miyabi Interactive Setup**

Let's check your environment first!

**Prerequisites**:
✅ Node.js >= 18.0.0
✅ Git CLI installed
✅ GitHub Account
⚠️ GitHub Token not found

**Next Steps**:
1. Create GitHub Personal Access Token
   → [Instructions](https://docs.github.com/authentication/keeping-your-account-and-data-secure/creating-a-personal-access-token)

2. Set token: `export GITHUB_TOKEN=ghp_your_token`

Type `/miyabi setup verify` when ready!
```

**Step 2: Installation**
```
✅ **Environment Ready!**

Now let's install Miyabi:

**Option 1: Quick Start (Recommended)**
```bash
npx miyabi
```

**Option 2: Global Install**
```bash
npm install -g miyabi
miyabi
```

**Next**: Type `/miyabi setup verify` after installation!
```

**Step 3: Verification**
```
✅ **Miyabi Installed Successfully!**

**Quick Start**:
1. Create a new project:
   ```bash
   npx miyabi
   # Select: 🆕 Create new project
   ```

2. Check status:
   ```bash
   miyabi status
   ```

3. Run your first agent:
   ```bash
   miyabi agent run issue --issue=1
   ```

**Resources**:
• Full Guide: [Setup Guide](https://github.com/ShunsukeHayashi/Miyabi/blob/main/docs/SETUP_GUIDE.md)
• Ask questions in: {#support-english}

🎉 You're all set! Happy building!
```

---

### 5. Version Check `/miyabi version`

**Purpose**: Check Miyabi and CLI versions

**Usage**:
```
/miyabi version [package]
```

**Examples**:
```
/miyabi version
/miyabi version cli
/miyabi version sdk
```

**Response**:
```
📦 **Miyabi Version Info**

**CLI**: v0.4.0 (latest)
**Agent SDK**: v0.1.0-alpha.2 (latest)
**Core Framework**: v0.4.0

**Update Available**: No

**Install/Update**:
```bash
# CLI
npm install -g miyabi@latest

# SDK
npm install miyabi-agent-sdk@latest
```

**Links**:
• [NPM - miyabi](https://www.npmjs.com/package/miyabi)
• [NPM - miyabi-agent-sdk](https://www.npmjs.com/package/miyabi-agent-sdk)
```

---

### 6. Label Lookup `/miyabi label`

**Purpose**: Explain Miyabi's 53-label system

**Usage**:
```
/miyabi label [label-name]
```

**Examples**:
```
/miyabi label state:pending
/miyabi label priority:P0-Critical
/miyabi label agent:codegen
```

**Response** (state:pending example):
```
🏷️ **Label**: `📥 state:pending`

**Category**: STATE (Lifecycle Management)
**Description**: Task is queued, awaiting agent assignment

**Usage**:
• Applied to Issues when created
• Transitions to `🔍 state:analyzing` when CoordinatorAgent picks up
• Part of standard workflow: pending → analyzing → implementing → reviewing → done

**Related Labels**:
• `🔍 state:analyzing` - Next state
• `🤖 agent:coordinator` - Agent responsible
• `🤖 trigger:agent-execute` - Auto-trigger

**Full Label System**:
→ [Label System Guide](https://github.com/ShunsukeHayashi/Miyabi/blob/main/docs/LABEL_SYSTEM_GUIDE.md)
```

---

### 7. Quick Start Guide `/miyabi quickstart`

**Purpose**: Show condensed getting started guide

**Usage**:
```
/miyabi quickstart
```

**Response**:
```
⚡ **Miyabi Quick Start (5 Minutes)**

**1. Install** (30 seconds)
```bash
npx miyabi
```

**2. Create Project** (2 minutes)
Select "🆕 Create new project" → Enter name → Public/Private

**3. Create First Issue** (1 minute)
Go to GitHub repo → Issues → New Issue → Add labels

**4. Watch Magic Happen** (2 minutes)
Miyabi agents automatically:
✅ Analyze issue
✅ Generate code
✅ Run tests
✅ Create PR

**Next Steps**:
• Tutorial: [Getting Started](https://github.com/ShunsukeHayashi/Miyabi#getting-started)
• Examples: {#showcase}
• Questions: {#support-english}

🎉 That's it! You're running autonomous AI development!
```

---

### 8. Community Stats `/miyabi stats`

**Purpose**: Show community and project statistics

**Usage**:
```
/miyabi stats [category]
```

**Examples**:
```
/miyabi stats
/miyabi stats community
/miyabi stats project
```

**Response**:
```
📊 **Miyabi Statistics**

**Community (Discord)**:
• Members: 237
• Active (7 days): 89
• Messages (30 days): 4,521
• Top Contributor: @user (127 messages)

**Project (GitHub)**:
• Stars: ⭐ 1,234
• Forks: 89
• Contributors: 23
• Open Issues: 15
• Open PRs: 3
• Latest Release: v0.4.0 (2 days ago)

**Usage (This Month)**:
• Agents executed: ~3,400
• PRs created: 156
• Tests run: 2,890
• Code generated: ~450K lines

**Links**:
• [GitHub Insights](https://github.com/ShunsukeHayashi/Miyabi/pulse)
• [Contributors](https://github.com/ShunsukeHayashi/Miyabi/graphs/contributors)

Last updated: 10 minutes ago
```

---

## 🏗️ Architecture

### Tech Stack

**Framework**: Discord.js v14+
**Language**: TypeScript (Strict mode)
**Runtime**: Node.js 20+
**Database**: PostgreSQL 15+ (for caching, analytics)
**Cache**: Redis 7+ (for rate limiting, session storage)
**Deployment**: Docker + Kubernetes (Scalable)

### Bot Structure

```
packages/discord-bot/
├── src/
│   ├── commands/          # Slash commands
│   │   ├── docs.ts
│   │   ├── agent.ts
│   │   ├── status.ts
│   │   ├── setup.ts
│   │   └── index.ts
│   ├── events/            # Discord events
│   │   ├── ready.ts
│   │   ├── interactionCreate.ts
│   │   └── index.ts
│   ├── services/          # Business logic
│   │   ├── documentationSearch.ts
│   │   ├── agentInfo.ts
│   │   ├── statusCheck.ts
│   │   └── analytics.ts
│   ├── utils/             # Utilities
│   │   ├── embed.ts
│   │   ├── cache.ts
│   │   └── rate-limit.ts
│   ├── config/            # Configuration
│   │   └── config.ts
│   └── index.ts           # Entry point
├── tests/
│   └── commands/
├── package.json
├── tsconfig.json
└── Dockerfile
```

### Command Registration

```typescript
// src/commands/docs.ts
import { SlashCommandBuilder } from 'discord.js';

export const command = new SlashCommandBuilder()
  .setName('miyabi')
  .setDescription('Miyabi bot commands')
  .addSubcommand(subcommand =>
    subcommand
      .setName('docs')
      .setDescription('Search Miyabi documentation')
      .addStringOption(option =>
        option
          .setName('query')
          .setDescription('Search query')
          .setRequired(true)
      )
  );

export async function execute(interaction: CommandInteraction) {
  const query = interaction.options.getString('query', true);
  const results = await searchDocumentation(query);

  const embed = new EmbedBuilder()
    .setTitle(`📚 Documentation Results for "${query}"`)
    .setDescription(formatResults(results))
    .setColor(0x00A9FF);

  await interaction.reply({ embeds: [embed] });
}
```

---

## 🗓️ Implementation Roadmap

### Phase 1: Core Commands (Month 1)

- [x] Project setup and structure
- [ ] `/miyabi docs` - Documentation search
- [ ] `/miyabi agent` - Agent information
- [ ] `/miyabi status` - Service status
- [ ] `/miyabi version` - Version check
- [ ] Deploy to staging

### Phase 2: Interactive Features (Month 2)

- [ ] `/miyabi setup` - Interactive setup wizard
- [ ] `/miyabi label` - Label system lookup
- [ ] `/miyabi quickstart` - Quick start guide
- [ ] Button interactions (e.g., "Show more results")
- [ ] Deploy to production

### Phase 3: Analytics & Stats (Month 3)

- [ ] `/miyabi stats` - Community and project stats
- [ ] Usage analytics dashboard
- [ ] Leaderboard integration
- [ ] Cost tracking dashboard

### Phase 4: Advanced Features (Month 4+)

- [ ] `/miyabi playground` - Try Miyabi without installation (sandboxed)
- [ ] `/miyabi tutorial` - Interactive tutorials
- [ ] `/miyabi quiz` - Knowledge quizzes (gamification)
- [ ] `/miyabi deploy` - Trigger deployments (authorized users only)
- [ ] Webhook integrations (custom notifications)

---

## 🔌 API Integration

### External APIs

#### 1. GitHub API

**Purpose**: Fetch repo stats, issues, PRs

**Endpoints Used**:
- `GET /repos/{owner}/{repo}` - Repository info
- `GET /repos/{owner}/{repo}/releases/latest` - Latest release
- `GET /repos/{owner}/{repo}/issues` - Open issues
- `GET /repos/{owner}/{repo}/pulls` - Open PRs

#### 2. NPM Registry API

**Purpose**: Check package versions

**Endpoints**:
- `GET https://registry.npmjs.org/miyabi` - miyabi CLI info
- `GET https://registry.npmjs.org/miyabi-agent-sdk` - SDK info

#### 3. Anthropic Status API

**Purpose**: Check Claude API status

**Endpoint**:
- `GET https://status.anthropic.com/api/v2/status.json`

#### 4. Custom Miyabi API (Future)

**Purpose**: Usage analytics, agent metrics

**Planned Endpoints**:
- `GET /api/v1/stats/community` - Community stats
- `GET /api/v1/stats/usage` - Usage metrics
- `GET /api/v1/agents/status` - Agent execution stats

---

## 🔒 Security Considerations

### Bot Permissions

**Minimum Required**:
- ✅ Send Messages
- ✅ Embed Links
- ✅ Use Slash Commands
- ✅ Read Message History (for context)

**NOT Required**:
- ❌ Administrator
- ❌ Manage Server
- ❌ Manage Roles
- ❌ Manage Channels

### Rate Limiting

**Per User**:
- 5 commands per minute
- 50 commands per hour
- 500 commands per day

**Per Guild (Server)**:
- 100 commands per minute
- 5,000 commands per day

### Data Privacy

- ✅ **No DM logging** - Bot doesn't log private messages
- ✅ **No user tracking** - Only command usage analytics
- ✅ **No data selling** - Never sell or share user data
- ✅ **Open source** - Bot code will be public (transparency)

---

## 📚 Development Guide

### Local Development

```bash
# Clone repository
git clone https://github.com/ShunsukeHayashi/Miyabi.git
cd Miyabi/packages/discord-bot

# Install dependencies
npm install

# Set environment variables
cp .env.example .env
# Edit .env with your Discord bot token

# Run in development mode
npm run dev

# Run tests
npm test

# Build
npm run build

# Run production
npm start
```

### Environment Variables

```bash
# Required
DISCORD_BOT_TOKEN=your_bot_token_here
DISCORD_CLIENT_ID=your_client_id_here
DISCORD_GUILD_ID=your_test_guild_id_here

# Optional
GITHUB_TOKEN=ghp_your_token_here
ANTHROPIC_API_KEY=sk-ant-your_key_here
DATABASE_URL=postgresql://user:pass@localhost:5432/miyabi_bot
REDIS_URL=redis://localhost:6379
LOG_LEVEL=info
```

---

## 🧪 Testing Strategy

### Unit Tests

- Command handlers
- Service functions
- Utility functions
- Target: 80%+ coverage

### Integration Tests

- Discord API interactions
- External API calls (mocked)
- Database operations

### E2E Tests

- Full command flows
- Button interactions
- Setup wizard flow

---

## 📊 Monitoring & Observability

### Metrics Tracked

- Command usage (by command, by user, by guild)
- Response times
- Error rates
- API quota usage (Discord, GitHub, etc.)

### Logging

**Levels**:
- `ERROR` - Command failures, API errors
- `WARN` - Rate limits approaching, deprecated commands
- `INFO` - Command executions, bot events
- `DEBUG` - Detailed request/response logs

**Storage**:
- Local: JSON files (development)
- Production: Centralized logging (e.g., Datadog, CloudWatch)

---

## 🔗 Additional Resources

- **Discord.js Documentation**: https://discord.js.org/
- **Discord Developer Portal**: https://discord.com/developers/docs
- **Bot Best Practices**: https://discord.com/developers/docs/topics/community-resources

---

## 📝 Contributing

Interested in contributing to the Custom Miyabi Bot?

1. **Check Issues**: [GitHub Issues - Bot Label](https://github.com/ShunsukeHayashi/Miyabi/labels/bot)
2. **Propose Features**: Create a discussion in [GitHub Discussions](https://github.com/ShunsukeHayashi/Miyabi/discussions)
3. **Submit PRs**: Follow [Contributing Guide](https://github.com/ShunsukeHayashi/Miyabi/blob/main/CONTRIBUTING.md)

---

**Status**: Specification Complete, Implementation Pending
**Last Updated**: 2025-10-12
**Contact**: @Miyabi Team in Discord

🤖🌸 Building the future of developer community bots!
