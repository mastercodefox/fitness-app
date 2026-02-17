import { BaseSplitStrategy, SplitConfig, MuscleGroupFrequency } from '../base/BaseSplitStrategy';

export class BroSplit extends BaseSplitStrategy {
  readonly name = 'Bro Split';
  readonly daysPerWeek = 5;
  
  readonly config: SplitConfig = {
    name: 'Bro Split',
    daysPerWeek: 5,
    workouts: [
      { day: 1, name: 'Chest', focus: ['chest'], type: 'bro' },
      { day: 2, name: 'Back', focus: ['back'], type: 'bro' },
      { day: 3, name: 'Shoulders', focus: ['shoulders'], type: 'bro' },
      { day: 4, name: 'Arms', focus: ['biceps', 'triceps'], type: 'bro' },
      { day: 5, name: 'Legs', focus: ['legs'], type: 'bro' }
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
      'core': 0
    };
  }

  getWorkoutForDay(dayIndex: number, weekOffset: number): { name: string; focus: string[] } {
    const workouts = [
      { name: 'Chest', focus: ['chest'] },
      { name: 'Back', focus: ['back'] },
      { name: 'Shoulders', focus: ['shoulders'] },
      { name: 'Arms', focus: ['biceps', 'triceps'] },
      { name: 'Legs', focus: ['legs'] }
    ];
    
    return workouts[dayIndex % workouts.length];
  }
}