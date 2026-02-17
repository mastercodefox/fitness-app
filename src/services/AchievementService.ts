import { Achievement, AchievementProgress } from '../types/achievement.types';

export class AchievementService {
  
  // ========== ВСЕ ДОСТИЖЕНИЯ ==========
  static getAllAchievements(): Achievement[] {
    return [
      // ===== СИЛОВЫЕ =====
      {
        id: 'bench_100',
        title: 'Жимовая сотня',
        description: 'Пожми лёжа 100 кг',
        icon: '🏋️',
        rarity: 'rare',
        progress: 0,
        maxProgress: 100,
        completed: false,
        category: 'strength'
      },
      {
        id: 'squat_150',
        title: 'Железные ноги',
        description: 'Присядь со штангой 150 кг',
        icon: '🦵',
        rarity: 'epic',
        progress: 0,
        maxProgress: 150,
        completed: false,
        category: 'strength'
      },
      {
        id: 'deadlift_200',
        title: 'Сила земли',
        description: 'Оторви от пола 200 кг',
        icon: '🌍',
        rarity: 'legendary',
        progress: 0,
        maxProgress: 200,
        completed: false,
        category: 'strength'
      },
      {
        id: 'pr_king',
        title: 'Король рекордов',
        description: 'Установи 10 личных рекордов',
        icon: '👑',
        rarity: 'epic',
        progress: 0,
        maxProgress: 10,
        completed: false,
        category: 'strength'
      },

      // ===== ПОСТОЯНСТВО =====
      {
        id: 'first_workout',
        title: 'Первый шаг',
        description: 'Проведи первую тренировку',
        icon: '🌱',
        rarity: 'common',
        progress: 0,
        maxProgress: 1,
        completed: false,
        category: 'milestone'
      },
      {
        id: 'streak_7',
        title: 'Неделя силы',
        description: 'Тренируйся 7 дней подряд',
        icon: '🔥',
        rarity: 'rare',
        progress: 0,
        maxProgress: 7,
        completed: false,
        category: 'consistency'
      },
      {
        id: 'streak_30',
        title: 'Железный человек',
        description: '30 дней без пропусков',
        icon: '⚡',
        rarity: 'epic',
        progress: 0,
        maxProgress: 30,
        completed: false,
        category: 'consistency'
      },
      {
        id: 'workout_100',
        title: 'Ветеран',
        description: 'Проведи 100 тренировок',
        icon: '🎖️',
        rarity: 'legendary',
        progress: 0,
        maxProgress: 100,
        completed: false,
        category: 'milestone'
      },

      // ===== ОБЪЕМ =====
      {
        id: 'volume_10000',
        title: 'Тонна',
        description: 'Подними 10 000 кг за все время',
        icon: '🏋️‍♂️',
        rarity: 'common',
        progress: 0,
        maxProgress: 10000,
        completed: false,
        category: 'volume'
      },
      {
        id: 'volume_50000',
        title: 'Полувагон',
        description: '50 000 кг общего объема',
        icon: '🚂',
        rarity: 'rare',
        progress: 0,
        maxProgress: 50000,
        completed: false,
        category: 'volume'
      },
      {
        id: 'volume_100000',
        title: 'Стотонник',
        description: '100 000 кг — это вес грузовика!',
        icon: '🚛',
        rarity: 'epic',
        progress: 0,
        maxProgress: 100000,
        completed: false,
        category: 'volume'
      },
      {
        id: 'sets_1000',
        title: 'Тысяча подходов',
        description: 'Выполни 1000 рабочих подходов',
        icon: '🔄',
        rarity: 'rare',
        progress: 0,
        maxProgress: 1000,
        completed: false,
        category: 'volume'
      },

      // ===== ОСОБЫЕ =====
      {
        id: 'deload_master',
        title: 'Умник',
        description: 'Вовремя сделай разгрузку',
        icon: '🧠',
        rarity: 'rare',
        progress: 0,
        maxProgress: 1,
        completed: false,
        category: 'special'
      },
      {
        id: 'plateau_breaker',
        title: 'Разрушитель плато',
        description: 'Преодолей застой в 4+ недели',
        icon: '⛰️',
        rarity: 'epic',
        progress: 0,
        maxProgress: 1,
        completed: false,
        category: 'special'
      },
      {
        id: 'perfect_form',
        title: 'Технарь',
        description: 'Заверши тренировку с RPE 8-9 без ошибок',
        icon: '🎯',
        rarity: 'rare',
        progress: 0,
        maxProgress: 1,
        completed: false,
        category: 'special'
      }
    ];
  }

  // ========== ПРОВЕРКА ПРОГРЕССА ==========
  static checkAchievements(
    achievements: Achievement[],
    progress: AchievementProgress,
    newPRs: { exercise: string; weight: number }[]
  ): Achievement[] {
    const updated = [...achievements];

    // Силовые
    this.updateStrengthAchievements(updated, newPRs);
    
    // Постоянство
    this.updateConsistencyAchievements(updated, progress);
    
    // Объем
    this.updateVolumeAchievements(updated, progress);
    
    // Особые
    this.updateSpecialAchievements(updated, progress);

    return updated;
  }

  private static updateStrengthAchievements(
    achievements: Achievement[],
    newPRs: { exercise: string; weight: number }[]
  ) {
    // Жим 100
    const bench = achievements.find(a => a.id === 'bench_100');
    if (bench) {
      const benchPR = newPRs.find(pr => pr.exercise.toLowerCase().includes('жим'));
      if (benchPR) {
        bench.progress = Math.max(bench.progress, benchPR.weight);
        if (benchPR.weight >= bench.maxProgress && !bench.completed) {
          bench.completed = true;
          bench.completedAt = new Date().toISOString();
        }
      }
    }

    // Присед 150
    const squat = achievements.find(a => a.id === 'squat_150');
    if (squat) {
      const squatPR = newPRs.find(pr => pr.exercise.toLowerCase().includes('присед'));
      if (squatPR) {
        squat.progress = Math.max(squat.progress, squatPR.weight);
        if (squatPR.weight >= squat.maxProgress && !squat.completed) {
          squat.completed = true;
          squat.completedAt = new Date().toISOString();
        }
      }
    }

    // Становая 200
    const deadlift = achievements.find(a => a.id === 'deadlift_200');
    if (deadlift) {
      const deadliftPR = newPRs.find(pr => 
        pr.exercise.toLowerCase().includes('становая') || 
        pr.exercise.toLowerCase().includes('тяга')
      );
      if (deadliftPR) {
        deadlift.progress = Math.max(deadlift.progress, deadliftPR.weight);
        if (deadliftPR.weight >= deadlift.maxProgress && !deadlift.completed) {
          deadlift.completed = true;
          deadlift.completedAt = new Date().toISOString();
        }
      }
    }

    // Король рекордов
    const prKing = achievements.find(a => a.id === 'pr_king');
    if (prKing) {
      prKing.progress = Math.min(newPRs.length, prKing.maxProgress);
      if (prKing.progress >= prKing.maxProgress && !prKing.completed) {
        prKing.completed = true;
        prKing.completedAt = new Date().toISOString();
      }
    }
  }

  private static updateConsistencyAchievements(
    achievements: Achievement[],
    progress: AchievementProgress
  ) {
    // Первая тренировка
    const first = achievements.find(a => a.id === 'first_workout');
    if (first && progress.totalWorkouts >= 1 && !first.completed) {
      first.progress = 1;
      first.completed = true;
      first.completedAt = new Date().toISOString();
    }

    // Неделя силы
    const streak7 = achievements.find(a => a.id === 'streak_7');
    if (streak7) {
      streak7.progress = Math.min(progress.currentStreak, streak7.maxProgress);
      if (progress.currentStreak >= streak7.maxProgress && !streak7.completed) {
        streak7.completed = true;
        streak7.completedAt = new Date().toISOString();
      }
    }

    // Железный человек
    const streak30 = achievements.find(a => a.id === 'streak_30');
    if (streak30) {
      streak30.progress = Math.min(progress.currentStreak, streak30.maxProgress);
      if (progress.currentStreak >= streak30.maxProgress && !streak30.completed) {
        streak30.completed = true;
        streak30.completedAt = new Date().toISOString();
      }
    }

    // Ветеран
    const veteran = achievements.find(a => a.id === 'workout_100');
    if (veteran) {
      veteran.progress = Math.min(progress.totalWorkouts, veteran.maxProgress);
      if (progress.totalWorkouts >= veteran.maxProgress && !veteran.completed) {
        veteran.completed = true;
        veteran.completedAt = new Date().toISOString();
      }
    }
  }

  private static updateVolumeAchievements(
    achievements: Achievement[],
    progress: AchievementProgress
  ) {
    // Тонна
    const ton = achievements.find(a => a.id === 'volume_10000');
    if (ton) {
      ton.progress = Math.min(progress.totalVolume, ton.maxProgress);
      if (progress.totalVolume >= ton.maxProgress && !ton.completed) {
        ton.completed = true;
        ton.completedAt = new Date().toISOString();
      }
    }

    // Полувагон
    const halfTrain = achievements.find(a => a.id === 'volume_50000');
    if (halfTrain) {
      halfTrain.progress = Math.min(progress.totalVolume, halfTrain.maxProgress);
      if (progress.totalVolume >= halfTrain.maxProgress && !halfTrain.completed) {
        halfTrain.completed = true;
        halfTrain.completedAt = new Date().toISOString();
      }
    }

    // Стотонник
    const truck = achievements.find(a => a.id === 'volume_100000');
    if (truck) {
      truck.progress = Math.min(progress.totalVolume, truck.maxProgress);
      if (progress.totalVolume >= truck.maxProgress && !truck.completed) {
        truck.completed = true;
        truck.completedAt = new Date().toISOString();
      }
    }

    // Тысяча подходов
    const sets = achievements.find(a => a.id === 'sets_1000');
    if (sets) {
      sets.progress = Math.min(progress.totalSets, sets.maxProgress);
      if (progress.totalSets >= sets.maxProgress && !sets.completed) {
        sets.completed = true;
        sets.completedAt = new Date().toISOString();
      }
    }
  }

  private static updateSpecialAchievements(
    achievements: Achievement[],
    progress: AchievementProgress
  ) {
    // Умник (разгрузка)
    const deload = achievements.find(a => a.id === 'deload_master');
    if (deload && progress.deloads >= 1 && !deload.completed) {
      deload.progress = 1;
      deload.completed = true;
      deload.completedAt = new Date().toISOString();
    }

    // Разрушитель плато
    const breaker = achievements.find(a => a.id === 'plateau_breaker');
    if (breaker && progress.plateaus >= 1 && !breaker.completed) {
      breaker.progress = 1;
      breaker.completed = true;
      breaker.completedAt = new Date().toISOString();
    }
  }
}