/**
 * Agent integration for web application
 */

import { AgentOrchestrator, type OrchestratorConfig } from '@mcpis9/agents';
import type { AgentTaskResult } from '@mcpis9/shared';

let orchestratorInstance: AgentOrchestrator | null = null;

/**
 * Получить или создать экземпляр оркестратора
 */
export function getOrchestrator(): AgentOrchestrator {
  if (!orchestratorInstance) {
    const config: OrchestratorConfig = {
      enableR2R: process.env.ENABLE_R2R === 'true',
      r2rConfig: process.env.R2R_API_URL ? {
        apiUrl: process.env.R2R_API_URL,
        apiKey: process.env.R2R_API_KEY,
      } : undefined,
      maxShortTermMemory: 50,
    };

    orchestratorInstance = new AgentOrchestrator(config);
  }

  return orchestratorInstance;
}

/**
 * Выполнить задачу через Boss Agent
 */
export async function executeBossTask(
  description: string,
  requirements: string[] = []
): Promise<AgentTaskResult> {
  const orchestrator = getOrchestrator();
  return await orchestrator.executeTask(description, requirements);
}

/**
 * Выполнить задачу через конкретного worker-агента
 */
export async function executeWorkerTask(
  agentType: 'code' | 'research' | 'analysis' | 'creative' | 'devops',
  description: string,
  requirements: string[] = []
): Promise<AgentTaskResult> {
  const orchestrator = getOrchestrator();
  return await orchestrator.executeWithWorker(agentType, description, requirements);
}

/**
 * Проверить здоровье R2R сервиса
 */
export async function checkR2RStatus(): Promise<boolean> {
  const orchestrator = getOrchestrator();
  return await orchestrator.checkR2RHealth();
}

/**
 * Сбросить состояние агентов
 */
export function resetAgents(): void {
  const orchestrator = getOrchestrator();
  orchestrator.resetAll();
}
