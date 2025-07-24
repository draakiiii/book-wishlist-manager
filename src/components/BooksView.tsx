import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
  X
} from 'lucide-react';
import { useAppState } from '../context/AppStateContext';
import { Libro } from '../types';
import BookCard from './BookCard';
import BookEditModal from './BookEditModal';

export type BooksViewMode = 'list' | 'gallery';

interface BooksViewProps {
  viewMode: BooksViewMode;
  onViewModeChange: (mode: BooksViewMode) => void;
}

type SortOption = 'titulo' | 'autor' | 'fechaAnadido' | 'fechaLeido' | 'calificacion' | 'estado';
type SortDirection = 'asc' | 'desc';
type FilterState = 'todos' | 'wishlist' | 'tbr' | 'leyendo' | 'leido' | 'abandonado';

const BooksView: React.FC<BooksViewProps> = ({ viewMode, onViewModeChange }) => {
  const { state, dispatch } = useAppState();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterState, setFilterState] = useState<FilterState>('todos');
  const [sortBy, setSortBy] = useState<SortOption>('fechaAnadido');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [showFilters, setShowFilters] = useState(false);
  const [editingBook, setEditingBook] = useState<Libro | null>(null);

  // Filtrar y ordenar libros
  const filteredAndSortedBooks = useMemo(() => {
    let filtered = state.libros;

    // Filtrar por texto de búsqueda
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(libro =>
        libro.titulo.toLowerCase().includes(searchLower) ||
        libro.autor.toLowerCase().includes(searchLower) ||
        (libro.genero && libro.genero.toLowerCase().includes(searchLower)) ||
        (libro.editorial && libro.editorial.toLowerCase().includes(searchLower))
      );
    }

    // Filtrar por estado
    if (filterState !== 'todos') {
      filtered = filtered.filter(libro => libro.estado === filterState);
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
          aValue = a.autor.toLowerCase();
          bValue = b.autor.toLowerCase();
          break;
        case 'fechaAnadido':
          aValue = new Date(a.fechaAnadido || 0);
          bValue = new Date(b.fechaAnadido || 0);
          break;
        case 'fechaLeido':
          aValue = a.fechaLeido ? new Date(a.fechaLeido) : new Date(0);
          bValue = b.fechaLeido ? new Date(b.fechaLeido) : new Date(0);
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
  }, [state.libros, searchTerm, filterState, sortBy, sortDirection]);

  const handleDelete = (id: number) => {
    dispatch({ type: 'DELETE_BOOK', payload: id });
  };

  const handleEdit = (book: Libro) => {
    setEditingBook(book);
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
          </p>
        </div>

        <div className="flex items-center gap-2">
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
            <Filter className="h-5 w-5" />
          </motion.button>
        </div>
      </div>

      {/* Panel de filtros y búsqueda */}
      <AnimatePresence>
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
                className="w-full pl-10 pr-4 py-2 bg-white/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
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

            {/* Filtros por estado */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Filtrar por estado
              </label>
              <div className="flex flex-wrap gap-2">
                {[
                  { key: 'todos', label: 'Todos', icon: BookOpen },
                  { key: 'wishlist', label: 'Lista de Deseos', icon: BookOpen },
                  { key: 'tbr', label: 'Por Leer', icon: BookOpen },
                  { key: 'leyendo', label: 'Leyendo', icon: BookOpen },
                  { key: 'leido', label: 'Leídos', icon: BookOpen },
                  { key: 'abandonado', label: 'Abandonados', icon: BookOpen }
                ].map(({ key, label, icon: Icon }) => (
                  <motion.button
                    key={key}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setFilterState(key as FilterState)}
                    className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-sm transition-colors ${
                      filterState === key
                        ? 'bg-primary-500 text-white'
                        : 'bg-white/50 dark:bg-slate-700/50 text-slate-700 dark:text-slate-300 hover:bg-white/70 dark:hover:bg-slate-700/70'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{label}</span>
                    <span className="text-xs opacity-75">({getFilterCount(key as FilterState)})</span>
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Ordenación */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Ordenar por
              </label>
              <div className="flex flex-wrap gap-2">
                {[
                  { key: 'fechaAnadido', label: 'Fecha Añadido', icon: Calendar },
                  { key: 'titulo', label: 'Título', icon: BookOpen },
                  { key: 'autor', label: 'Autor', icon: BookOpen },
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
          </motion.div>
        )}
      </AnimatePresence>

      {/* Lista/Galería de libros */}
      <div className={`${
        viewMode === 'gallery'
          ? 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4'
          : 'space-y-4'
      }`}>
        <AnimatePresence>
          {filteredAndSortedBooks.length > 0 ? (
            filteredAndSortedBooks.map((libro, index) => (
              <motion.div
                key={libro.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.05 }}
              >
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
        </AnimatePresence>
      </div>

      {/* Modal de edición */}
      {editingBook && (
        <BookEditModal
          book={editingBook}
          onClose={() => setEditingBook(null)}
        />
      )}
    </div>
  );
};

export default BooksView;