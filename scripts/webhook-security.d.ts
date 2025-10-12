#!/usr/bin/env tsx
/**
 * Webhook Security Module
 *
 * Implements GitHub webhook signature verification and security checks
 * Phase B Enhancement - Issue #5
 *
 * Security Features:
 * - HMAC-SHA256 signature verification
 * - Timestamp validation (prevent replay attacks)
 * - Request rate limiting
 * - IP allowlist verification (optional)
 */
export interface WebhookVerificationOptions {
    secret: string;
    signature: string;
    payload: string;
    timestamp?: string;
    maxAge?: number;
}
export interface RateLimitConfig {
    maxRequests: number;
    windowMs: number;
}
export interface SecurityCheckResult {
    valid: boolean;
    reason?: string;
    timestamp?: string;
}
/**
 * Verify GitHub webhook signature using HMAC-SHA256
 *
 * GitHub sends a signature in the X-Hub-Signature-256 header:
 * sha256=<signature>
 *
 * @param options Verification options
 * @returns True if signature is valid
 */
export declare function verifyWebhookSignature(options: WebhookVerificationOptions): SecurityCheckResult;
/**
 * Validate webhook timestamp to prevent replay attacks
 *
 * @param timestamp ISO timestamp string
 * @param maxAge Maximum age in seconds
 * @returns Validation result
 */
export declare function validateTimestamp(timestamp: string, maxAge?: number): SecurityCheckResult;
declare class RateLimiter {
    private requests;
    private config;
    constructor(config?: RateLimitConfig);
    /**
     * Check if request is allowed under rate limit
     *
     * @param identifier Unique identifier (e.g., IP address, user ID)
     * @returns True if request is allowed
     */
    checkLimit(identifier: string): SecurityCheckResult;
    /**
     * Clear rate limit data for identifier
     */
    clear(identifier: string): void;
    /**
     * Clear all rate limit data
     */
    clearAll(): void;
}
/**
 * Verify if IP address is from GitHub's webhook servers
 *
 * @param ip IP address to verify
 * @returns True if IP is from GitHub
 */
export declare function verifyGitHubIP(ip: string): SecurityCheckResult;
export interface ComprehensiveSecurityOptions {
    secret: string;
    signature: string;
    payload: string;
    timestamp?: string;
    ip?: string;
    identifier?: string;
    skipIPCheck?: boolean;
    skipRateLimit?: boolean;
}
/**
 * Perform comprehensive security checks on webhook request
 *
 * @param options Security check options
 * @returns Security check result
 */
export declare function performSecurityCheck(options: ComprehensiveSecurityOptions): SecurityCheckResult;
export { RateLimiter };
declare const _default: {
    verifyWebhookSignature: typeof verifyWebhookSignature;
    validateTimestamp: typeof validateTimestamp;
    verifyGitHubIP: typeof verifyGitHubIP;
    performSecurityCheck: typeof performSecurityCheck;
    RateLimiter: typeof RateLimiter;
};
export default _default;
//# sourceMappingURL=webhook-security.d.ts.map