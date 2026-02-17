import { UserProfile, WorkoutDay, UserExerciseSelection, PlannedExercise } from '../types/workout.types';
import { TrainingCycle, CycleWeek } from '../types/cycle.types';
import { BaseSplitStrategy } from '../strategies/base/BaseSplitStrategy';
import { BasePeriodizationStrategy, VolumeAdjustment } from '../strategies/base/BasePeriodizationStrategy';
import { StrategyFactory } from './StrategyFactory';
import { VolumeCalculator } from './VolumeCalculator';
import ExerciseDatabase from './ExerciseDatabase';

export class PlanGeneratorService {
  
  /**
   * Генерирует полный план на 12 недель
   */
  static generateFullPlan(
    userProfile: UserProfile,
    exerciseSelection: UserExerciseSelection,
    startDate: Date = new Date()
  ): { weekPlan: WorkoutDay[]; cycle: TrainingCycle | null } {
    
    // Создаем стратегии
    const splitStrategy = StrategyFactory.createSplitStrategy(userProfile.split);
    const periodizationStrategy = userProfile.usePeriodization
      ? StrategyFactory.createPeriodizationStrategy(userProfile.periodizationType || 'linear')
      : null;
    
    console.log('📋 Создание плана:');
    console.log(`   Сплит: ${splitStrategy.name}`);
    console.log(`   Периодизация: ${periodizationStrategy?.config.name || 'нет'}`);
    console.log(`   Дней в неделю: ${splitStrategy.daysPerWeek}`);
    
    // Генерируем недели
    const weekPlan: WorkoutDay[] = [];
    const baseDate = new Date(startDate);
    baseDate.setHours(12, 0, 0, 0);
    
    // Получаем понедельник стартовой недели
    const monday = this.getMondayOfWeek(baseDate);
    console.log(`📅 Стартовый понедельник: ${monday.toLocaleDateString()}`);
    
    for (let weekOffset = 0; weekOffset < 12; weekOffset++) {
      const weekStart = new Date(monday);
      weekStart.setDate(monday.getDate() + (weekOffset * 7));
      
      // Получаем тренировки на эту неделю
      const weekWorkouts = this.generateWeek(
        weekOffset,
        weekStart,
        splitStrategy,
        periodizationStrategy,
        userProfile,
        exerciseSelection
      );
      
      console.log(`   Неделя ${weekOffset + 1}: ${weekWorkouts.length} тренировок`);
      weekPlan.push(...weekWorkouts);
    }
    
    // Создаем объект цикла
    const cycle = periodizationStrategy ? this.createCycle(
      periodizationStrategy,
      userProfile,
      weekPlan
    ) : null;
    
    console.log(`✅ Всего сгенерировано тренировок: ${weekPlan.length}`);
    
    return { weekPlan, cycle };
  }

  /**
   * Генерирует одну неделю тренировок
   */
  private static generateWeek(
    weekOffset: number,
    weekStart: Date,
    splitStrategy: BaseSplitStrategy,
    periodizationStrategy: BasePeriodizationStrategy | null,
    userProfile: UserProfile,
    exerciseSelection: UserExerciseSelection
  ): WorkoutDay[] {
    
    const weekDays: WorkoutDay[] = [];
    const trainingDays = userProfile.trainingDays || [1, 3, 5];
    
    // Получаем понедельник этой недели
    const monday = this.getMondayOfWeek(weekStart);
    
    for (let i = 0; i < 7; i++) {
      const currentDate = new Date(monday);
      currentDate.setDate(monday.getDate() + i);
      currentDate.setHours(12, 0, 0, 0);
      
      const dayOfWeek = currentDate.getDay(); // 0 = вс, 1 = пн
      
      // Проверяем, тренировочный ли это день
      if (trainingDays.includes(dayOfWeek)) {
        // Определяем индекс дня в списке тренировочных дней
        const sortedDays = [...trainingDays].sort((a, b) => {
          const dayA = a === 0 ? 7 : a;
          const dayB = b === 0 ? 7 : b;
          return dayA - dayB;
        });
        
        const dayIndex = sortedDays.findIndex(d => 
          (d === 0 && dayOfWeek === 0) || d === dayOfWeek
        );
        
        if (dayIndex !== -1) {
          // Создаем тренировку
          const workout = splitStrategy.createWorkoutDay(
            currentDate,
            weekOffset,
            dayIndex,
            periodizationStrategy ? {
              weekNumber: (weekOffset % periodizationStrategy.config.weekCount) + 1,
              phase: 'build',
              cycleId: `cycle-${Math.floor(weekOffset / periodizationStrategy.config.weekCount)}`
            } : undefined
          );
          
          // Генерируем упражнения для этой тренировки
          const exercises = this.generateWorkoutExercises(
            workout,
            userProfile,
            exerciseSelection,
            splitStrategy,
            periodizationStrategy,
            weekOffset
          );
          
          weekDays.push({
            ...workout,
            exercises
          });
        }
      }
    }
    
    return weekDays;
  }

  /**
   * Генерирует упражнения для конкретной тренировки
   */
  private static generateWorkoutExercises(
    workout: WorkoutDay,
    userProfile: UserProfile,
    exerciseSelection: UserExerciseSelection,
    splitStrategy: BaseSplitStrategy,
    periodizationStrategy: BasePeriodizationStrategy | null,
    weekOffset: number
  ): PlannedExercise[] {
    const exercises: PlannedExercise[] = [];
    const db = ExerciseDatabase.getInstance();
    
    // Получаем настройки периодизации для этой недели
    let adjustment: VolumeAdjustment | null = null;
    if (periodizationStrategy) {
      const weekInCycle = (weekOffset % periodizationStrategy.config.weekCount) + 1;
      adjustment = periodizationStrategy.getWeekAdjustment(
        weekInCycle,
        periodizationStrategy.config.weekCount,
        userProfile
      );
    }
    
    workout.focus.forEach(muscleGroup => {
      // Получаем выбранные пользователем упражнения для этой группы
      const selectedKeys = exerciseSelection[muscleGroup] || [];
      if (selectedKeys.length === 0) return;
      
      // Получаем полные объекты упражнений
      const exercisesFromDb = selectedKeys
        .map(key => db.getExerciseByKey(key))
        .filter((ex): ex is NonNullable<typeof ex> => ex !== undefined);
      
      // Проверяем, что массив не пуст
      if (exercisesFromDb.length === 0) return;
      
      // Теперь мы знаем, что массив не пуст и все элементы определены
      const selectedExercises = exercisesFromDb;
      
      // Рассчитываем базовый объем на эту тренировку
      const baseSets = VolumeCalculator.calculateVolumePerSession(
        userProfile,
        muscleGroup,
        splitStrategy
      );
      
      // Применяем периодизацию
      let adjustedSets = baseSets;
      let intensityMultiplier = 1.0;
      
      if (adjustment) {
        adjustedSets = periodizationStrategy!.calculateVolume(baseSets, adjustment);
        intensityMultiplier = adjustment.intensityMultiplier;
      }
      
      // Получаем базовый вес (из истории или нормативов)
      // Используем первое упражнение для расчета базового веса
      const firstExercise = selectedExercises[0];
      let baseWeight = this.estimateBaseWeight(userProfile, firstExercise.name);
      baseWeight = Math.round(baseWeight * intensityMultiplier / 2.5) * 2.5;
      
      // Распределяем подходы между упражнениями
      const allocation = VolumeCalculator.allocateSets(
        adjustedSets,
        selectedExercises.map(ex => ({
          key: ex.key,
          name: ex.name,
          isMultiJoint: ex.isMultiJoint
        }))
      );
      
      allocation.forEach(item => {
        // Находим упражнение по ключу
        const exercise = selectedExercises.find(e => e.key === item.exerciseKey);
        if (!exercise) return; // Пропускаем, если упражнение не найдено
        
        exercises.push({
          name: exercise.name,
          muscleGroup,
          sets: Array(item.sets).fill(null).map((_, idx) => ({
            weight: baseWeight,
            reps: this.getRepsForGoal(userProfile.goal),
            rpe: adjustment?.rpeTarget[1] || 8,
            completed: false
          })),
          restBetweenSets: 90 // TODO: из профиля
        });
      });
    });
    
    return exercises;
  }

  /**
   * Создает объект цикла
   */
  private static createCycle(
    periodizationStrategy: BasePeriodizationStrategy,
    userProfile: UserProfile,
    weekPlan: WorkoutDay[]
  ): TrainingCycle {
    const adjustments = periodizationStrategy.getWeeks(userProfile);
    
    const weeks: CycleWeek[] = adjustments.map((adj, idx) => ({
      weekNumber: idx + 1,
      phase: adj.isDeload ? 'deload' : 
             adj.focus.includes('Сила') ? 'peak' : 'build',
      volumeMultiplier: adj.volumeMultiplier,
      intensityMultiplier: adj.intensityMultiplier,
      rpeTarget: adj.rpeTarget,
      description: adj.description,
      focus: adj.focus
    }));
    
    return {
      id: `cycle-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: periodizationStrategy.config.name,
      type: userProfile.experience === 'beginner' ? 'beginner' : 
            userProfile.experience === 'intermediate' ? 'intermediate' : 'advanced',
      periodizationType: userProfile.periodizationType || 'linear',
      weekCount: periodizationStrategy.config.weekCount,
      currentWeek: 1,
      weeks,
      startDate: weekPlan[0]?.plannedDate || new Date().toISOString(),
      endDate: weekPlan[weekPlan.length - 1]?.plannedDate || new Date().toISOString(),
      split: userProfile.split,
      completed: false
    };
  }

  private static getMondayOfWeek(date: Date): Date {
    const result = new Date(date);
    result.setHours(12, 0, 0, 0);
    const day = result.getDay();
    const diff = result.getDate() - day + (day === 0 ? -6 : 1);
    result.setDate(diff);
    return result;
  }

  private static getRepsForGoal(goal: string): number {
    switch (goal) {
      case 'strength': return 5;
      case 'hypertrophy': return 10;
      case 'endurance': return 15;
      default: return 8;
    }
  }

  private static estimateBaseWeight(
    profile: UserProfile,
    exerciseName: string
  ): number {
    // Если есть расчетный 1ПМ из оценки, используем его
    if (profile.derived1RM && profile.derived1RM[exerciseName]) {
      const oneRM = profile.derived1RM[exerciseName];
      // Возвращаем 70% от 1ПМ для рабочих подходов
      return Math.round(oneRM * 0.7 / 2.5) * 2.5;
    }
    
    // Если нет, берем стартовый вес по умолчанию
    switch (profile.experience) {
      case 'beginner': return 20;
      case 'intermediate': return 40;
      case 'advanced': return 60;
      default: return 30;
    }
  }
}