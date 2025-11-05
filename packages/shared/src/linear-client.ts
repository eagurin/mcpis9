/**
 * Linear Integration Client
 * Provides integration with Linear for issue and project management
 */

import type {
  LinearConfig,
  LinearIssue,
  LinearUser,
  LinearLabel,
  LinearProject,
  Task,
  TaskPriority
} from './agent-types';

export class LinearClient {
  private apiKey: string;
  private baseUrl: string = 'https://api.linear.app/graphql';
  private teamId?: string;
  private workspaceId?: string;

  constructor(config: LinearConfig) {
    this.apiKey = config.apiKey;
    this.teamId = config.teamId;
    this.workspaceId = config.workspaceId;
  }

  /**
   * Execute a GraphQL query
   */
  private async graphql<T = any>(query: string, variables?: Record<string, any>): Promise<T> {
    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: this.apiKey
        },
        body: JSON.stringify({
          query,
          variables
        })
      });

      if (!response.ok) {
        throw new Error(`Linear API error: ${response.statusText}`);
      }

      const data = await response.json();

      if (data.errors) {
        throw new Error(`GraphQL errors: ${JSON.stringify(data.errors)}`);
      }

      return data.data as T;
    } catch (error) {
      console.error('Linear GraphQL error:', error);
      throw error;
    }
  }

  /**
   * Create a new issue in Linear
   */
  async createIssue(params: {
    title: string;
    description?: string;
    teamId: string;
    priority?: number;
    assigneeId?: string;
    labelIds?: string[];
    projectId?: string;
  }): Promise<LinearIssue> {
    const mutation = `
      mutation CreateIssue($input: IssueCreateInput!) {
        issueCreate(input: $input) {
          success
          issue {
            id
            identifier
            title
            description
            priority
            createdAt
            updatedAt
            state {
              id
              name
            }
            assignee {
              id
              name
              email
            }
            labels {
              nodes {
                id
                name
                color
              }
            }
            project {
              id
              name
            }
          }
        }
      }
    `;

    const variables = {
      input: {
        title: params.title,
        description: params.description,
        teamId: params.teamId,
        priority: params.priority,
        assigneeId: params.assigneeId,
        labelIds: params.labelIds,
        projectId: params.projectId
      }
    };

    const result = await this.graphql<{ issueCreate: { issue: any } }>(mutation, variables);

    return this.mapIssue(result.issueCreate.issue);
  }

  /**
   * Get an issue by ID
   */
  async getIssue(issueId: string): Promise<LinearIssue | null> {
    const query = `
      query GetIssue($id: String!) {
        issue(id: $id) {
          id
          identifier
          title
          description
          priority
          createdAt
          updatedAt
          state {
            id
            name
          }
          assignee {
            id
            name
            email
          }
          labels {
            nodes {
              id
              name
              color
            }
          }
          project {
            id
            name
          }
        }
      }
    `;

    try {
      const result = await this.graphql<{ issue: any }>(query, { id: issueId });
      return result.issue ? this.mapIssue(result.issue) : null;
    } catch (error) {
      console.error('Error fetching issue:', error);
      return null;
    }
  }

  /**
   * Update an issue
   */
  async updateIssue(
    issueId: string,
    updates: {
      title?: string;
      description?: string;
      priority?: number;
      stateId?: string;
      assigneeId?: string;
      labelIds?: string[];
    }
  ): Promise<LinearIssue | null> {
    const mutation = `
      mutation UpdateIssue($id: String!, $input: IssueUpdateInput!) {
        issueUpdate(id: $id, input: $input) {
          success
          issue {
            id
            identifier
            title
            description
            priority
            createdAt
            updatedAt
            state {
              id
              name
            }
            assignee {
              id
              name
              email
            }
            labels {
              nodes {
                id
                name
                color
              }
            }
            project {
              id
              name
            }
          }
        }
      }
    `;

    try {
      const result = await this.graphql<{ issueUpdate: { issue: any } }>(mutation, {
        id: issueId,
        input: updates
      });

      return result.issueUpdate.issue ? this.mapIssue(result.issueUpdate.issue) : null;
    } catch (error) {
      console.error('Error updating issue:', error);
      return null;
    }
  }

  /**
   * List issues with filters
   */
  async listIssues(params?: {
    teamId?: string;
    assigneeId?: string;
    projectId?: string;
    stateId?: string;
    limit?: number;
  }): Promise<LinearIssue[]> {
    const query = `
      query ListIssues($filter: IssueFilter, $first: Int) {
        issues(filter: $filter, first: $first) {
          nodes {
            id
            identifier
            title
            description
            priority
            createdAt
            updatedAt
            state {
              id
              name
            }
            assignee {
              id
              name
              email
            }
            labels {
              nodes {
                id
                name
                color
              }
            }
            project {
              id
              name
            }
          }
        }
      }
    `;

    const filter: any = {};
    if (params?.teamId) filter.team = { id: { eq: params.teamId } };
    if (params?.assigneeId) filter.assignee = { id: { eq: params.assigneeId } };
    if (params?.projectId) filter.project = { id: { eq: params.projectId } };
    if (params?.stateId) filter.state = { id: { eq: params.stateId } };

    try {
      const result = await this.graphql<{ issues: { nodes: any[] } }>(query, {
        filter: Object.keys(filter).length > 0 ? filter : undefined,
        first: params?.limit || 50
      });

      return result.issues.nodes.map(issue => this.mapIssue(issue));
    } catch (error) {
      console.error('Error listing issues:', error);
      return [];
    }
  }

  /**
   * Create an issue from a task
   */
  async createIssueFromTask(task: Task, teamId: string): Promise<LinearIssue | null> {
    try {
      const priorityMap: Record<TaskPriority, number> = {
        critical: 1,
        high: 2,
        medium: 3,
        low: 4
      };

      return await this.createIssue({
        title: task.title,
        description: task.description,
        teamId,
        priority: priorityMap[task.priority]
      });
    } catch (error) {
      console.error('Error creating issue from task:', error);
      return null;
    }
  }

  /**
   * Sync task status with Linear issue
   */
  async syncTaskWithIssue(task: Task, issueId: string): Promise<boolean> {
    try {
      const statusMap: Record<string, string> = {
        queued: 'Backlog',
        in_progress: 'In Progress',
        blocked: 'Blocked',
        completed: 'Done',
        failed: 'Canceled',
        cancelled: 'Canceled'
      };

      // Get workflow states for the team
      const states = await this.getWorkflowStates(this.teamId!);
      const targetState = states.find(s => s.name === statusMap[task.status]);

      if (targetState) {
        await this.updateIssue(issueId, {
          stateId: targetState.id
        });
        return true;
      }

      return false;
    } catch (error) {
      console.error('Error syncing task with issue:', error);
      return false;
    }
  }

  /**
   * Get workflow states for a team
   */
  async getWorkflowStates(teamId: string): Promise<Array<{ id: string; name: string }>> {
    const query = `
      query GetWorkflowStates($teamId: String!) {
        team(id: $teamId) {
          states {
            nodes {
              id
              name
              type
            }
          }
        }
      }
    `;

    try {
      const result = await this.graphql<{ team: { states: { nodes: any[] } } }>(query, {
        teamId
      });

      return result.team.states.nodes.map(state => ({
        id: state.id,
        name: state.name
      }));
    } catch (error) {
      console.error('Error getting workflow states:', error);
      return [];
    }
  }

  /**
   * Get current user
   */
  async getCurrentUser(): Promise<LinearUser | null> {
    const query = `
      query GetCurrentUser {
        viewer {
          id
          name
          email
        }
      }
    `;

    try {
      const result = await this.graphql<{ viewer: any }>(query);
      return {
        id: result.viewer.id,
        name: result.viewer.name,
        email: result.viewer.email
      };
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  }

  /**
   * Map Linear API response to LinearIssue type
   */
  private mapIssue(issue: any): LinearIssue {
    return {
      id: issue.id,
      identifier: issue.identifier,
      title: issue.title,
      description: issue.description,
      status: issue.state?.name || 'Unknown',
      priority: issue.priority || 0,
      assignee: issue.assignee
        ? {
            id: issue.assignee.id,
            name: issue.assignee.name,
            email: issue.assignee.email
          }
        : undefined,
      labels: issue.labels?.nodes?.map((label: any) => ({
        id: label.id,
        name: label.name,
        color: label.color
      })),
      project: issue.project
        ? {
            id: issue.project.id,
            name: issue.project.name,
            status: 'active'
          }
        : undefined,
      createdAt: new Date(issue.createdAt),
      updatedAt: new Date(issue.updatedAt)
    };
  }

  /**
   * Health check
   */
  async healthCheck(): Promise<boolean> {
    try {
      await this.getCurrentUser();
      return true;
    } catch (error) {
      console.error('Linear health check failed:', error);
      return false;
    }
  }
}

/**
 * Create a Linear client instance
 */
export function createLinearClient(config?: Partial<LinearConfig>): LinearClient | null {
  const apiKey = config?.apiKey || process.env.LINEAR_API_KEY;

  if (!apiKey) {
    console.warn('Linear API key not provided. Linear integration disabled.');
    return null;
  }

  return new LinearClient({
    apiKey,
    teamId: config?.teamId || process.env.LINEAR_TEAM_ID,
    workspaceId: config?.workspaceId || process.env.LINEAR_WORKSPACE_ID
  });
}
