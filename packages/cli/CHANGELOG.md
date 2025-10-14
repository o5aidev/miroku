# Changelog

All notable changes to Miyabi will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.15.0] - 2025-10-14

### Added

**HeroUIAgent - 9th Coding Agent**
- New specialized agent for HeroUI component development
- Component generation, integration, and theme customization
- Character name: ひーろー (Hero) - 🟢実行役
- Spec: `.claude/agents/specs/coding/heroui-agent.md` (647 lines)
- Prompt: `.claude/agents/prompts/coding/heroui-agent-prompt.md` (883 lines)
- Parallel execution capable with other execution agents

**UIUXAgent - 8th Coding Agent**
- Frontend UI/UX optimization with dev3000 integration
- Lighthouse performance auditing
- Accessibility validation (WCAG compliance)
- Character name: みためん (Mitamen) - 🟢実行役
- dev3000 integration for real-time UI debugging
- Performance metrics collection and reporting

**UI/UX Debugging Integration**
- Chrome DevTools Protocol MCP server integration
- `chrome-devtools-mcp` added to `.claude/mcp.json` (disabled by default)
- Browser automation support for Claude Code
- Alternative to dev3000 MCP orchestrator

**Comprehensive dev3000 Documentation**
- `docs/DEV3000_FINAL_STATUS.md` - Complete integration guide and recommendations (229 lines)
- `docs/DEV3000_TEST_REPORT.md` - Detailed test results and findings (202 lines)
- `docs/DEV3000_INTEGRATION_SUMMARY.md` - Technical analysis (209 lines)
- `docs/DEV3000_MCP_INTEGRATION.md` - Architecture and setup guide
- `.claude/mcp-servers/dev3000-proxy.cjs` - HTTP-to-stdio bridge (reference, 96 lines)

**Business Strategy Documentation**
- 8 comprehensive business plan documents (3,276 total lines):
  - `docs/business-plan/001-market-trend-report.md` (344 lines)
  - `docs/business-plan/002-competitor-analysis.md` (468 lines)
  - `docs/business-plan/003-customer-analysis.md` (517 lines)
  - `docs/business-plan/004-value-proposition.md` (328 lines)
  - `docs/business-plan/005-revenue-model.md` (362 lines)
  - `docs/business-plan/006-marketing-strategy.md` (342 lines)
  - `docs/business-plan/007-team-structure.md` (369 lines)
  - `docs/business-plan/008-funding-plan.md` (346 lines)
  - `docs/business-plan/FINAL-BUSINESS-PLAN.md` (527 lines)

**Design Philosophy**
- `docs/design/JONATHAN_IVE_DESIGN_PHILOSOPHY.md` - Jonathan Ive design principles (441 lines)
- Applied to Miyabi dashboard design
- Simplicity, clarity, and user-centered design principles

**Dashboard Enhancements**
- HeroUI component library integration
- `packages/dashboard/src/components/HeroUIDemo.tsx` - Component showcase (246 lines)
- `packages/dashboard/src/components/JonathanDesign.tsx` - Design system demo
- Dark mode support with Switch component
- Agent cards with Avatar, Badge, and Progress components

### Changed

**Agent System Updates**
- Total agent count: 23 (9 Coding + 14 Business)
- Updated character mapping with ひーろー and みためん
- Enhanced parallel execution rules documentation
- Office metaphor extended with UI component development staff

**MCP Configuration**
- Replaced dev3000 MCP orchestrator with chrome-devtools-mcp
- Direct MCP tool integration for browser debugging
- Improved compatibility with Claude Code's stdio-based MCP system

**Documentation**
- `CLAUDE.md` updated with 9 Coding Agents (added HeroUIAgent, UIUXAgent)
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

**Statistics:**
- Files changed: 33
- Lines added: 11,373
- Lines deleted: 282
- New documentation: 4,753 lines
- New agent specs: 1,530 lines

## [0.14.1] - 2025-10-14

### Fixed
- CLI `--version` command now displays correct version number
- Issue: v0.14.0 was returning 0.8.4 due to stale build cache
- Solution: Clean rebuild before npm publish

## [0.14.0] - 2025-10-14

### Added
- Initial release of v0.14.0 series
- Foundation for HeroUIAgent and UIUXAgent

## [0.4.6] - 2025-10-08

### Fixed
- **Issue #36**: Enhanced error logging for `.claude/` directory deployment
  - Added explicit error messages when templates not found
  - Added validation for empty file collection
  - Changed `spinner.warn` to `spinner.fail` for deployment errors
  - Show error stack trace in init command (first 3 lines)
  - Helps diagnose why `.claude/` deployment may fail

### Changed
- Improved error handling in `deployClaudeConfigToGitHub()`
- Better error visibility for template-related issues

## [0.4.5] - 2025-10-08

### Fixed
- **Issue #36**: Corrected `.claude/` directory deployment with POSIX path separator
  - Changed `path.join()` to `path.posix.join()` in `collectDirectoryFiles()`
  - Ensures consistent forward-slash paths for GitHub API across all platforms
  - Fixes issue where `.claude/` contents were not properly deployed to GitHub
  - Added debug logging to track file collection (shows collected file count and paths)

### Changed
- Cross-platform path handling for GitHub API interactions

## [0.4.4] - 2025-10-08

### Fixed
- Converted postinstall.js to ES modules
- Read version dynamically from package.json in postinstall script
- Fixed ESM import issues in postinstall flow

## [0.4.3] - 2025-10-08

### Added
- Comprehensive documentation files
  - `FOR_NON_PROGRAMMERS.md` - Complete guide for programming beginners
  - `INSTALL_TO_EXISTING_PROJECT.md` - Guide for adding Miyabi to existing projects
  - `EDGE_CASE_TESTS.md` - Edge case testing scenarios

### Fixed
- TypeScript compilation errors (7 errors resolved)
- Removed non-existent `@agentic-os/core` dependency (#33)

## [0.4.0] - 2025-10-08

### Added
- **Claude Code Integration**: Full `.claude/` directory deployment
  - 6 AI agents (CodeGenAgent, CoordinatorAgent, DeploymentAgent, IssueAgent, PRAgent, ReviewAgent)
  - 7 custom commands (/agent-run, /create-issue, /deploy, /generate-docs, /security-scan, /test, /verify)
  - MCP servers integration (github-enhanced, ide-integration, project-context)
  - Command hooks (log-commands.sh)
- `deployClaudeConfigToGitHub()` function for direct GitHub repository deployment
- `CLAUDE.md` template with project context

### Changed
- `miyabi init` now deploys `.claude/` configuration to GitHub before local cloning
- Enhanced setup flow with Claude Code configuration step

## [0.3.3] - 2025-10-08

### Added
- Post-install welcome flow for first-time users
- Environment checks (Node.js version, Git, GITHUB_TOKEN)
- Contextual next steps based on project status

### Changed
- Improved user onboarding experience with interactive setup guidance

## [0.1.5] - 2025-10-08

### Added
- **Sprint Management**: New `miyabi sprint start <sprint-name>` command for project sprint management
  - Interactive task planning with priorities (P0-P3) and types (feature, bug, etc.)
  - Automatic GitHub milestone creation with due dates
  - Batch issue creation linked to sprint milestone
  - Optional project structure initialization with `--init` flag
  - Dry-run mode support with `--dry-run` flag
- **Workflow Templates**: Added 13 GitHub Actions workflow templates
  - `auto-add-to-project.yml`
  - `autonomous-agent.yml`
  - `deploy-pages.yml`
  - `economic-circuit-breaker.yml`
  - `label-sync.yml`
  - `project-sync.yml`
  - `state-machine.yml`
  - `update-project-status.yml`
  - `webhook-event-router.yml`
  - `webhook-handler.yml`
  - `weekly-kpi-report.yml`
  - `weekly-report.yml`

### Fixed
- **Issue #29**: Fixed `__dirname is not defined` error in ESM context
  - Added proper ESM support in `src/setup/workflows.ts`
  - Implemented `fileURLToPath` and `import.meta.url` for path resolution
- **Missing Templates**: Fixed missing `templates/workflows/` directory
- **Error Messages**: Improved error messages with detailed path information in `src/setup/labels.ts`

### Changed
- Enhanced template path resolution with better error handling
- Updated documentation in README.md with sprint command usage examples

## [0.1.4] - 2025-10-08

### Added
- GitHub OAuth authentication with device flow
- Repository creation and setup
- Label system deployment (53 labels)
- Welcome issue creation

### Fixed
- Dynamic version loading from package.json
- TTY check for interactive mode compatibility

## [0.1.0] - 2025-10-07

### Added
- Initial release
- `init` command for new project creation
- `install` command for existing project integration
- `status` command for agent activity monitoring
- Interactive CLI mode with Japanese language support
- Zero-configuration setup philosophy
