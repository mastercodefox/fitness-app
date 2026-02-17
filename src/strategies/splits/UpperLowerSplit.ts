import { BaseSplitStrategy, SplitConfig, MuscleGroupFrequency } from '../base/BaseSplitStrategy';

export class UpperLowerSplit extends BaseSplitStrategy {
  readonly name = 'Upper/Lower';
  readonly daysPerWeek = 4;
  
  readonly config: SplitConfig = {
    name: 'Upper/Lower',
    daysPerWeek: 4,
    workouts: [
      { day: 1, name: 'Upper A', focus: ['chest', 'back', 'shoulders', 'biceps', 'triceps'], type: 'upperlower' },
      { day: 2, name: 'Lower A', focus: ['legs', 'core'], type: 'upperlower' },
      { day: 4, name: 'Upper B', focus: ['chest', 'back', 'shoulders', 'biceps', 'triceps'], type: 'upperlower' },
      { day: 5, name: 'Lower B', focus: ['legs', 'core'], type: 'upperlower' }
    ]
  };

  getMuscleGroupFrequency(): MuscleGroupFrequency {
    return {
      'chest': 2,
      'back': 2,
      'shoulders': 2,
      'biceps': 2,
      'triceps': 2,
      'legs': 2,
      'core': 2
    };
  }

  getWorkoutForDay(dayIndex: number, weekOffset: number): { name: string; focus: string[] } {
    const weekParity = weekOffset % 2;
    
    // Маппинг индексов дней
    const dayMap: { [key: number]: { a: string; b: string; focus: string[] } } = {
      0: { a: 'Upper A', b: 'Upper B', focus: ['chest', 'back', 'shoulders', 'biceps', 'triceps'] },
      1: { a: 'Lower A', b: 'Lower B', focus: ['legs', 'core'] },
      2: { a: 'Upper B', b: 'Upper A', focus: ['chest', 'back', 'shoulders', 'biceps', 'triceps'] },
      3: { a: 'Lower B', b: 'Lower A', focus: ['legs', 'core'] }
    };
    
    const dayInfo = dayMap[dayIndex];
    if (!dayInfo) {
      throw new Error(`Invalid day index for Upper/Lower split: ${dayIndex}`);
    }
    
    return {
      name: weekParity === 0 ? dayInfo.a : dayInfo.b,
      focus: dayInfo.focus
    };
  }
}