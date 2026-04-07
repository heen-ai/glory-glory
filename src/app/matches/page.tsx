'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { FixtureMatch, LeagueTableEntry } from '@/lib/fotmob';

interface MatchResponse {
  current: FixtureMatch | null;
  next: FixtureMatch | null;
  last: FixtureMatch | null;
  table: LeagueTableEntry | null;
  fullTable: { all: LeagueTableEntry[] } | null;
}

function isManUtdHome(match: FixtureMatch): boolean {
  return match.home.id === '10260';
}

function getMatchDisplay(match: FixtureMatch) {
  const isHome = isManUtdHome(match);
  const scoreParts = (match.status.scoreStr || '').split(' - ');
  return {
    home: isHome ? 'Man United' : match.away.name,
    away: isHome ? match.away.name : 'Man United',
    homeScore: isHome ? scoreParts[0] : scoreParts[1] || '0',
    awayScore: isHome ? scoreParts[1] || '0' : scoreParts[0],
  };
}

function formatDate(utcTime: string): string {
  const d = new Date(utcTime);
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

function formatTime(utcTime: string): string {
  const d = new Date(utcTime);
  return d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
}

export default function MatchesPage() {
  const [data, setData] = useState<MatchResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  async function fetchData() {
    try {
      const response = await fetch('/api/matches');
      const result = await response.json();
      setData(result);
      setLastUpdate(new Date());
    } catch (err) {
      console.error('Failed to fetch:', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 60000);
    return () => clearInterval(interval);
  }, []);

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

  const last = data?.last;
  const next = data?.next;
  const table = data?.table;
  const fullTable = data?.fullTable?.all?.slice(0, 8) || [];
  const lastDisplay = last ? getMatchDisplay(last) : null;
  const nextDisplay = next ? getMatchDisplay(next) : null;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Match Centre</h1>
        {lastUpdate && (
          <p className="text-white/30 text-sm mt-1">
            Updated {lastUpdate.toLocaleTimeString()}
          </p>
        )}
      </div>

      {/* Last Result */}
      {lastDisplay && last && (
        <div>
          <p className="text-xs uppercase tracking-wider text-white/40 mb-3">Last Result</p>
          <div className="border border-white/10">
            <div className="p-5">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="font-medium">{lastDisplay.home}</p>
                  <p className="text-3xl font-mono font-bold mt-1">{lastDisplay.homeScore}</p>
                </div>
                <div className="text-center px-4">
                  <span className="text-xs text-white/40">{formatDate(last.status.utcTime)}</span>
                </div>
                <div className="flex-1 text-right">
                  <p className="font-medium">{lastDisplay.away}</p>
                  <p className="text-3xl font-mono font-bold mt-1">{lastDisplay.awayScore}</p>
                </div>
              </div>
            </div>
            <div className="border-t border-white/10">
              <Link
                href={`/matches/${last.id}`}
                className="block px-5 py-3 text-sm text-[#DA291C] hover:bg-white/5 transition-colors"
              >
                View details →
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Next Match */}
      {nextDisplay && next && (
        <div>
          <p className="text-xs uppercase tracking-wider text-white/40 mb-3">Next Match</p>
          <div className="border border-[#DA291C]/30 bg-[#DA291C]/5">
            <div className="p-5">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="font-medium">{nextDisplay.home}</p>
                </div>
                <div className="text-center px-4">
                  <span className="text-xs text-white/40">vs</span>
                </div>
                <div className="flex-1 text-right">
                  <p className="font-medium">{nextDisplay.away}</p>
                </div>
              </div>
              <p className="text-center text-sm text-white/50 mt-2">
                {formatDate(next.status.utcTime)} · {formatTime(next.status.utcTime)}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* League Table */}
      {table && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs uppercase tracking-wider text-white/40">Premier League</p>
            <span className="text-xs text-[#DA291C]">
              #{table.idx} · {table.pts} pts
            </span>
          </div>
          <div className="border border-white/10 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10 text-left text-xs uppercase tracking-wider text-white/40">
                  <th className="py-2 px-3 w-8">#</th>
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
                {fullTable.map((entry) => (
                  <tr
                    key={entry.id}
                    className={`border-b border-white/5 ${
                      entry.id === '10260' ? 'bg-[#DA291C]/10' : ''
                    }`}
                  >
                    <td className="py-2 px-3 text-white/50">{entry.idx}</td>
                    <td className="py-2 px-3 font-medium">{entry.shortName || entry.name}</td>
                    <td className="py-2 px-3 text-center text-white/70">{entry.played}</td>
                    <td className="py-2 px-3 text-center text-white/70">{entry.wins}</td>
                    <td className="py-2 px-3 text-center text-white/70">{entry.draws}</td>
                    <td className="py-2 px-3 text-center text-white/70">{entry.losses}</td>
                    <td className={`py-2 px-3 text-center ${
                      entry.goalConDiff > 0 ? 'text-green-400' : entry.goalConDiff < 0 ? 'text-red-400' : 'text-white/70'
                    }`}>
                      {entry.goalConDiff > 0 ? '+' : ''}{entry.goalConDiff}
                    </td>
                    <td className={`py-2 px-3 text-right font-medium ${entry.id === '10260' ? 'text-[#DA291C]' : ''}`}>
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
