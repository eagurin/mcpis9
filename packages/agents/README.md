# @mcpis9/agents

Продвинутая агентная система с Boss Agent оркестрацией и R2R памятью для mcpis9.

## Обзор

Этот пакет реализует архитектуру Orchestrator-Workers для координации множественных специализированных AI агентов:

- **Boss Agent**: Главный оркестратор, декомпозирует задачи и координирует worker-агентов
- **Worker Agents**: Специализированные агенты для конкретных доменов
- **R2R Memory**: Продвинутая система памяти с RAG возможностями
- **Tool System**: Расширяемая система инструментов для агентов

## Архитектура

### Boss Agent (Оркестратор)

Boss Agent - это центральный координатор системы, который:

1. **Анализирует** входящий запрос пользователя
2. **Декомпозирует** сложные задачи на подзадачи
3. **Назначает** подзадачи специализированным worker-агентам
4. **Координирует** выполнение с учетом зависимостей
5. **Агрегирует** результаты от worker-агентов
6. **Синтезирует** финальный ответ

### Worker Agents

#### 💻 Code Agent
**Специализация**: Программирование и разработка

Возможности:
- Написание кода на разных языках
- Отладка и исправление ошибок
- Рефакторинг кода
- Ревью кода
- Реализация алгоритмов

#### 🔍 Research Agent
**Специализация**: Исследования и сбор информации

Возможности:
- Поиск информации
- Анализ источников
- Проверка фактов
- Синтез находок
- Цитирование источников

#### 📊 Analysis Agent
**Специализация**: Анализ данных

Возможности:
- Анализ данных
- Распознавание паттернов
- Статистический анализ
- Извлечение инсайтов
- Рекомендации

#### ✨ Creative Agent
**Специализация**: Создание контента

Возможности:
- Создание контента
- Брейнсторминг
- Креативное письмо
- Концепции дизайна
- Инновационные идеи

#### 🚀 DevOps Agent
**Специализация**: Инфраструктура и операции

Возможности:
- Дизайн инфраструктуры
- Стратегии развертывания
- CI/CD пайплайны
- Мониторинг и логирование
- Лучшие практики безопасности

### Система памяти

#### Краткосрочная память (Conversation Buffer)
- Хранит недавние сообщения разговора
- Автоматическая ротация при достижении лимита
- Оптимизирована для контекста LLM

#### Долгосрочная память (R2R)
- Интеграция с R2R (Retrieval-Augmented Generation)
- Индексация важной информации
- Семантический поиск по документам
- Гибридный поиск (semantic + keyword)

#### Рабочая память
- Временное хранилище для задач
- Ключ-значение хранилище
- Очищается после завершения задачи

### Система инструментов

Расширяемая система инструментов включает:

- **search**: Поиск информации в интернете
- **execute_code**: Выполнение кода в песочнице
- **read_file**: Чтение файлов
- **write_file**: Запись файлов
- **api_call**: Вызовы API

## Установка

```bash
# В монорепозитории
npm install

# Или отдельно
npm install @mcpis9/agents
```

## Использование

### Базовое использование

```typescript
import { AgentOrchestrator } from '@mcpis9/agents';

// Создание оркестратора
const orchestrator = new AgentOrchestrator({
  enableR2R: true,
  r2rConfig: {
    apiUrl: 'http://localhost:8000',
    apiKey: 'your-api-key',
  },
});

// Выполнение задачи через Boss Agent
const result = await orchestrator.executeTask(
  'Create a REST API for user management',
  ['Use TypeScript', 'Include authentication', 'Add tests']
);

console.log(result.output);
console.log('Success:', result.success);
console.log('Artifacts:', result.artifacts);
```

### Использование конкретного worker-агента

```typescript
// Выполнение задачи напрямую через Code Agent
const codeResult = await orchestrator.executeWithWorker(
  'code',
  'Implement a binary search algorithm in TypeScript',
  ['Add type safety', 'Include unit tests']
);

// Выполнение исследовательской задачи
const researchResult = await orchestrator.executeWithWorker(
  'research',
  'Find the latest information about TypeScript 5.0 features'
);
```

### Работа с памятью

```typescript
const memoryManager = orchestrator.getMemoryManager();

// Сохранение в долгосрочную память
await memoryManager.summarizeAndStore(
  'agent-id',
  'task-id',
  'Important summary of conversation',
  ['important', 'project-x']
);

// Поиск в долгосрочной памяти
const docs = await memoryManager.searchLongTerm('TypeScript features', 5);
console.log('Found documents:', docs);
```

### Регистрация собственных инструментов

```typescript
const toolRegistry = orchestrator.getToolRegistry();

toolRegistry.registerTool(
  {
    name: 'custom_tool',
    type: 'custom',
    description: 'My custom tool',
    parameters: [
      {
        name: 'input',
        type: 'string',
        description: 'Input parameter',
        required: true,
      },
    ],
    returnType: 'string',
    handler: 'customHandler',
  },
  async (params) => {
    // Ваша логика
    return `Processed: ${params.input}`;
  }
);
```

## API

### AgentOrchestrator

#### Методы

- `executeTask(description, requirements?)`: Выполнить задачу через Boss Agent
- `executeWithWorker(type, description, requirements?)`: Выполнить задачу через конкретного worker-агента
- `getBossAgent()`: Получить экземпляр Boss Agent
- `getWorker(type)`: Получить worker-агента по типу
- `getMemoryManager()`: Получить менеджер памяти
- `getToolRegistry()`: Получить реестр инструментов
- `checkR2RHealth()`: Проверить состояние R2R сервиса
- `resetAll()`: Сбросить состояние всех агентов

### MemoryManager

#### Методы

- `addMessage(message)`: Добавить сообщение в краткосрочную память
- `getRecentMessages(count?)`: Получить недавние сообщения
- `storeInLongTerm(document)`: Сохранить в долгосрочную память (R2R)
- `searchLongTerm(query, topK?)`: Поиск в долгосрочной памяти
- `setWorkingMemory(key, value)`: Установить значение в рабочей памяти
- `getWorkingMemory(key)`: Получить значение из рабочей памяти
- `getContextForLLM(query, messageCount?)`: Получить контекст для LLM
- `summarizeAndStore(agentId, taskId, summary, tags)`: Суммаризировать и сохранить

## Конфигурация

### Переменные окружения

```bash
# R2R Configuration
ENABLE_R2R=true
R2R_API_URL=http://localhost:8000
R2R_API_KEY=your-api-key

# AI Provider Configuration
ANTHROPIC_API_KEY=your-anthropic-key
OPENAI_API_KEY=your-openai-key
GOOGLE_API_KEY=your-google-key
```

### Конфигурация через код

```typescript
const config: OrchestratorConfig = {
  enableR2R: true,
  r2rConfig: {
    apiUrl: 'http://localhost:8000',
    apiKey: 'your-api-key',
    collectionId: 'my-collection',
    embeddingModel: 'text-embedding-3-small',
    chunkSize: 512,
    chunkOverlap: 50,
  },
  maxShortTermMemory: 100,
};

const orchestrator = new AgentOrchestrator(config);
```

## Интеграция с R2R

### Установка R2R

```bash
# Python
pip install r2r
python -m r2r.serve

# Docker
docker run -p 8000:8000 sciphi/r2r
```

### Настройка R2R для агентов

```typescript
import { R2RClient } from '@mcpis9/agents';

const r2rClient = new R2RClient({
  apiUrl: 'http://localhost:8000',
  apiKey: 'your-api-key',
});

// Проверка здоровья
const isHealthy = await r2rClient.health();
console.log('R2R is healthy:', isHealthy);

// Индексация документов
const indexResult = await r2rClient.index({
  documents: [
    {
      content: 'Important information about the project',
      metadata: {
        source: 'project-docs',
        timestamp: new Date(),
      },
    },
  ],
});

// Поиск
const searchResult = await r2rClient.search({
  query: 'project information',
  topK: 5,
});
```

## Примеры использования

### Создание REST API

```typescript
const result = await orchestrator.executeTask(
  'Create a REST API for managing blog posts',
  [
    'Use Express.js and TypeScript',
    'Include CRUD operations',
    'Add input validation',
    'Include error handling',
    'Add Swagger documentation',
  ]
);

// Boss Agent декомпозирует на:
// 1. Code Agent: создание структуры API
// 2. Code Agent: реализация эндпоинтов
// 3. Analysis Agent: анализ требований к безопасности
// 4. DevOps Agent: рекомендации по развертыванию
```

### Исследование технологии

```typescript
const result = await orchestrator.executeWithWorker(
  'research',
  'Research the latest features in Next.js 14 and compare with version 13'
);

// Research Agent:
// 1. Ищет информацию в памяти
// 2. Выполняет поиск в интернете
// 3. Синтезирует результаты
// 4. Предоставляет структурированный отчет
```

### Анализ данных

```typescript
const result = await orchestrator.executeWithWorker(
  'analysis',
  'Analyze the performance metrics and identify bottlenecks',
  ['Focus on response times', 'Identify patterns', 'Provide recommendations']
);
```

## CLI Integration

```bash
# Показать список агентов
mcpis9 agent --list

# Проверить статус системы
mcpis9 agent --status

# Выполнить задачу через Boss Agent
mcpis9 agent --task "Create a TypeScript interface for user data"

# Выполнить задачу через Code Agent
mcpis9 agent --worker code --task "Implement quicksort algorithm"

# С требованиями
mcpis9 agent --task "Build REST API" --requirements "Use Express" "Add tests"
```

## Разработка

### Структура пакета

```
packages/agents/
├── src/
│   ├── agents/
│   │   ├── base-agent.ts
│   │   ├── boss-agent.ts
│   │   └── workers/
│   │       ├── code-agent.ts
│   │       ├── research-agent.ts
│   │       ├── analysis-agent.ts
│   │       ├── creative-agent.ts
│   │       └── devops-agent.ts
│   ├── memory/
│   │   ├── r2r-client.ts
│   │   └── memory-manager.ts
│   ├── tools/
│   │   └── tool-registry.ts
│   ├── orchestrator.ts
│   └── index.ts
├── package.json
├── tsconfig.json
└── README.md
```

### Расширение системы

#### Добавление нового worker-агента

```typescript
import { BaseAgent } from '@mcpis9/agents';
import type { AgentTask, AgentTaskResult } from '@mcpis9/shared';

export class CustomAgent extends BaseAgent {
  protected async processTask(
    task: AgentTask,
    context: string
  ): Promise<AgentTaskResult> {
    // Ваша логика
    return {
      taskId: task.taskId,
      success: true,
      output: 'Result',
      toolsUsed: [],
      reasoning: 'Process explanation',
      metadata: {},
    };
  }
}

// Регистрация в оркестраторе
const customAgent = new CustomAgent(role, memory, toolRegistry);
orchestrator.getBossAgent().registerWorker(customAgent);
```

## Лицензия

MIT

## Авторы

Евгений Гурин <e.a.gurin@gmail.com>
