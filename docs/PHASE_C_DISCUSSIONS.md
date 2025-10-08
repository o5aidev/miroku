# Phase C: Message Queue (Discussions) - Complete Documentation

**Status**: ✅ Implemented
**Issue**: #5 Phase C
**Priority**: High
**Completion Date**: 2025-10-08

---

## Overview

Phase C implements GitHub Discussions as a Message Queue and community engagement platform for the Autonomous Operations system. This enables asynchronous communication, FAQ automation, idea collection, and automatic conversion of feature ideas into trackable GitHub Issues.

### Architecture

```
GitHub Discussions
    │
    ├── Q&A ─────────────► FAQ Bot (auto-response)
    ├── Ideas ───────────► AI Analysis → GitHub Issue (auto-conversion)
    ├── Show & Tell ─────► Welcome Message
    ├── Announcements ───► Distribution
    └── General ─────────► Category Suggestions
```

---

## Key Features

### 1. Discussion Categories

Five primary categories for organized communication:

| Category | Purpose | Auto-Action |
|----------|---------|-------------|
| **Q&A** | Questions and answers | FAQ auto-response |
| **Ideas** | Feature proposals | Convert to Issues |
| **Show & Tell** | Showcase work | Welcome message |
| **Announcements** | Official updates | Pin to top |
| **General** | General discussion | Category suggestion |

### 2. AI-Powered Bot

- **Welcome Messages**: Greet new discussions automatically
- **FAQ Auto-Response**: Match questions to knowledge base
- **Category Suggestions**: Recommend appropriate category
- **Sentiment Analysis**: Detect positive/neutral/negative tone
- **Idea Conversion**: Transform ideas into structured Issues

### 3. Idea → Issue Workflow

Automatically converts feature proposals into actionable GitHub Issues:

1. User posts Idea in Discussions
2. AI analyzes content and extracts requirements
3. Creates structured GitHub Issue with:
   - Clear title and description
   - Acceptance criteria
   - Technical considerations
   - Appropriate labels
   - Estimated effort
4. Links back to original discussion
5. Notifies author

### 4. Rich CLI Experience

- Colorful console output with chalk
- Loading spinners with ora
- Progress indicators
- Detailed logging

---

## Components

### 1. Discussion Bot

**File**: `scripts/discussion-bot.ts`

Core bot for automated discussion management.

**Features**:
- Process new discussions
- Send welcome messages
- Provide FAQ responses
- Suggest category changes
- Convert ideas to issues

**Usage**:

```bash
# Process a specific discussion
npx tsx scripts/discussion-bot.ts process 42

# Search FAQ database
npx tsx scripts/discussion-bot.ts faq "how to setup"

# Run test scenario
npx tsx scripts/discussion-bot.ts test
```

**Example Output**:

```
🤖 Discussion Bot

📬 Processing Discussion

  Title: How do I implement a custom agent?
  Author: @developer123
  Category: General
  URL: https://github.com/owner/repo/discussions/42

🧠 AI Analysis:

  Suggested Category: Q&A
  Convert to Issue: No
  Is Question: Yes
  Sentiment: neutral
  Reasoning: User is asking a technical question about implementation

  ✓ Sent welcome message
  ✓ Sent FAQ response
  ✓ Suggested category: Q&A

✅ Discussion processing complete
```

### 2. Idea to Issue Converter

**File**: `scripts/convert-idea-to-issue.ts`

Converts feature ideas from Discussions to GitHub Issues using Claude AI.

**Features**:
- Fetches discussion via GitHub GraphQL API
- Analyzes with Claude Sonnet 4
- Generates structured Issue template
- Creates Issue with appropriate labels
- Links back to original discussion

**Usage**:

```bash
# Convert discussion #42 to an Issue
npx tsx scripts/convert-idea-to-issue.ts 42
```

**Example Output**:

```
🔄 Converting Discussion to Issue

✓ Fetched Discussion #42

  Title: Add support for custom webhook handlers
  Author: @contributor
  Category: Ideas
  URL: https://github.com/owner/repo/discussions/42

🧠 AI Analysis:

  Issue Title: [Feature] Support custom webhook handler registration
  Priority: P2-Medium
  Estimated Effort: M (4-16 hours)
  Labels: type:feature, priority:P2-Medium, phase:planning, agent:codegen

  Reasoning: This is a concrete feature proposal with clear requirements

✓ Created Issue #123

✅ Conversion complete!

📋 Issue URL: https://github.com/owner/repo/issues/123
```

### 3. GitHub Actions Workflow

**File**: `.github/workflows/discussion-bot.yml`

Automated workflow for discussion processing.

**Triggers**:
- `discussion.created`: Process new discussions
- `discussion_comment.created`: Handle commands like `/convert-to-issue`

**Jobs**:

#### Job 1: process-discussion
- Runs when new discussion is created
- Executes Discussion Bot
- Sends welcome message, FAQ response, category suggestion

#### Job 2: convert-idea-to-issue
- Runs when user comments `/convert-to-issue` on Ideas discussion
- Converts to GitHub Issue
- Posts conversion success comment

**Example Workflow Run**:

```yaml
name: Discussion Bot

on:
  discussion:
    types: [created]
  discussion_comment:
    types: [created]

jobs:
  process-discussion:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: npm install
      - run: npx tsx scripts/discussion-bot.ts process ${{ github.event.discussion.number }}
```

---

## Setup Instructions

### 1. Enable GitHub Discussions

1. Go to your repository **Settings**
2. Scroll down to **Features**
3. Check **Discussions**
4. Click **Set up discussions**

### 2. Create Discussion Categories

GitHub automatically creates default categories. Verify these exist:

- **Q&A**: Questions and answers
- **Ideas**: Feature proposals
- **Show & Tell**: Showcase achievements
- **Announcements**: Official announcements
- **General**: General discussions

### 3. Configure Environment Variables

Ensure these secrets are set in your repository:

```bash
# Required
GITHUB_TOKEN           # Automatically provided by GitHub Actions
ANTHROPIC_API_KEY      # Your Claude API key

# Optional
GITHUB_REPOSITORY      # Auto-detected from GitHub Actions context
```

### 4. Test Discussion Bot

Create a test discussion and verify bot responses:

```bash
# Local testing
npx tsx scripts/discussion-bot.ts test

# Test FAQ search
npx tsx scripts/discussion-bot.ts faq "how to setup"

# Process specific discussion
npx tsx scripts/discussion-bot.ts process 1
```

---

## FAQ Database

The bot includes a built-in FAQ database with automatic matching:

### Available FAQs

**Q: How do I set up the project?**
A: Run `npm install` to install dependencies, then `npm run setup:token` to configure your GitHub token.

**Q: How do I run the agents?**
A: Use `npm run agents:parallel:exec -- --issue <number>` to execute agents on a specific issue.

**Q: What agents are available?**
A: Available agents: CoordinatorAgent, CodeGenAgent, ReviewAgent, IssueAgent, PRAgent, DeploymentAgent.

**Q: How do I create a new agent?**
A: Extend the BaseAgent class and implement the `execute()` method. See `docs/AGENTS.md` for details.

**Q: Where are the logs?**
A: Agent logs are stored in `.agentic/logs/` directory. Use `npm run agents:status` to view recent activity.

### Adding New FAQs

Edit `scripts/discussion-bot.ts`:

```typescript
const FAQ_DATABASE = [
  {
    question: 'Your question here?',
    answer: 'Your answer here.',
    keywords: ['keyword1', 'keyword2', 'keyword3'],
  },
  // Add more FAQs
];
```

---

## Idea Conversion Process

### Step 1: User Posts Idea

User creates a discussion in the **Ideas** category with their feature proposal.

### Step 2: AI Analysis

Claude AI analyzes the discussion content:
- Extracts requirements
- Identifies problem statement
- Suggests solution approach
- Generates acceptance criteria
- Estimates implementation effort
- Determines appropriate labels

### Step 3: Issue Creation

Bot creates a structured GitHub Issue:

```markdown
## Original Discussion

**Discussion:** #42 - Add custom webhook handlers
**Author:** @contributor
**Category:** Ideas
**Created:** 2025-10-08

---

[Issue body with structured content]

---

## Metadata

**Estimated Effort:** M (4-16 hours)
**Priority:** P2-Medium

## Links

- 💬 [Original Discussion](https://github.com/owner/repo/discussions/42)
- 📚 [Documentation](/docs)
- 🤖 [Agent Documentation](/docs/AGENTS.md)
```

### Step 4: Notification

Bot posts a comment on the original discussion:

```markdown
## ✅ Converted to Issue

This idea has been converted to Issue #123 for tracking and implementation.

**Issue URL:** https://github.com/owner/repo/issues/123

The development team will review this and prioritize accordingly.

Thank you for your contribution! 🎉
```

---

## Usage Examples

### Example 1: New Q&A Discussion

**User Action**: Create discussion "How do I implement a custom agent?"

**Bot Response**:
1. Welcome message with quick tips
2. FAQ response matching "create new agent"
3. Category suggestion: Move to Q&A

### Example 2: Feature Idea

**User Action**: Create discussion "Support for custom webhook handlers" in Ideas

**Bot Response**:
1. Welcome message
2. AI analysis of feature proposal
3. Suggest conversion to Issue

**User Action**: Comment `/convert-to-issue`

**Bot Response**:
1. Convert to GitHub Issue #123
2. Post conversion confirmation
3. Link back to original discussion

### Example 3: Show & Tell

**User Action**: Create discussion "Built an AI-powered PR reviewer using this system!"

**Bot Response**:
1. Welcome message
2. Positive sentiment detected
3. Congratulations message

---

## API Reference

### DiscussionBot Class

```typescript
class DiscussionBot {
  /**
   * Process a new discussion
   * @param discussion - Discussion metadata
   */
  async processDiscussion(discussion: Discussion): Promise<void>;

  /**
   * Analyze discussion with Claude AI
   * @param discussion - Discussion to analyze
   * @returns Analysis results
   */
  private async analyzeDiscussion(discussion: Discussion): Promise<DiscussionAnalysis>;

  /**
   * Send welcome message
   * @param discussion - Discussion to welcome
   */
  private async sendWelcomeMessage(discussion: Discussion): Promise<void>;

  /**
   * Send FAQ response
   * @param discussion - Discussion to respond to
   * @param faqAnswer - FAQ answer text
   */
  private async sendFAQResponse(discussion: Discussion, faqAnswer: string): Promise<void>;

  /**
   * Suggest category change
   * @param discussion - Discussion to categorize
   * @param suggestedCategory - Recommended category
   */
  private async suggestCategory(discussion: Discussion, suggestedCategory: DiscussionCategory): Promise<void>;

  /**
   * Convert Idea to GitHub Issue
   * @param discussion - Discussion to convert
   */
  private async convertToIssue(discussion: Discussion): Promise<void>;

  /**
   * Search FAQ database
   * @param query - Search query
   * @returns Matching FAQ answer or null
   */
  searchFAQ(query: string): string | null;
}
```

### IdeaToIssueConverter Class

```typescript
class IdeaToIssueConverter {
  /**
   * Fetch discussion from GitHub GraphQL API
   * @param discussionNumber - Discussion number
   * @returns Discussion data
   */
  async fetchDiscussion(discussionNumber: number): Promise<Discussion>;

  /**
   * Analyze discussion and generate Issue template
   * @param discussion - Discussion to analyze
   * @returns Issue template
   */
  async analyzeAndGenerateIssue(discussion: Discussion): Promise<IssueTemplate>;

  /**
   * Create GitHub Issue from template
   * @param discussion - Original discussion
   * @param template - Issue template
   * @returns Created Issue number
   */
  async createIssue(discussion: Discussion, template: IssueTemplate): Promise<number>;

  /**
   * Convert discussion to Issue (main flow)
   * @param discussionNumber - Discussion number to convert
   */
  async convert(discussionNumber: number): Promise<void>;
}
```

### Types

```typescript
type DiscussionCategory = 'Q&A' | 'Ideas' | 'Show & Tell' | 'Announcements' | 'General';

interface Discussion {
  id: string;
  number: number;
  title: string;
  body: string;
  category: string;
  author: string;
  url: string;
  createdAt: string;
}

interface DiscussionAnalysis {
  category: DiscussionCategory;
  shouldConvertToIssue: boolean;
  isQuestion: boolean;
  suggestedFAQ?: string;
  sentiment: 'positive' | 'neutral' | 'negative';
  reasoning: string;
}

interface IssueTemplate {
  title: string;
  body: string;
  labels: string[];
  priority: string;
  estimatedEffort: string;
  reasoning: string;
}

interface BotConfig {
  enableWelcomeMessage: boolean;
  enableFAQ: boolean;
  enableCategorySuggestion: boolean;
  enableIdeaConversion: boolean;
}
```

---

## Bot Configuration

Customize bot behavior by modifying the configuration:

```typescript
const customConfig: BotConfig = {
  enableWelcomeMessage: true,      // Send welcome messages
  enableFAQ: true,                 // Auto-respond to FAQs
  enableCategorySuggestion: true,  // Suggest category changes
  enableIdeaConversion: true,      // Convert ideas to issues
};

const bot = new DiscussionBot(customConfig);
```

---

## Troubleshooting

### Issue: Bot not responding to discussions

**Symptoms**: New discussions created but no bot response

**Solutions**:
1. Check workflow is enabled: `.github/workflows/discussion-bot.yml`
2. Verify `ANTHROPIC_API_KEY` is set in repository secrets
3. Check GitHub Actions logs for errors
4. Ensure Discussions feature is enabled in repository settings

### Issue: GraphQL API errors

**Symptoms**: "Failed to fetch discussion" errors

**Solutions**:
1. Verify `GITHUB_TOKEN` has `discussions:read` permission
2. Check discussion number is valid
3. Ensure repository has Discussions enabled
4. Test with GitHub GraphQL Explorer

### Issue: FAQ not matching

**Symptoms**: Questions don't trigger FAQ responses

**Solutions**:
1. Check FAQ keywords in `FAQ_DATABASE`
2. Add more keywords to existing FAQs
3. Verify question text contains keywords
4. Test FAQ search: `npx tsx scripts/discussion-bot.ts faq "your query"`

### Issue: Idea conversion failing

**Symptoms**: `/convert-to-issue` command doesn't work

**Solutions**:
1. Ensure discussion is in **Ideas** category
2. Check `ANTHROPIC_API_KEY` is valid
3. Verify user has permission to create issues
4. Review GitHub Actions logs for detailed error

---

## Performance Metrics

Track these metrics for Discussion Bot health:

1. **Discussion Volume**: Number of discussions per day
2. **FAQ Match Rate**: Percentage of questions matched to FAQs
3. **Conversion Rate**: Percentage of ideas converted to issues
4. **Response Time**: Time from discussion creation to bot response
5. **Sentiment Distribution**: Positive/neutral/negative ratio

---

## Integration with Other Phases

### Phase A: Agent System
- Converted issues are automatically processed by agents
- IssueAgent labels and categorizes converted issues
- CoordinatorAgent assigns appropriate agents

### Phase B: Event Bus (Webhooks)
- Discussion events trigger workflows
- Bot actions logged to issue comments
- Routing decisions documented

### Phase D: CI/CD
- Issues created from ideas enter deployment pipeline
- Automated testing for converted features
- Deployment tracking

### Phase E: Dashboard
- Discussion metrics displayed
- Conversion statistics
- FAQ effectiveness tracking

---

## Best Practices

### 1. Keep FAQs Updated

Regularly review and update the FAQ database:
- Add new common questions
- Update answers as project evolves
- Remove outdated FAQs
- Improve keyword matching

### 2. Monitor Conversion Quality

Review automatically created issues:
- Verify requirements are complete
- Adjust AI prompts if needed
- Refine label selection logic
- Improve acceptance criteria generation

### 3. Engage with Community

- Respond to non-FAQ questions manually
- Thank contributors for ideas
- Provide feedback on converted issues
- Encourage discussion participation

### 4. Optimize Category Usage

- Pin important announcements
- Archive resolved Q&A
- Mark implemented ideas
- Organize with labels

---

## Future Enhancements

### Phase C+ (Planned)

1. **Advanced NLP**
   - Multi-language support
   - Semantic search for FAQs
   - Topic clustering
   - Auto-tagging

2. **Enhanced Automation**
   - Auto-close duplicate discussions
   - Merge similar ideas
   - Schedule announcement posts
   - Generate digest emails

3. **Analytics Dashboard**
   - Real-time discussion metrics
   - Sentiment trend analysis
   - Popular topics identification
   - User engagement tracking

4. **Integration Extensions**
   - Slack/Discord notifications
   - Email digest subscriptions
   - RSS feed generation
   - Calendar integration for announcements

---

## Testing Checklist

Verify Phase C implementation:

- [ ] GitHub Discussions is enabled
- [ ] All 5 categories exist (Q&A, Ideas, Show & Tell, Announcements, General)
- [ ] Discussion Bot workflow is active
- [ ] Welcome messages are sent to new discussions
- [ ] FAQ responses match correctly
- [ ] Category suggestions are accurate
- [ ] `/convert-to-issue` command works on Ideas
- [ ] Converted issues have proper structure
- [ ] Converted issues are properly labeled
- [ ] Links between discussions and issues work
- [ ] Bot handles errors gracefully
- [ ] All TypeScript types are correct: `npm run typecheck`
- [ ] Code passes linting: `npm run lint`

---

## Command Reference

### Discussion Bot Commands

```bash
# Process discussion
npx tsx scripts/discussion-bot.ts process <number>

# Search FAQ
npx tsx scripts/discussion-bot.ts faq "<query>"

# Run test scenario
npx tsx scripts/discussion-bot.ts test
```

### Idea Converter Commands

```bash
# Convert idea to issue
npx tsx scripts/convert-idea-to-issue.ts <discussion-number>
```

### User Commands (in Discussion Comments)

```bash
# Convert idea to issue
/convert-to-issue

# Request category change (future)
/move-to Q&A

# Mark as resolved (future)
/resolve
```

---

## Support and Resources

### Documentation
- [Phase A: Agent System](./PHASE_A_IMPLEMENTATION.md)
- [Phase B: Event Bus (Webhooks)](./PHASE_B_WEBHOOKS.md)
- [GitHub Discussions Guide](https://docs.github.com/en/discussions)
- [Claude API Documentation](https://docs.anthropic.com/claude/reference)

### Community
- **Discussions**: Ask questions in GitHub Discussions
- **Issues**: Report bugs or request features
- **Pull Requests**: Contribute improvements

---

## License

MIT License - See [LICENSE](../LICENSE) for details.

---

**Status**: ✅ Phase C Complete
**Next**: Phase D - CI/CD Integration
**Maintained By**: Autonomous Operations Team
**Last Updated**: 2025-10-08
