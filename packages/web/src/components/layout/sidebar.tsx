'use client'

import { Button } from '@/components/ui/button'
import { AsciiFace } from '@/components/ui/ascii-face'
import { 
  MessageSquare, 
  Brain, 
  Terminal, 
  Code, 
  Monitor,
  Plus,
  History
} from 'lucide-react'

export function Sidebar() {
  return (
    <aside className="w-64 border-r bg-muted/50">
      <div className="flex h-full flex-col">
        {/* Новый чат */}
        <div className="p-4">
          <Button className="w-full justify-start" size="sm">
            <Plus className="mr-2 h-4 w-4" />
            Новый чат
          </Button>
        </div>

        {/* Навигация */}
        <nav className="flex-1 px-4">
          <div className="space-y-2">
            <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
              Возможности
            </div>
            
            <Button variant="ghost" className="w-full justify-start" size="sm">
              <MessageSquare className="mr-2 h-4 w-4" />
              Чат с AI
            </Button>
            
            <Button variant="ghost" className="w-full justify-start" size="sm">
              <Monitor className="mr-2 h-4 w-4" />
              Computer Use
            </Button>
            
            <Button variant="ghost" className="w-full justify-start" size="sm">
              <Terminal className="mr-2 h-4 w-4" />
              CLI помощь
            </Button>
            
            <Button variant="ghost" className="w-full justify-start" size="sm">
              <Code className="mr-2 h-4 w-4" />
              Разработка
            </Button>

            <Button
              variant="ghost"
              className="w-full justify-start"
              size="sm"
              onClick={() => window.location.href = '/agents'}
            >
              <Brain className="mr-2 h-4 w-4" />
              Агенты
            </Button>
          </div>

          <div className="mt-6 space-y-2">
            <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
              AI Провайдеры
            </div>
            
            <Button variant="ghost" className="w-full justify-start" size="sm">
              <Brain className="mr-2 h-4 w-4" />
              Claude
            </Button>
            
            <Button variant="ghost" className="w-full justify-start" size="sm">
              <Brain className="mr-2 h-4 w-4" />
              ChatGPT
            </Button>
            
            <Button variant="ghost" className="w-full justify-start" size="sm">
              <Brain className="mr-2 h-4 w-4" />
              Gemini
            </Button>
          </div>
        </nav>

        {/* ASCII лицо */}
        <div className="p-2 border-t">
          <AsciiFace className="mb-4" />
        </div>

        {/* История */}
        <div className="p-4 border-t">
          <Button variant="ghost" className="w-full justify-start" size="sm">
            <History className="mr-2 h-4 w-4" />
            История чатов
          </Button>
        </div>
      </div>
    </aside>
  )
}
