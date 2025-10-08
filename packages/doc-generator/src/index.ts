/**
 * @agentic-os/doc-generator - AI-Powered TypeScript Documentation Generator
 *
 * TypeScriptコードを解析し、Markdownドキュメントを自動生成します。
 *
 * @module doc-generator
 */

export { CodeAnalyzer } from './analyzer/CodeAnalyzer.js';
export type {
  FunctionInfo,
  ClassInfo,
  InterfaceInfo,
  AnalysisResult,
} from './analyzer/CodeAnalyzer.js';

export { TemplateEngine } from './generator/TemplateEngine.js';
export type {
  TemplateType,
  GenerationOptions,
} from './generator/TemplateEngine.js';

/**
 * パッケージバージョン
 */
export const VERSION = '1.0.0';

/**
 * パッケージ情報
 */
export const PACKAGE_INFO = {
  name: '@agentic-os/doc-generator',
  version: VERSION,
  description: 'AI-Powered TypeScript Documentation Generator',
  author: 'Agentic OS Team',
} as const;
