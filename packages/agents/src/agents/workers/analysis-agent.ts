/**
 * Analysis Agent - специализируется на анализе данных и выявлении паттернов
 */

import type { AgentTask, AgentTaskResult } from '@mcpis9/shared';
import { BaseAgent } from '../base-agent';

export class AnalysisAgent extends BaseAgent {
  protected async processTask(task: AgentTask, context: string): Promise<AgentTaskResult> {
    const toolsUsed: string[] = [];

    try {
      const analysisPrompt = `Context: ${context}

Task: ${task.description}

As an Analysis Agent, perform a thorough analysis:
1. Identify key patterns and trends
2. Extract meaningful insights
3. Identify correlations and relationships
4. Provide data-driven conclusions
5. Suggest actionable recommendations

Provide structured analysis with clear sections.`;

      const analysis = await this.callLLM([{
        id: `msg-${Date.now()}`,
        role: 'user',
        content: analysisPrompt,
        timestamp: new Date(),
      }], this.role.systemPrompt);

      const artifact = this.createArtifact(
        'analysis',
        'analysis-report.md',
        analysis,
        {
          analysisType: 'general',
          timestamp: new Date().toISOString(),
        }
      );

      return {
        taskId: task.taskId,
        success: true,
        output: analysis,
        artifacts: [artifact],
        toolsUsed,
        reasoning: 'Performed comprehensive analysis with pattern recognition and insight extraction',
        metadata: {
          analysisComplexity: 'medium',
        },
      };
    } catch (error) {
      return {
        taskId: task.taskId,
        success: false,
        output: '',
        toolsUsed,
        reasoning: 'Failed to complete analysis',
        error: error instanceof Error ? error.message : 'Unknown error',
        metadata: {},
      };
    }
  }
}
