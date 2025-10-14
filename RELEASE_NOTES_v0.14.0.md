# Release Notes - v0.14.0

**Release Date**: 2025-10-14
**Code Name**: UI/UX Debugging Integration

---

## 🎯 Overview

This release focuses on enhancing UI/UX debugging capabilities with HeroUI component development and Chrome DevTools Protocol integration. We've added the 9th Coding Agent (HeroUIAgent) and established a comprehensive workflow for UI/UX optimization.

---

## ✨ What's New

### 🎨 HeroUIAgent - 9th Coding Agent

**Character Name**: ひーろー (Hero) - 🟢実行役

A specialized agent for HeroUI component development, featuring:
- Component generation and integration
- Theme customization and optimization
- Parallel execution with other agents
- Complete TypeScript + React support

**Files**:
- `.claude/agents/specs/coding/heroui-agent.md` - Agent specification
- `.claude/agents/prompts/coding/heroui-agent-prompt.md` - Execution prompt

### 🔧 Chrome DevTools Protocol Integration

**Direct browser automation** for Claude Code:
- `chrome-devtools-mcp` MCP server added
- stdio-based integration (compatible with Claude Code)
- Browser debugging and automation tools
- Screenshot, navigation, and interaction capabilities

**Configuration**:
```json
// .claude/mcp.json
"chrome-devtools": {
  "command": "npx",
  "args": ["-y", "chrome-devtools-mcp@latest"],
  "disabled": true
}
```

### 📚 Comprehensive dev3000 Documentation

After extensive testing and investigation:

**Created Documentation**:
- `docs/DEV3000_FINAL_STATUS.md` - Complete guide and recommendations
- `docs/DEV3000_TEST_REPORT.md` - Detailed test results
- `docs/DEV3000_INTEGRATION_SUMMARY.md` - Technical analysis
- `docs/DEV3000_MCP_INTEGRATION.md` - Architecture guide

**Key Findings**:
- dev3000 is an MCP orchestrator (not direct MCP server)
- Incompatible with Claude Code's stdio-based architecture
- chrome-devtools-mcp is the working alternative
- dev3000 standalone mode still useful for manual debugging

---

## 🔄 Changes

### Agent System Updates

**Total Count**: 23 Agents (9 Coding + 14 Business)

**New Character**: ひーろー
- Color: 🟢実行役 (Execution Role)
- Parallel execution: ✅ Capable
- Office metaphor: UI Component Development Staff

### Documentation Updates

**CLAUDE.md**: Updated with 9 Coding Agents
**Character System**: Enhanced parallel execution rules
**Workflow Recommendations**: UI/UX debugging best practices

---

## 🛠️ Technical Improvements

### Architecture Discovery

Comprehensive analysis of dev3000's MCP integration:

**Protocol Analysis**:
- Tested endpoints: `/mcp`, `/api/mcp`, `/api/tools`, `/api/orchestrator`
- Identified HTTP/SSE vs stdio transport incompatibility
- Validated chrome-devtools-mcp as working alternative
- Documented MCP orchestrator vs MCP server architecture

**Test Coverage**:
- Created test scripts for endpoint validation
- Documented all findings with examples
- Provided workarounds and alternatives

---

## 📖 Usage Guide

### UI/UX Debugging Workflow

**Option 1: Automated (Claude Code + chrome-devtools-mcp)**

```bash
# 1. Start Chrome with remote debugging
/Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome \
  --remote-debugging-port=9222 \
  --user-data-dir=/tmp/chrome-debug

# 2. Enable in .claude/mcp.json
# Set "disabled": false for chrome-devtools

# 3. Restart Claude Code

# 4. Use commands:
# "Take a screenshot of http://localhost:5173"
# "Click the submit button"
# "Navigate to /about page"
```

**Option 2: Manual (dev3000 standalone)**

```bash
# 1. Start your development server
npm run dashboard:dev

# 2. Start dev3000
cd packages/dashboard
dev3000

# 3. Access web UI
# http://localhost:3684
```

**Option 3: Combined Approach**

Use both tools for maximum effectiveness:
- **chrome-devtools-mcp**: Automated testing and verification
- **dev3000**: Manual investigation with unified logs

---

## 🎯 Recommendations

### For UIUXAgent (みためん)

**Phase 1**: Automated checks via chrome-devtools-mcp
- Browser automation
- Screenshot capture
- Element interaction
- State verification

**Phase 2**: Manual investigation via dev3000
- Unified timeline view
- Auto-captured error screenshots
- Network request inspection
- Performance metrics

**Phase 3**: Report generation
- Combine automated findings
- Add manual observations
- Provide actionable recommendations

---

## 🔗 Breaking Changes

**None** - This release is fully backward compatible.

---

## 📊 Stats

**New Files**: 7
- 2 Agent files (spec + prompt)
- 4 Documentation files
- 1 MCP proxy (reference)

**Modified Files**: 7
- `.claude/mcp.json` - Added chrome-devtools
- `CLAUDE.md` - Updated agent count
- `package.json` - Version bump
- `CHANGELOG.md` - Release notes
- `.claude/agents/agent-name-mapping.json` - Added Hero
- Various documentation updates

**Lines Added**: ~2,500+
**Test Scripts Created**: 3

---

## 🙏 Acknowledgments

**Tools Used**:
- dev3000 by Vercel Labs
- chrome-devtools-mcp by @pierrebrunelle
- Claude Code by Anthropic

**Special Thanks**:
- Vercel Labs for dev3000 development tool
- MCP community for protocol specifications
- All contributors and testers

---

## 🚀 What's Next (v0.15.0)

**Planned Features**:
- HeroUIAgent implementation (TypeScript code)
- Dashboard component library expansion
- E2E testing with Playwright
- Performance benchmarking suite
- Additional MCP server integrations

---

## 📦 Installation

### Update Existing Installation

```bash
# NPM
npm install miyabi@latest

# PNPM
pnpm update miyabi

# Yarn
yarn upgrade miyabi
```

### Fresh Installation

```bash
# Global install
npm install -g miyabi

# Or use directly
npx miyabi init my-project
```

---

## 🔗 Links

- **GitHub**: https://github.com/ShunsukeHayashi/Miyabi
- **NPM**: https://www.npmjs.com/package/miyabi
- **Documentation**: https://github.com/ShunsukeHayashi/Miyabi/tree/main/docs
- **Issues**: https://github.com/ShunsukeHayashi/Miyabi/issues

---

## 📝 Full Changelog

See [CHANGELOG.md](./CHANGELOG.md) for complete version history.

---

🌸 **Miyabi v0.14.0** - Beauty in Autonomous Development with Enhanced UI/UX Debugging

**Published**: 2025-10-14
**Author**: Shunsuke Hayashi (@ShunsukeHayashi)
