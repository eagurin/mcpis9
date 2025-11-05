'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

interface Task {
  id: string;
  title: string;
  description: string;
  type: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'queued' | 'in_progress' | 'completed' | 'failed';
  createdAt: string;
  assignedTo?: string;
}

export function TaskManager() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    type: 'code_generation',
    priority: 'medium'
  });

  useEffect(() => {
    fetchTasks();
    const interval = setInterval(fetchTasks, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchTasks = async () => {
    try {
      const response = await fetch('/api/tasks');
      const data = await response.json();

      if (data.success) {
        setTasks(data.data.tasks);
      }
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const createTask = async () => {
    try {
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newTask)
      });

      const data = await response.json();

      if (data.success) {
        setShowCreateForm(false);
        setNewTask({
          title: '',
          description: '',
          type: 'code_generation',
          priority: 'medium'
        });
        fetchTasks();
      }
    } catch (error) {
      console.error('Error creating task:', error);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical':
        return 'text-red-600 bg-red-50';
      case 'high':
        return 'text-orange-600 bg-orange-50';
      case 'medium':
        return 'text-yellow-600 bg-yellow-50';
      case 'low':
        return 'text-green-600 bg-green-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-600 bg-green-50';
      case 'in_progress':
        return 'text-blue-600 bg-blue-50';
      case 'failed':
        return 'text-red-600 bg-red-50';
      case 'queued':
        return 'text-gray-600 bg-gray-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Tasks</h2>
        <Button onClick={() => setShowCreateForm(true)}>
          ➕ Create Task
        </Button>
      </div>

      {/* Create Task Form */}
      {showCreateForm && (
        <div className="border rounded-lg p-6 space-y-4 bg-muted/30">
          <h3 className="text-xl font-semibold">Create New Task</h3>

          <div className="space-y-2">
            <label className="text-sm font-medium">Title</label>
            <input
              type="text"
              value={newTask.title}
              onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
              className="w-full px-3 py-2 border rounded-md"
              placeholder="Enter task title"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Description</label>
            <Textarea
              value={newTask.description}
              onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
              placeholder="Enter task description"
              rows={4}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Type</label>
              <select
                value={newTask.type}
                onChange={(e) => setNewTask({ ...newTask, type: e.target.value })}
                className="w-full px-3 py-2 border rounded-md"
              >
                <option value="code_generation">Code Generation</option>
                <option value="code_review">Code Review</option>
                <option value="research">Research</option>
                <option value="web_automation">Web Automation</option>
                <option value="testing">Testing</option>
                <option value="debugging">Debugging</option>
                <option value="planning">Planning</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Priority</label>
              <select
                value={newTask.priority}
                onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
                className="w-full px-3 py-2 border rounded-md"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>
          </div>

          <div className="flex gap-2">
            <Button onClick={createTask}>Create Task</Button>
            <Button
              variant="outline"
              onClick={() => setShowCreateForm(false)}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* Task List */}
      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-8 text-muted-foreground">
            Loading tasks...
          </div>
        ) : tasks.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No tasks found. Create your first task!
          </div>
        ) : (
          tasks.map((task) => (
            <div
              key={task.id}
              className="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="space-y-2 flex-1">
                  <h3 className="font-semibold text-lg">{task.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {task.description}
                  </p>
                  <div className="flex gap-2">
                    <span
                      className={`text-xs px-2 py-1 rounded-full font-medium ${getPriorityColor(
                        task.priority
                      )}`}
                    >
                      {task.priority.toUpperCase()}
                    </span>
                    <span
                      className={`text-xs px-2 py-1 rounded-full font-medium ${getStatusColor(
                        task.status
                      )}`}
                    >
                      {task.status.replace('_', ' ').toUpperCase()}
                    </span>
                    <span className="text-xs px-2 py-1 bg-gray-100 rounded-full font-medium">
                      {task.type.replace('_', ' ').toUpperCase()}
                    </span>
                  </div>
                </div>
                <div className="text-right text-sm text-muted-foreground">
                  {new Date(task.createdAt).toLocaleString()}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
