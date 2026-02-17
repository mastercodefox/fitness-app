import { TrainingCycle, CycleWeek, CyclePhase, CycleType, CycleRecommendation, PeriodizationType } from '../types/cycle.types';
import { WorkoutSplit, ExperienceLevel, Goal } from '../types/workout.types';
import PeriodizationService from './PeriodizationService';

export class CycleService {
  
  private static readonly CYCLE_RECOMMENDATIONS: CycleRecommendation[] = [
    {
      type: 'beginner',
      name: 'Втягивающий цикл',
      description: 'Адаптация к нагрузкам, работа над техникой',
      weeks: 4,
      suitableFor: ['beginner'],
      periodizationTypes: ['linear', 'auto']
    },
    {
      type: 'intermediate',
      name: 'Линейная периодизация',
      description: 'Прогрессия нагрузки 3:1',
      weeks: 4,
      suitableFor: ['intermediate'],
      periodizationTypes: ['linear', 'undulating', 'auto']
    },
    {
      type: 'advanced',
      name: 'Волновая периодизация',
      description: 'Еженедельное изменение объема/интенсивности',
      weeks: 4,
      suitableFor: ['advanced'],
      periodizationTypes: ['undulating', 'block', 'conjugate', 'auto']
    }
  ];

  // ОСНОВНОЙ МЕТОД: создание цикла по стратегии
  static getCycleForLevel(
    experience: ExperienceLevel,
    startDate: Date,
    split: WorkoutSplit,
    goal: Goal = 'hypertrophy',
    periodizationType?: PeriodizationType
  ): TrainingCycle {
    // Если стратегия не указана, выбираем рекомендуемую
    const strategy = periodizationType || PeriodizationService.getRecommendedStrategy(experience);
    
    // Получаем недели по стратегии
    const weeks = PeriodizationService.getWeeksByStrategy(strategy, goal, experience);
    
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + (weeks.length * 7 - 1));

    // Название цикла
    let cycleName = '';
    switch (strategy) {
      case 'linear': cycleName = 'Линейная периодизация'; break;
      case 'undulating': cycleName = 'Волновая периодизация (DUP)'; break;
      case 'block': cycleName = 'Блоковая периодизация'; break;
      case 'conjugate': cycleName = 'Конъюгированная (Westside)'; break;
      case 'auto': cycleName = 'Авто-регуляция (RPE)'; break;
      default: cycleName = 'Тренировочный цикл';
    }

    return {
      id: `cycle-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: cycleName,
      type: experience === 'beginner' ? 'beginner' : experience === 'intermediate' ? 'intermediate' : 'advanced',
      periodizationType: strategy,
      weekCount: weeks.length,
      currentWeek: 1,
      weeks,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      split,
      completed: false
    };
  }

  // Для обратной совместимости
  static getBeginnerCycle(startDate: Date, split: WorkoutSplit): TrainingCycle {
    return this.getCycleForLevel('beginner', startDate, split, 'hypertrophy', 'linear');
  }

  static getIntermediateCycle(startDate: Date, split: WorkoutSplit): TrainingCycle {
    return this.getCycleForLevel('intermediate', startDate, split, 'hypertrophy', 'undulating');
  }

  static getAdvancedCycle(startDate: Date, split: WorkoutSplit): TrainingCycle {
    return this.getCycleForLevel('advanced', startDate, split, 'hypertrophy', 'block');
  }

  static getCycleWeeksInfo(cycle: TrainingCycle): { weekNumber: number; phase: string; cycleId: string }[] {
    return cycle.weeks.map(week => ({
      weekNumber: week.weekNumber,
      phase: week.phase,
      cycleId: cycle.id
    }));
  }

  static applyCycleToWorkout(
    baseVolume: number,
    baseWeight: number,
    cycleWeek: CycleWeek
  ): { volume: number; weight: number; rpeTarget: [number, number] } {
    return {
      volume: Math.round(baseVolume * cycleWeek.volumeMultiplier),
      weight: Math.round(baseWeight * cycleWeek.intensityMultiplier),
      rpeTarget: cycleWeek.rpeTarget
    };
  }

  static getCurrentWeekInCycle(cycle: TrainingCycle): CycleWeek {
    const now = new Date();
    const start = new Date(cycle.startDate);
    const daysDiff = Math.floor((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    const weekNumber = Math.min(Math.floor(daysDiff / 7) + 1, cycle.weekCount);
    
    cycle.currentWeek = weekNumber;
    return cycle.weeks[weekNumber - 1];
  }

  static getWeekByOffset(cycle: TrainingCycle, weekOffset: number): CycleWeek {
    const weekNumber = ((weekOffset % cycle.weekCount) + cycle.weekCount) % cycle.weekCount;
    return cycle.weeks[weekNumber];
  }

  static completeCycle(cycle: TrainingCycle): TrainingCycle {
    return {
      ...cycle,
      completed: true,
      currentWeek: cycle.weekCount
    };
  }

  static getRecommendations(): CycleRecommendation[] {
    return this.CYCLE_RECOMMENDATIONS;
  }

  static getPhaseDescription(phase: CyclePhase): string {
    const descriptions = {
      build: '🟢 Накопление — работа над объемом',
      peak: '🟡 Пик — повышение интенсивности',
      deload: '🔵 Разгрузка — активное восстановление',
      test: '🟣 Тест — проверка 1ПМ'
    };
    return descriptions[phase];
  }

  static getPhaseIcon(phase: CyclePhase): string {
    const icons = {
      build: '🟢',
      peak: '🟡',
      deload: '🔵',
      test: '🟣'
    };
    return icons[phase];
  }

  static getPhaseColor(phase: CyclePhase): 'success' | 'warning' | 'info' | 'primary' {
    const colors = {
      build: 'success',
      peak: 'warning',
      deload: 'info',
      test: 'primary'
    } as const;
    return colors[phase];
  }

  // Получить информацию о текущей стратегии
  static getCurrentStrategyInfo(cycle: TrainingCycle): string {
    const strategy = PeriodizationService.STRATEGIES[cycle.periodizationType];
    if (!strategy) return '';
    
    const currentWeek = cycle.weeks[cycle.currentWeek - 1];
    return `${strategy.icon} ${strategy.name} • ${currentWeek.description}`;
  }
}

export default CycleService;