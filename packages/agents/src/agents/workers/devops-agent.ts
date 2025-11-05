/**
 * DevOps Agent - специализируется на инфраструктуре и развертывании
 */

import type { AgentTask, AgentTaskResult } from '@mcpis9/shared';
import { BaseAgent } from '../base-agent';

export class DevOpsAgent extends BaseAgent {
  protected async processTask(task: AgentTask, context: string): Promise<AgentTaskResult> {
    const toolsUsed: string[] = [];

    try {
      const devopsPrompt = `Context: ${context}

Task: ${task.description}

As a DevOps Agent, address the infrastructure/deployment needs:
1. Analyze infrastructure requirements
2. Consider scalability and reliability
3. Plan deployment strategy
4. Address monitoring and logging
5. Consider security best practices
6. Provide CI/CD recommendations

Provide actionable DevOps recommendations.`;

      const recommendations = await this.callLLM([{
        id: `msg-${Date.now()}`,
        role: 'user',
        content: devopsPrompt,
        timestamp: new Date(),
      }], this.role.systemPrompt);

      const artifact = this.createArtifact(
        'document',
        'devops-plan.md',
        recommendations,
        {
          category: 'devops',
          timestamp: new Date().toISOString(),
        }
      );

      return {
        taskId: task.taskId,
        success: true,
        output: recommendations,
        artifacts: [artifact],
        toolsUsed,
        reasoning: 'Provided DevOps recommendations covering infrastructure, deployment, and operations',
        metadata: {
          focus: 'devops',
        },
      };
    } catch (error) {
      return {
        taskId: task.taskId,
        success: false,
        output: '',
        toolsUsed,
        reasoning: 'Failed to provide DevOps recommendations',
        error: error instanceof Error ? error.message : 'Unknown error',
        metadata: {},
      };
    }
  }
}
