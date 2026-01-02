from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import desc
from typing import List, Optional

from app.database import get_db
from app.models import AssortedLinksPost, Link
from app.schemas import AssortedLinksPostResponse, LinkResponse, ScrapeResponse
from app import scraper

router = APIRouter(prefix="/api/links", tags=["links"])


@router.get("", response_model=List[AssortedLinksPostResponse])
async def get_links(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    search: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """Get all assorted links posts with their links."""
    query = db.query(AssortedLinksPost).order_by(desc(AssortedLinksPost.post_date))

    if search:
        # Search in link titles
        search_term = f"%{search}%"
        post_ids = (
            db.query(Link.post_id)
            .filter(Link.title.ilike(search_term))
            .distinct()
            .subquery()
        )
        query = query.filter(AssortedLinksPost.id.in_(post_ids))

    posts = query.offset(skip).limit(limit).all()

    result = []
    for post in posts:
        links = post.links
        if search:
            # Filter links by search term
            search_lower = search.lower()
            links = [l for l in links if search_lower in l.title.lower()]

        result.append(AssortedLinksPostResponse(
            id=post.id,
            date=post.post_date.isoformat(),
            links=[LinkResponse(title=l.title, url=l.url) for l in links]
        ))

    return result


@router.get("/{post_id}", response_model=AssortedLinksPostResponse)
async def get_post(post_id: int, db: Session = Depends(get_db)):
    """Get a single post by ID."""
    post = db.query(AssortedLinksPost).filter(AssortedLinksPost.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")

    return AssortedLinksPostResponse(
        id=post.id,
        date=post.post_date.isoformat(),
        links=[LinkResponse(title=l.title, url=l.url) for l in post.links]
    )


@router.post("/scrape", response_model=ScrapeResponse)
async def scrape_links(
    pages: int = Query(3, ge=1, le=20),
    db: Session = Depends(get_db)
):
    """Scrape Marginal Revolution for Assorted Links posts."""
    posts_data = await scraper.scrape_all_assorted_links(max_pages=pages)

    posts_added = 0
    total_links = 0

    for post_data in posts_data:
        # Check if post already exists
        existing = db.query(AssortedLinksPost).filter(
            AssortedLinksPost.post_url == post_data["url"]
        ).first()

        if existing:
            continue

        if not post_data.get("date"):
            continue

        # Create new post
        post = AssortedLinksPost(
            post_url=post_data["url"],
            post_date=post_data["date"].date(),
            title=post_data["title"]
        )
        db.add(post)
        db.flush()

        # Add links
        for link_data in post_data.get("links", []):
            link = Link(
                post_id=post.id,
                title=link_data["title"],
                url=link_data["url"],
                link_number=link_data.get("number")
            )
            db.add(link)
            total_links += 1

        posts_added += 1

    db.commit()

    return ScrapeResponse(
        message=f"Scraping complete",
        posts_scraped=posts_added,
        total_links=total_links
    )


@router.get("/stats/summary")
async def get_stats(db: Session = Depends(get_db)):
    """Get summary statistics."""
    total_posts = db.query(AssortedLinksPost).count()
    total_links = db.query(Link).count()

    return {
        "total_posts": total_posts,
        "total_links": total_links
    }
