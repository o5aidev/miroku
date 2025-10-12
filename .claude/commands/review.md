---
description: コード品質レビュー - インタラクティブループで完璧な品質を実現
---

# /review - Interactive Code Quality Review

You are performing a comprehensive code review before PR submission, implementing **Daniel's Review Loop** from OpenAI Dev Day.

**Goal**: Achieve perfect quality (≥80 score) through iterative review → fix → re-review loop.

**Important**: This is an interactive review session. Keep iterating until quality passes or max iterations (10) reached.

## Review Process

### 1. Initial Analysis

Run the following checks **in parallel** (use the existing ReviewAgent):

```bash
# Get changed files
git diff --name-only HEAD

# Run comprehensive review
npm run review
```

**Expected outputs**:
- ESLint score (0-100)
- TypeScript score (0-100)
- Security score (0-100)
- Test coverage score (0-100)
- Overall quality score (0-100)

### 2. Display Results

Format the results as follows:

```
🔍 ReviewAgent comprehensive review...

📊 Analysis Results:
┌─────────────────┬───────┐
│ Metric          │ Score │
├─────────────────┼───────┤
│ ESLint          │ XX/100│
│ TypeScript      │ XX/100│
│ Security        │ XX/100│
│ Test Coverage   │ XX/100│
├─────────────────┼───────┤
│ Overall Quality │ XX/100│
└─────────────────┴───────┘

[✅ PASSED / ❌ FAILED] (threshold: 80)
```

### 3. If Score < 80: Display Issues

List all issues with actionable suggestions:

```
🔍 Found N issues:

1. [SECURITY] src/auth.ts:45
   Possible hardcoded API Key detected
   💡 Suggestion: Move to environment variables

2. [ESLINT] src/utils.ts:102
   Unused variable 'oldState'
   💡 Suggestion: Remove or prefix with underscore

3. [TYPESCRIPT] src/types.ts:23
   Type 'string' is not assignable to type 'number'
   💡 Suggestion: Update type annotation
```

### 4. Next Steps Prompt

After displaying issues, provide clear next steps:

```
💡 Next steps:
1. Fix the issues above manually
2. Type "continue" to re-review after your fixes
3. Or type "pls fix" for automatic fixes (where possible)
4. Or type "skip" to skip review and proceed anyway

>
```

**Wait for user input** before proceeding.

### 5. Handle User Actions

#### Action: "pls fix" (Auto-fix)

```bash
# Attempt automatic fixes for safe issues only
npx eslint --fix src/**/*.ts

# Show results
```

Display which issues were fixed:

```
🔧 Attempting automatic fixes...

✅ Fixed: [ESLINT] Unused variable 'oldState'
✅ Fixed: [ESLINT] Missing semicolon
⚠️  Manual fix required: [SECURITY] Hardcoded API Key
⚠️  Manual fix required: [TYPESCRIPT] Type mismatch

2/4 issues fixed automatically. Please fix remaining 2 issues manually.
```

Then **automatically re-run review** (increment iteration counter).

#### Action: "continue" (Re-review)

Simply re-run the review process (increment iteration counter).

#### Action: "skip" (Skip review)

```
⏭️  Review skipped by user.

⚠️  WARNING: Quality score is below threshold (XX/100).
Proceeding without passing review may lead to PR rejections.

Ready to create PR when you are.
```

Exit the review loop.

### 6. Iteration Control

- **Max iterations**: 10
- **Current iteration**: Track and display (e.g., "🔍 Review iteration 2/10")
- **Escape conditions**:
  - Score ≥ 80 (SUCCESS)
  - Iteration ≥ 10 (ESCALATE)
  - User types "skip" (USER_SKIP)

### 7. Success (Score ≥ 80)

```
✅ Review PASSED (score: XX/100)

🎉 All checks passed! Your code is ready for PR.

📊 Final Breakdown:
- ESLint: XX/100
- TypeScript: XX/100
- Security: XX/100
- Test Coverage: XX/100

💡 Suggested next steps:
1. Create PR: gh pr create
2. Or continue working on additional changes
```

### 8. Escalation (Max iterations reached)

```
⚠️  Max iterations (10) reached without passing review.

Current score: XX/100 (threshold: 80)

🚨 Escalating to human reviewer.

Outstanding issues:
[List critical issues]

Please address these issues manually or consult with your team lead.
```

## Review Checklist

For each iteration, verify:

- [ ] **ESLint**: Run `npx eslint src/**/*.ts`
- [ ] **TypeScript**: Run `npx tsc --noEmit`
- [ ] **Security**: Scan for hardcoded secrets, dangerous functions
- [ ] **Test Coverage**: Check `npm run test -- --coverage`

## Auto-Fix Safety Rules

Only auto-fix these issue types:
- ✅ ESLint formatting (semicolons, quotes, spacing)
- ✅ ESLint unused variables (safe removal)
- ✅ Import ordering

**NEVER** auto-fix:
- ❌ Security vulnerabilities
- ❌ TypeScript type errors
- ❌ Logic errors
- ❌ Breaking changes

## Important Notes

1. **Separation of Concerns**: Keep review thread separate from implementation thread
2. **Unique Terminology**: Use "exec review" to refer to this review process
3. **Iterative Mindset**: Embrace the loop - perfection takes iterations
4. **User Control**: Always respect user's "skip" command
5. **Transparency**: Show all scores, issues, and suggestions clearly

## Integration with ReviewAgent

Use the existing `ReviewAgent` class from `agents/review/review-agent.ts`:

```typescript
import { ReviewAgent } from '../agents/review/review-agent.js';
import { AgentConfig } from '../agents/types/index.js';

const config: AgentConfig = {
  deviceIdentifier: process.env.DEVICE_IDENTIFIER || 'local',
  githubToken: process.env.GITHUB_TOKEN || '',
  useTaskTool: false,
  useWorktree: false,
  logDirectory: './logs',
  reportDirectory: './reports',
};

const agent = new ReviewAgent(config);
const result = await agent.execute(task);
const qualityReport = result.data.qualityReport;
```

## Output Format

At the end of each review iteration, output structured JSON for logging:

```json
{
  "iteration": 2,
  "score": 85,
  "passed": true,
  "breakdown": {
    "eslint": 90,
    "typescript": 100,
    "security": 80,
    "testCoverage": 85
  },
  "issues": [
    {
      "type": "security",
      "severity": "high",
      "file": "src/auth.ts",
      "line": 45,
      "message": "Possible hardcoded API Key",
      "suggestion": "Move to environment variables"
    }
  ],
  "action": "continue",
  "timestamp": "2025-10-12T10:30:00Z"
}
```

---

**Remember**: The goal is PR-ready code through iterative refinement. Keep looping until perfection! 🎯
