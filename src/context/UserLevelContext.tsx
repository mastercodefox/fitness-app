import React, { createContext, useContext, useEffect, useState } from 'react';
import { UserLevel, USER_LEVELS } from '../types/exercise.types';

interface UserLevelContextType {
  level: UserLevel;
  setLevel: (level: UserLevel) => void;
  isOnboarded: boolean;
  setIsOnboarded: (value: boolean) => void;
  levelInfo: typeof USER_LEVELS[keyof typeof USER_LEVELS];
  weeklyFrequency: number;
  volumeMultiplier: number;
}

const UserLevelContext = createContext<UserLevelContextType | undefined>(undefined);

export const useUserLevel = () => {
  const context = useContext(UserLevelContext);
  if (!context) {
    throw new Error('useUserLevel must be used within UserLevelProvider');
  }
  return context;
};

export const UserLevelProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [level, setLevel] = useState<UserLevel>('beginner');
  const [isOnboarded, setIsOnboarded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Загрузка из localStorage при старте
    const loadUserData = () => {
      try {
        const savedLevel = localStorage.getItem('userLevel');
        const savedOnboarded = localStorage.getItem('isOnboarded');
        
        if (savedLevel) {
          setLevel(savedLevel as UserLevel);
        }
        
        if (savedOnboarded) {
          setIsOnboarded(JSON.parse(savedOnboarded));
        }
      } catch (error) {
        console.error('Error loading user level:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadUserData();
  }, []);

  useEffect(() => {
    // Сохранение в localStorage при изменении
    if (!isLoading) {
      localStorage.setItem('userLevel', level);
      localStorage.setItem('isOnboarded', JSON.stringify(isOnboarded));
    }
  }, [level, isOnboarded, isLoading]);

  const levelInfo = USER_LEVELS[level];
  const weeklyFrequency = levelInfo.frequency;
  const volumeMultiplier = levelInfo.volumeMultiplier;

  return (
    <UserLevelContext.Provider 
      value={{ 
        level, 
        setLevel, 
        isOnboarded, 
        setIsOnboarded,
        levelInfo,
        weeklyFrequency,
        volumeMultiplier
      }}
    >
      {children}
    </UserLevelContext.Provider>
  );
};

// Компонент онбординга
export const OnboardingScreen: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const { setLevel, setIsOnboarded } = useUserLevel();
  const [selectedLevel, setSelectedLevel] = useState<UserLevel | null>(null);

  const handleComplete = () => {
    if (selectedLevel) {
      setLevel(selectedLevel);
      setIsOnboarded(true);
      onComplete();
    }
  };

  return (
    <div className="onboarding-container" style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'var(--tg-theme-bg-color, #ffffff)',
      zIndex: 1000,
      display: 'flex',
      flexDirection: 'column',
      padding: '24px'
    }}>
      <div style={{ marginTop: '40px' }}>
        <h1 style={{ 
          fontSize: '28px', 
          fontWeight: 'bold',
          color: 'var(--tg-theme-text-color, #000000)',
          marginBottom: '12px'
        }}>
          Добро пожаловать! 👋
        </h1>
        <p style={{
          fontSize: '16px',
          color: 'var(--tg-theme-hint-color, #6b7280)',
          marginBottom: '32px'
        }}>
          Выберите ваш уровень тренированности для персонализации программы
        </p>
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {/* Начинающий */}
        <button
          onClick={() => setSelectedLevel('beginner')}
          style={{
            padding: '20px',
            backgroundColor: selectedLevel === 'beginner' 
              ? 'var(--tg-theme-button-color, #40a7e3)' 
              : 'var(--tg-theme-secondary-bg-color, #f0f0f0)',
            border: 'none',
            borderRadius: '16px',
            textAlign: 'left',
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
        >
          <h3 style={{ 
            fontSize: '18px', 
            fontWeight: '600',
            color: selectedLevel === 'beginner' 
              ? 'var(--tg-theme-button-text-color, #ffffff)' 
              : 'var(--tg-theme-text-color, #000000)',
            marginBottom: '4px'
          }}>
            Начинающий 🌱
          </h3>
          <p style={{ 
            fontSize: '14px',
            color: selectedLevel === 'beginner' 
              ? 'rgba(255,255,255,0.9)' 
              : 'var(--tg-theme-hint-color, #6b7280)',
            marginBottom: '8px'
          }}>
            Менее 6 месяцев тренировок
          </p>
          <ul style={{ 
            fontSize: '13px',
            color: selectedLevel === 'beginner' 
              ? 'rgba(255,255,255,0.8)' 
              : 'var(--tg-theme-subtitle-color, #9ca3af)',
            paddingLeft: '20px'
          }}>
            <li>3 тренировки в неделю</li>
            <li>Освоение техники</li>
            <li>Умеренный объем</li>
          </ul>
        </button>

        {/* Средний */}
        <button
          onClick={() => setSelectedLevel('intermediate')}
          style={{
            padding: '20px',
            backgroundColor: selectedLevel === 'intermediate' 
              ? 'var(--tg-theme-button-color, #40a7e3)' 
              : 'var(--tg-theme-secondary-bg-color, #f0f0f0)',
            border: 'none',
            borderRadius: '16px',
            textAlign: 'left',
            cursor: 'pointer'
          }}
        >
          <h3 style={{ 
            fontSize: '18px', 
            fontWeight: '600',
            color: selectedLevel === 'intermediate' 
              ? 'var(--tg-theme-button-text-color, #ffffff)' 
              : 'var(--tg-theme-text-color, #000000)',
            marginBottom: '4px'
          }}>
            Средний 💪
          </h3>
          <p style={{ 
            fontSize: '14px',
            color: selectedLevel === 'intermediate' 
              ? 'rgba(255,255,255,0.9)' 
              : 'var(--tg-theme-hint-color, #6b7280)',
            marginBottom: '8px'
          }}>
            6-18 месяцев тренировок
          </p>
          <ul style={{ 
            fontSize: '13px',
            color: selectedLevel === 'intermediate' 
              ? 'rgba(255,255,255,0.8)' 
              : 'var(--tg-theme-subtitle-color, #9ca3af)',
            paddingLeft: '20px'
          }}>
            <li>4 тренировки в неделю</li>
            <li>Прогрессия нагрузки</li>
            <li>Сплит-программы</li>
          </ul>
        </button>

        {/* Продвинутый */}
        <button
          onClick={() => setSelectedLevel('advanced')}
          style={{
            padding: '20px',
            backgroundColor: selectedLevel === 'advanced' 
              ? 'var(--tg-theme-button-color, #40a7e3)' 
              : 'var(--tg-theme-secondary-bg-color, #f0f0f0)',
            border: 'none',
            borderRadius: '16px',
            textAlign: 'left',
            cursor: 'pointer'
          }}
        >
          <h3 style={{ 
            fontSize: '18px', 
            fontWeight: '600',
            color: selectedLevel === 'advanced' 
              ? 'var(--tg-theme-button-text-color, #ffffff)' 
              : 'var(--tg-theme-text-color, #000000)',
            marginBottom: '4px'
          }}>
            Продвинутый 🔥
          </h3>
          <p style={{ 
            fontSize: '14px',
            color: selectedLevel === 'advanced' 
              ? 'rgba(255,255,255,0.9)' 
              : 'var(--tg-theme-hint-color, #6b7280)',
            marginBottom: '8px'
          }}>
            Более 18 месяцев тренировок
          </p>
          <ul style={{ 
            fontSize: '13px',
            color: selectedLevel === 'advanced' 
              ? 'rgba(255,255,255,0.8)' 
              : 'var(--tg-theme-subtitle-color, #9ca3af)',
            paddingLeft: '20px'
          }}>
            <li>5-6 тренировок в неделю</li>
            <li>Высокоинтенсивные методы</li>
            <li>Специализация</li>
          </ul>
        </button>
      </div>

      <div style={{ marginTop: '24px', marginBottom: '24px' }}>
        <button
          onClick={handleComplete}
          disabled={!selectedLevel}
          style={{
            width: '100%',
            padding: '16px',
            backgroundColor: selectedLevel 
              ? 'var(--tg-theme-button-color, #40a7e3)' 
              : 'var(--tg-theme-secondary-bg-color, #e5e7eb)',
            color: selectedLevel 
              ? 'var(--tg-theme-button-text-color, #ffffff)' 
              : 'var(--tg-theme-hint-color, #9ca3af)',
            border: 'none',
            borderRadius: '14px',
            fontSize: '16px',
            fontWeight: '600',
            cursor: selectedLevel ? 'pointer' : 'not-allowed',
            transition: 'all 0.2s'
          }}
        >
          {selectedLevel ? 'Начать тренировки' : 'Выберите уровень'}
        </button>
        
        <p style={{
          textAlign: 'center',
          fontSize: '12px',
          color: 'var(--tg-theme-hint-color, #9ca3af)',
          marginTop: '12px'
        }}>
          Уровень можно изменить позже в настройках профиля
        </p>
      </div>
    </div>
  );
};