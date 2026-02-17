import { AssessmentExercise } from '../types/assessment.types';

// Базовые упражнения для оценки силы - по одному на каждую группу
export const ASSESSMENT_EXERCISES: AssessmentExercise[] = [
  // === ГРУДЬ ===
  {
    id: 'assessment-bench-press',
    name: 'Жим штанги лежа',
    muscleGroup: 'chest',
    muscleGroupRu: 'Грудные',
    equipment: 'barbell',
    isMultiJoint: true,
    testWeight: {
      type: 'percentage',
      male: 0.7, // 70% от веса тела
      female: 0.5 // 50% от веса тела
    },
    expectedReps: {
      beginner: [5, 10],
      intermediate: [10, 15],
      advanced: [15, 20]
    }
  },
  
  // === НОГИ ===
  {
    id: 'assessment-squat',
    name: 'Приседания со штангой',
    muscleGroup: 'legs',
    muscleGroupRu: 'Ноги',
    equipment: 'barbell',
    isMultiJoint: true,
    testWeight: {
      type: 'percentage',
      male: 0.8, // 80% от веса тела
      female: 0.6 // 60% от веса тела
    },
    expectedReps: {
      beginner: [5, 10],
      intermediate: [10, 15],
      advanced: [15, 20]
    }
  },
  
  // === СПИНА ===
  {
    id: 'assessment-barbell-row',
    name: 'Тяга штанги в наклоне',
    muscleGroup: 'back',
    muscleGroupRu: 'Спина',
    equipment: 'barbell',
    isMultiJoint: true,
    testWeight: {
      type: 'percentage',
      male: 0.6, // 60% от веса тела
      female: 0.4 // 40% от веса тела
    },
    expectedReps: {
      beginner: [5, 8],
      intermediate: [8, 12],
      advanced: [12, 15]
    }
  },
  
  // === ПЛЕЧИ ===
  {
    id: 'assessment-overhead-press',
    name: 'Жим штанги стоя',
    muscleGroup: 'shoulders',
    muscleGroupRu: 'Плечи',
    equipment: 'barbell',
    isMultiJoint: true,
    testWeight: {
      type: 'percentage',
      male: 0.4, // 40% от веса тела
      female: 0.3 // 30% от веса тела
    },
    expectedReps: {
      beginner: [5, 8],
      intermediate: [8, 12],
      advanced: [12, 15]
    }
  },
  
  // === БИЦЕПС ===
  {
    id: 'assessment-barbell-curl',
    name: 'Подъем штанги на бицепс',
    muscleGroup: 'biceps',
    muscleGroupRu: 'Бицепс',
    equipment: 'barbell',
    isMultiJoint: false,
    testWeight: {
      type: 'percentage',
      male: 0.3, // 30% от веса тела
      female: 0.2 // 20% от веса тела
    },
    expectedReps: {
      beginner: [5, 8],
      intermediate: [8, 12],
      advanced: [12, 15]
    }
  },
  
  // === ТРИЦЕПС ===
  {
    id: 'assessment-triceps-extension',
    name: 'Французский жим лежа',
    muscleGroup: 'triceps',
    muscleGroupRu: 'Трицепс',
    equipment: 'barbell',
    isMultiJoint: false,
    testWeight: {
      type: 'percentage',
      male: 0.25, // 25% от веса тела
      female: 0.15 // 15% от веса тела
    },
    expectedReps: {
      beginner: [5, 8],
      intermediate: [8, 12],
      advanced: [12, 15]
    }
  }
];

// Маппинг упражнений для расчета 1ПМ во всех остальных
export const EXERCISE_1RM_MAPPING: Record<string, {
  baseExercise: string; // от какого тестового упражнения считаем
  multiplier: number; // множитель относительно базового
}> = {
  // ===== ГРУДЬ (от жима лежа) =====
  'bench-press': { baseExercise: 'assessment-bench-press', multiplier: 1.0 },
  'dumbbell-bench-press': { baseExercise: 'assessment-bench-press', multiplier: 0.9 },
  'incline-bench-press': { baseExercise: 'assessment-bench-press', multiplier: 0.85 },
  'decline-bench-press': { baseExercise: 'assessment-bench-press', multiplier: 0.9 },
  'dips-chest': { baseExercise: 'assessment-bench-press', multiplier: 0.8 },
  'push-ups': { baseExercise: 'assessment-bench-press', multiplier: 0.5 },
  'dumbbell-fly': { baseExercise: 'assessment-bench-press', multiplier: 0.5 },
  'cable-crossover': { baseExercise: 'assessment-bench-press', multiplier: 0.4 },
  'cable-crossover-seated': { baseExercise: 'assessment-bench-press', multiplier: 0.4 },
  'chest-press-machine': { baseExercise: 'assessment-bench-press', multiplier: 0.9 },
  'pullover': { baseExercise: 'assessment-bench-press', multiplier: 0.4 },
  
  // ===== НОГИ (от приседаний) =====
  'squat': { baseExercise: 'assessment-squat', multiplier: 1.0 },
  'front-squat': { baseExercise: 'assessment-squat', multiplier: 0.85 },
  'leg-press': { baseExercise: 'assessment-squat', multiplier: 1.5 },
  'hack-squat': { baseExercise: 'assessment-squat', multiplier: 1.2 },
  'goblet-squat': { baseExercise: 'assessment-squat', multiplier: 0.6 },
  'lunges': { baseExercise: 'assessment-squat', multiplier: 0.7 },
  'leg-extension': { baseExercise: 'assessment-squat', multiplier: 0.4 },
  'leg-curl': { baseExercise: 'assessment-squat', multiplier: 0.35 },
  'leg-curl-seated': { baseExercise: 'assessment-squat', multiplier: 0.35 },
  'romanian-deadlift': { baseExercise: 'assessment-squat', multiplier: 0.8 },
  'calf-raise': { baseExercise: 'assessment-squat', multiplier: 0.5 },
  'glute-bridge': { baseExercise: 'assessment-squat', multiplier: 0.7 },
  
  // ===== СПИНА (от тяги в наклоне) =====
  'bent-over-row': { baseExercise: 'assessment-barbell-row', multiplier: 1.0 },
  'deadlift': { baseExercise: 'assessment-barbell-row', multiplier: 1.5 },
  'pull-ups': { baseExercise: 'assessment-barbell-row', multiplier: 0.8 },
  'lat-pulldown': { baseExercise: 'assessment-barbell-row', multiplier: 0.8 },
  'seated-cable-row': { baseExercise: 'assessment-barbell-row', multiplier: 0.9 },
  't-bar-row': { baseExercise: 'assessment-barbell-row', multiplier: 1.1 },
  'dumbbell-row': { baseExercise: 'assessment-barbell-row', multiplier: 0.8 },
  'reverse-grip-pulldown': { baseExercise: 'assessment-barbell-row', multiplier: 0.75 },
  'hyperextension': { baseExercise: 'assessment-barbell-row', multiplier: 0.3 },
  'rack-pull': { baseExercise: 'assessment-barbell-row', multiplier: 1.3 },
  
  // ===== ПЛЕЧИ (от жима стоя) =====
  'overhead-press': { baseExercise: 'assessment-overhead-press', multiplier: 1.0 },
  'seated-dumbbell-press': { baseExercise: 'assessment-overhead-press', multiplier: 0.9 },
  'arnold-press': { baseExercise: 'assessment-overhead-press', multiplier: 0.85 },
  'lateral-raise': { baseExercise: 'assessment-overhead-press', multiplier: 0.25 },
  'cable-lateral-raise': { baseExercise: 'assessment-overhead-press', multiplier: 0.25 },
  'front-raise': { baseExercise: 'assessment-overhead-press', multiplier: 0.25 },
  'cable-front-raise': { baseExercise: 'assessment-overhead-press', multiplier: 0.25 },
  'reverse-fly': { baseExercise: 'assessment-overhead-press', multiplier: 0.2 },
  'upright-row': { baseExercise: 'assessment-overhead-press', multiplier: 0.5 },
  'reverse-pec-deck': { baseExercise: 'assessment-overhead-press', multiplier: 0.25 },
  
  // ===== БИЦЕПС (от подъема штанги на бицепс) =====
  'barbell-curl': { baseExercise: 'assessment-barbell-curl', multiplier: 1.0 },
  'dumbbell-curl': { baseExercise: 'assessment-barbell-curl', multiplier: 0.9 },
  'hammer-curl': { baseExercise: 'assessment-barbell-curl', multiplier: 0.9 },
  'concentration-curl': { baseExercise: 'assessment-barbell-curl', multiplier: 0.8 },
  'cable-curl': { baseExercise: 'assessment-barbell-curl', multiplier: 0.85 },
  'preacher-curl': { baseExercise: 'assessment-barbell-curl', multiplier: 0.85 },
  'incline-curl': { baseExercise: 'assessment-barbell-curl', multiplier: 0.8 },
  'bayesian-curl': { baseExercise: 'assessment-barbell-curl', multiplier: 0.8 },
  
  // ===== ТРИЦЕПС (от французского жима) =====
  'close-grip-bench': { baseExercise: 'assessment-triceps-extension', multiplier: 1.2 },
  'triceps-extension': { baseExercise: 'assessment-triceps-extension', multiplier: 1.0 },
  'cable-pushdown': { baseExercise: 'assessment-triceps-extension', multiplier: 0.9 },
  'cable-pushdown-rope': { baseExercise: 'assessment-triceps-extension', multiplier: 0.85 },
  'dips': { baseExercise: 'assessment-triceps-extension', multiplier: 1.5 },
  'overhead-triceps-extension': { baseExercise: 'assessment-triceps-extension', multiplier: 0.9 },
  'kickback': { baseExercise: 'assessment-triceps-extension', multiplier: 0.6 },
  'bench-dips': { baseExercise: 'assessment-triceps-extension', multiplier: 0.8 }
};