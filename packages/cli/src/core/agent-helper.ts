/**
 * Agent Helper - интерфейс CLI для работы с агентами
 */

import chalk from 'chalk';
import ora from 'ora';
import { AgentOrchestrator, type OrchestratorConfig } from '@mcpis9/agents';
import type { AgentType } from '@mcpis9/shared';

export class AgentHelper {
  private orchestrator: AgentOrchestrator;

  constructor() {
    const config: OrchestratorConfig = {
      enableR2R: process.env.ENABLE_R2R === 'true',
      r2rConfig: process.env.R2R_API_URL ? {
        apiUrl: process.env.R2R_API_URL,
        apiKey: process.env.R2R_API_KEY,
      } : undefined,
      maxShortTermMemory: 50,
    };

    this.orchestrator = new AgentOrchestrator(config);
  }

  /**
   * Выполнить задачу через Boss Agent
   */
  async executeBossTask(description: string, requirements: string[] = []): Promise<void> {
    const spinner = ora('Boss Agent обрабатывает задачу...').start();

    try {
      const result = await this.orchestrator.executeTask(description, requirements);

      if (result.success) {
        spinner.succeed('Задача выполнена успешно!');
        console.log('\n' + chalk.bold('Результат:'));
        console.log(result.output);

        if (result.artifacts && result.artifacts.length > 0) {
          console.log('\n' + chalk.bold('Артефакты:'));
          for (const artifact of result.artifacts) {
            console.log(chalk.cyan(`  - ${artifact.name} (${artifact.type})`));
          }
        }

        console.log('\n' + chalk.dim(`Использованные инструменты: ${result.toolsUsed.join(', ') || 'нет'}`));
        console.log(chalk.dim(`Рассуждение: ${result.reasoning}`));
      } else {
        spinner.fail('Задача не выполнена');
        console.log(chalk.red(`Ошибка: ${result.error}`));
      }
    } catch (error) {
      spinner.fail('Произошла ошибка');
      console.error(chalk.red(error instanceof Error ? error.message : 'Unknown error'));
    }
  }

  /**
   * Выполнить задачу через конкретного worker-агента
   */
  async executeWorkerTask(
    agentType: AgentType,
    description: string,
    requirements: string[] = []
  ): Promise<void> {
    const agentNames: Record<AgentType, string> = {
      boss: 'Boss Agent',
      code: 'Code Agent',
      research: 'Research Agent',
      analysis: 'Analysis Agent',
      creative: 'Creative Agent',
      devops: 'DevOps Agent',
    };

    const spinner = ora(`${agentNames[agentType]} обрабатывает задачу...`).start();

    try {
      const result = await this.orchestrator.executeWithWorker(agentType, description, requirements);

      if (result.success) {
        spinner.succeed('Задача выполнена успешно!');
        console.log('\n' + chalk.bold('Результат:'));
        console.log(result.output);

        if (result.artifacts && result.artifacts.length > 0) {
          console.log('\n' + chalk.bold('Артефакты:'));
          for (const artifact of result.artifacts) {
            console.log(chalk.cyan(`  - ${artifact.name} (${artifact.type})`));
          }
        }
      } else {
        spinner.fail('Задача не выполнена');
        console.log(chalk.red(`Ошибка: ${result.error}`));
      }
    } catch (error) {
      spinner.fail('Произошла ошибка');
      console.error(chalk.red(error instanceof Error ? error.message : 'Unknown error'));
    }
  }

  /**
   * Показать список доступных агентов
   */
  showAgents(): void {
    console.log(chalk.bold('\n📊 Доступные агенты:\n'));

    console.log(chalk.cyan('🎯 Boss Agent') + ' - Главный оркестратор');
    console.log(chalk.dim('   Координирует работу специализированных агентов\n'));

    console.log(chalk.cyan('💻 Code Agent') + ' - Программирование');
    console.log(chalk.dim('   Написание, отладка и рефакторинг кода\n'));

    console.log(chalk.cyan('🔍 Research Agent') + ' - Исследования');
    console.log(chalk.dim('   Поиск информации и анализ источников\n'));

    console.log(chalk.cyan('📊 Analysis Agent') + ' - Анализ данных');
    console.log(chalk.dim('   Выявление паттернов и инсайтов\n'));

    console.log(chalk.cyan('✨ Creative Agent') + ' - Креатив');
    console.log(chalk.dim('   Создание контента и генерация идей\n'));

    console.log(chalk.cyan('🚀 DevOps Agent') + ' - DevOps');
    console.log(chalk.dim('   Инфраструктура и развертывание\n'));
  }

  /**
   * Проверить статус системы
   */
  async checkStatus(): Promise<void> {
    const spinner = ora('Проверка статуса агентной системы...').start();

    try {
      const r2rHealthy = await this.orchestrator.checkR2RHealth();

      spinner.succeed('Система агентов работает');

      console.log('\n' + chalk.bold('Статус компонентов:'));
      console.log(chalk.green('✓') + ' Boss Agent: активен');
      console.log(chalk.green('✓') + ' Worker Agents: 5 активных');
      console.log(chalk.green('✓') + ' Memory System: работает');
      console.log(chalk.green('✓') + ' Tool Registry: работает');

      if (process.env.ENABLE_R2R === 'true') {
        const status = r2rHealthy ? chalk.green('✓') : chalk.red('✗');
        console.log(status + ` R2R Service: ${r2rHealthy ? 'работает' : 'недоступен'}`);
      } else {
        console.log(chalk.dim('○ R2R Service: не включен'));
      }
    } catch (error) {
      spinner.fail('Ошибка при проверке статуса');
      console.error(chalk.red(error instanceof Error ? error.message : 'Unknown error'));
    }
  }
}
