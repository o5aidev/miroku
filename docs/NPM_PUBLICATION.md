# NPM Publication Guide

**How to publish `agentic-os` CLI to npm registry**

## Prerequisites

1. **npm account**: https://www.npmjs.com/signup
2. **npm authentication**: `npm login`
3. **Package built**: `cd packages/cli && npm run build`

## Pre-Publication Checklist

```bash
cd packages/cli

# 1. Verify package.json
cat package.json | grep -E '"name"|"version"|"description"'

# 2. Build package
npm run build

# 3. Check dist/ output
ls -la dist/

# 4. Verify files to be published
npm pack --dry-run

# 5. Test locally
npm link
agentic-os --help
npm unlink
```

## Publication Steps

### 1. Login to npm

```bash
npm login
# Enter username, password, email
```

### 2. Publish Package

```bash
cd packages/cli

# First release (1.0.0)
npm publish --access public

# Future releases
npm version patch  # 1.0.0 → 1.0.1
npm publish

npm version minor  # 1.0.1 → 1.1.0
npm publish

npm version major  # 1.1.0 → 2.0.0
npm publish
```

### 3. Verify Publication

```bash
# Check on npm registry
open https://www.npmjs.com/package/agentic-os

# Test installation
npx agentic-os@latest --version
```

## Post-Publication

### Update README badges

Add to root README.md:

```markdown
[![NPM Version](https://img.shields.io/npm/v/agentic-os)](https://www.npmjs.com/package/agentic-os)
[![NPM Downloads](https://img.shields.io/npm/dm/agentic-os)](https://www.npmjs.com/package/agentic-os)
```

### Create GitHub Release

```bash
# Tag version
git tag v1.0.0
git push origin v1.0.0

# Create release
gh release create v1.0.0 \
  --title "v1.0.0 - Initial Release" \
  --notes "🎉 First public release of agentic-os CLI

## Features
- \`init\` command for new projects
- \`install\` command for existing projects  
- \`status\` command for agent monitoring
- Zero-learning-cost setup (5 minutes)
- Full automation via GitHub Actions

## Installation
\`\`\`bash
npx agentic-os init my-project
\`\`\`

## Documentation
- [Getting Started](https://github.com/ShunsukeHayashi/Autonomous-Operations/blob/main/docs/GETTING_STARTED.md)
- [Full Docs](https://github.com/ShunsukeHayashi/Autonomous-Operations/tree/main/docs)
"
```

### Announce

**Twitter/X:**
```
🚀 Just published agentic-os v1.0.0!

Create autonomous AI development environments in 5 minutes:

npx agentic-os init my-project

✨ Zero learning curve
🤖 AI agents handle Issues automatically  
📊 Real-time dashboard
💰 Built-in cost control

https://www.npmjs.com/package/agentic-os

#AI #Agents #DevOps #GitHub #Automation
```

**GitHub Discussions:**
Create announcement post in Discussions > Announcements

## Troubleshooting

### Error: Package name taken

If `agentic-os` is taken, try:
- `@agentic-os/cli`
- `agentic-ops`
- `agenticai`

Update `package.json` name field accordingly.

### Error: 402 Payment Required

You need to verify email first:
```bash
npm profile get
# → Check "email verified" status
```

### Error: 403 Forbidden

Check authentication:
```bash
npm whoami
# → Should show your username

npm logout
npm login
```

## Version Strategy

**Semantic Versioning:**
- `1.0.x` - Patch (bug fixes)
- `1.x.0` - Minor (new features, backward compatible)
- `x.0.0` - Major (breaking changes)

**Initial Versions:**
- `1.0.0` - First stable release (Phase 7 complete)
- `1.1.0` - When Phase 8 features added
- `2.0.0` - When breaking API changes

## Unpublish (Emergency Only)

```bash
# Within 72 hours of publication
npm unpublish agentic-os@1.0.0

# After 72 hours - deprecate instead
npm deprecate agentic-os@1.0.0 "This version has critical bugs. Please upgrade to 1.0.1"
```

⚠️ **Warning**: Unpublishing can break dependent projects. Only use for critical security issues.

## Resources

- [npm Publishing Guide](https://docs.npmjs.com/packages-and-modules/contributing-packages-to-the-registry)
- [Semantic Versioning](https://semver.org/)
- [npm CLI Documentation](https://docs.npmjs.com/cli/)
