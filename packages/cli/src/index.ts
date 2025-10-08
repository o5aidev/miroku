#!/usr/bin/env node

/**
 * @agentic-os/cli - Zero-learning-cost CLI for Agentic OS
 *
 * Commands:
 * - init <project-name>  : Create new project with Agentic OS
 * - install              : Install Agentic OS into existing project
 * - status               : Check agent status and activity
 */

import { Command } from 'commander';
import chalk from 'chalk';
import inquirer from 'inquirer';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { init } from './commands/init.js';
import { install } from './commands/install.js';
import { status } from './commands/status.js';
import { sprintStart } from './commands/sprint.js';

// Get package.json path
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const packageJson = JSON.parse(
  readFileSync(join(__dirname, '../package.json'), 'utf-8')
);

const program = new Command();

program
  .name('miyabi')
  .description('✨ Miyabi - 一つのコマンドで全てが完結する自律型開発フレームワーク')
  .version(packageJson.version);

// ============================================================================
// Command: init
// ============================================================================

program
  .command('init <project-name>')
  .description('Create a new project with Agentic OS (5 min setup)')
  .option('-p, --private', 'Create private repository', false)
  .option('--skip-install', 'Skip npm install', false)
  .action(async (projectName: string, options) => {
    try {
      console.log(chalk.cyan.bold('\n🚀 Agentic OS - Zero Learning Cost Setup\n'));
      await init(projectName, options);
    } catch (error) {
      console.error(chalk.red.bold('\n❌ Setup failed:'), error);
      process.exit(1);
    }
  });

// ============================================================================
// Command: install
// ============================================================================

program
  .command('install')
  .description('Install Agentic OS into existing project')
  .option('--dry-run', 'Show what would be installed without making changes', false)
  .action(async (options) => {
    try {
      console.log(chalk.cyan.bold('\n🔍 Agentic OS - Project Analysis\n'));
      await install(options);
    } catch (error) {
      console.error(chalk.red.bold('\n❌ Installation failed:'), error);
      process.exit(1);
    }
  });

// ============================================================================
// Command: status
// ============================================================================

program
  .command('status')
  .description('Check agent status and recent activity')
  .option('-w, --watch', 'Watch mode (auto-refresh every 10s)', false)
  .action(async (options) => {
    try {
      await status(options);
    } catch (error) {
      console.error(chalk.red.bold('\n❌ Status check failed:'), error);
      process.exit(1);
    }
  });

// ============================================================================
// Command: sprint start
// ============================================================================

program
  .command('sprint')
  .description('Sprint management commands')
  .action(() => {
    console.log(chalk.yellow('\n💡 Available sprint commands:\n'));
    console.log(chalk.cyan('  miyabi sprint start <sprint-name>'));
    console.log(chalk.gray('    → Start a new sprint with interactive planning\n'));
  });

program
  .command('sprint start <sprint-name>')
  .description('Start a new sprint with interactive planning')
  .option('-d, --duration <days>', 'Sprint duration in days', '14')
  .option('--init', 'Initialize project structure (directories and starter files)', false)
  .option('--dry-run', 'Show what would be created without making changes', false)
  .action(async (sprintName: string, options) => {
    try {
      await sprintStart(sprintName, {
        duration: parseInt(options.duration, 10),
        initProject: options.init,
        dryRun: options.dryRun,
      });
    } catch (error) {
      console.error(chalk.red.bold('\n❌ Sprint start failed:'), error);
      process.exit(1);
    }
  });

// ============================================================================
// Interactive Mode (Default)
// ============================================================================

async function interactiveMode() {
  console.log(chalk.cyan.bold('\n✨ Miyabi\n'));
  console.log(chalk.gray('一つのコマンドで全てが完結\n'));

  const { action } = await inquirer.prompt([
    {
      type: 'list',
      name: 'action',
      message: '何をしますか？',
      choices: [
        { name: '🆕 新しいプロジェクトを作成', value: 'init' },
        { name: '📦 既存プロジェクトに追加', value: 'install' },
        { name: '🚀 スプリント開始', value: 'sprint' },
        { name: '📊 ステータス確認', value: 'status' },
        { name: '❌ 終了', value: 'exit' },
      ],
    },
  ]);

  if (action === 'exit') {
    console.log(chalk.gray('\n👋 またね！\n'));
    process.exit(0);
  }

  try {
    switch (action) {
      case 'init': {
        const { projectName, isPrivate } = await inquirer.prompt([
          {
            type: 'input',
            name: 'projectName',
            message: 'プロジェクト名:',
            default: 'my-project',
            validate: (input: string) => {
              if (!input) return 'プロジェクト名を入力してください';
              if (!/^[a-zA-Z0-9_-]+$/.test(input)) {
                return '英数字、ハイフン、アンダースコアのみ使用可能です';
              }
              return true;
            },
          },
          {
            type: 'confirm',
            name: 'isPrivate',
            message: 'プライベートリポジトリにしますか？',
            default: false,
          },
        ]);

        console.log(chalk.cyan.bold('\n🚀 セットアップ開始...\n'));
        await init(projectName, { private: isPrivate, skipInstall: false });
        break;
      }

      case 'install': {
        const { dryRun } = await inquirer.prompt([
          {
            type: 'confirm',
            name: 'dryRun',
            message: 'ドライラン（実際には変更しない）で確認しますか？',
            default: false,
          },
        ]);

        console.log(chalk.cyan.bold('\n🔍 プロジェクト解析中...\n'));
        await install({ dryRun });
        break;
      }

      case 'sprint': {
        const { sprintName, duration, initProject } = await inquirer.prompt([
          {
            type: 'input',
            name: 'sprintName',
            message: 'スプリント名:',
            default: `Sprint-${new Date().toISOString().slice(0, 10)}`,
            validate: (input: string) => {
              if (!input) return 'スプリント名を入力してください';
              return true;
            },
          },
          {
            type: 'input',
            name: 'duration',
            message: 'スプリント期間（日数）:',
            default: '14',
            validate: (input: string) => {
              const num = parseInt(input, 10);
              if (isNaN(num) || num <= 0) return '正の数値を入力してください';
              return true;
            },
          },
          {
            type: 'confirm',
            name: 'initProject',
            message: 'プロジェクト構造を初期化しますか？（ディレクトリと初期ファイルを作成）',
            default: false,
          },
        ]);

        console.log(chalk.cyan.bold('\n🚀 スプリント開始...\n'));
        await sprintStart(sprintName, {
          duration: parseInt(duration, 10),
          initProject,
        });
        break;
      }

      case 'status': {
        const { watch } = await inquirer.prompt([
          {
            type: 'confirm',
            name: 'watch',
            message: 'ウォッチモード（10秒ごとに自動更新）を有効にしますか？',
            default: false,
          },
        ]);

        await status({ watch });
        break;
      }
    }
  } catch (error) {
    console.log(chalk.red.bold('\n❌ エラーが発生しました:'), error);
    process.exit(1);
  }
}

// ============================================================================
// Parse and execute
// ============================================================================

program.parse(process.argv);

// Run interactive mode if no command provided
if (!process.argv.slice(2).length) {
  // Check if stdin is a TTY (interactive terminal)
  if (process.stdin.isTTY) {
    interactiveMode().catch((error) => {
      console.error(chalk.red.bold('\n❌ エラー:'), error);
      process.exit(1);
    });
  } else {
    // Non-interactive environment, show help
    program.outputHelp();
    console.log('\n💡 Quick start:');
    console.log(chalk.cyan('  npx miyabi init my-project'));
    console.log(chalk.gray('  → Creates new project with full automation\n'));
    console.log(chalk.cyan('  cd existing-project && npx miyabi install'));
    console.log(chalk.gray('  → Adds automation to existing project\n'));
  }
}
