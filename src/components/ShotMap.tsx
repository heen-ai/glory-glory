'use client';

import { Shot } from '@/lib/fotmob';

interface ShotMapProps {
  shots: Shot[];
  homeTeamId: string;
}

export default function ShotMap({ shots, homeTeamId }: ShotMapProps) {
  if (shots.length === 0) {
    return (
      <div className="border border-white/10 p-6 text-center">
        <p className="text-white/40 text-sm">Shot map not available</p>
      </div>
    );
  }

  // SVG pitch dimensions (standard ratio: 105 x 68)
  const PITCH_W = 520;
  const PITCH_H = 360;
  const HOME_IS_LEFT = true; // United playing left to right

  // Normalize coordinates (FotMob uses 0-100 for both axes)
  function normalizeX(x: number, isHome: boolean): number {
    // FotMob: 0 = left side of pitch (home team goal)
    // We want home team shooting at right goal
    if (HOME_IS_LEFT) {
      return isHome ? (x / 100) * PITCH_W : PITCH_W - (x / 100) * PITCH_W;
    }
    return (x / 100) * PITCH_W;
  }

  function normalizeY(y: number): number {
    // FotMob: 0 = top, 100 = bottom
    // SVG: 0 = top, H = bottom
    return (y / 100) * PITCH_H;
  }

  // Goal line is at x=100 in FotMob coords for away team
  // Penalty spot at x=83 for away team

  function getDotColor(shot: Shot): string {
    if (shot.goal) return '#DA291C';
    if (shot.saved || shot.missed || shot.blocked || shot.offside) return '#FBE122';
    if (shot.hitWoodwork) return '#FBE122';
    return 'rgba(255,255,255,0.3)';
  }

  function getDotSize(xg: number): number {
    // Size based on xG: 0.1 = small, 1.0 = large
    return 6 + xg * 12;
  }

  const homeShots = shots.filter(s => String(s.teamId) === homeTeamId);
  const awayShots = shots.filter(s => String(s.teamId) !== homeTeamId);

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm uppercase tracking-wider text-white/40">Shot Map</h3>
        <div className="flex gap-4 text-xs text-white/50">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-[#DA291C]"></span>
            Goal
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-[#FBE122]"></span>
            Missed
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-white/30"></span>
            Other
          </span>
        </div>
      </div>
      
      {/* Pitch SVG */}
      <div className="relative border border-white/20" style={{ width: PITCH_W, maxWidth: '100%', aspectRatio: '105/68' }}>
        <svg
          viewBox={`0 0 ${PITCH_W} ${PITCH_H}`}
          className="w-full h-full"
          preserveAspectRatio="xMidYMid meet"
        >
          {/* Pitch background */}
          <rect x="0" y="0" width={PITCH_W} height={PITCH_H} fill="#0B0523" />
          
          {/* Pitch markings */}
          {/* Outer line */}
          <rect x="2" y="2" width={PITCH_W - 4} height={PITCH_H - 4} fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="1" />
          
          {/* Center line */}
          <line x1={PITCH_W / 2} y1="2" x2={PITCH_W / 2} y2={PITCH_H - 2} stroke="rgba(255,255,255,0.25)" strokeWidth="1" />
          
          {/* Center circle */}
          <circle cx={PITCH_W / 2} cy={PITCH_H / 2} r={PITCH_H * 0.15} fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="1" />
          <circle cx={PITCH_W / 2} cy={PITCH_H / 2} r="2" fill="rgba(255,255,255,0.25)" />
          
          {/* Left penalty area */}
          <rect x="2" y={PITCH_H * 0.2} width={PITCH_W * 0.16} height={PITCH_H * 0.6} fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="1" />
          
          {/* Right penalty area */}
          <rect x={PITCH_W - 2 - PITCH_W * 0.16} y={PITCH_H * 0.2} width={PITCH_W * 0.16} height={PITCH_H * 0.6} fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="1" />
          
          {/* Goals */}
          <rect x="0" y={PITCH_H * 0.35} width="2" height={PITCH_H * 0.3} fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="1" />
          <rect x={PITCH_W - 2} y={PITCH_H * 0.35} width="2" height={PITCH_H * 0.3} fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="1" />
          
          {/* Home shots (Man Utd) */}
          {homeShots.map((shot) => {
            const cx = normalizeX(shot.x, true);
            const cy = normalizeY(shot.y);
            const r = getDotSize(shot.expectedGoals);
            return (
              <g key={shot.id}>
                <circle
                  cx={cx}
                  cy={cy}
                  r={r}
                  fill={getDotColor(shot)}
                  opacity="0.9"
                  stroke={shot.goal ? '#fff' : 'none'}
                  strokeWidth={shot.goal ? 1 : 0}
                />
                {shot.goal && (
                  <circle cx={cx} cy={cy} r={r * 1.5} fill="none" stroke="#DA291C" strokeWidth="1" opacity="0.4" />
                )}
              </g>
            );
          })}
          
          {/* Away shots */}
          {awayShots.map((shot) => {
            const cx = normalizeX(shot.x, false);
            const cy = normalizeY(shot.y);
            const r = getDotSize(shot.expectedGoals);
            return (
              <circle
                key={shot.id}
                cx={cx}
                cy={cy}
                r={r}
                fill={getDotColor(shot)}
                opacity="0.7"
                stroke="none"
              />
            );
          })}
        </svg>
      </div>
      
      {/* Legend */}
      <div className="flex justify-between text-xs text-white/40 mt-2 px-1">
        <span>Man Utd</span>
        <span>Opposition</span>
      </div>
    </div>
  );
}
