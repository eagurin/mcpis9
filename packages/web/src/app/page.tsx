import { ChatInterface } from '@/components/chat/chat-interface'
import { Header } from '@/components/layout/header'
import { Sidebar } from '@/components/layout/sidebar'

export default function Home() {
  return (
    <div className="flex h-screen bg-background">
      {/* Боковая панель */}
      <Sidebar />
      
      {/* Основной контент */}
      <div className="flex-1 flex flex-col">
        {/* Заголовок */}
        <Header />
        
        {/* Чат интерфейс */}
        <main className="flex-1 overflow-hidden">
          <ChatInterface />
        </main>
      </div>
    </div>
  )
}
