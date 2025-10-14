# /review Command Specification

**Version**: 1.0.0
**Purpose**: PR前の徹底的なコードレビュー
**Inspiration**: OpenAI Dev Day - Daniel's Review Loop (PR数70%増)

---

## 📋 コマンドインターフェース

### 基本形式

```bash
/review [options]
```

### オプション

| オプション | 型 | デフォルト | 説明 |
|-----------|-----|-----------|------|
| `--files <pattern>` | string | `git diff --name-only` | 対象ファイル指定（glob形式）<br>例: `--files="src/**/*.ts"` |
| `--threshold <score>` | number | 80 | 合格スコア閾値（0-100） |
| `--auto-fix` | boolean | false | 自動修正モード（修正可能な問題を自動修正） |
| `--max-iterations <n>` | number | 10 | 最大レビューループ回数 |
| `--skip-tests` | boolean | false | テスト実行をスキップ（開発中のみ推奨） |
| `--verbose` | boolean | false | 詳細ログ出力 |

### 使用例

```bash
# 基本使用（変更されたファイルをすべてレビュー）
/review

# 特定ファイルのみレビュー
/review --files="src/agents/**/*.ts"

# 閾値を90点に設定
/review --threshold=90

# 自動修正モード
/review --auto-fix

# 最大3回までイテレーション
/review --max-iterations=3

# 詳細ログ付き
/review --verbose
```

---

## 🎯 UX設計

### 初回レビュー実行

```
$ /review

🔍 ReviewAgent starting comprehensive review...

📂 Analyzing files:
   - src/auth.ts
   - src/utils.ts
   - src/components/Header.tsx
   Total: 3 files

⚡ Running parallel analysis:
   - ESLint
   - TypeScript
   - Security Scan

📊 Analysis Results:
┌──────────────────┬───────┐
│ Metric           │ Score │
├──────────────────┼───────┤
│ ESLint           │ 90/100│
│ TypeScript       │ 100/100│
│ Security         │ 70/100│
│ Test Coverage    │ 85/100│
├──────────────────┼───────┤
│ Overall Quality  │ 78/100│
└──────────────────┴───────┘

❌ Review FAILED (threshold: 80)

🔍 Found 3 issues:

1. [SECURITY] src/auth.ts:45
   Possible hardcoded API Key detected
   💡 Suggestion: Move to environment variables

2. [SECURITY] src/utils.ts:102
   Use of eval() - Code injection risk
   💡 Suggestion: Replace with JSON.parse()

3. [ESLINT] src/components/Header.tsx:23
   Unused variable 'oldState'
   💡 Suggestion: Remove or prefix with underscore

💡 Next steps:
1. Fix the issues above
2. Run '/review' again
3. Or type 'pls fix' for automatic fixes (where possible)

>
```

### インタラクティブループ（自動修正）

```
> pls fix

🔧 Attempting automatic fixes...

✅ Fixed: [ESLINT] Unused variable 'oldState'
   - Removed unused variable

⚠️  Manual fix required: [SECURITY] Hardcoded API Key
   - Reason: Requires design decision

⚠️  Manual fix required: [SECURITY] eval() usage
   - Reason: Code logic change required

📊 Auto-fix Summary:
   - Fixed: 1/3 issues
   - Manual: 2/3 issues

Please fix remaining issues manually and run '/review' again.

>
```

### 2回目のレビュー実行

```
> /review

🔍 ReviewAgent starting review (iteration 2/10)...

📂 Analyzing files: 3 files

⚡ Running parallel analysis...

📊 Analysis Results:
┌──────────────────┬───────┐
│ Metric           │ Score │
├──────────────────┼───────┤
│ ESLint           │ 100/100│
│ TypeScript       │ 100/100│
│ Security         │ 70/100│ ⚠️
│ Test Coverage    │ 85/100│
├──────────────────┼───────┤
│ Overall Quality  │ 80/100│
└──────────────────┴───────┘

⚠️  Review BORDERLINE (threshold: 80, score: 80)

🔍 Found 2 issues:

1. [SECURITY] src/auth.ts:45
   Possible hardcoded API Key detected
   💡 Suggestion: Move to environment variables

2. [SECURITY] src/utils.ts:102
   Use of eval() - Code injection risk
   💡 Suggestion: Replace with JSON.parse()

⚠️  Security issues detected. Consider fixing before PR.

Continue with current quality? (y/n)
> y

✅ Review PASSED (threshold: 80)

All checks passed! Ready to create PR.

>
```

### 合格ケース

```
> /review

🔍 ReviewAgent starting review (iteration 3/10)...

📂 Analyzing files: 3 files

⚡ Running parallel analysis...

📊 Analysis Results:
┌──────────────────┬───────┐
│ Metric           │ Score │
├──────────────────┼───────┤
│ ESLint           │ 100/100│
│ TypeScript       │ 100/100│
│ Security         │ 100/100│
│ Test Coverage    │ 85/100│
├──────────────────┼───────┤
│ Overall Quality  │ 95/100│
└──────────────────┴───────┘

✅ Review PASSED (threshold: 80)

🎉 Excellent quality! All checks passed.

📊 Quality Breakdown:
   - Code Quality: ✅ Perfect (ESLint + TypeScript)
   - Security: ✅ No vulnerabilities
   - Test Coverage: ✅ 85% (target: 80%)

💡 Recommendations:
   - Consider adding more edge case tests
   - Document complex logic in utils.ts

Ready to create PR? (y/n)
> y

Creating PR...

>
```

### 最大イテレーション到達

```
> /review

🔍 ReviewAgent starting review (iteration 10/10)...

📊 Analysis Results:
┌──────────────────┬───────┐
│ Overall Quality  │ 75/100│
└──────────────────┴───────┘

❌ Review FAILED (threshold: 80)

⚠️  Maximum iterations (10) reached.

🚨 Escalating to human reviewer.

Issues summary:
   - 5 security issues
   - 3 TypeScript errors
   - 2 ESLint warnings

💡 Recommendations:
   1. Review security issues with CISO
   2. Refactor code to fix TypeScript errors
   3. Consider breaking down this PR into smaller chunks

>
```

---

## 🧮 スコア計算ロジック

### 基本計算式

```typescript
let score = 100;

// ESLint issues
for (const issue of eslintIssues) {
  if (issue.severity === 'error') {
    score -= 20;
  } else if (issue.severity === 'warning') {
    score -= 10;
  }
}

// TypeScript issues
for (const issue of typeScriptIssues) {
  score -= 30;  // All TS errors are critical
}

// Security issues
for (const issue of securityIssues) {
  if (issue.severity === 'critical') {
    score -= 40;
  } else if (issue.severity === 'high') {
    score -= 20;
  } else if (issue.severity === 'medium') {
    score -= 10;
  }
}

// Ensure score doesn't go below 0
score = Math.max(0, score);

// Pass if score >= 80
const passed = score >= 80;
```

### スコア内訳計算

```typescript
interface QualityBreakdown {
  eslintScore: number;      // 100 - (ESLint issues impact)
  typeScriptScore: number;  // 100 - (TS issues impact)
  securityScore: number;    // 100 - (Security issues impact)
  testCoverageScore: number; // Actual coverage % from coverage report
}

// Example:
// - 1 ESLint error (-20)
// - 0 TypeScript errors
// - 1 critical security issue (-40)
// - Test coverage: 85%
//
// Overall: 100 - 20 - 40 = 40 points
// Breakdown:
//   - eslintScore: 80
//   - typeScriptScore: 100
//   - securityScore: 60
//   - testCoverageScore: 85
```

### 重み付けスコア（将来実装）

```typescript
// Phase 4で実装予定
const weightedScore =
  (eslintScore * 0.20) +
  (typeScriptScore * 0.30) +
  (securityScore * 0.35) +
  (testCoverageScore * 0.15);
```

---

## 🔄 レビューループフロー

### フローチャート

```
開始
  ↓
┌─────────────────────────────────────┐
│ Iteration N (N = 1 to 10)           │
│ 1. ファイル収集                      │
│ 2. ESLint + TS + Security並列実行   │
│ 3. スコア計算                        │
│ 4. QualityReport生成                 │
└──────────────┬──────────────────────┘
               │
          Score >= 80?
           ↓        ↓
          YES       NO
           │         │
           ↓         ↓
      ✅ 合格   ❌ 不合格
           │         │
           ↓         ↓
      終了     Issues表示
                     │
               User Action?
                ↓    ↓    ↓
              fix  skip  (何もしない)
                │    │      │
                ↓    ↓      ↓
          Auto-fix  終了   手動修正
                │           │
                └───────────┘
                     │
               N < 10?
                ↓    ↓
               YES   NO
                │     │
                └─────┘
                  │
            Iteration N+1
```

### エスケープ条件

以下のいずれかでループ終了：

1. **合格**: `score >= threshold` (デフォルト: 80)
2. **最大回数**: `iteration >= maxIterations` (デフォルト: 10)
3. **ユーザースキップ**: ユーザーが `skip` 入力
4. **Critical Escalation**: Critical security issues発見 → CISO escalation

---

## 🔧 自動修正ロジック

### 修正可能なIssue

| Issue Type | Severity | 自動修正可否 | 理由 |
|-----------|----------|-------------|------|
| ESLint | error/warning | ✅ 可能 | ESLint --fix で安全に修正可能 |
| TypeScript | error | ❌ 不可 | 型エラーはロジック変更が必要 |
| Security (hardcoded secret) | critical/high | ❌ 不可 | 設計判断が必要 |
| Security (eval usage) | critical | ❌ 不可 | ロジック変更が必要 |
| Security (weak crypto) | medium | ❌ 不可 | セキュリティ設計判断が必要 |

### 自動修正実行ロジック

```typescript
async function attemptAutoFix(issues: QualityIssue[]): Promise<AutoFixResult> {
  const fixedIssues: QualityIssue[] = [];
  const manualIssues: QualityIssue[] = [];

  for (const issue of issues) {
    // ESLint issues can be auto-fixed
    if (issue.type === 'eslint' && issue.severity !== 'critical') {
      try {
        // Run ESLint with --fix
        await execCommand(`npx eslint --fix "${issue.file}"`);
        fixedIssues.push(issue);
        console.log(`✅ Fixed: [${issue.type.toUpperCase()}] ${issue.message}`);
      } catch (error) {
        manualIssues.push(issue);
        console.log(`⚠️  Could not auto-fix: [${issue.type.toUpperCase()}] ${issue.message}`);
      }
    } else {
      // TypeScript and Security issues require manual fix
      manualIssues.push(issue);
      console.log(`⚠️  Manual fix required: [${issue.type.toUpperCase()}] ${issue.message}`);
      console.log(`   Reason: ${getManualFixReason(issue)}`);
    }
  }

  return {
    fixed: fixedIssues.length,
    manual: manualIssues.length,
    fixedIssues,
    manualIssues,
  };
}

function getManualFixReason(issue: QualityIssue): string {
  if (issue.type === 'typescript') {
    return 'Type errors require code logic changes';
  }
  if (issue.type === 'security') {
    if (issue.severity === 'critical') {
      return 'Critical security issues require careful review';
    }
    return 'Security issues require design decisions';
  }
  return 'Requires manual intervention';
}
```

---

## 📤 出力フォーマット

### JSON出力（--verbose）

```json
{
  "iteration": 2,
  "maxIterations": 10,
  "score": 82,
  "threshold": 80,
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
      "severity": "medium",
      "file": "src/auth.ts",
      "line": 45,
      "column": 10,
      "message": "Possible hardcoded API Key",
      "suggestion": "Move to environment variables",
      "scoreImpact": 10,
      "autoFixable": false
    }
  ],
  "recommendations": [
    "Consider adding error boundaries",
    "Improve test coverage for edge cases"
  ],
  "filesAnalyzed": [
    "src/auth.ts",
    "src/utils.ts",
    "src/components/Header.tsx"
  ],
  "timestamp": "2025-10-14T09:30:00.000Z"
}
```

### Markdown出力（デフォルト）

```markdown
# Code Review Report

**Date**: 2025-10-14 09:30:00
**Iteration**: 2/10
**Status**: ✅ PASSED

## Quality Score: 82/100

### Breakdown

| Metric | Score |
|--------|-------|
| ESLint | 90/100 |
| TypeScript | 100/100 |
| Security | 80/100 |
| Test Coverage | 85/100 |

### Issues (1)

#### 1. [SECURITY] src/auth.ts:45

**Severity**: Medium
**Message**: Possible hardcoded API Key
**Suggestion**: Move to environment variables

### Recommendations

- Consider adding error boundaries
- Improve test coverage for edge cases

### Files Analyzed (3)

- src/auth.ts
- src/utils.ts
- src/components/Header.tsx

---

✅ All checks passed! Ready to create PR.
```

---

## 🎯 成功条件

### Task 3.1完了条件

- [x] コマンドインターフェース定義完了（6オプション）
- [x] UX設計完了（初回/ループ/合格/最大回数の4パターン）
- [x] スコア計算ロジック定義完了
- [x] レビューループフロー定義完了
- [x] エスケープ条件定義完了（4種類）
- [x] 自動修正ロジック定義完了
- [x] 出力フォーマット定義完了（JSON + Markdown）

---

## 📚 参考資料

- **OpenAI Dev Day - Daniel's Review Loop**: PR前の徹底レビュー（PR数70%増）
- **ReviewAgent実装**: `agents/review/review-agent.ts` (448行)
- **QualityReport型定義**: `agents/types/index.ts`

---

**次のTask**: Task 3.2 (.claude/commands/review.md作成)
