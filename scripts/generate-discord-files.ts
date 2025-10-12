/**
 * Generate Discord Community Files
 *
 * Uses CodeGenAgent to generate Discord community documentation.
 */

import { CodeGenAgent } from '../agents/codegen/codegen-agent.js';
import { Task, AgentConfig } from '../agents/types/index.js';

async function main() {
  console.log('🚀 Generating Discord Community Files...\n');

  const config: AgentConfig = {
    deviceIdentifier: 'discord-generator',
    githubToken: process.env.GITHUB_TOKEN || 'not-needed',
    useTaskTool: false,
    useWorktree: false,
    logDirectory: './logs',
    reportDirectory: './reports',
  };

  const agent = new CodeGenAgent(config);

  const task: Task = {
    id: 'discord-community-setup',
    title: 'Discord Community Setup',
    description: `Create Discord community infrastructure for Miyabi.

This includes:
- Welcome message for new members
- Community rules and guidelines
- FAQ document
- Server configuration
- README.md Discord badge`,
    type: 'docs',
    priority: 1,
    severity: 'Sev.2-High',
    impact: 'High',
    assignedAgent: 'CodeGenAgent',
    dependencies: [],
    estimatedDuration: 30,
    status: 'idle',
  };

  try {
    const result = await agent.execute(task);

    if (result.status === 'success') {
      console.log('\n✅ Discord files generated successfully!\n');
      console.log('📁 Generated files:');
      for (const file of result.data.files) {
        console.log(`   - ${file.path} (${file.type})`);
      }
      console.log(`\n📊 Total: ${result.data.files.length} files`);
      console.log(`⏱️  Duration: ${result.metrics?.durationMs}ms`);
      console.log(`📝 Lines: ${result.metrics?.linesChanged}`);
    } else {
      console.error('❌ Generation failed:', result.error);
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ Error:', (error as Error).message);
    process.exit(1);
  }
}

main();
