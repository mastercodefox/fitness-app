import { UserProfile, WorkoutDay, PlannedExercise, PlannedSet, UserExerciseSelection } from '../types/workout.types';
import { CycleWeek } from '../types/cycle.types';
import ExerciseDatabase from './ExerciseDatabase';
import VolumeService from './VolumeService';
import RestCalculator from './RestCalculator';
import AutoRegulationService from './AutoRegulationService';

export class ProgramService {
  
  static generateExercises(
    profile: UserProfile,
    workoutDay: WorkoutDay,
    cycleWeek?: CycleWeek,
    previousWorkouts: any[] = [],
    selection?: UserExerciseSelection
  ): PlannedExercise[] {
    
    console.log(`🏋️ [DEPRECATED] Генерация упражнений для ${workoutDay.name}`);
    console.log('⚠️ Используется устаревший метод. Рекомендуется PlanGeneratorService');
    
    // Для обратной совместимости возвращаем пустой массив
    // В новой архитектуре этот метод не используется
    return [];
  }

  static updateFromCompletedWorkout(
    completedWorkout: any,
    allWorkouts: any[]
  ): { recommendations: string[]; weightAdjustments: any[] } {
    
    const recommendations: string[] = [];
    const weightAdjustments: any[] = [];
    
    completedWorkout.exercises.forEach((exercise: any) => {
      const sets = exercise.sets.filter((s: any) => s.completed);
      if (sets.length === 0) return;
      
      const avgRPE = sets.reduce((sum: number, s: any) => sum + (s.actualRpe || 0), 0) / sets.length;
      const targetRPE = exercise.sets[0]?.rpe || 8;
      
      const best1RM = AutoRegulationService.getBest1RM(allWorkouts, exercise.name);
      const current1RM = AutoRegulationService.calculate1RM(
        sets[0].weight,
        sets[0].reps
      );
      
      if (current1RM > best1RM * 1.02) {
        recommendations.push(`🏆 Новый рекорд в ${exercise.name}! ${Math.round(best1RM)}кг → ${Math.round(current1RM)}кг`);
      }
      
      if (avgRPE > targetRPE + 1) {
        recommendations.push(`⚠️ В ${exercise.name} было тяжело (RPE ${avgRPE.toFixed(1)}). Снизь вес на 5%`);
        weightAdjustments.push({
          exercise: exercise.name,
          adjustment: 0.95
        });
      } else if (avgRPE < targetRPE - 1) {
        recommendations.push(`🔥 В ${exercise.name} было легко (RPE ${avgRPE.toFixed(1)}). Добавь 5%`);
        weightAdjustments.push({
          exercise: exercise.name,
          adjustment: 1.05
        });
      }
      
      const prediction = AutoRegulationService.predict1RM(allWorkouts, exercise.name, 4);
      if (prediction.predicted > best1RM * 1.1) {
        recommendations.push(`📈 Через цикл ты будешь жать ${exercise.name} ${Math.round(prediction.predicted)}кг!`);
      }
    });
    
    return { recommendations, weightAdjustments };
  }
}

export default ProgramService;