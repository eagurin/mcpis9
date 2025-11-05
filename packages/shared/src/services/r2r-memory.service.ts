/**
 * R2R Memory Service
 *
 * Integrates R2R for advanced memory and retrieval capabilities
 */

import { r2rClient } from 'r2r-js';
import type { R2RMemoryQuery, R2RMemoryEntry, ConversationContext } from '../types/agent.types';

export interface R2RConfig {
  baseUrl: string;
  apiKey?: string;
}

export class R2RMemoryService {
  private client: any;
  private config: R2RConfig;
  private isConnected: boolean = false;

  constructor(config: R2RConfig) {
    this.config = config;
    this.client = new r2rClient(config.baseUrl);
  }

  /**
   * Initialize connection to R2R
   */
  async connect(): Promise<void> {
    try {
      // Test connection
      await this.health();
      this.isConnected = true;
      console.log('[R2R] Connected successfully to', this.config.baseUrl);
    } catch (error) {
      console.error('[R2R] Connection failed:', error);
      this.isConnected = false;
      throw error;
    }
  }

  /**
   * Check R2R health
   */
  async health(): Promise<boolean> {
    try {
      const response = await this.client.health();
      return response?.status === 'ok';
    } catch (error) {
      console.error('[R2R] Health check failed:', error);
      return false;
    }
  }

  /**
   * Store conversation in R2R
   */
  async storeConversation(context: ConversationContext): Promise<void> {
    if (!this.isConnected) {
      console.warn('[R2R] Not connected, skipping storage');
      return;
    }

    try {
      const document = {
        id: context.id,
        content: JSON.stringify({
          messages: context.messages,
          summary: context.summary,
        }),
        metadata: {
          type: 'conversation',
          conversationId: context.id,
          userId: context.userId,
          messageCount: context.messages.length,
          startedAt: context.metadata.startedAt,
          lastActivity: context.metadata.lastActivity,
          tags: context.metadata.tags,
        },
      };

      await this.client.ingestDocuments({
        documents: [document],
        metadata: document.metadata,
      });

      console.log('[R2R] Stored conversation:', context.id);
    } catch (error) {
      console.error('[R2R] Failed to store conversation:', error);
      throw error;
    }
  }

  /**
   * Store individual message in R2R
   */
  async storeMessage(
    conversationId: string,
    role: 'user' | 'assistant' | 'system',
    content: string,
    metadata: Record<string, any> = {}
  ): Promise<void> {
    if (!this.isConnected) {
      console.warn('[R2R] Not connected, skipping message storage');
      return;
    }

    try {
      const document = {
        id: `${conversationId}-${Date.now()}`,
        content,
        metadata: {
          type: 'message',
          conversationId,
          role,
          timestamp: Date.now(),
          ...metadata,
        },
      };

      await this.client.ingestDocuments({
        documents: [document],
        metadata: document.metadata,
      });

      console.log('[R2R] Stored message for conversation:', conversationId);
    } catch (error) {
      console.error('[R2R] Failed to store message:', error);
      // Don't throw - message storage failures shouldn't break the flow
    }
  }

  /**
   * Store agent task result in R2R
   */
  async storeTaskResult(
    taskId: string,
    agentType: string,
    input: any,
    output: any,
    metadata: Record<string, any> = {}
  ): Promise<void> {
    if (!this.isConnected) {
      console.warn('[R2R] Not connected, skipping task storage');
      return;
    }

    try {
      const document = {
        id: taskId,
        content: JSON.stringify({
          input,
          output,
          agentType,
        }),
        metadata: {
          type: 'task_result',
          taskId,
          agentType,
          timestamp: Date.now(),
          ...metadata,
        },
      };

      await this.client.ingestDocuments({
        documents: [document],
        metadata: document.metadata,
      });

      console.log('[R2R] Stored task result:', taskId);
    } catch (error) {
      console.error('[R2R] Failed to store task result:', error);
    }
  }

  /**
   * Search memory using hybrid search (semantic + keyword)
   */
  async search(query: R2RMemoryQuery): Promise<R2RMemoryEntry[]> {
    if (!this.isConnected) {
      console.warn('[R2R] Not connected, returning empty results');
      return [];
    }

    try {
      const searchParams: any = {
        query: query.query,
        limit: query.limit || 10,
      };

      // Add filters
      if (query.filters) {
        searchParams.filters = query.filters;
      }

      // Execute search based on type
      let results;
      if (query.type === 'semantic') {
        results = await this.client.search(searchParams);
      } else if (query.type === 'keyword') {
        results = await this.client.search({
          ...searchParams,
          searchType: 'keyword',
        });
      } else {
        // Hybrid search (default)
        results = await this.client.search({
          ...searchParams,
          searchType: 'hybrid',
        });
      }

      // Transform results to R2RMemoryEntry format
      return (results?.results || []).map((result: any) => ({
        id: result.id || result.document_id,
        content: result.text || result.content,
        metadata: {
          conversationId: result.metadata?.conversationId || '',
          agentType: (result.metadata?.agentType as any) || 'boss',
          timestamp: result.metadata?.timestamp || Date.now(),
          tags: result.metadata?.tags || [],
        },
        relevanceScore: result.score,
      }));
    } catch (error) {
      console.error('[R2R] Search failed:', error);
      return [];
    }
  }

  /**
   * Get conversation context from memory
   */
  async getConversationContext(conversationId: string): Promise<R2RMemoryEntry[]> {
    return this.search({
      query: '',
      type: 'hybrid',
      filters: {
        conversationId,
      },
      limit: 50,
    });
  }

  /**
   * Search for similar past tasks
   */
  async findSimilarTasks(taskDescription: string, agentType?: string): Promise<R2RMemoryEntry[]> {
    return this.search({
      query: taskDescription,
      type: 'semantic',
      filters: {
        agentType: agentType as any,
        tags: ['task_result'],
      },
      limit: 5,
    });
  }

  /**
   * RAG Query - Get context and generate response
   */
  async ragQuery(query: string, conversationId?: string): Promise<string> {
    if (!this.isConnected) {
      console.warn('[R2R] Not connected, returning empty RAG response');
      return '';
    }

    try {
      const response = await this.client.rag({
        query,
        filters: conversationId ? { conversationId } : undefined,
        useKnowledgeGraph: true,
      });

      return response?.results?.[0]?.text || '';
    } catch (error) {
      console.error('[R2R] RAG query failed:', error);
      return '';
    }
  }

  /**
   * Agent reasoning with retrieval
   */
  async agentReason(prompt: string, context?: string): Promise<string> {
    if (!this.isConnected) {
      console.warn('[R2R] Not connected, skipping agent reasoning');
      return '';
    }

    try {
      const response = await this.client.agent({
        messages: [
          {
            role: 'user',
            content: context ? `Context: ${context}\n\nQuery: ${prompt}` : prompt,
          },
        ],
        useVectorSearch: true,
        useKnowledgeGraph: true,
      });

      return response?.choices?.[0]?.message?.content || '';
    } catch (error) {
      console.error('[R2R] Agent reasoning failed:', error);
      return '';
    }
  }

  /**
   * Build knowledge graph from conversations
   */
  async buildKnowledgeGraph(documentIds: string[]): Promise<void> {
    if (!this.isConnected) {
      console.warn('[R2R] Not connected, skipping knowledge graph build');
      return;
    }

    try {
      await this.client.createGraph({
        documentIds,
        settings: {
          extractEntities: true,
          extractRelationships: true,
        },
      });

      console.log('[R2R] Knowledge graph built for', documentIds.length, 'documents');
    } catch (error) {
      console.error('[R2R] Knowledge graph build failed:', error);
    }
  }

  /**
   * Query knowledge graph
   */
  async queryKnowledgeGraph(query: string): Promise<any> {
    if (!this.isConnected) {
      console.warn('[R2R] Not connected, returning empty KG results');
      return null;
    }

    try {
      const response = await this.client.graphQuery({
        query,
      });

      return response;
    } catch (error) {
      console.error('[R2R] Knowledge graph query failed:', error);
      return null;
    }
  }

  /**
   * Disconnect from R2R
   */
  disconnect(): void {
    this.isConnected = false;
    console.log('[R2R] Disconnected');
  }

  /**
   * Check if connected
   */
  isReady(): boolean {
    return this.isConnected;
  }
}

// Singleton instance
let r2rMemoryInstance: R2RMemoryService | null = null;

export function initR2RMemory(config: R2RConfig): R2RMemoryService {
  if (!r2rMemoryInstance) {
    r2rMemoryInstance = new R2RMemoryService(config);
  }
  return r2rMemoryInstance;
}

export function getR2RMemory(): R2RMemoryService | null {
  return r2rMemoryInstance;
}
