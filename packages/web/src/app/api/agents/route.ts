import { NextRequest, NextResponse } from 'next/server';
import { getBossAgent } from '@/lib/boss-agent-instance';

/**
 * GET /api/agents - Get all agents status
 */
export async function GET(request: NextRequest) {
  try {
    const bossAgent = getBossAgent();
    const status = bossAgent.getStatus();

    return NextResponse.json({
      success: true,
      data: status
    });
  } catch (error) {
    console.error('Error fetching agents:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch agents'
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/agents - Start boss agent
 */
export async function POST(request: NextRequest) {
  try {
    const bossAgent = getBossAgent();
    await bossAgent.start();

    return NextResponse.json({
      success: true,
      message: 'Boss agent started successfully'
    });
  } catch (error) {
    console.error('Error starting boss agent:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to start boss agent'
      },
      { status: 500 }
    );
  }
}
