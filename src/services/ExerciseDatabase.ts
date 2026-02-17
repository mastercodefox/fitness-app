import { Equipment } from '../types/workout.types';

// Переименовываем интерфейс, чтобы не конфликтовать с Exercise из exercise.types.ts
interface DatabaseExercise {
  key: string;
  name: string;
  muscleGroup: 'chest' | 'back' | 'shoulders' | 'biceps' | 'triceps' | 'legs' | 'core';
  muscleGroupRu: string;
  equipment: Equipment;
  isMultiJoint: boolean;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  normatives: {
    beginner: { male: number; female: number };
    intermediate: { male: number; female: number };
    advanced: { male: number; female: number };
  };
}

export class ExerciseDatabase {
  private static instance: ExerciseDatabase;
  private exercises: DatabaseExercise[];

  private constructor() {
    this.exercises = [
      // ============ ГРУДЬ (11 упражнений) ============
      {
        key: 'bench_press',
        name: 'Жим лежа',
        muscleGroup: 'chest',
        muscleGroupRu: 'Грудь',
        equipment: 'barbell',
        isMultiJoint: true,
        difficulty: 'beginner',
        normatives: {
          beginner: { male: 40, female: 25 },
          intermediate: { male: 80, female: 45 },
          advanced: { male: 120, female: 70 }
        }
      },
      {
        key: 'dumbbell_bench_press',
        name: 'Жим гантелей',
        muscleGroup: 'chest',
        muscleGroupRu: 'Грудь',
        equipment: 'dumbbell',
        isMultiJoint: true,
        difficulty: 'beginner',
        normatives: {
          beginner: { male: 16, female: 10 },
          intermediate: { male: 24, female: 16 },
          advanced: { male: 32, female: 22 }
        }
      },
      {
        key: 'incline_bench_press',
        name: 'Жим лежа на наклонной',
        muscleGroup: 'chest',
        muscleGroupRu: 'Грудь',
        equipment: 'barbell',
        isMultiJoint: true,
        difficulty: 'intermediate',
        normatives: {
          beginner: { male: 35, female: 20 },
          intermediate: { male: 70, female: 40 },
          advanced: { male: 100, female: 60 }
        }
      },
      {
        key: 'incline_dumbbell_press',
        name: 'Жим гантелей на наклонной',
        muscleGroup: 'chest',
        muscleGroupRu: 'Грудь',
        equipment: 'dumbbell',
        isMultiJoint: true,
        difficulty: 'intermediate',
        normatives: {
          beginner: { male: 14, female: 9 },
          intermediate: { male: 22, female: 14 },
          advanced: { male: 30, female: 20 }
        }
      },
      {
        key: 'dumbbell_fly',
        name: 'Разводка гантелей',
        muscleGroup: 'chest',
        muscleGroupRu: 'Грудь',
        equipment: 'dumbbell',
        isMultiJoint: false,
        difficulty: 'beginner',
        normatives: {
          beginner: { male: 10, female: 6 },
          intermediate: { male: 16, female: 10 },
          advanced: { male: 22, female: 14 }
        }
      },
      {
        key: 'cable_crossover',
        name: 'Сведение в кроссовере',
        muscleGroup: 'chest',
        muscleGroupRu: 'Грудь',
        equipment: 'cable',
        isMultiJoint: false,
        difficulty: 'beginner',
        normatives: {
          beginner: { male: 15, female: 10 },
          intermediate: { male: 25, female: 15 },
          advanced: { male: 35, female: 20 }
        }
      },
      {
        key: 'cable_crossover_seated',
        name: 'Сведение в кроссовере сидя',
        muscleGroup: 'chest',
        muscleGroupRu: 'Грудь',
        equipment: 'cable',
        isMultiJoint: false,
        difficulty: 'intermediate',
        normatives: {
          beginner: { male: 15, female: 10 },
          intermediate: { male: 25, female: 15 },
          advanced: { male: 35, female: 20 }
        }
      },
      {
        key: 'chest_press_machine',
        name: 'Жим в тренажере',
        muscleGroup: 'chest',
        muscleGroupRu: 'Грудь',
        equipment: 'machine',
        isMultiJoint: true,
        difficulty: 'beginner',
        normatives: {
          beginner: { male: 35, female: 20 },
          intermediate: { male: 65, female: 40 },
          advanced: { male: 95, female: 60 }
        }
      },
      {
        key: 'pushups',
        name: 'Отжимания',
        muscleGroup: 'chest',
        muscleGroupRu: 'Грудь',
        equipment: 'bodyweight',
        isMultiJoint: true,
        difficulty: 'beginner',
        normatives: {
          beginner: { male: 10, female: 5 },
          intermediate: { male: 25, female: 15 },
          advanced: { male: 40, female: 25 }
        }
      },
      {
        key: 'dips_chest',
        name: 'Отжимания на брусьях (грудь)',
        muscleGroup: 'chest',
        muscleGroupRu: 'Грудь',
        equipment: 'bodyweight',
        isMultiJoint: true,
        difficulty: 'intermediate',
        normatives: {
          beginner: { male: 6, female: 3 },
          intermediate: { male: 15, female: 8 },
          advanced: { male: 25, female: 15 }
        }
      },
      {
        key: 'pullover',
        name: 'Пуловер',
        muscleGroup: 'chest',
        muscleGroupRu: 'Грудь',
        equipment: 'dumbbell',
        isMultiJoint: true,
        difficulty: 'intermediate',
        normatives: {
          beginner: { male: 16, female: 10 },
          intermediate: { male: 24, female: 16 },
          advanced: { male: 32, female: 22 }
        }
      },

      // ============ СПИНА (10 упражнений) ============
      {
        key: 'deadlift',
        name: 'Становая тяга',
        muscleGroup: 'back',
        muscleGroupRu: 'Спина',
        equipment: 'barbell',
        isMultiJoint: true,
        difficulty: 'advanced',
        normatives: {
          beginner: { male: 60, female: 40 },
          intermediate: { male: 120, female: 75 },
          advanced: { male: 180, female: 110 }
        }
      },
      {
        key: 'bent_over_row',
        name: 'Тяга штанги в наклоне',
        muscleGroup: 'back',
        muscleGroupRu: 'Спина',
        equipment: 'barbell',
        isMultiJoint: true,
        difficulty: 'intermediate',
        normatives: {
          beginner: { male: 40, female: 25 },
          intermediate: { male: 70, female: 45 },
          advanced: { male: 100, female: 65 }
        }
      },
      {
        key: 'pullups',
        name: 'Подтягивания',
        muscleGroup: 'back',
        muscleGroupRu: 'Спина',
        equipment: 'bodyweight',
        isMultiJoint: true,
        difficulty: 'intermediate',
        normatives: {
          beginner: { male: 5, female: 2 },
          intermediate: { male: 12, female: 6 },
          advanced: { male: 20, female: 12 }
        }
      },
      {
        key: 'lat_pulldown',
        name: 'Тяга верхнего блока',
        muscleGroup: 'back',
        muscleGroupRu: 'Спина',
        equipment: 'cable',
        isMultiJoint: true,
        difficulty: 'beginner',
        normatives: {
          beginner: { male: 40, female: 25 },
          intermediate: { male: 65, female: 40 },
          advanced: { male: 90, female: 55 }
        }
      },
      {
        key: 'seated_cable_row',
        name: 'Тяга горизонтального блока',
        muscleGroup: 'back',
        muscleGroupRu: 'Спина',
        equipment: 'cable',
        isMultiJoint: true,
        difficulty: 'beginner',
        normatives: {
          beginner: { male: 45, female: 30 },
          intermediate: { male: 70, female: 45 },
          advanced: { male: 100, female: 65 }
        }
      },
      {
        key: 'dumbbell_row',
        name: 'Тяга гантели в наклоне',
        muscleGroup: 'back',
        muscleGroupRu: 'Спина',
        equipment: 'dumbbell',
        isMultiJoint: true,
        difficulty: 'beginner',
        normatives: {
          beginner: { male: 20, female: 12 },
          intermediate: { male: 30, female: 18 },
          advanced: { male: 45, female: 25 }
        }
      },
      {
        key: 't_bar_row',
        name: 'Тяга Т-штанги',
        muscleGroup: 'back',
        muscleGroupRu: 'Спина',
        equipment: 'barbell',
        isMultiJoint: true,
        difficulty: 'intermediate',
        normatives: {
          beginner: { male: 35, female: 20 },
          intermediate: { male: 60, female: 35 },
          advanced: { male: 85, female: 50 }
        }
      },
      {
        key: 'reverse_grip_pulldown',
        name: 'Тяга верхнего блока обратным хватом',
        muscleGroup: 'back',
        muscleGroupRu: 'Спина',
        equipment: 'cable',
        isMultiJoint: true,
        difficulty: 'intermediate',
        normatives: {
          beginner: { male: 35, female: 20 },
          intermediate: { male: 60, female: 35 },
          advanced: { male: 85, female: 50 }
        }
      },
      {
        key: 'hyperextension',
        name: 'Гиперэкстензия',
        muscleGroup: 'back',
        muscleGroupRu: 'Спина',
        equipment: 'bodyweight',
        isMultiJoint: false,
        difficulty: 'beginner',
        normatives: {
          beginner: { male: 15, female: 12 },
          intermediate: { male: 25, female: 20 },
          advanced: { male: 35, female: 30 }
        }
      },
      {
        key: 'rack_pull',
        name: 'Тяга с плинтов',
        muscleGroup: 'back',
        muscleGroupRu: 'Спина',
        equipment: 'barbell',
        isMultiJoint: true,
        difficulty: 'advanced',
        normatives: {
          beginner: { male: 70, female: 45 },
          intermediate: { male: 130, female: 80 },
          advanced: { male: 190, female: 120 }
        }
      },

      // ============ НОГИ (12 упражнений) ============
      {
        key: 'squat',
        name: 'Приседания со штангой',
        muscleGroup: 'legs',
        muscleGroupRu: 'Ноги',
        equipment: 'barbell',
        isMultiJoint: true,
        difficulty: 'intermediate',
        normatives: {
          beginner: { male: 50, female: 35 },
          intermediate: { male: 100, female: 65 },
          advanced: { male: 150, female: 95 }
        }
      },
      {
        key: 'front_squat',
        name: 'Приседания со штангой на груди',
        muscleGroup: 'legs',
        muscleGroupRu: 'Ноги',
        equipment: 'barbell',
        isMultiJoint: true,
        difficulty: 'advanced',
        normatives: {
          beginner: { male: 40, female: 25 },
          intermediate: { male: 80, female: 50 },
          advanced: { male: 120, female: 75 }
        }
      },
      {
        key: 'goblet_squat',
        name: 'Приседания с гантелью',
        muscleGroup: 'legs',
        muscleGroupRu: 'Ноги',
        equipment: 'dumbbell',
        isMultiJoint: true,
        difficulty: 'beginner',
        normatives: {
          beginner: { male: 16, female: 10 },
          intermediate: { male: 24, female: 16 },
          advanced: { male: 32, female: 22 }
        }
      },
      {
        key: 'leg_press',
        name: 'Жим ногами',
        muscleGroup: 'legs',
        muscleGroupRu: 'Ноги',
        equipment: 'machine',
        isMultiJoint: true,
        difficulty: 'beginner',
        normatives: {
          beginner: { male: 100, female: 70 },
          intermediate: { male: 180, female: 120 },
          advanced: { male: 260, female: 170 }
        }
      },
      {
        key: 'hack_squat',
        name: 'Гакк-присед',
        muscleGroup: 'legs',
        muscleGroupRu: 'Ноги',
        equipment: 'machine',
        isMultiJoint: true,
        difficulty: 'intermediate',
        normatives: {
          beginner: { male: 70, female: 45 },
          intermediate: { male: 130, female: 85 },
          advanced: { male: 190, female: 125 }
        }
      },
      {
        key: 'leg_extension',
        name: 'Разгибание ног',
        muscleGroup: 'legs',
        muscleGroupRu: 'Ноги',
        equipment: 'machine',
        isMultiJoint: false,
        difficulty: 'beginner',
        normatives: {
          beginner: { male: 35, female: 25 },
          intermediate: { male: 55, female: 40 },
          advanced: { male: 80, female: 55 }
        }
      },
      {
        key: 'leg_curl',
        name: 'Сгибание ног',
        muscleGroup: 'legs',
        muscleGroupRu: 'Ноги',
        equipment: 'machine',
        isMultiJoint: false,
        difficulty: 'beginner',
        normatives: {
          beginner: { male: 30, female: 20 },
          intermediate: { male: 50, female: 35 },
          advanced: { male: 70, female: 50 }
        }
      },
      {
        key: 'leg_curl_seated',
        name: 'Сгибание ног сидя',
        muscleGroup: 'legs',
        muscleGroupRu: 'Ноги',
        equipment: 'machine',
        isMultiJoint: false,
        difficulty: 'intermediate',
        normatives: {
          beginner: { male: 35, female: 25 },
          intermediate: { male: 55, female: 40 },
          advanced: { male: 75, female: 55 }
        }
      },
      {
        key: 'lunges',
        name: 'Выпады',
        muscleGroup: 'legs',
        muscleGroupRu: 'Ноги',
        equipment: 'dumbbell',
        isMultiJoint: true,
        difficulty: 'beginner',
        normatives: {
          beginner: { male: 16, female: 10 },
          intermediate: { male: 24, female: 16 },
          advanced: { male: 32, female: 22 }
        }
      },
      {
        key: 'romanian_deadlift',
        name: 'Румынская тяга',
        muscleGroup: 'legs',
        muscleGroupRu: 'Ноги',
        equipment: 'barbell',
        isMultiJoint: true,
        difficulty: 'intermediate',
        normatives: {
          beginner: { male: 45, female: 30 },
          intermediate: { male: 80, female: 55 },
          advanced: { male: 120, female: 80 }
        }
      },
      {
        key: 'glute_bridge',
        name: 'Ягодичный мост',
        muscleGroup: 'legs',
        muscleGroupRu: 'Ноги',
        equipment: 'barbell',
        isMultiJoint: false,
        difficulty: 'beginner',
        normatives: {
          beginner: { male: 40, female: 30 },
          intermediate: { male: 70, female: 50 },
          advanced: { male: 100, female: 70 }
        }
      },
      {
        key: 'calf_raise',
        name: 'Подъем на носки',
        muscleGroup: 'legs',
        muscleGroupRu: 'Ноги',
        equipment: 'machine',
        isMultiJoint: false,
        difficulty: 'beginner',
        normatives: {
          beginner: { male: 60, female: 40 },
          intermediate: { male: 100, female: 70 },
          advanced: { male: 140, female: 100 }
        }
      },

      // ============ ПЛЕЧИ (10 упражнений) ============
      {
        key: 'overhead_press',
        name: 'Жим штанги стоя',
        muscleGroup: 'shoulders',
        muscleGroupRu: 'Плечи',
        equipment: 'barbell',
        isMultiJoint: true,
        difficulty: 'intermediate',
        normatives: {
          beginner: { male: 30, female: 20 },
          intermediate: { male: 55, female: 35 },
          advanced: { male: 80, female: 50 }
        }
      },
      {
        key: 'seated_dumbbell_press',
        name: 'Жим гантелей сидя',
        muscleGroup: 'shoulders',
        muscleGroupRu: 'Плечи',
        equipment: 'dumbbell',
        isMultiJoint: true,
        difficulty: 'beginner',
        normatives: {
          beginner: { male: 16, female: 10 },
          intermediate: { male: 24, female: 16 },
          advanced: { male: 32, female: 22 }
        }
      },
      {
        key: 'arnold_press',
        name: 'Жим Арнольда',
        muscleGroup: 'shoulders',
        muscleGroupRu: 'Плечи',
        equipment: 'dumbbell',
        isMultiJoint: true,
        difficulty: 'intermediate',
        normatives: {
          beginner: { male: 14, female: 9 },
          intermediate: { male: 22, female: 14 },
          advanced: { male: 30, female: 20 }
        }
      },
      {
        key: 'lateral_raise',
        name: 'Махи гантелями в стороны',
        muscleGroup: 'shoulders',
        muscleGroupRu: 'Плечи',
        equipment: 'dumbbell',
        isMultiJoint: false,
        difficulty: 'beginner',
        normatives: {
          beginner: { male: 6, female: 4 },
          intermediate: { male: 10, female: 6 },
          advanced: { male: 14, female: 9 }
        }
      },
      {
        key: 'cable_lateral_raise',
        name: 'Махи в кроссовере в стороны',
        muscleGroup: 'shoulders',
        muscleGroupRu: 'Плечи',
        equipment: 'cable',
        isMultiJoint: false,
        difficulty: 'intermediate',
        normatives: {
          beginner: { male: 5, female: 3 },
          intermediate: { male: 9, female: 5 },
          advanced: { male: 13, female: 8 }
        }
      },
      {
        key: 'front_raise',
        name: 'Подъем гантелей перед собой',
        muscleGroup: 'shoulders',
        muscleGroupRu: 'Плечи',
        equipment: 'dumbbell',
        isMultiJoint: false,
        difficulty: 'beginner',
        normatives: {
          beginner: { male: 6, female: 4 },
          intermediate: { male: 10, female: 6 },
          advanced: { male: 14, female: 9 }
        }
      },
      {
        key: 'cable_front_raise',
        name: 'Подъем в кроссовере перед собой',
        muscleGroup: 'shoulders',
        muscleGroupRu: 'Плечи',
        equipment: 'cable',
        isMultiJoint: false,
        difficulty: 'intermediate',
        normatives: {
          beginner: { male: 5, female: 3 },
          intermediate: { male: 9, female: 5 },
          advanced: { male: 13, female: 8 }
        }
      },
      {
        key: 'reverse_fly',
        name: 'Разводка в наклоне',
        muscleGroup: 'shoulders',
        muscleGroupRu: 'Плечи',
        equipment: 'dumbbell',
        isMultiJoint: false,
        difficulty: 'beginner',
        normatives: {
          beginner: { male: 6, female: 4 },
          intermediate: { male: 10, female: 6 },
          advanced: { male: 14, female: 9 }
        }
      },
      {
        key: 'reverse_pec_deck',
        name: 'Обратная бабочка',
        muscleGroup: 'shoulders',
        muscleGroupRu: 'Плечи',
        equipment: 'machine',
        isMultiJoint: false,
        difficulty: 'beginner',
        normatives: {
          beginner: { male: 20, female: 15 },
          intermediate: { male: 35, female: 25 },
          advanced: { male: 50, female: 35 }
        }
      },
      {
        key: 'upright_row',
        name: 'Тяга штанги к подбородку',
        muscleGroup: 'shoulders',
        muscleGroupRu: 'Плечи',
        equipment: 'barbell',
        isMultiJoint: true,
        difficulty: 'intermediate',
        normatives: {
          beginner: { male: 25, female: 15 },
          intermediate: { male: 45, female: 25 },
          advanced: { male: 65, female: 40 }
        }
      },

      // ============ БИЦЕПС (8 упражнений) ============
      {
        key: 'barbell_curl',
        name: 'Подъем штанги на бицепс',
        muscleGroup: 'biceps',
        muscleGroupRu: 'Бицепс',
        equipment: 'barbell',
        isMultiJoint: false,
        difficulty: 'beginner',
        normatives: {
          beginner: { male: 20, female: 12 },
          intermediate: { male: 35, female: 20 },
          advanced: { male: 50, female: 30 }
        }
      },
      {
        key: 'dumbbell_curl',
        name: 'Подъем гантелей на бицепс',
        muscleGroup: 'biceps',
        muscleGroupRu: 'Бицепс',
        equipment: 'dumbbell',
        isMultiJoint: false,
        difficulty: 'beginner',
        normatives: {
          beginner: { male: 10, female: 6 },
          intermediate: { male: 16, female: 10 },
          advanced: { male: 22, female: 14 }
        }
      },
      {
        key: 'hammer_curl',
        name: 'Молотковые сгибания',
        muscleGroup: 'biceps',
        muscleGroupRu: 'Бицепс',
        equipment: 'dumbbell',
        isMultiJoint: false,
        difficulty: 'beginner',
        normatives: {
          beginner: { male: 10, female: 6 },
          intermediate: { male: 16, female: 10 },
          advanced: { male: 22, female: 14 }
        }
      },
      {
        key: 'concentration_curl',
        name: 'Концентрированный подъем',
        muscleGroup: 'biceps',
        muscleGroupRu: 'Бицепс',
        equipment: 'dumbbell',
        isMultiJoint: false,
        difficulty: 'beginner',
        normatives: {
          beginner: { male: 8, female: 5 },
          intermediate: { male: 14, female: 9 },
          advanced: { male: 20, female: 12 }
        }
      },
      {
        key: 'cable_curl',
        name: 'Сгибание на блоке',
        muscleGroup: 'biceps',
        muscleGroupRu: 'Бицепс',
        equipment: 'cable',
        isMultiJoint: false,
        difficulty: 'beginner',
        normatives: {
          beginner: { male: 20, female: 12 },
          intermediate: { male: 35, female: 20 },
          advanced: { male: 50, female: 30 }
        }
      },
      {
        key: 'preacher_curl',
        name: 'Сгибания на скамье Скотта',
        muscleGroup: 'biceps',
        muscleGroupRu: 'Бицепс',
        equipment: 'barbell',
        isMultiJoint: false,
        difficulty: 'intermediate',
        normatives: {
          beginner: { male: 18, female: 10 },
          intermediate: { male: 30, female: 18 },
          advanced: { male: 45, female: 25 }
        }
      },
      {
        key: 'incline_curl',
        name: 'Сгибания на наклонной скамье',
        muscleGroup: 'biceps',
        muscleGroupRu: 'Бицепс',
        equipment: 'dumbbell',
        isMultiJoint: false,
        difficulty: 'intermediate',
        normatives: {
          beginner: { male: 8, female: 5 },
          intermediate: { male: 14, female: 9 },
          advanced: { male: 20, female: 12 }
        }
      },
      {
        key: 'bayesian_curl',
        name: 'Сгибания в кроссовере',
        muscleGroup: 'biceps',
        muscleGroupRu: 'Бицепс',
        equipment: 'cable',
        isMultiJoint: false,
        difficulty: 'intermediate',
        normatives: {
          beginner: { male: 15, female: 9 },
          intermediate: { male: 25, female: 15 },
          advanced: { male: 35, female: 20 }
        }
      },

      // ============ ТРИЦЕПС (8 упражнений) ============
      {
        key: 'close_grip_bench',
        name: 'Жим лежа узким хватом',
        muscleGroup: 'triceps',
        muscleGroupRu: 'Трицепс',
        equipment: 'barbell',
        isMultiJoint: true,
        difficulty: 'intermediate',
        normatives: {
          beginner: { male: 35, female: 20 },
          intermediate: { male: 60, female: 35 },
          advanced: { male: 90, female: 55 }
        }
      },
      {
        key: 'triceps_extension',
        name: 'Французский жим',
        muscleGroup: 'triceps',
        muscleGroupRu: 'Трицепс',
        equipment: 'barbell',
        isMultiJoint: false,
        difficulty: 'intermediate',
        normatives: {
          beginner: { male: 20, female: 12 },
          intermediate: { male: 35, female: 20 },
          advanced: { male: 50, female: 30 }
        }
      },
      {
        key: 'cable_pushdown',
        name: 'Разгибание на блоке',
        muscleGroup: 'triceps',
        muscleGroupRu: 'Трицепс',
        equipment: 'cable',
        isMultiJoint: false,
        difficulty: 'beginner',
        normatives: {
          beginner: { male: 20, female: 12 },
          intermediate: { male: 35, female: 20 },
          advanced: { male: 50, female: 30 }
        }
      },
      {
        key: 'cable_pushdown_rope',
        name: 'Разгибание на блоке с канатом',
        muscleGroup: 'triceps',
        muscleGroupRu: 'Трицепс',
        equipment: 'cable',
        isMultiJoint: false,
        difficulty: 'beginner',
        normatives: {
          beginner: { male: 18, female: 10 },
          intermediate: { male: 30, female: 18 },
          advanced: { male: 45, female: 25 }
        }
      },
      {
        key: 'dips',
        name: 'Отжимания на брусьях',
        muscleGroup: 'triceps',
        muscleGroupRu: 'Трицепс',
        equipment: 'bodyweight',
        isMultiJoint: true,
        difficulty: 'intermediate',
        normatives: {
          beginner: { male: 6, female: 3 },
          intermediate: { male: 15, female: 8 },
          advanced: { male: 25, female: 15 }
        }
      },
      {
        key: 'overhead_triceps_extension',
        name: 'Разгибание из-за головы',
        muscleGroup: 'triceps',
        muscleGroupRu: 'Трицепс',
        equipment: 'dumbbell',
        isMultiJoint: false,
        difficulty: 'beginner',
        normatives: {
          beginner: { male: 12, female: 7 },
          intermediate: { male: 20, female: 12 },
          advanced: { male: 28, female: 17 }
        }
      },
      {
        key: 'kickback',
        name: 'Разгибание в наклоне',
        muscleGroup: 'triceps',
        muscleGroupRu: 'Трицепс',
        equipment: 'dumbbell',
        isMultiJoint: false,
        difficulty: 'beginner',
        normatives: {
          beginner: { male: 8, female: 5 },
          intermediate: { male: 14, female: 9 },
          advanced: { male: 20, female: 12 }
        }
      },
      {
        key: 'bench_dips',
        name: 'Обратные отжимания',
        muscleGroup: 'triceps',
        muscleGroupRu: 'Трицепс',
        equipment: 'bodyweight',
        isMultiJoint: true,
        difficulty: 'beginner',
        normatives: {
          beginner: { male: 10, female: 6 },
          intermediate: { male: 20, female: 12 },
          advanced: { male: 30, female: 18 }
        }
      },

      // ============ ПРЕСС (6 упражнений) ============
      {
        key: 'crunches',
        name: 'Скручивания',
        muscleGroup: 'core',
        muscleGroupRu: 'Пресс',
        equipment: 'bodyweight',
        isMultiJoint: false,
        difficulty: 'beginner',
        normatives: {
          beginner: { male: 15, female: 12 },
          intermediate: { male: 30, female: 25 },
          advanced: { male: 50, female: 40 }
        }
      },
      {
        key: 'leg_raise',
        name: 'Подъем ног',
        muscleGroup: 'core',
        muscleGroupRu: 'Пресс',
        equipment: 'bodyweight',
        isMultiJoint: false,
        difficulty: 'intermediate',
        normatives: {
          beginner: { male: 10, female: 8 },
          intermediate: { male: 20, female: 15 },
          advanced: { male: 30, female: 25 }
        }
      },
      {
        key: 'hanging_leg_raise',
        name: 'Подъем ног в висе',
        muscleGroup: 'core',
        muscleGroupRu: 'Пресс',
        equipment: 'bodyweight',
        isMultiJoint: false,
        difficulty: 'advanced',
        normatives: {
          beginner: { male: 6, female: 4 },
          intermediate: { male: 15, female: 10 },
          advanced: { male: 25, female: 18 }
        }
      },
      {
        key: 'plank',
        name: 'Планка',
        muscleGroup: 'core',
        muscleGroupRu: 'Пресс',
        equipment: 'bodyweight',
        isMultiJoint: false,
        difficulty: 'beginner',
        normatives: {
          beginner: { male: 30, female: 30 },
          intermediate: { male: 60, female: 60 },
          advanced: { male: 120, female: 120 }
        }
      },
      {
        key: 'russian_twist',
        name: 'Русский твист',
        muscleGroup: 'core',
        muscleGroupRu: 'Пресс',
        equipment: 'bodyweight',
        isMultiJoint: false,
        difficulty: 'intermediate',
        normatives: {
          beginner: { male: 10, female: 8 },
          intermediate: { male: 20, female: 15 },
          advanced: { male: 30, female: 25 }
        }
      },
      {
        key: 'cable_crunch',
        name: 'Скручивания на блоке',
        muscleGroup: 'core',
        muscleGroupRu: 'Пресс',
        equipment: 'cable',
        isMultiJoint: false,
        difficulty: 'intermediate',
        normatives: {
          beginner: { male: 25, female: 15 },
          intermediate: { male: 45, female: 30 },
          advanced: { male: 65, female: 45 }
        }
      }
    ];
  }

  public static getInstance(): ExerciseDatabase {
    if (!ExerciseDatabase.instance) {
      ExerciseDatabase.instance = new ExerciseDatabase();
    }
    return ExerciseDatabase.instance;
  }

  public getAllExercises(): DatabaseExercise[] {
    return this.exercises;
  }

  public getExercisesByMuscleGroup(muscleGroup: string): DatabaseExercise[] {
    return this.exercises.filter(ex => ex.muscleGroup === muscleGroup);
  }

  // Фильтрация по оборудованию
  public getExercisesByMuscleGroupAndEquipment(
    muscleGroup: string,
    equipment: Equipment[]
  ): DatabaseExercise[] {
    return this.exercises.filter(ex => 
      ex.muscleGroup === muscleGroup && 
      equipment.includes(ex.equipment)
    );
  }

  public getExerciseByKey(key: string): DatabaseExercise | undefined {
    return this.exercises.find(ex => ex.key === key);
  }

  public getRecommendedWeight(
    exerciseKey: string,
    experience: string,
    gender: string,
    goal: string
  ): number {
    const exercise = this.exercises.find(e => e.key === exerciseKey);
    if (!exercise) return 0;

    const exp = experience as keyof typeof exercise.normatives;
    const baseWeight = exercise.normatives[exp][gender as 'male' | 'female'];
    
    // Корректировка под цель
    if (goal === 'strength') return baseWeight;
    if (goal === 'hypertrophy') return Math.round(baseWeight * 0.8);
    if (goal === 'endurance') return Math.round(baseWeight * 0.6);
    return baseWeight;
  }
}

export default ExerciseDatabase;