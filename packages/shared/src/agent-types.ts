/**
 * Advanced Agent System Types
 * Inspired by Lleverage.ai architecture with R2R memory integration
 */

// Agent types following Lleverage.ai patterns
export type AgentType =
  | 'boss'        // Orchestrates all other agents, delegates tasks
  | 'worker'      // Executes specific tasks
  | 'research'    // Information gathering and analysis
  | 'code'        // Code generation and analysis
  | 'browser'     // Web automation and scraping
  | 'linear'      // Linear issue/project management
  | 'memory'      // R2R memory management
  | 'planner';    // Task planning and breakdown

// Agent status
export type AgentStatus =
  | 'idle'
  | 'thinking'
  | 'executing'
  | 'waiting'
  | 'completed'
  | 'failed';

// Task priority levels
export type TaskPriority = 'low' | 'medium' | 'high' | 'critical';

// Task status
export type TaskStatus =
  | 'queued'
  | 'in_progress'
  | 'blocked'
  | 'completed'
  | 'failed'
  | 'cancelled';

/**
 * Agent Configuration
 */
export interface AgentConfig {
  id: string;
  type: AgentType;
  name: string;
  description: string;
  capabilities: string[];
  model?: string;  // AI model to use (claude, gpt-4, etc.)
  temperature?: number;
  maxTokens?: number;
  thinkingBudget?: number;  // For extended reasoning
  enabled: boolean;
  metadata?: Record<string, any>;
}

/**
 * Agent Instance
 */
export interface Agent {
  config: AgentConfig;
  status: AgentStatus;
  currentTask?: Task;
  taskHistory: Task[];
  memory: AgentMemory;
  performance: AgentPerformance;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Task Definition
 */
export interface Task {
  id: string;
  parentTaskId?: string;
  title: string;
  description: string;
  type: TaskType;
  priority: TaskPriority;
  status: TaskStatus;
  assignedTo?: string;  // Agent ID
  dependencies?: string[];  // Task IDs that must complete first
  context?: TaskContext;
  result?: TaskResult;
  createdBy: string;  // Agent ID that created the task
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
  deadline?: Date;
  tags?: string[];
  metadata?: Record<string, any>;
}

export type TaskType =
  | 'research'
  | 'code_generation'
  | 'code_review'
  | 'testing'
  | 'debugging'
  | 'documentation'
  | 'web_automation'
  | 'data_processing'
  | 'integration'
  | 'planning'
  | 'monitoring'
  | 'other';

/**
 * Task Context - Information needed to execute the task
 */
export interface TaskContext {
  goal: string;
  constraints?: string[];
  resources?: TaskResource[];
  requirements?: string[];
  previousAttempts?: TaskAttempt[];
  relatedTasks?: string[];
  externalContext?: Record<string, any>;
}

export interface TaskResource {
  type: 'file' | 'url' | 'api' | 'database' | 'memory' | 'other';
  identifier: string;
  description?: string;
  metadata?: Record<string, any>;
}

export interface TaskAttempt {
  attemptNumber: number;
  agentId: string;
  startedAt: Date;
  completedAt?: Date;
  success: boolean;
  error?: string;
  learnings?: string;
}

/**
 * Task Result
 */
export interface TaskResult {
  success: boolean;
  output?: any;
  artifacts?: Artifact[];
  error?: string;
  metrics?: TaskMetrics;
  nextSteps?: string[];
  learnings?: string;
}

export interface Artifact {
  type: 'code' | 'document' | 'data' | 'screenshot' | 'report' | 'other';
  name: string;
  content: string | Buffer;
  path?: string;
  metadata?: Record<string, any>;
}

export interface TaskMetrics {
  duration: number;  // milliseconds
  tokensUsed?: number;
  cost?: number;
  retries?: number;
  quality?: number;  // 0-1 score
}

/**
 * Agent Memory (R2R Integration)
 */
export interface AgentMemory {
  shortTerm: MemoryEntry[];  // Recent conversation/task context
  longTerm: MemoryReference[];  // References to R2R stored memories
  workingMemory: Record<string, any>;  // Current state
  knowledgeBase: KnowledgeBaseReference[];
}

export interface MemoryEntry {
  id: string;
  content: string;
  type: 'conversation' | 'task' | 'learning' | 'fact' | 'procedure';
  importance: number;  // 0-1
  timestamp: Date;
  metadata?: Record<string, any>;
}

export interface MemoryReference {
  r2rDocumentId: string;
  summary: string;
  relevance: number;
  lastAccessed: Date;
}

export interface KnowledgeBaseReference {
  id: string;
  name: string;
  description: string;
  r2rCollectionId?: string;
  documents: number;
  lastUpdated: Date;
}

/**
 * Agent Performance Tracking
 */
export interface AgentPerformance {
  tasksCompleted: number;
  tasksF failed: number;
  averageTaskDuration: number;
  successRate: number;
  qualityScore: number;
  efficiency: number;
  lastEvaluatedAt?: Date;
}

/**
 * Agent Communication
 */
export interface AgentMessage {
  id: string;
  from: string;  // Agent ID
  to: string | string[];  // Agent ID(s)
  type: MessageType;
  content: any;
  priority: TaskPriority;
  requiresResponse: boolean;
  responseTimeout?: number;
  timestamp: Date;
  metadata?: Record<string, any>;
}

export type MessageType =
  | 'task_assignment'
  | 'task_update'
  | 'task_completion'
  | 'task_failure'
  | 'request_info'
  | 'provide_info'
  | 'coordination'
  | 'status_update'
  | 'error'
  | 'system';

/**
 * Boss Agent Specific Types
 */
export interface BossAgentState {
  activeTasks: Map<string, Task>;
  agentPool: Map<string, Agent>;
  taskQueue: TaskQueue;
  coordinationState: CoordinationState;
  systemMetrics: SystemMetrics;
}

export interface TaskQueue {
  high: Task[];
  medium: Task[];
  low: Task[];
}

export interface CoordinationState {
  activeConversations: Conversation[];
  blockedTasks: Task[];
  waitingForDependencies: Map<string, string[]>;
}

export interface Conversation {
  id: string;
  participants: string[];  // Agent IDs
  topic: string;
  messages: AgentMessage[];
  startedAt: Date;
  lastActivity: Date;
  status: 'active' | 'paused' | 'completed';
}

export interface SystemMetrics {
  totalTasks: number;
  completedTasks: number;
  failedTasks: number;
  activeAgents: number;
  averageResponseTime: number;
  systemLoad: number;
  memoryUsage: {
    shortTerm: number;
    longTerm: number;
    total: number;
  };
  lastUpdated: Date;
}

/**
 * R2R Integration Types
 */
export interface R2RConfig {
  baseUrl: string;
  apiKey?: string;
  collections: R2RCollection[];
}

export interface R2RCollection {
  id: string;
  name: string;
  description: string;
  documentCount: number;
}

export interface R2RDocument {
  id: string;
  collectionId: string;
  content: string;
  metadata: Record<string, any>;
  embedding?: number[];
  createdAt: Date;
}

export interface R2RSearchQuery {
  query: string;
  collectionId?: string;
  limit?: number;
  threshold?: number;
  filters?: Record<string, any>;
  useHybridSearch?: boolean;
}

export interface R2RSearchResult {
  documentId: string;
  content: string;
  score: number;
  metadata: Record<string, any>;
}

/**
 * Linear Integration Types
 */
export interface LinearConfig {
  apiKey: string;
  teamId?: string;
  workspaceId?: string;
}

export interface LinearIssue {
  id: string;
  identifier: string;
  title: string;
  description?: string;
  status: string;
  priority: number;
  assignee?: LinearUser;
  labels?: LinearLabel[];
  project?: LinearProject;
  createdAt: Date;
  updatedAt: Date;
}

export interface LinearUser {
  id: string;
  name: string;
  email: string;
}

export interface LinearLabel {
  id: string;
  name: string;
  color: string;
}

export interface LinearProject {
  id: string;
  name: string;
  description?: string;
  status: string;
}

/**
 * Workflow Types (Lleverage-inspired)
 */
export interface Workflow {
  id: string;
  name: string;
  description: string;
  trigger: WorkflowTrigger;
  steps: WorkflowStep[];
  status: 'active' | 'paused' | 'disabled';
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface WorkflowTrigger {
  type: 'manual' | 'schedule' | 'webhook' | 'event';
  config: Record<string, any>;
}

export interface WorkflowStep {
  id: string;
  type: 'agent_task' | 'condition' | 'parallel' | 'loop' | 'integration';
  agentType?: AgentType;
  config: Record<string, any>;
  nextSteps: string[];
  errorHandling?: ErrorHandlingConfig;
}

export interface ErrorHandlingConfig {
  retry?: {
    maxAttempts: number;
    backoff: 'linear' | 'exponential';
    initialDelay: number;
  };
  fallback?: string;  // Step ID to execute on failure
  continueOnError?: boolean;
}

/**
 * Event System
 */
export interface SystemEvent {
  id: string;
  type: EventType;
  source: string;
  data: any;
  timestamp: Date;
  metadata?: Record<string, any>;
}

export type EventType =
  | 'agent_started'
  | 'agent_stopped'
  | 'task_created'
  | 'task_assigned'
  | 'task_completed'
  | 'task_failed'
  | 'memory_updated'
  | 'workflow_triggered'
  | 'system_alert'
  | 'integration_event';
