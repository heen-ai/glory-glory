'use client';

import { MatchStats as MatchStatsType } from '@/lib/fotmob';

interface MatchStatsProps {
  stats: MatchStatsType;
  homeTeamName: string;
  awayTeamName: string;
}

function StatRow({ label, home, away }: { label: string; home: string | number; away: string | number }) {
  const homeNum = typeof home === 'number' ? home : parseFloat(String(home)) || 0;
  const awayNum = typeof away === 'number' ? away : parseFloat(String(away)) || 0;
  const total = homeNum + awayNum;
  const homePct = total > 0 ? (homeNum / total) * 100 : 50;

  const isPossession = label.toLowerCase().includes('poss');

  return (
    <div className="grid grid-cols-[1fr_auto_1fr] gap-3 items-center py-2">
      <div className="text-right">
        <span className="text-sm font-medium">{home}</span>
      </div>
      <div className="text-center w-28">
        <p className="text-xs uppercase tracking-wider text-white/40">{label}</p>
        {/* Bar */}
        {isPossession && (
          <div className="flex h-1 mt-1 overflow-hidden rounded-sm">
            <div className="bg-[#DA291C]" style={{ width: `${homePct}%` }} />
            <div className="bg-white/20 flex-1" />
          </div>
        )}
      </div>
      <div className="text-left">
        <span className="text-sm font-medium">{away}</span>
      </div>
    </div>
  );
}

export default function MatchStats({ stats, homeTeamName, awayTeamName }: MatchStatsProps) {
  return (
    <div className="space-y-1">
      {/* Team names */}
      <div className="grid grid-cols-[1fr_auto_1fr] gap-3 mb-4">
        <div className="text-right text-sm font-medium truncate">{homeTeamName}</div>
        <div className="w-28" />
        <div className="text-left text-sm font-medium truncate">{awayTeamName}</div>
      </div>

      <StatRow label="Possession" home={`${stats.possession.home}%`} away={`${stats.possession.away}%`} />
      <StatRow label="Shots" home={stats.shots.home} away={stats.shots.away} />
      <StatRow label="On Target" home={stats.shotsOnTarget.home} away={stats.shotsOnTarget.away} />
      <StatRow label="Corners" home={stats.corners.home} away={stats.corners.away} />
      <StatRow label="Fouls" home={stats.fouls.home} away={stats.fouls.away} />
      <StatRow label="Yellow Cards" home={stats.yellowCards.home} away={stats.yellowCards.away} />
      <StatRow label="Red Cards" home={stats.redCards.home} away={stats.redCards.away} />

      {stats.xg && (
        <StatRow label="xG" home={stats.xg.home.toFixed(2)} away={stats.xg.away.toFixed(2)} />
      )}
    </div>
  );
}
