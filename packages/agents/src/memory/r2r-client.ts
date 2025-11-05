/**
 * R2R Client for advanced memory and RAG capabilities
 */

import type {
  R2RConfig,
  R2RSearchRequest,
  R2RSearchResponse,
  R2RIndexRequest,
  R2RIndexResponse,
  R2RDocument,
  MemoryDocument,
} from '@mcpis9/shared';

export class R2RClient {
  private config: R2RConfig;
  private baseUrl: string;
  private headers: Record<string, string>;

  constructor(config: R2RConfig) {
    this.config = config;
    this.baseUrl = config.apiUrl.replace(/\/$/, ''); // Remove trailing slash
    this.headers = {
      'Content-Type': 'application/json',
      ...(config.apiKey && { Authorization: `Bearer ${config.apiKey}` }),
    };
  }

  /**
   * Search for documents using RAG
   */
  async search(request: R2RSearchRequest): Promise<R2RSearchResponse> {
    const startTime = Date.now();

    try {
      const response = await fetch(`${this.baseUrl}/search`, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify({
          query: request.query,
          top_k: request.topK || 5,
          filters: request.filters || {},
          include_metadata: request.includeMetadata !== false,
        }),
      });

      if (!response.ok) {
        throw new Error(`R2R search failed: ${response.statusText}`);
      }

      const data = await response.json();

      return {
        results: data.results || [],
        query: request.query,
        processingTime: Date.now() - startTime,
      };
    } catch (error) {
      console.error('R2R search error:', error);
      return {
        results: [],
        query: request.query,
        processingTime: Date.now() - startTime,
      };
    }
  }

  /**
   * Index documents for retrieval
   */
  async index(request: R2RIndexRequest): Promise<R2RIndexResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/documents`, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify({
          documents: request.documents,
          collection_id: request.collectionId || this.config.collectionId,
        }),
      });

      if (!response.ok) {
        throw new Error(`R2R indexing failed: ${response.statusText}`);
      }

      const data = await response.json();

      return {
        documentIds: data.document_ids || [],
        indexed: data.indexed || 0,
        failed: data.failed || 0,
        errors: data.errors || [],
      };
    } catch (error) {
      console.error('R2R indexing error:', error);
      return {
        documentIds: [],
        indexed: 0,
        failed: request.documents.length,
        errors: [error instanceof Error ? error.message : 'Unknown error'],
      };
    }
  }

  /**
   * Retrieve documents by IDs
   */
  async retrieve(documentIds: string[]): Promise<R2RDocument[]> {
    try {
      const response = await fetch(`${this.baseUrl}/documents/retrieve`, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify({ document_ids: documentIds }),
      });

      if (!response.ok) {
        throw new Error(`R2R retrieval failed: ${response.statusText}`);
      }

      const data = await response.json();
      return data.documents || [];
    } catch (error) {
      console.error('R2R retrieval error:', error);
      return [];
    }
  }

  /**
   * Delete documents from index
   */
  async delete(documentIds: string[]): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/documents/delete`, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify({ document_ids: documentIds }),
      });

      return response.ok;
    } catch (error) {
      console.error('R2R delete error:', error);
      return false;
    }
  }

  /**
   * Get health status of R2R service
   */
  async health(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/health`);
      return response.ok;
    } catch (error) {
      return false;
    }
  }

  /**
   * Convert MemoryDocument to R2R format
   */
  static memoryDocumentToR2R(doc: MemoryDocument): { content: string; metadata: Record<string, any> } {
    return {
      content: doc.content,
      metadata: {
        ...doc.metadata,
        memory_id: doc.id,
        agent_id: doc.metadata.agentId,
        task_id: doc.metadata.taskId,
        tags: doc.metadata.tags,
        timestamp: doc.metadata.timestamp.toISOString(),
      },
    };
  }

  /**
   * Convert R2R document to MemoryDocument
   */
  static r2rToMemoryDocument(doc: R2RDocument): MemoryDocument {
    return {
      id: doc.metadata.memory_id || doc.id,
      content: doc.content,
      metadata: {
        source: doc.metadata.source || 'r2r',
        timestamp: new Date(doc.metadata.timestamp || Date.now()),
        agentId: doc.metadata.agent_id,
        taskId: doc.metadata.task_id,
        tags: doc.metadata.tags || [],
      },
    };
  }
}
