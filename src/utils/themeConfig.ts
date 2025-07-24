// Configuración del tema
export const THEME_CONFIG = {
  // Claves de localStorage
  STORAGE_KEY: 'bibliotecaLibrosDarkMode',
  THEME_STORAGE_KEY: 'bibliotecaLibrosTheme',
  CUSTOM_THEME_STORAGE_KEY: 'bibliotecaLibrosCustomTheme',
  
  // Colores para meta theme-color
  LIGHT_THEME_COLOR: '#ffffff',
  DARK_THEME_COLOR: '#1e293b',
  
  // Clases CSS
  DARK_CLASS: 'dark',
  
  // Transiciones
  TRANSITION_DURATION: 300,
  TRANSITION_EASING: 'cubic-bezier(0.4, 0, 0.2, 1)',
} as const;

// Esquemas de colores predefinidos
export const COLOR_SCHEMES = {
  azul: {
    name: 'Azul',
    light: {
      primary: '#0ea5e9',
      secondary: '#3b82f6',
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444',
      background: '#ffffff',
      foreground: '#1e293b',
      border: '#e2e8f0',
    },
    dark: {
      primary: '#38bdf8',
      secondary: '#60a5fa',
      success: '#34d399',
      warning: '#fbbf24',
      error: '#f87171',
      background: '#0f172a',
      foreground: '#f1f5f9',
      border: '#334155',
    }
  },
  verde: {
    name: 'Verde',
    light: {
      primary: '#10b981',
      secondary: '#059669',
      success: '#16a34a',
      warning: '#f59e0b',
      error: '#ef4444',
      background: '#ffffff',
      foreground: '#1e293b',
      border: '#e2e8f0',
    },
    dark: {
      primary: '#34d399',
      secondary: '#10b981',
      success: '#22c55e',
      warning: '#fbbf24',
      error: '#f87171',
      background: '#0f172a',
      foreground: '#f1f5f9',
      border: '#334155',
    }
  },
  morado: {
    name: 'Morado',
    light: {
      primary: '#8b5cf6',
      secondary: '#7c3aed',
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444',
      background: '#ffffff',
      foreground: '#1e293b',
      border: '#e2e8f0',
    },
    dark: {
      primary: '#a78bfa',
      secondary: '#8b5cf6',
      success: '#34d399',
      warning: '#fbbf24',
      error: '#f87171',
      background: '#0f172a',
      foreground: '#f1f5f9',
      border: '#334155',
    }
  },
  naranja: {
    name: 'Naranja',
    light: {
      primary: '#f97316',
      secondary: '#ea580c',
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444',
      background: '#ffffff',
      foreground: '#1e293b',
      border: '#e2e8f0',
    },
    dark: {
      primary: '#fb923c',
      secondary: '#f97316',
      success: '#34d399',
      warning: '#fbbf24',
      error: '#f87171',
      background: '#0f172a',
      foreground: '#f1f5f9',
      border: '#334155',
    }
  },
  rosa: {
    name: 'Rosa',
    light: {
      primary: '#ec4899',
      secondary: '#db2777',
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444',
      background: '#ffffff',
      foreground: '#1e293b',
      border: '#e2e8f0',
    },
    dark: {
      primary: '#f472b6',
      secondary: '#ec4899',
      success: '#34d399',
      warning: '#fbbf24',
      error: '#f87171',
      background: '#0f172a',
      foreground: '#f1f5f9',
      border: '#334155',
    }
  }
} as const;

// Configuraciones de tipografía
export const FONT_CONFIGS = {
  inter: {
    name: 'Inter',
    family: 'Inter, system-ui, sans-serif',
    weights: ['normal', 'medium', 'semibold', 'bold']
  },
  poppins: {
    name: 'Poppins',
    family: 'Poppins, system-ui, sans-serif',
    weights: ['normal', 'medium', 'semibold', 'bold']
  },
  roboto: {
    name: 'Roboto',
    family: 'Roboto, system-ui, sans-serif',
    weights: ['normal', 'medium', 'bold']
  },
  'open-sans': {
    name: 'Open Sans',
    family: 'Open Sans, system-ui, sans-serif',
    weights: ['normal', 'semibold', 'bold']
  },
  system: {
    name: 'System',
    family: 'system-ui, -apple-system, sans-serif',
    weights: ['normal', 'medium', 'semibold', 'bold']
  }
} as const;

// Configuraciones de espaciado
export const SPACING_CONFIGS = {
  compacto: {
    name: 'Compacto',
    section: 'space-y-2',
    card: 'p-3',
    button: 'px-3 py-1.5',
    input: 'px-2 py-1.5'
  },
  normal: {
    name: 'Normal',
    section: 'space-y-4',
    card: 'p-4',
    button: 'px-4 py-2',
    input: 'px-3 py-2'
  },
  espacioso: {
    name: 'Espacioso',
    section: 'space-y-6',
    card: 'p-6',
    button: 'px-6 py-3',
    input: 'px-4 py-3'
  }
} as const;

// Configuraciones de bordes
export const BORDER_CONFIGS = {
  ninguno: {
    name: 'Sin bordes',
    card: 'rounded-none',
    button: 'rounded-none',
    input: 'rounded-none'
  },
  suave: {
    name: 'Suave',
    card: 'rounded-md',
    button: 'rounded-md',
    input: 'rounded-md'
  },
  normal: {
    name: 'Normal',
    card: 'rounded-lg',
    button: 'rounded-lg',
    input: 'rounded-lg'
  },
  redondeado: {
    name: 'Redondeado',
    card: 'rounded-xl',
    button: 'rounded-xl',
    input: 'rounded-xl'
  }
} as const;

// Configuraciones de sombras
export const SHADOW_CONFIGS = {
  ninguna: {
    name: 'Sin sombras',
    card: 'shadow-none',
    button: 'shadow-none',
    hover: 'shadow-none'
  },
  suave: {
    name: 'Suave',
    card: 'shadow-sm',
    button: 'shadow-sm',
    hover: 'shadow-md'
  },
  normal: {
    name: 'Normal',
    card: 'shadow',
    button: 'shadow',
    hover: 'shadow-lg'
  },
  pronunciada: {
    name: 'Pronunciada',
    card: 'shadow-lg',
    button: 'shadow-lg',
    hover: 'shadow-xl'
  }
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
  if (typeof window === 'undefined') return false;
  
  // Intentar obtener del localStorage
  const saved = localStorage.getItem(THEME_CONFIG.STORAGE_KEY);
  if (saved !== null) {
    return JSON.parse(saved);
  }
  
  // Usar preferencia del sistema
  return getSystemTheme();
};

// Función para obtener el esquema de color actual
export const getCurrentColorScheme = (): string => {
  if (typeof window === 'undefined') return 'azul';
  
  const saved = localStorage.getItem(THEME_CONFIG.THEME_STORAGE_KEY);
  return saved || 'azul';
};

// Función para obtener tema personalizado
export const getCustomTheme = () => {
  if (typeof window === 'undefined') return null;
  
  const saved = localStorage.getItem(THEME_CONFIG.CUSTOM_THEME_STORAGE_KEY);
  return saved ? JSON.parse(saved) : null;
};

// Función para aplicar el tema al DOM
export const applyThemeToDOM = (isDark: boolean, colorScheme: string = 'azul', customTheme?: any): void => {
  if (typeof window === 'undefined') return;
  
  // Aplicar clase al body y html
  document.body.classList.toggle(THEME_CONFIG.DARK_CLASS, isDark);
  document.documentElement.classList.toggle(THEME_CONFIG.DARK_CLASS, isDark);
  
  // Aplicar esquema de color
  const colors = customTheme?.colores || COLOR_SCHEMES[colorScheme as keyof typeof COLOR_SCHEMES]?.[isDark ? 'dark' : 'light'];
  
  if (colors) {
    const root = document.documentElement;
    Object.entries(colors).forEach(([key, value]) => {
      root.style.setProperty(`--color-${key}`, value);
    });
  }
  
  // Actualizar meta theme-color para móviles
  const metaThemeColor = document.querySelector('meta[name="theme-color"]');
  if (metaThemeColor) {
    metaThemeColor.setAttribute(
      'content', 
      isDark ? THEME_CONFIG.DARK_THEME_COLOR : THEME_CONFIG.LIGHT_THEME_COLOR
    );
  }
};

// Función para aplicar configuración de tipografía
export const applyFontConfig = (fontFamily: string, fontSize: string, fontWeight: string): void => {
  if (typeof window === 'undefined') return;
  
  const root = document.documentElement;
  const fontConfig = FONT_CONFIGS[fontFamily as keyof typeof FONT_CONFIGS];
  
  if (fontConfig) {
    root.style.setProperty('--font-family', fontConfig.family);
  }
  
  root.style.setProperty('--font-size', fontSize);
  root.style.setProperty('--font-weight', fontWeight);
};

// Función para aplicar configuración de espaciado
export const applySpacingConfig = (spacing: string): void => {
  if (typeof window === 'undefined') return;
  
  const spacingConfig = SPACING_CONFIGS[spacing as keyof typeof SPACING_CONFIGS];
  if (spacingConfig) {
    const root = document.documentElement;
    Object.entries(spacingConfig).forEach(([key, value]) => {
      root.style.setProperty(`--spacing-${key}`, value);
    });
  }
};

// Función para persistir la preferencia del tema
export const persistThemePreference = (isDark: boolean): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(THEME_CONFIG.STORAGE_KEY, JSON.stringify(isDark));
  }
};

// Función para persistir el esquema de color
export const persistColorScheme = (scheme: string): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(THEME_CONFIG.THEME_STORAGE_KEY, scheme);
  }
};

// Función para persistir tema personalizado
export const persistCustomTheme = (theme: any): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(THEME_CONFIG.CUSTOM_THEME_STORAGE_KEY, JSON.stringify(theme));
  }
};

// Función para validar color hexadecimal
export const isValidHexColor = (color: string): boolean => {
  return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color);
};

// Función para convertir color hexadecimal a RGB
export const hexToRgb = (hex: string): { r: number; g: number; b: number } | null => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
};

// Función para calcular contraste de color
export const getContrastRatio = (color1: string, color2: string): number => {
  const rgb1 = hexToRgb(color1);
  const rgb2 = hexToRgb(color2);
  
  if (!rgb1 || !rgb2) return 1;
  
  const luminance1 = (0.299 * rgb1.r + 0.587 * rgb1.g + 0.114 * rgb1.b) / 255;
  const luminance2 = (0.299 * rgb2.r + 0.587 * rgb2.g + 0.114 * rgb2.b) / 255;
  
  const brightest = Math.max(luminance1, luminance2);
  const darkest = Math.min(luminance1, luminance2);
  
  return (brightest + 0.05) / (darkest + 0.05);
}; 