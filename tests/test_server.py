"""Tests for MCPIS9 Server API endpoints"""

import pytest
from fastapi.testclient import TestClient
from unittest.mock import Mock, AsyncMock, patch
import json

from app.server import app
from app.agents.gemini import AgentTask


class TestServerEndpoints:
    """Test suite for server API endpoints"""
    
    @pytest.fixture
    def client(self):
        """Create test client"""
        return TestClient(app)
    
    @pytest.fixture
    def mock_gemini_agent(self):
        """Mock Gemini agent"""
        agent = Mock()
        agent.process_task = AsyncMock(return_value={
            "status": "success",
            "agent": "Gemini Agent",
            "task_type": "code_generation",
            "result": "def hello(): print('Hello')",
            "processing_time": 1.5,
            "timestamp": "2023-01-01T00:00:00"
        })
        agent.health_check = AsyncMock(return_value={
            "status": "healthy",
            "client_health": {"status": "healthy"},
            "task_history_count": 0
        })
        agent.get_history = Mock(return_value=[
            {
                "task": "Test task",
                "status": "success",
                "timestamp": "2023-01-01T00:00:00"
            }
        ])
        agent.clear_history = Mock()
        return agent
    
    @pytest.fixture
    def mock_github_orchestrator(self):
        """Mock GitHub orchestrator"""
        orchestrator = Mock()
        orchestrator.health_check = AsyncMock(return_value={
            "status": "healthy",
            "github_api": {"status": "healthy"},
            "gemini_agent": {"status": "healthy"}
        })
        orchestrator.handle_event = AsyncMock(return_value={
            "status": "success",
            "message": "Event processed"
        })
        return orchestrator
    
    def test_root_endpoint(self, client):
        """Test root endpoint"""
        response = client.get("/")
        assert response.status_code == 200
        
        data = response.json()
        assert data["service"] == "MCPIS9 MCP Server"
        assert data["version"] == "0.2.0"
        assert data["status"] == "running"
        assert "endpoints" in data
    
    def test_health_check_endpoint(self, client):
        """Test health check endpoint"""
        with patch('app.server.get_gemini_agent') as mock_get_agent:
            mock_agent = Mock()
            mock_agent.health_check = AsyncMock(return_value={"status": "healthy"})
            mock_get_agent.return_value = mock_agent
            
            with patch('app.server.settings') as mock_settings:
                mock_settings.GEMINI_API_KEY = "test_key"
                mock_settings.GITHUB_TOKEN = ""
                
                response = client.get("/health")
                assert response.status_code == 200
                
                data = response.json()
                assert data["status"] == "healthy"
                assert "details" in data
                assert "timestamp" in data
    
    def test_health_check_error(self, client):
        """Test health check endpoint with error"""
        with patch('app.server.get_gemini_agent') as mock_get_agent:
            mock_get_agent.side_effect = Exception("Connection error")
            
            response = client.get("/health")
            assert response.status_code == 200
            
            data = response.json()
            assert data["status"] == "unhealthy"
            assert "error" in data["details"]
    
    def test_process_agent_task_success(self, client, mock_gemini_agent):
        """Test successful agent task processing"""
        with patch('app.server.get_gemini_agent', return_value=mock_gemini_agent):
            request_data = {
                "task": "Create a hello world function",
                "agent_type": "gemini",
                "language": "python"
            }
            
            response = client.post("/agent/task", json=request_data)
            assert response.status_code == 200
            
            data = response.json()
            assert data["status"] == "success"
            assert data["agent"] == "Gemini Agent"
            assert data["task_type"] == "code_generation"
            assert data["result"] == "def hello(): print('Hello')"
            
            # Verify agent was called correctly
            mock_gemini_agent.process_task.assert_called_once()
            call_args = mock_gemini_agent.process_task.call_args
            assert call_args[1]["task"] == "Create a hello world function"
            assert call_args[1]["context"]["language"] == "python"
    
    def test_process_agent_task_with_explicit_type(self, client, mock_gemini_agent):
        """Test agent task processing with explicit task type"""
        with patch('app.server.get_gemini_agent', return_value=mock_gemini_agent):
            request_data = {
                "task": "Review this code",
                "agent_type": "gemini",
                "task_type": "code_review",
                "context": {"code": "def test(): pass"}
            }
            
            response = client.post("/agent/task", json=request_data)
            assert response.status_code == 200
            
            # Verify task type was passed correctly
            call_args = mock_gemini_agent.process_task.call_args
            assert call_args[1]["task_type"] == AgentTask.CODE_REVIEW
    
    def test_process_agent_task_invalid_type(self, client):
        """Test agent task processing with invalid task type"""
        request_data = {
            "task": "Test task",
            "agent_type": "gemini",
            "task_type": "invalid_type"
        }
        
        response = client.post("/agent/task", json=request_data)
        assert response.status_code == 400
        assert "Invalid task type" in response.json()["detail"]
    
    def test_process_agent_task_claude_not_implemented(self, client):
        """Test agent task processing with Claude (not implemented)"""
        request_data = {
            "task": "Test task",
            "agent_type": "claude"
        }
        
        response = client.post("/agent/task", json=request_data)
        assert response.status_code == 501
        assert "Claude agent not yet implemented" in response.json()["detail"]
    
    def test_process_agent_task_unknown_agent(self, client):
        """Test agent task processing with unknown agent type"""
        request_data = {
            "task": "Test task",
            "agent_type": "unknown_agent"
        }
        
        response = client.post("/agent/task", json=request_data)
        assert response.status_code == 400
        assert "Unknown agent type" in response.json()["detail"]
    
    def test_process_agent_task_error(self, client):
        """Test agent task processing with error"""
        with patch('app.server.get_gemini_agent') as mock_get_agent:
            mock_agent = Mock()
            mock_agent.process_task = AsyncMock(side_effect=Exception("Processing error"))
            mock_get_agent.return_value = mock_agent
            
            request_data = {
                "task": "Test task",
                "agent_type": "gemini"
            }
            
            response = client.post("/agent/task", json=request_data)
            assert response.status_code == 500
            assert "Processing error" in response.json()["detail"]
    
    def test_github_webhook_success(self, client, mock_github_orchestrator):
        """Test successful GitHub webhook processing"""
        with patch('app.server.get_github_orchestrator', return_value=mock_github_orchestrator):
            with patch('app.server.settings') as mock_settings:
                mock_settings.GITHUB_TOKEN = "test_token"
                
                request_data = {
                    "event_type": "issue_created",
                    "payload": {
                        "issue": {
                            "title": "Test issue",
                            "body": "@agent create a function"
                        }
                    }
                }
                
                response = client.post("/github/webhook", json=request_data)
                assert response.status_code == 200
                
                data = response.json()
                assert data["status"] == "accepted"
                assert data["message"] == "Event queued for processing"
    
    def test_github_webhook_invalid_event(self, client):
        """Test GitHub webhook with invalid event type"""
        request_data = {
            "event_type": "invalid_event",
            "payload": {}
        }
        
        response = client.post("/github/webhook", json=request_data)
        assert response.status_code == 400
        assert "Unsupported event type" in response.json()["detail"]
    
    def test_github_webhook_not_configured(self, client):
        """Test GitHub webhook when not configured"""
        with patch('app.server.settings') as mock_settings:
            mock_settings.GITHUB_TOKEN = ""
            
            request_data = {
                "event_type": "issue_created",
                "payload": {}
            }
            
            response = client.post("/github/webhook", json=request_data)
            assert response.status_code == 503
            assert "GitHub integration not configured" in response.json()["detail"]
    
    def test_get_agent_history_success(self, client, mock_gemini_agent):
        """Test getting agent history"""
        with patch('app.server.get_gemini_agent', return_value=mock_gemini_agent):
            response = client.get("/agent/history/gemini?limit=5")
            assert response.status_code == 200
            
            data = response.json()
            assert data["agent"] == "gemini"
            assert "history" in data
            assert len(data["history"]) == 1
            
            mock_gemini_agent.get_history.assert_called_once_with(5)
    
    def test_get_agent_history_claude_not_implemented(self, client):
        """Test getting Claude agent history (not implemented)"""
        response = client.get("/agent/history/claude")
        assert response.status_code == 501
        assert "Claude agent not yet implemented" in response.json()["detail"]
    
    def test_get_agent_history_unknown_agent(self, client):
        """Test getting history for unknown agent"""
        response = client.get("/agent/history/unknown")
        assert response.status_code == 400
        assert "Unknown agent type" in response.json()["detail"]
    
    def test_clear_agent_history_success(self, client, mock_gemini_agent):
        """Test clearing agent history"""
        with patch('app.server.get_gemini_agent', return_value=mock_gemini_agent):
            response = client.delete("/agent/history/gemini")
            assert response.status_code == 200
            
            data = response.json()
            assert data["status"] == "success"
            assert "Cleared gemini history" in data["message"]
            
            mock_gemini_agent.clear_history.assert_called_once()
    
    def test_clear_agent_history_claude_not_implemented(self, client):
        """Test clearing Claude agent history (not implemented)"""
        response = client.delete("/agent/history/claude")
        assert response.status_code == 501
        assert "Claude agent not yet implemented" in response.json()["detail"]
    
    def test_get_configuration(self, client):
        """Test getting configuration"""
        with patch('app.server.settings') as mock_settings:
            mock_settings.GEMINI_API_KEY = "test_key"
            mock_settings.GEMINI_MODEL = "test_model"
            mock_settings.GEMINI_TEMPERATURE = 0.7
            mock_settings.GEMINI_MAX_TOKENS = 1024
            mock_settings.ANTHROPIC_API_KEY = ""
            mock_settings.ANTHROPIC_MODEL = "claude-3"
            mock_settings.ANTHROPIC_TEMPERATURE = 0.5
            mock_settings.ANTHROPIC_MAX_TOKENS = 2048
            mock_settings.GITHUB_TOKEN = "github_token"
            mock_settings.GITHUB_REPO = "test/repo"
            mock_settings.API_HOST = "0.0.0.0"
            mock_settings.API_PORT = 8000
            mock_settings.API_DEBUG = False
            
            response = client.get("/config")
            assert response.status_code == 200
            
            data = response.json()
            assert data["gemini"]["api_key_configured"] is True
            assert data["gemini"]["model"] == "test_model"
            assert data["anthropic"]["api_key_configured"] is False
            assert data["github"]["token_configured"] is True
            assert data["api"]["host"] == "0.0.0.0"
            assert data["api"]["port"] == 8000
    
    def test_request_validation(self, client):
        """Test request validation"""
        # Test missing required field
        response = client.post("/agent/task", json={})
        assert response.status_code == 422
        
        # Test invalid JSON
        response = client.post("/agent/task", data="invalid json")
        assert response.status_code == 422
    
    def test_cors_headers(self, client):
        """Test CORS headers are present"""
        response = client.options("/agent/task")
        assert response.status_code == 200
        
        # Check for CORS headers (these are added by the CORS middleware)
        # The exact headers might vary depending on the request
        assert "access-control-allow-origin" in response.headers or \
               "Access-Control-Allow-Origin" in response.headers


class TestServerIntegration:
    """Integration tests for server functionality"""
    
    def test_full_agent_workflow(self):
        """Test complete agent workflow"""
        client = TestClient(app)
        
        with patch('app.server.get_gemini_agent') as mock_get_agent:
            mock_agent = Mock()
            mock_agent.process_task = AsyncMock(return_value={
                "status": "success",
                "agent": "Gemini Agent",
                "task_type": "code_generation",
                "result": "def hello(): print('Hello')",
                "processing_time": 1.5,
                "timestamp": "2023-01-01T00:00:00"
            })
            mock_agent.get_history = Mock(return_value=[
                {
                    "task": "Create a hello world function",
                    "status": "success",
                    "timestamp": "2023-01-01T00:00:00"
                }
            ])
            mock_get_agent.return_value = mock_agent
            
            # 1. Process a task
            response = client.post("/agent/task", json={
                "task": "Create a hello world function",
                "agent_type": "gemini",
                "language": "python"
            })
            assert response.status_code == 200
            
            # 2. Check history
            response = client.get("/agent/history/gemini")
            assert response.status_code == 200
            
            history = response.json()["history"]
            assert len(history) == 1
            assert history[0]["task"] == "Create a hello world function"
    
    def test_error_handling_workflow(self):
        """Test error handling across endpoints"""
        client = TestClient(app)
        
        # Test that errors are properly handled and formatted
        with patch('app.server.get_gemini_agent') as mock_get_agent:
            mock_get_agent.side_effect = Exception("Service unavailable")
            
            response = client.post("/agent/task", json={
                "task": "Test task",
                "agent_type": "gemini"
            })
            assert response.status_code == 500
            assert "Service unavailable" in response.json()["detail"]