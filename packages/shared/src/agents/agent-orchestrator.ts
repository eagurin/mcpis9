/**
 * Agent Orchestrator - System coordinator
 *
 * Initializes and coordinates all agents in the system
 */

import { BossAgent } from './boss-agent';
import { CodeAgent } from './code-agent';
import { ResearchAgent } from './research-agent';
import { TaskManagerAgent } from './task-manager-agent';
import { DataAgent } from './data-agent';
import { R2RMemoryService, initR2RMemory } from '../services/r2r-memory.service';
import type { AgentConfig } from '../types/agent.types';

export interface OrchestratorConfig {
  r2r?: {
    baseUrl: string;
    apiKey?: string;
  };
  linear?: {
    apiKey: string;
    teamId?: string;
  };
  aiProviders: {
    anthropic?: { apiKey: string };
    openai?: { apiKey: string };
    google?: { apiKey: string };
  };
}

export class AgentOrchestrator {
  private bossAgent: BossAgent;
  private codeAgent: CodeAgent;
  private researchAgent: ResearchAgent;
  private taskManagerAgent: TaskManagerAgent;
  private dataAgent: DataAgent;
  private memory?: R2RMemoryService;
  private isInitialized: boolean = false;

  constructor(private config: OrchestratorConfig) {
    // Initialize R2R memory if configured
    if (config.r2r) {
      this.memory = initR2RMemory(config.r2r);
    }

    // Create boss agent
    this.bossAgent = new BossAgent(
      {
        id: 'boss-agent-main',
        type: 'boss',
        name: 'Boss Agent',
        description: 'Main orchestrator that delegates tasks to worker agents',
        capabilities: ['orchestration', 'planning', 'delegation', 'conversation'],
        maxConcurrentTasks: 10,
        timeout: 120000, // 2 minutes
        retryAttempts: 1,
        model: {
          provider: 'anthropic',
          model: 'claude-3-5-sonnet-20241022',
        },
      },
      this.memory
    );

    // Create worker agents
    this.codeAgent = new CodeAgent(this.memory);
    this.researchAgent = new ResearchAgent(this.memory);
    this.taskManagerAgent = new TaskManagerAgent(this.memory, config.linear?.apiKey);
    this.dataAgent = new DataAgent(this.memory);

    // Register workers with boss
    this.bossAgent.registerWorker(this.codeAgent);
    this.bossAgent.registerWorker(this.researchAgent);
    this.bossAgent.registerWorker(this.taskManagerAgent);
    this.bossAgent.registerWorker(this.dataAgent);
  }

  /**
   * Initialize the orchestrator and all agents
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) {
      console.log('[Orchestrator] Already initialized');
      return;
    }

    console.log('[Orchestrator] Initializing agent system...');

    try {
      // Connect to R2R if configured
      if (this.memory) {
        await this.memory.connect();
      }

      // Start all agents
      await Promise.all([
        this.bossAgent.start(),
        this.codeAgent.start(),
        this.researchAgent.start(),
        this.taskManagerAgent.start(),
        this.dataAgent.start(),
      ]);

      this.isInitialized = true;
      console.log('[Orchestrator] All agents initialized successfully');
    } catch (error) {
      console.error('[Orchestrator] Initialization failed:', error);
      throw error;
    }
  }

  /**
   * Process user request through the agent system
   */
  async processRequest(userRequest: string, conversationId?: string): Promise<string> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    return this.bossAgent.orchestrate(userRequest, conversationId);
  }

  /**
   * Get status of all agents
   */
  getSystemStatus(): {
    boss: any;
    workers: Record<string, any>;
    memory: { connected: boolean };
  } {
    return {
      boss: this.bossAgent.getState(),
      workers: this.bossAgent.getWorkerStatus(),
      memory: {
        connected: this.memory?.isReady() || false,
      },
    };
  }

  /**
   * Shutdown the orchestrator and all agents
   */
  async shutdown(): Promise<void> {
    console.log('[Orchestrator] Shutting down agent system...');

    try {
      // Stop all agents
      await Promise.all([
        this.bossAgent.stop(),
        this.codeAgent.stop(),
        this.researchAgent.stop(),
        this.taskManagerAgent.stop(),
        this.dataAgent.stop(),
      ]);

      // Disconnect from R2R
      if (this.memory) {
        this.memory.disconnect();
      }

      this.isInitialized = false;
      console.log('[Orchestrator] Shutdown complete');
    } catch (error) {
      console.error('[Orchestrator] Shutdown failed:', error);
      throw error;
    }
  }

  /**
   * Get boss agent for direct access
   */
  getBossAgent(): BossAgent {
    return this.bossAgent;
  }

  /**
   * Get worker agents
   */
  getWorkerAgents() {
    return {
      code: this.codeAgent,
      research: this.researchAgent,
      taskManager: this.taskManagerAgent,
      data: this.dataAgent,
    };
  }

  /**
   * Get memory service
   */
  getMemory(): R2RMemoryService | undefined {
    return this.memory;
  }

  /**
   * Check if system is ready
   */
  isReady(): boolean {
    return this.isInitialized;
  }
}

// Singleton instance
let orchestratorInstance: AgentOrchestrator | null = null;

/**
 * Initialize the global orchestrator
 */
export function initOrchestrator(config: OrchestratorConfig): AgentOrchestrator {
  if (!orchestratorInstance) {
    orchestratorInstance = new AgentOrchestrator(config);
  }
  return orchestratorInstance;
}

/**
 * Get the global orchestrator instance
 */
export function getOrchestrator(): AgentOrchestrator | null {
  return orchestratorInstance;
}

/**
 * Shutdown and reset the global orchestrator
 */
export async function resetOrchestrator(): Promise<void> {
  if (orchestratorInstance) {
    await orchestratorInstance.shutdown();
    orchestratorInstance = null;
  }
}
