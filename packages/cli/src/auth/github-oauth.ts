/**
 * GitHub OAuth using Device Flow
 *
 * Device Flow is perfect for CLI applications:
 * https://docs.github.com/en/apps/oauth-apps/building-oauth-apps/authorizing-oauth-apps#device-flow
 *
 * Flow:
 * 1. Request device code
 * 2. Show user_code and verification_uri to user
 * 3. Poll for access token
 * 4. Save token to .env
 */

import chalk from 'chalk';
import open from 'open';
import * as fs from 'fs';
import * as path from 'path';
import { Octokit } from '@octokit/rest';

// GitHub OAuth App credentials
// TODO: Register official Agentic OS GitHub App
const CLIENT_ID = process.env.AGENTIC_OS_CLIENT_ID || 'Iv1.placeholder';

export interface DeviceCodeResponse {
  device_code: string;
  user_code: string;
  verification_uri: string;
  expires_in: number;
  interval: number;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
  scope: string;
}

/**
 * Main OAuth flow - returns GitHub token
 */
export async function githubOAuth(): Promise<string> {
  console.log(chalk.cyan('\n🔐 GitHub Authentication Required\n'));

  // Check if token already exists
  const existingToken = loadTokenFromEnv();

  if (existingToken) {
    console.log(chalk.gray('Found existing token in .env'));

    // Verify token is valid
    if (await verifyToken(existingToken)) {
      console.log(chalk.green('✓ Token is valid\n'));
      return existingToken;
    } else {
      console.log(chalk.yellow('⚠️  Existing token is invalid, re-authenticating...\n'));
    }
  }

  // Start Device Flow
  const deviceCode = await requestDeviceCode();

  // Show instructions to user
  console.log(chalk.white.bold('Please complete authentication:'));
  console.log(chalk.cyan(`\n  1. Open: ${deviceCode.verification_uri}`));
  console.log(chalk.cyan(`  2. Enter code: ${chalk.bold(deviceCode.user_code)}\n`));

  // Auto-open browser
  console.log(chalk.gray('Opening browser automatically...\n'));
  try {
    await open(deviceCode.verification_uri);
  } catch {
    console.log(chalk.yellow('Could not open browser automatically. Please open manually.\n'));
  }

  // Poll for token
  console.log(chalk.gray('Waiting for authorization...'));
  const token = await pollForToken(deviceCode);

  // Verify token has required scopes
  await verifyRequiredScopes(token);

  // Save to .env
  await saveTokenToEnv(token);

  console.log(chalk.green.bold('\n✅ Authentication successful!\n'));

  return token;
}

/**
 * Step 1: Request device code from GitHub
 */
async function requestDeviceCode(): Promise<DeviceCodeResponse> {
  const response = await fetch('https://github.com/login/device/code', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({
      client_id: CLIENT_ID,
      scope: 'repo workflow read:project write:project',
    }),
  });

  if (!response.ok) {
    throw new Error(`Failed to request device code: ${response.statusText}`);
  }

  const data = await response.json();
  return data as DeviceCodeResponse;
}

/**
 * Step 2: Poll for access token
 */
async function pollForToken(deviceCode: DeviceCodeResponse): Promise<string> {
  const startTime = Date.now();
  const expiresIn = deviceCode.expires_in * 1000; // Convert to ms
  const interval = deviceCode.interval * 1000; // Convert to ms

  while (Date.now() - startTime < expiresIn) {
    await sleep(interval);

    try {
      const response = await fetch('https://github.com/login/oauth/access_token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          client_id: CLIENT_ID,
          device_code: deviceCode.device_code,
          grant_type: 'urn:ietf:params:oauth:grant-type:device_code',
        }),
      });

      const data = await response.json() as any;

      if (data.access_token) {
        return data.access_token as string;
      }

      if (data.error === 'authorization_pending') {
        // Still waiting for user
        continue;
      }

      if (data.error === 'slow_down') {
        // Increase polling interval
        await sleep(interval);
        continue;
      }

      if (data.error) {
        throw new Error(`OAuth error: ${data.error} - ${data.error_description || ''}`);
      }
    } catch (error) {
      if (error instanceof Error && error.message.includes('OAuth error')) {
        throw error;
      }
      // Network error, retry
      continue;
    }
  }

  throw new Error('Device code expired. Please try again.');
}

/**
 * Verify token is valid and has access
 */
async function verifyToken(token: string): Promise<boolean> {
  try {
    const octokit = new Octokit({ auth: token });
    await octokit.users.getAuthenticated();
    return true;
  } catch {
    return false;
  }
}

/**
 * Verify token has required scopes
 */
async function verifyRequiredScopes(token: string): Promise<void> {
  const octokit = new Octokit({ auth: token });

  try {
    // Check scopes by making a test request
    const response = await octokit.request('GET /user');
    const scopes = response.headers['x-oauth-scopes']?.split(', ') || [];

    const requiredScopes = ['repo', 'workflow'];
    const missingScopes = requiredScopes.filter((scope) => !scopes.includes(scope));

    if (missingScopes.length > 0) {
      console.log(chalk.yellow('\n⚠️  Warning: Missing recommended scopes:'));
      console.log(chalk.yellow(`  ${missingScopes.join(', ')}`));
      console.log(chalk.gray('\nSome features may not work correctly.\n'));
    }
  } catch (error) {
    console.log(chalk.yellow('\n⚠️  Could not verify token scopes\n'));
  }
}

/**
 * Load token from .env file
 */
function loadTokenFromEnv(): string | null {
  const envPath = path.join(process.cwd(), '.env');

  if (!fs.existsSync(envPath)) {
    return null;
  }

  try {
    const content = fs.readFileSync(envPath, 'utf-8');
    const match = content.match(/GITHUB_TOKEN=([^\n\r]+)/);
    return match ? match[1].trim() : null;
  } catch {
    return null;
  }
}

/**
 * Save token to .env file
 */
async function saveTokenToEnv(token: string): Promise<void> {
  const envPath = path.join(process.cwd(), '.env');
  let content = '';

  // Read existing .env if it exists
  if (fs.existsSync(envPath)) {
    content = fs.readFileSync(envPath, 'utf-8');

    // Remove existing GITHUB_TOKEN line
    content = content
      .split('\n')
      .filter((line) => !line.startsWith('GITHUB_TOKEN='))
      .join('\n');

    // Add newline if content doesn't end with one
    if (content && !content.endsWith('\n')) {
      content += '\n';
    }
  }

  // Append new token
  content += `GITHUB_TOKEN=${token}\n`;

  // Write to file
  fs.writeFileSync(envPath, content, 'utf-8');

  console.log(chalk.gray(`\n✓ Token saved to ${envPath}`));
}

/**
 * Sleep utility
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
