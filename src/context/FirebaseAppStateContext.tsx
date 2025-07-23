import React, { createContext, useContext, useReducer, ReactNode, useEffect, useState } from 'react';
import { AppState, Action, Libro, ScanHistory, Statistics, Saga, EstadoLibro, Lectura } from '../types';
import { getInitialTheme, persistThemePreference } from '../utils/themeConfig';
import { getFirebaseSyncService } from '../services/firebaseSync';
import { useAuth } from './AuthContext';

const STORAGE_KEY = 'bibliotecaLibrosState_v1_0';

const initialState: AppState = {
  config: {
    autoSaveEnabled: true,
    autoSaveInterval: 30000,
    searchHistoryEnabled: true,
    scanHistoryEnabled: true,
    statisticsEnabled: true,
    exportFormat: 'json',
    objetivoLecturaAnual: 12,
    objetivoPaginasAnual: 4000,
    recordatorioLectura: true,
    recordatorioInterval: 86400000, // 24 horas
    notificacionesSaga: true,
    notificacionesObjetivo: true,
    notificacionesPrestamo: true,
    flashlightEnabled: false,
    zoomLevel: 1,
    datosAnonimos: false,
    compartirEstadisticas: false,
    // Configuración del sistema de puntos
    sistemaPuntosHabilitado: true,
    puntosPorLibro: 10,
    puntosPorSaga: 50,
    puntosPorPagina: 1,
    puntosParaComprar: 25
  },
  libros: [],
  sagas: [],
  sagaNotifications: [],
  darkMode: getInitialTheme(),
  scanHistory: [],
  searchHistory: [],
  // Sistema de puntos
  puntosActuales: 0,
  puntosGanados: 0,
  librosCompradosConPuntos: 0,
};

// Load state from localStorage (for migration purposes)
function loadStateFromStorage(): AppState | null {
  try {
    const savedState = localStorage.getItem(STORAGE_KEY);
    if (savedState) {
      const parsedState = JSON.parse(savedState);
      
      // Migrar desde versión anterior si es necesario
      if (parsedState.progreso !== undefined) {
        return migrateFromOldVersion(parsedState);
      }
      
      // Asegurar que todas las propiedades del estado inicial estén presentes
      const completeState = {
        ...initialState,
        ...parsedState,
        sagaNotifications: parsedState.sagaNotifications || [],
        darkMode: parsedState.darkMode || false,
        sagas: parsedState.sagas || [],
        scanHistory: parsedState.scanHistory || [],
        searchHistory: parsedState.searchHistory || [],
        // Sistema de puntos
        puntosActuales: parsedState.puntosActuales || 0,
        puntosGanados: parsedState.puntosGanados || 0,
        librosCompradosConPuntos: parsedState.librosCompradosConPuntos || 0,
      };
      
      return completeState;
    }
    return null;
  } catch (error) {
    console.error('Error loading state from localStorage:', error);
    return null;
  }
}

function migrateFromOldVersion(oldState: any): AppState {
  const libros: Libro[] = [];
  
  // Migrar libros de TBR
  if (oldState.tbr) {
    oldState.tbr.forEach((libro: any) => {
      libros.push({
        ...libro,
        estado: 'tbr',
        historialEstados: [{
          estado: 'tbr',
          fecha: libro.fechaAgregado || Date.now()
        }]
      });
    });
  }
  
  // Migrar libros actuales
  if (oldState.librosActuales) {
    oldState.librosActuales.forEach((libro: any) => {
      libros.push({
        ...libro,
        estado: 'leyendo',
        historialEstados: [{
          estado: 'leyendo',
          fecha: libro.fechaInicio || Date.now()
        }]
      });
    });
  }
  
  // Migrar libros leídos
  if (oldState.historial) {
    oldState.historial.forEach((libro: any) => {
      libros.push({
        ...libro,
        estado: 'leido',
        historialEstados: [{
          estado: 'leido',
          fecha: libro.fechaFin || Date.now()
        }]
      });
    });
  }
  
  // Migrar wishlist
  if (oldState.wishlist) {
    oldState.wishlist.forEach((libro: any) => {
      libros.push({
        ...libro,
        estado: 'wishlist',
        historialEstados: [{
          estado: 'wishlist',
          fecha: libro.fechaAgregado || Date.now()
        }]
      });
    });
  }
  
  return {
    ...initialState,
    libros,
    sagas: oldState.sagas || [],
    darkMode: oldState.darkMode || false,
    scanHistory: oldState.scanHistory || [],
    searchHistory: oldState.searchHistory || [],
    config: {
      ...initialState.config,
      ...oldState.config
    },
    puntosActuales: oldState.puntosActuales || 0,
    puntosGanados: oldState.puntosGanados || 0,
    librosCompradosConPuntos: oldState.librosCompradosConPuntos || 0,
  };
}

// Helper functions (same as original)
function actualizarContadoresSagas(state: AppState): AppState {
  const sagasActualizadas = state.sagas.map(saga => {
    const librosEnSaga = state.libros.filter(libro => libro.sagaId === saga.id);
    return {
      ...saga,
      count: librosEnSaga.length,
      isComplete: librosEnSaga.every(libro => libro.estado === 'leido')
    };
  });
  
  return {
    ...state,
    sagas: sagasActualizadas
  };
}

function verificarSagaCompleta(sagaId: number, state: AppState): boolean {
  const saga = state.sagas.find(s => s.id === sagaId);
  if (!saga) return false;
  
  const librosEnSaga = state.libros.filter(libro => libro.sagaId === sagaId);
  return librosEnSaga.length > 0 && librosEnSaga.every(libro => libro.estado === 'leido');
}

function limpiarSagasHuerfanas(state: AppState): AppState {
  const sagasConLibros = state.sagas.filter(saga => 
    state.libros.some(libro => libro.sagaId === saga.id)
  );
  
  return {
    ...state,
    sagas: sagasConLibros
  };
}

function agregarEstadoAlHistorial(libro: Libro, nuevoEstado: Libro['estado'], notas?: string): Libro {
  const getMensajeEstado = (estado: Libro['estado'], notas?: string): string => {
    const mensajes = {
      'tbr': 'Agregado a la lista de lectura',
      'leyendo': 'Comenzado a leer',
      'leido': 'Marcado como leído',
      'abandonado': 'Marcado como abandonado',
      'wishlist': 'Agregado a la wishlist',
      'comprado': 'Marcado como comprado',
      'prestado': 'Marcado como prestado'
    };
    
    let mensaje = mensajes[estado];
    if (notas) {
      mensaje += ` - ${notas}`;
    }
    
    return mensaje;
  };

  const nuevoHistorial = {
    estado: nuevoEstado,
    fecha: Date.now(),
    notas: getMensajeEstado(nuevoEstado, notas)
  };

  return {
    ...libro,
    estado: nuevoEstado,
    historialEstados: [...libro.historialEstados, nuevoHistorial]
  };
}

// Reducer function (same as original)
function appReducer(state: AppState, action: Action): AppState {
  let newState: AppState;

  switch (action.type) {
    case 'SET_CONFIG':
      newState = {
        ...state,
        config: { ...state.config, ...action.payload }
      };
      break;

    case 'TOGGLE_DARK_MODE':
      newState = {
        ...state,
        darkMode: !state.darkMode
      };
      persistThemePreference(newState.darkMode);
      break;

    case 'SET_DARK_MODE':
      newState = {
        ...state,
        darkMode: action.payload
      };
      persistThemePreference(newState.darkMode);
      break;

    case 'ADD_BOOK':
      newState = {
        ...state,
        libros: [...state.libros, action.payload]
      };
      break;

    case 'UPDATE_BOOK':
      newState = {
        ...state,
        libros: state.libros.map(libro =>
          libro.id === action.payload.id
            ? { ...libro, ...action.payload.updates }
            : libro
        )
      };
      break;

    case 'DELETE_BOOK':
      newState = {
        ...state,
        libros: state.libros.filter(libro => libro.id !== action.payload)
      };
      break;

    case 'CHANGE_BOOK_STATE':
      newState = {
        ...state,
        libros: state.libros.map(libro =>
          libro.id === action.payload.id
            ? agregarEstadoAlHistorial(libro, action.payload.newState, action.payload.notas)
            : libro
        )
      };
      break;

    case 'ADD_SAGA':
      const newSaga: Saga = {
        id: Date.now(),
        name: action.payload.name,
        count: 0,
        isComplete: false,
        descripcion: action.payload.descripcion,
        genero: action.payload.genero,
        autor: action.payload.autor,
        libros: [],
        fechaCreacion: Date.now()
      };
      newState = {
        ...state,
        sagas: [...state.sagas, newSaga]
      };
      break;

    case 'UPDATE_SAGA':
      newState = {
        ...state,
        sagas: state.sagas.map(saga =>
          saga.id === action.payload.id
            ? { ...saga, ...action.payload.updates }
            : saga
        )
      };
      break;

    case 'DELETE_SAGA':
      newState = {
        ...state,
        sagas: state.sagas.filter(saga => saga.id !== action.payload),
        libros: state.libros.map(libro =>
          libro.sagaId === action.payload
            ? { ...libro, sagaId: undefined, sagaName: undefined }
            : libro
        )
      };
      break;

    case 'ADD_BOOK_TO_SAGA':
      newState = {
        ...state,
        libros: state.libros.map(libro =>
          libro.id === action.payload.libroId
            ? { ...libro, sagaId: action.payload.sagaId }
            : libro
        )
      };
      newState = actualizarContadoresSagas(newState);
      break;

    case 'REMOVE_BOOK_FROM_SAGA':
      newState = {
        ...state,
        libros: state.libros.map(libro =>
          libro.id === action.payload.libroId
            ? { ...libro, sagaId: undefined, sagaName: undefined }
            : libro
        )
      };
      newState = actualizarContadoresSagas(newState);
      break;

    case 'ADD_SCAN_HISTORY':
      newState = {
        ...state,
        scanHistory: [action.payload, ...state.scanHistory]
      };
      break;

    case 'CLEAR_SCAN_HISTORY':
      newState = {
        ...state,
        scanHistory: []
      };
      break;

    case 'ADD_SEARCH_HISTORY':
      newState = {
        ...state,
        searchHistory: [action.payload, ...state.searchHistory.filter(h => h !== action.payload)].slice(0, 10)
      };
      break;

    case 'CLEAR_SEARCH_HISTORY':
      newState = {
        ...state,
        searchHistory: []
      };
      break;

    case 'IMPORT_DATA':
      newState = {
        ...state,
        libros: action.payload.libros || state.libros,
        sagas: action.payload.sagas || state.sagas,
        config: action.payload.config ? { ...state.config, ...action.payload.config } : state.config,
        scanHistory: action.payload.scanHistory || state.scanHistory,
        searchHistory: action.payload.searchHistory || state.searchHistory,
        puntosActuales: action.payload.puntosActuales ?? state.puntosActuales,
        puntosGanados: action.payload.puntosGanados ?? state.puntosGanados,
        librosCompradosConPuntos: action.payload.librosCompradosConPuntos ?? state.librosCompradosConPuntos
      };
      break;

    case 'GANAR_PUNTOS':
      newState = {
        ...state,
        puntosActuales: state.puntosActuales + action.payload.cantidad,
        puntosGanados: state.puntosGanados + action.payload.cantidad
      };
      break;

    case 'GASTAR_PUNTOS':
      newState = {
        ...state,
        puntosActuales: Math.max(0, state.puntosActuales - action.payload.cantidad)
      };
      break;

    case 'COMPRAR_LIBRO_CON_PUNTOS':
      newState = {
        ...state,
        puntosActuales: Math.max(0, state.puntosActuales - (state.config.puntosParaComprar || 25)),
        librosCompradosConPuntos: state.librosCompradosConPuntos + 1
      };
      break;

    case 'RESETEAR_PUNTOS':
      newState = {
        ...state,
        puntosActuales: 0,
        puntosGanados: 0,
        librosCompradosConPuntos: 0
      };
      break;

    default:
      return state;
  }

  // Update saga counters after any book-related action
  if (['ADD_BOOK', 'UPDATE_BOOK', 'DELETE_BOOK', 'CHANGE_BOOK_STATE', 'ADD_BOOK_TO_SAGA', 'REMOVE_BOOK_FROM_SAGA'].includes(action.type)) {
    newState = actualizarContadoresSagas(newState);
  }

  // Clean up orphaned sagas
  newState = limpiarSagasHuerfanas(newState);

  return newState;
}

interface AppStateContextType {
  state: AppState;
  dispatch: React.Dispatch<Action>;
  loading: boolean;
  syncStatus: 'idle' | 'syncing' | 'error';
  lastSync: Date | null;
}

const AppStateContext = createContext<AppStateContextType | undefined>(undefined);

export const useAppState = () => {
  const context = useContext(AppStateContext);
  if (context === undefined) {
    throw new Error('useAppState must be used within an AppStateProvider');
  }
  return context;
};

interface AppStateProviderProps {
  children: ReactNode;
  userId?: string;
}

export const FirebaseAppStateProvider: React.FC<AppStateProviderProps> = ({ 
  children, 
  userId 
}) => {
  const [state, dispatch] = useReducer(appReducer, initialState);
  const [loading, setLoading] = useState(true);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'error'>('idle');
  const [lastSync, setLastSync] = useState<Date | null>(null);
  const { currentUser } = useAuth();

  // Initialize data when user changes
  useEffect(() => {
    if (!currentUser?.uid) {
      setLoading(false);
      return;
    }

    const initializeData = async () => {
      try {
        setLoading(true);
        const firebaseSync = getFirebaseSyncService(currentUser.uid);
        
        // Check if user has data in Firebase
        const hasFirebaseData = await firebaseSync.hasData();
        
        if (hasFirebaseData) {
          // Load data from Firebase
          const firebaseData = await firebaseSync.loadAllData();
          dispatch({ type: 'IMPORT_DATA', payload: {
            libros: firebaseData.libros || [],
            sagas: firebaseData.sagas || [],
            config: firebaseData.config,
            scanHistory: firebaseData.scanHistory || [],
            searchHistory: firebaseData.searchHistory || [],
            puntosActuales: firebaseData.puntosActuales || 0,
            puntosGanados: firebaseData.puntosGanados || 0,
            librosCompradosConPuntos: firebaseData.librosCompradosConPuntos || 0
          }});
          console.log('Data loaded from Firebase');
        } else {
          // Check if there's local data to migrate
          const localData = loadStateFromStorage();
          if (localData && (localData.libros.length > 0 || localData.sagas.length > 0)) {
            // Migrate local data to Firebase
            await firebaseSync.migrateFromLocalStorage(localData);
            dispatch({ type: 'IMPORT_DATA', payload: localData });
            console.log('Data migrated from localStorage to Firebase');
          }
        }
        
        setLastSync(new Date());
      } catch (error) {
        console.error('Error initializing data:', error);
        setSyncStatus('error');
      } finally {
        setLoading(false);
      }
    };

    initializeData();
  }, [currentUser?.uid]);

  // Auto-save to Firebase when state changes
  useEffect(() => {
    if (!currentUser?.uid || loading) return;

    const autoSave = async () => {
      try {
        setSyncStatus('syncing');
        const firebaseSync = getFirebaseSyncService(currentUser.uid);
        await firebaseSync.saveAllData(state);
        setLastSync(new Date());
        setSyncStatus('idle');
      } catch (error) {
        console.error('Error auto-saving to Firebase:', error);
        setSyncStatus('error');
      }
    };

    // Debounce auto-save
    const timeoutId = setTimeout(autoSave, 2000);
    return () => clearTimeout(timeoutId);
  }, [state, currentUser?.uid, loading]);

  const value: AppStateContextType = {
    state,
    dispatch,
    loading,
    syncStatus,
    lastSync
  };

  return (
    <AppStateContext.Provider value={value}>
      {children}
    </AppStateContext.Provider>
  );
};