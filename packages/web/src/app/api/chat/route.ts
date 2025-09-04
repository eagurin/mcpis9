import { NextRequest, NextResponse } from 'next/server'
import { type ChatMessage } from '@mcpis9/shared'

export async function POST(request: NextRequest) {
  try {
    const { messages, provider = 'claude' } = await request.json()

    // TODO: Интеграция с AI SDK
    // Пока что возвращаем демо-ответ
    const lastMessage = messages[messages.length - 1]
    
    const response: ChatMessage = {
      id: Math.random().toString(36).substring(2),
      role: 'assistant',
      content: `Привет! Я mcpis9 - твой AI-помощник. Ты написал: "${lastMessage.content}". 

Скоро я смогу помочь тебе с:
🤖 AI-инструментами (Claude, ChatGPT, Gemini)
💻 CLI командами и автоматизацией
🛠️ Настройкой инструментов разработки
🖥️ Computer Use для автоматизации задач

Пока что я работаю в демо-режиме, но интеграция с реальными AI-провайдерами уже в разработке!`,
      timestamp: new Date(),
      provider: provider as any
    }

    return NextResponse.json({ message: response })
  } catch (error) {
    console.error('Ошибка в API чата:', error)
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    )
  }
}
