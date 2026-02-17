import React from 'react';
import './RPERequestDialog.css';

interface RPERequestDialogProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (rpe: number) => void;
  exerciseName: string;
  setNumber: number;
}

const RPERequestDialog: React.FC<RPERequestDialogProps> = ({
  visible,
  onClose,
  onSubmit,
  exerciseName,
  setNumber
}) => {
  const [selectedRPE, setSelectedRPE] = React.useState<number | null>(null);

  if (!visible) return null;

  const handleSubmit = () => {
    if (selectedRPE) {
      onSubmit(selectedRPE);
      setSelectedRPE(null);
    }
  };

  const handleClose = () => {
    setSelectedRPE(null);
    onClose();
  };

  const rpeDescriptions: Record<number, string> = {
    6: 'Очень легко',
    7: 'Легко',
    8: 'Умеренно',
    9: 'Тяжело',
    10: 'Максимум'
  };

  return (
    <div className="rpe-dialog-overlay" onClick={handleClose}>
      <div className="rpe-dialog" onClick={e => e.stopPropagation()}>
        <h2 className="rpe-dialog-title">Оцените подход</h2>
        
        <div className="rpe-exercise-info">
          <div className="rpe-exercise-name">{exerciseName}</div>
          <div className="rpe-set-number">Подход {setNumber}</div>
        </div>

        <div className="rpe-subtitle">RPE (6-10):</div>
        
        <div className="rpe-grid">
          {[6, 7, 8, 9, 10].map((value) => (
            <button
              key={value}
              className={`rpe-button ${selectedRPE === value ? 'selected' : ''}`}
              onClick={() => setSelectedRPE(value)}
            >
              <span className="rpe-value">{value}</span>
              <span className="rpe-description">{rpeDescriptions[value]}</span>
            </button>
          ))}
        </div>

        <div className="rpe-actions">
          <button className="rpe-cancel" onClick={handleClose}>
            Отмена
          </button>
          <button 
            className={`rpe-submit ${!selectedRPE ? 'disabled' : ''}`}
            onClick={handleSubmit}
            disabled={!selectedRPE}
          >
            Готово
          </button>
        </div>
      </div>
    </div>
  );
};

export default RPERequestDialog;