'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

interface MemoryResult {
  documentId: string;
  content: string;
  score: number;
  metadata: Record<string, any>;
}

export function MemoryViewer() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<MemoryResult[]>([]);
  const [loading, setLoading] = useState(false);

  const searchMemory = async () => {
    if (!query.trim()) return;

    setLoading(true);
    try {
      const response = await fetch('/api/memory/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ query, limit: 10 })
      });

      const data = await response.json();

      if (data.success) {
        setResults(data.data.results);
      }
    } catch (error) {
      console.error('Error searching memory:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Search Interface */}
      <div className="border rounded-lg p-6 space-y-4">
        <h2 className="text-xl font-semibold">
          🧠 Search R2R Memory
        </h2>
        <div className="space-y-4">
          <Textarea
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Enter your search query..."
            rows={3}
          />
          <Button onClick={searchMemory} disabled={loading}>
            {loading ? 'Searching...' : '🔍 Search Memory'}
          </Button>
        </div>
      </div>

      {/* Results */}
      {results.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">
            Results ({results.length})
          </h3>
          {results.map((result, index) => (
            <div
              key={result.documentId}
              className="border rounded-lg p-4 space-y-2"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">
                  Result #{index + 1}
                </span>
                <span className="text-sm font-medium">
                  Score: {(result.score * 100).toFixed(1)}%
                </span>
              </div>
              <p className="text-sm">{result.content}</p>
              {result.metadata && Object.keys(result.metadata).length > 0 && (
                <details className="text-xs text-muted-foreground">
                  <summary className="cursor-pointer">Metadata</summary>
                  <pre className="mt-2 p-2 bg-muted rounded overflow-auto">
                    {JSON.stringify(result.metadata, null, 2)}
                  </pre>
                </details>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Info Section */}
      <div className="border rounded-lg p-6 bg-muted/30">
        <h3 className="text-lg font-semibold mb-2">About R2R Memory</h3>
        <p className="text-sm text-muted-foreground">
          R2R (Retrieval-Augmented Retrieval) provides advanced memory capabilities
          including semantic search, knowledge graphs, and agentic reasoning. All agent
          tasks and learnings are automatically stored in the memory system for future
          reference and context-aware decision making.
        </p>
      </div>
    </div>
  );
}
