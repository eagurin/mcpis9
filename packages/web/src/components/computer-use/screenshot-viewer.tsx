'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Download, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react'

interface ScreenshotViewerProps {
  screenshot: string // base64 encoded image
  onAction?: (action: string, coordinates?: { x: number; y: number }) => void
}

export function ScreenshotViewer({ screenshot, onAction }: ScreenshotViewerProps) {
  const [zoom, setZoom] = useState(1)
  const [position, setPosition] = useState({ x: 0, y: 0 })

  const handleImageClick = (event: React.MouseEvent<HTMLImageElement>) => {
    if (!onAction) return

    const rect = event.currentTarget.getBoundingClientRect()
    const x = Math.round((event.clientX - rect.left) / zoom)
    const y = Math.round((event.clientY - rect.top) / zoom)
    
    onAction('click', { x, y })
  }

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.25, 3))
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.25, 0.25))
  const handleReset = () => {
    setZoom(1)
    setPosition({ x: 0, y: 0 })
  }

  const handleDownload = () => {
    const link = document.createElement('a')
    link.href = `data:image/png;base64,${screenshot}`
    link.download = `screenshot-${Date.now()}.png`
    link.click()
  }

  return (
    <div className="computer-use-result border rounded-lg overflow-hidden">
      {/* Панель управления */}
      <div className="flex items-center justify-between p-2 border-b bg-muted/50">
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="sm" onClick={handleZoomOut}>
            <ZoomOut className="h-4 w-4" />
          </Button>
          
          <span className="text-sm font-mono min-w-[60px] text-center">
            {Math.round(zoom * 100)}%
          </span>
          
          <Button variant="ghost" size="sm" onClick={handleZoomIn}>
            <ZoomIn className="h-4 w-4" />
          </Button>
          
          <Button variant="ghost" size="sm" onClick={handleReset}>
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>
        
        <Button variant="ghost" size="sm" onClick={handleDownload}>
          <Download className="h-4 w-4" />
        </Button>
      </div>

      {/* Изображение */}
      <div className="relative overflow-auto max-h-[600px] bg-checkered">
        <img
          src={`data:image/png;base64,${screenshot}`}
          alt="Screenshot"
          className="screenshot-viewer cursor-crosshair"
          style={{
            transform: `scale(${zoom}) translate(${position.x}px, ${position.y}px)`,
            transformOrigin: 'top left'
          }}
          onClick={handleImageClick}
          draggable={false}
        />
      </div>

      {/* Информация */}
      <div className="p-2 text-xs text-muted-foreground border-t">
        {onAction ? (
          <span>Кликни на изображение для выполнения действия</span>
        ) : (
          <span>Скриншот экрана</span>
        )}
      </div>
    </div>
  )
}
