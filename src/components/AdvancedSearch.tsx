import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import { 
  Search, 
  Filter, 
  X, 
  Clock, 
  BookOpen, 
  Heart, 
  Clock as ClockIcon,
  Star,
  Calendar,
  Hash,
  DollarSign,
  Globe,
  Building,
  CheckCircle,
  RotateCcw,
  BookMarked,
  BookX,
  ShoppingCart,
  Share2
} from 'lucide-react';
import { useAppState } from '../context/FirebaseAppStateContext';
import { SearchFilters, Libro } from '../types';
import { useDebounce } from 'use-debounce';
import BookList from './BookList';

interface AdvancedSearchProps {
  onSearch: (results: Libro[]) => void;
  onClose: () => void;
  isOpen: boolean;
}

const AdvancedSearch: React.FC<AdvancedSearchProps> = ({ onSearch, onClose, isOpen }) => {
  const { state, dispatch } = useAppState();
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<SearchFilters>({});
  const [showFilters, setShowFilters] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [debouncedSearchTerm] = useDebounce(searchTerm, 300);

  // Performance optimization: memoize all books with their states
  const allBooks = useMemo(() => {
    return state.libros.map(book => ({
      ...book,
      listType: book.estado as 'tbr' | 'leyendo' | 'leido' | 'abandonado' | 'wishlist' | 'comprado' | 'prestado'
    }));
  }, [state.libros]);

  // Performance optimization: memoize search results
  const searchResults = useMemo(() => {
    if (!debouncedSearchTerm && Object.keys(filters).length === 0) {
      return allBooks;
    }

    return allBooks.filter(book => {
      // Text search
      if (debouncedSearchTerm) {
        const searchLower = debouncedSearchTerm.toLowerCase();
        const matchesTitle = book.titulo?.toLowerCase().includes(searchLower);
        const matchesAuthor = book.autor?.toLowerCase().includes(searchLower);
        const matchesISBN = book.isbn?.toLowerCase().includes(searchLower);
        const matchesEditorial = book.editorial?.toLowerCase().includes(searchLower);
        
        if (!matchesTitle && !matchesAuthor && !matchesISBN && !matchesEditorial) {
          return false;
        }
      }

      // Filters
      if (filters.autor && book.autor?.toLowerCase() !== filters.autor.toLowerCase()) {
        return false;
      }

      if (filters.saga && book.sagaName?.toLowerCase() !== filters.saga.toLowerCase()) {
        return false;
      }

      if (filters.genero && book.genero?.toLowerCase() !== filters.genero.toLowerCase()) {
        return false;
      }

      if (filters.idioma && book.idioma?.toLowerCase() !== filters.idioma.toLowerCase()) {
        return false;
      }

      if (filters.editorial && book.editorial?.toLowerCase() !== filters.editorial.toLowerCase()) {
        return false;
      }

      if (filters.fechaDesde && book.fechaAgregado && book.fechaAgregado < filters.fechaDesde) {
        return false;
      }

      if (filters.fechaHasta && book.fechaAgregado && book.fechaAgregado > filters.fechaHasta) {
        return false;
      }

      if (filters.calificacionMin && book.calificacion && book.calificacion < filters.calificacionMin) {
        return false;
      }

      if (filters.calificacionMax && book.calificacion && book.calificacion > filters.calificacionMax) {
        return false;
      }

      if (filters.paginasMin && book.paginas && book.paginas < filters.paginasMin) {
        return false;
      }

      if (filters.paginasMax && book.paginas && book.paginas > filters.paginasMax) {
        return false;
      }

      if (filters.precioMin && book.precio && book.precio < filters.precioMin) {
        return false;
      }

      if (filters.precioMax && book.precio && book.precio > filters.precioMax) {
        return false;
      }

      if (filters.estado && filters.estado !== 'todos') {
        if (filters.estado === 'prestado') {
          // Para libros prestados, verificar la propiedad prestado
          if (!book.prestado) {
            return false;
          }
        } else {
          // Para otros estados, verificar el estado del libro
          if (book.estado !== filters.estado) {
            return false;
          }
        }
      }

      if (filters.completado !== undefined) {
        const isCompleted = book.estado === 'leido';
        if (filters.completado !== isCompleted) {
          return false;
        }
      }

      return true;
    });
  }, [debouncedSearchTerm, filters, allBooks]);

  // Auto-search when filters change
  useEffect(() => {
    onSearch(searchResults);
  }, [searchResults, onSearch]);

  // Initialize with all books when modal opens
  useEffect(() => {
    if (isOpen) {
      onSearch(allBooks);
    }
  }, [isOpen, allBooks, onSearch]);

  // Add to search history when search is performed
  useEffect(() => {
    if (debouncedSearchTerm && state.config.searchHistoryEnabled) {
      dispatch({ type: 'ADD_SEARCH_HISTORY', payload: debouncedSearchTerm });
    }
  }, [debouncedSearchTerm, dispatch, state.config.searchHistoryEnabled]);

  const handleSearchFromHistory = useCallback((term: string) => {
    setSearchTerm(term);
    setShowHistory(false);
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({});
    setSearchTerm('');
  }, []);

  const updateFilter = useCallback((key: keyof SearchFilters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  }, []);

  // Get unique values for filter options
  const filterOptions = useMemo(() => {
    const options = {
      autores: [...new Set(allBooks.map(book => book.autor).filter(Boolean))],
      sagas: [...new Set(allBooks.map(book => book.sagaName).filter(Boolean))],
      generos: [...new Set(allBooks.map(book => book.genero).filter(Boolean))],
      idiomas: [...new Set(allBooks.map(book => book.idioma).filter(Boolean))],
      editoriales: [...new Set(allBooks.map(book => book.editorial).filter(Boolean))]
    };
    return options;
  }, [allBooks]);

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
        className="relative bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-6xl w-full mx-4 max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center space-x-2">
            <Search className="h-5 w-5 text-primary-500" />
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
              Búsqueda Avanzada
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors duration-200"
          >
            <X className="h-5 w-5 text-slate-500" />
          </button>
        </div>

        <div className="flex flex-col h-[calc(90vh-80px)]">
          {/* Search and Filters Section */}
          <div className="p-4 sm:p-6 border-b border-slate-200 dark:border-slate-700 overflow-y-auto">
            {/* Search Bar */}
            <div className="mb-4 sm:mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Buscar por título, autor, ISBN, editorial..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 hover:bg-slate-200 dark:hover:bg-slate-600 rounded"
                  >
                    <X className="h-4 w-4 text-slate-400" />
                  </button>
                )}
              </div>
            </div>

            {/* Quick Filters */}
            <div className="mb-4 sm:mb-6">
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <h4 className="text-base sm:text-lg font-semibold text-slate-900 dark:text-white flex items-center space-x-2">
                  <Filter className="h-4 w-4 sm:h-5 sm:w-5 text-primary-500" />
                  <span>Filtros Rápidos</span>
                </h4>
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="text-xs sm:text-sm text-primary-600 dark:text-primary-400 hover:underline"
                >
                  {showFilters ? 'Ocultar' : 'Mostrar'} filtros avanzados
                </button>
              </div>

                          {/* Estado Filter */}
            <div className="grid grid-cols-4 sm:grid-cols-4 lg:grid-cols-6 gap-1 sm:gap-2 mb-3 sm:mb-4">
              {[
                { value: 'todos', label: 'Todos', icon: BookOpen, color: 'bg-slate-500', shortLabel: 'Todos' },
                { value: 'tbr', label: 'TBR', icon: BookMarked, color: 'bg-blue-500', shortLabel: 'TBR' },
                { value: 'leyendo', label: 'Leyendo', icon: Clock, color: 'bg-orange-500', shortLabel: 'Leyendo' },
                { value: 'leido', label: 'Leídos', icon: CheckCircle, color: 'bg-green-500', shortLabel: 'Leídos' },
                { value: 'abandonado', label: 'Abandonados', icon: BookX, color: 'bg-red-500', shortLabel: 'Abandonados' },
                { value: 'wishlist', label: 'Wishlist', icon: Heart, color: 'bg-pink-500', shortLabel: 'Wishlist' },
                { value: 'prestado', label: 'Prestados', icon: Share2, color: 'bg-purple-500', shortLabel: 'Prestados' }
              ].map(({ value, label, icon: Icon, color, shortLabel }) => (
                <button
                  key={value}
                  onClick={() => updateFilter('estado', filters.estado === value ? 'todos' : value)}
                  className={`flex flex-col items-center justify-center p-1.5 sm:p-2 rounded-lg text-xs sm:text-sm font-medium transition-colors duration-200 ${
                    filters.estado === value
                      ? `${color} text-white`
                      : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                  }`}
                >
                  <Icon className="h-3 w-3 sm:h-4 sm:w-4 mb-1" />
                  <span className="hidden sm:inline text-center">{label}</span>
                  <span className="sm:hidden text-center text-[10px] leading-tight">{shortLabel}</span>
                </button>
              ))}
            </div>

              {/* Results Count */}
              <div className="flex items-center justify-between text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                <span>{searchResults.length} resultados encontrados</span>
                <button
                  onClick={clearFilters}
                  className="flex items-center space-x-1 text-primary-600 dark:text-primary-400 hover:underline"
                >
                  <RotateCcw className="h-3 w-3" />
                  <span>Limpiar filtros</span>
                </button>
              </div>
            </div>

            {/* Advanced Filters */}
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-4 sm:mb-6 p-3 sm:p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg"
              >
                <h5 className="text-sm sm:text-md font-semibold text-slate-900 dark:text-white mb-3 sm:mb-4">
                  Filtros Avanzados
                </h5>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                  {/* Author Filter */}
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 sm:mb-2">
                      Autor
                    </label>
                    <select
                      value={filters.autor || ''}
                      onChange={(e) => updateFilter('autor', e.target.value || undefined)}
                      className="w-full p-2 text-xs sm:text-sm border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                    >
                      <option value="">Todos los autores</option>
                      {filterOptions.autores.map(autor => (
                        <option key={autor} value={autor}>{autor}</option>
                      ))}
                    </select>
                  </div>

                  {/* Saga Filter */}
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 sm:mb-2">
                      Saga
                    </label>
                    <select
                      value={filters.saga || ''}
                      onChange={(e) => updateFilter('saga', e.target.value || undefined)}
                      className="w-full p-2 text-xs sm:text-sm border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                    >
                      <option value="">Todas las sagas</option>
                      {filterOptions.sagas.map(saga => (
                        <option key={saga} value={saga}>{saga}</option>
                      ))}
                    </select>
                  </div>

                  {/* Genre Filter */}
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 sm:mb-2">
                      Género
                    </label>
                    <select
                      value={filters.genero || ''}
                      onChange={(e) => updateFilter('genero', e.target.value || undefined)}
                      className="w-full p-2 text-xs sm:text-sm border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                    >
                      <option value="">Todos los géneros</option>
                      {filterOptions.generos.map(genero => (
                        <option key={genero} value={genero}>{genero}</option>
                      ))}
                    </select>
                  </div>

                  {/* Language Filter */}
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 sm:mb-2">
                      Idioma
                    </label>
                    <select
                      value={filters.idioma || ''}
                      onChange={(e) => updateFilter('idioma', e.target.value || undefined)}
                      className="w-full p-2 text-xs sm:text-sm border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                    >
                      <option value="">Todos los idiomas</option>
                      {filterOptions.idiomas.map(idioma => (
                        <option key={idioma} value={idioma}>{idioma}</option>
                      ))}
                    </select>
                  </div>

                  {/* Editorial Filter */}
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 sm:mb-2">
                      Editorial
                    </label>
                    <select
                      value={filters.editorial || ''}
                      onChange={(e) => updateFilter('editorial', e.target.value || undefined)}
                      className="w-full p-2 text-xs sm:text-sm border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                    >
                      <option value="">Todas las editoriales</option>
                      {filterOptions.editoriales.map(editorial => (
                        <option key={editorial} value={editorial}>{editorial}</option>
                      ))}
                    </select>
                  </div>

                  {/* Completion Filter */}
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 sm:mb-2">
                      Estado de Lectura
                    </label>
                    <select
                      value={filters.completado === undefined ? '' : filters.completado ? 'true' : 'false'}
                      onChange={(e) => updateFilter('completado', e.target.value === '' ? undefined : e.target.value === 'true')}
                      className="w-full p-2 text-xs sm:text-sm border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                    >
                      <option value="">Todos</option>
                      <option value="true">Completados</option>
                      <option value="false">No completados</option>
                    </select>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Search History */}
            {showHistory && state.searchHistory.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4 sm:mb-6 p-3 sm:p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg"
              >
                <h5 className="text-sm sm:text-md font-semibold text-slate-900 dark:text-white mb-3">
                  Historial de Búsquedas
                </h5>
                <div className="space-y-2">
                  {state.searchHistory.slice(0, 5).map((term, index) => (
                    <button
                      key={index}
                      onClick={() => handleSearchFromHistory(term)}
                      className="w-full text-left p-2 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-lg text-xs sm:text-sm text-slate-700 dark:text-slate-300"
                    >
                      {term}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </div>

          {/* Results Section */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6">
            <BookList 
              books={searchResults}
              type="todos"
              emptyMessage="No se encontraron libros que coincidan con los filtros aplicados."
            />
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default AdvancedSearch;