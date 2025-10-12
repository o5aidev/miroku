# Claude Code Plugins Reference

> Complete technical reference for Claude Code plugin system, including schemas, CLI commands, and component specifications.

**For Miyabi Project**: This document serves as the technical reference for creating custom plugins within the Autonomous Operations ecosystem.

<Tip>
  For hands-on tutorials and practical usage, see the main [Plugins documentation](/en/docs/claude-code/plugins). For plugin management across teams and communities, see [Plugin marketplaces](/en/docs/claude-code/plugin-marketplaces).
</Tip>

This reference provides complete technical specifications for the Claude Code plugin system, including component schemas, CLI commands, and development tools.

---

## Plugin components reference

This section documents the four types of components that plugins can provide.

### Commands

Plugins add custom slash commands that integrate seamlessly with Claude Code's command system.

**Location**: `commands/` directory in plugin root

**File format**: Markdown files with frontmatter

**Command structure**:

```markdown
---
description: Brief description of what this command does
scope: project  # or 'conversation'
---

# Command Implementation

Detailed instructions for Claude on how to execute this command.

## Parameters
- param1: Description
- param2: Description

## Execution Steps
1. Step one
2. Step two
3. Step three

## Success Criteria
- Criterion 1
- Criterion 2
```

**Integration points**:
* Commands appear in the `/` autocomplete menu
* Can be invoked by users or Claude
* Support parameter passing
* Work alongside built-in commands

---

### Agents

Plugins can provide specialized subagents for specific tasks that Claude can invoke automatically when appropriate.

**Location**: `agents/` directory in plugin root

**File format**: Markdown files describing agent capabilities

**Agent structure**:

```markdown
---
description: What this agent specializes in
capabilities: ["task1", "task2", "task3"]
---

# Agent Name

Detailed description of the agent's role, expertise, and when Claude should invoke it.

## Capabilities
- Specific task the agent excels at
- Another specialized capability
- When to use this agent vs others

## Context and examples
Provide examples of when this agent should be used and what kinds of problems it solves.
```

**Integration points**:
* Agents appear in the `/agents` interface
* Claude can invoke agents automatically based on task context
* Agents can be invoked manually by users
* Plugin agents work alongside built-in Claude agents

**Example for Miyabi**:

```markdown
---
description: Autonomous deployment agent for Firebase/Vercel/AWS
capabilities: ["deploy", "rollback", "health-check"]
---

# DeploymentAgent

Specialized agent for autonomous CI/CD deployment with automatic health checks and rollback capabilities.

## Capabilities
- Deploy to Firebase, Vercel, or AWS environments
- Execute pre-deployment validation (tests, build)
- Perform post-deployment health checks
- Automatic rollback on failure

## When to use
- When a PR is merged to main/production branch
- When manual deployment is requested
- When rollback is needed due to production issues
```

---

### Hooks

Plugins can provide event handlers that respond to Claude Code events automatically.

**Location**: `hooks/hooks.json` in plugin root, or inline in plugin.json

**Format**: JSON configuration with event matchers and actions

**Hook configuration**:

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Write|Edit",
        "hooks": [
          {
            "type": "command",
            "command": "${CLAUDE_PLUGIN_ROOT}/scripts/format-code.sh"
          }
        ]
      }
    ],
    "PreToolUse": [
      {
        "matcher": "Bash",
        "hooks": [
          {
            "type": "command",
            "command": "${CLAUDE_PLUGIN_ROOT}/scripts/security-check.sh"
          }
        ]
      }
    ]
  }
}
```

**Available events**:
* `PreToolUse`: Before Claude uses any tool
* `PostToolUse`: After Claude uses any tool
* `UserPromptSubmit`: When user submits a prompt
* `Notification`: When Claude Code sends notifications
* `Stop`: When Claude attempts to stop
* `SubagentStop`: When a subagent attempts to stop
* `SessionStart`: At the beginning of sessions
* `SessionEnd`: At the end of sessions
* `PreCompact`: Before conversation history is compacted

**Hook types**:
* `command`: Execute shell commands or scripts
* `validation`: Validate file contents or project state
* `notification`: Send alerts or status updates

**Miyabi-specific hook example**:

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Write|Edit",
        "hooks": [
          {
            "type": "command",
            "command": "${CLAUDE_PLUGIN_ROOT}/scripts/update-label.sh",
            "args": ["--action", "code-generated"]
          }
        ]
      }
    ],
    "UserPromptSubmit": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "${CLAUDE_PLUGIN_ROOT}/scripts/log-session.sh"
          }
        ]
      }
    ]
  }
}
```

---

### MCP servers

Plugins can bundle Model Context Protocol (MCP) servers to connect Claude Code with external tools and services.

**Location**: `.mcp.json` in plugin root, or inline in plugin.json

**Format**: Standard MCP server configuration

**MCP server configuration**:

```json
{
  "mcpServers": {
    "plugin-database": {
      "command": "${CLAUDE_PLUGIN_ROOT}/servers/db-server",
      "args": ["--config", "${CLAUDE_PLUGIN_ROOT}/config.json"],
      "env": {
        "DB_PATH": "${CLAUDE_PLUGIN_ROOT}/data"
      }
    },
    "plugin-api-client": {
      "command": "npx",
      "args": ["@company/mcp-server", "--plugin-mode"],
      "cwd": "${CLAUDE_PLUGIN_ROOT}"
    }
  }
}
```

**Integration behavior**:
* Plugin MCP servers start automatically when the plugin is enabled
* Servers appear as standard MCP tools in Claude's toolkit
* Server capabilities integrate seamlessly with Claude's existing tools
* Plugin servers can be configured independently of user MCP servers

**Miyabi GitHub integration example**:

```json
{
  "mcpServers": {
    "miyabi-github": {
      "command": "${CLAUDE_PLUGIN_ROOT}/servers/github-mcp",
      "args": ["--token", "${GITHUB_TOKEN}"],
      "env": {
        "GITHUB_API_URL": "https://api.github.com"
      }
    }
  }
}
```

---

## Plugin manifest schema

The `plugin.json` file defines your plugin's metadata and configuration. This section documents all supported fields and options.

### Complete schema

```json
{
  "name": "plugin-name",
  "version": "1.2.0",
  "description": "Brief plugin description",
  "author": {
    "name": "Author Name",
    "email": "author@example.com",
    "url": "https://github.com/author"
  },
  "homepage": "https://docs.example.com/plugin",
  "repository": "https://github.com/author/plugin",
  "license": "MIT",
  "keywords": ["keyword1", "keyword2"],
  "commands": ["./custom/commands/special.md"],
  "agents": "./custom/agents/",
  "hooks": "./config/hooks.json",
  "mcpServers": "./mcp-config.json"
}
```

### Required fields

| Field  | Type   | Description                               | Example              |
| :----- | :----- | :---------------------------------------- | :------------------- |
| `name` | string | Unique identifier (kebab-case, no spaces) | `"deployment-tools"` |

### Metadata fields

| Field         | Type   | Description                         | Example                                            |
| :------------ | :----- | :---------------------------------- | :------------------------------------------------- |
| `version`     | string | Semantic version                    | `"2.1.0"`                                          |
| `description` | string | Brief explanation of plugin purpose | `"Deployment automation tools"`                    |
| `author`      | object | Author information                  | `{"name": "Dev Team", "email": "dev@company.com"}` |
| `homepage`    | string | Documentation URL                   | `"https://docs.example.com"`                       |
| `repository`  | string | Source code URL                     | `"https://github.com/user/plugin"`                 |
| `license`     | string | License identifier                  | `"MIT"`, `"Apache-2.0"`                            |
| `keywords`    | array  | Discovery tags                      | `["deployment", "ci-cd"]`                          |

### Component path fields

| Field        | Type           | Description                          | Example                                |
| :----------- | :------------- | :----------------------------------- | :------------------------------------- |
| `commands`   | string\|array  | Additional command files/directories | `"./custom/cmd.md"` or `["./cmd1.md"]` |
| `agents`     | string\|array  | Additional agent files               | `"./custom/agents/"`                   |
| `hooks`      | string\|object | Hook config path or inline config    | `"./hooks.json"`                       |
| `mcpServers` | string\|object | MCP config path or inline config     | `"./mcp.json"`                         |

### Path behavior rules

**Important**: Custom paths supplement default directories - they don't replace them.

* If `commands/` exists, it's loaded in addition to custom command paths
* All paths must be relative to plugin root and start with `./`
* Commands from custom paths use the same naming and namespacing rules
* Multiple paths can be specified as arrays for flexibility

**Path examples**:

```json
{
  "commands": [
    "./specialized/deploy.md",
    "./utilities/batch-process.md"
  ],
  "agents": [
    "./custom-agents/reviewer.md",
    "./custom-agents/tester.md"
  ]
}
```

### Environment variables

**`${CLAUDE_PLUGIN_ROOT}`**: Contains the absolute path to your plugin directory. Use this in hooks, MCP servers, and scripts to ensure correct paths regardless of installation location.

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "${CLAUDE_PLUGIN_ROOT}/scripts/process.sh"
          }
        ]
      }
    ]
  }
}
```

---

## Plugin directory structure

### Standard plugin layout

A complete plugin follows this structure:

```
miyabi-operations-plugin/
├── .claude-plugin/           # Metadata directory
│   └── plugin.json          # Required: plugin manifest
├── commands/                 # Default command location
│   ├── verify.md            # /verify command
│   ├── deploy.md            # /deploy command
│   ├── agent-run.md         # /agent-run command
│   └── security-scan.md     # /security-scan command
├── agents/                   # Default agent location
│   ├── coordinator-agent.md
│   ├── codegen-agent.md
│   ├── review-agent.md
│   ├── issue-agent.md
│   ├── pr-agent.md
│   └── deployment-agent.md
├── hooks/                    # Hook configurations
│   ├── hooks.json           # Main hook config
│   └── agent-event.sh       # Agent event hook script
├── .mcp.json                # MCP server definitions
├── scripts/                 # Hook and utility scripts
│   ├── update-label.sh
│   ├── log-session.sh
│   └── trigger-workflow.sh
├── LICENSE                  # License file
├── README.md                # Plugin documentation
└── CHANGELOG.md             # Version history
```

<Warning>
  The `.claude-plugin/` directory contains the `plugin.json` file. All other directories (commands/, agents/, hooks/) must be at the plugin root, not inside `.claude-plugin/`.
</Warning>

### File locations reference

| Component       | Default Location             | Purpose                      |
| :-------------- | :--------------------------- | :--------------------------- |
| **Manifest**    | `.claude-plugin/plugin.json` | Required metadata file       |
| **Commands**    | `commands/`                  | Slash command markdown files |
| **Agents**      | `agents/`                    | Subagent markdown files      |
| **Hooks**       | `hooks/hooks.json`           | Hook configuration           |
| **MCP servers** | `.mcp.json`                  | MCP server definitions       |

---

## Debugging and development tools

### Debugging commands

Use `claude --debug` to see plugin loading details:

```bash
claude --debug
```

This shows:
* Which plugins are being loaded
* Any errors in plugin manifests
* Command, agent, and hook registration
* MCP server initialization

### Common issues

| Issue                  | Cause                           | Solution                                             |
| :--------------------- | :------------------------------ | :--------------------------------------------------- |
| Plugin not loading     | Invalid `plugin.json`           | Validate JSON syntax                                 |
| Commands not appearing | Wrong directory structure       | Ensure `commands/` at root, not in `.claude-plugin/` |
| Hooks not firing       | Script not executable           | Run `chmod +x script.sh`                             |
| MCP server fails       | Missing `${CLAUDE_PLUGIN_ROOT}` | Use variable for all plugin paths                    |
| Path errors            | Absolute paths used             | All paths must be relative and start with `./`       |

### Testing your plugin locally

1. **Create plugin structure**:
   ```bash
   mkdir -p my-plugin/.claude-plugin
   cd my-plugin
   ```

2. **Create minimal plugin.json**:
   ```json
   {
     "name": "my-plugin",
     "version": "0.1.0"
   }
   ```

3. **Test loading**:
   ```bash
   claude --debug
   ```

4. **Verify commands**:
   ```bash
   # In Claude Code session
   /help
   # Your commands should appear
   ```

---

## Distribution and versioning reference

### Version management

Follow semantic versioning for plugin releases:

```json
{
  "version": "MAJOR.MINOR.PATCH"
}
```

**Version increment rules**:
* **MAJOR**: Breaking changes (incompatible API changes)
* **MINOR**: New features (backward-compatible)
* **PATCH**: Bug fixes (backward-compatible)

**Examples**:
* `1.0.0` → `2.0.0`: Breaking change (removed command, changed hook API)
* `1.0.0` → `1.1.0`: New feature (added new agent)
* `1.0.0` → `1.0.1`: Bug fix (fixed script error)

### Distribution methods

#### Method 1: Git repository

**Structure**:
```
https://github.com/user/miyabi-plugin
├── .claude-plugin/
│   └── plugin.json
├── commands/
├── agents/
└── README.md
```

**Installation**:
```bash
# User installs with:
git clone https://github.com/user/miyabi-plugin ~/.config/claude/plugins/miyabi-plugin
```

#### Method 2: NPM package

**package.json**:
```json
{
  "name": "miyabi-operations-plugin",
  "version": "1.0.0",
  "description": "Autonomous operations plugin for Claude Code",
  "main": ".claude-plugin/plugin.json",
  "files": [
    ".claude-plugin/",
    "commands/",
    "agents/",
    "hooks/",
    "scripts/"
  ],
  "keywords": ["claude-code", "plugin", "autonomous-operations"]
}
```

**Installation**:
```bash
npm install -g miyabi-operations-plugin
```

#### Method 3: Plugin marketplace

**Marketplace listing** (`marketplace.json`):
```json
{
  "plugins": [
    {
      "name": "miyabi-operations",
      "source": "https://github.com/ShunsukeHayashi/miyabi-plugin",
      "version": "1.0.0",
      "description": "Autonomous development operations",
      "author": "Shunsuke Hayashi",
      "tags": ["autonomous", "github", "ci-cd"]
    }
  ]
}
```

---

## Miyabi-specific plugin examples

### Example 1: Autonomous Agent Runner

**File**: `commands/agent-run.md`

```markdown
---
description: Autonomous Agent実行 - Issue自動処理パイプライン
scope: project
---

# Autonomous Agent Runner

Miyabiの自律型Agent実行システムを起動します。

## Usage
```bash
/agent-run [--issues=270,240] [--concurrency=3]
```

## Parameters
- `--issues`: 処理するIssue番号（カンマ区切り）
- `--concurrency`: 並列実行数（デフォルト: 2）

## Execution Steps
1. 指定されたIssueをGitHubから取得
2. CoordinatorAgentでタスク分解（DAG構築）
3. 並列実行制御で最適化
4. 各SpecialistAgentに割り当て
5. 実行結果をProjects V2に記録

## Success Criteria
- 全Issueが処理完了または明確なエラー
- 実行レポートが生成される
- GitHub Projects V2が更新される
```

### Example 2: Deployment Hook

**File**: `hooks/hooks.json`

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Bash.*git push",
        "hooks": [
          {
            "type": "command",
            "command": "${CLAUDE_PLUGIN_ROOT}/scripts/trigger-deploy.sh",
            "args": ["--environment", "staging"]
          }
        ]
      }
    ]
  }
}
```

**File**: `scripts/trigger-deploy.sh`

```bash
#!/bin/bash
# Miyabi Deployment Trigger

set -e

ENVIRONMENT=${1:-staging}
GITHUB_TOKEN=${GITHUB_TOKEN}

echo "🚀 Triggering deployment to ${ENVIRONMENT}..."

# Trigger GitHub Actions workflow
gh workflow run deploy-pages.yml \
  --field environment="${ENVIRONMENT}" \
  --field trigger_source="claude-plugin"

echo "✅ Deployment triggered successfully"
```

### Example 3: Label Update Agent

**File**: `agents/label-agent.md`

```markdown
---
description: GitHub Issue/PRラベル自動管理Agent
capabilities: ["label-inference", "state-transition", "priority-assignment"]
---

# LabelAgent

53ラベル体系に基づいてIssue/PRのラベルを自動推論・更新します。

## Capabilities
- Issue内容からtype/priority/severityを推論
- 状態遷移に応じてSTATEラベルを更新
- 組織設計原則に基づくラベル体系の遵守

## When to use
- 新しいIssueが作成されたとき
- PRの状態が変わったとき
- Agent実行が完了したとき

## Label categories (53 labels)
1. STATE (8): pending, analyzing, implementing, reviewing, done, blocked, failed, paused
2. AGENT (6): coordinator, codegen, review, issue, pr, deployment
3. PRIORITY (4): P0-Critical, P1-High, P2-Medium, P3-Low
4. TYPE (7): feature, bug, docs, refactor, test, architecture, deployment
5. SEVERITY (4): Sev.1-Critical ~ Sev.4-Low

## Integration
- Uses GitHub Octokit API
- Respects existing labels (additive, not destructive)
- Logs all label changes to audit trail
```

---

## See also

- **Miyabi Documentation**:
  - [CLAUDE.md](../CLAUDE.md) - Project context and architecture
  - [AGENT_OPERATIONS_MANUAL.md](./AGENT_OPERATIONS_MANUAL.md) - Agent運用マニュアル
  - [LABEL_SYSTEM_GUIDE.md](./LABEL_SYSTEM_GUIDE.md) - 53ラベル体系完全ガイド
  - [GITHUB_OS_INTEGRATION.md](./GITHUB_OS_INTEGRATION.md) - GitHub as OS統合

- **Claude Code Documentation**:
  - [Plugins](/en/docs/claude-code/plugins) - Tutorials and practical usage
  - [Plugin marketplaces](/en/docs/claude-code/plugin-marketplaces) - Creating and managing marketplaces
  - [Slash commands](/en/docs/claude-code/slash-commands) - Command development details
  - [Subagents](/en/docs/claude-code/sub-agents) - Agent configuration and capabilities
  - [Hooks](/en/docs/claude-code/hooks) - Event handling and automation
  - [MCP](/en/docs/claude-code/mcp) - External tool integration
  - [Settings](/en/docs/claude-code/settings) - Configuration options for plugins

---

**Document Version**: 1.0.0
**Last Updated**: 2025-10-11
**Author**: Shunsuke Hayashi
**Project**: Miyabi - Autonomous Operations

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>
