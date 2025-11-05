/**
 * Boss Agent - Centralized Orchestrator
 *
 * Main decision-maker that analyzes requests, creates plans, and delegates to worker agents
 */

import { anthropic } from '@ai-sdk/anthropic';
import { openai } from '@ai-sdk/openai';
import { google } from '@ai-sdk/google';
import { generateText } from 'ai';
import { BaseAgent } from './base-agent';
import type {
  AgentConfig,
  AgentMessage,
  Task,
  OrchestratorPlan,
  UserIntent,
  ExecutionStrategy,
  TaskType,
  ConversationContext,
} from '../types/agent.types';
import type { R2RMemoryService } from '../services/r2r-memory.service';
import { generateId } from '../utils';

export class BossAgent extends BaseAgent {
  private workerAgents: Map<string, BaseAgent> = new Map();
  private conversationContexts: Map<string, ConversationContext> = new Map();

  constructor(config: AgentConfig, memory?: R2RMemoryService) {
    super(config, memory);
  }

  protected setupMessageHandlers(): void {
    this.messageHandlers.set('request', async (message) => {
      await this.handleRequest(message);
    });

    this.messageHandlers.set('response', async (message) => {
      await this.handleWorkerResponse(message);
    });
  }

  /**
   * Register a worker agent
   */
  registerWorker(agent: BaseAgent): void {
    const agentState = agent.getState();
    this.workerAgents.set(agentState.agent.type, agent);
    this.log('info', `Registered worker agent: ${agentState.agent.name}`);
  }

  /**
   * Orchestrate user request
   */
  async orchestrate(userRequest: string, conversationId?: string): Promise<string> {
    const startTime = Date.now();
    this.log('info', `Orchestrating request: "${userRequest.substring(0, 100)}..."`);

    try {
      // Get conversation context from memory
      let context = '';
      if (conversationId && this.memory?.isReady()) {
        const memoryEntries = await this.memory.getConversationContext(conversationId);
        if (memoryEntries.length > 0) {
          context = memoryEntries
            .map((entry) => entry.content)
            .slice(-5) // Last 5 messages for context
            .join('\n\n');
        }
      }

      // Analyze intent and create plan
      const plan = await this.createPlan(userRequest, context);
      this.log('info', `Created plan with ${plan.tasks.length} tasks`, {
        intent: plan.intent,
        strategy: plan.execution.strategy,
      });

      // Execute plan
      const results = await this.executePlan(plan);

      // Synthesize response
      const response = await this.synthesizeResponse(plan, results, userRequest);

      // Store in memory
      if (conversationId && this.memory?.isReady()) {
        await this.memory.storeMessage(conversationId, 'user', userRequest);
        await this.memory.storeMessage(conversationId, 'assistant', response);
      }

      const duration = Date.now() - startTime;
      this.log('info', `Orchestration completed in ${duration}ms`);

      return response;
    } catch (error) {
      this.log('error', 'Orchestration failed', error);
      throw error;
    }
  }

  /**
   * Analyze user request and create execution plan
   */
  private async createPlan(userRequest: string, context: string = ''): Promise<OrchestratorPlan> {
    const prompt = `You are a Boss Agent orchestrator. Analyze this user request and create an execution plan.

${context ? `Previous conversation context:\n${context}\n\n` : ''}User Request: ${userRequest}

Determine:
1. User intent (code_task, information_retrieval, project_management, data_operation, multi_step_workflow, conversation)
2. Required tasks and which worker agent should handle them:
   - Code Agent: code_generation, code_review, code_refactor, code_debug
   - Research Agent: research_web, research_docs, research_knowledge
   - Task Manager Agent: task_create, task_update, task_query (Linear integration)
   - Data Agent: data_query, data_analysis, data_transform
3. Execution strategy (sequential, parallel, pipeline, conditional, iterative)
4. Task dependencies

Respond in JSON format:
{
  "intent": "code_task" | "information_retrieval" | "project_management" | "data_operation" | "multi_step_workflow" | "conversation",
  "tasks": [
    {
      "type": "task_type",
      "description": "task description",
      "assignedTo": "code" | "research" | "task_manager" | "data",
      "input": {},
      "priority": "low" | "medium" | "high" | "critical",
      "dependencies": []
    }
  ],
  "execution": {
    "strategy": "sequential" | "parallel" | "pipeline" | "conditional" | "iterative",
    "estimatedDuration": 5000,
    "riskLevel": "low" | "medium" | "high"
  }
}`;

    try {
      const model = this.getAIModel();
      const { text } = await generateText({
        model,
        prompt,
        maxTokens: 2000,
        temperature: 0.3,
      });

      // Parse response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('Failed to parse plan from AI response');
      }

      const planData = JSON.parse(jsonMatch[0]);

      // Create full plan object
      const plan: OrchestratorPlan = {
        id: generateId(),
        userRequest,
        intent: planData.intent,
        tasks: planData.tasks.map((t: any) => ({
          id: generateId(),
          type: t.type,
          description: t.description,
          input: t.input,
          assignedTo: t.assignedTo,
          status: 'pending',
          createdAt: Date.now(),
          priority: t.priority || 'medium',
          dependencies: t.dependencies || [],
        })),
        execution: planData.execution,
        createdAt: Date.now(),
      };

      return plan;
    } catch (error) {
      this.log('warn', 'AI planning failed, using fallback', error);
      // Fallback: simple conversation plan
      return {
        id: generateId(),
        userRequest,
        intent: 'conversation',
        tasks: [
          {
            id: generateId(),
            type: 'conversation',
            description: 'Direct conversation response',
            input: { message: userRequest },
            status: 'pending',
            createdAt: Date.now(),
            priority: 'medium',
          },
        ],
        execution: {
          strategy: 'sequential',
          estimatedDuration: 3000,
          riskLevel: 'low',
        },
        createdAt: Date.now(),
      };
    }
  }

  /**
   * Execute orchestrator plan
   */
  private async executePlan(plan: OrchestratorPlan): Promise<any[]> {
    this.log('info', `Executing plan with ${plan.execution.strategy} strategy`);

    switch (plan.execution.strategy) {
      case 'parallel':
        return this.executeParallel(plan.tasks);
      case 'pipeline':
        return this.executePipeline(plan.tasks);
      case 'sequential':
      default:
        return this.executeSequential(plan.tasks);
    }
  }

  /**
   * Execute tasks sequentially
   */
  private async executeSequential(tasks: Task[]): Promise<any[]> {
    const results: any[] = [];

    for (const task of tasks) {
      this.log('info', `Executing task: ${task.description}`);

      if (task.assignedTo && task.assignedTo !== 'boss') {
        const agent = this.workerAgents.get(task.assignedTo);
        if (!agent) {
          throw new Error(`Worker agent not found: ${task.assignedTo}`);
        }
        const result = await agent.executeTask(task);
        results.push(result);
      } else {
        // Boss handles conversation tasks directly
        const result = await this.processTask(task);
        results.push(result);
      }
    }

    return results;
  }

  /**
   * Execute tasks in parallel
   */
  private async executeParallel(tasks: Task[]): Promise<any[]> {
    this.log('info', `Executing ${tasks.length} tasks in parallel`);

    const promises = tasks.map(async (task) => {
      if (task.assignedTo && task.assignedTo !== 'boss') {
        const agent = this.workerAgents.get(task.assignedTo);
        if (!agent) {
          throw new Error(`Worker agent not found: ${task.assignedTo}`);
        }
        return agent.executeTask(task);
      } else {
        return this.processTask(task);
      }
    });

    return Promise.all(promises);
  }

  /**
   * Execute tasks as pipeline (output of one feeds into next)
   */
  private async executePipeline(tasks: Task[]): Promise<any[]> {
    this.log('info', `Executing ${tasks.length} tasks as pipeline`);

    const results: any[] = [];
    let previousResult: any = null;

    for (const task of tasks) {
      // Feed previous result as input
      if (previousResult) {
        task.input = { ...task.input, previousResult };
      }

      if (task.assignedTo && task.assignedTo !== 'boss') {
        const agent = this.workerAgents.get(task.assignedTo);
        if (!agent) {
          throw new Error(`Worker agent not found: ${task.assignedTo}`);
        }
        previousResult = await agent.executeTask(task);
      } else {
        previousResult = await this.processTask(task);
      }

      results.push(previousResult);
    }

    return results;
  }

  /**
   * Process task (for conversation and planning tasks)
   */
  protected async processTask(task: Task): Promise<any> {
    if (task.type === 'conversation' || task.type === 'planning') {
      const model = this.getAIModel();
      const { text } = await generateText({
        model,
        prompt: task.input.message || task.description,
        maxTokens: 1000,
        temperature: 0.7,
      });

      return { response: text };
    }

    throw new Error(`Boss agent cannot process task type: ${task.type}`);
  }

  /**
   * Synthesize final response from plan results
   */
  private async synthesizeResponse(
    plan: OrchestratorPlan,
    results: any[],
    userRequest: string
  ): Promise<string> {
    // For simple conversation, return directly
    if (plan.intent === 'conversation' && results.length === 1) {
      return results[0]?.response || results[0]?.toString() || 'Task completed.';
    }

    // For complex tasks, synthesize from multiple results
    const prompt = `Synthesize a clear, concise response for the user based on these task results.

User Request: ${userRequest}

Task Results:
${results.map((r, i) => `Task ${i + 1}: ${JSON.stringify(r, null, 2)}`).join('\n\n')}

Provide a helpful response that:
1. Directly answers the user's request
2. Summarizes key findings or results
3. Is clear and actionable
4. Doesn't include implementation details unless relevant

Response:`;

    try {
      const model = this.getAIModel();
      const { text } = await generateText({
        model,
        prompt,
        maxTokens: 1000,
        temperature: 0.5,
      });

      return text;
    } catch (error) {
      this.log('warn', 'Synthesis failed, using raw results', error);
      // Fallback: return formatted results
      return results.map((r, i) => `Result ${i + 1}: ${JSON.stringify(r)}`).join('\n\n');
    }
  }

  /**
   * Handle request from user or other agents
   */
  private async handleRequest(message: AgentMessage): Promise<void> {
    // Process user request
    const result = await this.orchestrate(
      message.content,
      message.metadata.conversationId
    );

    // Send response back
    // Note: In a real system, this would send via message bus
    this.log('info', 'Request handled successfully');
  }

  /**
   * Handle response from worker agent
   */
  private async handleWorkerResponse(message: AgentMessage): Promise<void> {
    this.log('info', `Received response from ${message.from}`, {
      correlationId: message.metadata.correlationId,
    });
    // In a real system, correlate with pending tasks and continue orchestration
  }

  /**
   * Get AI model based on configuration
   */
  private getAIModel(): any {
    const provider = this.config.model?.provider || 'anthropic';
    const modelName = this.config.model?.model || 'claude-3-5-sonnet-20241022';

    switch (provider) {
      case 'anthropic':
        return anthropic(modelName);
      case 'openai':
        return openai(modelName);
      case 'google':
        return google(modelName);
      default:
        return anthropic('claude-3-5-sonnet-20241022');
    }
  }

  /**
   * Get worker agent status
   */
  getWorkerStatus(): Record<string, any> {
    const status: Record<string, any> = {};

    for (const [type, agent] of this.workerAgents) {
      status[type] = agent.getState();
    }

    return status;
  }
}
