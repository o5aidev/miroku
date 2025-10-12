/**
 * Lock Manager - File-level conflict prevention
 *
 * Responsibilities:
 * - File-level locking
 * - Conflict detection
 * - Timeout management
 * - Heartbeat renewal
 */
export interface FileLock {
    file: string;
    taskId: string;
    workerId: string;
    acquiredAt: Date;
    expiresAt: Date;
    lastHeartbeat: Date;
}
export interface LockResult {
    success: boolean;
    error?: string;
    conflictingLocks?: FileLock[];
}
export declare class LockManager {
    private locks;
    private lockDir;
    private lockTimeout;
    constructor(lockDir?: string);
    /**
     * Acquire locks for files
     */
    acquireLocks(taskId: string, workerId: string, files: string[]): Promise<LockResult>;
    /**
     * Release locks for task
     */
    releaseLocks(taskId: string): Promise<void>;
    /**
     * Renew locks (heartbeat)
     */
    renewLocks(taskId: string): Promise<boolean>;
    /**
     * Check for file conflicts
     */
    checkConflicts(files: string[]): FileLock[];
    /**
     * Get locks for task
     */
    getTaskLocks(taskId: string): FileLock[];
    /**
     * Get all active locks
     */
    getAllLocks(): FileLock[];
    /**
     * Clean up expired locks
     */
    cleanupExpiredLocks(): Promise<number>;
    /**
     * Check if lock is expired
     */
    private isLockExpired;
    /**
     * Ensure lock directory exists
     */
    private ensureLockDir;
    /**
     * Write lock file to disk
     */
    private writeLockFile;
    /**
     * Delete lock file from disk
     */
    private deleteLockFile;
    /**
     * Get lock file name from file path
     */
    private getLockFileName;
    /**
     * Load locks from disk (on startup)
     */
    loadLocksFromDisk(): Promise<number>;
    /**
     * Get lock statistics
     */
    getStatistics(): {
        total: number;
        active: number;
        expired: number;
    };
}
//# sourceMappingURL=lock-manager.d.ts.map