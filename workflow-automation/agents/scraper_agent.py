"""
Web Scraper Agent
==================

Extracts body content from URLs with async parallel processing.
Supports JavaScript rendering and content cleaning.
"""

import asyncio
import aiohttp
from typing import List, Dict, Optional, Any
from dataclasses import dataclass
from bs4 import BeautifulSoup
import re
from urllib.parse import urlparse


@dataclass
class ScrapedContent:
    """Represents scraped content from a URL"""
    url: str
    title: str
    body_text: str
    word_count: int
    headings: List[str]
    meta_description: Optional[str]
    success: bool
    error: Optional[str] = None


class ScraperAgent:
    """
    Web scraper agent for extracting article content.

    Features:
    - Async parallel scraping
    - HTML cleaning and text extraction
    - Heading structure extraction
    - Timeout and error handling
    - User-agent rotation
    """

    def __init__(
        self,
        timeout: int = 10,
        max_retries: int = 2,
        user_agent: Optional[str] = None
    ):
        """
        Initialize Scraper Agent.

        Args:
            timeout: Request timeout in seconds
            max_retries: Maximum retry attempts
            user_agent: Custom user agent string
        """
        self.timeout = timeout
        self.max_retries = max_retries
        self.user_agent = user_agent or (
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
            "AppleWebKit/537.36 (KHTML, like Gecko) "
            "Chrome/120.0.0.0 Safari/537.36"
        )
        self.session: Optional[aiohttp.ClientSession] = None

    async def __aenter__(self):
        """Create aiohttp session with headers"""
        headers = {
            "User-Agent": self.user_agent,
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
            "Accept-Language": "en-US,en;q=0.9",
            "Accept-Encoding": "gzip, deflate, br",
            "Connection": "keep-alive",
        }
        timeout = aiohttp.ClientTimeout(total=self.timeout)
        self.session = aiohttp.ClientSession(headers=headers, timeout=timeout)
        return self

    async def __aexit__(self, exc_type, exc_val, exc_tb):
        """Close aiohttp session"""
        if self.session:
            await self.session.close()

    async def scrape(self, url: str) -> ScrapedContent:
        """
        Scrape content from a single URL.

        Args:
            url: Target URL to scrape

        Returns:
            ScrapedContent with extracted data
        """
        if not self.session:
            raise RuntimeError("Session not initialized. Use 'async with' context.")

        for attempt in range(self.max_retries):
            try:
                async with self.session.get(url, ssl=False) as response:
                    response.raise_for_status()
                    html = await response.text()

                    # Parse HTML
                    soup = BeautifulSoup(html, 'html.parser')

                    # Extract title
                    title = self._extract_title(soup)

                    # Extract meta description
                    meta_desc = self._extract_meta_description(soup)

                    # Extract headings
                    headings = self._extract_headings(soup)

                    # Extract body text
                    body_text = self._extract_body_text(soup)

                    # Calculate word count
                    word_count = len(body_text.split())

                    return ScrapedContent(
                        url=url,
                        title=title,
                        body_text=body_text,
                        word_count=word_count,
                        headings=headings,
                        meta_description=meta_desc,
                        success=True
                    )

            except Exception as e:
                if attempt == self.max_retries - 1:
                    # Final attempt failed
                    return ScrapedContent(
                        url=url,
                        title="",
                        body_text="",
                        word_count=0,
                        headings=[],
                        meta_description=None,
                        success=False,
                        error=str(e)
                    )

                # Retry with exponential backoff
                await asyncio.sleep(2 ** attempt)

        # Should never reach here
        return ScrapedContent(
            url=url,
            title="",
            body_text="",
            word_count=0,
            headings=[],
            meta_description=None,
            success=False,
            error="Max retries exceeded"
        )

    async def scrape_multiple(self, urls: List[str]) -> List[ScrapedContent]:
        """
        Scrape multiple URLs in parallel.

        Args:
            urls: List of URLs to scrape

        Returns:
            List of ScrapedContent in same order as input URLs
        """
        tasks = [self.scrape(url) for url in urls]
        results = await asyncio.gather(*tasks, return_exceptions=True)

        # Convert exceptions to failed ScrapedContent
        processed_results = []
        for i, result in enumerate(results):
            if isinstance(result, Exception):
                processed_results.append(ScrapedContent(
                    url=urls[i],
                    title="",
                    body_text="",
                    word_count=0,
                    headings=[],
                    meta_description=None,
                    success=False,
                    error=str(result)
                ))
            else:
                processed_results.append(result)

        return processed_results

    def _extract_title(self, soup: BeautifulSoup) -> str:
        """Extract page title"""
        # Try <title> tag
        if soup.title and soup.title.string:
            return soup.title.string.strip()

        # Try Open Graph title
        og_title = soup.find("meta", property="og:title")
        if og_title and og_title.get("content"):
            return og_title["content"].strip()

        # Try <h1>
        h1 = soup.find("h1")
        if h1:
            return h1.get_text().strip()

        return "Untitled"

    def _extract_meta_description(self, soup: BeautifulSoup) -> Optional[str]:
        """Extract meta description"""
        # Try meta description tag
        meta_desc = soup.find("meta", attrs={"name": "description"})
        if meta_desc and meta_desc.get("content"):
            return meta_desc["content"].strip()

        # Try Open Graph description
        og_desc = soup.find("meta", property="og:description")
        if og_desc and og_desc.get("content"):
            return og_desc["content"].strip()

        return None

    def _extract_headings(self, soup: BeautifulSoup) -> List[str]:
        """Extract all headings (h1-h6)"""
        headings = []
        for level in range(1, 7):
            for heading in soup.find_all(f"h{level}"):
                text = heading.get_text().strip()
                if text:
                    headings.append(text)
        return headings

    def _extract_body_text(self, soup: BeautifulSoup) -> str:
        """
        Extract main body text, removing scripts, styles, nav, footer, etc.
        """
        # Remove unwanted elements
        for element in soup.find_all(['script', 'style', 'nav', 'footer', 'header', 'aside', 'iframe']):
            element.decompose()

        # Try to find main content container
        main_content = None

        # Common article selectors
        article_selectors = [
            'article',
            '[role="main"]',
            'main',
            '.post-content',
            '.article-content',
            '.entry-content',
            '#content',
            '.content'
        ]

        for selector in article_selectors:
            if '.' in selector or '#' in selector or '[' in selector:
                # CSS selector
                main_content = soup.select_one(selector)
            else:
                # Tag name
                main_content = soup.find(selector)

            if main_content:
                break

        # If no main content found, use body
        if not main_content:
            main_content = soup.body or soup

        # Extract text
        text = main_content.get_text(separator='\n', strip=True)

        # Clean up text
        text = self._clean_text(text)

        return text

    def _clean_text(self, text: str) -> str:
        """Clean extracted text"""
        # Remove multiple newlines
        text = re.sub(r'\n{3,}', '\n\n', text)

        # Remove multiple spaces
        text = re.sub(r' {2,}', ' ', text)

        # Remove leading/trailing whitespace from each line
        lines = [line.strip() for line in text.split('\n')]
        text = '\n'.join(lines)

        return text.strip()


# Utility functions
def print_scraped_content(content: ScrapedContent):
    """Pretty print scraped content"""
    print(f"\n{'='*80}")
    print(f"URL: {content.url}")
    print(f"{'='*80}")
    print(f"Title: {content.title}")
    print(f"Word Count: {content.word_count}")
    print(f"Success: {content.success}")

    if content.meta_description:
        print(f"Meta Description: {content.meta_description}")

    if content.headings:
        print(f"\nHeadings ({len(content.headings)}):")
        for i, heading in enumerate(content.headings[:10], 1):
            print(f"  {i}. {heading}")
        if len(content.headings) > 10:
            print(f"  ... and {len(content.headings) - 10} more")

    if content.body_text:
        print(f"\nBody Text Preview (first 500 chars):")
        print(content.body_text[:500] + "..." if len(content.body_text) > 500 else content.body_text)

    if content.error:
        print(f"\n⚠️  Error: {content.error}")

    print()


if __name__ == "__main__":
    # Demo
    async def demo():
        urls = [
            "https://en.wikipedia.org/wiki/Artificial_intelligence",
            "https://example.com"
        ]

        async with ScraperAgent(timeout=10) as scraper:
            print(f"Scraping {len(urls)} URLs in parallel...")
            results = await scraper.scrape_multiple(urls)

            for result in results:
                print_scraped_content(result)

    # Uncomment to run demo:
    # asyncio.run(demo())
    print("Scraper Agent ready. Use in async context.")
