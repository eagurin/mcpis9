#!/usr/bin/env bun

import { describe, it, expect } from "bun:test";
import { AgentRegistry } from "../../src/agents/registry";

describe("AgentRegistry", () => {
  it("should have all default agents registered", () => {
    const agents = AgentRegistry.getAllAgents();
    expect(agents).toHaveLength(6);
    
    const agentIds = agents.map(a => a.id);
    expect(agentIds).toContain('pm');
    expect(agentIds).toContain('senior-dev');
    expect(agentIds).toContain('junior-dev');
    expect(agentIds).toContain('reviewer');
    expect(agentIds).toContain('qa');
    expect(agentIds).toContain('devops');
  });

  it("should find agent by trigger phrase", () => {
    const pmAgent = AgentRegistry.findAgentByTrigger('@pm');
    expect(pmAgent?.id).toBe('pm');
    expect(pmAgent?.name).toBe('Project Manager');

    const seniorDevAgent = AgentRegistry.findAgentByTrigger('@senior-dev');
    expect(seniorDevAgent?.id).toBe('senior-dev');
    expect(seniorDevAgent?.name).toBe('Senior Developer');
  });

  it("should analyze request complexity correctly", () => {
    const mockContext = {
      eventName: 'issues',
      inputs: { triggerPhrase: '@claude' }
    } as any;

    const mockGithubData = {
      contextData: {
        title: 'Fix simple bug in documentation',
        body: 'There is a small typo that needs to be fixed'
      },
      comments: []
    } as any;

    const complexity = AgentRegistry.analyzeComplexity(mockContext, mockGithubData);
    expect(complexity).toBe('low');
  });

  it("should suggest appropriate agent based on context", () => {
    const mockContext = {
      eventName: 'issues',
      inputs: { triggerPhrase: '@claude' }
    } as any;

    const mockGithubData = {
      contextData: {
        title: 'Add deployment pipeline',
        body: 'We need to set up CI/CD infrastructure for automatic deployments'
      },
      comments: []
    } as any;

    const suggestedAgent = AgentRegistry.suggestAgent(mockContext, mockGithubData);
    expect(suggestedAgent.id).toBe('devops');
  });

  it("should handle escalation paths correctly", () => {
    const juniorDevAgent = AgentRegistry.getAgent('junior-dev');
    expect(juniorDevAgent?.capabilities.canEscalate).toBe(true);
    
    const escalationPath = AgentRegistry.getEscalationPath('junior-dev');
    expect(escalationPath).toHaveLength(1);
    expect(escalationPath[0].id).toBe('senior-dev');
  });

  it("should validate agent complexity handling", () => {
    const juniorDevAgent = AgentRegistry.getAgent('junior-dev');
    const seniorDevAgent = AgentRegistry.getAgent('senior-dev');

    expect(AgentRegistry.canHandleComplexity(juniorDevAgent!, 'low')).toBe(true);
    expect(AgentRegistry.canHandleComplexity(juniorDevAgent!, 'medium')).toBe(true);
    expect(AgentRegistry.canHandleComplexity(juniorDevAgent!, 'high')).toBe(false);

    expect(AgentRegistry.canHandleComplexity(seniorDevAgent!, 'high')).toBe(true);
  });
});