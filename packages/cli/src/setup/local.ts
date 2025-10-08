/**
 * Local project setup module
 *
 * Clone repository and initialize npm project
 */

import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';

export interface LocalSetupOptions {
  skipInstall?: boolean;
}

/**
 * Clone repository and setup local project
 */
export async function cloneAndSetup(
  cloneUrl: string,
  projectName: string,
  options: LocalSetupOptions = {}
): Promise<void> {
  // Clone repository
  execSync(`git clone ${cloneUrl} ${projectName}`, {
    stdio: 'inherit',
  });

  const projectPath = path.join(process.cwd(), projectName);

  // Generate package.json
  await generatePackageJson(projectPath, projectName);

  // Generate tsconfig.json
  await generateTsConfig(projectPath);

  // Generate .gitignore
  await generateGitignore(projectPath);

  // Install dependencies
  if (!options.skipInstall) {
    execSync('npm install', {
      cwd: projectPath,
      stdio: 'inherit',
    });
  }
}

/**
 * Generate package.json
 */
async function generatePackageJson(projectPath: string, projectName: string): Promise<void> {
  const packageJson = {
    name: projectName,
    version: '0.1.0',
    description: 'Autonomous development powered by Agentic OS',
    type: 'module',
    scripts: {
      dev: 'tsx src/index.ts',
      build: 'tsc',
      test: 'vitest',
      lint: 'eslint . --ext .ts,.tsx',
      typecheck: 'tsc --noEmit',
    },
    keywords: ['agentic-os', 'autonomous'],
    author: '',
    license: 'MIT',
    dependencies: {
      '@agentic-os/core': '^0.1.0',
    },
    devDependencies: {
      '@types/node': '^20.10.0',
      tsx: '^4.7.0',
      typescript: '^5.8.3',
      vitest: '^3.2.4',
      eslint: '^8.54.0',
    },
  };

  fs.writeFileSync(
    path.join(projectPath, 'package.json'),
    JSON.stringify(packageJson, null, 2) + '\n'
  );
}

/**
 * Generate tsconfig.json
 */
async function generateTsConfig(projectPath: string): Promise<void> {
  const tsconfig = {
    compilerOptions: {
      target: 'ES2022',
      module: 'ESNext',
      lib: ['ES2022'],
      moduleResolution: 'node',
      esModuleInterop: true,
      resolveJsonModule: true,
      strict: true,
      skipLibCheck: true,
      forceConsistentCasingInFileNames: true,
      outDir: './dist',
      rootDir: './src',
    },
    include: ['src/**/*'],
    exclude: ['node_modules', 'dist'],
  };

  fs.writeFileSync(
    path.join(projectPath, 'tsconfig.json'),
    JSON.stringify(tsconfig, null, 2) + '\n'
  );
}

/**
 * Generate .gitignore
 */
async function generateGitignore(projectPath: string): Promise<void> {
  const gitignore = `# Dependencies
node_modules/
package-lock.json

# Build output
dist/
*.tsbuildinfo

# Environment variables
.env
.env.local

# IDE
.vscode/
.idea/

# OS
.DS_Store
Thumbs.db

# Test coverage
coverage/

# Logs
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*
`;

  const gitignorePath = path.join(projectPath, '.gitignore');

  // Safely handle .gitignore (avoid TOCTOU race condition)
  try {
    // Try to read existing file
    const existing = fs.readFileSync(gitignorePath, 'utf-8');
    if (!existing.includes('# Agentic OS')) {
      // Append atomically using temp file + rename
      const tempPath = `${gitignorePath}.tmp`;
      fs.writeFileSync(tempPath, existing + '\n# Agentic OS\n' + gitignore, 'utf-8');
      fs.renameSync(tempPath, gitignorePath);
    }
  } catch (error: any) {
    // File doesn't exist, create new one
    if (error.code === 'ENOENT') {
      try {
        fs.writeFileSync(gitignorePath, gitignore, { encoding: 'utf-8', flag: 'wx' });
      } catch (writeError: any) {
        // Another process created it, ignore
        if (writeError.code !== 'EEXIST') {
          throw writeError;
        }
      }
    } else {
      throw error;
    }
  }
}
