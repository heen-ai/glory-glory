import goalsData from '@/data/goals.json';

export interface Goal {
  id: string;
  date: string;
  opponent: string;
  competition: string;
  home_away: 'home' | 'away';
  score: string;
  scorer: string | null;
  assister: string | null;
  minute: number | null;
  goal_type: string | null;
  body_part: string | null;
  pitch_location: string | null;
  tags: string[];
  youtube_url: string | null;
  notes: string;
}

export const goals: Goal[] = goalsData as Goal[];

export function getGoalById(id: string): Goal | undefined {
  return goals.find(g => g.id === id);
}

export function getGoalsByScorer(scorerName: string): Goal[] {
  return goals.filter(g => 
    g.scorer?.toLowerCase().includes(scorerName.toLowerCase())
  );
}

export function getGoalsByType(goalType: string): Goal[] {
  return goals.filter(g => g.goal_type === goalType);
}

export function getGoalsByTag(tag: string): Goal[] {
  return goals.filter(g => g.tags.includes(tag));
}

export function searchGoals(query: string): Goal[] {
  const q = query.toLowerCase();
  return goals.filter(g =>
    g.scorer?.toLowerCase().includes(q) ||
    g.opponent.toLowerCase().includes(q) ||
    g.notes.toLowerCase().includes(q) ||
    g.goal_type?.toLowerCase().includes(q) ||
    g.tags.some(t => t.toLowerCase().includes(q))
  );
}

export function getScorers(): string[] {
  const scorers = new Set(goals.filter(g => g.scorer).map(g => g.scorer!));
  return Array.from(scorers).sort();
}

export function getGoalTypes(): string[] {
  const types = new Set(goals.filter(g => g.goal_type).map(g => g.goal_type!));
  return Array.from(types).sort();
}

export function getTags(): string[] {
  const tags = new Set(goals.flatMap(g => g.tags));
  return Array.from(tags).sort();
}

export function formatGoalsForAI(): string {
  return goals
    .filter(g => g.scorer)
    .map(g => {
      const tags = g.tags.length > 0 ? ` [${g.tags.join(', ')}]` : '';
      const yt = g.youtube_url ? ` | Watch: ${g.youtube_url}` : '';
      return `${g.scorer} vs ${g.opponent} (${g.date}) - ${g.minute}' | ${g.goal_type || 'goal'}${tags}${yt}`;
    })
    .join('\n');
}
