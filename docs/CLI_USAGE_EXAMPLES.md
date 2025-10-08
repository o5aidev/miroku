# CLI Usage Examples

**Real-world examples of using Agentic OS.**

## Example 1: New Web App

```bash
# Create project
npx agentic-os init my-web-app

# Create Issues for features
cd my-web-app

gh issue create --title "Add user registration" \
  --body "Users should be able to register with email/password"

gh issue create --title "Add login page" \
  --body "Login form with email/password. Redirect to dashboard after login."

gh issue create --title "Add user dashboard" \
  --body "Show user profile, settings, and recent activity"

# Wait 10-15 minutes per Issue
# PRs appear automatically ✅
```

## Example 2: Bug Fixes

```bash
# Method 1: Create Issue
gh issue create --title "Fix login redirect loop" \
  --body "After successful login, user gets stuck in redirect loop. Check session handling."

# Method 2: Commit with #auto
git commit -m "fix: Login redirect loop investigation #auto"
git push

# Both methods → Issue created → Agent fixes → PR appears
```

## Example 3: Documentation

```bash
# Create doc Issue
gh issue create --title "Document API endpoints" \
  --body "Add JSDoc comments to all API route handlers in src/api/"

# Or use PR comment automation
# On any PR, comment:
@agentic-os document the new API endpoints

# → Documentation Issue created → Agent documents → New PR
```

## Example 4: Testing

```bash
# Create test coverage Issue
gh issue create --title "Increase test coverage to 80%" \
  --body "Add unit tests for authentication module"

# Or from PR comment:
@agentic-os increase test coverage for this file to 80%

# → Testing Issue created → Agent adds tests → PR appears
```

## Example 5: Refactoring

```bash
# From PR comment:
@agentic-os refactor this component to use hooks

# → Refactoring Issue created
# → CodeGenAgent refactors
# → New PR with hooks-based implementation
```

## Example 6: Adding to Existing Project

```bash
cd existing-project

# Dry run first (no changes)
npx agentic-os install --dry-run

# See what would be installed:
# ✓ 53 labels
# ✓ 12+ workflows
# ✓ Projects V2 integration
# ✓ Auto-label N existing Issues

# Install for real
npx agentic-os install

# Now existing project has full automation ✅
```

## Example 7: Monitoring

```bash
# Check agent status
npx agentic-os status

# Output:
# 📊 Agentic OS Status
#
# State       Count  Status
# ─────────────────────────
# Pending     2      ⏳ Waiting
# Analyzing   1      🔄 Active
# Implementing 3     ⚡ Working
# Reviewing   1      🔍 Checking
# Done        15     ✓ Complete
#
# 📝 Recent PRs:
# #42 Add user dashboard
# #41 Fix login redirect
# #40 Document API endpoints

# Watch mode (auto-refresh every 10s)
npx agentic-os status --watch
```

## Example 8: Parallel Development

```bash
# Create multiple Issues at once
gh issue create --title "Feature A"
gh issue create --title "Feature B"
gh issue create --title "Feature C"

# All 3 are processed in parallel
# Multiple agents work simultaneously
# PRs appear for all 3 within 15-20 minutes ✅
```

## Example 9: Priority Handling

```bash
# Critical bug (AI detects priority automatically)
gh issue create --title "URGENT: Production login failing" \
  --body "Critical bug: All users unable to login. 500 error in auth service."

# AI automatically assigns:
# - type:bug
# - priority:P0-Critical
# - agent:codegen
# → Highest priority processing
```

## Example 10: Learning Tasks

```bash
# Experimental feature
gh issue create --title "Experiment: Try new AI model" \
  --body "Research and experiment with Claude 3.5 Opus for code generation"

# AI detects keywords and adds:
# - special:experiment
# - special:learning
# → Agent knows this is exploratory work
```

---

## Tips

### For Best Results

1. **Be specific** in Issue descriptions
2. **Break down** large features into smaller Issues
3. **Use natural language** (AI understands context)
4. **Review PRs promptly** (keeps agents moving)

### Common Patterns

**Feature:**
```bash
gh issue create --title "Add [feature name]" \
  --body "Detailed description of what it should do"
```

**Bug:**
```bash
gh issue create --title "Fix [problem]" \
  --body "Steps to reproduce, expected vs actual behavior"
```

**Docs:**
```bash
gh issue create --title "Document [component]" \
  --body "What needs documentation and where"
```

**Test:**
```bash
gh issue create --title "Test [component]" \
  --body "Target coverage percentage and test scenarios"
```

### Advanced

**Manual AI labeling:**
```bash
npm run ai:label owner repo issue-number
```

**Webhook testing:**
```bash
npm run webhook:test:issue
npm run webhook:test:pr
npm run webhook:test:comment
```

**State machine:**
```bash
npm run state:check
npm run state:transition
```

---

**Remember:** You don't need to memorize any of this. Just create Issues and watch the magic happen.

🤖 Powered by Claude AI
