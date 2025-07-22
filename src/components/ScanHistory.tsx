import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  History, 
  Search, 
  X, 
  Trash2, 
  CheckCircle, 
  AlertCircle, 
  Clock,
  Barcode,
  BookOpen,
  User,
  Filter,
  RotateCcw
} from 'lucide-react';
import { useAppState } from '../context/AppStateContext';
import { ScanHistory as ScanHistoryType } from '../types';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface ScanHistoryProps {
  isOpen: boolean;
  onClose: () => void;
}

const ScanHistory: React.FC<ScanHistoryProps> = ({ isOpen, onClose }) => {
  const { state, dispatch } = useAppState();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSuccess, setFilterSuccess] = useState<'all' | 'success' | 'error'>('all');
  const [sortBy, setSortBy] = useState<'timestamp' | 'isbn' | 'titulo'>('timestamp');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const filteredAndSortedHistory = useMemo(() => {
    let filtered = state.scanHistory;

    // Filter by search term
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(scan => 
        scan.isbn.toLowerCase().includes(searchLower) ||
        scan.titulo?.toLowerCase().includes(searchLower) ||
        scan.autor?.toLowerCase().includes(searchLower) ||
        scan.errorMessage?.toLowerCase().includes(searchLower)
      );
    }

    // Filter by success status
    if (filterSuccess !== 'all') {
      filtered = filtered.filter(scan => 
        filterSuccess === 'success' ? scan.success : !scan.success
      );
    }

    // Sort
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;

      switch (sortBy) {
        case 'timestamp':
          aValue = a.timestamp;
          bValue = b.timestamp;
          break;
        case 'isbn':
          aValue = a.isbn;
          bValue = b.isbn;
          break;
        case 'titulo':
          aValue = a.titulo || '';
          bValue = b.titulo || '';
          break;
        default:
          aValue = a.timestamp;
          bValue = b.timestamp;
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  }, [state.scanHistory, searchTerm, filterSuccess, sortBy, sortOrder]);

  const clearHistory = () => {
    if (window.confirm('¿Estás seguro de que quieres eliminar todo el historial de escaneos?')) {
      dispatch({ type: 'CLEAR_SCAN_HISTORY' });
    }
  };

  const getSuccessRate = () => {
    if (state.scanHistory.length === 0) return 0;
    const successful = state.scanHistory.filter(scan => scan.success).length;
    return Math.round((successful / state.scanHistory.length) * 100);
  };

  const getRecentScans = () => {
    const now = Date.now();
    const oneDay = 24 * 60 * 60 * 1000;
    return state.scanHistory.filter(scan => now - scan.timestamp < oneDay).length;
  };

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
            <History className="h-5 w-5 text-primary-500" />
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
              Historial de Escaneos
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors duration-200"
          >
            <X className="h-5 w-5 text-slate-500" />
          </button>
        </div>

        <div className="flex flex-col h-full">
          {/* Stats Bar */}
          <div className="p-4 bg-slate-50 dark:bg-slate-700/50 border-b border-slate-200 dark:border-slate-700">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                  {state.scanHistory.length}
                </p>
                <p className="text-sm text-slate-600 dark:text-slate-400">Total Escaneos</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {getSuccessRate()}%
                </p>
                <p className="text-sm text-slate-600 dark:text-slate-400">Tasa de Éxito</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {getRecentScans()}
                </p>
                <p className="text-sm text-slate-600 dark:text-slate-400">Últimas 24h</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                  {state.scanHistory.filter(scan => scan.titulo).length}
                </p>
                <p className="text-sm text-slate-600 dark:text-slate-400">Con Título</p>
              </div>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="p-4 border-b border-slate-200 dark:border-slate-700">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search */}
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Buscar por ISBN, título, autor..."
                    className="w-full pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Filters */}
              <div className="flex gap-2">
                <select
                  value={filterSuccess}
                  onChange={(e) => setFilterSuccess(e.target.value as 'all' | 'success' | 'error')}
                  className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                >
                  <option value="all">Todos</option>
                  <option value="success">Exitosos</option>
                  <option value="error">Errores</option>
                </select>

                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as 'timestamp' | 'isbn' | 'titulo')}
                  className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                >
                  <option value="timestamp">Fecha</option>
                  <option value="isbn">ISBN</option>
                  <option value="titulo">Título</option>
                </select>

                <button
                  onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                  className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors duration-200"
                >
                  {sortOrder === 'asc' ? '↑' : '↓'}
                </button>

                <button
                  onClick={clearHistory}
                  className="px-3 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors duration-200 flex items-center space-x-1"
                >
                  <Trash2 className="h-4 w-4" />
                  <span className="hidden md:inline">Limpiar</span>
                </button>
              </div>
            </div>
          </div>

          {/* Results */}
          <div className="flex-1 overflow-y-auto">
            {filteredAndSortedHistory.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <History className="h-12 w-12 text-slate-400 mb-4" />
                <p className="text-lg font-medium text-slate-600 dark:text-slate-400 mb-2">
                  {state.scanHistory.length === 0 ? 'No hay escaneos registrados' : 'No se encontraron resultados'}
                </p>
                <p className="text-sm text-slate-500 dark:text-slate-500">
                  {state.scanHistory.length === 0 
                    ? 'Los escaneos aparecerán aquí una vez que uses el escáner de códigos de barras'
                    : 'Intenta ajustar los filtros de búsqueda'
                  }
                </p>
              </div>
            ) : (
              <div className="divide-y divide-slate-200 dark:divide-slate-700">
                {filteredAndSortedHistory.map((scan) => (
                  <motion.div
                    key={scan.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors duration-200"
                  >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            {scan.success ? (
                              <CheckCircle className="h-4 w-4 text-green-500" />
                            ) : (
                              <AlertCircle className="h-4 w-4 text-red-500" />
                            )}
                            <span className="font-mono text-sm text-slate-600 dark:text-slate-400">
                              {scan.isbn}
                            </span>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              scan.success 
                                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                            }`}>
                              {scan.success ? 'Exitoso' : 'Error'}
                            </span>
                          </div>

                          {scan.titulo && (
                            <div className="flex items-center space-x-2 mb-1">
                              <BookOpen className="h-3 w-3 text-slate-400" />
                              <span className="text-sm font-medium text-slate-900 dark:text-white">
                                {scan.titulo}
                              </span>
                            </div>
                          )}

                          {scan.autor && (
                            <div className="flex items-center space-x-2 mb-2">
                              <User className="h-3 w-3 text-slate-400" />
                              <span className="text-sm text-slate-600 dark:text-slate-400">
                                {scan.autor}
                              </span>
                            </div>
                          )}

                          {scan.errorMessage && (
                            <div className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 rounded p-2 mt-2">
                              {scan.errorMessage}
                            </div>
                          )}

                          <div className="flex items-center space-x-2 mt-2">
                            <Clock className="h-3 w-3 text-slate-400" />
                            <span className="text-xs text-slate-500 dark:text-slate-500">
                              {format(new Date(scan.timestamp), 'dd/MM/yyyy HH:mm', { locale: es })}
                            </span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-4 bg-slate-50 dark:bg-slate-700/50 border-t border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between text-sm text-slate-600 dark:text-slate-400">
              <span>
                Mostrando {filteredAndSortedHistory.length} de {state.scanHistory.length} escaneos
              </span>
              <span>
                Último escaneo: {state.scanHistory.length > 0 
                  ? format(new Date(state.scanHistory[0].timestamp), 'dd/MM/yyyy HH:mm', { locale: es })
                  : 'Nunca'
                }
              </span>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default ScanHistory;