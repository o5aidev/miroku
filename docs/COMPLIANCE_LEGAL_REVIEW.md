# Compliance and Legal Risk Review - Miyabi v0.8.0

**Date**: 2025-10-10
**Reviewer**: AI Legal & Compliance Analysis
**Version**: 0.8.0
**License**: Apache-2.0

---

## Executive Summary

This document provides a comprehensive review of legal and compliance risks for the Miyabi autonomous development framework project.

### Overall Risk Assessment: **LOW-MEDIUM** ✅

The project has good legal foundations with Apache 2.0 licensing, but some areas require attention.

---

## 1. Intellectual Property & Licensing

### ✅ Strengths

1. **Apache 2.0 License** - Well-chosen for OSS project
   - ✅ Trademark protection for "Miyabi" name
   - ✅ Patent protection included
   - ✅ Attribution requirements clearly stated
   - ✅ NOTICE file properly implemented

2. **Copyright Notices**
   - ✅ Clear copyright attribution to Shunsuke Hayashi
   - ✅ Consistent across all files

3. **Dependency Licensing**
   - ✅ All dependencies listed in NOTICE file
   - ✅ No GPL/AGPL conflicts detected
   - ✅ MIT-compatible stack

### ⚠️ Risks & Recommendations

#### Risk 1.1: Trademark "Miyabi" Not Registered (Medium Risk)
**Issue**: NOTICE file claims "Miyabi" as trademark without formal registration

**Impact**:
- Others could potentially register "Miyabi" trademark first
- Limited enforceability without registration
- "TM" symbol usage without registration may be questioned

**Recommendation**:
```
1. Either:
   A) File trademark registration in relevant jurisdictions (JP, US, EU)
   B) Modify NOTICE to state "claimed as common law trademark" instead

2. Current wording adjustment:
   FROM: "'Miyabi' is a trademark of Shunsuke Hayashi"
   TO: "'Miyabi' is a product name claimed by Shunsuke Hayashi"
```

#### Risk 1.2: "Organizational Management Theory" Too Generic (Low Risk)
**Issue**: Replaced specific theory with generic term

**Impact**: ✅ Resolved trademark risk
**Status**: ✅ No action needed

---

## 2. Third-Party Services & APIs

### Anthropic Claude AI

**License**: Commercial API service
**Terms**: https://www.anthropic.com/legal/commercial-terms

⚠️ **Risk 2.1: Claude API Usage in Automated Systems**

**Issue**:
- Automated code generation may have usage restrictions
- Terms of Service may prohibit fully autonomous usage
- Rate limits and costs for commercial deployment

**Recommendation**:
```markdown
1. Review Anthropic's Terms of Service for:
   - Automated/autonomous agent usage permissions
   - Commercial use restrictions
   - Attribution requirements

2. Add disclaimer in README:
   "Users are responsible for compliance with Anthropic's Terms of Service.
   Anthropic API Key required and subject to Anthropic's usage policies."
```

### GitHub API

**License**: GitHub Terms of Service
**API Limits**: Rate limits apply

✅ **Status**: Properly implemented with:
- Retry logic with exponential backoff
- Rate limit handling
- User's own GitHub token (not proxy)

---

## 3. Privacy & Data Protection

### GDPR Compliance (EU)

**Current Status**: ⚠️ No privacy policy

**Data Collected**:
- GitHub tokens (user-provided, local storage)
- Anthropic API keys (user-provided, local storage)
- Device identifiers (DEVICE_IDENTIFIER env var)
- GitHub repository data (via user's API access)

⚠️ **Risk 3.1: No Privacy Policy** (Medium Risk - if EU users)

**Recommendation**:
```markdown
Add PRIVACY.md:

# Privacy Policy

## Data Collection
Miyabi CLI tool:
- Stores credentials locally in `.env` files (never transmitted to Miyabi servers)
- No telemetry or analytics collected
- No data sent to third parties except:
  - GitHub API (user's own repositories)
  - Anthropic API (if user provides API key)

## User Responsibilities
- Users must comply with GitHub and Anthropic privacy policies
- Users are responsible for protecting their API keys
- Local `.env` files should be added to `.gitignore`

## Data Retention
- All data stored locally
- No server-side storage
- Users control all data
```

---

## 4. Export Control & Cryptography

### Current Status: ✅ LOW RISK

**Cryptography Usage**:
- ✅ No custom cryptography implemented
- ✅ Uses standard HTTPS for API calls
- ✅ Relies on system SSL/TLS libraries

**Export Control**:
- ✅ Open source with public repository
- ✅ No encryption > 56-bit (exempt from US EAR)
- ✅ No military/weapons applications

**Compliance**: ✅ No action required

---

## 5. Security Vulnerabilities & Liability

### Current Implementation

✅ **Strengths**:
- Security scanning (Dependabot, CodeQL)
- SECURITY.md file exists
- Token handling best practices (gh CLI priority)
- No hardcoded credentials

⚠️ **Risk 5.1: Disclaimer of Liability Insufficient**

**Issue**: Apache 2.0 has disclaimer, but README should emphasize

**Recommendation**:
```markdown
Add to README.md:

## ⚠️ Disclaimer

Miyabi is provided "AS IS" without warranty. Users are responsible for:
- Review of AI-generated code before deployment
- Security of API credentials
- Compliance with applicable laws and third-party ToS
- Testing before production use

See LICENSE for full disclaimer of warranties and limitation of liability.
```

---

## 6. Accessibility (Section 508 / WCAG)

**Current Status**: ⚠️ Not applicable for CLI tool

**Web Dashboard**:
- If GitHub Pages dashboard is user-facing, WCAG 2.1 AA recommended
- Currently internal tool - low priority

---

## 7. Contributor License Agreement (CLA)

**Current Status**: ❌ No CLA

⚠️ **Risk 7.1: No CLA for External Contributors**

**Impact**:
- Contributors retain copyright on their contributions
- Potential future licensing conflicts
- No patent grant from contributors

**Recommendation**:
```markdown
Add CONTRIBUTING.md section:

## Contributor License Agreement

By submitting a pull request, you agree that:
1. Your contributions are licensed under Apache-2.0
2. You grant a patent license for any patents embodied in your contribution
3. You have the right to submit the work under this license
4. You understand this is a voluntary contribution

Alternatively: Implement GitHub CLA bot for formal tracking
```

---

## 8. Specific Legal Risks

### 8.1 Removed "識学 (Shikigaku)" References ✅

**Status**: ✅ RESOLVED
**Action Taken**: All references replaced with generic "Organizational Design Principles"
**Risk Eliminated**: Trademark infringement risk eliminated

### 8.2 Name Conflicts

**Checked**:
- ✅ npm package "miyabi" - Available and published by you
- ✅ GitHub org/repo name - No major conflicts
- ⚠️ Trademark "Miyabi" - Multiple existing uses (see Risk 1.1)

**Recommendation**: Monitor for conflicts, consider alternative names if litigation risk emerges

### 8.3 AI-Generated Code Liability

**Issue**: Code generated by Claude AI may have unexpected behavior

**Recommendation**:
```markdown
Add to README.md:

## AI-Generated Code Notice

Miyabi uses AI (Claude) for code generation. Users must:
- ✅ Review all generated code before merging
- ✅ Test thoroughly in non-production environments
- ✅ Understand that AI-generated code may contain errors
- ✅ Take responsibility for code deployed to production

The Miyabi project is not liable for issues arising from AI-generated code.
```

---

## 9. Compliance Checklist

### Immediate Actions (High Priority)

- [ ] **Trademark**: Revise NOTICE file wording (Risk 1.1)
- [ ] **Privacy**: Add PRIVACY.md (Risk 3.1)
- [ ] **Disclaimer**: Add AI-generated code notice to README (Risk 8.3)
- [ ] **Disclaimer**: Add general disclaimer section to README (Risk 5.1)
- [ ] **CLA**: Add contributor agreement to CONTRIBUTING.md (Risk 7.1)

### Medium Priority

- [ ] Review Anthropic ToS for automated usage compliance (Risk 2.1)
- [ ] Consider trademark registration for "Miyabi" (Risk 1.1)
- [ ] Security audit of credential handling
- [ ] Penetration testing for webhook endpoints (if any)

### Low Priority

- [ ] WCAG 2.1 compliance for dashboard (if public-facing)
- [ ] Export control classification (if international distribution)
- [ ] Insurance for open source project (Errors & Omissions)

---

## 10. Country-Specific Considerations

### Japan (Primary Market)

✅ **Copyright**: Berne Convention - automatic protection
✅ **Patent**: No software patent issues (algorithm-based)
⚠️ **Trademark**: Consider JPO registration for "Miyabi"
✅ **Privacy**: APPI compliance - minimal data collection helps

### United States

✅ **DMCA**: GitHub handles takedown notices
⚠️ **Patent**: Apache 2.0 patent grant protects contributors
⚠️ **Trademark**: USPTO registration recommended
✅ **Privacy**: No personal data collection = CCPA low risk

### European Union

⚠️ **GDPR**: Privacy policy recommended (Risk 3.1)
✅ **Copyright**: EU Copyright Directive - compliant
✅ **CCPA/DMA**: Minimal data = low compliance burden

---

## 11. Risk Matrix

| Risk ID | Description | Probability | Impact | Priority | Status |
|---------|-------------|-------------|--------|----------|--------|
| 1.1 | Trademark not registered | Medium | Medium | HIGH | Open |
| 2.1 | Claude API ToS compliance | Low | Medium | MEDIUM | Review needed |
| 3.1 | No privacy policy | Medium | Low | MEDIUM | Open |
| 5.1 | Insufficient disclaimer | Low | High | HIGH | Open |
| 7.1 | No CLA for contributors | Medium | Medium | MEDIUM | Open |
| 8.3 | AI-generated code liability | Medium | High | HIGH | Open |

---

## 12. Conclusion

### Overall Assessment: **Legally Sound with Minor Improvements Needed**

**Strengths**:
- ✅ Appropriate open source license (Apache 2.0)
- ✅ Clean dependency stack
- ✅ Removed trademark infringement risks
- ✅ Good security practices

**Action Required**:
1. Revise trademark claims in NOTICE
2. Add disclaimers to README
3. Create PRIVACY.md
4. Update CONTRIBUTING.md with CLA language
5. Review Anthropic Claude ToS

**Timeline**: Recommend completion within 14 days

---

**Document Version**: 1.0
**Next Review**: 2025-11-10 (30 days)
**Approved By**: Shunsuke Hayashi (Project Owner)

---

## Appendix A: Useful Resources

- Apache License 2.0: https://www.apache.org/licenses/LICENSE-2.0
- SPDX License List: https://spdx.org/licenses/
- GitHub Terms of Service: https://docs.github.com/en/site-policy
- Anthropic Terms: https://www.anthropic.com/legal
- GDPR Compliance Checker: https://gdpr.eu/
- USPTO Trademark Search: https://www.uspto.gov/trademarks
- JPO (Japan Patent Office): https://www.jpo.go.jp/

---

*This review is for informational purposes and does not constitute legal advice. Consult a qualified attorney for legal matters.*
