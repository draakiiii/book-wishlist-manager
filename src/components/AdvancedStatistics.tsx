import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  BookOpen, 
  Clock, 
  Target, 
  Award,
  CheckCircle,
  Heart,
  X,
  BarChart3,
  BookMarked,
  BookX,
  ShoppingCart,
  Share2
} from 'lucide-react';
import { useAppState } from '../context/AppStateContext';

interface AdvancedStatisticsProps {
  isOpen: boolean;
  onClose: () => void;
}

const AdvancedStatistics: React.FC<AdvancedStatisticsProps> = ({ isOpen, onClose }) => {
  const { state } = useAppState();

  const statistics = useMemo(() => {
    // Calculate stats based on book states
    const totalLibros = state.libros.length;
    const librosTBR = state.libros.filter(book => book.estado === 'tbr').length;
    const librosLeyendo = state.libros.filter(book => book.estado === 'leyendo').length;
    const librosLeidos = state.libros.filter(book => book.estado === 'leido').length;
    const librosAbandonados = state.libros.filter(book => book.estado === 'abandonado').length;
    const librosWishlist = state.libros.filter(book => book.estado === 'wishlist').length;
    const librosComprados = state.libros.filter(book => book.estado === 'comprado').length;
    const librosPrestados = state.libros.filter(book => book.estado === 'prestado').length;
    
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

    return {
      totalLibros,
      librosTBR,
      librosLeyendo,
      librosLeidos,
      librosAbandonados,
      librosWishlist,
      librosComprados,
      librosPrestados,
      sagasCompletadas,
      sagasActivas,
      paginasLeidas,
      tiempoPromedio: Math.round(tiempoPromedio)
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
              className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl p-4 text-white"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-amber-100 text-sm">Páginas Leídas</p>
                  <p className="text-2xl font-bold">{statistics.paginasLeidas.toLocaleString()}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-amber-200" />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
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
                    <ShoppingCart className="h-4 w-4 text-green-500" />
                    <span className="text-slate-600 dark:text-slate-400">Comprados</span>
                  </div>
                  <span className="font-semibold text-slate-900 dark:text-white">{statistics.librosComprados}</span>
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-sm text-slate-600 dark:text-slate-400">Tiempo Promedio</p>
                <p className="text-lg font-semibold text-slate-900 dark:text-white">
                  {statistics.tiempoPromedio} días
                </p>
                <p className="text-xs text-slate-500">por libro</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-slate-600 dark:text-slate-400">Páginas Promedio</p>
                <p className="text-lg font-semibold text-slate-900 dark:text-white">
                  {statistics.librosLeidos > 0 ? Math.round(statistics.paginasLeidas / statistics.librosLeidos) : 0}
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