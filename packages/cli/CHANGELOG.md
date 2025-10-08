# Changelog

All notable changes to Miyabi will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
