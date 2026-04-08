/**
 * Glory Glory — SportSRC Data Layer
 * 
 * API V2 — Basic plan
 * Docs: https://sportsrc.org/v2/#docs
 * Header: X-API-KEY
 */

const SPORTSRC_BASE = 'https://api.sportsrc.org/v2';
const API_KEY = process.env.SPORTSRC_API_KEY || '';

function headers() {
  return {
    'X-API-KEY': API_KEY,
    'Accept': 'application/json',
  };
}

export interface StreamSource {
  source: string;
  embedUrl: string;
  hd: boolean;
  language: string;
  title?: string;
}

export interface MatchInfo {
  id: string;
  title: string;
  time: string;
  status: string;
  league: string;
  homeTeam: string;
  awayTeam: string;
  homeScore: number;
  awayScore: number;
}

export interface MatchDetail {
  matchInfo: MatchInfo;
  sources: StreamSource[];
  info: string;
}

async function apiGet(params: Record<string, string>): Promise<any> {
  const url = new URL(SPORTSRC_BASE);
  url.searchParams.set('key', API_KEY);
  for (const [k, v] of Object.entries(params)) {
    url.searchParams.set(k, v);
  }
  
  const res = await fetch(url.toString(), { headers: headers() });
  if (!res.ok) throw new Error(`SportSRC error: ${res.status}`);
  const data = await res.json();
  if (!data.success) throw new Error(data.message || 'SportSRC API error');
  return data;
}

// === Get match detail with stream sources ===
export async function getMatchDetail(sportsrcId: string): Promise<MatchDetail | null> {
  try {
    const data = await apiGet({ type: 'detail', id: sportsrcId });
    const raw = data.data;
    
    const info = raw.match_info;
    const sources: StreamSource[] = (raw.sources || [])
      .filter((s: any) => s.embedUrl)
      .map((s: any) => ({
        source: s.source || s.name || 'Stream',
        embedUrl: s.embed_url || s.embedUrl || s.url,
        hd: s.hd || false,
        language: s.language || '',
        title: s.title || s.name,
      }));

    return {
      matchInfo: {
        id: info.id,
        title: info.title,
        time: info.time,
        status: info.status,
        league: info.league,
        homeTeam: info.home_team || info.homeTeam,
        awayTeam: info.away_team || info.awayTeam,
        homeScore: parseInt(info.home_score) || 0,
        awayScore: parseInt(info.away_score) || 0,
      },
      sources,
      info: raw.info || '',
    };
  } catch (e) {
    console.error('SportSRC detail error:', e);
    return null;
  }
}

// === Get matches for a date ===
export interface SportSrcMatch {
  id: string;
  leagueId: string;
  leagueName: string;
  home: string;
  away: string;
  homeId: string;
  awayId: string;
  status: string;
  homeScore: number;
  awayScore: number;
  hasStream: boolean;
  fotmobId?: number;
}

export async function getMatchesForDate(date: string): Promise<SportSrcMatch[]> {
  try {
    const data = await apiGet({ type: 'matches', sport: 'football', date });
    const matches: SportSrcMatch[] = [];
    
    for (const league of data.data || []) {
      const leagueId = league.id || '';
      const leagueName = league.name || '';
      
      for (const m of league.matches || []) {
        const teams = m.teams || {};
        const homeTeam = teams.home || {};
        const awayTeam = teams.away || {};
        
        matches.push({
          id: m.id,
          leagueId,
          leagueName,
          home: homeTeam.name || '',
          away: awayTeam.name || '',
          homeId: homeTeam.id || '',
          awayId: awayTeam.id || '',
          status: m.status || '',
          homeScore: parseInt(m.score?.current?.home) || 0,
          awayScore: parseInt(m.score?.current?.away) || 0,
          hasStream: m.has_stream || false,
        });
      }
    }
    
    return matches;
  } catch (e) {
    console.error('SportSRC matches error:', e);
    return [];
  }
}

// === Get Man Utd match ===
export async function findManUtdMatch(date: string): Promise<SportSrcMatch | null> {
  const matches = await getMatchesForDate(date);
  
  return (
    matches.find(m =>
      m.home.toLowerCase().includes('manchester united') ||
      m.away.toLowerCase().includes('manchester united')
    ) || null
  );
}

// === Channel list (all available stream channels) ===
export interface Channel {
  id: string;
  name: string;
  language: string;
  embedUrl: string;
  category?: string;
}

export async function getChannels(matchId: string): Promise<Channel[]> {
  try {
    const data = await apiGet({ type: 'channels', id: matchId });
    return (data.data || []).map((c: any) => ({
      id: c.id || c.name,
      name: c.name || c.channel_name,
      language: c.language || '',
      embedUrl: c.embed_url || c.embedUrl || '',
      category: c.category || '',
    })).filter((c: Channel) => c.embedUrl);
  } catch (e) {
    console.error('SportSRC channels error:', e);
    return [];
  }
}
