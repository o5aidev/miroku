# GitHub Bot Setup Guide for Miyabi Discord 🐙

**Bot**: GitHub (Official Discord Integration)
**Purpose**: PR/Issue notifications, Repository updates
**Website**: https://discord.com/application-directory/425616027419312128

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Installation](#installation)
3. [Repository Subscription](#repository-subscription)
4. [Notification Configuration](#notification-configuration)
5. [Commands](#commands)
6. [Channel Setup](#channel-setup)
7. [Troubleshooting](#troubleshooting)

---

## 🎯 Overview

The GitHub Bot provides real-time updates from GitHub repositories directly in Discord.

**Features Used**:
- ✅ **Pull Request Notifications** - New PRs, reviews, merges
- ✅ **Issue Notifications** - New issues, comments, labels
- ✅ **Release Notifications** - New releases and tags
- ✅ **Discussion Notifications** - GitHub Discussions updates
- ✅ **Commit Notifications** - Push events (optional)
- ✅ **Workflow Notifications** - GitHub Actions results

**Integration Points**:
- `#dev-pull-requests` - PR notifications
- `#dev-general` - Issue notifications
- `#release-notes` - Release announcements
- `#github-actions` - CI/CD results

---

## 🚀 Installation

### Step 1: Add GitHub Bot to Server

1. Go to Discord Server Settings
2. Navigate to **Integrations**
3. Click **"Applications"**
4. Search for **"GitHub"**
5. Click **"Add"** (or visit https://discord.com/application-directory/425616027419312128)

### Step 2: Authorize GitHub Access

The GitHub Bot will request:
- ✅ Read access to repositories
- ✅ Read access to issues, PRs
- ✅ Read access to discussions
- ✅ Webhook management (for notifications)

**Grant Access**:
1. Select **your GitHub account** or **organization**
2. Choose repositories:
   - **All repositories** (if you're an admin/owner)
   - **Specific repositories** (ShunsukeHayashi/Miyabi)

---

## 📦 Repository Subscription

### Subscribe to Miyabi Repository

In any Discord channel (preferably #dev-general):

```
.github subscribe ShunsukeHayashi/Miyabi
```

**Response**:
```
✅ Subscribed to ShunsukeHayashi/Miyabi

You'll receive notifications for:
• Pull Requests
• Issues
• Releases
```

### Verify Subscription

```
.github subscriptions
```

**Example Response**:
```
📋 Subscriptions for this channel:

1. ShunsukeHayashi/Miyabi
   - pulls
   - issues
   - releases
```

---

## 🔔 Notification Configuration

### Channel-Specific Subscriptions

#### #dev-pull-requests - PR Notifications Only

```bash
.github subscribe ShunsukeHayashi/Miyabi pulls reviews comments
```

**Notifications include**:
- New PRs opened
- PR reviews submitted
- PR comments added
- PR status changes (draft, ready for review, merged, closed)
- PR labels added/removed

#### #dev-general - Issue Notifications

```bash
.github subscribe ShunsukeHayashi/Miyabi issues
```

**Notifications include**:
- New issues opened
- Issue comments
- Issue label changes
- Issue assignments
- Issue closures

#### #release-notes - Release Notifications

```bash
.github subscribe ShunsukeHayashi/Miyabi releases
```

**Notifications include**:
- New releases published
- Pre-releases
- Release edits

#### #github-actions - Workflow Notifications (Optional)

```bash
.github subscribe ShunsukeHayashi/Miyabi workflows:* builds:* commits:main
```

**Notifications include**:
- Workflow runs (success/failure)
- Build status
- Commits to main branch

### Notification Filtering

#### Only Specific Events

**Pull Requests only (no reviews/comments)**:
```bash
.github subscribe ShunsukeHayashi/Miyabi pulls -reviews -comments
```

**Issues only (no comments)**:
```bash
.github subscribe ShunsukeHayashi/Miyabi issues -comments
```

#### Only Specific Branches

**Main branch only**:
```bash
.github subscribe ShunsukeHayashi/Miyabi commits:main
```

**Main and develop**:
```bash
.github subscribe ShunsukeHayashi/Miyabi commits:main commits:develop
```

#### Only Specific Labels

**P0-Critical and P1-High issues only**:
```bash
.github subscribe ShunsukeHayashi/Miyabi issues:"label:priority:P0-Critical" issues:"label:priority:P1-High"
```

---

## 🎮 Commands

### Basic Commands

| Command | Description | Example |
|---------|-------------|---------|
| `.github subscribe <repo>` | Subscribe to repository | `.github subscribe ShunsukeHayashi/Miyabi` |
| `.github unsubscribe <repo>` | Unsubscribe from repository | `.github unsubscribe ShunsukeHayashi/Miyabi` |
| `.github subscriptions` | List active subscriptions | `.github subscriptions` |
| `.github issue <repo> <number>` | Show issue details | `.github issue ShunsukeHayashi/Miyabi 52` |
| `.github pr <repo> <number>` | Show PR details | `.github pr ShunsukeHayashi/Miyabi 100` |

### Advanced Commands

| Command | Description |
|---------|-------------|
| `.github subscribe <repo> pulls reviews comments` | PR + reviews + comments |
| `.github subscribe <repo> issues -comments` | Issues without comments |
| `.github subscribe <repo> releases` | Releases only |
| `.github subscribe <repo> commits:main` | Commits to main branch |
| `.github subscribe <repo> workflows:*` | All workflow runs |

### Shortcuts

| Shortcut | Expands To |
|----------|------------|
| `#123` | Links to issue #123 (if repo subscribed) |
| `GH-123` | Links to issue #123 |
| `ShunsukeHayashi/Miyabi#123` | Links to specific repo issue |

---

## 📺 Channel Setup

### Recommended Channel Structure

#### 1. #dev-pull-requests

**Purpose**: Track all PRs

**Subscription**:
```bash
.github subscribe ShunsukeHayashi/Miyabi pulls reviews comments
```

**Notification Example**:
```
🔀 **New Pull Request** #100
**feat(test): Add snapshot testing for ReviewAgent**

Author: @Shunsuke-Hayashi
Branch: feature/phase1-snapshot-testing → main
Status: Draft

Adds Vitest snapshot tests for quality reports and review comments.

[View PR](https://github.com/ShunsukeHayashi/Miyabi/pull/100)
```

#### 2. #dev-general

**Purpose**: Track issues and general development

**Subscription**:
```bash
.github subscribe ShunsukeHayashi/Miyabi issues
```

**Notification Example**:
```
🐛 **New Issue** #270
**[BUG] Firebase Auth initialization fails**

Author: @contributor
Labels: 🐛 type:bug, 🔥 priority:P1-High

Firebase Auth is not initializing properly in production environment...

[View Issue](https://github.com/ShunsukeHayashi/Miyabi/issues/270)
```

#### 3. #release-notes

**Purpose**: Announce new releases

**Subscription**:
```bash
.github subscribe ShunsukeHayashi/Miyabi releases
```

**Notification Example**:
```
🚀 **New Release**: v0.4.0

**What's New:**
- Added snapshot testing support
- Improved ReviewAgent quality scoring
- Fixed Firebase Auth initialization

[View Release](https://github.com/ShunsukeHayashi/Miyabi/releases/tag/v0.4.0)
[Changelog](https://github.com/ShunsukeHayashi/Miyabi/blob/main/CHANGELOG.md)
```

#### 4. #github-actions (Optional)

**Purpose**: Monitor CI/CD pipelines

**Subscription**:
```bash
.github subscribe ShunsukeHayashi/Miyabi workflows:ci.yml workflows:deploy.yml
```

**Notification Example**:
```
✅ **Workflow Success**: CI Pipeline
**Triggered by**: push to main
**Commit**: 4f9498d - "feat(test): Add snapshot testing"
**Duration**: 3m 42s

All checks passed ✓

[View Run](https://github.com/ShunsukeHayashi/Miyabi/actions/runs/123456)
```

---

## ⚙️ Advanced Configuration

### Filtering by Author

**Only PRs from specific users**:
```bash
.github subscribe ShunsukeHayashi/Miyabi pulls:"author:Shunsuke-Hayashi"
```

### Filtering by Milestone

**Only issues in specific milestone**:
```bash
.github subscribe ShunsukeHayashi/Miyabi issues:"milestone:v1.0"
```

### Muting Specific Events

**Issues without comments or labels**:
```bash
.github subscribe ShunsukeHayashi/Miyabi issues -comments -labels
```

**PRs without reviews**:
```bash
.github subscribe ShunsukeHayashi/Miyabi pulls -reviews
```

---

## 🔕 Notification Management

### Pause Notifications Temporarily

```bash
.github unsubscribe ShunsukeHayashi/Miyabi
```

(Re-subscribe later with `.github subscribe`)

### Notification Overload?

**Reduce noise by**:
1. Removing comments: `-comments`
2. Removing reviews: `-reviews`
3. Filtering by label: `issues:"label:priority:P0-Critical"`
4. Using separate channels for different event types

---

## 🐛 Troubleshooting

### Bot Not Responding

**Cause**: Bot offline or permissions missing

**Solution**:
1. Check GitHub Bot status: https://www.githubstatus.com/
2. Verify bot has **Send Messages** and **Embed Links** permissions in channel
3. Re-add bot if needed

### No Notifications Appearing

**Cause**: Not subscribed or webhooks not configured

**Solution**:
1. Verify subscription: `.github subscriptions`
2. Check GitHub repository webhooks (Settings → Webhooks)
3. Ensure you have read access to repository

### Wrong Channel Getting Notifications

**Cause**: Subscription in wrong channel

**Solution**:
1. Unsubscribe from wrong channel: `.github unsubscribe <repo>`
2. Subscribe in correct channel: `.github subscribe <repo>`

### Too Many Notifications

**Cause**: Subscribed to too many events

**Solution**:
1. Unsubscribe: `.github unsubscribe <repo>`
2. Re-subscribe with filters: `.github subscribe <repo> pulls issues -comments`

---

## 📊 Best Practices

### 1. Separate Channels by Purpose

- `#dev-pull-requests` → PR notifications only
- `#dev-general` → Issue notifications only
- `#release-notes` → Releases only
- `#github-actions` → CI/CD only

### 2. Use Filters to Reduce Noise

- Remove comments if not needed: `-comments`
- Only high-priority issues: `issues:"label:priority:P0-Critical"`
- Only main branch commits: `commits:main`

### 3. Pin Important Notifications

- Pin release announcements in `#release-notes`
- Pin critical issues in `#dev-general`

### 4. Use Threads for Discussions

- Create threads under PR notifications for code discussions
- Keep main channel clean

---

## 🔗 Integration with Miyabi Workflow

### Automatic Issue Detection

When GitHub Bot posts a new issue, Miyabi agents can:
1. **IssueAgent** analyzes and labels
2. **CoordinatorAgent** decomposes into tasks
3. **CodeGenAgent** implements solution
4. **ReviewAgent** reviews code quality
5. **PRAgent** creates PR
6. **GitHub Bot** notifies Discord of new PR

### PR Review Workflow

1. **Developer** creates PR → GitHub Bot notifies `#dev-pull-requests`
2. **Team** discusses in thread
3. **ReviewAgent** (Miyabi) runs quality checks
4. **Reviewers** approve
5. **Merge** → GitHub Bot notifies
6. **DeploymentAgent** (Miyabi) auto-deploys

---

## 📚 Additional Resources

- **GitHub Discord Bot Docs**: https://github.com/github/discord
- **GitHub Webhooks Docs**: https://docs.github.com/webhooks
- **Discord Server Setup Guide**: https://support.discord.com/hc/en-us/articles/228383668

---

## 📝 Maintenance Checklist

**Weekly**:
- [ ] Review notification volume (too many/too few?)
- [ ] Check for missed critical updates
- [ ] Adjust filters if needed

**Monthly**:
- [ ] Audit subscriptions (remove inactive repos)
- [ ] Review GitHub Bot permissions
- [ ] Update subscription filters based on team feedback

---

**Last Updated**: 2025-10-12
**Maintained By**: Miyabi Discord Moderators
**Questions?** Ask in {#dev-general} or DM @Admin

🐙 Keeping Miyabi community synced with GitHub!
