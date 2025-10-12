# Miyabi Plugin Instructions for Claude Code

## Plugin Overview

**Miyabi** is a fully autonomous AI development operations platform based on the "GitHub as OS" architecture, automating everything from Issue creation to code implementation, PR creation, and deployment.

## How to Use This Plugin

When users invoke Miyabi commands (e.g., `/miyabi-auto`, `/miyabi-status`), you should:

1. **Understand the Command Context**: Read the corresponding command file in `.claude-plugin/commands/`
2. **Execute via MCP Tools**: Use the `miyabi__*` MCP tools provided by this plugin
3. **Report Results**: Provide clear, actionable feedback to the user

## Agent System

Miyabi provides 7 specialized agents:

### 1. CoordinatorAgent
- **Purpose**: Task orchestration and parallel execution control
- **Triggers**: `🤖 agent:coordinator` label or `/miyabi-agent coordinator`
- **Capabilities**: DAG-based task decomposition, critical path identification

### 2. CodeGenAgent
- **Purpose**: AI-driven code generation
- **Triggers**: `🤖 agent:codegen` label or `/miyabi-agent codegen`
- **Capabilities**: Claude Sonnet 4 powered code generation, TypeScript strict mode support

### 3. ReviewAgent
- **Purpose**: Code quality assessment
- **Triggers**: `🤖 agent:review` label or `/miyabi-agent review`
- **Capabilities**: Static analysis, security scanning, 100-point quality scoring

### 4. IssueAgent
- **Purpose**: Issue analysis and label management
- **Triggers**: `🤖 agent:issue` label or `/miyabi-agent issue`
- **Capabilities**: AI-powered label classification using 53-label system

### 5. PRAgent
- **Purpose**: Automatic Pull Request creation
- **Triggers**: `🤖 agent:pr` label or `/miyabi-agent pr`
- **Capabilities**: Conventional Commits compliance, Draft PR generation

### 6. DeploymentAgent
- **Purpose**: CI/CD deployment automation
- **Triggers**: `🤖 agent:deployment` label or `/miyabi-agent deployment`
- **Capabilities**: Firebase auto-deploy, health checks, automatic rollback

### 7. TestAgent
- **Purpose**: Automated test execution
- **Triggers**: `🤖 agent:test` label or `/miyabi-agent test`
- **Capabilities**: Vitest/Jest/Playwright execution, coverage reporting

## Label System (53 Labels)

Miyabi uses a structured 53-label system across 10 categories:

1. **STATE** (8): Lifecycle management - `📥 state:pending`, `🔍 state:analyzing`, etc.
2. **AGENT** (6): Agent assignment - `🤖 agent:coordinator`, `🤖 agent:codegen`, etc.
3. **PRIORITY** (4): Priority management - `🔥 priority:P0-Critical` to `📝 priority:P3-Low`
4. **TYPE** (7): Issue classification - `✨ type:feature`, `🐛 type:bug`, etc.
5. **SEVERITY** (4): Severity levels - `🚨 severity:Sev.1-Critical`, etc.
6. **PHASE** (5): Project phases - `🎯 phase:planning`, `🚀 phase:deployment`, etc.
7. **SPECIAL** (7): Special operations - `🔐 security`, `💰 cost-watch`, etc.
8. **TRIGGER** (4): Automation triggers - `🤖 trigger:agent-execute`, etc.
9. **QUALITY** (4): Quality scores - `⭐ quality:excellent` (90-100), etc.
10. **COMMUNITY** (4): Community labels - `👋 good-first-issue`, etc.

### State Transition Flow
```
📥 pending → 🔍 analyzing → 🏗️ implementing → 👀 reviewing → ✅ done
```

## Command Guidelines

### /miyabi-auto (Water Spider Mode)
- **Purpose**: Fully autonomous Issue execution mode
- **When to use**: User wants hands-free automation
- **Behavior**:
  - Poll for `state:pending` Issues every 60 seconds
  - Automatically assign agents based on labels
  - Execute tasks without human intervention
  - Update dashboard in real-time

### /miyabi-amembo (Amembo Mode)
- **Purpose**: Lightweight monitoring mode
- **When to use**: User wants observation without execution
- **Behavior**:
  - Scan Issues periodically
  - Generate status reports
  - No automatic execution - read-only mode

### /miyabi-watch (Watch Mode)
- **Purpose**: Real-time webhook-based monitoring
- **When to use**: User wants instant notifications
- **Behavior**:
  - Set up GitHub Webhooks
  - React to events in 1-3 seconds
  - Send notifications to Slack/Discord/Email
  - Update dashboard in real-time

### /miyabi-status
- **Purpose**: Project status check
- **Behavior**: Display current state of all Issues grouped by STATE labels

### /miyabi-todos
- **Purpose**: TODO comment detection and Issue creation
- **Behavior**: Scan codebase for TODO comments, create Issues automatically

### /miyabi-agent <agent-name>
- **Purpose**: Execute specific agent
- **Parameters**: coordinator | codegen | review | issue | pr | deployment | test

### /miyabi-docs
- **Purpose**: Automatic documentation generation
- **Behavior**: Generate docs from codebase, update README

### /miyabi-deploy
- **Purpose**: Execute deployment
- **Behavior**: Run deployment workflow based on environment

### /miyabi-test
- **Purpose**: Run tests
- **Behavior**: Execute test suite, report coverage

## Best Practices

1. **Always check Issue labels** before executing agents
2. **Update STATE labels** as work progresses
3. **Use PRIORITY labels** to determine execution order
4. **Respect TRIGGER labels** for automation conditions
5. **Report QUALITY scores** after code generation/review
6. **Follow Conventional Commits** for all PRs
7. **Maintain 80%+ test coverage** as minimum quality bar

## Error Handling

- **API Rate Limits**: Implement exponential backoff (already built-in)
- **Unicode Issues**: Use `safeTruncate()` for string truncation to avoid breaking surrogate pairs
- **Webhook Security**: Verify HMAC-SHA256 signatures
- **Git Conflicts**: Always fetch before push, use rebase strategy

## Communication Style

- **Concise**: Provide clear, actionable updates
- **Structured**: Use markdown formatting for readability
- **Progressive**: Report progress incrementally for long-running tasks
- **Transparent**: Always explain what agents are doing and why

## Integration Points

### GitHub API
- Use `@octokit/rest` for all GitHub operations
- Token stored in `GITHUB_TOKEN` environment variable
- Rate limit: 5000 requests/hour (authenticated)

### Anthropic API
- Use `@anthropic-ai/sdk` for AI operations
- Token stored in `ANTHROPIC_API_KEY` environment variable
- Model: `claude-sonnet-4-20250514` (latest)

### MCP Servers
- `miyabi-integration.js`: Main integration server
- Provides all `miyabi__*` tools to Claude Code

## Security Considerations

- **Never commit secrets**: Use environment variables
- **Verify webhooks**: Always check HMAC signatures
- **Limit agent permissions**: Each agent has specific scopes
- **Audit logs**: All operations are logged to `logs/`

## Performance Targets

- **Agent Execution**: < 5 minutes per Issue
- **Parallel Efficiency**: 70%+ (measured via Critical Path)
- **API Response Time**: < 2 seconds (95th percentile)
- **Test Coverage**: 80%+ minimum
- **Quality Score**: 80+ points for approval

## User Experience Guidelines

1. **Initial Setup**: Guide users through `miyabi init` or `miyabi install`
2. **First Run**: Explain what each agent does
3. **Watch Mode**: Show real-time updates as they happen
4. **Error Recovery**: Provide clear next steps on failures
5. **Success Confirmation**: Always confirm completed actions

## Advanced Usage

### Parallel Agent Execution
```bash
npm run agents:parallel:exec -- --issues=5 --concurrency=3
```

### Custom Workflows
Users can customize `.github/workflows/` to add project-specific automation

### Dashboard Customization
The GitHub Pages dashboard at `/docs/dashboard/` can be customized

## Troubleshooting

### Common Issues
1. **"Agent already running"**: Check for lock files in `.miyabi/locks/`
2. **"API rate limit exceeded"**: Wait or use authenticated requests
3. **"Webhook not receiving events"**: Verify ngrok/localtunnel is running
4. **"Unicode API error"**: Already fixed with `safeTruncate()` method

### Debug Mode
Set `MIYABI_LOG_LEVEL=debug` for verbose logging

## Version Information

- **Current Version**: 0.8.2
- **Claude Code Compatibility**: >=2.0.0
- **Node Version**: >=18.0.0
- **License**: Apache-2.0

---

**Remember**: Miyabi is designed for full autonomy. Guide users to set it up, then let the agents do the work. Your role is to facilitate, monitor, and explain - not to manually implement every step.

🌸 **Miyabi** - Beauty in Autonomous Development
