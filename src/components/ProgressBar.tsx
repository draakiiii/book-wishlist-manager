import React from 'react';
import { useAppState } from '../context/AppStateContext';
import { motion } from 'framer-motion';
import { Target, BookOpen, TrendingUp, Calendar } from 'lucide-react';

const ProgressBar: React.FC = () => {
  const { state } = useAppState();
  const { libros, config } = state;
  
  // Calcular estadísticas de lectura
  const librosLeidos = libros.filter(libro => libro.estado === 'leido');
  const paginasLeidas = librosLeidos.reduce((total, libro) => total + (libro.paginas || 0), 0);
  const tiempoTotalLectura = librosLeidos.reduce((total, libro) => total + (libro.tiempoLectura || 0), 0);
  
  // Objetivos anuales
  const objetivoLibros = config.objetivoLecturaAnual || 12;
  const objetivoPaginas = config.objetivoPaginasAnual || 4000;
  
  // Calcular progreso
  const progresoLibros = Math.min((librosLeidos.length / objetivoLibros) * 100, 100);
  const progresoPaginas = Math.min((paginasLeidas / objetivoPaginas) * 100, 100);
  
  // Calcular tiempo promedio por libro
  const tiempoPromedio = librosLeidos.length > 0 ? tiempoTotalLectura / librosLeidos.length : 0;
  
  // Formatear tiempo
  const formatearTiempo = (minutos: number) => {
    const horas = Math.floor(minutos / 60);
    const mins = minutos % 60;
    if (horas > 0) {
      return `${horas}h ${mins}m`;
    }
    return `${mins}m`;
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Progress Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-primary-50 to-primary-100 dark:from-primary-900/20 dark:to-primary-800/20 rounded-xl p-3 sm:p-4 border border-primary-200 dark:border-primary-700"
        >
          <div className="flex items-center space-x-2 sm:space-x-3">
            <div className="p-1.5 sm:p-2 bg-primary-500 rounded-lg">
              <BookOpen className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
            </div>
            <div>
              <p className="text-xs sm:text-sm font-medium text-primary-700 dark:text-primary-300">
                Libros Leídos
              </p>
              <p className="text-xl sm:text-2xl font-bold text-primary-900 dark:text-primary-100">
                {librosLeidos.length}
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-br from-secondary-50 to-secondary-100 dark:from-secondary-900/20 dark:to-secondary-800/20 rounded-xl p-3 sm:p-4 border border-secondary-200 dark:border-secondary-700"
        >
          <div className="flex items-center space-x-2 sm:space-x-3">
            <div className="p-1.5 sm:p-2 bg-secondary-500 rounded-lg">
              <Target className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
            </div>
            <div>
              <p className="text-xs sm:text-sm font-medium text-secondary-700 dark:text-secondary-300">
                Objetivo Anual
              </p>
              <p className="text-xl sm:text-2xl font-bold text-secondary-900 dark:text-secondary-100">
                {objetivoLibros}
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-xl p-3 sm:p-4 border border-green-200 dark:border-green-700"
        >
          <div className="flex items-center space-x-2 sm:space-x-3">
            <div className="p-1.5 sm:p-2 bg-green-500 rounded-lg">
              <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
            </div>
            <div>
              <p className="text-xs sm:text-sm font-medium text-green-700 dark:text-green-300">
                Páginas Leídas
              </p>
              <p className="text-xl sm:text-2xl font-bold text-green-900 dark:text-green-100">
                {paginasLeidas.toLocaleString()}
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-xl p-3 sm:p-4 border border-purple-200 dark:border-purple-700"
        >
          <div className="flex items-center space-x-2 sm:space-x-3">
            <div className="p-1.5 sm:p-2 bg-purple-500 rounded-lg">
              <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
            </div>
            <div>
              <p className="text-xs sm:text-sm font-medium text-purple-700 dark:text-purple-300">
                Tiempo Promedio
              </p>
              <p className="text-sm sm:text-lg font-bold text-purple-900 dark:text-purple-100">
                {formatearTiempo(tiempoPromedio)}
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Progress Bars */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.5 }}
        className="space-y-4"
      >
        {/* Libros Progress */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300">
              Progreso de libros ({librosLeidos.length}/{objetivoLibros})
            </span>
            <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100">
              {Math.round(progresoLibros)}%
            </span>
          </div>
          
          <div className="relative h-3 sm:h-4 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progresoLibros}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="h-full rounded-full bg-gradient-to-r from-primary-500 to-secondary-500"
            />
            
            {/* Shimmer effect */}
            <motion.div
              animate={{
                x: ['-100%', '100%'],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "linear"
              }}
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
            />
          </div>
        </div>

        {/* Pages Progress */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300">
              Progreso de páginas ({paginasLeidas.toLocaleString()}/{objetivoPaginas.toLocaleString()})
            </span>
            <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100">
              {Math.round(progresoPaginas)}%
            </span>
          </div>
          
          <div className="relative h-3 sm:h-4 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progresoPaginas}%` }}
              transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
              className="h-full rounded-full bg-gradient-to-r from-green-500 to-green-600"
            />
            
            {/* Shimmer effect */}
            <motion.div
              animate={{
                x: ['-100%', '100%'],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "linear"
              }}
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
            />
          </div>
        </div>
      </motion.div>

      {/* Reading Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-3 sm:p-4 border border-slate-200 dark:border-slate-700"
      >
        <h4 className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-slate-100 mb-2 sm:mb-3">
          Estadísticas de Lectura
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 text-xs sm:text-sm">
          <div className="flex justify-between">
            <span className="text-slate-600 dark:text-slate-400">Total libros:</span>
            <span className="font-medium text-slate-900 dark:text-slate-100">
              {libros.length}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-600 dark:text-slate-400">En TBR:</span>
            <span className="font-medium text-slate-900 dark:text-slate-100">
              {libros.filter(l => l.estado === 'tbr').length}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-600 dark:text-slate-400">Leyendo:</span>
            <span className="font-medium text-slate-900 dark:text-slate-100">
              {libros.filter(l => l.estado === 'leyendo').length}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-600 dark:text-slate-400">Tiempo total:</span>
            <span className="font-medium text-slate-900 dark:text-slate-100">
              {formatearTiempo(tiempoTotalLectura)}
            </span>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ProgressBar; 