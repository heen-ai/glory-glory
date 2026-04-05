'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { goals } from '@/lib/goals';

function getTimeUntilMatch(): string {
  // Placeholder - would connect to SportSRC API for real data
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const now = new Date();
  const dayName = days[now.getDay()];
  return `${dayName} ${now.toLocaleDateString()}`;
}

export default function Home() {
  const [time, setTime] = useState('');
  const goalsThisSeason = goals.filter(g => g.scorer).length;
  const wins = goals.filter(g => g.tags.includes('important_goal') || g.tags.includes('last_minute_winner')).length;

  useEffect(() => {
    setTime(getTimeUntilMatch());
    const interval = setInterval(() => setTime(getTimeUntilMatch()), 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-12">
      {/* Hero */}
      <section className="text-center py-12">
        <h1 className="text-5xl md:text-6xl font-bold mb-4">
          <span className="text-[#DA291C]">Glory Glory</span> Man United
        </h1>
        <p className="text-xl text-white/70 max-w-2xl mx-auto">
          The smartest person in the pub, in your pocket. AI-powered match companion for the modern fan.
        </p>
      </section>

      {/* Next Match Card */}
      <section className="card text-center py-12">
        <p className="text-white/50 uppercase tracking-wider text-sm mb-2">Next Match</p>
        <h2 className="text-3xl font-bold mb-2">Manchester United</h2>
        <p className="text-xl text-white/70 mb-4">vs Opponent TBC</p>
        <p className="text-2xl font-mono text-[#FBE122]">{time || 'Loading...'}</p>
        <p className="text-white/50 mt-2">Connect to live data for real match info</p>
      </section>

      {/* Stats Grid */}
      <section className="grid md:grid-cols-3 gap-6">
        <div className="card text-center">
          <p className="text-5xl font-bold text-[#DA291C]">{goalsThisSeason}</p>
          <p className="text-white/50 mt-2">Goals This Season</p>
        </div>
        <div className="card text-center">
          <p className="text-5xl font-bold text-[#DA291C]">{wins}</p>
          <p className="text-white/50 mt-2">Match-Winning Goals</p>
        </div>
        <div className="card text-center">
          <p className="text-5xl font-bold text-[#DA291C]">20</p>
          <p className="text-white/50 mt-2">Games Played</p>
        </div>
      </section>

      {/* Quick Actions */}
      <section className="grid md:grid-cols-2 gap-6">
        <Link href="/goals" className="card group hover:border-[#DA291C] transition-all">
          <h3 className="text-2xl font-bold mb-2 group-hover:text-[#DA291C] transition-colors">
            Browse Goals Archive
          </h3>
          <p className="text-white/50">
            Every goal tagged and searchable. Find that strike you're looking for.
          </p>
        </Link>
        <Link href="/chat" className="card group hover:border-[#DA291C] transition-all">
          <h3 className="text-2xl font-bold mb-2 group-hover:text-[#DA291C] transition-colors">
            Ask Glory Glory
          </h3>
          <p className="text-white/50">
            "Show me all Rashford volleys at Old Trafford" — just like that.
          </p>
        </Link>
      </section>

      {/* Recent Goals */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Recent Goals</h2>
          <Link href="/goals" className="text-[#DA291C] hover:underline">
            View all →
          </Link>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {goals.slice(0, 6).filter(g => g.scorer).map((goal) => (
            <Link
              key={goal.id}
              href={`/goals/${goal.id}`}
              className="card hover:border-[#DA291C] transition-all group"
            >
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="font-bold text-lg">{goal.scorer}</p>
                  <p className="text-white/50 text-sm">{goal.opponent} • {goal.minute}'</p>
                </div>
                <span className="text-[#FBE122] font-mono">{goal.score}</span>
              </div>
              <div className="flex flex-wrap gap-2 mt-3">
                {goal.tags.slice(0, 2).map(tag => (
                  <span key={tag} className="tag">{tag.replace(/_/g, ' ')}</span>
                ))}
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
