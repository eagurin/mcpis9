/**
 * Общие типы для mcpis9
 */

// Типы для AI провайдеров
export type AIProvider = 'claude' | 'openai' | 'gemini';

// Типы сообщений в чате
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  provider?: AIProvider;
  metadata?: Record<string, any>;
}

// Типы для Computer Use
export interface ComputerUseAction {
  type: 'screenshot' | 'click' | 'type' | 'key' | 'scroll';
  coordinates?: { x: number; y: number };
  text?: string;
  key?: string;
  scrollDirection?: 'up' | 'down' | 'left' | 'right';
}

export interface ComputerUseResult {
  success: boolean;
  screenshot?: string; // base64 encoded
  error?: string;
  metadata?: Record<string, any>;
}

// Типы для CLI команд
export interface CLICommand {
  command: string;
  description: string;
  examples: string[];
  category: 'git' | 'npm' | 'docker' | 'basics' | 'other';
}

// Типы для AI помощи
export interface AITopic {
  name: string;
  description: string;
  examples: string[];
  provider: AIProvider;
}

// Типы для разработки
export interface DevTopic {
  name: string;
  description: string;
  tools: string[];
  setup: string[];
}

// Конфигурация приложения
export interface AppConfig {
  aiProviders: {
    claude?: {
      apiKey: string;
      model: string;
    };
    openai?: {
      apiKey: string;
      model: string;
    };
    gemini?: {
      apiKey: string;
      model: string;
    };
  };
  computerUse: {
    enabled: boolean;
    sandbox: boolean;
  };
  ui: {
    theme: 'light' | 'dark' | 'auto';
    language: 'ru' | 'en';
  };
  r2r?: {
    apiUrl: string;
    apiKey?: string;
  };
}

// ============================================
// AGENT SYSTEM TYPES
// ============================================

// Типы агентов
export type AgentType = 'boss' | 'code' | 'research' | 'analysis' | 'creative' | 'devops';

export type AgentStatus = 'idle' | 'thinking' | 'executing' | 'waiting' | 'completed' | 'error';

// Роль агента
export interface AgentRole {
  type: AgentType;
  name: string;
  description: string;
  capabilities: string[];
  systemPrompt: string;
}

// Состояние агента
export interface AgentState {
  agentId: string;
  type: AgentType;
  status: AgentStatus;
  currentTask?: AgentTask;
  memory: AgentMemory;
  metadata: Record<string, any>;
}

// Задача для агента
export interface AgentTask {
  taskId: string;
  type: 'main' | 'subtask';
  description: string;
  context: string;
  requirements: string[];
  parentTaskId?: string;
  assignedTo?: AgentType;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  result?: AgentTaskResult;
  createdAt: Date;
  updatedAt: Date;
}

// Результат выполнения задачи
export interface AgentTaskResult {
  taskId: string;
  success: boolean;
  output: string;
  artifacts?: AgentArtifact[];
  toolsUsed: string[];
  reasoning: string;
  error?: string;
  metadata: Record<string, any>;
}

// Артефакт (результат работы агента)
export interface AgentArtifact {
  id: string;
  type: 'code' | 'document' | 'analysis' | 'plan' | 'data' | 'other';
  name: string;
  content: string;
  mimeType?: string;
  metadata: Record<string, any>;
}

// Память агента
export interface AgentMemory {
  shortTerm: ConversationBuffer;
  longTerm: LongTermMemory;
  workingMemory: Record<string, any>;
}

// Буфер разговора (краткосрочная память)
export interface ConversationBuffer {
  messages: ChatMessage[];
  maxSize: number;
  currentSize: number;
}

// Долгосрочная память (R2R)
export interface LongTermMemory {
  enabled: boolean;
  documents: MemoryDocument[];
  retrievalHistory: MemoryRetrieval[];
}

// Документ в памяти
export interface MemoryDocument {
  id: string;
  content: string;
  metadata: {
    source: string;
    timestamp: Date;
    agentId: string;
    taskId?: string;
    tags: string[];
  };
  embedding?: number[];
}

// Результат поиска в памяти
export interface MemoryRetrieval {
  query: string;
  results: MemoryDocument[];
  timestamp: Date;
  relevanceScores: number[];
}

// ============================================
// TOOL SYSTEM TYPES
// ============================================

// Тип инструмента
export type ToolType = 'api' | 'cli' | 'search' | 'code' | 'file' | 'browser' | 'custom';

// Определение инструмента
export interface ToolDefinition {
  name: string;
  type: ToolType;
  description: string;
  parameters: ToolParameter[];
  returnType: string;
  handler: string; // Имя функции-обработчика
  requiredPermissions?: string[];
}

// Параметр инструмента
export interface ToolParameter {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'object' | 'array';
  description: string;
  required: boolean;
  default?: any;
}

// Выполнение инструмента
export interface ToolExecution {
  executionId: string;
  toolName: string;
  agentId: string;
  taskId: string;
  parameters: Record<string, any>;
  status: 'pending' | 'running' | 'completed' | 'failed';
  result?: ToolExecutionResult;
  startedAt: Date;
  completedAt?: Date;
}

// Результат выполнения инструмента
export interface ToolExecutionResult {
  success: boolean;
  output: any;
  error?: string;
  metadata: Record<string, any>;
}

// ============================================
// ORCHESTRATION TYPES
// ============================================

// План выполнения от Boss Agent
export interface ExecutionPlan {
  planId: string;
  originalRequest: string;
  tasks: AgentTask[];
  dependencies: TaskDependency[];
  estimatedDuration?: number;
  createdAt: Date;
}

// Зависимость между задачами
export interface TaskDependency {
  taskId: string;
  dependsOn: string[];
}

// Сообщение между агентами
export interface AgentMessage {
  messageId: string;
  from: string; // agentId
  to: string; // agentId
  type: 'task_assignment' | 'task_result' | 'query' | 'response' | 'coordination';
  payload: any;
  timestamp: Date;
}

// Координация агентов
export interface AgentCoordination {
  coordinationId: string;
  participants: string[]; // agentIds
  objective: string;
  status: 'active' | 'completed' | 'failed';
  messages: AgentMessage[];
  result?: any;
}

// ============================================
// R2R INTEGRATION TYPES
// ============================================

// Конфигурация R2R
export interface R2RConfig {
  apiUrl: string;
  apiKey?: string;
  collectionId?: string;
  embeddingModel?: string;
  chunkSize?: number;
  chunkOverlap?: number;
}

// Запрос к R2R
export interface R2RSearchRequest {
  query: string;
  topK?: number;
  filters?: Record<string, any>;
  includeMetadata?: boolean;
}

// Ответ от R2R
export interface R2RSearchResponse {
  results: R2RDocument[];
  query: string;
  processingTime: number;
}

// Документ R2R
export interface R2RDocument {
  id: string;
  content: string;
  score: number;
  metadata: Record<string, any>;
}

// Запрос на индексацию
export interface R2RIndexRequest {
  documents: {
    content: string;
    metadata: Record<string, any>;
  }[];
  collectionId?: string;
}

// Ответ на индексацию
export interface R2RIndexResponse {
  documentIds: string[];
  indexed: number;
  failed: number;
  errors?: string[];
}
