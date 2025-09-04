/**
 * Общие типы для mcpis9
 */

// Типы для AI провайдеров
export type AIProvider = 'claude' | 'openai' | 'gemini';

// Типы сообщений в чате
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  provider?: AIProvider;
  metadata?: Record<string, any>;
}

// Типы для Computer Use
export interface ComputerUseAction {
  type: 'screenshot' | 'click' | 'type' | 'key' | 'scroll';
  coordinates?: { x: number; y: number };
  text?: string;
  key?: string;
  scrollDirection?: 'up' | 'down' | 'left' | 'right';
}

export interface ComputerUseResult {
  success: boolean;
  screenshot?: string; // base64 encoded
  error?: string;
  metadata?: Record<string, any>;
}

// Типы для CLI команд
export interface CLICommand {
  command: string;
  description: string;
  examples: string[];
  category: 'git' | 'npm' | 'docker' | 'basics' | 'other';
}

// Типы для AI помощи
export interface AITopic {
  name: string;
  description: string;
  examples: string[];
  provider: AIProvider;
}

// Типы для разработки
export interface DevTopic {
  name: string;
  description: string;
  tools: string[];
  setup: string[];
}

// Конфигурация приложения
export interface AppConfig {
  aiProviders: {
    claude?: {
      apiKey: string;
      model: string;
    };
    openai?: {
      apiKey: string;
      model: string;
    };
    gemini?: {
      apiKey: string;
      model: string;
    };
  };
  computerUse: {
    enabled: boolean;
    sandbox: boolean;
  };
  ui: {
    theme: 'light' | 'dark' | 'auto';
    language: 'ru' | 'en';
  };
}
