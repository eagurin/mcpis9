import { Logger } from '../utils/logger';

/**
 * 🔧 Помощник по разработке и настройке
 */
export class DevHelper {
  private logger: Logger;

  constructor() {
    this.logger = new Logger();
  }

  /**
   * Помощь по разработке
   */
  async help(topic?: string): Promise<void> {
    this.logger.section('Разработка и настройка');

    if (!topic) {
      this.showDevMenu();
      return;
    }

    switch (topic.toLowerCase()) {
      case 'vscode':
      case 'cursor':
        this.helpIDEs();
        break;
      case 'extensions':
        this.helpExtensions();
        break;
      case 'workflow':
        this.helpWorkflow();
        break;
      case 'setup':
        this.helpSetup();
        break;
      default:
        this.logger.warn(`Не знаю про "${topic}". Вот что я умею:`);
        this.showDevMenu();
    }
  }

  private showDevMenu(): void {
    this.logger.info('Помощь по разработке:');
    this.logger.info('');
    this.logger.info('💻 vscode/cursor - Настройка IDE');
    this.logger.info('🔌 extensions - Полезные расширения');
    this.logger.info('⚡ workflow - Рабочий процесс');
    this.logger.info('🛠️ setup - Настройка окружения');
    this.logger.info('');
    this.logger.tip('Используй: mcpis9 dev <тема> для подробной помощи');
  }

  private helpIDEs(): void {
    this.logger.info('💻 Настройка IDE (VS Code / Cursor)');
    this.logger.info('');
    this.logger.info('VS Code - популярный редактор:');
    this.logger.info('• Бесплатный и открытый');
    this.logger.info('• Огромное количество расширений');
    this.logger.info('• Отличная интеграция с Git');
    this.logger.info('• Встроенный терминал');
    this.logger.info('');
    this.logger.info('Cursor - AI-powered редактор:');
    this.logger.info('• Основан на VS Code');
    this.logger.info('• Встроенный AI-помощник');
    this.logger.info('• Автодополнение кода с ИИ');
    this.logger.info('• Чат с кодовой базой');
    this.logger.info('');
    this.logger.tip('Cursor отлично подходит для работы с AI, VS Code - для всего остального!');
  }

  private helpExtensions(): void {
    this.logger.info('🔌 Полезные расширения для VS Code/Cursor');
    this.logger.info('');
    this.logger.info('Обязательные:');
    this.logger.info('• Prettier - форматирование кода');
    this.logger.info('• ESLint - проверка JavaScript/TypeScript');
    this.logger.info('• GitLens - расширенная работа с Git');
    this.logger.info('• Auto Rename Tag - автопереименование тегов');
    this.logger.info('');
    this.logger.info('Для разработки:');
    this.logger.info('• Thunder Client - тестирование API');
    this.logger.info('• Live Server - локальный сервер');
    this.logger.info('• Bracket Pair Colorizer - цветные скобки');
    this.logger.info('• Path Intellisense - автодополнение путей');
    this.logger.info('');
    this.logger.info('AI-помощники:');
    this.logger.info('• GitHub Copilot - AI-автодополнение');
    this.logger.info('• Claude Code - чат с Claude');
    this.logger.info('• Tabnine - AI-предложения');
    this.logger.info('');
    this.logger.tip('Не устанавливай слишком много расширений - это замедляет редактор!');
  }

  private helpWorkflow(): void {
    this.logger.info('⚡ Эффективный рабочий процесс');
    this.logger.info('');
    this.logger.info('Git Flow:');
    this.logger.info('1. Создай ветку для фичи: git checkout -b feature/new-feature');
    this.logger.info('2. Делай небольшие коммиты: git commit -m "add login form"');
    this.logger.info('3. Пуш в удаленный репозиторий: git push');
    this.logger.info('4. Создай Pull Request');
    this.logger.info('5. После ревью - мерж в main');
    this.logger.info('');
    this.logger.info('Автоматизация:');
    this.logger.info('• Используй pre-commit хуки');
    this.logger.info('• Настрой CI/CD пайплайны');
    this.logger.info('• Автоматические тесты');
    this.logger.info('• Деплой по коммиту');
    this.logger.info('');
    this.logger.info('Продуктивность:');
    this.logger.info('• Горячие клавиши в IDE');
    this.logger.info('• Сниппеты для частого кода');
    this.logger.info('• Алиасы в терминале');
    this.logger.info('• Тайм-трекинг задач');
    this.logger.info('');
    this.logger.tip('Автоматизируй рутину, чтобы сосредоточиться на творчестве!');
  }

  private helpSetup(): void {
    this.logger.info('🛠️ Настройка окружения разработки');
    this.logger.info('');
    this.logger.info('Базовые инструменты:');
    this.logger.info('• Node.js + npm/yarn - для JavaScript/TypeScript');
    this.logger.info('• Git - система контроля версий');
    this.logger.info('• VS Code или Cursor - редактор кода');
    this.logger.info('• Терминал (iTerm2, Windows Terminal)');
    this.logger.info('');
    this.logger.info('Дополнительно:');
    this.logger.info('• Docker - для контейнеризации');
    this.logger.info('• Postman/Insomnia - тестирование API');
    this.logger.info('• Figma - для работы с дизайном');
    this.logger.info('• Notion/Obsidian - заметки и документация');
    this.logger.info('');
    this.logger.info('Настройка терминала:');
    this.logger.info('• Oh My Zsh - красивый и функциональный shell');
    this.logger.info('• Starship - кастомный промпт');
    this.logger.info('• Алиасы для частых команд');
    this.logger.info('• Автодополнение команд');
    this.logger.info('');
    this.logger.tip('Потрать время на настройку один раз - экономь его потом каждый день!');
  }
}
