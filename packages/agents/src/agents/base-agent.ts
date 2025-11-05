/**
 * Base Agent - базовый класс для всех агентов
 */

import type {
  AgentType,
  AgentRole,
  AgentState,
  AgentStatus,
  AgentTask,
  AgentTaskResult,
  AgentArtifact,
  ChatMessage,
  AIProvider,
} from '@mcpis9/shared';
import { MemoryManager } from '../memory/memory-manager';
import { ToolRegistry } from '../tools/tool-registry';

export abstract class BaseAgent {
  protected agentId: string;
  protected role: AgentRole;
  protected memory: MemoryManager;
  protected toolRegistry: ToolRegistry;
  protected status: AgentStatus;
  protected currentTask?: AgentTask;
  protected provider: AIProvider;
  protected model: string;

  constructor(
    role: AgentRole,
    memory: MemoryManager,
    toolRegistry: ToolRegistry,
    provider: AIProvider = 'claude',
    model?: string
  ) {
    this.agentId = `${role.type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    this.role = role;
    this.memory = memory;
    this.toolRegistry = toolRegistry;
    this.status = 'idle';
    this.provider = provider;
    this.model = model || this.getDefaultModel(provider);
  }

  /**
   * Получить модель по умолчанию для провайдера
   */
  protected getDefaultModel(provider: AIProvider): string {
    const models: Record<AIProvider, string> = {
      claude: 'claude-3-7-sonnet-20250219',
      openai: 'gpt-4o',
      gemini: 'gemini-2.0-flash-exp',
    };
    return models[provider];
  }

  /**
   * Выполнить задачу
   */
  async executeTask(task: AgentTask): Promise<AgentTaskResult> {
    this.currentTask = task;
    this.status = 'thinking';

    try {
      // Получаем контекст из памяти
      const context = await this.memory.getContextForLLM(task.description);

      // Выполняем основную логику агента
      const result = await this.processTask(task, context);

      this.status = 'completed';
      return result;
    } catch (error) {
      this.status = 'error';
      return {
        taskId: task.taskId,
        success: false,
        output: '',
        toolsUsed: [],
        reasoning: 'Task execution failed',
        error: error instanceof Error ? error.message : 'Unknown error',
        metadata: {},
      };
    } finally {
      this.currentTask = undefined;
    }
  }

  /**
   * Абстрактный метод обработки задачи (реализуется в подклассах)
   */
  protected abstract processTask(task: AgentTask, context: string): Promise<AgentTaskResult>;

  /**
   * Взаимодействие с LLM
   */
  protected async callLLM(messages: ChatMessage[], systemPrompt?: string): Promise<string> {
    // Добавляем системный промпт если есть
    const allMessages = systemPrompt
      ? [
          {
            id: `system-${Date.now()}`,
            role: 'system' as const,
            content: systemPrompt,
            timestamp: new Date(),
          },
          ...messages,
        ]
      : messages;

    // Сохраняем в память
    for (const msg of messages) {
      this.memory.addMessage(msg);
    }

    // TODO: Реализовать интеграцию с реальными LLM провайдерами
    // Временная заглушка
    return this.mockLLMResponse(messages[messages.length - 1].content);
  }

  /**
   * Временная заглушка для LLM ответа
   */
  private mockLLMResponse(userMessage: string): string {
    return `[${this.role.name}] Processing: ${userMessage}`;
  }

  /**
   * Использовать инструмент
   */
  protected async useTool(toolName: string, parameters: Record<string, any>): Promise<any> {
    this.status = 'executing';
    const tool = this.toolRegistry.getTool(toolName);

    if (!tool) {
      throw new Error(`Tool ${toolName} not found`);
    }

    const executionId = `exec-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const result = await this.toolRegistry.executeTool(toolName, parameters, {
      executionId,
      toolName,
      agentId: this.agentId,
      taskId: this.currentTask?.taskId || 'unknown',
      parameters,
      status: 'running',
      startedAt: new Date(),
    });

    return result.output;
  }

  /**
   * Создать артефакт
   */
  protected createArtifact(
    type: AgentArtifact['type'],
    name: string,
    content: string,
    metadata: Record<string, any> = {}
  ): AgentArtifact {
    return {
      id: `artifact-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type,
      name,
      content,
      metadata,
    };
  }

  /**
   * Получить состояние агента
   */
  getState(): AgentState {
    return {
      agentId: this.agentId,
      type: this.role.type,
      status: this.status,
      currentTask: this.currentTask,
      memory: this.memory.getMemoryState(),
      metadata: {
        provider: this.provider,
        model: this.model,
      },
    };
  }

  /**
   * Получить ID агента
   */
  getId(): string {
    return this.agentId;
  }

  /**
   * Получить тип агента
   */
  getType(): AgentType {
    return this.role.type;
  }

  /**
   * Получить роль агента
   */
  getRole(): AgentRole {
    return this.role;
  }

  /**
   * Получить статус агента
   */
  getStatus(): AgentStatus {
    return this.status;
  }

  /**
   * Сбросить состояние агента
   */
  reset(): void {
    this.status = 'idle';
    this.currentTask = undefined;
    this.memory.clearWorkingMemory();
  }
}
