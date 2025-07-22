import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area
} from 'recharts';
import { 
  TrendingUp, 
  BookOpen, 
  Clock, 
  Star, 
  Calendar, 
  Target, 
  Award,
  Zap,
  Activity,
  BarChart3,
  PieChart as PieChartIcon,
  LineChart as LineChartIcon,
  CheckCircle,
  Heart
} from 'lucide-react';
import { useAppState } from '../context/AppStateContext';
import { Statistics } from '../types';
import { format, subMonths, startOfMonth, endOfMonth, eachMonthOfInterval } from 'date-fns';
import { es } from 'date-fns/locale';

interface AdvancedStatisticsProps {
  isOpen: boolean;
  onClose: () => void;
}

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'];

const AdvancedStatistics: React.FC<AdvancedStatisticsProps> = ({ isOpen, onClose }) => {
  const { state } = useAppState();

  const statistics = useMemo((): Statistics => {
    const allBooks = [
      ...state.tbr,
      ...state.historial,
      ...(state.libroActual ? [state.libroActual] : [])
    ];

    // Calculate basic stats
    const totalLibros = allBooks.length;
    const librosLeidos = state.historial.length;
    const librosTBR = state.tbr.length;
    const librosWishlist = state.wishlist.length;
    const sagasCompletadas = state.sagas.filter(s => s.isComplete).length;
    const sagasActivas = state.sagas.filter(s => !s.isComplete).length;
    const paginasLeidas = state.historial.reduce((sum, book) => sum + (book.paginas || 0), 0);

    // Calculate average reading time (assuming 1 hour per 50 pages)
    const tiempoPromedioLectura = paginasLeidas > 0 ? (paginasLeidas / 50) : 0;

    // Calculate genres
    const generoCount: { [key: string]: number } = {};
    allBooks.forEach(book => {
      if (book.genero) {
        generoCount[book.genero] = (generoCount[book.genero] || 0) + 1;
      }
    });
    const generosMasLeidos = Object.entries(generoCount)
      .map(([genero, count]) => ({ genero, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Calculate authors
    const autorCount: { [key: string]: number } = {};
    allBooks.forEach(book => {
      if (book.autor) {
        autorCount[book.autor] = (autorCount[book.autor] || 0) + 1;
      }
    });
    const autoresMasLeidos = Object.entries(autorCount)
      .map(([autor, count]) => ({ autor, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Calculate monthly progress
    const now = new Date();
    const sixMonthsAgo = subMonths(now, 6);
    const months = eachMonthOfInterval({ start: sixMonthsAgo, end: now });
    
    const progresoMensual = months.map(month => {
      const monthStart = startOfMonth(month);
      const monthEnd = endOfMonth(month);
      
      const librosDelMes = state.historial.filter(book => {
        const fechaTerminado = book.fechaTerminado ? new Date(book.fechaTerminado) : null;
        return fechaTerminado && fechaTerminado >= monthStart && fechaTerminado <= monthEnd;
      });
      
      const paginasDelMes = librosDelMes.reduce((sum, book) => sum + (book.paginas || 0), 0);
      
      return {
        mes: format(month, 'MMM yyyy', { locale: es }),
        libros: librosDelMes.length,
        paginas: paginasDelMes
      };
    });

    // Calculate yearly progress
    const currentYear = now.getFullYear();
    const progresoAnual = Array.from({ length: 5 }, (_, i) => {
      const year = currentYear - 4 + i;
      const librosDelAño = state.historial.filter(book => {
        const fechaTerminado = book.fechaTerminado ? new Date(book.fechaTerminado) : null;
        return fechaTerminado && fechaTerminado.getFullYear() === year;
      });
      
      const paginasDelAño = librosDelAño.reduce((sum, book) => sum + (book.paginas || 0), 0);
      
      return {
        año: year.toString(),
        libros: librosDelAño.length,
        paginas: paginasDelAño
      };
    });

    return {
      totalLibros,
      librosLeidos,
      librosTBR,
      librosWishlist,
      sagasCompletadas,
      sagasActivas,
      paginasLeidas,
      tiempoPromedioLectura,
      generosMasLeidos,
      autoresMasLeidos,
      progresoMensual,
      progresoAnual
    };
  }, [state]);

  const performanceMetrics = state.performanceMetrics;

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm overflow-y-auto"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="relative bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-7xl w-full mx-4 my-8 max-h-[95vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 p-4">
          <div className="flex items-center justify-between">
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
              <span className="text-slate-500">×</span>
            </button>
          </div>
        </div>

        <div className="p-6 space-y-8">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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

          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Monthly Progress */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-white dark:bg-slate-700 rounded-xl p-4 shadow-lg border border-slate-200 dark:border-slate-600"
            >
              <h4 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center space-x-2">
                <LineChartIcon className="h-5 w-5 text-primary-500" />
                <span>Progreso Mensual</span>
              </h4>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={statistics.progresoMensual}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="mes" stroke="#6B7280" />
                  <YAxis stroke="#6B7280" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1F2937', 
                      border: 'none', 
                      borderRadius: '8px',
                      color: '#F9FAFB'
                    }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="libros" 
                    stroke="#3B82F6" 
                    fill="#3B82F6" 
                    fillOpacity={0.3}
                    name="Libros"
                  />
                  <Area 
                    type="monotone" 
                    dataKey="paginas" 
                    stroke="#10B981" 
                    fill="#10B981" 
                    fillOpacity={0.3}
                    name="Páginas"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </motion.div>

            {/* Genres Distribution */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 }}
              className="bg-white dark:bg-slate-700 rounded-xl p-4 shadow-lg border border-slate-200 dark:border-slate-600"
            >
              <h4 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center space-x-2">
                <PieChartIcon className="h-5 w-5 text-primary-500" />
                <span>Géneros Más Leídos</span>
              </h4>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={statistics.generosMasLeidos}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ genero, percent }) => `${genero} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    {statistics.generosMasLeidos.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1F2937', 
                      border: 'none', 
                      borderRadius: '8px',
                      color: '#F9FAFB'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </motion.div>

            {/* Authors Bar Chart */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="bg-white dark:bg-slate-700 rounded-xl p-4 shadow-lg border border-slate-200 dark:border-slate-600"
            >
              <h4 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center space-x-2">
                <BarChart3 className="h-5 w-5 text-primary-500" />
                <span>Autores Más Leídos</span>
              </h4>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={statistics.autoresMasLeidos}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="autor" stroke="#6B7280" angle={-45} textAnchor="end" height={80} />
                  <YAxis stroke="#6B7280" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1F2937', 
                      border: 'none', 
                      borderRadius: '8px',
                      color: '#F9FAFB'
                    }}
                  />
                  <Bar dataKey="count" fill="#3B82F6" />
                </BarChart>
              </ResponsiveContainer>
            </motion.div>

            {/* Yearly Progress */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="bg-white dark:bg-slate-700 rounded-xl p-4 shadow-lg border border-slate-200 dark:border-slate-600"
            >
              <h4 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center space-x-2">
                <TrendingUp className="h-5 w-5 text-primary-500" />
                <span>Progreso Anual</span>
              </h4>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={statistics.progresoAnual}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="año" stroke="#6B7280" />
                  <YAxis stroke="#6B7280" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1F2937', 
                      border: 'none', 
                      borderRadius: '8px',
                      color: '#F9FAFB'
                    }}
                  />
                  <Line type="monotone" dataKey="libros" stroke="#3B82F6" strokeWidth={2} name="Libros" />
                  <Line type="monotone" dataKey="paginas" stroke="#10B981" strokeWidth={2} name="Páginas" />
                </LineChart>
              </ResponsiveContainer>
            </motion.div>
          </div>

          {/* Performance Metrics */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
            className="bg-white dark:bg-slate-700 rounded-xl p-4 shadow-lg border border-slate-200 dark:border-slate-600"
          >
            <h4 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center space-x-2">
              <Zap className="h-5 w-5 text-primary-500" />
              <span>Métricas de Rendimiento</span>
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-slate-50 dark:bg-slate-600 rounded-lg">
                <p className="text-sm text-slate-600 dark:text-slate-400">Tiempo de Renderizado</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                  {performanceMetrics?.lastRenderTime?.toFixed(2) || '0'}ms
                </p>
              </div>
              <div className="text-center p-4 bg-slate-50 dark:bg-slate-600 rounded-lg">
                <p className="text-sm text-slate-600 dark:text-slate-400">Promedio de Renderizado</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                  {performanceMetrics?.averageRenderTime?.toFixed(2) || '0'}ms
                </p>
              </div>
              <div className="text-center p-4 bg-slate-50 dark:bg-slate-600 rounded-lg">
                <p className="text-sm text-slate-600 dark:text-slate-400">Uso de Memoria</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                  {performanceMetrics?.memoryUsage ? `${(performanceMetrics.memoryUsage / 1024 / 1024).toFixed(1)}MB` : 'N/A'}
                </p>
              </div>
            </div>
          </motion.div>

          {/* Additional Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.0 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
          >
            <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-4 text-center">
              <Clock className="h-8 w-8 text-amber-500 mx-auto mb-2" />
              <p className="text-sm text-slate-600 dark:text-slate-400">Tiempo Promedio de Lectura</p>
              <p className="text-xl font-bold text-slate-900 dark:text-white">
                {statistics.tiempoPromedioLectura.toFixed(1)}h
              </p>
            </div>
            <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-4 text-center">
              <Target className="h-8 w-8 text-blue-500 mx-auto mb-2" />
              <p className="text-sm text-slate-600 dark:text-slate-400">Libros en TBR</p>
              <p className="text-xl font-bold text-slate-900 dark:text-white">
                {statistics.librosTBR}
              </p>
            </div>
            <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-4 text-center">
              <Heart className="h-8 w-8 text-red-500 mx-auto mb-2" />
              <p className="text-sm text-slate-600 dark:text-slate-400">Libros en Wishlist</p>
              <p className="text-xl font-bold text-slate-900 dark:text-white">
                {statistics.librosWishlist}
              </p>
            </div>
            <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-4 text-center">
              <Activity className="h-8 w-8 text-green-500 mx-auto mb-2" />
              <p className="text-sm text-slate-600 dark:text-slate-400">Sagas Activas</p>
              <p className="text-xl font-bold text-slate-900 dark:text-white">
                {statistics.sagasActivas}
              </p>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default AdvancedStatistics;