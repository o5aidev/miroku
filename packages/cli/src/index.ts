#!/usr/bin/env node

/**
 * Miyabi - 一つのコマンドで全てが完結
 */

import { Command } from 'commander';
import chalk from 'chalk';
import inquirer from 'inquirer';
import { init } from './commands/init.js';
import { install } from './commands/install.js';
import { status } from './commands/status.js';

const program = new Command();

program
  .name('miyabi')
  .description('✨ Miyabi - 一つのコマンドで全てが完結する自律型開発フレームワーク')
  .version('0.1.0');

// ============================================================================
// Single Command Interface
// ============================================================================

program
  .action(async () => {
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
              validate: (input) => {
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
      console.error(chalk.red.bold('\n❌ エラーが発生しました:'), error);
      process.exit(1);
    }
  });

program.parse(process.argv);
