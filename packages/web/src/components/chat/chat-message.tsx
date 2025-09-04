'use client'

import { type ChatMessage as ChatMessageType } from '@mcpis9/shared'
import { formatTimestamp, cn } from '@/lib/utils'
import { User, Bot } from 'lucide-react'

interface ChatMessageProps {
  message: ChatMessageType
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === 'user'
  
  return (
    <div className={cn(
      'flex gap-3 max-w-[80%]',
      isUser ? 'ml-auto flex-row-reverse' : 'mr-auto'
    )}>
      {/* Аватар */}
      <div className={cn(
        'flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-full',
        isUser 
          ? 'bg-primary text-primary-foreground' 
          : 'bg-muted text-muted-foreground'
      )}>
        {isUser ? (
          <User className="h-4 w-4" />
        ) : (
          <Bot className="h-4 w-4" />
        )}
      </div>

      {/* Сообщение */}
      <div className={cn(
        'rounded-lg px-4 py-2 text-sm',
        isUser 
          ? 'message-user' 
          : 'message-assistant'
      )}>
        <div className="whitespace-pre-wrap break-words">
          {message.content}
        </div>
        
        {/* Время */}
        <div className={cn(
          'mt-1 text-xs opacity-70',
          isUser ? 'text-right' : 'text-left'
        )}>
          {formatTimestamp(message.timestamp)}
        </div>
      </div>
    </div>
  )
}
