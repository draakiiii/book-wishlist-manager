import { useEffect, useState, useContext } from 'react';
import { AppStateContext } from '../context/AppStateContext';
import { 
  getInitialTheme, 
  applyThemeToDOM, 
  persistThemePreference, 
  THEME_CONFIG 
} from '../utils/themeConfig';

export const useTheme = () => {
  const [isDark, setIsDark] = useState(getInitialTheme);

  // Intentar obtener el contexto AppState si está disponible
  const appStateContext = useContext(AppStateContext);

  useEffect(() => {
    // Aplicar el tema al DOM
    applyThemeToDOM(isDark);
    
    // Persistir la preferencia
    persistThemePreference(isDark);

    // Sincronizar con AppState si está disponible
    if (appStateContext && appStateContext.state && appStateContext.state.darkMode !== isDark) {
      appStateContext.dispatch({ type: 'SET_DARK_MODE', payload: isDark });
    }
  }, [isDark, appStateContext]);

  useEffect(() => {
    // Escuchar cambios en la preferencia del sistema
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleSystemThemeChange = (e: MediaQueryListEvent) => {
      // Solo cambiar si el usuario no ha establecido una preferencia manual
      const savedPreference = localStorage.getItem(THEME_CONFIG.STORAGE_KEY);
      if (savedPreference === null) {
        setIsDark(e.matches);
      }
    };

    mediaQuery.addEventListener('change', handleSystemThemeChange);
    
    return () => {
      mediaQuery.removeEventListener('change', handleSystemThemeChange);
    };
  }, []);

  const toggleTheme = () => {
    setIsDark(!isDark);
  };

  const setTheme = (dark: boolean) => {
    setIsDark(dark);
  };

  return {
    isDark,
    toggleTheme,
    setTheme
  };
}; 