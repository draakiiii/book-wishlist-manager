export interface Lectura {
  id: number;
  fechaInicio: number;
  fechaFin: number;
  calificacion?: number;
  reseña?: string;
  paginasLeidas?: number;
  notas?: string;
  citas?: Cita[]; // Nuevo: citas de la lectura
}

// Nueva interfaz para citas
export interface Cita {
  id: number;
  texto: string;
  pagina?: number;
  capitulo?: string;
  fecha: number;
  notas?: string;
  favorita?: boolean;
}

// Nueva interfaz para ediciones de libros
export interface EdicionLibro {
  id: number;
  libroId: number; // ID del libro principal
  isbn: string;
  editorial: string;
  año: number;
  paginas: number;
  formato: 'fisico' | 'digital' | 'audiolibro';
  idioma: string;
  precio?: number;
  fechaCompra?: number;
  estado: 'disponible' | 'prestado' | 'perdido';
  ubicacion?: string;
  notas?: string;
  imagen?: string;
}

// Nueva interfaz para historial de préstamos
export interface HistorialPrestamo {
  id: number;
  libroId: number;
  edicionId?: number;
  prestadoA: string;
  fechaPrestamo: number;
  fechaDevolucion?: number;
  fechaLimite?: number;
  estado: 'activo' | 'devuelto' | 'vencido';
  notas?: string;
  recordatoriosEnviados: number[];
}

// Nueva interfaz para widgets configurables
export interface Widget {
  id: string;
  tipo: 'estadisticas' | 'objetivos' | 'proximasLecturas' | 'sagas' | 'wishlist' | 'prestamos' | 'reportes';
  titulo: string;
  visible: boolean;
  orden: number;
  configuracion?: Record<string, any>;
}

// Nueva interfaz para layouts
export interface Layout {
  id: string;
  nombre: string;
  tipo: 'grid' | 'lista' | 'galeria' | 'estanteria';
  configuracion: {
    columnas?: number;
    tamañoTarjetas?: 'pequeño' | 'mediano' | 'grande';
    mostrarPortadas?: boolean;
    mostrarDetalles?: boolean;
  };
}

// Nueva interfaz para reportes automáticos
export interface ReporteAutomatico {
  id: number;
  tipo: 'mensual' | 'anual' | 'personalizado';
  fechaGeneracion: number;
  periodo: {
    inicio: number;
    fin: number;
  };
  datos: {
    librosLeidos: number;
    paginasLeidas: number;
    tiempoLectura: number;
    generosLeidos: Array<{ genero: string; count: number }>;
    autoresLeidos: Array<{ autor: string; count: number }>;
    sagasCompletadas: number;
    objetivosCumplidos: number;
    prestamosActivos: number;
    valorAgregado: number;
  };
  exportado?: boolean;
  fechaExportacion?: number;
}

// Nueva interfaz para reseñas compartibles
export interface ResenaCompartible {
  id: number;
  libroId: number;
  titulo: string;
  autor: string;
  calificacion: number;
  reseña: string;
  fecha: number;
  citas?: Cita[];
  etiquetas?: string[];
  publica: boolean;
  redesSociales: {
    twitter?: boolean;
    facebook?: boolean;
    instagram?: boolean;
    goodreads?: boolean;
  };
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
  // Image URLs for optimized loading
  smallThumbnail?: string;
  thumbnail?: string;
  // Access info for reading samples
  viewability?: 'NO_PAGES' | 'PARTIAL' | 'ALL_PAGES';
  webReaderLink?: string;
  // Custom user-uploaded image (takes priority over API images)
  customImage?: string;
  
  // Nuevas propiedades
  ediciones?: EdicionLibro[]; // Múltiples ediciones del libro
  citas?: Cita[]; // Citas del libro
  reseñasCompartibles?: ResenaCompartible[]; // Reseñas para compartir
  etiquetas?: string[]; // Etiquetas personalizadas
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
  
  // Nuevas propiedades para edición de sagas
  imagen?: string; // Imagen de la saga
  color?: string; // Color personalizado para la saga
  prioridad?: number; // Prioridad de lectura
  estado: 'activa' | 'pausada' | 'completada' | 'abandonada';
  fechaInicio?: number;
  fechaFin?: number;
  notas?: string;
  etiquetas?: string[];
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
  recordatorioLectura?: boolean;
  recordatorioInterval?: number;
  
  // Configuración de escáner
  cameraPreference?: number;
  flashlightEnabled?: boolean;
  zoomLevel?: number;
  defaultCameraId?: string;
  autoCloseScanner?: boolean; // Nuevo: cerrar escáner automáticamente
  
  // Configuración de notificaciones
  notificacionesSaga?: boolean;
  notificacionesObjetivo?: boolean;
  notificacionesPrestamo?: boolean;
  
  // Configuración de privacidad
  datosAnonimos?: boolean;
  compartirEstadisticas?: boolean;
  
  // Configuración del sistema de puntos/dinero
  sistemaPuntosHabilitado?: boolean;
  modoDinero?: boolean; // true = dinero, false = puntos
  puntosPorLibro?: number;
  puntosPorSaga?: number;
  puntosPorPagina?: number;
  puntosParaComprar?: number;
  // Configuración del sistema de dinero
  dineroPorLibro?: number;
  dineroPorSaga?: number;
  dineroPorPagina?: number;
  dineroParaComprar?: number;
  costoPorPagina?: number; // Costo por página al comprar libros
  
  // Configuración de visibilidad de secciones
  mostrarSeccionProgreso?: boolean;
  mostrarSeccionWishlist?: boolean;
  mostrarSeccionTBR?: boolean;
  mostrarSeccionLeyendo?: boolean;
  mostrarSeccionLeidos?: boolean;
  mostrarSeccionAbandonados?: boolean;
  mostrarSeccionSagas?: boolean;
  
  // Nuevas configuraciones
  layoutPredeterminado?: string; // ID del layout por defecto
  widgetsHabilitados?: boolean;
  reportesAutomaticos?: boolean;
  compartirResenas?: boolean;
  vistaGaleria?: boolean;
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
  // Sistema de puntos/dinero
  puntosActuales: number;
  puntosGanados: number;
  librosCompradosConPuntos: number;
  // Sistema de dinero
  dineroActual: number;
  dineroGanado: number;
  librosCompradosConDinero: number;
  // Mantener compatibilidad con versiones anteriores
  progreso?: number;
  compraDesbloqueada?: boolean;
  librosActuales?: Libro[];
  tbr?: Libro[];
  historial?: Libro[];
  wishlist?: Libro[];
  
  // Nuevos estados
  historialPrestamos: HistorialPrestamo[];
  widgets: Widget[];
  layouts: Layout[];
  reportesAutomaticos: ReporteAutomatico[];
  layoutActual: string;
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
  | { type: 'UPDATE_BOOK_IMAGE'; payload: { id: number; customImage: string } }
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
  | { type: 'IMPORT_DATA'; payload: { libros: Libro[]; sagas: Saga[]; config?: Configuracion; scanHistory?: ScanHistory[]; searchHistory?: string[]; lastBackup?: number; puntosActuales?: number; puntosGanados?: number; librosCompradosConPuntos?: number; dineroActual?: number; dineroGanado?: number; librosCompradosConDinero?: number } }
  | { type: 'EXPORT_DATA' }
  | { type: 'SET_LAST_BACKUP'; payload: number }
  
  // Acciones del sistema de puntos/dinero
  | { type: 'GANAR_PUNTOS'; payload: { cantidad: number; motivo: string } }
  | { type: 'GASTAR_PUNTOS'; payload: { cantidad: number; motivo: string } }
  | { type: 'COMPRAR_LIBRO_CON_PUNTOS'; payload: { libroId: number } }
  | { type: 'RESETEAR_PUNTOS' }
  | { type: 'GANAR_DINERO'; payload: { cantidad: number; motivo: string } }
  | { type: 'GASTAR_DINERO'; payload: { cantidad: number; motivo: string } }
  | { type: 'COMPRAR_LIBRO_CON_DINERO'; payload: { libroId: number } }
  | { type: 'RESETEAR_DINERO' }
  | { type: 'CAMBIAR_MODO_SISTEMA'; payload: { modoDinero: boolean } }
  
  // Nuevas acciones para las funcionalidades solicitadas
  // Acciones de citas
  | { type: 'ADD_CITA'; payload: { libroId: number; cita: Omit<Cita, 'id'> } }
  | { type: 'UPDATE_CITA'; payload: { libroId: number; citaId: number; updates: Partial<Cita> } }
  | { type: 'DELETE_CITA'; payload: { libroId: number; citaId: number } }
  | { type: 'TOGGLE_CITA_FAVORITA'; payload: { libroId: number; citaId: number } }
  
  // Acciones de ediciones
  | { type: 'ADD_EDICION'; payload: { libroId: number; edicion: Omit<EdicionLibro, 'id'> } }
  | { type: 'UPDATE_EDICION'; payload: { edicionId: number; updates: Partial<EdicionLibro> } }
  | { type: 'DELETE_EDICION'; payload: { edicionId: number } }
  
  // Acciones de historial de préstamos
  | { type: 'ADD_PRESTAMO'; payload: HistorialPrestamo }
  | { type: 'UPDATE_PRESTAMO'; payload: { id: number; updates: Partial<HistorialPrestamo> } }
  | { type: 'DEVOLVER_PRESTAMO'; payload: { id: number; fecha?: number } }
  | { type: 'DELETE_PRESTAMO'; payload: { id: number } }
  
  // Acciones de widgets
  | { type: 'ADD_WIDGET'; payload: Widget }
  | { type: 'UPDATE_WIDGET'; payload: { id: string; updates: Partial<Widget> } }
  | { type: 'DELETE_WIDGET'; payload: { id: string } }
  | { type: 'REORDER_WIDGETS'; payload: { orden: string[] } }
  
  // Acciones de layouts
  | { type: 'ADD_LAYOUT'; payload: Layout }
  | { type: 'UPDATE_LAYOUT'; payload: { id: string; updates: Partial<Layout> } }
  | { type: 'DELETE_LAYOUT'; payload: { id: string } }
  | { type: 'SET_LAYOUT_ACTUAL'; payload: { id: string } }
  
  // Acciones de reportes automáticos
  | { type: 'GENERAR_REPORTE'; payload: ReporteAutomatico }
  | { type: 'EXPORTAR_REPORTE'; payload: { id: number; formato: string } }
  | { type: 'DELETE_REPORTE'; payload: { id: number } }
  
  // Acciones de reseñas compartibles
  | { type: 'ADD_RESENA_COMPARTIBLE'; payload: { libroId: number; resena: Omit<ResenaCompartible, 'id'> } }
  | { type: 'UPDATE_RESENA_COMPARTIBLE'; payload: { id: number; updates: Partial<ResenaCompartible> } }
  | { type: 'DELETE_RESENA_COMPARTIBLE'; payload: { id: number } }
  | { type: 'COMPARTIR_RESENA'; payload: { id: number; redes: string[] } }
  
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
  // Image URLs for optimized loading
  smallThumbnail?: string;
  thumbnail?: string;
  // Access info for reading samples
  viewability?: 'NO_PAGES' | 'PARTIAL' | 'ALL_PAGES';
  webReaderLink?: string;
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
  // Sistema de puntos/dinero
  puntosActuales?: number;
  puntosGanados?: number;
  librosCompradosConPuntos?: number;
  dineroActual?: number;
  dineroGanado?: number;
  librosCompradosConDinero?: number;
} 