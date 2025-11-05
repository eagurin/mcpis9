/**
 * Code Agent - специализируется на программировании
 */

import type { AgentTask, AgentTaskResult } from '@mcpis9/shared';
import { BaseAgent } from '../base-agent';

export class CodeAgent extends BaseAgent {
  protected async processTask(task: AgentTask, context: string): Promise<AgentTaskResult> {
    const toolsUsed: string[] = [];

    try {
      // 1. Анализируем задачу
      const analysisPrompt = `Context: ${context}

Task: ${task.description}

As a Code Agent specialized in programming, please:
1. Analyze what code needs to be written
2. Identify the programming language and framework
3. Consider best practices and patterns
4. Plan the implementation

Provide your analysis and approach.`;

      const analysis = await this.callLLM([{
        id: `msg-${Date.now()}`,
        role: 'user',
        content: analysisPrompt,
        timestamp: new Date(),
      }], this.role.systemPrompt);

      // 2. Если нужно, используем инструменты
      let codeOutput = '';
      if (task.requirements.some(r => r.includes('execute') || r.includes('run'))) {
        try {
          codeOutput = await this.useTool('execute_code', {
            code: 'console.log("Hello from Code Agent");',
            language: 'javascript',
          });
          toolsUsed.push('execute_code');
        } catch (error) {
          console.warn('Code execution failed:', error);
        }
      }

      // 3. Генерируем код
      const codeGenPrompt = `Based on your analysis:
${analysis}

Now generate the actual code implementation. Include:
- Complete, working code
- Inline comments explaining key parts
- Error handling
- Type safety (if applicable)`;

      const generatedCode = await this.callLLM([{
        id: `msg-${Date.now()}`,
        role: 'user',
        content: codeGenPrompt,
        timestamp: new Date(),
      }]);

      // 4. Создаем артефакт с кодом
      const artifact = this.createArtifact(
        'code',
        `${task.description.substring(0, 30)}.code`,
        generatedCode,
        {
          language: 'javascript',
          framework: 'unknown',
        }
      );

      return {
        taskId: task.taskId,
        success: true,
        output: `Code implementation completed.\n\nAnalysis:\n${analysis}\n\nGenerated Code:\n${generatedCode}`,
        artifacts: [artifact],
        toolsUsed,
        reasoning: 'Analyzed requirements, planned implementation, generated code with best practices',
        metadata: {
          language: 'javascript',
          linesOfCode: generatedCode.split('\n').length,
        },
      };
    } catch (error) {
      return {
        taskId: task.taskId,
        success: false,
        output: '',
        toolsUsed,
        reasoning: 'Failed to generate code',
        error: error instanceof Error ? error.message : 'Unknown error',
        metadata: {},
      };
    }
  }
}
