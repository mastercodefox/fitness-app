import React, { useEffect } from 'react';
import WebApp from '@twa-dev/sdk';
import './TelegramMainButton.css';

interface TelegramMainButtonProps {
  text: string;
  visible: boolean;
  progress?: boolean;
  color?: string;
  textColor?: string;
  onClick: () => void;
}

const TelegramMainButton: React.FC<TelegramMainButtonProps> = ({
  text,
  visible,
  progress = false,
  color,
  textColor,
  onClick
}) => {
  useEffect(() => {
    if (WebApp) {
      if (visible) {
        WebApp.MainButton.setText(text);
        WebApp.MainButton.show();
        WebApp.MainButton.onClick(onClick);
        
        if (progress) {
          WebApp.MainButton.showProgress();
        } else {
          WebApp.MainButton.hideProgress();
        }
        
        if (color) {
          WebApp.MainButton.setParams({ color });
        }
        
        if (textColor) {
          WebApp.MainButton.setParams({ text_color: textColor });
        }
      } else {
        WebApp.MainButton.hide();
        WebApp.MainButton.offClick(onClick);
      }
    }

    return () => {
      if (WebApp) {
        WebApp.MainButton.offClick(onClick);
      }
    };
  }, [text, visible, progress, color, textColor, onClick]);

  // Фолбэк для веба (если не в Telegram)
  if (!WebApp) {
    return visible ? (
      <button 
        className="telegram-main-button-fallback"
        onClick={onClick}
      >
        {text}
      </button>
    ) : null;
  }

  return null;
};

export default TelegramMainButton;