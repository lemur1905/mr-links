from sqlalchemy import Column, Integer, String, Date, ForeignKey, DateTime
from sqlalchemy.orm import relationship, declarative_base
from datetime import datetime

Base = declarative_base()


class AssortedLinksPost(Base):
    """Represents a single 'Assorted links' blog post from Marginal Revolution."""
    __tablename__ = "assorted_links_posts"

    id = Column(Integer, primary_key=True, index=True)
    post_url = Column(String, unique=True, nullable=False)
    post_date = Column(Date, nullable=False, index=True)
    title = Column(String, nullable=False)
    scraped_at = Column(DateTime, default=datetime.utcnow)

    links = relationship("Link", back_populates="post", cascade="all, delete-orphan")


class Link(Base):
    """Represents an individual link within an Assorted Links post."""
    __tablename__ = "links"

    id = Column(Integer, primary_key=True, index=True)
    post_id = Column(Integer, ForeignKey("assorted_links_posts.id"), nullable=False)
    title = Column(String, nullable=False)
    url = Column(String, nullable=False)
    link_number = Column(Integer, nullable=True)

    post = relationship("AssortedLinksPost", back_populates="links")
