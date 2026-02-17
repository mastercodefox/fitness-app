import { BaseSplitStrategy, SplitConfig, MuscleGroupFrequency } from '../base/BaseSplitStrategy';

export class PPLSplit extends BaseSplitStrategy {
  readonly name = 'Push/Pull/Legs';
  readonly daysPerWeek = 3;
  
  readonly config: SplitConfig = {
    name: 'Push/Pull/Legs',
    daysPerWeek: 3,
    workouts: [
      { day: 1, name: 'Push', focus: ['chest', 'shoulders', 'triceps'], type: 'ppl' },
      { day: 2, name: 'Pull', focus: ['back', 'biceps'], type: 'ppl' },
      { day: 3, name: 'Legs', focus: ['legs', 'core'], type: 'ppl' }
    ]
  };

  getMuscleGroupFrequency(): MuscleGroupFrequency {
    return {
      'chest': 1,
      'back': 1,
      'shoulders': 1,
      'biceps': 1,
      'triceps': 1,
      'legs': 1,
      'core': 1
    };
  }

  getWorkoutForDay(dayIndex: number, weekOffset: number): { name: string; focus: string[] } {
    const workouts = [
      { name: 'Push', focus: ['chest', 'shoulders', 'triceps'] },
      { name: 'Pull', focus: ['back', 'biceps'] },
      { name: 'Legs', focus: ['legs', 'core'] }
    ];
    
    return workouts[dayIndex % workouts.length];
  }
}