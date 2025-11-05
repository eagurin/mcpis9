/**
 * R2R Client Singleton Instance
 */

import { R2RMemoryClient, createR2RClient } from '@mcpis9/shared';

let r2rInstance: R2RMemoryClient | null = null;

/**
 * Get or create the R2R client instance
 */
export function getR2RClient(): R2RMemoryClient {
  if (!r2rInstance) {
    r2rInstance = createR2RClient({
      baseUrl: process.env.R2R_BASE_URL || 'http://localhost:7272',
      apiKey: process.env.R2R_API_KEY
    });
  }

  return r2rInstance;
}
