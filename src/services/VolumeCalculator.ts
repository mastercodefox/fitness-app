import { UserProfile, Goal, ExperienceLevel } from '../types/workout.types';
import { BaseSplitStrategy } from '../strategies/base/BaseSplitStrategy';

export class VolumeCalculator {
  // Недельный объем на группу мышц (сеты/неделя)
  private static readonly WEEKLY_VOLUME: Record<ExperienceLevel, { min: number; max: number; default: number }> = {
    beginner: { min: 6, max: 10, default: 8 },
    intermediate: { min: 12, max: 20, default: 16 },
    advanced: { min: 15, max: 25, default: 20 }
  };

  // Поправочные коэффициенты для целей
  private static readonly GOAL_MULTIPLIER: Record<Goal, number> = {
    strength: 0.7,
    hypertrophy: 1.0,
    endurance: 1.2
  };

  // Специфичные коэффициенты для групп мышц
  private static readonly MUSCLE_GROUP_MULTIPLIER: Record<string, number> = {
    'shoulders': 1.2,
    'biceps': 1.1,
    'triceps': 1.1,
    'legs': 1.0,
    'chest': 1.0,
    'back': 1.0,
    'core': 0.8
  };

  /**
   * Рассчитывает объем на тренировку для конкретной группы мышц
   */
  static calculateVolumePerSession(
    userProfile: UserProfile,
    muscleGroup: string,
    splitStrategy: BaseSplitStrategy
  ): number {
    // Базовый недельный объем
    const baseVolume = this.WEEKLY_VOLUME[userProfile.experience].default;
    const adjustedWeeklyVolume = Math.round(baseVolume * this.GOAL_MULTIPLIER[userProfile.goal]);
    
    // Сколько раз в неделю тренируется эта группа
    const frequency = splitStrategy.getMuscleGroupFrequency()[muscleGroup] || 1;
    
    // Базовый объем на тренировку
    let perSession = Math.max(1, Math.round(adjustedWeeklyVolume / frequency));
    
    // Применяем множитель для специфических групп
    const multiplier = this.MUSCLE_GROUP_MULTIPLIER[muscleGroup] || 1.0;
    perSession = Math.round(perSession * multiplier);
    
    console.log(`📊 Volume для ${muscleGroup}: недельный=${adjustedWeeklyVolume}, частота=${frequency}, на тренировку=${perSession}`);
    
    return perSession;
  }

  /**
   * Рассчитывает, сколько упражнений нужно на группу
   */
  static calculateExerciseCount(totalSets: number): number {
    if (totalSets <= 4) return 1;      // 1-4 сета → 1 упражнение
    if (totalSets <= 8) return 2;      // 5-8 сетов → 2 упражнения
    if (totalSets <= 12) return 3;     // 9-12 сетов → 3 упражнения
    if (totalSets <= 16) return 4;     // 13-16 сетов → 4 упражнения
    return 5;                          // 17+ сетов → 5 упражнений
  }

  /**
   * Распределяет подходы между упражнениями
   * НИ ОДНО УПРАЖНЕНИЕ НЕ ПОЛУЧИТ МЕНЬШЕ 4 СЕТОВ!
   */
  static allocateSets(
    totalSets: number,
    exercises: { key: string; name: string; isMultiJoint: boolean }[]
  ): { exerciseKey: string; exerciseName: string; sets: number; isPrimary: boolean }[] {
    if (exercises.length === 0) return [];
    
    // Сортируем: базовые вперед
    const sorted = [...exercises].sort((a, b) => {
      if (a.isMultiJoint && !b.isMultiJoint) return -1;
      if (!a.isMultiJoint && b.isMultiJoint) return 1;
      return 0;
    });
    
    const result: { exerciseKey: string; exerciseName: string; sets: number; isPrimary: boolean }[] = [];
    
    // Если упражнений больше, чем нужно - берем только нужное количество
    const recommendedCount = this.calculateExerciseCount(totalSets);
    const selectedExercises = sorted.slice(0, recommendedCount);
    
    console.log(`   Распределение ${totalSets} сетов на ${selectedExercises.length} упражнений`);
    
    // СЛУЧАЙ 1: Одно упражнение
    if (selectedExercises.length === 1) {
      return [{
        exerciseKey: selectedExercises[0].key,
        exerciseName: selectedExercises[0].name,
        sets: totalSets,
        isPrimary: true
      }];
    }
    
    // СЛУЧАЙ 2: Два упражнения
    if (selectedExercises.length === 2) {
      const mjExercise = selectedExercises.find(e => e.isMultiJoint);
      const sjExercise = selectedExercises.find(e => !e.isMultiJoint);
      
      // Если есть и базовое, и изолирующее
      if (mjExercise && sjExercise) {
        // Базовое получает 60%, но не меньше 4 сетов
        let mjSets = Math.max(4, Math.round(totalSets * 0.6));
        let sjSets = totalSets - mjSets;
        
        // Проверяем, что изолирующее тоже получило не меньше 4
        if (sjSets < 4) {
          sjSets = 4;
          mjSets = totalSets - 4;
        }
        
        return [
          { exerciseKey: mjExercise.key, exerciseName: mjExercise.name, sets: mjSets, isPrimary: true },
          { exerciseKey: sjExercise.key, exerciseName: sjExercise.name, sets: sjSets, isPrimary: false }
        ];
      }
      
      // Если оба однотипные - поровну, но не меньше 4
      const setsPerExercise = Math.max(4, Math.floor(totalSets / 2));
      const remainder = totalSets - (setsPerExercise * 2);
      
      return [
        { exerciseKey: selectedExercises[0].key, exerciseName: selectedExercises[0].name, sets: setsPerExercise + remainder, isPrimary: true },
        { exerciseKey: selectedExercises[1].key, exerciseName: selectedExercises[1].name, sets: setsPerExercise, isPrimary: false }
      ];
    }
    
    // СЛУЧАЙ 3: Три упражнения
    if (selectedExercises.length === 3) {
      // Первое (базовое) - 40%, но не меньше 4
      let firstSets = Math.max(4, Math.round(totalSets * 0.4));
      let remaining = totalSets - firstSets;
      
      // Второе - 35% от оставшихся, но не меньше 4
      let secondSets = Math.max(4, Math.round(remaining * 0.55)); // 55% от оставшихся ≈ 35% от общего
      let thirdSets = remaining - secondSets;
      
      // Проверяем третье
      if (thirdSets < 4) {
        thirdSets = 4;
        secondSets = remaining - 4;
      }
      
      // Если второе стало меньше 4 после корректировки
      if (secondSets < 4) {
        secondSets = 4;
        firstSets = totalSets - 8;
      }
      
      return [
        { exerciseKey: selectedExercises[0].key, exerciseName: selectedExercises[0].name, sets: firstSets, isPrimary: true },
        { exerciseKey: selectedExercises[1].key, exerciseName: selectedExercises[1].name, sets: secondSets, isPrimary: false },
        { exerciseKey: selectedExercises[2].key, exerciseName: selectedExercises[2].name, sets: thirdSets, isPrimary: false }
      ];
    }
    
    // СЛУЧАЙ 4: Четыре упражнения
    if (selectedExercises.length === 4) {
      // Распределяем по убыванию, но минимум 4 на каждого
      const minPerExercise = 4;
      const totalMin = minPerExercise * 4;
      
      if (totalSets < totalMin) {
        // Не хватает на 4 упражнения - берем только 3
        return this.allocateSets(totalSets, selectedExercises.slice(0, 3));
      }
      
      // Остаток после минимальных 4 на каждого
      const remaining = totalSets - totalMin;
      
      // Добавляем остаток к первым упражнениям (базовым)
      return [
        { exerciseKey: selectedExercises[0].key, exerciseName: selectedExercises[0].name, sets: minPerExercise + Math.round(remaining * 0.4), isPrimary: true },
        { exerciseKey: selectedExercises[1].key, exerciseName: selectedExercises[1].name, sets: minPerExercise + Math.round(remaining * 0.3), isPrimary: false },
        { exerciseKey: selectedExercises[2].key, exerciseName: selectedExercises[2].name, sets: minPerExercise + Math.round(remaining * 0.2), isPrimary: false },
        { exerciseKey: selectedExercises[3].key, exerciseName: selectedExercises[3].name, sets: minPerExercise + Math.round(remaining * 0.1), isPrimary: false }
      ];
    }
    
    // СЛУЧАЙ 5: Пять упражнений
    // Обычно не бывает, но на всякий случай
    return selectedExercises.map((ex, index) => ({
      exerciseKey: ex.key,
      exerciseName: ex.name,
      sets: Math.max(4, Math.floor(totalSets / selectedExercises.length)),
      isPrimary: index === 0
    }));
  }
}