/**
 * Security Scanner Tests
 *
 * Tests for Strategy Pattern implementation
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  SecurityScanner,
  SecretsScanner,
  VulnerabilityScanner,
  NpmAuditScanner,
  SecurityScannerRegistry,
} from '../agents/review/security-scanner.js';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

describe('SecurityScanner - Strategy Pattern', () => {
  let tempDir: string;
  let testFile: string;

  beforeEach(async () => {
    // Create temporary directory and file
    tempDir = await fs.promises.mkdtemp(path.join(os.tmpdir(), 'security-test-'));
    testFile = path.join(tempDir, 'test.ts');
  });

  afterEach(async () => {
    // Clean up
    try {
      await fs.promises.rm(tempDir, { recursive: true, force: true });
    } catch (error) {
      // Ignore cleanup errors
    }
  });

  describe('SecretsScanner', () => {
    it('should detect hardcoded API keys', async () => {
      const scanner = new SecretsScanner();

      await fs.promises.writeFile(testFile, `
        const apiKey = "sk-abcdefghij1234567890123456789012345";
        const password = "my-secret-password";
      `);

      const issues = await scanner.scan([testFile]);

      expect(issues.length).toBeGreaterThan(0);
      expect(issues.some(i => i.message.includes('Anthropic API Key'))).toBe(true);
      expect(issues.some(i => i.message.includes('Password'))).toBe(true);
      expect(issues.every(i => i.severity === 'critical')).toBe(true);
    });

    it('should return empty array for clean files', async () => {
      const scanner = new SecretsScanner();

      await fs.promises.writeFile(testFile, `
        const greeting = "Hello, World!";
        function add(a: number, b: number): number {
          return a + b;
        }
      `);

      const issues = await scanner.scan([testFile]);

      expect(issues).toEqual([]);
    });
  });

  describe('VulnerabilityScanner', () => {
    it('should detect eval() usage', async () => {
      const scanner = new VulnerabilityScanner();

      await fs.promises.writeFile(testFile, `
        const result = eval("2 + 2");
        document.innerHTML = userInput;
      `);

      const issues = await scanner.scan([testFile]);

      expect(issues.length).toBeGreaterThan(0);
      expect(issues.some(i => i.message.includes('eval()'))).toBe(true);
      expect(issues.some(i => i.message.includes('innerHTML'))).toBe(true);
    });

    it('should return empty array for safe code', async () => {
      const scanner = new VulnerabilityScanner();

      await fs.promises.writeFile(testFile, `
        const safeCode = JSON.parse('{"key": "value"}');
        const element = document.createElement('div');
      `);

      const issues = await scanner.scan([testFile]);

      expect(issues).toEqual([]);
    });
  });

  describe('NpmAuditScanner', () => {
    it('should execute without throwing errors', async () => {
      const scanner = new NpmAuditScanner();

      // Should not throw even if npm audit fails
      await expect(scanner.scan([testFile])).resolves.toBeDefined();
    });
  });

  describe('SecurityScannerRegistry', () => {
    it('should have default scanners registered', () => {
      const scanners = SecurityScannerRegistry.getAll();

      expect(scanners.length).toBeGreaterThanOrEqual(3);
      expect(scanners.some(s => s.name === 'SecretsScanner')).toBe(true);
      expect(scanners.some(s => s.name === 'VulnerabilityScanner')).toBe(true);
      expect(scanners.some(s => s.name === 'NpmAuditScanner')).toBe(true);
    });

    it('should retrieve scanner by name', () => {
      const scanner = SecurityScannerRegistry.get('SecretsScanner');

      expect(scanner).toBeDefined();
      expect(scanner?.name).toBe('SecretsScanner');
    });

    it('should allow registering custom scanners', () => {
      class CustomScanner implements SecurityScanner {
        readonly name = 'CustomScanner';
        async scan(): Promise<any[]> {
          return [];
        }
      }

      const customScanner = new CustomScanner();
      SecurityScannerRegistry.register(customScanner);

      const retrieved = SecurityScannerRegistry.get('CustomScanner');
      expect(retrieved).toBeDefined();
      expect(retrieved?.name).toBe('CustomScanner');
    });
  });

  describe('Strategy Pattern Benefits', () => {
    it('should run all scanners in parallel via registry', async () => {
      await fs.promises.writeFile(testFile, `
        const apiKey = "sk-ant-test";
        const result = eval("code");
      `);

      const scanners = SecurityScannerRegistry.getAll();
      const startTime = Date.now();

      // Run all scanners in parallel (mimicking ReviewAgent behavior)
      const results = await Promise.all(
        scanners.map(scanner => scanner.scan([testFile]))
      );

      const duration = Date.now() - startTime;
      const allIssues = results.flat();

      // Should complete quickly (parallel execution)
      expect(duration).toBeLessThan(5000);

      // Should find issues from multiple scanners
      expect(allIssues.length).toBeGreaterThan(0);
    });
  });
});
