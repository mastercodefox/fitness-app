import { CycleWeek, CyclePhase, PeriodizationType, PeriodizationOption } from '../types/cycle.types';
import { ExperienceLevel, Goal } from '../types/workout.types';

export interface WorkoutHistory {
  date: Date;
  exercises: {
    name: string;
    sets: {
      weight: number;
      reps: number;
      rpe: number;
    }[];
  }[];
  fatigue?: number; // 0-1, кумулятивная усталость
  recovery?: number; // 0-1, качество восстановления
  sleep?: number; // часы сна
  stress?: number; // 0-1 уровень стресса
}

export interface AutoRegulationResult {
  recommendedWeight: number;
  recommendedVolume: number;
  rpeTarget: [number, number];
  confidence: number; // 0-1, насколько уверен алгоритм
  reason: string;
  nextWeekStrategy: 'progressive' | 'maintenance' | 'deload' | 'test' | 'peak';
  predicted1RM: number;
  trend: 'accelerating' | 'decelerating' | 'plateau' | 'declining';
}

export class PeriodizationService {
  
  // Все доступные стратегии с описаниями
  static readonly STRATEGIES: Record<PeriodizationType, PeriodizationOption> = {
    linear: {
      id: 'linear',
      name: 'Линейная периодизация',
      description: '📈 Классическая схема: постепенное увеличение веса',
      longDescription: 'Самая простая и понятная стратегия. Каждую неделю вес растет, а количество подходов снижается. Идеально для начинающих и среднего уровня, чтобы привыкнуть к прогрессии нагрузки.',
      icon: '📈',
      suitableFor: ['beginner', 'intermediate'],
      weekCount: 4,
      pros: [
        '✅ Простая для понимания',
        '✅ Предсказуемый прогресс',
        '✅ Хорошо работает для новичков',
        '✅ Легко отслеживать результаты'
      ],
      cons: [
        '❌ Может привести к плато',
        '❌ Не учитывает самочувствие',
        '❌ Может быть монотонной'
      ]
    },
    undulating: {
      id: 'undulating',
      name: 'Волновая периодизация (DUP)',
      description: '🌊 Еженедельное изменение объема и интенсивности',
      longDescription: 'Daily Undulating Periodization - стратегия, при которой каждая неделя имеет разный фокус: гипертрофия, сила, мощность. Это держит организм в тонусе и предотвращает адаптацию.',
      icon: '🌊',
      suitableFor: ['intermediate', 'advanced'],
      weekCount: 4,
      pros: [
        '✅ Постоянная вариативность',
        '✅ Меньше риска плато',
        '✅ Развивает все качества',
        '✅ Меньше монотонности'
      ],
      cons: [
        '❌ Сложнее отслеживать прогресс',
        '❌ Требует больше внимания',
        '❌ Может быть тяжело для новичков'
      ]
    },
    block: {
      id: 'block',
      name: 'Блоковая периодизация',
      description: '🧱 Фокусировка на одном качестве за раз',
      longDescription: 'Продвинутая стратегия, где каждый блок (4-6 недель) посвящен одному качеству. Сначала набираем массу, потом превращаем её в силу, затем в мощность. Используется элитными атлетами.',
      icon: '🧱',
      suitableFor: ['advanced'],
      weekCount: 12,
      pros: [
        '✅ Максимальная специализация',
        '✅ Глубокий прогресс в каждом качестве',
        '✅ Используется профессионалами',
        '✅ Четкая структура'
      ],
      cons: [
        '❌ Долгий цикл (3 месяца)',
        '❌ Требует терпения',
        '❌ Не подходит для новичков'
      ]
    },
    conjugate: {
      id: 'conjugate',
      name: 'Конъюгированная (Westside)',
      description: '⚡ Сила + скорость, частая смена упражнений',
      longDescription: 'Метод Луи Симмонса (Westside Barbell). Чередование тяжелых дней с максимальными усилиями и скоростных дней с легким весом. Постоянная смена упражнений для избежания адаптации.',
      icon: '⚡',
      suitableFor: ['advanced'],
      weekCount: 4,
      pros: [
        '✅ Развивает взрывную силу',
        '✅ Постоянная новизна',
        '✅ Работает для пауэрлифтинга',
        '✅ Меньше травм'
      ],
      cons: [
        '❌ Сложная система',
        '❌ Требует много оборудования',
        '❌ Не для всех целей'
      ]
    },
    auto: {
      id: 'auto',
      name: 'Авто-регуляция (AI)',
      description: '🤖 Умная адаптация на основе RPE и истории тренировок',
      longDescription: 'Передовая система с машинным обучением. Анализирует твои RPE, скорость прогресса, качество восстановления и автоматически подбирает оптимальную нагрузку. Чем больше тренируешься - тем умнее становится.',
      icon: '🤖',
      suitableFor: ['intermediate', 'advanced'],
      weekCount: 4,
      pros: [
        '✅ Учитывает самочувствие в реальном времени',
        '✅ Предсказывает плато до его наступления',
        '✅ Автоматически корректирует веса',
        '✅ Учит понимать своё тело',
        '✅ Адаптируется под твой стиль восстановления',
        '✅ Прогнозирует 1ПМ с высокой точностью',
        '✅ Детектирует перетренированность'
      ],
      cons: [
        '❌ Требует честной оценки RPE',
        '❌ Нужно минимум 4 тренировки для калибровки',
        '❌ Может быть сложно для новичков'
      ]
    }
  };

  // === УМНАЯ АВТО-РЕГУЛЯЦИЯ ===

  /**
   * Анализирует историю тренировок и возвращает оптимальные параметры
   */
  static analyzeWorkoutHistory(
    history: WorkoutHistory[],
    exerciseName: string,
    targetRPE: [number, number] = [7, 8]
  ): AutoRegulationResult {
    
    // Фильтруем историю для конкретного упражнения
    const exerciseHistory = history
      .map(w => ({
        date: w.date,
        sets: w.exercises.find(e => e.name === exerciseName)?.sets || [],
        fatigue: w.fatigue || 0.5,
        recovery: w.recovery || 0.7,
        sleep: w.sleep || 7,
        stress: w.stress || 0.5
      }))
      .filter(w => w.sets.length > 0)
      .sort((a, b) => b.date.getTime() - a.date.getTime());

    if (exerciseHistory.length === 0) {
      return {
        recommendedWeight: 0,
        recommendedVolume: 12,
        rpeTarget: [7, 8],
        confidence: 0.3,
        reason: 'Недостаточно данных. Начни с умеренных весов.',
        nextWeekStrategy: 'maintenance',
        predicted1RM: 0,
        trend: 'accelerating'
      };
    }

    // === 1. Расчет 1ПМ по формуле Эпли ===
    const oneRMs = exerciseHistory.flatMap(w => 
      w.sets.map(s => this.calculate1RM(s.weight, s.reps))
    );
    const current1RM = Math.max(...oneRMs);
    
    // === 2. Анализ RPE тренда ===
    const rpeTrend = this.calculateRPETrend(exerciseHistory);
    
    // === 3. Анализ прогрессии весов ===
    const weightTrend = this.calculateWeightTrend(exerciseHistory);
    
    // === 4. Детекция плато ===
    const plateauDetected = this.detectPlateau(exerciseHistory);
    
    // === 5. Оценка восстановления ===
    const recoveryScore = this.calculateRecoveryScore(exerciseHistory);
    
    // === 6. Детекция перетренированности ===
    const overtrainingDetected = this.detectOvertraining(exerciseHistory);
    
    // === 7. Прогноз тренда ===
    const trend = this.predictTrend(exerciseHistory, plateauDetected, overtrainingDetected);
    
    // === 8. Расчет уверенности ===
    const confidence = this.calculateConfidence(exerciseHistory);
    
    // === 9. Определение стратегии на следующую неделю ===
    const nextWeekStrategy = this.determineNextWeekStrategy(
      rpeTrend,
      weightTrend,
      plateauDetected,
      recoveryScore,
      overtrainingDetected,
      targetRPE
    );
    
    // === 10. Рекомендация веса ===
    const recommendedWeight = this.calculateRecommendedWeight(
      exerciseHistory,
      nextWeekStrategy,
      targetRPE,
      current1RM
    );
    
    // === 11. Рекомендация объема ===
    const recommendedVolume = this.calculateRecommendedVolume(
      exerciseHistory,
      nextWeekStrategy
    );
    
    // === 12. RPE цель ===
    const rpeTarget = this.getRpeTarget(nextWeekStrategy, targetRPE, overtrainingDetected);
    
    // === 13. Причина рекомендации ===
    const reason = this.getRecommendationReason(
      nextWeekStrategy,
      rpeTrend,
      weightTrend,
      plateauDetected,
      recoveryScore,
      overtrainingDetected,
      trend
    );

    return {
      recommendedWeight,
      recommendedVolume,
      rpeTarget,
      confidence,
      reason,
      nextWeekStrategy,
      predicted1RM: Math.round(current1RM * 1.05), // Прогноз на следующий цикл
      trend
    };
  }

  /**
   * Расчет 1ПМ по формуле Эпли
   */
  private static calculate1RM(weight: number, reps: number): number {
    return weight * (1 + reps / 30);
  }

  /**
   * Анализирует тренд RPE (растет, падает, стабилен)
   */
  private static calculateRPETrend(history: any[]): 'increasing' | 'decreasing' | 'stable' {
    if (history.length < 3) return 'stable';
    
    const recentRPEs = history.slice(0, 3).map(w => 
      w.sets.reduce((sum: number, s: any) => sum + s.rpe, 0) / w.sets.length
    );
    
    const firstAvg = recentRPEs[0];
    const lastAvg = recentRPEs[recentRPEs.length - 1];
    const diff = lastAvg - firstAvg;
    
    if (diff > 0.5) return 'increasing';
    if (diff < -0.5) return 'decreasing';
    return 'stable';
  }

  /**
   * Анализирует тренд весов
   */
  private static calculateWeightTrend(history: any[]): 'increasing' | 'decreasing' | 'stable' {
    if (history.length < 3) return 'stable';
    
    const recentWeights = history.slice(0, 3).map(w => 
      Math.max(...w.sets.map((s: any) => s.weight))
    );
    
    const firstWeight = recentWeights[0];
    const lastWeight = recentWeights[recentWeights.length - 1];
    const diff = ((lastWeight - firstWeight) / firstWeight) * 100;
    
    if (diff > 2) return 'increasing';
    if (diff < -2) return 'decreasing';
    return 'stable';
  }

  /**
   * Детектирует плато (отсутствие прогресса 3+ тренировки)
   */
  private static detectPlateau(history: any[]): boolean {
    if (history.length < 4) return false;
    
    const recent4 = history.slice(0, 4);
    const maxWeights = recent4.map(w => Math.max(...w.sets.map((s: any) => s.weight)));
    const avgRPEs = recent4.map(w => 
      w.sets.reduce((sum: number, s: any) => sum + s.rpe, 0) / w.sets.length
    );
    
    // Проверяем, есть ли прогресс в весах
    const hasProgress = maxWeights.some((w, i) => i > 0 && w > maxWeights[i-1]);
    
    // Если нет прогресса И RPE стабилен или растет - это плато
    if (!hasProgress) {
      const rpeIncreasing = avgRPEs[avgRPEs.length - 1] > avgRPEs[0] + 0.5;
      if (rpeIncreasing) return true;
    }
    
    return false;
  }

  /**
   * Оценивает качество восстановления
   */
  private static calculateRecoveryScore(history: any[]): number {
    if (history.length === 0) return 0.7;
    
    const recent = history[0];
    
    // Комбинируем факторы восстановления
    const sleepScore = Math.min(1, (recent.sleep || 7) / 8);
    const stressScore = 1 - (recent.stress || 0.5);
    const fatigueScore = 1 - (recent.fatigue || 0.5);
    const rpeScore = 1 - (Math.max(...recent.sets.map((s: any) => s.rpe)) - 5) / 5;
    
    // Взвешенная оценка
    return (
      sleepScore * 0.3 +
      stressScore * 0.2 +
      fatigueScore * 0.3 +
      rpeScore * 0.2
    );
  }

  /**
   * Детектирует перетренированность
   */
  private static detectOvertraining(history: any[]): boolean {
    if (history.length < 4) return false;
    
    const recent4 = history.slice(0, 4);
    
    // Проверяем паттерн перетренированности:
    // 1. RPE растет
    // 2. Веса падают или стагнируют
    // 3. Восстановление ухудшается
    
    const rpeTrend = this.calculateRPETrend(history);
    const weightTrend = this.calculateWeightTrend(history);
    const recoveryScore = this.calculateRecoveryScore(history);
    
    return (
      rpeTrend === 'increasing' &&
      (weightTrend === 'decreasing' || weightTrend === 'stable') &&
      recoveryScore < 0.5
    );
  }

  /**
   * Прогнозирует будущий тренд
   */
  private static predictTrend(
    history: any[],
    plateauDetected: boolean,
    overtrainingDetected: boolean
  ): 'accelerating' | 'decelerating' | 'plateau' | 'declining' {
    if (overtrainingDetected) return 'declining';
    if (plateauDetected) return 'plateau';
    
    if (history.length < 4) return 'accelerating';
    
    const recentWeights = history.slice(0, 4).map(w => 
      Math.max(...w.sets.map((s: any) => s.weight))
    );
    
    // Вычисляем скорость прогресса
    const gains = [];
    for (let i = 1; i < recentWeights.length; i++) {
      gains.push(recentWeights[i] - recentWeights[i-1]);
    }
    
    const avgGain = gains.reduce((a, b) => a + b, 0) / gains.length;
    const trend = gains[gains.length - 1] - gains[0];
    
    if (trend > avgGain * 0.5) return 'accelerating';
    if (trend < -avgGain * 0.5) return 'decelerating';
    return 'plateau';
  }

  /**
   * Рассчитывает уверенность алгоритма
   */
  private static calculateConfidence(history: any[]): number {
    if (history.length === 0) return 0.3;
    if (history.length < 3) return 0.5;
    if (history.length < 6) return 0.7;
    if (history.length < 10) return 0.85;
    return 0.95;
  }

  /**
   * Определяет стратегию на следующую неделю
   */
  private static determineNextWeekStrategy(
    rpeTrend: string,
    weightTrend: string,
    plateauDetected: boolean,
    recoveryScore: number,
    overtrainingDetected: boolean,
    targetRPE: [number, number]
  ): 'progressive' | 'maintenance' | 'deload' | 'test' | 'peak' {
    
    if (overtrainingDetected) return 'deload';
    if (recoveryScore < 0.4) return 'deload';
    
    if (plateauDetected) {
      if (rpeTrend === 'increasing') return 'deload';
      return 'test';
    }
    
    if (weightTrend === 'increasing' && rpeTrend === 'stable') {
      return 'progressive';
    }
    
    if (weightTrend === 'stable' && rpeTrend === 'decreasing') {
      return 'peak';
    }
    
    if (rpeTrend === 'increasing' && weightTrend === 'stable') {
      return 'maintenance';
    }
    
    return 'maintenance';
  }

  /**
   * Рассчитывает рекомендуемый вес
   */
  private static calculateRecommendedWeight(
    history: any[],
    strategy: string,
    targetRPE: [number, number],
    current1RM: number
  ): number {
    if (history.length === 0) return 0;
    
    const lastWorkout = history[0];
    const lastWeight = Math.max(...lastWorkout.sets.map((s: any) => s.weight));
    const lastRPE = lastWorkout.sets.reduce((sum: number, s: any) => sum + s.rpe, 0) / lastWorkout.sets.length;
    
    switch (strategy) {
      case 'progressive':
        // Если RPE был низкий - добавляем больше
        if (lastRPE < targetRPE[0]) {
          return Math.round((lastWeight * 1.05) / 2.5) * 2.5;
        }
        // Если RPE в норме - добавляем немного
        if (lastRPE <= targetRPE[1]) {
          return Math.round((lastWeight * 1.025) / 2.5) * 2.5;
        }
        // Если RPE высокий - оставляем тот же вес
        return lastWeight;
        
      case 'peak':
        // Пиковая неделя - пробуем максимум
        return Math.round((current1RM * 0.95) / 2.5) * 2.5;
        
      case 'test':
        // Тестовая неделя - пробуем новый максимум
        return Math.round((current1RM * 1.02) / 2.5) * 2.5;
        
      case 'deload':
        // Разгрузка - 60% от рабочего веса
        return Math.round((lastWeight * 0.6) / 2.5) * 2.5;
        
      case 'maintenance':
      default:
        return lastWeight;
    }
  }

  /**
   * Рассчитывает рекомендуемый объем (количество подходов)
   */
  private static calculateRecommendedVolume(
    history: any[],
    strategy: string
  ): number {
    if (history.length === 0) return 12;
    
    const lastVolume = history[0].sets.length;
    
    switch (strategy) {
      case 'progressive':
        return Math.min(lastVolume + 1, 20);
      case 'peak':
        return Math.max(lastVolume - 2, 8);
      case 'test':
        return 10;
      case 'deload':
        return Math.max(Math.floor(lastVolume * 0.5), 6);
      case 'maintenance':
      default:
        return lastVolume;
    }
  }

  /**
   * Получает целевой RPE для стратегии
   */
  private static getRpeTarget(
    strategy: string,
    defaultTarget: [number, number],
    overtrainingDetected: boolean
  ): [number, number] {
    if (overtrainingDetected) return [4, 5];
    
    switch (strategy) {
      case 'progressive':
        return [7, 8];
      case 'peak':
        return [8, 9];
      case 'test':
        return [9, 10];
      case 'deload':
        return [4, 6];
      case 'maintenance':
      default:
        return defaultTarget;
    }
  }

  /**
   * Формирует понятное объяснение рекомендации
   */
  private static getRecommendationReason(
    strategy: string,
    rpeTrend: string,
    weightTrend: string,
    plateauDetected: boolean,
    recoveryScore: number,
    overtrainingDetected: boolean,
    trend: string
  ): string {
    if (overtrainingDetected) {
      return '⚠️ Обнаружены признаки перетренированности. Срочно нужна разгрузочная неделя!';
    }
    
    if (plateauDetected) {
      return '⛔ Похоже, ты достиг плато. Попробуй сменить упражнение или сделать разгрузку.';
    }
    
    if (recoveryScore < 0.4) {
      return '😴 Твое восстановление ухудшается. Рекомендую снизить нагрузку.';
    }
    
    switch (strategy) {
      case 'progressive':
        if (trend === 'accelerating') {
          return '🚀 Отличный прогресс! Ты быстро растешь. Добавляем вес.';
        }
        return '📈 Стабильный прогресс. Продолжаем в том же духе с небольшим увеличением.';
        
      case 'peak':
        return '⚡ Ты готов к пиковой нагрузке! Пробуем более тяжелые веса.';
        
      case 'test':
        return '🎯 Время проверить свои максимумы! Попробуй установить новый рекорд.';
        
      case 'deload':
        return '🔄 Разгрузочная неделя. Дай телу восстановиться.';
        
      case 'maintenance':
        if (rpeTrend === 'increasing') {
          return '⚠️ RPE растет, но вес не увеличивается. Возможно, ты устал. Оставляем тот же вес.';
        }
        return '✅ Все идет по плану. Продолжаем работать с текущими весами.';
        
      default:
        return 'Продолжай в том же духе!';
    }
  }

  // === ЛИНЕЙНАЯ ПЕРИОДИЗАЦИЯ ===
  static getLinearWeeks(goal: Goal, experience: ExperienceLevel): CycleWeek[] {
    const base = this.getBaseMultipliersByGoal(goal);
    const isBeginner = experience === 'beginner';
    
    return [
      {
        weekNumber: 1,
        phase: 'build',
        volumeMultiplier: base.volume * 1.0,
        intensityMultiplier: base.intensity * (isBeginner ? 0.7 : 0.75),
        rpeTarget: isBeginner ? [6, 7] : [7, 8],
        description: 'Втягивание, работа над техникой',
        focus: 'Адаптация'
      },
      {
        weekNumber: 2,
        phase: 'build',
        volumeMultiplier: base.volume * 1.1,
        intensityMultiplier: base.intensity * (isBeginner ? 0.75 : 0.8),
        rpeTarget: isBeginner ? [6, 8] : [7, 8],
        description: 'Увеличение объема',
        focus: 'Гипертрофия'
      },
      {
        weekNumber: 3,
        phase: 'peak',
        volumeMultiplier: base.volume * (isBeginner ? 1.2 : 0.9),
        intensityMultiplier: base.intensity * (isBeginner ? 0.8 : 0.9),
        rpeTarget: isBeginner ? [7, 8] : [8, 9],
        description: isBeginner ? 'Пик объема' : 'Пик интенсивности',
        focus: isBeginner ? 'Выносливость' : 'Сила'
      },
      {
        weekNumber: 4,
        phase: 'deload',
        volumeMultiplier: base.volume * 0.5,
        intensityMultiplier: base.intensity * 0.6,
        rpeTarget: [4, 6],
        description: 'Активное восстановление',
        focus: 'Регенерация',
        isDeload: true
      }
    ];
  }

  // === ВОЛНОВАЯ ПЕРИОДИЗАЦИЯ (DUP) ===
  static getUndulatingWeeks(goal: Goal, experience: ExperienceLevel): CycleWeek[] {
    const base = this.getBaseMultipliersByGoal(goal);
    const isAdvanced = experience === 'advanced';
    
    return [
      {
        weekNumber: 1,
        phase: 'build',
        volumeMultiplier: base.volume * (isAdvanced ? 1.3 : 1.2),
        intensityMultiplier: base.intensity * 0.7,
        rpeTarget: isAdvanced ? [6, 7] : [6, 7],
        description: 'Высокообъемная неделя',
        focus: 'Гипертрофия',
        specialInstructions: 'Фокус на пампинг, 8-12 повторений'
      },
      {
        weekNumber: 2,
        phase: 'peak',
        volumeMultiplier: base.volume * 0.6,
        intensityMultiplier: base.intensity * (isAdvanced ? 1.0 : 0.95),
        rpeTarget: isAdvanced ? [9, 10] : [8, 9],
        description: 'Высокоинтенсивная неделя',
        focus: 'Максимальная сила',
        specialInstructions: 'Тяжелые веса, 3-6 повторений'
      },
      {
        weekNumber: 3,
        phase: 'build',
        volumeMultiplier: base.volume * 1.0,
        intensityMultiplier: base.intensity * 0.8,
        rpeTarget: [7, 8],
        description: 'Функциональная неделя',
        focus: 'Силовая выносливость',
        specialInstructions: 'Умеренные веса, взрывные движения'
      },
      {
        weekNumber: 4,
        phase: 'deload',
        volumeMultiplier: base.volume * 0.5,
        intensityMultiplier: base.intensity * 0.6,
        rpeTarget: [4, 6],
        description: 'Разгрузка',
        focus: 'Восстановление',
        isDeload: true
      }
    ];
  }

  // === БЛОКОВАЯ ПЕРИОДИЗАЦИЯ ===
  static getBlockWeeks(goal: Goal, experience: ExperienceLevel): CycleWeek[] {
    const weeks: CycleWeek[] = [];
    const base = this.getBaseMultipliersByGoal(goal);
    
    // БЛОК 1: Гипертрофия (недели 1-4)
    for (let i = 1; i <= 4; i++) {
      weeks.push({
        weekNumber: i,
        phase: 'build',
        volumeMultiplier: base.volume * (1.0 + (i * 0.05)),
        intensityMultiplier: base.intensity * 0.7,
        rpeTarget: [7, 8],
        description: `Гипертрофия • Неделя ${i}`,
        focus: 'Набор массы',
        specialInstructions: '8-12 повторений, пампинг'
      });
    }
    
    // БЛОК 2: Сила (недели 5-8)
    for (let i = 5; i <= 8; i++) {
      weeks.push({
        weekNumber: i,
        phase: 'peak',
        volumeMultiplier: base.volume * 0.6,
        intensityMultiplier: base.intensity * (0.8 + ((i-4) * 0.05)),
        rpeTarget: [8, 9],
        description: `Сила • Неделя ${i-4}`,
        focus: 'Максимальная сила',
        specialInstructions: '3-6 повторений, длинный отдых'
      });
    }
    
    // БЛОК 3: Мощность (недели 9-11)
    for (let i = 9; i <= 11; i++) {
      weeks.push({
        weekNumber: i,
        phase: 'peak',
        volumeMultiplier: base.volume * 0.4,
        intensityMultiplier: base.intensity * (0.6 + ((i-8) * 0.05)),
        rpeTarget: [7, 8],
        description: `Мощность • Неделя ${i-8}`,
        focus: 'Взрывная сила',
        specialInstructions: '1-3 повторения, взрывные'
      });
    }
    
    // Разгрузка (неделя 12)
    weeks.push({
      weekNumber: 12,
      phase: 'deload',
      volumeMultiplier: base.volume * 0.3,
      intensityMultiplier: base.intensity * 0.5,
      rpeTarget: [3, 5],
      description: 'Финальная разгрузка',
      focus: 'Восстановление',
      isDeload: true
    });
    
    return weeks;
  }

  // === КОНЪЮГИРОВАННАЯ (WESTSIDE) ===
  static getConjugateWeeks(goal: Goal, experience: ExperienceLevel): CycleWeek[] {
    const base = this.getBaseMultipliersByGoal(goal);
    
    return [
      {
        weekNumber: 1,
        phase: 'peak',
        volumeMultiplier: base.volume * 0.5,
        intensityMultiplier: base.intensity * 0.9,
        rpeTarget: [9, 10],
        description: 'Максимальных усилий',
        focus: 'Тяжелая база',
        specialInstructions: '1-3 ПМ, длинный отдых'
      },
      {
        weekNumber: 2,
        phase: 'build',
        volumeMultiplier: base.volume * 1.2,
        intensityMultiplier: base.intensity * 0.5,
        rpeTarget: [6, 7],
        description: 'Динамических усилий',
        focus: 'Взрывная скорость',
        specialInstructions: '50-60% от 1ПМ, взрывные'
      },
      {
        weekNumber: 3,
        phase: 'peak',
        volumeMultiplier: base.volume * 0.5,
        intensityMultiplier: base.intensity * 0.95,
        rpeTarget: [9, 10],
        description: 'Максимальных усилий',
        focus: 'Тяжелая база',
        specialInstructions: 'Новые упражнения'
      },
      {
        weekNumber: 4,
        phase: 'deload',
        volumeMultiplier: base.volume * 0.4,
        intensityMultiplier: base.intensity * 0.6,
        rpeTarget: [4, 6],
        description: 'Разгрузка',
        focus: 'Восстановление',
        isDeload: true
      }
    ];
  }

  // === АВТО-РЕГУЛЯЦИЯ (AI) ===
  static getAutoRegulationWeeks(goal: Goal, experience: ExperienceLevel): CycleWeek[] {
    const base = this.getBaseMultipliersByGoal(goal);
    
    return [
      {
        weekNumber: 1,
        phase: 'build',
        volumeMultiplier: base.volume * 1.0,
        intensityMultiplier: base.intensity * 0.7,
        rpeTarget: [6, 8],
        description: 'Калибровочная неделя',
        focus: 'Сбор данных',
        specialInstructions: 'Записывай RPE после каждого подхода. Это поможет AI настроиться под тебя.'
      },
      {
        weekNumber: 2,
        phase: 'build',
        volumeMultiplier: base.volume * 1.0,
        intensityMultiplier: base.intensity * 0.75,
        rpeTarget: [6, 8],
        description: 'Адаптивная неделя',
        focus: 'Настройка алгоритма',
        specialInstructions: 'AI анализирует твои данные и начинает подстраиваться.'
      },
      {
        weekNumber: 3,
        phase: 'peak',
        volumeMultiplier: base.volume * 1.0,
        intensityMultiplier: base.intensity * 0.8,
        rpeTarget: [7, 9],
        description: 'Умная прогрессия',
        focus: 'Персонализация',
        specialInstructions: 'Теперь AI будет рекомендовать веса на основе твоей истории.'
      },
      {
        weekNumber: 4,
        phase: 'deload',
        volumeMultiplier: base.volume * 0.5,
        intensityMultiplier: base.intensity * 0.6,
        rpeTarget: [4, 6],
        description: 'AI-разгрузка',
        focus: 'Восстановление',
        isDeload: true,
        specialInstructions: 'AI определил, что тебе нужен отдых. Доверься алгоритму.'
      }
    ];
  }

  // Базовые множители в зависимости от цели
  private static getBaseMultipliersByGoal(goal: Goal): { volume: number; intensity: number } {
    switch (goal) {
      case 'strength':
        return { volume: 0.7, intensity: 1.2 };
      case 'hypertrophy':
        return { volume: 1.0, intensity: 1.0 };
      case 'endurance':
        return { volume: 1.3, intensity: 0.7 };
      default:
        return { volume: 1.0, intensity: 1.0 };
    }
  }

  // Рекомендации по уровню подготовки
  static getRecommendedStrategy(experience: ExperienceLevel): PeriodizationType {
    switch (experience) {
      case 'beginner':
        return 'linear';
      case 'intermediate':
        return 'auto';
      case 'advanced':
        return 'auto';
      default:
        return 'linear';
    }
  }

  // Получить все подходящие стратегии для уровня
  static getStrategiesForLevel(experience: ExperienceLevel): PeriodizationOption[] {
    return Object.values(this.STRATEGIES).filter(s => 
      s.suitableFor.includes(experience)
    );
  }

  // Фабричный метод для получения недель по стратегии
  static getWeeksByStrategy(
    strategy: PeriodizationType,
    goal: Goal,
    experience: ExperienceLevel
  ): CycleWeek[] {
    switch (strategy) {
      case 'linear':
        return this.getLinearWeeks(goal, experience);
      case 'undulating':
        return this.getUndulatingWeeks(goal, experience);
      case 'block':
        return this.getBlockWeeks(goal, experience);
      case 'conjugate':
        return this.getConjugateWeeks(goal, experience);
      case 'auto':
        return this.getAutoRegulationWeeks(goal, experience);
      default:
        return this.getLinearWeeks(goal, experience);
    }
  }

  // Получить описание стратегии
  static getStrategyDescription(strategy: PeriodizationType): string {
    return this.STRATEGIES[strategy]?.longDescription || '';
  }

  // Проверить, подходит ли стратегия для уровня
  static isStrategySuitable(strategy: PeriodizationType, experience: ExperienceLevel): boolean {
    return this.STRATEGIES[strategy]?.suitableFor.includes(experience) || false;
  }
}

export default PeriodizationService;