import { BasePeriodizationStrategy, PeriodizationConfig, VolumeAdjustment } from '../base/BasePeriodizationStrategy';
import { UserProfile } from '../../types/workout.types';

export class UndulatingPeriodization extends BasePeriodizationStrategy {
  readonly config: PeriodizationConfig = {
    name: 'Волновая периодизация',
    description: '🌊 Еженедельное изменение объема и интенсивности',
    icon: '🌊',
    weekCount: 4
  };

  getWeekAdjustment(
    weekNumber: number,
    totalWeeks: number,
    userProfile: UserProfile
  ): VolumeAdjustment {
    const isAdvanced = userProfile.experience === 'advanced';
    
    switch (weekNumber) {
      case 1:
        return {
          volumeMultiplier: isAdvanced ? 1.3 : 1.2,
          intensityMultiplier: 0.7,
          rpeTarget: isAdvanced ? [6, 7] : [6, 7],
          description: 'Высокообъемная неделя',
          focus: 'Гипертрофия',
          specialInstructions: 'Фокус на пампинг, 8-12 повторений'
        };
      case 2:
        return {
          volumeMultiplier: 0.6,
          intensityMultiplier: isAdvanced ? 1.0 : 0.95,
          rpeTarget: isAdvanced ? [9, 10] : [8, 9],
          description: 'Высокоинтенсивная неделя',
          focus: 'Максимальная сила',
          specialInstructions: 'Тяжелые веса, 3-6 повторений'
        };
      case 3:
        return {
          volumeMultiplier: 1.0,
          intensityMultiplier: 0.8,
          rpeTarget: [7, 8],
          description: 'Функциональная неделя',
          focus: 'Силовая выносливость',
          specialInstructions: 'Умеренные веса, взрывные движения'
        };
      case 4:
        return {
          volumeMultiplier: 0.5,
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