'use client'

import { Button } from '@/components/ui/button'
import { ChatInput } from './chat-input'
import { 
  Bot, 
  MessageSquare, 
  Terminal, 
  Code, 
  Monitor,
  Sparkles
} from 'lucide-react'

interface WelcomeScreenProps {
  onSendMessage: (message: string) => void
}

const EXAMPLE_PROMPTS = [
  {
    icon: MessageSquare,
    title: 'Помощь с AI',
    description: 'Расскажи про Claude и его возможности',
    prompt: 'Расскажи про Claude и его возможности'
  },
  {
    icon: Terminal,
    title: 'CLI команды',
    description: 'Как использовать Git для работы с ветками?',
    prompt: 'Как использовать Git для работы с ветками?'
  },
  {
    icon: Code,
    title: 'Разработка',
    description: 'Настройка VS Code для Python разработки',
    prompt: 'Настройка VS Code для Python разработки'
  },
  {
    icon: Monitor,
    title: 'Computer Use',
    description: 'Сделай скриншот экрана',
    prompt: 'Сделай скриншот экрана'
  }
]

export function WelcomeScreen({ onSendMessage }: WelcomeScreenProps) {
  return (
    <div className="flex flex-col h-full">
      {/* Центральная область с приветствием */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="max-w-2xl text-center space-y-8">
          {/* Логотип и заголовок */}
          <div className="space-y-4">
            <div className="flex justify-center">
              <div className="relative">
                <Bot className="h-16 w-16 text-primary" />
                <Sparkles className="h-6 w-6 text-yellow-500 absolute -top-1 -right-1 animate-pulse" />
              </div>
            </div>
            
            <div className="space-y-2">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
                Привет! Я mcpis9 🤖
              </h1>
              <p className="text-lg text-muted-foreground">
                Твой дружелюбный AI-помощник для работы с AI-инструментами, CLI и разработкой
              </p>
            </div>
          </div>

          {/* Примеры запросов */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Попробуй спросить:</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {EXAMPLE_PROMPTS.map((example, index) => {
                const Icon = example.icon
                return (
                  <Button
                    key={index}
                    variant="outline"
                    className="h-auto p-4 text-left justify-start hover:bg-accent/50 transition-colors"
                    onClick={() => onSendMessage(example.prompt)}
                  >
                    <div className="flex items-start gap-3">
                      <Icon className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                      <div className="space-y-1">
                        <div className="font-medium text-sm">{example.title}</div>
                        <div className="text-xs text-muted-foreground">
                          {example.description}
                        </div>
                      </div>
                    </div>
                  </Button>
                )
              })}
            </div>
          </div>

          {/* Возможности */}
          <div className="text-sm text-muted-foreground space-y-2">
            <p>Я могу помочь тебе с:</p>
            <div className="flex flex-wrap justify-center gap-2">
              <span className="bg-primary/10 text-primary px-2 py-1 rounded-full text-xs">
                AI-инструменты
              </span>
              <span className="bg-primary/10 text-primary px-2 py-1 rounded-full text-xs">
                CLI команды
              </span>
              <span className="bg-primary/10 text-primary px-2 py-1 rounded-full text-xs">
                Разработка
              </span>
              <span className="bg-primary/10 text-primary px-2 py-1 rounded-full text-xs">
                Computer Use
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Поле ввода */}
      <div className="border-t p-4">
        <ChatInput onSendMessage={onSendMessage} />
      </div>
    </div>
  )
}
