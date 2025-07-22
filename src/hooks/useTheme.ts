import { useEffect, useState, useContext } from 'react';
import { AppStateContext } from '../context/AppStateContext';
import { 
  getInitialTheme, 
  applyThemeToDOM, 
  persistThemePreference, 
  THEME_CONFIG 
} from '../utils/themeConfig';

export const useTheme = () => {
  // Force light mode only
  const isDark = false;

  // Intentar obtener el contexto AppState si está disponible
  const appStateContext = useContext(AppStateContext);

  useEffect(() => {
    // Aplicar el tema al DOM - always light mode
    applyThemeToDOM(false);
    
    // Persistir la preferencia - always light mode
    persistThemePreference(false);

    // Sincronizar con AppState si está disponible
    if (appStateContext && appStateContext.state && appStateContext.state.darkMode !== false) {
      appStateContext.dispatch({ type: 'SET_DARK_MODE', payload: false });
    }
  }, [appStateContext]);

  const toggleTheme = () => {
    // No-op function - theme cannot be toggled
  };

  const setTheme = (dark: boolean) => {
    // No-op function - theme cannot be changed
  };

  return {
    isDark,
    toggleTheme,
    setTheme
  };
}; 