#!/usr/bin/env node
/**
 * AI-Powered Documentation Generator
 * Automatically generates comprehensive documentation from TypeScript/JavaScript code
 *
 * Features:
 * - TypeScript AST parsing
 * - JSDoc comment extraction
 * - Markdown documentation generation
 * - Usage example generation
 * - Auto-update on code changes
 */
/**
 * Represents a documented function or method
 */
export interface FunctionDoc {
    name: string;
    description: string;
    parameters: Array<{
        name: string;
        type: string;
        description?: string;
    }>;
    returnType: string;
    returnDescription?: string;
    examples?: string[];
    isAsync: boolean;
    isExported: boolean;
}
/**
 * Represents a documented class
 */
export interface ClassDoc {
    name: string;
    description: string;
    methods: FunctionDoc[];
    properties: Array<{
        name: string;
        type: string;
        description?: string;
    }>;
    isExported: boolean;
}
/**
 * Represents a documented interface
 */
export interface InterfaceDoc {
    name: string;
    description: string;
    properties: Array<{
        name: string;
        type: string;
        description?: string;
        optional: boolean;
    }>;
    isExported: boolean;
}
/**
 * Main documentation generator class
 */
export declare class DocGenerator {
    constructor();
    /**
     * Extract JSDoc comments from a TypeScript file
     * @param filePath Path to the TypeScript file
     * @returns Array of extracted documentation objects
     */
    extractJSDoc(filePath: string): Promise<Array<FunctionDoc | ClassDoc | InterfaceDoc>>;
    /**
     * Extract documentation from a function declaration
     */
    private extractFunctionDoc;
    /**
     * Extract documentation from a class declaration
     */
    private extractClassDoc;
    /**
     * Extract documentation from a method declaration
     */
    private extractMethodDoc;
    /**
     * Extract documentation from a property declaration
     */
    private extractPropertyDoc;
    /**
     * Extract documentation from an interface declaration
     */
    private extractInterfaceDoc;
    /**
     * Generate markdown documentation from extracted docs
     * @param docs Array of documentation objects
     * @param outputPath Path to write the markdown file
     */
    generateMarkdown(docs: Array<FunctionDoc | ClassDoc | InterfaceDoc>, outputPath: string): Promise<void>;
    /**
     * Generate markdown for a function
     */
    private generateFunctionMarkdown;
    /**
     * Generate markdown for a class
     */
    private generateClassMarkdown;
    /**
     * Generate markdown for an interface
     */
    private generateInterfaceMarkdown;
    /**
     * Generate documentation for all TypeScript files in a directory
     * @param dirPath Directory to scan
     * @param outputPath Output markdown file path
     * @param recursive Whether to scan subdirectories
     */
    generateDocsForDirectory(dirPath: string, outputPath: string, recursive?: boolean): Promise<void>;
    /**
     * Get all TypeScript files in a directory
     */
    private getTypeScriptFiles;
    /**
     * Watch directory for changes and regenerate docs
     * @param dirPath Directory to watch
     * @param outputPath Output markdown file path
     */
    watchAndGenerate(dirPath: string, outputPath: string): void;
}
//# sourceMappingURL=doc-generator.d.ts.map