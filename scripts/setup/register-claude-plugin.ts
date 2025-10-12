/**
 * Script to register Miyabi as a Claude Plugin
 */

import { PluginRegistrationManager } from '../src/plugin/registration.js';
import { logger } from '../src/ui/index.js';

async function main(): Promise<void> {
  try {
    logger.info('🌸 Miyabi Claude Plugin Registration', 'SCRIPT');
    logger.info('=====================================', 'SCRIPT');

    // Create registration package
    logger.info('Step 1: Creating registration package...', 'SCRIPT');
    const registration = await PluginRegistrationManager.createRegistrationPackage();
    logger.success('✓ Registration package created', 'SCRIPT');

    // Submit registration
    logger.info('Step 2: Submitting to Claude Plugin Marketplace...', 'SCRIPT');
    const success = await PluginRegistrationManager.submitRegistration(registration);
    
    if (success) {
      logger.success('✓ Registration submitted successfully', 'SCRIPT');
    } else {
      throw new Error('Registration submission failed');
    }

    // Generate documentation
    logger.info('Step 3: Generating submission documentation...', 'SCRIPT');
    await PluginRegistrationManager.generateSubmissionDocs();
    logger.success('✓ Documentation generated', 'SCRIPT');

    logger.success('🎉 Plugin registration completed!', 'SCRIPT');
    logger.info('Registration files available in: ./dist/registration/', 'SCRIPT');

  } catch (error) {
    logger.error('❌ Registration failed', 'SCRIPT');
    logger.error(error instanceof Error ? error.message : String(error), 'SCRIPT');
    process.exit(1);
  }
}

// Run script
main().catch((error) => {
  console.error('Unhandled error:', error);
  process.exit(1);
});