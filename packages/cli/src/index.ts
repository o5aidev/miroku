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
import { config } from './commands/config.js';
import { setup } from './commands/setup.js';
import { docs } from './commands/docs.js';
import { loadConfig, applyConfigToEnvironment } from './config/loader.js';
import {
  reportIssueToMiyabi,
  gatherEnvironmentInfo,
  gatherProjectContext,
  inferUserIntent,
  type FeedbackContext,
} from './feedback/issue-reporter.js';

// Load and apply configuration at startup
try {
  const userConfig = loadConfig({ silent: true });
  applyConfigToEnvironment(userConfig);
} catch (error) {
  // Silently fail if config doesn't exist - it's optional
}

const program = new Command();

program
  .name('miyabi')
  .description('✨ Miyabi - 一つのコマンドで全てが完結する自律型開発フレームワーク')
  .version('0.3.3');

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
          { name: '🌸 初めての方（セットアップガイド）', value: 'setup' },
          { name: '🆕 新しいプロジェクトを作成', value: 'init' },
          { name: '📦 既存プロジェクトに追加', value: 'install' },
          { name: '📊 ステータス確認', value: 'status' },
          { name: '📚 ドキュメント生成', value: 'docs' },
          { name: '⚙️  設定', value: 'config' },
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
        case 'setup': {
          await setup({});
          break;
        }

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

        case 'docs': {
          const { inputDir, outputFile, watch, training } = await inquirer.prompt([
            {
              type: 'input',
              name: 'inputDir',
              message: 'ソースディレクトリを指定してください:',
              default: './scripts',
            },
            {
              type: 'input',
              name: 'outputFile',
              message: '出力ファイル名を指定してください:',
              default: './docs/API.md',
            },
            {
              type: 'confirm',
              name: 'watch',
              message: 'ウォッチモード（自動更新）を有効にしますか？',
              default: false,
            },
            {
              type: 'confirm',
              name: 'training',
              message: 'トレーニング資料も生成しますか？',
              default: false,
            },
          ]);

          await docs({ input: inputDir, output: outputFile, watch, training });
          break;
        }

        case 'config': {
          await config({});
          break;
        }
      }
    } catch (error) {
      console.log(chalk.red.bold('\n❌ エラーが発生しました\n'));

      if (error instanceof Error) {
        console.log(chalk.red(`原因: ${error.message}\n`));

        // 自動Issue起票（一周 - 人の手が必要な問題として報告）
        await handleErrorAndReport(action, error);

        // エラーの種類に応じた対処法を表示
        if (error.message.includes('authentication') || error.message.includes('OAuth')) {
          console.log(chalk.yellow('💡 対処法:'));
          console.log(chalk.white('  1. GitHubの認証をもう一度試してください'));
          console.log(chalk.white('  2. ブラウザでコードを正しく入力したか確認してください'));
          console.log(chalk.white('  3. 必要な権限（repo, workflow）が付与されているか確認してください\n'));
        } else if (error.message.includes('repository') || error.message.includes('repo')) {
          console.log(chalk.yellow('💡 対処法:'));
          console.log(chalk.white('  1. リポジトリ名が既に存在していないか確認してください'));
          console.log(chalk.white('  2. GitHubのアクセス権限を確認してください'));
          console.log(chalk.white('  3. インターネット接続を確認してください\n'));
        } else if (error.message.includes('git') || error.message.includes('Not a git repository')) {
          console.log(chalk.yellow('💡 対処法:'));
          console.log(chalk.white('  1. Gitリポジトリのディレクトリで実行してください'));
          console.log(chalk.white('  2. `git init`でリポジトリを初期化してください'));
          console.log(chalk.white('  3. リモートリポジトリが設定されているか確認してください\n'));
        } else if (error.message.includes('GITHUB_TOKEN')) {
          console.log(chalk.yellow('💡 対処法:'));
          console.log(chalk.white('  1. 環境変数 GITHUB_TOKEN を設定してください'));
          console.log(chalk.white('  2. `export GITHUB_TOKEN=ghp_your_token`'));
          console.log(chalk.white('  3. もしくは miyabi を実行して認証してください\n'));
        } else if (error.message.includes('network') || error.message.includes('fetch')) {
          console.log(chalk.yellow('💡 対処法:'));
          console.log(chalk.white('  1. インターネット接続を確認してください'));
          console.log(chalk.white('  2. GitHubのステータスを確認してください: https://www.githubstatus.com'));
          console.log(chalk.white('  3. プロキシ設定を確認してください\n'));
        } else {
          console.log(chalk.yellow('💡 対処法:'));
          console.log(chalk.white('  1. インターネット接続を確認してください'));
          console.log(chalk.white('  2. もう一度実行してみてください'));
          console.log(chalk.white('  3. 問題が続く場合はイシューを作成してください:'));
          console.log(chalk.cyan('     https://github.com/ShunsukeHayashi/Autonomous-Operations/issues\n'));
        }
      } else {
        console.log(chalk.gray('予期しないエラーが発生しました\n'));
      }

      process.exit(1);
    }
  });

/**
 * Handle error and report to Miyabi repository
 * 一周（人の手が必要な問題）として自動起票
 */
async function handleErrorAndReport(action: string, error: Error): Promise<void> {
  try {
    // Gather context
    const context: FeedbackContext = {
      command: `miyabi ${action}`,
      errorMessage: error.message,
      errorStack: error.stack,
      userIntent: inferUserIntent(`miyabi ${action}`),
      environment: gatherEnvironmentInfo(),
      projectContext: gatherProjectContext(),
    };

    // Try to get GitHub token from environment
    const token = process.env.GITHUB_TOKEN;

    if (token) {
      console.log(chalk.gray('📤 自動的にMiyabiプロジェクトに問題を報告しています...\n'));

      const result = await reportIssueToMiyabi(context, token);

      if (result.created && result.issueUrl) {
        console.log(chalk.green(`✓ 問題を報告しました（一周 - 人の手が必要）: ${result.issueUrl}\n`));
        console.log(chalk.gray('  開発チームが対応します。進捗はGitHub Issueで確認できます。\n'));
      } else if (result.reason === 'Similar issue already exists' && result.issueUrl) {
        console.log(chalk.yellow(`⚠ 類似の問題が既に報告されています: ${result.issueUrl}\n`));
        console.log(chalk.gray('  こちらのIssueで進捗を確認できます。\n'));
      }
    } else {
      console.log(chalk.gray('💡 この問題を自動報告するには GITHUB_TOKEN を設定してください\n'));
    }
  } catch (reportError) {
    // Issue報告自体が失敗しても、元のエラー処理は続行
    console.log(chalk.gray('（自動報告をスキップしました）\n'));
  }
}

program.parse(process.argv);
