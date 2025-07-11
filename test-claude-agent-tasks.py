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
class DataProcessor:
    def __init__(self, data_source):
        self.data_source = data_source
        self.processed_data = None

    def load_data(self):
        # Simulated data loading
        return [1, 2, 3, 4, 5]

    def process(self, operation):
        data = self.load_data()
        if operation == "sum":
            return sum(data)
        if operation == "average":
            return sum(data) / len(data)
        if operation == "max":
            return max(data)
        return None


# Task 6: Security review
# @claude Review this code for security vulnerabilities and suggest fixes
def get_user_data(user_id):
    import sqlite3

    conn = sqlite3.connect("users.db")
    cursor = conn.cursor()

    # Dangerous SQL query
    query = f"SELECT * FROM users WHERE id = {user_id}"
    cursor.execute(query)

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
        data = await response.json()
        return data


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
