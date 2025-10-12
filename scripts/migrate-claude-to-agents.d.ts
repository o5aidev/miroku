/**
 * Migration script to move files from .claude/ to agents/
 */
export declare class ClaudeToAgentsMigration {
    private readonly sourceDir;
    private readonly targetDir;
    private readonly backupDir;
    /**
     * Execute the migration process
     */
    execute(): Promise<void>;
    /**
     * Validate source and target directories
     */
    private validateDirectories;
    /**
     * Create backup of existing .claude directory
     */
    private createBackup;
    /**
     * Migrate files from .claude to agents
     */
    private migrateFiles;
    /**
     * Update import statements in migrated files
     */
    private updateImports;
    /**
     * Update import statements in a single file
     */
    private updateFileImports;
    /**
     * Clean up old .claude directory
     */
    private cleanup;
    /**
     * Rollback migration in case of failure
     */
    private rollback;
    /**
     * Get all files in a directory recursively
     */
    private getAllFiles;
    /**
     * Copy directory recursively
     */
    private copyDirectory;
    /**
     * Check if file or directory exists
     */
    private exists;
}
//# sourceMappingURL=migrate-claude-to-agents.d.ts.map