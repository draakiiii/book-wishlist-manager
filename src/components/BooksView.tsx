import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  Filter,
  Search,
  List,
  Grid,
  SortAsc,
  SortDesc,
  Calendar,
  Star,
  BookOpen,
  X,
  CheckCircle,
  Clock,
  Heart,
  BookMarked,
  BookX,
  Share2,
  RotateCcw,
  Hash,
  Globe,
  Building,
  Edit3,
  CheckSquare,
  Square,
  Trash2
} from 'lucide-react';
import { useAppState } from '../context/AppStateContext';
import { Libro } from '../types';
import BookCard from './BookCard';
import BookEditModal from './BookEditModal';
import { useDialog } from '../hooks/useDialog';
import Dialog from './Dialog';

export type BooksViewMode = 'list' | 'gallery';

interface BooksViewProps {
  viewMode: BooksViewMode;
  onViewModeChange: (mode: BooksViewMode) => void;
}

type SortOption = 'titulo' | 'autor' | 'fechaAgregado' | 'fechaFin' | 'calificacion' | 'estado';
type SortDirection = 'asc' | 'desc';
type FilterState = 'todos' | 'wishlist' | 'tbr' | 'leyendo' | 'leido' | 'abandonado';

const BooksView: React.FC<BooksViewProps> = ({ viewMode, onViewModeChange }) => {
  const { state, dispatch } = useAppState();
  const { dialog, showConfirm, hideDialog } = useDialog();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterState, setFilterState] = useState<FilterState>('todos');
  const [sortBy, setSortBy] = useState<SortOption>('fechaAgregado');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [showFilters, setShowFilters] = useState(false);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [editingBook, setEditingBook] = useState<Libro | null>(null);
  
  // Edición masiva
  const [isBulkEditMode, setIsBulkEditMode] = useState(false);
  const [selectedBooks, setSelectedBooks] = useState<Set<number>>(new Set());
  
  // Filtros avanzados
  const [autorFilter, setAutorFilter] = useState('');
  const [sagaFilter, setSagaFilter] = useState('');
  const [generoFilter, setGeneroFilter] = useState('');
  const [editorialFilter, setEditorialFilter] = useState('');
  const [idiomaFilter, setIdiomaFilter] = useState('');
  const [formatoFilter, setFormatoFilter] = useState('');
  const [calificacionMin, setCalificacionMin] = useState('');
  const [calificacionMax, setCalificacionMax] = useState('');
  const [paginasMin, setPaginasMin] = useState('');
  const [paginasMax, setPaginasMax] = useState('');
  const [fechaDesde, setFechaDesde] = useState('');
  const [fechaHasta, setFechaHasta] = useState('');

  // Opciones para filtros avanzados
  const filterOptions = useMemo(() => {
    const autores = [...new Set(state.libros.map(l => l.autor).filter(Boolean))].sort();
    const sagas = [...new Set(state.libros.map(l => l.sagaName).filter(Boolean))].sort();
    const generos = [...new Set(state.libros.map(l => l.genero).filter(Boolean))].sort();
    const editoriales = [...new Set(state.libros.map(l => l.editorial).filter(Boolean))].sort();
    const idiomas = [...new Set(state.libros.map(l => l.idioma).filter(Boolean))].sort();
    const formatos = [...new Set(state.libros.map(l => l.formato).filter(Boolean))].sort();
    
    return { autores, sagas, generos, editoriales, idiomas, formatos };
  }, [state.libros]);

  // Filtrar y ordenar libros
  const filteredAndSortedBooks = useMemo(() => {
    let filtered = state.libros;

    // Filtrar por texto de búsqueda
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(libro =>
        libro.titulo.toLowerCase().includes(searchLower) ||
        (libro.autor && libro.autor.toLowerCase().includes(searchLower)) ||
        (libro.genero && libro.genero.toLowerCase().includes(searchLower)) ||
        (libro.editorial && libro.editorial.toLowerCase().includes(searchLower)) ||
        (libro.isbn && libro.isbn.toLowerCase().includes(searchLower))
      );
    }

    // Filtrar por estado
    if (filterState !== 'todos') {
      filtered = filtered.filter(libro => libro.estado === filterState);
    }

    // Filtros avanzados
    if (autorFilter) {
      filtered = filtered.filter(libro => libro.autor === autorFilter);
    }
    
    if (sagaFilter) {
      filtered = filtered.filter(libro => libro.sagaName === sagaFilter);
    }
    
    if (generoFilter) {
      filtered = filtered.filter(libro => libro.genero === generoFilter);
    }
    
    if (editorialFilter) {
      filtered = filtered.filter(libro => libro.editorial === editorialFilter);
    }
    
    if (idiomaFilter) {
      filtered = filtered.filter(libro => libro.idioma === idiomaFilter);
    }
    
    if (formatoFilter) {
      filtered = filtered.filter(libro => libro.formato === formatoFilter);
    }
    
    if (calificacionMin) {
      const min = parseFloat(calificacionMin);
      filtered = filtered.filter(libro => (libro.calificacion || 0) >= min);
    }
    
    if (calificacionMax) {
      const max = parseFloat(calificacionMax);
      filtered = filtered.filter(libro => (libro.calificacion || 0) <= max);
    }
    
    if (paginasMin) {
      const min = parseInt(paginasMin);
      filtered = filtered.filter(libro => (libro.paginas || 0) >= min);
    }
    
    if (paginasMax) {
      const max = parseInt(paginasMax);
      filtered = filtered.filter(libro => (libro.paginas || 0) <= max);
    }
    
    if (fechaDesde) {
      const desde = new Date(fechaDesde).getTime();
      filtered = filtered.filter(libro => (libro.fechaAgregado || 0) >= desde);
    }
    
    if (fechaHasta) {
      const hasta = new Date(fechaHasta).getTime();
      filtered = filtered.filter(libro => (libro.fechaAgregado || 0) <= hasta);
    }

    // Ordenar
    filtered.sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (sortBy) {
        case 'titulo':
          aValue = a.titulo.toLowerCase();
          bValue = b.titulo.toLowerCase();
          break;
        case 'autor':
          aValue = (a.autor || '').toLowerCase();
          bValue = (b.autor || '').toLowerCase();
          break;
        case 'fechaAgregado':
          aValue = new Date(a.fechaAgregado || 0);
          bValue = new Date(b.fechaAgregado || 0);
          break;
        case 'fechaFin':
          aValue = a.fechaFin ? new Date(a.fechaFin) : new Date(0);
          bValue = b.fechaFin ? new Date(b.fechaFin) : new Date(0);
          break;
        case 'calificacion':
          aValue = a.calificacion || 0;
          bValue = b.calificacion || 0;
          break;
        case 'estado':
          aValue = a.estado;
          bValue = b.estado;
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [state.libros, searchTerm, filterState, sortBy, sortDirection, autorFilter, sagaFilter, generoFilter, editorialFilter, idiomaFilter, formatoFilter, calificacionMin, calificacionMax, paginasMin, paginasMax, fechaDesde, fechaHasta]);

  const handleDelete = (id: number) => {
    const book = state.libros.find(libro => libro.id === id);
    showConfirm(
      'Eliminar libro',
      `¿Estás seguro de que quieres eliminar "${book?.titulo || 'este libro'}" de tu biblioteca?\n\nEsta acción no se puede deshacer.`,
      () => {
        dispatch({ type: 'DELETE_BOOK', payload: id });
      },
      undefined,
      'Eliminar',
      'Cancelar'
    );
  };

  const handleEdit = (book: Libro) => {
    setEditingBook(book);
  };

  // Funciones de edición masiva
  const toggleBulkEditMode = () => {
    setIsBulkEditMode(!isBulkEditMode);
    setSelectedBooks(new Set());
  };

  const toggleBookSelection = (bookId: number) => {
    const newSelected = new Set(selectedBooks);
    if (newSelected.has(bookId)) {
      newSelected.delete(bookId);
    } else {
      newSelected.add(bookId);
    }
    setSelectedBooks(newSelected);
  };

  const selectAllBooks = () => {
    setSelectedBooks(new Set(filteredAndSortedBooks.map(book => book.id)));
  };

  const deselectAllBooks = () => {
    setSelectedBooks(new Set());
  };

  const handleBulkStateChange = (newState: Libro['estado']) => {
    if (selectedBooks.size === 0) return;

    const bookTitles = Array.from(selectedBooks)
      .map(id => state.libros.find(book => book.id === id)?.titulo)
      .filter(Boolean)
      .slice(0, 3)
      .join(', ');

    const moreBooks = selectedBooks.size > 3 ? ` y ${selectedBooks.size - 3} más` : '';

    showConfirm(
      'Cambiar estado de libros',
      `¿Estás seguro de que quieres cambiar el estado de "${bookTitles}${moreBooks}" a "${newState}"?`,
      () => {
        selectedBooks.forEach(bookId => {
          dispatch({ 
            type: 'CHANGE_BOOK_STATE', 
            payload: { id: bookId, newState } 
          });
        });
        setSelectedBooks(new Set());
        setIsBulkEditMode(false);
      },
      undefined,
      'Cambiar',
      'Cancelar'
    );
  };

  const handleBulkDelete = () => {
    if (selectedBooks.size === 0) return;

    const bookTitles = Array.from(selectedBooks)
      .map(id => state.libros.find(book => book.id === id)?.titulo)
      .filter(Boolean)
      .slice(0, 3)
      .join(', ');

    const moreBooks = selectedBooks.size > 3 ? ` y ${selectedBooks.size - 3} más` : '';

    showConfirm(
      'Eliminar libros',
      `¿Estás seguro de que quieres eliminar "${bookTitles}${moreBooks}" de tu biblioteca?\n\nEsta acción no se puede deshacer.`,
      () => {
        selectedBooks.forEach(bookId => {
          dispatch({ type: 'DELETE_BOOK', payload: bookId });
        });
        setSelectedBooks(new Set());
        setIsBulkEditMode(false);
      },
      undefined,
      'Eliminar',
      'Cancelar'
    );
  };

  const getFilterCount = (estado: FilterState) => {
    if (estado === 'todos') return state.libros.length;
    return state.libros.filter(libro => libro.estado === estado).length;
  };

  const toggleSort = (option: SortOption) => {
    if (sortBy === option) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(option);
      setSortDirection('asc');
    }
  };

  const clearAllFilters = () => {
    setSearchTerm('');
    setFilterState('todos');
    setAutorFilter('');
    setSagaFilter('');
    setGeneroFilter('');
    setEditorialFilter('');
    setIdiomaFilter('');
    setFormatoFilter('');
    setCalificacionMin('');
    setCalificacionMax('');
    setPaginasMin('');
    setPaginasMax('');
    setFechaDesde('');
    setFechaHasta('');
  };

  const hasActiveFilters = searchTerm || filterState !== 'todos' || autorFilter || sagaFilter || generoFilter || editorialFilter || idiomaFilter || formatoFilter || calificacionMin || calificacionMax || paginasMin || paginasMax || fechaDesde || fechaHasta;

  return (
    <div className="space-y-6">
      {/* Header con controles */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white mb-2">
            Mi Biblioteca
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            {filteredAndSortedBooks.length} {filteredAndSortedBooks.length === 1 ? 'libro' : 'libros'}
            {filterState !== 'todos' && ` en ${filterState}`}
            {isBulkEditMode && selectedBooks.size > 0 && ` (${selectedBooks.size} seleccionados)`}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Botón de edición masiva */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={toggleBulkEditMode}
            className={`p-2 rounded-lg transition-colors ${
              isBulkEditMode
                ? 'bg-primary-500 text-white'
                : 'bg-white/10 hover:bg-white/20 text-slate-600 dark:text-slate-400'
            }`}
            title="Edición masiva"
          >
            <Edit3 className="h-4 w-4" />
          </motion.button>

          {/* Toggle vista */}
          <div className="flex items-center bg-white/10 rounded-lg p-1">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onViewModeChange('list')}
              className={`p-2 rounded-md transition-colors ${
                viewMode === 'list'
                  ? 'bg-primary-500 text-white'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-white/10'
              }`}
            >
              <List className="h-4 w-4" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onViewModeChange('gallery')}
              className={`p-2 rounded-md transition-colors ${
                viewMode === 'gallery'
                  ? 'bg-primary-500 text-white'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-white/10'
              }`}
            >
              <Grid className="h-4 w-4" />
            </motion.button>
          </div>

          {/* Botón filtros */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowFilters(!showFilters)}
            className={`p-2 rounded-lg transition-colors ${
              showFilters
                ? 'bg-primary-500 text-white'
                : 'bg-white/10 hover:bg-white/20 text-slate-600 dark:text-slate-400'
            }`}
          >
            <Filter className="h-4 w-4" />
          </motion.button>
        </div>
      </div>

      {/* Controles de edición masiva */}
      {isBulkEditMode && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-effect rounded-xl p-4"
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                {selectedBooks.size} de {filteredAndSortedBooks.length} libros seleccionados
              </span>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={selectAllBooks}
                  className="text-xs px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                >
                  Seleccionar todos
                </button>
                <button
                  onClick={deselectAllBooks}
                  className="text-xs px-2 py-1 bg-slate-500 text-white rounded hover:bg-slate-600 transition-colors"
                >
                  Deseleccionar
                </button>
              </div>
            </div>

            {selectedBooks.size > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-slate-600 dark:text-slate-400">Cambiar estado a:</span>
                <select
                  onChange={(e) => handleBulkStateChange(e.target.value as Libro['estado'])}
                  className="text-xs px-2 py-1 border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                  defaultValue=""
                >
                  <option value="" disabled>Seleccionar estado</option>
                  <option value="tbr">TBR</option>
                  <option value="leyendo">Leyendo</option>
                  <option value="leido">Leído</option>
                  <option value="abandonado">Abandonado</option>
                  <option value="wishlist">Wishlist</option>
                </select>
                
                <button
                  onClick={handleBulkDelete}
                  className="text-xs px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition-colors flex items-center gap-1"
                >
                  <Trash2 className="h-3 w-3" />
                  Eliminar
                </button>
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* Panel de filtros y búsqueda */}
      {showFilters && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3 }}
          className="glass-effect rounded-xl p-4 space-y-4"
        >
            {/* Búsqueda */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar por título, autor, género..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="h-5 w-5" />
                </button>
              )}
            </div>

            {/* Filtros rápidos por estado */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Filtros Rápidos por Estado
              </label>
              <div className="grid grid-cols-4 sm:grid-cols-4 lg:grid-cols-7 gap-2 mb-4">
                {[
                  { key: 'todos', label: 'Todos', icon: BookOpen, color: 'bg-slate-500', shortLabel: 'Todos' },
                  { key: 'wishlist', label: 'Lista de Deseos', icon: Heart, color: 'bg-pink-500', shortLabel: 'Wishlist' },
                  { key: 'tbr', label: 'Por Leer', icon: BookMarked, color: 'bg-blue-500', shortLabel: 'TBR' },
                  { key: 'leyendo', label: 'Leyendo', icon: Clock, color: 'bg-orange-500', shortLabel: 'Leyendo' },
                  { key: 'leido', label: 'Leídos', icon: CheckCircle, color: 'bg-green-500', shortLabel: 'Leídos' },
                  { key: 'abandonado', label: 'Abandonados', icon: BookX, color: 'bg-red-500', shortLabel: 'Abandonados' }
                ].map(({ key, label, icon: Icon, color, shortLabel }) => (
                  <motion.button
                    key={key}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setFilterState(key as FilterState)}
                    className={`flex flex-col items-center justify-center p-2 rounded-lg text-xs font-medium transition-colors ${
                      filterState === key
                        ? `${color} text-white`
                        : 'bg-white/50 dark:bg-slate-700/50 text-slate-700 dark:text-slate-300 hover:bg-white/70 dark:hover:bg-slate-700/70'
                    }`}
                  >
                    <Icon className="h-4 w-4 mb-1" />
                    <span className="hidden sm:inline text-center">{label}</span>
                    <span className="sm:hidden text-center text-[10px] leading-tight">{shortLabel}</span>
                    <span className="text-[10px] opacity-75">({getFilterCount(key as FilterState)})</span>
                  </motion.button>
                ))}
              </div>

              {/* Botón para mostrar filtros avanzados */}
              <div className="flex items-center justify-between">
                <button
                  onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                  className="text-sm text-primary-600 dark:text-primary-400 hover:underline flex items-center space-x-1"
                >
                  <Filter className="h-4 w-4" />
                  <span>{showAdvancedFilters ? 'Ocultar' : 'Mostrar'} filtros avanzados</span>
                </button>
                
                {hasActiveFilters && (
                  <button
                    onClick={clearAllFilters}
                    className="flex items-center space-x-1 text-sm text-red-600 dark:text-red-400 hover:underline"
                  >
                    <RotateCcw className="h-4 w-4" />
                    <span>Limpiar filtros</span>
                  </button>
                )}
              </div>
            </div>

            {/* Ordenación */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Ordenar por
              </label>
              <div className="flex flex-wrap gap-2">
                {[
                  { key: 'fechaAgregado', label: 'Fecha Añadido', icon: Calendar },
                  { key: 'titulo', label: 'Título', icon: BookOpen },
                  { key: 'autor', label: 'Autor', icon: BookOpen },
                  { key: 'fechaFin', label: 'Fecha Leído', icon: Calendar },
                  { key: 'calificacion', label: 'Calificación', icon: Star },
                  { key: 'estado', label: 'Estado', icon: BookOpen }
                ].map(({ key, label, icon: Icon }) => (
                  <motion.button
                    key={key}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => toggleSort(key as SortOption)}
                    className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-sm transition-colors ${
                      sortBy === key
                        ? 'bg-primary-500 text-white'
                        : 'bg-white/50 dark:bg-slate-700/50 text-slate-700 dark:text-slate-300 hover:bg-white/70 dark:hover:bg-slate-700/70'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{label}</span>
                    {sortBy === key && (
                      sortDirection === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />
                    )}
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Filtros avanzados */}
            {showAdvancedFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="mt-4 p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg space-y-4"
              >
                <h4 className="text-sm font-semibold text-slate-900 dark:text-white mb-3">
                  Filtros Avanzados
                </h4>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* Autor */}
                  <div>
                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                      <Share2 className="inline h-3 w-3 mr-1" />
                      Autor
                    </label>
                    <select
                      value={autorFilter}
                      onChange={(e) => setAutorFilter(e.target.value)}
                      className="w-full p-2 text-xs border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                    >
                      <option value="">Todos los autores</option>
                      {filterOptions.autores.map(autor => (
                        <option key={autor} value={autor}>{autor}</option>
                      ))}
                    </select>
                  </div>

                  {/* Saga */}
                  <div>
                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                      <BookOpen className="inline h-3 w-3 mr-1" />
                      Saga
                    </label>
                    <select
                      value={sagaFilter}
                      onChange={(e) => setSagaFilter(e.target.value)}
                      className="w-full p-2 text-xs border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                    >
                      <option value="">Todas las sagas</option>
                      {filterOptions.sagas.map(saga => (
                        <option key={saga} value={saga}>{saga}</option>
                      ))}
                    </select>
                  </div>

                  {/* Género */}
                  <div>
                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                      <Hash className="inline h-3 w-3 mr-1" />
                      Género
                    </label>
                    <select
                      value={generoFilter}
                      onChange={(e) => setGeneroFilter(e.target.value)}
                      className="w-full p-2 text-xs border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                    >
                      <option value="">Todos los géneros</option>
                      {filterOptions.generos.map(genero => (
                        <option key={genero} value={genero}>{genero}</option>
                      ))}
                    </select>
                  </div>

                  {/* Editorial */}
                  <div>
                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                      <Building className="inline h-3 w-3 mr-1" />
                      Editorial
                    </label>
                    <select
                      value={editorialFilter}
                      onChange={(e) => setEditorialFilter(e.target.value)}
                      className="w-full p-2 text-xs border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                    >
                      <option value="">Todas las editoriales</option>
                      {filterOptions.editoriales.map(editorial => (
                        <option key={editorial} value={editorial}>{editorial}</option>
                      ))}
                    </select>
                  </div>

                  {/* Idioma */}
                  <div>
                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                      <Globe className="inline h-3 w-3 mr-1" />
                      Idioma
                    </label>
                    <select
                      value={idiomaFilter}
                      onChange={(e) => setIdiomaFilter(e.target.value)}
                      className="w-full p-2 text-xs border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                    >
                      <option value="">Todos los idiomas</option>
                      {filterOptions.idiomas.map(idioma => (
                        <option key={idioma} value={idioma}>{idioma}</option>
                      ))}
                    </select>
                  </div>

                  {/* Formato */}
                  <div>
                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                      <BookOpen className="inline h-3 w-3 mr-1" />
                      Formato
                    </label>
                    <select
                      value={formatoFilter}
                      onChange={(e) => setFormatoFilter(e.target.value)}
                      className="w-full p-2 text-xs border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                    >
                      <option value="">Todos los formatos</option>
                      {filterOptions.formatos.map(formato => (
                        <option key={formato} value={formato}>{formato}</option>
                      ))}
                    </select>
                  </div>

                  {/* Calificación */}
                  <div>
                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                      <Star className="inline h-3 w-3 mr-1" />
                      Calificación
                    </label>
                    <div className="flex space-x-2">
                      <input
                        type="number"
                        min="0"
                        max="5"
                        step="0.1"
                        value={calificacionMin}
                        onChange={(e) => setCalificacionMin(e.target.value)}
                        placeholder="Min"
                        className="w-full p-2 text-xs border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                      />
                      <input
                        type="number"
                        min="0"
                        max="5"
                        step="0.1"
                        value={calificacionMax}
                        onChange={(e) => setCalificacionMax(e.target.value)}
                        placeholder="Max"
                        className="w-full p-2 text-xs border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                      />
                    </div>
                  </div>

                  {/* Páginas */}
                  <div>
                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                      <Hash className="inline h-3 w-3 mr-1" />
                      Páginas
                    </label>
                    <div className="flex space-x-2">
                      <input
                        type="number"
                        min="0"
                        value={paginasMin}
                        onChange={(e) => setPaginasMin(e.target.value)}
                        placeholder="Min"
                        className="w-full p-2 text-xs border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                      />
                      <input
                        type="number"
                        min="0"
                        value={paginasMax}
                        onChange={(e) => setPaginasMax(e.target.value)}
                        placeholder="Max"
                        className="w-full p-2 text-xs border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                      />
                    </div>
                  </div>

                  {/* Fecha agregado */}
                  <div>
                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                      <Calendar className="inline h-3 w-3 mr-1" />
                      Fecha Agregado
                    </label>
                    <div className="flex space-x-2">
                      <input
                        type="date"
                        value={fechaDesde}
                        onChange={(e) => setFechaDesde(e.target.value)}
                        className="w-full p-2 text-xs border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                      />
                      <input
                        type="date"
                        value={fechaHasta}
                        onChange={(e) => setFechaHasta(e.target.value)}
                        className="w-full p-2 text-xs border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </motion.div>
        )}

      {/* Lista/Galería de libros */}
      <div className={`${
        viewMode === 'gallery'
          ? 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4'
          : 'space-y-4'
      }`}>
        {filteredAndSortedBooks.length > 0 ? (
          filteredAndSortedBooks.map((libro, index) => (
            <motion.div
              key={libro.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="relative"
            >
              {/* Checkbox de selección */}
              {isBulkEditMode && (
                <div className="absolute top-2 left-2 z-20">
                  <button
                    onClick={() => toggleBookSelection(libro.id)}
                    className={`p-1 rounded-full transition-colors ${
                      selectedBooks.has(libro.id)
                        ? 'bg-primary-500 text-white'
                        : 'bg-white/80 text-slate-600 hover:bg-white'
                    }`}
                  >
                    {selectedBooks.has(libro.id) ? (
                      <CheckSquare className="h-4 w-4" />
                    ) : (
                      <Square className="h-4 w-4" />
                    )}
                  </button>
                </div>
              )}

              <BookCard
                book={libro}
                onDelete={handleDelete}
                onEdit={handleEdit}
                variant={viewMode === 'gallery' ? 'compact' : 'full'}
              />
            </motion.div>
          ))
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="col-span-full text-center py-12"
          >
            <BookOpen className="h-12 w-12 text-slate-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-700 dark:text-slate-300 mb-2">
              No se encontraron libros
            </h3>
            <p className="text-slate-500 dark:text-slate-400">
              {searchTerm || filterState !== 'todos'
                ? 'Intenta ajustar los filtros de búsqueda'
                : 'Agrega algunos libros a tu biblioteca para comenzar'
              }
            </p>
          </motion.div>
        )}
      </div>

      {/* Modal de edición */}
      {editingBook && (
        <BookEditModal
          isOpen={true}
          book={editingBook}
          listType="todos"
          onClose={() => setEditingBook(null)}
        />
      )}

      {/* Dialog Component */}
      <Dialog
        isOpen={dialog.isOpen}
        onClose={hideDialog}
        title={dialog.title}
        message={dialog.message}
        type={dialog.type}
        confirmText={dialog.confirmText}
        cancelText={dialog.cancelText}
        onConfirm={dialog.onConfirm}
        onCancel={dialog.onCancel}
        showCancel={dialog.showCancel}
      />
    </div>
  );
};

export default BooksView;