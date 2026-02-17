import { BasePeriodizationStrategy, PeriodizationConfig, VolumeAdjustment } from '../base/BasePeriodizationStrategy';
import { UserProfile } from '../../types/workout.types';

export class ConjugatePeriodization extends BasePeriodizationStrategy {
  readonly config: PeriodizationConfig = {
    name: 'Конъюгированная периодизация',
    description: '⚡ Сила + скорость, частая смена упражнений',
    icon: '⚡',
    weekCount: 4
  };

  getWeekAdjustment(
    weekNumber: number,
    totalWeeks: number,
    userProfile: UserProfile
  ): VolumeAdjustment {
    const baseMultiplier = userProfile.goal === 'strength' ? 0.7 : 
                           userProfile.goal === 'hypertrophy' ? 1.0 : 1.3;
    
    switch (weekNumber) {
      case 1:
        return {
          volumeMultiplier: baseMultiplier * 0.5,
          intensityMultiplier: 0.9,
          rpeTarget: [9, 10],
          description: 'Максимальных усилий',
          focus: 'Тяжелая база',
          specialInstructions: '1-3 ПМ, длинный отдых'
        };
      case 2:
        return {
          volumeMultiplier: baseMultiplier * 1.2,
          intensityMultiplier: 0.5,
          rpeTarget: [6, 7],
          description: 'Динамических усилий',
          focus: 'Взрывная скорость',
          specialInstructions: '50-60% от 1ПМ, взрывные'
        };
      case 3:
        return {
          volumeMultiplier: baseMultiplier * 0.5,
          intensityMultiplier: 0.95,
          rpeTarget: [9, 10],
          description: 'Максимальных усилий',
          focus: 'Тяжелая база',
          specialInstructions: 'Новые упражнения'
        };
      case 4:
        return {
          volumeMultiplier: baseMultiplier * 0.4,
          intensityMultiplier: 0.6,
          rpeTarget: [4, 6],
          description: 'Разгрузка',
          focus: 'Восстановление',
          isDeload: true
        };
      default:
        throw new Error(`Invalid week number: ${weekNumber}`);
    }
  }
}