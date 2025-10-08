# Getting Started (5 minutes)

**Zero configuration. Zero learning curve. Just run one command.**

## Step 1: Create Project (2 min)

```bash
npx agentic-os init my-project
```

This command:
1. Opens browser for GitHub authentication
2. Creates GitHub repository
3. Sets up 53 labels (automated state machine)
4. Deploys 10+ GitHub Actions workflows
5. Creates Projects V2 for tracking
6. Clones repository locally
7. Installs dependencies

## Step 2: Create Your First Issue (30 sec)

```bash
cd my-project
gh issue create --title "Add login page" --body "Email/password authentication"
```

## Step 3: Watch the Magic (2 min)

Within minutes:
- AI automatically labels your Issue
- Agent is automatically assigned
- Code is automatically implemented
- Tests are automatically written
- PR is automatically created

**You literally do nothing else.**

## Monitor Progress

```bash
npx agentic-os status --watch
```

See real-time agent activity.

## That's It!

You now know everything needed to use Agentic OS.

---

## FAQ

**Q: Do I need to learn about agents?**
A: No. They work automatically.

**Q: Do I need to label Issues?**
A: No. AI does it automatically.

**Q: Do I need to assign agents?**
A: No. Webhooks do it automatically.

**Q: What if something breaks?**
A: Agents escalate to Guardian (@ShunsukeHayashi).

**Q: How much does it cost?**
A: Free for open source. Uses your Anthropic API key for AI features.

---

## Advanced (Optional)

### Auto-create Issues from commits

```bash
git commit -m "feat: Add dark mode #auto"
# → Issue created automatically
```

### Auto-create Issues from PR comments

```markdown
@agentic-os test this new component
```

→ Testing Issue created automatically

---

**For detailed documentation, see [Architecture](system-architecture.puml) and [CLI Reference](../packages/cli/README.md).**

**But honestly, you don't need them. Just create Issues.**

🤖 Powered by Claude AI
