/**
 * Boss Agent - The Master Orchestrator
 * Delegates tasks, coordinates agents, and maintains system state
 */

import { EventEmitter } from 'events';
import type {
  Agent,
  AgentConfig,
  AgentType,
  Task,
  TaskStatus,
  TaskPriority,
  AgentMessage,
  MessageType,
  BossAgentState,
  AgentMemory,
  MemoryEntry,
  SystemEvent
} from './agent-types';
import { R2RMemoryClient } from './r2r-client';

export class BossAgent extends EventEmitter {
  private config: AgentConfig;
  private state: BossAgentState;
  private memoryClient: R2RMemoryClient;
  private taskIdCounter: number = 0;
  private messageIdCounter: number = 0;

  constructor(
    memoryClient: R2RMemoryClient,
    config?: Partial<AgentConfig>
  ) {
    super();

    this.memoryClient = memoryClient;

    // Initialize boss agent config
    this.config = {
      id: 'boss-agent-001',
      type: 'boss',
      name: 'Boss Agent',
      description: 'Master orchestrator that delegates and coordinates all agent activities',
      capabilities: [
        'task_planning',
        'task_delegation',
        'agent_coordination',
        'resource_management',
        'decision_making',
        'monitoring'
      ],
      model: config?.model || 'claude-3-7-sonnet',
      temperature: config?.temperature || 0.7,
      maxTokens: config?.maxTokens || 4000,
      thinkingBudget: config?.thinkingBudget || 10000,
      enabled: true,
      ...config
    };

    // Initialize state
    this.state = {
      activeTasks: new Map(),
      agentPool: new Map(),
      taskQueue: {
        high: [],
        medium: [],
        low: []
      },
      coordinationState: {
        activeConversations: [],
        blockedTasks: [],
        waitingForDependencies: new Map()
      },
      systemMetrics: {
        totalTasks: 0,
        completedTasks: 0,
        failedTasks: 0,
        activeAgents: 0,
        averageResponseTime: 0,
        systemLoad: 0,
        memoryUsage: {
          shortTerm: 0,
          longTerm: 0,
          total: 0
        },
        lastUpdated: new Date()
      }
    };

    this.initializeAgentPool();
  }

  /**
   * Initialize the pool of specialized agents
   */
  private initializeAgentPool(): void {
    const agentConfigs: Partial<AgentConfig>[] = [
      {
        id: 'research-agent-001',
        type: 'research',
        name: 'Research Agent',
        description: 'Gathers and analyzes information from various sources',
        capabilities: ['web_search', 'document_analysis', 'data_extraction'],
        enabled: true
      },
      {
        id: 'code-agent-001',
        type: 'code',
        name: 'Code Agent',
        description: 'Generates, reviews, and debugs code',
        capabilities: ['code_generation', 'code_review', 'debugging', 'testing'],
        enabled: true
      },
      {
        id: 'browser-agent-001',
        type: 'browser',
        name: 'Browser Agent',
        description: 'Automates web interactions and scraping',
        capabilities: ['web_automation', 'scraping', 'form_filling', 'navigation'],
        enabled: true
      },
      {
        id: 'planner-agent-001',
        type: 'planner',
        name: 'Planner Agent',
        description: 'Breaks down complex tasks into actionable steps',
        capabilities: ['task_decomposition', 'planning', 'estimation'],
        enabled: true
      }
    ];

    agentConfigs.forEach(config => {
      const agent: Agent = {
        config: {
          model: 'claude-3-7-sonnet',
          temperature: 0.7,
          maxTokens: 2000,
          enabled: true,
          capabilities: [],
          ...config
        } as AgentConfig,
        status: 'idle',
        taskHistory: [],
        memory: {
          shortTerm: [],
          longTerm: [],
          workingMemory: {},
          knowledgeBase: []
        },
        performance: {
          tasksCompleted: 0,
          tasksFailed: 0,
          averageTaskDuration: 0,
          successRate: 1.0,
          qualityScore: 1.0,
          efficiency: 1.0
        },
        createdAt: new Date(),
        updatedAt: new Date()
      };

      this.state.agentPool.set(agent.config.id, agent);
    });

    this.state.systemMetrics.activeAgents = this.state.agentPool.size;
  }

  /**
   * Create a new task
   */
  async createTask(params: {
    title: string;
    description: string;
    type: Task['type'];
    priority?: TaskPriority;
    context?: Task['context'];
    parentTaskId?: string;
  }): Promise<Task> {
    const task: Task = {
      id: `task-${++this.taskIdCounter}-${Date.now()}`,
      parentTaskId: params.parentTaskId,
      title: params.title,
      description: params.description,
      type: params.type,
      priority: params.priority || 'medium',
      status: 'queued',
      context: params.context,
      createdBy: this.config.id,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Add to task queue
    this.addToQueue(task);

    // Store in memory
    await this.storeTaskInMemory(task);

    // Emit event
    this.emitEvent({
      id: `event-${Date.now()}`,
      type: 'task_created',
      source: this.config.id,
      data: task,
      timestamp: new Date()
    });

    // Update metrics
    this.state.systemMetrics.totalTasks++;

    return task;
  }

  /**
   * Delegate a task to an appropriate agent
   */
  async delegateTask(task: Task): Promise<void> {
    // Find the best agent for this task
    const agent = this.findBestAgent(task);

    if (!agent) {
      console.error(`No suitable agent found for task: ${task.title}`);
      task.status = 'failed';
      task.result = {
        success: false,
        error: 'No suitable agent available'
      };
      return;
    }

    // Assign task to agent
    task.assignedTo = agent.config.id;
    task.status = 'in_progress';
    task.updatedAt = new Date();

    agent.status = 'executing';
    agent.currentTask = task;

    this.state.activeTasks.set(task.id, task);

    // Send message to agent
    await this.sendMessage({
      from: this.config.id,
      to: agent.config.id,
      type: 'task_assignment',
      content: task,
      priority: task.priority,
      requiresResponse: true
    });

    // Emit event
    this.emitEvent({
      id: `event-${Date.now()}`,
      type: 'task_assigned',
      source: this.config.id,
      data: { task, agent: agent.config.id },
      timestamp: new Date()
    });

    console.log(`✅ Task "${task.title}" delegated to ${agent.config.name}`);
  }

  /**
   * Find the best agent for a task
   */
  private findBestAgent(task: Task): Agent | null {
    const taskTypeToAgentType: Record<string, AgentType> = {
      research: 'research',
      code_generation: 'code',
      code_review: 'code',
      testing: 'code',
      debugging: 'code',
      web_automation: 'browser',
      planning: 'planner',
      documentation: 'code'
    };

    const preferredAgentType = taskTypeToAgentType[task.type] || 'worker';

    // Find idle agents of the preferred type
    const candidates = Array.from(this.state.agentPool.values()).filter(
      agent =>
        agent.config.type === preferredAgentType &&
        agent.config.enabled &&
        agent.status === 'idle'
    );

    if (candidates.length === 0) {
      // Fallback: find any idle agent with matching capabilities
      const fallbackCandidates = Array.from(this.state.agentPool.values()).filter(
        agent => agent.config.enabled && agent.status === 'idle'
      );
      return fallbackCandidates[0] || null;
    }

    // Select the agent with the best performance
    return candidates.sort((a, b) => {
      const scoreA =
        a.performance.successRate * 0.4 +
        a.performance.efficiency * 0.3 +
        a.performance.qualityScore * 0.3;
      const scoreB =
        b.performance.successRate * 0.4 +
        b.performance.efficiency * 0.3 +
        b.performance.qualityScore * 0.3;
      return scoreB - scoreA;
    })[0];
  }

  /**
   * Process the task queue
   */
  async processQueue(): Promise<void> {
    // Process high priority tasks first
    for (const priority of ['high', 'medium', 'low'] as TaskPriority[]) {
      const queue = this.state.taskQueue[priority];

      while (queue.length > 0) {
        const task = queue.shift();
        if (task) {
          await this.delegateTask(task);
        }
      }
    }
  }

  /**
   * Add task to queue
   */
  private addToQueue(task: Task): void {
    this.state.taskQueue[task.priority].push(task);
  }

  /**
   * Handle task completion
   */
  async handleTaskCompletion(taskId: string, success: boolean, result?: any): Promise<void> {
    const task = this.state.activeTasks.get(taskId);
    if (!task) {
      console.error(`Task not found: ${taskId}`);
      return;
    }

    task.status = success ? 'completed' : 'failed';
    task.completedAt = new Date();
    task.result = result;

    // Update agent status
    if (task.assignedTo) {
      const agent = this.state.agentPool.get(task.assignedTo);
      if (agent) {
        agent.status = 'idle';
        agent.currentTask = undefined;
        agent.taskHistory.push(task);

        // Update performance metrics
        if (success) {
          agent.performance.tasksCompleted++;
        } else {
          agent.performance.tasksFailed++;
        }
        agent.performance.successRate =
          agent.performance.tasksCompleted /
          (agent.performance.tasksCompleted + agent.performance.tasksFailed);
      }
    }

    // Remove from active tasks
    this.state.activeTasks.delete(taskId);

    // Update system metrics
    if (success) {
      this.state.systemMetrics.completedTasks++;
    } else {
      this.state.systemMetrics.failedTasks++;
    }

    // Store in memory
    await this.storeTaskCompletionInMemory(task);

    // Emit event
    this.emitEvent({
      id: `event-${Date.now()}`,
      type: success ? 'task_completed' : 'task_failed',
      source: this.config.id,
      data: task,
      timestamp: new Date()
    });

    console.log(
      `${success ? '✅' : '❌'} Task "${task.title}" ${success ? 'completed' : 'failed'}`
    );

    // Check if this unblocks any dependent tasks
    await this.checkDependencies(taskId);
  }

  /**
   * Check if task completion unblocks dependent tasks
   */
  private async checkDependencies(completedTaskId: string): Promise<void> {
    const blockedTasks = this.state.coordinationState.blockedTasks.filter(task =>
      task.dependencies?.includes(completedTaskId)
    );

    for (const task of blockedTasks) {
      const allDependenciesComplete = task.dependencies?.every(depId => {
        const dep = this.state.activeTasks.get(depId);
        return !dep || dep.status === 'completed';
      });

      if (allDependenciesComplete) {
        // Remove from blocked tasks
        this.state.coordinationState.blockedTasks =
          this.state.coordinationState.blockedTasks.filter(t => t.id !== task.id);

        // Add back to queue
        this.addToQueue(task);
      }
    }
  }

  /**
   * Send a message to an agent
   */
  private async sendMessage(params: {
    from: string;
    to: string | string[];
    type: MessageType;
    content: any;
    priority: TaskPriority;
    requiresResponse: boolean;
  }): Promise<AgentMessage> {
    const message: AgentMessage = {
      id: `msg-${++this.messageIdCounter}-${Date.now()}`,
      from: params.from,
      to: params.to,
      type: params.type,
      content: params.content,
      priority: params.priority,
      requiresResponse: params.requiresResponse,
      timestamp: new Date()
    };

    // In a real implementation, this would send the message to the agent
    // For now, we'll just emit an event
    this.emit('message', message);

    return message;
  }

  /**
   * Store task in R2R memory
   */
  private async storeTaskInMemory(task: Task): Promise<void> {
    try {
      const memoryEntry: MemoryEntry = {
        id: task.id,
        content: `Task: ${task.title}\nDescription: ${task.description}\nType: ${task.type}\nPriority: ${task.priority}`,
        type: 'task',
        importance: this.calculateTaskImportance(task),
        timestamp: new Date(),
        metadata: {
          taskId: task.id,
          taskType: task.type,
          priority: task.priority,
          status: task.status
        }
      };

      await this.memoryClient.storeMemory(memoryEntry, this.config.id);
    } catch (error) {
      console.error('Error storing task in memory:', error);
    }
  }

  /**
   * Store task completion in memory
   */
  private async storeTaskCompletionInMemory(task: Task): Promise<void> {
    try {
      const learnings = task.result?.learnings || 'No specific learnings recorded';

      const memoryEntry: MemoryEntry = {
        id: `${task.id}-completion`,
        content: `Task Completed: ${task.title}\nResult: ${task.status}\nLearnings: ${learnings}`,
        type: 'learning',
        importance: task.status === 'completed' ? 0.8 : 0.6,
        timestamp: new Date(),
        metadata: {
          taskId: task.id,
          status: task.status,
          success: task.status === 'completed'
        }
      };

      await this.memoryClient.storeMemory(memoryEntry, this.config.id);
    } catch (error) {
      console.error('Error storing task completion in memory:', error);
    }
  }

  /**
   * Calculate task importance for memory storage
   */
  private calculateTaskImportance(task: Task): number {
    const priorityScores = {
      critical: 1.0,
      high: 0.8,
      medium: 0.6,
      low: 0.4
    };

    return priorityScores[task.priority];
  }

  /**
   * Retrieve relevant context from memory
   */
  async getRelevantContext(query: string, limit: number = 5): Promise<string> {
    try {
      const memories = await this.memoryClient.retrieveMemories({
        agentId: this.config.id,
        query,
        limit,
        minImportance: 0.5
      });

      return memories.map(m => m.content).join('\n\n');
    } catch (error) {
      console.error('Error retrieving context:', error);
      return '';
    }
  }

  /**
   * Make a decision using R2R agentic retrieval
   */
  async makeDecision(params: {
    question: string;
    context?: string;
  }): Promise<{
    decision: string;
    reasoning: string;
    confidence: number;
  }> {
    try {
      const result = await this.memoryClient.agentRetrieval({
        query: params.question,
        model: this.config.model,
        thinkingBudget: this.config.thinkingBudget
      });

      return {
        decision: result.answer,
        reasoning: result.reasoning,
        confidence: 0.85 // Could be calculated from result quality
      };
    } catch (error) {
      console.error('Error making decision:', error);
      return {
        decision: 'Unable to make decision due to error',
        reasoning: error instanceof Error ? error.message : 'Unknown error',
        confidence: 0
      };
    }
  }

  /**
   * Get system status
   */
  getStatus(): {
    boss: AgentConfig;
    metrics: BossAgentState['systemMetrics'];
    agents: Array<{ id: string; name: string; type: AgentType; status: Agent['status'] }>;
    activeTasks: Task[];
    queuedTasks: number;
  } {
    return {
      boss: this.config,
      metrics: this.state.systemMetrics,
      agents: Array.from(this.state.agentPool.values()).map(agent => ({
        id: agent.config.id,
        name: agent.config.name,
        type: agent.config.type,
        status: agent.status
      })),
      activeTasks: Array.from(this.state.activeTasks.values()),
      queuedTasks:
        this.state.taskQueue.high.length +
        this.state.taskQueue.medium.length +
        this.state.taskQueue.low.length
    };
  }

  /**
   * Emit a system event
   */
  private emitEvent(event: SystemEvent): void {
    this.emit('system_event', event);
  }

  /**
   * Start the boss agent
   */
  async start(): Promise<void> {
    console.log('🤖 Boss Agent starting...');

    // Check R2R connection
    const r2rHealthy = await this.memoryClient.healthCheck();
    if (!r2rHealthy) {
      console.warn('⚠️  R2R memory system not available. Running without advanced memory.');
    } else {
      console.log('✅ R2R memory system connected');
    }

    // Start processing queue
    setInterval(() => {
      this.processQueue();
    }, 5000); // Process queue every 5 seconds

    // Update metrics
    setInterval(() => {
      this.updateMetrics();
    }, 10000); // Update metrics every 10 seconds

    console.log('✅ Boss Agent started successfully');

    this.emitEvent({
      id: `event-${Date.now()}`,
      type: 'agent_started',
      source: this.config.id,
      data: { config: this.config },
      timestamp: new Date()
    });
  }

  /**
   * Update system metrics
   */
  private updateMetrics(): void {
    this.state.systemMetrics.lastUpdated = new Date();
    this.state.systemMetrics.activeAgents = Array.from(this.state.agentPool.values()).filter(
      a => a.status !== 'idle'
    ).length;

    const totalMemory =
      this.state.systemMetrics.memoryUsage.shortTerm +
      this.state.systemMetrics.memoryUsage.longTerm;
    this.state.systemMetrics.memoryUsage.total = totalMemory;

    const queuedTasks =
      this.state.taskQueue.high.length +
      this.state.taskQueue.medium.length +
      this.state.taskQueue.low.length;
    this.state.systemMetrics.systemLoad = (this.state.activeTasks.size + queuedTasks) / 100;
  }

  /**
   * Stop the boss agent
   */
  async stop(): Promise<void> {
    console.log('🛑 Boss Agent stopping...');

    this.emitEvent({
      id: `event-${Date.now()}`,
      type: 'agent_stopped',
      source: this.config.id,
      data: {},
      timestamp: new Date()
    });

    this.removeAllListeners();
  }
}
