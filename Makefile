# 🛠️ Современный Makefile для Python Backend приложений (2025)
# Основан на лучших практиках UV + Ruff + Pyright + Pre-commit

.DEFAULT_GOAL := help
.PHONY: help setup install dev clean lint test coverage run fix check security docker docs release all

# 🔧 Конфигурация
PYTHON := python3
UV := uv
PROJECT_NAME := mcpis9
SRC_DIR := app
TESTS_DIR := tests
DOCKER_IMAGE := $(PROJECT_NAME):latest

# 🎨 Цвета для вывода
RESET := \033[0m
BOLD := \033[1m
RED := \033[31m
GREEN := \033[32m
YELLOW := \033[33m
BLUE := \033[34m
MAGENTA := \033[35m
CYAN := \033[36m

# 📋 Команда помощи с эмодзи и разделами
help:
	@echo "$(BOLD)$(CYAN)🪝 $(PROJECT_NAME) - Современный рабочий процесс разработки$(RESET)"
	@echo ""
	@echo "$(BOLD)📦 Установка и настройка:$(RESET)"
	@echo "  $(GREEN)setup$(RESET)           - 🚀 Полная настройка проекта (UV + зависимости + pre-commit)"
	@echo "  $(GREEN)install$(RESET)         - 📥 Установка production зависимостей"
	@echo "  $(GREEN)dev$(RESET)             - 🔧 Установка development зависимостей"
	@echo "  $(GREEN)clean$(RESET)           - 🧹 Очистка кэша и временных файлов"
	@echo ""
	@echo "$(BOLD)✅ Качество кода (Стек 2025):$(RESET)"
	@echo "  $(GREEN)check$(RESET)           - 🔍 Запуск всех проверок (lint + типы + безопасность + тесты)"
	@echo "  $(GREEN)lint$(RESET)            - 🎯 Проверка кода с Ruff"
	@echo "  $(GREEN)types$(RESET)           - 🔬 Проверка типов с Pyright"
	@echo "  $(GREEN)security$(RESET)        - 🔒 Сканирование безопасности (GitLeaks + Bandit)"
	@echo "  $(GREEN)format$(RESET)          - ✨ Форматирование кода с Ruff"
	@echo "  $(GREEN)pre-commit$(RESET)      - 🪝 Запуск pre-commit на всех файлах"
	@echo ""
	@echo "$(BOLD)🧪 Тестирование:$(RESET)"
	@echo "  $(GREEN)test$(RESET)            - 🚀 Запуск тестов с pytest"
	@echo "  $(GREEN)test-fast$(RESET)       - ⚡ Запуск только быстрых тестов"
	@echo "  $(GREEN)test-watch$(RESET)      - 👀 Запуск тестов в режиме наблюдения"
	@echo "  $(GREEN)coverage$(RESET)        - 📊 Генерация отчёта покрытия"
	@echo ""
	@echo "$(BOLD)🐳 Docker:$(RESET)"
	@echo "  $(GREEN)docker-build$(RESET)    - 🏗️  Сборка Docker образа"
	@echo "  $(GREEN)docker-run$(RESET)      - 🚀 Запуск Docker контейнера"
	@echo "  $(GREEN)docker-clean$(RESET)    - 🧹 Очистка Docker артефактов"
	@echo ""
	@echo "$(BOLD)📚 Документация:$(RESET)"
	@echo "  $(GREEN)docs$(RESET)            - 📖 Генерация документации"
	@echo "  $(GREEN)docs-serve$(RESET)      - 🌐 Локальный сервер документации"
	@echo ""
	@echo "$(BOLD)🚀 Развёртывание:$(RESET)"
	@echo "  $(GREEN)run$(RESET)             - 🏃 Запуск dev сервера"
	@echo "  $(GREEN)run-prod$(RESET)        - 🏭 Запуск production сервера"
	@echo "  $(GREEN)release$(RESET)         - 🎉 Создание нового релиза (с Commitizen)"
	@echo ""
	@echo "$(BOLD)🎯 Рабочие процессы:$(RESET)"
	@echo "  $(GREEN)fix$(RESET)             - 🔧 Автоисправление всех проблем (format + lint --fix)"
	@echo "  $(GREEN)ci$(RESET)              - 🤖 Локальный запуск CI пайплайна"
	@echo "  $(GREEN)all$(RESET)             - 🎪 Полный рабочий процесс (clean + install + check + test)"

# ==================== 📦 УСТАНОВКА И НАСТРОЙКА ====================

setup: install-uv install-deps install-pre-commit
	@echo "$(GREEN)✅ Настройка проекта завершена!$(RESET)"

install-uv:
	@echo "$(CYAN)📦 Установка менеджера пакетов UV...$(RESET)"
	@command -v uv >/dev/null 2>&1 || curl -LsSf https://astral.sh/uv/install.sh | sh

install: install-deps

install-deps:
	@echo "$(CYAN)📥 Установка зависимостей...$(RESET)"
	$(UV) sync

dev: install-deps
	@echo "$(CYAN)🔧 Установка зависимостей разработки...$(RESET)"
	$(UV) sync --group dev

install-pre-commit:
	@echo "$(CYAN)🪝 Установка pre-commit хуков...$(RESET)"
	$(UV) run pre-commit install
	$(UV) run pre-commit install --hook-type commit-msg

clean:
	@echo "$(YELLOW)🧹 Очистка кэша и временных файлов...$(RESET)"
	rm -rf build/ dist/ *.egg-info/ .coverage htmlcov/ .pytest_cache/ .ruff_cache/ .mypy_cache/
	find . -type d -name "__pycache__" -exec rm -rf {} + 2>/dev/null || true
	find . -type f -name "*.pyc" -delete
	find . -type f -name "*.pyo" -delete
	find . -type f -name "*.pyd" -delete
	find . -type f -name ".coverage" -delete
	find . -type d -name "*.egg-info" -exec rm -rf {} + 2>/dev/null || true

# ==================== ✅ КАЧЕСТВО КОДА (СТЕК 2025) ====================

# 🎯 Современная команда для всех проверок
check: lint types security
	@echo "$(GREEN)✅ Все проверки пройдены!$(RESET)"

# 🎯 Линтинг с современным Ruff (заменяет Flake8, Black, isort, pyupgrade)
lint:
	@echo "$(CYAN)🎯 Проверка кода с Ruff...$(RESET)"
	@if [ -d "$(TESTS_DIR)" ]; then \
		$(UV) run ruff check $(SRC_DIR) $(TESTS_DIR); \
	else \
		$(UV) run ruff check $(SRC_DIR); \
	fi

# 🔬 Проверка типов с Pyright (быстрее чем MyPy)
types:
	@echo "$(CYAN)🔬 Проверка типов с Pyright...$(RESET)"
	@if [ -d "$(TESTS_DIR)" ]; then \
		$(UV) run pyright $(SRC_DIR) $(TESTS_DIR); \
	else \
		$(UV) run pyright $(SRC_DIR); \
	fi

# 🔒 Сканирование безопасности
security:
	@echo "$(CYAN)🔒 Запуск сканирования безопасности...$(RESET)"
	@echo "  🔍 Сканирование секретов с GitLeaks..."
	$(UV) run gitleaks detect --source . --verbose
	@echo "  🛡️  Сканирование уязвимостей с Bandit..."
	$(UV) run bandit -r $(SRC_DIR) -ll -f txt

# ✨ Форматирование кода
format:
	@echo "$(CYAN)✨ Форматирование кода с Ruff...$(RESET)"
	@if [ -d "$(TESTS_DIR)" ]; then \
		$(UV) run ruff format $(SRC_DIR) $(TESTS_DIR); \
	else \
		$(UV) run ruff format $(SRC_DIR); \
	fi

# 🔧 Автоисправление проблем
fix:
	@echo "$(CYAN)🔧 Автоисправление проблем...$(RESET)"
	@if [ -d "$(TESTS_DIR)" ]; then \
		$(UV) run ruff check --fix $(SRC_DIR) $(TESTS_DIR); \
		$(UV) run ruff format $(SRC_DIR) $(TESTS_DIR); \
	else \
		$(UV) run ruff check --fix $(SRC_DIR); \
		$(UV) run ruff format $(SRC_DIR); \
	fi

# 🪝 Pre-commit хуки
pre-commit:
	@echo "$(CYAN)🪝 Запуск pre-commit хуков...$(RESET)"
	$(UV) run pre-commit run --all-files

pre-commit-update:
	@echo "$(CYAN)🔄 Обновление pre-commit хуков...$(RESET)"
	$(UV) run pre-commit autoupdate

# ==================== 🧪 ТЕСТИРОВАНИЕ ====================

test:
	@echo "$(CYAN)🧪 Запуск тестов...$(RESET)"
	@if [ -d "$(TESTS_DIR)" ]; then \
		$(UV) run pytest $(TESTS_DIR) -v; \
	else \
		echo "$(YELLOW)⚠️  Директория тестов не найдена. Создайте $(TESTS_DIR)/ и добавьте тесты.$(RESET)"; \
	fi

test-fast:
	@echo "$(CYAN)⚡ Запуск быстрых тестов...$(RESET)"
	@if [ -d "$(TESTS_DIR)" ]; then \
		$(UV) run pytest $(TESTS_DIR) -x --ff -q; \
	else \
		echo "$(YELLOW)⚠️  Директория тестов не найдена. Создайте $(TESTS_DIR)/ и добавьте тесты.$(RESET)"; \
	fi

test-watch:
	@echo "$(CYAN)👀 Запуск тестов в режиме наблюдения...$(RESET)"
	@if [ -d "$(TESTS_DIR)" ]; then \
		$(UV) run pytest-watch -- $(TESTS_DIR); \
	else \
		echo "$(YELLOW)⚠️  Директория тестов не найдена. Создайте $(TESTS_DIR)/ и добавьте тесты.$(RESET)"; \
	fi

coverage:
	@echo "$(CYAN)📊 Генерация отчёта покрытия...$(RESET)"
	@if [ -d "$(TESTS_DIR)" ]; then \
		$(UV) run pytest $(TESTS_DIR) --cov=$(SRC_DIR) --cov-report=html --cov-report=term-missing; \
		echo "$(GREEN)📊 Отчёт покрытия: htmlcov/index.html$(RESET)"; \
	else \
		echo "$(YELLOW)⚠️  Директория тестов не найдена. Создайте $(TESTS_DIR)/ и добавьте тесты.$(RESET)"; \
	fi

# ==================== 🐳 DOCKER ====================

docker-build:
	@echo "$(CYAN)🏗️  Сборка Docker образа...$(RESET)"
	docker build -t $(DOCKER_IMAGE) .

docker-run:
	@echo "$(CYAN)🚀 Запуск Docker контейнера...$(RESET)"
	docker run -p 8000:8000 --env-file .env $(DOCKER_IMAGE)

docker-clean:
	@echo "$(YELLOW)🧹 Очистка Docker артефактов...$(RESET)"
	docker system prune -f
	docker image prune -f

# ==================== 📚 ДОКУМЕНТАЦИЯ ====================

docs:
	@echo "$(CYAN)📖 Генерация документации...$(RESET)"
	$(UV) run mkdocs build

docs-serve:
	@echo "$(CYAN)🌐 Запуск локального сервера документации...$(RESET)"
	$(UV) run mkdocs serve

# ==================== 🚀 ЗАПУСК И РАЗВЁРТЫВАНИЕ ====================

run:
	@echo "$(CYAN)🏃 Запуск сервера разработки...$(RESET)"
	@if [ -f .env ]; then \
		export $$(grep -v '^#' .env | xargs -0) && \
		HOST=$${API_HOST:-0.0.0.0} && \
		PORT=$${API_PORT:-8000} && \
		echo "$(GREEN)🚀 Сервер запущен на $$HOST:$$PORT$(RESET)" && \
		$(UV) run uvicorn $(SRC_DIR).main:app --host $$HOST --port $$PORT --reload; \
	else \
		echo "$(YELLOW)⚠️  Файл .env не найден. Используются значения по умолчанию.$(RESET)" && \
		$(UV) run uvicorn $(SRC_DIR).main:app --host 0.0.0.0 --port 8000 --reload; \
	fi

run-prod:
	@echo "$(CYAN)🏭 Запуск production сервера...$(RESET)"
	$(UV) run uvicorn $(SRC_DIR).main:app --host 0.0.0.0 --port 8000 --workers 4

# 🎉 Управление релизами с Commitizen
release:
	@echo "$(CYAN)🎉 Создание нового релиза...$(RESET)"
	$(UV) run cz bump --changelog

release-dry:
	@echo "$(CYAN)🔍 Тестовый запуск релиза...$(RESET)"
	$(UV) run cz bump --dry-run

# ==================== 🎯 РАБОЧИЕ ПРОЦЕССЫ ====================

# 🤖 Симуляция CI пайплайна
ci: clean install check coverage
	@echo "$(GREEN)✅ CI пайплайн успешно завершён!$(RESET)"

# 🎪 Полный рабочий процесс разработки
all: clean install check test coverage
	@echo "$(GREEN)🎉 Все задачи успешно выполнены!$(RESET)"

# 📊 Статус проекта
status:
	@echo "$(BOLD)$(CYAN)📊 Статус проекта$(RESET)"
	@echo "$(CYAN)Python:$(RESET)     $$(python --version 2>&1)"
	@echo "$(CYAN)UV:$(RESET)         $$(uv --version 2>&1 || echo 'Не установлен')"
	@echo "$(CYAN)Проект:$(RESET)     $(PROJECT_NAME)"
	@echo "$(CYAN)Каталог:$(RESET)    $$(pwd)"
	@echo "$(CYAN)Git:$(RESET)        $$(git branch --show-current 2>/dev/null || echo 'Не git репозиторий')"

# 🔧 Проверка среды разработки
check-env:
	@echo "$(CYAN)🔧 Проверка среды разработки...$(RESET)"
	$(UV) run python scripts/check_setup.py

# ==================== 📱 БЫСТРЫЕ КОМАНДЫ ====================

# Быстрые алиасы для общих команд
l: lint
t: test
c: check
f: fix
r: run
