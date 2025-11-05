/**
 * Data Agent - Specialized for data operations and analysis
 *
 * Handles data queries, analysis, and transformations
 */

import { anthropic } from '@ai-sdk/anthropic';
import { generateText } from 'ai';
import { BaseAgent } from './base-agent';
import type {
  AgentConfig,
  Task,
  DataTaskInput,
  DataTaskOutput,
} from '../types/agent.types';
import type { R2RMemoryService } from '../services/r2r-memory.service';

export class DataAgent extends BaseAgent {
  constructor(memory?: R2RMemoryService) {
    const config: AgentConfig = {
      id: 'data-agent-001',
      type: 'data',
      name: 'Data Agent',
      description: 'Specialized agent for data operations and analysis',
      capabilities: [
        'data_query',
        'data_analysis',
        'data_transform',
      ],
      maxConcurrentTasks: 5,
      timeout: 45000, // 45 seconds
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
      this.log('info', 'Received data task request');
    });
  }

  protected async processTask(task: Task): Promise<DataTaskOutput> {
    const input = task.input as DataTaskInput;

    this.log('info', `Processing ${input.type} data task`);

    switch (input.type) {
      case 'query':
        return this.queryData(input);
      case 'analysis':
        return this.analyzeData(input);
      case 'transform':
        return this.transformData(input);
      default:
        throw new Error(`Unknown data task type: ${input.type}`);
    }
  }

  /**
   * Query data (simulated - would connect to actual database)
   */
  private async queryData(input: DataTaskInput): Promise<DataTaskOutput> {
    const startTime = Date.now();

    const prompt = `Analyze this data query request and provide insights:

Query: ${input.query}

${input.data ? `Context Data: ${JSON.stringify(input.data, null, 2)}` : ''}

Explain:
1. What the query is trying to accomplish
2. Expected results structure
3. Any potential issues or optimizations

Respond in a helpful format.`;

    try {
      const model = anthropic('claude-3-5-sonnet-20241022');
      const { text } = await this.withRetry(async () => {
        const result = await generateText({
          model,
          prompt,
          maxTokens: 1000,
          temperature: 0.3,
        });
        return result;
      });

      const executionTime = Date.now() - startTime;

      return {
        results: {
          analysis: text,
          note: 'This is a simulated query. In production, this would execute against a real database.',
        },
        metadata: {
          executionTime,
          queryPlan: 'Simulated execution plan',
        },
      };
    } catch (error) {
      this.log('error', 'Data query failed', error);
      throw error;
    }
  }

  /**
   * Analyze data
   */
  private async analyzeData(input: DataTaskInput): Promise<DataTaskOutput> {
    const startTime = Date.now();

    const prompt = `Analyze this data and provide insights:

Data: ${JSON.stringify(input.data, null, 2)}

${input.operations ? `Analysis Operations: ${JSON.stringify(input.operations)}` : ''}

Provide:
1. Key statistics and patterns
2. Trends and anomalies
3. Actionable insights
4. Visualization recommendations

Format as JSON:
{
  "statistics": {},
  "patterns": [],
  "insights": [],
  "visualizations": []
}`;

    try {
      const model = anthropic('claude-3-5-sonnet-20241022');
      const { text } = await this.withRetry(async () => {
        const result = await generateText({
          model,
          prompt,
          maxTokens: 2000,
          temperature: 0.4,
        });
        return result;
      });

      // Parse JSON response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('Failed to parse analysis response');
      }

      const analysisData = JSON.parse(jsonMatch[0]);
      const executionTime = Date.now() - startTime;

      return {
        results: analysisData,
        metadata: {
          executionTime,
        },
        visualizations: analysisData.visualizations || [],
      };
    } catch (error) {
      this.log('error', 'Data analysis failed', error);
      throw error;
    }
  }

  /**
   * Transform data
   */
  private async transformData(input: DataTaskInput): Promise<DataTaskOutput> {
    const startTime = Date.now();

    const prompt = `Transform this data according to the operations:

Input Data: ${JSON.stringify(input.data, null, 2)}

Operations: ${JSON.stringify(input.operations, null, 2)}

Apply the transformations and return the transformed data.
Explain each transformation step.

Format as JSON:
{
  "transformedData": {},
  "transformations": [],
  "summary": "explanation"
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
        throw new Error('Failed to parse transformation response');
      }

      const transformData = JSON.parse(jsonMatch[0]);
      const executionTime = Date.now() - startTime;

      return {
        results: transformData.transformedData,
        metadata: {
          executionTime,
        },
      };
    } catch (error) {
      this.log('error', 'Data transformation failed', error);
      throw error;
    }
  }
}
