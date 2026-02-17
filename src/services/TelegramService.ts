import WebApp from '@twa-dev/sdk';

export interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  is_premium?: boolean;
}

class TelegramService {
  private static instance: TelegramService;
  public webApp = WebApp;
  public user: TelegramUser | null = null;

  private constructor() {
    this.init();
  }

  public static getInstance(): TelegramService {
    if (!TelegramService.instance) {
      TelegramService.instance = new TelegramService();
    }
    return TelegramService.instance;
  }

  private init() {
    try {
      // Инициализация WebApp
      this.webApp.ready();
      this.webApp.expand();
      
      // Получаем данные пользователя
      if (this.webApp.initDataUnsafe?.user) {
        this.user = this.webApp.initDataUnsafe.user;
        console.log('✅ Telegram пользователь:', this.user);
      }

      // Устанавливаем тему
      this.applyTheme();
      
      // Настраиваем кнопку назад
      this.setupBackButton();

    } catch (error) {
      console.error('❌ Ошибка инициализации Telegram:', error);
    }
  }

  // Применяем тему Telegram к нашему приложению
  private applyTheme() {
    const theme = this.webApp.themeParams;
    
    // Сохраняем цвета Telegram в CSS переменные
    const root = document.documentElement;
    root.style.setProperty('--tg-bg-color', theme.bg_color || '#0f0f11');
    root.style.setProperty('--tg-text-color', theme.text_color || '#ffffff');
    root.style.setProperty('--tg-hint-color', theme.hint_color || '#999999');
    root.style.setProperty('--tg-link-color', theme.link_color || '#6366f1');
    root.style.setProperty('--tg-button-color', theme.button_color || '#6366f1');
    root.style.setProperty('--tg-button-text-color', theme.button_text_color || '#ffffff');
    root.style.setProperty('--tg-secondary-bg-color', theme.secondary_bg_color || '#1a1a1e');
  }

  // Настройка кнопки назад
  private setupBackButton() {
    this.webApp.BackButton.onClick(() => {
      window.history.back();
    });
  }

  // Показать кнопку назад
  public showBackButton() {
    this.webApp.BackButton.show();
  }

  // Скрыть кнопку назад
  public hideBackButton() {
    this.webApp.BackButton.hide();
  }

  // Основная кнопка (MainButton)
  public showMainButton(text: string, callback: () => void, color?: string) {
    const button = this.webApp.MainButton;
    button.setText(text);
    button.setParams({
      color: color || this.webApp.themeParams.button_color || '#6366f1',
      text_color: this.webApp.themeParams.button_text_color || '#ffffff',
      is_active: true,
      is_visible: true
    });
    button.onClick(callback);
  }

  public hideMainButton() {
    this.webApp.MainButton.hide();
  }

  public enableMainButton() {
    this.webApp.MainButton.enable();
  }

  public disableMainButton() {
    this.webApp.MainButton.disable();
  }

  // Виброотклик
  public hapticFeedback(style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft' = 'medium') {
    try {
      this.webApp.HapticFeedback.impactOccurred(style);
    } catch (error) {
      console.log('Вибро недоступно');
    }
  }

  // Уведомление
  public showNotification(text: string, type: 'error' | 'success' | 'warning' = 'success') {
    try {
      this.webApp.showPopup({
        title: type === 'error' ? 'Ошибка' : type === 'warning' ? 'Внимание' : 'Успех',
        message: text,
        buttons: [{ type: 'ok' }]
      });
    } catch (error) {
      console.log('Popup недоступен');
    }
  }

  // Закрыть приложение
  public close() {
    this.webApp.close();
  }

  // Отправить данные в бота
  public sendData(data: any) {
    try {
      this.webApp.sendData(JSON.stringify(data));
    } catch (error) {
      console.error('Ошибка отправки данных:', error);
    }
  }

  // Проверка, запущено ли приложение в Telegram
  public get isTelegram(): boolean {
    return typeof this.webApp !== 'undefined' && !!this.webApp.initData;
  }

  // Получить информацию о пользователе
  public getUserInfo(): string {
    if (this.user) {
      return this.user.first_name + (this.user.last_name ? ` ${this.user.last_name}` : '');
    }
    return '';
  }
}

export default TelegramService.getInstance();