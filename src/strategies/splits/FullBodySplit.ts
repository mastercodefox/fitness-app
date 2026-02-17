import { BaseSplitStrategy, SplitConfig, MuscleGroupFrequency } from '../base/BaseSplitStrategy';

export class FullBodySplit extends BaseSplitStrategy {
  readonly name = 'Full Body';
  readonly daysPerWeek = 3;
  
  readonly config: SplitConfig = {
    name: 'Full Body',
    daysPerWeek: 3,
    workouts: [
      { day: 1, name: 'Full Body A', focus: ['chest', 'back', 'legs', 'shoulders'], type: 'fullbody' },
      { day: 3, name: 'Full Body B', focus: ['chest', 'back', 'legs', 'biceps', 'triceps'], type: 'fullbody' },
      { day: 5, name: 'Full Body C', focus: ['chest', 'back', 'legs', 'shoulders', 'biceps', 'triceps'], type: 'fullbody' }
    ]
  };

  getMuscleGroupFrequency(): MuscleGroupFrequency {
    return {
      'chest': 3,
      'back': 3,
      'legs': 3,
      'shoulders': 2,
      'biceps': 2,
      'triceps': 2,
      'core': 1
    };
  }

  getWorkoutForDay(dayIndex: number, weekOffset: number): { name: string; focus: string[] } {
    const workouts = [
      { name: 'Full Body A', focus: ['chest', 'back', 'legs', 'shoulders'] },
      { name: 'Full Body B', focus: ['chest', 'back', 'legs', 'biceps', 'triceps'] },
      { name: 'Full Body C', focus: ['chest', 'back', 'legs', 'shoulders', 'biceps', 'triceps'] }
    ];
    
    return workouts[dayIndex % workouts.length];
  }
}