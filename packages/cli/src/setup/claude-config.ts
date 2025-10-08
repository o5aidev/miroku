/**
 * Claude Code configuration setup
 *
 * Deploys .claude/ directory and CLAUDE.md to new project
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export interface ClaudeConfigOptions {
  projectPath: string;
  projectName: string;
}

/**
 * Deploy Claude Code configuration to project
 *
 * This includes:
 * - .claude/ directory with agents, commands, MCP servers
 * - CLAUDE.md context file
 */
export async function deployClaudeConfig(options: ClaudeConfigOptions): Promise<void> {
  const { projectPath, projectName } = options;

  // Source: templates in CLI package
  const templatesDir = path.join(__dirname, '../../templates');
  const claudeTemplateDir = path.join(templatesDir, 'claude-code');
  const claudeMdTemplate = path.join(templatesDir, 'CLAUDE.md.template');

  // Destination: project directory
  const claudeDestDir = path.join(projectPath, '.claude');
  const claudeMdDest = path.join(projectPath, 'CLAUDE.md');

  // 1. Copy .claude directory
  if (fs.existsSync(claudeTemplateDir)) {
    await copyDirectoryRecursive(claudeTemplateDir, claudeDestDir);
  } else {
    throw new Error(`Claude template directory not found: ${claudeTemplateDir}`);
  }

  // 2. Generate CLAUDE.md from template
  if (fs.existsSync(claudeMdTemplate)) {
    const templateContent = fs.readFileSync(claudeMdTemplate, 'utf-8');
    const renderedContent = templateContent.replace(/{{PROJECT_NAME}}/g, projectName);

    // Atomic write
    const tempPath = `${claudeMdDest}.tmp`;
    fs.writeFileSync(tempPath, renderedContent, { encoding: 'utf-8', mode: 0o644 });
    fs.renameSync(tempPath, claudeMdDest);
  } else {
    throw new Error(`CLAUDE.md template not found: ${claudeMdTemplate}`);
  }
}

/**
 * Recursively copy directory with atomic operations
 */
async function copyDirectoryRecursive(src: string, dest: string): Promise<void> {
  // Create destination directory
  try {
    fs.mkdirSync(dest, { recursive: true });
  } catch (error: any) {
    if (error.code !== 'EEXIST') {
      throw error;
    }
  }

  // Read source directory
  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      // Recursively copy subdirectory
      await copyDirectoryRecursive(srcPath, destPath);
    } else {
      // Copy file atomically
      try {
        const tempPath = `${destPath}.tmp`;
        fs.copyFileSync(srcPath, tempPath);
        fs.renameSync(tempPath, destPath);
      } catch (error: any) {
        // Skip if file exists
        if (error.code !== 'EEXIST') {
          throw error;
        }
      }
    }
  }
}

/**
 * Check if Claude Code is available
 */
export function isClaudeCodeAvailable(): boolean {
  // Check if running in Claude Code environment
  // Claude Code sets specific environment variables
  return process.env.CLAUDE_CODE === 'true' || process.env.ANTHROPIC_CLI === 'true';
}

/**
 * Verify Claude Code configuration
 */
export async function verifyClaudeConfig(projectPath: string): Promise<{
  claudeDirExists: boolean;
  claudeMdExists: boolean;
  agentsCount: number;
  commandsCount: number;
}> {
  const claudeDir = path.join(projectPath, '.claude');
  const claudeMd = path.join(projectPath, 'CLAUDE.md');

  const claudeDirExists = fs.existsSync(claudeDir);
  const claudeMdExists = fs.existsSync(claudeMd);

  let agentsCount = 0;
  let commandsCount = 0;

  if (claudeDirExists) {
    const agentsDir = path.join(claudeDir, 'agents');
    const commandsDir = path.join(claudeDir, 'commands');

    if (fs.existsSync(agentsDir)) {
      agentsCount = fs.readdirSync(agentsDir).filter(f => f.endsWith('.md')).length;
    }

    if (fs.existsSync(commandsDir)) {
      commandsCount = fs.readdirSync(commandsDir).filter(f => f.endsWith('.md')).length;
    }
  }

  return {
    claudeDirExists,
    claudeMdExists,
    agentsCount,
    commandsCount,
  };
}
