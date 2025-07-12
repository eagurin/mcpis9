#!/usr/bin/env bun

import { AgentRegistry, type AgentMetadata, type AgentContext } from "./registry";
import { ProjectManagerAgent } from "./implementations/project-manager";
import { SeniorDeveloperAgent } from "./implementations/senior-developer";
import { JuniorDeveloperAgent } from "./implementations/junior-developer";
import { CodeReviewerAgent } from "./implementations/code-reviewer";
import { QAAgent } from "./implementations/qa-engineer";
import { DevOpsAgent } from "./implementations/devops-engineer";
import type { BaseAgent, AgentResponse } from "./base-agent";
import type { ParsedGitHubContext } from "../github/context";
import type { FetchDataResult } from "../github/data/fetcher";

export interface RoutingResult {
  primaryAgent: AgentMetadata;
  collaboratingAgents: AgentMetadata[];
  routingReason: string;
  confidence: number;
}

export interface ExecutionResult {
  primary: AgentResponse;
  collaborators?: AgentResponse[];
  workflow: WorkflowStep[];
}

export interface WorkflowStep {
  agent: string;
  action: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  result?: AgentResponse;
  timestamp: number;
}

/**
 * Virtual IT Company Event Router
 * Intelligently routes GitHub events to appropriate AI agents
 */
export class EventRouter {
  /**
   * Route a GitHub event to the most appropriate agent(s)
   */
  static route(
    context: ParsedGitHubContext,
    githubData: FetchDataResult,
    triggerPhrase?: string
  ): RoutingResult {
    // Analyze request complexity
    const complexity = AgentRegistry.analyzeComplexity(context, githubData);
    
    // Get primary agent suggestion
    const primaryAgent = AgentRegistry.suggestAgent(context, githubData, triggerPhrase);
    
    // Determine if collaboration is needed
    const collaboratingAgents = this.determineCollaboratingAgents(
      context, 
      githubData, 
      primaryAgent, 
      complexity
    );

    // Calculate routing confidence
    const confidence = this.calculateRoutingConfidence(
      context, 
      githubData, 
      primaryAgent, 
      triggerPhrase
    );

    const routingReason = this.generateRoutingReason(
      context, 
      githubData, 
      primaryAgent, 
      collaboratingAgents, 
      complexity,
      triggerPhrase
    );

    return {
      primaryAgent,
      collaboratingAgents,
      routingReason,
      confidence
    };
  }

  /**
   * Execute the routed agents
   */
  static async execute(
    routingResult: RoutingResult,
    context: ParsedGitHubContext,
    githubData: FetchDataResult
  ): Promise<ExecutionResult> {
    const workflow: WorkflowStep[] = [];
    const complexity = AgentRegistry.analyzeComplexity(context, githubData);

    // Create agent context
    const agentContext: AgentContext = {
      agent: routingResult.primaryAgent,
      githubContext: context,
      githubData,
      requestComplexity: complexity,
      collaboratingAgents: routingResult.collaboratingAgents.map(a => a.id)
    };

    // Execute primary agent
    workflow.push({
      agent: routingResult.primaryAgent.id,
      action: 'execute_primary_task',
      status: 'in_progress',
      timestamp: Date.now()
    });

    const primaryAgent = this.createAgentInstance(routingResult.primaryAgent, agentContext);
    const primaryResult = await primaryAgent.execute();

    workflow[workflow.length - 1].status = primaryResult.success ? 'completed' : 'failed';
    workflow[workflow.length - 1].result = primaryResult;

    // Handle escalation if needed
    if (primaryResult.shouldEscalate) {
      const escalationResult = await this.handleEscalation(
        routingResult.primaryAgent,
        agentContext,
        primaryResult.escalationReason || 'Unknown reason'
      );
      
      if (escalationResult) {
        workflow.push({
          agent: escalationResult.agent.id,
          action: 'escalation_handling',
          status: 'completed',
          result: escalationResult.response,
          timestamp: Date.now()
        });
      }
    }

    // Execute collaborating agents if needed
    const collaboratorResults: AgentResponse[] = [];
    
    for (const collaborator of routingResult.collaboratingAgents) {
      workflow.push({
        agent: collaborator.id,
        action: 'collaborative_task',
        status: 'in_progress',
        timestamp: Date.now()
      });

      const collaboratorContext = { ...agentContext, agent: collaborator };
      const collaboratorAgent = this.createAgentInstance(collaborator, collaboratorContext);
      const result = await collaboratorAgent.execute();

      collaboratorResults.push(result);
      workflow[workflow.length - 1].status = result.success ? 'completed' : 'failed';
      workflow[workflow.length - 1].result = result;
    }

    return {
      primary: primaryResult,
      collaborators: collaboratorResults.length > 0 ? collaboratorResults : undefined,
      workflow
    };
  }

  /**
   * Create an agent instance based on metadata
   */
  private static createAgentInstance(
    metadata: AgentMetadata, 
    context: AgentContext
  ): BaseAgent {
    switch (metadata.id) {
      case 'pm':
        return new ProjectManagerAgent(metadata, context);
      case 'senior-dev':
        return new SeniorDeveloperAgent(metadata, context);
      case 'junior-dev':
        return new JuniorDeveloperAgent(metadata, context);
      case 'reviewer':
        return new CodeReviewerAgent(metadata, context);
      case 'qa':
        return new QAAgent(metadata, context);
      case 'devops':
        return new DevOpsAgent(metadata, context);
      default:
        throw new Error(`Unknown agent type: ${metadata.id}`);
    }
  }

  /**
   * Handle escalation when an agent cannot complete a task
   */
  private static async handleEscalation(
    currentAgent: AgentMetadata,
    context: AgentContext,
    reason: string
  ): Promise<{ agent: AgentMetadata; response: AgentResponse } | null> {
    const escalationPath = AgentRegistry.getEscalationPath(currentAgent.id);
    
    if (escalationPath.length === 0) {
      return null;
    }

    // Try the first escalation target
    const escalationTarget = escalationPath[0];
    const escalationContext = { ...context, agent: escalationTarget };
    
    const escalationAgent = this.createAgentInstance(escalationTarget, escalationContext);
    const response = await escalationAgent.execute();

    return { agent: escalationTarget, response };
  }

  /**
   * Determine which agents should collaborate on a task
   */
  private static determineCollaboratingAgents(
    context: ParsedGitHubContext,
    githubData: FetchDataResult,
    primaryAgent: AgentMetadata,
    complexity: 'low' | 'medium' | 'high'
  ): AgentMetadata[] {
    const collaborators: AgentMetadata[] = [];
    
    const content = [
      githubData.contextData?.title || '',
      githubData.contextData?.body || '',
      ...githubData.comments.map(c => c.body)
    ].join(' ').toLowerCase();

    // Multi-agent workflows based on content analysis
    
    // Full feature development (all agents involved)
    if (content.includes('full feature') || content.includes('end-to-end') ||
        content.includes('complete implementation')) {
      return AgentRegistry.getAllAgents().filter(a => a.id !== primaryAgent.id);
    }

    // Code review + QA workflow
    if (context.eventName === 'pull_request' && complexity === 'high') {
      const reviewer = AgentRegistry.getAgent('reviewer');
      const qa = AgentRegistry.getAgent('qa');
      
      if (reviewer && primaryAgent.id !== 'reviewer') collaborators.push(reviewer);
      if (qa && primaryAgent.id !== 'qa') collaborators.push(qa);
    }

    // Deployment workflow
    if (content.includes('deploy') || content.includes('release') ||
        content.includes('production')) {
      const devops = AgentRegistry.getAgent('devops');
      const qa = AgentRegistry.getAgent('qa');
      
      if (devops && primaryAgent.id !== 'devops') collaborators.push(devops);
      if (qa && primaryAgent.id !== 'qa') collaborators.push(qa);
    }

    // Project planning workflow
    if (content.includes('project') || content.includes('milestone') ||
        content.includes('sprint')) {
      const pm = AgentRegistry.getAgent('pm');
      if (pm && primaryAgent.id !== 'pm') collaborators.push(pm);
    }

    return collaborators;
  }

  /**
   * Calculate confidence in agent routing decision
   */
  private static calculateRoutingConfidence(
    context: ParsedGitHubContext,
    githubData: FetchDataResult,
    agent: AgentMetadata,
    triggerPhrase?: string
  ): number {
    let confidence = 0.5; // Base confidence

    // High confidence if specific agent mentioned
    if (triggerPhrase && agent.capabilities.triggerPhrases.some(phrase =>
      triggerPhrase.toLowerCase().includes(phrase.toLowerCase())
    )) {
      confidence += 0.4;
    }

    // Medium confidence if event type matches
    if (agent.capabilities.eventTypes.includes(context.eventName)) {
      confidence += 0.2;
    }

    // Analyze content relevance
    const content = [
      githubData.contextData?.title || '',
      githubData.contextData?.body || ''
    ].join(' ').toLowerCase();

    const roleKeywords = {
      pm: ['project', 'milestone', 'sprint', 'deadline', 'resource', 'planning'],
      'senior-dev': ['architecture', 'design', 'complex', 'framework', 'refactor'],
      'junior-dev': ['fix', 'bug', 'simple', 'documentation', 'update'],
      reviewer: ['review', 'quality', 'standards', 'security', 'best practices'],
      qa: ['test', 'testing', 'quality', 'validation', 'bug', 'verification'],
      devops: ['deploy', 'deployment', 'infrastructure', 'ci/cd', 'pipeline']
    };

    const keywords = roleKeywords[agent.id as keyof typeof roleKeywords] || [];
    const matchingKeywords = keywords.filter(keyword => content.includes(keyword));
    
    if (matchingKeywords.length > 0) {
      confidence += Math.min(0.3, matchingKeywords.length * 0.1);
    }

    return Math.min(1.0, confidence);
  }

  /**
   * Generate human-readable routing reason
   */
  private static generateRoutingReason(
    context: ParsedGitHubContext,
    githubData: FetchDataResult,
    agent: AgentMetadata,
    collaborators: AgentMetadata[],
    complexity: 'low' | 'medium' | 'high',
    triggerPhrase?: string
  ): string {
    const reasons: string[] = [];

    // Specific agent mention
    if (triggerPhrase && agent.capabilities.triggerPhrases.some(phrase =>
      triggerPhrase.toLowerCase().includes(phrase.toLowerCase())
    )) {
      reasons.push(`Agent explicitly mentioned in trigger phrase`);
    }

    // Event type matching
    if (agent.capabilities.eventTypes.includes(context.eventName)) {
      reasons.push(`Agent specializes in ${context.eventName} events`);
    }

    // Complexity analysis
    reasons.push(`Request complexity (${complexity}) matches agent capabilities (${agent.capabilities.maxComplexity})`);

    // Content analysis
    const content = [
      githubData.contextData?.title || '',
      githubData.contextData?.body || ''
    ].join(' ').toLowerCase();

    if (content.includes('project') || content.includes('milestone')) {
      reasons.push('Project management keywords detected');
    }
    if (content.includes('deploy') || content.includes('infrastructure')) {
      reasons.push('DevOps keywords detected');
    }
    if (content.includes('test') || content.includes('quality')) {
      reasons.push('QA keywords detected');
    }
    if (content.includes('review') || content.includes('security')) {
      reasons.push('Code review keywords detected');
    }

    // Collaboration
    if (collaborators.length > 0) {
      reasons.push(`Multi-agent workflow with ${collaborators.map(c => c.name).join(', ')}`);
    }

    return reasons.join('; ');
  }
}