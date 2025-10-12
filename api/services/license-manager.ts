/**
 * License Manager Service
 * Handles license generation, verification, and revocation
 */

import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { LicensePayload } from '../lib/types';

export class LicenseManager {
  private supabase: SupabaseClient;
  private privateKey: string;
  private publicKey: string;

  constructor() {
    this.supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_KEY!
    );

    // RSA keys for license signing
    this.privateKey = process.env.MIYABI_LICENSE_PRIVATE_KEY!.replace(/\\n/g, '\n');
    this.publicKey = process.env.MIYABI_LICENSE_PUBLIC_KEY!.replace(/\\n/g, '\n');

    if (!this.privateKey || !this.publicKey) {
      throw new Error('License keys not configured. Set MIYABI_LICENSE_PRIVATE_KEY and MIYABI_LICENSE_PUBLIC_KEY');
    }
  }

  /**
   * Generate license key for a plugin tier
   */
  async generateLicense(
    userId: string,
    pluginId: string,
    tier: 'free' | 'pro' | 'enterprise' | 'addon',
    expiresInDays?: number
  ): Promise<string> {
    // Get plugin limitations
    const limitations = this.getLimitationsForTier(tier);

    // Calculate expiration
    const now = Math.floor(Date.now() / 1000);
    const expiresAt = expiresInDays
      ? now + (expiresInDays * 24 * 60 * 60)
      : now + (365 * 24 * 60 * 60); // Default: 1 year

    // Get features for tier
    const features = this.getFeaturesForTier(tier);

    const payload: LicensePayload = {
      sub: userId,
      plugin_id: pluginId,
      tier,
      iat: now,
      exp: expiresAt,
      features,
      limitations
    };

    // Sign with RSA private key
    const licenseKey = jwt.sign(payload, this.privateKey, {
      algorithm: 'RS256'
    });

    // Store in database
    await this.supabase.from('licenses').insert({
      user_id: userId,
      plugin_id: pluginId,
      license_key: licenseKey,
      tier,
      features,
      limitations,
      issued_at: new Date(now * 1000),
      expires_at: new Date(expiresAt * 1000),
      revoked: false
    });

    return licenseKey;
  }

  /**
   * Verify license key
   */
  async verifyLicense(licenseKey: string): Promise<LicensePayload | null> {
    try {
      // Step 1: Verify JWT signature
      const decoded = jwt.verify(licenseKey, this.publicKey, {
        algorithms: ['RS256']
      }) as LicensePayload;

      // Step 2: Check expiration
      const now = Math.floor(Date.now() / 1000);
      if (decoded.exp < now) {
        console.error('License expired');
        return null;
      }

      // Step 3: Check revocation list (online)
      const { data: revoked } = await this.supabase
        .from('revoked_licenses')
        .select('license_key')
        .eq('license_key', licenseKey)
        .single();

      if (revoked) {
        console.error('License revoked');
        return null;
      }

      return decoded;
    } catch (error) {
      console.error('License verification failed:', error);
      return null;
    }
  }

  /**
   * Check if feature is enabled for license
   */
  hasFeature(license: LicensePayload, feature: string): boolean {
    return license.features.includes(feature);
  }

  /**
   * Get tier limitations
   */
  getLimitations(license: LicensePayload) {
    return license.limitations;
  }

  /**
   * Revoke license
   */
  async revokeLicense(licenseKey: string, reason: string): Promise<void> {
    await this.supabase.from('revoked_licenses').insert({
      license_key: licenseKey,
      reason,
      revoked_at: new Date()
    });

    // Update license record
    await this.supabase
      .from('licenses')
      .update({
        revoked: true,
        revoked_at: new Date()
      })
      .eq('license_key', licenseKey);
  }

  /**
   * Generate trial license (Pro tier, 14 days)
   */
  async generateTrialLicense(
    userId: string,
    pluginId: string
  ): Promise<string> {
    // Check if user already used trial
    const { data: existingTrial } = await this.supabase
      .from('trials')
      .select('*')
      .eq('user_id', userId)
      .eq('plugin_id', pluginId)
      .single();

    if (existingTrial) {
      throw new Error('Trial already used for this plugin');
    }

    // Generate 14-day trial license
    const licenseKey = await this.generateLicense(userId, pluginId, 'pro', 14);

    // Record trial
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 14);

    await this.supabase.from('trials').insert({
      user_id: userId,
      plugin_id: pluginId,
      license_key: licenseKey,
      started_at: new Date(),
      expires_at: expiresAt
    });

    return licenseKey;
  }

  /**
   * Check trial status
   */
  async getTrialStatus(userId: string, pluginId: string) {
    const { data: trial } = await this.supabase
      .from('trials')
      .select('*')
      .eq('user_id', userId)
      .eq('plugin_id', pluginId)
      .single();

    if (!trial) {
      return { eligible: true, status: 'available' };
    }

    const now = new Date();
    const expiresAt = new Date(trial.expires_at);

    if (now > expiresAt) {
      return {
        eligible: false,
        status: 'expired',
        expired_at: expiresAt
      };
    }

    const daysRemaining = Math.ceil(
      (expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    );

    return {
      eligible: false,
      status: 'active',
      days_remaining: daysRemaining,
      expires_at: expiresAt
    };
  }

  /**
   * Store encrypted license locally
   */
  encryptLicense(licenseKey: string): string {
    const algorithm = 'aes-256-gcm';
    const key = Buffer.from(process.env.ENCRYPTION_KEY || crypto.randomBytes(32));
    const iv = crypto.randomBytes(16);

    const cipher = crypto.createCipheriv(algorithm, key, iv);
    let encrypted = cipher.update(licenseKey, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    const authTag = cipher.getAuthTag();

    return JSON.stringify({
      encrypted,
      iv: iv.toString('hex'),
      authTag: authTag.toString('hex')
    });
  }

  /**
   * Decrypt stored license
   */
  decryptLicense(encryptedData: string): string {
    const { encrypted, iv, authTag } = JSON.parse(encryptedData);
    const algorithm = 'aes-256-gcm';
    const key = Buffer.from(process.env.ENCRYPTION_KEY || crypto.randomBytes(32));

    const decipher = crypto.createDecipheriv(
      algorithm,
      key,
      Buffer.from(iv, 'hex')
    );
    decipher.setAuthTag(Buffer.from(authTag, 'hex'));

    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  }

  /**
   * Get limitations for tier
   */
  private getLimitationsForTier(tier: string) {
    const limitations = {
      free: {
        monthly_issues: 100,
        concurrency: 1,
        claude_api_tokens: 10000,
        support: 'community' as const
      },
      pro: {
        monthly_issues: -1, // unlimited
        concurrency: 3,
        claude_api_tokens: 100000,
        support: 'priority' as const
      },
      enterprise: {
        monthly_issues: -1,
        concurrency: -1,
        claude_api_tokens: -1,
        support: 'dedicated' as const
      },
      addon: {
        monthly_issues: -1,
        concurrency: 1,
        claude_api_tokens: 10000,
        support: 'community' as const
      }
    };

    return limitations[tier as keyof typeof limitations];
  }

  /**
   * Get features for tier
   */
  private getFeaturesForTier(tier: string): string[] {
    const features = {
      free: [
        'verify-command',
        'agent-run-command',
        'deploy-command',
        'coordinator-agent',
        'codegen-agent',
        'review-agent'
      ],
      pro: [
        'all-commands',
        'all-agents',
        'advanced-analytics',
        'private-repos',
        'custom-workflows'
      ],
      enterprise: [
        'all-pro-features',
        'on-premise-deployment',
        'custom-agents',
        'sso-saml',
        'audit-logs',
        'training-workshops'
      ],
      addon: [
        'addon-specific-features'
      ]
    };

    return features[tier as keyof typeof features] || [];
  }
}
