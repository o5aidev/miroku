#!/usr/bin/env node

/**
 * dev3000 MCP Proxy Server - FIXED VERSION
 *
 * dev3000 is an MCP ORCHESTRATOR that connects to downstream MCPs.
 * It provides 2 tools: fix_my_app and execute_browser_action
 *
 * This proxy exposes dev3000's tools via stdio for Claude Code.
 *
 * Usage: node dev3000-proxy.cjs
 */

const { spawn } = require('child_process');
const readline = require('readline');

// Use npx to run dev3000's chrome-devtools-mcp directly
const CHROME_DEVTOOLS_MCP = {
  command: 'npx',
  args: ['-y', 'chrome-devtools-mcp@latest']
};

const RETRY_DELAY = 2000;
const MAX_RETRIES = 5;

// Create readline interface for JSON-RPC communication
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: false
});

let retryCount = 0;

/**
 * Simply forward stdio to chrome-devtools-mcp
 * dev3000 will automatically detect and use it
 */
let mcpProcess = null;

function startMCP() {
  console.error('[dev3000-proxy] Starting chrome-devtools-mcp...');

  mcpProcess = spawn(CHROME_DEVTOOLS_MCP.command, CHROME_DEVTOOLS_MCP.args, {
    stdio: ['pipe', 'pipe', process.stderr]
  });

  // Forward stdin to MCP process
  process.stdin.pipe(mcpProcess.stdin);

  // Forward MCP output to stdout
  mcpProcess.stdout.pipe(process.stdout);

  mcpProcess.on('error', (error) => {
    console.error('[dev3000-proxy] MCP process error:', error);
    process.exit(1);
  });

  mcpProcess.on('exit', (code) => {
    console.error(`[dev3000-proxy] MCP process exited with code ${code}`);
    process.exit(code || 0);
  });

  console.error('[dev3000-proxy] chrome-devtools-mcp started successfully');
}

/**
 * Main entry point
 */
function main() {
  console.error('[dev3000-proxy] dev3000 MCP proxy (chrome-devtools-mcp)');
  console.error('[dev3000-proxy] This provides browser debugging tools');

  // Start the MCP process
  startMCP();

  // Handle termination
  process.on('SIGINT', () => {
    console.error('[dev3000-proxy] Received SIGINT, shutting down...');
    if (mcpProcess) {
      mcpProcess.kill('SIGTERM');
    }
    process.exit(0);
  });

  process.on('SIGTERM', () => {
    console.error('[dev3000-proxy] Received SIGTERM, shutting down...');
    if (mcpProcess) {
      mcpProcess.kill('SIGTERM');
    }
    process.exit(0);
  });
}

// Start the proxy
main();
