import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import init_db
from app.routers import links
from app.scheduler import start_scheduler, stop_scheduler

app = FastAPI(
    title="MR Links API",
    description="API for scraping and serving Marginal Revolution Assorted Links",
    version="1.0.0"
)

# CORS middleware for React frontend
# Allow localhost for development and production URLs from env
origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

# Add production frontend URL if set
frontend_url = os.getenv("FRONTEND_URL")
if frontend_url:
    origins.append(frontend_url)
    # Also add without trailing slash if present
    origins.append(frontend_url.rstrip('/'))
    # Add http variant in case of redirect
    if frontend_url.startswith("https://"):
        origins.append(frontend_url.replace("https://", "http://", 1))

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(links.router)


@app.on_event("startup")
async def startup():
    """Initialize database and scheduler on startup."""
    print(f"CORS origins configured: {origins}")
    print(f"FRONTEND_URL env var: {os.getenv('FRONTEND_URL')}")
    init_db()
    start_scheduler()


@app.on_event("shutdown")
async def shutdown():
    """Stop scheduler on shutdown."""
    stop_scheduler()


@app.get("/")
async def root():
    """Root endpoint."""
    return {
        "message": "MR Links API",
        "docs": "/docs",
        "endpoints": {
            "links": "/api/links",
            "scrape": "/api/links/scrape",
            "rss_update": "/api/links/rss-update",
            "stats": "/api/links/stats/summary"
        }
    }


@app.get("/health")
async def health():
    """Health check endpoint."""
    return {"status": "healthy"}
