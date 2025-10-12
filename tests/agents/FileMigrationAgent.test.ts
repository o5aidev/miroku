import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { FileMigrationAgent } from '../../src/agents/FileMigrationAgent.js';
import { AgentConfig, Task, TaskType, AgentType } from '../../src/types/index.js';
import * as fs from 'fs/promises';
import * as fsSync from 'fs';
import * as path from 'path';
import * as os from 'os';

describe('FileMigrationAgent', () => {
  let agent: FileMigrationAgent;
  let testDir: string;
  let claudeDir: string;
  let commandsDir: string;

  beforeEach(async () => {
    // Create temporary test directory
    testDir = await fs.mkdtemp(path.join(os.tmpdir(), 'miyabi-test-'));
    claudeDir = path.join(testDir, '.claude');
    commandsDir = path.join(testDir, 'commands');

    // Change to test directory
    process.chdir(testDir);

    const config: AgentConfig = {
      verbose: false,
      dryRun: false,
      timeout: 10000,
    };

    agent = new FileMigrationAgent(config);
  });

  afterEach(async () => {
    // Clean up test directory
    if (fsSync.existsSync(testDir)) {
      await fs.rmdir(testDir, { recursive: true });
    }
  });

  it('should successfully migrate files from .claude/ to commands/', async () => {
    // Setup test files
    await fs.mkdir(claudeDir, { recursive: true });
    await fs.writeFile(path.join(claudeDir, 'test1.txt'), 'Test content 1');
    await fs.writeFile(path.join(claudeDir, 'test2.js'), 'console.log("test");');
    
    // Create subdirectory
    const subDir = path.join(claudeDir, 'subdir');
    await fs.mkdir(subDir);
    await fs.writeFile(path.join(subDir, 'test3.md'), '# Test');

    const task: Task = {
      id: 'test-migrate',
      type: TaskType.FILE_MIGRATION,
      description: 'Test migration',
      priority: 1,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    const result = await agent.execute(task);

    expect(result.success).toBe(true);
    expect(result.message).toContain('Successfully migrated 3 files');
    
    // Verify files were migrated
    expect(fsSync.existsSync(path.join(commandsDir, 'test1.txt'))).toBe(true);
    expect(fsSync.existsSync(path.join(commandsDir, 'test2.js'))).toBe(true);
    expect(fsSync.existsSync(path.join(commandsDir, 'subdir', 'test3.md'))).toBe(true);
    
    // Verify original files are removed
    expect(fsSync.existsSync(claudeDir)).toBe(false);
  });

  it('should handle empty source directory gracefully', async () => {
    await fs.mkdir(claudeDir, { recursive: true });

    const task: Task = {
      id: 'test-empty',
      type: TaskType.FILE_MIGRATION,
      description: 'Test empty migration',
      priority: 1,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    const result = await agent.execute(task);

    expect(result.success).toBe(true);
    expect(result.message).toBe('No files to migrate');
  });

  it('should fail when source directory does not exist', async () => {
    const task: Task = {
      id: 'test-no-source',
      type: TaskType.FILE_MIGRATION,
      description: 'Test no source',
      priority: 1,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    const result = await agent.execute(task);

    expect(result.success).toBe(false);
    expect(result.message).toContain('does not exist');
  });

  it('should preserve file content integrity', async () => {
    const testContent = 'This is a test file with special characters: !@#$%^&*()';
    
    await fs.mkdir(claudeDir, { recursive: true });
    await fs.writeFile(path.join(claudeDir, 'integrity-test.txt'), testContent, 'utf8');

    const task: Task = {
      id: 'test-integrity',
      type: TaskType.FILE_MIGRATION,
      description: 'Test integrity',
      priority: 1,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    const result = await agent.execute(task);

    expect(result.success).toBe(true);
    
    const migratedContent = await fs.readFile(
      path.join(commandsDir, 'integrity-test.txt'), 
      'utf8'
    );
    
    expect(migratedContent).toBe(testContent);
  });
});