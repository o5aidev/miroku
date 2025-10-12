# Repository Guidelines

## Project Structure & Module Organization
Automation agents live in `agents/`, reusable TypeScript libraries in `packages/`, and operational CLIs in `scripts/`. Service adapters (context API, MCP server) sit under `services/` and `mcp-servers/`. Documentation stays in `docs/`, compliance files remain at the root, and automated artefacts land in `tests/`, `test-results/`, and `playwright-report/`. Place media in `assets/` or feature-specific folders to keep the root clean.

## Build, Test, and Development Commands
- `npm run start`: Launch the rich CLI orchestrator for end-to-end agent workflows.
- `npm run build`: Compile TypeScript workspaces to `dist/` via the shared `tsconfig`.
- `npm run lint`: Run ESLint on `.ts`/`.tsx`; resolve findings before committing.
- `npm run typecheck`: Execute `tsc --noEmit` to enforce strict typing.
- `npm run test`: Execute the Vitest suite in `tests/` and `packages/*/tests`.
- `npm run test:e2e`: Run Playwright specs in `tests/e2e`; inspect results in `playwright-report/`.
- `npm run context:docker`: Start the context-engineering stack; shut down with `npm run context:docker:down`.

## Coding Style & Naming Conventions
Use TypeScript with ES modules, two-space indentation, and our semicolon-free style. Prefer `camelCase` for functions and variables, `PascalCase` for classes, and `kebab-case` for script filenames. Shared utilities belong in `packages/` with explicit type exports. Run `npm run lint` and `npm run typecheck` before every PR; keep imports ordered and avoid default exports except for CLI entrypoints.

## Testing Guidelines
Place tests alongside features or under `tests/` mirroring runtime paths. Name Vitest files with `.test.ts` and align describe blocks with module names. Target ≥80% coverage for new logic and add integration checks whenever modifying `services/`. For UI or workflow changes, update Playwright specs, capture fresh traces with `npm run test:e2e`, and prune obsolete files in `playwright-report/trace/`.

## Commit & Pull Request Guidelines
Follow Conventional Commits (e.g., `feat(context): add enrichment agent`) and branch as `devin/<timestamp>-<feature-name>`. Reference linked issues in the PR, summarize behavioral changes, and note new scripts or configs. Attach screenshots or CLI output for user-facing updates. Before requesting review, run `npm run lint`, `npm run typecheck`, and the relevant tests; include failure context if something remains unresolved.

## Security & Configuration Tips
Store tokens in ignored environment files (`.env`, `.env.local`) and document variables in `.ai/requirements.txt`. Use `npm run security:scan` for secret detection and `npm run security:report` for audit summaries. When operating the context stack, prefer `context:docker` profiles and stop containers before committing.
