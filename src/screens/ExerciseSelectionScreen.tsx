import React, { useState, useContext, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Button,
  Chip,
  Alert,
  Snackbar,
  Divider,
  LinearProgress
} from '@mui/material';
import {
  FitnessCenter,
  Save,
  Info
} from '@mui/icons-material';
import { WorkoutContext } from '../App';
import ExerciseDatabase from '../services/ExerciseDatabase';
import { UserExerciseSelection } from '../types/workout.types';
import { VolumeCalculator } from '../services/VolumeCalculator';
import { StrategyFactory } from '../services/StrategyFactory';

const ExerciseSelectionScreen: React.FC = () => {
  const { 
    userProfile, 
    regenerateWeekPlan,
    userExerciseSelection,
    setUserExerciseSelection
  } = useContext(WorkoutContext);
  
  const [selected, setSelected] = useState<UserExerciseSelection>({});
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [progress, setProgress] = useState(0);

  const exerciseDB = ExerciseDatabase.getInstance();

  // Группы мышц для отображения
  const muscleGroups = [
    { key: 'chest', name: 'Грудные', icon: '🏋️' },
    { key: 'back', name: 'Спина', icon: '🔙' },
    { key: 'legs', name: 'Ноги', icon: '🦵' },
    { key: 'shoulders', name: 'Плечи', icon: '💪' },
    { key: 'biceps', name: 'Бицепс', icon: '💪' },
    { key: 'triceps', name: 'Трицепс', icon: '💪' },
    { key: 'core', name: 'Пресс', icon: '🧠' }
  ];

  // Загружаем сохраненный выбор
  useEffect(() => {
    if (userExerciseSelection) {
      setSelected(userExerciseSelection);
    }
  }, [userExerciseSelection]);

  // Обновляем прогресс
  useEffect(() => {
    const totalGroups = muscleGroups.length;
    const selectedGroups = Object.keys(selected).filter(key => selected[key]?.length > 0).length;
    setProgress((selectedGroups / totalGroups) * 100);
  }, [selected]);

  const handleToggleExercise = (muscleGroup: string, exerciseKey: string) => {
    setSelected(prev => {
      const current = prev[muscleGroup] || [];
      
      if (current.includes(exerciseKey)) {
        // Убираем упражнение
        const updated = {
          ...prev,
          [muscleGroup]: current.filter(k => k !== exerciseKey)
        };
        // Если группа стала пустой, удаляем её
        if (updated[muscleGroup].length === 0) {
          delete updated[muscleGroup];
        }
        return updated;
      } else {
        // Добавляем упражнение (максимум 2 на группу)
        if (current.length >= 2) {
          setSnackbarMessage(`❌ Можно выбрать максимум 2 упражнения на группу`);
          setSnackbarOpen(true);
          return prev;
        }
        return {
          ...prev,
          [muscleGroup]: [...current, exerciseKey]
        };
      }
    });
  };

  const handleSave = () => {
    if (Object.keys(selected).length === 0) {
      setSnackbarMessage('❌ Выберите хотя бы одно упражнение');
      setSnackbarOpen(true);
      return;
    }

    // Сохраняем выбор
    setUserExerciseSelection(selected);
    
    // Генерируем план с выбранными упражнениями
    regenerateWeekPlan(selected);
    
    setSnackbarMessage('✅ План тренировок создан!');
    setSnackbarOpen(true);
    
    // Переходим к плану
    setTimeout(() => {
      window.location.href = '/week';
    }, 1500);
  };

  if (!userProfile) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Paper sx={{ p: 6, textAlign: 'center' }}>
          <Typography variant="h5">Сначала заполните профиль</Typography>
          <Button 
            variant="contained" 
            onClick={() => window.location.href = '/profile'}
            sx={{ mt: 2 }}
          >
            Перейти в профиль
          </Button>
        </Paper>
      </Container>
    );
  }

  // Получаем стратегию сплита для расчета объема
  const splitStrategy = StrategyFactory.createSplitStrategy(userProfile.split);

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper sx={{ p: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
          <FitnessCenter sx={{ fontSize: 40, color: 'primary.main' }} />
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 700 }}>
              Выберите упражнения
            </Typography>
            <Typography variant="body1" color="text.secondary">
              По 1-2 упражнения на каждую группу мышц для вашего сплита
            </Typography>
          </Box>
        </Box>

        <Alert severity="info" sx={{ mb: 3 }}>
          <Typography variant="body2">
            <strong>Сплит:</strong> {userProfile.split === 'fullbody' ? 'Full Body' :
              userProfile.split === 'upperlower' ? 'Upper/Lower' :
              userProfile.split === 'ppl' ? 'Push/Pull/Legs' :
              userProfile.split === 'pushpulllegs' ? 'Push/Pull/Legs (6x)' :
              'Bro Split'} • {splitStrategy.daysPerWeek} дней в неделю
          </Typography>
        </Alert>

        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Прогресс выбора
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {Math.round(progress)}%
            </Typography>
          </Box>
          <LinearProgress 
            variant="determinate" 
            value={progress} 
            sx={{ height: 8, borderRadius: 4 }}
          />
        </Box>

        {muscleGroups.map(group => {
          const exercises = exerciseDB.getExercisesByMuscleGroupAndEquipment(
            group.key,
            userProfile.availableEquipment
          );
          
          if (exercises.length === 0) return null;
          
          const selectedCount = selected[group.key]?.length || 0;
          
          // Рассчитываем объем для этой группы
          const volumePerSession = VolumeCalculator.calculateVolumePerSession(
            userProfile,
            group.key,
            splitStrategy
          );
          
          return (
            <Paper key={group.key} variant="outlined" sx={{ p: 3, mb: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    {group.icon} {group.name}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                  <Chip 
                    size="small"
                    label={`${volumePerSession} подходов`}
                    color="info"
                  />
                  <Chip 
                    label={`${selectedCount}/2`}
                    color={selectedCount === 2 ? 'success' : selectedCount > 0 ? 'primary' : 'default'}
                    size="small"
                  />
                </Box>
              </Box>

              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {exercises.map(ex => (
                  <Chip
                    key={ex.key}
                    label={`${ex.name} ${ex.isMultiJoint ? '🏋️' : '🎯'}`}
                    onClick={() => handleToggleExercise(group.key, ex.key)}
                    color={selected[group.key]?.includes(ex.key) ? 'primary' : 'default'}
                    variant={selected[group.key]?.includes(ex.key) ? 'filled' : 'outlined'}
                    sx={{ 
                      m: 0.5,
                      cursor: 'pointer',
                      transition: '0.2s',
                      '&:hover': {
                        transform: 'scale(1.05)'
                      }
                    }}
                  />
                ))}
              </Box>
            </Paper>
          );
        })}

        <Divider sx={{ my: 3 }} />

        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
          <Button
            variant="contained"
            onClick={handleSave}
            startIcon={<Save />}
            size="large"
            disabled={Object.keys(selected).length === 0}
          >
            Создать план
          </Button>
        </Box>

        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', textAlign: 'center', mt: 2 }}>
          Выбранные упражнения будут повторяться в цикле с прогрессией весов
        </Typography>
      </Paper>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={4000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity={snackbarMessage.includes('✅') ? 'success' : 'error'} sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default ExerciseSelectionScreen;