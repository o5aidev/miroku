"""
Content Generator Agent
=======================

GPT-4 powered content generation for SEO blog articles.
Supports parallel async generation with streaming output.
"""

import asyncio
from typing import List, Dict, Optional, Any
from dataclasses import dataclass
import sys
import os

# Add parent directory to path for imports
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from core.stream_processor import StreamProcessor, StreamChunk


@dataclass
class UserIntent:
    """Analyzed user search intent"""
    primary_intent: str  # informational, transactional, navigational
    keywords: List[str]
    questions: List[str]
    topics: List[str]
    sentiment: str


@dataclass
class ArticleStructure:
    """Article outline structure"""
    title: str
    headings: List[Dict[str, str]]  # [{"level": "h2", "text": "Introduction"}, ...]
    estimated_word_count: int
    target_keywords: List[str]


@dataclass
class GeneratedContent:
    """Generated content for a section"""
    heading: str
    content: str
    word_count: int
    keywords_used: List[str]


class ContentGeneratorAgent:
    """
    GPT-4 powered content generator for SEO blog articles.

    Workflow:
    1. Analyze competitor content → User Intent
    2. Generate article title
    3. Generate article structure (headings)
    4. Generate content for each heading (PARALLEL)
    """

    def __init__(
        self,
        api_key: str,
        model: str = "gpt-4",
        temperature: float = 0.7
    ):
        """
        Initialize Content Generator Agent.

        Args:
            api_key: OpenAI API key
            model: Model identifier (gpt-4, gpt-4-turbo, etc.)
            temperature: Sampling temperature
        """
        self.api_key = api_key
        self.model = model
        self.temperature = temperature
        self.stream_processor: Optional[StreamProcessor] = None

    async def __aenter__(self):
        """Initialize stream processor"""
        self.stream_processor = StreamProcessor(self.api_key)
        await self.stream_processor.__aenter__()
        return self

    async def __aexit__(self, exc_type, exc_val, exc_tb):
        """Close stream processor"""
        if self.stream_processor:
            await self.stream_processor.__aexit__(exc_type, exc_val, exc_tb)

    async def analyze_intent(
        self,
        keyword: str,
        competitor_contents: List[str],
        on_chunk: Optional[callable] = None
    ) -> UserIntent:
        """
        Analyze user search intent from competitor content.

        Args:
            keyword: Target keyword
            competitor_contents: List of competitor article texts
            on_chunk: Optional streaming callback

        Returns:
            UserIntent analysis
        """
        # Combine competitor content (truncate if too long)
        combined_content = "\n\n---\n\n".join(
            content[:2000] for content in competitor_contents[:5]
        )

        system_prompt = """You are an SEO expert analyzing user search intent.
Analyze the competitor content and determine:
1. Primary intent (informational/transactional/navigational)
2. Key keywords and phrases
3. Common questions users are asking
4. Main topics covered
5. Overall sentiment

Return your analysis in JSON format:
{
  "primary_intent": "informational",
  "keywords": ["keyword1", "keyword2"],
  "questions": ["question1", "question2"],
  "topics": ["topic1", "topic2"],
  "sentiment": "positive/neutral/negative"
}"""

        prompt = f"""Keyword: {keyword}

Competitor Content:
{combined_content}

Analyze the user intent for this keyword based on the competitor content."""

        full_response = ""
        async for chunk in self.stream_processor.stream_completion(
            prompt=prompt,
            model=self.model,
            system_prompt=system_prompt,
            temperature=0.3,  # Lower temperature for analysis
            on_chunk=on_chunk
        ):
            if not chunk.is_final:
                full_response += chunk.content

        # Parse JSON response
        import json
        try:
            # Extract JSON from response
            json_start = full_response.find('{')
            json_end = full_response.rfind('}') + 1
            json_str = full_response[json_start:json_end]
            data = json.loads(json_str)

            return UserIntent(
                primary_intent=data.get("primary_intent", "informational"),
                keywords=data.get("keywords", []),
                questions=data.get("questions", []),
                topics=data.get("topics", []),
                sentiment=data.get("sentiment", "neutral")
            )
        except json.JSONDecodeError:
            # Fallback if JSON parsing fails
            return UserIntent(
                primary_intent="informational",
                keywords=[keyword],
                questions=[],
                topics=[],
                sentiment="neutral"
            )

    async def generate_title(
        self,
        keyword: str,
        user_intent: UserIntent,
        on_chunk: Optional[callable] = None
    ) -> str:
        """
        Generate SEO-optimized article title.

        Args:
            keyword: Target keyword
            user_intent: Analyzed user intent
            on_chunk: Optional streaming callback

        Returns:
            Generated title
        """
        system_prompt = """You are an SEO expert and copywriter.
Generate a compelling, SEO-optimized article title that:
1. Includes the target keyword naturally
2. Matches the user's search intent
3. Is 50-60 characters long
4. Creates curiosity and value
5. Uses power words when appropriate

Return ONLY the title, nothing else."""

        prompt = f"""Keyword: {keyword}
User Intent: {user_intent.primary_intent}
Key Topics: {', '.join(user_intent.topics)}

Generate the perfect title for this article."""

        title = ""
        async for chunk in self.stream_processor.stream_completion(
            prompt=prompt,
            model=self.model,
            system_prompt=system_prompt,
            temperature=self.temperature,
            on_chunk=on_chunk
        ):
            if not chunk.is_final:
                title += chunk.content

        return title.strip().strip('"').strip("'")

    async def generate_structure(
        self,
        title: str,
        keyword: str,
        user_intent: UserIntent,
        target_word_count: int = 2000,
        on_chunk: Optional[callable] = None
    ) -> ArticleStructure:
        """
        Generate article structure (outline with headings).

        Args:
            title: Article title
            keyword: Target keyword
            user_intent: Analyzed user intent
            target_word_count: Target article length
            on_chunk: Optional streaming callback

        Returns:
            ArticleStructure with headings
        """
        system_prompt = """You are an SEO content strategist.
Generate a comprehensive article outline with headings (H2, H3) that:
1. Follows logical flow
2. Covers all important topics
3. Includes the target keyword naturally
4. Addresses user questions
5. Provides value at each section

Return your outline in JSON format:
{
  "headings": [
    {"level": "h2", "text": "Introduction"},
    {"level": "h2", "text": "Main Topic 1"},
    {"level": "h3", "text": "Subtopic 1.1"},
    {"level": "h2", "text": "Conclusion"}
  ]
}"""

        prompt = f"""Title: {title}
Keyword: {keyword}
Target Word Count: {target_word_count}
User Intent: {user_intent.primary_intent}
Key Topics: {', '.join(user_intent.topics)}
User Questions: {', '.join(user_intent.questions)}

Generate a detailed article outline."""

        full_response = ""
        async for chunk in self.stream_processor.stream_completion(
            prompt=prompt,
            model=self.model,
            system_prompt=system_prompt,
            temperature=0.5,
            max_tokens=1500,
            on_chunk=on_chunk
        ):
            if not chunk.is_final:
                full_response += chunk.content

        # Parse JSON response
        import json
        try:
            json_start = full_response.find('{')
            json_end = full_response.rfind('}') + 1
            json_str = full_response[json_start:json_end]
            data = json.loads(json_str)

            return ArticleStructure(
                title=title,
                headings=data.get("headings", []),
                estimated_word_count=target_word_count,
                target_keywords=[keyword] + user_intent.keywords[:5]
            )
        except json.JSONDecodeError:
            # Fallback structure
            return ArticleStructure(
                title=title,
                headings=[
                    {"level": "h2", "text": "Introduction"},
                    {"level": "h2", "text": f"Understanding {keyword}"},
                    {"level": "h2", "text": "Conclusion"}
                ],
                estimated_word_count=target_word_count,
                target_keywords=[keyword]
            )

    async def generate_section_content(
        self,
        heading: Dict[str, str],
        title: str,
        keyword: str,
        context: str,
        word_count: int = 300,
        on_chunk: Optional[callable] = None
    ) -> GeneratedContent:
        """
        Generate content for a single section/heading.

        Args:
            heading: Heading dict with "level" and "text"
            title: Article title
            keyword: Target keyword
            context: Context from previous sections
            word_count: Target word count for this section
            on_chunk: Optional streaming callback

        Returns:
            GeneratedContent for this section
        """
        system_prompt = f"""You are an expert content writer.
Write a comprehensive, SEO-optimized section for a blog article.

Requirements:
1. Write approximately {word_count} words
2. Use the target keyword naturally 1-2 times
3. Provide value and actionable insights
4. Use clear, engaging language
5. Include examples when relevant
6. Write in a conversational yet professional tone

Return ONLY the content for this section, without the heading itself."""

        prompt = f"""Article Title: {title}
Section Heading: {heading['text']}
Target Keyword: {keyword}
Target Word Count: {word_count}

Context from previous sections:
{context[:500]}

Write the content for this section."""

        content = ""
        async for chunk in self.stream_processor.stream_completion(
            prompt=prompt,
            model=self.model,
            system_prompt=system_prompt,
            temperature=self.temperature,
            max_tokens=word_count * 2,  # Buffer for token count
            on_chunk=on_chunk
        ):
            if not chunk.is_final:
                content += chunk.content

        return GeneratedContent(
            heading=heading['text'],
            content=content.strip(),
            word_count=len(content.split()),
            keywords_used=[keyword] if keyword.lower() in content.lower() else []
        )

    async def generate_all_sections_parallel(
        self,
        structure: ArticleStructure,
        keyword: str,
        on_chunk: Optional[callable] = None
    ) -> List[GeneratedContent]:
        """
        Generate content for all sections in PARALLEL.

        This is the key optimization - all heading content is generated simultaneously.

        Args:
            structure: Article structure with headings
            keyword: Target keyword
            on_chunk: Optional callback with (section_index, chunk)

        Returns:
            List of GeneratedContent in same order as headings
        """
        # Calculate word count per section
        total_headings = len(structure.headings)
        words_per_section = structure.estimated_word_count // total_headings

        # Create tasks for all sections
        tasks = []
        for i, heading in enumerate(structure.headings):
            # Create section-specific callback
            section_callback = None
            if on_chunk:
                section_callback = lambda chunk, idx=i: on_chunk(idx, chunk)

            task = self.generate_section_content(
                heading=heading,
                title=structure.title,
                keyword=keyword,
                context="",  # Could be enhanced with previous sections
                word_count=words_per_section,
                on_chunk=section_callback
            )
            tasks.append(task)

        # Execute ALL sections in parallel
        print(f"  🚀 Generating {total_headings} sections in parallel...")
        results = await asyncio.gather(*tasks, return_exceptions=True)

        # Handle any errors
        processed_results = []
        for i, result in enumerate(results):
            if isinstance(result, Exception):
                print(f"  ⚠️  Section {i+1} failed: {result}")
                processed_results.append(GeneratedContent(
                    heading=structure.headings[i]['text'],
                    content=f"[Content generation failed: {result}]",
                    word_count=0,
                    keywords_used=[]
                ))
            else:
                processed_results.append(result)

        return processed_results


if __name__ == "__main__":
    # Demo
    print("Content Generator Agent ready. Use in async context.")
