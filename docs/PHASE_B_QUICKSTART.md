# Phase B Quick Start Guide

This guide helps you quickly set up and test the Event Bus (Webhooks) system.

## Prerequisites

- Node.js 20+
- GitHub Personal Access Token with repo permissions
- Git repository with GitHub Actions enabled

## Setup Steps

### 1. Set Environment Variables

```bash
# Required for webhook router
export GITHUB_TOKEN="your-github-pat-here"
export GITHUB_REPOSITORY="owner/repo-name"

# Optional: For signature verification (production)
export WEBHOOK_SECRET="your-webhook-secret"
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Run Tests

```bash
# Run all webhook tests
npm test -- tests/webhook-router.test.ts

# Expected output: ✓ 23 passed
```

### 4. Test Event Routing

```bash
# Test issue opened event
npm run webhook:test:issue

# Test PR opened event
npm run webhook:test:pr

# Test push event
npm run webhook:test:push

# Test comment command
npm run webhook:test:comment
```

## Verify Installation

### Check Workflow Files

```bash
# Webhook Handler workflow should exist
ls -la .github/workflows/webhook-handler.yml

# Event Router workflow should exist
ls -la .github/workflows/webhook-event-router.yml
```

### Check Implementation Files

```bash
# Core router
ls -la scripts/webhook-router.ts

# Security module
ls -la scripts/webhook-security.ts

# Tests
ls -la tests/webhook-router.test.ts
```

## Test in GitHub

### 1. Create Test Issue

1. Go to your repository on GitHub
2. Click "Issues" → "New Issue"
3. Create an issue with any title
4. Check Actions tab → "Webhook Event Handler" should run

### 2. Add Agent Execute Label

1. Add label `🤖agent-execute` to an issue
2. Check Actions tab → Workflow should trigger
3. Check issue comments → Routing comment should appear

### 3. Test Comment Command

1. Comment `/agent analyze` on any issue
2. Check Actions tab → Workflow should trigger
3. Check logs → Command parsing should work

## Troubleshooting

### Issue: Tests fail with "GITHUB_TOKEN required"

**Solution**: Set the GITHUB_TOKEN environment variable:

```bash
export GITHUB_TOKEN="ghp_yourtoken..."
```

### Issue: Webhook not triggering

**Solution**:
1. Check workflow file syntax
2. Verify GitHub Actions is enabled
3. Check repository permissions

### Issue: Signature verification fails

**Solution**:
1. Set WEBHOOK_SECRET in repository secrets
2. Verify secret matches between GitHub and code
3. For testing, signature verification can be skipped

## Next Steps

- Read full documentation: [PHASE_B_WEBHOOKS.md](./PHASE_B_WEBHOOKS.md)
- Configure webhook secrets for production
- Customize routing rules
- Integrate with your Agent implementations

## Support

- Documentation: [docs/](../docs/)
- Issues: GitHub Issues
- Tests: `npm test`

---

**Last Updated**: 2025-10-08
**Status**: ✅ Phase B Complete
