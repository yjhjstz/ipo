import { NextResponse } from 'next/server';
import { AIAgentDataSync } from '@/lib/ai-agent-data-sync';

export async function POST() {
  try {
    const githubToken = process.env.GITHUB_TOKEN;
    
    if (!githubToken) {
      return NextResponse.json(
        { success: false, error: 'GitHub token not configured' },
        { status: 500 }
      );
    }

    const aiAgentSync = new AIAgentDataSync(githubToken);
    const result = await aiAgentSync.syncAll();

    return NextResponse.json({
      success: true,
      data: {
        message: 'AI Agent data synchronization completed',
        totalSynced: result.totalSynced,
        queriesProcessed: result.queries,
        timestamp: new Date().toISOString(),
      }
    });
  } catch (error) {
    console.error('Error syncing AI Agent data:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to sync AI Agent data',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const githubToken = process.env.GITHUB_TOKEN;
    
    if (!githubToken) {
      return NextResponse.json(
        { success: false, error: 'GitHub token not configured' },
        { status: 500 }
      );
    }

    const aiAgentSync = new AIAgentDataSync(githubToken);
    const stats = await aiAgentSync.getSyncStats();

    return NextResponse.json({
      success: true,
      data: {
        stats,
        timestamp: new Date().toISOString(),
      }
    });
  } catch (error) {
    console.error('Error getting AI Agent sync stats:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get sync stats' },
      { status: 500 }
    );
  }
}