/**
 * init command - Create new project with Agentic OS
 *
 * Flow:
 * 1. GitHub OAuth authentication
 * 2. Create GitHub repository
 * 3. Setup labels (53 labels)
 * 4. Create GitHub Projects V2
 * 5. Deploy workflows (12+ workflows)
 * 6. Clone locally
 * 7. Initialize npm project
 * 8. Create welcome Issue
 */

import ora from 'ora';
import chalk from 'chalk';
import { githubOAuth } from '../auth/github-oauth.js';
import { createRepository } from '../setup/repository.js';
import { setupLabels } from '../setup/labels.js';
import { createProjectV2 } from '../setup/projects.js';
import { deployWorkflows } from '../setup/workflows.js';
import { cloneAndSetup } from '../setup/local.js';
import { createWelcomeIssue } from '../setup/welcome.js';
import { deployClaudeConfig, verifyClaudeConfig } from '../setup/claude-config.js';

export interface InitOptions {
  private?: boolean;
  skipInstall?: boolean;
}

export async function init(projectName: string, options: InitOptions = {}) {
  console.log(chalk.gray('This will create a fully automated development environment.\n'));
  console.log(chalk.gray('What you get:'));
  console.log(chalk.gray('  ✓ GitHub repository with automation'));
  console.log(chalk.gray('  ✓ 6 AI agents ready to work'));
  console.log(chalk.gray('  ✓ Label-based state machine'));
  console.log(chalk.gray('  ✓ Automatic Issue → PR pipeline\n'));

  // Step 1: GitHub OAuth
  const spinner = ora('Authenticating with GitHub...').start();
  let token: string;

  try {
    token = await githubOAuth();
    spinner.succeed(chalk.green('GitHub authentication complete'));
  } catch (error) {
    spinner.fail(chalk.red('GitHub認証に失敗しました'));
    if (error instanceof Error) {
      throw new Error(`GitHub authentication failed: ${error.message}`);
    }
    throw new Error('GitHub authentication failed: Unknown error');
  }

  // Step 2: Create repository
  spinner.start(`Creating GitHub repository: ${projectName}...`);
  let repo: any;

  try {
    repo = await createRepository(projectName, token, options.private || false);
    spinner.succeed(chalk.green(`Repository created: ${chalk.cyan(repo.html_url)}`));
  } catch (error) {
    spinner.fail(chalk.red('リポジトリの作成に失敗しました'));
    if (error instanceof Error) {
      if (error.message.includes('already exists') || error.message.includes('name already exists')) {
        console.log(chalk.yellow('\n💡 解決策:\n'));
        console.log(chalk.white(`  1. 別の名前を試してください:`));
        console.log(chalk.gray(`     npx miyabi init ${projectName}-2`));
        console.log(chalk.gray(`     npx miyabi init ${projectName}-new\n`));
        console.log(chalk.white(`  2. または、既存リポジトリを削除:`));
        console.log(chalk.gray(`     gh repo delete ${projectName} --yes\n`));
        console.log(chalk.white(`  3. GitHub で確認:`));
        console.log(chalk.gray(`     https://github.com/settings/repositories\n`));
        throw new Error(`repository creation failed: リポジトリ名 "${projectName}" は既に存在しています`);
      }
      throw new Error(`repository creation failed: ${error.message}`);
    }
    throw new Error('repository creation failed: Unknown error');
  }

  // Step 3: Setup labels
  spinner.start('Creating labels (53 labels across 10 categories)...');

  try {
    await setupLabels(repo.owner.login, repo.name, token);
    spinner.succeed(chalk.green('Labels created successfully'));
  } catch (error) {
    spinner.fail(chalk.red('ラベルの作成に失敗しました'));
    if (error instanceof Error) {
      throw new Error(`Label setup failed: ${error.message}`);
    }
    throw new Error('Label setup failed: Unknown error');
  }

  // Step 4: Create Projects V2 (optional - requires additional scopes)
  spinner.start('Setting up GitHub Projects V2...');

  try {
    const project = await createProjectV2(repo.owner.login, repo.name, token);
    spinner.succeed(chalk.green(`Projects V2 created: ${chalk.cyan(project.url)}`));
  } catch (error) {
    spinner.warn(chalk.yellow('Projects V2 creation skipped (requires read:org scope)'));
    console.log(chalk.gray('  You can create Projects manually later at:'));
    console.log(chalk.gray(`  ${repo.html_url}/projects\n`));
  }

  // Step 5: Deploy workflows
  spinner.start('Deploying GitHub Actions workflows...');

  try {
    const workflowCount = await deployWorkflows(repo.owner.login, repo.name, token);
    spinner.succeed(chalk.green(`${workflowCount} workflows deployed`));
  } catch (error) {
    spinner.warn(chalk.yellow('Workflow deployment skipped'));
    console.log(chalk.gray('  You can add workflows manually later\n'));
  }

  // Step 6: Clone and setup locally
  spinner.start('Setting up local project...');

  let projectPath: string | undefined;

  try {
    await cloneAndSetup(repo.clone_url, projectName, {
      skipInstall: options.skipInstall || false,
    });
    projectPath = `./${projectName}`;
    spinner.succeed(chalk.green('Local setup complete'));
  } catch (error) {
    spinner.warn(chalk.yellow('Local setup skipped'));
    console.log(chalk.gray(`  Clone manually: git clone ${repo.clone_url}\n`));
  }

  // Step 6.5: Deploy Claude Code configuration
  if (projectPath) {
    spinner.start('Deploying Claude Code configuration...');

    try {
      await deployClaudeConfig({
        projectPath,
        projectName,
      });

      const verification = await verifyClaudeConfig(projectPath);

      if (verification.claudeDirExists && verification.claudeMdExists) {
        spinner.succeed(
          chalk.green(
            `Claude Code configured: ${verification.agentsCount} agents, ${verification.commandsCount} commands`
          )
        );
        console.log(chalk.gray('  ✓ .claude/ directory created'));
        console.log(chalk.gray('  ✓ CLAUDE.md context file created'));
      } else {
        spinner.warn(chalk.yellow('Claude Code configuration incomplete'));
      }
    } catch (error) {
      spinner.warn(chalk.yellow('Claude Code configuration skipped'));
      console.log(chalk.gray('  You can add .claude/ manually later\n'));
    }
  }

  // Step 7: Create welcome Issue
  spinner.start('Creating welcome Issue...');

  try {
    const issue = await createWelcomeIssue(repo.owner.login, repo.name, token);
    spinner.succeed(chalk.green(`Welcome Issue created: ${chalk.cyan(issue.html_url)}`));
  } catch (error) {
    spinner.warn(chalk.yellow('Welcome Issue skipped'));
    console.log(chalk.gray('  You can create Issues manually\n'));
  }

  // Success!
  console.log(chalk.green.bold('\n✅ Setup complete!\n'));
  console.log(chalk.cyan('Next steps:'));
  console.log(chalk.white(`  cd ${projectName}`));
  console.log(chalk.white('  gh issue create --title "Your task" --body "Description"\n'));
  console.log(chalk.gray('💡 Tip: The AI agents will automatically start working on your Issue.'));
  console.log(chalk.gray('    You\'ll see a PR appear within minutes!\n'));
}
