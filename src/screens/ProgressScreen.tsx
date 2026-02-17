import React, { useContext, useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Grid,
  Chip,
  LinearProgress,
  Alert
} from '@mui/material';
import {
  TrendingUp,
  EmojiEvents,
  ShowChart,
  CalendarToday,
  FitnessCenter,
  Warning
} from '@mui/icons-material';
import { WorkoutContext } from '../App';
import AutoRegulationService from '../services/AutoRegulationService';
import PeriodizationService from '../services/PeriodizationService';

const ProgressScreen: React.FC = () => {
  const { workouts, userProfile } = useContext(WorkoutContext);
  const [predictions, setPredictions] = useState<any[]>([]);
  const [plateaus, setPlateaus] = useState<string[]>([]);
  const [aiAnalysis, setAiAnalysis] = useState<any>(null);

  useEffect(() => {
    if (workouts.length > 0) {
      analyzeProgress();
      if (userProfile?.periodizationType === 'auto') {
        analyzeAI();
      }
    }
  }, [workouts]);

  const analyzeProgress = () => {
    const exercises = new Set<string>();
    workouts.forEach(w => {
      w.exercises.forEach(e => exercises.add(e.name));
    });

    const preds: any[] = [];
    const plateausList: string[] = [];

    exercises.forEach(exName => {
      const prediction = AutoRegulationService.predict1RM(workouts, exName, 4);
      preds.push({
        name: exName,
        ...prediction
      });

      const isPlateau = AutoRegulationService.detectPlateau(workouts, exName);
      if (isPlateau) {
        plateausList.push(exName);
      }
    });

    preds.sort((a, b) => (b.predicted - b.current) - (a.predicted - a.current));
    
    setPredictions(preds.slice(0, 5));
    setPlateaus(plateausList);
  };

  const analyzeAI = () => {
    const history = JSON.parse(localStorage.getItem('workoutHistory') || '[]');
    if (history.length === 0) return;
    
    // Анализируем первое упражнение
    const firstExercise = workouts[0]?.exercises[0]?.name;
    if (!firstExercise) return;
    
    const analysis = PeriodizationService.analyzeWorkoutHistory(
      history,
      firstExercise,
      [7, 8]
    );
    setAiAnalysis(analysis);
  };

  const totalWorkouts = workouts.length;
  const thisMonth = workouts.filter(w => {
    const date = new Date(w.date);
    const now = new Date();
    return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
  }).length;

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 2, sm: 4 } }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
          <ShowChart sx={{ mr: 1, verticalAlign: 'middle' }} />
          Прогресс
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Отслеживай свои достижения и прогнозы
        </Typography>
      </Box>

      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid size={{ xs: 6, md: 3 }}>
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              Всего тренировок
            </Typography>
            <Typography variant="h3" sx={{ fontWeight: 700 }}>
              {totalWorkouts}
            </Typography>
          </Paper>
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              В этом месяце
            </Typography>
            <Typography variant="h3" sx={{ fontWeight: 700, color: 'success.main' }}>
              {thisMonth}
            </Typography>
          </Paper>
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              Упражнений
            </Typography>
            <Typography variant="h3" sx={{ fontWeight: 700 }}>
              {new Set(workouts.flatMap(w => w.exercises.map(e => e.name))).size}
            </Typography>
          </Paper>
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              Личных рекордов
            </Typography>
            <Typography variant="h3" sx={{ fontWeight: 700, color: 'warning.main' }}>
              {workouts.reduce((acc, w) => {
                const bestInWorkout = w.exercises.some(e => 
                  e.sets.some((s: any) => {
                    const oneRM = AutoRegulationService.calculate1RM(s.weight, s.reps);
                    const best = AutoRegulationService.getBest1RM(workouts, e.name);
                    return oneRM >= best * 0.98;
                  })
                );
                return acc + (bestInWorkout ? 1 : 0);
              }, 0)}
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* AI Аналитика */}
      {userProfile?.periodizationType === 'auto' && aiAnalysis && (
        <Paper sx={{ p: 3, mb: 4, bgcolor: 'info.dark' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              🤖 AI Аналитика
            </Typography>
            <Chip 
              label={`Уверенность: ${Math.round(aiAnalysis.confidence * 100)}%`}
              size="small"
              color={aiAnalysis.confidence > 0.8 ? 'success' : aiAnalysis.confidence > 0.5 ? 'warning' : 'default'}
            />
          </Box>
          
          <Grid container spacing={2}>
            <Grid size={{ xs: 6 }}>
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Тренд прогресса
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  {aiAnalysis.trend === 'accelerating' && <TrendingUp color="success" />}
                  {aiAnalysis.trend === 'decelerating' && <TrendingUp sx={{ transform: 'rotate(45deg)' }} color="warning" />}
                  {aiAnalysis.trend === 'plateau' && <span style={{ fontSize: '1.5rem' }}>⛔</span>}
                  {aiAnalysis.trend === 'declining' && <TrendingUp sx={{ transform: 'rotate(90deg)' }} color="error" />}
                  <Typography variant="body1">
                    {aiAnalysis.trend === 'accelerating' && 'Ускоряющийся'}
                    {aiAnalysis.trend === 'decelerating' && 'Замедляющийся'}
                    {aiAnalysis.trend === 'plateau' && 'Плато'}
                    {aiAnalysis.trend === 'declining' && 'Спад'}
                  </Typography>
                </Box>
              </Paper>
            </Grid>
            
            <Grid size={{ xs: 6 }}>
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Рекомендация
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 600 }}>
                  {aiAnalysis.nextWeekStrategy === 'progressive' && '🚀 Прогрессия'}
                  {aiAnalysis.nextWeekStrategy === 'maintenance' && '⚖️ Поддержка'}
                  {aiAnalysis.nextWeekStrategy === 'deload' && '😴 Разгрузка'}
                  {aiAnalysis.nextWeekStrategy === 'test' && '🎯 Тест максимумов'}
                  {aiAnalysis.nextWeekStrategy === 'peak' && '⚡ Пиковая нагрузка'}
                </Typography>
              </Paper>
            </Grid>
          </Grid>
          
          <Alert severity="info" sx={{ mt: 2 }}>
            {aiAnalysis.reason}
          </Alert>
        </Paper>
      )}

      {/* Прогнозы 1ПМ */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <TrendingUp color="primary" />
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Прогноз 1ПМ через месяц
          </Typography>
        </Box>

        {predictions.length === 0 ? (
          <Alert severity="info">
            Выполни больше тренировок для появления прогнозов
          </Alert>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {predictions.map((pred, idx) => (
              <Paper key={idx} variant="outlined" sx={{ p: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                      {pred.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Сейчас: {pred.current}кг → Прогноз: {pred.predicted}кг
                    </Typography>
                  </Box>
                  <Chip 
                    label={`+${(pred.predicted - pred.current).toFixed(1)}кг`}
                    color="success"
                    size="small"
                  />
                </Box>
                <LinearProgress 
                  variant="determinate" 
                  value={(pred.current / pred.predicted) * 100}
                  sx={{ mt: 1, height: 4, borderRadius: 2 }}
                />
              </Paper>
            ))}
          </Box>
        )}
      </Paper>

      {/* Плато и рекомендации */}
      {plateaus.length > 0 && (
        <Paper sx={{ p: 3, mb: 4, bgcolor: 'warning.dark' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <Warning color="warning" />
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Обнаружено плато
            </Typography>
          </Box>
          <Typography variant="body2" paragraph>
            В следующих упражнениях нет прогресса уже 3+ тренировки:
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            {plateaus.map(ex => (
              <Chip key={ex} label={ex} color="warning" variant="outlined" />
            ))}
          </Box>
          <Alert severity="info" sx={{ mt: 2 }}>
            💡 Попробуй сменить упражнение или сделать разгрузочную неделю
          </Alert>
        </Paper>
      )}

      {/* История достижений */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
          <EmojiEvents sx={{ mr: 1, verticalAlign: 'middle' }} />
          Последние достижения
        </Typography>

        {workouts.slice(0, 5).map((workout, idx) => {
          const bestSet = workout.exercises.flatMap(e => 
            e.sets.map(s => ({
              exercise: e.name,
              weight: s.weight,
              reps: s.reps,
              oneRM: AutoRegulationService.calculate1RM(s.weight, s.reps)
            }))
          ).sort((a, b) => b.oneRM - a.oneRM)[0];

          return (
            <Box key={idx} sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 2,
              p: 1.5,
              borderBottom: idx < 4 ? 1 : 0,
              borderColor: 'divider'
            }}>
              <CalendarToday color="action" />
              <Box sx={{ flex: 1 }}>
                <Typography variant="body2">
                  {new Date(workout.date).toLocaleDateString('ru-RU', { 
                    day: 'numeric', 
                    month: 'long' 
                  })}
                </Typography>
              </Box>
              {bestSet && (
                <Chip 
                  icon={<FitnessCenter />}
                  label={`${bestSet.exercise}: ${Math.round(bestSet.oneRM)}кг`}
                  color="primary"
                  size="small"
                />
              )}
            </Box>
          );
        })}
      </Paper>
    </Container>
  );
};

export default ProgressScreen;