/**
 * Glory Glory — FotMob Data Layer
 * 
 * Uses FotMob's Next.js data endpoints. Pattern:
 * 1. Fetch build ID from root page HTML
 * 2. Use _next/data/{BUILD_ID}/... for JSON data
 * 
 * Endpoints that work:
 * - /leagues/{id}/table/{slug}.json — league table
 * - /match/{matchId}.json — match details
 * 
 * Team ID for Manchester United on FotMob: 10260
 * League ID for Premier League: 47
 */

const FOTMOB_ROOT = 'https://www.fotmob.com';

// Cache the build ID to avoid re-parsing HTML on every request
let cachedBuildId: string | null = null;

export interface Team {
  id: number;
  name: string;
  shortName: string;
  pageUrl: string;
}

export interface LeagueTableEntry {
  name: string;
  shortName: string;
  id: number;
  pageUrl: string;
  played: number;
  wins: number;
  draws: number;
  losses: number;
  scoresStr: string;
  goalConDiff: number;
  pts: number;
  idx: number;
  qualColor: string | null;
}

export interface LeagueTable {
  all: LeagueTableEntry[];
  home: LeagueTableEntry[];
  away: LeagueTableEntry[];
  form: LeagueTableEntry[];
}

export interface MatchEvent {
  id: string;
  time: number; // minute
  type: 'goal' | 'card' | 'sub' | 'var' | 'kickoff' | 'halftime' | 'fulltime' | 'penalty' | 'missed_penalty';
  team: 'home' | 'away';
  player?: string;
  assist?: string;
  detail?: string;
}

export interface MatchDetails {
  matchId: number;
  status: string;
  homeTeam: Team;
  awayTeam: Team;
  homeScore: number;
  awayScore: number;
  datetime: string;
  league: string;
  events: MatchEvent[];
  stats?: MatchStats;
  xg?: { home: number; away: number };
  lineups?: LineupData;
}

export interface MatchStats {
  possession: { home: number; away: number };
  shots: { home: number; away: number };
  shotsOnTarget: { home: number; away: number };
  corners: { home: number; away: number };
  fouls: { home: number; away: number };
  yellowCards: { home: number; away: number };
  redCards: { home: number; away: number };
}

export interface LineupData {
  home: Player[];
  away: Player[];
  homeFormation?: string;
  awayFormation?: string;
}

export interface Player {
  id: number;
  name: string;
  shirtNumber?: number;
  position?: string;
  rating?: number;
}

async function getBuildId(): Promise<string> {
  if (cachedBuildId) return cachedBuildId;

  const html = await fetch(FOTMOB_ROOT).then(r => r.text());
  const match = html.match(/"_next\/static\/([^/]+)\/chunks/);
  if (!match) throw new Error('Could not find build ID in FotMob HTML');
  
  cachedBuildId = match[1];
  return cachedBuildId;
}

async function fetchFotmob<T>(path: string): Promise<T> {
  const buildId = await getBuildId();
  const url = `${FOTMOB_ROOT}/_next/data/${buildId}${path}`;
  const response = await fetch(url);
  
  if (!response.ok) {
    throw new Error(`FotMob API error: ${response.status} for ${url}`);
  }
  
  const data = await response.json();
  return data.pageProps as T;
}

export async function getPremierLeagueTable(): Promise<LeagueTable> {
  const data = await fetchFotmob<any>('/leagues/47/table/premier-league.json');
  const table = data.table;
  
  return {
    all: table.all.map(normalizeEntry),
    home: table.home.map(normalizeEntry),
    away: table.away.map(normalizeEntry),
    form: (table.form || []).map(normalizeEntry),
  };
}

function normalizeEntry(entry: any): LeagueTableEntry {
  return {
    name: entry.name,
    shortName: entry.shortName,
    id: entry.id,
    pageUrl: entry.pageUrl,
    played: entry.played,
    wins: entry.wins,
    draws: entry.draws,
    losses: entry.losses,
    scoresStr: entry.scoresStr,
    goalConDiff: entry.goalConDiff,
    pts: entry.pts,
    idx: entry.idx,
    qualColor: entry.qualColor,
  };
}

export async function getMatchDetails(matchId: number): Promise<MatchDetails | null> {
  try {
    const data = await fetchFotmob<any>(`/match/${matchId}.json`);
    return parseMatchDetails(data);
  } catch (e) {
    console.error('Failed to fetch match details:', e);
    return null;
  }
}

function parseMatchDetails(data: any): MatchDetails {
  // The structure varies — look for match data in different places
  const match = data.match || data.content || data;
  
  return {
    matchId: match.matchId || match.id,
    status: match.status || 'unknown',
    homeTeam: match.homeTeam || match.home_team,
    awayTeam: match.awayTeam || match.away_team,
    homeScore: match.homeScore?.score ?? match.home_score ?? 0,
    awayScore: match.awayScore?.score ?? match.away_score ?? 0,
    datetime: match.datetime || match.startDateTime || match.date,
    league: match.league || 'Premier League',
    events: parseEvents(match.events || match.content?.events || []),
    stats: parseStats(match.stats),
    xg: match.xg || match.expectedGoals,
    lineups: parseLineups(match.lineups),
  };
}

function parseEvents(events: any[]): MatchEvent[] {
  if (!events || !Array.isArray(events)) return [];
  
  return events.map(e => ({
    id: e.id || String(Math.random()),
    time: e.minute || e.time || 0,
    type: mapEventType(e.type || e.eventType),
    team: e.team === 'home' || e.isHome ? 'home' : 'away',
    player: e.player?.name || e.playerName || e.player,
    assist: e.assist?.name || e.assistedBy || e.assist,
    detail: e.detail || e.description,
  }));
}

function mapEventType(type: string): MatchEvent['type'] {
  const t = (type || '').toLowerCase();
  if (t.includes('goal')) return 'goal';
  if (t.includes('card') && t.includes('red')) return 'card';
  if (t.includes('card')) return 'card';
  if (t.includes('sub')) return 'sub';
  if (t.includes('var')) return 'var';
  if (t.includes('penalty') && (t.includes('miss') || t.includes('saved') || t.includes('woodwork'))) return 'missed_penalty';
  if (t.includes('penalty')) return 'penalty';
  if (t.includes('kickoff')) return 'kickoff';
  if (t.includes('half')) return 'halftime';
  if (t.includes('fulltime') || t.includes('full')) return 'fulltime';
  return 'goal';
}

function parseStats(stats: any): MatchStats | undefined {
  if (!stats) return undefined;
  return {
    possession: stats.possession || { home: 50, away: 50 },
    shots: stats.shots || { home: 0, away: 0 },
    shotsOnTarget: stats.shotsOnTarget || { home: 0, away: 0 },
    corners: stats.corners || { home: 0, away: 0 },
    fouls: stats.fouls || { home: 0, away: 0 },
    yellowCards: stats.yellowCards || { home: 0, away: 0 },
    redCards: stats.redCards || { home: 0, away: 0 },
  };
}

function parseLineups(lineups: any): LineupData | undefined {
  if (!lineups) return undefined;
  return {
    home: (lineups.homeXI || []).map((p: any) => ({
      id: p.id,
      name: p.name,
      shirtNumber: p.shirtNumber,
      position: p.position,
      rating: p.rating,
    })),
    away: (lineups.awayXI || []).map((p: any) => ({
      id: p.id,
      name: p.name,
      shirtNumber: p.shirtNumber,
      position: p.position,
      rating: p.rating,
    })),
    homeFormation: lineups.homeFormation,
    awayFormation: lineups.awayFormation,
  };
}

export async function getManUtdMatches(date?: string): Promise<any[]> {
  // Get today's matches or a specific date
  const targetDate = date || new Date().toISOString().split('T')[0].replace(/-/g, '');
  
  try {
    const data = await fetchFotmob<any>(`/leagues/47/matchlist.json?date=${targetDate}`);
    const matches = data.matches || data.allMatches || [];
    
    // Filter for Man Utd
    return matches.filter((m: any) => {
      const home = m.homeTeam?.name || m.home_team?.name || '';
      const away = m.awayTeam?.name || m.away_team?.name || '';
      const homeShort = m.homeTeam?.shortName || m.home_shortName || '';
      const awayShort = m.awayTeam?.shortName || m.away_shortName || '';
      
      return home.toLowerCase().includes('manchester united') ||
             away.toLowerCase().includes('manchester united') ||
             homeShort.toLowerCase().includes('man utd') ||
             awayShort.toLowerCase().includes('man utd') ||
             home.includes('United');
    });
  } catch (e) {
    console.error('Failed to fetch matches:', e);
    return [];
  }
}

export async function getManUtdCurrentSeason(): Promise<{
  table: LeagueTable | null;
  recentMatches: any[];
}> {
  const [table, todayMatches] = await Promise.all([
    getPremierLeagueTable().catch(() => null),
    getManUtdMatches().catch(() => []),
  ]);

  return {
    table,
    recentMatches: todayMatches,
  };
}

// Get current Man Utd match (live or upcoming)
export async function getCurrentMatch(): Promise<MatchDetails | null> {
  // First try to get today's matches
  const matches = await getManUtdMatches();
  
  if (matches.length > 0) {
    // Get detailed info for the first match
    const matchId = matches[0].matchId || matches[0].id;
    if (matchId) {
      return getMatchDetails(matchId);
    }
  }
  
  // If no match today, try to get next scheduled match from table data
  // This requires a more complex approach — for now return null
  return null;
}
