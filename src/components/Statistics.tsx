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
  BarChart3,
  BookMarked,
  BookX,
  Share2,
  Users
} from 'lucide-react';
import { useAppState } from '../context/AppStateContext';

const Statistics: React.FC = () => {
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
    
    // Calculate reading progress
    const progresoLectura = totalLibros > 0 ? (librosLeidos / totalLibros) * 100 : 0;
    
    // Calculate average rating
    const librosConCalificacion = state.libros.filter(book => book.calificacion && book.calificacion > 0);
    const calificacionPromedio = librosConCalificacion.length > 0 
      ? librosConCalificacion.reduce((sum, book) => sum + (book.calificacion || 0), 0) / librosConCalificacion.length
      : 0;
    
    // Calculate total collection value (excluyendo wishlist)
    const valorTotalColeccion = state.libros
      .filter(book => book.estado !== 'wishlist' && book.precio && book.precio > 0)
      .reduce((sum, book) => sum + (book.precio || 0), 0);
    
    // Calculate average book price (excluyendo wishlist)
    const librosConPrecio = state.libros.filter(book => book.estado !== 'wishlist' && book.precio && book.precio > 0);
    const precioPromedio = librosConPrecio.length > 0 
      ? librosConPrecio.reduce((sum, book) => sum + (book.precio || 0), 0) / librosConPrecio.length
      : 0;
    
    // Calculate reading speed (pages per day)
    const librosConTiempoLectura = state.libros
      .filter(book => book.estado === 'leido' && book.fechaInicio && book.fechaFin && book.paginas)
      .map(book => {
        const diasLectura = (book.fechaFin! - book.fechaInicio!) / (1000 * 60 * 60 * 24);
        return {
          paginas: book.paginas!,
          dias: Math.max(1, diasLectura) // Mínimo 1 día para evitar división por cero
        };
      });
    
    const velocidadLectura = librosConTiempoLectura.length > 0
      ? librosConTiempoLectura.reduce((sum, libro) => sum + (libro.paginas / libro.dias), 0) / librosConTiempoLectura.length
      : 0;
    
    // Calculate books by format
    const librosPorFormato = state.libros.reduce((acc, book) => {
      const formato = book.formato || 'fisico';
      acc[formato] = (acc[formato] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    // Calculate average pages per book
    const librosConPaginas = state.libros.filter(book => book.paginas && book.paginas > 0);
    const paginasPromedio = librosConPaginas.length > 0
      ? librosConPaginas.reduce((sum, book) => sum + (book.paginas || 0), 0) / librosConPaginas.length
      : 0;
    
    // Calculate completion rate by genre
    const generosConCompletados = state.libros
      .filter(book => book.genero && book.estado === 'leido')
      .reduce((acc, book) => {
        if (!acc[book.genero!]) {
          acc[book.genero!] = { completados: 0, total: 0 };
        }
        acc[book.genero!].completados++;
        return acc;
      }, {} as Record<string, { completados: number; total: number }>);
    
    // Add total books per genre
    state.libros.forEach(book => {
      if (book.genero) {
        if (!generosConCompletados[book.genero]) {
          generosConCompletados[book.genero] = { completados: 0, total: 0 };
        }
        generosConCompletados[book.genero].total++;
      }
    });
    
    const generosConMejorTasa = Object.entries(generosConCompletados)
      .filter(([, stats]) => stats.total >= 2) // Solo géneros con al menos 2 libros
      .map(([genero, stats]) => ({
        genero,
        tasaCompletado: (stats.completados / stats.total) * 100
      }))
      .sort((a, b) => b.tasaCompletado - a.tasaCompletado)
      .slice(0, 3);
    
    // Most read authors
    const autoresCont = state.libros
      .filter(book => book.autor && book.estado === 'leido')
      .reduce((acc, book) => {
        const autor = book.autor!;
        acc[autor] = (acc[autor] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
    
    const autoresMasLeidos = Object.entries(autoresCont)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([autor, count]) => ({ autor, count }));
    
    // Most read genres
    const generosCont = state.libros
      .filter(book => book.genero && book.estado === 'leido')
      .reduce((acc, book) => {
        const genero = book.genero!;
        acc[genero] = (acc[genero] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
    
    const generosMasLeidos = Object.entries(generosCont)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([genero, count]) => ({ genero, count }));
    
    // Reading goal progress
    const objetivoAnual = state.config.objetivoLecturaAnual || 0;
    const progresoObjetivo = objetivoAnual > 0 ? (librosLeidos / objetivoAnual) * 100 : 0;
    
    // Estadísticas de manga
    const totalColeccionesManga = state.coleccionesManga.length;
    const coleccionesMangaCompletadas = state.coleccionesManga.filter(c => c.isComplete).length;
    const totalTomosManga = state.coleccionesManga.reduce((sum, c) => sum + c.totalTomos, 0);
    const tomosMangaLeidos = state.coleccionesManga.reduce((sum, c) => sum + c.tomosLeidos, 0);
    const tomosMangaComprados = state.coleccionesManga.reduce((sum, c) => sum + c.tomosComprados, 0);
    const valorTotalManga = state.coleccionesManga
      .filter(c => c.valorTotal && c.valorTotal > 0)
      .reduce((sum, c) => sum + (c.valorTotal || 0), 0);
    
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
      progresoLectura,
      calificacionPromedio,
      autoresMasLeidos,
      generosMasLeidos,
      objetivoAnual,
      progresoObjetivo,
      valorTotalColeccion,
      precioPromedio,
      velocidadLectura,
      librosPorFormato,
      paginasPromedio,
      generosConMejorTasa,
      // Estadísticas de manga
      totalColeccionesManga,
      coleccionesMangaCompletadas,
      totalTomosManga,
      tomosMangaLeidos,
      tomosMangaComprados,
      valorTotalManga
    };
  }, [state.libros, state.sagas, state.coleccionesManga, state.config.objetivoLecturaAnual]);

  const statCards = [
    {
      title: 'Total de Libros',
      value: statistics.totalLibros,
      icon: BookOpen,
      color: 'bg-blue-500',
      description: 'En tu biblioteca'
    },
    {
      title: 'Libros Leídos',
      value: statistics.librosLeidos,
      icon: CheckCircle,
      color: 'bg-green-500',
      description: 'Completados'
    },
    {
      title: 'Por Leer',
      value: statistics.librosTBR,
      icon: Clock,
      color: 'bg-yellow-500',
      description: 'En tu pila TBR'
    },
    {
      title: 'Leyendo',
      value: statistics.librosLeyendo,
      icon: BookMarked,
      color: 'bg-purple-500',
      description: 'Actualmente'
    },
    {
      title: 'Lista de Deseos',
      value: statistics.librosWishlist,
      icon: Heart,
      color: 'bg-pink-500',
      description: 'Por adquirir'
    },
    {
      title: 'Abandonados',
      value: statistics.librosAbandonados,
      icon: BookX,
      color: 'bg-red-500',
      description: 'Sin terminar'
    },
    {
      title: 'Valor Total',
      value: `${statistics.valorTotalColeccion.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}`,
      icon: BookOpen,
      color: 'bg-emerald-500',
      description: 'De la colección'
    },
    {
      title: 'Páginas Promedio',
      value: `${statistics.paginasPromedio.toFixed(0)}`,
      icon: BookOpen,
      color: 'bg-orange-500',
      description: 'Por libro'
    },
    {
      title: 'Colecciones de Manga',
      value: statistics.totalColeccionesManga,
      icon: BookOpen,
      color: 'bg-indigo-500',
      description: 'En tu biblioteca'
    },
    {
      title: 'Tomos de Manga',
      value: statistics.totalTomosManga,
      icon: BookOpen,
      color: 'bg-cyan-500',
      description: 'Total de tomos'
    },
    {
      title: 'Tomos Leídos',
      value: statistics.tomosMangaLeidos,
      icon: CheckCircle,
      color: 'bg-teal-500',
      description: 'Manga completado'
    },
    {
      title: 'Valor Total Manga',
      value: `${statistics.valorTotalManga.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}`,
      icon: BookOpen,
      color: 'bg-violet-500',
      description: 'De la colección'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center space-x-2 mb-4"
        >
          <BarChart3 className="h-8 w-8 text-primary-500" />
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
            Estadísticas de la Biblioteca
          </h1>
        </motion.div>
        <p className="text-slate-600 dark:text-slate-400">
          Análisis detallado de tu progreso de lectura
        </p>
      </div>

      {/* Tarjetas de estadísticas principales */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-8 gap-4">
        {statCards.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="glass-effect rounded-xl p-4 text-center"
          >
            <div className={`inline-flex items-center justify-center w-12 h-12 rounded-lg ${stat.color} mb-3`}>
              <stat.icon className="h-6 w-6 text-white" />
            </div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
              {stat.value}
            </div>
            <div className="text-sm font-medium text-slate-700 dark:text-slate-300">
              {stat.title}
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400">
              {stat.description}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Progreso y objetivos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Progreso de lectura */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="glass-effect rounded-xl p-6"
        >
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center">
            <TrendingUp className="h-5 w-5 mr-2 text-green-500" />
            Progreso de Lectura
          </h3>
          
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-slate-600 dark:text-slate-400">Libros completados</span>
                <span className="font-medium text-slate-900 dark:text-white">
                  {statistics.progresoLectura.toFixed(1)}%
                </span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                <div 
                  className="bg-green-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(statistics.progresoLectura, 100)}%` }}
                />
              </div>
            </div>

            {statistics.objetivoAnual > 0 && (
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-slate-600 dark:text-slate-400">
                    Objetivo anual ({statistics.objetivoAnual} libros)
                  </span>
                  <span className="font-medium text-slate-900 dark:text-white">
                    {statistics.progresoObjetivo.toFixed(1)}%
                  </span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                  <div 
                    className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(statistics.progresoObjetivo, 100)}%` }}
                  />
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4 pt-2">
              <div className="text-center">
                <div className="text-2xl font-bold text-slate-900 dark:text-white">
                  {statistics.paginasLeidas.toLocaleString()}
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  Páginas leídas
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-slate-900 dark:text-white">
                  {statistics.calificacionPromedio.toFixed(1)}
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  Calificación promedio
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Sagas */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="glass-effect rounded-xl p-6"
        >
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center">
            <Award className="h-5 w-5 mr-2 text-purple-500" />
            Sagas
          </h3>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                  {statistics.sagasCompletadas}
                </div>
                <div className="text-sm text-purple-600 dark:text-purple-400">
                  Completadas
                </div>
              </div>
              <div className="text-center p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                  {statistics.sagasActivas}
                </div>
                <div className="text-sm text-orange-600 dark:text-orange-400">
                  En progreso
                </div>
              </div>
            </div>

            {statistics.librosPrestados > 0 && (
              <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <h4 className="font-medium text-blue-800 dark:text-blue-300 mb-2 flex items-center">
                  <Users className="h-4 w-4 mr-1" />
                  Libros Prestados ({statistics.librosPrestados})
                </h4>
                <div className="space-y-1">
                  {statistics.librosPrestadosDetalle.slice(0, 3).map((libro) => (
                    <div key={libro.id} className="text-sm text-blue-700 dark:text-blue-300">
                      <span className="font-medium">{libro.titulo}</span>
                      {libro.prestadoA && (
                        <span className="text-blue-600 dark:text-blue-400"> → {libro.prestadoA}</span>
                      )}
                    </div>
                  ))}
                  {statistics.librosPrestados > 3 && (
                    <div className="text-xs text-blue-600 dark:text-blue-400">
                      +{statistics.librosPrestados - 3} más...
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Top autores y géneros */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Autores más leídos */}
        {statistics.autoresMasLeidos.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="glass-effect rounded-xl p-6"
          >
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center">
              <Share2 className="h-5 w-5 mr-2 text-blue-500" />
              Autores Más Leídos
            </h3>
            <div className="space-y-3">
              {statistics.autoresMasLeidos.map((autor, index) => (
                <div key={autor.autor} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                      {index + 1}
                    </div>
                    <span className="font-medium text-slate-900 dark:text-white">
                      {autor.autor}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-slate-600 dark:text-slate-400">
                      {autor.count} {autor.count === 1 ? 'libro' : 'libros'}
                    </span>
                    <div className="w-16 bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                      <div 
                        className="bg-blue-500 h-2 rounded-full"
                        style={{ 
                          width: `${(autor.count / Math.max(...statistics.autoresMasLeidos.map(a => a.count))) * 100}%` 
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Géneros más leídos */}
        {statistics.generosMasLeidos.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="glass-effect rounded-xl p-6"
          >
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center">
              <Target className="h-5 w-5 mr-2 text-green-500" />
              Géneros Más Leídos
            </h3>
            <div className="space-y-3">
              {statistics.generosMasLeidos.map((genero, index) => (
                <div key={genero.genero} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                      {index + 1}
                    </div>
                    <span className="font-medium text-slate-900 dark:text-white">
                      {genero.genero}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-slate-600 dark:text-slate-400">
                      {genero.count} {genero.count === 1 ? 'libro' : 'libros'}
                    </span>
                    <div className="w-16 bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                      <div 
                        className="bg-green-500 h-2 rounded-full"
                        style={{ 
                          width: `${(genero.count / Math.max(...statistics.generosMasLeidos.map(g => g.count))) * 100}%` 
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>

      {/* Estadísticas adicionales */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Libros por formato */}
        {Object.keys(statistics.librosPorFormato).length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="glass-effect rounded-xl p-6"
          >
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center">
              <BookOpen className="h-5 w-5 mr-2 text-indigo-500" />
              Libros por Formato
            </h3>
            <div className="space-y-3">
              {Object.entries(statistics.librosPorFormato)
                .sort(([,a], [,b]) => b - a)
                .map(([formato, count], index) => (
                  <div key={formato} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-6 h-6 bg-indigo-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                        {index + 1}
                      </div>
                      <span className="font-medium text-slate-900 dark:text-white capitalize">
                        {formato}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-slate-600 dark:text-slate-400">
                        {count} {count === 1 ? 'libro' : 'libros'}
                      </span>
                      <div className="w-16 bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                        <div 
                          className="bg-indigo-500 h-2 rounded-full"
                          style={{ 
                            width: `${(count / Math.max(...Object.values(statistics.librosPorFormato))) * 100}%` 
                          }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </motion.div>
        )}

        {/* Géneros con mejor tasa de completado */}
        {statistics.generosConMejorTasa.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="glass-effect rounded-xl p-6"
          >
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center">
              <CheckCircle className="h-5 w-5 mr-2 text-green-500" />
              Géneros Más Completados
            </h3>
            <div className="space-y-3">
              {statistics.generosConMejorTasa.map((genero, index) => (
                <div key={genero.genero} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                      {index + 1}
                    </div>
                    <span className="font-medium text-slate-900 dark:text-white">
                      {genero.genero}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-slate-600 dark:text-slate-400">
                      {genero.tasaCompletado.toFixed(1)}%
                    </span>
                    <div className="w-16 bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                      <div 
                        className="bg-green-500 h-2 rounded-full"
                        style={{ 
                          width: `${genero.tasaCompletado}%` 
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Statistics;