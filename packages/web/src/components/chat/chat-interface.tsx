'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { ChatMessage } from './chat-message'
import { ChatInput } from './chat-input'
import { WelcomeScreen } from './welcome-screen'
import { ScrollArea } from '@/components/ui/scroll-area'
import { type ChatMessage as ChatMessageType } from '@mcpis9/shared'
import { generateId } from '@/lib/utils'

export function ChatInterface() {
  const [messages, setMessages] = useState<ChatMessageType[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const handleSendMessage = async (content: string) => {
    if (!content.trim()) return

    // Добавляем сообщение пользователя
    const userMessage: ChatMessageType = {
      id: generateId(),
      role: 'user',
      content,
      timestamp: new Date(),
    }

    setMessages(prev => [...prev, userMessage])
    setIsLoading(true)

    try {
      // TODO: Интеграция с AI API
      // Пока что добавляем демо-ответ
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const assistantMessage: ChatMessageType = {
        id: generateId(),
        role: 'assistant',
        content: `Привет! Я mcpis9 - твой AI-помощник. Ты написал: "${content}". Скоро я смогу помочь тебе с AI-инструментами, CLI командами и разработкой! 🤖`,
        timestamp: new Date(),
      }

      setMessages(prev => [...prev, assistantMessage])
    } catch (error) {
      console.error('Ошибка при отправке сообщения:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (messages.length === 0) {
    return <WelcomeScreen onSendMessage={handleSendMessage} />
  }

  return (
    <div className="flex flex-col h-full">
      {/* Сообщения */}
      <ScrollArea className="flex-1 px-4">
        <div className="space-y-4 py-4">
          {messages.map((message) => (
            <ChatMessage key={message.id} message={message} />
          ))}
          
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-muted rounded-lg p-4 max-w-[80%]">
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                  <span className="text-sm text-muted-foreground">mcpis9 думает...</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Поле ввода */}
      <div className="border-t p-4">
        <ChatInput onSendMessage={handleSendMessage} disabled={isLoading} />
      </div>
    </div>
  )
}
