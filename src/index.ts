#!/usr/bin/env node

import { McpIS9 } from './core/mcpis9';
import { Logger } from './utils/logger';

/**
 * 🤖 mcpis9 - Твой AI-друг и помощник
 * 
 * Главная точка входа в приложение
 */

async function main() {
  const logger = new Logger();
  
  try {
    logger.welcome();
    
    const mcpis9 = new McpIS9();
    await mcpis9.start();
    
  } catch (error) {
    logger.error('Произошла ошибка при запуске mcpis9:', error);
    process.exit(1);
  }
}

// Запускаем только если файл вызван напрямую
if (require.main === module) {
  main();
}

export { McpIS9 } from './core/mcpis9';
