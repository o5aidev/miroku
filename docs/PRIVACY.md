# Privacy Policy

**Last Updated: 2025-10-10**

## Overview

Miyabi is a **local-first CLI tool** that prioritizes user privacy. This privacy policy explains how Miyabi handles data and what information may be transmitted to third-party services.

## Our Commitment

- **Local-First**: Miyabi runs entirely on your local machine
- **No Analytics**: We do not collect usage analytics or telemetry
- **No User Tracking**: We do not track user behavior or activity
- **Open Source**: All code is transparent and auditable

## Data Collection

### What We Collect

**Miyabi itself collects NO data.**

The CLI tool:
- ✅ Runs entirely locally on your machine
- ✅ Does not send any data to Miyabi's servers (we have none)
- ✅ Does not collect or store personal information
- ✅ Does not use cookies or tracking mechanisms

### What We Don't Collect

- Personal identification information
- Usage statistics or telemetry
- IP addresses
- Browser or system information
- File contents or project data

## Third-Party Services

When you use Miyabi, you interact with the following third-party services. Please review their privacy policies:

### 1. **GitHub API**

**Purpose**: Repository management, issue tracking, pull requests

**Data Transmitted**:
- Repository metadata (name, description, visibility)
- Issue and PR content you create
- Commit messages and code you push
- Your GitHub username and authentication token

**Privacy Policy**: https://docs.github.com/en/site-policy/privacy-policies/github-privacy-statement

**Your Control**:
- You provide your GitHub token explicitly
- You can revoke token access at any time via GitHub settings
- Data is governed by GitHub's privacy policy

### 2. **Anthropic Claude API** (Optional)

**Purpose**: AI-powered code generation (when using agent features)

**Data Transmitted** (only if you use AI features):
- Issue descriptions and requirements
- Code context for generation
- Project metadata necessary for code generation

**Privacy Policy**: https://www.anthropic.com/legal/privacy

**Your Control**:
- AI features require explicit ANTHROPIC_API_KEY configuration
- Without the API key, no data is sent to Anthropic
- You control what prompts and context are sent

### 3. **npm Registry** (Installation Only)

**Purpose**: Package distribution and installation

**Data Transmitted**:
- Package download request (standard npm behavior)
- No additional data collected by Miyabi

**Privacy Policy**: https://docs.npmjs.com/policies/privacy

## Data Storage

### Local Storage

Miyabi stores the following on your local machine:

1. **Configuration Files**
   - `.miyabi.yml` - Project configuration
   - `.env` - Environment variables (tokens, API keys)
   - Location: Your project directory

2. **Temporary Files**
   - Task locks (`.task-locks/`)
   - Build artifacts (`dist/`, `node_modules/`)
   - Location: Your project directory

### Security Recommendations

- ✅ Add `.env` to `.gitignore` (done by default)
- ✅ Never commit API keys or tokens to version control
- ✅ Use environment variables for sensitive data
- ✅ Review `.miyabi.yml` before committing

## Your Rights

### Data Control

You have complete control over all data:

- **Access**: All data is stored locally on your machine
- **Modification**: Edit configuration files directly
- **Deletion**: Remove files or uninstall Miyabi at any time
- **Portability**: All data is in standard formats (YAML, JSON, TypeScript)

### Token Revocation

To stop data transmission to third-party services:

1. **GitHub**: Revoke token at https://github.com/settings/tokens
2. **Anthropic**: Remove `ANTHROPIC_API_KEY` from environment
3. **npm**: No action needed (only used for installation)

## AI-Generated Code

### Transparency

Miyabi uses Claude AI for code generation. Important notes:

- Generated code is reviewed by Claude AI
- Code may be logged by Anthropic for service improvement (see Anthropic's privacy policy)
- You are responsible for reviewing and testing all generated code
- Generated code may contain errors or security vulnerabilities

### Your Responsibility

- ✅ Review all generated code before merging
- ✅ Test thoroughly in non-production environments
- ✅ Scan for security vulnerabilities
- ✅ Do not commit sensitive data in prompts or context

## Data Sharing

**We do not share, sell, or rent your data.**

Miyabi does not:
- Share data with third parties (except GitHub/Anthropic as described above)
- Sell user information
- Use data for advertising
- Aggregate or anonymize data for analytics

## Security

### Best Practices

To protect your data when using Miyabi:

1. **Token Security**
   - Store tokens in environment variables
   - Use GitHub fine-grained tokens with minimal permissions
   - Rotate tokens regularly
   - Never commit tokens to version control

2. **Code Review**
   - Review all AI-generated code
   - Scan dependencies for vulnerabilities (`npm audit`)
   - Use branch protection rules
   - Require PR reviews before merging

3. **Access Control**
   - Use CODEOWNERS file for sensitive code
   - Enable 2FA on GitHub account
   - Restrict token permissions to necessary scopes

### Reporting Security Issues

If you discover a security vulnerability:

1. **Do not** open a public issue
2. Report via GitHub Security Advisory
3. Or email: Contact via GitHub profile
4. See [SECURITY.md](SECURITY.md) for details

## Children's Privacy

Miyabi is not intended for children under 13 years of age. We do not knowingly collect information from children.

## International Users

Miyabi is a local CLI tool and does not transfer data internationally. However:

- GitHub operates globally (see their privacy policy)
- Anthropic operates from the United States (see their privacy policy)
- You are responsible for compliance with local data protection laws

## Changes to This Policy

We may update this privacy policy from time to time. Changes will be:

- Documented in this file with updated timestamp
- Announced in release notes
- Tracked in git history

**Last Updated**: 2025-10-10

## Contact

Questions about privacy?

- 📧 Email: Contact via GitHub profile
- 🐛 Issues: https://github.com/ShunsukeHayashi/Miyabi/issues
- 🔐 Security: See [SECURITY.md](SECURITY.md)

## Compliance

### GDPR (EU)

For EU users, Miyabi complies with GDPR principles:

- **Lawful Basis**: Legitimate interest (tool functionality)
- **Data Minimization**: Only essential data transmitted to third parties
- **Right to Access**: All data stored locally, accessible by you
- **Right to Erasure**: Delete files or uninstall at any time
- **Data Portability**: All data in standard formats

### CCPA (California)

For California users:

- **No Sale of Data**: We do not sell personal information
- **No Tracking**: We do not track users across websites
- **Access Rights**: All data accessible locally on your machine

### Other Jurisdictions

Miyabi operates globally. Users are responsible for ensuring compliance with local data protection laws.

## Open Source Transparency

Miyabi is fully open source under the Apache 2.0 License:

- Source code: https://github.com/ShunsukeHayashi/Miyabi
- All data handling is transparent and auditable
- Community contributions welcome
- Security through transparency

## Disclaimer

**THIS PRIVACY POLICY IS PROVIDED "AS IS" WITHOUT WARRANTY OF ANY KIND.**

The Miyabi project maintainers are not liable for:
- Data transmitted to third-party services
- Security breaches of external services
- Misuse of tokens or credentials
- Data loss or corruption

**YOU ARE RESPONSIBLE FOR**:
- Reviewing and accepting third-party privacy policies
- Securing your tokens and credentials
- Backing up your data
- Compliance with applicable laws

---

**Thank you for using Miyabi responsibly and securely.** 🌸

For full terms, see [LICENSE](LICENSE) and [NOTICE](NOTICE).
