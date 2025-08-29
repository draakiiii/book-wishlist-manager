import React, { createContext, useContext, useReducer, ReactNode, useEffect, useState } from 'react';
import { AppState, Action, Libro, ScanHistory, Statistics, Saga, EstadoLibro, Lectura, ColeccionManga, TomoManga } from '../types';
import { getInitialTheme, persistThemePreference } from '../utils/themeConfig';
import DatabaseService from '../services/databaseService';
import { useAuth } from './AuthContext';
import { generateUniqueId } from '../utils/idGenerator';
import { setConfiguration } from '../services/bookAPI';

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
    recordatorioLectura: true,
    recordatorioInterval: 86400000, // 24 horas
    notificacionesSaga: true,
    notificacionesObjetivo: true,
    notificacionesPrestamo: true,
    flashlightEnabled: false,
    zoomLevel: 1,
    datosAnonimos: false,
    compartirEstadisticas: false,
    // Configuración del sistema de puntos/dinero
    sistemaPuntosHabilitado: true,
    modoDinero: false, // false = puntos, true = dinero
    puntosPorLibro: 10,
    puntosPorSaga: 50,
    puntosPorPagina: 1,
    puntosParaComprar: 25,
    // Configuración del sistema de dinero
    dineroPorLibro: 5.0,
    dineroPorSaga: 25.0,
    dineroPorPagina: 0.5,
    dineroParaComprar: 15.0,
    costoPorPagina: 0.25, // $0.25 por página al comprar libros
    // Configuración de visibilidad de secciones
    mostrarSeccionProgreso: true,
    mostrarSeccionWishlist: true,
    mostrarSeccionTBR: true,
    mostrarSeccionLeyendo: true,
    mostrarSeccionLeidos: true,
    mostrarSeccionAbandonados: true,
    mostrarSeccionSagas: true,
    // Configuración de APIs separadas por función
    scanApiProvider: 'open-library',
    searchApiProvider: 'google-books',
    coverApiProvider: 'google-books',
    // Configuración de manga
    puntosPorTomoManga: 5,
    puntosPorColeccionManga: 25,
    dineroPorTomoManga: 2.5,
    dineroPorColeccionManga: 12.5,
    costoPorTomoManga: 0.5, // $0.50 por tomo al comprar manga
    mostrarSeccionManga: true
  },
  libros: [],
  sagas: [],
  coleccionesManga: [],
  sagaNotifications: [],
  darkMode: getInitialTheme(),
  scanHistory: [],
  searchHistory: [],
  // Sistema de puntos/dinero
  puntosActuales: 0,
  puntosGanados: 0,
  librosCompradosConPuntos: 0,
  // Sistema de dinero
  dineroActual: 0,
  dineroGanado: 0,
  librosCompradosConDinero: 0,
};

async function loadStateFromFirebase(): Promise<AppState | null> {
  try {
    console.log('loadStateFromFirebase: Starting to load from Firebase');
    const firebaseState = await DatabaseService.loadAppState();
    console.log('loadStateFromFirebase: Raw Firebase state:', firebaseState);
    
    if (firebaseState) {
      // Migrar desde versión anterior si es necesario
      if (firebaseState.progreso !== undefined) {
        console.log('loadStateFromFirebase: Migrating from old version');
        return migrateFromOldVersion(firebaseState);
      }
      
              // Asegurar que todas las propiedades del estado inicial estén presentes
        const completeState = {
          ...initialState,
          ...firebaseState,
          sagaNotifications: firebaseState.sagaNotifications || [],
          darkMode: firebaseState.darkMode || false,
          sagas: firebaseState.sagas || [],
          coleccionesManga: firebaseState.coleccionesManga || [],
          scanHistory: firebaseState.scanHistory || [],
          searchHistory: firebaseState.searchHistory || [],
          // Sistema de puntos/dinero
          puntosActuales: firebaseState.puntosActuales || 0,
          puntosGanados: firebaseState.puntosGanados || 0,
          librosCompradosConPuntos: firebaseState.librosCompradosConPuntos || 0,
          // Sistema de dinero
          dineroActual: firebaseState.dineroActual || 0,
          dineroGanado: firebaseState.dineroGanado || 0,
          librosCompradosConDinero: firebaseState.librosCompradosConDinero || 0,
        };
      
      console.log('loadStateFromFirebase: Complete state after merge:', {
        librosCount: completeState.libros.length,
        wishlistCount: completeState.libros.filter(l => l.estado === 'wishlist').length,
        tbrCount: completeState.libros.filter(l => l.estado === 'tbr').length
      });
      
      return completeState;
    }
    console.log('loadStateFromFirebase: No Firebase state found, returning null');
    return null;
  } catch (error) {
    console.error('Error loading state from Firebase:', error);
    return null;
  }
}

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
        coleccionesManga: parsedState.coleccionesManga || [],
        scanHistory: parsedState.scanHistory || [],
        searchHistory: parsedState.searchHistory || [],
        // Sistema de puntos/dinero
        puntosActuales: parsedState.puntosActuales || 0,
        puntosGanados: parsedState.puntosGanados || 0,
        librosCompradosConPuntos: parsedState.librosCompradosConPuntos || 0,
        // Sistema de dinero
        dineroActual: parsedState.dineroActual || 0,
        dineroGanado: parsedState.dineroGanado || 0,
        librosCompradosConDinero: parsedState.librosCompradosConDinero || 0,
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
      // Configurar el servicio de API con la nueva configuración
      setConfiguration(action.payload);
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
      console.log('AppStateContext: ADD_BOOK action triggered', { 
        libro: action.payload,
        currentLibrosCount: state.libros.length 
      });
      
      const nuevoLibro = {
        ...action.payload,
        id: action.payload.id || generateUniqueId(), // Usar el ID proporcionado o generar uno único
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
      
      console.log('AppStateContext: New state after ADD_BOOK', { 
        newLibrosCount: nuevoEstado.libros.length,
        wishlistCount: nuevoEstado.libros.filter(l => l.estado === 'wishlist').length,
        tbrCount: nuevoEstado.libros.filter(l => l.estado === 'tbr').length
      });
      
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
            id: generateUniqueId(),
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
      const libroOriginal = state.libros.find(libro => libro.id === id);
      if (!libroOriginal) return state;
      
      let nuevoEstado = { ...state };
      
      // Manejar saga si se está actualizando
      if (updates.sagaName !== undefined) {
        const sagaNameNormalized = updates.sagaName.trim().toLowerCase();
        let sagaExistente = state.sagas.find(s => 
          s.name.trim().toLowerCase() === sagaNameNormalized
        );
        
        if (sagaExistente) {
          // Usar saga existente
          updates.sagaId = sagaExistente.id;
        } else if (updates.sagaName.trim()) {
          // Crear nueva saga
          const nuevaSaga = {
            id: generateUniqueId(),
            name: updates.sagaName.trim(),
            count: 0,
            isComplete: false,
            libros: []
          };
          nuevoEstado = {
            ...nuevoEstado,
            sagas: [...nuevoEstado.sagas, nuevaSaga]
          };
          updates.sagaId = nuevaSaga.id;
        } else {
          // Eliminar saga
          updates.sagaId = undefined;
        }
      }
      
      const librosActualizados = nuevoEstado.libros.map(libro => 
        libro.id === id ? { ...libro, ...updates } : libro
      );
      
      return actualizarContadoresSagas({
        ...nuevoEstado,
        libros: librosActualizados
      });
    }

    case 'UPDATE_BOOK_IMAGE': {
      const { id, customImage } = action.payload;
      console.log('🖼️ Updating book image:', { id, hasCustomImage: !!customImage, imageLength: customImage?.length });
      return {
        ...state,
        libros: state.libros.map(libro => 
          libro.id === id ? { ...libro, customImage } : libro
        )
      };
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
        id: generateUniqueId(),
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
            id: generateUniqueId(),
            sagaName: sagaInfo.name,
            timestamp: Date.now()
          });
        }
      }
      
      // Sistema de puntos/dinero - otorgar puntos/dinero por completar libro
      let estadoFinal = estadoConSagas;
      if (estadoFinal.config.sistemaPuntosHabilitado) {
        if (estadoFinal.config.modoDinero) {
          // Modo dinero
          let dineroGanado = 0;
          const dineroPorLibro = estadoFinal.config.dineroPorLibro || 5.0;
          const dineroPorPagina = estadoFinal.config.dineroPorPagina || 0.5;
          
          // Dinero por completar el libro
          dineroGanado += dineroPorLibro;
          
          // Dinero por páginas leídas
          const paginasLeidas = libro.paginasLeidas || libro.paginas || 0;
          dineroGanado += paginasLeidas * dineroPorPagina;
          
          // Dinero por completar saga (si es el caso)
          if (sagaAhoraCompleta && !sagaPreviaCompleta) {
            const dineroPorSaga = estadoFinal.config.dineroPorSaga || 25.0;
            dineroGanado += dineroPorSaga;
          }
          
          if (dineroGanado > 0) {
            estadoFinal = {
              ...estadoFinal,
              dineroActual: estadoFinal.dineroActual + dineroGanado,
              dineroGanado: estadoFinal.dineroGanado + dineroGanado
            };
          }
        } else {
          // Modo puntos
          let puntosGanados = 0;
          const puntosPorLibro = estadoFinal.config.puntosPorLibro || 10;
          const puntosPorPagina = estadoFinal.config.puntosPorPagina || 1;
          
          // Puntos por completar el libro
          puntosGanados += puntosPorLibro;
          
          // Puntos por páginas leídas
          const paginasLeidas = libro.paginasLeidas || libro.paginas || 0;
          puntosGanados += paginasLeidas * puntosPorPagina;
          
          // Puntos por completar saga (si es el caso)
          if (sagaAhoraCompleta && !sagaPreviaCompleta) {
            const puntosPorSaga = estadoFinal.config.puntosPorSaga || 50;
            puntosGanados += puntosPorSaga;
          }
          
          if (puntosGanados > 0) {
            estadoFinal = {
              ...estadoFinal,
              puntosActuales: estadoFinal.puntosActuales + puntosGanados,
              puntosGanados: estadoFinal.puntosGanados + puntosGanados
            };
          }
        }
      }
      
      return estadoFinal;
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
            ...libro,
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
          return {
            ...libro,
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
        id: generateUniqueId(),
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
        id: generateUniqueId(),
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
        id: generateUniqueId(),
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
      const { libros, sagas, coleccionesManga, config, scanHistory, searchHistory, lastBackup, puntosActuales, puntosGanados, librosCompradosConPuntos, dineroActual, dineroGanado, librosCompradosConDinero } = action.payload;
      
      let newState = { ...state };
      
      if (libros) {
        newState.libros = libros;
      }
      
      if (sagas) {
        newState.sagas = sagas;
      }
      
      if (coleccionesManga) {
        newState.coleccionesManga = coleccionesManga;
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
      
              // Sistema de puntos/dinero
        if (puntosActuales !== undefined) {
          newState.puntosActuales = puntosActuales;
        }
        if (puntosGanados !== undefined) {
          newState.puntosGanados = puntosGanados;
        }
        if (librosCompradosConPuntos !== undefined) {
          newState.librosCompradosConPuntos = librosCompradosConPuntos;
        }
        // Sistema de dinero
        if (dineroActual !== undefined) {
          newState.dineroActual = dineroActual;
        }
        if (dineroGanado !== undefined) {
          newState.dineroGanado = dineroGanado;
        }
        if (librosCompradosConDinero !== undefined) {
          newState.librosCompradosConDinero = librosCompradosConDinero;
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
            id: generateUniqueId()
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

    // Acciones de manga
    case 'ADD_COLECCION_MANGA': {
      const nuevaColeccion: ColeccionManga = {
        ...action.payload,
        id: action.payload.id || generateUniqueId(),
        fechaCreacion: Date.now(),
        tomos: action.payload.tomos || [],
        tomosComprados: action.payload.tomosComprados || 0,
        tomosLeidos: action.payload.tomosLeidos || 0,
        isComplete: action.payload.isComplete || false,
        valorTotal: (action.payload.tomosComprados || 0) * (action.payload.precioPorTomo || 0)
      };
      
      return {
        ...state,
        coleccionesManga: [...state.coleccionesManga, nuevaColeccion]
      };
    }

    case 'UPDATE_COLECCION_MANGA': {
      const { id, updates } = action.payload;
      const coleccionesActualizadas = state.coleccionesManga.map(coleccion => {
        if (coleccion.id === id) {
          const coleccionActualizada = { ...coleccion, ...updates };
          // Recalcular valor total si se actualizó precioPorTomo o tomosComprados
          if (updates.precioPorTomo !== undefined || updates.tomosComprados !== undefined) {
            const tomosComprados = updates.tomosComprados !== undefined ? updates.tomosComprados : coleccion.tomosComprados;
            const precioPorTomo = updates.precioPorTomo !== undefined ? updates.precioPorTomo : coleccion.precioPorTomo;
            coleccionActualizada.valorTotal = tomosComprados * (precioPorTomo || 0);
          }
          return coleccionActualizada;
        }
        return coleccion;
      });
      
      return {
        ...state,
        coleccionesManga: coleccionesActualizadas
      };
    }

    case 'DELETE_COLECCION_MANGA': {
      const coleccionesFiltradas = state.coleccionesManga.filter(coleccion => coleccion.id !== action.payload);
      return {
        ...state,
        coleccionesManga: coleccionesFiltradas
      };
    }

    case 'ADD_TOMO_MANGA': {
      const { coleccionId, tomo } = action.payload;
      const coleccionesActualizadas = state.coleccionesManga.map(coleccion => {
        if (coleccion.id === coleccionId) {
          const nuevoTomo: TomoManga = {
            ...tomo,
            id: generateUniqueId(),
            historialEstados: [{
              estado: tomo.estado,
              fecha: Date.now()
            }]
          };
          
          const tomosActualizados = [...coleccion.tomos, nuevoTomo];
          // Contar tomos que realmente tienes (con fechaCompra o en estado comprado/leido/leyendo)
          const tomosReales = tomosActualizados.filter(t => 
            t.fechaCompra || 
            t.estado === 'comprado' || 
            t.estado === 'leido' || 
            t.estado === 'leyendo'
          ).length;
          const tomosLeidos = tomosActualizados.filter(t => t.estado === 'leido').length;
          const isComplete = tomosActualizados.length === coleccion.totalTomos;
          
          // Calcular valor total basado en los tomos que realmente tienes
          const valorTotal = tomosReales * (coleccion.precioPorTomo || 0);
          
          return {
            ...coleccion,
            tomos: tomosActualizados,
            tomosComprados: tomosReales,
            tomosLeidos,
            isComplete,
            valorTotal
          };
        }
        return coleccion;
      });
      
      return {
        ...state,
        coleccionesManga: coleccionesActualizadas
      };
    }

    case 'UPDATE_TOMO_MANGA': {
      const { coleccionId, tomoId, updates } = action.payload;
      const coleccionesActualizadas = state.coleccionesManga.map(coleccion => {
        if (coleccion.id === coleccionId) {
          const tomosActualizados = coleccion.tomos.map(tomo => 
            tomo.id === tomoId ? { ...tomo, ...updates } : tomo
          );
          
          // Contar tomos que realmente tienes (con fechaCompra o en estado comprado/leido/leyendo)
          const tomosReales = tomosActualizados.filter(t => 
            t.fechaCompra || 
            t.estado === 'comprado' || 
            t.estado === 'leido' || 
            t.estado === 'leyendo'
          ).length;
          const tomosLeidos = tomosActualizados.filter(t => t.estado === 'leido').length;
          const isComplete = tomosActualizados.length === coleccion.totalTomos;
          
          // Calcular valor total basado en los tomos que realmente tienes
          const valorTotal = tomosReales * (coleccion.precioPorTomo || 0);
          
          return {
            ...coleccion,
            tomos: tomosActualizados,
            tomosComprados: tomosReales,
            tomosLeidos,
            isComplete,
            valorTotal
          };
        }
        return coleccion;
      });
      
      return {
        ...state,
        coleccionesManga: coleccionesActualizadas
      };
    }

    case 'DELETE_TOMO_MANGA': {
      const { coleccionId, tomoId } = action.payload;
      const coleccionesActualizadas = state.coleccionesManga.map(coleccion => {
        if (coleccion.id === coleccionId) {
          const tomosFiltrados = coleccion.tomos.filter(tomo => tomo.id !== tomoId);
          // Contar tomos que realmente tienes (con fechaCompra o en estado comprado/leido/leyendo)
          const tomosReales = tomosFiltrados.filter(t => 
            t.fechaCompra || 
            t.estado === 'comprado' || 
            t.estado === 'leido' || 
            t.estado === 'leyendo'
          ).length;
          const tomosLeidos = tomosFiltrados.filter(t => t.estado === 'leido').length;
          const isComplete = tomosFiltrados.length === coleccion.totalTomos;
          
          // Calcular valor total basado en los tomos que realmente tienes
          const valorTotal = tomosReales * (coleccion.precioPorTomo || 0);
          
          return {
            ...coleccion,
            tomos: tomosFiltrados,
            tomosComprados: tomosReales,
            tomosLeidos,
            isComplete,
            valorTotal
          };
        }
        return coleccion;
      });
      
      return {
        ...state,
        coleccionesManga: coleccionesActualizadas
      };
    }

    case 'CHANGE_TOMO_MANGA_STATE': {
      const { coleccionId, tomoId, newState, notas } = action.payload;
      const coleccionesActualizadas = state.coleccionesManga.map(coleccion => {
        if (coleccion.id === coleccionId) {
                        const tomosActualizados = coleccion.tomos.map(tomo => {
                if (tomo.id === tomoId) {
                  const nuevoEstado: EstadoLibro = {
                    estado: newState,
                    fecha: Date.now(),
                    notas
                  };
                  
                  const tomoActualizado: TomoManga = {
                    ...tomo,
                    estado: newState,
                    historialEstados: [...tomo.historialEstados, nuevoEstado]
                  };
                  
                  return tomoActualizado;
                }
                return tomo;
              });
              
              // Contar tomos que realmente tienes (con fechaCompra o en estado comprado/leido/leyendo)
              const tomosReales = tomosActualizados.filter(t => 
                t.fechaCompra || 
                t.estado === 'comprado' || 
                t.estado === 'leido' || 
                t.estado === 'leyendo'
              ).length;
              const tomosLeidos = tomosActualizados.filter(t => t.estado === 'leido').length;
              const isComplete = tomosActualizados.length === coleccion.totalTomos;
              
              // Calcular valor total basado en los tomos que realmente tienes
              const valorTotal = tomosReales * (coleccion.precioPorTomo || 0);
          
          return {
            ...coleccion,
            tomos: tomosActualizados,
            tomosComprados: tomosReales,
            tomosLeidos,
            isComplete,
            valorTotal
          };
        }
        return coleccion;
      });
      
      return {
        ...state,
        coleccionesManga: coleccionesActualizadas
      };
    }

    case 'COMPRAR_TOMO_MANGA': {
      const { coleccionId, tomoId, precio, fecha = Date.now() } = action.payload;
      const coleccionesActualizadas = state.coleccionesManga.map(coleccion => {
        if (coleccion.id === coleccionId) {
          const tomosActualizados = coleccion.tomos.map(tomo => {
            if (tomo.id === tomoId) {
              const tomoActualizado: TomoManga = {
                ...tomo,
                estado: 'comprado',
                fechaCompra: fecha,
                historialEstados: [...tomo.historialEstados, {
                  estado: 'comprado',
                  fecha: Date.now(),
                  notas: precio ? `Comprado por €${precio}` : 'Comprado'
                }]
              };
              return tomoActualizado;
            }
            return tomo;
          });
          
          // Contar tomos que realmente tienes (con fechaCompra o en estado comprado/leido/leyendo)
          const tomosReales = tomosActualizados.filter(t => 
            t.fechaCompra || 
            t.estado === 'comprado' || 
            t.estado === 'leido' || 
            t.estado === 'leyendo'
          ).length;
          const tomosLeidos = tomosActualizados.filter(t => t.estado === 'leido').length;
          const isComplete = tomosActualizados.length === coleccion.totalTomos;
          
          // Calcular valor total basado en los tomos que realmente tienes
          const valorTotal = tomosReales * (coleccion.precioPorTomo || 0);
          
          return {
            ...coleccion,
            tomos: tomosActualizados,
            tomosComprados: tomosReales,
            tomosLeidos,
            isComplete,
            valorTotal
          };
        }
        return coleccion;
      });
      
      return {
        ...state,
        coleccionesManga: coleccionesActualizadas
      };
    }

    case 'LEER_TOMO_MANGA': {
      const { coleccionId, tomoId, fecha = Date.now(), calificacion, notas } = action.payload;
      let puntosGanados = 0;
      let dineroGanado = 0;
      
      const coleccionesActualizadas = state.coleccionesManga.map(coleccion => {
        if (coleccion.id === coleccionId) {
          const tomosActualizados = coleccion.tomos.map(tomo => {
            if (tomo.id === tomoId) {
              const tomoActualizado: TomoManga = {
                ...tomo,
                estado: 'leido',
                fechaLectura: fecha,
                calificacion: calificacion || tomo.calificacion,
                reseña: notas || tomo.reseña,
                historialEstados: [...tomo.historialEstados, {
                  estado: 'leido',
                  fecha: Date.now(),
                  notas
                }]
              };
              
              // Sistema de puntos/dinero por completar tomo
              if (state.config.sistemaPuntosHabilitado) {
                if (state.config.modoDinero) {
                  dineroGanado += state.config.dineroPorTomoManga || 2.5;
                } else {
                  puntosGanados += state.config.puntosPorTomoManga || 5;
                }
              }
              
              return tomoActualizado;
            }
            return tomo;
          });
          
          // Contar tomos que realmente tienes (con fechaCompra o en estado comprado/leido/leyendo)
          const tomosReales = tomosActualizados.filter(t => 
            t.fechaCompra || 
            t.estado === 'comprado' || 
            t.estado === 'leido' || 
            t.estado === 'leyendo'
          ).length;
          const tomosLeidos = tomosActualizados.filter(t => t.estado === 'leido').length;
          const isComplete = tomosActualizados.length === coleccion.totalTomos;
          
          // Calcular valor total basado en los tomos que realmente tienes
          const valorTotal = tomosReales * (coleccion.precioPorTomo || 0);
          
          // Verificar si la colección se completó
          const coleccionPreviaCompleta = coleccion.isComplete;
          const coleccionAhoraCompleta = isComplete;
          
          // Otorgar puntos/dinero por completar colección
          if (coleccionAhoraCompleta && !coleccionPreviaCompleta && state.config.sistemaPuntosHabilitado) {
            if (state.config.modoDinero) {
              dineroGanado += state.config.dineroPorColeccionManga || 12.5;
            } else {
              puntosGanados += state.config.puntosPorColeccionManga || 25;
            }
          }
          
          return {
            ...coleccion,
            tomos: tomosActualizados,
            tomosComprados: tomosReales,
            tomosLeidos,
            isComplete,
            valorTotal,
            fechaCompletado: isComplete ? Date.now() : coleccion.fechaCompletado
          };
        }
        return coleccion;
      });
      
      // Aplicar puntos/dinero ganados
      let estadoFinal = {
        ...state,
        coleccionesManga: coleccionesActualizadas
      };
      
      if (puntosGanados > 0) {
        estadoFinal = {
          ...estadoFinal,
          puntosActuales: estadoFinal.puntosActuales + puntosGanados,
          puntosGanados: estadoFinal.puntosGanados + puntosGanados
        };
      }
      
      if (dineroGanado > 0) {
        estadoFinal = {
          ...estadoFinal,
          dineroActual: estadoFinal.dineroActual + dineroGanado,
          dineroGanado: estadoFinal.dineroGanado + dineroGanado
        };
      }
      
      return estadoFinal;
    }

    case 'MIGRATE_FROM_OLD_VERSION':
      return migrateFromOldVersion(action.payload);

    // Acciones del sistema de puntos
    case 'GANAR_PUNTOS': {
      const { cantidad, motivo } = action.payload;
      return {
        ...state,
        puntosActuales: state.puntosActuales + cantidad,
        puntosGanados: state.puntosGanados + cantidad
      };
    }

    case 'GASTAR_PUNTOS': {
      const { cantidad, motivo } = action.payload;
      return {
        ...state,
        puntosActuales: Math.max(0, state.puntosActuales - cantidad)
      };
    }

    case 'COMPRAR_LIBRO_CON_PUNTOS': {
      const { libroId } = action.payload;
      const libro = state.libros.find(l => l.id === libroId);
      
      if (!libro || !state.config.sistemaPuntosHabilitado) {
        return state;
      }

      const puntosNecesarios = state.config.puntosParaComprar || 25;
      
      if (state.puntosActuales < puntosNecesarios) {
        return state;
      }

      // Cambiar el estado del libro de 'wishlist' a 'tbr' (comprado y listo para leer)
      const librosActualizados = state.libros.map(l => 
        l.id === libroId ? agregarEstadoAlHistorial(l, 'tbr', `Comprado con ${puntosNecesarios} puntos`) : l
      );

      return {
        ...state,
        libros: librosActualizados,
        puntosActuales: state.puntosActuales - puntosNecesarios,
        librosCompradosConPuntos: state.librosCompradosConPuntos + 1
      };
    }

    case 'RESETEAR_PUNTOS': {
      return {
        ...state,
        puntosActuales: 0,
        puntosGanados: 0,
        librosCompradosConPuntos: 0
      };
    }

    // Acciones del sistema de dinero
    case 'GANAR_DINERO': {
      const { cantidad, motivo } = action.payload;
      return {
        ...state,
        dineroActual: state.dineroActual + cantidad,
        dineroGanado: state.dineroGanado + cantidad
      };
    }

    case 'GASTAR_DINERO': {
      const { cantidad, motivo } = action.payload;
      return {
        ...state,
        dineroActual: Math.max(0, state.dineroActual - cantidad)
      };
    }

    case 'COMPRAR_LIBRO_CON_DINERO': {
      const { libroId } = action.payload;
      const libro = state.libros.find(l => l.id === libroId);
      
      if (!libro || !state.config.sistemaPuntosHabilitado || !state.config.modoDinero) {
        return state;
      }

      // Calcular costo basado en páginas del libro
      const paginas = libro.paginas || 0;
      const costoPorPagina = state.config.costoPorPagina || 0.25;
      const costoTotal = paginas * costoPorPagina;

      if (costoTotal <= 0) {
        return state; // No se puede comprar un libro sin páginas
      }

      if (state.dineroActual < costoTotal) {
        return state;
      }

      // Cambiar el estado del libro de 'wishlist' a 'tbr' (comprado y listo para leer)
      const librosActualizados = state.libros.map(l => 
        l.id === libroId ? agregarEstadoAlHistorial(l, 'tbr', `Comprado con $${costoTotal.toFixed(2)} (${paginas} páginas × $${costoPorPagina.toFixed(2)}/página)`) : l
      );

      return {
        ...state,
        libros: librosActualizados,
        dineroActual: state.dineroActual - costoTotal,
        librosCompradosConDinero: state.librosCompradosConDinero + 1
      };
    }

    case 'RESETEAR_DINERO': {
      return {
        ...state,
        dineroActual: 0,
        dineroGanado: 0,
        librosCompradosConDinero: 0
      };
    }

    case 'CAMBIAR_MODO_SISTEMA': {
      const { modoDinero } = action.payload;
      return {
        ...state,
        config: {
          ...state.config,
          modoDinero
        }
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
  const { isAuthenticated, user, loading: authLoading } = useAuth();
  const [state, dispatch] = useReducer(appReducer, initialState);
  const [isLoading, setIsLoading] = useState(false); // Cambiar a false para evitar loading infinito
  const [isInitialized, setIsInitialized] = useState(false); // Nueva variable para controlar la inicialización

  // Cargar estado inicial - SOLO Firebase
  useEffect(() => {
    console.log('AppStateContext: Starting initialization', { authLoading, isAuthenticated, user: user?.email, userUid: user?.uid });
    
    // Resetear estado de inicialización cuando cambia el usuario
    setIsInitialized(false);
    
    // Solo cargar desde Firebase si está autenticado
    if (isAuthenticated && user && !authLoading) {
      const loadFromFirebase = async () => {
        try {
          console.log('AppStateContext: Loading from Firebase for user:', user.uid);
          
          // IMPORTANTE: Primero limpiar el estado actual
          console.log('AppStateContext: Clearing current state before loading new user data');
          dispatch({ type: 'IMPORT_DATA', payload: initialState });
          
          const firebaseState = await loadStateFromFirebase();
          if (firebaseState) {
            console.log('AppStateContext: Firebase state loaded for user, updating', {
              userUid: user.uid,
              librosCount: firebaseState.libros.length
            });
            dispatch({ type: 'IMPORT_DATA', payload: firebaseState });
            // Configurar las APIs con la configuración cargada
            setConfiguration(firebaseState.config);
          } else {
            console.log('AppStateContext: No Firebase data found for user, starting with empty state', user.uid);
            // Mantener el estado inicial limpio y configurar APIs con valores por defecto
            setConfiguration(initialState.config);
          }
          setIsInitialized(true);
        } catch (error) {
          console.error('AppStateContext: Error loading from Firebase:', error);
          setIsInitialized(true);
        }
      };
      loadFromFirebase();
    } else if (!isAuthenticated && !authLoading) {
      // Si no está autenticado, empezar con estado vacío
      console.log('AppStateContext: Not authenticated, clearing state');
      dispatch({ type: 'IMPORT_DATA', payload: initialState });
      // Configurar APIs con valores por defecto
      setConfiguration(initialState.config);
      setIsInitialized(true);
    }
  }, [isAuthenticated, user?.uid, authLoading, dispatch]); // ¡IMPORTANTE: Cambié user por user?.uid!

  // Guardar estado en Firebase cuando esté autenticado
  useEffect(() => {
    console.log('AppStateContext: Save effect triggered', { 
      isAuthenticated, 
      user: user?.email, 
      userUid: user?.uid,
      isLoading, 
      isInitialized,
      librosCount: state.libros.length 
    });
    
    // Solo guardar si:
    // 1. Está autenticado
    // 2. Está inicializado (ya cargó los datos del usuario)
    // 3. No está en proceso de carga
    // 4. El estado no es el inicial vacío (evitar sobreescribir con estado vacío)
    const isEmptyInitialState = state.libros.length === 0 && 
                               state.sagas.length === 0 && 
                               state.scanHistory.length === 0 &&
                               state.searchHistory.length === 0;
    
    if (isAuthenticated && user && !isLoading && isInitialized && !isEmptyInitialState) {
      const saveToFirebase = async () => {
        try {
          console.log('AppStateContext: Saving to Firebase', { 
            userUid: user.uid,
            librosCount: state.libros.length,
            wishlistCount: state.libros.filter(l => l.estado === 'wishlist').length,
            tbrCount: state.libros.filter(l => l.estado === 'tbr').length
          });
          await DatabaseService.saveAppState(state);
          console.log('AppStateContext: Successfully saved to Firebase');
        } catch (error) {
          console.error('Error saving to Firebase:', error);
        }
      };
      saveToFirebase();
    } else if (isAuthenticated && user && isInitialized && isEmptyInitialState) {
      console.log('AppStateContext: Skipping save - state appears to be empty initial state');
    }
  }, [state, isAuthenticated, user?.uid, isLoading, isInitialized]);

  // Eliminado fallback a localStorage - solo Firebase

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <AppStateContext.Provider value={{ state, dispatch }}>
      {children}
    </AppStateContext.Provider>
  );
}; 