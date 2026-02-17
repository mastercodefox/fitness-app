import { WorkoutSplit, ExperienceLevel } from './workout.types';

export type CyclePhase = 'build' | 'peak' | 'deload' | 'test';
export type CycleType = 'beginner' | 'intermediate' | 'advanced';

// НОВЫЙ ТИП: стратегии периодизации
export type PeriodizationType = 
  | 'linear'           // Линейная (классическая)
  | 'undulating'       // Волновая (DUP)
  | 'block'            // Блоковая
  | 'conjugate'        // Конъюгированная (Westside)
  | 'auto';            // Авто-регуляция (RPE based)

// НОВЫЙ ИНТЕРФЕЙС: опции периодизации
export interface PeriodizationOption {
  id: PeriodizationType;
  name: string;
  description: string;
  longDescription: string;
  icon: string;
  suitableFor: ExperienceLevel[];
  weekCount: number;
  pros: string[];
  cons: string[];
}

export interface TrainingCycle {
  id: string;
  name: string;
  type: CycleType;
  periodizationType: PeriodizationType; // Добавлено
  weekCount: number;
  currentWeek: number;
  weeks: CycleWeek[];
  startDate: string;
  endDate: string;
  split: WorkoutSplit;
  completed: boolean;
}

export interface CycleWeek {
  weekNumber: number;
  phase: CyclePhase;
  volumeMultiplier: number;
  intensityMultiplier: number;
  rpeTarget: [number, number];
  description: string;
  focus: string;
  isDeload?: boolean;
  specialInstructions?: string;
}

export interface CycleRecommendation {
  type: CycleType;
  name: string;
  description: string;
  weeks: number;
  suitableFor: ExperienceLevel[];
  periodizationTypes: PeriodizationType[]; // Какие стратегии доступны
}