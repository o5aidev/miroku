/**
 * WorktreeManager - Git Worktree Lifecycle Management
 *
 * Automates worktree creation, monitoring, and cleanup for parallel issue execution.
 * Integrates with CoordinatorAgent and WaterSpiderAgent.
 */

import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import type { Issue } from '../types/index.js';

/**
 * Worktree information
 */
export interface WorktreeInfo {
  issueNumber: number;
  path: string;
  branch: string;
  status: 'active' | 'idle' | 'completed' | 'failed' | 'cleanup';
  createdAt: string;
  lastActivityAt: string;
  sessionId: string;
  agentType?: string;
}

/**
 * WorktreeManager configuration
 */
export interface WorktreeManagerConfig {
  basePath: string; // e.g., '.worktrees'
  repoRoot: string; // Repository root path
  mainBranch?: string; // Default: 'main'
  branchPrefix?: string; // Default: 'issue-'
  autoCleanup?: boolean; // Auto-cleanup on completion
  maxIdleTime?: number; // Max idle time before cleanup (ms)
  enableLogging?: boolean;
}

/**
 * WorktreeManager - Manages Git Worktrees for parallel execution
 */
export class WorktreeManager {
  private config: WorktreeManagerConfig;
  private activeWorktrees: Map<number, WorktreeInfo>;

  constructor(config: WorktreeManagerConfig) {
    this.config = {
      mainBranch: 'main',
      branchPrefix: 'issue-',
      autoCleanup: true,
      maxIdleTime: 3600000, // 1 hour default
      enableLogging: true,
      ...config,
    };

    this.activeWorktrees = new Map();

    // Create base directory if not exists
    if (!fs.existsSync(this.config.basePath)) {
      fs.mkdirSync(this.config.basePath, { recursive: true });
      this.log(`📁 Created worktree base directory: ${this.config.basePath}`);
    }

    // Discover existing worktrees
    this.discoverWorktrees();
  }

  /**
   * Create a new worktree for an issue
   */
  async createWorktree(issue: Issue): Promise<WorktreeInfo> {
    const issueNumber = issue.number;

    // Check if worktree already exists
    if (this.activeWorktrees.has(issueNumber)) {
      const existing = this.activeWorktrees.get(issueNumber)!;
      this.log(`⚠️  Worktree already exists for issue #${issueNumber}: ${existing.path}`);
      return existing;
    }

    const branchName = `${this.config.branchPrefix}${issueNumber}`;
    const worktreePath = path.join(this.config.basePath, `issue-${issueNumber}`);

    try {
      // Check if branch exists remotely
      const remoteBranchExists = this.checkRemoteBranch(branchName);

      if (remoteBranchExists) {
        // Branch exists, checkout from remote
        this.log(`🔄 Checking out existing branch: ${branchName}`);
        execSync(`git worktree add ${worktreePath} ${branchName}`, {
          cwd: this.config.repoRoot,
          stdio: 'inherit',
        });
      } else {
        // Create new branch
        this.log(`🌿 Creating new branch: ${branchName}`);
        execSync(`git worktree add -b ${branchName} ${worktreePath} ${this.config.mainBranch}`, {
          cwd: this.config.repoRoot,
          stdio: 'inherit',
        });
      }

      const worktreeInfo: WorktreeInfo = {
        issueNumber,
        path: worktreePath,
        branch: branchName,
        status: 'active',
        createdAt: new Date().toISOString(),
        lastActivityAt: new Date().toISOString(),
        sessionId: `worktree-${issueNumber}-${Date.now()}`,
      };

      this.activeWorktrees.set(issueNumber, worktreeInfo);
      this.log(`✅ Created worktree for issue #${issueNumber}: ${worktreePath}`);

      return worktreeInfo;
    } catch (error: any) {
      this.log(`❌ Failed to create worktree for issue #${issueNumber}: ${error.message}`);
      throw new Error(`Failed to create worktree: ${error.message}`);
    }
  }

  /**
   * Remove a worktree
   */
  async removeWorktree(issueNumber: number): Promise<void> {
    const worktreeInfo = this.activeWorktrees.get(issueNumber);

    if (!worktreeInfo) {
      this.log(`⚠️  No worktree found for issue #${issueNumber}`);
      return;
    }

    try {
      // Check if worktree has uncommitted changes
      const hasChanges = this.hasUncommittedChanges(worktreeInfo.path);

      if (hasChanges) {
        this.log(`⚠️  Worktree has uncommitted changes: ${worktreeInfo.path}`);
        // Commit or stash changes before removal
        this.commitChanges(worktreeInfo.path, `chore: auto-commit before worktree cleanup for issue #${issueNumber}`);
      }

      // Remove worktree
      execSync(`git worktree remove ${worktreeInfo.path} --force`, {
        cwd: this.config.repoRoot,
        stdio: 'inherit',
      });

      this.activeWorktrees.delete(issueNumber);
      this.log(`✅ Removed worktree for issue #${issueNumber}`);
    } catch (error: any) {
      this.log(`❌ Failed to remove worktree for issue #${issueNumber}: ${error.message}`);
      throw new Error(`Failed to remove worktree: ${error.message}`);
    }
  }

  /**
   * Cleanup all worktrees
   */
  async cleanupAll(): Promise<void> {
    this.log('🧹 Cleaning up all worktrees...');

    const issues = Array.from(this.activeWorktrees.keys());

    for (const issueNumber of issues) {
      try {
        await this.removeWorktree(issueNumber);
      } catch (error: any) {
        this.log(`⚠️  Failed to cleanup worktree for issue #${issueNumber}: ${error.message}`);
      }
    }

    // Prune stale worktrees
    try {
      execSync('git worktree prune', {
        cwd: this.config.repoRoot,
        stdio: 'inherit',
      });
      this.log('✅ Pruned stale worktrees');
    } catch (error: any) {
      this.log(`⚠️  Failed to prune worktrees: ${error.message}`);
    }
  }

  /**
   * Discover existing worktrees
   */
  private discoverWorktrees(): void {
    try {
      const output = execSync('git worktree list --porcelain', {
        cwd: this.config.repoRoot,
        encoding: 'utf-8',
      });

      const lines = output.split('\n');
      let currentWorktree: Partial<WorktreeInfo> = {};

      for (const line of lines) {
        if (line.startsWith('worktree ')) {
          const worktreePath = line.replace('worktree ', '');

          // Check if this is an issue worktree
          const match = worktreePath.match(/issue-(\d+)/);
          if (match) {
            currentWorktree.path = worktreePath;
            currentWorktree.issueNumber = parseInt(match[1], 10);
          }
        } else if (line.startsWith('branch ')) {
          currentWorktree.branch = line.replace('branch ', '').replace('refs/heads/', '');
        } else if (line === '') {
          // End of worktree entry
          if (currentWorktree.issueNumber && currentWorktree.path && currentWorktree.branch) {
            const worktreeInfo: WorktreeInfo = {
              issueNumber: currentWorktree.issueNumber,
              path: currentWorktree.path,
              branch: currentWorktree.branch,
              status: 'active',
              createdAt: new Date().toISOString(),
              lastActivityAt: new Date().toISOString(),
              sessionId: `discovered-${currentWorktree.issueNumber}-${Date.now()}`,
            };

            this.activeWorktrees.set(currentWorktree.issueNumber, worktreeInfo);
            this.log(`🔍 Discovered worktree: ${currentWorktree.path}`);
          }

          currentWorktree = {};
        }
      }

      this.log(`📊 Discovered ${this.activeWorktrees.size} existing worktrees`);
    } catch (error: any) {
      this.log(`⚠️  Failed to discover worktrees: ${error.message}`);
    }
  }

  /**
   * Check if a remote branch exists
   */
  private checkRemoteBranch(branchName: string): boolean {
    try {
      execSync(`git ls-remote --heads origin ${branchName}`, {
        cwd: this.config.repoRoot,
        encoding: 'utf-8',
      });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Check if worktree has uncommitted changes
   */
  private hasUncommittedChanges(worktreePath: string): boolean {
    try {
      const output = execSync('git status --porcelain', {
        cwd: worktreePath,
        encoding: 'utf-8',
      });
      return output.trim().length > 0;
    } catch {
      return false;
    }
  }

  /**
   * Commit changes in worktree
   */
  private commitChanges(worktreePath: string, message: string): void {
    try {
      execSync('git add .', { cwd: worktreePath, stdio: 'ignore' });
      execSync(`git commit -m "${message}"`, { cwd: worktreePath, stdio: 'ignore' });
      this.log(`✅ Committed changes in worktree: ${worktreePath}`);
    } catch (error: any) {
      this.log(`⚠️  Failed to commit changes: ${error.message}`);
    }
  }

  /**
   * Get worktree info by issue number
   */
  getWorktree(issueNumber: number): WorktreeInfo | undefined {
    return this.activeWorktrees.get(issueNumber);
  }

  /**
   * Get all active worktrees
   */
  getAllWorktrees(): WorktreeInfo[] {
    return Array.from(this.activeWorktrees.values());
  }

  /**
   * Update worktree status
   */
  updateWorktreeStatus(issueNumber: number, status: WorktreeInfo['status']): void {
    const worktree = this.activeWorktrees.get(issueNumber);
    if (worktree) {
      worktree.status = status;
      worktree.lastActivityAt = new Date().toISOString();
      this.activeWorktrees.set(issueNumber, worktree);
      this.log(`📊 Updated worktree status for issue #${issueNumber}: ${status}`);
    }
  }

  /**
   * Check for idle worktrees and cleanup if needed
   */
  async cleanupIdleWorktrees(): Promise<void> {
    const now = Date.now();
    const maxIdleTime = this.config.maxIdleTime!;

    for (const [issueNumber, worktree] of this.activeWorktrees.entries()) {
      const lastActivity = new Date(worktree.lastActivityAt).getTime();
      const idleTime = now - lastActivity;

      if (idleTime > maxIdleTime && worktree.status === 'idle') {
        this.log(`⏱️  Worktree idle for ${Math.round(idleTime / 1000)}s, cleaning up: issue #${issueNumber}`);
        try {
          await this.removeWorktree(issueNumber);
        } catch (error: any) {
          this.log(`⚠️  Failed to cleanup idle worktree: ${error.message}`);
        }
      }
    }
  }

  /**
   * Push worktree branch to remote
   */
  async pushWorktree(issueNumber: number): Promise<void> {
    const worktree = this.activeWorktrees.get(issueNumber);

    if (!worktree) {
      throw new Error(`No worktree found for issue #${issueNumber}`);
    }

    try {
      execSync(`git push -u origin ${worktree.branch}`, {
        cwd: worktree.path,
        stdio: 'inherit',
      });

      this.log(`✅ Pushed worktree branch to remote: ${worktree.branch}`);
    } catch (error: any) {
      this.log(`❌ Failed to push worktree: ${error.message}`);
      throw new Error(`Failed to push worktree: ${error.message}`);
    }
  }

  /**
   * Merge worktree back to main branch
   */
  async mergeWorktree(issueNumber: number): Promise<void> {
    const worktree = this.activeWorktrees.get(issueNumber);

    if (!worktree) {
      throw new Error(`No worktree found for issue #${issueNumber}`);
    }

    try {
      // Switch to main branch
      execSync(`git checkout ${this.config.mainBranch}`, {
        cwd: this.config.repoRoot,
        stdio: 'inherit',
      });

      // Merge worktree branch
      execSync(`git merge ${worktree.branch}`, {
        cwd: this.config.repoRoot,
        stdio: 'inherit',
      });

      this.log(`✅ Merged worktree branch to ${this.config.mainBranch}: ${worktree.branch}`);

      // Cleanup worktree
      if (this.config.autoCleanup) {
        await this.removeWorktree(issueNumber);
      }
    } catch (error: any) {
      this.log(`❌ Failed to merge worktree: ${error.message}`);
      throw new Error(`Failed to merge worktree: ${error.message}`);
    }
  }

  /**
   * Get worktree statistics
   */
  getStatistics(): {
    total: number;
    active: number;
    idle: number;
    completed: number;
    failed: number;
    cleanup: number;
  } {
    const worktrees = this.getAllWorktrees();

    return {
      total: worktrees.length,
      active: worktrees.filter((w) => w.status === 'active').length,
      idle: worktrees.filter((w) => w.status === 'idle').length,
      completed: worktrees.filter((w) => w.status === 'completed').length,
      failed: worktrees.filter((w) => w.status === 'failed').length,
      cleanup: worktrees.filter((w) => w.status === 'cleanup').length,
    };
  }

  /**
   * Log message
   */
  private log(message: string): void {
    if (this.config.enableLogging) {
      console.log(`[WorktreeManager] ${message}`);
    }
  }
}
