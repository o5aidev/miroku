/**
 * Demo generation script for creating screenshots and GIFs
 * Captures the Miyabi CLI in action for documentation purposes
 */
export declare class DemoGenerator {
    private readonly assetsDir;
    private readonly screenshotsDir;
    private readonly gifsDir;
    constructor();
    /**
     * Ensure asset directories exist
     */
    private ensureDirectories;
    /**
     * Generate all demo assets
     */
    generateAll(): Promise<void>;
    /**
     * Capture quick start demo
     */
    private captureQuickStart;
    /**
     * Capture agent workflow demonstration
     */
    private captureAgentWorkflow;
    /**
     * Capture project structure visualization
     */
    private captureProjectStructure;
    /**
     * Generate architecture diagram
     */
    private generateArchitectureDiagram;
    /**
     * Create demo recording instructions
     */
    generateRecordingInstructions(): void;
}
//# sourceMappingURL=generate-demo.d.ts.map