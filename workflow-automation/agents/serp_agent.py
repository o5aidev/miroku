"""
SERP Agent - Google Search Results Fetcher
===========================================

Fetches top search results from Google using SERP API.
Supports async operation and result caching.
"""

import asyncio
import aiohttp
from typing import List, Dict, Optional, Any
from dataclasses import dataclass
import json
from urllib.parse import urlencode


@dataclass
class SearchResult:
    """Represents a single search result"""
    position: int
    title: str
    url: str
    snippet: str
    domain: str


@dataclass
class SerpResponse:
    """SERP API response wrapper"""
    keyword: str
    total_results: int
    results: List[SearchResult]
    raw_response: Dict[str, Any]


class SerpAgent:
    """
    SERP Agent for fetching Google search results.

    Supports multiple SERP API providers:
    - SerpAPI (serpapi.com)
    - ScraperAPI (scraperapi.com)
    - Custom Google Custom Search API

    Usage:
        async with SerpAgent(api_key) as agent:
            results = await agent.search("AI automation")
    """

    def __init__(
        self,
        api_key: str,
        provider: str = "serpapi",
        results_limit: int = 5
    ):
        """
        Initialize SERP Agent.

        Args:
            api_key: API key for SERP provider
            provider: SERP API provider ('serpapi', 'scraperapi', 'google')
            results_limit: Maximum number of results to fetch (default: 5)
        """
        self.api_key = api_key
        self.provider = provider
        self.results_limit = results_limit
        self.session: Optional[aiohttp.ClientSession] = None

    async def __aenter__(self):
        """Create aiohttp session"""
        self.session = aiohttp.ClientSession()
        return self

    async def __aexit__(self, exc_type, exc_val, exc_tb):
        """Close aiohttp session"""
        if self.session:
            await self.session.close()

    async def search(
        self,
        keyword: str,
        location: str = "United States",
        language: str = "en"
    ) -> SerpResponse:
        """
        Perform Google search and fetch top results.

        Args:
            keyword: Search keyword/query
            location: Geographic location for search
            language: Language code

        Returns:
            SerpResponse with search results
        """
        if self.provider == "serpapi":
            return await self._search_serpapi(keyword, location, language)
        elif self.provider == "scraperapi":
            return await self._search_scraperapi(keyword, location, language)
        elif self.provider == "google":
            return await self._search_google_custom(keyword, location, language)
        else:
            raise ValueError(f"Unsupported SERP provider: {self.provider}")

    async def _search_serpapi(
        self,
        keyword: str,
        location: str,
        language: str
    ) -> SerpResponse:
        """Fetch results from SerpAPI"""
        if not self.session:
            raise RuntimeError("Session not initialized. Use 'async with' context.")

        params = {
            "q": keyword,
            "location": location,
            "hl": language,
            "api_key": self.api_key,
            "num": self.results_limit
        }

        url = f"https://serpapi.com/search?{urlencode(params)}"

        async with self.session.get(url) as response:
            response.raise_for_status()
            data = await response.json()

            # Parse organic results
            organic_results = data.get("organic_results", [])
            results = []

            for i, result in enumerate(organic_results[:self.results_limit], 1):
                results.append(SearchResult(
                    position=i,
                    title=result.get("title", ""),
                    url=result.get("link", ""),
                    snippet=result.get("snippet", ""),
                    domain=result.get("displayed_link", "")
                ))

            return SerpResponse(
                keyword=keyword,
                total_results=data.get("search_information", {}).get("total_results", 0),
                results=results,
                raw_response=data
            )

    async def _search_scraperapi(
        self,
        keyword: str,
        location: str,
        language: str
    ) -> SerpResponse:
        """Fetch results from ScraperAPI"""
        if not self.session:
            raise RuntimeError("Session not initialized. Use 'async with' context.")

        # ScraperAPI Google Search endpoint
        params = {
            "api_key": self.api_key,
            "q": keyword,
            "location": location,
            "gl": language,
            "num": self.results_limit
        }

        url = f"https://api.scraperapi.com/structured/google/search?{urlencode(params)}"

        async with self.session.get(url) as response:
            response.raise_for_status()
            data = await response.json()

            # Parse results
            organic_results = data.get("organic_results", [])
            results = []

            for i, result in enumerate(organic_results[:self.results_limit], 1):
                results.append(SearchResult(
                    position=i,
                    title=result.get("title", ""),
                    url=result.get("link", ""),
                    snippet=result.get("snippet", ""),
                    domain=result.get("domain", "")
                ))

            return SerpResponse(
                keyword=keyword,
                total_results=len(organic_results),
                results=results,
                raw_response=data
            )

    async def _search_google_custom(
        self,
        keyword: str,
        location: str,
        language: str
    ) -> SerpResponse:
        """Fetch results from Google Custom Search API"""
        if not self.session:
            raise RuntimeError("Session not initialized. Use 'async with' context.")

        # Google Custom Search requires both API key and Search Engine ID
        # Format: "api_key:search_engine_id"
        api_key, cx = self.api_key.split(":", 1)

        params = {
            "key": api_key,
            "cx": cx,
            "q": keyword,
            "gl": language,
            "num": self.results_limit
        }

        url = f"https://www.googleapis.com/customsearch/v1?{urlencode(params)}"

        async with self.session.get(url) as response:
            response.raise_for_status()
            data = await response.json()

            # Parse results
            items = data.get("items", [])
            results = []

            for i, item in enumerate(items[:self.results_limit], 1):
                results.append(SearchResult(
                    position=i,
                    title=item.get("title", ""),
                    url=item.get("link", ""),
                    snippet=item.get("snippet", ""),
                    domain=item.get("displayLink", "")
                ))

            return SerpResponse(
                keyword=keyword,
                total_results=int(data.get("searchInformation", {}).get("totalResults", 0)),
                results=results,
                raw_response=data
            )

    async def search_multiple(
        self,
        keywords: List[str],
        location: str = "United States",
        language: str = "en"
    ) -> Dict[str, SerpResponse]:
        """
        Perform multiple searches in parallel.

        Args:
            keywords: List of keywords to search
            location: Geographic location
            language: Language code

        Returns:
            Dictionary mapping keywords to SerpResponse
        """
        tasks = [
            self.search(keyword, location, language)
            for keyword in keywords
        ]

        results = await asyncio.gather(*tasks, return_exceptions=True)

        return {
            keyword: result if not isinstance(result, Exception) else None
            for keyword, result in zip(keywords, results)
        }


# Utility functions
def print_serp_results(response: SerpResponse):
    """Pretty print SERP results"""
    print(f"\n{'='*80}")
    print(f"Keyword: {response.keyword}")
    print(f"Total Results: {response.total_results:,}")
    print(f"{'='*80}\n")

    for result in response.results:
        print(f"{result.position}. {result.title}")
        print(f"   URL: {result.url}")
        print(f"   Snippet: {result.snippet}")
        print(f"   Domain: {result.domain}")
        print()


if __name__ == "__main__":
    # Demo
    async def demo():
        import os

        api_key = os.getenv("SERPAPI_KEY", "test_key")

        async with SerpAgent(api_key, provider="serpapi", results_limit=5) as agent:
            print("Fetching top 5 Google results for 'AI automation'...")
            response = await agent.search("AI automation")
            print_serp_results(response)

    # Uncomment to run demo:
    # asyncio.run(demo())
    print("SERP Agent ready. Use in async context.")
