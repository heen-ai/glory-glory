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
  return new Date(utcTime).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

function formatTime(utcTime: string): string {
  return new Date(utcTime).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
}

export default function MatchesPage() {
  const [data, setData] = useState<MatchResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch('/api/matches');
        setData(await response.json());
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
    const interval = setInterval(fetchData, 60000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center gap-1.5 py-16">
        <div className="w-1 h-1 bg-white/40 rounded-full animate-pulse" />
        <div className="w-1 h-1 bg-white/40 rounded-full animate-pulse" style={{ animationDelay: '150ms' }} />
        <div className="w-1 h-1 bg-white/40 rounded-full animate-pulse" style={{ animationDelay: '300ms' }} />
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
    <div className="space-y-10">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Match Centre</h1>
      </div>

      {/* Last Result */}
      {lastDisplay && last && (
        <section>
          <p className="text-[10px] uppercase tracking-[0.15em] text-white/35 mb-3">Last Result</p>
          <div className="border border-white/10">
            <div className="px-5 py-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-white/70">{lastDisplay.home}</p>
                  <p className="text-[2rem] font-mono font-bold mt-0.5 leading-none">{lastDisplay.homeScore}</p>
                </div>
                <div className="text-center px-4">
                  <p className="text-[10px] text-white/30">{formatDate(last.status.utcTime)}</p>
                </div>
                <div className="flex-1 text-right">
                  <p className="text-sm font-medium text-white/70">{lastDisplay.away}</p>
                  <p className="text-[2rem] font-mono font-bold mt-0.5 leading-none">{lastDisplay.awayScore}</p>
                </div>
              </div>
            </div>
            <Link
              href={`/matches/${last.id}`}
              className="block px-5 py-2.5 text-xs text-[#DA291C] border-t border-white/5 hover:bg-white/5 transition-colors"
            >
              View details →
            </Link>
          </div>
        </section>
      )}

      {/* Next Match */}
      {nextDisplay && next && (
        <section>
          <p className="text-[10px] uppercase tracking-[0.15em] text-white/35 mb-3">Next Match</p>
          <div className="border border-[#DA291C]/25 bg-[#DA291C]/[0.03] px-5 py-4">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium">{nextDisplay.home}</p>
              </div>
              <div className="text-center px-3">
                <p className="text-[10px] text-white/30">vs</p>
              </div>
              <div className="flex-1 text-right">
                <p className="text-sm font-medium">{nextDisplay.away}</p>
              </div>
            </div>
            <p className="text-xs text-white/40 mt-2 text-center">
              {formatDate(next.status.utcTime)} · {formatTime(next.status.utcTime)}
            </p>
          </div>
        </section>
      )}

      {/* League Table */}
      {table && (
        <section>
          <div className="flex items-center justify-between mb-3">
            <p className="text-[10px] uppercase tracking-[0.15em] text-white/35">Premier League</p>
            <span className="text-[10px] text-[#DA291C]">#{table.idx} · {table.pts} pts</span>
          </div>
          <div className="border border-white/10">
            <table className="w-full text-[13px]">
              <thead>
                <tr className="border-b border-white/8 text-[10px] uppercase tracking-[0.1em] text-white/30">
                  <th className="py-2.5 px-3 font-normal text-left w-6">#</th>
                  <th className="py-2.5 px-3 font-normal text-left">Team</th>
                  <th className="py-2.5 px-3 font-normal text-center w-8">P</th>
                  <th className="py-2.5 px-3 font-normal text-center w-8">W</th>
                  <th className="py-2.5 px-3 font-normal text-center w-8">D</th>
                  <th className="py-2.5 px-3 font-normal text-center w-8">L</th>
                  <th className="py-2.5 px-3 font-normal text-center w-8">GD</th>
                  <th className="py-2.5 px-3 font-normal text-right w-8">Pts</th>
                </tr>
              </thead>
              <tbody>
                {fullTable.map((entry) => (
                  <tr
                    key={entry.id}
                    className={`border-b border-white/5 last:border-0 ${
                      entry.id === '10260' ? 'bg-[#DA291C]/8' : ''
                    }`}
                  >
                    <td className="py-2 px-3 text-white/35">{entry.idx}</td>
                    <td className="py-2 px-3 font-medium">{entry.shortName || entry.name}</td>
                    <td className="py-2 px-3 text-center text-white/50">{entry.played}</td>
                    <td className="py-2 px-3 text-center text-white/50">{entry.wins}</td>
                    <td className="py-2 px-3 text-center text-white/50">{entry.draws}</td>
                    <td className="py-2 px-3 text-center text-white/50">{entry.losses}</td>
                    <td className={`py-2 px-3 text-center ${
                      entry.goalConDiff > 0 ? 'text-green-400/80' : entry.goalConDiff < 0 ? 'text-red-400/80' : 'text-white/50'
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
        </section>
      )}
    </div>
  );
}
