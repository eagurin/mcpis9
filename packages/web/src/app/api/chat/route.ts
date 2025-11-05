/**
 * Chat API Route with Boss Agent Integration
 *
 * Handles chat requests using the boss agent orchestration system
 */

import { NextRequest, NextResponse } from 'next/server';
import { initOrchestrator, getOrchestrator, type OrchestratorConfig } from '@mcpis9/shared';

// Initialize orchestrator on first request
let isInitialized = false;

async function ensureOrchestrator(): Promise<void> {
  if (isInitialized) return;

  const config: OrchestratorConfig = {
    // R2R Memory (optional)
    r2r: process.env.R2R_BASE_URL
      ? {
          baseUrl: process.env.R2R_BASE_URL,
          apiKey: process.env.R2R_API_KEY,
        }
      : undefined,

    // Linear Integration (optional)
    linear: process.env.LINEAR_API_KEY
      ? {
          apiKey: process.env.LINEAR_API_KEY,
          teamId: process.env.LINEAR_TEAM_ID,
        }
      : undefined,

    // AI Providers (at least one required)
    aiProviders: {
      anthropic: process.env.ANTHROPIC_API_KEY
        ? { apiKey: process.env.ANTHROPIC_API_KEY }
        : undefined,
      openai: process.env.OPENAI_API_KEY
        ? { apiKey: process.env.OPENAI_API_KEY }
        : undefined,
      google: process.env.GOOGLE_API_KEY
        ? { apiKey: process.env.GOOGLE_API_KEY }
        : undefined,
    },
  };

  // Validate at least one AI provider is configured
  if (!config.aiProviders.anthropic && !config.aiProviders.openai && !config.aiProviders.google) {
    console.warn(
      '[API] No AI provider API keys configured. Please set ANTHROPIC_API_KEY, OPENAI_API_KEY, or GOOGLE_API_KEY'
    );
  }

  const orchestrator = initOrchestrator(config);
  await orchestrator.initialize();
  isInitialized = true;

  console.log('[API] Agent orchestrator initialized');
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { messages, conversationId } = body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: 'Messages are required' }, { status: 400 });
    }

    // Get the last user message
    const lastMessage = messages[messages.length - 1];
    if (!lastMessage || lastMessage.role !== 'user') {
      return NextResponse.json({ error: 'Last message must be from user' }, { status: 400 });
    }

    // Ensure orchestrator is initialized
    await ensureOrchestrator();

    // Get orchestrator instance
    const orchestrator = getOrchestrator();
    if (!orchestrator) {
      return NextResponse.json(
        { error: 'Agent system not initialized' },
        { status: 500 }
      );
    }

    // Process request through boss agent
    const response = await orchestrator.processRequest(
      lastMessage.content,
      conversationId || `conversation-${Date.now()}`
    );

    // Return response
    return NextResponse.json({
      message: {
        role: 'assistant',
        content: response,
        timestamp: Date.now(),
      },
    });
  } catch (error) {
    console.error('[API] Chat error:', error);

    return NextResponse.json(
      {
        error: 'Failed to process chat request',
        details: (error as Error).message,
      },
      { status: 500 }
    );
  }
}

/**
 * GET endpoint to check agent system status
 */
export async function GET(request: NextRequest) {
  try {
    await ensureOrchestrator();

    const orchestrator = getOrchestrator();
    if (!orchestrator) {
      return NextResponse.json({ status: 'not initialized' }, { status: 503 });
    }

    const status = orchestrator.getSystemStatus();

    return NextResponse.json({
      status: 'ready',
      agents: status,
      timestamp: Date.now(),
    });
  } catch (error) {
    console.error('[API] Status check error:', error);

    return NextResponse.json(
      {
        status: 'error',
        error: (error as Error).message,
      },
      { status: 500 }
    );
  }
}
