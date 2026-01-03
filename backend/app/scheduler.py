import os
import logging
from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.interval import IntervalTrigger

from app.database import SessionLocal
from app.models import AssortedLinksPost, Link
from app import rss_parser

logger = logging.getLogger(__name__)

# Global scheduler instance
scheduler = BackgroundScheduler()

# Check environment variable to enable/disable scheduler
SCHEDULER_ENABLED = os.environ.get("ENABLE_RSS_SCHEDULER", "false").lower() == "true"
SCHEDULER_INTERVAL_HOURS = int(os.environ.get("RSS_UPDATE_INTERVAL_HOURS", "1"))


def run_rss_update():
    """Background job to update from RSS feed."""
    logger.info("Scheduler: Starting RSS update job")

    db = SessionLocal()
    try:
        # Get existing post URLs
        existing_urls = set(
            url for (url,) in db.query(AssortedLinksPost.post_url).all()
        )

        # Fetch new posts from RSS
        new_posts = rss_parser.get_new_posts_from_rss(existing_urls)

        posts_added = 0
        total_links = 0

        for post_data in new_posts:
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
        logger.info(f"Scheduler: RSS update complete - {posts_added} posts, {total_links} links added")

    except Exception as e:
        logger.error(f"Scheduler: RSS update failed - {e}")
        db.rollback()
    finally:
        db.close()


def start_scheduler():
    """Start the background scheduler if enabled."""
    if not SCHEDULER_ENABLED:
        logger.info("Scheduler: Disabled (set ENABLE_RSS_SCHEDULER=true to enable)")
        return

    if scheduler.running:
        logger.warning("Scheduler: Already running")
        return

    scheduler.add_job(
        run_rss_update,
        trigger=IntervalTrigger(hours=SCHEDULER_INTERVAL_HOURS),
        id="rss_update",
        name="RSS Feed Update",
        replace_existing=True
    )

    scheduler.start()
    logger.info(f"Scheduler: Started (interval: {SCHEDULER_INTERVAL_HOURS}h)")


def stop_scheduler():
    """Stop the background scheduler."""
    if scheduler.running:
        scheduler.shutdown(wait=False)
        logger.info("Scheduler: Stopped")
