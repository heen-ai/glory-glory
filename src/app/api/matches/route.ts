import { NextResponse } from 'next/server';
import { getPremierLeagueTable, getMatchDetails as getFotMobMatch, getCurrentAndUpcomingMatch, getManUtdFixtures } from '@/lib/fotmob';
import { getMatchDetail as getSportSrcDetail, getMatchesForDate } from '@/lib/sportsrc';

export const revalidate = 60;

// Cache for SportSRC match lookups
const sportsrcIdCache = new Map<string, string>();

async function findSportSrcId(fotmobMatchId: string, homeTeam: string, awayTeam: string, utcTime: string): Promise<string | null> {
  // Check cache first
  if (sportsrcIdCache.has(fotmobMatchId)) {
    return sportsrcIdCache.get(fotmobMatchId) || null;
  }
  
  // Extract date from UTC time
  const date = utcTime.split('T')[0];
  
  try {
    const matches = await getMatchesForDate(date);
    
    // Find matching match by team names
    const match = matches.find(m => {
      const homeMatch = m.home.toLowerCase().includes('manchester') && m.home.toLowerCase().includes('united');
      const awayMatch = m.away.toLowerCase().includes('manchester') && m.away.toLowerCase().includes('united');
      const homeAlso = m.home.toLowerCase().includes('united') || m.home.toLowerCase().includes('manchester');
      const awayAlso = m.away.toLowerCase().includes('united') || m.away.toLowerCase().includes('manchester');
      
      return (homeMatch || awayMatch) &&
             (m.home.toLowerCase().includes(homeTeam.toLowerCase().split(' ')[0]) ||
              m.away.toLowerCase().includes(awayTeam.toLowerCase().split(' ')[0]));
    });
    
    if (match) {
      sportsrcIdCache.set(fotmobMatchId, match.id);
      return match.id;
    }
  } catch (e) {
    console.error('Failed to find SportSrc ID:', e);
  }
  
  return null;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const matchId = searchParams.get('matchId');
  const sportsrcId = searchParams.get('sportsrcId');
  
  try {
    // If SportSRC ID provided, return stream info
    if (sportsrcId) {
      const stream = await getSportSrcDetail(sportsrcId);
      return NextResponse.json({ stream });
    }
    
    // If specific FotMob match ID, return detailed match data + stream
    if (matchId) {
      const numMatchId = parseInt(matchId);
      const match = await getFotMobMatch(numMatchId);
      
      if (!match) {
        return NextResponse.json({ error: 'Match not found' }, { status: 404 });
      }
      
      // Try to find stream
      let stream = null;
      let sportSrcId = null;
      
      try {
        sportSrcId = await findSportSrcId(
          matchId,
          match.homeTeam.name,
          match.awayTeam.name,
          match.status.utcTime
        );
        
        if (sportSrcId) {
          stream = await getSportSrcDetail(sportSrcId);
        }
      } catch (e) {
        console.error('Stream lookup failed:', e);
      }
      
      return NextResponse.json({ match, stream, sportSrcId });
    }
    
    // Return fixture list + table
    const [{ current, next, last }, table] = await Promise.all([
      getCurrentAndUpcomingMatch().catch(() => ({ current: null, next: null, last: null })),
      getPremierLeagueTable().catch(() => null),
    ]);

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
      { error: 'Failed to fetch data' },
      { status: 500 }
    );
  }
}
