# Multi-Language Support Guide

**Version:** 1.0.0
**Last Updated:** 2025-10-12
**Status:** Beta

---

## Overview

This guide explains how to adapt Miyabi for different programming languages and frameworks. While Miyabi is currently optimized for TypeScript/Node.js, its architecture is language-agnostic by design.

**Core Philosophy:**
> "The 53-label system and agent orchestration work with any language.
> Only the execution layer (workflows, commands) needs adaptation."

---

## Architecture: Language-Independent Layers

### Layer 1: Label System (✅ Language-Agnostic)

**No changes needed** - The 53-label taxonomy is universal:

```yaml
# Works with any language
STATE:
  - 📥 state:pending
  - 🔍 state:analyzing
  - 🏗️ state:implementing
  - 👀 state:reviewing
  - ✅ state:done

AGENT:
  - 🤖 agent:coordinator
  - 🤖 agent:codegen
  - 🤖 agent:review
  - 🤖 agent:deploy
```

These states represent **what** is happening, not **how**.

### Layer 2: Agent Roles (✅ Language-Agnostic)

**No changes needed** - Agent responsibilities are universal:

| Agent | Role | Language-Specific? |
|-------|------|-------------------|
| CoordinatorAgent | Task orchestration, DAG construction | ❌ No |
| IssueAgent | Issue analysis, labeling | ❌ No |
| CodeGenAgent | Code generation | ⚠️ Yes (prompts) |
| ReviewAgent | Quality assurance | ⚠️ Yes (tools) |
| PRAgent | Pull request automation | ❌ No |
| DeploymentAgent | CI/CD deployment | ⚠️ Yes (workflows) |

### Layer 3: Execution Layer (⚠️ Language-Specific)

**Requires adaptation** - Command execution varies by language:

```typescript
// TypeScript/Node.js
npm install
npm test
npm run build
tsc --noEmit

// Python
pip install -r requirements.txt
pytest
python -m build
mypy .

// Go
go mod download
go test ./...
go build
go vet

// Rust
cargo build
cargo test
cargo clippy
cargo build --release
```

---

## Step-by-Step Adaptation Process

### Phase 1: Understand Current Implementation

**Before adapting, read:**

1. `.github/workflows/*.yml` - GitHub Actions workflows
2. `.claude/commands/*.md` - Custom Claude Code commands
3. `.claude/agents/prompts/coding/*.md` - Agent execution prompts
4. `package.json` scripts - Build/test/deploy commands

**Key files for TypeScript/Node.js:**
- `autonomous-agent.yml` - Agent execution workflow
- `deploy-pages.yml` - Deployment workflow
- `.claude/commands/test.md` - Test execution
- `.claude/commands/deploy.md` - Deployment command

### Phase 2: Create Language Mapping

Create a mapping document for your target language:

**Example: TypeScript → Python mapping**

| Component | TypeScript | Python | Notes |
|-----------|-----------|---------|-------|
| Package Manager | npm | pip/poetry | Choose one |
| Install | `npm install` | `pip install -r requirements.txt` | |
| Test Runner | Vitest | pytest | |
| Test Command | `npm test` | `pytest` | |
| Type Checker | tsc | mypy | |
| Linter | ESLint | ruff/pylint | |
| Formatter | Prettier | black | |
| Build | `npm run build` | `python -m build` | |
| Runtime | Node.js ≥18 | Python ≥3.11 | |

### Phase 3: Use Claude Code for Adaptation

**Recommended Approach:**

1. Install Miyabi with default (TypeScript) templates
2. Use Claude Code to adapt all language-specific files
3. Test adapted workflows
4. Document language-specific setup

**Prompt Template:**

```
.claude/commands と .claude/agents について、
元の指示の意図を変えずに、<言語>と<フレームワーク>用に書き換えてください。

以下を変更:
- <package-manager> → <new-package-manager>
- <language> → <new-language>
- <test-runner> → <new-test-runner>
- <type-checker> → <new-type-checker>
- <runtime> → <new-runtime>

また、.github/workflows/ 内のワークフローファイルも同様に書き換えてください。

重要: ワークフローの目的（what）は変えず、実行方法（how）のみ変更してください。
```

### Phase 4: Workflow Adaptation

**Files to adapt in `.github/workflows/`:**

#### 1. `autonomous-agent.yml` (High Priority)

**TypeScript version:**
```yaml
- name: Install dependencies
  run: npm ci

- name: Run typecheck
  run: npm run typecheck

- name: Execute agent
  run: npm run agents:parallel:exec -- --issues=${{ github.event.issue.number }}
```

**Python version:**
```yaml
- name: Install dependencies
  run: |
    pip install --upgrade pip
    pip install -r requirements.txt

- name: Run type check
  run: mypy .

- name: Execute agent
  run: python -m agents.parallel_exec --issues=${{ github.event.issue.number }}
```

#### 2. `deploy-pages.yml` (Medium Priority)

**TypeScript version:**
```yaml
- name: Build
  run: npm run build

- name: Deploy to GitHub Pages
  uses: peaceiris/actions-gh-pages@v3
  with:
    github_token: ${{ secrets.GITHUB_TOKEN }}
    publish_dir: ./dist
```

**Python version:**
```yaml
- name: Build
  run: |
    pip install mkdocs-material
    mkdocs build

- name: Deploy to GitHub Pages
  uses: peaceiris/actions-gh-pages@v3
  with:
    github_token: ${{ secrets.GITHUB_TOKEN }}
    publish_dir: ./site
```

#### 3. `weekly-report.yml` (Low Priority)

**TypeScript version:**
```yaml
- name: Generate report
  run: npm run report:weekly
```

**Python version:**
```yaml
- name: Generate report
  run: python scripts/weekly_report.py
```

### Phase 5: Command Adaptation

**Files to adapt in `.claude/commands/`:**

#### Example: `test.md`

**Before (TypeScript):**
```markdown
# Test Command

プロジェクト全体のテストを実行

## 実行コマンド

\`\`\`bash
npm test
npm run test:coverage
\`\`\`

## チェック項目

- [ ] すべてのテストがパス
- [ ] カバレッジ 80%+ (statements, lines)
- [ ] 型チェック通過 (tsc --noEmit)
```

**After (Python):**
```markdown
# Test Command

プロジェクト全体のテストを実行

## 実行コマンド

\`\`\`bash
pytest
pytest --cov=. --cov-report=term-missing
\`\`\`

## チェック項目

- [ ] すべてのテストがパス
- [ ] カバレッジ 80%+ (statements, lines)
- [ ] 型チェック通過 (mypy .)
```

### Phase 6: Agent Prompt Adaptation

**Files to adapt in `.claude/agents/prompts/coding/`:**

#### Example: `codegen-agent-prompt.md`

**Section to update:**

```markdown
## コーディング規約

### TypeScript Strict Mode (変更前)
- strict: true
- noImplicitAny: true
- strictNullChecks: true
- ESM形式（import/export）

### Python Type Hints (変更後)
- Type hints必須 (PEP 484)
- mypy strict mode
- dataclasses推奨
- absolute imports
```

### Phase 7: Testing & Validation

**Validation Checklist:**

- [ ] All workflows execute successfully
- [ ] Agent commands work in Claude Code
- [ ] Labels remain unchanged (53 labels)
- [ ] State transitions work correctly
- [ ] Issue/PR automation functional
- [ ] Deployment pipeline operational
- [ ] Documentation updated

**Test Commands:**

```bash
# Test workflow syntax
gh workflow list
gh workflow view autonomous-agent

# Test agent execution
.claude/commands/test.md

# Verify label system
gh label list

# Check Projects integration
gh project list
```

---

## Language-Specific Examples

### Python + FastAPI

**Project Structure:**
```
my-fastapi-project/
├── .github/
│   └── workflows/
│       ├── autonomous-agent.yml    # Adapted
│       ├── deploy-railway.yml      # New (Railway > Pages)
│       └── pytest-coverage.yml     # New
├── .claude/
│   ├── commands/
│   │   ├── test.md                # Adapted (pytest)
│   │   └── deploy.md              # Adapted (Railway)
│   └── agents/prompts/coding/
│       └── codegen-agent-prompt.md # Adapted (Python)
├── app/
│   ├── __init__.py
│   ├── main.py
│   └── routers/
├── tests/
├── requirements.txt
├── pyproject.toml
└── README.md
```

**Key Changes:**
- `npm` → `pip`/`poetry`
- `Vitest` → `pytest`
- `tsc` → `mypy`
- GitHub Pages → Railway/Render/Heroku

**Full prompt:**
```
.claude/commands と .claude/agents について、
元の指示の意図を変えずに、Python と FastAPI 用に書き換けてください。

言語固有の変更:
- npm → poetry
- TypeScript → Python 3.11+
- Vitest → pytest
- tsc → mypy
- ESLint → ruff
- Prettier → black
- Node.js → Python

フレームワーク固有の変更:
- Express → FastAPI
- GitHub Pages デプロイ → Railway デプロイ
- package.json scripts → pyproject.toml scripts

ワークフローファイル (.github/workflows/*.yml) も同様に書き換えてください。

重要: 以下は変更しないでください:
- 53ラベル体系 (.github/labels.yml)
- Agent役割定義 (.claude/agents/specs/coding/*.md)
- Label-based state machine logic
```

### Go + Gin

**Project Structure:**
```
my-gin-project/
├── .github/
│   └── workflows/
│       ├── autonomous-agent.yml    # Adapted
│       ├── deploy-cloud-run.yml    # New (Cloud Run)
│       └── go-test.yml             # New
├── .claude/
│   ├── commands/
│   │   ├── test.md                # Adapted (go test)
│   │   └── deploy.md              # Adapted (Cloud Run)
│   └── agents/prompts/coding/
│       └── codegen-agent-prompt.md # Adapted (Go)
├── cmd/
│   └── server/
│       └── main.go
├── internal/
├── pkg/
├── go.mod
├── go.sum
└── README.md
```

**Key Changes:**
- `npm` → `go mod`
- `Vitest` → `go test`
- `tsc` → `go build`
- ESLint → `golangci-lint`
- GitHub Pages → Google Cloud Run

**Full prompt:**
```
.claude/commands と .claude/agents について、
元の指示の意図を変えずに、Go言語とGinフレームワーク用に書き換けてください。

言語固有の変更:
- npm → go mod
- TypeScript → Go 1.21+
- Vitest → go test
- tsc → go build
- ESLint → golangci-lint
- Node.js → Go

フレームワーク固有の変更:
- Express → Gin
- GitHub Pages デプロイ → Google Cloud Run デプロイ
- package.json scripts → Makefile

ワークフローファイル (.github/workflows/*.yml) も同様に書き換えてください。

重要: 以下は変更しないでください:
- 53ラベル体系
- Agent役割定義
- Label-based state machine logic
```

### Rust + Actix

**Project Structure:**
```
my-actix-project/
├── .github/
│   └── workflows/
│       ├── autonomous-agent.yml    # Adapted
│       ├── deploy-fly-io.yml       # New (Fly.io)
│       └── cargo-test.yml          # New
├── .claude/
│   ├── commands/
│   │   ├── test.md                # Adapted (cargo test)
│   │   └── deploy.md              # Adapted (Fly.io)
│   └── agents/prompts/coding/
│       └── codegen-agent-prompt.md # Adapted (Rust)
├── src/
│   ├── main.rs
│   ├── lib.rs
│   └── routes/
├── tests/
├── Cargo.toml
├── Cargo.lock
└── README.md
```

**Key Changes:**
- `npm` → `cargo`
- `Vitest` → `cargo test`
- `tsc` → `cargo build`
- ESLint → `clippy`
- Prettier → `rustfmt`
- GitHub Pages → Fly.io

---

## Best Practices

### Do ✅

1. **Preserve workflow intentions** - Keep what workflows do, change how they do it
2. **Maintain label system** - Don't modify the 53-label taxonomy
3. **Document changes** - Update README with language-specific setup
4. **Test thoroughly** - Validate all workflows before production use
5. **Keep agent roles** - CoordinatorAgent, CodeGenAgent, etc. remain the same
6. **Use Claude Code** - Let AI handle the mechanical adaptation work

### Don't ❌

1. **Don't modify label definitions** - `.github/labels.yml` should remain unchanged
2. **Don't change agent roles** - Coordinator, CodeGen, Review, etc. are universal
3. **Don't skip testing** - Always validate adapted workflows
4. **Don't hardcode paths** - Use environment variables for language-specific paths
5. **Don't mix languages** - One project = one primary language
6. **Don't remove state transitions** - Label-based orchestration must work

---

## Troubleshooting

### Issue: Workflow fails with "command not found"

**Cause:** Language-specific command not adapted correctly

**Solution:**
```bash
# Check workflow syntax
gh workflow view autonomous-agent

# Test command locally
npm test  # TypeScript ❌
pytest    # Python ✅
```

### Issue: Agent prompts generate wrong language

**Cause:** `.claude/agents/prompts/coding/*-agent-prompt.md` not adapted

**Solution:** Update coding guidelines section in agent prompts

### Issue: Labels not working

**Cause:** Modified label definitions incorrectly

**Solution:** Restore original `.github/labels.yml` (labels are language-agnostic)

### Issue: State transitions broken

**Cause:** Modified state machine logic in workflows

**Solution:** Restore original label-based orchestration logic

---

## Contributing Templates

We welcome multi-language template contributions!

### Template Structure

```
templates/
└── languages/
    ├── python/
    │   ├── workflows/
    │   ├── commands/
    │   └── prompts/
    ├── go/
    │   ├── workflows/
    │   ├── commands/
    │   └── prompts/
    └── rust/
        ├── workflows/
        ├── commands/
        └── prompts/
```

### Contribution Checklist

- [ ] All workflows adapted and tested
- [ ] All commands adapted and documented
- [ ] Agent prompts updated with language-specific guidelines
- [ ] README with language-specific setup instructions
- [ ] Example project demonstrating integration
- [ ] CI/CD validation passing
- [ ] Label system preserved (no modifications)

### Submission Process

1. Fork repository
2. Create branch: `feat/lang-<language>-support`
3. Add templates in `templates/languages/<language>/`
4. Test with sample project
5. Update main README
6. Submit Pull Request

---

## Roadmap

### Phase 2 (v0.14+): Language-Agnostic Templates

**Goal:** Miyabi automatically detects project language and adapts

**Features:**
- Language detection from `package.json`, `requirements.txt`, `go.mod`, `Cargo.toml`
- Template selection based on detected language
- Automatic workflow adaptation
- Language-specific command suggestions

### Phase 3 (2026+): Fully Autonomous Adaptation

**Goal:** Zero manual adaptation required

**Features:**
- AI-driven language detection
- Real-time workflow generation
- Multi-language project support
- Automatic dependency resolution

---

## Support

**Questions?**
- GitHub Issues: https://github.com/ShunsukeHayashi/Miyabi/issues
- Discussions: https://github.com/ShunsukeHayashi/Miyabi/discussions
- Discord: Coming soon

**Documentation:**
- Main README: [packages/cli/README.md](../packages/cli/README.md)
- Agent Manual: [AGENT_OPERATIONS_MANUAL.md](./AGENT_OPERATIONS_MANUAL.md)
- Label Guide: [LABEL_SYSTEM_GUIDE.md](./LABEL_SYSTEM_GUIDE.md)

---

**Last Updated:** 2025-10-12
**Maintainer:** Shunsuke Hayashi
**License:** MIT
