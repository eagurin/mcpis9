"""Command Line Interface for MCPIS9 Agents"""

import asyncio
import json
import logging
from typing import Optional, Dict, Any, List

import click
from rich.console import Console
from rich.table import Table
from rich.panel import Panel
from rich.text import Text

from .agents.gemini import get_gemini_agent, AgentTask
from .agents.github import get_github_orchestrator
from .core.config import settings

console = Console()
logger = logging.getLogger(__name__)


@click.group()
@click.option('--verbose', '-v', is_flag=True, help='Enable verbose logging')
@click.option('--config', '-c', help='Configuration file path')
def cli(verbose: bool, config: Optional[str]):
    """MCPIS9 Agent Command Line Interface"""
    level = logging.DEBUG if verbose else logging.INFO
    logging.basicConfig(
        level=level,
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    )
    
    if config:
        # TODO: Load custom configuration
        pass


@cli.group()
def agent():
    """Agent commands"""
    pass


@agent.command()
@click.argument('task')
@click.option('--agent-type', '-t', type=click.Choice(['gemini', 'claude']), default='gemini', help='Agent type to use')
@click.option('--language', '-l', default='python', help='Programming language')
@click.option('--code', help='Code content for analysis/review')
@click.option('--context', help='JSON context for the task')
@click.option('--task-type', type=click.Choice([t.value for t in AgentTask]), help='Explicit task type')
@click.option('--output-format', type=click.Choice(['text', 'json']), default='text', help='Output format')
def ask(task: str, agent_type: str, language: str, code: Optional[str], context: Optional[str], 
        task_type: Optional[str], output_format: str):
    """Ask an agent to perform a task"""
    async def _ask():
        try:
            # Parse context
            ctx = {'language': language}
            if context:
                try:
                    ctx.update(json.loads(context))
                except json.JSONDecodeError:
                    console.print(f"[red]Invalid JSON context: {context}[/red]")
                    return
            
            # Add code to context if provided
            if code:
                ctx['code'] = code
            
            # Parse task type
            task_type_enum = None
            if task_type:
                task_type_enum = AgentTask(task_type)
            
            # Currently only Gemini is implemented
            if agent_type == 'gemini':
                agent = get_gemini_agent()
                result = await agent.process_task(
                    task=task,
                    context=ctx,
                    task_type=task_type_enum
                )
            else:
                result = {
                    "status": "error",
                    "error": f"Agent type '{agent_type}' not yet implemented"
                }
            
            # Display result
            if output_format == 'json':
                console.print(json.dumps(result, indent=2))
            else:
                if result["status"] == "success":
                    console.print(Panel(
                        result["result"],
                        title=f"[green]{result['agent']} Response[/green]",
                        border_style="green"
                    ))
                    console.print(f"[dim]Processing time: {result['processing_time']:.2f}s[/dim]")
                else:
                    console.print(Panel(
                        result["error"],
                        title=f"[red]Error[/red]",
                        border_style="red"
                    ))
                    
        except Exception as e:
            console.print(f"[red]Error: {str(e)}[/red]")
    
    asyncio.run(_ask())


@agent.command()
@click.option('--agent-type', '-t', type=click.Choice(['gemini', 'claude']), help='Specific agent to check')
@click.option('--output-format', type=click.Choice(['text', 'json']), default='text', help='Output format')
def health(agent_type: Optional[str], output_format: str):
    """Check agent health status"""
    async def _health():
        try:
            results = {}
            
            # Check specific agent or all agents
            if agent_type == 'gemini' or agent_type is None:
                agent = get_gemini_agent()
                results['gemini'] = await agent.health_check()
            
            if agent_type == 'claude' or agent_type is None:
                # TODO: Implement Claude agent health check
                results['claude'] = {
                    "status": "not_implemented",
                    "message": "Claude agent not yet implemented"
                }
            
            # Display results
            if output_format == 'json':
                console.print(json.dumps(results, indent=2))
            else:
                for name, result in results.items():
                    status = result.get('status', 'unknown')
                    color = 'green' if status == 'healthy' else 'red' if status == 'unhealthy' else 'yellow'
                    
                    console.print(f"\n[bold]{name.title()} Agent[/bold]")
                    console.print(f"Status: [{color}]{status}[/{color}]")
                    
                    if 'client_health' in result:
                        client_health = result['client_health']
                        console.print(f"Model: {client_health.get('model', 'unknown')}")
                        console.print(f"API Key: {'✓' if client_health.get('api_key_configured') else '✗'}")
                        
                        if 'test_response' in client_health:
                            console.print(f"Test Response: {client_health['test_response']}")
                    
                    if 'error' in result:
                        console.print(f"[red]Error: {result['error']}[/red]")
                        
        except Exception as e:
            console.print(f"[red]Error: {str(e)}[/red]")
    
    asyncio.run(_health())


@agent.command()
@click.option('--agent-type', '-t', type=click.Choice(['gemini', 'claude']), default='gemini', help='Agent type')
@click.option('--limit', '-l', default=10, help='Number of entries to show')
@click.option('--output-format', type=click.Choice(['text', 'json']), default='text', help='Output format')
def history(agent_type: str, limit: int, output_format: str):
    """Show agent task history"""
    async def _history():
        try:
            if agent_type == 'gemini':
                agent = get_gemini_agent()
                history_data = agent.get_history(limit)
            else:
                console.print(f"[red]Agent type '{agent_type}' not yet implemented[/red]")
                return
            
            if output_format == 'json':
                console.print(json.dumps(history_data, indent=2))
            else:
                if not history_data:
                    console.print("[dim]No history available[/dim]")
                    return
                
                table = Table(title=f"{agent_type.title()} Agent History")
                table.add_column("Timestamp", style="cyan")
                table.add_column("Task Type", style="magenta")
                table.add_column("Status", style="green")
                table.add_column("Task", style="white", max_width=50)
                table.add_column("Processing Time", style="yellow")
                
                for entry in history_data:
                    status_color = "green" if entry["status"] == "success" else "red"
                    table.add_row(
                        entry.get("timestamp", "")[:19],  # Show only date and time
                        entry.get("task_type", ""),
                        f"[{status_color}]{entry.get('status', '')}[/{status_color}]",
                        entry.get("task", "")[:100],  # Truncate long tasks
                        f"{entry.get('processing_time', 0):.2f}s"
                    )
                
                console.print(table)
                
        except Exception as e:
            console.print(f"[red]Error: {str(e)}[/red]")
    
    asyncio.run(_history())


@cli.group()
def github():
    """GitHub orchestrator commands"""
    pass


@github.command()
@click.option('--output-format', type=click.Choice(['text', 'json']), default='text', help='Output format')
def health(output_format: str):
    """Check GitHub orchestrator health"""
    async def _health():
        try:
            orchestrator = get_github_orchestrator()
            result = await orchestrator.health_check()
            
            if output_format == 'json':
                console.print(json.dumps(result, indent=2))
            else:
                console.print(f"[bold]GitHub Orchestrator Health[/bold]")
                
                # GitHub API status
                github_status = result.get('github_api', {})
                status = github_status.get('status', 'unknown')
                color = 'green' if status == 'healthy' else 'red'
                
                console.print(f"GitHub API: [{color}]{status}[/{color}]")
                if 'user' in github_status:
                    console.print(f"User: {github_status['user']}")
                if 'rate_limit' in github_status:
                    console.print(f"Rate Limit: {github_status['rate_limit']}")
                
                # Agent status
                agent_health = result.get('gemini_agent', {})
                agent_status = agent_health.get('client_health', {}).get('status', 'unknown')
                agent_color = 'green' if agent_status == 'healthy' else 'red'
                console.print(f"Gemini Agent: [{agent_color}]{agent_status}[/{agent_color}]")
                
        except Exception as e:
            console.print(f"[red]Error: {str(e)}[/red]")
    
    asyncio.run(_health())


@github.command()
@click.argument('repository')
@click.argument('task')
@click.option('--file-patterns', '-p', multiple=True, default=['*.py'], help='File patterns to process')
@click.option('--output-format', type=click.Choice(['text', 'json']), default='text', help='Output format')
def process_repo(repository: str, task: str, file_patterns: List[str], output_format: str):
    """Process files in a repository"""
    async def _process():
        try:
            orchestrator = get_github_orchestrator()
            result = await orchestrator.process_repository_files(
                repo_name=repository,
                file_patterns=list(file_patterns),
                task_description=task
            )
            
            if output_format == 'json':
                console.print(json.dumps(result, indent=2))
            else:
                if result["status"] == "success":
                    console.print(f"[green]✓ Processed {len(result['processed_files'])} files[/green]")
                    console.print(f"Repository: {result['repository']}")
                    console.print(f"Files: {', '.join(result['processed_files'])}")
                else:
                    console.print(f"[red]✗ Error: {result['error']}[/red]")
                    
        except Exception as e:
            console.print(f"[red]Error: {str(e)}[/red]")
    
    asyncio.run(_process())


@cli.command()
@click.option('--output-format', type=click.Choice(['text', 'json']), default='text', help='Output format')
def config(output_format: str):
    """Show current configuration"""
    config_dict = {
        "gemini": {
            "api_key_configured": bool(settings.GEMINI_API_KEY),
            "model": settings.GEMINI_MODEL,
            "temperature": settings.GEMINI_TEMPERATURE,
            "max_tokens": settings.GEMINI_MAX_TOKENS,
        },
        "anthropic": {
            "api_key_configured": bool(settings.ANTHROPIC_API_KEY),
            "model": settings.ANTHROPIC_MODEL,
            "temperature": settings.ANTHROPIC_TEMPERATURE,
            "max_tokens": settings.ANTHROPIC_MAX_TOKENS,
        },
        "github": {
            "token_configured": bool(settings.GITHUB_TOKEN),
            "repository": settings.GITHUB_REPO,
        },
        "api": {
            "host": settings.API_HOST,
            "port": settings.API_PORT,
            "debug": settings.API_DEBUG,
        }
    }
    
    if output_format == 'json':
        console.print(json.dumps(config_dict, indent=2))
    else:
        console.print("[bold]MCPIS9 Configuration[/bold]\n")
        
        for section, values in config_dict.items():
            console.print(f"[cyan]{section.upper()}[/cyan]")
            for key, value in values.items():
                if key.endswith('_configured'):
                    status = "✓" if value else "✗"
                    color = "green" if value else "red"
                    console.print(f"  {key}: [{color}]{status}[/{color}]")
                else:
                    console.print(f"  {key}: {value}")
            console.print()


@cli.command()
@click.option('--examples', '-e', is_flag=True, help='Show usage examples')
def help(examples: bool):
    """Show help information"""
    console.print(Panel(
        """
MCPIS9 Agent CLI - AI-powered code assistant

Available commands:
• agent ask          - Ask an agent to perform a task
• agent health       - Check agent health status
• agent history      - Show agent task history
• github health      - Check GitHub orchestrator health
• github process-repo - Process files in a repository
• config             - Show current configuration
        """,
        title="MCPIS9 Help",
        border_style="blue"
    ))
    
    if examples:
        console.print(Panel(
            """
Example usage:

# Ask Gemini to generate code
mcpis9 agent ask "Create a function to calculate fibonacci numbers" --language python

# Review code
mcpis9 agent ask "Review this code for bugs" --code "def add(a, b): return a + b"

# Process a repository
mcpis9 github process-repo owner/repo "Add docstrings to all functions"

# Check health
mcpis9 agent health
mcpis9 github health

# View configuration
mcpis9 config
            """,
            title="Examples",
            border_style="green"
        ))


def main():
    """Main entry point for the CLI"""
    cli()


if __name__ == "__main__":
    main()