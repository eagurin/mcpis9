/**
 * @mcpis9/agents - Advanced Agent System with Boss Orchestration and R2R Memory
 *
 * Экспорт всех компонентов агентной системы
 */

// Main Orchestrator
export { AgentOrchestrator, type OrchestratorConfig } from './orchestrator';

// Agents
export { BaseAgent } from './agents/base-agent';
export { BossAgent } from './agents/boss-agent';
export { CodeAgent } from './agents/workers/code-agent';
export { ResearchAgent } from './agents/workers/research-agent';
export { AnalysisAgent } from './agents/workers/analysis-agent';
export { CreativeAgent } from './agents/workers/creative-agent';
export { DevOpsAgent } from './agents/workers/devops-agent';

// Memory
export { MemoryManager } from './memory/memory-manager';
export { R2RClient } from './memory/r2r-client';

// Tools
export { ToolRegistry } from './tools/tool-registry';

// Re-export types from shared
export type {
  AgentType,
  AgentStatus,
  AgentRole,
  AgentState,
  AgentTask,
  AgentTaskResult,
  AgentArtifact,
  AgentMemory,
  ConversationBuffer,
  LongTermMemory,
  MemoryDocument,
  MemoryRetrieval,
  ToolDefinition,
  ToolType,
  ToolParameter,
  ToolExecution,
  ToolExecutionResult,
  ExecutionPlan,
  TaskDependency,
  AgentMessage,
  AgentCoordination,
  R2RConfig,
  R2RSearchRequest,
  R2RSearchResponse,
  R2RDocument,
  R2RIndexRequest,
  R2RIndexResponse,
} from '@mcpis9/shared';
