/**
 * Minimal Node.js type definitions stub
 *
 * This file provides basic type definitions for Node.js built-in modules
 * to resolve TypeScript errors when @types/node is not available.
 */

// Global Node.js types
declare namespace NodeJS {
  interface ProcessEnv {
    [key: string]: string | undefined;
  }

  interface Process {
    env: ProcessEnv;
    cwd(): string;
    exit(code?: number): never;
    platform: string;
    argv: string[];
    memoryUsage(): { rss: number; heapTotal: number; heapUsed: number; external: number };
  }

  interface Timeout {
    ref(): this;
    unref(): this;
  }
}

declare const process: NodeJS.Process;

// fs module
declare module 'fs' {
  export function existsSync(path: string): boolean;
  export function readFileSync(path: string, encoding?: string): string | Buffer;
  export function writeFileSync(path: string, data: string | Buffer): void;
  export function mkdirSync(path: string, options?: { recursive?: boolean }): void;
  export function readdirSync(path: string): string[];
  export function statSync(path: string): { isDirectory(): boolean; isFile(): boolean };
  export function unlinkSync(path: string): void;
  export function rmdirSync(path: string, options?: { recursive?: boolean }): void;

  export const promises: {
    readFile(path: string, encoding?: string): Promise<string | Buffer>;
    writeFile(path: string, data: string | Buffer): Promise<void>;
    mkdir(path: string, options?: { recursive?: boolean }): Promise<void>;
    readdir(path: string): Promise<string[]>;
    unlink(path: string): Promise<void>;
    rm(path: string, options?: { recursive?: boolean; force?: boolean }): Promise<void>;
    access(path: string): Promise<void>;
  };
}

// fs/promises module
declare module 'fs/promises' {
  export function readFile(path: string, encoding?: string): Promise<string | Buffer>;
  export function writeFile(path: string, data: string | Buffer): Promise<void>;
  export function mkdir(path: string, options?: { recursive?: boolean }): Promise<void>;
  export function readdir(path: string): Promise<string[]>;
  export function unlink(path: string): Promise<void>;
  export function rm(path: string, options?: { recursive?: boolean; force?: boolean }): Promise<void>;
  export function access(path: string): Promise<void>;
}

// path module
declare module 'path' {
  export function join(...paths: string[]): string;
  export function resolve(...paths: string[]): string;
  export function dirname(path: string): string;
  export function basename(path: string, ext?: string): string;
  export function extname(path: string): string;
  export function relative(from: string, to: string): string;
  export function isAbsolute(path: string): boolean;
  export const sep: string;
}

// child_process module
declare module 'child_process' {
  export interface ExecOptions {
    cwd?: string;
    env?: NodeJS.ProcessEnv;
    encoding?: string;
    shell?: string;
    timeout?: number;
    maxBuffer?: number;
    stdio?: 'pipe' | 'ignore' | 'inherit' | Array<'pipe' | 'ignore' | 'inherit'>;
  }

  export interface SpawnOptions {
    cwd?: string;
    env?: NodeJS.ProcessEnv;
    stdio?: 'pipe' | 'ignore' | 'inherit' | Array<'pipe' | 'ignore' | 'inherit'>;
    shell?: boolean | string;
  }

  export interface ChildProcess {
    stdout: any;
    stderr: any;
    stdin: any;
    on(event: string, listener: (...args: any[]) => void): this;
    kill(signal?: string): boolean;
  }

  export function exec(
    command: string,
    options: ExecOptions,
    callback: (error: Error | null, stdout: string, stderr: string) => void
  ): ChildProcess;

  export function execSync(command: string, options?: ExecOptions): Buffer | string;

  export function spawn(command: string, args?: string[], options?: SpawnOptions): ChildProcess;
}

// util module
declare module 'util' {
  export function promisify<T extends (...args: any[]) => any>(fn: T): (...args: Parameters<T>) => Promise<any>;
}

// http module
declare module 'http' {
  export interface IncomingMessage {}
  export interface ServerResponse {}
  export interface Agent {}
}

// https module
declare module 'https' {
  export interface Agent {}
}
