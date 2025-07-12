#!/usr/bin/env bun

import { EventRouter } from "./event-router";
import { AgentRegistry } from "./registry";
import { generatePrompt, prepareContext } from "../create-prompt/index";
import type { ParsedGitHubContext } from "../github/context";
import type { FetchDataResult } from "../github/data/fetcher";
import { writeFile, mkdir } from "fs/promises";
import * as core from "@actions/core";

/**
 * Agent Integration Layer
 * Bridges the agent system with the existing GitHub action infrastructure
 */
export class AgentIntegration {
  /**
   * Process a GitHub event through the agent system
   */
  static async processEvent(
    context: ParsedGitHubContext,
    githubData: FetchDataResult,
    claudeCommentId: number,
    baseBranch?: string,
    claudeBranch?: string
  ): Promise<void> {
    try {
      // Extract trigger phrase for agent routing
      const triggerPhrase = this.extractAgentTrigger(context, githubData);
      
      // Route the event to appropriate agent(s)
      const routingResult = EventRouter.route(context, githubData, triggerPhrase);
      
      console.log(`=== AGENT ROUTING ===`);
      console.log(`Primary Agent: ${routingResult.primaryAgent.name} (${routingResult.primaryAgent.id})`);
      console.log(`Collaborators: ${routingResult.collaboratingAgents.map(a => a.name).join(', ')}`);
      console.log(`Routing Reason: ${routingResult.routingReason}`);
      console.log(`Confidence: ${(routingResult.confidence * 100).toFixed(1)}%`);
      console.log(`====================`);

      // Generate agent-specific prompt
      const agentPrompt = await this.generateAgentPrompt(
        routingResult,
        context,
        githubData,
        claudeCommentId.toString(),
        baseBranch,
        claudeBranch
      );

      // Set up agent-specific environment
      await this.setupAgentEnvironment(routingResult, context);

      // Execute the agent workflow
      const executionResult = await EventRouter.execute(routingResult, context, githubData);
      
      console.log(`=== AGENT EXECUTION ===`);
      console.log(`Primary Agent Success: ${executionResult.primary.success}`);
      console.log(`Workflow Steps: ${executionResult.workflow.length}`);
      console.log(`=======================`);

    } catch (error) {
      console.error('Agent processing failed:', error);
      core.setFailed(`Agent processing failed: ${error}`);
    }
  }

  /**
   * Extract agent-specific trigger from the context
   */
  private static extractAgentTrigger(
    context: ParsedGitHubContext,
    githubData: FetchDataResult
  ): string | undefined {
    // Check for direct prompt first
    if (context.inputs.directPrompt) {
      return context.inputs.directPrompt;
    }

    // Extract from issue/PR body
    if (githubData.contextData?.body) {
      const content = githubData.contextData.body;
      const agentMentions = this.findAgentMentions(content);
      if (agentMentions.length > 0) {
        return agentMentions[0];
      }
    }

    // Extract from latest comment
    const latestComment = githubData.comments[githubData.comments.length - 1];
    if (latestComment?.body) {
      const agentMentions = this.findAgentMentions(latestComment.body);
      if (agentMentions.length > 0) {
        return agentMentions[0];
      }
    }

    return undefined;
  }

  /**
   * Find agent mentions in text content
   */
  private static findAgentMentions(content: string): string[] {
    const allAgents = AgentRegistry.getAllAgents();
    const mentions: string[] = [];

    for (const agent of allAgents) {
      for (const trigger of agent.capabilities.triggerPhrases) {
        if (content.toLowerCase().includes(trigger.toLowerCase())) {
          mentions.push(trigger);
        }
      }
    }

    return mentions;
  }

  /**
   * Generate agent-specific prompt
   */
  private static async generateAgentPrompt(
    routingResult: any,
    context: ParsedGitHubContext,
    githubData: FetchDataResult,
    claudeCommentId: string,
    baseBranch?: string,
    claudeBranch?: string
  ): Promise<string> {
    // Prepare context with agent information
    const preparedContext = prepareContext(
      context,
      claudeCommentId,
      baseBranch,
      claudeBranch
    );

    // Add agent-specific context
    const agentContext = {
      ...preparedContext,
      agentId: routingResult.primaryAgent.id,
      agentName: routingResult.primaryAgent.name,
      agentRole: routingResult.primaryAgent.role,
      collaboratingAgents: routingResult.collaboratingAgents.map((a: any) => ({
        id: a.id,
        name: a.name,
        role: a.role
      })),
      routingConfidence: routingResult.confidence,
      routingReason: routingResult.routingReason
    };

    // Generate enhanced prompt with agent instructions
    const basePrompt = generatePrompt(
      preparedContext,
      githubData,
      context.inputs.useCommitSigning
    );

    const agentPrompt = this.enhancePromptWithAgentContext(
      basePrompt,
      routingResult,
      agentContext
    );

    // Write enhanced prompt
    await mkdir(`${process.env.RUNNER_TEMP}/claude-prompts`, { recursive: true });
    await writeFile(
      `${process.env.RUNNER_TEMP}/claude-prompts/claude-prompt.txt`,
      agentPrompt
    );

    console.log("===== AGENT-ENHANCED PROMPT =====");
    console.log(agentPrompt);
    console.log("=================================");

    return agentPrompt;
  }

  /**
   * Enhance the base prompt with agent-specific context
   */
  private static enhancePromptWithAgentContext(
    basePrompt: string,
    routingResult: any,
    agentContext: any
  ): string {
    const { primaryAgent, collaboratingAgents } = routingResult;

    const agentInstructions = `
<agent_context>
You are functioning as a specialized AI agent in a virtual IT company structure.

PRIMARY AGENT: ${primaryAgent.avatar} ${primaryAgent.name}
ROLE: ${primaryAgent.role}
DESCRIPTION: ${primaryAgent.description}

CAPABILITIES:
- Trigger Phrases: ${primaryAgent.capabilities.triggerPhrases.join(', ')}
- Event Types: ${primaryAgent.capabilities.eventTypes.join(', ')}
- Max Complexity: ${primaryAgent.capabilities.maxComplexity}
- Can Escalate: ${primaryAgent.capabilities.canEscalate ? 'Yes' : 'No'}
${primaryAgent.capabilities.escalationTargets ? `- Escalation Targets: ${primaryAgent.capabilities.escalationTargets.join(', ')}` : ''}

${collaboratingAgents.length > 0 ? `
COLLABORATING AGENTS:
${collaboratingAgents.map((agent: any) => `- ${agent.avatar} ${agent.name} (${agent.role})`).join('\n')}

MULTI-AGENT WORKFLOW:
This is a collaborative task involving multiple agents. You are the primary agent responsible for coordination and leading the effort. Consider input and coordination with the collaborating agents throughout your work.
` : ''}

ROUTING ANALYSIS:
- Confidence: ${(routingResult.confidence * 100).toFixed(1)}%
- Reasoning: ${routingResult.routingReason}

AGENT-SPECIFIC INSTRUCTIONS:
1. Act according to your agent role and capabilities
2. Use your agent's personality and expertise level
3. If the task exceeds your capabilities, consider escalation
4. Coordinate with collaborating agents when applicable
5. Maintain the agent's professional persona throughout
6. Reference your agent role in comments and communications

VIRTUAL COMPANY CONTEXT:
You are part of a virtual IT company where different AI agents handle different aspects of software development. Maintain professional communication as if you're a real employee with your specific role and responsibilities.
</agent_context>

`;

    // Insert agent context after the initial context but before the task instructions
    const insertPoint = basePrompt.indexOf('Your task is to analyze the context');
    if (insertPoint !== -1) {
      return basePrompt.slice(0, insertPoint) + agentInstructions + basePrompt.slice(insertPoint);
    }

    // Fallback: prepend to the prompt
    return agentInstructions + '\n\n' + basePrompt;
  }

  /**
   * Set up agent-specific environment variables and configurations
   */
  private static async setupAgentEnvironment(
    routingResult: any,
    context: ParsedGitHubContext
  ): Promise<void> {
    const { primaryAgent } = routingResult;

    // Set agent-specific environment variables
    process.env.CLAUDE_AGENT_ID = primaryAgent.id;
    process.env.CLAUDE_AGENT_NAME = primaryAgent.name;
    process.env.CLAUDE_AGENT_ROLE = primaryAgent.role;

    // Configure agent-specific model if specified
    if (primaryAgent.model) {
      process.env.CLAUDE_AGENT_MODEL = primaryAgent.model;
    }

    // Set agent-specific allowed tools
    const agentTools = primaryAgent.capabilities.tools.join(',');
    const existingTools = context.inputs.allowedTools.join(',');
    const combinedTools = existingTools ? `${existingTools},${agentTools}` : agentTools;
    
    core.exportVariable('AGENT_ALLOWED_TOOLS', combinedTools);

    // Log agent setup
    console.log(`=== AGENT ENVIRONMENT ===`);
    console.log(`Agent ID: ${primaryAgent.id}`);
    console.log(`Agent Name: ${primaryAgent.name}`);
    console.log(`Agent Role: ${primaryAgent.role}`);
    console.log(`Agent Tools: ${agentTools}`);
    if (primaryAgent.model) {
      console.log(`Agent Model: ${primaryAgent.model}`);
    }
    console.log(`========================`);
  }

  /**
   * Check if the current context should use the agent system
   */
  static shouldUseAgentSystem(context: ParsedGitHubContext, githubData: FetchDataResult): boolean {
    // Always use agent system for now - this can be made configurable later
    return true;
    
    // Future: Could be based on configuration, trigger phrases, or specific conditions
    // const agentTrigger = this.extractAgentTrigger(context, githubData);
    // return agentTrigger !== undefined;
  }
}