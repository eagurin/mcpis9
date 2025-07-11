"""Main entry point for MCPIS9 application"""

from .server import app

# FastAPI application instance
# This can be used by ASGI servers like uvicorn
__all__ = ["app"]


def main():
    """Main entry point for development server"""
    import uvicorn
    from .core.config import settings
    
    uvicorn.run(
        "app.main:app",
        host=settings.API_HOST,
        port=settings.API_PORT,
        reload=settings.API_DEBUG,
        log_level=settings.LOG_LEVEL.lower()
    )


if __name__ == "__main__":
    main()
