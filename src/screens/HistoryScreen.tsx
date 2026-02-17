import React, { useContext, useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemText,
  Collapse,
  IconButton,
  Chip,
  Divider
} from '@mui/material';
import {
  ExpandMore,
  ExpandLess,
  FitnessCenter,
  CalendarToday
} from '@mui/icons-material';
import { WorkoutContext } from '../App';

const HistoryScreen: React.FC = () => {
  const { workouts } = useContext(WorkoutContext);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" sx={{ fontWeight: 700, mb: 4, display: 'flex', alignItems: 'center', gap: 1 }}>
        <CalendarToday sx={{ fontSize: 32, color: 'primary.main' }} />
        История тренировок
      </Typography>

      {workouts.length === 0 ? (
        <Paper sx={{ p: 6, textAlign: 'center' }}>
          <FitnessCenter sx={{ fontSize: 64, color: 'text.secondary', mb: 2, opacity: 0.5 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            Нет сохраненных тренировок
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Завершите тренировку, чтобы сохранить историю
          </Typography>
        </Paper>
      ) : (
        <List>
          {workouts.map((workout) => (
            <Paper key={workout.id} sx={{ mb: 2 }}>
              <ListItem
                secondaryAction={
                  <IconButton onClick={() => setExpandedId(expandedId === workout.id ? null : workout.id)}>
                    {expandedId === workout.id ? <ExpandLess /> : <ExpandMore />}
                  </IconButton>
                }
              >
                <ListItemText
                  primary={new Date(workout.date).toLocaleDateString('ru-RU', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                  secondary={`${workout.exercises.length} упражнений`}
                />
              </ListItem>
              <Collapse in={expandedId === workout.id} timeout="auto" unmountOnExit>
                <Box sx={{ p: 2 }}>
                  {workout.exercises.map((exercise, exIdx) => (
                    <Box key={exIdx} sx={{ mb: 2 }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                        {exercise.name}
                      </Typography>
                      {exercise.sets.map((set, setIdx) => (
                        <Box key={setIdx} sx={{ display: 'flex', alignItems: 'center', gap: 1, ml: 2, mt: 0.5 }}>
                          <Chip label={`${setIdx + 1}`} size="small" variant="outlined" />
                          <Typography variant="body2">
                            {set.weight}кг × {set.reps}
                          </Typography>
                          {set.rpe && (
                            <Chip 
                              label={`RPE ${set.rpe}`}
                              size="small"
                              color={set.rpe >= 8 ? 'error' : set.rpe >= 6 ? 'warning' : 'success'}
                              sx={{ height: 20 }}
                            />
                          )}
                        </Box>
                      ))}
                      {exIdx < workout.exercises.length - 1 && <Divider sx={{ my: 1 }} />}
                    </Box>
                  ))}
                </Box>
              </Collapse>
            </Paper>
          ))}
        </List>
      )}
    </Container>
  );
};

export default HistoryScreen;