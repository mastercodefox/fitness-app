import { WorkoutDay, UserProfile, PlannedExercise } from '../../types/workout.types';
import { CycleWeek } from '../../types/cycle.types';

export interface SplitConfig {
  name: string;
  daysPerWeek: number;
  workouts: {
    day: number;
    name: string;
    focus: string[];
    type: string;
  }[];
}

export interface MuscleGroupFrequency {
  [key: string]: number; // muscleGroup -> тренировок в неделю
}

export abstract class BaseSplitStrategy {
  abstract readonly name: string;
  abstract readonly daysPerWeek: number;
  abstract readonly config: SplitConfig;
  
  /**
   * Возвращает, сколько раз в неделю тренируется каждая группа мышц
   */
  abstract getMuscleGroupFrequency(): MuscleGroupFrequency;
  
  /**
   * Возвращает тренировку для конкретного дня
   */
  abstract getWorkoutForDay(dayIndex: number, weekOffset: number): {
    name: string;
    focus: string[];
  };
  
  /**
   * Генерирует ID тренировки
   */
  generateWorkoutId(weekOffset: number, dayIndex: number): string {
    return `${this.name.replace(/\s+/g, '-')}-week-${weekOffset}-day-${dayIndex}-${Date.now()}-${Math.random()}`;
  }
  
  /**
   * Создает тренировку для конкретного дня
   */
  createWorkoutDay(
    date: Date,
    weekOffset: number,
    dayIndex: number,
    cycleInfo?: { weekNumber: number; phase: string; cycleId: string }
  ): WorkoutDay {
    const workout = this.getWorkoutForDay(dayIndex, weekOffset);
    
    return {
      id: this.generateWorkoutId(weekOffset, dayIndex),
      date: date.toISOString(),
      plannedDate: date.toISOString(),
      type: this.config.workouts[0].type as any,
      name: workout.name,
      focus: workout.focus,
      exercises: [],
      completed: false,
      weekOffset,
      cycleWeek: cycleInfo?.weekNumber,
      cyclePhase: cycleInfo?.phase,
      cycleId: cycleInfo?.cycleId
    };
  }
}