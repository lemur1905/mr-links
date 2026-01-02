from pydantic import BaseModel
from datetime import date
from typing import List


class LinkBase(BaseModel):
    title: str
    url: str


class LinkResponse(LinkBase):
    """Response schema for individual links."""
    pass


class AssortedLinksPostResponse(BaseModel):
    """Response schema matching the frontend's expected format."""
    id: int
    date: str
    links: List[LinkResponse]

    class Config:
        from_attributes = True


class ScrapeResponse(BaseModel):
    """Response for scraping operations."""
    message: str
    posts_scraped: int
    total_links: int
