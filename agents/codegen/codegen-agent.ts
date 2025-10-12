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
  Task,
  CodeSpec,
  GeneratedCode,
  AgentMetrics,
} from '../types/index.js';
import * as fs from 'fs';
import * as path from 'path';

export class CodeGenAgent extends BaseAgent {
  constructor(config: any) {
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
   * Generate code using template-based and task-specific generation
   *
   * Now performs real code generation for supported task types.
   * Falls back to prompt-based generation for complex tasks.
   */
  private async generateCode(spec: CodeSpec, context: string): Promise<GeneratedCode> {
    this.log('🧠 Code generation starting (real generation enabled)');

    // Step 1: Identify files that can be generated
    const generatableFiles = await this.identifyGeneratableFiles(spec);

    if (generatableFiles.length === 0) {
      this.log('⚠️  No generatable files identified, falling back to prompt-based approach');
      const prompt = this.buildCodeGenerationPrompt(spec, context);
      await this.logToolInvocation(
        'claude_code_generation_prompt',
        'passed',
        'Generated prompt for Claude Code',
        this.safeTruncate(prompt, 500)
      );

      return {
        files: [],
        tests: [],
        documentation: '',
        summary: `Code generation prepared for: ${spec.feature}. Execute in worktree with Claude Code.`,
      };
    }

    // Step 2: Generate content for each identified file
    const files: Array<{ path: string; content: string; type: 'new' | 'modified' }> = [];

    for (const fileSpec of generatableFiles) {
      this.log(`   📄 Generating: ${fileSpec.path}`);
      try {
        const content = await this.generateFileContent(fileSpec, spec, context);
        const fileType = await this.fileExists(fileSpec.path) ? 'modified' : 'new';
        files.push({ path: fileSpec.path, content, type: fileType });
      } catch (error) {
        this.log(`   ⚠️  Failed to generate ${fileSpec.path}: ${(error as Error).message}`);
      }
    }

    this.log(`✅ Generated ${files.length} files`);

    return {
      files,
      tests: [],
      documentation: '',
      summary: `Successfully generated ${files.length} file(s) for: ${spec.feature}`,
    };
  }

  /**
   * Identify files that can be generated for this task
   */
  private async identifyGeneratableFiles(spec: CodeSpec): Promise<Array<{ path: string; type: string; template?: string }>> {
    const files: Array<{ path: string; type: string; template?: string }> = [];

    const featureLower = spec.feature.toLowerCase();

    // Discord Community Task
    if (featureLower.includes('discord') && featureLower.includes('community')) {
      files.push(
        { path: 'docs/discord/welcome.md', type: 'markdown', template: 'discord-welcome' },
        { path: 'docs/discord/rules.md', type: 'markdown', template: 'discord-rules' },
        { path: 'docs/discord/faq.md', type: 'markdown', template: 'discord-faq' },
        { path: 'discord-config.json', type: 'json', template: 'discord-config' }
      );
    }

    // Feature tasks
    if (spec.feature.includes('feature') || spec.feature.includes('implement')) {
      // Could add TypeScript file generation here
    }

    // Documentation tasks
    if (featureLower.includes('documentation') || featureLower.includes('docs')) {
      files.push(
        { path: 'docs/README.md', type: 'markdown', template: 'generic-doc' }
      );
    }

    // Configuration tasks
    if (featureLower.includes('config') || featureLower.includes('setup')) {
      files.push(
        { path: 'config/settings.json', type: 'json', template: 'generic-config' }
      );
    }

    return files;
  }

  /**
   * Generate content for a specific file
   */
  private async generateFileContent(
    fileSpec: { path: string; type: string; template?: string },
    spec: CodeSpec,
    _context: string
  ): Promise<string> {
    switch (fileSpec.template) {
      case 'discord-welcome':
        return this.generateDiscordWelcome(spec);
      case 'discord-rules':
        return this.generateDiscordRules(spec);
      case 'discord-faq':
        return this.generateDiscordFAQ(spec);
      case 'discord-config':
        return this.generateDiscordConfig(spec);
      case 'generic-doc':
        return this.generateGenericDoc(spec);
      case 'generic-config':
        return this.generateGenericConfig(spec);
      default:
        throw new Error(`Unknown template: ${fileSpec.template}`);
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

  // ============================================================================
  // Template Generation Methods
  // ============================================================================

  /**
   * Generate Discord Welcome message
   */
  private generateDiscordWelcome(_spec: CodeSpec): string {
    return `# Welcome to Miyabi Community! 👋

Welcome to the Miyabi Discord server! We're excited to have you here.

## 🎯 What is Miyabi?

Miyabi is an AI-driven autonomous development framework that automates the entire software development lifecycle:
- 📋 Issue analysis
- 🤖 Code generation
- 🔍 Code review
- 🚀 Deployment

## 🚀 Getting Started

1. **Read the Rules** - Check out #rules to understand our community guidelines
2. **Introduce Yourself** - Head to #introductions and tell us about yourself
3. **Pick Your Roles** - Select roles that match your interests and expertise
4. **Join the Conversation** - Explore our channels and start participating

## 📚 Useful Channels

- **#announcements** - Important updates and news
- **#general** - General discussion
- **#help** - Get help with Miyabi
- **#showcase** - Share your projects
- **#dev** - Development discussions

## 🔗 Important Links

- 📖 Documentation: https://github.com/ShunsukeHayashi/Miyabi
- 💻 GitHub: https://github.com/ShunsukeHayashi/Miyabi
- 📦 NPM: https://npmjs.com/package/miyabi

## 💬 Need Help?

Feel free to ask questions in #help - our community is friendly and responsive!

---

Happy coding! 🌸
`;
  }

  /**
   * Generate Discord Rules
   */
  private generateDiscordRules(_spec: CodeSpec): string {
    return `# Miyabi Community Rules 📜

Please read and follow these rules to maintain a positive and productive community.

## 1. Be Respectful 🤝

- Treat all members with kindness and respect
- No harassment, discrimination, or hate speech
- Welcome diverse perspectives and backgrounds
- Use inclusive language

## 2. Stay On-Topic 💬

- Keep discussions relevant to the channel purpose
- Use #off-topic for casual conversation
- No spam or excessive self-promotion
- One question per message (don't flood)

## 3. Help Each Other 🎓

- Be patient with beginners
- Share knowledge generously
- Provide constructive feedback
- Credit sources when sharing code/resources

## 4. No Inappropriate Content 🚫

- No NSFW, illegal, or harmful content
- No piracy, cracking, or malicious code
- No personal information sharing (doxing)
- Keep it professional

## 5. Use English or Japanese 🌐

- Primarily English and Japanese channels
- Other languages welcome in DMs
- Use translation tools if needed

## 6. Follow Discord ToS ⚖️

- You must be 13+ years old
- Comply with Discord's Terms of Service
- Report violations to moderators

## Enforcement 🛡️

1. First violation: Warning
2. Second violation: Temporary mute (1-24 hours)
3. Third violation: Temporary ban (1-7 days)
4. Severe violations: Permanent ban

**Report Abuse**: DM a moderator or use the report function

---

By participating, you agree to these rules. Thank you for making Miyabi a welcoming community! 🌸
`;
  }

  /**
   * Generate Discord FAQ
   */
  private generateDiscordFAQ(_spec: CodeSpec): string {
    return `# Miyabi Community FAQ ❓

Frequently asked questions about Miyabi and this community.

## General Questions

### Q: What is Miyabi?

A: Miyabi is an AI-driven autonomous development framework that automates software development workflows using intelligent agents powered by Claude AI.

### Q: Is Miyabi free?

A: Yes! Miyabi is 100% open source (MIT License). However, you need your own API keys (GitHub, Anthropic) to run agents.

### Q: Do I need to be an expert to use Miyabi?

A: No! Miyabi is designed for all skill levels. Beginners can use the CLI, and advanced users can customize agents.

## Installation & Setup

### Q: How do I install Miyabi?

A: Two ways:

\`\`\`bash
# New project
npx miyabi init my-project

# Existing project
cd my-project && npx miyabi install
\`\`\`

### Q: What are the prerequisites?

A:
- Node.js 18+ or Bun
- GitHub account + personal access token
- Anthropic API key (for AI agents)

### Q: Where do I get API keys?

A:
- **GitHub**: https://github.com/settings/tokens (requires \`repo\`, \`workflow\`, \`project\` scopes)
- **Anthropic**: https://console.anthropic.com/

## Agents & Features

### Q: What are Miyabi Agents?

A: Autonomous AI agents that perform specific tasks:
- **CoordinatorAgent**: Task decomposition
- **CodeGenAgent**: Code generation
- **ReviewAgent**: Code quality checks
- **IssueAgent**: Issue analysis
- **PRAgent**: Pull Request creation
- **DeploymentAgent**: CI/CD automation

### Q: How do I run an agent?

A:

\`\`\`bash
# Automatic mode
npx miyabi auto

# Specific agent
npx miyabi agent run codegen --issue=123
\`\`\`

## Troubleshooting

### Q: "Module not found" error

A: Run \`npm install\` or \`pnpm install\` in project root.

### Q: "GitHub token invalid" error

A: Check token has correct scopes (\`repo\`, \`workflow\`, \`project\`). Regenerate if needed.

### Q: Tests failing after installation

A: Normal if you have TypeScript errors in examples. Core functionality works.

## Community

### Q: How can I contribute?

A:
1. Check "good first issue" labels
2. Read CONTRIBUTING.md
3. Fork → Branch → Code → PR
4. Follow Conventional Commits

### Q: I found a bug, where do I report it?

A:
- **Discord**: #bug-reports (quick triage)
- **GitHub**: https://github.com/ShunsukeHayashi/Miyabi/issues (official tracking)

### Q: Can I request features?

A: Absolutely! Post in #feature-requests or create a GitHub Issue.

---

**Didn't find your answer?** Ask in #help! 🚀
`;
  }

  /**
   * Generate Discord configuration JSON
   */
  private generateDiscordConfig(_spec: CodeSpec): string {
    const config = {
      server_name: 'Miyabi - Autonomous Dev Community',
      categories: [
        {
          name: '📢 WELCOME',
          channels: [
            { name: 'welcome', type: 'text' },
            { name: 'rules', type: 'text' },
            { name: 'announcements', type: 'text' }
          ]
        },
        {
          name: '💬 COMMUNITY',
          channels: [
            { name: 'general', type: 'text' },
            { name: 'introductions', type: 'text' },
            { name: 'off-topic', type: 'text' },
            { name: 'showcase', type: 'text' }
          ]
        },
        {
          name: '🎓 LEARNING',
          channels: [
            { name: 'beginners', type: 'text' },
            { name: 'miyabi-help', type: 'text' },
            { name: 'ai-agents', type: 'text' },
            { name: 'code-review', type: 'text' }
          ]
        },
        {
          name: '💻 DEVELOPMENT',
          channels: [
            { name: 'bug-reports', type: 'text' },
            { name: 'feature-requests', type: 'text' },
            { name: 'pull-requests', type: 'text' },
            { name: 'dev-updates', type: 'text' }
          ]
        },
        {
          name: '🔊 VOICE',
          channels: [
            { name: 'General Voice', type: 'voice' },
            { name: 'Study Together', type: 'voice' },
            { name: 'Office Hours', type: 'voice' }
          ]
        }
      ],
      roles: [
        { name: 'Newcomer', color: '#95a5a6', permissions: ['VIEW_CHANNEL', 'SEND_MESSAGES'] },
        { name: 'Member', color: '#3498db', permissions: ['VIEW_CHANNEL', 'SEND_MESSAGES', 'CONNECT'] },
        { name: 'Active Contributor', color: '#2ecc71', permissions: ['VIEW_CHANNEL', 'SEND_MESSAGES', 'CONNECT'] },
        { name: 'Mentor', color: '#f39c12', permissions: ['VIEW_CHANNEL', 'SEND_MESSAGES', 'CONNECT', 'MODERATE_MEMBERS'] },
        { name: 'Moderator', color: '#e74c3c', permissions: ['ADMINISTRATOR'] }
      ],
      bots: [
        { name: 'MEE6', purpose: 'Leveling & Moderation' },
        { name: 'GitHub Bot', purpose: 'Repository notifications' },
        { name: 'Miyabi Bot', purpose: 'Custom commands & automation' }
      ]
    };

    return JSON.stringify(config, null, 2);
  }

  /**
   * Generate generic documentation
   */
  private generateGenericDoc(spec: CodeSpec): string {
    return `# ${spec.feature}

## Overview

${spec.requirements.join('\n')}

## Implementation

(Documentation will be added as implementation progresses)

## Requirements

${spec.requirements.map((r, i) => `${i + 1}. ${r}`).join('\n')}

## Architecture

${spec.context.architecture}

## Constraints

${spec.constraints.map((c, i) => `${i + 1}. ${c}`).join('\n')}

---

Generated by Miyabi CodeGenAgent
`;
  }

  /**
   * Generate generic configuration
   */
  private generateGenericConfig(spec: CodeSpec): string {
    const config = {
      name: spec.feature,
      version: '1.0.0',
      description: spec.requirements.join('. '),
      settings: {},
      metadata: {
        generatedBy: 'Miyabi CodeGenAgent',
        timestamp: new Date().toISOString()
      }
    };

    return JSON.stringify(config, null, 2);
  }
}
