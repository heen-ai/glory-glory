'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { goals, getScorers, getGoalTypes, getTags, Goal } from '@/lib/goals';

export default function GoalsPage() {
  const [view, setView] = useState<'table' | 'gallery'>('table');
  const [scorerFilter, setScorerFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [tagFilter, setTagFilter] = useState('');

  const filteredGoals = useMemo(() => {
    return goals.filter(g => {
      if (scorerFilter && !g.scorer?.toLowerCase().includes(scorerFilter.toLowerCase())) return false;
      if (typeFilter && g.goal_type !== typeFilter) return false;
      if (tagFilter && !g.tags.includes(tagFilter)) return false;
      return true;
    });
  }, [scorerFilter, typeFilter, tagFilter]);

  const scorers = getScorers();
  const goalTypes = getGoalTypes();
  const tags = getTags();

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Goals Archive</h1>
          <p className="text-white/50 mt-1">{filteredGoals.filter(g => g.scorer).length} goals this season</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setView('table')}
            className={`px-4 py-2  font-medium transition-colors ${view === 'table' ? 'bg-[#DA291C] text-white' : 'bg-white/10 text-white/70'}`}
          >
            Table
          </button>
          <button
            onClick={() => setView('gallery')}
            className={`px-4 py-2  font-medium transition-colors ${view === 'gallery' ? 'bg-[#DA291C] text-white' : 'bg-white/10 text-white/70'}`}
          >
            Gallery
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <select
          value={scorerFilter}
          onChange={(e) => setScorerFilter(e.target.value)}
          className="bg-white/10 border border-white/20  px-4 py-2 text-white"
        >
          <option value="">All Scorers</option>
          {scorers.map(s => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="bg-white/10 border border-white/20  px-4 py-2 text-white"
        >
          <option value="">All Types</option>
          {goalTypes.map(t => (
            <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>
          ))}
        </select>
        <select
          value={tagFilter}
          onChange={(e) => setTagFilter(e.target.value)}
          className="bg-white/10 border border-white/20  px-4 py-2 text-white"
        >
          <option value="">All Tags</option>
          {tags.map(t => (
            <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>
          ))}
        </select>
        {(scorerFilter || typeFilter || tagFilter) && (
          <button
            onClick={() => { setScorerFilter(''); setTypeFilter(''); setTagFilter(''); }}
            className="text-[#DA291C] hover:underline px-4 py-2"
          >
            Clear filters
          </button>
        )}
      </div>

      {/* Table View */}
      {view === 'table' && (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10 text-left">
                <th className="py-3 px-4 text-white/50 font-medium">Date</th>
                <th className="py-3 px-4 text-white/50 font-medium">Opponent</th>
                <th className="py-3 px-4 text-white/50 font-medium">Scorer</th>
                <th className="py-3 px-4 text-white/50 font-medium">Min</th>
                <th className="py-3 px-4 text-white/50 font-medium">Type</th>
                <th className="py-3 px-4 text-white/50 font-medium">Score</th>
                <th className="py-3 px-4 text-white/50 font-medium">Tags</th>
              </tr>
            </thead>
            <tbody>
              {filteredGoals.filter(g => g.scorer).map((goal) => (
                <tr
                  key={goal.id}
                  className="border-b border-white/5 hover:bg-white/5 transition-colors"
                >
                  <td className="py-3 px-4">{goal.date}</td>
                  <td className="py-3 px-4">{goal.opponent}</td>
                  <td className="py-3 px-4">
                    <Link href={`/goals/${goal.id}`} className="text-[#DA291C] hover:underline font-medium">
                      {goal.scorer}
                    </Link>
                  </td>
                  <td className="py-3 px-4 font-mono">{goal.minute}'</td>
                  <td className="py-3 px-4 capitalize">{goal.goal_type?.replace(/_/g, ' ')}</td>
                  <td className="py-3 px-4 font-mono text-[#FBE122]">{goal.score}</td>
                  <td className="py-3 px-4">
                    <div className="flex flex-wrap gap-1">
                      {goal.tags.slice(0, 2).map(tag => (
                        <span key={tag} className="tag text-xs">{tag.replace(/_/g, ' ')}</span>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Gallery View */}
      {view === 'gallery' && (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredGoals.filter(g => g.scorer).map((goal) => (
            <Link
              key={goal.id}
              href={`/goals/${goal.id}`}
              className="border border-white/10 hover:border-[#DA291C] transition-all group"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="font-bold text-xl">{goal.scorer}</p>
                  <p className="text-white/50">{goal.opponent} • {goal.minute}'</p>
                </div>
                <span className="text-[#FBE122] font-mono text-lg">{goal.score}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-white/50 mb-3">
                <span className="capitalize">{goal.goal_type?.replace(/_/g, ' ')}</span>
                {goal.assister && <span>• Assist: {goal.assister}</span>}
              </div>
              <div className="flex flex-wrap gap-2">
                {goal.tags.map(tag => (
                  <span key={tag} className="tag">{tag.replace(/_/g, ' ')}</span>
                ))}
              </div>
              {goal.youtube_url && (
                <div className="mt-3 text-[#DA291C] text-sm group-hover:underline">
                  Watch video →
                </div>
              )}
            </Link>
          ))}
        </div>
      )}

      {filteredGoals.filter(g => g.scorer).length === 0 && (
        <div className="text-center py-12 text-white/50">
          No goals match your filters. Try adjusting your search.
        </div>
      )}
    </div>
  );
}
