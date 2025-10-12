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
import {
  AgentResult,
  AgentConfig,
  Task,
  CodeSpec,
  GeneratedCode,
  AgentMetrics,
} from '../types/index.js';
import * as fs from 'fs';
import * as path from 'path';

export class CodeGenAgent extends BaseAgent {
  constructor(config: AgentConfig) {
    super('CodeGenAgent', config);
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
   * Generate code using Claude Code integration
   *
   * NOTE: This method requires Claude Code worktree execution.
   * Direct Anthropic API calls have been replaced with worktree-based execution.
   */
  private async generateCode(spec: CodeSpec, context: string): Promise<GeneratedCode> {
    this.log('🧠 Code generation via Claude Code worktree (stub)');

    const prompt = this.buildCodeGenerationPrompt(spec, context);

    // Log the prompt for manual or worktree-based processing
    await this.logToolInvocation(
      'claude_code_generation_prompt',
      'passed',
      'Generated prompt for Claude Code',
      this.safeTruncate(prompt, 500)
    );

    // Return stub response - actual generation happens in worktree
    return {
      files: [],
      tests: [],
      documentation: '',
      summary: `Code generation prepared for: ${spec.feature}. Execute in worktree with Claude Code.`,
    };
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


  // ============================================================================
  // Test Generation
  // ============================================================================

  /**
   * Generate unit tests (stub - requires Claude Code worktree execution)
   */
  private async generateTests(generatedCode: GeneratedCode, _spec: CodeSpec): Promise<Array<{ path: string; content: string }>> {
    this.log('🧪 Test generation prepared for worktree execution');

    // Log that tests need to be generated in worktree
    await this.logToolInvocation(
      'test_generation_stub',
      'passed',
      `Prepared test generation for ${generatedCode.files.length} files`
    );

    return [];
  }

  // ============================================================================
  // Documentation Generation
  // ============================================================================

  /**
   * Generate documentation (stub - requires Claude Code worktree execution)
   */
  private async generateDocumentation(_generatedCode: GeneratedCode, spec: CodeSpec): Promise<string> {
    this.log('📚 Documentation generation prepared for worktree execution');

    // Log that documentation needs to be generated in worktree
    await this.logToolInvocation(
      'doc_generation_stub',
      'passed',
      `Prepared documentation generation for: ${spec.feature}`
    );

    return `# ${spec.feature}\n\n(Documentation will be generated in Claude Code worktree)`;
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
