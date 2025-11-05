/**
 * Memory Manager - координирует краткосрочную и долгосрочную память
 */

import type {
  AgentMemory,
  ConversationBuffer,
  LongTermMemory,
  ChatMessage,
  MemoryDocument,
  MemoryRetrieval,
} from '@mcpis9/shared';
import { R2RClient } from './r2r-client';

export class MemoryManager {
  private shortTermMemory: ConversationBuffer;
  private longTermMemory: LongTermMemory;
  private workingMemory: Map<string, any>;
  private r2rClient?: R2RClient;

  constructor(maxShortTermSize: number = 50, r2rClient?: R2RClient) {
    this.shortTermMemory = {
      messages: [],
      maxSize: maxShortTermSize,
      currentSize: 0,
    };

    this.longTermMemory = {
      enabled: !!r2rClient,
      documents: [],
      retrievalHistory: [],
    };

    this.workingMemory = new Map();
    this.r2rClient = r2rClient;
  }

  /**
   * Добавить сообщение в краткосрочную память
   */
  addMessage(message: ChatMessage): void {
    this.shortTermMemory.messages.push(message);
    this.shortTermMemory.currentSize = this.shortTermMemory.messages.length;

    // Если превышен размер, удаляем старые сообщения (кроме системных)
    if (this.shortTermMemory.currentSize > this.shortTermMemory.maxSize) {
      this.pruneShortTermMemory();
    }
  }

  /**
   * Получить недавние сообщения
   */
  getRecentMessages(count?: number): ChatMessage[] {
    const limit = count || this.shortTermMemory.maxSize;
    return this.shortTermMemory.messages.slice(-limit);
  }

  /**
   * Очистить краткосрочную память (кроме системных сообщений)
   */
  private pruneShortTermMemory(): void {
    const systemMessages = this.shortTermMemory.messages.filter(m => m.role === 'system');
    const otherMessages = this.shortTermMemory.messages.filter(m => m.role !== 'system');

    // Оставляем системные + последние сообщения
    const keepCount = Math.floor(this.shortTermMemory.maxSize * 0.8);
    const keptMessages = otherMessages.slice(-keepCount);

    this.shortTermMemory.messages = [...systemMessages, ...keptMessages];
    this.shortTermMemory.currentSize = this.shortTermMemory.messages.length;
  }

  /**
   * Сохранить документ в долгосрочную память (R2R)
   */
  async storeInLongTerm(document: MemoryDocument): Promise<boolean> {
    if (!this.r2rClient) {
      console.warn('R2R client not configured, storing locally only');
      this.longTermMemory.documents.push(document);
      return true;
    }

    try {
      const r2rDoc = R2RClient.memoryDocumentToR2R(document);
      const result = await this.r2rClient.index({
        documents: [r2rDoc],
      });

      if (result.indexed > 0) {
        this.longTermMemory.documents.push(document);
        return true;
      }

      return false;
    } catch (error) {
      console.error('Failed to store in long-term memory:', error);
      return false;
    }
  }

  /**
   * Поиск в долгосрочной памяти
   */
  async searchLongTerm(query: string, topK: number = 5): Promise<MemoryDocument[]> {
    if (!this.r2rClient) {
      // Fallback to local search
      return this.searchLocalMemory(query, topK);
    }

    try {
      const result = await this.r2rClient.search({
        query,
        topK,
        includeMetadata: true,
      });

      const documents = result.results.map(doc => R2RClient.r2rToMemoryDocument(doc));

      // Сохраняем историю поиска
      this.longTermMemory.retrievalHistory.push({
        query,
        results: documents,
        timestamp: new Date(),
        relevanceScores: result.results.map(r => r.score),
      });

      return documents;
    } catch (error) {
      console.error('Failed to search long-term memory:', error);
      return this.searchLocalMemory(query, topK);
    }
  }

  /**
   * Локальный поиск (fallback)
   */
  private searchLocalMemory(query: string, topK: number): MemoryDocument[] {
    const lowerQuery = query.toLowerCase();
    const scored = this.longTermMemory.documents.map(doc => ({
      doc,
      score: this.simpleRelevanceScore(doc.content.toLowerCase(), lowerQuery),
    }));

    return scored
      .sort((a, b) => b.score - a.score)
      .slice(0, topK)
      .map(item => item.doc);
  }

  /**
   * Простой скоринг релевантности
   */
  private simpleRelevanceScore(content: string, query: string): number {
    const queryWords = query.split(/\s+/);
    let score = 0;

    for (const word of queryWords) {
      if (content.includes(word)) {
        score += 1;
      }
    }

    return score;
  }

  /**
   * Установить значение в рабочей памяти
   */
  setWorkingMemory(key: string, value: any): void {
    this.workingMemory.set(key, value);
  }

  /**
   * Получить значение из рабочей памяти
   */
  getWorkingMemory(key: string): any {
    return this.workingMemory.get(key);
  }

  /**
   * Очистить рабочую память
   */
  clearWorkingMemory(): void {
    this.workingMemory.clear();
  }

  /**
   * Получить полное состояние памяти
   */
  getMemoryState(): AgentMemory {
    return {
      shortTerm: this.shortTermMemory,
      longTerm: this.longTermMemory,
      workingMemory: Object.fromEntries(this.workingMemory),
    };
  }

  /**
   * Получить контекст для LLM (последние сообщения + релевантные документы)
   */
  async getContextForLLM(query: string, messageCount: number = 10): Promise<string> {
    const recentMessages = this.getRecentMessages(messageCount);
    const relevantDocs = await this.searchLongTerm(query, 3);

    let context = '# Recent Conversation\n\n';
    for (const msg of recentMessages) {
      context += `${msg.role}: ${msg.content}\n\n`;
    }

    if (relevantDocs.length > 0) {
      context += '\n# Relevant Context from Memory\n\n';
      for (const doc of relevantDocs) {
        context += `- ${doc.content}\n`;
      }
    }

    return context;
  }

  /**
   * Суммаризировать и сохранить важную информацию из разговора
   */
  async summarizeAndStore(agentId: string, taskId: string, summary: string, tags: string[]): Promise<void> {
    const document: MemoryDocument = {
      id: `memory-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      content: summary,
      metadata: {
        source: 'conversation_summary',
        timestamp: new Date(),
        agentId,
        taskId,
        tags,
      },
    };

    await this.storeInLongTerm(document);
  }
}
