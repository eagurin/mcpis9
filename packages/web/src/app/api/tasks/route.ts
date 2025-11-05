import { NextRequest, NextResponse } from 'next/server';
import { getBossAgent } from '@/lib/boss-agent-instance';
import type { Task, TaskPriority } from '@mcpis9/shared';

/**
 * GET /api/tasks - Get all tasks
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const priority = searchParams.get('priority');

    const bossAgent = getBossAgent();
    const agentStatus = bossAgent.getStatus();

    let tasks = agentStatus.activeTasks;

    // Filter by status if provided
    if (status) {
      tasks = tasks.filter(task => task.status === status);
    }

    // Filter by priority if provided
    if (priority) {
      tasks = tasks.filter(task => task.priority === priority);
    }

    return NextResponse.json({
      success: true,
      data: {
        tasks,
        total: tasks.length,
        queued: agentStatus.queuedTasks
      }
    });
  } catch (error) {
    console.error('Error fetching tasks:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch tasks'
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/tasks - Create a new task
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, description, type, priority, context } = body;

    if (!title || !description || !type) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields: title, description, type'
        },
        { status: 400 }
      );
    }

    const bossAgent = getBossAgent();
    const task = await bossAgent.createTask({
      title,
      description,
      type,
      priority: (priority as TaskPriority) || 'medium',
      context
    });

    // Start processing the queue
    await bossAgent.processQueue();

    return NextResponse.json({
      success: true,
      data: task
    });
  } catch (error) {
    console.error('Error creating task:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create task'
      },
      { status: 500 }
    );
  }
}
