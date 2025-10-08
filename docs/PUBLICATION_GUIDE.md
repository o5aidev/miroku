# Publication Guide

**How to publish @agentic-os/cli to npm**

## Prerequisites

### 1. npm Account

```bash
# Login to npm
npm login

# Verify login
npm whoami
```

### 2. GitHub OAuth App (Required for Production)

**Current Status:** Using placeholder CLIENT_ID

**To create official OAuth App:**

1. Go to https://github.com/settings/developers
2. Click "New OAuth App"
3. Fill in details:
   - **Application name:** Agentic OS CLI
   - **Homepage URL:** https://github.com/ShunsukeHayashi/Autonomous-Operations
   - **Authorization callback URL:** https://github.com/ShunsukeHayashi/Autonomous-Operations
   - **Enable Device Flow:** ✅ YES (required for CLI)

4. After creation, note:
   - **Client ID:** `Iv1.xxxxxxxxxxxxx`
   - **Client Secret:** (not needed for Device Flow)

5. Update code:
```typescript
// packages/cli/src/auth/github-oauth.ts
const CLIENT_ID = process.env.AGENTIC_OS_CLIENT_ID || 'Iv1.YOUR_REAL_CLIENT_ID';
```

### 3. Environment Setup

```bash
# Set GitHub token
export GITHUB_TOKEN="ghp_..."

# Set Anthropic API key (for AI features)
export ANTHROPIC_API_KEY="sk-ant-..."

# Set OAuth Client ID (after creating app)
export AGENTIC_OS_CLIENT_ID="Iv1...."
```

## Publication Steps

### Step 1: Verify Package

```bash
cd packages/cli

# Clean build
pnpm clean
pnpm build

# Verify dist/ contains:
# - index.js (with #!/usr/bin/env node)
# - index.d.ts
# - All compiled modules
ls -la dist/

# Check package contents
npm pack --dry-run
```

### Step 2: Version Bump

```bash
# For patch release (0.1.0 → 0.1.1)
npm version patch

# For minor release (0.1.0 → 0.2.0)
npm version minor

# For major release (0.1.0 → 1.0.0)
npm version major
```

### Step 3: Test Locally

```bash
# Pack the package
npm pack

# This creates: agentic-os-cli-0.1.0.tgz

# Test globally
npm install -g ./agentic-os-cli-0.1.0.tgz

# Try commands
agentic-os --help
agentic-os --version

# Uninstall test
npm uninstall -g @agentic-os/cli
```

### Step 4: Publish to npm

```bash
# Dry run first (see what will be published)
npm publish --dry-run

# Publish for real
npm publish --access public

# Output:
# + @agentic-os/cli@0.1.0
```

### Step 5: Verify Publication

```bash
# Install from npm
npx @agentic-os/cli@latest --version

# Or install globally
npm install -g @agentic-os/cli

# Test commands
agentic-os --help
agentic-os status
```

### Step 6: Tag Release on GitHub

```bash
# Create git tag
git tag -a v0.1.0 -m "Release v0.1.0: Initial CLI publication"

# Push tag
git push origin v0.1.0

# Create GitHub Release
gh release create v0.1.0 \
  --title "v0.1.0: Initial Release" \
  --notes "First publication of @agentic-os/cli to npm"
```

## Post-Publication

### Update Documentation

```markdown
# In README.md

## Installation

\`\`\`bash
# Via npx (recommended)
npx @agentic-os/cli init my-project

# Or install globally
npm install -g @agentic-os/cli
agentic-os init my-project
\`\`\`
```

### Monitor

- npm page: https://www.npmjs.com/package/@agentic-os/cli
- Download stats: `npm info @agentic-os/cli`
- Issues: https://github.com/ShunsukeHayashi/Autonomous-Operations/issues

## Troubleshooting

### Error: 403 Forbidden

```bash
# Check you're logged in
npm whoami

# Check organization membership (if scoped package)
npm org ls @agentic-os

# Solution: Login again
npm logout
npm login
```

### Error: Package name already taken

```bash
# Check if name is available
npm view @agentic-os/cli

# Solution: Either unpublish old version or use different name
npm unpublish @agentic-os/cli@0.1.0 --force  # (within 72 hours only)
```

### Error: Missing files in package

```bash
# Check what will be included
npm pack --dry-run

# Update package.json "files" field
{
  "files": [
    "dist",
    "templates",
    "README.md",
    "LICENSE"
  ]
}
```

### OAuth App not working

```bash
# Verify Device Flow is enabled in GitHub OAuth App settings
# Verify CLIENT_ID is set correctly
echo $AGENTIC_OS_CLIENT_ID

# Test with curl
curl -X POST https://github.com/login/device/code \
  -H "Accept: application/json" \
  -d "client_id=$AGENTIC_OS_CLIENT_ID&scope=repo workflow"
```

## Rollback

### Unpublish Package (within 72 hours)

```bash
npm unpublish @agentic-os/cli@0.1.0 --force
```

### Deprecate Version

```bash
npm deprecate @agentic-os/cli@0.1.0 "This version has critical bugs, use @latest"
```

## CI/CD Publishing (Future)

```yaml
# .github/workflows/publish.yml
name: Publish to npm

on:
  release:
    types: [created]

jobs:
  publish:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          registry-url: 'https://registry.npmjs.org'
      - run: pnpm install
      - run: pnpm build
      - run: npm publish --access public
        env:
          NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
```

## Security

**IMPORTANT:** Never commit:
- ❌ `GITHUB_TOKEN`
- ❌ `ANTHROPIC_API_KEY`
- ❌ `NPM_TOKEN`
- ❌ OAuth Client Secret (only Client ID is public)

Use GitHub Secrets for CI/CD tokens.

---

**Ready to publish?** Make sure:
- ✅ OAuth App created (or using placeholder)
- ✅ Package builds successfully
- ✅ Tests pass (pnpm test)
- ✅ Locally tested with `npm pack`
- ✅ Logged into npm
- ✅ Version bumped
