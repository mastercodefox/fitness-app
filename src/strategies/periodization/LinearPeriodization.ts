import { BasePeriodizationStrategy, PeriodizationConfig, VolumeAdjustment } from '../base/BasePeriodizationStrategy';
import { UserProfile } from '../../types/workout.types';

export class LinearPeriodization extends BasePeriodizationStrategy {
  readonly config: PeriodizationConfig = {
    name: 'Линейная периодизация',
    description: '📈 Классическая схема: постепенное увеличение веса',
    icon: '📈',
    weekCount: 4
  };

  getWeekAdjustment(
    weekNumber: number,
    totalWeeks: number,
    userProfile: UserProfile
  ): VolumeAdjustment {
    const isBeginner = userProfile.experience === 'beginner';
    
    switch (weekNumber) {
      case 1:
        return {
          volumeMultiplier: 1.0,
          intensityMultiplier: isBeginner ? 0.7 : 0.75,
          rpeTarget: isBeginner ? [6, 7] : [7, 8],
          description: 'Втягивание, работа над техникой',
          focus: 'Адаптация'
        };
      case 2:
        return {
          volumeMultiplier: 1.1,
          intensityMultiplier: isBeginner ? 0.75 : 0.8,
          rpeTarget: isBeginner ? [6, 8] : [7, 8],
          description: 'Увеличение объема',
          focus: 'Гипертрофия'
        };
      case 3:
        return {
          volumeMultiplier: isBeginner ? 1.2 : 0.9,
          intensityMultiplier: isBeginner ? 0.8 : 0.9,
          rpeTarget: isBeginner ? [7, 8] : [8, 9],
          description: isBeginner ? 'Пик объема' : 'Пик интенсивности',
          focus: isBeginner ? 'Выносливость' : 'Сила'
        };
      case 4:
        return {
          volumeMultiplier: 0.5,
          intensityMultiplier: 0.6,
          rpeTarget: [4, 6],
          description: 'Активное восстановление',
          focus: 'Регенерация',
          isDeload: true
        };
      default:
        throw new Error(`Invalid week number: ${weekNumber}`);
    }
  }
}