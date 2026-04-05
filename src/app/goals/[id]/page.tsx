'use client';

import { use } from 'react';
import Link from 'next/link';
import { getGoalById, goals } from '@/lib/goals';

export default function GoalDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const goal = getGoalById(id);

  if (!goal) {
    return (
      <div className="text-center py-20">
        <h1 className="text-2xl font-bold mb-4">Goal not found</h1>
        <Link href="/goals" className="text-[#DA291C] hover:underline">
          Back to Goals Archive
        </Link>
      </div>
    );
  }

  const relatedGoals = goals
    .filter(g => g.scorer && g.id !== goal.id && (
      g.scorer === goal.scorer ||
      g.opponent === goal.opponent ||
      g.goal_type === goal.goal_type
    ))
    .slice(0, 3);

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Back Link */}
      <Link href="/goals" className="text-white/50 hover:text-white inline-flex items-center gap-2">
        ← Back to Goals
      </Link>

      {/* Video */}
      {goal.youtube_url && (
        <div className="aspect-video bg-black rounded-xl overflow-hidden">
          <iframe
            src={goal.youtube_url.replace('watch?v=', 'embed/')}
            className="w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      )}

      {/* Main Info */}
      <div className="card">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-4xl font-bold mb-2">{goal.scorer}</h1>
            <p className="text-xl text-white/70">{goal.opponent} • {goal.date}</p>
          </div>
          <div className="text-right">
            <p className="text-4xl font-bold text-[#FBE122]">{goal.score}</p>
            <p className="text-white/50">{goal.competition}</p>
          </div>
        </div>

        {/* Match Details */}
        <div className="grid md:grid-cols-3 gap-6 py-6 border-t border-b border-white/10">
          <div>
            <p className="text-white/50 text-sm">Minute</p>
            <p className="text-2xl font-mono font-bold">{goal.minute}'</p>
          </div>
          <div>
            <p className="text-white/50 text-sm">Goal Type</p>
            <p className="text-2xl font-bold capitalize">{goal.goal_type?.replace(/_/g, ' ')}</p>
          </div>
          <div>
            <p className="text-white/50 text-sm">Body Part</p>
            <p className="text-2xl font-bold capitalize">{goal.body_part?.replace(/_/g, ' ')}</p>
          </div>
        </div>

        {/* Assist */}
        {goal.assister && (
          <div className="py-4">
            <p className="text-white/50 text-sm">Assist</p>
            <p className="text-xl font-bold">{goal.assister}</p>
          </div>
        )}

        {/* Location */}
        {goal.pitch_location && (
          <div className="py-4">
            <p className="text-white/50 text-sm">Pitch Location</p>
            <p className="text-xl font-bold capitalize">{goal.pitch_location.replace(/_/g, ' ')}</p>
          </div>
        )}

        {/* Notes */}
        {goal.notes && (
          <div className="py-4 border-t border-white/10">
            <p className="text-white/50 text-sm mb-2">Notes</p>
            <p className="text-lg">{goal.notes}</p>
          </div>
        )}

        {/* Tags */}
        {goal.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-4">
            {goal.tags.map(tag => (
              <span key={tag} className="tag">{tag.replace(/_/g, ' ')}</span>
            ))}
          </div>
        )}
      </div>

      {/* Related Goals */}
      {relatedGoals.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold mb-4">Related Goals</h2>
          <div className="grid md:grid-cols-3 gap-4">
            {relatedGoals.map((g) => (
              <Link
                key={g.id}
                href={`/goals/${g.id}`}
                className="card hover:border-[#DA291C] transition-all"
              >
                <p className="font-bold">{g.scorer}</p>
                <p className="text-white/50 text-sm">{g.opponent} • {g.minute}'</p>
                <p className="text-[#FBE122] font-mono mt-2">{g.score}</p>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
