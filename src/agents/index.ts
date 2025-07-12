#!/usr/bin/env bun

/**
 * Virtual IT Company AI Agent System
 * 
 * This module provides a comprehensive AI agent system that simulates
 * a virtual IT company with specialized roles and intelligent routing.
 */

// Core agent system exports
export { AgentRegistry } from './registry';
export { BaseAgent } from './base-agent';
export { EventRouter } from './event-router';
export { AgentIntegration } from './agent-integration';

// Agent implementations
export { ProjectManagerAgent } from './implementations/project-manager';
export { SeniorDeveloperAgent } from './implementations/senior-developer';
export { JuniorDeveloperAgent } from './implementations/junior-developer';
export { CodeReviewerAgent } from './implementations/code-reviewer';
export { QAAgent } from './implementations/qa-engineer';
export { DevOpsAgent } from './implementations/devops-engineer';

// Type exports
export type {
  AgentCapabilities,
  AgentMetadata,
  AgentContext
} from './registry';

export type {
  AgentResponse,
  AgentAction
} from './base-agent';

export type {
  RoutingResult,
  ExecutionResult,
  WorkflowStep
} from './event-router';

/**
 * Virtual IT Company Agent System Overview:
 * 
 * This system provides a sophisticated multi-agent architecture that simulates
 * a real IT company with specialized roles:
 * 
 * 🏢 **Company Structure**:
 * - Project Manager: Strategic planning and resource management
 * - Senior Developer: Complex technical implementations
 * - Junior Developer: Learning-focused simple tasks
 * - Code Reviewer: Quality assurance and security
 * - QA Engineer: Testing and validation
 * - DevOps Engineer: Infrastructure and deployment
 * 
 * 🧠 **Intelligent Features**:
 * - Context-aware agent routing
 * - Complexity-based task assignment
 * - Automatic escalation paths
 * - Multi-agent collaboration workflows
 * - Professional communication patterns
 * 
 * 🔄 **Integration**:
 * - Seamless GitHub Actions integration
 * - Backward compatibility with standard Claude Code
 * - Enhanced prompt generation with agent context
 * - Agent-specific tool permissions and capabilities
 */