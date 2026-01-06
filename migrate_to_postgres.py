#!/usr/bin/env python3
"""
Migrate data from local SQLite database to Railway PostgreSQL.
"""
import sqlite3
import requests
import json

SQLITE_DB = "/Users/iankahn/Desktop/mr_project/mr-links/backend/mr_links.db"
API_URL = "https://cozy-victory-production.up.railway.app"

def export_from_sqlite():
    """Export all posts and links from SQLite."""
    conn = sqlite3.connect(SQLITE_DB)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()

    print("Exporting posts from SQLite...")
    cursor.execute("""
        SELECT id, post_url, post_date, title
        FROM assorted_links_posts
        ORDER BY post_date DESC
    """)
    posts = [dict(row) for row in cursor.fetchall()]

    print(f"Found {len(posts)} posts")

    # Get links for each post
    for i, post in enumerate(posts, 1):
        if i % 100 == 0:
            print(f"  Processing post {i}/{len(posts)}...")

        cursor.execute("""
            SELECT title, url, link_number
            FROM links
            WHERE post_id = ?
            ORDER BY link_number
        """, (post['id'],))
        post['links'] = [dict(row) for row in cursor.fetchall()]

    conn.close()

    total_links = sum(len(p['links']) for p in posts)
    print(f"Exported {len(posts)} posts with {total_links} total links")

    return posts

def upload_to_api(posts, batch_size=50):
    """Upload posts to PostgreSQL via API in batches."""
    print(f"\nUploading to Railway PostgreSQL in batches of {batch_size}...")

    total_posts_imported = 0
    total_links_imported = 0
    total_skipped = 0

    # Upload in batches to avoid timeout
    for i in range(0, len(posts), batch_size):
        batch = posts[i:i + batch_size]
        batch_num = (i // batch_size) + 1
        total_batches = (len(posts) + batch_size - 1) // batch_size

        print(f"\nBatch {batch_num}/{total_batches} ({len(batch)} posts)...")

        try:
            response = requests.post(
                f"{API_URL}/api/links/import",
                json=batch,
                timeout=120
            )

            if response.status_code == 200:
                result = response.json()
                total_posts_imported += result['posts_imported']
                total_links_imported += result['links_imported']
                total_skipped += result['skipped']

                print(f"  ✓ Imported: {result['posts_imported']} posts, {result['links_imported']} links")
                if result['skipped'] > 0:
                    print(f"  ⊘ Skipped: {result['skipped']} (already exist)")
            else:
                print(f"  ✗ Error: {response.status_code} - {response.text}")

        except Exception as e:
            print(f"  ✗ Error uploading batch: {e}")

    print(f"\n{'='*60}")
    print(f"IMPORT COMPLETE!")
    print(f"  Posts imported: {total_posts_imported}")
    print(f"  Links imported: {total_links_imported}")
    print(f"  Skipped (duplicates): {total_skipped}")
    print(f"{'='*60}")

if __name__ == "__main__":
    print("="*60)
    print("SQLite → PostgreSQL Migration")
    print("="*60)

    posts = export_from_sqlite()
    upload_to_api(posts)

    print("\n✅ Migration complete!")
    print(f"Visit your site: https://mr-links-production.up.railway.app")
