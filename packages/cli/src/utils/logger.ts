/**
 * 📝 Утилита для красивого логирования
 */
export class Logger {
  
  /**
   * Приветственное сообщение с ASCII-лицом
   */
  welcome(): void {
    console.log('');
    console.log('🤖✨ ═══════════════════════════════════════ ✨🤖');
    console.log('');
    console.log('                    ╭─────────╮');
    console.log('                   ╱           ╲');
    console.log('                  ╱  ◉     ◉   ╲');
    console.log('                 ╱               ╲');
    console.log('                ╱       ___       ╲');
    console.log('               ╱       ╱   ╲       ╲');
    console.log('              ╱        ╲___╱        ╲');
    console.log('             ╱                       ╲');
    console.log('            ╱_________________________╲');
    console.log('           ╱                           ╲');
    console.log('          ╱      mcpis9 - Привет!      ╲');
    console.log('         ╱    Твой AI-друг и помощник   ╲');
    console.log('        ╱_______________________________╲');
    console.log('');
    console.log('🤖✨ ═══════════════════════════════════════ ✨🤖');
    console.log('');
  }

  /**
   * Обычное сообщение
   */
  info(message: string): void {
    console.log(message);
  }

  /**
   * Сообщение об успехе
   */
  success(message: string): void {
    console.log(`✅ ${message}`);
  }

  /**
   * Предупреждение
   */
  warn(message: string): void {
    console.log(`⚠️  ${message}`);
  }

  /**
   * Ошибка
   */
  error(message: string, error?: any): void {
    console.error(`❌ ${message}`);
    if (error) {
      console.error(error);
    }
  }

  /**
   * Отладочная информация
   */
  debug(message: string, data?: any): void {
    if (process.env.DEBUG) {
      console.log(`🐛 ${message}`);
      if (data) {
        console.log(data);
      }
    }
  }

  /**
   * Заголовок секции
   */
  section(title: string): void {
    console.log('');
    console.log(`🔹 ${title}`);
    console.log('─'.repeat(title.length + 3));
  }

  /**
   * Подсказка
   */
  tip(message: string): void {
    console.log(`💡 Совет: ${message}`);
  }

  /**
   * Пустая строка
   */
  newLine(): void {
    console.log('');
  }
}
