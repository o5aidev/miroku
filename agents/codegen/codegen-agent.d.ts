/**
 * CodeGenAgent - AI-Driven Code Generation Agent
 *
 * Responsibilities:
 * - Generate code from specifications
 * - Generate unit tests automatically
 * - Generate documentation
 * - Ensure TypeScript type safety
 * - Follow existing code patterns
 *
 * Uses Claude Code integration via Worktree execution
 */
import { BaseAgent } from '../base-agent.js';
import { AgentResult, AgentConfig, Task } from '../types/index.js';
export declare class CodeGenAgent extends BaseAgent {
    constructor(config: AgentConfig);
    /**
     * Main execution: Generate code from task specification
     */
    execute(task: Task): Promise<AgentResult>;
    /**
     * Create code specification from task
     */
    private createCodeSpec;
    /**
     * Extract requirements from task description
     */
    private extractRequirements;
    /**
     * Get list of existing files in project
     */
    private getExistingFiles;
    /**
     * Detect architecture patterns from existing code
     */
    private getArchitecturePatterns;
    /**
     * Get project dependencies
     */
    private getDependencies;
    /**
     * Analyze existing codebase for context
     */
    private analyzeCodebase;
    /**
     * Generate code using template-based generation
     *
     * Generates files based on task type and specifications.
     * Supports Discord community files, documentation, and configuration.
     */
    private generateCode;
    /**
     * Identify files that can be automatically generated from spec
     */
    private identifyGeneratableFiles;
    /**
     * Generate content for a specific file based on its type
     */
    private generateFileContent;
    /**
     * Generate Discord welcome message
     */
    private generateDiscordWelcome;
    /**
     * Generate Discord community rules
     */
    private generateDiscordRules;
    /**
     * Generate Discord FAQ
     */
    private generateDiscordFAQ;
    /**
     * Generate Discord server configuration JSON
     */
    private generateDiscordConfig;
    /**
     * Add Discord badge to existing README.md
     */
    private addDiscordBadgeToReadme;
    /**
     * Generate GitHub Actions workflow
     */
    private generateGitHubWorkflow;
    /**
     * Generate configuration JSON
     */
    private generateConfigJSON;
    /**
     * Extract project name from spec or current directory
     */
    private extractProjectName;
    /**
     * Generate unit tests (stub - requires Claude Code worktree execution)
     */
    private generateTests;
    /**
     * Generate documentation (stub - requires Claude Code worktree execution)
     */
    private generateDocumentation;
    /**
     * Validate generated code (syntax check, etc.)
     */
    private validateCode;
    /**
     * Write generated files to disk
     */
    private writeGeneratedFiles;
    /**
     * Calculate code generation metrics
     */
    private calculateMetrics;
    /**
     * Check if file exists
     */
    private fileExists;
    /**
     * Check if error is architecture-related
     */
    private isArchitectureIssue;
}
//# sourceMappingURL=codegen-agent.d.ts.map