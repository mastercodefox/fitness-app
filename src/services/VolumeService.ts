export type ExperienceLevel = 'beginner' | 'intermediate' | 'advanced';
export type Goal = 'strength' | 'hypertrophy' | 'endurance';

export class VolumeService {
  
  private static readonly WEEKLY_VOLUME: Record<ExperienceLevel, { min: number; max: number; default: number }> = {
    beginner: { min: 6, max: 10, default: 8 },
    intermediate: { min: 12, max: 20, default: 16 },
    advanced: { min: 15, max: 25, default: 20 }
  };

  private static readonly GOAL_MULTIPLIER: Record<Goal, number> = {
    strength: 0.7,
    hypertrophy: 1.0,
    endurance: 1.2
  };

  // Для совместимости
  static getWeeklyVolume(experience: ExperienceLevel, goal: Goal): number {
    const base = this.WEEKLY_VOLUME[experience].default;
    return Math.round(base * this.GOAL_MULTIPLIER[goal]);
  }
  
  static allocateVolumePerSession(
    experience: ExperienceLevel,
    goal: Goal,
    frequency: number,
    exercises: any[],
    muscleGroup?: string
  ): any[] {
    console.log('⚠️ VolumeService.allocateVolumePerSession устарел, используйте VolumeCalculator');
    return [];
  }
  
  static getRecommendedExerciseCount(totalSets: number): number {
    if (totalSets <= 5) return 1;
    if (totalSets <= 10) return 2;
    if (totalSets <= 15) return 3;
    if (totalSets <= 20) return 4;
    return 5;
  }
}

export default VolumeService;