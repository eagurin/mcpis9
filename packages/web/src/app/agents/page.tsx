'use client';

import { useState, useEffect } from 'react';
import { AgentDashboard } from '@/components/agents/agent-dashboard';
import { TaskManager } from '@/components/agents/task-manager';
import { MemoryViewer } from '@/components/agents/memory-viewer';

export default function AgentsPage() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'tasks' | 'memory'>('dashboard');

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-4xl font-bold tracking-tight">
            🤖 Advanced Agent System
          </h1>
          <p className="text-muted-foreground">
            Boss agent orchestration with R2R memory integration
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex gap-2 border-b">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === 'dashboard'
                ? 'border-b-2 border-primary text-primary'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Dashboard
          </button>
          <button
            onClick={() => setActiveTab('tasks')}
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === 'tasks'
                ? 'border-b-2 border-primary text-primary'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Tasks
          </button>
          <button
            onClick={() => setActiveTab('memory')}
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === 'memory'
                ? 'border-b-2 border-primary text-primary'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Memory
          </button>
        </div>

        {/* Content */}
        <div className="mt-6">
          {activeTab === 'dashboard' && <AgentDashboard />}
          {activeTab === 'tasks' && <TaskManager />}
          {activeTab === 'memory' && <MemoryViewer />}
        </div>
      </div>
    </div>
  );
}
