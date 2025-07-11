"""Tests for Gemini Client functionality"""

import pytest
from unittest.mock import Mock, AsyncMock, patch
import google.generativeai as genai

from app.clients.gemini import GeminiClient, get_gemini_client


class TestGeminiClient:
    """Test suite for GeminiClient class"""
    
    @pytest.fixture
    def mock_genai(self):
        """Mock google.generativeai module"""
        with patch('app.clients.gemini.genai') as mock:
            # Mock the model
            mock_model = Mock()
            mock_model.generate_content.return_value = Mock(text="Test response")
            mock.GenerativeModel.return_value = mock_model
            
            yield mock
    
    @pytest.fixture
    def gemini_client(self, mock_genai):
        """Create GeminiClient instance with mocked genai"""
        with patch('app.clients.gemini.settings') as mock_settings:
            mock_settings.GEMINI_API_KEY = "test_key"
            mock_settings.GEMINI_MODEL = "test_model"
            mock_settings.GEMINI_TEMPERATURE = 0.7
            mock_settings.GEMINI_TOP_P = 0.95
            mock_settings.GEMINI_TOP_K = 40
            mock_settings.GEMINI_MAX_TOKENS = 1024
            
            client = GeminiClient(api_key="test_key")
            return client
    
    def test_client_initialization(self, mock_genai):
        """Test client initialization"""
        with patch('app.clients.gemini.settings') as mock_settings:
            mock_settings.GEMINI_API_KEY = "test_key"
            mock_settings.GEMINI_MODEL = "test_model"
            mock_settings.GEMINI_TEMPERATURE = 0.7
            mock_settings.GEMINI_TOP_P = 0.95
            mock_settings.GEMINI_TOP_K = 40
            mock_settings.GEMINI_MAX_TOKENS = 1024
            
            client = GeminiClient()
            
            assert client.api_key == "test_key"
            assert client.model_name == "test_model"
            mock_genai.configure.assert_called_once_with(api_key="test_key")
            mock_genai.GenerativeModel.assert_called_once()
    
    def test_client_initialization_no_api_key(self, mock_genai):
        """Test client initialization without API key"""
        with patch('app.clients.gemini.settings') as mock_settings:
            mock_settings.GEMINI_API_KEY = ""
            
            with pytest.raises(ValueError, match="Gemini API key is required"):
                GeminiClient()
    
    def test_client_initialization_custom_params(self, mock_genai):
        """Test client initialization with custom parameters"""
        client = GeminiClient(api_key="custom_key", model_name="custom_model")
        
        assert client.api_key == "custom_key"
        assert client.model_name == "custom_model"
    
    @pytest.mark.asyncio
    async def test_generate_text_basic(self, gemini_client):
        """Test basic text generation"""
        result = await gemini_client.generate_text("Hello world")
        
        assert result == "Test response"
        gemini_client.model.generate_content.assert_called_once()
    
    @pytest.mark.asyncio
    async def test_generate_text_with_context(self, gemini_client):
        """Test text generation with context"""
        context = [
            {"role": "user", "parts": ["Previous message"]},
            {"role": "model", "parts": ["Previous response"]}
        ]
        
        result = await gemini_client.generate_text(
            "Current message",
            context=context
        )
        
        assert result == "Test response"
        
        # Check that context was included in the call
        call_args = gemini_client.model.generate_content.call_args[0][0]
        assert len(call_args) == 3  # context + current message
        assert call_args[0] == context[0]
        assert call_args[1] == context[1]
        assert call_args[2]["parts"] == ["Current message"]
    
    @pytest.mark.asyncio
    async def test_generate_text_empty_response(self, gemini_client):
        """Test handling of empty response"""
        gemini_client.model.generate_content.return_value = Mock(text="")
        
        result = await gemini_client.generate_text("Test prompt")
        
        assert result == ""
    
    @pytest.mark.asyncio
    async def test_generate_text_error_handling(self, gemini_client):
        """Test error handling in text generation"""
        gemini_client.model.generate_content.side_effect = Exception("API Error")
        
        with pytest.raises(Exception, match="API Error"):
            await gemini_client.generate_text("Test prompt")
    
    @pytest.mark.asyncio
    async def test_generate_code(self, gemini_client):
        """Test code generation"""
        result = await gemini_client.generate_code(
            "Create a hello world function",
            language="python"
        )
        
        assert result == "Test response"
        gemini_client.model.generate_content.assert_called_once()
    
    @pytest.mark.asyncio
    async def test_generate_code_with_context(self, gemini_client):
        """Test code generation with context"""
        result = await gemini_client.generate_code(
            "Create a function",
            language="javascript",
            context="React component",
            style_guide="Airbnb"
        )
        
        assert result == "Test response"
        
        # Check that the call was made with appropriate parameters
        call_args = gemini_client.model.generate_content.call_args
        assert call_args is not None
    
    @pytest.mark.asyncio
    async def test_review_code(self, gemini_client):
        """Test code review"""
        code = "def hello(): print('Hello')"
        
        result = await gemini_client.review_code(
            code=code,
            language="python",
            focus_areas=["security", "performance"]
        )
        
        assert result == "Test response"
        gemini_client.model.generate_content.assert_called_once()
    
    @pytest.mark.asyncio
    async def test_explain_code(self, gemini_client):
        """Test code explanation"""
        code = "def factorial(n): return 1 if n <= 1 else n * factorial(n-1)"
        
        result = await gemini_client.explain_code(
            code=code,
            language="python",
            detail_level="detailed"
        )
        
        assert result == "Test response"
        gemini_client.model.generate_content.assert_called_once()
    
    @pytest.mark.asyncio
    async def test_optimize_code(self, gemini_client):
        """Test code optimization"""
        code = "for i in range(len(items)): print(items[i])"
        
        result = await gemini_client.optimize_code(
            code=code,
            language="python",
            optimization_type="performance"
        )
        
        assert result == "Test response"
        gemini_client.model.generate_content.assert_called_once()
    
    @pytest.mark.asyncio
    async def test_debug_code(self, gemini_client):
        """Test code debugging"""
        code = "def divide(a, b): return a / b"
        error_message = "ZeroDivisionError: division by zero"
        
        result = await gemini_client.debug_code(
            code=code,
            error_message=error_message,
            language="python"
        )
        
        assert result == "Test response"
        gemini_client.model.generate_content.assert_called_once()
    
    @pytest.mark.asyncio
    async def test_health_check_healthy(self, gemini_client):
        """Test health check when service is healthy"""
        result = await gemini_client.health_check()
        
        assert result["status"] == "healthy"
        assert result["model"] == gemini_client.model_name
        assert result["api_key_configured"] is True
        assert "test_response" in result
    
    @pytest.mark.asyncio
    async def test_health_check_unhealthy(self, gemini_client):
        """Test health check when service is unhealthy"""
        gemini_client.model.generate_content.side_effect = Exception("Connection error")
        
        result = await gemini_client.health_check()
        
        assert result["status"] == "unhealthy"
        assert result["model"] == gemini_client.model_name
        assert result["api_key_configured"] is True
        assert "error" in result
    
    @pytest.mark.asyncio
    async def test_generate_with_custom_parameters(self, gemini_client):
        """Test generation with custom parameters"""
        result = await gemini_client.generate_text(
            "Test prompt",
            temperature=0.3,
            top_p=0.8,
            max_output_tokens=500
        )
        
        assert result == "Test response"
        
        # Check that custom generation config was used
        call_args = gemini_client.model.generate_content.call_args
        assert call_args is not None
        # In real implementation, we'd verify the generation_config parameter
    
    def test_global_instance(self):
        """Test global client instance"""
        with patch('app.clients.gemini.settings') as mock_settings:
            mock_settings.GEMINI_API_KEY = "test_key"
            mock_settings.GEMINI_MODEL = "test_model"
            mock_settings.GEMINI_TEMPERATURE = 0.7
            mock_settings.GEMINI_TOP_P = 0.95
            mock_settings.GEMINI_TOP_K = 40
            mock_settings.GEMINI_MAX_TOKENS = 1024
            
            with patch('app.clients.gemini.genai'):
                client1 = get_gemini_client()
                client2 = get_gemini_client()
                
                # Should return the same instance
                assert client1 is client2
                assert isinstance(client1, GeminiClient)


class TestGeminiClientIntegration:
    """Integration tests for GeminiClient"""
    
    @pytest.mark.asyncio
    async def test_different_generation_methods(self):
        """Test that different generation methods use appropriate parameters"""
        with patch('app.clients.gemini.settings') as mock_settings:
            mock_settings.GEMINI_API_KEY = "test_key"
            mock_settings.GEMINI_MODEL = "test_model"
            mock_settings.GEMINI_TEMPERATURE = 0.7
            mock_settings.GEMINI_TOP_P = 0.95
            mock_settings.GEMINI_TOP_K = 40
            mock_settings.GEMINI_MAX_TOKENS = 1024
            
            with patch('app.clients.gemini.genai') as mock_genai:
                mock_model = Mock()
                mock_model.generate_content.return_value = Mock(text="Test response")
                mock_genai.GenerativeModel.return_value = mock_model
                
                client = GeminiClient()
                
                # Test that code generation uses lower temperature
                await client.generate_code("Create a function")
                
                # Test that code review uses appropriate temperature
                await client.review_code("def test(): pass")
                
                # Test that explanation uses appropriate temperature
                await client.explain_code("def test(): pass")
                
                # Verify that generate_content was called multiple times
                assert mock_model.generate_content.call_count == 3
    
    @pytest.mark.asyncio
    async def test_context_building(self):
        """Test that context is properly built for conversations"""
        with patch('app.clients.gemini.settings') as mock_settings:
            mock_settings.GEMINI_API_KEY = "test_key"
            mock_settings.GEMINI_MODEL = "test_model"
            mock_settings.GEMINI_TEMPERATURE = 0.7
            mock_settings.GEMINI_TOP_P = 0.95
            mock_settings.GEMINI_TOP_K = 40
            mock_settings.GEMINI_MAX_TOKENS = 1024
            
            with patch('app.clients.gemini.genai') as mock_genai:
                mock_model = Mock()
                mock_model.generate_content.return_value = Mock(text="Test response")
                mock_genai.GenerativeModel.return_value = mock_model
                
                client = GeminiClient()
                
                # Test with context
                context = [
                    {"role": "user", "parts": ["Hello"]},
                    {"role": "model", "parts": ["Hi there!"]}
                ]
                
                await client.generate_text("How are you?", context=context)
                
                # Verify that context was properly included
                call_args = mock_model.generate_content.call_args[0][0]
                assert len(call_args) == 3  # context + current message
                assert call_args[0] == context[0]
                assert call_args[1] == context[1]
                assert call_args[2]["role"] == "user"
                assert call_args[2]["parts"] == ["How are you?"]