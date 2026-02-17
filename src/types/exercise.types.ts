// Типы уровней тренированности
export type UserLevel = 'beginner' | 'intermediate' | 'advanced';

// Расширенный тип упражнения
export interface Exercise {
  id: string;
  name: string;
  category: ExerciseCategory;
  muscleGroups: MuscleGroup[];
  isMultiJoint: boolean;
  equipment: EquipmentType;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  description?: string;
  tips?: string[];
}

// Категории упражнений
export enum ExerciseCategory {
  Chest = 'Грудные',
  Back = 'Спина',
  Legs = 'Ноги',
  Shoulders = 'Плечи',
  Biceps = 'Бицепс',
  Triceps = 'Трицепс',
  Abs = 'Пресс',
  Cardio = 'Кардио',
  FullBody = 'Все тело'
}

// Мышечные группы
export enum MuscleGroup {
  Chest = 'Грудные',
  UpperChest = 'Верх груди',
  LowerChest = 'Низ груди',
  Lats = 'Широчайшие',
  Traps = 'Трапеции',
  Rhomboids = 'Ромбовидные',
  LowerBack = 'Поясница',
  Quadriceps = 'Квадрицепсы',
  Hamstrings = 'Бицепс бедра',
  Glutes = 'Ягодичные',
  Calves = 'Икры',
  FrontDelt = 'Передняя дельта',
  SideDelt = 'Средняя дельта',
  RearDelt = 'Задняя дельта',
  Biceps = 'Бицепс',
  Brachialis = 'Брахиалис',
  Triceps = 'Трицепс',
  Abs = 'Пресс',
  Obliques = 'Косые',
  Serratus = 'Передняя зубчатая'
}

// Оборудование
export enum EquipmentType {
  Barbell = 'Штанга',
  Dumbbell = 'Гантели',
  Kettlebell = 'Гиря',
  Machine = 'Тренажер',
  Cable = 'Блок',
  Bodyweight = 'Свой вес',
  Band = 'Резинка',
  Smith = 'Смит',
  EZBar = 'EZ-штанга'
}

// Нормативы по уровням (RPE 8-9)
export interface ExerciseStandards {
  beginner: { min: number; max: number };
  intermediate: { min: number; max: number };
  advanced: { min: number; max: number };
}

// РАСШИРЕННАЯ БАЗА УПРАЖНЕНИЙ (60+)
export const EXERCISES: Exercise[] = [
  // === ГРУДНЫЕ - БАЗА ===
  {
    id: 'bench-press',
    name: 'Жим штанги лежа',
    category: ExerciseCategory.Chest,
    muscleGroups: [MuscleGroup.Chest, MuscleGroup.FrontDelt, MuscleGroup.Triceps],
    isMultiJoint: true,
    equipment: EquipmentType.Barbell,
    difficulty: 'beginner',
    tips: ['Лопатки сведены', 'Ноги в пол', 'Штанга на уровень сосков']
  },
  {
    id: 'dumbbell-bench-press',
    name: 'Жим гантелей лежа',
    category: ExerciseCategory.Chest,
    muscleGroups: [MuscleGroup.Chest, MuscleGroup.FrontDelt, MuscleGroup.Triceps],
    isMultiJoint: true,
    equipment: EquipmentType.Dumbbell,
    difficulty: 'beginner',
    tips: ['Гантели сводить вверху', 'Локти под 45°']
  },
  {
    id: 'incline-bench-press',
    name: 'Жим штанги на наклонной',
    category: ExerciseCategory.Chest,
    muscleGroups: [MuscleGroup.UpperChest, MuscleGroup.FrontDelt, MuscleGroup.Triceps],
    isMultiJoint: true,
    equipment: EquipmentType.Barbell,
    difficulty: 'intermediate',
    tips: ['Угол 30-45°', 'Не отбивать гриф']
  },
  {
    id: 'decline-bench-press',
    name: 'Жим штанги вниз головой',
    category: ExerciseCategory.Chest,
    muscleGroups: [MuscleGroup.LowerChest, MuscleGroup.FrontDelt, MuscleGroup.Triceps],
    isMultiJoint: true,
    equipment: EquipmentType.Barbell,
    difficulty: 'intermediate',
    tips: ['Ноги зафиксированы', 'Нижняя часть груди']
  },
  {
    id: 'dips-chest',
    name: 'Отжимания на брусьях (грудь)',
    category: ExerciseCategory.Chest,
    muscleGroups: [MuscleGroup.LowerChest, MuscleGroup.Triceps, MuscleGroup.FrontDelt],
    isMultiJoint: true,
    equipment: EquipmentType.Bodyweight,
    difficulty: 'intermediate',
    tips: ['Корпус вперед', 'Локти в стороны', 'Глубокое опускание']
  },
  {
    id: 'push-ups',
    name: 'Отжимания от пола',
    category: ExerciseCategory.Chest,
    muscleGroups: [MuscleGroup.Chest, MuscleGroup.Triceps, MuscleGroup.FrontDelt],
    isMultiJoint: true,
    equipment: EquipmentType.Bodyweight,
    difficulty: 'beginner',
    tips: ['Корпус прямой', 'Локти под 45°']
  },

  // === ГРУДНЫЕ - ИЗОЛЯЦИЯ ===
  {
    id: 'dumbbell-fly',
    name: 'Разводка гантелей лежа',
    category: ExerciseCategory.Chest,
    muscleGroups: [MuscleGroup.Chest],
    isMultiJoint: false,
    equipment: EquipmentType.Dumbbell,
    difficulty: 'beginner',
    tips: ['Чуть согнутые локти', 'Растяжка внизу']
  },
  {
    id: 'cable-crossover',
    name: 'Сведение рук в кроссовере',
    category: ExerciseCategory.Chest,
    muscleGroups: [MuscleGroup.Chest],
    isMultiJoint: false,
    equipment: EquipmentType.Cable,
    difficulty: 'beginner',
    tips: ['Корпус чуть вперед', 'Сводить перед собой']
  },
  {
    id: 'pec-deck',
    name: 'Сведение рук в тренажере',
    category: ExerciseCategory.Chest,
    muscleGroups: [MuscleGroup.Chest],
    isMultiJoint: false,
    equipment: EquipmentType.Machine,
    difficulty: 'beginner',
    tips: ['Локти на подушках', 'Сжимать грудь']
  },
  {
    id: 'incline-fly',
    name: 'Разводка гантелей на наклонной',
    category: ExerciseCategory.Chest,
    muscleGroups: [MuscleGroup.UpperChest],
    isMultiJoint: false,
    equipment: EquipmentType.Dumbbell,
    difficulty: 'intermediate',
    tips: ['Угол 30°', 'Верх груди']
  },

  // === СПИНА - БАЗА ===
  {
    id: 'deadlift',
    name: 'Становая тяга',
    category: ExerciseCategory.Back,
    muscleGroups: [MuscleGroup.Lats, MuscleGroup.LowerBack, MuscleGroup.Glutes, MuscleGroup.Hamstrings, MuscleGroup.Traps],
    isMultiJoint: true,
    equipment: EquipmentType.Barbell,
    difficulty: 'advanced',
    tips: ['Спина прямая', 'Гриф ближе к голени', 'Таз назад']
  },
  {
    id: 'pull-ups',
    name: 'Подтягивания',
    category: ExerciseCategory.Back,
    muscleGroups: [MuscleGroup.Lats, MuscleGroup.Biceps],
    isMultiJoint: true,
    equipment: EquipmentType.Bodyweight,
    difficulty: 'beginner',
    tips: ['Лопатки вместе', 'Грудь к перекладине']
  },
  {
    id: 'bent-over-row',
    name: 'Тяга штанги в наклоне',
    category: ExerciseCategory.Back,
    muscleGroups: [MuscleGroup.Lats, MuscleGroup.Rhomboids, MuscleGroup.Biceps],
    isMultiJoint: true,
    equipment: EquipmentType.Barbell,
    difficulty: 'intermediate',
    tips: ['Наклон 45°', 'Тянуть к низу живота']
  },
  {
    id: 't-bar-row',
    name: 'Тяга Т-грифа',
    category: ExerciseCategory.Back,
    muscleGroups: [MuscleGroup.Lats, MuscleGroup.Rhomboids, MuscleGroup.Biceps],
    isMultiJoint: true,
    equipment: EquipmentType.Barbell,
    difficulty: 'intermediate',
    tips: ['Грудь в упор', 'Сводить лопатки']
  },
  {
    id: 'seated-cable-row',
    name: 'Тяга горизонтального блока',
    category: ExerciseCategory.Back,
    muscleGroups: [MuscleGroup.Lats, MuscleGroup.Rhomboids],
    isMultiJoint: true,
    equipment: EquipmentType.Cable,
    difficulty: 'beginner',
    tips: ['Корпус неподвижен', 'Лопатки к позвоночнику']
  },
  {
    id: 'lat-pulldown',
    name: 'Тяга вертикального блока',
    category: ExerciseCategory.Back,
    muscleGroups: [MuscleGroup.Lats, MuscleGroup.Biceps],
    isMultiJoint: true,
    equipment: EquipmentType.Cable,
    difficulty: 'beginner',
    tips: ['Хват шире плеч', 'Тянуть к верху груди']
  },
  {
    id: 'pendlay-row',
    name: 'Тяга Пендли',
    category: ExerciseCategory.Back,
    muscleGroups: [MuscleGroup.Lats, MuscleGroup.Rhomboids],
    isMultiJoint: true,
    equipment: EquipmentType.Barbell,
    difficulty: 'intermediate',
    tips: ['Спина параллельно полу', 'Касание груди', 'Взрывная']
  },

  // === СПИНА - ИЗОЛЯЦИЯ ===
  {
    id: 'dumbbell-row',
    name: 'Тяга гантели в наклоне',
    category: ExerciseCategory.Back,
    muscleGroups: [MuscleGroup.Lats],
    isMultiJoint: false,
    equipment: EquipmentType.Dumbbell,
    difficulty: 'beginner',
    tips: ['Упор коленом', 'Тянуть локтем назад']
  },
  {
    id: 'straight-arm-pulldown',
    name: 'Тяга блока прямыми руками',
    category: ExerciseCategory.Back,
    muscleGroups: [MuscleGroup.Lats],
    isMultiJoint: false,
    equipment: EquipmentType.Cable,
    difficulty: 'beginner',
    tips: ['Руки прямые', 'Корпус неподвижен']
  },
  {
    id: 'face-pull',
    name: 'Протяжка к лицу',
    category: ExerciseCategory.Back,
    muscleGroups: [MuscleGroup.RearDelt, MuscleGroup.Traps],
    isMultiJoint: false,
    equipment: EquipmentType.Cable,
    difficulty: 'intermediate',
    tips: ['Тянуть к носу', 'Внешняя ротация']
  },
  {
    id: 'reverse-pec-deck',
    name: 'Обратное сведение в тренажере',
    category: ExerciseCategory.Back,
    muscleGroups: [MuscleGroup.RearDelt, MuscleGroup.Rhomboids],
    isMultiJoint: false,
    equipment: EquipmentType.Machine,
    difficulty: 'intermediate',
    tips: ['Руки параллельно полу', 'Задняя дельта']
  },
  {
    id: 'shrugs',
    name: 'Шраги',
    category: ExerciseCategory.Back,
    muscleGroups: [MuscleGroup.Traps],
    isMultiJoint: false,
    equipment: EquipmentType.Dumbbell,
    difficulty: 'beginner',
    tips: ['Плечи вверх', 'Не вращать']
  },

  // === НОГИ - БАЗА ===
  {
    id: 'squat',
    name: 'Приседания со штангой',
    category: ExerciseCategory.Legs,
    muscleGroups: [MuscleGroup.Quadriceps, MuscleGroup.Glutes, MuscleGroup.Hamstrings],
    isMultiJoint: true,
    equipment: EquipmentType.Barbell,
    difficulty: 'beginner',
    tips: ['Глубокий сед', 'Колени по носкам', 'Спина прямая']
  },
  {
    id: 'front-squat',
    name: 'Фронтальные приседания',
    category: ExerciseCategory.Legs,
    muscleGroups: [MuscleGroup.Quadriceps, MuscleGroup.Glutes],
    isMultiJoint: true,
    equipment: EquipmentType.Barbell,
    difficulty: 'intermediate',
    tips: ['Гриф на ключицах', 'Локти вверх']
  },
  {
    id: 'leg-press',
    name: 'Жим ногами',
    category: ExerciseCategory.Legs,
    muscleGroups: [MuscleGroup.Quadriceps, MuscleGroup.Glutes, MuscleGroup.Hamstrings],
    isMultiJoint: true,
    equipment: EquipmentType.Machine,
    difficulty: 'beginner',
    tips: ['Поясница прижата', 'Полная амплитуда']
  },
  {
    id: 'romanian-deadlift',
    name: 'Румынская тяга',
    category: ExerciseCategory.Legs,
    muscleGroups: [MuscleGroup.Hamstrings, MuscleGroup.Glutes],
    isMultiJoint: true,
    equipment: EquipmentType.Barbell,
    difficulty: 'intermediate',
    tips: ['Ноги прямые', 'Таз назад', 'Растяжка бицепса бедра']
  },
  {
    id: 'lunges',
    name: 'Выпады',
    category: ExerciseCategory.Legs,
    muscleGroups: [MuscleGroup.Quadriceps, MuscleGroup.Glutes],
    isMultiJoint: true,
    equipment: EquipmentType.Dumbbell,
    difficulty: 'beginner',
    tips: ['Шаг вперед', 'Колено 90°', 'Не касаться пола']
  },
  {
    id: 'hack-squat',
    name: 'Приседания в Гакке',
    category: ExerciseCategory.Legs,
    muscleGroups: [MuscleGroup.Quadriceps],
    isMultiJoint: true,
    equipment: EquipmentType.Machine,
    difficulty: 'intermediate',
    tips: ['Спина на платформе', 'Глубокий сед']
  },
  {
    id: 'goblet-squat',
    name: 'Приседания с гантелью',
    category: ExerciseCategory.Legs,
    muscleGroups: [MuscleGroup.Quadriceps, MuscleGroup.Glutes],
    isMultiJoint: true,
    equipment: EquipmentType.Dumbbell,
    difficulty: 'beginner',
    tips: ['Гантель у груди', 'Локти вниз', 'Глубоко']
  },

  // === НОГИ - ИЗОЛЯЦИЯ ===
  {
    id: 'leg-extension',
    name: 'Разгибания ног',
    category: ExerciseCategory.Legs,
    muscleGroups: [MuscleGroup.Quadriceps],
    isMultiJoint: false,
    equipment: EquipmentType.Machine,
    difficulty: 'beginner',
    tips: ['Носки на себя', 'Пик-сокращение']
  },
  {
    id: 'leg-curl',
    name: 'Сгибания ног',
    category: ExerciseCategory.Legs,
    muscleGroups: [MuscleGroup.Hamstrings],
    isMultiJoint: false,
    equipment: EquipmentType.Machine,
    difficulty: 'beginner',
    tips: ['Таз прижат', 'Медленно опускать']
  },
  {
    id: 'standing-calf-raise',
    name: 'Подъем на носки стоя',
    category: ExerciseCategory.Legs,
    muscleGroups: [MuscleGroup.Calves],
    isMultiJoint: false,
    equipment: EquipmentType.Machine,
    difficulty: 'beginner',
    tips: ['Полная амплитуда', 'Пауза вверху']
  },
  {
    id: 'seated-calf-raise',
    name: 'Подъем на носки сидя',
    category: ExerciseCategory.Legs,
    muscleGroups: [MuscleGroup.Calves],
    isMultiJoint: false,
    equipment: EquipmentType.Machine,
    difficulty: 'beginner',
    tips: ['Камбаловидная', 'Растяжка внизу']
  },
  {
    id: 'hip-adduction',
    name: 'Сведение ног',
    category: ExerciseCategory.Legs,
    muscleGroups: [MuscleGroup.Glutes],
    isMultiJoint: false,
    equipment: EquipmentType.Machine,
    difficulty: 'beginner',
    tips: ['Приводящие', 'Медленно']
  },
  {
    id: 'hip-abduction',
    name: 'Разведение ног',
    category: ExerciseCategory.Legs,
    muscleGroups: [MuscleGroup.Glutes],
    isMultiJoint: false,
    equipment: EquipmentType.Machine,
    difficulty: 'beginner',
    tips: ['Средняя ягодичная', 'Носки внутрь']
  },

  // === ПЛЕЧИ - БАЗА ===
  {
    id: 'overhead-press',
    name: 'Жим штанги стоя',
    category: ExerciseCategory.Shoulders,
    muscleGroups: [MuscleGroup.FrontDelt, MuscleGroup.SideDelt, MuscleGroup.Triceps],
    isMultiJoint: true,
    equipment: EquipmentType.Barbell,
    difficulty: 'intermediate',
    tips: ['Корпус напряжен', 'Штанга перед лицом', 'Не прогибаться']
  },
  {
    id: 'dumbbell-shoulder-press',
    name: 'Жим гантелей сидя',
    category: ExerciseCategory.Shoulders,
    muscleGroups: [MuscleGroup.FrontDelt, MuscleGroup.SideDelt, MuscleGroup.Triceps],
    isMultiJoint: true,
    equipment: EquipmentType.Dumbbell,
    difficulty: 'beginner',
    tips: ['Спина прижата', 'Гантели над ушами']
  },
  {
    id: 'arnold-press',
    name: 'Жим Арнольда',
    category: ExerciseCategory.Shoulders,
    muscleGroups: [MuscleGroup.FrontDelt, MuscleGroup.SideDelt],
    isMultiJoint: true,
    equipment: EquipmentType.Dumbbell,
    difficulty: 'intermediate',
    tips: ['Вращение кистей', 'Все пучки']
  },

  // === ПЛЕЧИ - ИЗОЛЯЦИЯ ===
  {
    id: 'lateral-raise',
    name: 'Махи гантелями в стороны',
    category: ExerciseCategory.Shoulders,
    muscleGroups: [MuscleGroup.SideDelt],
    isMultiJoint: false,
    equipment: EquipmentType.Dumbbell,
    difficulty: 'beginner',
    tips: ['Чуть согнутые локти', 'Мизинец вверх', 'Не выше плеч']
  },
  {
    id: 'front-raise',
    name: 'Подъемы гантелей перед собой',
    category: ExerciseCategory.Shoulders,
    muscleGroups: [MuscleGroup.FrontDelt],
    isMultiJoint: false,
    equipment: EquipmentType.Dumbbell,
    difficulty: 'beginner',
    tips: ['Передняя дельта', 'Без рывков']
  },
  {
    id: 'rear-delt-fly',
    name: 'Махи в наклоне',
    category: ExerciseCategory.Shoulders,
    muscleGroups: [MuscleGroup.RearDelt],
    isMultiJoint: false,
    equipment: EquipmentType.Dumbbell,
    difficulty: 'intermediate',
    tips: ['Наклон 45°', 'Задняя дельта']
  },
  {
    id: 'cable-lateral-raise',
    name: 'Махи в блоке',
    category: ExerciseCategory.Shoulders,
    muscleGroups: [MuscleGroup.SideDelt],
    isMultiJoint: false,
    equipment: EquipmentType.Cable,
    difficulty: 'intermediate',
    tips: ['Одной рукой', 'Постоянное напряжение']
  },
  {
    id: 'upright-row',
    name: 'Протяжка штанги',
    category: ExerciseCategory.Shoulders,
    muscleGroups: [MuscleGroup.SideDelt, MuscleGroup.Traps],
    isMultiJoint: false,
    equipment: EquipmentType.Barbell,
    difficulty: 'intermediate',
    tips: ['Хват уже плеч', 'Локти вверх']
  },

  // === БИЦЕПС - ИЗОЛЯЦИЯ ===
  {
    id: 'barbell-curl',
    name: 'Подъем штанги на бицепс',
    category: ExerciseCategory.Biceps,
    muscleGroups: [MuscleGroup.Biceps],
    isMultiJoint: false,
    equipment: EquipmentType.EZBar,
    difficulty: 'beginner',
    tips: ['Локти у корпуса', 'Не раскачиваться']
  },
  {
    id: 'dumbbell-curl',
    name: 'Подъем гантелей на бицепс',
    category: ExerciseCategory.Biceps,
    muscleGroups: [MuscleGroup.Biceps],
    isMultiJoint: false,
    equipment: EquipmentType.Dumbbell,
    difficulty: 'beginner',
    tips: ['Супинация', 'Поочередно']
  },
  {
    id: 'hammer-curl',
    name: 'Молотковые сгибания',
    category: ExerciseCategory.Biceps,
    muscleGroups: [MuscleGroup.Brachialis, MuscleGroup.Biceps],
    isMultiJoint: false,
    equipment: EquipmentType.Dumbbell,
    difficulty: 'beginner',
    tips: ['Нейтральный хват', 'Брахиалис']
  },
  {
    id: 'concentration-curl',
    name: 'Концентрированный подъем',
    category: ExerciseCategory.Biceps,
    muscleGroups: [MuscleGroup.Biceps],
    isMultiJoint: false,
    equipment: EquipmentType.Dumbbell,
    difficulty: 'intermediate',
    tips: ['Упор в бедро', 'Пик']
  },
  {
    id: 'preacher-curl',
    name: 'Подъем на скамье Скотта',
    category: ExerciseCategory.Biceps,
    muscleGroups: [MuscleGroup.Biceps],
    isMultiJoint: false,
    equipment: EquipmentType.EZBar,
    difficulty: 'intermediate',
    tips: ['Подмышки на скамье', 'Нижняя часть']
  },
  {
    id: 'cable-curl',
    name: 'Сгибания на блоке',
    category: ExerciseCategory.Biceps,
    muscleGroups: [MuscleGroup.Biceps],
    isMultiJoint: false,
    equipment: EquipmentType.Cable,
    difficulty: 'beginner',
    tips: ['Постоянное напряжение']
  },

  // === ТРИЦЕПС - ИЗОЛЯЦИЯ ===
  {
    id: 'triceps-extension',
    name: 'Французский жим',
    category: ExerciseCategory.Triceps,
    muscleGroups: [MuscleGroup.Triceps],
    isMultiJoint: false,
    equipment: EquipmentType.EZBar,
    difficulty: 'intermediate',
    tips: ['Локти внутрь', 'Растяжка']
  },
  {
    id: 'cable-pushdown',
    name: 'Разгибания на блоке',
    category: ExerciseCategory.Triceps,
    muscleGroups: [MuscleGroup.Triceps],
    isMultiJoint: false,
    equipment: EquipmentType.Cable,
    difficulty: 'beginner',
    tips: ['Корпус неподвижен', 'Дожатие']
  },
  {
    id: 'dips-triceps',
    name: 'Отжимания на брусьях (трицепс)',
    category: ExerciseCategory.Triceps,
    muscleGroups: [MuscleGroup.Triceps],
    isMultiJoint: false,
    equipment: EquipmentType.Bodyweight,
    difficulty: 'intermediate',
    tips: ['Корпус вертикально', 'Локти назад']
  },
  {
    id: 'skull-crusher',
    name: 'Жим лежа узким хватом',
    category: ExerciseCategory.Triceps,
    muscleGroups: [MuscleGroup.Triceps, MuscleGroup.Chest],
    isMultiJoint: false,
    equipment: EquipmentType.Barbell,
    difficulty: 'intermediate',
    tips: ['Локти вдоль корпуса', 'Касание груди']
  },
  {
    id: 'overhead-triceps-extension',
    name: 'Разгибание из-за головы',
    category: ExerciseCategory.Triceps,
    muscleGroups: [MuscleGroup.Triceps],
    isMultiJoint: false,
    equipment: EquipmentType.Dumbbell,
    difficulty: 'beginner',
    tips: ['Локоть вверх', 'Длинная головка']
  },
  {
    id: 'bench-dips',
    name: 'Обратные отжимания',
    category: ExerciseCategory.Triceps,
    muscleGroups: [MuscleGroup.Triceps],
    isMultiJoint: false,
    equipment: EquipmentType.Bodyweight,
    difficulty: 'beginner',
    tips: ['Руки сзади', 'Таз у скамьи']
  },

  // === ПРЕСС ===
  {
    id: 'crunches',
    name: 'Скручивания',
    category: ExerciseCategory.Abs,
    muscleGroups: [MuscleGroup.Abs],
    isMultiJoint: false,
    equipment: EquipmentType.Bodyweight,
    difficulty: 'beginner',
    tips: ['Отрывать лопатки', 'Шея расслаблена']
  },
  {
    id: 'leg-raises',
    name: 'Подъем ног',
    category: ExerciseCategory.Abs,
    muscleGroups: [MuscleGroup.Abs],
    isMultiJoint: false,
    equipment: EquipmentType.Bodyweight,
    difficulty: 'intermediate',
    tips: ['Ноги прямые', 'Таз подкручен']
  },
  {
    id: 'russian-twist',
    name: 'Русский твист',
    category: ExerciseCategory.Abs,
    muscleGroups: [MuscleGroup.Obliques, MuscleGroup.Abs],
    isMultiJoint: false,
    equipment: EquipmentType.Bodyweight,
    difficulty: 'beginner',
    tips: ['Косые', 'Вращение корпуса']
  },
  {
    id: 'plank',
    name: 'Планка',
    category: ExerciseCategory.Abs,
    muscleGroups: [MuscleGroup.Abs, MuscleGroup.LowerBack],
    isMultiJoint: false,
    equipment: EquipmentType.Bodyweight,
    difficulty: 'beginner',
    tips: ['Таз подкручен', 'Ягодицы напряжены']
  },
  {
    id: 'hanging-leg-raise',
    name: 'Подъем ног в висе',
    category: ExerciseCategory.Abs,
    muscleGroups: [MuscleGroup.Abs],
    isMultiJoint: false,
    equipment: EquipmentType.Bodyweight,
    difficulty: 'advanced',
    tips: ['Нижний пресс', 'Без раскачки']
  },
  {
    id: 'cable-crunch',
    name: 'Скручивания на блоке',
    category: ExerciseCategory.Abs,
    muscleGroups: [MuscleGroup.Abs],
    isMultiJoint: false,
    equipment: EquipmentType.Cable,
    difficulty: 'intermediate',
    tips: ['Спина круглая', 'К лобку']
  }
];

// НОРМАТИВЫ ДЛЯ ОСНОВНЫХ УПРАЖНЕНИЙ (% от веса тела, RPE 8-9)
export const EXERCISE_STANDARDS: Record<string, ExerciseStandards> = {
  'bench-press': {
    beginner: { min: 0.7, max: 1.0 },
    intermediate: { min: 1.0, max: 1.3 },
    advanced: { min: 1.3, max: 1.6 }
  },
  'squat': {
    beginner: { min: 0.8, max: 1.2 },
    intermediate: { min: 1.2, max: 1.6 },
    advanced: { min: 1.6, max: 2.0 }
  },
  'deadlift': {
    beginner: { min: 1.0, max: 1.4 },
    intermediate: { min: 1.4, max: 1.8 },
    advanced: { min: 1.8, max: 2.2 }
  },
  'overhead-press': {
    beginner: { min: 0.4, max: 0.6 },
    intermediate: { min: 0.6, max: 0.8 },
    advanced: { min: 0.8, max: 1.0 }
  },
  'pull-ups': {
    beginner: { min: 0.8, max: 1.0 },
    intermediate: { min: 1.0, max: 1.2 },
    advanced: { min: 1.2, max: 1.4 }
  }
};

// УРОВНИ ТРЕНИРОВАННОСТИ - ОПИСАНИЯ
export const USER_LEVELS = {
  beginner: {
    label: 'Начинающий',
    description: 'Менее 6 месяцев тренировок',
    volumeMultiplier: 0.8,
    frequency: 3
  },
  intermediate: {
    label: 'Средний',
    description: '6-18 месяцев тренировок',
    volumeMultiplier: 1.0,
    frequency: 4
  },
  advanced: {
    label: 'Продвинутый',
    description: 'Более 18 месяцев тренировок',
    volumeMultiplier: 1.2,
    frequency: 5
  }
};

// ФУНКЦИЯ ДЛЯ ПОЛУЧЕНИЯ УПРАЖНЕНИЙ ПО КАТЕГОРИИ
export const getExercisesByCategory = (category: ExerciseCategory): Exercise[] => {
  return EXERCISES.filter(ex => ex.category === category);
};

// ФУНКЦИЯ ДЛЯ ПОЛУЧЕНИЯ БАЗОВЫХ УПРАЖНЕНИЙ
export const getMultiJointExercises = (): Exercise[] => {
  return EXERCISES.filter(ex => ex.isMultiJoint === true);
};

// ФУНКЦИЯ ДЛЯ ПОЛУЧЕНИЯ ИЗОЛЯЦИИ
export const getIsolationExercises = (): Exercise[] => {
  return EXERCISES.filter(ex => ex.isMultiJoint === false);
};

// ФУНКЦИЯ ДЛЯ ПРОВЕРКИ КОМБИНАЦИИ (база + изоляция)
export const isValidExerciseCombination = (exercise1: Exercise, exercise2: Exercise): boolean => {
  if (exercise1.isMultiJoint && exercise2.isMultiJoint) {
    return false;
  }
  if (!exercise1.isMultiJoint && !exercise2.isMultiJoint) {
    return true;
  }
  return true;
};

// ✅ ВСЕ ЭКСПОРТЫ УЖЕ ЕСТЬ ВЫШЕ - НИЧЕГО НЕ ДОБАВЛЯТЬ В КОНЦЕ!