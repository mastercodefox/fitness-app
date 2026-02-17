import { BasePeriodizationStrategy, PeriodizationConfig, VolumeAdjustment } from '../base/BasePeriodizationStrategy';
import { UserProfile } from '../../types/workout.types';

export class AutoPeriodization extends BasePeriodizationStrategy {
  readonly config: PeriodizationConfig = {
    name: 'Авто-регуляция',
    description: '🤖 Умная адаптация на основе RPE',
    icon: '🤖',
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
          volumeMultiplier: baseMultiplier * 1.0,
          intensityMultiplier: 0.7,
          rpeTarget: [6, 8],
          description: 'Калибровочная неделя',
          focus: 'Сбор данных',
          specialInstructions: 'Записывай RPE после каждого подхода. Это поможет AI настроиться под тебя.'
        };
      case 2:
        return {
          volumeMultiplier: baseMultiplier * 1.0,
          intensityMultiplier: 0.75,
          rpeTarget: [6, 8],
          description: 'Адаптивная неделя',
          focus: 'Настройка алгоритма',
          specialInstructions: 'AI анализирует твои данные и начинает подстраиваться.'
        };
      case 3:
        return {
          volumeMultiplier: baseMultiplier * 1.0,
          intensityMultiplier: 0.8,
          rpeTarget: [7, 9],
          description: 'Умная прогрессия',
          focus: 'Персонализация',
          specialInstructions: 'Теперь AI будет рекомендовать веса на основе твоей истории.'
        };
      case 4:
        return {
          volumeMultiplier: baseMultiplier * 0.5,
          intensityMultiplier: 0.6,
          rpeTarget: [4, 6],
          description: 'AI-разгрузка',
          focus: 'Восстановление',
          isDeload: true,
          specialInstructions: 'AI определил, что тебе нужен отдых. Доверься алгоритму.'
        };
      default:
        throw new Error(`Invalid week number: ${weekNumber}`);
    }
  }
}