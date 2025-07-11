"""MCP Server for MCPIS9 with FastAPI integration"""

import asyncio
import logging
from typing import Dict, Any, Optional, List

from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field
import uvicorn

from .agents.gemini import get_gemini_agent, AgentTask
from .agents.github import get_github_orchestrator, GitHubEventType
from .core.config import settings

# Configure logging
logging.basicConfig(
    level=getattr(logging, settings.LOG_LEVEL),
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# FastAPI app
app = FastAPI(
    title="MCPIS9 MCP Server",
    description="Model Context Protocol server with AI agents",
    version="0.2.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic models
class AgentTaskRequest(BaseModel):
    """Request model for agent tasks"""
    task: str = Field(..., description="Task description or question")
    agent_type: str = Field(default="gemini", description="Agent type (gemini, claude)")
    task_type: Optional[str] = Field(None, description="Explicit task type")
    context: Optional[Dict[str, Any]] = Field(default_factory=dict, description="Task context")
    language: str = Field(default="python", description="Programming language")


class AgentTaskResponse(BaseModel):
    """Response model for agent tasks"""
    status: str = Field(..., description="Task status")
    agent: str = Field(..., description="Agent name")
    task_type: str = Field(..., description="Task type")
    result: Optional[str] = Field(None, description="Task result")
    error: Optional[str] = Field(None, description="Error message")
    processing_time: float = Field(..., description="Processing time in seconds")
    timestamp: str = Field(..., description="Task timestamp")


class GitHubEventRequest(BaseModel):
    """Request model for GitHub webhook events"""
    event_type: str = Field(..., description="GitHub event type")
    payload: Dict[str, Any] = Field(..., description="GitHub event payload")


class HealthCheckResponse(BaseModel):
    """Response model for health checks"""
    status: str = Field(..., description="Health status")
    timestamp: str = Field(..., description="Check timestamp")
    details: Dict[str, Any] = Field(..., description="Health check details")


# API Routes
@app.get("/", response_model=Dict[str, Any])
async def root():
    """Root endpoint"""
    return {
        "service": "MCPIS9 MCP Server",
        "version": "0.2.0",
        "status": "running",
        "endpoints": {
            "health": "/health",
            "agent_task": "/agent/task",
            "github_webhook": "/github/webhook",
            "docs": "/docs"
        }
    }


@app.get("/health", response_model=HealthCheckResponse)
async def health_check():
    """Health check endpoint"""
    from datetime import datetime
    
    try:
        # Check agent health
        gemini_agent = get_gemini_agent()
        agent_health = await gemini_agent.health_check()
        
        # Check GitHub orchestrator if configured
        github_health = {"status": "not_configured"}
        if settings.GITHUB_TOKEN:
            try:
                github_orchestrator = get_github_orchestrator()
                github_health = await github_orchestrator.health_check()
            except Exception as e:
                github_health = {"status": "error", "error": str(e)}
        
        return HealthCheckResponse(
            status="healthy",
            timestamp=datetime.now().isoformat(),
            details={
                "gemini_agent": agent_health,
                "github_orchestrator": github_health,
                "configuration": {
                    "gemini_configured": bool(settings.GEMINI_API_KEY),
                    "github_configured": bool(settings.GITHUB_TOKEN),
                    "api_host": settings.API_HOST,
                    "api_port": settings.API_PORT
                }
            }
        )
    except Exception as e:
        logger.error(f"Health check failed: {str(e)}")
        return HealthCheckResponse(
            status="unhealthy",
            timestamp=datetime.now().isoformat(),
            details={"error": str(e)}
        )


@app.post("/agent/task", response_model=AgentTaskResponse)
async def process_agent_task(request: AgentTaskRequest):
    """Process a task with an AI agent"""
    try:
        # Parse task type if provided
        task_type = None
        if request.task_type:
            try:
                task_type = AgentTask(request.task_type)
            except ValueError:
                raise HTTPException(
                    status_code=400,
                    detail=f"Invalid task type: {request.task_type}"
                )
        
        # Add language to context
        context = request.context.copy()
        context["language"] = request.language
        
        # Route to appropriate agent
        if request.agent_type == "gemini":
            agent = get_gemini_agent()
            result = await agent.process_task(
                task=request.task,
                context=context,
                task_type=task_type
            )
        elif request.agent_type == "claude":
            # TODO: Implement Claude agent
            raise HTTPException(
                status_code=501,
                detail="Claude agent not yet implemented"
            )
        else:
            raise HTTPException(
                status_code=400,
                detail=f"Unknown agent type: {request.agent_type}"
            )
        
        return AgentTaskResponse(**result)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error processing agent task: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/github/webhook")
async def handle_github_webhook(
    request: GitHubEventRequest,
    background_tasks: BackgroundTasks
):
    """Handle GitHub webhook events"""
    try:
        # Parse event type
        try:
            event_type = GitHubEventType(request.event_type)
        except ValueError:
            raise HTTPException(
                status_code=400,
                detail=f"Unsupported event type: {request.event_type}"
            )
        
        # Process event in background
        if settings.GITHUB_TOKEN:
            orchestrator = get_github_orchestrator()
            background_tasks.add_task(
                orchestrator.handle_event,
                event_type=event_type,
                payload=request.payload
            )
            
            return {"status": "accepted", "message": "Event queued for processing"}
        else:
            raise HTTPException(
                status_code=503,
                detail="GitHub integration not configured"
            )
            
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error handling GitHub webhook: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/agent/history/{agent_type}")
async def get_agent_history(agent_type: str, limit: int = 10):
    """Get agent task history"""
    try:
        if agent_type == "gemini":
            agent = get_gemini_agent()
            history = agent.get_history(limit)
            return {"agent": agent_type, "history": history}
        elif agent_type == "claude":
            # TODO: Implement Claude agent history
            raise HTTPException(
                status_code=501,
                detail="Claude agent not yet implemented"
            )
        else:
            raise HTTPException(
                status_code=400,
                detail=f"Unknown agent type: {agent_type}"
            )
            
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting agent history: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@app.delete("/agent/history/{agent_type}")
async def clear_agent_history(agent_type: str):
    """Clear agent task history"""
    try:
        if agent_type == "gemini":
            agent = get_gemini_agent()
            agent.clear_history()
            return {"status": "success", "message": f"Cleared {agent_type} history"}
        elif agent_type == "claude":
            # TODO: Implement Claude agent history clearing
            raise HTTPException(
                status_code=501,
                detail="Claude agent not yet implemented"
            )
        else:
            raise HTTPException(
                status_code=400,
                detail=f"Unknown agent type: {agent_type}"
            )
            
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error clearing agent history: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/config")
async def get_configuration():
    """Get current configuration (sanitized)"""
    return {
        "gemini": {
            "api_key_configured": bool(settings.GEMINI_API_KEY),
            "model": settings.GEMINI_MODEL,
            "temperature": settings.GEMINI_TEMPERATURE,
            "max_tokens": settings.GEMINI_MAX_TOKENS,
        },
        "anthropic": {
            "api_key_configured": bool(settings.ANTHROPIC_API_KEY),
            "model": settings.ANTHROPIC_MODEL,
            "temperature": settings.ANTHROPIC_TEMPERATURE,
            "max_tokens": settings.ANTHROPIC_MAX_TOKENS,
        },
        "github": {
            "token_configured": bool(settings.GITHUB_TOKEN),
            "repository": settings.GITHUB_REPO,
        },
        "api": {
            "host": settings.API_HOST,
            "port": settings.API_PORT,
            "debug": settings.API_DEBUG,
        }
    }


# Error handlers
@app.exception_handler(ValueError)
async def value_error_handler(request, exc):
    """Handle ValueError exceptions"""
    logger.error(f"ValueError: {str(exc)}")
    return JSONResponse(
        status_code=400,
        content={"error": "Invalid request", "detail": str(exc)}
    )


@app.exception_handler(Exception)
async def general_exception_handler(request, exc):
    """Handle general exceptions"""
    logger.error(f"Unhandled exception: {str(exc)}")
    return JSONResponse(
        status_code=500,
        content={"error": "Internal server error", "detail": str(exc)}
    )


# Server startup/shutdown events
@app.on_event("startup")
async def startup_event():
    """Server startup event"""
    logger.info("Starting MCPIS9 MCP Server")
    logger.info(f"Server configuration: {settings.API_HOST}:{settings.API_PORT}")
    
    # Initialize agents
    try:
        gemini_agent = get_gemini_agent()
        logger.info(f"Initialized Gemini agent: {gemini_agent.name}")
    except Exception as e:
        logger.error(f"Failed to initialize Gemini agent: {str(e)}")
    
    # Initialize GitHub orchestrator if configured
    if settings.GITHUB_TOKEN:
        try:
            github_orchestrator = get_github_orchestrator()
            logger.info("Initialized GitHub orchestrator")
        except Exception as e:
            logger.error(f"Failed to initialize GitHub orchestrator: {str(e)}")
    else:
        logger.info("GitHub integration not configured")


@app.on_event("shutdown")
async def shutdown_event():
    """Server shutdown event"""
    logger.info("Shutting down MCPIS9 MCP Server")


def main():
    """Main entry point for the server"""
    logger.info("Starting MCPIS9 MCP Server")
    
    # Configure uvicorn
    uvicorn.run(
        "app.server:app",
        host=settings.API_HOST,
        port=settings.API_PORT,
        reload=settings.API_DEBUG,
        log_level=settings.LOG_LEVEL.lower(),
        access_log=True
    )


if __name__ == "__main__":
    main()