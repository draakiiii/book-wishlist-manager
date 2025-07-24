import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Clock, 
  User, 
  BookOpen, 
  CheckCircle, 
  AlertCircle,
  Calendar,
  Search,
  Filter,
  Download,
  Trash2,
  Edit,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  ArrowDown
} from 'lucide-react';
import { useAppState } from '../context/AppStateContext';
import { HistorialPrestamo } from '../types';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface LoanHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const LoanHistoryModal: React.FC<LoanHistoryModalProps> = ({ isOpen, onClose }) => {
  const { state, dispatch } = useAppState();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'todos' | 'activo' | 'devuelto' | 'vencido'>('todos');
  const [sortBy, setSortBy] = useState<'fecha' | 'persona' | 'libro'>('fecha');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const filteredAndSortedLoans = useMemo(() => {
    let filtered = state.historialPrestamos;

    // Filtrar por término de búsqueda
    if (searchTerm) {
      filtered = filtered.filter(loan => {
        const libro = state.libros.find(l => l.id === loan.libroId);
        return (
          libro?.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
          loan.prestadoA.toLowerCase().includes(searchTerm.toLowerCase()) ||
          libro?.autor?.toLowerCase().includes(searchTerm.toLowerCase())
        );
      });
    }

    // Filtrar por estado
    if (filterStatus !== 'todos') {
      filtered = filtered.filter(loan => loan.estado === filterStatus);
    }

    // Ordenar
    filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'fecha':
          comparison = a.fechaPrestamo - b.fechaPrestamo;
          break;
        case 'persona':
          comparison = a.prestadoA.localeCompare(b.prestadoA);
          break;
        case 'libro':
          const libroA = state.libros.find(l => l.id === a.libroId);
          const libroB = state.libros.find(l => l.id === b.libroId);
          comparison = (libroA?.titulo || '').localeCompare(libroB?.titulo || '');
          break;
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return filtered;
  }, [state.historialPrestamos, state.libros, searchTerm, filterStatus, sortBy, sortOrder]);

  const getStatusInfo = (loan: HistorialPrestamo) => {
    const now = Date.now();
    const isOverdue = loan.fechaLimite && now > loan.fechaLimite && loan.estado === 'activo';
    
    switch (loan.estado) {
      case 'activo':
        return {
          icon: isOverdue ? AlertCircle : Clock,
          color: isOverdue ? 'text-red-500' : 'text-blue-500',
          bgColor: isOverdue ? 'bg-red-50 dark:bg-red-900/20' : 'bg-blue-50 dark:bg-blue-900/20',
          text: isOverdue ? 'Vencido' : 'Activo'
        };
      case 'devuelto':
        return {
          icon: CheckCircle,
          color: 'text-green-500',
          bgColor: 'bg-green-50 dark:bg-green-900/20',
          text: 'Devuelto'
        };
      case 'vencido':
        return {
          icon: AlertCircle,
          color: 'text-red-500',
          bgColor: 'bg-red-50 dark:bg-red-900/20',
          text: 'Vencido'
        };
      default:
        return {
          icon: Clock,
          color: 'text-gray-500',
          bgColor: 'bg-gray-50 dark:bg-gray-700',
          text: 'Desconocido'
        };
    }
  };

  const handleReturnBook = (loanId: number) => {
    dispatch({ type: 'DEVOLVER_PRESTAMO', payload: { id: loanId } });
  };

  const handleDeleteLoan = (loanId: number) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este préstamo del historial?')) {
      dispatch({ type: 'DELETE_PRESTAMO', payload: { id: loanId } });
    }
  };

  const exportHistory = () => {
    const csvContent = [
      ['Libro', 'Autor', 'Prestado a', 'Fecha préstamo', 'Fecha límite', 'Fecha devolución', 'Estado', 'Notas'],
      ...filteredAndSortedLoans.map(loan => {
        const libro = state.libros.find(l => l.id === loan.libroId);
        return [
          libro?.titulo || 'Desconocido',
          libro?.autor || 'Desconocido',
          loan.prestadoA,
          format(loan.fechaPrestamo, 'dd/MM/yyyy', { locale: es }),
          loan.fechaLimite ? format(loan.fechaLimite, 'dd/MM/yyyy', { locale: es }) : '',
          loan.fechaDevolucion ? format(loan.fechaDevolucion, 'dd/MM/yyyy', { locale: es }) : '',
          loan.estado,
          loan.notas || ''
        ];
      })
    ].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `historial_prestamos_${format(Date.now(), 'yyyy-MM-dd')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getStats = () => {
    const total = state.historialPrestamos.length;
    const activos = state.historialPrestamos.filter(l => l.estado === 'activo').length;
    const devueltos = state.historialPrestamos.filter(l => l.estado === 'devuelto').length;
    const vencidos = state.historialPrestamos.filter(l => l.estado === 'vencido').length;
    
    return { total, activos, devueltos, vencidos };
  };

  const stats = getStats();

  if (!isOpen) return null;

  return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <BookOpen className="w-5 h-5" />
              Historial de Préstamos
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-4 gap-4 p-6 bg-gray-50 dark:bg-gray-700">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</div>
              <div className="text-sm text-gray-600 dark:text-gray-300">Total</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.activos}</div>
              <div className="text-sm text-gray-600 dark:text-gray-300">Activos</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{stats.devueltos}</div>
              <div className="text-sm text-gray-600 dark:text-gray-300">Devueltos</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{stats.vencidos}</div>
              <div className="text-sm text-gray-600 dark:text-gray-300">Vencidos</div>
            </div>
          </div>

          {/* Filters */}
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex flex-wrap gap-4 items-center">
              {/* Search */}
              <div className="flex-1 min-w-64">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Buscar por libro, autor o persona..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </div>

              {/* Status Filter */}
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="todos">Todos los estados</option>
                <option value="activo">Activos</option>
                <option value="devuelto">Devueltos</option>
                <option value="vencido">Vencidos</option>
              </select>

              {/* Sort */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="fecha">Por fecha</option>
                <option value="persona">Por persona</option>
                <option value="libro">Por libro</option>
              </select>

              {/* Sort Order */}
              <button
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="p-2 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                {sortOrder === 'asc' ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
              </button>

              {/* Export */}
              <button
                onClick={exportHistory}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
              >
                <Download className="w-4 h-4" />
                Exportar
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="overflow-y-auto max-h-96">
            {filteredAndSortedLoans.length === 0 ? (
              <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No se encontraron préstamos</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredAndSortedLoans.map((loan) => {
                  const libro = state.libros.find(l => l.id === loan.libroId);
                  const statusInfo = getStatusInfo(loan);
                  const StatusIcon = statusInfo.icon;
                  
                  return (
                    <div key={loan.id} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <div className={`p-2 rounded-full ${statusInfo.bgColor}`}>
                              <StatusIcon className={`w-4 h-4 ${statusInfo.color}`} />
                            </div>
                            <div>
                              <h3 className="font-semibold text-gray-900 dark:text-white">
                                {libro?.titulo || 'Libro desconocido'}
                              </h3>
                              <p className="text-sm text-gray-600 dark:text-gray-300">
                                por {libro?.autor || 'Autor desconocido'}
                              </p>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                            <div className="flex items-center gap-2">
                              <User className="w-4 h-4 text-gray-400" />
                              <span className="text-gray-600 dark:text-gray-300">
                                Prestado a: <span className="font-medium">{loan.prestadoA}</span>
                              </span>
                            </div>
                            
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4 text-gray-400" />
                              <span className="text-gray-600 dark:text-gray-300">
                                Fecha: {format(loan.fechaPrestamo, 'dd/MM/yyyy', { locale: es })}
                              </span>
                            </div>
                            
                            {loan.fechaLimite && (
                              <div className="flex items-center gap-2">
                                <Clock className="w-4 h-4 text-gray-400" />
                                <span className="text-gray-600 dark:text-gray-300">
                                  Límite: {format(loan.fechaLimite, 'dd/MM/yyyy', { locale: es })}
                                </span>
                              </div>
                            )}
                          </div>
                          
                          {loan.notas && (
                            <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                              Notas: {loan.notas}
                            </p>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-2 ml-4">
                          {loan.estado === 'activo' && (
                            <button
                              onClick={() => handleReturnBook(loan.id)}
                              className="p-2 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-md transition-colors"
                              title="Marcar como devuelto"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                          )}
                          
                          <button
                            onClick={() => handleDeleteLoan(loan.id)}
                            className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors"
                            title="Eliminar del historial"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
  );
};

export default LoanHistoryModal;