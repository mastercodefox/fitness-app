import React, { useState, useEffect, useContext } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Button,
  LinearProgress,
  Chip,
  Alert,
  Snackbar,
  Card,
  CardContent,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl
} from '@mui/material';
import {
  Timer,
  FitnessCenter,
  CheckCircle,
  ArrowForward,
  Save,
  Delete
} from '@mui/icons-material';
import { WorkoutContext } from '../App';
import RestCalculator from '../services/RestCalculator';
import ProgramService from '../services/ProgramService';
import TelegramService from '../services/TelegramService';

interface ActiveSet {
  weight: number;
  reps: number;
  rpe?: number;
  completed: boolean;
  actualRpe?: number;
  restTime?: number;
  id: string;
}

interface ActiveExercise {
  id: string;
  name: string;
  sets: ActiveSet[];
  currentSetIndex: number;
  restTimerActive: boolean;
  timeLeft?: number;
  restBetweenSets: number;
  currentRestTime?: number;
}

const WorkoutScreen: React.FC = () => {
  const { 
    currentWorkoutDay, 
    setCurrentWorkoutDay, 
    completeWorkoutDay,
    workouts,
    userProfile,
    clearTodayWorkout
  } = useContext(WorkoutContext);
  
  const telegram = TelegramService;
  const [exercises, setExercises] = useState<ActiveExercise[]>([]);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [rpeDialog, setRpeDialog] = useState<{ exerciseIndex: number; setIndex: number } | null>(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [isWorkoutSaved, setIsWorkoutSaved] = useState(false);
  const [finishDialogOpen, setFinishDialogOpen] = useState(false);
  const [finishAction, setFinishAction] = useState<'save' | 'discard'>('save');
  const [isLoading, setIsLoading] = useState(true);

  // Загружаем тренировку
  useEffect(() => {
    if (currentWorkoutDay) {
      console.log('✅ Загружаем тренировку:', currentWorkoutDay.name);
      console.log('📋 Упражнения:', currentWorkoutDay.exercises?.length || 0);
      
      if (currentWorkoutDay.exercises && currentWorkoutDay.exercises.length > 0) {
        // Преобразуем в формат ActiveExercise
        const activeExercises: ActiveExercise[] = currentWorkoutDay.exercises.map(ex => ({
          id: Date.now().toString() + ex.name,
          name: ex.name,
          sets: ex.sets.map(set => ({
            ...set,
            id: Date.now().toString() + Math.random(),
            completed: set.completed || false
          })),
          currentSetIndex: 0,
          restTimerActive: false,
          restBetweenSets: ex.restBetweenSets || 90,
          currentRestTime: undefined
        }));
        
        setExercises(activeExercises);
      }
      setIsLoading(false);
    }
    
    telegram.showBackButton();
    
    return () => {
      // Очистка таймеров
    };
  }, [currentWorkoutDay]);

  // Таймер для отдыха
  useEffect(() => {
    const timer = setInterval(() => {
      setExercises(prev => prev.map((ex, idx) => {
        if (idx === currentExerciseIndex && ex.restTimerActive && ex.timeLeft && ex.timeLeft > 0) {
          return { ...ex, timeLeft: ex.timeLeft - 1 };
        }
        if (idx === currentExerciseIndex && ex.restTimerActive && ex.timeLeft === 0) {
          // Таймер закончился
          telegram.hapticFeedback('medium');
          return { ...ex, restTimerActive: false, timeLeft: undefined, currentRestTime: undefined };
        }
        return ex;
      }));
    }, 1000);

    return () => clearInterval(timer);
  }, [currentExerciseIndex]);

  const handleCompleteSet = (exerciseIndex: number, setIndex: number) => {
    // Открываем диалог RPE
    setRpeDialog({ exerciseIndex, setIndex });
  };

  const handleRpeSubmit = (rpeValue: number) => {
    if (!rpeDialog) return;

    const { exerciseIndex, setIndex } = rpeDialog;
    const exercise = exercises[exerciseIndex];
    const currentSet = exercise.sets[setIndex];

    // Рассчитываем время отдыха на основе RPE
    const restTime = RestCalculator.calculateRestTime(rpeValue);
    
    // Рассчитываем следующий вес (для рекомендации)
    const nextWeight = RestCalculator.calculateNextWeight(
      currentSet.weight,
      currentSet.reps,
      rpeValue,
      userProfile?.experience || 'intermediate'
    );

    setExercises(prev => {
      const newExercises = prev.map((ex, exIdx) => {
        if (exIdx === exerciseIndex) {
          // Обновляем текущий сет
          const updatedSets = ex.sets.map((set, setIdx) => {
            if (setIdx === setIndex) {
              return {
                ...set,
                completed: true,
                actualRpe: rpeValue,
                restTime
              };
            }
            return set;
          });

          // Определяем следующий сет
          const nextSetIndex = setIndex + 1;
          const hasMoreSets = nextSetIndex < updatedSets.length;

          return {
            ...ex,
            sets: updatedSets,
            currentSetIndex: hasMoreSets ? nextSetIndex : setIndex,
            restTimerActive: hasMoreSets,
            timeLeft: hasMoreSets ? restTime : undefined,
            currentRestTime: hasMoreSets ? restTime : undefined
          };
        }
        return ex;
      });

      // Проверяем, нужно ли перейти к следующему упражнению
      setTimeout(() => {
        const currentEx = newExercises[exerciseIndex];
        const allSetsCompleted = currentEx.sets.every(set => set.completed);
        
        if (allSetsCompleted) {
          const nextExerciseIndex = exerciseIndex + 1;
          if (nextExerciseIndex < newExercises.length) {
            setCurrentExerciseIndex(nextExerciseIndex);
            setSnackbarMessage(`✅ Переходим к ${newExercises[nextExerciseIndex].name}`);
            setSnackbarOpen(true);
            telegram.hapticFeedback('light');
          } else {
            setSnackbarMessage('🎉 Все упражнения выполнены! Можно завершить тренировку.');
            setSnackbarOpen(true);
            telegram.hapticFeedback('heavy');
          }
        }
      }, 100);

      return newExercises;
    });

    // Показываем рекомендацию по весу
    if (nextWeight !== currentSet.weight) {
      setSnackbarMessage(`📊 AI рекомендация: следующий раз ${nextWeight}кг`);
      setSnackbarOpen(true);
    }

    setRpeDialog(null);
  };

  const handleFinishWorkout = () => {
    if (!currentWorkoutDay) return;
    
    setFinishDialogOpen(true);
  };

  const handleFinishConfirm = () => {
    if (finishAction === 'save') {
      // Сохраняем тренировку
      saveWorkout();
    } else {
      // Не сохраняем, просто выходим
      discardWorkout();
    }
    setFinishDialogOpen(false);
  };

  const saveWorkout = () => {
    if (!currentWorkoutDay) return;
    
    // Создаем завершенную тренировку
    const completedWorkout = {
      id: currentWorkoutDay.id,
      date: new Date().toISOString(),
      name: currentWorkoutDay.name,
      exercises: exercises.map(ex => ({
        name: ex.name,
        sets: ex.sets.filter(s => s.completed).map(s => ({
          weight: s.weight,
          reps: s.reps,
          rpe: s.rpe,
          actualRpe: s.actualRpe,
          completed: true
        }))
      }))
    };
    
    // Анализируем тренировку
    const analysis = ProgramService.updateFromCompletedWorkout(completedWorkout, workouts);
    
    // Сохраняем
    completeWorkoutDay(currentWorkoutDay.id, completedWorkout);
    setIsWorkoutSaved(true);
    
    telegram.hapticFeedback('heavy');
    setSnackbarMessage('✅ Тренировка сохранена! ' + (analysis.recommendations.length > 0 ? analysis.recommendations.join(' • ') : ''));
    setSnackbarOpen(true);
    
    // Через 2 секунды переходим на страницу прогресса
    setTimeout(() => {
      window.location.href = '/progress';
    }, 2000);
  };

  const discardWorkout = () => {
    if (!currentWorkoutDay) return;
    
    // Просто очищаем активную тренировку без сохранения
    setCurrentWorkoutDay(null);
    localStorage.removeItem('activeWorkoutId');
    
    telegram.hapticFeedback('light');
    setSnackbarMessage('🔄 Тренировка завершена без сохранения');
    setSnackbarOpen(true);
    
    // Через 1.5 секунды переходим на план
    setTimeout(() => {
      window.location.href = '/week';
    }, 1500);
  };

  const getProgress = () => {
    if (exercises.length === 0) return 0;
    
    const total = exercises.reduce((acc, ex) => acc + ex.sets.length, 0);
    const completed = exercises.reduce((acc, ex) => 
      acc + ex.sets.filter(s => s.completed).length, 0
    );
    return (completed / total) * 100;
  };

  if (isLoading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Paper sx={{ p: 6, textAlign: 'center' }}>
          <Typography variant="h5">Загрузка тренировки...</Typography>
        </Paper>
      </Container>
    );
  }

  if (!currentWorkoutDay || exercises.length === 0) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Paper sx={{ p: 6, textAlign: 'center' }}>
          <FitnessCenter sx={{ fontSize: 64, color: 'text.secondary', mb: 2, opacity: 0.5 }} />
          <Typography variant="h5" gutterBottom>
            Нет активной тренировки
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            Выбери тренировку в плане и нажми "Начать".
          </Typography>
          <Button 
            variant="contained" 
            onClick={() => window.location.href = '/week'}
          >
            К плану тренировок
          </Button>
        </Paper>
      </Container>
    );
  }

  const currentExercise = exercises[currentExerciseIndex];
  const progress = getProgress();

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Заголовок */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
            <FitnessCenter sx={{ fontSize: 32, color: 'primary.main' }} />
            {currentWorkoutDay.name}
          </Typography>
        </Box>
        <Box>
          {!isWorkoutSaved ? (
            <Button
              variant="contained"
              color="success"
              onClick={handleFinishWorkout}
              startIcon={<CheckCircle />}
              size="large"
            >
              Завершить тренировку
            </Button>
          ) : (
            <Chip
              icon={<CheckCircle />}
              label="Сохранено"
              color="success"
              sx={{ height: 40, fontSize: 16 }}
            />
          )}
        </Box>
      </Box>

      {/* Диалог завершения тренировки */}
      <Dialog open={finishDialogOpen} onClose={() => setFinishDialogOpen(false)}>
        <DialogTitle>Завершить тренировку?</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" paragraph>
            Выполнено {Math.round(progress)}% тренировки.
          </Typography>
          
          <FormControl component="fieldset">
            <RadioGroup
              value={finishAction}
              onChange={(e) => setFinishAction(e.target.value as 'save' | 'discard')}
            >
              <FormControlLabel 
                value="save" 
                control={<Radio />} 
                label={
                  <Box>
                    <Typography variant="body1">💾 Сохранить и завершить</Typography>
                    <Typography variant="caption" color="text.secondary">
                      Тренировка попадет в историю, прогресс сохранится
                    </Typography>
                  </Box>
                } 
              />
              <FormControlLabel 
                value="discard" 
                control={<Radio />} 
                label={
                  <Box>
                    <Typography variant="body1">🗑️ Завершить без сохранения</Typography>
                    <Typography variant="caption" color="text.secondary">
                      Тренировка не сохранится, можно будет начать заново
                    </Typography>
                  </Box>
                } 
              />
            </RadioGroup>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setFinishDialogOpen(false)}>Отмена</Button>
          <Button 
            onClick={handleFinishConfirm} 
            variant="contained" 
            color={finishAction === 'save' ? 'success' : 'error'}
            startIcon={finishAction === 'save' ? <Save /> : <Delete />}
          >
            {finishAction === 'save' ? 'Сохранить' : 'Завершить'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Прогресс */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
          Прогресс
        </Typography>
        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Общий прогресс тренировки
          </Typography>
          <LinearProgress 
            variant="determinate" 
            value={progress} 
            sx={{ height: 8, borderRadius: 4 }}
          />
        </Box>

        {/* Список упражнений */}
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          {exercises.map((ex, idx) => {
            const completedSets = ex.sets.filter(s => s.completed).length;
            const isCurrent = idx === currentExerciseIndex;
            const isCompleted = completedSets === ex.sets.length;
            
            return (
              <Chip
                key={ex.id}
                label={`${idx + 1}. ${ex.name} (${completedSets}/${ex.sets.length})`}
                color={isCurrent ? 'primary' : isCompleted ? 'success' : 'default'}
                variant={isCurrent ? 'filled' : 'outlined'}
                onClick={() => setCurrentExerciseIndex(idx)}
                sx={{ cursor: 'pointer' }}
              />
            );
          })}
        </Box>
      </Paper>

      {/* Текущее упражнение */}
      {currentExercise && (
        <Card sx={{ border: 2, borderColor: 'primary.main' }}>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h5" sx={{ fontWeight: 700 }}>
                {currentExercise.name}
              </Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                {currentExercise.restTimerActive && currentExercise.currentRestTime && (
                  <Chip 
                    icon={<Timer />} 
                    label={`Отдых: ${currentExercise.timeLeft}с`}
                    color={currentExercise.timeLeft && currentExercise.timeLeft > 30 ? 'info' : 'warning'}
                  />
                )}
                <Chip 
                  label={`${currentExercise.currentSetIndex + 1}/${currentExercise.sets.length}`}
                  color="primary"
                />
              </Box>
            </Box>

            {/* Сеты */}
            {currentExercise.sets.map((set, setIndex) => (
              <Paper
                key={set.id}
                variant="outlined"
                sx={{
                  p: 3,
                  mb: 2,
                  bgcolor: set.completed ? 'action.selected' : 'background.paper',
                  borderColor: set.completed ? 'success.main' : 'divider',
                  opacity: setIndex === currentExercise.currentSetIndex ? 1 : set.completed ? 0.8 : 0.5
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                    <Typography variant="h6" sx={{ fontWeight: 700, minWidth: 40 }}>
                      #{setIndex + 1}
                    </Typography>
                    <Box>
                      <Typography variant="h4" sx={{ fontWeight: 700, color: 'primary.main' }}>
                        {set.weight} кг
                      </Typography>
                      <Typography variant="body1" color="text.secondary">
                        {set.reps} повторений
                      </Typography>
                    </Box>
                  </Box>

                  <Box>
                    {set.completed ? (
                      <Chip
                        icon={<CheckCircle />}
                        label={`RPE ${set.actualRpe} • ${set.restTime}с`}
                        color="success"
                        sx={{ height: 32 }}
                      />
                    ) : setIndex === currentExercise.currentSetIndex ? (
                      <Button
                        variant="contained"
                        color="success"
                        size="large"
                        onClick={() => handleCompleteSet(currentExerciseIndex, setIndex)}
                        sx={{ px: 4 }}
                        disabled={isWorkoutSaved}
                      >
                        Выполнено
                      </Button>
                    ) : (
                      <Chip
                        label="Ожидание"
                        color="default"
                        sx={{ height: 32 }}
                      />
                    )}
                  </Box>
                </Box>
              </Paper>
            ))}

            {/* Кнопка перехода к следующему упражнению */}
            {currentExercise.sets.every(set => set.completed) && 
             currentExerciseIndex < exercises.length - 1 && (
              <Button
                variant="contained"
                color="primary"
                fullWidth
                size="large"
                onClick={() => {
                  setCurrentExerciseIndex(currentExerciseIndex + 1);
                  setSnackbarMessage(`✅ Переходим к ${exercises[currentExerciseIndex + 1].name}`);
                  setSnackbarOpen(true);
                  telegram.hapticFeedback('light');
                }}
                startIcon={<ArrowForward />}
                sx={{ mt: 2 }}
                disabled={isWorkoutSaved}
              >
                Следующее упражнение
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* RPE Dialog */}
      {rpeDialog && (
        <Paper
          sx={{
            position: 'fixed',
            bottom: 80,
            left: '50%',
            transform: 'translateX(-50%)',
            width: '90%',
            maxWidth: 600,
            p: 3,
            zIndex: 1000,
            border: 2,
            borderColor: 'primary.main'
          }}
        >
          <Typography variant="h6" gutterBottom align="center">
            Оцените интенсивность (RPE 1-10)
          </Typography>
          <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 2 }}>
            Насколько тяжело было выполнить подход?
          </Typography>
          
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, flexWrap: 'wrap' }}>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(rpe => (
              <Button
                key={rpe}
                variant={rpe === 7 ? 'contained' : 'outlined'}
                color={
                  rpe >= 9 ? 'error' : 
                  rpe >= 7 ? 'warning' : 
                  rpe >= 4 ? 'info' : 'success'
                }
                onClick={() => handleRpeSubmit(rpe)}
                sx={{ minWidth: 50 }}
                disabled={isWorkoutSaved}
              >
                {rpe}
              </Button>
            ))}
          </Box>
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3, flexWrap: 'wrap' }}>
            <Box>
              <Typography variant="caption" color="success.main" display="block">
                RPE 1-3: Очень легко
              </Typography>
              <Typography variant="caption" color="success.main" display="block">
                Отдых: {RestCalculator.calculateRestTime(3)}с
              </Typography>
            </Box>
            <Box>
              <Typography variant="caption" color="info.main" display="block">
                RPE 4-6: Комфортно
              </Typography>
              <Typography variant="caption" color="info.main" display="block">
                Отдых: {RestCalculator.calculateRestTime(6)}с
              </Typography>
            </Box>
            <Box>
              <Typography variant="caption" color="warning.main" display="block">
                RPE 7-8: Тяжело
              </Typography>
              <Typography variant="caption" color="warning.main" display="block">
                Отдых: {RestCalculator.calculateRestTime(8)}с
              </Typography>
            </Box>
            <Box>
              <Typography variant="caption" color="error.main" display="block">
                RPE 9-10: Предел
              </Typography>
              <Typography variant="caption" color="error.main" display="block">
                Отдых: {RestCalculator.calculateRestTime(10)}с
              </Typography>
            </Box>
          </Box>

          <Button 
            size="small" 
            sx={{ mt: 2 }}
            onClick={() => setRpeDialog(null)}
            fullWidth
          >
            Закрыть
          </Button>
        </Paper>
      )}

      {/* Snackbar */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={4000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="success" sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default WorkoutScreen;