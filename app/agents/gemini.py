"""Google Gemini AI Agent for MCPIS9"""

import asyncio
import logging
from typing import Dict, List, Optional, Any, Union, Callable
from datetime import datetime
from enum import Enum

from ..clients.gemini import get_gemini_client
from ..core.config import settings

logger = logging.getLogger(__name__)


class AgentTask(Enum):
    """Supported agent task types"""
    CODE_GENERATION = "code_generation"
    CODE_REVIEW = "code_review"
    CODE_EXPLANATION = "code_explanation"
    CODE_OPTIMIZATION = "code_optimization"
    CODE_DEBUG = "code_debug"
    GENERAL_QUESTION = "general_question"
    DOCUMENTATION = "documentation"
    TESTING = "testing"


class GeminiAgent:
    """
    Google Gemini AI Agent
    
    Handles various coding and AI tasks using the Gemini model.
    Supports task routing, context management, and response formatting.
    """
    
    def __init__(self, name: str = "Gemini Agent"):
        """
        Initialize the Gemini agent
        
        Args:
            name: Agent name for identification
        """
        self.name = name
        self.client = get_gemini_client()
        self.task_history: List[Dict[str, Any]] = []
        
        # Task routing map
        self.task_handlers = {
            AgentTask.CODE_GENERATION: self._handle_code_generation,
            AgentTask.CODE_REVIEW: self._handle_code_review,
            AgentTask.CODE_EXPLANATION: self._handle_code_explanation,
            AgentTask.CODE_OPTIMIZATION: self._handle_code_optimization,
            AgentTask.CODE_DEBUG: self._handle_code_debug,
            AgentTask.GENERAL_QUESTION: self._handle_general_question,
            AgentTask.DOCUMENTATION: self._handle_documentation,
            AgentTask.TESTING: self._handle_testing,
        }
        
        logger.info(f"Initialized {self.name}")
    
    async def process_task(
        self,
        task: str,
        context: Optional[Dict[str, Any]] = None,
        task_type: Optional[AgentTask] = None
    ) -> Dict[str, Any]:
        """
        Process a task using the Gemini agent
        
        Args:
            task: Task description or question
            context: Optional context information
            task_type: Optional explicit task type
            
        Returns:
            Task processing result
        """
        start_time = datetime.now()
        
        try:
            # Auto-detect task type if not provided
            if task_type is None:
                task_type = await self._detect_task_type(task)
            
            logger.info(f"Processing {task_type.value} task: {task[:100]}...")
            
            # Get the appropriate handler
            handler = self.task_handlers.get(task_type, self._handle_general_question)
            
            # Process the task
            result = await handler(task, context or {})
            
            # Calculate processing time
            processing_time = (datetime.now() - start_time).total_seconds()
            
            # Create response
            response = {
                "agent": self.name,
                "task_type": task_type.value,
                "task": task,
                "result": result,
                "processing_time": processing_time,
                "timestamp": start_time.isoformat(),
                "status": "success"
            }
            
            # Add to history
            self._add_to_history(response)
            
            return response
            
        except Exception as e:
            logger.error(f"Error processing task: {str(e)}")
            
            error_response = {
                "agent": self.name,
                "task_type": task_type.value if task_type else "unknown",
                "task": task,
                "error": str(e),
                "processing_time": (datetime.now() - start_time).total_seconds(),
                "timestamp": start_time.isoformat(),
                "status": "error"
            }
            
            self._add_to_history(error_response)
            return error_response
    
    async def _detect_task_type(self, task: str) -> AgentTask:
        """
        Detect the type of task based on the description
        
        Args:
            task: Task description
            
        Returns:
            Detected task type
        """
        task_lower = task.lower()
        
        # Keyword-based detection
        if any(keyword in task_lower for keyword in ['generate', 'create', 'write', 'implement', 'build']):
            if any(keyword in task_lower for keyword in ['code', 'function', 'class', 'script', 'program']):
                return AgentTask.CODE_GENERATION
            elif any(keyword in task_lower for keyword in ['test', 'unittest', 'pytest']):
                return AgentTask.TESTING
            elif any(keyword in task_lower for keyword in ['doc', 'documentation', 'readme']):
                return AgentTask.DOCUMENTATION
        
        elif any(keyword in task_lower for keyword in ['review', 'analyze', 'check', 'audit']):
            return AgentTask.CODE_REVIEW
        
        elif any(keyword in task_lower for keyword in ['explain', 'describe', 'what does', 'how does']):
            return AgentTask.CODE_EXPLANATION
        
        elif any(keyword in task_lower for keyword in ['optimize', 'improve', 'faster', 'performance']):
            return AgentTask.CODE_OPTIMIZATION
        
        elif any(keyword in task_lower for keyword in ['debug', 'fix', 'error', 'bug', 'issue']):
            return AgentTask.CODE_DEBUG
        
        elif any(keyword in task_lower for keyword in ['test', 'unittest', 'pytest', 'testing']):
            return AgentTask.TESTING
        
        elif any(keyword in task_lower for keyword in ['document', 'doc', 'readme', 'documentation']):
            return AgentTask.DOCUMENTATION
        
        # Default to general question
        return AgentTask.GENERAL_QUESTION
    
    async def _handle_code_generation(self, task: str, context: Dict[str, Any]) -> str:
        """Handle code generation tasks"""
        language = context.get('language', 'python')
        style_guide = context.get('style_guide')
        additional_context = context.get('context', '')
        
        return await self.client.generate_code(
            task_description=task,
            language=language,
            context=additional_context,
            style_guide=style_guide
        )
    
    async def _handle_code_review(self, task: str, context: Dict[str, Any]) -> str:
        """Handle code review tasks"""
        code = context.get('code', '')
        language = context.get('language', 'python')
        focus_areas = context.get('focus_areas', [])
        
        if not code:
            return "Please provide the code to review in the 'code' context parameter."
        
        return await self.client.review_code(
            code=code,
            language=language,
            focus_areas=focus_areas
        )
    
    async def _handle_code_explanation(self, task: str, context: Dict[str, Any]) -> str:
        """Handle code explanation tasks"""
        code = context.get('code', '')
        language = context.get('language', 'python')
        detail_level = context.get('detail_level', 'detailed')
        
        if not code:
            return "Please provide the code to explain in the 'code' context parameter."
        
        return await self.client.explain_code(
            code=code,
            language=language,
            detail_level=detail_level
        )
    
    async def _handle_code_optimization(self, task: str, context: Dict[str, Any]) -> str:
        """Handle code optimization tasks"""
        code = context.get('code', '')
        language = context.get('language', 'python')
        optimization_type = context.get('optimization_type', 'performance')
        
        if not code:
            return "Please provide the code to optimize in the 'code' context parameter."
        
        return await self.client.optimize_code(
            code=code,
            language=language,
            optimization_type=optimization_type
        )
    
    async def _handle_code_debug(self, task: str, context: Dict[str, Any]) -> str:
        """Handle code debugging tasks"""
        code = context.get('code', '')
        error_message = context.get('error_message', task)
        language = context.get('language', 'python')
        
        if not code:
            return "Please provide the code to debug in the 'code' context parameter."
        
        return await self.client.debug_code(
            code=code,
            error_message=error_message,
            language=language
        )
    
    async def _handle_general_question(self, task: str, context: Dict[str, Any]) -> str:
        """Handle general questions"""
        system_instruction = context.get('system_instruction')
        conversation_context = context.get('conversation_context', [])
        
        return await self.client.generate_text(
            prompt=task,
            system_instruction=system_instruction,
            context=conversation_context
        )
    
    async def _handle_documentation(self, task: str, context: Dict[str, Any]) -> str:
        """Handle documentation tasks"""
        code = context.get('code', '')
        doc_type = context.get('doc_type', 'comprehensive')
        
        if code:
            prompt = f"""
            Create {doc_type} documentation for the following code:
            
            ```
            {code}
            ```
            
            Task: {task}
            
            Include:
            - Overview and purpose
            - Usage examples
            - Parameters and return values
            - Error handling
            - Best practices
            """
        else:
            prompt = f"""
            Create {doc_type} documentation for: {task}
            
            Include:
            - Clear explanations
            - Examples where appropriate
            - Best practices
            - Common pitfalls
            """
        
        return await self.client.generate_text(
            prompt=prompt,
            temperature=0.3,
            top_p=0.9
        )
    
    async def _handle_testing(self, task: str, context: Dict[str, Any]) -> str:
        """Handle testing tasks"""
        code = context.get('code', '')
        language = context.get('language', 'python')
        test_framework = context.get('test_framework', 'pytest')
        
        if code:
            prompt = f"""
            Generate comprehensive {test_framework} tests for the following {language} code:
            
            ```{language}
            {code}
            ```
            
            Task: {task}
            
            Include:
            - Unit tests for all functions/methods
            - Edge case testing
            - Error condition testing
            - Mock usage where appropriate
            - Test fixtures if needed
            """
        else:
            prompt = f"""
            Create {test_framework} tests for: {task}
            
            Language: {language}
            
            Include comprehensive test coverage and best practices.
            """
        
        return await self.client.generate_code(
            task_description=prompt,
            language=language,
            context=f"Using {test_framework} testing framework"
        )
    
    def _add_to_history(self, response: Dict[str, Any]) -> None:
        """Add response to task history"""
        self.task_history.append(response)
        
        # Keep only last 100 entries
        if len(self.task_history) > 100:
            self.task_history = self.task_history[-100:]
    
    def get_history(self, limit: int = 10) -> List[Dict[str, Any]]:
        """
        Get task history
        
        Args:
            limit: Number of recent entries to return
            
        Returns:
            List of recent task history entries
        """
        return self.task_history[-limit:]
    
    def clear_history(self) -> None:
        """Clear task history"""
        self.task_history.clear()
        logger.info(f"Cleared history for {self.name}")
    
    async def health_check(self) -> Dict[str, Any]:
        """
        Perform health check
        
        Returns:
            Health check results
        """
        client_health = await self.client.health_check()
        
        return {
            "agent": self.name,
            "client_health": client_health,
            "task_history_count": len(self.task_history),
            "supported_tasks": [task.value for task in AgentTask],
            "timestamp": datetime.now().isoformat()
        }


# Global agent instance
_gemini_agent: Optional[GeminiAgent] = None


def get_gemini_agent() -> GeminiAgent:
    """
    Get the global Gemini agent instance
    
    Returns:
        GeminiAgent instance
    """
    global _gemini_agent
    if _gemini_agent is None:
        _gemini_agent = GeminiAgent()
    return _gemini_agent


async def main():
    """
    Main entry point for the Gemini agent CLI
    """
    import argparse
    import json
    
    parser = argparse.ArgumentParser(description="MCPIS9 Gemini Agent")
    parser.add_argument("task", help="Task description or question")
    parser.add_argument("--context", help="JSON context for the task")
    parser.add_argument("--task-type", help="Explicit task type")
    parser.add_argument("--language", default="python", help="Programming language")
    parser.add_argument("--verbose", action="store_true", help="Verbose output")
    
    args = parser.parse_args()
    
    # Setup logging
    logging.basicConfig(
        level=logging.DEBUG if args.verbose else logging.INFO,
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    )
    
    # Parse context
    context = {}
    if args.context:
        try:
            context = json.loads(args.context)
        except json.JSONDecodeError:
            print(f"Invalid JSON context: {args.context}")
            return
    
    # Add language to context
    context['language'] = args.language
    
    # Parse task type
    task_type = None
    if args.task_type:
        try:
            task_type = AgentTask(args.task_type)
        except ValueError:
            print(f"Invalid task type: {args.task_type}")
            print(f"Available types: {[t.value for t in AgentTask]}")
            return
    
    # Create agent and process task
    agent = get_gemini_agent()
    
    try:
        result = await agent.process_task(
            task=args.task,
            context=context,
            task_type=task_type
        )
        
        if result["status"] == "success":
            print(f"\n{result['result']}")
        else:
            print(f"Error: {result['error']}")
            
    except Exception as e:
        print(f"Error: {str(e)}")


if __name__ == "__main__":
    asyncio.run(main())