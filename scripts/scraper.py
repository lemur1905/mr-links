import asyncio
import httpx
from bs4 import BeautifulSoup
from datetime import datetime
from dateutil import parser as date_parser
from typing import List, Dict, Optional
import re
import logging

logger = logging.getLogger(__name__)

BASE_URL = "https://marginalrevolution.com"
SEARCH_URL = f"{BASE_URL}/?s=assorted+links"

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.5",
}


async def fetch_page(url: str) -> Optional[str]:
    """Fetch HTML content from a URL."""
    async with httpx.AsyncClient(timeout=30.0, headers=HEADERS) as client:
        try:
            response = await client.get(url, follow_redirects=True)
            response.raise_for_status()
            return response.text
        except httpx.HTTPError as e:
            logger.error(f"Error fetching {url}: {e}")
            return None


def parse_post_date(date_str: str) -> Optional[datetime]:
    """Parse a date string into a datetime object."""
    try:
        return date_parser.parse(date_str, fuzzy=True)
    except (ValueError, TypeError):
        return None


def extract_links_from_post(html: str) -> List[Dict[str, str]]:
    """Extract numbered links from an Assorted Links post."""
    soup = BeautifulSoup(html, "lxml")
    links = []

    # Find the post content
    content = soup.find("div", class_="entry-content")
    if not content:
        content = soup.find("article")
    if not content:
        return links

    # Look for numbered list items or paragraphs with numbers
    # Assorted links typically have format: "1. Link text here"
    for p in content.find_all(["p", "li"]):
        text = p.get_text(strip=True)

        # Match patterns like "1.", "1)", "1 -" at the start
        match = re.match(r"^(\d+)[.\)\-]\s*(.+)", text)
        if match:
            link_number = int(match.group(1))

            # Find the anchor tag in this element
            anchor = p.find("a")
            if anchor and anchor.get("href"):
                link_url = anchor.get("href")
                link_title = anchor.get_text(strip=True)

                # Skip internal MR links and empty titles
                if link_title and not link_url.startswith(BASE_URL):
                    links.append({
                        "title": link_title,
                        "url": link_url,
                        "number": link_number
                    })

    # If no numbered links found, try to get all external links
    if not links:
        for anchor in content.find_all("a"):
            href = anchor.get("href", "")
            title = anchor.get_text(strip=True)

            if (title and href and
                href.startswith("http") and
                not href.startswith(BASE_URL) and
                "marginalrevolution" not in href):
                links.append({
                    "title": title,
                    "url": href,
                    "number": len(links) + 1
                })

    return links


async def get_assorted_links_posts(page: int = 1) -> List[Dict]:
    """Get Assorted Links posts from the search results page."""
    url = f"{SEARCH_URL}&paged={page}" if page > 1 else SEARCH_URL

    html = await fetch_page(url)
    if not html:
        return []

    soup = BeautifulSoup(html, "lxml")
    posts = []

    # Find article entries
    articles = soup.find_all("article")

    for article in articles:
        # Get the title
        title_elem = article.find(["h2", "h1"], class_=re.compile(r"entry-title"))
        if not title_elem:
            title_elem = article.find("a", rel="bookmark")

        if not title_elem:
            continue

        title = title_elem.get_text(strip=True)

        # Only process "Assorted links" posts
        if "assorted links" not in title.lower():
            continue

        # Get the post URL
        link = title_elem.find("a") if title_elem.name != "a" else title_elem
        if link:
            post_url = link.get("href")
        else:
            continue

        # Get the date
        date_elem = article.find("time")
        if date_elem:
            date_str = date_elem.get("datetime") or date_elem.get_text(strip=True)
            post_date = parse_post_date(date_str)
        else:
            post_date = None

        posts.append({
            "title": title,
            "url": post_url,
            "date": post_date
        })

    return posts


async def scrape_post_links(post_url: str) -> List[Dict[str, str]]:
    """Scrape links from a single post."""
    html = await fetch_page(post_url)
    if not html:
        return []

    return extract_links_from_post(html)


async def scrape_all_assorted_links(max_pages: int = 5, existing_urls: set = None) -> List[Dict]:
    """Scrape multiple pages of Assorted Links posts.

    Args:
        max_pages: Maximum number of search result pages to scrape
        existing_urls: Set of post URLs already in database (to skip scraping)
    """
    if existing_urls is None:
        existing_urls = set()

    all_posts = []
    new_posts_found = 0

    for page in range(1, max_pages + 1):
        posts = await get_assorted_links_posts(page)
        if not posts:
            logger.info(f"No more posts found on page {page}")
            break

        for post in posts:
            # Skip if we've already scraped this URL
            if post["url"] in existing_urls:
                logger.info(f"Skipping existing post: {post['title']}")
                continue

            new_posts_found += 1

            links = await scrape_post_links(post["url"])
            post["links"] = links
            all_posts.append(post)
            logger.info(f"Scraped: {post['title']} - {len(links)} links")
            await asyncio.sleep(0.5)  # Be polite to the server

    logger.info(f"Total new posts scraped: {new_posts_found}")
    return all_posts
