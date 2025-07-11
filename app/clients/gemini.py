"""Google Gemini API client for MCPIS9"""

import asyncio
import logging
from typing import Dict, List, Optional, Any, Union

import google.generativeai as genai
from google.generativeai.types import HarmCategory, HarmBlockThreshold

from ..core.config import settings

logger = logging.getLogger(__name__)


class GeminiClient:
    """
    Asynchronous Google Gemini API client
    
    Provides methods to interact with Google's Gemini AI model
    with proper error handling, rate limiting, and safety settings.
    """
    
    def __init__(self, api_key: Optional[str] = None, model_name: Optional[str] = None):
        """
        Initialize the Gemini client
        
        Args:
            api_key: Google API key. If not provided, uses settings.GEMINI_API_KEY
            model_name: Model name to use. If not provided, uses settings.GEMINI_MODEL
        """
        self.api_key = api_key or settings.GEMINI_API_KEY
        self.model_name = model_name or settings.GEMINI_MODEL
        
        if not self.api_key:
            raise ValueError("Gemini API key is required")
        
        # Configure the client
        genai.configure(api_key=self.api_key)
        
        # Initialize the model
        self.model = genai.GenerativeModel(
            model_name=self.model_name,
            safety_settings={
                HarmCategory.HARM_CATEGORY_HARASSMENT: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
                HarmCategory.HARM_CATEGORY_HATE_SPEECH: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
                HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
                HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
            },
            generation_config=genai.GenerationConfig(
                temperature=settings.GEMINI_TEMPERATURE,
                top_p=settings.GEMINI_TOP_P,
                top_k=settings.GEMINI_TOP_K,
                max_output_tokens=settings.GEMINI_MAX_TOKENS,
            )
        )
        
        logger.info(f"Initialized Gemini client with model: {self.model_name}")
    
    async def generate_text(
        self,
        prompt: str,
        system_instruction: Optional[str] = None,
        context: Optional[List[Dict[str, str]]] = None,
        **kwargs
    ) -> str:
        """
        Generate text using the Gemini model
        
        Args:
            prompt: The user prompt
            system_instruction: Optional system instruction to guide the model
            context: Optional conversation context as list of {"role": "user/model", "parts": ["text"]}
            **kwargs: Additional generation parameters
            
        Returns:
            Generated text response
            
        Raises:
            Exception: If the API call fails
        """
        try:
            # Build the conversation history
            contents = []
            
            # Add context if provided
            if context:
                for msg in context:
                    contents.append(msg)
            
            # Add the current prompt
            contents.append({"role": "user", "parts": [prompt]})
            
            # Override generation config if provided
            generation_config = None
            if kwargs:
                generation_config = genai.GenerationConfig(**kwargs)
            
            # Generate response
            logger.debug(f"Generating text with prompt: {prompt[:100]}...")
            
            # Use async generation
            response = await asyncio.get_event_loop().run_in_executor(
                None,
                lambda: self.model.generate_content(
                    contents,
                    generation_config=generation_config,
                    safety_settings=None if kwargs.get('disable_safety', False) else None
                )
            )
            
            if not response.text:
                logger.warning("Empty response from Gemini")
                return ""
            
            logger.debug(f"Generated {len(response.text)} characters")
            return response.text
            
        except Exception as e:
            logger.error(f"Error generating text with Gemini: {str(e)}")
            raise
    
    async def generate_code(
        self,
        task_description: str,
        language: str = "python",
        context: Optional[str] = None,
        style_guide: Optional[str] = None
    ) -> str:
        """
        Generate code using the Gemini model
        
        Args:
            task_description: Description of the coding task
            language: Programming language (default: python)
            context: Optional context about the codebase
            style_guide: Optional style guide to follow
            
        Returns:
            Generated code
        """
        system_instruction = f"""
        You are an expert {language} programmer. Generate clean, efficient, and well-documented code.
        
        Requirements:
        - Follow {language} best practices
        - Include proper error handling
        - Add comprehensive docstrings/comments
        - Use type hints (if applicable)
        - Follow modern {language} conventions
        """
        
        if style_guide:
            system_instruction += f"\n- Follow this style guide: {style_guide}"
        
        prompt = f"""
        Task: {task_description}
        Language: {language}
        
        {f"Context: {context}" if context else ""}
        
        Please provide the complete code solution with explanations.
        """
        
        return await self.generate_text(
            prompt=prompt,
            system_instruction=system_instruction,
            temperature=0.3,  # Lower temperature for more consistent code generation
            top_p=0.9
        )
    
    async def review_code(
        self,
        code: str,
        language: str = "python",
        focus_areas: Optional[List[str]] = None
    ) -> str:
        """
        Review code using the Gemini model
        
        Args:
            code: Code to review
            language: Programming language
            focus_areas: Specific areas to focus on (e.g., ["security", "performance"])
            
        Returns:
            Code review feedback
        """
        focus_text = ""
        if focus_areas:
            focus_text = f"Focus especially on: {', '.join(focus_areas)}"
        
        prompt = f"""
        Please review the following {language} code for:
        - Code quality and best practices
        - Potential bugs or issues
        - Security vulnerabilities
        - Performance optimizations
        - Maintainability improvements
        
        {focus_text}
        
        Code to review:
        ```{language}
        {code}
        ```
        
        Provide detailed feedback with specific suggestions for improvement.
        """
        
        return await self.generate_text(
            prompt=prompt,
            temperature=0.4,
            top_p=0.9
        )
    
    async def explain_code(
        self,
        code: str,
        language: str = "python",
        detail_level: str = "detailed"
    ) -> str:
        """
        Explain code using the Gemini model
        
        Args:
            code: Code to explain
            language: Programming language
            detail_level: Level of detail ("brief", "detailed", "comprehensive")
            
        Returns:
            Code explanation
        """
        detail_instructions = {
            "brief": "Provide a brief, high-level explanation",
            "detailed": "Provide a detailed explanation with examples",
            "comprehensive": "Provide a comprehensive explanation including edge cases and best practices"
        }
        
        prompt = f"""
        {detail_instructions.get(detail_level, detail_instructions["detailed"])} of the following {language} code:
        
        ```{language}
        {code}
        ```
        
        Explain:
        - What the code does
        - How it works
        - Key concepts used
        - Potential use cases
        """
        
        return await self.generate_text(
            prompt=prompt,
            temperature=0.3,
            top_p=0.9
        )
    
    async def optimize_code(
        self,
        code: str,
        language: str = "python",
        optimization_type: str = "performance"
    ) -> str:
        """
        Optimize code using the Gemini model
        
        Args:
            code: Code to optimize
            language: Programming language
            optimization_type: Type of optimization ("performance", "memory", "readability")
            
        Returns:
            Optimized code with explanations
        """
        prompt = f"""
        Please optimize the following {language} code for {optimization_type}:
        
        ```{language}
        {code}
        ```
        
        Provide:
        1. The optimized code
        2. Explanation of changes made
        3. Expected improvements
        4. Any trade-offs or considerations
        """
        
        return await self.generate_text(
            prompt=prompt,
            temperature=0.3,
            top_p=0.9
        )
    
    async def debug_code(
        self,
        code: str,
        error_message: str,
        language: str = "python"
    ) -> str:
        """
        Debug code using the Gemini model
        
        Args:
            code: Code with issues
            error_message: Error message or description
            language: Programming language
            
        Returns:
            Debug analysis and fixes
        """
        prompt = f"""
        Please help debug the following {language} code that has this error:
        
        Error: {error_message}
        
        Code:
        ```{language}
        {code}
        ```
        
        Please provide:
        1. Analysis of the problem
        2. Root cause identification
        3. Fixed code
        4. Prevention tips
        """
        
        return await self.generate_text(
            prompt=prompt,
            temperature=0.3,
            top_p=0.9
        )
    
    async def health_check(self) -> Dict[str, Any]:
        """
        Check if the Gemini API is accessible
        
        Returns:
            Health check results
        """
        try:
            # Try a simple generation to test connectivity
            test_prompt = "Hello, this is a test. Please respond with 'OK'."
            response = await self.generate_text(
                prompt=test_prompt,
                temperature=0.1,
                max_output_tokens=10
            )
            
            return {
                "status": "healthy",
                "model": self.model_name,
                "api_key_configured": bool(self.api_key),
                "test_response": response.strip()
            }
        except Exception as e:
            return {
                "status": "unhealthy",
                "model": self.model_name,
                "api_key_configured": bool(self.api_key),
                "error": str(e)
            }


# Global client instance
_gemini_client: Optional[GeminiClient] = None


def get_gemini_client() -> GeminiClient:
    """
    Get the global Gemini client instance
    
    Returns:
        GeminiClient instance
    """
    global _gemini_client
    if _gemini_client is None:
        _gemini_client = GeminiClient()
    return _gemini_client