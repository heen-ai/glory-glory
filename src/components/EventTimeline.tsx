'use client';

import { MatchEvent } from '@/lib/fotmob';

interface EventTimelineProps {
  events: MatchEvent[];
  homeTeamId: string;
}

function getEventIcon(type: string): string {
  switch (type) {
    case 'goal': return '⚽';
    case 'card_yellow': return '🟨';
    case 'card_red': return '🟥';
    case 'sub': return '🔄';
    case 'var': return '📺';
    case 'penalty': return '⚽';
    case 'missed_penalty': return '❌';
    case 'halftime': return '⸺';
    case 'fulltime': return '✓';
    default: return '•';
  }
}

function getEventColor(type: string, team: string, homeTeamId: string): string {
  const isHome = team === homeTeamId;
  
  switch (type) {
    case 'goal': return isHome ? 'text-[#DA291C]' : 'text-white/60';
    case 'card_yellow': return 'text-yellow-400';
    case 'card_red': return 'text-red-500';
    default: return 'text-white/60';
  }
}

export default function EventTimeline({ events, homeTeamId }: EventTimelineProps) {
  if (events.length === 0) {
    return (
      <div className="py-4 text-center text-white/30 text-sm">
        No events available
      </div>
    );
  }

  return (
    <div className="space-y-0">
      {events.map((event) => (
        <div
          key={event.id}
          className="flex items-start gap-3 py-3 border-b border-white/5 last:border-0"
        >
          {/* Minute */}
          <div className="w-10 text-right shrink-0">
            <span className="font-mono text-sm font-medium text-white/50">
              {event.minute || 0}'
            </span>
          </div>

          {/* Icon */}
          <div className="w-6 text-center shrink-0 text-base">
            {getEventIcon(event.type)}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <p className={`text-sm leading-snug ${getEventColor(event.type, '', homeTeamId)}`}>
              {event.player?.name || event.text || event.type}
            </p>
            {event.assist?.name && (
              <p className="text-xs text-white/30 mt-0.5">
                Assist: {event.assist.name}
              </p>
            )}
            {event.homeScore !== undefined && event.awayScore !== undefined && (
              <p className="text-xs text-white/30 mt-0.5">
                {event.homeScore} – {event.awayScore}
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
