"""GitHub Agent Orchestrator for MCPIS9"""

import asyncio
import logging
import re
from typing import Dict, List, Optional, Any, Union
from datetime import datetime
from enum import Enum

from github import Github
from github.Repository import Repository
from github.Issue import Issue
from github.PullRequest import PullRequest

from .gemini import get_gemini_agent, AgentTask
from ..core.config import settings

logger = logging.getLogger(__name__)


class GitHubEventType(Enum):
    """GitHub event types supported by the orchestrator"""
    ISSUE_CREATED = "issue_created"
    ISSUE_COMMENT = "issue_comment"
    PULL_REQUEST_CREATED = "pull_request_created"
    PULL_REQUEST_COMMENT = "pull_request_comment"
    PUSH = "push"
    RELEASE = "release"


class GitHubAgentOrchestrator:
    """
    GitHub Agent Orchestrator
    
    Handles GitHub events and routes them to appropriate AI agents
    based on trigger patterns and context.
    """
    
    def __init__(self, github_token: Optional[str] = None):
        """
        Initialize the GitHub orchestrator
        
        Args:
            github_token: GitHub personal access token
        """
        self.github_token = github_token or settings.GITHUB_TOKEN
        if not self.github_token:
            raise ValueError("GitHub token is required")
        
        self.github = Github(self.github_token)
        self.gemini_agent = get_gemini_agent()
        
        # Agent trigger patterns
        self.trigger_patterns = {
            r'@agent\s+gemini': 'gemini',
            r'@agent\s+claude': 'claude',
            r'@agent(?:\s|$)': 'default',  # Default to gemini
            r'@gemini': 'gemini',
            r'@claude': 'claude',
        }
        
        logger.info("Initialized GitHub Agent Orchestrator")
    
    async def handle_event(
        self,
        event_type: GitHubEventType,
        payload: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Handle a GitHub event
        
        Args:
            event_type: Type of GitHub event
            payload: Event payload data
            
        Returns:
            Processing result
        """
        start_time = datetime.now()
        
        try:
            logger.info(f"Handling {event_type.value} event")
            
            # Extract trigger information
            trigger_info = self._extract_trigger_info(payload)
            
            if not trigger_info:
                return {
                    "status": "ignored",
                    "reason": "No agent trigger found",
                    "event_type": event_type.value,
                    "timestamp": start_time.isoformat()
                }
            
            # Route to appropriate agent
            response = await self._route_to_agent(
                event_type=event_type,
                payload=payload,
                trigger_info=trigger_info
            )
            
            # Post response back to GitHub if needed
            if response.get("status") == "success" and trigger_info.get("should_respond", True):
                await self._post_response(payload, response, trigger_info)
            
            processing_time = (datetime.now() - start_time).total_seconds()
            response["processing_time"] = processing_time
            
            return response
            
        except Exception as e:
            logger.error(f"Error handling GitHub event: {str(e)}")
            return {
                "status": "error",
                "error": str(e),
                "event_type": event_type.value,
                "processing_time": (datetime.now() - start_time).total_seconds(),
                "timestamp": start_time.isoformat()
            }
    
    def _extract_trigger_info(self, payload: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """
        Extract agent trigger information from the payload
        
        Args:
            payload: GitHub event payload
            
        Returns:
            Trigger information or None if no trigger found
        """
        # Extract text content based on event type
        text_content = ""
        
        if "comment" in payload:
            text_content = payload["comment"].get("body", "")
        elif "issue" in payload:
            text_content = payload["issue"].get("body", "") or payload["issue"].get("title", "")
        elif "pull_request" in payload:
            text_content = payload["pull_request"].get("body", "") or payload["pull_request"].get("title", "")
        
        if not text_content:
            return None
        
        # Check for trigger patterns
        for pattern, agent_type in self.trigger_patterns.items():
            match = re.search(pattern, text_content, re.IGNORECASE)
            if match:
                # Extract the task (text after the trigger)
                task_start = match.end()
                task = text_content[task_start:].strip()
                
                return {
                    "agent_type": agent_type if agent_type != "default" else "gemini",
                    "trigger_pattern": pattern,
                    "task": task,
                    "full_text": text_content,
                    "should_respond": True
                }
        
        return None
    
    async def _route_to_agent(
        self,
        event_type: GitHubEventType,
        payload: Dict[str, Any],
        trigger_info: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Route the task to the appropriate agent
        
        Args:
            event_type: GitHub event type
            payload: Event payload
            trigger_info: Trigger information
            
        Returns:
            Agent response
        """
        agent_type = trigger_info["agent_type"]
        task = trigger_info["task"]
        
        # Build context from GitHub payload
        context = self._build_context(event_type, payload)
        
        # Currently only Gemini is implemented
        if agent_type == "gemini":
            return await self.gemini_agent.process_task(
                task=task,
                context=context
            )
        elif agent_type == "claude":
            # TODO: Implement Claude agent integration
            return {
                "status": "error",
                "error": "Claude agent not yet implemented",
                "agent": "claude"
            }
        else:
            return {
                "status": "error",
                "error": f"Unknown agent type: {agent_type}",
                "agent": agent_type
            }
    
    def _build_context(
        self,
        event_type: GitHubEventType,
        payload: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Build context information from GitHub payload
        
        Args:
            event_type: GitHub event type
            payload: Event payload
            
        Returns:
            Context dictionary
        """
        context = {
            "event_type": event_type.value,
            "repository": payload.get("repository", {}).get("full_name", ""),
            "sender": payload.get("sender", {}).get("login", ""),
            "timestamp": datetime.now().isoformat()
        }
        
        # Add event-specific context
        if event_type in [GitHubEventType.ISSUE_CREATED, GitHubEventType.ISSUE_COMMENT]:
            issue = payload.get("issue", {})
            context.update({
                "issue_number": issue.get("number"),
                "issue_title": issue.get("title"),
                "issue_body": issue.get("body"),
                "issue_state": issue.get("state"),
                "issue_labels": [label.get("name") for label in issue.get("labels", [])]
            })
        
        elif event_type in [GitHubEventType.PULL_REQUEST_CREATED, GitHubEventType.PULL_REQUEST_COMMENT]:
            pr = payload.get("pull_request", {})
            context.update({
                "pr_number": pr.get("number"),
                "pr_title": pr.get("title"),
                "pr_body": pr.get("body"),
                "pr_state": pr.get("state"),
                "pr_base_branch": pr.get("base", {}).get("ref"),
                "pr_head_branch": pr.get("head", {}).get("ref")
            })
        
        return context
    
    async def _post_response(
        self,
        payload: Dict[str, Any],
        response: Dict[str, Any],
        trigger_info: Dict[str, Any]
    ) -> None:
        """
        Post agent response back to GitHub
        
        Args:
            payload: Original GitHub payload
            response: Agent response
            trigger_info: Trigger information
        """
        try:
            repo_name = payload.get("repository", {}).get("full_name")
            if not repo_name:
                logger.warning("No repository information in payload")
                return
            
            repo = self.github.get_repo(repo_name)
            
            # Format response
            formatted_response = self._format_response(response, trigger_info)
            
            # Post comment based on event type
            if "issue" in payload:
                issue = repo.get_issue(payload["issue"]["number"])
                issue.create_comment(formatted_response)
                logger.info(f"Posted response to issue #{payload['issue']['number']}")
            
            elif "pull_request" in payload:
                pr = repo.get_pull(payload["pull_request"]["number"])
                pr.create_issue_comment(formatted_response)
                logger.info(f"Posted response to PR #{payload['pull_request']['number']}")
            
        except Exception as e:
            logger.error(f"Error posting response to GitHub: {str(e)}")
    
    def _format_response(
        self,
        response: Dict[str, Any],
        trigger_info: Dict[str, Any]
    ) -> str:
        """
        Format agent response for GitHub
        
        Args:
            response: Agent response
            trigger_info: Trigger information
            
        Returns:
            Formatted response string
        """
        agent_name = response.get("agent", "AI Agent")
        
        if response.get("status") == "success":
            result = response.get("result", "")
            processing_time = response.get("processing_time", 0)
            
            formatted = f"""## {agent_name} Response

{result}

---
*Processing time: {processing_time:.2f}s*
"""
        else:
            error = response.get("error", "Unknown error")
            formatted = f"""## {agent_name} Response

❌ **Error:** {error}

---
*Please check the task format and try again.*
"""
        
        return formatted
    
    async def process_repository_files(
        self,
        repo_name: str,
        file_patterns: List[str],
        task_description: str
    ) -> Dict[str, Any]:
        """
        Process files in a repository
        
        Args:
            repo_name: Repository name (owner/repo)
            file_patterns: List of file patterns to process
            task_description: Description of the task to perform
            
        Returns:
            Processing results
        """
        try:
            repo = self.github.get_repo(repo_name)
            results = {}
            
            # Get repository contents
            contents = repo.get_contents("")
            
            # Process matching files
            for content in contents:
                if content.type == "file":
                    # Check if file matches patterns
                    if any(re.match(pattern, content.name) for pattern in file_patterns):
                        # Get file content
                        file_content = content.decoded_content.decode('utf-8')
                        
                        # Process with Gemini agent
                        context = {
                            "code": file_content,
                            "filename": content.name,
                            "repository": repo_name,
                            "file_path": content.path
                        }
                        
                        result = await self.gemini_agent.process_task(
                            task=task_description,
                            context=context
                        )
                        
                        results[content.name] = result
            
            return {
                "status": "success",
                "repository": repo_name,
                "processed_files": list(results.keys()),
                "results": results
            }
            
        except Exception as e:
            logger.error(f"Error processing repository files: {str(e)}")
            return {
                "status": "error",
                "error": str(e),
                "repository": repo_name
            }
    
    async def health_check(self) -> Dict[str, Any]:
        """
        Perform health check
        
        Returns:
            Health check results
        """
        try:
            # Check GitHub API access
            user = self.github.get_user()
            github_status = {
                "status": "healthy",
                "user": user.login,
                "rate_limit": self.github.get_rate_limit().core.remaining
            }
        except Exception as e:
            github_status = {
                "status": "unhealthy",
                "error": str(e)
            }
        
        # Check agent health
        agent_health = await self.gemini_agent.health_check()
        
        return {
            "orchestrator": "GitHub Agent Orchestrator",
            "github_api": github_status,
            "gemini_agent": agent_health,
            "supported_events": [event.value for event in GitHubEventType],
            "trigger_patterns": list(self.trigger_patterns.keys()),
            "timestamp": datetime.now().isoformat()
        }


# Global orchestrator instance
_github_orchestrator: Optional[GitHubAgentOrchestrator] = None


def get_github_orchestrator() -> GitHubAgentOrchestrator:
    """
    Get the global GitHub orchestrator instance
    
    Returns:
        GitHubAgentOrchestrator instance
    """
    global _github_orchestrator
    if _github_orchestrator is None:
        _github_orchestrator = GitHubAgentOrchestrator()
    return _github_orchestrator


async def main():
    """
    Main entry point for the GitHub orchestrator CLI
    """
    import argparse
    import json
    
    parser = argparse.ArgumentParser(description="MCPIS9 GitHub Agent Orchestrator")
    parser.add_argument("--health-check", action="store_true", help="Perform health check")
    parser.add_argument("--process-repo", help="Process repository files")
    parser.add_argument("--file-patterns", nargs="+", default=["*.py"], help="File patterns to process")
    parser.add_argument("--task", help="Task description")
    parser.add_argument("--verbose", action="store_true", help="Verbose output")
    
    args = parser.parse_args()
    
    # Setup logging
    logging.basicConfig(
        level=logging.DEBUG if args.verbose else logging.INFO,
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    )
    
    orchestrator = get_github_orchestrator()
    
    try:
        if args.health_check:
            result = await orchestrator.health_check()
            print(json.dumps(result, indent=2))
        
        elif args.process_repo:
            if not args.task:
                print("Task description is required for repository processing")
                return
            
            result = await orchestrator.process_repository_files(
                repo_name=args.process_repo,
                file_patterns=args.file_patterns,
                task_description=args.task
            )
            print(json.dumps(result, indent=2))
        
        else:
            print("Please specify --health-check or --process-repo")
            
    except Exception as e:
        print(f"Error: {str(e)}")


if __name__ == "__main__":
    asyncio.run(main())