# ESLint Configuration Guide

## Overview

This document describes the ESLint configuration for the Autonomous Operations (Miyabi) project. The configuration is designed to enforce TypeScript strict mode compliance, code quality best practices, and security standards.

**Configuration File**: `.eslintrc.json` (root directory)

---

## Configuration Summary

### Base Configuration

- **Parser**: `@typescript-eslint/parser`
- **ECMAScript Version**: ES2022
- **Module Type**: ESM (ES Modules)
- **TypeScript Project**: `./tsconfig.json`
- **Plugins**: `@typescript-eslint`

### Extends

```json
[
  "eslint:recommended",
  "plugin:@typescript-eslint/recommended",
  "plugin:@typescript-eslint/recommended-requiring-type-checking"
]
```

---

## Rule Categories

### 1. Type Safety Rules (TypeScript Strict Mode)

These rules enforce TypeScript strict mode compliance and prevent common type-related bugs.

| Rule | Severity | Description |
|------|----------|-------------|
| `@typescript-eslint/no-explicit-any` | warn | Disallow usage of `any` type |
| `@typescript-eslint/no-floating-promises` | error | Require Promise-returning functions to be awaited or handled |
| `@typescript-eslint/no-misused-promises` | error | Avoid using promises in places not designed to handle them |
| `@typescript-eslint/await-thenable` | error | Disallow awaiting a value that is not a Thenable |
| `@typescript-eslint/no-unnecessary-type-assertion` | error | Disallow type assertions that don't change the type |
| `@typescript-eslint/no-unsafe-assignment` | warn | Disallow assigning values of type `any` |
| `@typescript-eslint/no-unsafe-member-access` | warn | Disallow member access on `any` values |
| `@typescript-eslint/no-unsafe-call` | warn | Disallow calling `any` values |
| `@typescript-eslint/no-unsafe-return` | warn | Disallow returning `any` from a function |
| `@typescript-eslint/restrict-template-expressions` | warn | Enforce template literal expressions to be of string type |

**Why These Rules Matter:**
- Prevent runtime type errors by catching them at compile-time
- Improve code maintainability by making types explicit
- Enable better IDE autocomplete and refactoring support
- Align with TypeScript strict mode (`strict: true` in tsconfig.json)

---

### 2. Code Quality Rules

These rules enforce best practices and maintainable code patterns.

#### 2.1 Function and Variable Declarations

| Rule | Severity | Description |
|------|----------|-------------|
| `@typescript-eslint/explicit-function-return-type` | warn | Require explicit return types on functions |
| `@typescript-eslint/explicit-module-boundary-types` | warn | Require explicit types on module boundaries |
| `@typescript-eslint/no-unused-vars` | error | Disallow unused variables (allows `_` prefix) |
| `prefer-const` | error | Require `const` for variables that are never reassigned |
| `no-var` | error | Disallow `var`, use `let` or `const` |

#### 2.2 Modern JavaScript Patterns

| Rule | Severity | Description |
|------|----------|-------------|
| `@typescript-eslint/prefer-nullish-coalescing` | warn | Prefer `??` over `\|\|` for default values |
| `@typescript-eslint/prefer-optional-chain` | warn | Prefer optional chaining (`?.`) |
| `prefer-template` | warn | Prefer template literals over string concatenation |
| `prefer-arrow-callback` | warn | Prefer arrow functions as callbacks |
| `arrow-body-style` | warn | Enforce concise arrow function syntax |

#### 2.3 Naming Conventions

| Rule | Severity | Description |
|------|----------|-------------|
| `@typescript-eslint/naming-convention` | warn | Enforce naming conventions |
| - `variable` | - | camelCase, UPPER_CASE, or PascalCase |
| - `function` | - | camelCase or PascalCase |
| - `typeLike` | - | PascalCase |
| - `interface` | - | PascalCase (no `I` prefix) |

**Example:**
```typescript
// Good
interface User { name: string; }
const userName = 'John';
const MAX_RETRIES = 3;
function getUserData() { ... }

// Bad
interface IUser { ... }  // No 'I' prefix
const user_name = 'John';  // Use camelCase
```

#### 2.4 Code Organization

| Rule | Severity | Description |
|------|----------|-------------|
| `@typescript-eslint/member-ordering` | warn | Enforce class member ordering |
| `@typescript-eslint/consistent-type-imports` | warn | Prefer `import type` for type-only imports |
| `@typescript-eslint/consistent-type-definitions` | warn | Prefer `interface` over `type` |
| `@typescript-eslint/array-type` | warn | Use `Type[]` for simple arrays |

**Class Member Order:**
1. Public static fields
2. Protected static fields
3. Private static fields
4. Public instance fields
5. Protected instance fields
6. Private instance fields
7. Constructor
8. Public static methods
9. Protected static methods
10. Private static methods
11. Public instance methods
12. Protected instance methods
13. Private instance methods

---

### 3. Security and Error Prevention

| Rule | Severity | Description |
|------|----------|-------------|
| `no-eval` | error | Disallow `eval()` |
| `no-implied-eval` | error | Disallow implied `eval()` |
| `no-debugger` | error | Disallow `debugger` statements |
| `no-alert` | error | Disallow `alert()`, `confirm()`, `prompt()` |
| `eqeqeq` | error | Require `===` and `!==` |
| `curly` | error | Require braces for all control statements |

---

### 4. Code Style Rules

#### 4.1 Formatting

| Rule | Severity | Description |
|------|----------|-------------|
| `@typescript-eslint/indent` | warn | 2 spaces indentation |
| `@typescript-eslint/quotes` | warn | Single quotes (allow template literals) |
| `@typescript-eslint/semi` | error | Require semicolons |
| `@typescript-eslint/comma-dangle` | warn | Require trailing commas in multiline |
| `@typescript-eslint/brace-style` | warn | 1tbs brace style |
| `no-trailing-spaces` | warn | Disallow trailing whitespace |
| `eol-last` | warn | Require newline at end of file |

#### 4.2 Code Complexity

| Rule | Severity | Description |
|------|----------|-------------|
| `complexity` | warn | Max cyclomatic complexity: 15 |
| `max-depth` | warn | Max nesting depth: 4 |
| `max-params` | warn | Max function parameters: 5 |
| `max-len` | warn | Max line length: 120 characters |
| `max-lines` | warn | Max lines per file: 500 |
| `max-lines-per-function` | warn | Max lines per function: 150 |

**Why Complexity Rules Matter:**
- Functions with complexity > 15 are hard to test and maintain
- Deep nesting (> 4 levels) indicates code that should be refactored
- Long functions (> 150 lines) should be split into smaller functions
- Large files (> 500 lines) should be split into multiple files

---

## Overrides

### Test Files (`*.test.ts`, `*.spec.ts`)

```json
{
  "rules": {
    "@typescript-eslint/no-explicit-any": "off",
    "@typescript-eslint/no-unsafe-assignment": "off",
    "@typescript-eslint/no-unsafe-member-access": "off",
    "@typescript-eslint/no-unsafe-call": "off",
    "max-lines-per-function": "off"
  }
}
```

**Rationale**: Test files often need more flexibility for mocking and assertions.

### Script Files (`scripts/**/*.ts`)

```json
{
  "rules": {
    "no-console": "off",
    "@typescript-eslint/no-floating-promises": "warn"
  }
}
```

**Rationale**: Scripts are CLI tools that need console output.

### Config Files (`*.config.ts`, `*.config.js`)

```json
{
  "rules": {
    "@typescript-eslint/no-var-requires": "off"
  }
}
```

**Rationale**: Config files may need CommonJS `require()` for compatibility.

---

## Ignore Patterns

The following paths are excluded from ESLint checking:

- `node_modules` - Third-party dependencies
- `dist` - Build output
- `build` - Build output
- `coverage` - Test coverage reports
- `*.js` - JavaScript files (project is TypeScript-only)
- `*.d.ts` - TypeScript declaration files
- `.worktrees` - Git worktree directories
- `packages/*/node_modules` - Workspace dependencies
- `packages/*/dist` - Workspace build output

---

## Usage

### Run ESLint

```bash
# Lint all files
npm run lint

# Lint specific file
npx eslint path/to/file.ts

# Lint with auto-fix
npx eslint path/to/file.ts --fix

# Lint all files with auto-fix
npm run lint -- --fix
```

### Common Issues and Fixes

#### 1. Missing Trailing Comma

**Error:**
```
Missing trailing comma  @typescript-eslint/comma-dangle
```

**Fix:**
```typescript
// Before
const obj = {
  foo: 1,
  bar: 2
}

// After
const obj = {
  foo: 1,
  bar: 2,
}
```

#### 2. Use `import type` for Type Imports

**Error:**
```
All imports in the declaration are only used as types. Use `import type`
```

**Fix:**
```typescript
// Before
import { AgentType, Task } from './types';

// After
import type { AgentType, Task } from './types';
```

#### 3. Unexpected Empty Constructor

**Error:**
```
Unexpected empty constructor  @typescript-eslint/no-empty-function
```

**Fix:**
```typescript
// Before
class MyClass {
  constructor() {}
}

// After - Remove empty constructor
class MyClass {
  // No constructor needed
}
```

#### 4. No Floating Promises

**Error:**
```
Async method 'foo' has no 'await' expression  @typescript-eslint/require-await
```

**Fix:**
```typescript
// Before
async function foo() {
  doSomething();
}

// After - Remove async if not needed
function foo() {
  doSomething();
}

// Or add await
async function foo() {
  await doSomethingAsync();
}
```

#### 5. Prefer Nullish Coalescing

**Error:**
```
Prefer using nullish coalescing operator (`??`) instead of a logical or (`||`)
```

**Fix:**
```typescript
// Before
const value = foo || 'default';

// After
const value = foo ?? 'default';
```

**Why**: `??` only checks for `null` or `undefined`, while `||` also treats `0`, `false`, `''` as falsy.

---

## Integration with CI/CD

### GitHub Actions Workflow

```yaml
name: ESLint

on: [push, pull_request]

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      - run: npm ci
      - run: npm run lint
```

### Pre-commit Hook

Create `.husky/pre-commit`:

```bash
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

npm run lint
```

---

## VS Code Integration

### Recommended Extensions

- **ESLint** (`dbaeumer.vscode-eslint`) - Required

### VS Code Settings (`.vscode/settings.json`)

```json
{
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "eslint.validate": [
    "javascript",
    "typescript"
  ],
  "eslint.format.enable": true
}
```

---

## Performance Considerations

### Cache

ESLint caches results to improve performance. The cache is stored in `.eslintcache`.

```bash
# Use cache (default)
npm run lint

# Clear cache
rm .eslintcache
```

### Parallel Linting

For large projects, consider using `eslint-formatter-multiple` for parallel linting:

```bash
npx eslint . --ext .ts,.tsx --cache --cache-location .eslintcache
```

---

## Troubleshooting

### Issue: ESLint is too slow

**Solution:**
1. Enable cache: `npm run lint -- --cache`
2. Reduce scope: `npm run lint -- agents/`
3. Check ignore patterns in `.eslintrc.json`

### Issue: Too many warnings

**Solution:**
1. Fix auto-fixable issues: `npm run lint -- --fix`
2. Gradually increase strictness by changing `warn` to `error`
3. Use `// eslint-disable-next-line` for exceptional cases (sparingly)

### Issue: Rule conflicts with Prettier

**Solution:**
1. Install `eslint-config-prettier`: `npm install --save-dev eslint-config-prettier`
2. Add to `extends`: `"prettier"` (must be last)

---

## Migration Strategy

If migrating an existing codebase:

### Phase 1: Add Configuration (Week 1)
- Create `.eslintrc.json`
- Run ESLint to see current issues
- Document known issues

### Phase 2: Auto-fix (Week 2)
```bash
npm run lint -- --fix
```
- Fix formatting issues automatically
- Commit changes

### Phase 3: Manual Fixes (Weeks 3-4)
- Fix type safety issues (`@typescript-eslint/no-unsafe-*`)
- Fix complexity issues (refactor complex functions)
- Fix naming convention issues

### Phase 4: Enforce (Week 5)
- Change `warn` to `error` for critical rules
- Add pre-commit hook
- Add CI/CD integration

---

## Rule Severity Levels

- **error** (2): Build fails, must be fixed
- **warn** (1): Build succeeds, should be fixed
- **off** (0): Rule disabled

---

## Contributing

When adding new rules:

1. Document the rule in this guide
2. Explain the rationale
3. Provide examples (good/bad)
4. Consider impact on existing code
5. Test on at least 5 files before committing

---

## References

- [ESLint Official Documentation](https://eslint.org/docs/latest/)
- [TypeScript ESLint](https://typescript-eslint.io/)
- [Airbnb JavaScript Style Guide](https://github.com/airbnb/javascript)
- [Google TypeScript Style Guide](https://google.github.io/styleguide/tsguide.html)

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2025-10-14 | Initial configuration with 60+ rules |

---

**Maintained by**: Miyabi Development Team
**Last Updated**: 2025-10-14
**Related**: Issue #271 - ESLint Configuration Improvements
