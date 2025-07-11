"""
Test tasks for Claude agent - Diverse scenarios to test agent capabilities
"""


# Task 1: Basic code analysis
# @claude Please analyze the function below and suggest improvements for performance and readability
def inefficient_fibonacci(n):
    if n <= 1:
        return n
    return inefficient_fibonacci(n - 1) + inefficient_fibonacci(n - 2)


# Task 2: Bug fixing
# @claude This function has a bug. Can you identify and fix it?
def calculate_average(numbers):
    total = 0
    for num in numbers:
        total += num
    return total / len(numbers)  # What happens with empty list?


# Task 3: Code refactoring
# @claude Refactor this class to follow SOLID principles and improve maintainability
class UserManager:
    def __init__(self):
        self.users = []

    def add_user(self, name, email, role):
        user = {"name": name, "email": email, "role": role}
        self.users.append(user)
        # Send email
        print(f"Sending welcome email to {email}")
        # Log action
        print(f"User {name} added to system")
        # Update statistics
        print(f"Total users: {len(self.users)}")

    def delete_user(self, email):
        self.users = [u for u in self.users if u["email"] != email]
        # Send email
        print(f"Sending goodbye email to {email}")
        # Log action
        print(f"User with email {email} removed")
        # Update statistics
        print(f"Total users: {len(self.users)}")


# Task 4: Test generation
# @claude Generate comprehensive unit tests for this function using pytest
def validate_email(email: str) -> bool:
    """Validate email format"""
    import re

    pattern = r"^[\w\.-]+@[\w\.-]+\.\w+$"
    return bool(re.match(pattern, email))


# Task 5: Documentation
# @claude Add comprehensive docstrings and type hints to this class
from typing import Any, List, Optional, Union


class DataProcessor:
    """A comprehensive data processing class for handling various data operations.
    
    This class provides a flexible interface for loading data from various sources
    and performing common data processing operations such as sum, average, and max.
    
    Attributes:
        data_source: The source of data to process (can be file path, URL, or data object)
        processed_data: Cached result of the last processing operation
        
    Example:
        >>> processor = DataProcessor("data.csv")
        >>> result = processor.process("sum")
        >>> print(result)  # Output: 15
        
        >>> processor = DataProcessor({"type": "database", "table": "users"})
        >>> avg_result = processor.process("average")
        >>> print(avg_result)  # Output: 3.0
    """
    
    def __init__(self, data_source: Union[str, dict, List[Any]]) -> None:
        """Initialize the DataProcessor with a data source.
        
        Args:
            data_source: The source of data to process. Can be:
                - str: File path or URL to data source
                - dict: Configuration dictionary for data source
                - List[Any]: Direct data list to process
                
        Example:
            >>> # Initialize with file path
            >>> processor = DataProcessor("data.csv")
            
            >>> # Initialize with configuration
            >>> processor = DataProcessor({"type": "api", "endpoint": "https://api.com/data"})
            
            >>> # Initialize with direct data
            >>> processor = DataProcessor([1, 2, 3, 4, 5])
        """
        self.data_source: Union[str, dict, List[Any]] = data_source
        self.processed_data: Optional[Union[int, float]] = None

    def load_data(self) -> List[Union[int, float]]:
        """Load data from the configured data source.
        
        This method simulates loading data from various sources. In a real implementation,
        this would handle different data source types (files, APIs, databases, etc.).
        
        Returns:
            List[Union[int, float]]: A list of numeric data points loaded from the source.
            
        Raises:
            ValueError: If the data source is invalid or cannot be loaded.
            IOError: If there's an error reading from the data source.
            
        Example:
            >>> processor = DataProcessor("data.csv")
            >>> data = processor.load_data()
            >>> print(data)  # Output: [1, 2, 3, 4, 5]
        """
        # Simulated data loading - in practice, this would handle different source types
        return [1, 2, 3, 4, 5]

    def process(self, operation: str) -> Optional[Union[int, float]]:
        """Process the loaded data using the specified operation.
        
        Performs mathematical operations on the loaded data and caches the result.
        Supported operations include sum, average, and max.
        
        Args:
            operation: The operation to perform on the data. Supported values:
                - "sum": Calculate the sum of all values
                - "average": Calculate the arithmetic mean
                - "max": Find the maximum value
                
        Returns:
            Optional[Union[int, float]]: The result of the operation, or None if
            the operation is not supported.
            
        Raises:
            ValueError: If the operation is not supported.
            ZeroDivisionError: If calculating average on empty data.
            
        Example:
            >>> processor = DataProcessor("data.csv")
            >>> sum_result = processor.process("sum")
            >>> print(sum_result)  # Output: 15
            
            >>> avg_result = processor.process("average")
            >>> print(avg_result)  # Output: 3.0
            
            >>> max_result = processor.process("max")
            >>> print(max_result)  # Output: 5
            
            >>> invalid_result = processor.process("invalid")
            >>> print(invalid_result)  # Output: None
        """
        data = self.load_data()
        
        if operation == "sum":
            self.processed_data = sum(data)
            return self.processed_data
        elif operation == "average":
            if len(data) == 0:
                raise ZeroDivisionError("Cannot calculate average of empty data")
            self.processed_data = sum(data) / len(data)
            return self.processed_data
        elif operation == "max":
            if len(data) == 0:
                raise ValueError("Cannot find maximum of empty data")
            self.processed_data = max(data)
            return self.processed_data
        else:
            return None


# Task 6: Security review
# @claude Review this code for security vulnerabilities and suggest fixes
def get_user_data(user_id):
    import sqlite3

    conn = sqlite3.connect("users.db")
    cursor = conn.cursor()

    # Dangerous SQL query
    query = "SELECT * FROM users WHERE id = ?"
    cursor.execute(query, (user_id,))

    result = cursor.fetchone()
    conn.close()
    return result


# Task 7: Performance optimization
# @claude Optimize this function for better performance with large datasets
def find_duplicates(items):
    duplicates = []
    for i in range(len(items)):
        for j in range(i + 1, len(items)):
            if items[i] == items[j] and items[i] not in duplicates:
                duplicates.append(items[i])
    return duplicates


# Task 8: API design
# @claude Design a RESTful API endpoint for this functionality using FastAPI
def manage_tasks():
    # Current implementation as simple functions
    tasks = []

    def create_task(title, description, priority):
        task = {
            "id": len(tasks) + 1,
            "title": title,
            "description": description,
            "priority": priority,
            "completed": False,
        }
        tasks.append(task)
        return task

    def update_task(task_id, completed):
        for task in tasks:
            if task["id"] == task_id:
                task["completed"] = completed
                return task
        return None


# Task 9: Error handling
# @claude Improve error handling in this async function
async def fetch_data_from_api(url):
    import aiohttp

    async with aiohttp.ClientSession() as session:
        response = await session.get(url)
        return await response.json()


# Task 10: Code explanation
# @claude Explain what this decorator does and provide usage examples
def retry_on_failure(max_retries=3, delay=1):
    def decorator(func):
        def wrapper(*args, **kwargs):
            import time

            for attempt in range(max_retries):
                try:
                    return func(*args, **kwargs)
                except Exception:
                    if attempt == max_retries - 1:
                        raise
                    time.sleep(delay)
            return None

        return wrapper

    return decorator
