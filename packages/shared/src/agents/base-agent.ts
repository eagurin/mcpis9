/**
 * Base Agent Class
 *
 * Foundation for all agents in the system
 */

import type {
  AgentConfig,
  AgentMessage,
  AgentState,
  AgentStatus,
  Task,
  TaskStatus,
  MessagePriority,
} from '../types/agent.types';
import { generateId } from '../utils';
import type { R2RMemoryService } from '../services/r2r-memory.service';

export abstract class BaseAgent {
  protected config: AgentConfig;
  protected state: AgentState;
  protected memory?: R2RMemoryService;
  protected taskQueue: Task[] = [];
  protected activeTasks: Map<string, Task> = new Map();
  protected messageHandlers: Map<string, (message: AgentMessage) => Promise<void>> = new Map();

  constructor(config: AgentConfig, memory?: R2RMemoryService) {
    this.config = config;
    this.memory = memory;
    this.state = {
      agent: config,
      status: 'idle',
      currentTasks: [],
      completedTasks: 0,
      failedTasks: 0,
      averageResponseTime: 0,
      lastActivity: Date.now(),
      metrics: {
        totalRequests: 0,
        successRate: 1.0,
        averageDuration: 0,
      },
    };

    this.setupMessageHandlers();
  }

  /**
   * Setup message handlers - to be implemented by subclasses
   */
  protected abstract setupMessageHandlers(): void;

  /**
   * Process a task - to be implemented by subclasses
   */
  protected abstract processTask(task: Task): Promise<any>;

  /**
   * Start the agent
   */
  async start(): Promise<void> {
    this.state.status = 'idle';
    this.state.lastActivity = Date.now();
    console.log(`[${this.config.name}] Agent started`);
  }

  /**
   * Stop the agent
   */
  async stop(): Promise<void> {
    this.state.status = 'offline';
    // Cancel all active tasks
    for (const [taskId, task] of this.activeTasks) {
      task.status = 'cancelled';
      this.activeTasks.delete(taskId);
    }
    console.log(`[${this.config.name}] Agent stopped`);
  }

  /**
   * Handle incoming message
   */
  async handleMessage(message: AgentMessage): Promise<AgentMessage> {
    this.state.lastActivity = Date.now();
    this.state.metrics.totalRequests++;

    try {
      // Validate message
      if (message.to !== this.config.type) {
        throw new Error(`Message not addressed to this agent (${this.config.type})`);
      }

      // Route to appropriate handler
      const handler = this.messageHandlers.get(message.type);
      if (!handler) {
        throw new Error(`No handler for message type: ${message.type}`);
      }

      await handler(message);

      // Return acknowledgment
      return this.createResponse(message, { success: true });
    } catch (error) {
      console.error(`[${this.config.name}] Error handling message:`, error);
      return this.createErrorResponse(message, error as Error);
    }
  }

  /**
   * Execute a task
   */
  async executeTask(task: Task): Promise<any> {
    const startTime = Date.now();

    try {
      // Check capacity
      if (this.activeTasks.size >= this.config.maxConcurrentTasks) {
        throw new Error(`Agent at capacity (${this.config.maxConcurrentTasks} tasks)`);
      }

      // Update task status
      task.status = 'in_progress';
      task.startedAt = startTime;
      this.activeTasks.set(task.id, task);
      this.state.status = 'busy';
      this.state.currentTasks = Array.from(this.activeTasks.values());

      // Process the task
      const result = await this.withTimeout(
        this.processTask(task),
        this.config.timeout
      );

      // Update task status
      task.status = 'completed';
      task.completedAt = Date.now();
      task.result = result;
      this.activeTasks.delete(task.id);

      // Update metrics
      this.state.completedTasks++;
      this.updateMetrics(startTime);

      // Store result in memory if available
      if (this.memory?.isReady()) {
        await this.memory.storeTaskResult(
          task.id,
          this.config.type,
          task.input,
          result,
          {
            taskType: task.type,
            duration: Date.now() - startTime,
            priority: task.priority,
          }
        );
      }

      // Update status
      this.state.status = this.activeTasks.size > 0 ? 'busy' : 'idle';
      this.state.currentTasks = Array.from(this.activeTasks.values());

      return result;
    } catch (error) {
      // Update task status
      task.status = 'failed';
      task.completedAt = Date.now();
      task.error = {
        code: 'TASK_EXECUTION_FAILED',
        message: (error as Error).message,
        details: error,
      };
      this.activeTasks.delete(task.id);

      // Update metrics
      this.state.failedTasks++;
      this.state.metrics.successRate =
        this.state.completedTasks / (this.state.completedTasks + this.state.failedTasks);

      // Update status
      this.state.status = this.activeTasks.size > 0 ? 'busy' : 'error';
      this.state.currentTasks = Array.from(this.activeTasks.values());

      throw error;
    }
  }

  /**
   * Create a response message
   */
  protected createResponse(
    requestMessage: AgentMessage,
    content: any,
    priority: MessagePriority = 'medium'
  ): AgentMessage {
    return {
      id: generateId(),
      from: this.config.type,
      to: requestMessage.from,
      type: 'response',
      content,
      metadata: {
        timestamp: Date.now(),
        priority,
        correlationId: requestMessage.metadata.correlationId || requestMessage.id,
        parentMessageId: requestMessage.id,
        conversationId: requestMessage.metadata.conversationId,
      },
    };
  }

  /**
   * Create an error response message
   */
  protected createErrorResponse(requestMessage: AgentMessage, error: Error): AgentMessage {
    return {
      id: generateId(),
      from: this.config.type,
      to: requestMessage.from,
      type: 'error',
      content: null,
      metadata: {
        timestamp: Date.now(),
        priority: 'high',
        correlationId: requestMessage.metadata.correlationId || requestMessage.id,
        parentMessageId: requestMessage.id,
        conversationId: requestMessage.metadata.conversationId,
      },
      error: {
        code: 'AGENT_ERROR',
        message: error.message,
        details: error,
      },
    };
  }

  /**
   * Create a notification message
   */
  protected createNotification(
    to: string,
    content: any,
    priority: MessagePriority = 'low'
  ): AgentMessage {
    return {
      id: generateId(),
      from: this.config.type,
      to: to as any,
      type: 'notification',
      content,
      metadata: {
        timestamp: Date.now(),
        priority,
      },
    };
  }

  /**
   * Get agent state
   */
  getState(): AgentState {
    return { ...this.state };
  }

  /**
   * Get agent capabilities
   */
  getCapabilities(): string[] {
    return this.config.capabilities;
  }

  /**
   * Check if agent can handle a task
   */
  canHandle(taskType: string): boolean {
    return this.config.capabilities.includes(taskType);
  }

  /**
   * Update metrics
   */
  protected updateMetrics(startTime: number): void {
    const duration = Date.now() - startTime;
    const totalTasks = this.state.completedTasks + this.state.failedTasks;

    this.state.averageResponseTime =
      (this.state.averageResponseTime * (totalTasks - 1) + duration) / totalTasks;

    this.state.metrics.averageDuration = this.state.averageResponseTime;
  }

  /**
   * Execute with timeout
   */
  protected async withTimeout<T>(promise: Promise<T>, timeout: number): Promise<T> {
    return Promise.race([
      promise,
      new Promise<T>((_, reject) =>
        setTimeout(() => reject(new Error(`Task timeout after ${timeout}ms`)), timeout)
      ),
    ]);
  }

  /**
   * Retry with exponential backoff
   */
  protected async withRetry<T>(
    fn: () => Promise<T>,
    maxAttempts: number = this.config.retryAttempts
  ): Promise<T> {
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error as Error;
        if (attempt < maxAttempts) {
          const backoff = Math.min(1000 * Math.pow(2, attempt - 1), 10000);
          console.log(
            `[${this.config.name}] Attempt ${attempt} failed, retrying in ${backoff}ms...`
          );
          await new Promise((resolve) => setTimeout(resolve, backoff));
        }
      }
    }

    throw lastError || new Error('All retry attempts failed');
  }

  /**
   * Log activity
   */
  protected log(level: 'info' | 'warn' | 'error', message: string, data?: any): void {
    const prefix = `[${this.config.name}]`;
    switch (level) {
      case 'info':
        console.log(prefix, message, data || '');
        break;
      case 'warn':
        console.warn(prefix, message, data || '');
        break;
      case 'error':
        console.error(prefix, message, data || '');
        break;
    }
  }
}
