#!/usr/bin/env bun

import type { AgentMetadata, AgentContext } from "./registry";
import type { ParsedGitHubContext } from "../github/context";
import type { FetchDataResult } from "../github/data/fetcher";

export interface AgentResponse {
  success: boolean;
  message: string;
  actions: AgentAction[];
  shouldEscalate?: boolean;
  escalationReason?: string;
  metadata?: Record<string, any>;
}

export interface AgentAction {
  type: 'comment' | 'commit' | 'review' | 'assign' | 'label' | 'branch' | 'escalate';
  data: Record<string, any>;
  priority: 'low' | 'medium' | 'high';
}

/**
 * Base class for all virtual IT company agents
 * Provides common functionality and interface for specialized agents
 */
export abstract class BaseAgent {
  protected metadata: AgentMetadata;
  protected context: AgentContext;

  constructor(metadata: AgentMetadata, context: AgentContext) {
    this.metadata = metadata;
    this.context = context;
  }

  /**
   * Main entry point for agent execution
   */
  async execute(): Promise<AgentResponse> {
    try {
      // Pre-execution validation
      const validationResult = await this.validateRequest();
      if (!validationResult.valid) {
        return this.createErrorResponse(validationResult.reason || 'Validation failed');
      }

      // Check if this agent can handle the request complexity
      if (!this.canHandleComplexity()) {
        return this.createEscalationResponse();
      }

      // Execute agent-specific logic
      const response = await this.executeTask();

      // Post-execution processing
      return await this.postProcess(response);

    } catch (error) {
      return this.createErrorResponse(`Agent execution failed: ${error}`);
    }
  }

  /**
   * Agent-specific task execution (must be implemented by subclasses)
   */
  protected abstract executeTask(): Promise<AgentResponse>;

  /**
   * Validate if this agent can handle the current request
   */
  protected async validateRequest(): Promise<{ valid: boolean; reason?: string }> {
    const { githubContext, requestComplexity } = this.context;

    // Check if agent supports the event type
    if (!this.metadata.capabilities.eventTypes.includes(githubContext.eventName)) {
      return {
        valid: false,
        reason: `Agent ${this.metadata.name} doesn't support ${githubContext.eventName} events`
      };
    }

    // Check permissions
    const requiredPermissions = this.getRequiredPermissions();
    const hasPermissions = requiredPermissions.every(permission =>
      this.metadata.capabilities.permissions.includes(permission)
    );

    if (!hasPermissions) {
      return {
        valid: false,
        reason: `Agent ${this.metadata.name} lacks required permissions`
      };
    }

    return { valid: true };
  }

  /**
   * Check if agent can handle the request complexity
   */
  protected canHandleComplexity(): boolean {
    const complexityLevels = { low: 1, medium: 2, high: 3 };
    const agentLevel = complexityLevels[this.metadata.capabilities.maxComplexity];
    const requestLevel = complexityLevels[this.context.requestComplexity];
    
    return agentLevel >= requestLevel;
  }

  /**
   * Get required permissions for the current request (override in subclasses)
   */
  protected getRequiredPermissions(): string[] {
    return ['read'];
  }

  /**
   * Post-process the agent response
   */
  protected async postProcess(response: AgentResponse): Promise<AgentResponse> {
    // Add agent metadata to response
    response.metadata = {
      ...response.metadata,
      agentId: this.metadata.id,
      agentName: this.metadata.name,
      agentRole: this.metadata.role,
      executionTime: Date.now()
    };

    return response;
  }

  /**
   * Create an error response
   */
  protected createErrorResponse(message: string): AgentResponse {
    return {
      success: false,
      message,
      actions: []
    };
  }

  /**
   * Create an escalation response
   */
  protected createEscalationResponse(): AgentResponse {
    return {
      success: false,
      message: `Request complexity (${this.context.requestComplexity}) exceeds ${this.metadata.name}'s capabilities`,
      actions: [{
        type: 'escalate',
        data: {
          reason: 'complexity_exceeded',
          currentAgent: this.metadata.id,
          escalationTargets: this.metadata.capabilities.escalationTargets
        },
        priority: 'high'
      }],
      shouldEscalate: true,
      escalationReason: 'Request complexity exceeds agent capabilities'
    };
  }

  /**
   * Create a success response
   */
  protected createSuccessResponse(message: string, actions: AgentAction[] = []): AgentResponse {
    return {
      success: true,
      message,
      actions
    };
  }

  /**
   * Generate agent introduction for comments
   */
  protected getAgentIntroduction(): string {
    return `### ${this.metadata.avatar} ${this.metadata.name} Agent

${this.metadata.description}

#### Task Analysis:
- **Event Type**: ${this.context.githubContext.eventName}
- **Complexity**: ${this.context.requestComplexity}
- **Agent Role**: ${this.metadata.role}
`;
  }

  /**
   * Generate task checklist based on agent role and request
   */
  protected generateTaskChecklist(): string[] {
    const baseTasks = [
      'Analyze request context and requirements',
      'Validate permissions and capabilities',
      'Execute assigned tasks',
      'Update status and communicate results'
    ];

    return baseTasks;
  }

  /**
   * Format checklist for GitHub comment
   */
  protected formatChecklist(tasks: string[], completedTasks: string[] = []): string {
    return tasks.map(task => {
      const isCompleted = completedTasks.includes(task);
      return `- [${isCompleted ? 'x' : ' '}] ${task}`;
    }).join('\n');
  }

  /**
   * Extract task instructions from trigger content
   */
  protected extractTaskInstructions(): string {
    const { githubContext, githubData } = this.context;
    
    // Extract from direct prompt
    if (githubContext.inputs.directPrompt) {
      return githubContext.inputs.directPrompt;
    }

    // Extract from comment body
    if (githubData.contextData?.body) {
      const triggerPhrase = githubContext.inputs.triggerPhrase || '@claude';
      const body = githubData.contextData.body;
      
      // Find content after trigger phrase
      const triggerIndex = body.toLowerCase().indexOf(triggerPhrase.toLowerCase());
      if (triggerIndex !== -1) {
        return body.substring(triggerIndex + triggerPhrase.length).trim();
      }
    }

    // Extract from latest comment
    const latestComment = githubData.comments[githubData.comments.length - 1];
    if (latestComment?.body) {
      const triggerPhrase = githubContext.inputs.triggerPhrase || '@claude';
      const body = latestComment.body;
      
      // Find content after trigger phrase
      const triggerIndex = body.toLowerCase().indexOf(triggerPhrase.toLowerCase());
      if (triggerIndex !== -1) {
        return body.substring(triggerIndex + triggerPhrase.length).trim();
      }
    }

    return 'No specific instructions provided';
  }

  /**
   * Check if agent should collaborate with other agents
   */
  protected shouldCollaborate(): boolean {
    const instructions = this.extractTaskInstructions().toLowerCase();
    
    // Look for collaboration keywords
    const collaborationKeywords = [
      'team', 'collaborate', 'work together', 'coordinate',
      'multiple', 'combined', 'joint', 'together'
    ];

    return collaborationKeywords.some(keyword => instructions.includes(keyword));
  }

  /**
   * Get collaborating agents for multi-agent tasks
   */
  protected getCollaboratingAgents(): string[] {
    if (!this.shouldCollaborate()) {
      return [];
    }

    const instructions = this.extractTaskInstructions().toLowerCase();
    const allAgents = ['pm', 'senior-dev', 'junior-dev', 'reviewer', 'qa', 'devops'];
    
    return allAgents.filter(agentId => 
      agentId !== this.metadata.id && instructions.includes(agentId)
    );
  }
}