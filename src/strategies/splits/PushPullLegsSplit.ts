import { BaseSplitStrategy, SplitConfig, MuscleGroupFrequency } from '../base/BaseSplitStrategy';

export class PushPullLegsSplit extends BaseSplitStrategy {
  readonly name = 'Push/Pull/Legs (6x)';
  readonly daysPerWeek = 6;
  
  readonly config: SplitConfig = {
    name: 'Push/Pull/Legs (6x)',
    daysPerWeek: 6,
    workouts: [
      { day: 1, name: 'Push A', focus: ['chest', 'shoulders', 'triceps'], type: 'pushpulllegs' },
      { day: 2, name: 'Pull A', focus: ['back', 'biceps'], type: 'pushpulllegs' },
      { day: 3, name: 'Legs A', focus: ['legs'], type: 'pushpulllegs' },
      { day: 4, name: 'Push B', focus: ['chest', 'shoulders', 'triceps'], type: 'pushpulllegs' },
      { day: 5, name: 'Pull B', focus: ['back', 'biceps'], type: 'pushpulllegs' },
      { day: 6, name: 'Legs B', focus: ['legs', 'core'], type: 'pushpulllegs' }
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
      'core': 1
    };
  }

  getWorkoutForDay(dayIndex: number, weekOffset: number): { name: string; focus: string[] } {
    const weekParity = weekOffset % 2;
    
    const dayMap: { [key: number]: { a: string; b: string; focus: string[] } } = {
      0: { a: 'Push A', b: 'Push B', focus: ['chest', 'shoulders', 'triceps'] },
      1: { a: 'Pull A', b: 'Pull B', focus: ['back', 'biceps'] },
      2: { a: 'Legs A', b: 'Legs B', focus: ['legs'] },
      3: { a: 'Push B', b: 'Push A', focus: ['chest', 'shoulders', 'triceps'] },
      4: { a: 'Pull B', b: 'Pull A', focus: ['back', 'biceps'] },
      5: { a: 'Legs B', b: 'Legs A', focus: ['legs', 'core'] }
    };
    
    const dayInfo = dayMap[dayIndex];
    if (!dayInfo) {
      throw new Error(`Invalid day index for Push/Pull/Legs split: ${dayIndex}`);
    }
    
    return {
      name: weekParity === 0 ? dayInfo.a : dayInfo.b,
      focus: dayInfo.focus
    };
  }
}