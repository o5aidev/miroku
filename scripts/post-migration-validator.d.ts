/**
 * Validator to ensure migration was successful
 */
export declare class MigrationValidator {
    private readonly agentsDir;
    private readonly claudeDir;
    /**
     * Validate the migration results
     */
    validate(): Promise<boolean>;
    /**
     * Check if agents directory exists and has content
     */
    private checkAgentsDirectoryExists;
    /**
     * Check if .claude directory was removed
     */
    private checkClaudeDirectoryRemoved;
    /**
     * Check file integrity by comparing file counts
     */
    private checkFileIntegrity;
    /**
     * Check import statements have been updated
     */
    private checkImportStatements;
    /**
     * Check TypeScript compilation
     */
    private checkTypeScriptCompilation;
    /**
     * Get all files recursively
     */
    private getAllFiles;
}
//# sourceMappingURL=post-migration-validator.d.ts.map