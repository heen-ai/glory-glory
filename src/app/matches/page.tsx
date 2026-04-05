'use client';

import { useEffect, useState } from 'react';

interface MatchEvent {
  id: string;
  minute: number;
  type: string;
  team: string;
  player?: string;
  assist?: string;
  detail?: string;
}

interface Match {
  id: string;
  home_team: string;
  away_team: string;
  home_score: number;
  away_score: number;
  status: string;
  datetime: string;
  league: string;
  events?: MatchEvent[];
}

export default function MatchesPage() {
  const [match, setMatch] = useState<Match | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchMatch() {
      try {
        const response = await fetch('/api/matches');
        const data = await response.json();
        if (data.match) {
          setMatch(data.match);
        }
      } catch (err) {
        setError('Failed to load match data');
      } finally {
        setLoading(false);
      }
    }

    fetchMatch();
    const interval = setInterval(fetchMatch, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex gap-1">
          <div className="w-3 h-3 bg-white/50 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
          <div className="w-3 h-3 bg-white/50 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
          <div className="w-3 h-3 bg-white/50 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      </div>
    );
  }

  if (error || !match) {
    return (
      <div className="space-y-8">
        <h1 className="text-4xl font-bold">Match Centre</h1>
        <div className="card text-center py-12">
          <p className="text-white/50 mb-4">{error || 'No match data available'}</p>
          <p className="text-sm text-white/30">
            SportSRC API not configured or no live match. Connect to live data for real-time updates.
          </p>
        </div>
        
        {/* Placeholder for demo */}
        <div className="card">
          <p className="text-white/50 text-sm uppercase tracking-wider mb-4">Demo Mode</p>
          <div className="text-center py-8">
            <h2 className="text-3xl font-bold mb-2">Manchester United</h2>
            <p className="text-xl text-white/70 mb-4">vs Next Opponent</p>
            <p className="text-4xl font-mono text-[#FBE122]">0 - 0</p>
            <p className="text-white/50 mt-4">Match not started yet</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <h1 className="text-4xl font-bold">Match Centre</h1>

      {/* Scoreboard */}
      <div className="card">
        <div className="flex items-center justify-between">
          <div className="flex-1 text-center">
            <p className="text-lg font-bold">Man United</p>
            <p className="text-5xl font-mono font-bold mt-2">{match.home_score}</p>
          </div>
          <div className="text-center px-8">
            <p className="text-white/50 text-sm uppercase tracking-wider">{match.status}</p>
            <p className="text-xl font-mono mt-1">
              {new Date(match.datetime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
          <div className="flex-1 text-center">
            <p className="text-lg font-bold">{match.away_team}</p>
            <p className="text-5xl font-mono font-bold mt-2">{match.away_score}</p>
          </div>
        </div>
        <p className="text-center text-white/50 mt-4">{match.league}</p>
      </div>

      {/* Match Events */}
      {match.events && match.events.length > 0 && (
        <div className="card">
          <h2 className="text-xl font-bold mb-4">Match Events</h2>
          <div className="space-y-3">
            {match.events.map((event) => (
              <div
                key={event.id}
                className="flex items-center gap-4 py-2 border-b border-white/5 last:border-0"
              >
                <span className="font-mono text-[#FBE122] w-12">{event.minute}'</span>
                <span className={`w-2 h-2 rounded-full ${event.team === 'home' ? 'bg-[#DA291C]' : 'bg-white/30'}`} />
                <span className="flex-1">
                  <span className="font-medium">{event.player}</span>
                  {event.assist && <span className="text-white/50"> (assist: {event.assist})</span>}
                </span>
                <span className="text-white/50 capitalize">{event.type}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
