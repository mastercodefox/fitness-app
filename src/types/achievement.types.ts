export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  progress: number;
  maxProgress: number;
  completed: boolean;
  completedAt?: string;
  category: 'strength' | 'consistency' | 'volume' | 'milestone' | 'special';
}

export interface AchievementProgress {
  totalWorkouts: number;
  currentStreak: number;
  maxStreak: number;
  totalVolume: number;
  totalSets: number;
  prs: number;
  deloads: number;
  plateaus: number;
}