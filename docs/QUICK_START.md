# Quick Start

**Get a working AI development system in 5 minutes.**

## For New Projects

```bash
npx agentic-os init my-project
cd my-project
```

Done. The CLI will:
- Create project structure
- Install dependencies
- Configure GitHub integration
- Set up AI agents

## For Existing Projects

```bash
cd your-project
npx agentic-os install
```

Done. This adds Agentic OS to your existing codebase.

## First Task

1. Create a GitHub Issue:
   - Title: "Add user authentication"
   - Body: "Implement login with email/password"

2. Wait 10 minutes

3. Check your PRs - it's already done

## What Just Happened?

```
Issue created
    ↓
AI labels it (type:feature, priority:high)
    ↓
CodeGenAgent picks it up
    ↓
Generates code + tests
    ↓
Creates PR
    ↓
ReviewAgent checks quality
    ↓
Ready to merge
```

## Cost Control

Built-in circuit breaker stops at $50/day.

Check costs anytime:
```bash
npx agentic-os status
```

## Dashboard

View real-time progress:
```bash
npx agentic-os dashboard
```

## That's It

No agents to configure. No workflows to learn. Just create Issues.

---

**Next:** [Full Documentation](./README.md)
