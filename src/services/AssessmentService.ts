import { AssessmentExercise, AssessmentResult, FullAssessment } from '../types/assessment.types';
import { ASSESSMENT_EXERCISES, EXERCISE_1RM_MAPPING } from '../data/assessmentExercises';
import { UserProfile } from '../types/workout.types';

export class AssessmentService {
  
  // === 1. ПОЛУЧИТЬ ТЕСТОВЫЙ ВЕС ===
  static getTestWeight(
    exercise: AssessmentExercise,
    user: UserProfile
  ): number {
    const { gender, weight } = user;
    
    if (exercise.testWeight.type === 'percentage') {
      const percentage = gender === 'male' 
        ? exercise.testWeight.male 
        : exercise.testWeight.female;
      
      return Math.round(weight * percentage / 2.5) * 2.5;
    } else {
      // Фиксированный вес (например, подтягивания)
      return exercise.testWeight.male;
    }
  }

  // === 2. РАСЧЕТ 1ПМ ПО ФОРМУЛЕ ЭПЛИ ===
  static calculate1RM(weight: number, reps: number): number {
    if (reps <= 0) return weight;
    if (reps === 1) return weight;
    
    // Формула Эпли: 1RM = вес * (1 + reps/30)
    return weight * (1 + reps / 30);
  }

  // === 3. АЛЬТЕРНАТИВНЫЕ ФОРМУЛЫ ДЛЯ ТОЧНОСТИ ===
  static calculate1RMAdvanced(weight: number, reps: number): number {
    if (reps <= 0) return weight;
    if (reps === 1) return weight;
    
    // Формула Бжицки (точнее для пауэрлифтинга)
    if (reps < 10) {
      return weight * (36 / (37 - reps));
    }
    
    // Формула Эпли для большего количества повторений
    return weight * (1 + reps / 30);
  }

  // === 4. ИСПРАВЛЕННОЕ ОПРЕДЕЛЕНИЕ УРОВНЯ ===
  static determineLevel(
    reps: number,
    expected: { beginner: [number, number]; intermediate: [number, number]; advanced: [number, number] }
  ): { level: 'beginner' | 'intermediate' | 'advanced' | 'elite'; percentile: number } {
    
    const [beginnerMin, beginnerMax] = expected.beginner;   // [5, 9]
    const [intermediateMin, intermediateMax] = expected.intermediate; // [10, 14]
    const [advancedMin, advancedMax] = expected.advanced;   // [15, 19]
    
    // Элита: 20+ повторений
    if (reps >= 20) {
      const percentile = 95 + Math.min(4, (reps - 19) * 1); // 95-99%
      return { level: 'elite', percentile };
    }
    
    // Продвинутый: 15-19 повторений
    if (reps >= advancedMin && reps <= advancedMax) {
      const range = advancedMax - advancedMin;
      const percentile = 70 + ((reps - advancedMin) / range) * 20; // 70-90%
      return { level: 'advanced', percentile: Math.round(percentile) };
    }
    
    // Средний: 10-14 повторений
    if (reps >= intermediateMin && reps <= intermediateMax) {
      const range = intermediateMax - intermediateMin;
      const percentile = 30 + ((reps - intermediateMin) / range) * 30; // 30-60%
      return { level: 'intermediate', percentile: Math.round(percentile) };
    }
    
    // Начинающий: 5-9 повторений
    if (reps >= beginnerMin && reps <= beginnerMax) {
      const range = beginnerMax - beginnerMin;
      const percentile = 5 + ((reps - beginnerMin) / range) * 20; // 5-25%
      return { level: 'beginner', percentile: Math.round(percentile) };
    }
    
    // Ниже начинающего: 1-4 повторения
    if (reps < beginnerMin) {
      return { level: 'beginner', percentile: Math.max(1, reps * 1) }; // 1-4%
    }
    
    // По умолчанию (на всякий случай)
    return { level: 'beginner', percentile: 5 };
  }

  // === 5. РЕКОМЕНДУЕМЫЕ ВЕСА ДЛЯ РАЗНЫХ ЦЕЛЕЙ ===
  static getRecommendedWeights(oneRM: number): {
    strength: number;   // 85% от 1ПМ
    hypertrophy: number; // 70% от 1ПМ
    endurance: number;   // 60% от 1ПМ
  } {
    return {
      strength: Math.round(oneRM * 0.85 / 2.5) * 2.5,
      hypertrophy: Math.round(oneRM * 0.7 / 2.5) * 2.5,
      endurance: Math.round(oneRM * 0.6 / 2.5) * 2.5
    };
  }

  // === 6. ОБРАБОТКА РЕЗУЛЬТАТА ТЕСТА ===
  static processAssessmentResult(
    exercise: AssessmentExercise,
    user: UserProfile,
    repsToFailure: number
  ): AssessmentResult {
    const testWeight = this.getTestWeight(exercise, user);
    const oneRM = this.calculate1RMAdvanced(testWeight, repsToFailure);
    const { level, percentile } = this.determineLevel(repsToFailure, exercise.expectedReps);
    const recommendedWeights = this.getRecommendedWeights(oneRM);
    
    return {
      exerciseId: exercise.id,
      exerciseName: exercise.name,
      muscleGroup: exercise.muscleGroup,
      testWeight,
      repsToFailure,
      calculated1RM: Math.round(oneRM * 10) / 10,
      recommendedWeights: {
        strength: recommendedWeights.strength,
        hypertrophy: recommendedWeights.hypertrophy,
        endurance: recommendedWeights.endurance
      },
      level,
      percentile: Math.round(percentile)
    };
  }

  // === 7. РАСЧЕТ 1ПМ ДЛЯ ВСЕХ УПРАЖНЕНИЙ ===
  static deriveAll1RMs(assessmentResults: AssessmentResult[]): Record<string, number> {
    const oneRMs: Record<string, number> = {};
    
    // Сначала сохраняем прямые результаты
    assessmentResults.forEach(result => {
      oneRMs[result.exerciseId] = result.calculated1RM;
    });
    
    // Затем рассчитываем для всех остальных упражнений
    Object.entries(EXERCISE_1RM_MAPPING).forEach(([exerciseKey, mapping]) => {
      const baseExercise = assessmentResults.find(r => r.exerciseId === mapping.baseExercise);
      if (baseExercise) {
        oneRMs[exerciseKey] = Math.round(
          baseExercise.calculated1RM * mapping.multiplier / 2.5
        ) * 2.5;
      }
    });
    
    return oneRMs;
  }

  // === 8. ПОЛНАЯ ОЦЕНКА ===
  static completeAssessment(
    user: UserProfile,
    results: { exerciseId: string; reps: number }[]
  ): FullAssessment {
    
    const assessmentResults: AssessmentResult[] = [];
    
    results.forEach(({ exerciseId, reps }) => {
      const exercise = ASSESSMENT_EXERCISES.find(e => e.id === exerciseId);
      if (exercise) {
        const result = this.processAssessmentResult(exercise, user, reps);
        assessmentResults.push(result);
      }
    });
    
    const derived1RM = this.deriveAll1RMs(assessmentResults);
    
    // Определяем общий уровень силы
    const levels = assessmentResults.map(r => r.level);
    const levelScores = {
      beginner: 1,
      intermediate: 2,
      advanced: 3,
      elite: 4
    };
    
    const avgScore = levels.reduce((sum, l) => sum + levelScores[l], 0) / levels.length;
    
    let overallLevel: 'beginner' | 'intermediate' | 'advanced' | 'elite';
    if (avgScore < 1.5) overallLevel = 'beginner';
    else if (avgScore < 2.5) overallLevel = 'intermediate';
    else if (avgScore < 3.5) overallLevel = 'advanced';
    else overallLevel = 'elite';
    
    // Уровень по группам мышц
    const byMuscleGroup: Record<string, string> = {};
    assessmentResults.forEach(r => {
      byMuscleGroup[r.muscleGroup] = r.level;
    });
    
    return {
      completed: true,
      date: new Date().toISOString(),
      results: assessmentResults,
      derived1RM,
      strengthLevel: {
        overall: overallLevel,
        byMuscleGroup
      }
    };
  }

  // === 9. ПОЛУЧИТЬ ВЕРБАЛЬНОЕ ОПИСАНИЕ ===
  static getFeedback(result: AssessmentResult): string {
    let feedback = '';
    
    if (result.level === 'elite') {
      feedback = `🏆 Элитный уровень! Ты в топ-${100 - result.percentile}% людей с таким же весом.`;
    } else if (result.level === 'advanced') {
      feedback = `💪 Продвинутый уровень! Ты сильнее ${result.percentile}% людей.`;
    } else if (result.level === 'intermediate') {
      feedback = `📈 Средний уровень. Хорошая база для роста!`;
    } else {
      feedback = `🌱 Начинающий уровень. Отличное начало для прогресса!`;
    }
    
    feedback += `\n\nТвой расчетный 1ПМ: ${result.calculated1RM} кг`;
    feedback += `\n\nРекомендуемые веса:`;
    feedback += `\n• Для силы: ${result.recommendedWeights.strength} кг (3-5 повторений)`;
    feedback += `\n• Для массы: ${result.recommendedWeights.hypertrophy} кг (8-12 повторений)`;
    feedback += `\n• Для выносливости: ${result.recommendedWeights.endurance} кг (15-20 повторений)`;
    
    return feedback;
  }
}

export default AssessmentService;