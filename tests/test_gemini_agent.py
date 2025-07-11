"""Tests for Gemini Agent functionality"""

import pytest
from unittest.mock import Mock, AsyncMock, patch
from datetime import datetime

from app.agents.gemini import GeminiAgent, AgentTask, get_gemini_agent
from app.clients.gemini import GeminiClient


class TestGeminiAgent:
    """Test suite for GeminiAgent class"""
    
    @pytest.fixture
    def mock_gemini_client(self):
        """Mock GeminiClient for testing"""
        client = Mock(spec=GeminiClient)
        client.generate_text = AsyncMock(return_value="Test response")
        client.generate_code = AsyncMock(return_value="def test(): pass")
        client.review_code = AsyncMock(return_value="Code looks good")
        client.explain_code = AsyncMock(return_value="This code does X")
        client.optimize_code = AsyncMock(return_value="Optimized code")
        client.debug_code = AsyncMock(return_value="Bug fixed")
        client.health_check = AsyncMock(return_value={"status": "healthy"})
        return client
    
    @pytest.fixture
    def gemini_agent(self, mock_gemini_client):
        """Create GeminiAgent instance with mocked client"""
        agent = GeminiAgent("Test Agent")
        agent.client = mock_gemini_client
        return agent
    
    def test_agent_initialization(self):
        """Test agent initialization"""
        agent = GeminiAgent("Test Agent")
        assert agent.name == "Test Agent"
        assert isinstance(agent.client, GeminiClient)
        assert agent.task_history == []
        assert len(agent.task_handlers) == len(AgentTask)
    
    @pytest.mark.asyncio
    async def test_detect_task_type_code_generation(self, gemini_agent):
        """Test task type detection for code generation"""
        tasks = [
            "generate a function to calculate fibonacci",
            "create a class for user management",
            "write a script to parse JSON",
            "implement a sorting algorithm"
        ]
        
        for task in tasks:
            task_type = await gemini_agent._detect_task_type(task)
            assert task_type == AgentTask.CODE_GENERATION
    
    @pytest.mark.asyncio
    async def test_detect_task_type_code_review(self, gemini_agent):
        """Test task type detection for code review"""
        tasks = [
            "review this code for bugs",
            "analyze the following function",
            "check this implementation",
            "audit the security of this code"
        ]
        
        for task in tasks:
            task_type = await gemini_agent._detect_task_type(task)
            assert task_type == AgentTask.CODE_REVIEW
    
    @pytest.mark.asyncio
    async def test_detect_task_type_code_explanation(self, gemini_agent):
        """Test task type detection for code explanation"""
        tasks = [
            "explain what this function does",
            "describe how this algorithm works",
            "what does this code do?",
            "how does this implementation work?"
        ]
        
        for task in tasks:
            task_type = await gemini_agent._detect_task_type(task)
            assert task_type == AgentTask.CODE_EXPLANATION
    
    @pytest.mark.asyncio
    async def test_detect_task_type_optimization(self, gemini_agent):
        """Test task type detection for optimization"""
        tasks = [
            "optimize this code for performance",
            "improve the efficiency of this function",
            "make this code faster",
            "optimize memory usage"
        ]
        
        for task in tasks:
            task_type = await gemini_agent._detect_task_type(task)
            assert task_type == AgentTask.CODE_OPTIMIZATION
    
    @pytest.mark.asyncio
    async def test_detect_task_type_debugging(self, gemini_agent):
        """Test task type detection for debugging"""
        tasks = [
            "debug this code",
            "fix the error in this function",
            "there's a bug in this code",
            "this code has an issue"
        ]
        
        for task in tasks:
            task_type = await gemini_agent._detect_task_type(task)
            assert task_type == AgentTask.CODE_DEBUG
    
    @pytest.mark.asyncio
    async def test_detect_task_type_testing(self, gemini_agent):
        """Test task type detection for testing"""
        tasks = [
            "generate tests for this function",
            "create unit tests",
            "write pytest tests",
            "add testing for this code"
        ]
        
        for task in tasks:
            task_type = await gemini_agent._detect_task_type(task)
            assert task_type == AgentTask.TESTING
    
    @pytest.mark.asyncio
    async def test_detect_task_type_documentation(self, gemini_agent):
        """Test task type detection for documentation"""
        tasks = [
            "create documentation for this code",
            "write a README file",
            "document this function",
            "generate docs"
        ]
        
        for task in tasks:
            task_type = await gemini_agent._detect_task_type(task)
            assert task_type == AgentTask.DOCUMENTATION
    
    @pytest.mark.asyncio
    async def test_detect_task_type_general_question(self, gemini_agent):
        """Test task type detection for general questions"""
        tasks = [
            "what is machine learning?",
            "tell me about Python",
            "how to use git?",
            "random question"
        ]
        
        for task in tasks:
            task_type = await gemini_agent._detect_task_type(task)
            assert task_type == AgentTask.GENERAL_QUESTION
    
    @pytest.mark.asyncio
    async def test_process_task_success(self, gemini_agent):
        """Test successful task processing"""
        result = await gemini_agent.process_task(
            task="Create a hello world function",
            context={"language": "python"}
        )
        
        assert result["status"] == "success"
        assert result["agent"] == "Test Agent"
        assert result["task_type"] == AgentTask.CODE_GENERATION.value
        assert result["result"] == "def test(): pass"
        assert "processing_time" in result
        assert "timestamp" in result
        assert len(gemini_agent.task_history) == 1
    
    @pytest.mark.asyncio
    async def test_process_task_with_explicit_type(self, gemini_agent):
        """Test task processing with explicit task type"""
        result = await gemini_agent.process_task(
            task="Some task",
            context={"language": "python"},
            task_type=AgentTask.CODE_REVIEW
        )
        
        assert result["status"] == "success"
        assert result["task_type"] == AgentTask.CODE_REVIEW.value
        assert result["result"] == "Code looks good"
    
    @pytest.mark.asyncio
    async def test_process_task_error_handling(self, gemini_agent):
        """Test task processing error handling"""
        # Mock client to raise exception
        gemini_agent.client.generate_code.side_effect = Exception("Test error")
        
        result = await gemini_agent.process_task(
            task="Create a function",
            context={"language": "python"}
        )
        
        assert result["status"] == "error"
        assert result["error"] == "Test error"
        assert "processing_time" in result
        assert "timestamp" in result
    
    @pytest.mark.asyncio
    async def test_handle_code_generation(self, gemini_agent):
        """Test code generation handling"""
        result = await gemini_agent._handle_code_generation(
            "Create a function",
            {"language": "python", "style_guide": "PEP 8"}
        )
        
        assert result == "def test(): pass"
        gemini_agent.client.generate_code.assert_called_once()
    
    @pytest.mark.asyncio
    async def test_handle_code_review(self, gemini_agent):
        """Test code review handling"""
        result = await gemini_agent._handle_code_review(
            "Review this code",
            {"code": "def test(): pass", "language": "python"}
        )
        
        assert result == "Code looks good"
        gemini_agent.client.review_code.assert_called_once()
    
    @pytest.mark.asyncio
    async def test_handle_code_review_no_code(self, gemini_agent):
        """Test code review handling without code"""
        result = await gemini_agent._handle_code_review(
            "Review this code",
            {"language": "python"}
        )
        
        assert "provide the code" in result.lower()
    
    @pytest.mark.asyncio
    async def test_handle_code_explanation(self, gemini_agent):
        """Test code explanation handling"""
        result = await gemini_agent._handle_code_explanation(
            "Explain this code",
            {"code": "def test(): pass", "language": "python"}
        )
        
        assert result == "This code does X"
        gemini_agent.client.explain_code.assert_called_once()
    
    @pytest.mark.asyncio
    async def test_handle_code_optimization(self, gemini_agent):
        """Test code optimization handling"""
        result = await gemini_agent._handle_code_optimization(
            "Optimize this code",
            {"code": "def test(): pass", "language": "python"}
        )
        
        assert result == "Optimized code"
        gemini_agent.client.optimize_code.assert_called_once()
    
    @pytest.mark.asyncio
    async def test_handle_code_debug(self, gemini_agent):
        """Test code debugging handling"""
        result = await gemini_agent._handle_code_debug(
            "Debug this code",
            {"code": "def test(): pass", "error_message": "SyntaxError"}
        )
        
        assert result == "Bug fixed"
        gemini_agent.client.debug_code.assert_called_once()
    
    @pytest.mark.asyncio
    async def test_handle_general_question(self, gemini_agent):
        """Test general question handling"""
        result = await gemini_agent._handle_general_question(
            "What is Python?",
            {"system_instruction": "Be helpful"}
        )
        
        assert result == "Test response"
        gemini_agent.client.generate_text.assert_called_once()
    
    @pytest.mark.asyncio
    async def test_handle_documentation(self, gemini_agent):
        """Test documentation handling"""
        result = await gemini_agent._handle_documentation(
            "Create docs",
            {"code": "def test(): pass", "doc_type": "comprehensive"}
        )
        
        assert result == "Test response"
        gemini_agent.client.generate_text.assert_called_once()
    
    @pytest.mark.asyncio
    async def test_handle_testing(self, gemini_agent):
        """Test testing handling"""
        result = await gemini_agent._handle_testing(
            "Generate tests",
            {"code": "def test(): pass", "test_framework": "pytest"}
        )
        
        assert result == "def test(): pass"
        gemini_agent.client.generate_code.assert_called_once()
    
    def test_history_management(self, gemini_agent):
        """Test task history management"""
        # Add some test entries
        for i in range(5):
            gemini_agent._add_to_history({
                "task": f"Task {i}",
                "status": "success",
                "timestamp": datetime.now().isoformat()
            })
        
        assert len(gemini_agent.task_history) == 5
        
        # Get history
        history = gemini_agent.get_history(3)
        assert len(history) == 3
        assert history[-1]["task"] == "Task 4"  # Most recent
        
        # Clear history
        gemini_agent.clear_history()
        assert len(gemini_agent.task_history) == 0
    
    def test_history_limit(self, gemini_agent):
        """Test history limit enforcement"""
        # Add more than 100 entries
        for i in range(105):
            gemini_agent._add_to_history({
                "task": f"Task {i}",
                "status": "success",
                "timestamp": datetime.now().isoformat()
            })
        
        # Should only keep last 100 entries
        assert len(gemini_agent.task_history) == 100
        assert gemini_agent.task_history[0]["task"] == "Task 5"  # First kept entry
        assert gemini_agent.task_history[-1]["task"] == "Task 104"  # Last entry
    
    @pytest.mark.asyncio
    async def test_health_check(self, gemini_agent):
        """Test agent health check"""
        health = await gemini_agent.health_check()
        
        assert health["agent"] == "Test Agent"
        assert health["client_health"]["status"] == "healthy"
        assert health["task_history_count"] == 0
        assert "supported_tasks" in health
        assert "timestamp" in health
    
    def test_global_instance(self):
        """Test global agent instance"""
        agent1 = get_gemini_agent()
        agent2 = get_gemini_agent()
        
        # Should return the same instance
        assert agent1 is agent2
        assert isinstance(agent1, GeminiAgent)


class TestGeminiAgentIntegration:
    """Integration tests for GeminiAgent"""
    
    @pytest.mark.asyncio
    async def test_task_type_routing(self):
        """Test that tasks are routed to correct handlers"""
        agent = GeminiAgent("Test Agent")
        
        # Mock all handler methods
        agent._handle_code_generation = AsyncMock(return_value="Generated code")
        agent._handle_code_review = AsyncMock(return_value="Review result")
        agent._handle_general_question = AsyncMock(return_value="General answer")
        
        # Test code generation routing
        result = await agent.process_task("generate a function")
        assert result["task_type"] == AgentTask.CODE_GENERATION.value
        agent._handle_code_generation.assert_called_once()
        
        # Reset mocks
        agent._handle_code_generation.reset_mock()
        agent._handle_code_review.reset_mock()
        agent._handle_general_question.reset_mock()
        
        # Test code review routing
        result = await agent.process_task("review this code")
        assert result["task_type"] == AgentTask.CODE_REVIEW.value
        agent._handle_code_review.assert_called_once()
        
        # Reset mocks
        agent._handle_code_generation.reset_mock()
        agent._handle_code_review.reset_mock()
        agent._handle_general_question.reset_mock()
        
        # Test general question routing
        result = await agent.process_task("what is Python?")
        assert result["task_type"] == AgentTask.GENERAL_QUESTION.value
        agent._handle_general_question.assert_called_once()
    
    @pytest.mark.asyncio
    async def test_context_passing(self):
        """Test that context is properly passed to handlers"""
        agent = GeminiAgent("Test Agent")
        agent._handle_code_generation = AsyncMock(return_value="Generated code")
        
        context = {"language": "javascript", "framework": "react"}
        await agent.process_task("generate a component", context)
        
        # Check that context was passed to handler
        args, kwargs = agent._handle_code_generation.call_args
        assert kwargs == {}  # No kwargs expected
        assert args[1] == context  # Context is second argument
    
    @pytest.mark.asyncio
    async def test_explicit_task_type_override(self):
        """Test that explicit task type overrides detection"""
        agent = GeminiAgent("Test Agent")
        agent._handle_code_review = AsyncMock(return_value="Review result")
        
        # Task looks like code generation but explicit type is review
        result = await agent.process_task(
            "generate a function",
            task_type=AgentTask.CODE_REVIEW
        )
        
        assert result["task_type"] == AgentTask.CODE_REVIEW.value
        agent._handle_code_review.assert_called_once()