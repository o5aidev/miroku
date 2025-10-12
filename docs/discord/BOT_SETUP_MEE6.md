# MEE6 Bot Setup Guide for Miyabi Discord 🤖

**Bot**: MEE6
**Purpose**: Leveling, Auto-roles, Moderation, Welcome messages
**Website**: https://mee6.xyz/

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Installation](#installation)
3. [Leveling System](#leveling-system)
4. [Auto-Role Assignment](#auto-role-assignment)
5. [Welcome Messages](#welcome-messages)
6. [Moderation](#moderation)
7. [Custom Commands](#custom-commands)
8. [Troubleshooting](#troubleshooting)

---

## 🎯 Overview

MEE6 provides essential community engagement features for Miyabi Discord:

**Features Used**:
- ✅ **Leveling System** - XP-based progression
- ✅ **Auto-Roles** - Automatic role assignment based on levels
- ✅ **Welcome Messages** - Greet new members
- ✅ **Moderation** - Anti-spam, auto-moderation
- ✅ **Custom Commands** - Quick responses

**Not Used** (for now):
- ❌ Music
- ❌ Reaction Roles (using native Discord instead)
- ❌ Twitch Integration

---

## 🚀 Installation

### Step 1: Add MEE6 to Server

1. Go to https://mee6.xyz/
2. Click **"Add to Discord"**
3. Select **Miyabi Discord Server**
4. Grant required permissions:
   - ✅ Manage Roles
   - ✅ Manage Messages
   - ✅ Send Messages
   - ✅ Embed Links
   - ✅ Read Message History
   - ✅ Add Reactions
   - ✅ Kick Members (for moderation)
   - ✅ Ban Members (for moderation)

### Step 2: Access Dashboard

1. Go to https://mee6.xyz/dashboard
2. Select **Miyabi Server**
3. Configure plugins (see sections below)

---

## 📊 Leveling System

### Configuration

**Path**: Dashboard → Plugins → Leveling

#### Basic Settings

```yaml
Leveling System: ENABLED
XP per Message: 15-25 XP (randomized)
Cooldown: 60 seconds (prevent spam)
Level-Up Messages: ENABLED
Level-Up Channel: #general (or DM)
```

#### XP Formula

MEE6's default formula:
```
XP needed for level N = 5 * (N^2) + 50 * N + 100
```

**Level Progression**:
| Level | Total XP | Messages (~) |
|-------|----------|--------------|
| 1 | 155 | ~10 |
| 5 | 1,175 | ~75 |
| 10 | 3,600 | ~225 |
| 15 | 7,475 | ~470 |
| 20 | 12,900 | ~810 |
| 30 | 28,500 | ~1,790 |
| 50 | 73,500 | ~4,610 |

#### Level-Up Message Template

```
🎉 Congrats {user}! You've reached **Level {level}**!

Keep contributing to the Miyabi community! 🌸

Type `!rank` to see your progress.
```

#### XP Multipliers (Optional)

**Channel Multipliers**:
- `#general`: 1.0x (default)
- `#dev-general`: 1.2x (encourage dev discussions)
- `#showcase`: 1.5x (encourage sharing)
- `#off-topic`: 0.5x (lower XP for casual chat)
- `#bot-commands`: 0x (no XP for bot testing)

**Role Multipliers**:
- `@Contributor`: 1.2x (reward contributors)
- `@Core Contributor`: 1.5x (reward core team)
- `@Moderator`: 1.0x (no bonus for staff)

---

## 👥 Auto-Role Assignment

### Configuration

**Path**: Dashboard → Plugins → Leveling → Role Rewards

### Role Progression

```yaml
Level 0 (Join): @Newcomer 🌱
Level 2 (7+ days active): @Member 🌿
Level 10 (30+ days, ~225 messages): @Regular 🍀
Level 20 (Active contributor, ~810 messages): @Active Contributor 🌟
```

**Note**: Manual roles (Contributor, Core Contributor, Maintainer) are awarded by moderators based on GitHub contributions.

### Auto-Role Settings

```yaml
Remove Previous Role: YES (when leveling up)
Stack Roles: NO (only one activity role at a time)
Notify on Role Award: YES (DM)
```

### Role Award Message Template

```
🎉 Congratulations {user}!

You've been awarded the **{role}** role for your active participation in the Miyabi community!

**Perks**:
- {role_perks}

Keep it up! 🌸
```

**Role Perks**:

- **@Newcomer**: Welcome to the community!
- **@Member**: Access to threads, reactions
- **@Regular**: Access to #bot-commands, priority support
- **@Active Contributor**: Recognition badge, early beta access

---

## 👋 Welcome Messages

### Configuration

**Path**: Dashboard → Plugins → Welcome

### Settings

```yaml
Welcome Plugin: ENABLED
Welcome Channel: #welcome (or #general)
Welcome DM: ENABLED (optional)
Embed Style: YES (prettier messages)
```

### Welcome Message Template

**Public Channel (#welcome)**:

```
🌸 Welcome to **Miyabi Discord**, {user.mention}!

We're excited to have you here! 🎉

**Quick Start**:
1. Read the rules in {#rules}
2. Introduce yourself in {#introductions}
3. Check out tutorials in {#tutorials}
4. Ask questions in {#help-general}

**What is Miyabi?**
→ AI-powered autonomous development framework
→ 7 specialized agents
→ GitHub as OS integration

Type `!help` for bot commands or ping @Support Team if you need help!

---
🤖 Powered by Claude AI • 🌸 Made with Love
```

### Direct Message (DM) Template

```
👋 Hey {user}, welcome to the Miyabi Discord community!

Here's everything you need to get started:

**📚 Important Channels**:
• {#rules} - Community guidelines (please read!)
• {#faq} - Frequently asked questions
• {#tutorials} - Getting started guides
• {#support-english} or {#support-japanese} - Get help

**🤖 What is Miyabi?**
Miyabi automates your entire development workflow:
→ Issue analysis
→ Code generation (Claude AI)
→ Automated testing
→ PR creation
→ Deployment

**🎯 Next Steps**:
1. Introduce yourself in {#introductions}
2. Install Miyabi: `npx miyabi`
3. Explore examples in {#showcase}

**🔗 Useful Links**:
• GitHub: https://github.com/ShunsukeHayashi/Miyabi
• Docs: https://github.com/ShunsukeHayashi/Miyabi#readme
• NPM: https://www.npmjs.com/package/miyabi

Need help? Just ask in {#support-english} or {#support-japanese}!

See you in the server! 🌸

---
💡 Tip: Type `!rank` anytime to check your level and XP!
```

### Auto-Delete Old Welcomes

```yaml
Auto-Delete After: 24 hours (keep channel clean)
Keep Last: 10 messages (show recent joins)
```

---

## 🛡️ Moderation

### Configuration

**Path**: Dashboard → Plugins → Moderator

### Auto-Moderation Rules

#### 1. Spam Protection

```yaml
Duplicate Messages: ENABLED
Max Duplicates: 3 within 10 seconds
Action: Delete + Warn
Timeout Duration: 60 seconds
```

#### 2. Link Protection

```yaml
Suspicious Links: ENABLED
Allowed Domains:
  - github.com
  - githubusercontent.com
  - npmjs.com
  - discord.gg (verified invites only)
  - youtube.com
  - youtu.be
Action: Delete + Warn
```

#### 3. Bad Words Filter

```yaml
Bad Words: ENABLED
Sensitivity: Medium
Custom Words:
  - [Add as needed based on community]
Action: Delete + Warn
Warn Threshold: 3 warnings → Temporary mute (24h)
```

#### 4. Caps Lock

```yaml
Excessive Caps: ENABLED
Threshold: 70% of message
Min Length: 10 characters
Action: Delete + Warn
```

#### 5. Mass Mention

```yaml
Mass Mentions: ENABLED
Max Mentions: 5 per message
Action: Delete + Warn
```

#### 6. Invite Links

```yaml
Discord Invites: ENABLED
Allow Own Server: YES
Allow Partner Servers: NO (unless whitelisted)
Action: Delete + Warn
```

### Warning System

```yaml
Max Warnings: 3 within 24 hours
Actions:
  - 1st Warning: Verbal warning
  - 2nd Warning: Temporary mute (1 hour)
  - 3rd Warning: Temporary mute (24 hours)
  - 4th Warning: Temporary ban (7 days)
  - 5th Warning: Permanent ban (manual review)
```

### Moderation Commands

| Command | Permission | Description |
|---------|------------|-------------|
| `!warn @user [reason]` | Moderator | Issue warning |
| `!warnings @user` | Moderator | Check user warnings |
| `!mute @user [duration] [reason]` | Moderator | Temporary mute |
| `!unmute @user` | Moderator | Remove mute |
| `!kick @user [reason]` | Moderator | Kick user |
| `!ban @user [duration] [reason]` | Moderator | Ban user |
| `!unban @user` | Admin | Unban user |
| `!clear [amount]` | Moderator | Delete messages |

---

## 🎮 Custom Commands

### Configuration

**Path**: Dashboard → Plugins → Custom Commands

### Recommended Commands

#### 1. `!docs`

**Trigger**: `!docs [query]`
**Response**:
```
📚 **Miyabi Documentation**

Official docs: https://github.com/ShunsukeHayashi/Miyabi#readme

**Quick Links**:
• Setup Guide: https://github.com/ShunsukeHayashi/Miyabi/blob/main/docs/SETUP_GUIDE.md
• Label System: https://github.com/ShunsukeHayashi/Miyabi/blob/main/docs/LABEL_SYSTEM_GUIDE.md
• Agent SDK: https://www.npmjs.com/package/miyabi-agent-sdk

Need help? Ask in {#support-english} or {#support-japanese}!
```

#### 2. `!install`

**Trigger**: `!install`
**Response**:
```
🚀 **Install Miyabi**

```bash
# Quick start (recommended)
npx miyabi

# Or install globally
npm install -g miyabi
miyabi
```

**Requirements**:
• Node.js >= 18.0.0
• Git CLI
• GitHub Personal Access Token

Full setup guide: https://github.com/ShunsukeHayashi/Miyabi/blob/main/docs/SETUP_GUIDE.md
```

#### 3. `!agents`

**Trigger**: `!agents`
**Response**:
```
🤖 **Miyabi's 7 AI Agents**

1. **CoordinatorAgent** - Task decomposition & DAG
2. **IssueAgent** - Issue analysis & 53-label classification
3. **CodeGenAgent** - AI code generation (Claude Sonnet 4)
4. **ReviewAgent** - Quality assessment (80+ score)
5. **PRAgent** - Pull Request creation
6. **DeploymentAgent** - CI/CD automation
7. **TestAgent** - Automated testing (80%+ coverage)

Learn more: https://github.com/ShunsukeHayashi/Miyabi#agents
```

#### 4. `!contribute`

**Trigger**: `!contribute`
**Response**:
```
🤝 **How to Contribute**

Ways to contribute:
• 💻 Code: Submit PRs
• 📚 Docs: Improve documentation
• 🐛 Bugs: Report issues
• 💡 Ideas: Suggest features
• 🌍 Translate: Help translate docs
• 🤝 Community: Help others in support channels

Contributor Guide: https://github.com/ShunsukeHayashi/Miyabi/blob/main/CONTRIBUTING.md

Start here: {#dev-general}
```

#### 5. `!roadmap`

**Trigger**: `!roadmap`
**Response**:
```
🗺️ **Miyabi Roadmap**

Check our roadmap:
• GitHub Issues: https://github.com/ShunsukeHayashi/Miyabi/issues
• GitHub Projects: https://github.com/ShunsukeHayashi/Miyabi/projects

**Coming Soon**:
- Multi-model AI support (GPT-4, Gemini)
- Visual workflow editor
- SaaS platform (miyabi.dev)
- Plugin marketplace

Vote on features in {#feature-requests}!
```

---

## 🐛 Troubleshooting

### Common Issues

#### MEE6 Not Responding

**Cause**: Bot offline or permissions missing
**Solution**:
1. Check MEE6 status: https://status.mee6.xyz/
2. Verify bot permissions in Server Settings → Roles → MEE6
3. Re-invite bot if needed

#### XP Not Awarding

**Cause**: Cooldown or channel excluded
**Solution**:
1. Check cooldown (default 60s between XP awards)
2. Verify channel isn't in excluded list (Dashboard → Leveling → Excluded Channels)
3. Ensure user doesn't have "Ignore XP" role

#### Auto-Roles Not Assigning

**Cause**: Role hierarchy issue
**Solution**:
1. Ensure MEE6 role is **above** reward roles in Server Settings → Roles
2. Verify role rewards are configured correctly (Dashboard → Leveling → Role Rewards)
3. Check user has reached required level: `!rank @user`

#### Moderation Rules Too Strict/Lenient

**Solution**:
1. Review auto-mod settings (Dashboard → Moderator)
2. Adjust thresholds based on community feedback
3. Whitelist trusted members if needed

---

## 📊 Analytics & Monitoring

### Checking Server Stats

Commands for moderators:

```
!serverstats       - Overall server statistics
!leaderboard       - Top 10 members by XP
!rank @user        - Check specific user's rank
!membercount       - Total member count
```

### Dashboard Analytics

**Path**: Dashboard → Analytics

Monitor:
- New members per day/week
- Message activity by channel
- Top contributors
- Level distribution
- Warning trends

---

## 🔗 Additional Resources

- **MEE6 Documentation**: https://docs.mee6.xyz/
- **MEE6 Support Server**: https://discord.gg/mee6
- **Status Page**: https://status.mee6.xyz/

---

## 📝 Maintenance Checklist

**Weekly**:
- [ ] Review moderation logs
- [ ] Check for false positives in auto-mod
- [ ] Update bad words list if needed
- [ ] Review leaderboard for anomalies

**Monthly**:
- [ ] Analyze XP distribution (adjust if needed)
- [ ] Review role progression (are users leveling too fast/slow?)
- [ ] Update custom commands with new resources
- [ ] Audit MEE6 permissions

---

**Last Updated**: 2025-10-12
**Maintained By**: Miyabi Discord Moderators
**Questions?** Ask in {#mod-chat} or DM @Admin

🌸 Keeping Miyabi community engaged and safe!
