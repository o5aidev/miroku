#!/usr/bin/env node
/**
 * Training Material Generator
 * Generates training materials and tutorials from code documentation
 */
/**
 * Training material structure
 */
export interface TrainingMaterial {
    title: string;
    description: string;
    level: 'beginner' | 'intermediate' | 'advanced';
    topics: string[];
    content: string;
    exercises?: Array<{
        question: string;
        hint?: string;
        solution?: string;
    }>;
}
/**
 * Generates training materials from code documentation
 */
export declare class TrainingMaterialGenerator {
    private owner;
    private repo;
    private octokit;
    private docGenerator;
    constructor(token: string, owner: string, repo: string);
    /**
     * Generate training material from a TypeScript file
     * @param filePath Path to the source file
     * @param level Difficulty level
     * @returns Generated training material
     */
    generateFromFile(filePath: string, level?: 'beginner' | 'intermediate' | 'advanced'): Promise<TrainingMaterial>;
    /**
     * Generate tutorial content for a function
     */
    private generateFunctionTutorial;
    /**
     * Generate tutorial content for a class
     */
    private generateClassTutorial;
    /**
     * Generate exercises based on the documentation
     */
    private generateExercises;
    /**
     * Generate training materials for a directory
     * @param dirPath Directory containing source files
     * @param outputDir Output directory for training materials
     */
    generateForDirectory(dirPath: string, outputDir: string): Promise<void>;
    /**
     * Publish training materials to GitHub Discussions
     * @param material Training material to publish
     * @param categoryId Discussion category ID
     */
    publishToDiscussions(material: TrainingMaterial, categoryId: string): Promise<void>;
    /**
     * Get all TypeScript files in a directory (non-recursive)
     */
    private getTypeScriptFiles;
    /**
     * Format title from filename
     */
    private formatTitle;
}
//# sourceMappingURL=training-material-generator.d.ts.map