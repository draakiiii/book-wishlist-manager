# Sistema de Temas - Guardián de Compras

## Descripción

El sistema de temas implementado en Guardián de Compras permite a los usuarios alternar entre modo claro y modo oscuro, con sincronización automática con las preferencias del sistema operativo.

## Características

### ✅ Funcionalidades Implementadas

1. **Toggle de Modo Oscuro/Claro**
   - Botón con iconos animados (Sol/Luna)
   - Transiciones suaves entre temas
   - Persistencia de preferencias en localStorage

2. **Sincronización con Sistema**
   - Detecta automáticamente la preferencia del sistema
   - Se adapta a cambios en tiempo real
   - Respeta las preferencias manuales del usuario

3. **Accesibilidad**
   - Etiquetas ARIA apropiadas
   - Navegación por teclado
   - Tooltips informativos

4. **Optimización Móvil**
   - Meta theme-color dinámico
   - Transiciones optimizadas para touch
   - Tamaños de botón apropiados

## Arquitectura

### Archivos Principales

```
src/
├── components/
│   └── ThemeToggle.tsx          # Componente del botón toggle
├── hooks/
│   └── useTheme.ts              # Hook personalizado para el tema
├── utils/
│   └── themeConfig.ts           # Configuración centralizada
├── context/
│   └── AppStateContext.tsx      # Contexto con sincronización
└── styles/
    ├── index.css                # Variables CSS y transiciones
    └── App.css                  # Estilos específicos del tema
```

### Flujo de Datos

1. **Inicialización**: `getInitialTheme()` detecta preferencias
2. **Estado Local**: `useTheme` hook maneja el estado
3. **Sincronización**: Contexto AppState se actualiza automáticamente
4. **DOM**: `applyThemeToDOM()` aplica cambios visuales
5. **Persistencia**: `persistThemePreference()` guarda preferencias

## Uso

### Componente ThemeToggle

```tsx
import ThemeToggle from './components/ThemeToggle';

// Uso básico
<ThemeToggle />

// Con clases personalizadas
<ThemeToggle className="custom-class" />
```

### Hook useTheme

```tsx
import { useTheme } from './hooks/useTheme';

const { isDark, toggleTheme, setTheme } = useTheme();

// Cambiar tema
toggleTheme();

// Establecer tema específico
setTheme(true); // modo oscuro
setTheme(false); // modo claro
```

## Configuración

### Variables CSS

El sistema utiliza variables CSS para colores:

```css
:root {
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  /* ... más variables */
}

.dark {
  --background: 222.2 84% 4.9%;
  --foreground: 210 40% 98%;
  /* ... variables para modo oscuro */
}
```

### Configuración del Tema

```typescript
export const THEME_CONFIG = {
  STORAGE_KEY: 'guardianComprasDarkMode',
  LIGHT_THEME_COLOR: '#ffffff',
  DARK_THEME_COLOR: '#1e293b',
  DARK_CLASS: 'dark',
  TRANSITION_DURATION: 300,
  TRANSITION_EASING: 'cubic-bezier(0.4, 0, 0.2, 1)',
};
```

## Mejoras Implementadas

### 1. Persistencia Robusta
- Guardado en localStorage
- Sincronización con contexto de la app
- Manejo de errores de localStorage

### 2. Transiciones Suaves
- Animaciones CSS optimizadas
- Transiciones en todos los elementos
- Efectos hover mejorados

### 3. Accesibilidad Mejorada
- Etiquetas ARIA completas
- Navegación por teclado
- Contraste apropiado

### 4. Optimización de Rendimiento
- Lazy loading de preferencias
- Event listeners optimizados
- Cleanup automático

## Compatibilidad

- ✅ Chrome/Chromium
- ✅ Firefox
- ✅ Safari
- ✅ Edge
- ✅ Móviles (iOS/Android)

## Troubleshooting

### El tema no persiste
- Verificar que localStorage esté habilitado
- Comprobar permisos del navegador

### No se sincroniza con el sistema
- Verificar soporte de `prefers-color-scheme`
- Comprobar que no haya preferencias manuales guardadas

### Transiciones no funcionan
- Verificar que CSS esté cargado correctamente
- Comprobar que no haya conflictos con otros estilos

## Próximas Mejoras

- [ ] Soporte para temas personalizados
- [ ] Animaciones más avanzadas
- [ ] Integración con sistema de notificaciones
- [ ] Modo automático por horario 