'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import ShotMap from '@/components/ShotMap';
import EventTimeline from '@/components/EventTimeline';
import MatchStats from '@/components/MatchStats';
import { MatchDetails } from '@/lib/fotmob';

type Tab = 'events' | 'stats' | 'shots';

export default function MatchDetailPage() {
  const params = useParams();
  const matchId = params.id as string;
  
  const [match, setMatch] = useState<MatchDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>('events');

  useEffect(() => {
    if (!matchId) return;
    
    async function fetchMatch() {
      try {
        const response = await fetch(`/api/matches?matchId=${matchId}`);
        const data = await response.json();
        if (data.match) {
          setMatch(data.match);
        } else {
          setError('Match not found');
        }
      } catch (err) {
        setError('Failed to load match');
      } finally {
        setLoading(false);
      }
    }
    
    fetchMatch();
  }, [matchId]);

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

  if (error || !match) {
    return (
      <div className="space-y-6">
        <Link href="/matches" className="text-sm text-white/40 hover:text-white">
          ← Back to Matches
        </Link>
        <div className="border border-white/10 p-8 text-center">
          <p className="text-white/50">{error || 'Match not found'}</p>
        </div>
      </div>
    );
  }

  const tabs: { id: Tab; label: string }[] = [
    { id: 'events', label: 'Events' },
    { id: 'stats', label: 'Stats' },
    { id: 'shots', label: 'Shot Map' },
  ];

  const homeTeamId = match.homeTeam.id;
  const isManUtdHome = String(homeTeamId) === '10260';
  const displayHome = isManUtdHome ? match.homeTeam : match.awayTeam;
  const displayAway = isManUtdHome ? match.awayTeam : match.homeTeam;
  const displayHomeScore = isManUtdHome ? match.homeScore : match.awayScore;
  const displayAwayScore = isManUtdHome ? match.awayScore : match.homeScore;

  // Get team ID for shot map
  const shotsTeamId = isManUtdHome ? match.homeTeam.id : match.awayTeam.id;

  return (
    <div className="space-y-6">
      {/* Back link */}
      <Link href="/matches" className="text-sm text-white/40 hover:text-white">
        ← Back
      </Link>

      {/* Match Header */}
      <div className="border border-white/10">
        <div className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-lg font-semibold">{displayHome.name}</p>
              <p className="text-4xl font-mono font-bold mt-1">{displayHomeScore}</p>
            </div>
            <div className="text-center px-6">
              <span className="text-xs font-medium px-2 py-1 bg-white/10 text-white/70">
                {match.status.scoreStr || ''}
              </span>
              {match.status.utcTime && (
                <p className="text-sm text-white/40 mt-2">
                  {new Date(match.status.utcTime).toLocaleDateString('en-GB', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })}
                </p>
              )}
            </div>
            <div className="flex-1 text-right">
              <p className="text-lg font-semibold">{displayAway.name}</p>
              <p className="text-4xl font-mono font-bold mt-1">{displayAwayScore}</p>
            </div>
          </div>
        </div>

        {/* xG bar */}
        {match.stats.xg && (
          <div className="border-t border-white/10 px-6 py-3">
            <div className="flex items-center gap-3">
              <span className="text-xs text-white/40 w-12">{match.stats.xg.home.toFixed(2)} xG</span>
              <div className="flex-1 flex h-1 rounded-sm overflow-hidden">
                <div
                  className="bg-[#DA291C]"
                  style={{
                    width: `${(match.stats.xg!.home / (match.stats.xg!.home + match.stats.xg!.away)) * 100}%`,
                  }}
                />
                <div className="bg-white/20 flex-1" />
              </div>
              <span className="text-xs text-white/40 w-12 text-right">{match.stats.xg.away.toFixed(2)} xG</span>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="border-t border-white/10">
          <div className="flex">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 py-3 text-sm font-medium transition-colors border-b-2 ${
                  activeTab === tab.id
                    ? 'border-[#DA291C] text-white'
                    : 'border-transparent text-white/40 hover:text-white/70'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'events' && (
            <EventTimeline events={match.events} homeTeamId={homeTeamId} />
          )}
          
          {activeTab === 'stats' && (
            <MatchStats
              stats={match.stats}
              homeTeamName={match.homeTeam.name}
              awayTeamName={match.awayTeam.name}
            />
          )}
          
          {activeTab === 'shots' && (
            <ShotMap shots={match.shots} homeTeamId={shotsTeamId} />
          )}
        </div>
      </div>
    </div>
  );
}
