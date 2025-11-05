/**
 * Research Agent - специализируется на исследовании и сборе информации
 */

import type { AgentTask, AgentTaskResult } from '@mcpis9/shared';
import { BaseAgent } from '../base-agent';

export class ResearchAgent extends BaseAgent {
  protected async processTask(task: AgentTask, context: string): Promise<AgentTaskResult> {
    const toolsUsed: string[] = [];

    try {
      // 1. Определяем, что нужно исследовать
      const researchPlanPrompt = `Context: ${context}

Task: ${task.description}

As a Research Agent, create a research plan:
1. What information needs to be gathered?
2. What sources should be consulted?
3. What questions need to be answered?
4. What facts need to be verified?

Provide a structured research plan.`;

      const researchPlan = await this.callLLM([{
        id: `msg-${Date.now()}`,
        role: 'user',
        content: researchPlanPrompt,
        timestamp: new Date(),
      }], this.role.systemPrompt);

      // 2. Ищем релевантную информацию в памяти
      const memoryResults = await this.memory.searchLongTerm(task.description, 5);
      const memoryContext = memoryResults.length > 0
        ? `\n\nRelevant information from memory:\n${memoryResults.map(d => d.content).join('\n')}`
        : '';

      // 3. Если требуется, используем поиск
      let searchResults = '';
      if (task.requirements.some(r => r.includes('search') || r.includes('find') || r.includes('latest'))) {
        try {
          const results = await this.useTool('search', {
            query: task.description,
            maxResults: 5,
          });
          searchResults = `\n\nSearch results:\n${JSON.stringify(results, null, 2)}`;
          toolsUsed.push('search');
        } catch (error) {
          console.warn('Search failed:', error);
        }
      }

      // 4. Синтезируем результаты исследования
      const synthesisPrompt = `Research plan:
${researchPlan}
${memoryContext}
${searchResults}

Based on all available information, provide a comprehensive answer to: ${task.description}

Include:
- Key findings
- Supporting evidence
- Relevant facts
- Sources of information`;

      const synthesis = await this.callLLM([{
        id: `msg-${Date.now()}`,
        role: 'user',
        content: synthesisPrompt,
        timestamp: new Date(),
      }]);

      // 5. Создаем артефакт с результатами исследования
      const artifact = this.createArtifact(
        'document',
        'research-findings.md',
        synthesis,
        {
          sources: memoryResults.length + (searchResults ? 1 : 0),
          timestamp: new Date().toISOString(),
        }
      );

      return {
        taskId: task.taskId,
        success: true,
        output: synthesis,
        artifacts: [artifact],
        toolsUsed,
        reasoning: 'Conducted comprehensive research using memory and search tools, synthesized findings',
        metadata: {
          memorySources: memoryResults.length,
          searchPerformed: searchResults.length > 0,
        },
      };
    } catch (error) {
      return {
        taskId: task.taskId,
        success: false,
        output: '',
        toolsUsed,
        reasoning: 'Failed to complete research',
        error: error instanceof Error ? error.message : 'Unknown error',
        metadata: {},
      };
    }
  }
}
