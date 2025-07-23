export interface Lectura {
  id: number;
  fechaInicio: number;
  fechaFin: number;
  calificacion?: number;
  reseña?: string;
  paginasLeidas?: number;
  notas?: string;
}

export interface Libro {
  id: number;
  titulo: string;
  autor?: string;
  paginas?: number;
  sagaId?: number;
  sagaName?: string;
  ordenLectura?: number;
  fechaAgregado?: number;
  fechaInicio?: number;
  fechaFin?: number;
  fechaAbandonado?: number;
  fechaCompra?: number;
  calificacion?: number; // Calificación más reciente
  notas?: string; // Notas generales del libro
  isbn?: string;
  editorial?: string;
  idioma?: string;
  genero?: string;
  precio?: number;
  publicacion?: number;
  descripcion?: string;
  categorias?: string[];
  numCalificaciones?: number;
  estado: 'tbr' | 'leyendo' | 'leido' | 'abandonado' | 'wishlist' | 'comprado' | 'prestado';
  historialEstados: EstadoLibro[];
  lecturas: Lectura[]; // Múltiples lecturas del libro

  paginasLeidas?: number;
  formato?: 'fisico' | 'digital' | 'audiolibro';
  ubicacion?: string; // para libros físicos
  prestado?: boolean;
  prestadoA?: string;
  fechaPrestamo?: number;
}

export interface EstadoLibro {
  estado: 'tbr' | 'leyendo' | 'leido' | 'abandonado' | 'wishlist' | 'comprado' | 'prestado';
  fecha: number;
  notas?: string;
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
  libros: number[]; // IDs de los libros de la saga
  orden?: number[]; // Orden de lectura recomendado
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
  estado?: 'tbr' | 'leyendo' | 'leido' | 'abandonado' | 'wishlist' | 'comprado' | 'prestado' | 'todos';
  formato?: 'fisico' | 'digital' | 'audiolibro' | 'todos';
  prestado?: boolean;
  completado?: boolean;
}

export interface Statistics {
  totalLibros: number;
  librosLeidos: number;
  librosTBR: number;
  librosWishlist: number;
  librosLeyendo: number;
  librosAbandonados: number;
  librosComprados: number;
  sagasCompletadas: number;
  sagasActivas: number;
  paginasLeidas: number;
  tiempoTotalLectura: number;
  tiempoPromedioLectura: number;
  generosMasLeidos: Array<{ genero: string; count: number }>;
  autoresMasLeidos: Array<{ autor: string; count: number }>;
  progresoMensual: Array<{ mes: string; libros: number; paginas: number; tiempo: number }>;
  progresoAnual: Array<{ año: string; libros: number; paginas: number; tiempo: number }>;
  librosPorFormato: Array<{ formato: string; count: number }>;
  librosPrestados: number;
  valorTotalBiblioteca: number;
}

export interface Configuracion {
  // Configuración de biblioteca
  autoSaveEnabled?: boolean;
  autoSaveInterval?: number;
  searchHistoryEnabled?: boolean;
  scanHistoryEnabled?: boolean;
  statisticsEnabled?: boolean;
  exportFormat?: 'json' | 'csv' | 'excel';
  
  // Configuración de lectura
  objetivoLecturaAnual?: number;
  objetivoPaginasAnual?: number;
  recordatorioLectura?: boolean;
  recordatorioInterval?: number;
  
  // Configuración de escáner
  cameraPreference?: number;
  flashlightEnabled?: boolean;
  zoomLevel?: number;
  defaultCameraId?: string;
  
  // Configuración de notificaciones
  notificacionesSaga?: boolean;
  notificacionesObjetivo?: boolean;
  notificacionesPrestamo?: boolean;
  
  // Configuración de privacidad
  datosAnonimos?: boolean;
  compartirEstadisticas?: boolean;
  
  // Configuración del sistema de puntos
  sistemaPuntosHabilitado?: boolean;
  puntosPorLibro?: number;
  puntosPorSaga?: number;
  puntosPorPagina?: number;
  puntosParaComprar?: number;
}

export interface AppState {
  config: Configuracion;
  libros: Libro[];
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
  // Sistema de puntos
  puntosActuales: number;
  puntosGanados: number;
  librosCompradosConPuntos: number;
  // Mantener compatibilidad con versiones anteriores
  progreso?: number;
  compraDesbloqueada?: boolean;
  librosActuales?: Libro[];
  tbr?: Libro[];
  historial?: Libro[];
  wishlist?: Libro[];
}

export type Action =
  | { type: 'SET_CONFIG'; payload: Configuracion }
  | { type: 'SET_CAMERA_PREFERENCE'; payload: number }
  | { type: 'TOGGLE_DARK_MODE' }
  | { type: 'SET_DARK_MODE'; payload: boolean }
  
  // Acciones de libros
  | { type: 'ADD_BOOK'; payload: Libro }
  | { type: 'UPDATE_BOOK'; payload: { id: number; updates: Partial<Libro> } }
  | { type: 'DELETE_BOOK'; payload: number }
  | { type: 'CHANGE_BOOK_STATE'; payload: { id: number; newState: Libro['estado']; notas?: string } }
  | { type: 'START_READING'; payload: { id: number; fecha?: number } }
  | { type: 'FINISH_READING'; payload: { id: number; fecha?: number; calificacion?: number; notas?: string } }
  | { type: 'ABANDON_BOOK'; payload: { id: number; fecha?: number; motivo?: string } }
  | { type: 'BUY_BOOK'; payload: { id: number; precio?: number; fecha?: number } }
  | { type: 'LOAN_BOOK'; payload: { id: number; prestadoA: string; fecha?: number } }
  | { type: 'RETURN_BOOK'; payload: { id: number; fecha?: number } }
  
  // Acciones de lecturas múltiples
  | { type: 'ADD_LECTURA'; payload: { libroId: number; lectura: Omit<Lectura, 'id'> } }
  | { type: 'UPDATE_LECTURA'; payload: { libroId: number; lecturaId: number; updates: Partial<Lectura> } }
  | { type: 'DELETE_LECTURA'; payload: { libroId: number; lecturaId: number } }
  
  // Acciones de sagas
  | { type: 'ADD_SAGA'; payload: { name: string; descripcion?: string; genero?: string; autor?: string } }
  | { type: 'UPDATE_SAGA'; payload: { id: number; updates: Partial<Saga> } }
  | { type: 'DELETE_SAGA'; payload: number }
  | { type: 'ADD_BOOK_TO_SAGA'; payload: { libroId: number; sagaId: number } }
  | { type: 'REMOVE_BOOK_FROM_SAGA'; payload: { libroId: number; sagaId: number } }
  | { type: 'FIX_SAGA_DATA' }
  | { type: 'ADD_SAGA_NOTIFICATION'; payload: { sagaName: string } }
  | { type: 'REMOVE_SAGA_NOTIFICATION'; payload: { id: number } }
  | { type: 'CLEAN_DUPLICATE_SAGAS' }
  
  // Acciones de historial
  | { type: 'ADD_SCAN_HISTORY'; payload: ScanHistory }
  | { type: 'CLEAR_SCAN_HISTORY' }
  | { type: 'ADD_SEARCH_HISTORY'; payload: string }
  | { type: 'CLEAR_SEARCH_HISTORY' }
  
  // Acciones de datos
  | { type: 'IMPORT_DATA'; payload: { libros: Libro[]; sagas: Saga[]; config?: Configuracion; scanHistory?: ScanHistory[]; searchHistory?: string[]; lastBackup?: number; puntosActuales?: number; puntosGanados?: number; librosCompradosConPuntos?: number } }
  | { type: 'EXPORT_DATA' }
  | { type: 'SET_LAST_BACKUP'; payload: number }
  
  // Acciones del sistema de puntos
  | { type: 'GANAR_PUNTOS'; payload: { cantidad: number; motivo: string } }
  | { type: 'GASTAR_PUNTOS'; payload: { cantidad: number; motivo: string } }
  | { type: 'COMPRAR_LIBRO_CON_PUNTOS'; payload: { libroId: number } }
  | { type: 'RESETEAR_PUNTOS' }
  
  // Acciones de compatibilidad (para migración)
  | { type: 'MIGRATE_FROM_OLD_VERSION'; payload: any };

export type BookListType = 'todos' | 'tbr' | 'leyendo' | 'leido' | 'abandonado' | 'wishlist' | 'comprado' | 'prestado';

export interface BookData {
  titulo: string;
  autor?: string;
  paginas?: number;
  sagaName?: string;
  isbn?: string;
  publicacion?: number;
  editorial?: string;
  descripcion?: string;
  categorias?: string[];
  idioma?: string;
  calificacion?: number;
  numCalificaciones?: number;
  genero?: string;
  formato?: 'fisico' | 'digital' | 'audiolibro';
  precio?: number;
}

export interface ExportData {
  version: string;
  timestamp: number;
  config: Configuracion;
  libros: Libro[];
  sagas: Saga[];
  scanHistory: ScanHistory[];
  searchHistory: string[];
  lastBackup?: number;
  statistics?: Statistics;
  // Sistema de puntos
  puntosActuales?: number;
  puntosGanados?: number;
  librosCompradosConPuntos?: number;
} 