import React, { useState, useContext, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Divider,
  Alert,
  Snackbar,
  SelectChangeEvent,
  Chip,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  ToggleButton,
  ToggleButtonGroup
} from '@mui/material';
import {
  Person,
  FitnessCenter,
  Height,
  Scale,
  Cake,
  Wc,
  Notifications,
  Schedule,
  Info,
  Edit,
  Save,
  RestartAlt,
  Build,
  SportsGymnastics,
  SportsMartialArts,
  Cable,
  SelfImprovement
} from '@mui/icons-material';
import { WorkoutContext } from '../App';
import SplitService from '../services/SplitService';
import PeriodizationService from '../services/PeriodizationService';
import { UserProfile, ExperienceLevel, Goal, Gender, WorkoutSplit, Equipment } from '../types/workout.types';
import { PeriodizationType } from '../types/cycle.types';

const equipmentList = [
  { value: 'barbell', label: 'Штанга', icon: <FitnessCenter /> },
  { value: 'dumbbell', label: 'Гантели', icon: <SportsGymnastics /> },
  { value: 'kettlebell', label: 'Гири', icon: <SportsMartialArts /> },
  { value: 'machine', label: 'Тренажеры', icon: <Build /> },
  { value: 'cable', label: 'Блоки/кроссовер', icon: <Cable /> },
  { value: 'bodyweight', label: 'Свой вес', icon: <SelfImprovement /> },
  { value: 'bands', label: 'Резинки', icon: <SelfImprovement /> }
];

const ProfileScreen: React.FC = () => {
  const { userProfile, updateProfile, regenerateWeekPlan, clearTodayWorkout } = useContext(WorkoutContext);
  
  const [isEditing, setIsEditing] = useState(!userProfile);
  const [formData, setFormData] = useState<UserProfile>({
    name: userProfile?.name || '',
    gender: userProfile?.gender || 'male',
    age: userProfile?.age || 30,
    weight: userProfile?.weight || 75,
    height: userProfile?.height || 175,
    experience: userProfile?.experience || 'beginner',
    goal: userProfile?.goal || 'hypertrophy',
    restPreference: userProfile?.restPreference || 'flexible',
    notifications: userProfile?.notifications || true,
    reminderTime: userProfile?.reminderTime || '09:00',
    trainingDays: userProfile?.trainingDays || [1, 3, 5],
    split: userProfile?.split || 'fullbody',
    availableEquipment: userProfile?.availableEquipment || ['barbell', 'dumbbell', 'machine', 'cable', 'bodyweight'],
    periodizationType: userProfile?.periodizationType || 
      (userProfile?.experience ? PeriodizationService.getRecommendedStrategy(userProfile.experience) : 'linear')
  });

  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [resetDialogOpen, setResetDialogOpen] = useState(false);

  useEffect(() => {
    if (userProfile) {
      setFormData(userProfile);
    }
  }, [userProfile]);

  useEffect(() => {
    if (isEditing) {
      const config = SplitService.getSplitConfig(formData.split);
      if (formData.trainingDays.length > config.daysPerWeek) {
        setFormData(prev => ({
          ...prev,
          trainingDays: prev.trainingDays.slice(0, config.daysPerWeek)
        }));
      }
    }
  }, [formData.split, isEditing]);

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: parseInt(e.target.value) || 0
    });
  };

  const handleSelectChange = (e: SelectChangeEvent) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSwitchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.checked
    });
  };

  const toggleEquipment = (equipment: Equipment) => {
    setFormData(prev => {
      const current = prev.availableEquipment || [];
      if (current.includes(equipment)) {
        return { ...prev, availableEquipment: current.filter(e => e !== equipment) };
      } else {
        return { ...prev, availableEquipment: [...current, equipment] };
      }
    });
  };

  const handlePeriodizationChange = (strategy: PeriodizationType) => {
    setFormData(prev => ({
      ...prev,
      periodizationType: strategy
    }));
  };

  const isStrategySuitable = (strategy: PeriodizationType): boolean => {
    return PeriodizationService.isStrategySuitable(strategy, formData.experience);
  };

  useEffect(() => {
    if (formData.experience && !userProfile?.split) {
      const recommendedSplit = SplitService.recommendSplit(formData.experience);
      setFormData(prev => ({
        ...prev,
        split: recommendedSplit
      }));
    }
  }, [formData.experience, userProfile]);

  const handleSave = () => {
    const splitConfig = SplitService.getSplitConfig(formData.split);
    const requiredDays = splitConfig.daysPerWeek;
    const selectedDays = formData.trainingDays.length;
    
    if (selectedDays !== requiredDays) {
      setSnackbarMessage(`❌ Для сплита ${splitConfig.name} нужно выбрать ${requiredDays} дня(ей) тренировок (сейчас ${selectedDays})`);
      setSnackbarOpen(true);
      return;
    }

    if (!formData.name.trim()) {
      setSnackbarMessage('❌ Введите имя');
      setSnackbarOpen(true);
      return;
    }

    if (formData.age < 14 || formData.age > 100) {
      setSnackbarMessage('❌ Возраст должен быть от 14 до 100 лет');
      setSnackbarOpen(true);
      return;
    }

    if (formData.weight < 30 || formData.weight > 250) {
      setSnackbarMessage('❌ Вес должен быть от 30 до 250 кг');
      setSnackbarOpen(true);
      return;
    }

    if (formData.height < 120 || formData.height > 250) {
      setSnackbarMessage('❌ Рост должен быть от 120 до 250 см');
      setSnackbarOpen(true);
      return;
    }

    if (!formData.availableEquipment || formData.availableEquipment.length === 0) {
      setSnackbarMessage('❌ Выберите хотя бы один тип оборудования');
      setSnackbarOpen(true);
      return;
    }

    if (formData.periodizationType && !isStrategySuitable(formData.periodizationType)) {
      setSnackbarMessage(`⚠️ Стратегия "${PeriodizationService.STRATEGIES[formData.periodizationType].name}" не рекомендуется для вашего уровня. Вы уверены?`);
    }
    
    console.log('✅ Валидация пройдена. Сохраняем профиль:', formData);
    
    updateProfile(formData);
    setIsEditing(false);
    
    // Перенаправляем на экран выбора упражнений
    setTimeout(() => {
      window.location.href = '/exercise-selection';
    }, 100);
    
    const strategyName = formData.periodizationType ? 
      PeriodizationService.STRATEGIES[formData.periodizationType]?.name : 'линейная';
    setSnackbarMessage(`✅ Профиль обновлен. Сплит: ${splitConfig.name}, стратегия: ${strategyName}`);
    setSnackbarOpen(true);
  };

  const handleCancel = () => {
    if (userProfile) {
      setFormData(userProfile);
    }
    setIsEditing(false);
  };

  const handleResetData = () => {
    localStorage.clear();
    clearTodayWorkout();
    setResetDialogOpen(false);
    window.location.reload();
  };

  const weekDays = [
    { value: 1, label: 'Пн' },
    { value: 2, label: 'Вт' },
    { value: 3, label: 'Ср' },
    { value: 4, label: 'Чт' },
    { value: 5, label: 'Пт' },
    { value: 6, label: 'Сб' },
    { value: 0, label: 'Вс' }
  ];

  const toggleTrainingDay = (day: number) => {
    setFormData(prev => {
      const config = SplitService.getSplitConfig(prev.split);
      const maxDays = config.daysPerWeek;
      
      let days = [...prev.trainingDays];
      
      if (days.includes(day)) {
        days = days.filter(d => d !== day);
      } else {
        if (days.length < maxDays) {
          days = [...days, day].sort((a, b) => {
            const dayA = a === 0 ? 7 : a;
            const dayB = b === 0 ? 7 : b;
            return dayA - dayB;
          });
        } else {
          setSnackbarMessage(`❌ Максимум ${maxDays} дней для сплита ${config.name}`);
          setSnackbarOpen(true);
          return prev;
        }
      }
      
      return { ...prev, trainingDays: days };
    });
  };

  const currentSplitConfig = SplitService.getSplitConfig(formData.split);
  const isDaysValid = formData.trainingDays.length === currentSplitConfig.daysPerWeek;

  const allStrategies = Object.values(PeriodizationService.STRATEGIES);
  const selectedStrategy = formData.periodizationType ? 
    PeriodizationService.STRATEGIES[formData.periodizationType] : null;

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 2, sm: 4 } }}>
      {/* Шапка профиля */}
      <Paper sx={{ p: { xs: 2, sm: 4 }, mb: 3 }}>
        <Box sx={{ 
          display: 'flex', 
          flexDirection: { xs: 'column', sm: 'row' },
          alignItems: { xs: 'flex-start', sm: 'center' },
          justifyContent: 'space-between',
          gap: { xs: 2, sm: 0 }
        }}>
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 2,
            width: { xs: '100%', sm: 'auto' }
          }}>
            <Avatar sx={{ 
              width: { xs: 48, sm: 64 }, 
              height: { xs: 48, sm: 64 }, 
              bgcolor: 'primary.main' 
            }}>
              <Person sx={{ fontSize: { xs: 24, sm: 32 } }} />
            </Avatar>
            <Box>
              <Typography variant="h4" sx={{ 
                fontWeight: 700, 
                fontSize: { xs: '1.5rem', sm: '2.125rem' },
                wordBreak: 'break-word'
              }}>
                {formData.name || 'AI Тренер'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {formData.experience === 'beginner' && 'Начинающий'}
                {formData.experience === 'intermediate' && 'Средний уровень'}
                {formData.experience === 'advanced' && 'Продвинутый'}
              </Typography>
            </Box>
          </Box>
          
          {!isEditing ? (
            <Button
              variant="contained"
              startIcon={<Edit />}
              onClick={() => setIsEditing(true)}
              sx={{ width: { xs: '100%', sm: 'auto' } }}
            >
              Редактировать
            </Button>
          ) : (
            <Box sx={{ 
              display: 'flex', 
              gap: 1,
              width: { xs: '100%', sm: 'auto' },
              flexDirection: { xs: 'row', sm: 'row' }
            }}>
              <Button 
                variant="outlined" 
                onClick={handleCancel}
                sx={{ flex: { xs: 1, sm: 'none' } }}
              >
                Отмена
              </Button>
              <Button 
                variant="contained" 
                onClick={handleSave} 
                startIcon={<Save />}
                disabled={!isDaysValid}
                sx={{ flex: { xs: 1, sm: 'none' } }}
              >
                Сохранить
              </Button>
            </Box>
          )}
        </Box>
      </Paper>

      {/* Основная форма */}
      <Paper sx={{ p: { xs: 2, sm: 4 } }}>
        <Typography variant="h5" gutterBottom sx={{ 
          fontWeight: 600, 
          mb: 3,
          fontSize: { xs: '1.25rem', sm: '1.5rem' }
        }}>
          Личные данные
        </Typography>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <TextField
            fullWidth
            label="Имя"
            name="name"
            value={formData.name}
            onChange={handleTextChange}
            disabled={!isEditing}
            error={isEditing && !formData.name.trim()}
            helperText={isEditing && !formData.name.trim() ? 'Введите имя' : ''}
            InputProps={{
              startAdornment: <Person sx={{ mr: 1, color: 'text.secondary' }} />
            }}
            size="medium"
          />

          <Box sx={{ 
            display: 'flex', 
            flexDirection: { xs: 'column', sm: 'row' },
            gap: 2 
          }}>
            <FormControl fullWidth disabled={!isEditing} size="medium">
              <InputLabel>Пол</InputLabel>
              <Select
                name="gender"
                value={formData.gender}
                onChange={handleSelectChange}
                label="Пол"
              >
                <MenuItem value="male">Мужской</MenuItem>
                <MenuItem value="female">Женский</MenuItem>
              </Select>
            </FormControl>

            <TextField
              fullWidth
              label="Возраст"
              name="age"
              type="number"
              value={formData.age}
              onChange={handleNumberChange}
              disabled={!isEditing}
              error={isEditing && (formData.age < 14 || formData.age > 100)}
              helperText={isEditing && (formData.age < 14 || formData.age > 100) ? 'От 14 до 100 лет' : ''}
              InputProps={{
                startAdornment: <Cake sx={{ mr: 1, color: 'text.secondary' }} />
              }}
              size="medium"
            />
          </Box>

          <Box sx={{ 
            display: 'flex', 
            flexDirection: { xs: 'column', sm: 'row' },
            gap: 2 
          }}>
            <TextField
              fullWidth
              label="Вес (кг)"
              name="weight"
              type="number"
              value={formData.weight}
              onChange={handleNumberChange}
              disabled={!isEditing}
              error={isEditing && (formData.weight < 30 || formData.weight > 250)}
              helperText={isEditing && (formData.weight < 30 || formData.weight > 250) ? 'От 30 до 250 кг' : ''}
              InputProps={{
                startAdornment: <Scale sx={{ mr: 1, color: 'text.secondary' }} />
              }}
              size="medium"
            />

            <TextField
              fullWidth
              label="Рост (см)"
              name="height"
              type="number"
              value={formData.height}
              onChange={handleNumberChange}
              disabled={!isEditing}
              error={isEditing && (formData.height < 120 || formData.height > 250)}
              helperText={isEditing && (formData.height < 120 || formData.height > 250) ? 'От 120 до 250 см' : ''}
              InputProps={{
                startAdornment: <Height sx={{ mr: 1, color: 'text.secondary' }} />
              }}
              size="medium"
            />
          </Box>

          <Divider sx={{ my: 2 }} />

          <Typography variant="h5" gutterBottom sx={{ 
            fontWeight: 600,
            fontSize: { xs: '1.25rem', sm: '1.5rem' }
          }}>
            Тренировки
          </Typography>

          <Box sx={{ 
            display: 'flex', 
            flexDirection: { xs: 'column', sm: 'row' },
            gap: 2 
          }}>
            <FormControl fullWidth disabled={!isEditing} size="medium">
              <InputLabel>Уровень</InputLabel>
              <Select
                name="experience"
                value={formData.experience}
                onChange={handleSelectChange}
                label="Уровень"
              >
                <MenuItem value="beginner">Начинающий (0-6 мес)</MenuItem>
                <MenuItem value="intermediate">Средний (6-24 мес)</MenuItem>
                <MenuItem value="advanced">Продвинутый (2+ года)</MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth disabled={!isEditing} size="medium">
              <InputLabel>Цель</InputLabel>
              <Select
                name="goal"
                value={formData.goal}
                onChange={handleSelectChange}
                label="Цель"
              >
                <MenuItem value="strength">💪 Сила</MenuItem>
                <MenuItem value="hypertrophy">🎯 Масса</MenuItem>
                <MenuItem value="endurance">🏃 Выносливость</MenuItem>
              </Select>
            </FormControl>
          </Box>

          <FormControl fullWidth disabled={!isEditing} size="medium">
            <InputLabel>Сплит тренировок</InputLabel>
            <Select
              name="split"
              value={formData.split}
              onChange={handleSelectChange}
              label="Сплит тренировок"
            >
              <MenuItem value="fullbody">🔥 Full Body (3x/нед)</MenuItem>
              <MenuItem value="upperlower">💪 Upper/Lower (4x/нед)</MenuItem>
              <MenuItem value="ppl">🏋️ Push/Pull/Legs (3x/нед)</MenuItem>
              <MenuItem value="pushpulllegs">⚡ Push/Pull/Legs (6x/нед)</MenuItem>
              <MenuItem value="bro">💎 Bro Split (5x/нед)</MenuItem>
            </Select>
          </FormControl>

          {formData.split && (
            <Alert 
              severity={isDaysValid ? "info" : "warning"} 
              icon={<Info />}
              sx={{ 
                '& .MuiAlert-message': { 
                  fontSize: { xs: '0.875rem', sm: '1rem' } 
                } 
              }}
            >
              <Typography variant="body2">
                <strong>{currentSplitConfig.name}:</strong>{' '}
                {formData.split === 'fullbody' && 'Все тело за тренировку, 3 раза в неделю'}
                {formData.split === 'upperlower' && 'Верх/Низ, 4 тренировки в неделю'}
                {formData.split === 'ppl' && 'Жим/Тяга/Ноги, 3 тренировки в неделю'}
                {formData.split === 'pushpulllegs' && 'Жим/Тяга/Ноги x2, 6 тренировок в неделю'}
                {formData.split === 'bro' && 'Грудь/Спина/Плечи/Руки/Ноги, 5 тренировок в неделю'}
              </Typography>
              {!isDaysValid && isEditing && (
                <Typography variant="body2" sx={{ mt: 1, fontWeight: 'bold' }}>
                  ⚠️ Требуется выбрать {currentSplitConfig.daysPerWeek} дня(ей) тренировок
                </Typography>
              )}
            </Alert>
          )}

          {/* ДНИ ТРЕНИРОВОК */}
          <Box>
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              mb: 1 
            }}>
              <Typography variant="subtitle2" gutterBottom sx={{ 
                fontSize: { xs: '0.875rem', sm: '1rem' } 
              }}>
                Дни тренировок
              </Typography>
              {isEditing && (
                <Chip 
                  size="small"
                  label={`${formData.trainingDays.length} / ${currentSplitConfig.daysPerWeek}`}
                  color={isDaysValid ? 'success' : 'warning'}
                  sx={{ height: 24 }}
                />
              )}
            </Box>
            <Box sx={{ 
              display: 'flex', 
              gap: { xs: 0.5, sm: 1 }, 
              flexWrap: 'wrap' 
            }}>
              {weekDays.map(day => (
                <Chip
                  key={day.value}
                  label={day.label}
                  onClick={() => isEditing && toggleTrainingDay(day.value)}
                  color={formData.trainingDays.includes(day.value) ? 'primary' : 'default'}
                  variant={formData.trainingDays.includes(day.value) ? 'filled' : 'outlined'}
                  disabled={!isEditing}
                  sx={{ 
                    cursor: isEditing ? 'pointer' : 'default',
                    opacity: !isEditing && !formData.trainingDays.includes(day.value) ? 0.5 : 1,
                    fontSize: { xs: '0.75rem', sm: '0.875rem' },
                    height: { xs: 28, sm: 32 }
                  }}
                />
              ))}
            </Box>
            {isEditing && !isDaysValid && (
              <Alert severity="warning" sx={{ mt: 2, fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                ⚠️ Для сплита <strong>{currentSplitConfig.name}</strong> нужно выбрать <strong>{currentSplitConfig.daysPerWeek}</strong> дня(ей) тренировок
              </Alert>
            )}
          </Box>

          <Divider sx={{ my: 2 }} />

          {/* ===== СТРАТЕГИЯ ПЕРИОДИЗАЦИИ ===== */}
          {isEditing && (
            <>
              <Typography variant="h5" gutterBottom sx={{ 
                fontWeight: 600,
                fontSize: { xs: '1.25rem', sm: '1.5rem' }
              }}>
                Стратегия тренировок
              </Typography>
              
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Выбери подход к планированию нагрузки. Каждая стратегия по-своему меняет объем и интенсивность.
              </Typography>
              
              {/* Кнопки для быстрого выбора */}
              <ToggleButtonGroup
                value={formData.periodizationType}
                exclusive
                onChange={(e, value) => value && handlePeriodizationChange(value)}
                sx={{ mb: 3, flexWrap: 'wrap', gap: 1 }}
              >
                <ToggleButton value="linear" size="small">
                  📈 Линейная
                </ToggleButton>
                <ToggleButton value="undulating" size="small">
                  🌊 Волновая
                </ToggleButton>
                <ToggleButton value="block" size="small">
                  🧱 Блоковая
                </ToggleButton>
                <ToggleButton value="conjugate" size="small">
                  ⚡ Westside
                </ToggleButton>
                <ToggleButton value="auto" size="small">
                  🤖 Авто
                </ToggleButton>
              </ToggleButtonGroup>
              
              {/* Детальное описание выбранной стратегии */}
              {selectedStrategy && (
                <Paper
                  variant="outlined"
                  sx={{
                    p: 3,
                    mb: 2,
                    borderColor: 'primary.main',
                    bgcolor: 'action.selected'
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                    <Typography variant="h3" sx={{ fontSize: '2.5rem' }}>
                      {selectedStrategy.icon}
                    </Typography>
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 700 }}>
                        {selectedStrategy.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {selectedStrategy.description}
                      </Typography>
                    </Box>
                  </Box>
                  
                  <Typography variant="body2" paragraph>
                    {selectedStrategy.longDescription}
                  </Typography>
                  
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mt: 2 }}>
                    <Box sx={{ flex: 1, minWidth: '200px' }}>
                      <Typography variant="subtitle2" color="success.main" gutterBottom>
                        Преимущества:
                      </Typography>
                      {selectedStrategy.pros.map((pro, idx) => (
                        <Typography key={idx} variant="caption" display="block" sx={{ mb: 0.5 }}>
                          {pro}
                        </Typography>
                      ))}
                    </Box>
                    <Box sx={{ flex: 1, minWidth: '200px' }}>
                      <Typography variant="subtitle2" color="error.main" gutterBottom>
                        Недостатки:
                      </Typography>
                      {selectedStrategy.cons.map((con, idx) => (
                        <Typography key={idx} variant="caption" display="block" sx={{ mb: 0.5 }}>
                          {con}
                        </Typography>
                      ))}
                    </Box>
                  </Box>

                  {/* Дополнительное описание для AI стратегии */}
                  {selectedStrategy?.id === 'auto' && (
                    <Alert severity="success" sx={{ mt: 2 }}>
                      <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                        🎯 Что умеет AI-тренер:
                      </Typography>
                      <Typography variant="body2" component="div">
                        • Анализирует RPE после каждой тренировки<br/>
                        • Предсказывает плато за 1-2 недели до его наступления<br/>
                        • Автоматически корректирует веса на основе твоего самочувствия<br/>
                        • Детектирует перетренированность и рекомендует разгрузку<br/>
                        • Учитывает качество сна и уровень стресса<br/>
                        • Прогнозирует 1ПМ с точностью до 95%<br/>
                        • Адаптируется под твой индивидуальный стиль восстановления<br/>
                        • Понимает, когда ты готов к пиковым нагрузкам<br/>
                        • Дает персонализированные рекомендации на русском языке
                      </Typography>
                      <Typography variant="body2" sx={{ mt: 1, fontStyle: 'italic' }}>
                        Чем больше тренируешься - тем умнее становится AI!
                      </Typography>
                    </Alert>
                  )}

                  {!isStrategySuitable(selectedStrategy.id) && (
                    <Alert severity="warning" sx={{ mt: 2 }}>
                      ⚠️ Эта стратегия не рекомендуется для вашего уровня. Вы можете использовать её, но прогресс может быть медленнее.
                    </Alert>
                  )}
                </Paper>
              )}
            </>
          )}

          <Divider sx={{ my: 2 }} />

          {/* ДОСТУПНОЕ ОБОРУДОВАНИЕ */}
          <Box>
            <Typography variant="h5" gutterBottom sx={{ 
              fontWeight: 600,
              fontSize: { xs: '1.25rem', sm: '1.5rem' }
            }}>
              Доступное оборудование
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ 
              mb: 2,
              fontSize: { xs: '0.75rem', sm: '0.875rem' }
            }}>
              Выберите всё, что есть в вашем зале
            </Typography>
            <Box sx={{ 
              display: 'flex', 
              flexWrap: 'wrap', 
              gap: { xs: 0.5, sm: 1 } 
            }}>
              {equipmentList.map(item => (
                <Chip
                  key={item.value}
                  icon={React.cloneElement(item.icon, { 
                    sx: { fontSize: { xs: 16, sm: 20 } } 
                  })}
                  label={item.label}
                  onClick={() => isEditing && toggleEquipment(item.value as Equipment)}
                  color={formData.availableEquipment?.includes(item.value as Equipment) ? 'primary' : 'default'}
                  variant={formData.availableEquipment?.includes(item.value as Equipment) ? 'filled' : 'outlined'}
                  disabled={!isEditing}
                  sx={{ 
                    m: 0.5,
                    cursor: isEditing ? 'pointer' : 'default',
                    opacity: !isEditing && !formData.availableEquipment?.includes(item.value as Equipment) ? 0.5 : 1,
                    fontSize: { xs: '0.75rem', sm: '0.875rem' },
                    height: { xs: 28, sm: 32 },
                    '& .MuiChip-icon': {
                      fontSize: { xs: 16, sm: 20 }
                    }
                  }}
                />
              ))}
            </Box>
            {isEditing && (!formData.availableEquipment || formData.availableEquipment.length === 0) && (
              <Alert severity="error" sx={{ mt: 2, fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                ⚠️ Выберите хотя бы один тип оборудования
              </Alert>
            )}
          </Box>

          <Divider sx={{ my: 2 }} />

          <Typography variant="h5" gutterBottom sx={{ 
            fontWeight: 600,
            fontSize: { xs: '1.25rem', sm: '1.5rem' }
          }}>
            Настройки
          </Typography>

          <FormControlLabel
            control={
              <Switch
                name="notifications"
                checked={formData.notifications}
                onChange={handleSwitchChange}
                disabled={!isEditing}
                size={window.innerWidth <= 600 ? 'small' : 'medium'}
              />
            }
            label="Напоминания о тренировках"
            sx={{
              '& .MuiTypography-root': {
                fontSize: { xs: '0.875rem', sm: '1rem' }
              }
            }}
          />

          {formData.notifications && (
            <TextField
              label="Время напоминания"
              name="reminderTime"
              type="time"
              value={formData.reminderTime}
              onChange={handleTextChange}
              disabled={!isEditing}
              InputProps={{
                startAdornment: <Schedule sx={{ mr: 1, color: 'text.secondary' }} />
              }}
              sx={{ maxWidth: { xs: '100%', sm: 200 } }}
              size="medium"
            />
          )}

          <FormControl fullWidth disabled={!isEditing} size="medium">
            <InputLabel>Режим отдыха</InputLabel>
            <Select
              name="restPreference"
              value={formData.restPreference}
              onChange={handleSelectChange}
              label="Режим отдыха"
            >
              <MenuItem value="strict">Строгий (точный таймер)</MenuItem>
              <MenuItem value="flexible">Гибкий (самочувствие)</MenuItem>
            </Select>
          </FormControl>

          {!isEditing && (
            <>
              <Divider sx={{ my: 2 }} />
              <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                  variant="outlined"
                  color="error"
                  startIcon={<RestartAlt />}
                  onClick={() => setResetDialogOpen(true)}
                  sx={{ width: { xs: '100%', sm: 'auto' } }}
                >
                  Начать заново
                </Button>
              </Box>
            </>
          )}
        </Box>
      </Paper>

      <Dialog 
        open={resetDialogOpen} 
        onClose={() => setResetDialogOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem' } }}>
          Сбросить все данные?
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" paragraph sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>
            Это действие удалит:
          </Typography>
          <Typography variant="body2" component="div" sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>
            • Всю историю тренировок<br />
            • Профиль и настройки<br />
            • Прогресс и статистику
          </Typography>
          <Typography variant="body2" color="error" sx={{ mt: 2, fontSize: { xs: '0.875rem', sm: '1rem' } }}>
            Это действие нельзя отменить!
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: { xs: 2, sm: 3 } }}>
          <Button 
            onClick={() => setResetDialogOpen(false)}
            sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}
          >
            Отмена
          </Button>
          <Button 
            onClick={handleResetData} 
            color="error" 
            variant="contained"
            sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}
          >
            Сбросить
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={4000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          severity={snackbarMessage.includes('❌') ? 'error' : snackbarMessage.includes('⚠️') ? 'warning' : 'success'} 
          sx={{ 
            width: '100%',
            fontSize: { xs: '0.875rem', sm: '1rem' }
          }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default ProfileScreen;