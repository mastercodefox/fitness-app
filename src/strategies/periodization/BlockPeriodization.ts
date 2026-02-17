import { BasePeriodizationStrategy, PeriodizationConfig, VolumeAdjustment } from '../base/BasePeriodizationStrategy';
import { UserProfile } from '../../types/workout.types';

export class BlockPeriodization extends BasePeriodizationStrategy {
  readonly config: PeriodizationConfig = {
    name: 'Блоковая периодизация',
    description: '🧱 Фокусировка на одном качестве за раз',
    icon: '🧱',
    weekCount: 12
  };

  getWeekAdjustment(
    weekNumber: number,
    totalWeeks: number,
    userProfile: UserProfile
  ): VolumeAdjustment {
    const baseMultiplier = userProfile.goal === 'strength' ? 0.7 : 
                           userProfile.goal === 'hypertrophy' ? 1.0 : 1.3;
    
    // Блок 1: Гипертрофия (недели 1-4)
    if (weekNumber <= 4) {
      const weekInBlock = weekNumber;
      return {
        volumeMultiplier: baseMultiplier * (0.9 + (weekInBlock * 0.05)),
        intensityMultiplier: 0.7,
        rpeTarget: [7, 8],
        description: `Гипертрофия • Неделя ${weekInBlock}`,
        focus: 'Набор массы',
        specialInstructions: '8-12 повторений, пампинг'
      };
    }
    
    // Блок 2: Сила (недели 5-8)
    if (weekNumber <= 8) {
      const weekInBlock = weekNumber - 4;
      return {
        volumeMultiplier: baseMultiplier * 0.6,
        intensityMultiplier: 0.8 + (weekInBlock * 0.05),
        rpeTarget: [8, 9],
        description: `Сила • Неделя ${weekInBlock}`,
        focus: 'Максимальная сила',
        specialInstructions: '3-6 повторений, длинный отдых'
      };
    }
    
    // Блок 3: Мощность (недели 9-11)
    if (weekNumber <= 11) {
      const weekInBlock = weekNumber - 8;
      return {
        volumeMultiplier: baseMultiplier * 0.4,
        intensityMultiplier: 0.6 + (weekInBlock * 0.05),
        rpeTarget: [7, 8],
        description: `Мощность • Неделя ${weekInBlock}`,
        focus: 'Взрывная сила',
        specialInstructions: '1-3 повторения, взрывные'
      };
    }
    
    // Разгрузка (неделя 12)
    return {
      volumeMultiplier: baseMultiplier * 0.3,
      intensityMultiplier: 0.5,
      rpeTarget: [3, 5],
      description: 'Финальная разгрузка',
      focus: 'Восстановление',
      isDeload: true
    };
  }
}