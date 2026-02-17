import { Workout } from '../types/workout.types';

export interface RegulationResult {
  avgRPE: number;
  adjustment: number;
  recommendation: string;
  nextWeightAdjustment: number;
}

export interface OneRMPrediction {
  current: number;
  predicted: number;
  nextCycle: number;
  recommendedWeight: number;
}

export class AutoRegulationService {
  
  // === 1. RPE АНАЛИЗ И АДАПТАЦИЯ ===
  
  /**
   * Анализирует RPE за последние тренировки и возвращает коэффициент корректировки
   */
  static analyzeRPE(workouts: any[], targetRPE: [number, number]): RegulationResult {
    if (workouts.length === 0) {
      return {
        avgRPE: 0,
        adjustment: 1.0,
        recommendation: 'Нет данных для анализа',
        nextWeightAdjustment: 1.0
      };
    }

    // Берем последние 3 тренировки для анализа
    const recentWorkouts = workouts.slice(0, Math.min(3, workouts.length));
    
    // Собираем все RPE из выполненных подходов
    const allRPEs: number[] = [];
    recentWorkouts.forEach((workout: any) => {
      workout.exercises?.forEach((exercise: any) => {
        exercise.sets?.forEach((set: any) => {
          if (set.actualRpe && set.completed) {
            allRPEs.push(set.actualRpe);
          }
        });
      });
    });

    if (allRPEs.length === 0) {
      return {
        avgRPE: 0,
        adjustment: 1.0,
        recommendation: 'Нет данных о RPE',
        nextWeightAdjustment: 1.0
      };
    }

    // Средний RPE
    const avgRPE = allRPEs.reduce((sum, rpe) => sum + rpe, 0) / allRPEs.length;
    
    // Целевой диапазон RPE
    const [minTarget, maxTarget] = targetRPE;
    
    // Вычисляем корректировку для следующей тренировки
    let adjustment = 1.0;
    let recommendation = '';
    let nextWeightAdjustment = 1.0;

    if (avgRPE > maxTarget + 0.5) {
      // Было слишком тяжело
      adjustment = 0.95; // -5% к объему
      nextWeightAdjustment = 0.95; // -5% к весу
      recommendation = '⚠️ RPE выше целевого. Снижаем вес на 5% в следующей тренировке';
    } else if (avgRPE < minTarget - 0.5) {
      // Было слишком легко
      adjustment = 1.05; // +5% к объему
      nextWeightAdjustment = 1.05; // +5% к весу
      recommendation = '🔥 RPE ниже целевого. Увеличиваем вес на 5%';
    } else {
      // В пределах нормы
      adjustment = 1.0;
      nextWeightAdjustment = 1.025; // +2.5% для прогресса
      recommendation = '✅ Отличный RPE! Добавляем 2.5% для прогресса';
    }

    return {
      avgRPE,
      adjustment,
      recommendation,
      nextWeightAdjustment
    };
  }

  /**
   * Корректирует веса для следующей тренировки на основе RPE
   */
  static adjustWeightsForNextWorkout(
    exercises: { name: string; weight: number }[],
    rpeResult: RegulationResult
  ): { name: string; newWeight: number }[] {
    return exercises.map(ex => ({
      name: ex.name,
      newWeight: Math.round(ex.weight * rpeResult.nextWeightAdjustment / 2.5) * 2.5 // Округляем до 2.5 кг
    }));
  }

  /**
   * Проверяет, не пора ли увеличить веса навсегда
   */
  static shouldIncreasePermanently(workouts: any[], exerciseName: string): boolean {
    // Берем последние 3 тренировки с этим упражнением
    const relevantWorkouts = workouts
      .filter((w: any) => w.exercises?.some((e: any) => e.name === exerciseName))
      .slice(0, 3);

    if (relevantWorkouts.length < 2) return false;

    // Проверяем, был ли RPE ниже целевого во всех подходах
    let allBelowTarget = true;
    relevantWorkouts.forEach((workout: any) => {
      workout.exercises?.forEach((exercise: any) => {
        if (exercise.name === exerciseName) {
          exercise.sets?.forEach((set: any) => {
            if (set.actualRpe && set.actualRpe < 7) {
              // Все ок, RPE низкий
            } else {
              allBelowTarget = false;
            }
          });
        }
      });
    });

    return allBelowTarget;
  }

  // === 2. ПРОГНОЗИРОВАНИЕ 1ПМ ===

  /**
   * Формула Эпли для расчета 1ПМ
   * 1RM = weight * (1 + reps/30)
   */
  static calculate1RM(weight: number, reps: number): number {
    if (reps <= 0) return weight;
    return weight * (1 + reps / 30);
  }

  /**
   * Формула Бжицки (альтернатива для пауэрлифтинга)
   * 1RM = weight * (36 / (37 - reps))
   */
  static calculate1RM_Brzycki(weight: number, reps: number): number {
    if (reps <= 0 || reps >= 37) return weight;
    return weight * (36 / (37 - reps));
  }

  /**
   * Находит лучшее достижение для упражнения
   */
  static getBest1RM(workouts: any[], exerciseName: string): number {
    let best1RM = 0;

    workouts.forEach((workout: any) => {
      workout.exercises?.forEach((exercise: any) => {
        if (exercise.name === exerciseName) {
          exercise.sets?.forEach((set: any) => {
            if (set.completed && set.reps > 0) {
              const oneRM = this.calculate1RM(set.weight, set.reps);
              if (oneRM > best1RM) {
                best1RM = oneRM;
              }
            }
          });
        }
      });
    });

    return best1RM;
  }

  /**
   * Прогнозирует 1ПМ через N недель
   */
  static predict1RM(
    workouts: any[],
    exerciseName: string,
    weeksAhead: number = 4
  ): OneRMPrediction {
    const current1RM = this.getBest1RM(workouts, exerciseName);
    
    // Находим историю прогресса
    const history: { date: Date; oneRM: number }[] = [];
    
    workouts.forEach((workout: any) => {
      workout.exercises?.forEach((exercise: any) => {
        if (exercise.name === exerciseName) {
          exercise.sets?.forEach((set: any) => {
            if (set.completed && set.reps > 0) {
              const oneRM = this.calculate1RM(set.weight, set.reps);
              history.push({
                date: new Date(workout.date),
                oneRM
              });
            }
          });
        }
      });
    });

    // Сортируем по дате
    history.sort((a, b) => a.date.getTime() - b.date.getTime());

    // Вычисляем средний прогресс в неделю
    let weeklyProgress = 0.025; // По умолчанию 2.5%

    if (history.length >= 2) {
      const first = history[0];
      const last = history[history.length - 1];
      const weeksDiff = (last.date.getTime() - first.date.getTime()) / (7 * 24 * 60 * 60 * 1000);
      
      if (weeksDiff > 0) {
        const totalProgress = last.oneRM / first.oneRM;
        weeklyProgress = Math.pow(totalProgress, 1 / weeksDiff);
      }
    }

    // Прогноз
    const predicted = current1RM * Math.pow(weeklyProgress, weeksAhead);
    const nextCycle = current1RM * Math.pow(weeklyProgress, 4); // 4 недели = цикл

    // Рекомендуемый вес для 8-12 повторений
    const recommendedWeight = this.recommendedWeightForReps(predicted, 8);

    return {
      current: Math.round(current1RM * 10) / 10,
      predicted: Math.round(predicted * 10) / 10,
      nextCycle: Math.round(nextCycle * 10) / 10,
      recommendedWeight: Math.round(recommendedWeight / 2.5) * 2.5
    };
  }

  /**
   * Рекомендует вес для целевого количества повторений
   */
  static recommendedWeightForReps(oneRM: number, targetReps: number): number {
    // Обратная формула Эпли
    return oneRM / (1 + targetReps / 30);
  }

  /**
   * Рассчитывает примерный RPE для заданного веса и повторений
   */
  static estimateRPE(weight: number, reps: number, oneRM: number): number {
    const intensity = weight / oneRM;
    
    // Примерная шкала RPE на основе интенсивности
    if (intensity >= 0.95) return 10;
    if (intensity >= 0.9) return 9;
    if (intensity >= 0.85) return 8;
    if (intensity >= 0.8) return 7;
    if (intensity >= 0.75) return 6;
    if (intensity >= 0.7) return 5;
    return 4;
  }

  /**
   * Проверяет, достигнуто ли плато
   */
  static detectPlateau(workouts: any[], exerciseName: string): boolean {
    const relevantWorkouts = workouts
      .filter((w: any) => w.exercises?.some((e: any) => e.name === exerciseName))
      .slice(0, 4); // Последние 4 тренировки

    if (relevantWorkouts.length < 3) return false;

    const oneRMs: number[] = [];
    relevantWorkouts.forEach((workout: any) => {
      let maxForDay = 0;
      workout.exercises?.forEach((exercise: any) => {
        if (exercise.name === exerciseName) {
          exercise.sets?.forEach((set: any) => {
            if (set.completed && set.reps > 0) {
              const oneRM = this.calculate1RM(set.weight, set.reps);
              if (oneRM > maxForDay) maxForDay = oneRM;
            }
          });
        }
      });
      if (maxForDay > 0) oneRMs.push(maxForDay);
    });

    // Если нет прогресса за 3+ тренировки
    if (oneRMs.length >= 3) {
      const first = oneRMs[0];
      const last = oneRMs[oneRMs.length - 1];
      const progress = (last - first) / first;
      
      return progress < 0.02; // Меньше 2% прогресса
    }

    return false;
  }
}

export default AutoRegulationService;