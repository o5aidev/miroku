"""
SEO Blog Content Generator - Streamlit App
===========================================

Complete workflow for generating SEO-optimized blog content using:
- SERP API for competitor research
- Web scraping for content analysis
- GPT-4 for content generation
- Parallel async execution for speed
- Real-time streaming output

Usage:
    streamlit run seo_blog_generator.py
"""

import streamlit as st
import asyncio
import sys
import os
from datetime import datetime

# Add parent directory to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from agents.serp_agent import SerpAgent, print_serp_results
from agents.scraper_agent import ScraperAgent
from agents.content_generator import ContentGeneratorAgent
from core.workflow_architecture import WorkflowArchitecture, WorkflowStage, WorkflowNode
from core.entity_mapping import create_seo_blog_entity_map


# Page configuration
st.set_page_config(
    page_title="SEO Blog Content Generator",
    page_icon="✍️",
    layout="wide"
)

st.title("✍️ SEO Blog Content Generator")
st.markdown("Generate SEO-optimized blog content with AI-powered competitor analysis")


# Sidebar configuration
st.sidebar.header("⚙️ Configuration")

# API Keys
st.sidebar.subheader("API Keys")
openai_api_key = st.sidebar.text_input(
    "OpenAI API Key",
    type="password",
    value=os.getenv("OPENAI_API_KEY", "")
)
serpapi_key = st.sidebar.text_input(
    "SerpAPI Key",
    type="password",
    value=os.getenv("SERPAPI_KEY", "")
)

# Model settings
st.sidebar.subheader("Model Settings")
model = st.sidebar.selectbox(
    "GPT Model",
    ["gpt-4", "gpt-4-turbo", "gpt-3.5-turbo"],
    index=0
)
temperature = st.sidebar.slider(
    "Temperature",
    min_value=0.0,
    max_value=1.0,
    value=0.7,
    step=0.1
)

# Content settings
st.sidebar.subheader("Content Settings")
target_word_count = st.sidebar.number_input(
    "Target Word Count",
    min_value=500,
    max_value=5000,
    value=2000,
    step=100
)
num_competitors = st.sidebar.number_input(
    "Number of Competitor URLs",
    min_value=1,
    max_value=10,
    value=5,
    step=1
)


# Main content area
st.header("📝 Enter Your Keyword")
keyword = st.text_input(
    "Target Keyword",
    placeholder="e.g., AI automation for small businesses"
)

# Entity Relation Map visualization
if st.checkbox("Show Entity Relation Map"):
    st.subheader("🗺️ Workflow Entity Relations")
    erm = create_seo_blog_entity_map()
    st.code(erm.visualize_ascii(), language="text")


# Generate button
if st.button("🚀 Generate Content", type="primary", disabled=not (keyword and openai_api_key and serpapi_key)):
    # Create workflow
    workflow = WorkflowArchitecture("SEO Blog Generator")

    # Status containers
    status_container = st.container()
    progress_bar = st.progress(0)

    # Result containers
    with st.expander("🔍 SERP Results", expanded=False):
        serp_container = st.empty()

    with st.expander("📄 Competitor Content", expanded=False):
        scraper_container = st.empty()

    with st.expander("🎯 User Intent Analysis", expanded=False):
        intent_container = st.empty()

    st.subheader("📰 Generated Article")
    title_container = st.empty()
    structure_container = st.empty()

    # Section containers (will be created dynamically)
    section_containers = {}

    # Main async function
    async def generate_content():
        """Main content generation workflow"""
        try:
            # Update status
            status_container.info("🔄 Initializing agents...")
            progress_bar.progress(0.05)

            # Context for sharing data between nodes
            context = {"keyword": keyword}

            # ========================================
            # STAGE 1: SERP Research
            # ========================================
            status_container.info(f"🔍 Fetching top {num_competitors} Google results for '{keyword}'...")
            progress_bar.progress(0.1)

            async with SerpAgent(serpapi_key, results_limit=num_competitors) as serp_agent:
                serp_response = await serp_agent.search(keyword)
                context['serp_results'] = serp_response

                # Display SERP results
                serp_output = f"**Keyword:** {serp_response.keyword}\n\n"
                serp_output += f"**Total Results:** {serp_response.total_results:,}\n\n"
                for result in serp_response.results:
                    serp_output += f"{result.position}. **{result.title}**\n"
                    serp_output += f"   - URL: {result.url}\n"
                    serp_output += f"   - Domain: {result.domain}\n\n"

                serp_container.markdown(serp_output)

            progress_bar.progress(0.2)

            # ========================================
            # STAGE 2: Web Scraping
            # ========================================
            status_container.info(f"📄 Scraping content from {len(serp_response.results)} URLs (parallel)...")
            progress_bar.progress(0.25)

            urls = [result.url for result in serp_response.results]

            async with ScraperAgent(timeout=15) as scraper_agent:
                scraped_contents = await scraper_agent.scrape_multiple(urls)
                context['scraped_contents'] = scraped_contents

                # Display scraper results
                scraper_output = f"**Successfully scraped:** {sum(1 for c in scraped_contents if c.success)}/{len(scraped_contents)}\n\n"
                for i, content in enumerate(scraped_contents, 1):
                    if content.success:
                        scraper_output += f"{i}. **{content.title}** ({content.word_count} words)\n"
                    else:
                        scraper_output += f"{i}. ❌ Failed: {content.error}\n"

                scraper_container.markdown(scraper_output)

            progress_bar.progress(0.4)

            # ========================================
            # STAGE 3: Content Generation with GPT-4
            # ========================================
            status_container.info("🤖 Initializing GPT-4 content generator...")

            # Extract text from successful scrapes
            competitor_texts = [
                content.body_text
                for content in scraped_contents
                if content.success and content.body_text
            ]

            async with ContentGeneratorAgent(openai_api_key, model=model, temperature=temperature) as generator:

                # --- Step 3.1: Analyze Intent ---
                status_container.info("🎯 Analyzing user intent with GPT-4...")
                progress_bar.progress(0.45)

                intent_placeholder = intent_container.empty()
                intent_text = ""

                def on_intent_chunk(chunk):
                    nonlocal intent_text
                    if not chunk.is_final:
                        intent_text += chunk.content
                        intent_placeholder.markdown(f"**Analysis (streaming):**\n\n{intent_text}")

                user_intent = await generator.analyze_intent(
                    keyword=keyword,
                    competitor_contents=competitor_texts,
                    on_chunk=on_intent_chunk
                )
                context['user_intent'] = user_intent

                # Display final intent
                intent_output = f"**Primary Intent:** {user_intent.primary_intent}\n\n"
                intent_output += f"**Key Keywords:** {', '.join(user_intent.keywords)}\n\n"
                intent_output += f"**User Questions:**\n"
                for q in user_intent.questions:
                    intent_output += f"- {q}\n"
                intent_output += f"\n**Main Topics:**\n"
                for t in user_intent.topics:
                    intent_output += f"- {t}\n"

                intent_container.markdown(intent_output)
                progress_bar.progress(0.5)

                # --- Step 3.2: Generate Title ---
                status_container.info("📝 Generating article title...")
                progress_bar.progress(0.55)

                title_text = ""
                title_placeholder = title_container.empty()

                def on_title_chunk(chunk):
                    nonlocal title_text
                    if not chunk.is_final:
                        title_text += chunk.content
                        title_placeholder.markdown(f"# {title_text}")

                article_title = await generator.generate_title(
                    keyword=keyword,
                    user_intent=user_intent,
                    on_chunk=on_title_chunk
                )
                context['article_title'] = article_title

                title_container.markdown(f"# {article_title}")
                progress_bar.progress(0.6)

                # --- Step 3.3: Generate Structure ---
                status_container.info("🏗️ Generating article structure...")
                progress_bar.progress(0.65)

                structure_text = ""
                structure_placeholder = structure_container.empty()

                def on_structure_chunk(chunk):
                    nonlocal structure_text
                    if not chunk.is_final:
                        structure_text += chunk.content
                        structure_placeholder.markdown(f"**Outline (streaming):**\n\n{structure_text}")

                article_structure = await generator.generate_structure(
                    title=article_title,
                    keyword=keyword,
                    user_intent=user_intent,
                    target_word_count=target_word_count,
                    on_chunk=on_structure_chunk
                )
                context['article_structure'] = article_structure

                # Display structure
                structure_output = "**Article Outline:**\n\n"
                for heading in article_structure.headings:
                    indent = "  " * (int(heading['level'][1]) - 2)
                    structure_output += f"{indent}- {heading['text']}\n"

                structure_container.markdown(structure_output)
                progress_bar.progress(0.7)

                # --- Step 3.4: Generate ALL Section Content in PARALLEL ---
                status_container.info(f"🚀 Generating content for {len(article_structure.headings)} sections IN PARALLEL...")
                progress_bar.progress(0.75)

                # Create containers for each section
                st.markdown("---")
                for i, heading in enumerate(article_structure.headings):
                    level = heading['level']
                    text = heading['text']

                    # Create heading
                    if level == 'h2':
                        st.subheader(text)
                    elif level == 'h3':
                        st.markdown(f"### {text}")
                    else:
                        st.markdown(f"#### {text}")

                    # Create content container
                    section_containers[i] = st.empty()

                # Callback for streaming updates
                section_texts = {i: "" for i in range(len(article_structure.headings))}

                def on_section_chunk(section_idx, chunk):
                    if not chunk.is_final:
                        section_texts[section_idx] += chunk.content
                        section_containers[section_idx].markdown(section_texts[section_idx])

                # Generate all sections in parallel!
                generated_sections = await generator.generate_all_sections_parallel(
                    structure=article_structure,
                    keyword=keyword,
                    on_chunk=on_section_chunk
                )
                context['generated_sections'] = generated_sections

                progress_bar.progress(0.95)

                # Display final content
                for i, section in enumerate(generated_sections):
                    section_containers[i].markdown(section.content)

            # ========================================
            # COMPLETION
            # ========================================
            progress_bar.progress(1.0)
            status_container.success(f"✅ Content generation complete! Total word count: ~{sum(s.word_count for s in generated_sections)} words")

            # Download button
            st.markdown("---")
            st.subheader("💾 Download")

            # Combine all content
            full_article = f"# {article_title}\n\n"
            full_article += f"**Keyword:** {keyword}\n\n"
            full_article += "---\n\n"

            for i, (heading, section) in enumerate(zip(article_structure.headings, generated_sections)):
                level = heading['level']
                text = heading['text']

                if level == 'h2':
                    full_article += f"\n## {text}\n\n"
                elif level == 'h3':
                    full_article += f"\n### {text}\n\n"
                else:
                    full_article += f"\n#### {text}\n\n"

                full_article += f"{section.content}\n\n"

            st.download_button(
                label="📥 Download Article (Markdown)",
                data=full_article,
                file_name=f"article_{keyword.replace(' ', '_')}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.md",
                mime="text/markdown"
            )

        except Exception as e:
            status_container.error(f"❌ Error: {str(e)}")
            st.exception(e)

    # Run async function
    asyncio.run(generate_content())


# Footer
st.markdown("---")
st.markdown("""
### 🔧 How it works

1. **SERP Research:** Fetches top Google results for your keyword
2. **Content Scraping:** Extracts content from competitor websites (parallel)
3. **Intent Analysis:** GPT-4 analyzes user search intent
4. **Title Generation:** Creates SEO-optimized title
5. **Structure Generation:** Builds article outline with headings
6. **Content Generation:** Generates all section content **in parallel** (fastest!)
7. **Streaming Output:** Real-time updates as content is generated

### 🚀 Performance

- **Parallel Scraping:** All URLs scraped simultaneously
- **Parallel Content Generation:** All sections written at once
- **Stream Mode:** Real-time UI updates
- **Result:** 5-10x faster than sequential generation

### 📚 Entity Relation Map

```
N1:Keyword $H→ N2:SerpQuery $H→ N3:TopResults
N3:TopResults $H→ N2:WebScraper $H→ N3:CompetitorContent
N3:CompetitorContent $H→ N2:IntentAnalyzer $H→ N3:UserIntent
N3:UserIntent $H→ N2:TitleGenerator $H→ N3:ArticleTitle
N3:ArticleTitle $H→ N2:StructureGenerator $H→ N3:Headings
N3:Headings $H→ N2:ContentGenerator $H→ N3:ArticleContent (PARALLEL)
```
""")
