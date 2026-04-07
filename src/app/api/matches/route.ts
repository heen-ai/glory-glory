import { NextResponse } from 'next/server';
import { getPremierLeagueTable, getCurrentMatch, getMatchDetails } from '@/lib/fotmob';

export const revalidate = 60; // Cache for 60 seconds

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const matchId = searchParams.get('matchId');
  
  try {
    // If specific match requested, return that
    if (matchId) {
      const match = await getMatchDetails(parseInt(matchId));
      if (!match) {
        return NextResponse.json({ error: 'Match not found' }, { status: 404 });
      }
      return NextResponse.json({ match });
    }
    
    // Otherwise return current Man Utd match + league table
    const [currentMatch, table] = await Promise.all([
      getCurrentMatch().catch(() => null),
      getPremierLeagueTable().catch(() => null),
    ]);

    // Find Man Utd position in table
    const manUtdEntry = table?.all.find(t => t.id === 10260);
    
    return NextResponse.json({
      match: currentMatch,
      table: manUtdEntry,
      fullTable: table,
    });
  } catch (error) {
    console.error('Matches API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch match data', match: null, table: null },
      { status: 500 }
    );
  }
}
