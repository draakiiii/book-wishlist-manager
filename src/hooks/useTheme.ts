import { useEffect, useState, useContext } from 'react';
import { AppStateContext } from '../context/AppStateContext';
import { 
  getInitialTheme, 
  applyThemeToDOM, 
  persistThemePreference,
  getCurrentColorScheme,
  getCustomTheme,
  persistColorScheme,
  persistCustomTheme,
  THEME_CONFIG 
} from '../utils/themeConfig';

export const useTheme = () => {
  const [isDark, setIsDark] = useState(false);
  const [colorScheme, setColorScheme] = useState('azul');
  const [customTheme, setCustomTheme] = useState<any>(null);

  // Intentar obtener el contexto AppState si está disponible
  const appStateContext = useContext(AppStateContext);

  useEffect(() => {
    // Inicializar tema desde localStorage o preferencias del sistema
    const initialTheme = getInitialTheme();
    const initialColorScheme = getCurrentColorScheme();
    const initialCustomTheme = getCustomTheme();
    
    setIsDark(initialTheme);
    setColorScheme(initialColorScheme);
    setCustomTheme(initialCustomTheme);
    
    // Aplicar tema al DOM
    applyThemeToDOM(initialTheme, initialColorScheme, initialCustomTheme);
    
    // Sincronizar con AppState si está disponible
    if (appStateContext && appStateContext.state && appStateContext.state.darkMode !== initialTheme) {
      appStateContext.dispatch({ type: 'SET_DARK_MODE', payload: initialTheme });
    }
  }, [appStateContext]);

  const toggleTheme = () => {
    const newTheme = !isDark;
    setIsDark(newTheme);
    applyThemeToDOM(newTheme, colorScheme, customTheme);
    persistThemePreference(newTheme);
    
    // Sincronizar con AppState
    if (appStateContext) {
      appStateContext.dispatch({ type: 'SET_DARK_MODE', payload: newTheme });
    }
  };

  const setTheme = (dark: boolean) => {
    setIsDark(dark);
    applyThemeToDOM(dark, colorScheme, customTheme);
    persistThemePreference(dark);
    
    // Sincronizar con AppState
    if (appStateContext) {
      appStateContext.dispatch({ type: 'SET_DARK_MODE', payload: dark });
    }
  };

  const setColorSchemeHandler = (scheme: string) => {
    setColorScheme(scheme);
    applyThemeToDOM(isDark, scheme, customTheme);
    persistColorScheme(scheme);
  };

  const setCustomThemeHandler = (theme: any) => {
    setCustomTheme(theme);
    applyThemeToDOM(isDark, colorScheme, theme);
    persistCustomTheme(theme);
  };

  const resetTheme = () => {
    const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setIsDark(systemTheme);
    setColorScheme('azul');
    setCustomTheme(null);
    applyThemeToDOM(systemTheme, 'azul', null);
    persistThemePreference(systemTheme);
    persistColorScheme('azul');
    persistCustomTheme(null);
    
    // Sincronizar con AppState
    if (appStateContext) {
      appStateContext.dispatch({ type: 'SET_DARK_MODE', payload: systemTheme });
    }
  };

  return {
    isDark,
    colorScheme,
    customTheme,
    toggleTheme,
    setTheme,
    setColorScheme: setColorSchemeHandler,
    setCustomTheme: setCustomThemeHandler,
    resetTheme
  };
}; 