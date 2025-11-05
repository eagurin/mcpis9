/**
 * Research Agent - Specialized for information gathering and analysis
 *
 * Handles web search, documentation lookup, and knowledge base queries
 */

import { anthropic } from '@ai-sdk/anthropic';
import { generateText } from 'ai';
import { BaseAgent } from './base-agent';
import type {
  AgentConfig,
  Task,
  ResearchTaskInput,
  ResearchTaskOutput,
} from '../types/agent.types';
import type { R2RMemoryService } from '../services/r2r-memory.service';

export class ResearchAgent extends BaseAgent {
  constructor(memory?: R2RMemoryService) {
    const config: AgentConfig = {
      id: 'research-agent-001',
      type: 'research',
      name: 'Research Agent',
      description: 'Specialized agent for information gathering and analysis',
      capabilities: [
        'research_web',
        'research_docs',
        'research_knowledge',
      ],
      maxConcurrentTasks: 5,
      timeout: 30000, // 30 seconds
      retryAttempts: 3,
      model: {
        provider: 'anthropic',
        model: 'claude-3-5-sonnet-20241022',
      },
    };

    super(config, memory);
  }

  protected setupMessageHandlers(): void {
    this.messageHandlers.set('request', async (message) => {
      this.log('info', 'Received research task request');
    });
  }

  protected async processTask(task: Task): Promise<ResearchTaskOutput> {
    const input = task.input as ResearchTaskInput;

    this.log('info', `Processing ${input.type} research task`);

    switch (input.type) {
      case 'web':
        return this.researchWeb(input);
      case 'docs':
        return this.researchDocs(input);
      case 'knowledge':
        return this.researchKnowledge(input);
      default:
        throw new Error(`Unknown research task type: ${input.type}`);
    }
  }

  /**
   * Research using web search
   */
  private async researchWeb(input: ResearchTaskInput): Promise<ResearchTaskOutput> {
    const prompt = `Research the following query using your knowledge:

Query: ${input.query}

${input.context ? `Context: ${input.context}` : ''}

${input.constraints?.maxResults ? `Limit to ${input.constraints.maxResults} key findings` : ''}

Provide:
1. Key findings with sources (cite your knowledge base)
2. A comprehensive summary
3. Confidence level in the findings (0-1)

Format as JSON:
{
  "findings": [
    {
      "source": "source name or knowledge base",
      "content": "finding content",
      "relevance": 0.95,
      "url": "url if applicable"
    }
  ],
  "summary": "comprehensive summary",
  "citations": ["citation1", "citation2"],
  "confidence": 0.85
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
        throw new Error('Failed to parse research response');
      }

      const researchData = JSON.parse(jsonMatch[0]);

      return {
        findings: researchData.findings || [],
        summary: researchData.summary || '',
        citations: researchData.citations || [],
        confidence: researchData.confidence || 0.5,
      };
    } catch (error) {
      this.log('error', 'Web research failed', error);
      throw error;
    }
  }

  /**
   * Research documentation
   */
  private async researchDocs(input: ResearchTaskInput): Promise<ResearchTaskOutput> {
    const prompt = `Research documentation for the following:

Query: ${input.query}

${input.context ? `Context: ${input.context}` : ''}

${input.constraints?.sources ? `Focus on these sources: ${input.constraints.sources.join(', ')}` : ''}

Provide detailed documentation findings, code examples if relevant, and best practices.

Format as JSON with findings, summary, citations, and confidence level.`;

    try {
      const model = anthropic('claude-3-5-sonnet-20241022');
      const { text } = await this.withRetry(async () => {
        const result = await generateText({
          model,
          prompt,
          maxTokens: 2500,
          temperature: 0.3,
        });
        return result;
      });

      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('Failed to parse documentation research response');
      }

      const researchData = JSON.parse(jsonMatch[0]);

      return {
        findings: researchData.findings || [],
        summary: researchData.summary || '',
        citations: researchData.citations || [],
        confidence: researchData.confidence || 0.7,
      };
    } catch (error) {
      this.log('error', 'Documentation research failed', error);
      throw error;
    }
  }

  /**
   * Research knowledge base (using R2R if available)
   */
  private async researchKnowledge(input: ResearchTaskInput): Promise<ResearchTaskOutput> {
    if (this.memory?.isReady()) {
      this.log('info', 'Searching R2R knowledge base');

      try {
        // Search R2R memory
        const memoryResults = await this.memory.search({
          query: input.query,
          type: 'hybrid',
          limit: input.constraints?.maxResults || 10,
        });

        if (memoryResults.length > 0) {
          // Use AI to synthesize findings
          const prompt = `Synthesize these knowledge base results into a coherent response:

Query: ${input.query}

Results:
${memoryResults.map((r, i) => `${i + 1}. ${r.content} (Relevance: ${r.relevanceScore})`).join('\n\n')}

Provide a summary and key findings.`;

          const model = anthropic('claude-3-5-sonnet-20241022');
          const { text } = await generateText({
            model,
            prompt,
            maxTokens: 1500,
            temperature: 0.4,
          });

          return {
            findings: memoryResults.map((r) => ({
              source: 'Knowledge Base',
              content: r.content,
              relevance: r.relevanceScore || 0,
            })),
            summary: text,
            citations: memoryResults.map((r) => r.id),
            confidence: 0.9,
          };
        }
      } catch (error) {
        this.log('warn', 'R2R search failed, falling back to AI', error);
      }
    }

    // Fallback: Use AI knowledge
    const prompt = `Answer this query using your knowledge base:

Query: ${input.query}

${input.context ? `Context: ${input.context}` : ''}

Provide detailed findings and a summary.`;

    try {
      const model = anthropic('claude-3-5-sonnet-20241022');
      const { text } = await generateText({
        model,
        prompt,
        maxTokens: 1500,
        temperature: 0.4,
      });

      return {
        findings: [
          {
            source: 'AI Knowledge',
            content: text,
            relevance: 0.8,
          },
        ],
        summary: text,
        citations: ['AI Knowledge Base'],
        confidence: 0.7,
      };
    } catch (error) {
      this.log('error', 'Knowledge base research failed', error);
      throw error;
    }
  }
}
