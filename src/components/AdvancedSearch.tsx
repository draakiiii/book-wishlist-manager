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
  RotateCcw
} from 'lucide-react';
import { useAppState } from '../context/AppStateContext';
import { SearchFilters, Libro } from '../types';
import { useDebounce } from 'use-debounce';

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

  // Performance optimization: memoize all books
  const allBooks = useMemo(() => {
    const books: Array<Libro & { listType: 'tbr' | 'historial' | 'wishlist' | 'actual' }> = [
      ...state.tbr.map(book => ({ ...book, listType: 'tbr' as const })),
      ...state.historial.map(book => ({ ...book, listType: 'historial' as const })),
      ...state.wishlist.map(book => ({ ...book, listType: 'wishlist' as const })),
      ...(state.libroActual ? [{ ...state.libroActual, listType: 'actual' as const }] : [])
    ];
    return books;
  }, [state.tbr, state.historial, state.wishlist, state.libroActual]);

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

      if (filters.estado && filters.estado !== 'todos' && book.listType !== filters.estado) {
        return false;
      }

      if (filters.completado !== undefined) {
        const isCompleted = book.listType === 'historial';
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
        className="relative bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden"
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

        <div className="flex flex-col h-full">
          {/* Search Bar */}
          <div className="p-4 border-b border-slate-200 dark:border-slate-700">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar por título, autor, ISBN, editorial..."
                className="w-full pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 hover:bg-slate-200 dark:hover:bg-slate-600 rounded"
                >
                  <X className="h-3 w-3 text-slate-400" />
                </button>
              )}
            </div>

            {/* Search History */}
            {showHistory && state.searchHistory.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-2 bg-slate-50 dark:bg-slate-700 rounded-lg p-2"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Historial de búsquedas
                  </span>
                  <button
                    onClick={() => dispatch({ type: 'CLEAR_SEARCH_HISTORY' })}
                    className="text-xs text-red-500 hover:text-red-700"
                  >
                    Limpiar
                  </button>
                </div>
                <div className="space-y-1">
                  {state.searchHistory.slice(0, 5).map((term, index) => (
                    <button
                      key={index}
                      onClick={() => handleSearchFromHistory(term)}
                      className="w-full text-left px-2 py-1 text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600 rounded flex items-center space-x-2"
                    >
                      <Clock className="h-3 w-3" />
                      <span>{term}</span>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Controls */}
            <div className="flex items-center justify-between mt-3">
              <div className="flex space-x-2">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors duration-200 flex items-center space-x-1 ${
                    showFilters 
                      ? 'bg-primary-500 text-white' 
                      : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <Filter className="h-3 w-3" />
                  <span>Filtros</span>
                </button>
                <button
                  onClick={() => setShowHistory(!showHistory)}
                  className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors duration-200 flex items-center space-x-1 ${
                    showHistory 
                      ? 'bg-primary-500 text-white' 
                      : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <Clock className="h-3 w-3" />
                  <span>Historial</span>
                </button>
              </div>
              <button
                onClick={clearFilters}
                className="px-3 py-1 rounded-lg text-sm font-medium bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors duration-200 flex items-center space-x-1"
              >
                <RotateCcw className="h-3 w-3" />
                <span>Limpiar</span>
              </button>
            </div>
          </div>

                           {/* Filters Panel */}
                 {showFilters && (
                   <motion.div
                     initial={{ height: 0, opacity: 0 }}
                     animate={{ height: 'auto', opacity: 1 }}
                     className="border-b border-slate-200 dark:border-slate-700 overflow-hidden"
                   >
                <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* Estado */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Estado
                    </label>
                    <select
                      value={filters.estado || 'todos'}
                      onChange={(e) => updateFilter('estado', e.target.value === 'todos' ? undefined : e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                    >
                      <option value="todos">Todos</option>
                      <option value="tbr">TBR</option>
                      <option value="historial">Historial</option>
                      <option value="wishlist">Wishlist</option>
                      <option value="actual">Actual</option>
                    </select>
                  </div>

                  {/* Autor */}
                  {filterOptions.autores.length > 0 && (
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                        Autor
                      </label>
                      <select
                        value={filters.autor || ''}
                        onChange={(e) => updateFilter('autor', e.target.value || undefined)}
                        className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                      >
                        <option value="">Todos los autores</option>
                        {filterOptions.autores.map(autor => (
                          <option key={autor} value={autor}>{autor}</option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* Saga */}
                  {filterOptions.sagas.length > 0 && (
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                        Saga
                      </label>
                      <select
                        value={filters.saga || ''}
                        onChange={(e) => updateFilter('saga', e.target.value || undefined)}
                        className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                      >
                        <option value="">Todas las sagas</option>
                        {filterOptions.sagas.map(saga => (
                          <option key={saga} value={saga}>{saga}</option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* Género */}
                  {filterOptions.generos.length > 0 && (
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                        Género
                      </label>
                      <select
                        value={filters.genero || ''}
                        onChange={(e) => updateFilter('genero', e.target.value || undefined)}
                        className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                      >
                        <option value="">Todos los géneros</option>
                        {filterOptions.generos.map(genero => (
                          <option key={genero} value={genero}>{genero}</option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* Idioma */}
                  {filterOptions.idiomas.length > 0 && (
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                        Idioma
                      </label>
                      <select
                        value={filters.idioma || ''}
                        onChange={(e) => updateFilter('idioma', e.target.value || undefined)}
                        className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                      >
                        <option value="">Todos los idiomas</option>
                        {filterOptions.idiomas.map(idioma => (
                          <option key={idioma} value={idioma}>{idioma}</option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* Editorial */}
                  {filterOptions.editoriales.length > 0 && (
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                        Editorial
                      </label>
                      <select
                        value={filters.editorial || ''}
                        onChange={(e) => updateFilter('editorial', e.target.value || undefined)}
                        className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                      >
                        <option value="">Todas las editoriales</option>
                        {filterOptions.editoriales.map(editorial => (
                          <option key={editorial} value={editorial}>{editorial}</option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* Calificación */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Calificación
                    </label>
                    <div className="flex space-x-2">
                      <input
                        type="number"
                        min="1"
                        max="5"
                        placeholder="Min"
                        value={filters.calificacionMin || ''}
                        onChange={(e) => updateFilter('calificacionMin', e.target.value ? Number(e.target.value) : undefined)}
                        className="w-1/2 px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                      />
                      <input
                        type="number"
                        min="1"
                        max="5"
                        placeholder="Max"
                        value={filters.calificacionMax || ''}
                        onChange={(e) => updateFilter('calificacionMax', e.target.value ? Number(e.target.value) : undefined)}
                        className="w-1/2 px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                      />
                    </div>
                  </div>

                  {/* Páginas */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Páginas
                    </label>
                    <div className="flex space-x-2">
                      <input
                        type="number"
                        min="1"
                        placeholder="Min"
                        value={filters.paginasMin || ''}
                        onChange={(e) => updateFilter('paginasMin', e.target.value ? Number(e.target.value) : undefined)}
                        className="w-1/2 px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                      />
                      <input
                        type="number"
                        min="1"
                        placeholder="Max"
                        value={filters.paginasMax || ''}
                        onChange={(e) => updateFilter('paginasMax', e.target.value ? Number(e.target.value) : undefined)}
                        className="w-1/2 px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                      />
                    </div>
                  </div>

                  {/* Precio */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Precio
                    </label>
                    <div className="flex space-x-2">
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="Min"
                        value={filters.precioMin || ''}
                        onChange={(e) => updateFilter('precioMin', e.target.value ? Number(e.target.value) : undefined)}
                        className="w-1/2 px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                      />
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="Max"
                        value={filters.precioMax || ''}
                        onChange={(e) => updateFilter('precioMax', e.target.value ? Number(e.target.value) : undefined)}
                        className="w-1/2 px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                      />
                    </div>
                  </div>

                  {/* Completado */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Estado de lectura
                    </label>
                    <select
                      value={filters.completado === undefined ? 'todos' : filters.completado ? 'completado' : 'pendiente'}
                      onChange={(e) => updateFilter('completado', e.target.value === 'todos' ? undefined : e.target.value === 'completado')}
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                    >
                      <option value="todos">Todos</option>
                      <option value="completado">Completados</option>
                      <option value="pendiente">Pendientes</option>
                    </select>
                  </div>
                                       </div>
                     </motion.div>
                   )}

          {/* Results Summary */}
          <div className="p-4 bg-slate-50 dark:bg-slate-700/50 border-b border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600 dark:text-slate-400">
                {searchResults.length} resultado{searchResults.length !== 1 ? 's' : ''} encontrado{searchResults.length !== 1 ? 's' : ''}
              </span>
              <div className="flex items-center space-x-4 text-xs text-slate-500 dark:text-slate-400">
                <span className="flex items-center space-x-1">
                  <BookOpen className="h-3 w-3" />
                  <span>TBR: {searchResults.filter(b => b.listType === 'tbr').length}</span>
                </span>
                <span className="flex items-center space-x-1">
                  <CheckCircle className="h-3 w-3" />
                  <span>Historial: {searchResults.filter(b => b.listType === 'historial').length}</span>
                </span>
                <span className="flex items-center space-x-1">
                  <Heart className="h-3 w-3" />
                  <span>Wishlist: {searchResults.filter(b => b.listType === 'wishlist').length}</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default AdvancedSearch;