export interface Libro {
  id: number;
  titulo: string;
  autor?: string;
  paginas?: number;
  sagaId?: number;
  sagaName?: string;
}

export interface Saga {
  id: number;
  name: string;
  count: number;
  isComplete: boolean;
}

export interface SagaNotification {
  id: number;
  sagaName: string;
  timestamp: number;
}

export interface Configuracion {
  puntosPorLibro: number;
  puntosPorPagina: number;
  puntosPorSaga: number;
  objetivo: number;
  cameraPreference?: number; // Índice de la cámara preferida
}

export interface AppState {
  config: Configuracion;
  progreso: number;
  compraDesbloqueada: boolean;
  libroActual: Libro | null;
  tbr: Libro[];
  historial: Libro[];
  wishlist: Libro[];
  sagas: Saga[];
  sagaNotifications: SagaNotification[];
  darkMode: boolean;
}

export type Action =
  | { type: 'SET_CONFIG'; payload: Configuracion }
  | { type: 'SET_CAMERA_PREFERENCE'; payload: number }
  | { type: 'RESET_PROGRESS' }
  | { type: 'TOGGLE_DARK_MODE' }
  | { type: 'SET_DARK_MODE'; payload: boolean }
  | { type: 'ADD_TO_TBR'; payload: Libro }
  | { type: 'START_BOOK'; payload: number }
  | { type: 'FINISH_BOOK'; payload: number }
  | { type: 'ABANDON_BOOK'; payload: number }
  | { type: 'ADD_TO_WISHLIST'; payload: { titulo: string; autor?: string } }
  | { type: 'PURCHASE_WISHLIST_BOOK'; payload: { id: number; pages: number } }
  | { type: 'DELETE_BOOK'; payload: { id: number; listType: 'tbr' | 'actual' | 'historial' | 'wishlist' } }
  | { type: 'MOVE_BACK_FROM_HISTORY'; payload: number }
  | { type: 'ADD_SAGA'; payload: { name: string } }
  | { type: 'FIX_SAGA_DATA' }
  | { type: 'ADD_SAGA_NOTIFICATION'; payload: { sagaName: string } }
  | { type: 'REMOVE_SAGA_NOTIFICATION'; payload: { id: number } };

export type BookListType = 'tbr' | 'actual' | 'historial' | 'wishlist';

export interface BookData {
  titulo: string;
  autor?: string;
  paginas?: number;
  isbn?: string;
  publicacion?: number;
  editorial?: string;
  descripcion?: string;
  categorias?: string[];
  idioma?: string;
  calificacion?: number;
  numCalificaciones?: number;
} 