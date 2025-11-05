#!/usr/bin/env node

import { Command } from 'commander';
import { McpIS9 } from '../core/mcpis9';
import { AgentHelper } from '../core/agent-helper';
import { Logger } from '../utils/logger';

const program = new Command();
const logger = new Logger();
const agentHelper = new AgentHelper();

program
  .name('mcpis9')
  .description('🤖 mcpis9 - Твой AI-друг и помощник')
  .version('0.1.0');

// Команда для запуска интерактивного режима
program
  .command('start')
  .description('Запустить mcpis9 в интерактивном режиме')
  .action(async () => {
    const mcpis9 = new McpIS9();
    await mcpis9.start();
  });

// Команда для помощи по AI
program
  .command('ai [topic]')
  .description('Помощь по AI-инструментам (claude, chatgpt, gemini)')
  .action(async (topic) => {
    const mcpis9 = new McpIS9();
    await mcpis9.getAIHelp(topic);
  });

// Команда для помощи по CLI
program
  .command('cli [command]')
  .description('Помощь по CLI и терминалу (git, npm, docker, basics)')
  .action(async (command) => {
    const mcpis9 = new McpIS9();
    await mcpis9.getCLIHelp(command);
  });

// Команда для помощи по разработке
program
  .command('dev [topic]')
  .description('Помощь по разработке (vscode, extensions, workflow, setup)')
  .action(async (topic) => {
    const mcpis9 = new McpIS9();
    await mcpis9.getDevHelp(topic);
  });

// Команда для работы с агентами
program
  .command('agent')
  .description('Работа с агентной системой')
  .option('-t, --task <description>', 'Описание задачи')
  .option('-w, --worker <type>', 'Тип worker-агента (code, research, analysis, creative, devops)')
  .option('-r, --requirements <items...>', 'Требования к выполнению задачи')
  .option('-l, --list', 'Показать список агентов')
  .option('-s, --status', 'Проверить статус системы')
  .action(async (options) => {
    if (options.list) {
      agentHelper.showAgents();
    } else if (options.status) {
      await agentHelper.checkStatus();
    } else if (options.task) {
      if (options.worker) {
        await agentHelper.executeWorkerTask(
          options.worker,
          options.task,
          options.requirements || []
        );
      } else {
        await agentHelper.executeBossTask(
          options.task,
          options.requirements || []
        );
      }
    } else {
      logger.info('Используйте: mcpis9 agent --help для справки');
      agentHelper.showAgents();
    }
  });

// Команда для быстрой справки
program
  .command('help-me')
  .description('Показать все доступные команды с примерами')
  .action(() => {
    logger.section('Быстрая справка по mcpis9');
    logger.info('');
    logger.info('🤖 Основные команды:');
    logger.info('• mcpis9 start - запустить интерактивный режим');
    logger.info('• mcpis9 ai <тема> - помощь по AI (claude, chatgpt, gemini)');
    logger.info('• mcpis9 cli <команда> - помощь по CLI (git, npm, docker)');
    logger.info('• mcpis9 dev <тема> - помощь по разработке (vscode, workflow)');
    logger.info('• mcpis9 agent - работа с агентной системой');
    logger.info('');
    logger.info('🤖 Агентная система:');
    logger.info('• mcpis9 agent --list - показать список агентов');
    logger.info('• mcpis9 agent --status - проверить статус системы');
    logger.info('• mcpis9 agent --task "описание" - выполнить задачу через Boss Agent');
    logger.info('• mcpis9 agent --worker code --task "описание" - выполнить задачу через Code Agent');
    logger.info('');
    logger.info('📝 Примеры использования:');
    logger.info('• mcpis9 ai claude - узнать про Claude');
    logger.info('• mcpis9 cli git - помощь по Git');
    logger.info('• mcpis9 dev vscode - настройка VS Code');
    logger.info('• mcpis9 agent --task "создать REST API" - задача для Boss Agent');
    logger.info('• mcpis9 agent --worker research --task "найти информацию о TypeScript" - исследование');
    logger.info('');
    logger.tip('Используй mcpis9 start для интерактивного режима!');
  });

// Обработка случая, когда команда не указана
program.action(() => {
  logger.welcome();
  logger.info('Добро пожаловать в mcpis9! 🤖');
  logger.info('');
  logger.info('Для начала работы используй:');
  logger.info('• mcpis9 start - интерактивный режим');
  logger.info('• mcpis9 help-me - быстрая справка');
  logger.info('• mcpis9 --help - полная справка');
  logger.info('');
  logger.tip('mcpis9 - это твой друг в мире AI и разработки!');
});

// Обработка ошибок
program.exitOverride();

try {
  program.parse();
} catch (err: any) {
  if (err.code === 'commander.help') {
    process.exit(0);
  }
  if (err.code === 'commander.version') {
    process.exit(0);
  }
  logger.error('Произошла ошибка:', err.message);
  process.exit(1);
}
