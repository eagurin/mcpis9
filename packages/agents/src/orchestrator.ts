/**
 * Agent Orchestrator - главный интерфейс для работы с системой агентов
 */

import type {
  AgentTask,
  AgentTaskResult,
  AppConfig,
  R2RConfig,
  AgentType,
  AgentRole,
} from '@mcpis9/shared';
import { BossAgent } from './agents/boss-agent';
import { CodeAgent } from './agents/workers/code-agent';
import { ResearchAgent } from './agents/workers/research-agent';
import { AnalysisAgent } from './agents/workers/analysis-agent';
import { CreativeAgent } from './agents/workers/creative-agent';
import { DevOpsAgent } from './agents/workers/devops-agent';
import { BaseAgent } from './agents/base-agent';
import { MemoryManager } from './memory/memory-manager';
import { R2RClient } from './memory/r2r-client';
import { ToolRegistry } from './tools/tool-registry';

export interface OrchestratorConfig {
  appConfig?: AppConfig;
  r2rConfig?: R2RConfig;
  enableR2R?: boolean;
  maxShortTermMemory?: number;
}

export class AgentOrchestrator {
  private bossAgent: BossAgent;
  private workers: Map<AgentType, BaseAgent>;
  private memory: MemoryManager;
  private toolRegistry: ToolRegistry;
  private r2rClient?: R2RClient;

  constructor(config: OrchestratorConfig = {}) {
    // Инициализация инструментов
    this.toolRegistry = new ToolRegistry();

    // Инициализация R2R если включено
    if (config.enableR2R && config.r2rConfig) {
      this.r2rClient = new R2RClient(config.r2rConfig);
    }

    // Инициализация памяти
    this.memory = new MemoryManager(
      config.maxShortTermMemory || 50,
      this.r2rClient
    );

    // Создаем Boss Agent
    this.bossAgent = new BossAgent(this.memory, this.toolRegistry);

    // Создаем и регистрируем worker-агентов
    this.workers = new Map();
    this.initializeWorkers();
  }

  /**
   * Инициализация worker-агентов
   */
  private initializeWorkers(): void {
    const workerConfigs: Array<{
      type: AgentType;
      agent: BaseAgent;
    }> = [
      {
        type: 'code',
        agent: new CodeAgent(
          this.createWorkerRole('code'),
          this.memory,
          this.toolRegistry
        ),
      },
      {
        type: 'research',
        agent: new ResearchAgent(
          this.createWorkerRole('research'),
          this.memory,
          this.toolRegistry
        ),
      },
      {
        type: 'analysis',
        agent: new AnalysisAgent(
          this.createWorkerRole('analysis'),
          this.memory,
          this.toolRegistry
        ),
      },
      {
        type: 'creative',
        agent: new CreativeAgent(
          this.createWorkerRole('creative'),
          this.memory,
          this.toolRegistry
        ),
      },
      {
        type: 'devops',
        agent: new DevOpsAgent(
          this.createWorkerRole('devops'),
          this.memory,
          this.toolRegistry
        ),
      },
    ];

    for (const { type, agent } of workerConfigs) {
      this.workers.set(type, agent);
      this.bossAgent.registerWorker(agent);
    }
  }

  /**
   * Создать роль для worker-агента
   */
  private createWorkerRole(type: AgentType): AgentRole {
    const roles: Record<AgentType, Omit<AgentRole, 'type'>> = {
      boss: {
        name: 'Boss Agent',
        description: 'Orchestrates multiple agents',
        capabilities: [],
        systemPrompt: '',
      },
      code: {
        name: 'Code Agent',
        description: 'Expert in programming and software development',
        capabilities: [
          'Write code in multiple languages',
          'Debug and fix errors',
          'Refactor code',
          'Review code quality',
          'Implement algorithms',
        ],
        systemPrompt: `You are a Code Agent specialized in software development. Your expertise includes:
- Writing clean, efficient, and maintainable code
- Multiple programming languages and frameworks
- Best practices and design patterns
- Testing and debugging
- Code review and optimization

Always provide well-documented code with clear explanations.`,
      },
      research: {
        name: 'Research Agent',
        description: 'Expert in information gathering and research',
        capabilities: [
          'Search and gather information',
          'Analyze sources',
          'Fact-checking',
          'Synthesize findings',
          'Provide citations',
        ],
        systemPrompt: `You are a Research Agent specialized in information gathering and analysis. Your expertise includes:
- Comprehensive information search
- Source evaluation and verification
- Fact-checking and validation
- Synthesis of multiple sources
- Clear and structured reporting

Always provide well-researched and verified information.`,
      },
      analysis: {
        name: 'Analysis Agent',
        description: 'Expert in data analysis and insights',
        capabilities: [
          'Data analysis',
          'Pattern recognition',
          'Statistical analysis',
          'Insight extraction',
          'Recommendations',
        ],
        systemPrompt: `You are an Analysis Agent specialized in data analysis and insight extraction. Your expertise includes:
- Identifying patterns and trends
- Statistical analysis
- Drawing meaningful conclusions
- Providing actionable insights
- Data-driven recommendations

Always provide thorough analysis with clear reasoning.`,
      },
      creative: {
        name: 'Creative Agent',
        description: 'Expert in content creation and ideation',
        capabilities: [
          'Content creation',
          'Brainstorming',
          'Creative writing',
          'Design concepts',
          'Innovation',
        ],
        systemPrompt: `You are a Creative Agent specialized in content creation and creative thinking. Your expertise includes:
- Original and engaging content
- Creative problem-solving
- Brainstorming innovative ideas
- Storytelling and narrative
- Design and aesthetics

Always provide creative and engaging output.`,
      },
      devops: {
        name: 'DevOps Agent',
        description: 'Expert in infrastructure and operations',
        capabilities: [
          'Infrastructure design',
          'Deployment strategies',
          'CI/CD pipelines',
          'Monitoring and logging',
          'Security best practices',
        ],
        systemPrompt: `You are a DevOps Agent specialized in infrastructure and operations. Your expertise includes:
- Cloud infrastructure design
- Containerization and orchestration
- CI/CD automation
- Monitoring and observability
- Security and compliance

Always consider scalability, reliability, and security.`,
      },
    };

    return {
      type,
      ...roles[type],
    };
  }

  /**
   * Выполнить задачу через Boss Agent
   */
  async executeTask(description: string, requirements: string[] = []): Promise<AgentTaskResult> {
    const task: AgentTask = {
      taskId: `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: 'main',
      description,
      context: '',
      requirements,
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    return await this.bossAgent.executeTask(task);
  }

  /**
   * Выполнить задачу напрямую через конкретного worker-агента
   */
  async executeWithWorker(
    agentType: AgentType,
    description: string,
    requirements: string[] = []
  ): Promise<AgentTaskResult> {
    const worker = this.workers.get(agentType);

    if (!worker) {
      throw new Error(`Worker agent ${agentType} not found`);
    }

    const task: AgentTask = {
      taskId: `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: 'main',
      description,
      context: '',
      requirements,
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    return await worker.executeTask(task);
  }

  /**
   * Получить Boss Agent
   */
  getBossAgent(): BossAgent {
    return this.bossAgent;
  }

  /**
   * Получить worker-агента по типу
   */
  getWorker(type: AgentType): BaseAgent | undefined {
    return this.workers.get(type);
  }

  /**
   * Получить всех worker-агентов
   */
  getAllWorkers(): Map<AgentType, BaseAgent> {
    return this.workers;
  }

  /**
   * Получить менеджер памяти
   */
  getMemoryManager(): MemoryManager {
    return this.memory;
  }

  /**
   * Получить реестр инструментов
   */
  getToolRegistry(): ToolRegistry {
    return this.toolRegistry;
  }

  /**
   * Проверить здоровье R2R сервиса
   */
  async checkR2RHealth(): Promise<boolean> {
    if (!this.r2rClient) {
      return false;
    }
    return await this.r2rClient.health();
  }

  /**
   * Сброс состояния всех агентов
   */
  resetAll(): void {
    this.bossAgent.reset();
    for (const worker of this.workers.values()) {
      worker.reset();
    }
  }
}
