# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 2.x.x   | :white_check_mark: |
| 1.x.x   | :x:                |

## Reporting a Vulnerability

Please report security vulnerabilities via:
- GitHub Security Advisories: https://github.com/ShunsukeHayashi/Miyabi/security/advisories
- Email: security@miyabi-ai.dev

**Response Time**: Within 48 hours

## Security Best Practices

### GitHub Token Management

**Automatic Token Retrieval (v0.8.0+)**

Miyabi automatically retrieves GitHub tokens using the following priority system:

1. **gh CLI** (Recommended) - `gh auth token`
2. **Environment Variable** - `GITHUB_TOKEN`
3. **.env file** - Local development fallback
4. **OAuth Device Flow** - Interactive fallback

#### ✅ Recommended: Use gh CLI

```bash
gh auth login
```

Once authenticated, Miyabi automatically uses `gh auth token` for all operations. **No manual token management required.**

**Benefits:**
- ✅ No plaintext token storage
- ✅ Automatic token rotation by GitHub
- ✅ Centralized credential management
- ✅ Works across all Miyabi commands

#### 📋 Acceptable: Environment Variables

**For CI/CD environments only:**
```bash
# GitHub Actions
GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}

# Other CI/CD systems
export GITHUB_TOKEN=ghp_xxxxx
```

**Supported in v0.8.0:**
- `GITHUB_TOKEN` - GitHub Personal Access Token
- `MIYABI_AUTO_APPROVE=true` - Non-interactive mode
- `CI=true` - CI environment detection

#### ⚠️ Not Recommended: Storing token in .env

```bash
# Avoid storing tokens in .env files
GITHUB_TOKEN=ghp_xxxxx  # ❌ Not secure for version control
```

**Only use .env for:**
- Local development with `.env` in `.gitignore`
- Testing environments
- Never commit `.env` to version control

#### Token Priority Implementation

The `getGitHubToken()` utility (added in v0.8.0) implements the following flow:

```typescript
try {
  // 1. Try gh CLI
  token = execSync('gh auth token').trim();
  if (isValidTokenFormat(token)) return token;
} catch {}

try {
  // 2. Try environment variable
  if (process.env.GITHUB_TOKEN) return process.env.GITHUB_TOKEN;
} catch {}

try {
  // 3. Try .env file
  token = readEnvFile('.env')['GITHUB_TOKEN'];
  if (isValidTokenFormat(token)) return token;
} catch {}

// 4. Fall back to OAuth Device Flow
return await githubOAuth();
```

#### Non-Interactive Mode (v0.8.0+)

For CI/CD and automated environments:

```bash
# Auto-approve all prompts
miyabi install --yes

# Full non-interactive mode
miyabi install --non-interactive

# Environment variable
export MIYABI_AUTO_APPROVE=true
miyabi install
```

### Token Scopes

Minimum required scopes for GitHub Personal Access Token:
- `repo` - Full control of private repositories
- `workflow` - Update GitHub Action workflows
- `read:project`, `write:project` - Access projects

### .gitignore Protection

Ensure the following files are in `.gitignore`:
- `.env`
- `.env.local`
- `.env.*.local`
- `.miyabi.yml`
- `.claude/.env*`

### Secret Scanning

This repository uses:
- ✅ GitHub secret scanning
- ✅ Gitleaks integration (optional)
- ✅ Dependabot security updates

Run security audit:
```bash
npm run security:audit
npm run security:scan
```

#### Documentation Examples

Documentation files contain **example credentials** for user guidance. These are **not real secrets** and are whitelisted in `.gitleaksignore`:

**Safe patterns (examples only):**
- `ghp_xxxxxxxxxxxx` - Placeholder GitHub token
- `sk-ant-xxxxxxxxxxxx` - Placeholder Anthropic API key
- `github_pat_xxxxxxxxxxxx` - Placeholder GitHub PAT

**Whitelisted locations:**
- `.env.example` - Example configuration
- `*.md` - All documentation files
- `templates/**/*.md` - Template documentation
- `docker-compose.yml` - Development passwords

These placeholders help users understand where to place their credentials without exposing real secrets.
