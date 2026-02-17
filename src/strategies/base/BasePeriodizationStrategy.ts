import { CycleWeek } from '../../types/cycle.types';
import { UserProfile, Goal } from '../../types/workout.types';

export interface PeriodizationConfig {
  name: string;
  description: string;
  icon: string;
  weekCount: number;
}

export interface VolumeAdjustment {
  volumeMultiplier: number;
  intensityMultiplier: number;
  rpeTarget: [number, number];
  description: string;
  focus: string;
  isDeload?: boolean;
  specialInstructions?: string;
}

export abstract class BasePeriodizationStrategy {
  abstract readonly config: PeriodizationConfig;
  
  /**
   * Возвращает настройки для конкретной недели
   */
  abstract getWeekAdjustment(
    weekNumber: number,
    totalWeeks: number,
    userProfile: UserProfile
  ): VolumeAdjustment;
  
  /**
   * Возвращает все недели цикла
   */
  getWeeks(userProfile: UserProfile): VolumeAdjustment[] {
    const weeks: VolumeAdjustment[] = [];
    for (let i = 0; i < this.config.weekCount; i++) {
      weeks.push(this.getWeekAdjustment(i + 1, this.config.weekCount, userProfile));
    }
    return weeks;
  }
  
  /**
   * Рассчитывает вес для упражнения с учетом недели
   */
  calculateWeight(baseWeight: number, adjustment: VolumeAdjustment): number {
    return Math.round(baseWeight * adjustment.intensityMultiplier / 2.5) * 2.5;
  }
  
  /**
   * Рассчитывает количество подходов с учетом недели
   */
  calculateVolume(baseVolume: number, adjustment: VolumeAdjustment): number {
    return Math.max(1, Math.round(baseVolume * adjustment.volumeMultiplier));
  }
}