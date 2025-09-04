import { Logger } from '../utils/logger';
import { AIHelper } from './ai-helper';
import { CLIHelper } from './cli-helper';
import { DevHelper } from './dev-helper';

/**
 * 🤖 Основной класс mcpis9 - твоего AI-друга и помощника
 */
export class McpIS9 {
  private logger: Logger;
  private aiHelper: AIHelper;
  private cliHelper: CLIHelper;
  private devHelper: DevHelper;

  constructor() {
    this.logger = new Logger();
    this.aiHelper = new AIHelper();
    this.cliHelper = new CLIHelper();
    this.devHelper = new DevHelper();
  }

  /**
   * Запуск mcpis9
   */
  async start(): Promise<void> {
    this.logger.info('🚀 Запускаю mcpis9...');
    
    // Показываем приветствие и меню
    await this.showMainMenu();
  }

  /**
   * Главное меню mcpis9
   */
  private async showMainMenu(): Promise<void> {
    this.logger.info('');
    this.logger.info('🤖 Привет! Я mcpis9 - твой AI-друг и помощник!');
    this.logger.info('');
    this.logger.info('Чем могу помочь?');
    this.logger.info('');
    this.logger.info('🧠 1. AI-инструменты (Claude, ChatGPT, Gemini)');
    this.logger.info('💻 2. CLI и терминал');
    this.logger.info('🔧 3. Разработка и настройка');
    this.logger.info('❓ 4. Справка');
    this.logger.info('👋 5. Выход');
    this.logger.info('');

    // TODO: Добавить интерактивное меню с inquirer
    this.logger.info('⚠️  Интерактивное меню скоро будет добавлено!');
    this.logger.info('📝 Пока что это демо-версия архитектуры');
  }

  /**
   * Получить помощь по AI-инструментам
   */
  async getAIHelp(topic?: string): Promise<void> {
    return this.aiHelper.help(topic);
  }

  /**
   * Получить помощь по CLI
   */
  async getCLIHelp(command?: string): Promise<void> {
    return this.cliHelper.help(command);
  }

  /**
   * Получить помощь по разработке
   */
  async getDevHelp(topic?: string): Promise<void> {
    return this.devHelper.help(topic);
  }
}
