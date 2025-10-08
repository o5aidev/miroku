# Changelog

All notable changes to Miyabi will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Changed
- **BREAKING**: Renamed from "Agentic OS" to "Miyabi" ✨
- **BREAKING**: Package name changed from `@agentic-os/cli` to `miyabi`
- **BREAKING**: Command changed from `agentic-os` to `miyabi`
- Simplified to single command interface (interactive menu)
- Full Japanese UI support
- Single command: `npx miyabi` for everything

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
