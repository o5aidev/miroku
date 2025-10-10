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
 * Uses Anthropic Claude API for code generation
 */

import { BaseAgent } from '../base-agent.js';
import {
  AgentResult,
  Task,
  CodeSpec,
  GeneratedCode,
  AgentMetrics,
} from '../types/index.js';
import Anthropic from '@anthropic-ai/sdk';
import * as fs from 'fs';
import * as path from 'path';

export class CodeGenAgent extends BaseAgent {
  private anthropic: Anthropic;

  constructor(config: any) {
    super('CodeGenAgent', config);

    if (!config.anthropicApiKey) {
      throw new Error('ANTHROPIC_API_KEY is required for CodeGenAgent');
    }

    this.anthropic = new Anthropic({
      apiKey: config.anthropicApiKey,
    });
  }

  /**
   * Main execution: Generate code from task specification
   */
  async execute(task: Task): Promise<AgentResult> {
    this.log('🤖 CodeGenAgent starting code generation');

    try {
      // 1. Analyze task and create code specification
      const codeSpec = await this.createCodeSpec(task);

      // 2. Analyze existing codebase
      const context = await this.analyzeCodebase();

      // 3. Generate code using Claude
      const generatedCode = await this.generateCode(codeSpec, context);

      // 4. Generate tests
      const tests = await this.generateTests(generatedCode, codeSpec);
      generatedCode.tests = tests;

      // 5. Generate documentation
      const documentation = await this.generateDocumentation(generatedCode, codeSpec);
      generatedCode.documentation = documentation;

      // 6. Validate generated code
      await this.validateCode(generatedCode);

      // 7. Write files (if not dry-run)
      if (!task.metadata?.dryRun) {
        await this.writeGeneratedFiles(generatedCode);
      }

      // 8. Calculate metrics
      const metrics = this.calculateMetrics(generatedCode);

      this.log(`✅ Code generation complete: ${generatedCode.files.length} files, ${generatedCode.tests.length} tests`);

      return {
        status: 'success',
        data: generatedCode,
        metrics: {
          ...metrics,
          taskId: task.id,
          agentType: this.agentType,
          durationMs: Date.now() - this.startTime,
          timestamp: new Date().toISOString(),
        },
      };
    } catch (error) {
      this.log(`❌ Code generation failed: ${(error as Error).message}`);

      // Check if escalation is needed
      if (this.isArchitectureIssue(error as Error)) {
        await this.escalate(
          `Architecture issue in code generation: ${(error as Error).message}`,
          'TechLead',
          'Sev.2-High',
          { task: task.id, error: (error as Error).stack }
        );
      }

      throw error;
    }
  }

  // ============================================================================
  // Code Specification
  // ============================================================================

  /**
   * Create code specification from task
   */
  private async createCodeSpec(task: Task): Promise<CodeSpec> {
    this.log('📋 Creating code specification');

    return {
      feature: task.title,
      requirements: this.extractRequirements(task),
      context: {
        existingFiles: await this.getExistingFiles(),
        architecture: await this.getArchitecturePatterns(),
        dependencies: await this.getDependencies(),
      },
      constraints: [
        'Must use TypeScript strict mode',
        'Must include comprehensive type definitions',
        'Must follow existing code style',
        'Must be testable',
        'Must include error handling',
      ],
    };
  }

  /**
   * Extract requirements from task description
   */
  private extractRequirements(task: Task): string[] {
    const requirements: string[] = [];

    // Extract from description
    if (task.description) {
      const lines = task.description.split('\n');
      for (const line of lines) {
        if (line.trim().startsWith('-') || line.trim().startsWith('*')) {
          requirements.push(line.trim().substring(1).trim());
        }
      }
    }

    // Add default requirement
    if (requirements.length === 0) {
      requirements.push(task.title);
    }

    return requirements;
  }

  /**
   * Get list of existing files in project
   */
  private async getExistingFiles(): Promise<string[]> {
    try {
      const files: string[] = [];
      const scanDir = async (dir: string) => {
        const entries = await fs.promises.readdir(dir, { withFileTypes: true });
        for (const entry of entries) {
          const fullPath = path.join(dir, entry.name);
          if (entry.isDirectory() && !entry.name.startsWith('.') && entry.name !== 'node_modules') {
            await scanDir(fullPath);
          } else if (entry.isFile() && (entry.name.endsWith('.ts') || entry.name.endsWith('.tsx'))) {
            files.push(fullPath);
          }
        }
      };
      await scanDir(process.cwd());
      return files.slice(0, 50); // Limit to 50 files
    } catch (error) {
      return [];
    }
  }

  /**
   * Detect architecture patterns from existing code
   */
  private async getArchitecturePatterns(): Promise<string> {
    // Check for common patterns
    const patterns: string[] = [];

    try {
      // Check if agents/ directory exists
      if (await this.fileExists('agents/')) {
        patterns.push('Agent-based architecture with BaseAgent pattern');
      }

      // Check if using TypeScript
      if (await this.fileExists('tsconfig.json')) {
        patterns.push('TypeScript with strict type checking');
      }

      // Check for common frameworks
      if (await this.fileExists('package.json')) {
        const pkg = JSON.parse(await fs.promises.readFile('package.json', 'utf-8'));
        if (pkg.dependencies?.['react']) patterns.push('React framework');
        if (pkg.dependencies?.['express']) patterns.push('Express.js backend');
        if (pkg.dependencies?.['@anthropic-ai/sdk']) patterns.push('Anthropic AI integration');
      }
    } catch (error) {
      // Ignore errors
    }

    return patterns.length > 0 ? patterns.join(', ') : 'Generic TypeScript project';
  }

  /**
   * Get project dependencies
   */
  private async getDependencies(): Promise<string[]> {
    try {
      const pkg = JSON.parse(await fs.promises.readFile('package.json', 'utf-8'));
      return Object.keys({ ...pkg.dependencies, ...pkg.devDependencies });
    } catch (error) {
      return [];
    }
  }

  // ============================================================================
  // Codebase Analysis
  // ============================================================================

  /**
   * Analyze existing codebase for context
   */
  private async analyzeCodebase(): Promise<string> {
    this.log('🔍 Analyzing existing codebase');

    const context: string[] = [];

    // Get README content
    try {
      const readme = await fs.promises.readFile('README.md', 'utf-8');
      context.push('# Project Overview\n' + this.safeTruncate(readme, 2000));
    } catch (error) {
      // No README
    }

    // Get sample code from agents/
    try {
      const baseAgent = await fs.promises.readFile('agents/base-agent.ts', 'utf-8');
      context.push('# BaseAgent Pattern\n```typescript\n' + this.safeTruncate(baseAgent, 1000) + '\n```');
    } catch (error) {
      // No base agent
    }

    return context.join('\n\n');
  }

  // ============================================================================
  // Code Generation (AI-Powered)
  // ============================================================================

  /**
   * Generate code using Claude API
   */
  private async generateCode(spec: CodeSpec, context: string): Promise<GeneratedCode> {
    this.log('🧠 Generating code with Claude AI');

    const prompt = this.buildCodeGenerationPrompt(spec, context);

    try {
      const response = await this.retry(async () => {
        return await this.anthropic.messages.create({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 8000,
          messages: [
            {
              role: 'user',
              content: prompt,
            },
          ],
        });
      }, 3, 2000);

      const generatedText = response.content[0].type === 'text' ? response.content[0].text : '';

      // Parse generated code
      const files = this.parseGeneratedCode(generatedText);

      await this.logToolInvocation(
        'claude_code_generation',
        'passed',
        `Generated ${files.length} files`,
        this.safeTruncate(generatedText, 500)
      );

      return {
        files,
        tests: [],
        documentation: '',
        summary: `Generated ${files.length} files for: ${spec.feature}`,
      };
    } catch (error) {
      await this.logToolInvocation(
        'claude_code_generation',
        'failed',
        'Code generation failed',
        undefined,
        (error as Error).message
      );
      throw error;
    }
  }

  /**
   * Build prompt for code generation
   */
  private buildCodeGenerationPrompt(spec: CodeSpec, context: string): string {
    return `You are a senior TypeScript developer. Generate production-ready code based on the following specification.

## Task
${spec.feature}

## Requirements
${spec.requirements.map((r, i) => `${i + 1}. ${r}`).join('\n')}

## Existing Codebase Context
${context}

## Architecture
${spec.context.architecture}

## Constraints
${spec.constraints.map((c, i) => `${i + 1}. ${c}`).join('\n')}

## Instructions
1. Generate complete, working TypeScript code
2. Include all necessary imports
3. Follow the BaseAgent pattern if creating an agent
4. Use strict TypeScript types
5. Include JSDoc comments for public methods
6. Handle errors appropriately
7. Format code clearly

## Output Format
For each file, use this format:

\`\`\`typescript
// FILE: path/to/file.ts

[your code here]
\`\`\`

Generate the code now:`;
  }

  /**
   * Parse generated code into file structures
   */
  private parseGeneratedCode(text: string): Array<{ path: string; content: string; type: 'new' | 'modified' }> {
    const files: Array<{ path: string; content: string; type: 'new' | 'modified' }> = [];

    // Match code blocks with FILE: comments
    const filePattern = /```(?:typescript|ts)\s*\n\/\/\s*FILE:\s*([^\n]+)\n([\s\S]*?)```/g;
    let match;

    while ((match = filePattern.exec(text)) !== null) {
      const filePath = match[1].trim();
      const content = match[2].trim();

      files.push({
        path: filePath,
        content: content,
        type: 'new',
      });
    }

    // If no files found with FILE: pattern, try to extract any code blocks
    if (files.length === 0) {
      const codeBlockPattern = /```(?:typescript|ts)\s*\n([\s\S]*?)```/g;
      let blockMatch;
      let index = 0;

      while ((blockMatch = codeBlockPattern.exec(text)) !== null) {
        files.push({
          path: `generated/code-${index}.ts`,
          content: blockMatch[1].trim(),
          type: 'new',
        });
        index++;
      }
    }

    return files;
  }

  // ============================================================================
  // Test Generation
  // ============================================================================

  /**
   * Generate unit tests for generated code
   */
  private async generateTests(generatedCode: GeneratedCode, _spec: CodeSpec): Promise<Array<{ path: string; content: string }>> {
    this.log('🧪 Generating unit tests');

    const tests: Array<{ path: string; content: string }> = [];

    for (const file of generatedCode.files) {
      const testPrompt = `Generate comprehensive unit tests for the following TypeScript code:

\`\`\`typescript
${file.content}
\`\`\`

Requirements:
1. Use Vitest as the testing framework
2. Test all public methods
3. Include edge cases
4. Mock external dependencies
5. Aim for >80% coverage

Generate the test file:`;

      try {
        const response = await this.anthropic.messages.create({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 4000,
          messages: [{ role: 'user', content: testPrompt }],
        });

        const testContent = response.content[0].type === 'text' ? response.content[0].text : '';
        const testPath = file.path.replace(/\.ts$/, '.test.ts');

        // Extract code from response
        const codeMatch = testContent.match(/```(?:typescript|ts)\s*\n([\s\S]*?)```/);
        if (codeMatch) {
          tests.push({
            path: testPath,
            content: codeMatch[1].trim(),
          });
        }
      } catch (error) {
        this.log(`⚠️  Failed to generate tests for ${file.path}: ${(error as Error).message}`);
      }
    }

    return tests;
  }

  // ============================================================================
  // Documentation Generation
  // ============================================================================

  /**
   * Generate documentation for generated code
   */
  private async generateDocumentation(generatedCode: GeneratedCode, spec: CodeSpec): Promise<string> {
    this.log('📚 Generating documentation');

    const docPrompt = `Generate comprehensive documentation for the following code:

## Feature
${spec.feature}

## Generated Files
${generatedCode.files.map(f => `- ${f.path}`).join('\n')}

## Code Summary
${generatedCode.summary}

Create a README-style documentation with:
1. Overview
2. Usage examples
3. API reference
4. Configuration
5. Testing instructions

Generate the documentation:`;

    try {
      const response = await this.anthropic.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 3000,
        messages: [{ role: 'user', content: docPrompt }],
      });

      return response.content[0].type === 'text' ? response.content[0].text : '';
    } catch (error) {
      this.log(`⚠️  Failed to generate documentation: ${(error as Error).message}`);
      return '# Documentation\n\n(Documentation generation failed)';
    }
  }

  // ============================================================================
  // Validation
  // ============================================================================

  /**
   * Validate generated code (syntax check, etc.)
   */
  private async validateCode(generatedCode: GeneratedCode): Promise<void> {
    this.log('✅ Validating generated code');

    for (const file of generatedCode.files) {
      // Basic syntax validation
      if (!file.content.trim()) {
        throw new Error(`Generated file ${file.path} is empty`);
      }

      // Check for common issues
      if (file.content.includes('// TODO') || file.content.includes('// FIXME')) {
        this.log(`⚠️  Warning: ${file.path} contains TODO/FIXME comments`);
      }

      // Check for TypeScript syntax (basic)
      if (!file.content.includes('export') && !file.content.includes('import')) {
        this.log(`⚠️  Warning: ${file.path} may be incomplete (no imports/exports)`);
      }
    }
  }

  // ============================================================================
  // File Writing
  // ============================================================================

  /**
   * Write generated files to disk
   */
  private async writeGeneratedFiles(generatedCode: GeneratedCode): Promise<void> {
    this.log('💾 Writing generated files to disk');

    for (const file of generatedCode.files) {
      const fullPath = path.join(process.cwd(), file.path);
      await this.ensureDirectory(path.dirname(fullPath));
      await fs.promises.writeFile(fullPath, file.content, 'utf-8');
      this.log(`   ✍️  Wrote: ${file.path}`);
    }

    for (const test of generatedCode.tests) {
      const fullPath = path.join(process.cwd(), test.path);
      await this.ensureDirectory(path.dirname(fullPath));
      await fs.promises.writeFile(fullPath, test.content, 'utf-8');
      this.log(`   ✍️  Wrote test: ${test.path}`);
    }

    // Write documentation
    if (generatedCode.documentation) {
      const docPath = path.join(process.cwd(), 'docs', 'GENERATED_CODE.md');
      await this.ensureDirectory(path.dirname(docPath));
      await fs.promises.writeFile(docPath, generatedCode.documentation, 'utf-8');
      this.log(`   ✍️  Wrote documentation: docs/GENERATED_CODE.md`);
    }
  }

  // ============================================================================
  // Metrics
  // ============================================================================

  /**
   * Calculate code generation metrics
   */
  private calculateMetrics(generatedCode: GeneratedCode): Partial<AgentMetrics> {
    const totalLines = generatedCode.files.reduce((sum, file) => {
      return sum + file.content.split('\n').length;
    }, 0);

    return {
      linesChanged: totalLines,
      testsAdded: generatedCode.tests.length,
    };
  }

  // ============================================================================
  // Helper Methods
  // ============================================================================

  /**
   * Check if file exists
   */
  private async fileExists(filePath: string): Promise<boolean> {
    try {
      await fs.promises.access(filePath);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Check if error is architecture-related
   */
  private isArchitectureIssue(error: Error): boolean {
    const message = error.message.toLowerCase();
    return message.includes('architecture') ||
           message.includes('pattern') ||
           message.includes('design');
  }
}
