#!/usr/bin/env tsx
/**
 * Security Manager - セキュリティとアクセス制御の管理
 *
 * 機能:
 * - CODEOWNERS ファイル生成
 * - ブランチ保護ルール管理
 * - シークレットスキャン統合
 * - 依存関係の脆弱性チェック
 * - セキュリティポリシー適用
 */
interface SecurityConfig {
    owner: string;
    repo: string;
    githubToken: string;
}
interface VulnerabilityReport {
    severity: 'critical' | 'high' | 'moderate' | 'low';
    package: string;
    version: string;
    title: string;
    url?: string;
    fixAvailable?: boolean;
}
interface SecretScanResult {
    file: string;
    line: number;
    type: string;
    detected: string;
}
export declare class SecurityManager {
    private octokit;
    private config;
    private projectRoot;
    constructor(config: SecurityConfig);
    /**
     * CODEOWNERS ファイルを生成
     */
    generateCodeowners(): Promise<void>;
    /**
     * CODEOWNERS の内容を構築
     */
    private buildCodeownersContent;
    /**
     * ブランチ保護ルールを設定
     */
    setupBranchProtection(): Promise<void>;
    /**
     * 個別のブランチ保護ルールを適用
     */
    private applyBranchProtection;
    /**
     * シークレットスキャンを実行
     */
    scanForSecrets(): Promise<SecretScanResult[]>;
    /**
     * 追跡対象のファイルを取得
     */
    private getTrackableFiles;
    /**
     * 依存関係の脆弱性をチェック
     */
    checkDependencyVulnerabilities(): Promise<VulnerabilityReport[]>;
    /**
     * セキュリティポリシーを適用
     */
    enforceSecurityPolicies(): Promise<{
        passed: boolean;
        violations: string[];
    }>;
    /**
     * SBOM を生成
     */
    generateSBOM(): Promise<void>;
    /**
     * セキュリティレポートを生成してGitHub Issueに投稿
     */
    postSecurityReport(): Promise<void>;
    /**
     * セキュリティレポートをフォーマット
     */
    private formatSecurityReport;
}
export {};
//# sourceMappingURL=security-manager.d.ts.map