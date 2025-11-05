/**
 * Code Agent - Specialized for software development tasks
 *
 * Handles code generation, review, refactoring, and debugging
 */

import { anthropic } from '@ai-sdk/anthropic';
import { generateText } from 'ai';
import { BaseAgent } from './base-agent';
import type {
  AgentConfig,
  Task,
  CodeTaskInput,
  CodeTaskOutput,
} from '../types/agent.types';
import type { R2RMemoryService } from '../services/r2r-memory.service';

export class CodeAgent extends BaseAgent {
  constructor(memory?: R2RMemoryService) {
    const config: AgentConfig = {
      id: 'code-agent-001',
      type: 'code',
      name: 'Code Agent',
      description: 'Specialized agent for software development tasks',
      capabilities: [
        'code_generation',
        'code_review',
        'code_refactor',
        'code_debug',
      ],
      maxConcurrentTasks: 3,
      timeout: 60000, // 60 seconds
      retryAttempts: 2,
      model: {
        provider: 'anthropic',
        model: 'claude-3-5-sonnet-20241022',
      },
    };

    super(config, memory);
  }

  protected setupMessageHandlers(): void {
    this.messageHandlers.set('request', async (message) => {
      this.log('info', 'Received code task request');
    });
  }

  protected async processTask(task: Task): Promise<CodeTaskOutput> {
    const input = task.input as CodeTaskInput;

    this.log('info', `Processing ${input.type} task`);

    switch (input.type) {
      case 'generation':
        return this.generateCode(input);
      case 'review':
        return this.reviewCode(input);
      case 'refactor':
        return this.refactorCode(input);
      case 'debug':
        return this.debugCode(input);
      default:
        throw new Error(`Unknown code task type: ${input.type}`);
    }
  }

  /**
   * Generate code based on requirements
   */
  private async generateCode(input: CodeTaskInput): Promise<CodeTaskOutput> {
    const prompt = `Generate ${input.language || 'code'} based on these requirements:

Description: ${input.context.description}

${input.context.requirements ? `Requirements:\n${input.context.requirements.join('\n')}` : ''}

${input.context.existingCode ? `Existing Code Context:\n\`\`\`\n${input.context.existingCode}\n\`\`\`` : ''}

Provide:
1. The complete, working code
2. A brief explanation of the implementation
3. Any important notes or caveats

Format your response as:
CODE:
\`\`\`${input.language || 'typescript'}
[code here]
\`\`\`

EXPLANATION:
[explanation here]`;

    try {
      const model = anthropic('claude-3-5-sonnet-20241022');
      const { text } = await this.withRetry(async () => {
        const result = await generateText({
          model,
          prompt,
          maxTokens: 3000,
          temperature: 0.3,
        });
        return result;
      });

      // Parse response
      const codeMatch = text.match(/```[\w]*\n([\s\S]*?)```/);
      const code = codeMatch ? codeMatch[1].trim() : text;

      const explanationMatch = text.match(/EXPLANATION:\s*([\s\S]*)/);
      const explanation = explanationMatch
        ? explanationMatch[1].trim()
        : 'Code generated successfully.';

      return {
        code,
        explanation,
      };
    } catch (error) {
      this.log('error', 'Code generation failed', error);
      throw error;
    }
  }

  /**
   * Review code for issues and improvements
   */
  private async reviewCode(input: CodeTaskInput): Promise<CodeTaskOutput> {
    const prompt = `Review this code for issues, best practices, and potential improvements:

${input.language ? `Language: ${input.language}` : ''}

Code:
\`\`\`
${input.context.existingCode}
\`\`\`

Context: ${input.context.description}

Provide:
1. A list of issues (errors, warnings, or suggestions) with severity levels
2. Specific improvement suggestions
3. Overall assessment

Format as JSON:
{
  "issues": [
    {
      "severity": "error" | "warning" | "info",
      "message": "issue description",
      "line": line_number,
      "suggestion": "how to fix"
    }
  ],
  "suggestions": ["suggestion 1", "suggestion 2"],
  "explanation": "overall assessment"
}`;

    try {
      const model = anthropic('claude-3-5-sonnet-20241022');
      const { text } = await this.withRetry(async () => {
        const result = await generateText({
          model,
          prompt,
          maxTokens: 2000,
          temperature: 0.2,
        });
        return result;
      });

      // Parse JSON response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('Failed to parse review response');
      }

      const reviewData = JSON.parse(jsonMatch[0]);

      return {
        review: {
          issues: reviewData.issues || [],
          suggestions: reviewData.suggestions || [],
        },
        explanation: reviewData.explanation || 'Code review completed.',
      };
    } catch (error) {
      this.log('error', 'Code review failed', error);
      throw error;
    }
  }

  /**
   * Refactor code for better quality
   */
  private async refactorCode(input: CodeTaskInput): Promise<CodeTaskOutput> {
    const prompt = `Refactor this code to improve quality, readability, and maintainability:

${input.language ? `Language: ${input.language}` : ''}

Original Code:
\`\`\`
${input.context.existingCode}
\`\`\`

Context: ${input.context.description}

${input.context.requirements ? `Goals:\n${input.context.requirements.join('\n')}` : 'Goals: Improve code quality'}

Provide:
1. The refactored code
2. Explanation of changes made
3. Benefits of the refactoring

CODE:
\`\`\`
[refactored code]
\`\`\`

CHANGES:
[explanation of changes]`;

    try {
      const model = anthropic('claude-3-5-sonnet-20241022');
      const { text } = await this.withRetry(async () => {
        const result = await generateText({
          model,
          prompt,
          maxTokens: 3000,
          temperature: 0.3,
        });
        return result;
      });

      // Parse response
      const codeMatch = text.match(/```[\w]*\n([\s\S]*?)```/);
      const code = codeMatch ? codeMatch[1].trim() : text;

      const changesMatch = text.match(/CHANGES:\s*([\s\S]*)/);
      const explanation = changesMatch
        ? changesMatch[1].trim()
        : 'Code refactored successfully.';

      return {
        code,
        explanation,
      };
    } catch (error) {
      this.log('error', 'Code refactoring failed', error);
      throw error;
    }
  }

  /**
   * Debug code and suggest fixes
   */
  private async debugCode(input: CodeTaskInput): Promise<CodeTaskOutput> {
    const prompt = `Debug this code and provide fixes:

${input.language ? `Language: ${input.language}` : ''}

Code with Issues:
\`\`\`
${input.context.existingCode}
\`\`\`

Problem Description: ${input.context.description}

Provide:
1. Identification of the bug(s)
2. Fixed version of the code
3. Explanation of the fix

DIAGNOSIS:
[what's wrong]

FIXED CODE:
\`\`\`
[fixed code]
\`\`\`

EXPLANATION:
[how the fix works]`;

    try {
      const model = anthropic('claude-3-5-sonnet-20241022');
      const { text } = await this.withRetry(async () => {
        const result = await generateText({
          model,
          prompt,
          maxTokens: 3000,
          temperature: 0.2,
        });
        return result;
      });

      // Parse response
      const codeMatch = text.match(/```[\w]*\n([\s\S]*?)```/);
      const code = codeMatch ? codeMatch[1].trim() : '';

      const explanationMatch = text.match(/EXPLANATION:\s*([\s\S]*)/);
      const explanation = explanationMatch
        ? explanationMatch[1].trim()
        : 'Code debugged and fixed.';

      return {
        code,
        explanation,
      };
    } catch (error) {
      this.log('error', 'Code debugging failed', error);
      throw error;
    }
  }
}
