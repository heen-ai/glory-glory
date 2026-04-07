import { NextResponse } from 'next/server';
import { getPremierLeagueTable, getMatchDetails, getCurrentAndUpcomingMatch } from '@/lib/fotmob';

export const revalidate = 60;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const matchId = searchParams.get('matchId');
  const fixturesOnly = searchParams.get('fixturesOnly') === 'true';
  
  try {
    // If specific match requested, return detailed data
    if (matchId) {
      const match = await getMatchDetails(parseInt(matchId));
      if (!match) {
        return NextResponse.json({ error: 'Match not found' }, { status: 404 });
      }
      return NextResponse.json({ match });
    }
    
    // If fixtures only, just return fixture list
    if (fixturesOnly) {
      const { current, next, last } = await getCurrentAndUpcomingMatch();
      return NextResponse.json({ current, next, last });
    }
    
    // Otherwise return current/upcoming/last match + league table
    const [{ current, next, last }, table] = await Promise.all([
      getCurrentAndUpcomingMatch().catch(() => ({ current: null, next: null, last: null })),
      getPremierLeagueTable().catch(() => null),
    ]);

    // Find Man Utd position in table
    const manUtdEntry = table?.all.find(t => t.id === '10260');
    
    return NextResponse.json({
      current,
      next,
      last,
      table: manUtdEntry,
      fullTable: table,
    });
  } catch (error) {
    console.error('Matches API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch data', current: null, next: null, last: null, table: null },
      { status: 500 }
    );
  }
}
