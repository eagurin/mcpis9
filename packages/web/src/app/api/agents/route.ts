/**
 * API route for agent system
 */

import { NextRequest, NextResponse } from 'next/server';
import { executeBossTask, executeWorkerTask, checkR2RStatus } from '@/lib/agents';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, agentType, description, requirements } = body;

    if (!description) {
      return NextResponse.json(
        { error: 'Description is required' },
        { status: 400 }
      );
    }

    let result;

    if (action === 'worker' && agentType) {
      // Выполнение через конкретного worker-агента
      result = await executeWorkerTask(agentType, description, requirements || []);
    } else {
      // Выполнение через Boss Agent (по умолчанию)
      result = await executeBossTask(description, requirements || []);
    }

    return NextResponse.json({
      success: true,
      result,
    });
  } catch (error) {
    console.error('Agent API error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const r2rHealthy = await checkR2RStatus();

    return NextResponse.json({
      status: 'ok',
      r2r: {
        enabled: process.env.ENABLE_R2R === 'true',
        healthy: r2rHealthy,
      },
      agents: {
        boss: 'active',
        workers: ['code', 'research', 'analysis', 'creative', 'devops'],
      },
    });
  } catch (error) {
    console.error('Agent status error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
