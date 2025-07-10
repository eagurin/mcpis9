# 🛠️ Modern Makefile for Backend Python App (2025)
# Based on UV + Ruff + Pyright + Pre-commit best practices

.DEFAULT_GOAL := help
.PHONY: help setup install dev clean lint test coverage run fix check security docker docs release all

# 🔧 Configuration
PYTHON := python3
UV := uv
PROJECT_NAME := mcpisia
SRC_DIR := app
TESTS_DIR := tests
DOCKER_IMAGE := $(PROJECT_NAME):latest

# 🎨 Colors for output
RESET := \033[0m
BOLD := \033[1m
RED := \033[31m
GREEN := \033[32m
YELLOW := \033[33m
BLUE := \033[34m
MAGENTA := \033[35m
CYAN := \033[36m

# 📋 Help command with emojis and sections
help:
	@echo "$(BOLD)$(CYAN)🪝 $(PROJECT_NAME) - Modern Development Workflow$(RESET)"
	@echo ""
	@echo "$(BOLD)📦 Installation & Setup:$(RESET)"
	@echo "  $(GREEN)setup$(RESET)           - 🚀 Complete project setup (UV + deps + pre-commit)"
	@echo "  $(GREEN)install$(RESET)         - 📥 Install production dependencies"
	@echo "  $(GREEN)dev$(RESET)             - 🔧 Install development dependencies"
	@echo "  $(GREEN)clean$(RESET)           - 🧹 Clean cache and temporary files"
	@echo ""
	@echo "$(BOLD)✅ Code Quality (2025 Stack):$(RESET)"
	@echo "  $(GREEN)check$(RESET)           - 🔍 Run all checks (lint + types + security + tests)"
	@echo "  $(GREEN)lint$(RESET)            - 🎯 Lint code with Ruff"
	@echo "  $(GREEN)types$(RESET)           - 🔬 Type check with Pyright"
	@echo "  $(GREEN)security$(RESET)        - 🔒 Security scan (GitLeaks + Bandit)"
	@echo "  $(GREEN)format$(RESET)          - ✨ Format code with Ruff"
	@echo "  $(GREEN)pre-commit$(RESET)      - 🪝 Run pre-commit on all files"
	@echo ""
	@echo "$(BOLD)🧪 Testing:$(RESET)"
	@echo "  $(GREEN)test$(RESET)            - 🚀 Run tests with pytest"
	@echo "  $(GREEN)test-fast$(RESET)       - ⚡ Run fast tests only"
	@echo "  $(GREEN)test-watch$(RESET)      - 👀 Run tests in watch mode"
	@echo "  $(GREEN)coverage$(RESET)        - 📊 Generate coverage report"
	@echo ""
	@echo "$(BOLD)🐳 Docker:$(RESET)"
	@echo "  $(GREEN)docker-build$(RESET)    - 🏗️  Build Docker image"
	@echo "  $(GREEN)docker-run$(RESET)      - 🚀 Run Docker container"
	@echo "  $(GREEN)docker-clean$(RESET)    - 🧹 Clean Docker artifacts"
	@echo ""
	@echo "$(BOLD)📚 Documentation:$(RESET)"
	@echo "  $(GREEN)docs$(RESET)            - 📖 Generate documentation"
	@echo "  $(GREEN)docs-serve$(RESET)      - 🌐 Serve docs locally"
	@echo ""
	@echo "$(BOLD)🚀 Deployment:$(RESET)"
	@echo "  $(GREEN)run$(RESET)             - 🏃 Run development server"
	@echo "  $(GREEN)run-prod$(RESET)        - 🏭 Run production server"
	@echo "  $(GREEN)release$(RESET)         - 🎉 Create new release (with Commitizen)"
	@echo ""
	@echo "$(BOLD)🎯 Workflows:$(RESET)"
	@echo "  $(GREEN)fix$(RESET)             - 🔧 Auto-fix all issues (format + lint --fix)"
	@echo "  $(GREEN)ci$(RESET)              - 🤖 Run CI pipeline locally"
	@echo "  $(GREEN)all$(RESET)             - 🎪 Full workflow (clean + install + check + test)"

# ==================== 📦 INSTALLATION & SETUP ====================

setup: install-uv install-deps install-pre-commit
	@echo "$(GREEN)✅ Project setup complete!$(RESET)"

install-uv:
	@echo "$(CYAN)📦 Installing UV package manager...$(RESET)"
	@command -v uv >/dev/null 2>&1 || curl -LsSf https://astral.sh/uv/install.sh | sh

install: install-deps

install-deps:
	@echo "$(CYAN)📥 Installing dependencies...$(RESET)"
	$(UV) sync

dev: install-deps
	@echo "$(CYAN)🔧 Installing development dependencies...$(RESET)"
	$(UV) sync --group dev

install-pre-commit:
	@echo "$(CYAN)🪝 Installing pre-commit hooks...$(RESET)"
	$(UV) run pre-commit install
	$(UV) run pre-commit install --hook-type commit-msg

clean:
	@echo "$(YELLOW)🧹 Cleaning cache and temporary files...$(RESET)"
	rm -rf build/ dist/ *.egg-info/ .coverage htmlcov/ .pytest_cache/ .ruff_cache/ .mypy_cache/
	find . -type d -name "__pycache__" -exec rm -rf {} + 2>/dev/null || true
	find . -type f -name "*.pyc" -delete
	find . -type f -name "*.pyo" -delete
	find . -type f -name "*.pyd" -delete
	find . -type f -name ".coverage" -delete
	find . -type d -name "*.egg-info" -exec rm -rf {} + 2>/dev/null || true

# ==================== ✅ CODE QUALITY (2025 STACK) ====================

# 🎯 Modern all-in-one check command
check: lint types security test-fast
	@echo "$(GREEN)✅ All checks passed!$(RESET)"

# 🎯 Linting with modern Ruff (replaces Flake8, Black, isort, pyupgrade)
lint:
	@echo "$(CYAN)🎯 Linting with Ruff...$(RESET)"
	$(UV) run ruff check $(SRC_DIR) $(TESTS_DIR)

# 🔬 Type checking with Pyright (faster than MyPy)
types:
	@echo "$(CYAN)🔬 Type checking with Pyright...$(RESET)"
	$(UV) run pyright $(SRC_DIR) $(TESTS_DIR)

# 🔒 Security scanning
security:
	@echo "$(CYAN)🔒 Running security scans...$(RESET)"
	@echo "  🔍 Scanning for secrets with GitLeaks..."
	$(UV) run gitleaks detect --source . --verbose
	@echo "  🛡️  Scanning for vulnerabilities with Bandit..."
	$(UV) run bandit -r $(SRC_DIR) -ll -f txt

# ✨ Code formatting
format:
	@echo "$(CYAN)✨ Formatting code with Ruff...$(RESET)"
	$(UV) run ruff format $(SRC_DIR) $(TESTS_DIR)

# 🔧 Auto-fix issues
fix:
	@echo "$(CYAN)🔧 Auto-fixing issues...$(RESET)"
	$(UV) run ruff check --fix $(SRC_DIR) $(TESTS_DIR)
	$(UV) run ruff format $(SRC_DIR) $(TESTS_DIR)

# 🪝 Pre-commit hooks
pre-commit:
	@echo "$(CYAN)🪝 Running pre-commit hooks...$(RESET)"
	$(UV) run pre-commit run --all-files

pre-commit-update:
	@echo "$(CYAN)🔄 Updating pre-commit hooks...$(RESET)"
	$(UV) run pre-commit autoupdate

# ==================== 🧪 TESTING ====================

test:
	@echo "$(CYAN)🧪 Running tests...$(RESET)"
	$(UV) run pytest $(TESTS_DIR) -v

test-fast:
	@echo "$(CYAN)⚡ Running fast tests...$(RESET)"
	$(UV) run pytest $(TESTS_DIR) -x --ff -q

test-watch:
	@echo "$(CYAN)👀 Running tests in watch mode...$(RESET)"
	$(UV) run pytest-watch -- $(TESTS_DIR)

coverage:
	@echo "$(CYAN)📊 Generating coverage report...$(RESET)"
	$(UV) run pytest $(TESTS_DIR) --cov=$(SRC_DIR) --cov-report=html --cov-report=term-missing
	@echo "$(GREEN)📊 Coverage report: htmlcov/index.html$(RESET)"

# ==================== 🐳 DOCKER ====================

docker-build:
	@echo "$(CYAN)🏗️  Building Docker image...$(RESET)"
	docker build -t $(DOCKER_IMAGE) .

docker-run:
	@echo "$(CYAN)🚀 Running Docker container...$(RESET)"
	docker run -p 8000:8000 --env-file .env $(DOCKER_IMAGE)

docker-clean:
	@echo "$(YELLOW)🧹 Cleaning Docker artifacts...$(RESET)"
	docker system prune -f
	docker image prune -f

# ==================== 📚 DOCUMENTATION ====================

docs:
	@echo "$(CYAN)📖 Generating documentation...$(RESET)"
	$(UV) run mkdocs build

docs-serve:
	@echo "$(CYAN)🌐 Serving documentation locally...$(RESET)"
	$(UV) run mkdocs serve

# ==================== 🚀 RUNNING & DEPLOYMENT ====================

run:
	@echo "$(CYAN)🏃 Starting development server...$(RESET)"
	@if [ -f .env ]; then \
		export $$(grep -v '^#' .env | xargs -0) && \
		HOST=$${API_HOST:-0.0.0.0} && \
		PORT=$${API_PORT:-8000} && \
		echo "$(GREEN)🚀 Server running on $$HOST:$$PORT$(RESET)" && \
		$(UV) run uvicorn $(SRC_DIR).main:app --host $$HOST --port $$PORT --reload; \
	else \
		echo "$(YELLOW)⚠️  .env file not found. Using defaults.$(RESET)" && \
		$(UV) run uvicorn $(SRC_DIR).main:app --host 0.0.0.0 --port 8000 --reload; \
	fi

run-prod:
	@echo "$(CYAN)🏭 Starting production server...$(RESET)"
	$(UV) run uvicorn $(SRC_DIR).main:app --host 0.0.0.0 --port 8000 --workers 4

# 🎉 Release management with Commitizen
release:
	@echo "$(CYAN)🎉 Creating new release...$(RESET)"
	$(UV) run cz bump --changelog

release-dry:
	@echo "$(CYAN)🔍 Dry run release...$(RESET)"
	$(UV) run cz bump --dry-run

# ==================== 🎯 WORKFLOWS ====================

# 🤖 CI pipeline simulation
ci: clean install check coverage
	@echo "$(GREEN)✅ CI pipeline completed successfully!$(RESET)"

# 🎪 Complete development workflow
all: clean install check test coverage
	@echo "$(GREEN)🎉 All tasks completed successfully!$(RESET)"

# 📊 Project status
status:
	@echo "$(BOLD)$(CYAN)📊 Project Status$(RESET)"
	@echo "$(CYAN)Python:$(RESET)     $$(python --version 2>&1)"
	@echo "$(CYAN)UV:$(RESET)         $$(uv --version 2>&1 || echo 'Not installed')"
	@echo "$(CYAN)Project:$(RESET)    $(PROJECT_NAME)"
	@echo "$(CYAN)Directory:$(RESET)  $$(pwd)"
	@echo "$(CYAN)Git:$(RESET)        $$(git branch --show-current 2>/dev/null || echo 'Not a git repo')"

# 🔧 Development environment check
check-env:
	@echo "$(CYAN)🔧 Checking development environment...$(RESET)"
	$(UV) run python scripts/check_setup.py

# ==================== 📱 SHORTCUTS ====================

# Quick aliases for common commands
l: lint
t: test
c: check
f: fix
r: run
