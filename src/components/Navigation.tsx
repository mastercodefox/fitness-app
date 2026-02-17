import React, { useContext } from 'react';
import { BottomNavigation, BottomNavigationAction, Paper } from '@mui/material';
import { 
  FitnessCenter, 
  History, 
  BarChart, 
  Person,
  CalendarToday 
} from '@mui/icons-material';
import { useLocation, useNavigate } from 'react-router-dom';
import { WorkoutContext } from '../App';

export const Navigation: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentWorkoutDay } = useContext(WorkoutContext);

  // Активная тренировка только если мы на экране тренировки И тренировка не завершена
  const isWorkoutActive = currentWorkoutDay !== null && 
                          !currentWorkoutDay.completed && 
                          location.pathname === '/workout';

  const handleNavigation = (path: string) => {
    // Если тренировка активна - можно переключаться только на /workout
    if (isWorkoutActive && path !== '/workout') {
      return; // Игнорируем нажатия на другие кнопки
    }
    navigate(path);
  };

  return (
    <Paper 
      sx={{ 
        position: 'fixed', 
        bottom: 0, 
        left: 0, 
        right: 0, 
        zIndex: 1000,
        borderTop: 1,
        borderColor: 'divider'
      }} 
      elevation={3}
    >
      <BottomNavigation
        showLabels
        value={location.pathname}
        onChange={(_, newValue) => handleNavigation(newValue)}
      >
        <BottomNavigationAction 
          label="Тренировка" 
          value="/workout" 
          icon={<FitnessCenter />} 
        />
        <BottomNavigationAction 
          label="План" 
          value="/week" 
          icon={<CalendarToday />}
        />
        <BottomNavigationAction 
          label="История" 
          value="/history" 
          icon={<History />}
        />
        <BottomNavigationAction 
          label="Прогресс" 
          value="/progress" 
          icon={<BarChart />}
        />
        <BottomNavigationAction 
          label="Профиль" 
          value="/profile" 
          icon={<Person />}
        />
      </BottomNavigation>
    </Paper>
  );
};