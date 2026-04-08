'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import ShotMap from '@/components/ShotMap';
import EventTimeline from '@/components/EventTimeline';
import MatchStats from '@/components/MatchStats';
import { MatchDetails } from '@/lib/fotmob';
import { MatchDetail as SportSrcMatch } from '@/lib/sportsrc';

type Tab = 'events' | 'stats' | 'shots' | 'watch';

export default function MatchDetailPage() {
  const params = useParams();
  const matchId = params.id as string;
  
  const [match, setMatch] = useState<MatchDetails | null>(null);
  const [stream, setStream] = useState<SportSrcMatch | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>('events');

  useEffect(() => {
    if (!matchId) return;
    
    async function fetchData() {
      try {
        const res = await fetch(`/api/matches?matchId=${matchId}`);
        const data = await res.json();
        
        if (data.match) {
          setMatch(data.match);
          setStream(data.stream || null);
        } else {
          setError('Match not found');
        }
      } catch (err) {
        setError('Failed to load match');
      } finally {
        setLoading(false);
      }
    }
    
    fetchData();
  }, [matchId]);

  if (loading) {
    return (
      <div className="flex items-center gap-1.5 py-16">
        <div className="w-1 h-1 bg-white/40 rounded-full animate-pulse" />
        <div className="w-1 h-1 bg-white/40 rounded-full animate-pulse" style={{ animationDelay: '150ms' }} />
        <div className="w-1 h-1 bg-white/40 rounded-full animate-pulse" style={{ animationDelay: '300ms' }} />
      </div>
    );
  }

  if (error || !match) {
    return (
      <div className="space-y-6">
        <Link href="/matches" className="text-xs text-white/40 hover:text-white/70">
          ← Back to Matches
        </Link>
        <div className="border border-white/10 px-5 py-8 text-center">
          <p className="text-sm text-white/40">{error || 'Match not found'}</p>
        </div>
      </div>
    );
  }

  const tabs: { id: Tab; label: string }[] = [
    { id: 'events', label: 'Events' },
    { id: 'stats', label: 'Stats' },
    { id: 'shots', label: 'Shot Map' },
    { id: 'watch', label: 'Watch' },
  ];

  const homeTeamId = match.homeTeam.id;
  const isManUtdHome = String(homeTeamId) === '10260';
  const displayHome = isManUtdHome ? match.homeTeam : match.awayTeam;
  const displayAway = isManUtdHome ? match.awayTeam : match.homeTeam;
  const displayHomeScore = isManUtdHome ? match.homeScore : match.awayScore;
  const displayAwayScore = isManUtdHome ? match.awayScore : match.homeScore;
  const shotsTeamId = isManUtdHome ? match.homeTeam.id : match.awayTeam.id;

  const hasStream = stream?.sources && stream.sources.length > 0;
  const embedUrl = stream?.sources?.[0]?.embedUrl;

  return (
    <div className="space-y-6">
      {/* Back */}
      <Link href="/matches" className="text-xs text-white/40 hover:text-white/70">
        ← Back
      </Link>

      {/* Match Header */}
      <div className="border border-white/10">
        {/* Score */}
        <div className="px-5 py-5">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-white/60">{displayHome.name}</p>
              <p className="text-[2.5rem] font-mono font-bold leading-none mt-1">{displayHomeScore}</p>
            </div>
            <div className="text-center px-4">
              <p className="text-[10px] text-white/30 leading-tight">
                {match.status.scoreStr || ''}
                {match.status.utcTime && (
                  <>
                    <br />
                    {new Date(match.status.utcTime).toLocaleDateString('en-GB', {
                      day: 'numeric', month: 'short',
                    })}
                  </>
                )}
              </p>
            </div>
            <div className="flex-1 text-right">
              <p className="text-sm font-medium text-white/60">{displayAway.name}</p>
              <p className="text-[2.5rem] font-mono font-bold leading-none mt-1">{displayAwayScore}</p>
            </div>
          </div>
        </div>

        {/* xG */}
        {match.stats.xg && (
          <div className="border-t border-white/8 px-5 py-3">
            <div className="flex items-center gap-3">
              <span className="text-[11px] text-white/35 w-10 text-right font-mono">
                {match.stats.xg.home.toFixed(2)}
              </span>
              <div className="flex-1 flex h-[3px]">
                <div
                  className="bg-[#DA291C]"
                  style={{
                    width: `${(match.stats.xg!.home / (match.stats.xg!.home + match.stats.xg!.away)) * 100}%`,
                  }}
                />
                <div className="bg-white/10 flex-1" />
              </div>
              <span className="text-[11px] text-white/35 w-10 font-mono">
                {match.stats.xg.away.toFixed(2)}
              </span>
            </div>
            <p className="text-[9px] text-white/20 text-center mt-1 uppercase tracking-wider">xG</p>
          </div>
        )}

        {/* Tabs */}
        <div className="border-t border-white/8 flex">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-3 text-[13px] font-medium transition-colors border-b-2 ${
                activeTab === tab.id
                  ? 'border-[#DA291C] text-white'
                  : 'border-transparent text-white/35 hover:text-white/60'
              }`}
            >
              {tab.label}
              {tab.id === 'watch' && hasStream && (
                <span className="ml-1.5 w-1.5 h-1.5 bg-[#DA291C] inline-block rounded-full" />
              )}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="px-5 py-5">
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
          {activeTab === 'watch' && (
            <WatchTab stream={stream} />
          )}
        </div>
      </div>
    </div>
  );
}

function WatchTab({ stream }: { stream: SportSrcMatch | null }) {
  const hasStream = stream?.sources && stream.sources.length > 0;
  const embedUrl = stream?.sources?.[0]?.embedUrl;
  
  if (!hasStream || !embedUrl) {
    return (
      <div className="space-y-4">
        <div className="border border-white/10 px-5 py-8 text-center">
          <p className="text-sm text-white/50">Stream not yet available</p>
          <p className="text-xs text-white/30 mt-1">
            Streams are typically available closer to kickoff
          </p>
        </div>
        <div className="text-center">
          <a
            href={`https://sport99.live`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-[#DA291C] hover:underline"
          >
            Watch on SportSRC →
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Source info */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-white/50">
            {stream.sources[0].title || stream.sources[0].source}
            {stream.sources[0].hd && <span className="ml-2 text-[#DA291C]">HD</span>}
          </p>
        </div>
        <a
          href={`https://sport99.live`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-white/30 hover:text-white/60"
        >
          SportSRC →
        </a>
      </div>
      
      {/* Stream embed */}
      <div className="relative w-full" style={{ paddingTop: '56.25%' }}>
        <iframe
          src={embedUrl}
          className="absolute inset-0 w-full h-full border-0"
          allowFullScreen
          allow="autoplay; fullscreen"
          scrolling="no"
        />
      </div>
      
      {/* Disclaimer */}
      <p className="text-[10px] text-white/20 text-center">
        Stream provided by SportSRC. External content.
      </p>
    </div>
  );
}
