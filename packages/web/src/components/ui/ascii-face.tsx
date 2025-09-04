'use client'

interface AsciiFaceProps {
  className?: string
}

export function AsciiFace({ className = '' }: AsciiFaceProps) {
  return (
    <div className={`font-mono text-xs leading-tight text-center ${className}`}>
      <pre className="whitespace-pre text-primary/80">
{`                    ╭─────────╮
                   ╱           ╲
                  ╱  ◉     ◉   ╲
                 ╱               ╲
                ╱       ___       ╲
               ╱       ╱   ╲       ╲
              ╱        ╲___╱        ╲
             ╱                       ╲
            ╱_________________________╲
           ╱                           ╲
          ╱      mcpis9 - Привет!      ╲
         ╱    Твой AI-друг и помощник   ╲
        ╱_______________________________╲`}
      </pre>
    </div>
  )
}
