import { Equipment } from './workout.types';

export interface AssessmentExercise {
  id: string;
  name: string;
  muscleGroup: 'chest' | 'back' | 'shoulders' | 'biceps' | 'triceps' | 'legs' | 'core';
  muscleGroupRu: string;
  equipment: Equipment;
  isMultiJoint: boolean;
  // Вес для теста (% от веса тела или фиксированный)
  testWeight: {
    type: 'percentage' | 'fixed';
    male: number; // % от веса тела или фиксированный вес
    female: number;
  };
  // Ожидаемые повторения для уровня
  expectedReps: {
    beginner: [number, number]; // мин, макс
    intermediate: [number, number];
    advanced: [number, number];
  };
}

export interface AssessmentResult {
  exerciseId: string;
  exerciseName: string;
  muscleGroup: string;
  testWeight: number; // вес, который использовался
  repsToFailure: number; // сколько сделал до отказа
  calculated1RM: number; // расчетный 1ПМ
  recommendedWeights: {
    strength: number; // 85% от 1ПМ
    hypertrophy: number; // 70% от 1ПМ
    endurance: number; // 60% от 1ПМ
  };
  level: 'beginner' | 'intermediate' | 'advanced' | 'elite';
  percentile: number; // процентиль среди пользователей того же пола/веса
}

export interface FullAssessment {
  completed: boolean;
  date?: string;
  results: AssessmentResult[];
  derived1RM: {
    [exerciseKey: string]: number; // расчетный 1ПМ для каждого упражнения
  };
  strengthLevel: {
    overall: 'beginner' | 'intermediate' | 'advanced' | 'elite';
    byMuscleGroup: Record<string, string>;
  };
}