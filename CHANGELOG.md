# Changelog

All notable changes to Miyabi will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.9.0] - 2025-10-14

### Added

**HeroUIAgent - 9th Coding Agent**
- New specialized agent for HeroUI component development
- Component generation, integration, and theme customization
- Character name: ひーろー (Hero) - 🟢実行役
- Spec: `.claude/agents/specs/coding/heroui-agent.md`
- Prompt: `.claude/agents/prompts/coding/heroui-agent-prompt.md`
- Parallel execution capable with other execution agents

**UI/UX Debugging Integration**
- Chrome DevTools Protocol MCP server integration
- `chrome-devtools-mcp` added to `.claude/mcp.json` (disabled by default)
- Browser automation support for Claude Code
- Alternative to dev3000 MCP orchestrator

**Comprehensive dev3000 Documentation**
- `docs/DEV3000_FINAL_STATUS.md` - Complete integration guide and recommendations
- `docs/DEV3000_TEST_REPORT.md` - Detailed test results and findings
- `docs/DEV3000_INTEGRATION_SUMMARY.md` - Technical analysis
- `docs/DEV3000_MCP_INTEGRATION.md` - Architecture and setup guide
- `.claude/mcp-servers/dev3000-proxy.cjs` - HTTP-to-stdio bridge (reference)

**Agent System Updates**
- Total agent count: 23 (9 Coding + 14 Business)
- Updated character mapping with ひーろー
- Enhanced parallel execution rules documentation
- Office metaphor extended with UI component development staff

### Changed

**MCP Configuration**
- Replaced dev3000 MCP orchestrator with chrome-devtools-mcp
- Direct MCP tool integration for browser debugging
- Improved compatibility with Claude Code's stdio-based MCP system

**Documentation**
- `CLAUDE.md` updated with 9 Coding Agents (added HeroUIAgent)
- Agent character count updated to 23 across all documentation
- Enhanced UI/UX debugging workflow recommendations

### Technical Improvements

**Architecture Discovery**
- Identified dev3000 as MCP orchestrator (not direct MCP server)
- Documented incompatibility with Claude Code's architecture
- Validated chrome-devtools-mcp as working alternative
- HTTP/SSE vs stdio transport protocol analysis

**Testing & Validation**
- Tested multiple MCP endpoints (/mcp, /api/mcp, /api/tools, /api/orchestrator)
- Validated chrome-devtools-mcp stdio integration
- Created comprehensive test scripts and logs
- Documented all findings for future reference

### Recommendations

**For UI/UX Debugging:**
1. **Automated workflows**: Use `chrome-devtools-mcp` with Claude Code
2. **Manual debugging**: Use `dev3000` standalone mode (web UI at localhost:3684)
3. **Combined approach**: Both tools complement each other

**Setup Instructions:**
```bash
# Chrome DevTools MCP
/Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome \
  --remote-debugging-port=9222 \
  --user-data-dir=/tmp/chrome-debug

# dev3000 Standalone
cd packages/dashboard && dev3000
# Access: http://localhost:3684
```

## [0.8.2] - 2025-10-10

### Added

**Claude Code Plugin Integration (Complete)**
- `.claude-plugin/` directory with complete Plugin structure
- 8 Slash Commands for Claude Code:
  - `/miyabi-init` - 新規プロジェクト作成（53ラベル、26ワークフロー自動セットアップ）
  - `/miyabi-status` - ステータス確認（リアルタイムIssue/PR状態表示）
  - `/miyabi-auto` - Water Spider自動モード（Issue自動処理）
  - `/miyabi-todos` - TODO検出→Issue化（コード内TODO自動検出）
  - `/miyabi-agent` - Agent実行（7つのAgentから選択実行）
  - `/miyabi-docs` - ドキュメント生成（README/API/Architecture docs）
  - `/miyabi-deploy` - デプロイ実行（staging/production デプロイ）
  - `/miyabi-test` - テスト実行（unit/integration/e2e テスト）
- 7 Autonomous Agents definitions
- 4 Event Hooks (Plugin限定機能):
  - `pre-commit` - コミット前チェック（Lint + Type check + Test）
  - `post-commit` - コミット後処理（コミット情報表示、メトリクス更新）
  - `pre-pr` - PR作成前検証（Rebase確認、Test、Coverage、Conventional Commits検証）
  - `post-test` - テスト後処理（カバレッジレポート生成、HTML出力、アーカイブ）

**MCP Tool Extensions**
- 3 new MCP tools added to `.claude/mcp-servers/miyabi-integration.js`:
  - `miyabi__docs` - ドキュメント自動生成（type/format/output パラメータ）
  - `miyabi__deploy` - デプロイ実行（environment/skip-tests/force パラメータ）
  - `miyabi__test` - テスト実行（type/coverage/watch パラメータ）
- Total 11 MCP tools available (8 existing + 3 new)

**Plugin Documentation**
- `.claude-plugin/README.md` - 完全なPlugin説明書（350+ lines）
- Quick start guide with installation instructions
- Comprehensive command reference
- Agent descriptions and workflow diagrams
- Performance metrics and KPI
- 53-label system explanation
- Security features documentation
- Requirements and license information

**Hook Scripts Validation**
- All 4 hook scripts (`pre-commit.sh`, `post-commit.sh`, `pre-pr.sh`, `post-test.sh`) syntax validated
- Executable permissions verified (755)
- Ready for Claude Code Plugin system execution

### Changed
- README.md updated with Claude Code Plugin installation section (Japanese + English)
- README.md updated with Event Hooks documentation
- Plugin structure follows official Claude Code Plugin specification
- `plugin.json` metadata complete with all references
- `marketplace.json` configured for marketplace distribution

### Documentation
- Added "方法4: Claude Code Plugin" installation option to README
- Added comprehensive Hooks section with detailed feature table
- Created standalone Plugin README for marketplace
- All documentation bilingual (Japanese + English)

### Technical Improvements
- MCP tool extensions follow existing pattern and structure
- Hooks leverage existing npm scripts for consistency
- Plugin configuration references relative paths for portability
- All changes backward compatible with existing CLI functionality

## [0.8.0] - 2025-10-10

### Changed

**License Update (Breaking Change)**
- ⚠️ **License changed from MIT to Apache License 2.0**
- Added trademark protection for "Miyabi" brand
- Added patent protection for innovations
- Added NOTICE file with attribution requirements
- Modified versions must clearly indicate changes
- Stronger protection for original author's rights
- **Migration Note**: Existing users under MIT license can continue under MIT, but new versions use Apache 2.0

**Documentation Improvements**
- README.md now bilingual (Japanese + English)
- Added English version section with complete feature documentation
- Updated all license references to Apache-2.0
- Fixed broken documentation links (removed 3 non-existent files)
- Corrected template paths (.github/ instead of templates/)
- Added author contact information (X/Twitter, Patreon, GitHub Sponsors)
- Version information updated to v0.8.0
- Repository URL corrected to `ShunsukeHayashi/Autonomous-Operations`

### Added

**Non-Interactive Mode Support (#43 P0)**
- `--non-interactive` flag for CI/CD and Termux environments
- `--yes` / `-y` flag for quick approval
- `MIYABI_AUTO_APPROVE` environment variable support
- Automatic detection of CI environments (`CI=true`)
- Automatic detection of non-TTY terminals (pipes, redirects, SSH)
- `install` and `setup` commands now support non-interactive mode

**GitHub CLI Auto-Integration (#43 P1)**
- Automatic token retrieval from `gh auth token`
- Token priority: gh CLI → GITHUB_TOKEN → .env file → OAuth
- No manual `GITHUB_TOKEN` setup required if gh CLI is authenticated
- `isGhCliAuthenticated()` helper function
- Enhanced error messages with clear authentication instructions

**New Utilities**
- `src/utils/interactive.ts` - Non-interactive mode detection and helpers
  - `isNonInteractive()` - Detect non-interactive environments
  - `promptOrDefault()` - Prompt wrapper with fallback
  - `confirmOrDefault()` - Confirmation with default value
- `src/utils/github-token.ts` - GitHub token management
  - `getGitHubToken()` - Async token retrieval with fallback
  - `getGitHubTokenSync()` - Sync version
  - `isGhCliAuthenticated()` - Check gh CLI status
  - `isValidTokenFormat()` - Token validation
  - Automatic `.env` file reading

### Changed
- `install` command now tries automatic token retrieval before OAuth
- `setup` command fully supports non-interactive mode
- Authentication flow enhanced with multiple fallback options
- CLI flags added to command help output

### Documentation
- README updated with non-interactive mode examples
- GitHub CLI authentication guide added
- CI/CD usage examples (GitHub Actions, Termux)
- Token priority explanation
- Troubleshooting section enhanced

### Technical Improvements
- TypeScript strict mode compliance maintained
- All builds passing successfully
- Enhanced user experience for CI/CD environments
- Better error messages with actionable instructions

## [0.7.0] - 2025-10-10

### Added

**Miyabi CLI Integration with Claude Code**
- `miyabi-auto` slash command - Autonomous Water Spider mode from Claude Code
- `miyabi-todos` slash command - TODO comment detection and Issue creation
- `miyabi-agent` slash command - Direct agent execution
- `miyabi-init` slash command - Project initialization wizard
- `miyabi-status` slash command - Real-time system status monitoring

**MCP Server Integration**
- `miyabi-integration.js` - Model Context Protocol server for Miyabi coordination
- Seamless integration with Claude Code MCP architecture
- Enhanced context sharing between agents and Claude Code
- `.claude/` directory templates with all integrations pre-configured

**Claude Code Templates**
- Complete `.claude/` configuration templates
- 7 agent definitions (CoordinatorAgent, CodeGenAgent, ReviewAgent, IssueAgent, PRAgent, DeploymentAgent, Mizusumashi)
- 8 slash commands ready to use
- 4 MCP servers (miyabi-integration, github-enhanced, ide-integration, project-context)
- Updated README with Miyabi integration guide

**GitHub API Retry Logic (#41)**
- Exponential backoff retry mechanism for all GitHub API calls
- Automatic retry on transient failures (rate limits, 5xx errors, network timeouts)
- Configurable retry parameters (default: 3 retries, 1s-4s backoff)
- Smart error classification (retryable vs non-retryable)
- Implemented across all critical endpoints:
  - IssueAgent: `issues.get`, `issues.addLabels`, `issues.addAssignees`, `issues.createComment`
  - PRAgent: `pulls.create`, `issues.addLabels`, `pulls.requestReviewers`
  - GitHubProjectsClient: GraphQL queries/mutations, rate limit checks
  - SDK GitHubClient: All fetch-based API calls
- Comprehensive unit tests (42 test cases, 100% pass rate)
- Exponential backoff with randomized jitter to prevent thundering herd

### Changed
- Enhanced `auto.ts` command with improved parallel processing support
- Updated package templates to include Claude Code integration
- Improved documentation with Miyabi + Claude Code usage examples

### Technical Improvements
- `p-retry` library integration for robust retry logic
- `withRetry` wrapper function for consistent API resilience
- `shouldRetry` error classification for intelligent retry decisions
- Performance impact: <5% overhead on successful requests
- Retry success rate: >90% within 3 attempts for transient errors
- MCP protocol implementation for agent coordination

## [0.6.0] - 2025-10-09

### Added

**Agent CLI Mode**
- `miyabi agent run <agent-name>` - Execute specific agents (coordinator, codegen, review, issue, pr, deploy, mizusumashi)
- `miyabi agent list` - Display all available agents with descriptions
- `miyabi agent status [agent-name]` - Check agent execution status
- 7 autonomous agent types with clear responsibility boundaries
- CLI table display for better readability

**Water Spider Auto Mode (ウォータースパイダー)**
- `miyabi auto` - Fully autonomous monitoring and execution mode
- Inspired by Toyota Production System's Water Spider concept
- Continuous system state monitoring with configurable intervals
- Autonomous decision making and agent execution
- TODO comment scanning integration with `--scan-todos` option
- Configurable options:
  - `--interval <seconds>` - Monitoring interval (default: 10s)
  - `--max-duration <minutes>` - Maximum execution time (default: 60min)
  - `--concurrency <number>` - Parallel execution count (default: 1)
  - `--dry-run` - Simulation mode
  - `--verbose` - Detailed logging

**Todos Auto Mode**
- `miyabi todos` - Automatic TODO/FIXME/HACK/NOTE comment detection
- Recursive directory scanning with configurable path
- Multiple comment format support (// /* #)
- Priority-based sorting (FIXME > TODO > HACK > NOTE)
- GitHub Issue auto-conversion with `--create-issues`
- Agent auto-execution with `--auto-execute`
- Excluded directories: node_modules, .git, dist, build, coverage
- Supported extensions: .ts, .tsx, .js, .jsx, .py, .go, .rs, .java, .c, .cpp, .h, .hpp, .md, .yaml, .yml

**Mizusumashi (水澄) - Super App Designer Agent**
- YAML-based app definition generation
- Self-repair function for error recovery
- Autonomous screen and component generation
- No user interaction required (fully autonomous)
- Integration with Water Spider auto mode

**Prompt Management System**
- `.ai/prompts/` directory structure
- YAML frontmatter with codex_prompt_chain format
- Prompt templates for agents, commands, and integrations
- Version control and quality criteria
- Comprehensive README for prompt management

### Changed
- Enhanced Claude Code environment detection
- Improved CLI help messages with new commands
- Updated command registration in main index.ts

### Technical Improvements
- Agent type system with TypeScript const assertions
- Decision-making algorithm for autonomous execution
- Self-repair circuit implementation
- Spinner and progress indicators with ora
- CLI table rendering with cli-table3

## [0.5.0] - 2025-10-09

### Added

**Security Enhancements**
- GitHub token helper utility (`scripts/github-token-helper.ts`)
- Priority-based token retrieval: gh CLI > environment variable
- Token format validation (ghp_, github_pat_ prefixes)
- Automatic detection of gh CLI authentication status
- CLI mode for Claude Code environment
- Enhanced environment detection (CLAUDE_CODE, ANTHROPIC_CLI, TERM_PROGRAM)
- Interactive terminal detection

**Documentation**
- Comprehensive Termux environment guide (`docs/TERMUX_GUIDE.md`)
- Installation instructions for Android/Termux
- 5 known issues with detailed workarounds
- Performance optimization tips for mobile devices
- Battery and network best practices
- Troubleshooting guide and FAQ

**Development Tools**
- `getGitHubTokenSync()` - Synchronous token retrieval
- `isGhCliAuthenticated()` - Check gh CLI status
- `isValidTokenFormat()` - Token validation helper

### Changed

**Security**
- **BREAKING**: `parallel-executor.ts` now prioritizes gh CLI authentication
- `.env.example` updated with security warnings (token storage discouraged)
- `README.md` authentication section rewritten with best practices
- `SECURITY.md` expanded with token management guidelines

**Documentation**
- Added Termux guide link to main README
- Updated environment variable documentation
- Enhanced security best practices section

### Fixed
- Termux locale warning documented with workaround
- Git credential helper conflicts documented
- Interactive mode limitations clarified for Termux

### Security
- ⚠️ **Deprecation Notice**: Storing GITHUB_TOKEN in `.env` files is no longer recommended
- ✅ **Recommended**: Use `gh auth login` for secure authentication
- ✅ Environment variable fallback maintained for CI/CD compatibility

## [0.4.4] - 2025-10-08

### Fixed
- **Dynamic version loading**: Read version from package.json at runtime instead of hardcoded string
- Prevents version mismatch between package.json and CLI output

### Changed
- CLI version display now uses `packageJson.version` from dynamic import

## [0.4.3] - 2025-10-08

### Fixed
- **ES module compatibility**: Convert postinstall.js to ES modules syntax
- Fixed import statements for better module resolution
- Improved compatibility with modern Node.js environments

## [0.4.2] - 2025-10-08

### Added
- **Claude Code auto-deployment**: Deploy .claude/ directory and CLAUDE.md directly to GitHub repository
- Automatic setup of Claude Code configuration in new repositories
- 6 AI agents, 7 commands, 3 MCP servers included in templates

### Fixed
- Remove non-existent @agentic-os/core dependency (#33)
- Resolve TypeScript compilation errors (7 errors)

## [0.4.1] - 2025-10-08

### Fixed
- **TypeScript compilation**: Resolve 7 compilation errors
- Additional unused variable cleanup
- Type safety improvements

### Documentation
- Update README with v0.4.0 features

## [0.4.0] - 2025-10-08

### Added

**AI-Powered Documentation Generator**
- `docs` command - AI-powered TypeScript/JavaScript documentation generation
- Watch mode - Automatic documentation updates on file changes
- Training materials generation for AI agents
- Interactive documentation generation prompts

**Auto-Issue Reporting System**
- Automatic issue creation to Miyabi repository when errors occur
- Context gathering (environment info, project state, user intent)
- Duplicate issue detection to prevent spam
- Error-specific troubleshooting guides (authentication, repository, git, network errors)

**New Packages**
- `@miyabi/doc-generator` - TypeScript/JavaScript documentation generation library
- `@miyabi/miyabi-agent-sdk` - Agent development SDK (BaseAgent, AgentContext, types)

**Post-install Auto-Setup**
- Environment detection (Node.js, Git, GITHUB_TOKEN)
- Project type detection (new vs existing)
- Context-aware next steps guidance
- `.miyabi-initialized` marker to prevent duplicate runs

### Fixed

**TypeScript Compilation (24 errors resolved)**
- Removed duplicate export declarations (knowledge-base-sync.ts, workflow-orchestrator.ts)
- Removed unused variables or prefixed with underscore (lock-manager.ts, task-orchestrator.ts, projects-v2.ts)
- Added type assertions (generate-realtime-metrics.ts)
- Prefixed unused parameters with underscore (workflow-orchestrator.ts - 4 occurrences)
- Build now succeeds with 0 errors

**Docker Support**
- Multi-stage Dockerfile with Node.js 20 Alpine
- .dockerignore for build context optimization
- Non-root user execution for security

### Changed
- **BREAKING**: Renamed from "Agentic OS" to "Miyabi" ✨
- **BREAKING**: Package name changed from `@agentic-os/cli` to `miyabi`
- **BREAKING**: Command changed from `agentic-os` to `miyabi`
- Simplified to single command interface (interactive menu)
- Full Japanese UI support
- Single command: `npx miyabi` for everything
- CLI version updated to v0.4.0
- Test files excluded from TypeScript build
- ESM module syntax unified across all scripts
- Enhanced type safety with strict mode compliance

### Documentation
- Updated command reference for `miyabi docs`
- Added auto-issue reporting documentation to FOR_NON_PROGRAMMERS.md
- CLAUDE.md updated with documentation generation context
- 7 AI agents description (added CoordinatorAgent)

### Technical Improvements
- TypeScript strict mode: 100% compliance (0 errors)
- CI/CD: Docker build support added
- Build optimization: dist/ size reduced by excluding test files
- Code quality: All unused variables and parameters addressed

## [0.1.0] - 2025-10-08

### Added

**CLI Package (@agentic-os/cli)**
- `init` command - Create new project with full automation setup
- `install` command - Add Agentic OS to existing project
- `status` command - Monitor agent activity and progress
- GitHub OAuth Device Flow authentication
- Automatic repository creation
- 53-label state machine system
- 10+ GitHub Actions workflows
- Projects V2 integration
- Multi-language detection (JS/TS, Python, Go, Rust, Java, Ruby, PHP)
- Framework detection (Next.js, React, Vue, Django, Flask, FastAPI)
- Build tool detection (Vite, Webpack, Rollup)
- Package manager detection (pnpm, yarn, npm)

**Automation**
- AI-powered auto-labeling using Claude 3.5 Sonnet
- Commit-to-Issue automation (`#auto` tag)
- PR comment automation (`@agentic-os` commands)
- Webhook event routing
- State machine workflows

**Documentation**
- README reduced by 93% (1,273 → 86 lines)
- GETTING_STARTED reduced by 83% (549 → 95 lines)
- CLI_USAGE_EXAMPLES with 10 real-world examples
- PUBLICATION_GUIDE for npm publishing
- AGENT_OPERATIONS_MANUAL for system architecture

**Testing**
- 65 unit tests across 5 test files
- 83.78% code coverage (exceeds 80% target)
- Vitest test runner with v8 coverage
- Fast test execution (<500ms)

### Fixed
- TypeScript strict mode compliance
- ESM module resolution
- OAuth token persistence in .env
- Label color code stripping

### Changed
- Zero-learning-cost philosophy implemented
- Documentation drastically simplified
- CLI made the primary interface
- Removed manual configuration requirements

## [0.0.1] - 2025-10-06

### Added
- Initial repository structure
- Base agent architecture
- GitHub label definitions (53 labels across 10 categories)
- System architecture documentation

---

## Release Notes

### v0.1.0 - Initial Public Release

This is the first public release of Agentic OS, implementing the **Zero-Learning-Cost Framework** (#19).

**Key Achievements:**
- ✅ One-command setup: `npx agentic-os init my-project`
- ✅ Fully automated Issue → PR pipeline
- ✅ AI-powered labeling (no manual work)
- ✅ 6 autonomous agents
- ✅ 83.78% test coverage
- ✅ Comprehensive documentation

**What's Next (v0.2.0):**
- Real GitHub OAuth App (replace placeholder)
- Enhanced error handling and retry logic
- Agent performance metrics
- Cost tracking and optimization
- Multi-repository support
- Team collaboration features

**Breaking Changes:**
None (initial release)

**Known Issues:**
- OAuth CLIENT_ID is placeholder (requires manual setup for production)
- CI/CD workflows show failures (non-blocking)
- Coverage excludes some integration points

**Migration Guide:**
N/A (initial release)

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 0.4.4 | 2025-10-08 | Dynamic version loading from package.json |
| 0.4.3 | 2025-10-08 | ES module compatibility for postinstall.js |
| 0.4.2 | 2025-10-08 | Claude Code auto-deployment, dependency fixes |
| 0.4.1 | 2025-10-08 | TypeScript compilation fixes (7 errors) |
| 0.4.0 | 2025-10-08 | AI-Powered Documentation, Auto-Issue Reporting, TypeScript fixes (24 errors), Docker support |
| 0.1.0 | 2025-10-08 | Initial public release |
| 0.0.1 | 2025-10-06 | Internal development |

---

## Links

- [GitHub Repository](https://github.com/ShunsukeHayashi/Autonomous-Operations)
- [npm Package](https://www.npmjs.com/package/@agentic-os/cli)
- [Documentation](https://github.com/ShunsukeHayashi/Autonomous-Operations/tree/main/docs)
- [Issues](https://github.com/ShunsukeHayashi/Autonomous-Operations/issues)
- [Pull Requests](https://github.com/ShunsukeHayashi/Autonomous-Operations/pulls)

---

**Powered by Claude AI**
