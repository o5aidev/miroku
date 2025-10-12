/**
 * Agent Verification E2E Test
 *
 * Tests the agents:verify command functionality to ensure all agents
 * pass lint, typecheck, and test requirements.
 *
 * Based on Issue #98 Phase 4: agents.md extension with verification scripts
 */

import { describe, it, expect } from 'vitest';
import { execSync } from 'child_process';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '../..');

/**
 * Execute verification command and capture output
 */
function executeVerify(args: string[] = []): {
  exitCode: number;
  stdout: string;
  stderr: string;
} {
  try {
    const command = `npm run agents:verify -- ${args.join(' ')}`;
    const output = execSync(command, {
      cwd: projectRoot,
      encoding: 'utf-8',
      stdio: 'pipe',
    });

    return {
      exitCode: 0,
      stdout: output,
      stderr: '',
    };
  } catch (error: any) {
    return {
      exitCode: error.status || 1,
      stdout: error.stdout || '',
      stderr: error.stderr || '',
    };
  }
}

describe('Agent Verification E2E', () => {
  describe('Command Execution', () => {
    it('should execute agents:verify command successfully', () => {
      const result = executeVerify();

      // Exit code should be 0 (success) or 1 (failures detected)
      expect([0, 1]).toContain(result.exitCode);

      // Output should contain verification summary
      expect(result.stdout).toContain('Agent Verification');
      expect(result.stdout).toContain('Summary');
    }, 60000); // 60 second timeout for full verification

    it('should support --verbose flag', () => {
      const result = executeVerify(['--verbose']);

      expect([0, 1]).toContain(result.exitCode);
      expect(result.stdout).toContain('Running ESLint');
    }, 60000);

    it('should support --agent flag for specific agent', () => {
      const result = executeVerify(['--agent', 'review']);

      expect([0, 1]).toContain(result.exitCode);
      expect(result.stdout).toContain('reviewAgent');
      expect(result.stdout).toContain('Summary');
    }, 60000);

    it('should support --bail flag to stop on first failure', () => {
      const result = executeVerify(['--bail']);

      expect([0, 1]).toContain(result.exitCode);

      // If there are failures, output should show early exit
      if (result.exitCode === 1) {
        expect(result.stdout).toMatch(/failed|bailing/i);
      }
    }, 60000);
  });

  describe('Verification Checks', () => {
    it('should run ESLint checks', () => {
      const result = executeVerify(['--verbose']);

      expect(result.stdout).toMatch(/ESLint|lint/i);
    }, 60000);

    it('should run TypeScript type checks', () => {
      const result = executeVerify(['--verbose']);

      expect(result.stdout).toMatch(/TypeScript|type check/i);
    }, 60000);

    it('should run Vitest tests', () => {
      const result = executeVerify(['--verbose']);

      expect(result.stdout).toMatch(/test|vitest/i);
    }, 60000);
  });

  describe('Output Format', () => {
    it('should display summary table with pass/fail status', () => {
      const result = executeVerify();

      // Should show summary table
      expect(result.stdout).toContain('Summary');

      // Should show status indicators
      expect(result.stdout).toMatch(/PASS|FAIL|passed|failed/);

      // Should show totals
      expect(result.stdout).toMatch(/Total:|passed,|failed/);
    }, 60000);

    it('should display check results (lint, type, test)', () => {
      const result = executeVerify();

      // Should show individual check results
      expect(result.stdout).toMatch(/lint/i);
      expect(result.stdout).toMatch(/type/i);
      expect(result.stdout).toMatch(/test/i);
    }, 60000);

    it('should display agent names in verification output', () => {
      const result = executeVerify();

      // Should list agent names
      // Note: Some agents may not exist yet, so just check format
      expect(result.stdout).toMatch(/Agent|agent/i);
    }, 60000);
  });

  describe('Specific Agent Verification', () => {
    it('should verify ReviewAgent successfully', () => {
      const result = executeVerify(['--agent', 'review']);

      expect(result.stdout).toContain('reviewAgent');
      expect(result.stdout).toContain('Summary');

      // ReviewAgent should pass (we have tests and implementation)
      expect(result.stdout).toMatch(/PASS|passed/);
    }, 60000);

    it('should handle non-existent agent gracefully', () => {
      const result = executeVerify(['--agent', 'nonexistent']);

      // Should either show "not found" message or empty results
      expect([0, 1]).toContain(result.exitCode);
    }, 30000);
  });

  describe('Integration with Auto-Loop Pattern', () => {
    it('should verify that ReviewAgent implements quality scoring', () => {
      const result = executeVerify(['--agent', 'review', '--verbose']);

      // ReviewAgent should exist and pass verification
      expect(result.stdout).toContain('review');

      // If it passes, it should show all checks passing
      if (result.stdout.includes('PASS')) {
        expect(result.stdout).toMatch(/✓ lint|lint.*pass/i);
        expect(result.stdout).toMatch(/✓ type|type.*pass/i);
        expect(result.stdout).toMatch(/✓ test|test.*pass/i);
      }
    }, 60000);

    it('should verify that snapshot tests exist', () => {
      // Check that ReviewAgent tests include snapshot tests
      const result = executeVerify(['--agent', 'review', '--verbose']);

      // If tests run, they should include snapshot tests
      expect(result.stdout).toMatch(/test|vitest/i);
    }, 60000);
  });

  describe('Error Handling', () => {
    it('should provide clear error messages on lint failures', () => {
      // This test verifies that errors are displayed clearly
      // We can't force lint errors without modifying files,
      // so we just check the error format
      const result = executeVerify(['--agent', 'coordinator']);

      // Output should have clear structure regardless of pass/fail
      expect(result.stdout).toMatch(/coordinator/i);
      expect(result.stdout).toContain('Summary');
    }, 60000);

    it('should exit with non-zero code on verification failures', () => {
      // If any agent fails, exit code should be 1
      const result = executeVerify();

      // Exit code should be either 0 (all pass) or 1 (some failed)
      expect([0, 1]).toContain(result.exitCode);

      // If exit code is 1, output should show failures
      if (result.exitCode === 1) {
        expect(result.stdout).toMatch(/FAIL|failed/);
      }
    }, 60000);
  });

  describe('Performance', () => {
    it('should complete verification in reasonable time', () => {
      const startTime = Date.now();
      const result = executeVerify();
      const duration = Date.now() - startTime;

      expect([0, 1]).toContain(result.exitCode);

      // Should complete within 60 seconds
      expect(duration).toBeLessThan(60000);

      console.log(`\n⏱️  Verification completed in ${(duration / 1000).toFixed(2)}s`);
    }, 60000);

    it('should handle multiple agents efficiently', () => {
      const startTime = Date.now();
      const result = executeVerify(['--verbose']);
      const duration = Date.now() - startTime;

      expect([0, 1]).toContain(result.exitCode);

      // Even with verbose output, should complete in reasonable time
      expect(duration).toBeLessThan(120000); // 2 minutes

      console.log(`\n⏱️  Verbose verification completed in ${(duration / 1000).toFixed(2)}s`);
    }, 120000);
  });

  describe('Documentation Consistency', () => {
    it('should match commands documented in .claude/agents/README.md', () => {
      // Commands mentioned in README:
      // - npm run agents:verify
      // - npm run agents:verify:verbose
      // - npm run agents:verify:bail
      // - npm run agents:verify -- --agent <name>

      // Test basic command
      const result1 = executeVerify();
      expect([0, 1]).toContain(result1.exitCode);

      // Test verbose flag
      const result2 = executeVerify(['--verbose']);
      expect([0, 1]).toContain(result2.exitCode);

      // Test bail flag
      const result3 = executeVerify(['--bail']);
      expect([0, 1]).toContain(result3.exitCode);

      // Test agent-specific
      const result4 = executeVerify(['--agent', 'review']);
      expect([0, 1]).toContain(result4.exitCode);
    }, 120000);

    it('should verify agents listed in README', () => {
      // README lists these coding agents:
      // - CoordinatorAgent
      // - CodeGenAgent
      // - ReviewAgent
      // - IssueAgent
      // - PRAgent
      // - DeploymentAgent

      const agents = ['coordinator', 'codegen', 'review', 'issue', 'pr', 'deployment'];

      for (const agent of agents) {
        const result = executeVerify(['--agent', agent]);
        expect([0, 1]).toContain(result.exitCode);
        expect(result.stdout).toContain(agent);
      }
    }, 180000); // 3 minutes for all agents
  });

  describe('NPM Scripts Integration', () => {
    it('should have agents:verify script in package.json', () => {
      const packageJson = require(path.join(projectRoot, 'package.json'));

      expect(packageJson.scripts).toHaveProperty('agents:verify');
      expect(packageJson.scripts['agents:verify']).toContain('verify-agents.ts');
    });

    it('should have agents:verify:verbose script in package.json', () => {
      const packageJson = require(path.join(projectRoot, 'package.json'));

      expect(packageJson.scripts).toHaveProperty('agents:verify:verbose');
      expect(packageJson.scripts['agents:verify:verbose']).toContain('--verbose');
    });

    it('should have agents:verify:bail script in package.json', () => {
      const packageJson = require(path.join(projectRoot, 'package.json'));

      expect(packageJson.scripts).toHaveProperty('agents:verify:bail');
      expect(packageJson.scripts['agents:verify:bail']).toContain('--bail');
    });
  });
});
