import React, { useState, useContext } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Stepper,
  Step,
  StepLabel,
  Button,
  Card,
  CardContent,
  Chip,
  Alert,
  LinearProgress,
  Fade,
  Grow,
  Grid,
  Divider
} from '@mui/material';
import {
  FitnessCenter,
  EmojiEvents,
  ArrowForward,
  ArrowBack
} from '@mui/icons-material';
import { WorkoutContext } from '../App';
import { ASSESSMENT_EXERCISES } from '../data/assessmentExercises';
import AssessmentService from '../services/AssessmentService';
import { ExperienceLevel } from '../types/workout.types';

const AssessmentScreen: React.FC = () => {
  const { 
    userProfile, 
    updateProfile, 
    regenerateWeekPlan 
  } = useContext(WorkoutContext);
  
  const [activeStep, setActiveStep] = useState(0);
  const [results, setResults] = useState<{ exerciseId: string; reps: number }[]>([]);
  const [currentReps, setCurrentReps] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [assessmentResult, setAssessmentResult] = useState<any>(null);

  const exercises = ASSESSMENT_EXERCISES;

  const currentExercise = exercises[activeStep];
  const testWeight = currentExercise ? 
    AssessmentService.getTestWeight(currentExercise, userProfile!) : 0;

  const handleRepsSelect = (reps: number) => {
    setCurrentReps(reps);
  };

  const handleNext = () => {
    if (currentReps) {
      const newResults = [...results, { 
        exerciseId: currentExercise.id, 
        reps: currentReps 
      }];
      setResults(newResults);
      setCurrentReps(null);
      
      if (activeStep < exercises.length - 1) {
        setActiveStep(activeStep + 1);
      } else {
        // Завершили все упражнения
        const fullResults = AssessmentService.completeAssessment(
          userProfile!,
          newResults
        );
        setAssessmentResult(fullResults);
        
        // Конвертируем уровень в допустимый тип ExperienceLevel
        let experienceLevel: ExperienceLevel = 'beginner';
        const overallLevel = fullResults.strengthLevel.overall;
        
        if (overallLevel === 'intermediate') experienceLevel = 'intermediate';
        else if (overallLevel === 'advanced') experienceLevel = 'advanced';
        else if (overallLevel === 'elite') experienceLevel = 'advanced';
        
        // Обновляем профиль с новым уровнем
        updateProfile({
          ...userProfile!,
          experience: experienceLevel,
          assessmentCompleted: true,
          assessmentDate: new Date().toISOString(),
          derived1RM: fullResults.derived1RM,
          strengthLevel: fullResults.strengthLevel
        });
        
        // Генерируем план тренировок
        regenerateWeekPlan();
        
        // Показываем результаты
        setShowResult(true);
      }
    }
  };

  const handleBack = () => {
    setActiveStep(activeStep - 1);
    setCurrentReps(null);
  };

  // Упрощенная функция - только переход к плану
  const handleGoToPlan = () => {
    window.location.href = '/week';
  };

  const getRepsColor = (reps: number) => {
    if (!currentExercise) return 'default';
    
    if (reps >= 16) return 'error';
    if (reps >= 11) return 'error';
    if (reps >= 6) return 'warning';
    if (reps >= 1) return 'info';
    return 'default';
  };

  const getRepsLabel = (reps: number) => {
    if (!currentExercise) return '';
    
    if (reps >= 16) return 'Элита 💪';
    if (reps >= 11) return 'Продвинутый 🔥';
    if (reps >= 6) return 'Средний 📈';
    if (reps >= 1) return 'Начинающий 🌱';
    return 'Ниже среднего';
  };

  if (showResult && assessmentResult) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Fade in={true}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 4, textAlign: 'center' }}>
              🎉 Твои результаты
            </Typography>

            <Paper sx={{ p: 4, mb: 4, bgcolor: 'primary.dark', color: 'white' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2, mb: 2 }}>
                <EmojiEvents sx={{ fontSize: 48 }} />
                <Typography variant="h3" sx={{ fontWeight: 800 }}>
                  {assessmentResult.strengthLevel.overall === 'elite' && 'ЭЛИТА'}
                  {assessmentResult.strengthLevel.overall === 'advanced' && 'ПРОДВИНУТЫЙ'}
                  {assessmentResult.strengthLevel.overall === 'intermediate' && 'СРЕДНИЙ'}
                  {assessmentResult.strengthLevel.overall === 'beginner' && 'НАЧИНАЮЩИЙ'}
                </Typography>
              </Box>
              <Typography variant="body1" sx={{ textAlign: 'center', opacity: 0.9 }}>
                Общий уровень силы
              </Typography>
            </Paper>

            <Grid container spacing={3}>
              {assessmentResult.results.map((result: any, idx: number) => (
                <Grid size={{ xs: 12, md: 6 }} key={idx}>
                  <Grow in={true} timeout={500 + idx * 100}>
                    <Card>
                      <CardContent>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                          <Typography variant="h6">{result.exerciseName}</Typography>
                          <Chip 
                            label={`${result.level}`}
                            color={result.level === 'elite' ? 'error' : 
                                   result.level === 'advanced' ? 'error' : 
                                   result.level === 'intermediate' ? 'warning' : 'info'}
                          />
                        </Box>

                        <Box sx={{ mb: 2 }}>
                          <Typography variant="body2" color="text.secondary">
                            Тестовый вес: {result.testWeight} кг
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Сделано повторений: {result.repsToFailure}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Расчетный 1ПМ: {result.calculated1RM} кг
                          </Typography>
                        </Box>

                        <Divider sx={{ my: 2 }} />

                        <Typography variant="subtitle2" gutterBottom>
                          Рекомендуемые веса:
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                          <Chip 
                            size="small"
                            label={`Сила: ${result.recommendedWeights.strength}кг`}
                            color="primary"
                          />
                          <Chip 
                            size="small"
                            label={`Масса: ${result.recommendedWeights.hypertrophy}кг`}
                            color="secondary"
                          />
                          <Chip 
                            size="small"
                            label={`Выносливость: ${result.recommendedWeights.endurance}кг`}
                            color="info"
                          />
                        </Box>

                        <LinearProgress 
                          variant="determinate" 
                          value={result.percentile} 
                          sx={{ mt: 2, height: 4, borderRadius: 2 }}
                        />
                        <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                          Ты сильнее {result.percentile}% людей с твоим весом
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grow>
                </Grid>
              ))}
            </Grid>

            <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
              <Button
                size="large"
                variant="contained"
                onClick={handleGoToPlan}
                startIcon={<FitnessCenter />}
              >
                К плану тренировок
              </Button>
            </Box>

            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', textAlign: 'center', mt: 2 }}>
              ⏳ План тренировок уже сгенерирован с твоими весами
            </Typography>
          </Box>
        </Fade>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper sx={{ p: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 2, textAlign: 'center' }}>
          Оцени свой уровень силы
        </Typography>
        
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4, textAlign: 'center' }}>
          Выполни {exercises.length} базовых упражнений до отказа, чтобы мы точно подобрали веса
        </Typography>

        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {exercises.map((ex, idx) => (
            <Step key={idx}>
              <StepLabel>{ex.muscleGroupRu}</StepLabel>
            </Step>
          ))}
        </Stepper>

        <Fade in={true} key={activeStep}>
          <Box>
            <Card sx={{ mb: 4, bgcolor: 'primary.dark' }}>
              <CardContent>
                <Typography variant="h5" gutterBottom>
                  {currentExercise?.name}
                </Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>
                  {currentExercise?.muscleGroupRu} • {currentExercise?.isMultiJoint ? 'Базовое' : 'Изолирующее'}
                </Typography>
                
                <Alert severity="info" sx={{ mb: 3 }}>
                  <Typography variant="body2">
                    <strong>Инструкция:</strong> Возьми вес <strong>{testWeight} кг</strong> 
                    {currentExercise?.testWeight.type === 'percentage' 
                      ? ` (${currentExercise?.testWeight.male * 100}% от твоего веса)` 
                      : ''} 
                    и сделай максимальное количество повторений с правильной техникой.
                    Остановись, когда не сможешь сделать еще одно повторение.
                  </Typography>
                </Alert>

                <Typography variant="h6" gutterBottom>
                  Сколько повторений ты сделал?
                </Typography>

                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 3 }}>
                  {[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20].map(reps => (
                    <Chip
                      key={reps}
                      label={reps}
                      onClick={() => handleRepsSelect(reps)}
                      color={currentReps === reps ? getRepsColor(reps) : 'default'}
                      variant={currentReps === reps ? 'filled' : 'outlined'}
                      sx={{ 
                        minWidth: 50,
                        fontWeight: currentReps === reps ? 700 : 400,
                        transform: currentReps === reps ? 'scale(1.1)' : 'scale(1)',
                        transition: '0.2s'
                      }}
                    />
                  ))}
                </Box>

                {currentReps && (
                  <Fade in={true}>
                    <Alert 
                      severity={getRepsColor(currentReps) as any}
                      sx={{ mb: 2 }}
                    >
                      {getRepsLabel(currentReps)} — {currentReps} повторений
                    </Alert>
                  </Fade>
                )}

                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                  <Button
                    variant="outlined"
                    onClick={handleBack}
                    disabled={activeStep === 0}
                    startIcon={<ArrowBack />}
                  >
                    Назад
                  </Button>
                  <Button
                    variant="contained"
                    onClick={handleNext}
                    disabled={!currentReps}
                    endIcon={<ArrowForward />}
                  >
                    {activeStep === exercises.length - 1 ? 'Завершить' : 'Далее'}
                  </Button>
                </Box>
              </CardContent>
            </Card>

            {/* Легенда */}
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 4, flexWrap: 'wrap' }}>
              <Box sx={{ textAlign: 'center' }}>
                <Chip label="🌱 1-5" color="info" size="small" sx={{ mb: 1 }} />
                <Typography variant="caption" display="block">
                  Начинающий
                </Typography>
              </Box>
              <Box sx={{ textAlign: 'center' }}>
                <Chip label="📈 6-10" color="warning" size="small" sx={{ mb: 1 }} />
                <Typography variant="caption" display="block">
                  Средний
                </Typography>
              </Box>
              <Box sx={{ textAlign: 'center' }}>
                <Chip label="🔥 11-15" color="error" size="small" sx={{ mb: 1 }} />
                <Typography variant="caption" display="block">
                  Продвинутый
                </Typography>
              </Box>
              <Box sx={{ textAlign: 'center' }}>
                <Chip label="💪 16+" color="error" size="small" sx={{ mb: 1 }} />
                <Typography variant="caption" display="block">
                  Элита
                </Typography>
              </Box>
            </Box>
          </Box>
        </Fade>
      </Paper>
    </Container>
  );
};

export default AssessmentScreen;