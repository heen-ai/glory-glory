/**
 * Glory Glory — FotMob Data Layer v2
 * 
 * Uses FotMob's match page __NEXT_DATA__ for detailed match info.
 * Pattern: fetch HTML page, extract __NEXT_DATA__, parse pageProps.
 * 
 * Endpoints:
 * - Match page: /match/{matchId} → header, content.liveticker, content.shotmap, content.stats, content.lineup
 * - League: /leagues/47/matchlist.json → fixture list with basic match data
 * - League table: /leagues/47/table/premier-league.json → standings
 * 
 * Team ID for Manchester United on FotMob: 10260
 * League ID for Premier League: 47
 */

const FOTMOB_ROOT = 'https://www.fotmob.com';

export interface Team {
  id: string;
  name: string;
  score: number;
  imageUrl: string;
}

export interface MatchStatus {
  utcTime: string;
  scoreStr: string;
  finished: boolean;
  started: boolean;
  reason: {
    short: string;
    long: string;
  };
  halves?: any;
  liveTime?: { text: string };
}

export interface MatchHeader {
  matchId: number;
  teams: Team[];
  status: MatchStatus;
}

export interface MatchEvent {
  id: string;
  minute: number;
  type: string;
  text?: string;
  player?: { name: string; id: number };
  assist?: { name: string; id: number };
  homeScore?: number;
  awayScore?: number;
}

export interface Shot {
  id: string;
  playerId: number;
  playerName: string;
  teamId: number;
  min: number;
  expectedGoals: number;
  eventType: string;
  x: number;
  y: number;
  isHome: boolean;
  goal: boolean;
  saved: boolean;
  missed: boolean;
  blocked: boolean;
  offside: boolean;
  hitWoodwork: boolean;
}

export interface StatItem {
  title: string;
  homeValue: string;
  awayValue: string;
}

export interface MatchStats {
  possession: { home: number; away: number };
  shots: { home: number; away: number };
  shotsOnTarget: { home: number; away: number };
  corners: { home: number; away: number };
  fouls: { home: number; away: number };
  yellowCards: { home: number; away: number };
  redCards: { home: number; away: number };
  xg?: { home: number; away: number };
}

export interface LineupPlayer {
  id: number;
  name: string;
  position: string;
  shirtNumber?: number;
  rating?: number;
}

export interface Lineup {
  formation: string;
  xi: LineupPlayer[];
  bench: LineupPlayer[];
}

export interface MatchDetails {
  matchId: number;
  header: MatchHeader;
  events: MatchEvent[];
  shots: Shot[];
  stats: MatchStats;
  homeLineup?: Lineup;
  awayLineup?: Lineup;
  homeTeam: { id: string; name: string };
  awayTeam: { id: string; name: string };
  homeScore: number;
  awayScore: number;
  status: MatchStatus;
}

export interface LeagueTableEntry {
  name: string;
  shortName: string;
  id: string;
  played: number;
  wins: number;
  draws: number;
  losses: number;
  scoresStr: string;
  goalConDiff: number;
  pts: number;
  idx: number;
  qualColor?: string;
  imageUrl?: string;
}

export interface LeagueTable {
  all: LeagueTableEntry[];
  home: LeagueTableEntry[];
  away: LeagueTableEntry[];
}

export interface FixtureMatch {
  id: string;
  home: { id: string; name: string; shortName: string };
  away: { id: string; name: string; shortName: string };
  status: {
    utcTime: string;
    scoreStr?: string;
    finished?: boolean;
    liveTime?: { text: string };
    started?: boolean;
  };
}

export interface ManUtdMatch extends MatchDetails {
  // Additional fields from fixture
  pageUrl?: string;
  round?: string;
}

let cachedBuildId: string | null = null;

async function getBuildId(): Promise<string> {
  if (cachedBuildId) return cachedBuildId;
  const html = await fetch(FOTMOB_ROOT).then(r => r.text());
  const match = html.match(/"_next\/static\/([^/]+)\/chunks/);
  if (!match) throw new Error('Could not find build ID in FotMob HTML');
  cachedBuildId = match[1];
  return cachedBuildId;
}

// === League Table ===
async function fetchLeagueData<T>(path: string): Promise<T> {
  const buildId = await getBuildId();
  const url = `${FOTMOB_ROOT}/_next/data/${buildId}${path}`;
  const response = await fetch(url);
  if (!response.ok) throw new Error(`FotMob API error: ${response.status}`);
  const data = await response.json();
  return data.pageProps as T;
}

export async function getPremierLeagueTable(): Promise<LeagueTable> {
  const data = await fetchLeagueData<any>('/leagues/47/table/premier-league.json');
  const table = data.table;
  
  return {
    all: table.all.map(normalizeTableEntry),
    home: table.home.map(normalizeTableEntry),
    away: table.away.map(normalizeTableEntry),
  };
}

function normalizeTableEntry(entry: any): LeagueTableEntry {
  return {
    name: entry.name,
    shortName: entry.shortName || entry.name,
    id: String(entry.id),
    played: entry.played,
    wins: entry.wins,
    draws: entry.draws,
    losses: entry.losses,
    scoresStr: entry.scoresStr,
    goalConDiff: entry.goalConDiff,
    pts: entry.pts,
    idx: entry.idx,
    qualColor: entry.qualColor,
    imageUrl: entry.imageUrl,
  };
}

// === Fixture List ===
export async function getManUtdFixtures(): Promise<FixtureMatch[]> {
  const data = await fetchLeagueData<any>('/leagues/47/matchlist.json');
  const allMatches: any[] = data.fixtures?.allMatches || [];
  
  return allMatches
    .filter(m => m.home?.id === '10260' || m.away?.id === '10260')
    .map(m => ({
      id: m.id,
      home: m.home,
      away: m.away,
      status: {
        utcTime: m.status?.utcTime,
        scoreStr: m.status?.scoreStr,
        finished: m.status?.finished,
        liveTime: m.status?.liveTime,
        started: m.status?.started,
      },
      pageUrl: m.pageUrl,
      round: m.round,
    }));
}

// === Match Details (from match page HTML) ===
export async function getMatchDetails(matchId: number): Promise<MatchDetails | null> {
  try {
    const url = `${FOTMOB_ROOT}/match/${matchId}`;
    const response = await fetch(url);
    const html = await response.text();
    
    const nextDataMatch = html.match(/id="__NEXT_DATA__"[^>]*>([^<]+)</);
    if (!nextDataMatch) return null;
    
    const data = JSON.parse(nextDataMatch[1]);
    const pp = data.props.pageProps;
    const header = pp.header;
    const content = pp.content || {};
    
    // Parse teams
    const teams: Team[] = (header.teams || []).map((t: any) => ({
      id: String(t.id),
      name: t.Name,
      score: t.score,
      imageUrl: t.imageUrl,
    }));
    
    const homeTeam = teams[0];
    const awayTeam = teams[1];
    
    // Parse events from liveticker
    const events: MatchEvent[] = [];
    const liveticker = content.liveticker?.teams || {};
    for (const [teamId, teamEvents] of Object.entries(liveticker)) {
      if (Array.isArray(teamEvents)) {
        for (const e of teamEvents) {
          events.push({
            id: String(e.id),
            minute: e.minute || e.time,
            type: mapEventType(e.type || e.eventType),
            text: e.text,
            player: e.player,
            assist: e.assist,
            homeScore: e.homeScore,
            awayScore: e.awayScore,
          });
        }
      }
    }
    
    // Sort by minute
    events.sort((a, b) => a.minute - b.minute);
    
    // Parse shots
    const shots: Shot[] = [];
    const rawShots: any[] = content.shotmap?.shots || [];
    for (const s of rawShots) {
      const isHome = String(s.teamId) === String(homeTeam?.id);
      shots.push({
        id: String(s.id),
        playerId: s.playerId,
        playerName: s.playerName,
        teamId: s.teamId,
        min: s.min,
        expectedGoals: s.expectedGoals || 0,
        eventType: s.eventType,
        x: s.x,
        y: s.y,
        isHome,
        goal: s.eventType === 'Goal',
        saved: s.eventType === 'AttemptSaved',
        missed: s.eventType === 'AttemptMissed',
        blocked: s.eventType === 'AttemptBlocked',
        offside: s.eventType === 'OffsideWkeeper',
        hitWoodwork: s.eventType === 'HitWoodwork',
      });
    }
    
    // Parse stats
    const statsPeriod = content.stats?.Periods?.[0]?.stats || [];
    const stats = parseStats(statsPeriod, shots);
    
    // Parse lineups
    const homeLineup = parseLineup(content.lineup?.homeTeam);
    const awayLineup = parseLineup(content.lineup?.awayTeam);
    
    return {
      matchId,
      header: {
        matchId,
        teams,
        status: header.status,
      },
      events,
      shots,
      stats,
      homeLineup,
      awayLineup,
      homeTeam: { id: homeTeam?.id || '', name: homeTeam?.name || '' },
      awayTeam: { id: awayTeam?.id || '', name: awayTeam?.name || '' },
      homeScore: homeTeam?.score || 0,
      awayScore: awayTeam?.score || 0,
      status: header.status,
    };
  } catch (e) {
    console.error('Failed to fetch match details:', e);
    return null;
  }
}

function mapEventType(type: string): string {
  const t = (type || '').toLowerCase();
  if (t.includes('goal') || t === 'goal') return 'goal';
  if (t.includes('yellow')) return 'card_yellow';
  if (t.includes('red')) return 'card_red';
  if (t.includes('sub') || t.includes('subst')) return 'sub';
  if (t.includes('var')) return 'var';
  if (t.includes('penalty') && (t.includes('miss') || t.includes('saved') || t.includes('woodwork'))) return 'missed_penalty';
  if (t.includes('penalty')) return 'penalty';
  if (t.includes('kickoff')) return 'kickoff';
  if (t.includes('half') && t.includes('end')) return 'halftime';
  if (t.includes('full') || t.includes('finished')) return 'fulltime';
  return 'other';
}

function parseStats(rawStats: any[], shots: Shot[]): MatchStats {
  const stats: MatchStats = {
    possession: { home: 50, away: 50 },
    shots: { home: 0, away: 0 },
    shotsOnTarget: { home: 0, away: 0 },
    corners: { home: 0, away: 0 },
    fouls: { home: 0, away: 0 },
    yellowCards: { home: 0, away: 0 },
    redCards: { home: 0, away: 0 },
  };
  
  for (const s of rawStats) {
    const title = (s.title || '').toLowerCase();
    const homeVal = parseFloat(s.homeValue) || 0;
    const awayVal = parseFloat(s.awayValue) || 0;
    
    if (title.includes('possession')) {
      stats.possession = { home: homeVal, away: awayVal };
    } else if (title.includes('shots') && !title.includes('target')) {
      stats.shots = { home: homeVal, away: awayVal };
    } else if (title.includes('target')) {
      stats.shotsOnTarget = { home: homeVal, away: awayVal };
    } else if (title.includes('corner')) {
      stats.corners = { home: homeVal, away: awayVal };
    } else if (title.includes('foul')) {
      stats.fouls = { home: homeVal, away: awayVal };
    } else if (title.includes('yellow')) {
      stats.yellowCards = { home: homeVal, away: awayVal };
    } else if (title.includes('red')) {
      stats.redCards = { home: homeVal, away: awayVal };
    }
  }
  
  // Calculate from shots if not in stats
  if (stats.shots.home === 0 && stats.shots.away === 0) {
    stats.shots.home = shots.filter(s => s.isHome).length;
    stats.shots.away = shots.filter(s => !s.isHome).length;
  }
  
  // Calculate xG from shots
  const homeXg = shots.filter(s => s.isHome).reduce((sum, s) => sum + (s.goal ? s.expectedGoals : 0), 0);
  const awayXg = shots.filter(s => !s.isHome).reduce((sum, s) => sum + (s.goal ? s.expectedGoals : 0), 0);
  if (homeXg > 0 || awayXg > 0) {
    stats.xg = { home: parseFloat(homeXg.toFixed(2)), away: parseFloat(awayXg.toFixed(2)) };
  }
  
  return stats;
}

function parseLineup(data: any): Lineup | undefined {
  if (!data) return undefined;
  return {
    formation: data.formation,
    xi: (data.xi || []).map((p: any) => ({
      id: p.id,
      name: p.name,
      position: p.position,
      shirtNumber: p.shirtNumber,
      rating: p.rating,
    })),
    bench: (data.bench || []).map((p: any) => ({
      id: p.id,
      name: p.name,
      position: p.position,
      shirtNumber: p.shirtNumber,
      rating: p.rating,
    })),
  };
}

// === Convenience functions ===
export async function getCurrentAndUpcomingMatch(): Promise<{
  current: FixtureMatch | null;
  next: FixtureMatch | null;
  last: FixtureMatch | null;
}> {
  const fixtures = await getManUtdFixtures();
  const now = Date.now();
  
  const upcoming = fixtures
    .filter(m => !m.status.finished && m.status.started !== false && new Date(m.status.utcTime).getTime() > now)
    .sort((a, b) => new Date(a.status.utcTime).getTime() - new Date(b.status.utcTime).getTime());
  
  const finished = fixtures
    .filter(m => m.status.finished)
    .sort((a, b) => new Date(b.status.utcTime).getTime() - new Date(a.status.utcTime).getTime());
  
  return {
    current: upcoming[0] || null,
    next: upcoming[0] || null,
    last: finished[0] || null,
  };
}
