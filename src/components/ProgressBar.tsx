import React from 'react';
import { useAppState } from '../context/AppStateContext';
import { motion } from 'framer-motion';
import { Target, BookOpen, TrendingUp, Calendar, Trophy, Star } from 'lucide-react';

const ProgressBar: React.FC = () => {
  const { state } = useAppState();
  const { libros, config } = state;
  
  // Calcular estadísticas de lectura
  const librosLeidos = libros.filter(libro => libro.estado === 'leido');
  
  // Calcular páginas leídas - incluir páginas leídas de todos los libros
  const paginasLeidas = libros.reduce((total, libro) => {
    // Si el libro está leído, contar todas las páginas
    if (libro.estado === 'leido') {
      return total + (libro.paginas || 0);
    }
    // Si el libro está siendo leído, contar las páginas leídas
    else if (libro.estado === 'leyendo' && libro.paginasLeidas) {
      return total + libro.paginasLeidas;
    }
    // Si el libro está abandonado, contar las páginas leídas
    else if (libro.estado === 'abandonado' && libro.paginasLeidas) {
      return total + libro.paginasLeidas;
    }
    return total;
  }, 0);
  
  // Filtrar libros excluyendo wishlist para estadísticas
  const librosParaEstadisticas = libros.filter(l => l.estado !== 'wishlist');
  
  // Calcular valor total de la colección (excluyendo wishlist)
  const librosConPrecio = librosParaEstadisticas.filter(l => l.precio && l.precio > 0);
  const valorTotalColeccion = librosConPrecio.reduce((total, libro) => total + (libro.precio || 0), 0);
  
  // Debug: mostrar información en consola
  console.log('Debug valores:', {
    totalLibros: librosParaEstadisticas.length,
    librosConPrecio: librosConPrecio.length,
    valorTotalColeccion,
    paginasLeidas,
    librosConPrecioDetalle: librosConPrecio.map(l => ({ titulo: l.titulo, precio: l.precio, estado: l.estado })),
    librosConPaginas: librosParaEstadisticas.filter(l => l.paginasLeidas || (l.estado === 'leido' && l.paginas)).map(l => ({ 
      titulo: l.titulo, 
      estado: l.estado, 
      paginas: l.paginas, 
      paginasLeidas: l.paginasLeidas 
    }))
  });
  
  // Objetivos anuales - solo libros, no páginas
  const objetivoLibros = config.objetivoLecturaAnual || 0;
  
  // Calcular progreso solo si hay objetivos
  const progresoLibros = objetivoLibros > 0 ? Math.min((librosLeidos.length / objetivoLibros) * 100, 100) : 0;
  
  // Formatear precio
  const formatearPrecio = (precio: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR'
    }).format(precio);
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Sistema de Puntos - MÁS VISIBLE */}
      {config.sistemaPuntosHabilitado && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-yellow-400 via-yellow-500 to-orange-500 dark:from-yellow-600 dark:via-yellow-700 dark:to-orange-700 rounded-xl p-4 sm:p-6 border-2 border-yellow-300 dark:border-yellow-600 shadow-lg"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-lg sm:text-xl font-bold text-white flex items-center space-x-2">
              <Trophy className="h-6 w-6" />
              <span>Sistema de Puntos</span>
            </h3>
            <div className="bg-white/20 rounded-full px-4 py-2">
              <span className="text-xl sm:text-2xl font-bold text-white">
                {state.puntosActuales} pts
              </span>
            </div>
          </div>
          
          <div className="mt-4 p-3 bg-white/10 rounded-lg">
            <div className="text-sm text-white/90 text-center">
              <Star className="h-4 w-4 inline mr-1" />
              Necesitas <strong>{config.puntosParaComprar || 25} puntos</strong> para comprar un libro de tu wishlist
            </div>
          </div>
        </motion.div>
      )}

      {/* Progress Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
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

        {/* Solo mostrar objetivo anual si está configurado mayor que 0 */}
        {objetivoLibros > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
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
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: objetivoLibros > 0 ? 0.4 : 0.3 }}
          className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-xl p-3 sm:p-4 border border-green-200 dark:border-green-700"
        >
          <div className="flex items-center space-x-2 sm:space-x-3">
            <div className="p-1.5 sm:p-2 bg-green-500 rounded-lg">
              <Trophy className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
            </div>
            <div>
              <p className="text-xs sm:text-sm font-medium text-green-700 dark:text-green-300">
                Puntos
              </p>
              <p className="text-xl sm:text-2xl font-bold text-green-900 dark:text-green-100">
                {state.puntosActuales}
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: objetivoLibros > 0 ? 0.5 : 0.4 }}
          className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-xl p-3 sm:p-4 border border-purple-200 dark:border-purple-700"
        >
          <div className="flex items-center space-x-2 sm:space-x-3">
            <div className="p-1.5 sm:p-2 bg-purple-500 rounded-lg">
              <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
            </div>
            <div>
              <p className="text-xs sm:text-sm font-medium text-purple-700 dark:text-purple-300">
                Valor Colección
              </p>
              <p className="text-sm sm:text-lg font-bold text-purple-900 dark:text-purple-100">
                {formatearPrecio(valorTotalColeccion)}
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Progress Bars - Solo mostrar si hay objetivos de libros */}
      {objetivoLibros > 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.6 }}
          className="space-y-4"
        >
          {/* Libros Progress - Solo si hay objetivo de libros */}
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
        </motion.div>
      )}

      {/* Reading Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-3 sm:p-4 border border-slate-200 dark:border-slate-700"
      >
        <h4 className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-slate-100 mb-2 sm:mb-3">
          Estadísticas de Lectura
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3 text-xs sm:text-sm">
          <div className="flex justify-between">
            <span className="text-slate-600 dark:text-slate-400">Total libros:</span>
            <span className="font-medium text-slate-900 dark:text-slate-100">
              {librosParaEstadisticas.length}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-600 dark:text-slate-400">En TBR:</span>
            <span className="font-medium text-slate-900 dark:text-slate-100">
              {librosParaEstadisticas.filter(l => l.estado === 'tbr').length}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-600 dark:text-slate-400">Leyendo:</span>
            <span className="font-medium text-slate-900 dark:text-slate-100">
              {librosParaEstadisticas.filter(l => l.estado === 'leyendo').length}
            </span>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ProgressBar; 