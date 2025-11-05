import { NextRequest, NextResponse } from 'next/server';
import { getR2RClient } from '@/lib/r2r-instance';

/**
 * POST /api/memory/search - Search in R2R memory
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { query, limit, collectionId } = body;

    if (!query) {
      return NextResponse.json(
        {
          success: false,
          error: 'Query is required'
        },
        { status: 400 }
      );
    }

    const r2rClient = getR2RClient();
    const results = await r2rClient.search({
      query,
      limit: limit || 10,
      collectionId
    });

    return NextResponse.json({
      success: true,
      data: {
        results,
        count: results.length
      }
    });
  } catch (error) {
    console.error('Error searching memory:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to search memory'
      },
      { status: 500 }
    );
  }
}
