# MCPIS9

MCP (Model Context Protocol) implementation with GitHub Agent Orchestrator for AI-powered automation workflows.

## Overview

MCPIS9 is a Python-based MCP server that integrates with GitHub and AI services to provide intelligent automation capabilities. Built with modern Python 3.12+ and FastAPI, it offers:

- **MCP Protocol 1.10.1+** implementation for AI agent communication
- **GitHub Agent Orchestration** for automated repository operations
- **Multi-AI Support** with Claude (Anthropic) and Gemini integrations
- **Async-first Architecture** with FastAPI and Redis caching
- **Enterprise-ready** with comprehensive testing and security scanning

## Virtual IT Company Architecture

This project implements a virtual IT company with specialized AI agents:

- **Project Manager** - Issue triage and workflow coordination
- **Tech Lead** - Technical analysis and architecture decisions
- **Developer** - Code implementation using Gemini AI
- **QA Engineer** - Testing and quality assurance
- **DevOps** - Deployment and monitoring

## Quick Start

### Prerequisites

- Python 3.12 or higher
- Redis server (for caching)
- GitHub token (for GitHub operations)
- API keys for AI services (Anthropic, Google Gemini)

### Installation

1. Clone the repository:

```bash
git clone https://github.com/eagurin/mcpis9.git
cd mcpis9
```

2. Set up the development environment:

```bash
make setup    # Install UV package manager
make install  # Install all dependencies
```

3. Configure environment variables:

```bash
cp .env.example .env
# Edit .env with your API keys and configuration
```

4. Run the development server:

```bash
make run
# or
uvicorn app.main:app --reload --port 8000
```

## Available Commands

### Development Environment

```bash
make setup          # Install UV and set up environment
make install        # Install all dependencies
make dev           # Install with development dependencies
```

### Code Quality

```bash
make lint          # Run ruff linting
make fix           # Auto-fix linting issues
make types         # Run pyright type checking
make security      # Run bandit security scanning
make check         # Run all quality checks
```

### Testing

```bash
make test          # Run all tests
make test-fast     # Run tests without coverage
make test-watch    # Run tests in watch mode
make coverage      # Generate coverage reports
```

### Other Commands

```bash
make format        # Code formatting
make clean         # Clean cache and temporary files
```

## CLI Applications

MCPIS9 provides three CLI entry points:

- **`mcpis9-server`** - Main MCP server application
- **`github-orchestrator`** - GitHub agent orchestration tool
- **`agent-cli`** - General-purpose CLI interface

## Configuration

### Environment Variables

Create a `.env` file with the following variables:

```env
# GitHub Integration
GITHUB_TOKEN=your_github_token

# AI Services
ANTHROPIC_API_KEY=your_anthropic_key
GEMINI_API_KEY=your_gemini_key

# Redis Configuration
REDIS_URL=redis://localhost:6379

# Application Settings
LOG_LEVEL=INFO
ENV=development
```

### Settings Management

Configuration is handled through `app/core/config.py` using Pydantic settings:

- Type-safe environment variable loading
- Validation and default values
- Centralized configuration management

## Architecture

### Project Structure

```
mcpis9/
├── app/                    # Main application code
│   ├── core/              # Core functionality
│   │   └── config.py      # Configuration management
│   ├── main.py            # FastAPI entry point
│   └── ...
├── tests/                 # Test suite
├── agent_codebases/       # Integrated agent codebases
│   ├── claude-code-action/
│   ├── claude-code-base-action/
│   └── gemini-cli-action/
├── pyproject.toml         # Project configuration
└── Makefile              # Development commands
```

### Technology Stack

- **FastAPI** - Async web framework with automatic OpenAPI documentation
- **Pydantic** - Data validation and settings management
- **Redis** - Caching and session management
- **PyGithub** - GitHub API integration
- **Anthropic SDK** - Claude AI integration
- **HTTPX** - Modern async HTTP client
- **Rich** - Enhanced CLI output
- **MCP** - Model Context Protocol

### AI Agent Integration

- **Claude Code Action** - For analysis and review roles (Tech Lead, QA)
- **Gemini CLI Action** - For code generation (Developer)
- **GitHub API** - For repository operations and communication
- **Event-driven architecture** - GitHub webhooks for seamless handoffs

## Development Workflow

### Pre-commit Hooks

The project uses pre-commit for automated quality checks:

```bash
pre-commit install  # Set up hooks
pre-commit run --all-files  # Run all checks
```

Hooks include:

- Security scanning (GitLeaks, Bandit)
- Code formatting (Ruff)
- Type checking (Pyright)
- File validation (YAML, JSON, TOML)

### Code Standards

- **Line length**: 100 characters
- **Python version**: 3.12+ features encouraged
- **Type annotations**: Required for all functions
- **Async patterns**: Used throughout the codebase
- **Test coverage**: Minimum 80% required

### Testing

```bash
# Run unit tests
pytest tests/unit

# Run integration tests
pytest tests/integration

# Run with coverage
pytest --cov=app --cov-report=html
```

## GitHub Actions Integration

The repository includes pre-configured GitHub Actions workflows for:

- Code review automation
- Issue triage
- PR management
- CI/CD pipelines

See `agent_codebases/` for integrated GitHub Actions:

- `claude-code-action` - Claude-powered code reviews
- `claude-code-base-action` - Claude base actions
- `gemini-cli-action` - Gemini integration

## Features

- Complete software development lifecycle automation
- AI-powered code generation and review
- Automated testing and quality assurance
- GitHub integration with proper status tracking
- Modern Python stack (UV, Ruff, Pyright)
- Docker support for deployment

## Security

- All dependencies are pinned to specific versions
- Regular security scanning with Bandit
- Pre-commit hooks for security checks
- Automated dependency updates

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

Please ensure:

- All tests pass (`make test`)
- Code quality checks pass (`make check`)
- Coverage remains above 80%

## License

This project is licensed under the GNU General Public License v2.0 - see the [LICENSE](LICENSE) file for details.

## Project Status

MCPIS9 is in early-stage development with:

- ✅ Well-configured development environment
- ✅ Core infrastructure and foundations
- 🚧 MCP protocol implementation (in progress)
- 🚧 GitHub agent orchestration (in progress)
- 📋 Additional AI integrations (planned)

## Links

- **Homepage**: [https://github.com/eagurin/mcpis9](https://github.com/eagurin/mcpis9)
- **Issues**: [https://github.com/eagurin/mcpis9/issues](https://github.com/eagurin/mcpis9/issues)
- **Documentation**: See [CLAUDE.md](CLAUDE.md) for AI assistant instructions

---

**Powered by AI Agents** - The Future of Software Development
