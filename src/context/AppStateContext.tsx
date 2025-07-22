import React, { createContext, useContext, useReducer, ReactNode, useEffect } from 'react';
import { AppState, Action, Libro, ScanHistory, Statistics } from '../types';
import { getInitialTheme, persistThemePreference } from '../utils/themeConfig';

const STORAGE_KEY = 'guardianComprasState_v7_0';

const initialState: AppState = {
  config: {
    puntosPorLibro: 250,
    puntosPorPagina: 1,
    puntosPorSaga: 500,
    objetivo: 1000,
    flashlightEnabled: false,
    zoomLevel: 1,
    autoSaveEnabled: true,
    autoSaveInterval: 30000,
    searchHistoryEnabled: true,
    scanHistoryEnabled: true,
    statisticsEnabled: true,
    exportFormat: 'json'
  },
  progreso: 0,
  compraDesbloqueada: false,
  librosActuales: [],
  tbr: [],
  historial: [],
  wishlist: [],
  sagas: [],
  sagaNotifications: [],
  darkMode: getInitialTheme(),
  scanHistory: [],
  searchHistory: [],
  performanceMetrics: {
    lastRenderTime: 0,
    averageRenderTime: 0
  }
};

function loadStateFromStorage(): AppState | null {
  try {
    const savedState = localStorage.getItem(STORAGE_KEY);
    if (savedState) {
      const parsedState = JSON.parse(savedState);
      // Asegurar que todas las propiedades del estado inicial estén presentes
      const completeState = {
        ...initialState,
        ...parsedState,
        // Asegurar que las propiedades que podrían no existir en versiones anteriores estén presentes
        sagaNotifications: parsedState.sagaNotifications || [],
        darkMode: parsedState.darkMode || false,
        sagas: parsedState.sagas || [],
        scanHistory: parsedState.scanHistory || [],
        searchHistory: parsedState.searchHistory || [],
        performanceMetrics: parsedState.performanceMetrics || { lastRenderTime: 0, averageRenderTime: 0 }
      };
      // Verificar y corregir el estado de compraDesbloqueada
      if (completeState.progreso >= completeState.config.objetivo) {
        completeState.compraDesbloqueada = true;
      }
      return completeState;
    }
    return null;
  } catch (error) {
    console.error('Error loading state from localStorage:', error);
    return null;
  }
}

function actualizarContadoresSagas(state: AppState): AppState {
  const todosLosLibros = [
    ...state.tbr,
    ...state.historial,
    ...state.librosActuales
  ];

  const sagasActualizadas = state.sagas.map(saga => {
    const librosDeLaSaga = todosLosLibros.filter(libro => libro.sagaId === saga.id);
    const librosLeidosDeLaSaga = state.historial.filter(libro => libro.sagaId === saga.id);
    
    // Una saga está completa si:
    // 1. Tiene al menos un libro
    // 2. Todos los libros de la saga están en el historial (leídos)
    // 3. No hay libros de la saga en TBR o actual
    const librosEnTbrOActual = [
      ...state.tbr,
      ...state.librosActuales
    ].filter(libro => libro.sagaId === saga.id);
    
    const isComplete = librosDeLaSaga.length > 0 && 
                      librosLeidosDeLaSaga.length === librosDeLaSaga.length &&
                      librosEnTbrOActual.length === 0;
    
    return {
      ...saga,
      count: librosDeLaSaga.length,
      isComplete: isComplete
    };
  });

  return { ...state, sagas: sagasActualizadas };
}

// Función de utilidad para verificar si una saga está completa
function verificarSagaCompleta(sagaId: number, state: AppState): boolean {
  const todosLosLibros = [
    ...state.tbr,
    ...state.historial,
    ...state.librosActuales
  ];
  
  const librosDeLaSaga = todosLosLibros.filter(libro => libro.sagaId === sagaId);
  const librosLeidosDeLaSaga = state.historial.filter(libro => libro.sagaId === sagaId);
  const librosEnTbrOActual = [
    ...state.tbr,
    ...state.librosActuales
  ].filter(libro => libro.sagaId === sagaId);
  
  return librosDeLaSaga.length > 0 && 
         librosLeidosDeLaSaga.length === librosDeLaSaga.length &&
         librosEnTbrOActual.length === 0;
}

function limpiarSagasHuerfanas(state: AppState): AppState {
  const todosLosLibros = [
    ...state.tbr,
    ...state.historial,
    ...(state.libroActual ? [state.libroActual] : [])
  ];
  
  const idsDeSagasEnUso = new Set(
    todosLosLibros.map(l => l.sagaId).filter(id => id !== undefined)
  );
  
  const sagasFiltradas = state.sagas.filter(saga => idsDeSagasEnUso.has(saga.id));
  
  return { ...state, sagas: sagasFiltradas };
}

function verificarEstadoCompra(state: AppState): AppState {
  // Verificar que compraDesbloqueada sea consistente con el progreso
  const deberiaEstarDesbloqueada = state.progreso >= state.config.objetivo;
  if (state.compraDesbloqueada !== deberiaEstarDesbloqueada) {
    return { ...state, compraDesbloqueada: deberiaEstarDesbloqueada };
  }
  return state;
}

function appReducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'SET_CONFIG':
      return verificarEstadoCompra({ ...state, config: action.payload });

    case 'SET_CAMERA_PREFERENCE':
      return { ...state, config: { ...state.config, cameraPreference: action.payload } };

    case 'RESET_PROGRESS':
      return { ...state, progreso: 0, compraDesbloqueada: false };

    case 'TOGGLE_DARK_MODE': {
      const newDarkMode = !state.darkMode;
      // Persistir la preferencia del usuario
      persistThemePreference(newDarkMode);
      return { ...state, darkMode: newDarkMode };
    }

    case 'SET_DARK_MODE': {
      const newDarkMode = action.payload;
      // Persistir la preferencia del usuario
      persistThemePreference(newDarkMode);
      return { ...state, darkMode: newDarkMode };
    }

    case 'ADD_TO_TBR': {
      const nuevoLibro = action.payload;
      let nuevoEstado = { ...state, tbr: [...state.tbr, nuevoLibro] };
      
      // Si el libro tiene nombre de saga, buscar si ya existe una saga con ese nombre
      if (nuevoLibro.sagaName) {
        let sagaExistente = state.sagas.find(s => s.name === nuevoLibro.sagaName);
        
        if (sagaExistente) {
          // Si existe una saga con ese nombre, asignar su ID
          nuevoLibro.sagaId = sagaExistente.id;
          nuevoEstado.tbr = nuevoEstado.tbr.map(libro => 
            libro.id === nuevoLibro.id ? { ...libro, sagaId: sagaExistente!.id } : libro
          );
        } else {
          // Si no existe, crear nueva saga
          const nuevaSaga = {
            id: Date.now(),
            name: nuevoLibro.sagaName,
            count: 1,
            isComplete: false
          };
          nuevoEstado = {
            ...nuevoEstado,
            sagas: [...nuevoEstado.sagas, nuevaSaga]
          };
          
          // Asignar el ID de la saga al libro (será el primer libro de la saga)
          nuevoLibro.sagaId = nuevaSaga.id;
          nuevoEstado.tbr = nuevoEstado.tbr.map(libro => 
            libro.id === nuevoLibro.id ? { ...libro, sagaId: nuevaSaga.id } : libro
          );
        }
      }
      
      return actualizarContadoresSagas(nuevoEstado);
    }

    case 'START_BOOK': {
      const libroIndex = state.tbr.findIndex(l => l.id === action.payload);
      if (libroIndex === -1) return state;
      
      const libro = state.tbr[libroIndex];
      const nuevaTbr = state.tbr.filter((_, index) => index !== libroIndex);
      
      return { ...state, librosActuales: [...state.librosActuales, libro], tbr: nuevaTbr };
    }

    case 'FINISH_BOOK': {
      const libroIndex = state.librosActuales.findIndex(l => l.id === action.payload);
      if (libroIndex === -1) return state;
      
      const libroTerminado = state.librosActuales[libroIndex];
      const sagaPreviaCompleta = libroTerminado.sagaId 
        ? verificarSagaCompleta(libroTerminado.sagaId, state)
        : false;
      
      let puntosGanados = state.config.puntosPorLibro + 
        (libroTerminado.paginas || 0) * state.config.puntosPorPagina;
      
      const nuevoEstado = {
        ...state,
        librosActuales: state.librosActuales.filter((_, index) => index !== libroIndex),
        historial: [libroTerminado, ...state.historial],
        progreso: state.progreso + puntosGanados
      };
      
      const estadoConSagas = actualizarContadoresSagas(nuevoEstado);
      const sagaInfo = libroTerminado.sagaId 
        ? estadoConSagas.sagas.find(s => s.id === libroTerminado.sagaId)
        : null;
      
      // Verificar si la saga se completó con este libro
      const sagaAhoraCompleta = libroTerminado.sagaId 
        ? verificarSagaCompleta(libroTerminado.sagaId, estadoConSagas)
        : false;
      
      if (sagaAhoraCompleta && !sagaPreviaCompleta) {
        estadoConSagas.progreso += state.config.puntosPorSaga;
        
        // Agregar notificación de saga completada
        const sagaInfo = estadoConSagas.sagas.find(s => s.id === libroTerminado.sagaId);
        if (sagaInfo) {
          estadoConSagas.sagaNotifications.push({
            id: Date.now(),
            sagaName: sagaInfo.name,
            timestamp: Date.now()
          });
        }
      }
      
      estadoConSagas.compraDesbloqueada = estadoConSagas.progreso >= estadoConSagas.config.objetivo;
      
      return estadoConSagas;
    }

    case 'ABANDON_BOOK': {
      const libroIndex = state.librosActuales.findIndex(l => l.id === action.payload);
      if (libroIndex === -1) return state;
      
      const libroAbandonado = state.librosActuales[libroIndex];
      
      return {
        ...state,
        librosActuales: state.librosActuales.filter((_, index) => index !== libroIndex),
        tbr: [libroAbandonado, ...state.tbr]
      };
    }

    case 'ADD_TO_WISHLIST': {
      // Permitir añadir libros aunque tengas 0 puntos
      const nuevoLibro: Libro = {
        id: Date.now(),
        titulo: action.payload.titulo,
        autor: action.payload.autor
      };
      
      return {
        ...state,
        wishlist: [...state.wishlist, nuevoLibro]
      };
    }

    case 'PURCHASE_WISHLIST_BOOK': {
      const libroIndex = state.wishlist.findIndex(l => l.id === action.payload.id);
      if (libroIndex === -1) return state;
      
      const libro = { ...state.wishlist[libroIndex], paginas: action.payload.pages };
      const nuevaWishlist = state.wishlist.filter((_, index) => index !== libroIndex);
      
      const nuevoProgreso = Math.max(0, state.progreso - state.config.objetivo);
      const nuevaCompraDesbloqueada = nuevoProgreso >= state.config.objetivo;
      
      const nuevoEstado = {
        ...state,
        wishlist: nuevaWishlist,
        tbr: [...state.tbr, libro],
        progreso: nuevoProgreso,
        compraDesbloqueada: nuevaCompraDesbloqueada
      };
      
      return actualizarContadoresSagas(nuevoEstado);
    }

    case 'DELETE_BOOK': {
      const { id, listType } = action.payload;
      
      if (listType === 'wishlist') {
        const libroEnWishlist = state.wishlist.find(l => l.id === id);
        if (libroEnWishlist) {
          const nuevaCompraDesbloqueada = state.progreso >= state.config.objetivo;
          
          return {
            ...state,
            wishlist: state.wishlist.filter(l => l.id !== id),
            compraDesbloqueada: nuevaCompraDesbloqueada
          };
        }
      }
      
      if (listType === 'actual') {
        return { ...state, libroActual: null };
      }
      
      const nuevaLista = state[listType].filter(l => l.id !== id);
      const nuevoEstado = { ...state, [listType]: nuevaLista };
      
      return limpiarSagasHuerfanas(nuevoEstado);
    }

    case 'MOVE_BACK_FROM_HISTORY': {
      const libroIndex = state.historial.findIndex(l => l.id === action.payload);
      if (libroIndex === -1) return state;
      
      const libro = state.historial[libroIndex];
      const sagaPreviaCompleta = libro.sagaId 
        ? verificarSagaCompleta(libro.sagaId, state)
        : false;
      
      let puntosARestar = state.config.puntosPorLibro + 
        (libro.paginas || 0) * state.config.puntosPorPagina;
      
      const nuevoEstado = {
        ...state,
        historial: state.historial.filter((_, index) => index !== libroIndex),
        tbr: [libro, ...state.tbr]
      };
      
      const estadoConSagas = actualizarContadoresSagas(nuevoEstado);
      
      // Verificar si la saga ya no está completa después de mover el libro
      const sagaAhoraCompleta = libro.sagaId 
        ? verificarSagaCompleta(libro.sagaId, estadoConSagas)
        : false;
      
      if (sagaPreviaCompleta && !sagaAhoraCompleta) {
        puntosARestar += state.config.puntosPorSaga;
      }
      
      estadoConSagas.progreso = Math.max(0, estadoConSagas.progreso - puntosARestar);
      estadoConSagas.compraDesbloqueada = estadoConSagas.progreso >= estadoConSagas.config.objetivo;
      
      return estadoConSagas;
    }

    case 'ADD_SAGA': {
      const nuevaSaga = {
        id: Date.now(),
        name: action.payload.name,
        count: 0,
        isComplete: false
      };
      
      return {
        ...state,
        sagas: [...state.sagas, nuevaSaga]
      };
    }

    case 'FIX_SAGA_DATA': {
      // Corregir datos de sagas existentes
      const todosLosLibros = [
        ...state.tbr,
        ...state.historial,
        ...state.librosActuales
      ];

      // Crear un mapa de nombres de saga a IDs
      const sagaNameToId = new Map<string, number>();
      
      // Primero, usar las sagas existentes
      state.sagas.forEach(saga => {
        sagaNameToId.set(saga.name, saga.id);
      });

      // Luego, procesar libros que tienen sagaId manual pero no están en el mapa
      todosLosLibros.forEach(libro => {
        if (libro.sagaId && libro.sagaName && !sagaNameToId.has(libro.sagaName)) {
          // Si el libro tiene un ID de saga manual, usarlo para crear la saga
          sagaNameToId.set(libro.sagaName, libro.sagaId);
        }
      });

      // Crear nuevas sagas para nombres que no existen
      const nuevasSagas: typeof state.sagas = [];
      todosLosLibros.forEach(libro => {
        if (libro.sagaName && !sagaNameToId.has(libro.sagaName)) {
          const nuevaSaga = {
            id: Date.now() + Math.random(), // Asegurar ID único
            name: libro.sagaName,
            count: 0,
            isComplete: false
          };
          nuevasSagas.push(nuevaSaga);
          sagaNameToId.set(libro.sagaName, nuevaSaga.id);
        }
      });

      // Actualizar los libros con los IDs correctos
      const tbrActualizada = state.tbr.map(libro => {
        if (libro.sagaName && sagaNameToId.has(libro.sagaName)) {
          return { ...libro, sagaId: sagaNameToId.get(libro.sagaName) };
        }
        return libro;
      });

      const historialActualizado = state.historial.map(libro => {
        if (libro.sagaName && sagaNameToId.has(libro.sagaName)) {
          return { ...libro, sagaId: sagaNameToId.get(libro.sagaName) };
        }
        return libro;
      });

      const librosActualesActualizados = state.librosActuales.map(libro => {
        if (libro.sagaName && sagaNameToId.has(libro.sagaName)) {
          return { ...libro, sagaId: sagaNameToId.get(libro.sagaName) };
        }
        return libro;
      });

              const nuevoEstado = {
          ...state,
          tbr: tbrActualizada,
          historial: historialActualizado,
          librosActuales: librosActualesActualizados,
          sagas: [...state.sagas, ...nuevasSagas]
        };

      return actualizarContadoresSagas(nuevoEstado);
    }

    case 'ADD_SAGA_NOTIFICATION': {
      const nuevaNotificacion = {
        id: Date.now(),
        sagaName: action.payload.sagaName,
        timestamp: Date.now()
      };
      
      return {
        ...state,
        sagaNotifications: [...state.sagaNotifications, nuevaNotificacion]
      };
    }

    case 'REMOVE_SAGA_NOTIFICATION': {
      return {
        ...state,
        sagaNotifications: state.sagaNotifications.filter(n => n.id !== action.payload.id)
      };
    }

    case 'ADD_SCAN_HISTORY': {
      if (!state.config.scanHistoryEnabled) return state;
      
      const newScanHistory: ScanHistory = {
        ...action.payload,
        id: Date.now(),
        timestamp: Date.now()
      };
      
      return {
        ...state,
        scanHistory: [newScanHistory, ...state.scanHistory.slice(0, 99)] // Keep last 100 scans
      };
    }

    case 'CLEAR_SCAN_HISTORY': {
      return {
        ...state,
        scanHistory: []
      };
    }

    case 'ADD_SEARCH_HISTORY': {
      if (!state.config.searchHistoryEnabled) return state;
      
      const searchTerm = action.payload.trim();
      if (!searchTerm) return state;
      
      const filteredHistory = state.searchHistory.filter(term => term !== searchTerm);
      return {
        ...state,
        searchHistory: [searchTerm, ...filteredHistory.slice(0, 19)] // Keep last 20 searches
      };
    }

    case 'CLEAR_SEARCH_HISTORY': {
      return {
        ...state,
        searchHistory: []
      };
    }

    case 'UPDATE_BOOK': {
      const { id, updates, listType } = action.payload;
      
      if (listType === 'actual') {
        const libroIndex = state.librosActuales.findIndex(l => l.id === id);
        if (libroIndex === -1) return state;
        
        const libroActualizado = { ...state.librosActuales[libroIndex], ...updates };
        const librosActualesActualizados = state.librosActuales.map((libro, index) => 
          index === libroIndex ? libroActualizado : libro
        );
        
        return {
          ...state,
          librosActuales: librosActualesActualizados
        };
      }
      
      const list = state[listType as 'tbr' | 'historial' | 'wishlist'];
      const updatedList = list.map(book => 
        book.id === id ? { ...book, ...updates } : book
      );
      
      return {
        ...state,
        [listType]: updatedList
      };
    }

    case 'UPDATE_SAGA': {
      const { id, updates } = action.payload;
      const updatedSagas = state.sagas.map(saga => 
        saga.id === id ? { ...saga, ...updates } : saga
      );
      
      return {
        ...state,
        sagas: updatedSagas
      };
    }

    case 'IMPORT_DATA': {
      const { libros, sagas, config, progreso, compraDesbloqueada, scanHistory, searchHistory, lastBackup, performanceMetrics } = action.payload;
      
      let newState = { ...state };
      
      if (libros) {
        if (libros.tbr) newState.tbr = libros.tbr;
        if (libros.historial) newState.historial = libros.historial;
        if (libros.wishlist) newState.wishlist = libros.wishlist;
        if (libros.actual) newState.librosActuales = Array.isArray(libros.actual) ? libros.actual : [libros.actual];
      }
      
      if (sagas) {
        newState.sagas = sagas;
      }
      
      if (config) {
        newState.config = { ...newState.config, ...config };
      }
      
      if (progreso !== undefined) {
        newState.progreso = progreso;
      }
      
      if (compraDesbloqueada !== undefined) {
        newState.compraDesbloqueada = compraDesbloqueada;
      }
      
      if (scanHistory) {
        newState.scanHistory = scanHistory;
      }
      
      if (searchHistory) {
        newState.searchHistory = searchHistory;
      }
      
      if (lastBackup) {
        newState.lastBackup = lastBackup;
      }
      
      if (performanceMetrics) {
        newState.performanceMetrics = performanceMetrics;
      }
      
      // Update saga counters after import
      return actualizarContadoresSagas(newState);
    }

    case 'EXPORT_DATA': {
      // This action doesn't modify state, it's handled by the component
      return state;
    }

    case 'SET_PERFORMANCE_METRICS': {
      const { lastRenderTime, averageRenderTime, memoryUsage } = action.payload;
      const currentAvg = state.performanceMetrics?.averageRenderTime || 0;
      const newAvg = currentAvg === 0 ? lastRenderTime : (currentAvg + lastRenderTime) / 2;
      
      return {
        ...state,
        performanceMetrics: {
          lastRenderTime,
          averageRenderTime: newAvg,
          memoryUsage
        }
      };
    }

    case 'SET_LAST_BACKUP': {
      return {
        ...state,
        lastBackup: action.payload
      };
    }

    default:
      return state;
  }
}

interface AppStateContextType {
  state: AppState;
  dispatch: React.Dispatch<Action>;
}

const AppStateContext = createContext<AppStateContextType | undefined>(undefined);

export { AppStateContext };

export const useAppState = () => {
  const context = useContext(AppStateContext);
  if (context === undefined) {
    throw new Error('useAppState must be used within an AppStateProvider');
  }
  return context;
};

interface AppStateProviderProps {
  children: ReactNode;
  initialState?: AppState;
}

export const AppStateProvider: React.FC<AppStateProviderProps> = ({ 
  children, 
  initialState: customInitialState 
}) => {
  // Cargar estado inicial desde localStorage
  const savedState = loadStateFromStorage();
  const initialAppState = verificarEstadoCompra(savedState || customInitialState || initialState);
  
  const [state, dispatch] = useReducer(appReducer, initialAppState);

  // Sincronizar con localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  return (
    <AppStateContext.Provider value={{ state, dispatch }}>
      {children}
    </AppStateContext.Provider>
  );
}; 