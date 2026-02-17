export default class RestCalculator {
  /**
   * Рассчитывает время отдыха на основе RPE и цели
   */
  public static calculateRestTime(rpe: number, goal?: string): number {
    // Если указана цель, корректируем время
    if (goal) {
      switch (goal) {
        case 'strength':
          // Для силы нужно больше отдыха
          return Math.min(300, Math.max(120, rpe * 30));
        case 'hypertrophy':
          // Для массы средний отдых
          return Math.min(180, Math.max(60, rpe * 15));
        case 'endurance':
          // Для выносливости меньше отдыха
          return Math.min(120, Math.max(30, rpe * 10));
      }
    }
    
    // Базовая шкала по RPE
    if (rpe >= 9.5) return 210;  // 3:30
    if (rpe >= 9) return 180;    // 3:00
    if (rpe >= 8.5) return 165;  // 2:45
    if (rpe >= 8) return 150;    // 2:30
    if (rpe >= 7.5) return 135;  // 2:15
    if (rpe >= 7) return 120;    // 2:00
    if (rpe >= 6.5) return 105;  // 1:45
    if (rpe >= 6) return 90;     // 1:30
    if (rpe >= 5) return 75;     // 1:15
    if (rpe >= 4) return 60;     // 1:00
    if (rpe >= 3) return 45;     // 0:45
    if (rpe >= 2) return 30;     // 0:30
    return 20;                   // 0:20
  }

  /**
   * Рассчитывает следующий вес на основе RPE
   */
  public static calculateNextWeight(
    currentWeight: number,
    reps: number,
    rpe: number,
    experience: string
  ): number {
    const step = experience === 'beginner' ? 2.5 : 1.25;
    
    if (rpe <= 4) return Math.round((currentWeight + step) * 100) / 100;
    if (rpe <= 6 && reps >= 8) return Math.round((currentWeight + step) * 100) / 100;
    if (rpe > 8) return Math.max(0, Math.round((currentWeight - step) * 100) / 100);
    
    return currentWeight;
  }

  /**
   * Получить читаемое описание времени отдыха
   */
  public static formatRestTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }
}