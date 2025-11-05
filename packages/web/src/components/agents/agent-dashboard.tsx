'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';

interface AgentStatus {
  id: string;
  name: string;
  type: string;
  status: 'idle' | 'thinking' | 'executing' | 'waiting';
}

interface SystemMetrics {
  totalTasks: number;
  completedTasks: number;
  failedTasks: number;
  activeAgents: number;
  systemLoad: number;
}

export function AgentDashboard() {
  const [agents, setAgents] = useState<AgentStatus[]>([]);
  const [metrics, setMetrics] = useState<SystemMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAgentStatus();
    const interval = setInterval(fetchAgentStatus, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchAgentStatus = async () => {
    try {
      const response = await fetch('/api/agents');
      const data = await response.json();

      if (data.success) {
        setAgents(data.data.agents);
        setMetrics(data.data.metrics);
      }
    } catch (error) {
      console.error('Error fetching agent status:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'idle':
        return 'bg-gray-500';
      case 'thinking':
        return 'bg-yellow-500';
      case 'executing':
        return 'bg-green-500';
      case 'waiting':
        return 'bg-blue-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'idle':
        return '💤';
      case 'thinking':
        return '🤔';
      case 'executing':
        return '⚡';
      case 'waiting':
        return '⏳';
      default:
        return '❓';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Loading agent status...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* System Metrics */}
      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <MetricCard
            title="Total Tasks"
            value={metrics.totalTasks}
            icon="📊"
          />
          <MetricCard
            title="Completed"
            value={metrics.completedTasks}
            icon="✅"
            color="text-green-600"
          />
          <MetricCard
            title="Failed"
            value={metrics.failedTasks}
            icon="❌"
            color="text-red-600"
          />
          <MetricCard
            title="Active Agents"
            value={metrics.activeAgents}
            icon="🤖"
            color="text-blue-600"
          />
        </div>
      )}

      {/* Agent List */}
      <div className="border rounded-lg overflow-hidden">
        <div className="bg-muted p-4">
          <h2 className="text-xl font-semibold">Active Agents</h2>
        </div>
        <div className="divide-y">
          {agents.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              No agents available
            </div>
          ) : (
            agents.map((agent) => (
              <div
                key={agent.id}
                className="p-4 flex items-center justify-between hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-3 h-3 rounded-full ${getStatusColor(agent.status)}`} />
                  <div>
                    <h3 className="font-medium">{agent.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      Type: {agent.type}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{getStatusIcon(agent.status)}</span>
                  <span className="text-sm font-medium capitalize">
                    {agent.status}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

function MetricCard({
  title,
  value,
  icon,
  color = 'text-foreground'
}: {
  title: string;
  value: number;
  icon: string;
  color?: string;
}) {
  return (
    <div className="border rounded-lg p-4 space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{title}</p>
        <span className="text-2xl">{icon}</span>
      </div>
      <p className={`text-3xl font-bold ${color}`}>{value}</p>
    </div>
  );
}
