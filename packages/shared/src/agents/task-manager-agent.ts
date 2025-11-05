/**
 * Task Manager Agent - Specialized for project management
 *
 * Handles task creation, updates, queries, and Linear integration
 */

import { LinearClient } from '@linear/sdk';
import { anthropic } from '@ai-sdk/anthropic';
import { generateText } from 'ai';
import { BaseAgent } from './base-agent';
import type {
  AgentConfig,
  Task,
  TaskManagerInput,
  TaskManagerOutput,
} from '../types/agent.types';
import type { R2RMemoryService } from '../services/r2r-memory.service';

export class TaskManagerAgent extends BaseAgent {
  private linearClient?: LinearClient;

  constructor(memory?: R2RMemoryService, linearApiKey?: string) {
    const config: AgentConfig = {
      id: 'task-manager-agent-001',
      type: 'task_manager',
      name: 'Task Manager Agent',
      description: 'Specialized agent for project management and Linear integration',
      capabilities: [
        'task_create',
        'task_update',
        'task_query',
      ],
      maxConcurrentTasks: 10,
      timeout: 20000, // 20 seconds
      retryAttempts: 3,
      model: {
        provider: 'anthropic',
        model: 'claude-3-5-sonnet-20241022',
      },
    };

    super(config, memory);

    // Initialize Linear client if API key provided
    if (linearApiKey) {
      this.linearClient = new LinearClient({ apiKey: linearApiKey });
      this.log('info', 'Linear client initialized');
    } else {
      this.log('warn', 'Linear API key not provided, Linear features will be disabled');
    }
  }

  protected setupMessageHandlers(): void {
    this.messageHandlers.set('request', async (message) => {
      this.log('info', 'Received task management request');
    });
  }

  protected async processTask(task: Task): Promise<TaskManagerOutput> {
    const input = task.input as TaskManagerInput;

    this.log('info', `Processing task management: ${input.type}`);

    if (input.linear && this.linearClient) {
      return this.handleLinearTask(input);
    } else {
      return this.handleGenericTask(input);
    }
  }

  /**
   * Handle Linear-specific tasks
   */
  private async handleLinearTask(input: TaskManagerInput): Promise<TaskManagerOutput> {
    if (!this.linearClient) {
      return {
        success: false,
        message: 'Linear client not initialized. Please provide LINEAR_API_KEY.',
      };
    }

    try {
      switch (input.linear?.action) {
        case 'create_issue':
          return await this.createLinearIssue(input.linear.data);
        case 'update_issue':
          return await this.updateLinearIssue(input.linear.data);
        case 'query_issues':
          return await this.queryLinearIssues(input.linear.data);
        case 'create_project':
          return await this.createLinearProject(input.linear.data);
        default:
          return {
            success: false,
            message: `Unknown Linear action: ${input.linear?.action}`,
          };
      }
    } catch (error) {
      this.log('error', 'Linear task failed', error);
      return {
        success: false,
        message: `Linear task failed: ${(error as Error).message}`,
      };
    }
  }

  /**
   * Create Linear issue
   */
  private async createLinearIssue(data: any): Promise<TaskManagerOutput> {
    if (!this.linearClient) {
      throw new Error('Linear client not initialized');
    }

    try {
      const issuePayload = await this.linearClient.createIssue({
        title: data.title,
        description: data.description,
        teamId: data.teamId,
        priority: data.priority || 3,
        assigneeId: data.assigneeId,
        labelIds: data.labelIds || [],
      });

      const issue = await issuePayload.issue;

      if (!issue) {
        throw new Error('Failed to create issue');
      }

      this.log('info', `Created Linear issue: ${issue.id}`);

      return {
        success: true,
        linear: {
          issueId: issue.id,
          issueUrl: issue.url,
        },
        message: `Issue created successfully: ${issue.title}`,
      };
    } catch (error) {
      this.log('error', 'Failed to create Linear issue', error);
      throw error;
    }
  }

  /**
   * Update Linear issue
   */
  private async updateLinearIssue(data: any): Promise<TaskManagerOutput> {
    if (!this.linearClient) {
      throw new Error('Linear client not initialized');
    }

    try {
      const issuePayload = await this.linearClient.updateIssue(data.issueId, {
        title: data.title,
        description: data.description,
        priority: data.priority,
        stateId: data.stateId,
        assigneeId: data.assigneeId,
      });

      const issue = await issuePayload.issue;

      this.log('info', `Updated Linear issue: ${data.issueId}`);

      return {
        success: true,
        linear: {
          issueId: data.issueId,
          issueUrl: issue?.url,
        },
        message: `Issue updated successfully`,
      };
    } catch (error) {
      this.log('error', 'Failed to update Linear issue', error);
      throw error;
    }
  }

  /**
   * Query Linear issues
   */
  private async queryLinearIssues(data: any): Promise<TaskManagerOutput> {
    if (!this.linearClient) {
      throw new Error('Linear client not initialized');
    }

    try {
      const issues = await this.linearClient.issues({
        filter: {
          team: data.teamId ? { id: { eq: data.teamId } } : undefined,
          assignee: data.assigneeId ? { id: { eq: data.assigneeId } } : undefined,
          state: data.state ? { name: { eq: data.state } } : undefined,
        },
        first: data.limit || 10,
      });

      const issuesList = await Promise.all(
        (await issues.nodes).map(async (issue) => ({
          id: issue.id,
          title: issue.title,
          description: issue.description,
          state: (await issue.state)?.name,
          priority: issue.priority,
          url: issue.url,
        }))
      );

      this.log('info', `Queried ${issuesList.length} Linear issues`);

      return {
        success: true,
        linear: {
          issues: issuesList,
        },
        message: `Found ${issuesList.length} issues`,
      };
    } catch (error) {
      this.log('error', 'Failed to query Linear issues', error);
      throw error;
    }
  }

  /**
   * Create Linear project
   */
  private async createLinearProject(data: any): Promise<TaskManagerOutput> {
    if (!this.linearClient) {
      throw new Error('Linear client not initialized');
    }

    try {
      const projectPayload = await this.linearClient.createProject({
        name: data.name,
        description: data.description,
        teamIds: data.teamIds || [],
        leadId: data.leadId,
      });

      const project = await projectPayload.project;

      if (!project) {
        throw new Error('Failed to create project');
      }

      this.log('info', `Created Linear project: ${project.id}`);

      return {
        success: true,
        linear: {
          projectId: project.id,
        },
        message: `Project created successfully: ${project.name}`,
      };
    } catch (error) {
      this.log('error', 'Failed to create Linear project', error);
      throw error;
    }
  }

  /**
   * Handle generic task management (without Linear)
   */
  private async handleGenericTask(input: TaskManagerInput): Promise<TaskManagerOutput> {
    const prompt = `Process this task management request:

Type: ${input.type}
Data: ${JSON.stringify(input, null, 2)}

Provide a response indicating what action would be taken and any relevant information.`;

    try {
      const model = anthropic('claude-3-5-sonnet-20241022');
      const { text } = await generateText({
        model,
        prompt,
        maxTokens: 500,
        temperature: 0.3,
      });

      return {
        success: true,
        message: text,
      };
    } catch (error) {
      this.log('error', 'Generic task management failed', error);
      return {
        success: false,
        message: `Task management failed: ${(error as Error).message}`,
      };
    }
  }
}
