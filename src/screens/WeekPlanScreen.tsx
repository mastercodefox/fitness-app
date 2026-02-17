import React, { useContext, useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Card,
  CardContent,
  Button,
  Chip,
  IconButton,
  LinearProgress,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  ToggleButton,
  ToggleButtonGroup
} from '@mui/material';
import {
  CalendarToday,
  FitnessCenter,
  CheckCircle,
  RadioButtonUnchecked,
  ChevronLeft,
  ChevronRight,
  Info,
  Schedule,
  Loop,
  ViewWeek,
  ViewModule
} from '@mui/icons-material';
import { WorkoutContext } from '../App';
import SplitService from '../services/SplitService';
import CycleService from '../services/CycleService';
import TelegramService from '../services/TelegramService';
import { WorkoutDay } from '../types/workout.types';

const WeekPlanScreen: React.FC = () => {
  const { 
    weekPlan, 
    userProfile, 
    setCurrentWorkoutDay, 
    currentWorkoutDay,
    currentCycle
  } = useContext(WorkoutContext);
  
  const telegram = TelegramService;
  const [weekOffset, setWeekOffset] = useState(0);
  const [monthOffset, setMonthOffset] = useState(0);
  const [infoDialog, setInfoDialog] = useState(false);
  const [cycleDialog, setCycleDialog] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [viewMode, setViewMode] = useState<'week' | 'month'>('week');

  useEffect(() => {
    setRefreshKey(prev => prev + 1);
  }, [weekPlan, currentWorkoutDay, currentCycle]);

  // Telegram BackButton
  useEffect(() => {
    if (window.location.pathname === '/week') {
      telegram.hideBackButton();
    } else {
      telegram.showBackButton();
    }
    
    return () => {
      telegram.hideBackButton();
    };
  }, [window.location.pathname]);

  // Получаем тренировки для отображения
  const monthDisplay = SplitService.getMonthDisplay(weekPlan, new Date(), monthOffset);
  
  const weekDays = [
    'Понедельник',
    'Вторник', 
    'Среда',
    'Четверг',
    'Пятница',
    'Суббота',
    'Воскресенье'
  ];

  const getWeekDays = (workouts: WorkoutDay[], offset: number = 0) => {
    const display = SplitService.getWeekDisplay(workouts, new Date(), offset);
    
    return display.map((day, index) => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const compareDate = new Date(day.date);
      compareDate.setHours(0, 0, 0, 0);
      
      return {
        dayName: weekDays[index],
        date: day.date,
        dateStr: day.date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' }),
        workout: day.workout,
        isToday: compareDate.getTime() === today.getTime(),
        isPast: compareDate < today,
        isFuture: compareDate > today,
        isActive: day.workout ? (currentWorkoutDay?.id === day.workout.id && !day.workout.completed) : false
      };
    });
  };

  const weekDaysData = getWeekDays(weekPlan, weekOffset);

  const handleStartWorkout = (workout: WorkoutDay) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const workoutDate = new Date(workout.plannedDate);
    workoutDate.setHours(0, 0, 0, 0);
    
    if (workoutDate.getTime() !== today.getTime()) {
      telegram.showNotification('❌ Можно начать только тренировку на сегодня', 'error');
      return;
    }
    
    if (workout.completed) {
      telegram.showNotification('❌ Тренировка уже завершена', 'error');
      return;
    }
    
    console.log('🚀 Начинаем тренировку:', workout.name, workout.id);
    
    localStorage.setItem('activeWorkoutId', workout.id);
    setCurrentWorkoutDay(workout);
    
    setTimeout(() => {
      window.location.href = '/workout';
    }, 100);
  };

  const handlePrev = () => {
    if (viewMode === 'week') {
      setWeekOffset(prev => Math.max(prev - 1, -4));
    } else {
      setMonthOffset(prev => prev - 1);
    }
  };

  const handleNext = () => {
    if (viewMode === 'week') {
      setWeekOffset(prev => prev + 1);
    } else {
      setMonthOffset(prev => prev + 1);
    }
  };

  const handleContinueWorkout = () => {
    window.location.href = '/workout';
  };

  const handleViewModeChange = (
    event: React.MouseEvent<HTMLElement>,
    newMode: 'week' | 'month',
  ) => {
    if (newMode !== null) {
      setViewMode(newMode);
      setWeekOffset(0);
      setMonthOffset(0);
    }
  };

  const getPhaseColor = (phase?: string): 'success' | 'warning' | 'info' | 'primary' | 'inherit' => {
    if (!phase) return 'inherit';
    switch (phase) {
      case 'build': return 'success';
      case 'peak': return 'warning';
      case 'deload': return 'info';
      default: return 'inherit';
    }
  };

  const getPhaseIcon = (phase?: string) => {
    if (!phase) return '';
    return phase === 'build' ? '🟢' : 
           phase === 'peak' ? '🟡' : 
           phase === 'deload' ? '🔵' : '';
  };

  const isToday = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const compareDate = new Date(date);
    compareDate.setHours(0, 0, 0, 0);
    return compareDate.getTime() === today.getTime();
  };

  const isPast = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const compareDate = new Date(date);
    compareDate.setHours(0, 0, 0, 0);
    return compareDate < today;
  };

  if (!userProfile) {
    return (
      <Container maxWidth="lg" sx={{ py: { xs: 2, sm: 4 } }}>
        <Paper sx={{ p: { xs: 3, sm: 6 }, textAlign: 'center' }}>
          <FitnessCenter sx={{ fontSize: { xs: 48, sm: 64 }, color: 'text.secondary', mb: 2, opacity: 0.5 }} />
          <Typography variant="h5" gutterBottom sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem' } }}>
            Заполните профиль
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>
            Чтобы создать план тренировок, заполните профиль
          </Typography>
          <Button 
            variant="contained" 
            sx={{ mt: 3, width: { xs: '100%', sm: 'auto' } }}
            onClick={() => window.location.href = '/profile'}
          >
            Перейти в профиль
          </Button>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 1, sm: 4 } }} key={refreshKey}>
      {/* Заголовок */}
      <Box sx={{ 
        display: 'flex', 
        flexDirection: { xs: 'column', sm: 'row' },
        justifyContent: 'space-between', 
        alignItems: { xs: 'flex-start', sm: 'center' }, 
        mb: { xs: 2, sm: 4 },
        gap: { xs: 2, sm: 0 }
      }}>
        <Box>
          <Typography variant="h4" sx={{ 
            fontWeight: 700, 
            display: 'flex', 
            alignItems: 'center', 
            gap: 1,
            fontSize: { xs: '1.5rem', sm: '2.125rem' }
          }}>
            <CalendarToday sx={{ fontSize: { xs: 24, sm: 32 }, color: 'primary.main' }} />
            {viewMode === 'week' ? 'План недели' : 'План месяца'}
          </Typography>
          <Typography variant="subtitle1" color="text.secondary" sx={{ 
            fontSize: { xs: '0.875rem', sm: '1rem' } 
          }}>
            {userProfile?.split ? SplitService.getSplitConfig(userProfile.split).name : 'Full Body'} • {userProfile?.experience === 'beginner' ? 'Начинающий' : userProfile?.experience === 'intermediate' ? 'Средний' : 'Продвинутый'}
          </Typography>
        </Box>
        
        <Box sx={{ 
          display: 'flex', 
          gap: { xs: 0.5, sm: 1 },
          width: { xs: '100%', sm: 'auto' },
          flexWrap: 'wrap'
        }}>
          <ToggleButtonGroup
            size="small"
            value={viewMode}
            exclusive
            onChange={handleViewModeChange}
            sx={{ mr: 1 }}
          >
            <ToggleButton value="week">
              <ViewWeek sx={{ mr: 0.5 }} /> Неделя
            </ToggleButton>
            <ToggleButton value="month">
              <ViewModule sx={{ mr: 0.5 }} /> Месяц
            </ToggleButton>
          </ToggleButtonGroup>
          
          <IconButton onClick={handlePrev} disabled={
            viewMode === 'week' ? weekOffset <= -4 : false
          } size="small">
            <ChevronLeft />
          </IconButton>
          <Button 
            variant="outlined" 
            onClick={() => {
              setWeekOffset(0);
              setMonthOffset(0);
            }}
            size={window.innerWidth <= 600 ? 'small' : 'medium'}
          >
            Текущая
          </Button>
          <IconButton onClick={handleNext} size="small">
            <ChevronRight />
          </IconButton>
          
          {currentCycle && userProfile.usePeriodization !== false && viewMode === 'week' && (
            <Button 
              variant="text" 
              onClick={() => setCycleDialog(true)} 
              startIcon={<Loop />}
              size={window.innerWidth <= 600 ? 'small' : 'medium'}
              color={getPhaseColor(currentCycle.weeks[currentCycle.currentWeek - 1]?.phase)}
              sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
            >
              {getPhaseIcon(currentCycle.weeks[currentCycle.currentWeek - 1]?.phase)} Цикл
            </Button>
          )}
          
          <Button 
            variant="text" 
            onClick={() => setInfoDialog(true)} 
            startIcon={<Info />}
            size={window.innerWidth <= 600 ? 'small' : 'medium'}
            sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
          >
            О сплите
          </Button>
        </Box>
      </Box>

      {/* Информация о цикле */}
      {currentCycle && userProfile.usePeriodization !== false && viewMode === 'week' && (
        <Alert 
          severity={getPhaseColor(currentCycle.weeks[currentCycle.currentWeek - 1]?.phase) as any}
          sx={{ mb: 3 }}
          icon={<Loop />}
          action={
            <Button color="inherit" size="small" onClick={() => setCycleDialog(true)}>
              Подробнее
            </Button>
          }
        >
          <Box sx={{ display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <strong>Тренировочный цикл:</strong> {currentCycle.name}
            </Box>
            <Typography variant="caption" color="inherit" sx={{ opacity: 0.9 }}>
              {CycleService.getCurrentStrategyInfo(currentCycle)}
            </Typography>
          </Box>
        </Alert>
      )}

      {/* Активная тренировка */}
      {currentWorkoutDay && (
        <Alert 
          severity="info" 
          sx={{ mb: 3 }}
          action={
            <Button color="inherit" size="small" onClick={handleContinueWorkout}>
              Продолжить
            </Button>
          }
        >
          <strong>Активная тренировка:</strong> {currentWorkoutDay.name} • {new Date(currentWorkoutDay.plannedDate).toLocaleDateString('ru-RU', { weekday: 'long', day: 'numeric', month: 'long' })}
        </Alert>
      )}

      {/* Режим недели */}
      {viewMode === 'week' && (
        <>
          {weekDaysData.filter(d => d.workout).length === 0 && (
            <Alert severity="warning" sx={{ mb: 3 }}>
              <Typography variant="body1">
                Нет запланированных тренировок на эту неделю. Обнови профиль чтобы создать расписание.
              </Typography>
            </Alert>
          )}
          
          <Box sx={{ 
            display: 'grid', 
            gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(7, 1fr)' }, 
            gap: { xs: 1, sm: 2 } 
          }}>
            {weekDaysData.map((day, index) => (
              <WorkoutCard 
                key={index}
                day={day}
                onStartWorkout={handleStartWorkout}
                onContinueWorkout={handleContinueWorkout}
              />
            ))}
          </Box>

          {/* Статистика недели */}
          {weekDaysData.filter(d => d.workout).length > 0 && (
            <Paper sx={{ mt: { xs: 2, sm: 4 }, p: { xs: 2, sm: 3 } }}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                Статистика недели
              </Typography>
              
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 4, justifyContent: 'space-around' }}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="body2" color="text.secondary">Тренировок</Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>
                    {weekDaysData.filter(d => d.workout).length}
                  </Typography>
                </Box>
                
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="body2" color="text.secondary">Выполнено</Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: 'success.main' }}>
                    {weekDaysData.filter(d => d.workout?.completed).length}
                  </Typography>
                </Box>
                
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="body2" color="text.secondary">Осталось</Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: 'warning.main' }}>
                    {weekDaysData.filter(d => d.workout && !d.workout.completed && 
                      new Date(d.workout.plannedDate) >= new Date()).length}
                  </Typography>
                </Box>
              </Box>

              <LinearProgress 
                variant="determinate" 
                value={(weekDaysData.filter(d => d.workout?.completed).length / 
                        weekDaysData.filter(d => d.workout).length) * 100} 
                sx={{ mt: 2, height: 8, borderRadius: 4 }}
              />
            </Paper>
          )}
        </>
      )}

      {/* Режим месяца */}
      {viewMode === 'month' && (
        <>
          {monthDisplay.flat().filter(d => d.workout).length === 0 && (
            <Alert severity="warning" sx={{ mb: 3 }}>
              <Typography variant="body1">
                Нет запланированных тренировок на этот месяц. Обнови профиль чтобы создать расписание.
              </Typography>
            </Alert>
          )}
          
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {monthDisplay.map((week, weekIndex) => {
              const weekStart = week[0].date;
              
              return (
                <Box key={weekIndex}>
                  <Typography variant="subtitle2" sx={{ mb: 1, color: 'text.secondary' }}>
                    Неделя {weekIndex + 1} • с {weekStart.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })}
                  </Typography>
                  <Box sx={{ 
                    display: 'grid', 
                    gridTemplateColumns: { xs: '1fr', sm: 'repeat(7, 1fr)' }, 
                    gap: { xs: 1, sm: 1 } 
                  }}>
                    {week.map((day, dayIndex) => {
                      const isActive = day.workout ? 
                        (currentWorkoutDay?.id === day.workout.id && !day.workout.completed) : false;
                      
                      return (
                        <WorkoutCard 
                          key={dayIndex}
                          day={{
                            dayName: weekDays[dayIndex],
                            date: day.date,
                            dateStr: day.date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' }),
                            workout: day.workout,
                            isToday: isToday(day.date),
                            isPast: isPast(day.date),
                            isActive
                          }}
                          onStartWorkout={handleStartWorkout}
                          onContinueWorkout={handleContinueWorkout}
                        />
                      );
                    })}
                  </Box>
                </Box>
              );
            })}
          </Box>

          {/* Статистика месяца */}
          {monthDisplay.flat().filter(d => d.workout).length > 0 && (
            <Paper sx={{ mt: { xs: 2, sm: 4 }, p: { xs: 2, sm: 3 } }}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                Статистика месяца
              </Typography>
              
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 4, justifyContent: 'space-around' }}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="body2" color="text.secondary">Тренировок</Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>
                    {monthDisplay.flat().filter(d => d.workout).length}
                  </Typography>
                </Box>
                
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="body2" color="text.secondary">Выполнено</Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: 'success.main' }}>
                    {monthDisplay.flat().filter(d => d.workout?.completed).length}
                  </Typography>
                </Box>
                
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="body2" color="text.secondary">Осталось</Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: 'warning.main' }}>
                    {monthDisplay.flat().filter(d => d.workout && !d.workout.completed).length}
                  </Typography>
                </Box>
              </Box>

              <LinearProgress 
                variant="determinate" 
                value={(monthDisplay.flat().filter(d => d.workout?.completed).length / 
                        monthDisplay.flat().filter(d => d.workout).length) * 100} 
                sx={{ mt: 2, height: 8, borderRadius: 4 }}
              />
            </Paper>
          )}
        </>
      )}

      {/* Диалог информации о цикле */}
      <Dialog 
        open={cycleDialog} 
        onClose={() => setCycleDialog(false)} 
        maxWidth="sm" 
        fullWidth
        fullScreen={window.innerWidth <= 600}
      >
        <DialogTitle sx={{ 
          fontSize: { xs: '1.25rem', sm: '1.5rem' },
          pb: { xs: 1, sm: 2 },
          display: 'flex',
          alignItems: 'center',
          gap: 1
        }}>
          <Loop />
          {currentCycle?.name || 'Тренировочный цикл'}
        </DialogTitle>
        <DialogContent>
          {currentCycle && (
            <Alert severity="info" sx={{ mb: 2 }}>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                Стратегия: {CycleService.getCurrentStrategyInfo(currentCycle)}
              </Typography>
            </Alert>
          )}

          <Typography variant="body2" paragraph sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>
            {currentCycle?.type === 'beginner' && '🟢 Втягивающий цикл: 3 недели работы, 1 неделя разгрузки'}
            {currentCycle?.type === 'intermediate' && '🟡 Линейная периодизация: постепенное повышение интенсивности'}
            {currentCycle?.type === 'advanced' && '🔴 Волновая периодизация: еженедельное изменение объема/интенсивности'}
          </Typography>
          
          <Divider sx={{ my: { xs: 1.5, sm: 2 } }} />
          
          <Typography variant="subtitle2" gutterBottom sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>
            Расписание цикла:
          </Typography>
          
          {currentCycle?.weeks.map((week) => (
            <Box 
              key={week.weekNumber} 
              sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 1, 
                mb: 1.5,
                p: 1,
                borderRadius: 1,
                bgcolor: week.weekNumber === currentCycle.currentWeek ? 'action.selected' : 'transparent'
              }}
            >
              <Chip
                size="small"
                label={week.phase === 'build' ? '🟢' : 
                       week.phase === 'peak' ? '🟡' : 
                       week.phase === 'deload' ? '🔵' : '⚪'}
                color={week.phase === 'build' ? 'success' : 
                       week.phase === 'peak' ? 'warning' : 
                       week.phase === 'deload' ? 'info' : 'default'}
                sx={{ height: 24, width: 24 }}
              />
              <Box sx={{ flex: 1 }}>
                <Typography variant="body2" sx={{ fontWeight: week.weekNumber === currentCycle.currentWeek ? 700 : 400 }}>
                  Неделя {week.weekNumber}: {week.description}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Объем: {Math.round(week.volumeMultiplier * 100)}% • Вес: {Math.round(week.intensityMultiplier * 100)}% • RPE: {week.rpeTarget[0]}-{week.rpeTarget[1]}
                </Typography>
                {week.specialInstructions && (
                  <Typography variant="caption" color="info.main" display="block">
                    💡 {week.specialInstructions}
                  </Typography>
                )}
              </Box>
              {week.weekNumber === currentCycle.currentWeek && (
                <Chip label="Текущая" size="small" color="primary" sx={{ height: 24 }} />
              )}
            </Box>
          ))}

          <Alert severity="info" sx={{ mt: 2 }}>
            <Typography variant="body2">
              📊 После завершения цикла начнется новый с увеличенными весами
            </Typography>
          </Alert>
        </DialogContent>
        <DialogActions sx={{ p: { xs: 2, sm: 3 } }}>
          <Button onClick={() => setCycleDialog(false)}>Закрыть</Button>
        </DialogActions>
      </Dialog>

      {/* Диалог информации о сплите */}
      <Dialog 
        open={infoDialog} 
        onClose={() => setInfoDialog(false)} 
        maxWidth="sm" 
        fullWidth
        fullScreen={window.innerWidth <= 600}
      >
        <DialogTitle sx={{ 
          fontSize: { xs: '1.25rem', sm: '1.5rem' },
          pb: { xs: 1, sm: 2 }
        }}>
          {userProfile?.split ? SplitService.getSplitConfig(userProfile.split).name : 'Full Body'}
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" paragraph sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>
            {userProfile?.split === 'fullbody' && '🔥 Все тело за одну тренировку. Оптимально для новичков, 3 раза в неделю.'}
            {userProfile?.split === 'upperlower' && '💪 Верх/Низ. Чередование тренировок верха и низа тела, 4 раза в неделю.'}
            {userProfile?.split === 'ppl' && '🏋️ Жим/Тяга/Ноги. Классический сплит, 3 тренировки в неделю.'}
            {userProfile?.split === 'pushpulllegs' && '⚡ Жим/Тяга/Ноги x2. Продвинутый сплит, 6 тренировок в неделю.'}
            {userProfile?.split === 'bro' && '💎 Bro Split: Грудь/Спина/Плечи/Руки/Ноги. Классический бодибилдерский сплит, 5 тренировок в неделю.'}
          </Typography>
          
          <Divider sx={{ my: { xs: 1.5, sm: 2 } }} />
          
          <Typography variant="subtitle2" gutterBottom sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>
            Ваше расписание на неделю:
          </Typography>
          
          {userProfile?.split && userProfile.trainingDays && (
            <>
              {userProfile.trainingDays
                .sort((a, b) => {
                  const dayA = a === 0 ? 7 : a;
                  const dayB = b === 0 ? 7 : b;
                  return dayA - dayB;
                })
                .map((day, index) => {
                  const config = SplitService.getSplitConfig(userProfile.split);
                  const workoutIndex = index % config.workouts.length;
                  const workout = config.workouts[workoutIndex];
                  const dayIndex = day === 0 ? 6 : day - 1;
                  
                  return (
                    <Box key={day} sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: 1, 
                      mb: 1,
                      fontSize: { xs: '0.875rem', sm: '1rem' }
                    }}>
                      <Schedule sx={{ fontSize: { xs: 14, sm: 16 }, color: 'text.secondary' }} />
                      <Typography variant="body2" sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>
                        {weekDays[dayIndex]}: {workout.name}
                      </Typography>
                    </Box>
                  );
                })}
            </>
          )}

          {userProfile?.usePeriodization !== false && currentCycle && (
            <>
              <Divider sx={{ my: { xs: 1.5, sm: 2 } }} />
              <Typography variant="subtitle2" gutterBottom sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>
                Текущий цикл:
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Loop fontSize="small" color="primary" />
                <Typography variant="body2">
                  {currentCycle.name} • Неделя {currentCycle.currentWeek}/{currentCycle.weekCount}
                </Typography>
              </Box>
              <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                {currentCycle && CycleService.getCurrentStrategyInfo(currentCycle)}
              </Typography>
            </>
          )}

          <Typography variant="body2" sx={{ mt: 2, color: 'warning.main', fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>
            ⚠️ В профиле нужно выбрать ровно {userProfile?.split ? SplitService.getSplitConfig(userProfile.split).daysPerWeek : 3} дня(ей) для тренировок
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: { xs: 2, sm: 3 } }}>
          <Button onClick={() => setInfoDialog(false)}>Закрыть</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

// Компонент карточки тренировки
const WorkoutCard: React.FC<{
  day: {
    dayName: string;
    date: Date;
    dateStr: string;
    workout: WorkoutDay | null;
    isToday: boolean;
    isPast: boolean;
    isActive: boolean;
  };
  onStartWorkout: (workout: WorkoutDay) => void;
  onContinueWorkout: () => void;
}> = ({ day, onStartWorkout, onContinueWorkout }) => {
  if (!day.workout) {
    return (
      <Card sx={{ 
        bgcolor: day.isPast ? 'action.hover' : 'background.paper',
        opacity: day.isPast ? 0.8 : 1,
        minHeight: { xs: 140, sm: 160, md: 180 }
      }}>
        <CardContent sx={{ p: { xs: 1.5, sm: 2 } }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
            <Box>
              <Typography variant="subtitle2" color={day.isToday ? 'primary' : 'text.secondary'}>
                {day.dayName}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {day.dateStr}
              </Typography>
            </Box>
            {day.isToday && (
              <Chip label="Сегодня" size="small" color="primary" sx={{ height: 20 }} />
            )}
          </Box>
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            justifyContent: 'center',
            height: '100%',
            minHeight: 80,
            opacity: 0.5
          }}>
            <RadioButtonUnchecked sx={{ fontSize: 32, color: 'text.disabled', mb: 1 }} />
            <Typography variant="body2" color="text.disabled">
              Отдых
            </Typography>
          </Box>
        </CardContent>
      </Card>
    );
  }

  const getPhaseColor = (phase?: string): 'success' | 'warning' | 'info' | 'default' => {
    if (!phase) return 'default';
    switch (phase) {
      case 'build': return 'success';
      case 'peak': return 'warning';
      case 'deload': return 'info';
      default: return 'default';
    }
  };

  return (
    <Card sx={{ 
      position: 'relative',
      border: day.isToday ? 2 : day.isActive ? 2 : 0,
      borderColor: day.isToday ? 'primary.main' : day.isActive ? 'warning.main' : 'transparent',
      bgcolor: day.isPast ? 'action.hover' : 'background.paper',
      opacity: day.isPast ? 0.8 : 1,
      minHeight: { xs: 200, sm: 220, md: 240 }
    }}>
      <CardContent sx={{ p: { xs: 1.5, sm: 2 } }}>
        {/* Заголовок дня */}
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'flex-start', 
          mb: 1.5 
        }}>
          <Box>
            <Typography variant="subtitle2" color={day.isToday ? 'primary' : 'text.secondary'} sx={{
              fontSize: { xs: '0.75rem', sm: '0.875rem' }
            }}>
              {day.dayName}
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{
              fontSize: { xs: '0.7rem', sm: '0.75rem' }
            }}>
              {day.dateStr}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, alignItems: 'flex-end' }}>
            {day.isToday && (
              <Chip 
                label="Сегодня" 
                size="small" 
                color="primary"
                sx={{ height: { xs: 20, sm: 24 }, fontSize: { xs: '0.6rem', sm: '0.75rem' } }}
              />
            )}
            {day.isActive && !day.workout.completed && (
              <Chip 
                label="Активна" 
                size="small" 
                color="warning"
                sx={{ height: { xs: 20, sm: 24 }, fontSize: { xs: '0.6rem', sm: '0.75rem' } }}
              />
            )}
            {day.workout.cyclePhase && !day.workout.completed && (
              <Chip
                size="small"
                label={day.workout.cyclePhase === 'build' ? '🟢' : 
                       day.workout.cyclePhase === 'peak' ? '🟡' : '🔵'}
                color={getPhaseColor(day.workout.cyclePhase)}
                sx={{ height: { xs: 20, sm: 24 }, width: { xs: 20, sm: 24 }, fontSize: { xs: '0.6rem', sm: '0.75rem' } }}
              />
            )}
          </Box>
        </Box>

        {/* Контент тренировки */}
        <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
          <Typography variant="h6" sx={{ 
            fontSize: { xs: '0.95rem', sm: '1.1rem' }, 
            fontWeight: 600, 
            mb: 1,
            lineHeight: 1.2
          }}>
            {day.workout.name}
          </Typography>
          
          <Box sx={{ 
            display: 'flex', 
            flexWrap: 'wrap', 
            gap: 0.3, 
            mb: 1.5 
          }}>
            {day.workout.focus.slice(0, 3).map((focus: string) => (
              <Chip
                key={focus}
                label={focus === 'chest' ? 'Грудь' : 
                       focus === 'back' ? 'Спина' :
                       focus === 'shoulders' ? 'Плечи' :
                       focus === 'biceps' ? 'Бицепс' :
                       focus === 'triceps' ? 'Трицепс' :
                       focus === 'legs' ? 'Ноги' :
                       focus === 'arms' ? 'Руки' : 
                       focus === 'core' ? 'Пресс' : focus}
                size="small"
                variant="outlined"
                sx={{ 
                  height: { xs: 20, sm: 24 }, 
                  fontSize: { xs: '0.6rem', sm: '0.7rem' },
                  bgcolor: 'rgba(99, 102, 241, 0.1)',
                  borderWidth: '1px'
                }}
              />
            ))}
            {day.workout.focus.length > 3 && (
              <Chip
                label={`+${day.workout.focus.length - 3}`}
                size="small"
                variant="outlined"
                sx={{ 
                  height: { xs: 20, sm: 24 }, 
                  fontSize: { xs: '0.6rem', sm: '0.7rem' }
                }}
              />
            )}
          </Box>

          {day.workout.completed ? (
            <Box sx={{ mt: 'auto' }}>
              <Chip
                icon={<CheckCircle sx={{ fontSize: { xs: 14, sm: 16 } }} />}
                label="Выполнено"
                color="success"
                size="small"
                sx={{ 
                  width: '100%', 
                  height: { xs: 28, sm: 32 },
                  fontSize: { xs: '0.7rem', sm: '0.8rem' }
                }}
              />
            </Box>
          ) : day.isPast ? (
            <Box sx={{ mt: 'auto' }}>
              <Chip
                label="Пропущено"
                color="default"
                size="small"
                sx={{ 
                  width: '100%', 
                  height: { xs: 28, sm: 32 },
                  fontSize: { xs: '0.7rem', sm: '0.8rem' },
                  opacity: 0.7 
                }}
              />
            </Box>
          ) : (
            <Box sx={{ mt: 'auto' }}>
              {day.isActive ? (
                <Button
                  variant="contained"
                  color="warning"
                  size="small"
                  fullWidth
                  onClick={onContinueWorkout}
                  startIcon={<FitnessCenter sx={{ fontSize: { xs: 14, sm: 16 } }} />}
                  sx={{ 
                    height: { xs: 32, sm: 36 },
                    fontSize: { xs: '0.7rem', sm: '0.8rem' }
                  }}
                >
                  Продолжить
                </Button>
              ) : (
                <Button
                  variant="contained"
                  size="small"
                  fullWidth
                  onClick={() => onStartWorkout(day.workout!)}
                  startIcon={<FitnessCenter sx={{ fontSize: { xs: 14, sm: 16 } }} />}
                  disabled={!day.isToday}
                  sx={{ 
                    height: { xs: 32, sm: 36 },
                    fontSize: { xs: '0.7rem', sm: '0.8rem' }
                  }}
                >
                  {day.isToday ? 'Начать' : 'Недоступна'}
                </Button>
              )}
            </Box>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

export default WeekPlanScreen;