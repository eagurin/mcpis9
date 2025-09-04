/**
 * Общие AI утилиты для mcpis9
 */

import { AIProvider, AITopic } from './types';

/**
 * Базовые AI топики
 */
export const AI_TOPICS: AITopic[] = [
  {
    name: 'claude',
    description: 'Anthropic Claude - мощный AI-ассистент для анализа, программирования и творчества',
    examples: [
      'Анализ кода и рефакторинг',
      'Написание документации',
      'Решение сложных задач',
      'Творческое письмо'
    ],
    provider: 'claude'
  },
  {
    name: 'chatgpt',
    description: 'OpenAI ChatGPT - универсальный AI-помощник для различных задач',
    examples: [
      'Ответы на вопросы',
      'Генерация кода',
      'Переводы',
      'Обучение и объяснения'
    ],
    provider: 'openai'
  },
  {
    name: 'gemini',
    description: 'Google Gemini - многомодальный AI с поддержкой текста, изображений и кода',
    examples: [
      'Анализ изображений',
      'Работа с документами',
      'Программирование',
      'Исследования'
    ],
    provider: 'gemini'
  }
];

/**
 * Получить информацию о AI провайдере
 */
export function getAIProviderInfo(provider: AIProvider): AITopic | undefined {
  return AI_TOPICS.find(topic => topic.provider === provider);
}

/**
 * Получить все доступные AI провайдеры
 */
export function getAvailableProviders(): AIProvider[] {
  return AI_TOPICS.map(topic => topic.provider);
}

/**
 * Форматировать сообщение для AI
 */
export function formatAIMessage(content: string, role: 'user' | 'assistant' | 'system' = 'user'): string {
  const timestamp = new Date().toLocaleTimeString('ru-RU');
  const roleEmoji = role === 'user' ? '👤' : role === 'assistant' ? '🤖' : '⚙️';
  
  return `${roleEmoji} [${timestamp}] ${content}`;
}

/**
 * Валидация API ключа
 */
export function validateApiKey(apiKey: string, provider: AIProvider): boolean {
  if (!apiKey || apiKey.trim().length === 0) {
    return false;
  }

  switch (provider) {
    case 'claude':
      return apiKey.startsWith('sk-ant-');
    case 'openai':
      return apiKey.startsWith('sk-');
    case 'gemini':
      return apiKey.length > 20; // Простая проверка длины
    default:
      return false;
  }
}
