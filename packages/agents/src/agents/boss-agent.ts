/**
 * Boss Agent - главный агент-оркестратор
 *
 * Отвечает за:
 * - Декомпозицию сложных задач на подзадачи
 * - Назначение подзадач специализированным worker-агентам
 * - Координацию работы агентов
 * - Агрегацию результатов
 * - Принятие решений о следующих шагах
 */

import type {
  AgentTask,
  AgentTaskResult,
  AgentMessage,
  ExecutionPlan,
  TaskDependency,
  ChatMessage,
  AgentType,
} from '@mcpis9/shared';
import { BaseAgent } from './base-agent';
import { MemoryManager } from '../memory/memory-manager';
import { ToolRegistry } from '../tools/tool-registry';

export class BossAgent extends BaseAgent {
  private workerAgents: Map<AgentType, BaseAgent>;
  private activeTasks: Map<string, AgentTask>;
  private completedTasks: Map<string, AgentTaskResult>;
  private agentMessages: AgentMessage[];

  constructor(memory: MemoryManager, toolRegistry: ToolRegistry) {
    super(
      {
        type: 'boss',
        name: 'Boss Agent',
        description: 'Orchestrates and coordinates multiple specialized agents to solve complex tasks',
        capabilities: [
          'Task decomposition',
          'Agent coordination',
          'Result aggregation',
          'Strategic planning',
          'Decision making',
        ],
        systemPrompt: `You are the Boss Agent, a sophisticated AI orchestrator responsible for coordinating multiple specialized agents.

Your responsibilities:
1. Analyze complex requests and break them down into manageable subtasks
2. Determine which specialized agent is best suited for each subtask
3. Coordinate the execution of multiple agents
4. Aggregate and synthesize results from different agents
5. Make strategic decisions about next steps
6. Ensure efficient use of resources and agent capabilities

Available specialized agents:
- Code Agent: Programming, code review, debugging, refactoring
- Research Agent: Information gathering, fact-checking, analysis
- Analysis Agent: Data analysis, pattern recognition, insights
- Creative Agent: Content creation, brainstorming, design
- DevOps Agent: Infrastructure, deployment, CI/CD, monitoring

Guidelines:
- Always think strategically about the best approach
- Break down complex tasks into parallel subtasks when possible
- Use memory to maintain context across conversations
- Learn from past executions to improve future planning
- Be explicit about your reasoning and decision-making process`,
      },
      memory,
      toolRegistry,
      'claude',
      'claude-3-7-sonnet-20250219'
    );

    this.workerAgents = new Map();
    this.activeTasks = new Map();
    this.completedTasks = new Map();
    this.agentMessages = [];
  }

  /**
   * Регистрация worker-агента
   */
  registerWorker(agent: BaseAgent): void {
    this.workerAgents.set(agent.getType(), agent);
  }

  /**
   * Обработка задачи (главный метод)
   */
  protected async processTask(task: AgentTask, context: string): Promise<AgentTaskResult> {
    try {
      // 1. Анализ задачи и создание плана выполнения
      const plan = await this.createExecutionPlan(task, context);

      // 2. Выполнение плана
      const results = await this.executePlan(plan);

      // 3. Агрегация результатов
      const finalResult = await this.aggregateResults(task, results);

      // 4. Сохранение важной информации в долгосрочную память
      await this.saveToLongTermMemory(task, finalResult);

      return finalResult;
    } catch (error) {
      return {
        taskId: task.taskId,
        success: false,
        output: '',
        toolsUsed: [],
        reasoning: 'Failed to process task',
        error: error instanceof Error ? error.message : 'Unknown error',
        metadata: {},
      };
    }
  }

  /**
   * Создание плана выполнения
   */
  private async createExecutionPlan(task: AgentTask, context: string): Promise<ExecutionPlan> {
    this.status = 'thinking';

    // Формируем промпт для декомпозиции задачи
    const messages: ChatMessage[] = [
      {
        id: `msg-${Date.now()}`,
        role: 'user',
        content: `Context: ${context}

Task: ${task.description}

Requirements:
${task.requirements.join('\n')}

Please analyze this task and break it down into subtasks. For each subtask, specify:
1. Description
2. Which specialized agent should handle it (code, research, analysis, creative, devops)
3. Dependencies on other subtasks
4. Required tools or capabilities

Respond in a structured format.`,
        timestamp: new Date(),
      },
    ];

    // Вызываем LLM для планирования
    const planningResponse = await this.callLLM(messages, this.role.systemPrompt);

    // Парсим ответ и создаем план
    // TODO: Улучшить парсинг с помощью structured outputs
    const subtasks = this.parseSubtasks(planningResponse, task.taskId);

    const plan: ExecutionPlan = {
      planId: `plan-${Date.now()}`,
      originalRequest: task.description,
      tasks: subtasks,
      dependencies: this.extractDependencies(subtasks),
      estimatedDuration: subtasks.length * 30000, // 30 sec per subtask estimate
      createdAt: new Date(),
    };

    // Сохраняем план в рабочую память
    this.memory.setWorkingMemory(`plan-${task.taskId}`, plan);

    return plan;
  }

  /**
   * Парсинг подзадач из ответа LLM
   */
  private parseSubtasks(response: string, parentTaskId: string): AgentTask[] {
    // Простой парсинг (TODO: улучшить с помощью structured outputs)
    const subtasks: AgentTask[] = [];
    const lines = response.split('\n');

    let currentSubtask: Partial<AgentTask> | null = null;

    for (const line of lines) {
      const trimmed = line.trim();

      if (trimmed.startsWith('- ') || trimmed.match(/^\d+\./)) {
        if (currentSubtask) {
          subtasks.push(this.finalizeSubtask(currentSubtask, parentTaskId));
        }

        currentSubtask = {
          description: trimmed.replace(/^[-\d.]\s*/, ''),
        };
      } else if (currentSubtask && trimmed.includes('Agent:')) {
        const agentMatch = trimmed.match(/Agent:\s*(code|research|analysis|creative|devops)/i);
        if (agentMatch) {
          currentSubtask.assignedTo = agentMatch[1].toLowerCase() as AgentType;
        }
      }
    }

    if (currentSubtask) {
      subtasks.push(this.finalizeSubtask(currentSubtask, parentTaskId));
    }

    // Если парсинг не удался, создаем одну подзадачу с исследовательским агентом
    if (subtasks.length === 0) {
      subtasks.push({
        taskId: `subtask-${Date.now()}-0`,
        type: 'subtask',
        description: response.substring(0, 500),
        context: response,
        requirements: [],
        parentTaskId,
        assignedTo: 'research',
        status: 'pending',
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }

    return subtasks;
  }

  /**
   * Финализация подзадачи
   */
  private finalizeSubtask(partial: Partial<AgentTask>, parentTaskId: string): AgentTask {
    return {
      taskId: `subtask-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: 'subtask',
      description: partial.description || 'Unnamed subtask',
      context: partial.context || '',
      requirements: partial.requirements || [],
      parentTaskId,
      assignedTo: partial.assignedTo || 'research',
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  /**
   * Извлечение зависимостей между задачами
   */
  private extractDependencies(tasks: AgentTask[]): TaskDependency[] {
    // Простая эвристика: последовательное выполнение
    const dependencies: TaskDependency[] = [];

    for (let i = 1; i < tasks.length; i++) {
      dependencies.push({
        taskId: tasks[i].taskId,
        dependsOn: [tasks[i - 1].taskId],
      });
    }

    return dependencies;
  }

  /**
   * Выполнение плана
   */
  private async executePlan(plan: ExecutionPlan): Promise<Map<string, AgentTaskResult>> {
    const results = new Map<string, AgentTaskResult>();
    const dependencyMap = new Map(plan.dependencies.map(d => [d.taskId, d.dependsOn]));

    // Выполняем задачи с учетом зависимостей
    for (const task of plan.tasks) {
      // Проверяем зависимости
      const deps = dependencyMap.get(task.taskId) || [];
      const depsCompleted = deps.every(depId => results.has(depId));

      if (!depsCompleted) {
        console.warn(`Skipping task ${task.taskId} due to unfulfilled dependencies`);
        continue;
      }

      // Назначаем задачу worker-агенту
      const result = await this.delegateToWorker(task);
      results.set(task.taskId, result);

      this.completedTasks.set(task.taskId, result);
    }

    return results;
  }

  /**
   * Делегирование задачи worker-агенту
   */
  private async delegateToWorker(task: AgentTask): Promise<AgentTaskResult> {
    const agentType = task.assignedTo || 'research';
    const worker = this.workerAgents.get(agentType);

    if (!worker) {
      return {
        taskId: task.taskId,
        success: false,
        output: `No worker agent available for type: ${agentType}`,
        toolsUsed: [],
        reasoning: 'Worker agent not found',
        error: `Agent type ${agentType} not registered`,
        metadata: {},
      };
    }

    // Отправляем сообщение worker-агенту
    const message: AgentMessage = {
      messageId: `msg-${Date.now()}`,
      from: this.agentId,
      to: worker.getId(),
      type: 'task_assignment',
      payload: task,
      timestamp: new Date(),
    };

    this.agentMessages.push(message);
    this.activeTasks.set(task.taskId, task);

    // Выполняем задачу
    const result = await worker.executeTask(task);

    // Получаем результат
    const resultMessage: AgentMessage = {
      messageId: `msg-${Date.now()}`,
      from: worker.getId(),
      to: this.agentId,
      type: 'task_result',
      payload: result,
      timestamp: new Date(),
    };

    this.agentMessages.push(resultMessage);
    this.activeTasks.delete(task.taskId);

    return result;
  }

  /**
   * Агрегация результатов
   */
  private async aggregateResults(
    mainTask: AgentTask,
    results: Map<string, AgentTaskResult>
  ): Promise<AgentTaskResult> {
    const allResults = Array.from(results.values());
    const successfulResults = allResults.filter(r => r.success);
    const artifacts = allResults.flatMap(r => r.artifacts || []);
    const toolsUsed = [...new Set(allResults.flatMap(r => r.toolsUsed))];

    // Формируем итоговый вывод
    let output = `Task completed with ${successfulResults.length}/${allResults.length} successful subtasks.\n\n`;

    for (const [taskId, result] of results.entries()) {
      output += `Subtask ${taskId}:\n`;
      output += `Status: ${result.success ? '✓' : '✗'}\n`;
      output += `Output: ${result.output}\n`;
      output += `Reasoning: ${result.reasoning}\n\n`;
    }

    // Синтезируем финальный результат с помощью LLM
    const synthesisMessages: ChatMessage[] = [
      {
        id: `msg-${Date.now()}`,
        role: 'user',
        content: `Original task: ${mainTask.description}

Results from specialized agents:
${output}

Please synthesize these results into a coherent final response that addresses the original task.`,
        timestamp: new Date(),
      },
    ];

    const synthesis = await this.callLLM(synthesisMessages, this.role.systemPrompt);

    return {
      taskId: mainTask.taskId,
      success: successfulResults.length > 0,
      output: synthesis,
      artifacts,
      toolsUsed,
      reasoning: `Orchestrated ${allResults.length} subtasks across multiple specialized agents`,
      metadata: {
        subtaskCount: allResults.length,
        successCount: successfulResults.length,
        failureCount: allResults.length - successfulResults.length,
        agentMessages: this.agentMessages.length,
      },
    };
  }

  /**
   * Сохранение в долгосрочную память
   */
  private async saveToLongTermMemory(task: AgentTask, result: AgentTaskResult): Promise<void> {
    const summary = `Task: ${task.description}\nResult: ${result.success ? 'Success' : 'Failed'}\nOutput: ${result.output.substring(0, 500)}`;

    await this.memory.summarizeAndStore(
      this.agentId,
      task.taskId,
      summary,
      ['orchestration', 'completed', result.success ? 'success' : 'failure']
    );
  }

  /**
   * Получить активные задачи
   */
  getActiveTasks(): AgentTask[] {
    return Array.from(this.activeTasks.values());
  }

  /**
   * Получить выполненные задачи
   */
  getCompletedTasks(): AgentTaskResult[] {
    return Array.from(this.completedTasks.values());
  }

  /**
   * Получить сообщения между агентами
   */
  getAgentMessages(): AgentMessage[] {
    return this.agentMessages;
  }

  /**
   * Получить зарегистрированных worker-агентов
   */
  getWorkers(): BaseAgent[] {
    return Array.from(this.workerAgents.values());
  }
}
