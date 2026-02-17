// === БАЗОВЫЕ ТИПЫ ===
export type ExperienceLevel = 'beginner' | 'intermediate' | 'advanced';
export type Goal = 'strength' | 'hypertrophy' | 'endurance';
export type Gender = 'male' | 'female';
export type WorkoutSplit = 'fullbody' | 'ppl' | 'upperlower' | 'pushpulllegs' | 'bro';
export type Equipment = 'barbell' | 'dumbbell' | 'kettlebell' | 'machine' | 'cable' | 'bodyweight' | 'bands';

// Импорт типа периодизации
import { PeriodizationType } from './cycle.types';

// === НОВЫЙ ТИП: выбор упражнений пользователем ===
export interface UserExerciseSelection {
  [key: string]: string[]; // muscleGroup -> exerciseKeys[]
}

// === КОНФИГУРАЦИЯ СПЛИТА ===
export interface SplitConfig {
  name: string;
  daysPerWeek: number;
  rotationLength: number;
  workouts: {
    day: number;
    name: string;
    focus: string[];
    type: WorkoutSplit;
  }[];
}

// === ДЕНЬ ТРЕНИРОВКИ ===
export interface WorkoutDay {
  id: string;
  date: string;
  plannedDate: string;
  type: WorkoutSplit;
  name: string;
  focus: string[];
  exercises: PlannedExercise[];
  completed: boolean;
  completedDate?: string;
  weekOffset: number;
  cycleWeek?: number;
  cyclePhase?: string;
  cycleId?: string;
  periodizationType?: PeriodizationType;
}

// === ПЛАНИРУЕМЫЕ УПРАЖНЕНИЯ ===
export interface PlannedExercise {
  name: string;
  muscleGroup: string;
  sets: PlannedSet[];
  restBetweenSets: number;
}

export interface PlannedSet {
  weight: number;
  reps: number;
  rpe?: number;
  completed: boolean;
  actualRpe?: number;
  restTime?: number;
}

// === ПРОФИЛЬ ===
export interface UserProfile {
  name: string;
  gender: Gender;
  age: number;
  weight: number;
  height: number;
  experience: ExperienceLevel;
  goal: Goal;
  restPreference: 'strict' | 'flexible';
  notifications: boolean;
  reminderTime: string;
  trainingDays: number[];
  split: WorkoutSplit;
  availableEquipment: Equipment[];
  currentCycleId?: string;
  cyclesCompleted?: number;
  usePeriodization?: boolean;
  periodizationType?: PeriodizationType;
  assessmentCompleted?: boolean;
  assessmentDate?: string;
  derived1RM?: Record<string, number>;
  strengthLevel?: {
    overall: 'beginner' | 'intermediate' | 'advanced' | 'elite';
    byMuscleGroup: Record<string, string>;
  };
}

// === ДЛЯ СОВМЕСТИМОСТИ ===
export interface Workout {
  id: string;
  date: string;
  exercises: Exercise[];
  cycleInfo?: {
    week: number;
    phase: string;
    description: string;
  };
  periodizationType?: PeriodizationType;
}

export interface Exercise {
  name: string;
  sets: Set[];
}

export interface Set {
  weight: number;
  reps: number;
  rpe?: number;
  completed?: boolean;
  actualRpe?: number;
  restTime?: number;
}