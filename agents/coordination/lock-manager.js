/**
 * Lock Manager - File-level conflict prevention
 *
 * Responsibilities:
 * - File-level locking
 * - Conflict detection
 * - Timeout management
 * - Heartbeat renewal
 */
import * as fs from 'fs';
import * as path from 'path';
export class LockManager {
    locks = new Map();
    lockDir;
    lockTimeout = 60 * 60 * 1000; // 60 minutes
    constructor(lockDir = '.task-locks') {
        this.lockDir = lockDir;
        this.ensureLockDir();
    }
    /**
     * Acquire locks for files
     */
    async acquireLocks(taskId, workerId, files) {
        // Check for existing locks
        const conflicts = this.checkConflicts(files);
        if (conflicts.length > 0) {
            return {
                success: false,
                error: 'File conflicts detected',
                conflictingLocks: conflicts,
            };
        }
        // Acquire all locks
        const now = new Date();
        const expiresAt = new Date(now.getTime() + this.lockTimeout);
        for (const file of files) {
            const lock = {
                file,
                taskId,
                workerId,
                acquiredAt: now,
                expiresAt,
                lastHeartbeat: now,
            };
            this.locks.set(file, lock);
            // Write lock file to disk
            await this.writeLockFile(file, lock);
        }
        console.log(`[LockManager] Acquired ${files.length} lock(s) for task ${taskId}`);
        return { success: true };
    }
    /**
     * Release locks for task
     */
    async releaseLocks(taskId) {
        const locksToRelease = [];
        // Find all locks for this task
        for (const [file, lock] of this.locks.entries()) {
            if (lock.taskId === taskId) {
                locksToRelease.push(file);
            }
        }
        // Release each lock
        for (const file of locksToRelease) {
            this.locks.delete(file);
            await this.deleteLockFile(file);
        }
        console.log(`[LockManager] Released ${locksToRelease.length} lock(s) for task ${taskId}`);
    }
    /**
     * Renew locks (heartbeat)
     */
    async renewLocks(taskId) {
        let renewed = false;
        const now = new Date();
        const newExpiresAt = new Date(now.getTime() + this.lockTimeout);
        for (const [file, lock] of this.locks.entries()) {
            if (lock.taskId === taskId) {
                lock.lastHeartbeat = now;
                lock.expiresAt = newExpiresAt;
                // Update lock file
                await this.writeLockFile(file, lock);
                renewed = true;
            }
        }
        if (renewed) {
            console.log(`[LockManager] Renewed locks for task ${taskId}`);
        }
        return renewed;
    }
    /**
     * Check for file conflicts
     */
    checkConflicts(files) {
        const conflicts = [];
        for (const file of files) {
            const lock = this.locks.get(file);
            if (lock && !this.isLockExpired(lock)) {
                conflicts.push(lock);
            }
        }
        return conflicts;
    }
    /**
     * Get locks for task
     */
    getTaskLocks(taskId) {
        const taskLocks = [];
        for (const lock of this.locks.values()) {
            if (lock.taskId === taskId) {
                taskLocks.push(lock);
            }
        }
        return taskLocks;
    }
    /**
     * Get all active locks
     */
    getAllLocks() {
        return Array.from(this.locks.values()).filter(lock => !this.isLockExpired(lock));
    }
    /**
     * Clean up expired locks
     */
    async cleanupExpiredLocks() {
        const expiredFiles = [];
        for (const [file, lock] of this.locks.entries()) {
            if (this.isLockExpired(lock)) {
                expiredFiles.push(file);
            }
        }
        // Remove expired locks
        for (const file of expiredFiles) {
            this.locks.delete(file);
            await this.deleteLockFile(file);
        }
        if (expiredFiles.length > 0) {
            console.log(`[LockManager] Cleaned up ${expiredFiles.length} expired lock(s)`);
        }
        return expiredFiles.length;
    }
    /**
     * Check if lock is expired
     */
    isLockExpired(lock) {
        return new Date() > lock.expiresAt;
    }
    /**
     * Ensure lock directory exists
     */
    ensureLockDir() {
        if (!fs.existsSync(this.lockDir)) {
            fs.mkdirSync(this.lockDir, { recursive: true });
        }
    }
    /**
     * Write lock file to disk
     */
    async writeLockFile(file, lock) {
        const lockFileName = this.getLockFileName(file);
        const lockFilePath = path.join(this.lockDir, lockFileName);
        const lockData = {
            file: lock.file,
            taskId: lock.taskId,
            workerId: lock.workerId,
            acquiredAt: lock.acquiredAt.toISOString(),
            expiresAt: lock.expiresAt.toISOString(),
            lastHeartbeat: lock.lastHeartbeat.toISOString(),
        };
        fs.writeFileSync(lockFilePath, JSON.stringify(lockData, null, 2));
    }
    /**
     * Delete lock file from disk
     */
    async deleteLockFile(file) {
        const lockFileName = this.getLockFileName(file);
        const lockFilePath = path.join(this.lockDir, lockFileName);
        if (fs.existsSync(lockFilePath)) {
            fs.unlinkSync(lockFilePath);
        }
    }
    /**
     * Get lock file name from file path
     */
    getLockFileName(file) {
        // Convert file path to safe filename
        return file.replace(/[^a-zA-Z0-9]/g, '_') + '.lock';
    }
    /**
     * Load locks from disk (on startup)
     */
    async loadLocksFromDisk() {
        if (!fs.existsSync(this.lockDir)) {
            return 0;
        }
        const lockFiles = fs.readdirSync(this.lockDir).filter(f => f.endsWith('.lock'));
        let loaded = 0;
        for (const lockFile of lockFiles) {
            try {
                const lockFilePath = path.join(this.lockDir, lockFile);
                const lockData = JSON.parse(fs.readFileSync(lockFilePath, 'utf8'));
                const lock = {
                    file: lockData.file,
                    taskId: lockData.taskId,
                    workerId: lockData.workerId,
                    acquiredAt: new Date(lockData.acquiredAt),
                    expiresAt: new Date(lockData.expiresAt),
                    lastHeartbeat: new Date(lockData.lastHeartbeat),
                };
                // Only load if not expired
                if (!this.isLockExpired(lock)) {
                    this.locks.set(lock.file, lock);
                    loaded++;
                }
                else {
                    // Delete expired lock file
                    fs.unlinkSync(lockFilePath);
                }
            }
            catch (error) {
                console.error(`[LockManager] Error loading lock file ${lockFile}:`, error);
            }
        }
        if (loaded > 0) {
            console.log(`[LockManager] Loaded ${loaded} lock(s) from disk`);
        }
        return loaded;
    }
    /**
     * Get lock statistics
     */
    getStatistics() {
        const stats = {
            total: this.locks.size,
            active: 0,
            expired: 0,
        };
        for (const lock of this.locks.values()) {
            if (this.isLockExpired(lock)) {
                stats.expired++;
            }
            else {
                stats.active++;
            }
        }
        return stats;
    }
}
//# sourceMappingURL=lock-manager.js.map