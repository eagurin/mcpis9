/**
 * Creative Agent - специализируется на создании контента
 */

import type { AgentTask, AgentTaskResult } from '@mcpis9/shared';
import { BaseAgent } from '../base-agent';

export class CreativeAgent extends BaseAgent {
  protected async processTask(task: AgentTask, context: string): Promise<AgentTaskResult> {
    const toolsUsed: string[] = [];

    try {
      const creativePrompt = `Context: ${context}

Task: ${task.description}

As a Creative Agent, generate creative content:
1. Brainstorm innovative ideas
2. Create engaging and original content
3. Consider tone, style, and audience
4. Ensure clarity and impact
5. Add creative flair while maintaining quality

Be imaginative but focused on the task requirements.`;

      const content = await this.callLLM([{
        id: `msg-${Date.now()}`,
        role: 'user',
        content: creativePrompt,
        timestamp: new Date(),
      }], this.role.systemPrompt);

      const artifact = this.createArtifact(
        'document',
        'creative-content.md',
        content,
        {
          contentType: 'creative',
          timestamp: new Date().toISOString(),
        }
      );

      return {
        taskId: task.taskId,
        success: true,
        output: content,
        artifacts: [artifact],
        toolsUsed,
        reasoning: 'Generated creative content with focus on originality and engagement',
        metadata: {
          style: 'creative',
        },
      };
    } catch (error) {
      return {
        taskId: task.taskId,
        success: false,
        output: '',
        toolsUsed,
        reasoning: 'Failed to generate creative content',
        error: error instanceof Error ? error.message : 'Unknown error',
        metadata: {},
      };
    }
  }
}
