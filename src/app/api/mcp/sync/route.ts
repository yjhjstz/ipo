import { NextRequest, NextResponse } from 'next/server';
import { McpDataSync } from '@/lib/mcp-data-sync';

export async function POST(request: NextRequest) {
  try {
    const githubToken = process.env.GITHUB_TOKEN;
    
    if (!githubToken) {
      return NextResponse.json(
        { success: false, error: 'GitHub token not configured' },
        { status: 500 }
      );
    }

    const mcpSync = new McpDataSync(githubToken);
    const result = await mcpSync.syncAll();

    return NextResponse.json({
      success: true,
      data: {
        message: 'MCP data synchronization completed',
        totalSynced: result.totalSynced,
        queriesProcessed: result.queries,
        timestamp: new Date().toISOString(),
      }
    });
  } catch (error) {
    console.error('Error syncing MCP data:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to sync MCP data',
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

    const mcpSync = new McpDataSync(githubToken);
    const stats = await mcpSync.getSyncStats();

    return NextResponse.json({
      success: true,
      data: {
        stats,
        timestamp: new Date().toISOString(),
      }
    });
  } catch (error) {
    console.error('Error getting MCP sync stats:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get sync stats' },
      { status: 500 }
    );
  }
}