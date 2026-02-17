import { WorkoutSplit, SplitConfig, ExperienceLevel, WorkoutDay } from '../types/workout.types';

export class SplitService {
  private static readonly SPLIT_CONFIGS: Record<WorkoutSplit, SplitConfig> = {
    fullbody: {
      name: 'Full Body',
      daysPerWeek: 3,
      rotationLength: 7,
      workouts: [
        { day: 1, name: 'Full Body A', focus: ['chest', 'back', 'legs', 'shoulders'], type: 'fullbody' },
        { day: 3, name: 'Full Body B', focus: ['chest', 'back', 'legs', 'biceps', 'triceps'], type: 'fullbody' },
        { day: 5, name: 'Full Body C', focus: ['chest', 'back', 'legs', 'shoulders', 'biceps', 'triceps'], type: 'fullbody' }
      ]
    },
    upperlower: {
      name: 'Upper/Lower',
      daysPerWeek: 4,
      rotationLength: 7,
      workouts: [
        { day: 1, name: 'Upper A', focus: ['chest', 'back', 'shoulders', 'biceps', 'triceps'], type: 'upperlower' },
        { day: 2, name: 'Lower A', focus: ['legs', 'core'], type: 'upperlower' },
        { day: 4, name: 'Upper B', focus: ['chest', 'back', 'shoulders', 'biceps', 'triceps'], type: 'upperlower' },
        { day: 5, name: 'Lower B', focus: ['legs', 'core'], type: 'upperlower' }
      ]
    },
    ppl: {
      name: 'Push/Pull/Legs',
      daysPerWeek: 3,
      rotationLength: 5,
      workouts: [
        { day: 1, name: 'Push', focus: ['chest', 'shoulders', 'triceps'], type: 'ppl' },
        { day: 2, name: 'Pull', focus: ['back', 'biceps'], type: 'ppl' },
        { day: 3, name: 'Legs', focus: ['legs', 'core'], type: 'ppl' }
      ]
    },
    pushpulllegs: {
      name: 'Push/Pull/Legs (6x)',
      daysPerWeek: 6,
      rotationLength: 7,
      workouts: [
        { day: 1, name: 'Push A', focus: ['chest', 'shoulders', 'triceps'], type: 'pushpulllegs' },
        { day: 2, name: 'Pull A', focus: ['back', 'biceps'], type: 'pushpulllegs' },
        { day: 3, name: 'Legs A', focus: ['legs'], type: 'pushpulllegs' },
        { day: 4, name: 'Push B', focus: ['chest', 'shoulders', 'triceps'], type: 'pushpulllegs' },
        { day: 5, name: 'Pull B', focus: ['back', 'biceps'], type: 'pushpulllegs' },
        { day: 6, name: 'Legs B', focus: ['legs', 'core'], type: 'pushpulllegs' }
      ]
    },
    bro: {
      name: 'Bro Split',
      daysPerWeek: 5,
      rotationLength: 7,
      workouts: [
        { day: 1, name: 'Chest', focus: ['chest'], type: 'bro' },
        { day: 2, name: 'Back', focus: ['back'], type: 'bro' },
        { day: 3, name: 'Shoulders', focus: ['shoulders'], type: 'bro' },
        { day: 4, name: 'Arms', focus: ['biceps', 'triceps'], type: 'bro' },
        { day: 5, name: 'Legs', focus: ['legs'], type: 'bro' }
      ]
    }
  };

  public static recommendSplit(experience: ExperienceLevel): WorkoutSplit {
    switch (experience) {
      case 'beginner': return 'fullbody';
      case 'intermediate': return 'upperlower';
      case 'advanced': return 'ppl';
      default: return 'fullbody';
    }
  }

  public static getSplitConfig(split: WorkoutSplit): SplitConfig {
    return this.SPLIT_CONFIGS[split];
  }

  // Получить понедельник любой недели
  public static getMondayOfWeek(date: Date = new Date(), weekOffset: number = 0): Date {
    const monday = new Date(date);
    monday.setHours(12, 0, 0, 0);
    
    const currentDay = monday.getDay();
    const daysToMonday = currentDay === 0 ? 6 : currentDay - 1;
    monday.setDate(monday.getDate() - daysToMonday);
    monday.setDate(monday.getDate() + (weekOffset * 7));
    
    return monday;
  }

  // Получить все дни конкретной недели
  public static getWeekDays(date: Date = new Date()): Date[] {
    const monday = this.getMondayOfWeek(date);
    const week: Date[] = [];
    
    for (let i = 0; i < 7; i++) {
      const day = new Date(monday);
      day.setDate(monday.getDate() + i);
      day.setHours(12, 0, 0, 0);
      week.push(day);
    }
    
    return week;
  }

  // Найти тренировку на конкретную дату
  public static findWorkoutByDate(workouts: WorkoutDay[], date: Date): WorkoutDay | undefined {
    const searchDate = new Date(date);
    searchDate.setHours(0, 0, 0, 0);
    
    return workouts.find(w => {
      const workoutDate = new Date(w.plannedDate);
      workoutDate.setHours(0, 0, 0, 0);
      return workoutDate.getTime() === searchDate.getTime();
    });
  }

  // Получить тренировки для отображения
  public static getWeekDisplay(
    workouts: WorkoutDay[],
    baseDate: Date = new Date(),
    weekOffset: number = 0
  ): { date: Date; workout: WorkoutDay | null }[] {
    const monday = this.getMondayOfWeek(baseDate, weekOffset);
    const display: { date: Date; workout: WorkoutDay | null }[] = [];
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(monday);
      date.setDate(monday.getDate() + i);
      date.setHours(12, 0, 0, 0);
      
      const workout = this.findWorkoutByDate(workouts, date);
      
      display.push({
        date,
        workout: workout || null
      });
    }
    
    return display;
  }

  // Получить тренировки для отображения месяца
  public static getMonthDisplay(
    workouts: WorkoutDay[],
    baseDate: Date = new Date(),
    monthOffset: number = 0
  ): { date: Date; workout: WorkoutDay | null }[][] {
    const month: { date: Date; workout: WorkoutDay | null }[][] = [];
    
    const sortedWorkouts = [...workouts].sort((a, b) => 
      new Date(a.plannedDate).getTime() - new Date(b.plannedDate).getTime()
    );
    
    for (let week = 0; week < 4; week++) {
      const weekOffset = (monthOffset * 4) + week;
      const weekDisplay = this.getWeekDisplay(sortedWorkouts, baseDate, weekOffset);
      month.push(weekDisplay);
    }
    
    return month;
  }

  public static getTodayWorkout(weekDays: WorkoutDay[]): WorkoutDay | null {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return weekDays.find(day => {
      const dayDate = new Date(day.plannedDate);
      dayDate.setHours(0, 0, 0, 0);
      return dayDate.getTime() === today.getTime() && !day.completed;
    }) || null;
  }

  public static getCurrentWeek(allWeeks: WorkoutDay[]): WorkoutDay[] {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    
    const weekStart = this.getMondayOfWeek(now, 0);
    weekStart.setHours(0, 0, 0, 0);
    
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    weekEnd.setHours(23, 59, 59, 999);
    
    return allWeeks.filter(day => {
      const date = new Date(day.plannedDate);
      date.setHours(0, 0, 0, 0);
      return date >= weekStart && date <= weekEnd;
    }).sort((a, b) => 
      new Date(a.plannedDate).getTime() - new Date(b.plannedDate).getTime()
    );
  }

  public static getUpcomingWeeks(allWeeks: WorkoutDay[], weeks: number = 4): WorkoutDay[] {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    
    const futureDate = new Date(now);
    futureDate.setDate(futureDate.getDate() + (weeks * 7));
    futureDate.setHours(23, 59, 59, 999);
    
    return allWeeks.filter(day => {
      const date = new Date(day.plannedDate);
      date.setHours(0, 0, 0, 0);
      return date >= now && date <= futureDate;
    }).sort((a, b) => 
      new Date(a.plannedDate).getTime() - new Date(b.plannedDate).getTime()
    );
  }

  public static needsNewCycle(allWeeks: WorkoutDay[], cycleLength: number = 4): boolean {
    const upcomingWeeks = this.getUpcomingWeeks(allWeeks, cycleLength);
    return upcomingWeeks.length < cycleLength * 7;
  }
}

export default SplitService;