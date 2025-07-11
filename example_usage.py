"""Example usage of MCPIS9 Gemini Agent"""

import asyncio
import os
from app.agents.gemini import get_gemini_agent, AgentTask


async def main():
    """Example usage of the Gemini agent"""
    
    # Set up environment (you would normally set these in .env file)
    if not os.getenv("GEMINI_API_KEY"):
        print("❌ GEMINI_API_KEY not set in environment")
        print("Please set your Gemini API key:")
        print("export GEMINI_API_KEY='your_api_key_here'")
        return
    
    # Get the agent
    agent = get_gemini_agent()
    
    print("🚀 MCPIS9 Gemini Agent Demo")
    print("=" * 50)
    
    # Example 1: Code Generation
    print("\n1️⃣ Code Generation Example")
    print("-" * 30)
    
    result = await agent.process_task(
        "Create a Python function to calculate the factorial of a number",
        context={"language": "python"}
    )
    
    if result["status"] == "success":
        print(f"✅ Generated code:")
        print(result["result"])
    else:
        print(f"❌ Error: {result['error']}")
    
    # Example 2: Code Review
    print("\n2️⃣ Code Review Example")
    print("-" * 30)
    
    code_to_review = """
def divide_numbers(a, b):
    return a / b
"""
    
    result = await agent.process_task(
        "Review this code for potential issues",
        context={
            "code": code_to_review,
            "language": "python",
            "focus_areas": ["error_handling", "edge_cases"]
        }
    )
    
    if result["status"] == "success":
        print(f"✅ Review results:")
        print(result["result"])
    else:
        print(f"❌ Error: {result['error']}")
    
    # Example 3: Code Explanation
    print("\n3️⃣ Code Explanation Example")
    print("-" * 30)
    
    code_to_explain = """
def quicksort(arr):
    if len(arr) <= 1:
        return arr
    pivot = arr[len(arr) // 2]
    left = [x for x in arr if x < pivot]
    middle = [x for x in arr if x == pivot]
    right = [x for x in arr if x > pivot]
    return quicksort(left) + middle + quicksort(right)
"""
    
    result = await agent.process_task(
        "Explain how this quicksort algorithm works",
        context={
            "code": code_to_explain,
            "language": "python",
            "detail_level": "detailed"
        }
    )
    
    if result["status"] == "success":
        print(f"✅ Explanation:")
        print(result["result"])
    else:
        print(f"❌ Error: {result['error']}")
    
    # Example 4: General Question
    print("\n4️⃣ General Question Example")
    print("-" * 30)
    
    result = await agent.process_task(
        "What are the main differences between Python lists and tuples?"
    )
    
    if result["status"] == "success":
        print(f"✅ Answer:")
        print(result["result"])
    else:
        print(f"❌ Error: {result['error']}")
    
    # Example 5: Debugging Help
    print("\n5️⃣ Debugging Example")
    print("-" * 30)
    
    buggy_code = """
def calculate_average(numbers):
    total = sum(numbers)
    return total / len(numbers)
"""
    
    result = await agent.process_task(
        "This function crashes with an empty list. Help me fix it.",
        context={
            "code": buggy_code,
            "error_message": "ZeroDivisionError: division by zero",
            "language": "python"
        }
    )
    
    if result["status"] == "success":
        print(f"✅ Debug solution:")
        print(result["result"])
    else:
        print(f"❌ Error: {result['error']}")
    
    # Show task history
    print("\n📊 Task History")
    print("-" * 30)
    
    history = agent.get_history(limit=3)
    for i, task in enumerate(history, 1):
        print(f"{i}. {task['task_type']}: {task['task'][:50]}...")
        print(f"   Status: {task['status']}, Time: {task['processing_time']:.2f}s")
    
    print(f"\n🎉 Demo completed! Processed {len(history)} tasks total.")
    
    # Health check
    print("\n🏥 Health Check")
    print("-" * 30)
    
    health = await agent.health_check()
    print(f"Agent Status: {health['client_health']['status']}")
    print(f"Model: {health['client_health']['model']}")
    print(f"API Key Configured: {health['client_health']['api_key_configured']}")


if __name__ == "__main__":
    asyncio.run(main())