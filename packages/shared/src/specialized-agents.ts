/**
 * Specialized Agent Implementations
 * Each agent type has specific capabilities and execution logic
 */

import type {
  Agent,
  Task,
  TaskResult,
  Artifact,
  MemoryEntry
} from './agent-types';
import { R2RMemoryClient } from './r2r-client';

/**
 * Base Agent Class
 */
export abstract class BaseAgent {
  protected agent: Agent;
  protected memoryClient: R2RMemoryClient;

  constructor(agent: Agent, memoryClient: R2RMemoryClient) {
    this.agent = agent;
    this.memoryClient = memoryClient;
  }

  /**
   * Execute a task
   */
  abstract executeTask(task: Task): Promise<TaskResult>;

  /**
   * Store execution result in memory
   */
  protected async storeInMemory(task: Task, result: TaskResult): Promise<void> {
    const memoryEntry: MemoryEntry = {
      id: `${task.id}-result`,
      content: `Executed ${task.type}: ${task.title}\nResult: ${result.success ? 'Success' : 'Failed'}\nOutput: ${JSON.stringify(result.output)}`,
      type: 'task',
      importance: result.success ? 0.7 : 0.5,
      timestamp: new Date(),
      metadata: {
        taskId: task.id,
        agentId: this.agent.config.id,
        taskType: task.type,
        success: result.success
      }
    };

    await this.memoryClient.storeMemory(memoryEntry, this.agent.config.id);
  }

  /**
   * Get relevant context from memory
   */
  protected async getContext(query: string): Promise<string> {
    const memories = await this.memoryClient.retrieveMemories({
      agentId: this.agent.config.id,
      query,
      limit: 5,
      minImportance: 0.5
    });

    return memories.map(m => m.content).join('\n\n');
  }
}

/**
 * Research Agent - Information gathering and analysis
 */
export class ResearchAgent extends BaseAgent {
  async executeTask(task: Task): Promise<TaskResult> {
    console.log(`🔍 Research Agent executing: ${task.title}`);

    try {
      const startTime = Date.now();

      // Use R2R's agentic retrieval for research
      const result = await this.memoryClient.agentRetrieval({
        query: task.description,
        model: this.agent.config.model,
        thinkingBudget: this.agent.config.thinkingBudget
      });

      const duration = Date.now() - startTime;

      const taskResult: TaskResult = {
        success: true,
        output: {
          findings: result.answer,
          reasoning: result.reasoning,
          sources: result.sources
        },
        artifacts: [
          {
            type: 'report',
            name: `research-report-${task.id}.md`,
            content: this.formatResearchReport(result.answer, result.sources)
          }
        ],
        metrics: {
          duration,
          quality: 0.85
        },
        learnings: 'Completed research using R2R agentic retrieval'
      };

      await this.storeInMemory(task, taskResult);

      return taskResult;
    } catch (error) {
      console.error('Research agent error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        metrics: {
          duration: 0
        }
      };
    }
  }

  private formatResearchReport(findings: string, sources: any[]): string {
    let report = `# Research Report\n\n`;
    report += `## Findings\n\n${findings}\n\n`;

    if (sources && sources.length > 0) {
      report += `## Sources\n\n`;
      sources.forEach((source, i) => {
        report += `${i + 1}. ${source.content.substring(0, 100)}...\n`;
      });
    }

    return report;
  }
}

/**
 * Code Agent - Code generation, review, and debugging
 */
export class CodeAgent extends BaseAgent {
  async executeTask(task: Task): Promise<TaskResult> {
    console.log(`💻 Code Agent executing: ${task.title}`);

    try {
      const startTime = Date.now();

      // Get relevant code context from memory
      const context = await this.getContext(task.description);

      // Use R2R RAG for code generation with context
      const result = await this.memoryClient.rag({
        query: `${task.description}\n\nContext:\n${context}`,
        model: this.agent.config.model,
        temperature: this.agent.config.temperature,
        maxTokens: this.agent.config.maxTokens
      });

      const duration = Date.now() - startTime;

      // Extract code from result
      const code = this.extractCode(result.answer);

      const taskResult: TaskResult = {
        success: true,
        output: {
          code,
          explanation: result.answer,
          sources: result.sources
        },
        artifacts: code
          ? [
              {
                type: 'code',
                name: this.generateFileName(task),
                content: code
              }
            ]
          : [],
        metrics: {
          duration,
          quality: 0.8
        },
        learnings: 'Generated code using RAG with contextual knowledge'
      };

      await this.storeInMemory(task, taskResult);

      return taskResult;
    } catch (error) {
      console.error('Code agent error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        metrics: {
          duration: 0
        }
      };
    }
  }

  private extractCode(text: string): string {
    const codeBlockRegex = /```[\w]*\n([\s\S]*?)\n```/g;
    const matches = text.match(codeBlockRegex);

    if (matches) {
      return matches
        .map(match => match.replace(/```[\w]*\n/, '').replace(/\n```/, ''))
        .join('\n\n');
    }

    return '';
  }

  private generateFileName(task: Task): string {
    const timestamp = Date.now();
    const taskType = task.type.replace('_', '-');
    return `${taskType}-${timestamp}.ts`;
  }
}

/**
 * Browser Agent - Web automation and scraping
 */
export class BrowserAgent extends BaseAgent {
  async executeTask(task: Task): Promise<TaskResult> {
    console.log(`🌐 Browser Agent executing: ${task.title}`);

    try {
      const startTime = Date.now();

      // For now, return a mock implementation
      // In production, this would use Playwright or Puppeteer
      const mockData = {
        url: task.context?.resources?.[0]?.identifier || 'https://example.com',
        action: task.description,
        result: 'Browser automation executed successfully'
      };

      const duration = Date.now() - startTime;

      const taskResult: TaskResult = {
        success: true,
        output: mockData,
        artifacts: [
          {
            type: 'screenshot',
            name: `screenshot-${task.id}.png`,
            content: Buffer.from('mock-screenshot-data')
          }
        ],
        metrics: {
          duration,
          quality: 0.75
        },
        learnings: 'Executed browser automation task',
        nextSteps: ['Process extracted data', 'Store results in database']
      };

      await this.storeInMemory(task, taskResult);

      return taskResult;
    } catch (error) {
      console.error('Browser agent error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        metrics: {
          duration: 0
        }
      };
    }
  }
}

/**
 * Planner Agent - Task decomposition and planning
 */
export class PlannerAgent extends BaseAgent {
  async executeTask(task: Task): Promise<TaskResult> {
    console.log(`📋 Planner Agent executing: ${task.title}`);

    try {
      const startTime = Date.now();

      // Use R2R agentic retrieval to create a comprehensive plan
      const result = await this.memoryClient.agentRetrieval({
        query: `Break down this task into detailed, actionable steps:\n${task.description}`,
        model: this.agent.config.model,
        thinkingBudget: this.agent.config.thinkingBudget
      });

      const steps = this.parseSteps(result.answer);

      const duration = Date.now() - startTime;

      const taskResult: TaskResult = {
        success: true,
        output: {
          plan: result.answer,
          steps,
          reasoning: result.reasoning,
          estimatedDuration: this.estimateDuration(steps)
        },
        artifacts: [
          {
            type: 'document',
            name: `plan-${task.id}.md`,
            content: this.formatPlan(result.answer, steps)
          }
        ],
        metrics: {
          duration,
          quality: 0.9
        },
        learnings: 'Created detailed task plan with reasoning',
        nextSteps: steps.map(s => s.title)
      };

      await this.storeInMemory(task, taskResult);

      return taskResult;
    } catch (error) {
      console.error('Planner agent error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        metrics: {
          duration: 0
        }
      };
    }
  }

  private parseSteps(planText: string): Array<{ title: string; description: string }> {
    // Simple parsing - extract numbered steps
    const stepRegex = /(\d+)\.\s+(.*?)(?=\n\d+\.|\n\n|$)/gs;
    const matches = Array.from(planText.matchAll(stepRegex));

    return matches.map(match => ({
      title: match[2].split('\n')[0].trim(),
      description: match[2].trim()
    }));
  }

  private estimateDuration(steps: any[]): number {
    // Simple estimation: 30 minutes per step
    return steps.length * 30;
  }

  private formatPlan(plan: string, steps: any[]): string {
    let formatted = `# Task Execution Plan\n\n${plan}\n\n`;
    formatted += `## Summary\n\n`;
    formatted += `- Total Steps: ${steps.length}\n`;
    formatted += `- Estimated Duration: ${this.estimateDuration(steps)} minutes\n\n`;
    formatted += `## Next Steps\n\n`;
    steps.forEach((step, i) => {
      formatted += `${i + 1}. ${step.title}\n`;
    });

    return formatted;
  }
}

/**
 * Worker Agent - General purpose task execution
 */
export class WorkerAgent extends BaseAgent {
  async executeTask(task: Task): Promise<TaskResult> {
    console.log(`⚙️  Worker Agent executing: ${task.title}`);

    try {
      const startTime = Date.now();

      // Get context and use RAG
      const context = await this.getContext(task.description);

      const result = await this.memoryClient.rag({
        query: `Execute this task:\n${task.description}\n\nContext:\n${context}`,
        model: this.agent.config.model,
        temperature: this.agent.config.temperature,
        maxTokens: this.agent.config.maxTokens
      });

      const duration = Date.now() - startTime;

      const taskResult: TaskResult = {
        success: true,
        output: {
          result: result.answer,
          sources: result.sources
        },
        metrics: {
          duration,
          quality: 0.75
        },
        learnings: 'Completed general task execution'
      };

      await this.storeInMemory(task, taskResult);

      return taskResult;
    } catch (error) {
      console.error('Worker agent error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        metrics: {
          duration: 0
        }
      };
    }
  }
}

/**
 * Agent Factory - Create specialized agents
 */
export class AgentFactory {
  static createAgent(
    agent: Agent,
    memoryClient: R2RMemoryClient
  ): BaseAgent {
    switch (agent.config.type) {
      case 'research':
        return new ResearchAgent(agent, memoryClient);
      case 'code':
        return new CodeAgent(agent, memoryClient);
      case 'browser':
        return new BrowserAgent(agent, memoryClient);
      case 'planner':
        return new PlannerAgent(agent, memoryClient);
      case 'worker':
        return new WorkerAgent(agent, memoryClient);
      default:
        return new WorkerAgent(agent, memoryClient);
    }
  }
}
