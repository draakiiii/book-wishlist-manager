import React, { createContext, useContext, useReducer, ReactNode, useEffect } from 'react';
import { AppState, Action, Libro, ScanHistory, Statistics, Saga, EstadoLibro, Lectura } from '../types';
import { getInitialTheme, persistThemePreference } from '../utils/themeConfig';

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
    compartirEstadisticas: false
  },
  libros: [],
  sagas: [],
  sagaNotifications: [],
  darkMode: getInitialTheme(),
  scanHistory: [],
  searchHistory: [],

};

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
        fechaInicio: libro.fechaAgregado || Date.now(),
        historialEstados: [
          {
            estado: 'tbr',
            fecha: libro.fechaAgregado || Date.now()
          },
          {
            estado: 'leyendo',
            fecha: libro.fechaAgregado || Date.now()
          }
        ]
      });
    });
  }
  
  // Migrar historial
  if (oldState.historial) {
    oldState.historial.forEach((libro: any) => {
      libros.push({
        ...libro,
        estado: 'leido',
        fechaInicio: libro.fechaAgregado || Date.now(),
        fechaFin: libro.fechaTerminado || Date.now(),
        historialEstados: [
          {
            estado: 'tbr',
            fecha: libro.fechaAgregado || Date.now()
          },
          {
            estado: 'leyendo',
            fecha: libro.fechaAgregado || Date.now()
          },
          {
            estado: 'leido',
            fecha: libro.fechaTerminado || Date.now()
          }
        ]
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
    
    // Mantener compatibilidad
    progreso: oldState.progreso,
    compraDesbloqueada: oldState.compraDesbloqueada,
    librosActuales: oldState.librosActuales,
    tbr: oldState.tbr,
    historial: oldState.historial,
    wishlist: oldState.wishlist
  };
}

function actualizarContadoresSagas(state: AppState): AppState {
  const sagasActualizadas = state.sagas.map(saga => {
    const librosDeLaSaga = state.libros.filter(libro => libro.sagaId === saga.id);
    const librosLeidosDeLaSaga = librosDeLaSaga.filter(libro => libro.estado === 'leido');
    
    // Una saga está completa si todos los libros están leídos
    const isComplete = librosDeLaSaga.length > 0 && 
                      librosLeidosDeLaSaga.length === librosDeLaSaga.length;
    
    return {
      ...saga,
      count: librosDeLaSaga.length,
      isComplete: isComplete,
      libros: librosDeLaSaga.map(l => l.id)
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
  
  const librosDeLaSaga = state.libros.filter(libro => libro.sagaId === sagaId);
  const librosLeidos = librosDeLaSaga.filter(libro => libro.estado === 'leido');
  
  return librosDeLaSaga.length > 0 && librosLeidos.length === librosDeLaSaga.length;
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
  // Crear mensaje descriptivo según el estado
  const getMensajeEstado = (estado: Libro['estado'], notas?: string): string => {
    switch (estado) {
      case 'tbr':
        return 'Añadido a la pila de lectura';
      case 'leyendo':
        return 'Empezado a leer';
      case 'leido':
        return notas ? `Terminado de leer - ${notas}` : 'Terminado de leer';
      case 'abandonado':
        return notas ? `Abandonado - ${notas}` : 'Abandonado';
      case 'wishlist':
        return 'Añadido a la lista de deseos';
      case 'comprado':
        return notas ? `Comprado por ${notas}€` : 'Comprado';
      case 'prestado':
        return notas ? `Prestado a ${notas}` : 'Prestado';
      default:
        return notas || 'Estado cambiado';
    }
  };

  const nuevoEstadoHistorial: EstadoLibro = {
    estado: nuevoEstado,
    fecha: Date.now(),
    notas: getMensajeEstado(nuevoEstado, notas)
  };
  
  return {
    ...libro,
    estado: nuevoEstado,
    historialEstados: [...libro.historialEstados, nuevoEstadoHistorial]
  };
}

function appReducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'SET_CONFIG':
      return { ...state, config: action.payload };

    case 'SET_CAMERA_PREFERENCE':
      return { ...state, config: { ...state.config, cameraPreference: action.payload } };

    case 'TOGGLE_DARK_MODE': {
      const newDarkMode = !state.darkMode;
      persistThemePreference(newDarkMode);
      return { ...state, darkMode: newDarkMode };
    }

    case 'SET_DARK_MODE': {
      const newDarkMode = action.payload;
      persistThemePreference(newDarkMode);
      return { ...state, darkMode: newDarkMode };
    }

    case 'ADD_BOOK': {
      const nuevoLibro = {
        ...action.payload,
        id: Date.now(),
        fechaAgregado: Date.now(),
        historialEstados: [{
          estado: action.payload.estado,
          fecha: Date.now()
        }],
        lecturas: [] // Inicializar array de lecturas vacío
      };
      
      let nuevoEstado = { 
        ...state, 
        libros: [...state.libros, nuevoLibro] 
      };
      
      // Manejar saga si existe
      if (nuevoLibro.sagaName) {
        const sagaNameNormalized = nuevoLibro.sagaName.trim().toLowerCase();
        let sagaExistente = state.sagas.find(s => 
          s.name.trim().toLowerCase() === sagaNameNormalized
        );
        
        if (sagaExistente) {
          nuevoLibro.sagaId = sagaExistente.id;
          nuevoEstado.libros = nuevoEstado.libros.map(libro => 
            libro.id === nuevoLibro.id ? { ...libro, sagaId: sagaExistente!.id } : libro
          );
        } else {
          const nuevaSaga = {
            id: Date.now(),
            name: nuevoLibro.sagaName.trim(),
            count: 1,
            isComplete: false,
            libros: [nuevoLibro.id]
          };
          nuevoEstado = {
            ...nuevoEstado,
            sagas: [...nuevoEstado.sagas, nuevaSaga]
          };
          nuevoLibro.sagaId = nuevaSaga.id;
          nuevoEstado.libros = nuevoEstado.libros.map(libro => 
            libro.id === nuevoLibro.id ? { ...libro, sagaId: nuevaSaga.id } : libro
          );
        }
      }
      
      return actualizarContadoresSagas(nuevoEstado);
    }

    case 'UPDATE_BOOK': {
      const { id, updates } = action.payload;
      const librosActualizados = state.libros.map(libro => 
        libro.id === id ? { ...libro, ...updates } : libro
      );
      
      return actualizarContadoresSagas({
        ...state,
        libros: librosActualizados
      });
    }

    case 'DELETE_BOOK': {
      const librosFiltrados = state.libros.filter(libro => libro.id !== action.payload);
      return limpiarSagasHuerfanas({
        ...state,
        libros: librosFiltrados
      });
    }

    case 'CHANGE_BOOK_STATE': {
      const { id, newState, notas } = action.payload;
      const librosActualizados = state.libros.map(libro => 
        libro.id === id ? agregarEstadoAlHistorial(libro, newState, notas) : libro
      );
      
      return actualizarContadoresSagas({
        ...state,
        libros: librosActualizados
      });
    }

    case 'START_READING': {
      const { id, fecha = Date.now() } = action.payload;
      const librosActualizados = state.libros.map(libro => {
        if (libro.id === id) {
          return {
            ...agregarEstadoAlHistorial(libro, 'leyendo'),
            fechaInicio: fecha
          };
        }
        return libro;
      });
      
      return actualizarContadoresSagas({
        ...state,
        libros: librosActualizados
      });
    }

    case 'FINISH_READING': {
      const { id, fecha = Date.now(), calificacion, notas } = action.payload;
      const libroIndex = state.libros.findIndex(l => l.id === id);
      if (libroIndex === -1) return state;
      
      const libro = state.libros[libroIndex];
      const sagaPreviaCompleta = libro.sagaId 
        ? verificarSagaCompleta(libro.sagaId, state)
        : false;
      
      // Crear nueva lectura
      const nuevaLectura: Lectura = {
        id: Date.now(),
        fechaInicio: libro.fechaInicio || fecha,
        fechaFin: fecha,
        calificacion,
        reseña: notas,
        paginasLeidas: libro.paginasLeidas || libro.paginas,
        notas
      };
      
      const libroActualizado: Libro = {
        ...agregarEstadoAlHistorial(libro, 'leido', notas),
        fechaFin: fecha,
        calificacion: calificacion || libro.calificacion, // Mantener calificación más reciente
        lecturas: [...(libro.lecturas || []), nuevaLectura]
      };
      
      const librosActualizados = state.libros.map(l => 
        l.id === id ? libroActualizado : l
      );
      
      const estadoConSagas = actualizarContadoresSagas({
        ...state,
        libros: librosActualizados
      });
      
      // Verificar si la saga se completó
      const sagaAhoraCompleta = libro.sagaId 
        ? verificarSagaCompleta(libro.sagaId, estadoConSagas)
        : false;
      
      if (sagaAhoraCompleta && !sagaPreviaCompleta) {
        const sagaInfo = estadoConSagas.sagas.find(s => s.id === libro.sagaId);
        if (sagaInfo) {
          estadoConSagas.sagaNotifications.push({
            id: Date.now(),
            sagaName: sagaInfo.name,
            timestamp: Date.now()
          });
        }
      }
      
      return estadoConSagas;
    }

    case 'ABANDON_BOOK': {
      const { id, fecha = Date.now(), motivo } = action.payload;
      const librosActualizados = state.libros.map(libro => {
        if (libro.id === id) {
          return agregarEstadoAlHistorial(libro, 'abandonado', motivo);
        }
        return libro;
      });
      
      return actualizarContadoresSagas({
        ...state,
        libros: librosActualizados
      });
    }

    case 'BUY_BOOK': {
      const { id, precio, fecha = Date.now() } = action.payload;
      const librosActualizados = state.libros.map(libro => {
        if (libro.id === id) {
          const libroActualizado: Libro = {
            ...agregarEstadoAlHistorial(libro, 'comprado', precio?.toString()),
            precio: precio || libro.precio,
            fechaCompra: fecha
          };
          return libroActualizado;
        }
        return libro;
      });
      
      return actualizarContadoresSagas({
        ...state,
        libros: librosActualizados
      });
    }

    case 'LOAN_BOOK': {
      const { id, prestadoA, fecha = Date.now() } = action.payload;
      const librosActualizados = state.libros.map(libro => {
        if (libro.id === id) {
          const libroActualizado: Libro = {
            ...agregarEstadoAlHistorial(libro, 'prestado', prestadoA),
            prestado: true,
            prestadoA,
            fechaPrestamo: fecha
          };
          return libroActualizado;
        }
        return libro;
      });
      
      return {
        ...state,
        libros: librosActualizados
      };
    }

    case 'RETURN_BOOK': {
      const { id, fecha = Date.now() } = action.payload;
      const librosActualizados = state.libros.map(libro => {
        if (libro.id === id) {
          // Find the previous state before 'prestado'
          const previousState = libro.historialEstados
            .filter(h => h.estado !== 'prestado')
            .sort((a, b) => b.fecha - a.fecha)[0];
          
          const estadoAnterior = previousState?.estado || 'tbr';
          
          return {
            ...agregarEstadoAlHistorial(libro, estadoAnterior, 'Libro devuelto'),
            prestado: false,
            prestadoA: undefined,
            fechaPrestamo: undefined
          };
        }
        return libro;
      });
      
      return {
        ...state,
        libros: librosActualizados
      };
    }

    case 'ADD_SAGA': {
      const nuevaSaga = {
        id: Date.now(),
        name: action.payload.name,
        count: 0,
        isComplete: false,
        libros: [],
        descripcion: action.payload.descripcion,
        genero: action.payload.genero,
        autor: action.payload.autor
      };
      
      return {
        ...state,
        sagas: [...state.sagas, nuevaSaga]
      };
    }

    case 'UPDATE_SAGA': {
      const { id, updates } = action.payload;
      const sagasActualizadas = state.sagas.map(saga => 
        saga.id === id ? { ...saga, ...updates } : saga
      );
      
      return {
        ...state,
        sagas: sagasActualizadas
      };
    }

    case 'DELETE_SAGA': {
      const sagasFiltradas = state.sagas.filter(saga => saga.id !== action.payload);
      const librosActualizados = state.libros.map(libro => 
        libro.sagaId === action.payload ? { ...libro, sagaId: undefined, sagaName: undefined } : libro
      );
      
      return {
        ...state,
        sagas: sagasFiltradas,
        libros: librosActualizados
      };
    }

    case 'ADD_BOOK_TO_SAGA': {
      const { libroId, sagaId } = action.payload;
      const saga = state.sagas.find(s => s.id === sagaId);
      if (!saga) return state;
      
      const librosActualizados = state.libros.map(libro => 
        libro.id === libroId ? { ...libro, sagaId } : libro
      );
      
      const sagasActualizadas = state.sagas.map(s => 
        s.id === sagaId ? { ...s, libros: [...s.libros, libroId] } : s
      );
      
      return actualizarContadoresSagas({
        ...state,
        libros: librosActualizados,
        sagas: sagasActualizadas
      });
    }

    case 'REMOVE_BOOK_FROM_SAGA': {
      const { libroId, sagaId } = action.payload;
      const librosActualizados = state.libros.map(libro => 
        libro.id === libroId ? { ...libro, sagaId: undefined, sagaName: undefined } : libro
      );
      
      const sagasActualizadas = state.sagas.map(s => 
        s.id === sagaId ? { ...s, libros: s.libros.filter(id => id !== libroId) } : s
      );
      
      return actualizarContadoresSagas({
        ...state,
        libros: librosActualizados,
        sagas: sagasActualizadas
      });
    }

    case 'FIX_SAGA_DATA': {
      // Corregir datos de sagas existentes
      const sagaNameToId = new Map<string, number>();
      
      // Usar las sagas existentes
      state.sagas.forEach(saga => {
        sagaNameToId.set(saga.name, saga.id);
      });

      // Procesar libros que tienen sagaName pero no sagaId
      const librosActualizados = state.libros.map(libro => {
        if (libro.sagaName && !libro.sagaId && sagaNameToId.has(libro.sagaName)) {
          return { ...libro, sagaId: sagaNameToId.get(libro.sagaName) };
        }
        return libro;
      });

      return actualizarContadoresSagas({
        ...state,
        libros: librosActualizados
      });
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
        scanHistory: [newScanHistory, ...state.scanHistory.slice(0, 99)]
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
        searchHistory: [searchTerm, ...filteredHistory.slice(0, 19)]
      };
    }

    case 'CLEAR_SEARCH_HISTORY': {
      return {
        ...state,
        searchHistory: []
      };
    }

    case 'IMPORT_DATA': {
      const { libros, sagas, config, scanHistory, searchHistory, lastBackup } = action.payload;
      
      let newState = { ...state };
      
      if (libros) {
        newState.libros = libros;
      }
      
      if (sagas) {
        newState.sagas = sagas;
      }
      
      if (config) {
        newState.config = { ...newState.config, ...config };
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
      
      return actualizarContadoresSagas(newState);
    }

    case 'EXPORT_DATA': {
      return state;
    }

    case 'ADD_LECTURA': {
      const { libroId, lectura } = action.payload;
      const librosActualizados = state.libros.map(libro => {
        if (libro.id === libroId) {
          const nuevaLectura = {
            ...lectura,
            id: Date.now()
          };
          return {
            ...libro,
            lecturas: [...libro.lecturas || [], nuevaLectura]
          };
        }
        return libro;
      });
      
      return {
        ...state,
        libros: librosActualizados
      };
    }

    case 'UPDATE_LECTURA': {
      const { libroId, lecturaId, updates } = action.payload;
      const librosActualizados = state.libros.map(libro => {
        if (libro.id === libroId) {
          return {
            ...libro,
            lecturas: libro.lecturas?.map(lectura => 
              lectura.id === lecturaId ? { ...lectura, ...updates } : lectura
            ) || []
          };
        }
        return libro;
      });
      
      return {
        ...state,
        libros: librosActualizados
      };
    }

    case 'DELETE_LECTURA': {
      const { libroId, lecturaId } = action.payload;
      const librosActualizados = state.libros.map(libro => {
        if (libro.id === libroId) {
          return {
            ...libro,
            lecturas: libro.lecturas?.filter(lectura => lectura.id !== lecturaId) || []
          };
        }
        return libro;
      });
      
      return {
        ...state,
        libros: librosActualizados
      };
    }

    case 'SET_LAST_BACKUP': {
      return {
        ...state,
        lastBackup: action.payload
      };
    }

    case 'CLEAN_DUPLICATE_SAGAS':
      return limpiarSagasHuerfanas(state);

    case 'MIGRATE_FROM_OLD_VERSION':
      return migrateFromOldVersion(action.payload);

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
  const savedState = loadStateFromStorage();
  const initialAppState = savedState || customInitialState || initialState;
  
  const [state, dispatch] = useReducer(appReducer, initialAppState);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  return (
    <AppStateContext.Provider value={{ state, dispatch }}>
      {children}
    </AppStateContext.Provider>
  );
}; 