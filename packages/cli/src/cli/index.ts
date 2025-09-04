#!/usr/bin/env node

import { Command } from 'commander';
import { McpIS9 } from '../core/mcpis9';
import { Logger } from '../utils/logger';

const program = new Command();
const logger = new Logger();

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
    logger.info('');
    logger.info('📝 Примеры использования:');
    logger.info('• mcpis9 ai claude - узнать про Claude');
    logger.info('• mcpis9 cli git - помощь по Git');
    logger.info('• mcpis9 dev vscode - настройка VS Code');
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
