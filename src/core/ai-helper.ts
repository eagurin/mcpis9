import { Logger } from '../utils/logger';

/**
 * 🧠 Помощник по AI-инструментам
 */
export class AIHelper {
  private logger: Logger;

  constructor() {
    this.logger = new Logger();
  }

  /**
   * Помощь по AI-инструментам
   */
  async help(topic?: string): Promise<void> {
    this.logger.section('AI-инструменты');

    if (!topic) {
      this.showAIMenu();
      return;
    }

    switch (topic.toLowerCase()) {
      case 'claude':
        this.helpClaude();
        break;
      case 'chatgpt':
        this.helpChatGPT();
        break;
      case 'gemini':
        this.helpGemini();
        break;
      default:
        this.logger.warn(`Не знаю про "${topic}". Вот что я умею:`);
        this.showAIMenu();
    }
  }

  private showAIMenu(): void {
    this.logger.info('Доступные AI-инструменты:');
    this.logger.info('');
    this.logger.info('🤖 Claude - Anthropic AI (отлично для кода)');
    this.logger.info('💬 ChatGPT - OpenAI (универсальный помощник)');
    this.logger.info('🌟 Gemini - Google AI (мультимодальный)');
    this.logger.info('');
    this.logger.tip('Используй: mcpis9 ai <название> для подробной помощи');
  }

  private helpClaude(): void {
    this.logger.info('🤖 Claude - твой помощник в программировании');
    this.logger.info('');
    this.logger.info('Что умеет Claude:');
    this.logger.info('• Писать и объяснять код');
    this.logger.info('• Рефакторинг и оптимизация');
    this.logger.info('• Отладка и исправление ошибок');
    this.logger.info('• Архитектурные решения');
    this.logger.info('');
    this.logger.info('Как использовать:');
    this.logger.info('1. Claude Code в VS Code');
    this.logger.info('2. Claude.ai в браузере');
    this.logger.info('3. API для интеграций');
    this.logger.info('');
    this.logger.tip('Claude особенно хорош для сложных задач программирования!');
  }

  private helpChatGPT(): void {
    this.logger.info('💬 ChatGPT - универсальный AI-помощник');
    this.logger.info('');
    this.logger.info('Что умеет ChatGPT:');
    this.logger.info('• Отвечать на любые вопросы');
    this.logger.info('• Писать тексты и код');
    this.logger.info('• Переводить языки');
    this.logger.info('• Анализировать данные');
    this.logger.info('');
    this.logger.info('Как использовать:');
    this.logger.info('1. ChatGPT Plus для лучшей модели');
    this.logger.info('2. API для разработчиков');
    this.logger.info('3. Плагины для расширения возможностей');
    this.logger.info('');
    this.logger.tip('ChatGPT отлично подходит для быстрых вопросов и мозгового штурма!');
  }

  private helpGemini(): void {
    this.logger.info('🌟 Gemini - мультимодальный AI от Google');
    this.logger.info('');
    this.logger.info('Что умеет Gemini:');
    this.logger.info('• Работать с текстом, изображениями, видео');
    this.logger.info('• Анализировать код и документы');
    this.logger.info('• Интеграция с Google Workspace');
    this.logger.info('• Длинные контексты (до 1M токенов)');
    this.logger.info('');
    this.logger.info('Как использовать:');
    this.logger.info('1. Gemini в Google AI Studio');
    this.logger.info('2. API для разработчиков');
    this.logger.info('3. Интеграция с Google продуктами');
    this.logger.info('');
    this.logger.tip('Gemini идеален для работы с большими объемами данных!');
  }
}
