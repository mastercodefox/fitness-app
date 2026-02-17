import React, { useState, useEffect } from 'react';
import './Timer.css';

interface TimerProps {
  initialSeconds: number;
  onComplete: () => void;
  onClose: () => void;
}

const Timer: React.FC<TimerProps> = ({ initialSeconds, onComplete, onClose }) => {
  const [seconds, setSeconds] = useState(initialSeconds);
  const [isRunning, setIsRunning] = useState(true);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isRunning && seconds > 0) {
      interval = setInterval(() => {
        setSeconds(prev => prev - 1);
      }, 1000);
    } else if (seconds === 0) {
      onComplete();
    }

    return () => clearInterval(interval);
  }, [isRunning, seconds, onComplete]);

  const formatTime = (totalSeconds: number): string => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getProgress = () => {
    return ((initialSeconds - seconds) / initialSeconds) * 100;
  };

  return (
    <div className="timer-overlay" onClick={onClose}>
      <div className="timer-dialog" onClick={e => e.stopPropagation()}>
        <h2 className="timer-title">Отдых</h2>
        
        <div className="timer-display">
          <div className="timer-number">{formatTime(seconds)}</div>
          <div className="timer-progress">
            <div 
              className="timer-progress-fill"
              style={{ width: `${getProgress()}%` }}
            />
          </div>
        </div>

        <div className="timer-controls">
          <button 
            className="timer-control-btn"
            onClick={() => setIsRunning(!isRunning)}
          >
            {isRunning ? '⏸' : '▶️'}
          </button>
          
          <button 
            className="timer-control-btn"
            onClick={() => setSeconds(prev => Math.min(prev + 30, 300))}
          >
            +30
          </button>
          
          <button 
            className="timer-control-btn"
            onClick={() => setSeconds(prev => Math.max(prev - 30, 0))}
          >
            -30
          </button>
        </div>

        <button className="timer-skip" onClick={onClose}>
          Пропустить
        </button>
      </div>
    </div>
  );
};

export default Timer;