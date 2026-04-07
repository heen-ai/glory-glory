'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface MatchEvent {
  id: string;
  time: number;
  type: string;
  team: 'home' | 'away';
  player?: string;
  assist?: string;
  detail?: string;
}

interface Match {
  matchId: number;
  status: string;
  homeTeam: { name: string; shortName: string };
  awayTeam: { name: string; shortName: string };
  homeScore: number;
  awayScore: number;
  datetime: string;
  league: string;
  events: MatchEvent[];
}

interface TableEntry {
  name: string;
  shortName: string;
  id: number;
  played: number;
  wins: number;
  draws: number;
  losses: number;
  scoresStr: string;
  goalConDiff: number;
  pts: number;
  idx: number;
}

export default function MatchesPage() {
  const [match, setMatch] = useState<Match | null>(null);
  const [table, setTable] = useState<TableEntry[] | null>(null);
  const [manUtd, setManUtd] = useState<TableEntry | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  async function fetchData() {
    try {
      const response = await fetch('/api/matches');
      const data = await response.json();
      
      if (data.match) setMatch(data.match);
      if (data.fullTable?.all) {
        setTable(data.fullTable.all.slice(0, 10)); // Top 10
        setManUtd(data.table);
      }
      setLastUpdate(new Date());
    } catch (err) {
      setError('Failed to load match data');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, []);

  function getStatusLabel(status: string): string {
    if (status?.toLowerCase().includes('live')) return 'LIVE';
    if (status?.toLowerCase().includes('finished')) return 'FT';
    if (status?.toLowerCase().includes('halftime')) return 'HT';
    return status || 'Upcoming';
  }

  function getEventIcon(type: string): string {
    switch (type) {
      case 'goal': return '⚽';
      case 'card': return '🟨';
      case 'sub': return '🔄';
      case 'var': return '📺';
      case 'penalty': return '⚽';
      case 'missed_penalty': return '❌';
      default: return '•';
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex gap-1">
          <div className="w-2 h-2 bg-white/40 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
          <div className="w-2 h-2 bg-white/40 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
          <div className="w-2 h-2 bg-white/40 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Match Centre</h1>
        {lastUpdate && (
          <p className="text-white/40 text-sm mt-1">
            Updated {lastUpdate.toLocaleTimeString()}
          </p>
        )}
      </div>

      {/* Match Card */}
      {match ? (
        <div className="border border-white/10">
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-lg font-semibold">Man United</p>
                <p className="text-4xl font-mono font-bold mt-1">{match.homeScore}</p>
              </div>
              <div className="text-center px-6">
                <span className="text-xs font-medium px-2 py-1 bg-[#DA291C]/20 text-[#DA291C]">
                  {getStatusLabel(match.status)}
                </span>
                <p className="text-sm text-white/50 mt-2">
                  {match.datetime ? new Date(match.datetime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                </p>
              </div>
              <div className="flex-1 text-right">
                <p className="text-lg font-semibold">{match.awayTeam?.name || 'Opponent'}</p>
                <p className="text-4xl font-mono font-bold mt-1">{match.awayScore}</p>
              </div>
            </div>
          </div>
          
          {/* Events */}
          {match.events && match.events.length > 0 && (
            <div className="border-t border-white/10 px-6 py-4">
              <h3 className="text-xs uppercase tracking-wider text-white/40 mb-3">Events</h3>
              <div className="space-y-2">
                {match.events.slice(0, 10).map((event) => (
                  <div key={event.id} className="flex items-center gap-3 text-sm">
                    <span className="font-mono text-[#DA291C] w-8">{event.time}'</span>
                    <span>{getEventIcon(event.type)}</span>
                    <span className={event.team === 'home' ? 'font-medium' : 'text-white/60'}>
                      {event.player || event.type}
                    </span>
                    {event.detail && <span className="text-white/40 text-xs">({event.detail})</span>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="border border-white/10 p-8 text-center">
          <p className="text-white/50">No match data available</p>
          <p className="text-white/30 text-sm mt-1">
            {error || 'No live or upcoming match found'}
          </p>
        </div>
      )}

      {/* League Table */}
      {manUtd && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Premier League</h2>
            <Link href="/table" className="text-sm text-[#DA291C] hover:underline">
              Full Table →
            </Link>
          </div>
          <div className="border border-white/10 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10 text-left text-xs uppercase tracking-wider text-white/40">
                  <th className="py-2 px-3">#</th>
                  <th className="py-2 px-3">Team</th>
                  <th className="py-2 px-3 text-center">P</th>
                  <th className="py-2 px-3 text-center">W</th>
                  <th className="py-2 px-3 text-center">D</th>
                  <th className="py-2 px-3 text-center">L</th>
                  <th className="py-2 px-3 text-center">GD</th>
                  <th className="py-2 px-3 text-right">Pts</th>
                </tr>
              </thead>
              <tbody>
                {table?.map((entry) => (
                  <tr
                    key={entry.id}
                    className={`border-b border-white/5 ${
                      entry.id === 10260 ? 'bg-[#DA291C]/10' : ''
                    }`}
                  >
                    <td className="py-2 px-3 text-white/50">{entry.idx}</td>
                    <td className="py-2 px-3 font-medium">{entry.shortName || entry.name}</td>
                    <td className="py-2 px-3 text-center text-white/70">{entry.played}</td>
                    <td className="py-2 px-3 text-center text-white/70">{entry.wins}</td>
                    <td className="py-2 px-3 text-center text-white/70">{entry.draws}</td>
                    <td className="py-2 px-3 text-center text-white/70">{entry.losses}</td>
                    <td className={`py-2 px-3 text-center ${entry.goalConDiff > 0 ? 'text-green-400' : entry.goalConDiff < 0 ? 'text-red-400' : 'text-white/70'}`}>
                      {entry.goalConDiff > 0 ? '+' : ''}{entry.goalConDiff}
                    </td>
                    <td className={`py-2 px-3 text-right font-medium ${entry.id === 10260 ? 'text-[#DA291C]' : ''}`}>
                      {entry.pts}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
