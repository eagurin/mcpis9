#!/usr/bin/env bun

import type { ParsedGitHubContext } from "../github/context";
import type { FetchDataResult } from "../github/data/fetcher";

export interface AgentCapabilities {
  triggerPhrases: string[];
  eventTypes: string[];
  permissions: string[];
  tools: string[];
  maxComplexity: 'low' | 'medium' | 'high';
  canEscalate: boolean;
  escalationTargets?: string[];
}

export interface AgentMetadata {
  id: string;
  name: string;
  role: string;
  description: string;
  avatar: string;
  capabilities: AgentCapabilities;
  model?: string;
  fallbackModel?: string;
}

export interface AgentContext {
  agent: AgentMetadata;
  githubContext: ParsedGitHubContext;
  githubData: FetchDataResult;
  requestComplexity: 'low' | 'medium' | 'high';
  collaboratingAgents?: string[];
}

/**
 * Virtual IT Company Agent Registry
 * Manages all AI agents in the virtual company structure
 */
export class AgentRegistry {
  private static agents: Map<string, AgentMetadata> = new Map();

  static {
    this.registerDefaultAgents();
  }

  /**
   * Register all default company agents
   */
  private static registerDefaultAgents(): void {
    // Project Manager Agent
    this.registerAgent({
      id: 'pm',
      name: 'Project Manager',
      role: 'manager',
      description: 'Handles project planning, resource allocation, and milestone tracking',
      avatar: '👨‍💼',
      capabilities: {
        triggerPhrases: ['@pm', '@project-manager', '@manager'],
        eventTypes: ['issues', 'milestones', 'projects', 'pull_request'],
        permissions: ['read', 'write', 'manage_projects'],
        tools: ['project_tracking', 'resource_allocation', 'timeline_management'],
        maxComplexity: 'high',
        canEscalate: false
      },
      model: 'claude-3-5-sonnet-20241022'
    });

    // Senior Developer Agent
    this.registerAgent({
      id: 'senior-dev',
      name: 'Senior Developer',
      role: 'developer',
      description: 'Handles complex features, architecture decisions, and code reviews',
      avatar: '👨‍💻',
      capabilities: {
        triggerPhrases: ['@senior-dev', '@senior', '@architect'],
        eventTypes: ['pull_request', 'issues', 'issue_comment', 'pull_request_review'],
        permissions: ['read', 'write', 'deploy', 'manage_branches'],
        tools: ['full_development_stack', 'deployment', 'database_access', 'security_tools'],
        maxComplexity: 'high',
        canEscalate: false
      },
      model: 'claude-3-5-sonnet-20241022'
    });

    // Junior Developer Agent
    this.registerAgent({
      id: 'junior-dev',
      name: 'Junior Developer',
      role: 'developer',
      description: 'Handles bug fixes, simple features, and documentation updates',
      avatar: '👩‍💻',
      capabilities: {
        triggerPhrases: ['@junior-dev', '@junior', '@dev'],
        eventTypes: ['issues', 'pull_request', 'issue_comment'],
        permissions: ['read', 'write'],
        tools: ['basic_development', 'testing', 'documentation'],
        maxComplexity: 'medium',
        canEscalate: true,
        escalationTargets: ['senior-dev']
      },
      model: 'claude-3-5-haiku-20241022'
    });

    // Code Reviewer Agent
    this.registerAgent({
      id: 'reviewer',
      name: 'Code Reviewer',
      role: 'quality_assurance',
      description: 'Performs thorough code reviews and security analysis',
      avatar: '🔍',
      capabilities: {
        triggerPhrases: ['@reviewer', '@review', '@code-review'],
        eventTypes: ['pull_request', 'pull_request_review', 'pull_request_review_comment'],
        permissions: ['read', 'comment', 'request_changes'],
        tools: ['static_analysis', 'security_scanning', 'code_quality'],
        maxComplexity: 'high',
        canEscalate: true,
        escalationTargets: ['senior-dev']
      },
      model: 'claude-3-5-sonnet-20241022'
    });

    // QA Agent
    this.registerAgent({
      id: 'qa',
      name: 'QA Engineer',
      role: 'quality_assurance',
      description: 'Handles testing, bug validation, and quality metrics',
      avatar: '🧪',
      capabilities: {
        triggerPhrases: ['@qa', '@tester', '@quality'],
        eventTypes: ['issues', 'pull_request', 'workflow_run'],
        permissions: ['read', 'write', 'run_tests'],
        tools: ['test_execution', 'bug_tracking', 'quality_metrics', 'test_automation'],
        maxComplexity: 'medium',
        canEscalate: true,
        escalationTargets: ['senior-dev']
      },
      model: 'claude-3-5-haiku-20241022'
    });

    // DevOps Agent
    this.registerAgent({
      id: 'devops',
      name: 'DevOps Engineer',
      role: 'infrastructure',
      description: 'Manages deployment, infrastructure, and CI/CD pipelines',
      avatar: '⚙️',
      capabilities: {
        triggerPhrases: ['@devops', '@deploy', '@infrastructure'],
        eventTypes: ['workflow_run', 'deployment', 'issues'],
        permissions: ['read', 'write', 'deploy', 'manage_infrastructure'],
        tools: ['ci_cd', 'infrastructure', 'monitoring', 'deployment'],
        maxComplexity: 'high',
        canEscalate: false
      },
      model: 'claude-3-5-sonnet-20241022'
    });
  }

  /**
   * Register a new agent in the system
   */
  static registerAgent(agent: AgentMetadata): void {
    this.agents.set(agent.id, agent);
  }

  /**
   * Get agent by ID
   */
  static getAgent(id: string): AgentMetadata | undefined {
    return this.agents.get(id);
  }

  /**
   * Get all registered agents
   */
  static getAllAgents(): AgentMetadata[] {
    return Array.from(this.agents.values());
  }

  /**
   * Find appropriate agent based on trigger phrase
   */
  static findAgentByTrigger(triggerPhrase: string): AgentMetadata | undefined {
    const normalizedTrigger = triggerPhrase.toLowerCase().trim();
    
    for (const agent of this.agents.values()) {
      if (agent.capabilities.triggerPhrases.some(phrase => 
        normalizedTrigger.includes(phrase.toLowerCase())
      )) {
        return agent;
      }
    }

    return undefined;
  }

  /**
   * Find agents by role
   */
  static getAgentsByRole(role: string): AgentMetadata[] {
    return Array.from(this.agents.values()).filter(agent => agent.role === role);
  }

  /**
   * Analyze request complexity
   */
  static analyzeComplexity(
    context: ParsedGitHubContext, 
    githubData: FetchDataResult
  ): 'low' | 'medium' | 'high' {
    const indicators = {
      high: [
        'architecture', 'design', 'refactor', 'database', 'security',
        'performance', 'scalability', 'migration', 'framework'
      ],
      medium: [
        'feature', 'integration', 'api', 'component', 'service',
        'test', 'documentation', 'configuration'
      ],
      low: [
        'fix', 'bug', 'typo', 'update', 'cleanup', 'format',
        'comment', 'variable', 'constant'
      ]
    };

    const content = [
      githubData.contextData?.title || '',
      githubData.contextData?.body || '',
      ...githubData.comments.map(c => c.body)
    ].join(' ').toLowerCase();

    // Check for high complexity indicators
    if (indicators.high.some(term => content.includes(term))) {
      return 'high';
    }

    // Check for medium complexity indicators
    if (indicators.medium.some(term => content.includes(term))) {
      return 'medium';
    }

    return 'low';
  }

  /**
   * Suggest appropriate agent for a given context
   */
  static suggestAgent(
    context: ParsedGitHubContext,
    githubData: FetchDataResult,
    triggerPhrase?: string
  ): AgentMetadata {
    // If specific agent is mentioned, try to find it
    if (triggerPhrase) {
      const specificAgent = this.findAgentByTrigger(triggerPhrase);
      if (specificAgent) {
        return specificAgent;
      }
    }

    const complexity = this.analyzeComplexity(context, githubData);
    const eventType = context.eventName;

    // Smart agent selection based on context
    const content = [
      githubData.contextData?.title || '',
      githubData.contextData?.body || ''
    ].join(' ').toLowerCase();

    // Project management keywords
    if (content.includes('milestone') || content.includes('sprint') || 
        content.includes('project') || content.includes('deadline')) {
      return this.getAgent('pm')!;
    }

    // DevOps keywords
    if (content.includes('deploy') || content.includes('ci/cd') || 
        content.includes('pipeline') || content.includes('infrastructure')) {
      return this.getAgent('devops')!;
    }

    // QA keywords
    if (content.includes('test') || content.includes('bug') || 
        content.includes('quality') || content.includes('validation')) {
      return this.getAgent('qa')!;
    }

    // Code review context
    if (eventType === 'pull_request' || eventType === 'pull_request_review') {
      return this.getAgent('reviewer')!;
    }

    // Development tasks - select based on complexity
    if (complexity === 'high') {
      return this.getAgent('senior-dev')!;
    } else {
      return this.getAgent('junior-dev')!;
    }
  }

  /**
   * Check if agent can handle the given complexity
   */
  static canHandleComplexity(agent: AgentMetadata, complexity: 'low' | 'medium' | 'high'): boolean {
    const complexityLevels = { low: 1, medium: 2, high: 3 };
    const agentLevel = complexityLevels[agent.capabilities.maxComplexity];
    const requestLevel = complexityLevels[complexity];
    
    return agentLevel >= requestLevel;
  }

  /**
   * Get escalation path for an agent
   */
  static getEscalationPath(agentId: string): AgentMetadata[] {
    const agent = this.getAgent(agentId);
    if (!agent || !agent.capabilities.canEscalate || !agent.capabilities.escalationTargets) {
      return [];
    }

    return agent.capabilities.escalationTargets
      .map(targetId => this.getAgent(targetId))
      .filter(Boolean) as AgentMetadata[];
  }
}