/**
 * R2R (Retrieval-Augmented Retrieval) Memory Client
 * Provides advanced memory capabilities for the agent system
 */

import type {
  R2RConfig,
  R2RDocument,
  R2RSearchQuery,
  R2RSearchResult,
  MemoryEntry,
  KnowledgeBaseReference
} from './agent-types';

export class R2RMemoryClient {
  private baseUrl: string;
  private apiKey?: string;
  private collections: Map<string, string> = new Map();

  constructor(config: R2RConfig) {
    this.baseUrl = config.baseUrl || 'http://localhost:7272';
    this.apiKey = config.apiKey;

    // Initialize collections
    config.collections?.forEach(col => {
      this.collections.set(col.name, col.id);
    });
  }

  /**
   * Store a document in R2R for long-term memory
   */
  async storeDocument(params: {
    collectionId?: string;
    content: string;
    metadata?: Record<string, any>;
  }): Promise<R2RDocument> {
    try {
      const response = await fetch(`${this.baseUrl}/v3/documents`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({
          collection_id: params.collectionId,
          document: {
            content: params.content,
            metadata: params.metadata || {}
          }
        })
      });

      if (!response.ok) {
        throw new Error(`R2R API error: ${response.statusText}`);
      }

      const data = await response.json();

      return {
        id: data.document_id,
        collectionId: params.collectionId || 'default',
        content: params.content,
        metadata: params.metadata || {},
        createdAt: new Date()
      };
    } catch (error) {
      console.error('Error storing document in R2R:', error);
      throw error;
    }
  }

  /**
   * Search for relevant memories using semantic search
   */
  async search(query: R2RSearchQuery): Promise<R2RSearchResult[]> {
    try {
      const searchParams: any = {
        query: query.query,
        limit: query.limit || 10,
        threshold: query.threshold || 0.7
      };

      if (query.collectionId) {
        searchParams.collection_id = query.collectionId;
      }

      if (query.filters) {
        searchParams.filters = query.filters;
      }

      const endpoint = query.useHybridSearch
        ? '/v3/retrieval/search'
        : '/v3/retrieval/search';

      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(searchParams)
      });

      if (!response.ok) {
        throw new Error(`R2R search error: ${response.statusText}`);
      }

      const data = await response.json();

      return (data.results || []).map((result: any) => ({
        documentId: result.document_id,
        content: result.content,
        score: result.score,
        metadata: result.metadata || {}
      }));
    } catch (error) {
      console.error('Error searching R2R:', error);
      return [];
    }
  }

  /**
   * Perform RAG (Retrieval-Augmented Generation)
   */
  async rag(params: {
    query: string;
    collectionId?: string;
    model?: string;
    temperature?: number;
    maxTokens?: number;
  }): Promise<{
    answer: string;
    sources: R2RSearchResult[];
  }> {
    try {
      const response = await fetch(`${this.baseUrl}/v3/retrieval/rag`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({
          query: params.query,
          collection_id: params.collectionId,
          rag_generation_config: {
            model: params.model || 'claude-3-7-sonnet',
            temperature: params.temperature || 0.7,
            max_tokens: params.maxTokens || 1000
          }
        })
      });

      if (!response.ok) {
        throw new Error(`R2R RAG error: ${response.statusText}`);
      }

      const data = await response.json();

      return {
        answer: data.answer || '',
        sources: (data.sources || []).map((source: any) => ({
          documentId: source.document_id,
          content: source.content,
          score: source.score,
          metadata: source.metadata || {}
        }))
      };
    } catch (error) {
      console.error('Error performing RAG:', error);
      throw error;
    }
  }

  /**
   * Perform agentic retrieval with extended reasoning
   */
  async agentRetrieval(params: {
    query: string;
    collectionId?: string;
    model?: string;
    thinkingBudget?: number;
  }): Promise<{
    answer: string;
    reasoning: string;
    sources: R2RSearchResult[];
  }> {
    try {
      const response = await fetch(`${this.baseUrl}/v3/retrieval/agent`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({
          query: params.query,
          collection_id: params.collectionId,
          agent_config: {
            model: params.model || 'claude-3-7-sonnet',
            thinking_budget: params.thinkingBudget || 10000
          }
        })
      });

      if (!response.ok) {
        throw new Error(`R2R agent retrieval error: ${response.statusText}`);
      }

      const data = await response.json();

      return {
        answer: data.answer || '',
        reasoning: data.reasoning || '',
        sources: (data.sources || []).map((source: any) => ({
          documentId: source.document_id,
          content: source.content,
          score: source.score,
          metadata: source.metadata || {}
        }))
      };
    } catch (error) {
      console.error('Error performing agent retrieval:', error);
      throw error;
    }
  }

  /**
   * Create a knowledge graph from documents
   */
  async createKnowledgeGraph(params: {
    collectionId: string;
    documentIds?: string[];
  }): Promise<{
    entities: any[];
    relationships: any[];
  }> {
    try {
      const response = await fetch(`${this.baseUrl}/v3/graphs`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({
          collection_id: params.collectionId,
          document_ids: params.documentIds
        })
      });

      if (!response.ok) {
        throw new Error(`R2R knowledge graph error: ${response.statusText}`);
      }

      const data = await response.json();

      return {
        entities: data.entities || [],
        relationships: data.relationships || []
      };
    } catch (error) {
      console.error('Error creating knowledge graph:', error);
      throw error;
    }
  }

  /**
   * List all documents in a collection
   */
  async listDocuments(collectionId?: string): Promise<R2RDocument[]> {
    try {
      const url = collectionId
        ? `${this.baseUrl}/v3/documents?collection_id=${collectionId}`
        : `${this.baseUrl}/v3/documents`;

      const response = await fetch(url, {
        method: 'GET',
        headers: this.getHeaders()
      });

      if (!response.ok) {
        throw new Error(`R2R list documents error: ${response.statusText}`);
      }

      const data = await response.json();

      return (data.documents || []).map((doc: any) => ({
        id: doc.document_id,
        collectionId: doc.collection_id || 'default',
        content: doc.content || '',
        metadata: doc.metadata || {},
        createdAt: new Date(doc.created_at)
      }));
    } catch (error) {
      console.error('Error listing documents:', error);
      return [];
    }
  }

  /**
   * Delete a document
   */
  async deleteDocument(documentId: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/v3/documents/${documentId}`, {
        method: 'DELETE',
        headers: this.getHeaders()
      });

      return response.ok;
    } catch (error) {
      console.error('Error deleting document:', error);
      return false;
    }
  }

  /**
   * Store agent memory as a document
   */
  async storeMemory(memory: MemoryEntry, agentId: string): Promise<string> {
    const doc = await this.storeDocument({
      content: memory.content,
      metadata: {
        agentId,
        type: memory.type,
        importance: memory.importance,
        timestamp: memory.timestamp.toISOString(),
        ...memory.metadata
      }
    });

    return doc.id;
  }

  /**
   * Retrieve relevant memories for an agent
   */
  async retrieveMemories(params: {
    agentId: string;
    query: string;
    limit?: number;
    minImportance?: number;
  }): Promise<MemoryEntry[]> {
    const results = await this.search({
      query: params.query,
      limit: params.limit || 10,
      filters: {
        agentId: params.agentId,
        importance: { $gte: params.minImportance || 0.5 }
      }
    });

    return results.map(result => ({
      id: result.documentId,
      content: result.content,
      type: result.metadata.type || 'fact',
      importance: result.metadata.importance || 0.5,
      timestamp: new Date(result.metadata.timestamp),
      metadata: result.metadata
    }));
  }

  /**
   * Get collection by name
   */
  getCollectionId(name: string): string | undefined {
    return this.collections.get(name);
  }

  /**
   * Create a new collection
   */
  async createCollection(name: string, description?: string): Promise<string> {
    try {
      const response = await fetch(`${this.baseUrl}/v3/collections`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({
          name,
          description: description || ''
        })
      });

      if (!response.ok) {
        throw new Error(`R2R create collection error: ${response.statusText}`);
      }

      const data = await response.json();
      const collectionId = data.collection_id;

      this.collections.set(name, collectionId);
      return collectionId;
    } catch (error) {
      console.error('Error creating collection:', error);
      throw error;
    }
  }

  /**
   * Get headers for API requests
   */
  private getHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    };

    if (this.apiKey) {
      headers['Authorization'] = `Bearer ${this.apiKey}`;
    }

    return headers;
  }

  /**
   * Health check
   */
  async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/v3/health`, {
        method: 'GET'
      });
      return response.ok;
    } catch (error) {
      console.error('R2R health check failed:', error);
      return false;
    }
  }
}

/**
 * Create a default R2R client instance
 */
export function createR2RClient(config?: Partial<R2RConfig>): R2RMemoryClient {
  return new R2RMemoryClient({
    baseUrl: config?.baseUrl || process.env.R2R_BASE_URL || 'http://localhost:7272',
    apiKey: config?.apiKey || process.env.R2R_API_KEY,
    collections: config?.collections || []
  });
}
