/**
 * Boss Agent Singleton Instance
 * Maintains a single instance of the boss agent across the application
 */

import { BossAgent, createR2RClient } from '@mcpis9/shared';

let bossAgentInstance: BossAgent | null = null;

/**
 * Get or create the boss agent instance
 */
export function getBossAgent(): BossAgent {
  if (!bossAgentInstance) {
    const r2rClient = createR2RClient({
      baseUrl: process.env.R2R_BASE_URL || 'http://localhost:7272',
      apiKey: process.env.R2R_API_KEY
    });

    bossAgentInstance = new BossAgent(r2rClient, {
      model: process.env.AGENT_MODEL || 'claude-3-7-sonnet',
      temperature: parseFloat(process.env.AGENT_TEMPERATURE || '0.7'),
      maxTokens: parseInt(process.env.AGENT_MAX_TOKENS || '4000'),
      thinkingBudget: parseInt(process.env.AGENT_THINKING_BUDGET || '10000')
    });

    // Set up event listeners
    bossAgentInstance.on('system_event', (event) => {
      console.log('🎯 System Event:', event.type, event.data);
    });

    bossAgentInstance.on('message', (message) => {
      console.log('📨 Agent Message:', message.type, message.from, '->', message.to);
    });

    // Auto-start the boss agent
    bossAgentInstance.start().catch(error => {
      console.error('Failed to start boss agent:', error);
    });
  }

  return bossAgentInstance;
}

/**
 * Stop and clean up the boss agent
 */
export async function stopBossAgent(): Promise<void> {
  if (bossAgentInstance) {
    await bossAgentInstance.stop();
    bossAgentInstance = null;
  }
}
