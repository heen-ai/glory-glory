import axios from 'axios';

const SPORTSRC_BASE = 'https://api.sportsrc.org/v2';

export interface MatchEvent {
  id: string;
  time: string;
  type: 'goal' | 'card' | 'sub' | 'var' | 'kickoff' | 'halftime' | 'fulltime';
  team: 'home' | 'away';
  player?: string;
  assist?: string;
  minute?: number;
  detail?: string;
}

export interface Match {
  id: string;
  league: string;
  home_team: string;
  away_team: string;
  home_score: number;
  away_score: number;
  status: 'live' | 'finished' | 'upcoming' | 'postponed';
  datetime: string;
  has_stream?: boolean;
  has_standing?: boolean;
  events?: MatchEvent[];
}

export interface MatchStats {
  possession: { home: number; away: number };
  shots: { home: number; away: number };
  shotsOnTarget: { home: number; away: number };
  corners: { home: number; away: number };
  fouls: { home: number; away: number };
}

export async function getLiveScores(): Promise<Match[]> {
  try {
    const response = await axios.get(`${SPORTSRC_BASE}/scores`, {
      timeout: 10000,
    });
    // Filter for Man Utd (team ID 33 or name variants)
    const matches: Match[] = response.data?.data || response.data || [];
    return matches.filter((m: Match) =>
      m.home_team?.toLowerCase().includes('manchester united') ||
      m.away_team?.toLowerCase().includes('manchester united') ||
      m.home_team?.toLowerCase().includes('man utd') ||
      m.away_team?.toLowerCase().includes('man utd')
    );
  } catch (error) {
    console.error('SportSRC API error:', error);
    return [];
  }
}

export async function getMatchDetails(matchId: string): Promise<Match | null> {
  try {
    const response = await axios.get(`${SPORTSRC_BASE}/match/${matchId}`, {
      timeout: 10000,
    });
    return response.data;
  } catch (error) {
    console.error('SportSRC match details error:', error);
    return null;
  }
}

export async function getManUtdUpcomingMatch(): Promise<Match | null> {
  const matches = await getLiveScores();
  const upcoming = matches.find(m => m.status === 'upcoming');
  return upcoming || null;
}

export async function getManUtdLiveMatch(): Promise<Match | null> {
  const matches = await getLiveScores();
  return matches.find(m => m.status === 'live') || null;
}
