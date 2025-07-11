"""
Sample PR file for testing Claude code review workflow
This file contains various code patterns to test review capabilities
"""

import ast
import logging
from pathlib import Path
from typing import Any

import requests

# Potential issue: Global mutable state
CACHE = {}


class UserService:
    """Service for managing users"""

    def __init__(self, db_connection):
        self.db = db_connection
        self.logger = logging.getLogger(__name__)

    # Potential issue: SQL injection vulnerability
    def get_user(self, user_id: int) -> dict[str, Any]:
        query = "SELECT * FROM users WHERE id = ?"
        return self.db.execute(query, (user_id,))

    # Potential issue: No input validation
    def create_user(self, user_data: dict) -> dict:
        # Missing validation
        username = user_data["username"]
        email = user_data["email"]
        password = user_data["password"]  # Stored in plain text!

        # Potential issue: Race condition
        if username in CACHE:
            return CACHE[username]

        user = {"username": username, "email": email, "password": password}

        CACHE[username] = user
        return user

    # Potential issue: Inefficient algorithm
    def find_similar_users(self, target_user: str, all_users: list[str]) -> list[str]:
        similar = []
        for user in all_users:
            similarity = 0
            for i in range(len(user)):
                for j in range(len(target_user)):
                    if user[i] == target_user[j]:
                        similarity += 1
            if similarity > 3:
                similar.append(user)
        return similar

    # Potential issue: Poor error handling
    async def sync_users(self, external_api_url: str):
        response = requests.get(external_api_url, timeout=5)
        users = response.json()

        for user in users:
            self.create_user(user)

    # Potential issue: Resource leak
    def export_users(self, filename: str):
        with Path(filename).open("w") as file:
            users = self.db.execute("SELECT * FROM users")
            for user in users:
                file.write(str(user))

    # Potential issue: Hardcoded credentials
    def connect_to_service(self):
        api_key = "sk-test-example-key"  # Example key for testing
        secret = "example-secret-key"  # Example secret for testing

        return self._authenticate(api_key, secret)

    def _authenticate(self, api_key: str, secret: str):
        # Placeholder for authentication logic
        return True

    # Potential issue: Infinite recursion risk
    def process_user_tree(self, user, depth=0):
        if user.get("children"):
            for child in user["children"]:
                self.process_user_tree(child, depth + 1)
        return depth


# Potential issue: Thread safety
class Counter:
    def __init__(self):
        self.count = 0

    def increment(self):
        # Not thread-safe
        temp = self.count
        temp += 1
        self.count = temp


# Potential issue: Memory leak
class EventManager:
    def __init__(self):
        self.handlers = []

    def register(self, handler):
        self.handlers.append(handler)
        # No way to unregister handlers


# Test function with multiple issues
def process_data(data: list[Any]) -> dict[str, Any]:
    # No type checking
    result = {}

    # Using eval - security risk
    for item in data:
        if isinstance(item, str):
            value = ast.literal_eval(item)
            result[item] = value

    # Catching too broad exception
    try:
        # Some risky operation
        pass  # Placeholder for risky_operation()
    except Exception as e:
        logging.error(f"An error occurred: {e}")

    return result


# Async function with issues
async def fetch_all_data(urls: list[str]):
    # Not using asyncio properly
    results = []
    for url in urls:
        # Should use aiohttp instead
        response = requests.get(url, timeout=5)  # Blocking call in async function
        results.append(response.json())
    return results


# Configuration with issues
class Config:
    DEBUG = True  # Should not be True in production
    SECRET_KEY = "change-this"  # Weak secret
    DATABASE_URL = "postgresql://user:password@localhost/db"  # Credentials in code

    # Using mutable default argument
    def __init__(self, settings=None):
        self.settings = settings if settings is not None else {}
