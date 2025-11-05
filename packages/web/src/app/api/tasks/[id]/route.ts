import { NextRequest, NextResponse } from 'next/server';
import { getBossAgent } from '@/lib/boss-agent-instance';

/**
 * GET /api/tasks/[id] - Get a specific task
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const bossAgent = getBossAgent();
    const status = bossAgent.getStatus();
    const task = status.activeTasks.find(t => t.id === params.id);

    if (!task) {
      return NextResponse.json(
        {
          success: false,
          error: 'Task not found'
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: task
    });
  } catch (error) {
    console.error('Error fetching task:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch task'
      },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/tasks/[id] - Update task status
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { status, result } = body;

    const bossAgent = getBossAgent();

    if (status === 'completed' || status === 'failed') {
      await bossAgent.handleTaskCompletion(
        params.id,
        status === 'completed',
        result
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Task updated successfully'
    });
  } catch (error) {
    console.error('Error updating task:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update task'
      },
      { status: 500 }
    );
  }
}
