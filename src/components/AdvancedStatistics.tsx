import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart3, 
  TrendingUp, 
  DollarSign, 
  BookOpen, 
  Download, 
  Eye, 
  ShoppingCart, 
  Award,
  Tag,
  Globe,
  Calendar,
  Star,
  Users,
  FileText,
  Monitor,
  Headphones,
  Info,
  X,
  CheckCircle,
  BookMarked,
  Clock,
  BookX,
  Target,
  Heart,
  Share2
} from 'lucide-react';
import { Libro, Statistics } from '../types';
import { useAppState } from '../context/AppStateContext';

interface AdvancedStatisticsProps {
  isOpen: boolean;
  onClose: () => void;
}

const AdvancedStatistics: React.FC<AdvancedStatisticsProps> = ({ isOpen, onClose }) => {
  const { state } = useAppState();

  const statistics = useMemo(() => {
    // Filtrar libros excluyendo wishlist para estadísticas
    const librosParaEstadisticas = state.libros.filter(book => book.estado !== 'wishlist');
    
    // Calculate stats based on book states
    const totalLibros = librosParaEstadisticas.length;
    const librosTBR = librosParaEstadisticas.filter(book => book.estado === 'tbr').length;
    const librosLeyendo = librosParaEstadisticas.filter(book => book.estado === 'leyendo').length;
    const librosLeidos = librosParaEstadisticas.filter(book => book.estado === 'leido').length;
    const librosAbandonados = librosParaEstadisticas.filter(book => book.estado === 'abandonado').length;
    const librosWishlist = state.libros.filter(book => book.estado === 'wishlist').length;
    const librosPrestados = librosParaEstadisticas.filter(book => book.prestado).length;
    const librosPrestadosDetalle = librosParaEstadisticas.filter(book => book.prestado);
    
    const sagasCompletadas = state.sagas.filter(s => s.isComplete).length;
    const sagasActivas = state.sagas.filter(s => !s.isComplete).length;
    
    // Calculate pages read from completed books
    const paginasLeidas = state.libros
      .filter(book => book.estado === 'leido')
      .reduce((sum, book) => sum + (book.paginas || 0), 0);
    
    // Calculate average reading time
    const librosConTiempo = state.libros.filter(book => 
      book.estado === 'leido' && book.fechaInicio && book.fechaFin
    );
    
    const tiempoPromedio = librosConTiempo.length > 0 
      ? librosConTiempo.reduce((sum, book) => {
          const inicio = new Date(book.fechaInicio!);
          const fin = new Date(book.fechaFin!);
          const dias = Math.ceil((fin.getTime() - inicio.getTime()) / (1000 * 60 * 60 * 24));
          return sum + dias;
        }, 0) / librosConTiempo.length
      : 0;

    // Objetivos de lectura - solo libros
    const objetivoLibros = state.config.objetivoLecturaAnual || 0;
    
    // Calcular progreso de objetivos
    const progresoLibros = objetivoLibros > 0 ? Math.min((librosLeidos / objetivoLibros) * 100, 100) : 0;
    
    // Calcular libros restantes para completar objetivos
    const librosRestantes = Math.max(0, objetivoLibros - librosLeidos);

    // Estadísticas de Google Books API
    const librosConPrecio = librosParaEstadisticas.filter(book => book.precioVenta);
    const precioPromedio = librosConPrecio.length > 0 
      ? librosConPrecio.reduce((sum, book) => sum + (book.precioVenta || 0), 0) / librosConPrecio.length 
      : 0;
    
    const precioTotal = librosConPrecio.reduce((sum, book) => sum + (book.precioVenta || 0), 0);
    
    const librosDisponibles = librosParaEstadisticas.filter(book => book.disponibleParaVenta);
    const librosConVistaPrevia = librosParaEstadisticas.filter(book => book.vistaPreviaDisponible);
    const librosEPUB = librosParaEstadisticas.filter(book => book.disponibleEPUB);
    const librosPDF = librosParaEstadisticas.filter(book => book.disponiblePDF);
    const librosAudio = librosParaEstadisticas.filter(book => book.disponibleTextoVoz);
    const librosDominioPublico = librosParaEstadisticas.filter(book => book.dominioPublico);
    
    // Análisis de categorías
    const categoriasCount: { [key: string]: number } = {};
    librosParaEstadisticas.forEach(book => {
      if (book.categorias) {
        book.categorias.forEach(categoria => {
          categoriasCount[categoria] = (categoriasCount[categoria] || 0) + 1;
        });
      }
    });
    
    const categoriasMasPopulares = Object.entries(categoriasCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([categoria, count]) => ({ categoria, count }));
    
    // Análisis de idiomas
    const idiomasCount: { [key: string]: number } = {};
    librosParaEstadisticas.forEach(book => {
      if (book.idioma) {
        idiomasCount[book.idioma] = (idiomasCount[book.idioma] || 0) + 1;
      }
    });
    
    const idiomasMasPopulares = Object.entries(idiomasCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([idioma, count]) => ({ idioma, count }));
    
    // Análisis de calificaciones
    const librosConCalificacion = librosParaEstadisticas.filter(book => book.calificacion);
    const calificacionPromedio = librosConCalificacion.length > 0
      ? librosConCalificacion.reduce((sum, book) => sum + (book.calificacion || 0), 0) / librosConCalificacion.length
      : 0;
    
    // Análisis de fechas de publicación
    const librosConFecha = librosParaEstadisticas.filter(book => book.publicacion);
    const añosPublicacion = librosConFecha.map(book => book.publicacion!).sort();
    const añoMasAntiguo = añosPublicacion.length > 0 ? añosPublicacion[0] : null;
    const añoMasReciente = añosPublicacion.length > 0 ? añosPublicacion[añosPublicacion.length - 1] : null;
    
    // Análisis de editoriales
    const editorialesCount: { [key: string]: number } = {};
    librosParaEstadisticas.forEach(book => {
      if (book.editorial) {
        editorialesCount[book.editorial] = (editorialesCount[book.editorial] || 0) + 1;
      }
    });
    
    const editorialesMasPopulares = Object.entries(editorialesCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([editorial, count]) => ({ editorial, count }));

    return {
      totalLibros,
      librosTBR,
      librosLeyendo,
      librosLeidos,
      librosAbandonados,
      librosWishlist,
      librosPrestados,
      librosPrestadosDetalle,
      sagasCompletadas,
      sagasActivas,
      paginasLeidas,
      tiempoPromedio: Math.round(tiempoPromedio),
      // Objetivos
      objetivoLibros,
      progresoLibros,
      librosRestantes,
      // Estadísticas de Google Books
      precioPromedio: Math.round(precioPromedio * 100) / 100,
      precioTotal: Math.round(precioTotal * 100) / 100,
      librosDisponibles: librosDisponibles.length,
      librosConVistaPrevia: librosConVistaPrevia.length,
      librosEPUB: librosEPUB.length,
      librosPDF: librosPDF.length,
      librosAudio: librosAudio.length,
      librosDominioPublico: librosDominioPublico.length,
      categoriasMasPopulares,
      idiomasMasPopulares,
      calificacionPromedio: Math.round(calificacionPromedio * 10) / 10,
      añoMasAntiguo,
      añoMasReciente,
      editorialesMasPopulares
    };
  }, [state]);

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="relative bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center space-x-2">
            <BarChart3 className="h-5 w-5 text-primary-500" />
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
              Estadísticas Avanzadas
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors duration-200"
          >
            <X className="h-5 w-5 text-slate-500" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-4 text-white"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm">Total Libros</p>
                  <p className="text-2xl font-bold">{statistics.totalLibros}</p>
                </div>
                <BookOpen className="h-8 w-8 text-blue-200" />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-4 text-white"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm">Libros Leídos</p>
                  <p className="text-2xl font-bold">{statistics.librosLeidos}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-200" />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-4 text-white"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm">Sagas Completadas</p>
                  <p className="text-2xl font-bold">{statistics.sagasCompletadas}</p>
                </div>
                <Award className="h-8 w-8 text-purple-200" />
              </div>
            </motion.div>
          </div>

          {/* Book States */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-white dark:bg-slate-700 rounded-xl p-6 shadow-lg border border-slate-200 dark:border-slate-600"
            >
              <h4 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center space-x-2">
                <BookOpen className="h-5 w-5 text-primary-500" />
                <span>Estado de Lectura</span>
              </h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <BookMarked className="h-4 w-4 text-blue-500" />
                    <span className="text-slate-600 dark:text-slate-400">TBR</span>
                  </div>
                  <span className="font-semibold text-slate-900 dark:text-white">{statistics.librosTBR}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4 text-orange-500" />
                    <span className="text-slate-600 dark:text-slate-400">Leyendo</span>
                  </div>
                  <span className="font-semibold text-slate-900 dark:text-white">{statistics.librosLeyendo}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-slate-600 dark:text-slate-400">Leídos</span>
                  </div>
                  <span className="font-semibold text-slate-900 dark:text-white">{statistics.librosLeidos}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <BookX className="h-4 w-4 text-red-500" />
                    <span className="text-slate-600 dark:text-slate-400">Abandonados</span>
                  </div>
                  <span className="font-semibold text-slate-900 dark:text-white">{statistics.librosAbandonados}</span>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 }}
              className="bg-white dark:bg-slate-700 rounded-xl p-6 shadow-lg border border-slate-200 dark:border-slate-600"
            >
              <h4 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center space-x-2">
                <Target className="h-5 w-5 text-primary-500" />
                <span>Gestión de Libros</span>
              </h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Heart className="h-4 w-4 text-pink-500" />
                    <span className="text-slate-600 dark:text-slate-400">Wishlist</span>
                  </div>
                  <span className="font-semibold text-slate-900 dark:text-white">{statistics.librosWishlist}</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Share2 className="h-4 w-4 text-blue-500" />
                    <span className="text-slate-600 dark:text-slate-400">Prestados</span>
                  </div>
                  <span className="font-semibold text-slate-900 dark:text-white">{statistics.librosPrestados}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Award className="h-4 w-4 text-purple-500" />
                    <span className="text-slate-600 dark:text-slate-400">Sagas Activas</span>
                  </div>
                  <span className="font-semibold text-slate-900 dark:text-white">{statistics.sagasActivas}</span>
                </div>
              </div>
            </motion.div>
          </div>


          {/* Sistema de Puntos */}
          {state.config.sistemaPuntosHabilitado && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.65 }}
              className="bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-xl p-6 shadow-lg border border-yellow-200 dark:border-yellow-600"
            >
              <h4 className="text-lg font-semibold text-yellow-900 dark:text-yellow-100 mb-4 flex items-center space-x-2">
                <Award className="h-5 w-5 text-yellow-600" />
                <span>Sistema de Puntos/Dinero</span>
              </h4>
              <div className="text-center">
                <p className="text-sm text-yellow-700 dark:text-yellow-300">
                  {state.config.modoDinero ? 'Dinero Actual' : 'Puntos Actuales'}
                </p>
                <p className="text-2xl font-semibold text-yellow-900 dark:text-yellow-100">
                  {state.config.modoDinero 
                    ? `$${state.dineroActual.toFixed(2)}` 
                    : state.puntosActuales
                  }
                </p>
                <p className="text-xs text-yellow-600 dark:text-yellow-400">disponibles</p>
              </div>
              <div className="mt-4 p-3 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
                <p className="text-sm text-yellow-800 dark:text-yellow-200">
                  <strong>Configuración actual:</strong> {
                    state.config.modoDinero 
                      ? `${state.config.dineroPorLibro || 5.0} $/libro, ${state.config.dineroPorSaga || 25.0} $/saga, ${state.config.dineroPorPagina || 0.5} $/página`
                      : `${state.config.puntosPorLibro || 10} pts/libro, ${state.config.puntosPorSaga || 50} pts/saga, ${state.config.puntosPorPagina || 1} pt/página`
                  }
                </p>
                <p className="text-sm text-yellow-800 dark:text-yellow-200 mt-1">
                  <strong>Costo de compra:</strong> {
                    state.config.modoDinero 
                      ? `$${state.config.costoPorPagina || 0.25} por página`
                      : `${state.config.puntosParaComprar || 25} puntos por libro`
                  }
                </p>
              </div>
            </motion.div>
          )}

          {/* Libros Prestados Detalle */}
          {statistics.librosPrestados > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.65 }}
              className="bg-white dark:bg-slate-700 rounded-xl p-6 shadow-lg border border-slate-200 dark:border-slate-600"
            >
              <h4 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center space-x-2">
                <Users className="h-5 w-5 text-purple-500" />
                <span>Libros Prestados ({statistics.librosPrestados})</span>
              </h4>
              <div className="space-y-3">
                {statistics.librosPrestadosDetalle.slice(0, 5).map((libro) => (
                  <div key={libro.id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
                        {libro.titulo}
                      </p>
                      <p className="text-xs text-slate-600 dark:text-slate-400 truncate">
                        Prestado a: {libro.prestadoA}
                      </p>
                    </div>
                    {libro.fechaPrestamo && (
                      <div className="text-xs text-slate-500 dark:text-slate-400 ml-2">
                        {new Date(libro.fechaPrestamo).toLocaleDateString('es-ES', {
                          day: '2-digit',
                          month: '2-digit',
                          year: '2-digit'
                        })}
                      </div>
                    )}
                  </div>
                ))}
                {statistics.librosPrestados > 5 && (
                  <div className="text-center text-sm text-slate-500 dark:text-slate-400 pt-2">
                    +{statistics.librosPrestados - 5} más libros prestados
                  </div>
                )}

              </div>
            </motion.div>
          )}

          {/* Objetivos de Lectura */}
          {statistics.objetivoLibros > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.65 }}
              className="bg-white dark:bg-slate-700 rounded-xl p-6 shadow-lg border border-slate-200 dark:border-slate-600"
            >
              <h4 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center space-x-2">
                <Target className="h-5 w-5 text-green-500" />
                <span>Objetivos de Lectura</span>
              </h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Libros Leídos
                  </span>
                  <span className="text-sm font-semibold text-slate-900 dark:text-white">
                    {statistics.librosLeidos} / {statistics.objetivoLibros}
                  </span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-600 rounded-full h-2">
                  <div 
                    className="bg-green-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${statistics.progresoLibros}%` }}
                  />
                </div>
                <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400">
                  <span>{statistics.progresoLibros.toFixed(1)}% completado</span>
                  <span>{statistics.librosRestantes} libros restantes</span>
                </div>
              </div>
              
              {/* Resumen de objetivos */}
              <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <p className="text-sm text-green-800 dark:text-green-200">
                  <strong>Estado general:</strong> {
                    statistics.progresoLibros >= 100 
                      ? '¡Objetivo completado! 🎉' 
                      : statistics.progresoLibros >= 50
                      ? '¡Buen progreso! Sigue así 💪'
                      : '¡Sigue leyendo para alcanzar tu objetivo! 📚'
                  }
                </p>
              </div>
            </motion.div>
          )}

          {/* Reading Analytics */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="bg-white dark:bg-slate-700 rounded-xl p-6 shadow-lg border border-slate-200 dark:border-slate-600"
          >
            <h4 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-primary-500" />
              <span>Análisis de Lectura</span>
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="text-center">
                <p className="text-sm text-slate-600 dark:text-slate-400">Tiempo Promedio</p>
                <p className="text-lg font-semibold text-slate-900 dark:text-white">
                  {statistics.tiempoPromedio} días
                </p>
                <p className="text-xs text-slate-500">por libro</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-slate-600 dark:text-slate-400">Tasa de Finalización</p>
                <p className="text-lg font-semibold text-slate-900 dark:text-white">
                  {statistics.totalLibros > 0 ? Math.round((statistics.librosLeidos / (statistics.librosLeidos + statistics.librosAbandonados)) * 100) : 0}%
                </p>
                <p className="text-xs text-slate-500">libros completados</p>
              </div>
            </div>
          </motion.div>

          {/* Google Books Analytics */}
          {(statistics.precioTotal > 0 || statistics.librosDisponibles > 0 || statistics.categoriasMasPopulares.length > 0) && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.75 }}
              className="bg-white dark:bg-slate-700 rounded-xl p-6 shadow-lg border border-slate-200 dark:border-slate-600"
            >
              <h4 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center space-x-2">
                <Info className="h-5 w-5 text-blue-500" />
                <span>Análisis de Google Books</span>
              </h4>
              
              {/* Información de precios */}
              {statistics.precioTotal > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <DollarSign className="h-6 w-6 text-green-600 mx-auto mb-2" />
                    <p className="text-sm text-slate-600 dark:text-slate-400">Valor Total</p>
                    <p className="text-lg font-semibold text-slate-900 dark:text-white">
                      {statistics.precioTotal.toFixed(2)} €
                    </p>
                  </div>
                  <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <DollarSign className="h-6 w-6 text-blue-600 mx-auto mb-2" />
                    <p className="text-sm text-slate-600 dark:text-slate-400">Precio Promedio</p>
                    <p className="text-lg font-semibold text-slate-900 dark:text-white">
                      {statistics.precioPromedio.toFixed(2)} €
                    </p>
                  </div>
                  <div className="text-center p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
                    <ShoppingCart className="h-6 w-6 text-emerald-600 mx-auto mb-2" />
                    <p className="text-sm text-slate-600 dark:text-slate-400">Disponibles</p>
                    <p className="text-lg font-semibold text-slate-900 dark:text-white">
                      {statistics.librosDisponibles}
                    </p>
                  </div>
                </div>
              )}

              {/* Formatos disponibles */}
              {(statistics.librosEPUB > 0 || statistics.librosPDF > 0 || statistics.librosAudio > 0) && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  {statistics.librosEPUB > 0 && (
                    <div className="text-center p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                      <Download className="h-6 w-6 text-purple-600 mx-auto mb-2" />
                      <p className="text-sm text-slate-600 dark:text-slate-400">EPUB</p>
                      <p className="text-lg font-semibold text-slate-900 dark:text-white">
                        {statistics.librosEPUB}
                      </p>
                    </div>
                  )}
                  {statistics.librosPDF > 0 && (
                    <div className="text-center p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                      <FileText className="h-6 w-6 text-red-600 mx-auto mb-2" />
                      <p className="text-sm text-slate-600 dark:text-slate-400">PDF</p>
                      <p className="text-lg font-semibold text-slate-900 dark:text-white">
                        {statistics.librosPDF}
                      </p>
                    </div>
                  )}
                  {statistics.librosAudio > 0 && (
                    <div className="text-center p-3 bg-pink-50 dark:bg-pink-900/20 rounded-lg">
                      <Headphones className="h-6 w-6 text-pink-600 mx-auto mb-2" />
                      <p className="text-sm text-slate-600 dark:text-slate-400">Audio</p>
                      <p className="text-lg font-semibold text-slate-900 dark:text-white">
                        {statistics.librosAudio}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Categorías más populares */}
              {statistics.categoriasMasPopulares.length > 0 && (
                <div className="mb-6">
                  <h5 className="text-md font-semibold text-slate-700 dark:text-slate-300 mb-3 flex items-center space-x-2">
                    <Tag className="h-4 w-4" />
                    <span>Categorías Más Populares</span>
                  </h5>
                  <div className="space-y-2">
                    {statistics.categoriasMasPopulares.map((item, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                        <span className="text-sm text-slate-700 dark:text-slate-300">{item.categoria}</span>
                        <span className="text-sm font-semibold text-slate-900 dark:text-white">{item.count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Idiomas más populares */}
              {statistics.idiomasMasPopulares.length > 0 && (
                <div className="mb-6">
                  <h5 className="text-md font-semibold text-slate-700 dark:text-slate-300 mb-3 flex items-center space-x-2">
                    <Globe className="h-4 w-4" />
                    <span>Idiomas Más Populares</span>
                  </h5>
                  <div className="space-y-2">
                    {statistics.idiomasMasPopulares.map((item, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                        <span className="text-sm text-slate-700 dark:text-slate-300 uppercase">{item.idioma}</span>
                        <span className="text-sm font-semibold text-slate-900 dark:text-white">{item.count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Editoriales más populares */}
              {statistics.editorialesMasPopulares.length > 0 && (
                <div className="mb-6">
                  <h5 className="text-md font-semibold text-slate-700 dark:text-slate-300 mb-3 flex items-center space-x-2">
                    <BookOpen className="h-4 w-4" />
                    <span>Editoriales Más Populares</span>
                  </h5>
                  <div className="space-y-2">
                    {statistics.editorialesMasPopulares.map((item, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                        <span className="text-sm text-slate-700 dark:text-slate-300 truncate">{item.editorial}</span>
                        <span className="text-sm font-semibold text-slate-900 dark:text-white">{item.count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Información adicional */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {statistics.calificacionPromedio > 0 && (
                  <div className="text-center p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                    <Star className="h-6 w-6 text-yellow-600 mx-auto mb-2" />
                    <p className="text-sm text-slate-600 dark:text-slate-400">Calificación Promedio</p>
                    <p className="text-lg font-semibold text-slate-900 dark:text-white">
                      {statistics.calificacionPromedio}/5
                    </p>
                  </div>
                )}
                {statistics.librosDominioPublico > 0 && (
                  <div className="text-center p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                    <Award className="h-6 w-6 text-yellow-600 mx-auto mb-2" />
                    <p className="text-sm text-slate-600 dark:text-slate-400">Dominio Público</p>
                    <p className="text-lg font-semibold text-slate-900 dark:text-white">
                      {statistics.librosDominioPublico}
                    </p>
                  </div>
                )}
                {statistics.añoMasAntiguo && statistics.añoMasReciente && (
                  <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <Calendar className="h-6 w-6 text-blue-600 mx-auto mb-2" />
                    <p className="text-sm text-slate-600 dark:text-slate-400">Rango de Años</p>
                    <p className="text-lg font-semibold text-slate-900 dark:text-white">
                      {statistics.añoMasAntiguo} - {statistics.añoMasReciente}
                    </p>
                  </div>
                )}
                {statistics.librosConVistaPrevia > 0 && (
                  <div className="text-center p-3 bg-cyan-50 dark:bg-cyan-900/20 rounded-lg">
                    <Eye className="h-6 w-6 text-cyan-600 mx-auto mb-2" />
                    <p className="text-sm text-slate-600 dark:text-slate-400">Con Vista Previa</p>
                    <p className="text-lg font-semibold text-slate-900 dark:text-white">
                      {statistics.librosConVistaPrevia}
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* Performance Metrics */}
          {state.performanceMetrics && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="mt-6 bg-white dark:bg-slate-700 rounded-xl p-6 shadow-lg border border-slate-200 dark:border-slate-600"
            >
              <h4 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center space-x-2">
                <TrendingUp className="h-5 w-5 text-primary-500" />
                <span>Métricas de Rendimiento</span>
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <p className="text-sm text-slate-600 dark:text-slate-400">Último Render</p>
                  <p className="text-lg font-semibold text-slate-900 dark:text-white">
                    {state.performanceMetrics.lastRenderTime.toFixed(2)}ms
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-slate-600 dark:text-slate-400">Promedio</p>
                  <p className="text-lg font-semibold text-slate-900 dark:text-white">
                    {state.performanceMetrics.averageRenderTime.toFixed(2)}ms
                  </p>
                </div>
                {state.performanceMetrics.memoryUsage && (
                  <div className="text-center">
                    <p className="text-sm text-slate-600 dark:text-slate-400">Memoria</p>
                    <p className="text-lg font-semibold text-slate-900 dark:text-white">
                      {(state.performanceMetrics.memoryUsage / 1024 / 1024).toFixed(1)}MB
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default AdvancedStatistics;