// Configuración del tema
export const THEME_CONFIG = {
  // Claves de localStorage
  STORAGE_KEY: 'guardianComprasDarkMode',
  
  // Colores para meta theme-color
  LIGHT_THEME_COLOR: '#ffffff',
  DARK_THEME_COLOR: '#1e293b',
  
  // Clases CSS
  DARK_CLASS: 'dark',
  
  // Transiciones
  TRANSITION_DURATION: 300,
  TRANSITION_EASING: 'cubic-bezier(0.4, 0, 0.2, 1)',
} as const;

// Función para detectar la preferencia del sistema
export const getSystemTheme = (): boolean => {
  if (typeof window !== 'undefined') {
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  }
  return false;
};

// Función para obtener el tema inicial
export const getInitialTheme = (): boolean => {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem(THEME_CONFIG.STORAGE_KEY);
    if (saved !== null) {
      return JSON.parse(saved);
    }
    return getSystemTheme();
  }
  return false;
};

// Función para aplicar el tema al DOM
export const applyThemeToDOM = (isDark: boolean): void => {
  if (typeof window === 'undefined') return;
  
  // Aplicar clase al body y html
  document.body.classList.toggle(THEME_CONFIG.DARK_CLASS, isDark);
  document.documentElement.classList.toggle(THEME_CONFIG.DARK_CLASS, isDark);
  
  // Actualizar meta theme-color para móviles
  const metaThemeColor = document.querySelector('meta[name="theme-color"]');
  if (metaThemeColor) {
    metaThemeColor.setAttribute(
      'content', 
      isDark ? THEME_CONFIG.DARK_THEME_COLOR : THEME_CONFIG.LIGHT_THEME_COLOR
    );
  }
};

// Función para persistir la preferencia del tema
export const persistThemePreference = (isDark: boolean): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(THEME_CONFIG.STORAGE_KEY, JSON.stringify(isDark));
  }
}; 