/**
 * Agent System Type Definitions
 *
 * Defines types for the boss agent orchestration system with worker agents
 */

import { z } from 'zod';

// ============================================================================
// Agent Types
// ============================================================================

export type AgentType = 'boss' | 'code' | 'research' | 'task_manager' | 'data';

export type AgentStatus = 'idle' | 'busy' | 'error' | 'offline';

export type MessageType = 'request' | 'response' | 'notification' | 'error';

export type MessagePriority = 'low' | 'medium' | 'high' | 'critical';

// ============================================================================
// Agent Configuration
// ============================================================================

export interface AgentConfig {
  id: string;
  type: AgentType;
  name: string;
  description: string;
  capabilities: string[];
  maxConcurrentTasks: number;
  timeout: number; // milliseconds
  retryAttempts: number;
  model?: {
    provider: 'anthropic' | 'openai' | 'google';
    model: string;
  };
}

// ============================================================================
// Agent Message Protocol
// ============================================================================

export interface AgentMessage<T = any> {
  id: string;
  from: AgentType;
  to: AgentType;
  type: MessageType;
  content: T;
  metadata: {
    timestamp: number;
    priority: MessagePriority;
    correlationId?: string;
    parentMessageId?: string;
    conversationId?: string;
  };
  error?: {
    code: string;
    message: string;
    details?: any;
  };
}

// ============================================================================
// Task Definitions
// ============================================================================

export interface Task {
  id: string;
  type: TaskType;
  description: string;
  input: any;
  assignedTo?: AgentType;
  status: TaskStatus;
  result?: any;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  createdAt: number;
  startedAt?: number;
  completedAt?: number;
  priority: MessagePriority;
  dependencies?: string[]; // Task IDs that must complete first
}

export type TaskType =
  | 'code_generation'
  | 'code_review'
  | 'code_refactor'
  | 'code_debug'
  | 'research_web'
  | 'research_docs'
  | 'research_knowledge'
  | 'task_create'
  | 'task_update'
  | 'task_query'
  | 'data_query'
  | 'data_analysis'
  | 'data_transform'
  | 'conversation'
  | 'planning';

export type TaskStatus =
  | 'pending'
  | 'assigned'
  | 'in_progress'
  | 'completed'
  | 'failed'
  | 'cancelled';

// ============================================================================
// Boss Agent Orchestration
// ============================================================================

export interface OrchestratorPlan {
  id: string;
  userRequest: string;
  intent: UserIntent;
  tasks: Task[];
  execution: {
    strategy: ExecutionStrategy;
    estimatedDuration: number;
    riskLevel: 'low' | 'medium' | 'high';
  };
  createdAt: number;
}

export type UserIntent =
  | 'code_task'
  | 'information_retrieval'
  | 'project_management'
  | 'data_operation'
  | 'multi_step_workflow'
  | 'conversation';

export type ExecutionStrategy =
  | 'sequential'    // Execute tasks one after another
  | 'parallel'      // Execute all tasks simultaneously
  | 'pipeline'      // Pass output of one task to next
  | 'conditional'   // Execute based on conditions
  | 'iterative';    // Refine results through multiple iterations

// ============================================================================
// Worker Agent Interfaces
// ============================================================================

export interface CodeTaskInput {
  type: 'generation' | 'review' | 'refactor' | 'debug';
  language?: string;
  context: {
    description: string;
    files?: string[];
    existingCode?: string;
    requirements?: string[];
  };
}

export interface CodeTaskOutput {
  code?: string;
  changes?: Array<{
    file: string;
    diff: string;
  }>;
  review?: {
    issues: Array<{
      severity: 'error' | 'warning' | 'info';
      message: string;
      line?: number;
      suggestion?: string;
    }>;
    suggestions: string[];
  };
  explanation: string;
}

export interface ResearchTaskInput {
  type: 'web' | 'docs' | 'knowledge';
  query: string;
  context?: string;
  constraints?: {
    maxResults?: number;
    sources?: string[];
    depth?: 'quick' | 'standard' | 'deep';
  };
}

export interface ResearchTaskOutput {
  findings: Array<{
    source: string;
    content: string;
    relevance: number;
    url?: string;
  }>;
  summary: string;
  citations: string[];
  confidence: number;
}

export interface TaskManagerInput {
  type: 'create' | 'update' | 'query' | 'close';
  linear?: {
    action: 'create_issue' | 'update_issue' | 'query_issues' | 'create_project';
    data: any;
  };
}

export interface TaskManagerOutput {
  success: boolean;
  linear?: {
    issueId?: string;
    issueUrl?: string;
    issues?: any[];
    projectId?: string;
  };
  message: string;
}

export interface DataTaskInput {
  type: 'query' | 'analysis' | 'transform';
  query?: string;
  data?: any;
  operations?: Array<{
    type: string;
    params: any;
  }>;
}

export interface DataTaskOutput {
  results: any;
  metadata: {
    rowCount?: number;
    executionTime: number;
    queryPlan?: string;
  };
  visualizations?: Array<{
    type: 'chart' | 'graph' | 'table';
    data: any;
  }>;
}

// ============================================================================
// R2R Memory Integration
// ============================================================================

export interface R2RMemoryQuery {
  query: string;
  type: 'semantic' | 'keyword' | 'hybrid';
  filters?: {
    conversationId?: string;
    agentType?: AgentType;
    startDate?: number;
    endDate?: number;
    tags?: string[];
  };
  limit?: number;
}

export interface R2RMemoryEntry {
  id: string;
  content: string;
  metadata: {
    conversationId: string;
    agentType: AgentType;
    timestamp: number;
    tags: string[];
    embedding?: number[];
  };
  relevanceScore?: number;
}

// ============================================================================
// Agent State
// ============================================================================

export interface AgentState {
  agent: AgentConfig;
  status: AgentStatus;
  currentTasks: Task[];
  completedTasks: number;
  failedTasks: number;
  averageResponseTime: number;
  lastActivity: number;
  metrics: {
    totalRequests: number;
    successRate: number;
    averageDuration: number;
  };
}

// ============================================================================
// Conversation Context
// ============================================================================

export interface ConversationContext {
  id: string;
  userId?: string;
  messages: Array<{
    role: 'user' | 'assistant' | 'system';
    content: string;
    timestamp: number;
    agentType?: AgentType;
  }>;
  metadata: {
    startedAt: number;
    lastActivity: number;
    totalMessages: number;
    tags: string[];
  };
  summary?: string;
}

// ============================================================================
// Agent Events
// ============================================================================

export type AgentEvent =
  | { type: 'agent.started'; agent: AgentType }
  | { type: 'agent.stopped'; agent: AgentType }
  | { type: 'task.created'; task: Task }
  | { type: 'task.assigned'; task: Task; agent: AgentType }
  | { type: 'task.started'; taskId: string }
  | { type: 'task.completed'; taskId: string; result: any }
  | { type: 'task.failed'; taskId: string; error: any }
  | { type: 'message.sent'; message: AgentMessage }
  | { type: 'message.received'; message: AgentMessage }
  | { type: 'plan.created'; plan: OrchestratorPlan }
  | { type: 'plan.executed'; planId: string; results: any[] };

// ============================================================================
// Zod Schemas for Validation
// ============================================================================

export const AgentMessageSchema = z.object({
  id: z.string(),
  from: z.enum(['boss', 'code', 'research', 'task_manager', 'data']),
  to: z.enum(['boss', 'code', 'research', 'task_manager', 'data']),
  type: z.enum(['request', 'response', 'notification', 'error']),
  content: z.any(),
  metadata: z.object({
    timestamp: z.number(),
    priority: z.enum(['low', 'medium', 'high', 'critical']),
    correlationId: z.string().optional(),
    parentMessageId: z.string().optional(),
    conversationId: z.string().optional(),
  }),
  error: z.object({
    code: z.string(),
    message: z.string(),
    details: z.any().optional(),
  }).optional(),
});

export const TaskSchema = z.object({
  id: z.string(),
  type: z.string(),
  description: z.string(),
  input: z.any(),
  assignedTo: z.enum(['boss', 'code', 'research', 'task_manager', 'data']).optional(),
  status: z.enum(['pending', 'assigned', 'in_progress', 'completed', 'failed', 'cancelled']),
  result: z.any().optional(),
  error: z.object({
    code: z.string(),
    message: z.string(),
    details: z.any().optional(),
  }).optional(),
  createdAt: z.number(),
  startedAt: z.number().optional(),
  completedAt: z.number().optional(),
  priority: z.enum(['low', 'medium', 'high', 'critical']),
  dependencies: z.array(z.string()).optional(),
});
