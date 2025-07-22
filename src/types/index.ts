export interface Libro {
  id: number;
  titulo: string;
  autor?: string;
  paginas?: number;
  sagaId?: number;
  sagaName?: string;
  fechaAgregado?: number;
  fechaTerminado?: number;
  calificacion?: number;
  notas?: string;
  isbn?: string;
  editorial?: string;
  idioma?: string;
  genero?: string;
  precio?: number;
}

export interface Saga {
  id: number;
  name: string;
  count: number;
  isComplete: boolean;
  fechaCreacion?: number;
  fechaCompletado?: number;
  descripcion?: string;
  genero?: string;
  autor?: string;
}

export interface SagaNotification {
  id: number;
  sagaName: string;
  timestamp: number;
}

export interface ScanHistory {
  id: number;
  isbn: string;
  titulo?: string;
  autor?: string;
  timestamp: number;
  success: boolean;
  errorMessage?: string;
}

export interface SearchFilters {
  titulo?: string;
  autor?: string;
  saga?: string;
  genero?: string;
  idioma?: string;
  editorial?: string;
  fechaDesde?: number;
  fechaHasta?: number;
  calificacionMin?: number;
  calificacionMax?: number;
  paginasMin?: number;
  paginasMax?: number;
  precioMin?: number;
  precioMax?: number;
  estado?: 'tbr' | 'historial' | 'wishlist' | 'actual' | 'todos';
  completado?: boolean;
}

export interface Statistics {
  totalLibros: number;
  librosLeidos: number;
  librosTBR: number;
  librosWishlist: number;
  sagasCompletadas: number;
  sagasActivas: number;
  paginasLeidas: number;
  tiempoPromedioLectura: number;
  generosMasLeidos: Array<{ genero: string; count: number }>;
  autoresMasLeidos: Array<{ autor: string; count: number }>;
  progresoMensual: Array<{ mes: string; libros: number; paginas: number }>;
  progresoAnual: Array<{ año: string; libros: number; paginas: number }>;
}

export interface Configuracion {
  puntosPorLibro: number;
  puntosPorPagina: number;
  puntosPorSaga: number;
  objetivo: number;
  cameraPreference?: number;
  flashlightEnabled?: boolean;
  zoomLevel?: number;
  autoSaveEnabled?: boolean;
  autoSaveInterval?: number;
  searchHistoryEnabled?: boolean;
  scanHistoryEnabled?: boolean;
  statisticsEnabled?: boolean;
  exportFormat?: 'json' | 'csv' | 'excel';
}

export interface AppState {
  config: Configuracion;
  progreso: number;
  compraDesbloqueada: boolean;
  librosActuales: Libro[];
  tbr: Libro[];
  historial: Libro[];
  wishlist: Libro[];
  sagas: Saga[];
  sagaNotifications: SagaNotification[];
  darkMode: boolean;
  scanHistory: ScanHistory[];
  searchHistory: string[];
  lastBackup?: number;
  performanceMetrics?: {
    lastRenderTime: number;
    averageRenderTime: number;
    memoryUsage?: number;
  };
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
  | { type: 'ADD_TO_WISHLIST'; payload: { titulo: string; autor?: string; paginas?: number } }
  | { type: 'PURCHASE_WISHLIST_BOOK'; payload: { id: number; pages: number } }
  | { type: 'DELETE_BOOK'; payload: { id: number; listType: 'tbr' | 'actual' | 'historial' | 'wishlist' } }
  | { type: 'MOVE_BACK_FROM_HISTORY'; payload: number }
  | { type: 'ADD_SAGA'; payload: { name: string } }
  | { type: 'FIX_SAGA_DATA' }
  | { type: 'ADD_SAGA_NOTIFICATION'; payload: { sagaName: string } }
  | { type: 'REMOVE_SAGA_NOTIFICATION'; payload: { id: number } }
  | { type: 'ADD_SCAN_HISTORY'; payload: ScanHistory }
  | { type: 'CLEAR_SCAN_HISTORY' }
  | { type: 'ADD_SEARCH_HISTORY'; payload: string }
  | { type: 'CLEAR_SEARCH_HISTORY' }
  | { type: 'UPDATE_BOOK'; payload: { id: number; updates: Partial<Libro>; listType: 'tbr' | 'actual' | 'historial' | 'wishlist' } }
  | { type: 'UPDATE_SAGA'; payload: { id: number; updates: Partial<Saga> } }
  | { type: 'IMPORT_DATA'; payload: { libros: { tbr: Libro[]; historial: Libro[]; wishlist: Libro[]; actual: Libro | null }; sagas: Saga[]; config?: Configuracion; progreso?: number; compraDesbloqueada?: boolean; scanHistory?: ScanHistory[]; searchHistory?: string[]; lastBackup?: number; performanceMetrics?: { lastRenderTime: number; averageRenderTime: number; memoryUsage?: number } } }
  | { type: 'EXPORT_DATA' }
  | { type: 'SET_PERFORMANCE_METRICS'; payload: { lastRenderTime: number; averageRenderTime: number; memoryUsage?: number } }
  | { type: 'SET_LAST_BACKUP'; payload: number };

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

export interface ExportData {
  version: string;
  timestamp: number;
  config: Configuracion;
  progreso: number;
  compraDesbloqueada: boolean;
  libros: {
    tbr: Libro[];
    historial: Libro[];
    wishlist: Libro[];
    actual: Libro | null;
  };
  sagas: Saga[];
  scanHistory: ScanHistory[];
  searchHistory: string[];
  lastBackup?: number;
  performanceMetrics?: {
    lastRenderTime: number;
    averageRenderTime: number;
    memoryUsage?: number;
  };
  statistics?: Statistics;
} 