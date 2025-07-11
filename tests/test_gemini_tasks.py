"""Test tasks for Gemini agent - Examples of how to use the agent"""

import pytest
from unittest.mock import Mock, AsyncMock, patch

from app.agents.gemini import GeminiAgent, AgentTask


class TestGeminiAgentTasks:
    """Test suite showing real-world usage of the Gemini agent"""
    
    @pytest.fixture
    def mock_gemini_agent(self):
        """Mock Gemini agent with realistic responses"""
        agent = GeminiAgent("Test Agent")
        
        # Mock the client with realistic responses
        mock_client = Mock()
        
        # Code generation response
        mock_client.generate_code = AsyncMock(return_value='''def fibonacci(n):
    """Calculate fibonacci number using dynamic programming"""
    if n <= 1:
        return n
    
    a, b = 0, 1
    for _ in range(2, n + 1):
        a, b = b, a + b
    return b''')
        
        # Code review response
        mock_client.review_code = AsyncMock(return_value='''**Code Review Results:**

**Positive aspects:**
- Function handles base cases correctly
- Simple and readable implementation

**Issues identified:**
1. **Missing error handling** - Function doesn't handle negative inputs
2. **Missing type hints** - No type annotations for parameters and return value
3. **Performance** - Recursive implementation has O(2^n) time complexity

**Recommendations:**
1. Add input validation for negative numbers
2. Add type hints: `def fibonacci(n: int) -> int:`
3. Consider iterative implementation for better performance
4. Add docstring explaining the function's purpose

**Security:** No security issues found.
**Performance:** Consider memoization or iterative approach for large inputs.''')
        
        # Code explanation response
        mock_client.explain_code = AsyncMock(return_value='''**Code Explanation:**

This function calculates the nth Fibonacci number using recursion.

**How it works:**
1. **Base cases**: If n is 0 or 1, return n directly
2. **Recursive case**: Return the sum of the previous two Fibonacci numbers

**Time complexity**: O(2^n) - exponential
**Space complexity**: O(n) - due to recursion stack

**Example execution for fibonacci(5):**
- fibonacci(5) = fibonacci(4) + fibonacci(3)
- fibonacci(4) = fibonacci(3) + fibonacci(2)
- And so on...

**Use cases:**
- Mathematical calculations
- Algorithm demonstrations
- Educational purposes

**Note:** This implementation is inefficient for large numbers due to repeated calculations.''')
        
        # Code optimization response
        mock_client.optimize_code = AsyncMock(return_value='''**Optimized Code:**

```python
def fibonacci(n: int) -> int:
    """Calculate fibonacci number using iterative approach"""
    if n < 0:
        raise ValueError("Fibonacci is not defined for negative numbers")
    if n <= 1:
        return n
    
    a, b = 0, 1
    for _ in range(2, n + 1):
        a, b = b, a + b
    return b
```

**Optimizations made:**
1. **Time complexity**: Reduced from O(2^n) to O(n)
2. **Space complexity**: Reduced from O(n) to O(1)
3. **Input validation**: Added check for negative numbers
4. **Type hints**: Added for better code documentation
5. **Iterative approach**: Eliminates recursion overhead

**Performance improvement:**
- Original: 2^n operations
- Optimized: n operations
- For fibonacci(30): ~1 billion operations → 30 operations

**Expected improvements:**
- Dramatically faster execution for large numbers
- No stack overflow risk
- Better memory usage''')
        
        # Debug response
        mock_client.debug_code = AsyncMock(return_value='''**Debug Analysis:**

**Problem identified:**
The function has a division by zero error when the denominator is 0.

**Root cause:**
The function doesn't validate the input parameters before performing division.

**Fixed code:**
```python
def calculate_average(numbers):
    """Calculate the average of a list of numbers"""
    if not numbers:
        raise ValueError("Cannot calculate average of empty list")
    
    total = sum(numbers)
    return total / len(numbers)
```

**Prevention tips:**
1. Always validate input parameters
2. Handle edge cases (empty lists, None values)
3. Use descriptive error messages
4. Consider using type hints for better code documentation
5. Add unit tests to catch these issues early

**Additional improvements:**
- Add type hints: `def calculate_average(numbers: List[float]) -> float:`
- Consider using `statistics.mean()` from the standard library
- Add docstring explaining the function's purpose''')
        
        # General question response
        mock_client.generate_text = AsyncMock(return_value='''Python is a high-level, interpreted programming language known for its simplicity and readability. Here are key aspects:

**Key Features:**
- **Readable syntax**: Uses indentation to define code blocks
- **Interpreted**: No compilation step needed
- **Dynamic typing**: Variables don't need explicit type declarations
- **Versatile**: Used for web development, data science, AI/ML, automation

**Popular use cases:**
- Web development (Django, Flask)
- Data science and machine learning (pandas, scikit-learn, TensorFlow)
- Automation and scripting
- Scientific computing

**Advantages:**
- Easy to learn and use
- Large ecosystem of libraries
- Strong community support
- Cross-platform compatibility

**Example:**
```python
# Simple Python code
def greet(name):
    return f"Hello, {name}!"

print(greet("World"))  # Output: Hello, World!
```''')
        
        agent.client = mock_client
        return agent
    
    @pytest.mark.asyncio
    async def test_code_generation_task(self, mock_gemini_agent):
        """Test code generation task"""
        result = await mock_gemini_agent.process_task(
            "Create an efficient fibonacci function in Python",
            context={"language": "python"}
        )
        
        assert result["status"] == "success"
        assert result["task_type"] == AgentTask.CODE_GENERATION.value
        assert "def fibonacci" in result["result"]
        assert "dynamic programming" in result["result"]
    
    @pytest.mark.asyncio
    async def test_code_review_task(self, mock_gemini_agent):
        """Test code review task"""
        code = '''def fibonacci(n):
    if n <= 1:
        return n
    return fibonacci(n-1) + fibonacci(n-2)'''
        
        result = await mock_gemini_agent.process_task(
            "Review this fibonacci implementation for performance and best practices",
            context={"code": code, "language": "python"}
        )
        
        assert result["status"] == "success"
        assert result["task_type"] == AgentTask.CODE_REVIEW.value
        assert "Missing error handling" in result["result"]
        assert "type hints" in result["result"]
        assert "Performance" in result["result"]
    
    @pytest.mark.asyncio
    async def test_code_explanation_task(self, mock_gemini_agent):
        """Test code explanation task"""
        code = '''def fibonacci(n):
    if n <= 1:
        return n
    return fibonacci(n-1) + fibonacci(n-2)'''
        
        result = await mock_gemini_agent.process_task(
            "Explain how this fibonacci function works",
            context={"code": code, "language": "python"}
        )
        
        assert result["status"] == "success"
        assert result["task_type"] == AgentTask.CODE_EXPLANATION.value
        assert "recursion" in result["result"]
        assert "Time complexity" in result["result"]
        assert "Base cases" in result["result"]
    
    @pytest.mark.asyncio
    async def test_code_optimization_task(self, mock_gemini_agent):
        """Test code optimization task"""
        code = '''def fibonacci(n):
    if n <= 1:
        return n
    return fibonacci(n-1) + fibonacci(n-2)'''
        
        result = await mock_gemini_agent.process_task(
            "Optimize this fibonacci function for better performance",
            context={"code": code, "language": "python"}
        )
        
        assert result["status"] == "success"
        assert result["task_type"] == AgentTask.CODE_OPTIMIZATION.value
        assert "iterative approach" in result["result"]
        assert "O(n)" in result["result"]
        assert "Type hints" in result["result"]
    
    @pytest.mark.asyncio
    async def test_debug_task(self, mock_gemini_agent):
        """Test debugging task"""
        code = '''def calculate_average(numbers):
    total = 0
    for num in numbers:
        total += num
    return total / len(numbers)'''
        
        result = await mock_gemini_agent.process_task(
            "Debug this function - it fails with empty lists",
            context={
                "code": code,
                "error_message": "ZeroDivisionError: division by zero",
                "language": "python"
            }
        )
        
        assert result["status"] == "success"
        assert result["task_type"] == AgentTask.CODE_DEBUG.value
        assert "division by zero" in result["result"]
        assert "empty list" in result["result"]
        assert "ValueError" in result["result"]
    
    @pytest.mark.asyncio
    async def test_general_question_task(self, mock_gemini_agent):
        """Test general question task"""
        result = await mock_gemini_agent.process_task(
            "What is Python and what are its main use cases?"
        )
        
        assert result["status"] == "success"
        assert result["task_type"] == AgentTask.GENERAL_QUESTION.value
        assert "high-level" in result["result"]
        assert "interpreted" in result["result"]
        assert "use cases" in result["result"]
    
    @pytest.mark.asyncio
    async def test_documentation_task(self, mock_gemini_agent):
        """Test documentation generation task"""
        # Mock documentation response
        mock_gemini_agent.client.generate_text = AsyncMock(return_value='''# Fibonacci Function Documentation

## Overview
This module provides an efficient implementation of the Fibonacci sequence calculator.

## Functions

### `fibonacci(n: int) -> int`
Calculate the nth Fibonacci number using dynamic programming.

**Parameters:**
- `n` (int): The position in the Fibonacci sequence (0-indexed)

**Returns:**
- `int`: The nth Fibonacci number

**Raises:**
- `ValueError`: If n is negative

**Example:**
```python
>>> fibonacci(10)
55
>>> fibonacci(0)
0
>>> fibonacci(1)
1
```

**Time Complexity:** O(n)
**Space Complexity:** O(1)

## Best Practices
- Always validate input parameters
- Use descriptive variable names
- Include comprehensive docstrings
- Handle edge cases appropriately''')
        
        code = '''def fibonacci(n):
    if n <= 1:
        return n
    a, b = 0, 1
    for _ in range(2, n + 1):
        a, b = b, a + b
    return b'''
        
        result = await mock_gemini_agent.process_task(
            "Create comprehensive documentation for this fibonacci function",
            context={"code": code, "language": "python"}
        )
        
        assert result["status"] == "success"
        assert result["task_type"] == AgentTask.DOCUMENTATION.value
        assert "Documentation" in result["result"]
        assert "Parameters" in result["result"]
        assert "Returns" in result["result"]
        assert "Example" in result["result"]
    
    @pytest.mark.asyncio
    async def test_testing_task(self, mock_gemini_agent):
        """Test test generation task"""
        # Mock test generation response
        mock_gemini_agent.client.generate_code = AsyncMock(return_value='''import pytest
from fibonacci import fibonacci

class TestFibonacci:
    """Test suite for fibonacci function"""
    
    def test_fibonacci_base_cases(self):
        """Test base cases"""
        assert fibonacci(0) == 0
        assert fibonacci(1) == 1
    
    def test_fibonacci_small_numbers(self):
        """Test small fibonacci numbers"""
        assert fibonacci(2) == 1
        assert fibonacci(3) == 2
        assert fibonacci(4) == 3
        assert fibonacci(5) == 5
    
    def test_fibonacci_larger_numbers(self):
        """Test larger fibonacci numbers"""
        assert fibonacci(10) == 55
        assert fibonacci(15) == 610
        assert fibonacci(20) == 6765
    
    def test_fibonacci_negative_input(self):
        """Test negative input handling"""
        with pytest.raises(ValueError):
            fibonacci(-1)
        with pytest.raises(ValueError):
            fibonacci(-10)
    
    def test_fibonacci_edge_cases(self):
        """Test edge cases"""
        # Test with various inputs
        test_cases = [
            (6, 8),
            (7, 13),
            (8, 21),
            (9, 34)
        ]
        
        for n, expected in test_cases:
            assert fibonacci(n) == expected
    
    @pytest.mark.parametrize("n,expected", [
        (0, 0), (1, 1), (2, 1), (3, 2), (4, 3),
        (5, 5), (6, 8), (7, 13), (8, 21), (9, 34)
    ])
    def test_fibonacci_parametrized(self, n, expected):
        """Parametrized test for fibonacci function"""
        assert fibonacci(n) == expected''')
        
        code = '''def fibonacci(n):
    if n < 0:
        raise ValueError("Fibonacci not defined for negative numbers")
    if n <= 1:
        return n
    a, b = 0, 1
    for _ in range(2, n + 1):
        a, b = b, a + b
    return b'''
        
        result = await mock_gemini_agent.process_task(
            "Generate comprehensive pytest tests for this fibonacci function",
            context={"code": code, "language": "python", "test_framework": "pytest"}
        )
        
        assert result["status"] == "success"
        assert result["task_type"] == AgentTask.TESTING.value
        assert "import pytest" in result["result"]
        assert "test_fibonacci" in result["result"]
        assert "parametrize" in result["result"]
        assert "raises" in result["result"]
    
    @pytest.mark.asyncio
    async def test_context_handling(self, mock_gemini_agent):
        """Test that context is properly handled"""
        result = await mock_gemini_agent.process_task(
            "Create a REST API endpoint",
            context={
                "language": "python",
                "framework": "fastapi",
                "additional_requirements": "Include error handling and validation"
            }
        )
        
        assert result["status"] == "success"
        # Context should be passed to the underlying client
        mock_gemini_agent.client.generate_code.assert_called_once()
        
        # Check that context was passed correctly
        call_args = mock_gemini_agent.client.generate_code.call_args
        assert call_args[1]["language"] == "python"
        assert call_args[1]["context"] == "Include error handling and validation"
    
    @pytest.mark.asyncio
    async def test_task_history_tracking(self, mock_gemini_agent):
        """Test that task history is properly tracked"""
        # Process multiple tasks
        tasks = [
            "Create a function to calculate factorial",
            "Review a sorting algorithm",
            "Explain how binary search works"
        ]
        
        for task in tasks:
            await mock_gemini_agent.process_task(task)
        
        # Check history
        history = mock_gemini_agent.get_history()
        assert len(history) == 3
        
        # Check that tasks are in history
        task_texts = [entry["task"] for entry in history]
        for task in tasks:
            assert task in task_texts
    
    @pytest.mark.asyncio
    async def test_explicit_task_type_override(self, mock_gemini_agent):
        """Test that explicit task type overrides automatic detection"""
        # Task that would normally be detected as code generation
        # but we explicitly set it as code review
        result = await mock_gemini_agent.process_task(
            "create a function to parse JSON",
            context={"code": "def parse_json(data): return json.loads(data)"},
            task_type=AgentTask.CODE_REVIEW
        )
        
        assert result["status"] == "success"
        assert result["task_type"] == AgentTask.CODE_REVIEW.value
        # Should have called review_code instead of generate_code
        mock_gemini_agent.client.review_code.assert_called_once()
        mock_gemini_agent.client.generate_code.assert_not_called()


class TestGeminiAgentErrorHandling:
    """Test error handling in Gemini agent"""
    
    @pytest.mark.asyncio
    async def test_missing_code_for_review(self):
        """Test handling when code is missing for review task"""
        agent = GeminiAgent("Test Agent")
        
        result = await agent.process_task(
            "review this code",
            context={"language": "python"},
            task_type=AgentTask.CODE_REVIEW
        )
        
        assert result["status"] == "success"
        assert "provide the code" in result["result"].lower()
    
    @pytest.mark.asyncio
    async def test_missing_code_for_explanation(self):
        """Test handling when code is missing for explanation task"""
        agent = GeminiAgent("Test Agent")
        
        result = await agent.process_task(
            "explain this code",
            context={"language": "python"},
            task_type=AgentTask.CODE_EXPLANATION
        )
        
        assert result["status"] == "success"
        assert "provide the code" in result["result"].lower()
    
    @pytest.mark.asyncio
    async def test_client_error_handling(self):
        """Test handling of client errors"""
        agent = GeminiAgent("Test Agent")
        
        # Mock client to raise exception
        mock_client = Mock()
        mock_client.generate_text = AsyncMock(side_effect=Exception("API Error"))
        agent.client = mock_client
        
        result = await agent.process_task("test question")
        
        assert result["status"] == "error"
        assert "API Error" in result["error"]
        assert "processing_time" in result
        assert "timestamp" in result