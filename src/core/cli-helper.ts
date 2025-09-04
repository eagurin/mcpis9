import { Logger } from '../utils/logger';

/**
 * 💻 Помощник по CLI и терминалу
 */
export class CLIHelper {
  private logger: Logger;

  constructor() {
    this.logger = new Logger();
  }

  /**
   * Помощь по CLI
   */
  async help(command?: string): Promise<void> {
    this.logger.section('CLI и терминал');

    if (!command) {
      this.showCLIMenu();
      return;
    }

    switch (command.toLowerCase()) {
      case 'git':
        this.helpGit();
        break;
      case 'npm':
      case 'yarn':
        this.helpPackageManagers();
        break;
      case 'docker':
        this.helpDocker();
        break;
      case 'basics':
        this.helpBasics();
        break;
      default:
        this.logger.warn(`Не знаю команду "${command}". Вот что я умею:`);
        this.showCLIMenu();
    }
  }

  private showCLIMenu(): void {
    this.logger.info('Помощь по CLI:');
    this.logger.info('');
    this.logger.info('📁 basics - Базовые команды терминала');
    this.logger.info('🌿 git - Система контроля версий');
    this.logger.info('📦 npm/yarn - Менеджеры пакетов');
    this.logger.info('🐳 docker - Контейнеризация');
    this.logger.info('');
    this.logger.tip('Используй: mcpis9 cli <команда> для подробной помощи');
  }

  private helpBasics(): void {
    this.logger.info('📁 Базовые команды терминала');
    this.logger.info('');
    this.logger.info('Навигация:');
    this.logger.info('• ls / dir - показать файлы в папке');
    this.logger.info('• cd <папка> - перейти в папку');
    this.logger.info('• pwd - показать текущую папку');
    this.logger.info('• mkdir <имя> - создать папку');
    this.logger.info('');
    this.logger.info('Работа с файлами:');
    this.logger.info('• touch <файл> - создать файл');
    this.logger.info('• cp <откуда> <куда> - копировать');
    this.logger.info('• mv <откуда> <куда> - переместить/переименовать');
    this.logger.info('• rm <файл> - удалить файл');
    this.logger.info('• cat <файл> - показать содержимое');
    this.logger.info('');
    this.logger.tip('Используй Tab для автодополнения команд и путей!');
  }

  private helpGit(): void {
    this.logger.info('🌿 Git - система контроля версий');
    this.logger.info('');
    this.logger.info('Основные команды:');
    this.logger.info('• git init - создать репозиторий');
    this.logger.info('• git clone <url> - скачать репозиторий');
    this.logger.info('• git add . - добавить все изменения');
    this.logger.info('• git commit -m "сообщение" - сохранить изменения');
    this.logger.info('• git push - отправить на сервер');
    this.logger.info('• git pull - получить изменения с сервера');
    this.logger.info('');
    this.logger.info('Ветки:');
    this.logger.info('• git branch - показать ветки');
    this.logger.info('• git checkout -b <имя> - создать новую ветку');
    this.logger.info('• git merge <ветка> - слить ветку');
    this.logger.info('');
    this.logger.tip('Всегда делай коммиты с понятными сообщениями!');
  }

  private helpPackageManagers(): void {
    this.logger.info('📦 Менеджеры пакетов (npm/yarn)');
    this.logger.info('');
    this.logger.info('NPM команды:');
    this.logger.info('• npm init - создать package.json');
    this.logger.info('• npm install <пакет> - установить пакет');
    this.logger.info('• npm install - установить все зависимости');
    this.logger.info('• npm run <скрипт> - запустить скрипт');
    this.logger.info('• npm update - обновить пакеты');
    this.logger.info('');
    this.logger.info('Yarn команды:');
    this.logger.info('• yarn init - создать package.json');
    this.logger.info('• yarn add <пакет> - установить пакет');
    this.logger.info('• yarn install - установить все зависимости');
    this.logger.info('• yarn <скрипт> - запустить скрипт');
    this.logger.info('');
    this.logger.tip('Yarn обычно быстрее npm, но оба хороши!');
  }

  private helpDocker(): void {
    this.logger.info('🐳 Docker - контейнеризация приложений');
    this.logger.info('');
    this.logger.info('Основные команды:');
    this.logger.info('• docker build -t <имя> . - собрать образ');
    this.logger.info('• docker run <образ> - запустить контейнер');
    this.logger.info('• docker ps - показать запущенные контейнеры');
    this.logger.info('• docker stop <id> - остановить контейнер');
    this.logger.info('• docker images - показать образы');
    this.logger.info('');
    this.logger.info('Docker Compose:');
    this.logger.info('• docker-compose up - запустить сервисы');
    this.logger.info('• docker-compose down - остановить сервисы');
    this.logger.info('• docker-compose logs - показать логи');
    this.logger.info('');
    this.logger.tip('Docker отлично подходит для изоляции окружений!');
  }
}
