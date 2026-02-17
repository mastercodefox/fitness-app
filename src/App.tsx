import React, { useState, useEffect, createContext } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Box } from '@mui/material';

import WorkoutScreen from './screens/WorkoutScreen';
import HistoryScreen from './screens/HistoryScreen';
import ProgressScreen from './screens/ProgressScreen';
import ProfileScreen from './screens/ProfileScreen';
import WeekPlanScreen from './screens/WeekPlanScreen';
import AssessmentScreen from './screens/AssessmentScreen';
import ExerciseSelectionScreen from './screens/ExerciseSelectionScreen';
import { Navigation } from './components/Navigation';
import SplitService from './services/SplitService';
import CycleService from './services/CycleService';
import ProgramService from './services/ProgramService';
import { PlanGeneratorService } from './services/PlanGeneratorService';
import TelegramService from './services/TelegramService';
import { TrainingCycle } from './types/cycle.types';

import { 
  UserProfile, 
  Workout, 
  WorkoutDay, 
  WorkoutSplit,
  PlannedExercise,
  UserExerciseSelection
} from './types/workout.types';

interface WorkoutContextType {
  workouts: Workout[];
  addWorkout: (workout: Workout) => void;
  
  weekPlan: WorkoutDay[];
  setWeekPlan: (plan: WorkoutDay[]) => void;
  updateWorkoutDay: (dayId: string, exercises: PlannedExercise[]) => void;
  completeWorkoutDay: (dayId: string, workout: Workout) => void;
  generateNextWeek: () => void;
  regenerateWeekPlan: (selectedExercises?: UserExerciseSelection) => void;
  
  userProfile: UserProfile | null;
  updateProfile: (profile: UserProfile) => void;
  clearTodayWorkout: () => void;
  
  currentWorkoutDay: WorkoutDay | null;
  setCurrentWorkoutDay: (day: WorkoutDay | null) => void;
  
  currentCycle: TrainingCycle | null;
  setCurrentCycle: (cycle: TrainingCycle | null) => void;
  
  userExerciseSelection: UserExerciseSelection | null;
  setUserExerciseSelection: (selection: UserExerciseSelection | null) => void;
}

export const WorkoutContext = createContext<WorkoutContextType>({
  workouts: [],
  addWorkout: () => {},
  
  weekPlan: [],
  setWeekPlan: () => {},
  updateWorkoutDay: () => {},
  completeWorkoutDay: () => {},
  generateNextWeek: () => {},
  regenerateWeekPlan: () => {},
  
  userProfile: null,
  updateProfile: () => {},
  clearTodayWorkout: () => {},
  
  currentWorkoutDay: null,
  setCurrentWorkoutDay: () => {},
  
  currentCycle: null,
  setCurrentCycle: () => {},
  
  userExerciseSelection: null,
  setUserExerciseSelection: () => {}
});

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: '#6366f1' },
    secondary: { main: '#ec4899' },
    background: { default: '#0f0f11', paper: '#1a1a1e' },
    success: { main: '#22c55e' },
    warning: { main: '#f59e0b' },
    error: { main: '#ef4444' },
    info: { main: '#3b82f6' }
  },
  typography: {
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, sans-serif',
  },
  shape: { borderRadius: 12 },
  components: {
    MuiButton: {
      styleOverrides: { root: { textTransform: 'none', fontWeight: 600 } }
    },
    MuiPaper: {
      styleOverrides: { root: { backgroundImage: 'none' } }
    }
  }
});

function App() {
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [weekPlan, setWeekPlan] = useState<WorkoutDay[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [currentWorkoutDay, setCurrentWorkoutDay] = useState<WorkoutDay | null>(null);
  const [currentCycle, setCurrentCycle] = useState<TrainingCycle | null>(null);
  const [needsAssessment, setNeedsAssessment] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userExerciseSelection, setUserExerciseSelection] = useState<UserExerciseSelection | null>(null);
  const [forceRegenerate, setForceRegenerate] = useState(false);

  const telegram = TelegramService;

  // Загрузка данных
  useEffect(() => {
    const loadData = () => {
      console.log('📥 ===== НАЧАЛО ЗАГРУЗКИ ДАННЫХ =====');
      
      const savedWorkouts = localStorage.getItem('workouts');
      if (savedWorkouts) {
        setWorkouts(JSON.parse(savedWorkouts));
        console.log('✅ Загружены тренировки:', JSON.parse(savedWorkouts).length);
      }
      
      const savedProfile = localStorage.getItem('userProfile');
      if (savedProfile) {
        const profile = JSON.parse(savedProfile);
        console.log('✅ Загружен профиль:', profile.name);
        console.log('   assessmentCompleted:', profile.assessmentCompleted);
        
        if (!profile.split) {
          profile.split = SplitService.recommendSplit(profile.experience || 'beginner');
        }
        if (!profile.trainingDays) {
          profile.trainingDays = [1, 3, 5];
        }
        if (!profile.availableEquipment) {
          profile.availableEquipment = ['barbell', 'dumbbell', 'machine', 'cable', 'bodyweight'];
        }
        if (profile.usePeriodization === undefined) {
          profile.usePeriodization = true;
        }
        if (!profile.periodizationType) {
          profile.periodizationType = 'linear';
        }
        
        setUserProfile(profile);
        
        const isNewUser = !profile.name || profile.name === 'AI Тренер' || !profile.assessmentCompleted;
        setNeedsAssessment(isNewUser);
        console.log('   needsAssessment:', isNewUser);
        
      } else {
        console.log('👤 Новый пользователь');
        setNeedsAssessment(true);
      }
      
      const savedWeekPlan = localStorage.getItem('weekPlan');
      if (savedWeekPlan) {
        const weekPlanData = JSON.parse(savedWeekPlan);
        setWeekPlan(weekPlanData);
        console.log('✅ Загружен план тренировок, тренировок:', weekPlanData.length);
        
        const activeWorkoutId = localStorage.getItem('activeWorkoutId');
        console.log('🔍 activeWorkoutId из localStorage:', activeWorkoutId);
        
        if (activeWorkoutId) {
          const activeWorkout = weekPlanData.find((day: WorkoutDay) => day.id === activeWorkoutId);
          if (activeWorkout) {
            console.log('   Найдена тренировка в плане:', activeWorkout.name);
            console.log('   Дата:', new Date(activeWorkout.plannedDate).toLocaleDateString());
            console.log('   Завершена:', activeWorkout.completed);
            console.log('   Упражнений:', activeWorkout.exercises?.length || 0);
            
            if (!activeWorkout.completed) {
              setCurrentWorkoutDay(activeWorkout);
              console.log('✅ Загружена активная тренировка:', activeWorkout.name);
            } else {
              console.log('❌ Тренировка уже завершена, удаляем activeWorkoutId');
              localStorage.removeItem('activeWorkoutId');
            }
          } else {
            console.log('❌ Тренировка с id', activeWorkoutId, 'не найдена в плане');
            localStorage.removeItem('activeWorkoutId');
          }
        }
      } else {
        console.log('📅 План тренировок не найден');
      }
      
      const savedCycle = localStorage.getItem('currentCycle');
      if (savedCycle) {
        setCurrentCycle(JSON.parse(savedCycle));
        console.log('✅ Загружен цикл');
      }
      
      const savedSelection = localStorage.getItem('userExerciseSelection');
      if (savedSelection) {
        setUserExerciseSelection(JSON.parse(savedSelection));
        console.log('✅ Загружен выбор упражнений');
      }
      
      console.log('📥 ===== ЗАГРУЗКА ЗАВЕРШЕНА =====\n');
      setIsLoading(false);
    };
    
    loadData();
  }, []);

  // Сохранение weekPlan в localStorage при изменении
  useEffect(() => {
    if (weekPlan.length > 0) {
      localStorage.setItem('weekPlan', JSON.stringify(weekPlan));
      console.log('💾 weekPlan сохранен в localStorage, тренировок:', weekPlan.length);
    }
  }, [weekPlan]);

  // Сохранение currentWorkoutDay в localStorage при изменении
  useEffect(() => {
    if (currentWorkoutDay) {
      localStorage.setItem('activeWorkoutId', currentWorkoutDay.id);
      console.log('💾 activeWorkoutId сохранен:', currentWorkoutDay.id);
    }
  }, [currentWorkoutDay]);

  // Сохранение цикла
  useEffect(() => {
    if (currentCycle) {
      localStorage.setItem('currentCycle', JSON.stringify(currentCycle));
    }
  }, [currentCycle]);

  // Сохранение выбора упражнений
  useEffect(() => {
    if (userExerciseSelection) {
      localStorage.setItem('userExerciseSelection', JSON.stringify(userExerciseSelection));
    }
  }, [userExerciseSelection]);

  // Telegram инициализация
  useEffect(() => {
    if (userProfile && !userProfile.name && telegram.user) {
      const updatedProfile = {
        ...userProfile,
        name: telegram.getUserInfo()
      };
      updateProfile(updatedProfile);
    }
    
    const handleThemeChange = () => {
      document.documentElement.style.setProperty('--tg-bg-color', telegram.webApp.themeParams.bg_color || '#0f0f11');
    };
    
    telegram.webApp.onEvent('themeChanged', handleThemeChange);
    
    return () => {
      telegram.webApp.offEvent('themeChanged', handleThemeChange);
    };
  }, [userProfile]);

  // Авто-генерация плана и цикла (только если оценка пройдена и нет активной тренировки)
  useEffect(() => {
    if (userProfile && userProfile.assessmentCompleted && !isLoading && !currentWorkoutDay && !forceRegenerate) {
      console.log('🔄 Проверка необходимости генерации плана...');
      console.log('   weekPlan.length:', weekPlan.length);
      console.log('   currentCycle:', currentCycle ? 'есть' : 'нет');
      
      const needsCycle = !currentCycle || 
                         (userProfile.usePeriodization && SplitService.needsNewCycle(weekPlan, 4));
      
      if (weekPlan.length === 0 || needsCycle) {
        console.log('🔄 Авто-генерация плана...');
        regenerateFullPlan();
      } else {
        console.log('✅ План уже существует, генерация не требуется');
      }
    }
  }, [userProfile, isLoading, currentWorkoutDay]);

  const addWorkout = (workout: Workout) => {
    const updatedWorkouts = [workout, ...workouts];
    setWorkouts(updatedWorkouts);
    localStorage.setItem('workouts', JSON.stringify(updatedWorkouts));
  };

  const updateProfile = (profile: UserProfile) => {
    console.log('👤 App: обновление профиля', profile);
    setUserProfile(profile);
    localStorage.setItem('userProfile', JSON.stringify(profile));
    
    if (profile.assessmentCompleted) {
      setNeedsAssessment(false);
    }
    
    // При обновлении профиля переходим к выбору упражнений
    setTimeout(() => {
      window.location.href = '/exercise-selection';
    }, 100);
  };

  const updateWorkoutDay = (dayId: string, exercises: PlannedExercise[]) => {
    setWeekPlan(prev => prev.map(day => 
      day.id === dayId 
        ? { ...day, exercises } 
        : day
    ));
  };

  const completeWorkoutDay = (dayId: string, workout: Workout) => {
    console.log('🏁 Завершение тренировки:', dayId);
    
    setWeekPlan(prev => prev.map(day => 
      day.id === dayId 
        ? { ...day, completed: true, completedDate: new Date().toISOString() } 
        : day
    ));
    
    addWorkout(workout);
    setCurrentWorkoutDay(null);
    localStorage.removeItem('activeWorkoutId');
    console.log('🗑️ activeWorkoutId удален');
  };

  // ПОЛНАЯ ПЕРЕГЕНЕРАЦИЯ ПЛАНА С ИСПОЛЬЗОВАНИЕМ НОВОЙ АРХИТЕКТУРЫ
  const regenerateFullPlan = (selectedExercises?: UserExerciseSelection) => {
    if (!userProfile) {
      console.log('❌ Невозможно сгенерировать план: нет профиля');
      return;
    }
    
    setForceRegenerate(true);
    
    // Используем переданный выбор или сохраненный
    const selection = selectedExercises || userExerciseSelection;
    
    if (!selection) {
      console.log('❌ Невозможно сгенерировать план: нет выбора упражнений');
      setForceRegenerate(false);
      return;
    }
    
    console.log('🔄 Генерация плана через новую архитектуру...');
    console.log('   Сплит:', userProfile.split);
    console.log('   Периодизация:', userProfile.periodizationType);
    
    // Сохраняем ID активной тренировки перед сбросом
    const activeWorkoutId = currentWorkoutDay?.id || localStorage.getItem('activeWorkoutId');
    
    // Генерируем новый план через PlanGeneratorService
    const { weekPlan: newPlan, cycle: newCycle } = PlanGeneratorService.generateFullPlan(
      userProfile,
      selection,
      new Date()
    );
    
    console.log('✅ План сгенерирован, тренировок:', newPlan.length);
    
    setWeekPlan(newPlan);
    if (newCycle) {
      setCurrentCycle(newCycle);
    }
    
    // Сохраняем выбор упражнений
    setUserExerciseSelection(selection);
    
    // Если была активная тренировка, пробуем восстановить её в новом плане
    if (activeWorkoutId) {
      const workoutInNewPlan = newPlan.find(w => w.id === activeWorkoutId);
      if (workoutInNewPlan && !workoutInNewPlan.completed) {
        setCurrentWorkoutDay(workoutInNewPlan);
        localStorage.setItem('activeWorkoutId', activeWorkoutId);
        console.log('✅ Активная тренировка сохранена в новом плане');
      } else {
        setCurrentWorkoutDay(null);
        localStorage.removeItem('activeWorkoutId');
        console.log('⚠️ Активная тренировка не найдена в новом плане, очищаем');
      }
    }
    
    setForceRegenerate(false);
  };

  const generateNextWeek = () => {
    if (!userProfile || !userExerciseSelection) return;
    regenerateFullPlan(userExerciseSelection);
  };

  const regenerateWeekPlan = (selectedExercises?: UserExerciseSelection) => {
    regenerateFullPlan(selectedExercises);
  };

  const clearTodayWorkout = () => {
    const today = new Date().toDateString();
    
    const filteredWorkouts = workouts.filter(w => {
      const workoutDate = new Date(w.date).toDateString();
      return workoutDate !== today;
    });
    setWorkouts(filteredWorkouts);
    localStorage.setItem('workouts', JSON.stringify(filteredWorkouts));
    
    setWeekPlan(prev => prev.map(day => {
      const dayDate = new Date(day.plannedDate).toDateString();
      if (dayDate === today) {
        return { ...day, completed: false, completedDate: undefined, exercises: [] };
      }
      return day;
    }));
    
    setCurrentWorkoutDay(null);
    localStorage.removeItem('activeWorkoutId');
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <WorkoutContext.Provider value={{ 
        workouts, 
        addWorkout,
        
        weekPlan,
        setWeekPlan,
        updateWorkoutDay,
        completeWorkoutDay,
        generateNextWeek,
        regenerateWeekPlan,
        
        userProfile, 
        updateProfile,
        clearTodayWorkout,
        
        currentWorkoutDay,
        setCurrentWorkoutDay,
        
        currentCycle,
        setCurrentCycle,
        
        userExerciseSelection,
        setUserExerciseSelection
      }}>
        <BrowserRouter>
          <Box sx={{ pb: 7 }}>
            {needsAssessment && userProfile ? (
              <Routes>
                <Route path="/assessment" element={<AssessmentScreen />} />
                <Route path="*" element={<Navigate to="/assessment" />} />
              </Routes>
            ) : (
              <Routes>
                <Route path="/" element={<Navigate to="/week" />} />
                <Route path="/workout" element={<WorkoutScreen />} />
                <Route path="/week" element={<WeekPlanScreen />} />
                <Route path="/history" element={<HistoryScreen />} />
                <Route path="/progress" element={<ProgressScreen />} />
                <Route path="/profile" element={<ProfileScreen />} />
                <Route path="/exercise-selection" element={<ExerciseSelectionScreen />} />
                <Route path="/assessment" element={<AssessmentScreen />} />
              </Routes>
            )}
            
            {!needsAssessment && <Navigation />}
          </Box>
        </BrowserRouter>
      </WorkoutContext.Provider>
    </ThemeProvider>
  );
}

export default App;