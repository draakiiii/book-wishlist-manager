import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Grid3X3, 
  List, 
  Image, 
  BookOpen, 
  Heart, 
  Star,
  Search,
  Filter,
  Eye,
  MoreHorizontal,
  Calendar,
  User,
  FileText
} from 'lucide-react';
import { useAppState } from '../context/AppStateContext';
import { Libro } from '../types';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface GalleryViewProps {
  libros: Libro[];
  onBookClick: (libro: Libro) => void;
  onBookAction?: (libro: Libro, action: string) => void;
}

const GalleryView: React.FC<GalleryViewProps> = ({ libros, onBookClick, onBookAction }) => {
  const { state } = useAppState();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterEstado, setFilterEstado] = useState<string>('todos');
  const [filterGenero, setFilterGenero] = useState<string>('todos');
  const [sortBy, setSortBy] = useState<'titulo' | 'autor' | 'fecha' | 'calificacion'>('titulo');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [selectedBook, setSelectedBook] = useState<Libro | null>(null);

  const filteredAndSortedBooks = useMemo(() => {
    let filtered = libros;

    // Filtrar por término de búsqueda
    if (searchTerm) {
      filtered = filtered.filter(libro => 
        libro.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        libro.autor?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        libro.genero?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtrar por estado
    if (filterEstado !== 'todos') {
      filtered = filtered.filter(libro => libro.estado === filterEstado);
    }

    // Filtrar por género
    if (filterGenero !== 'todos') {
      filtered = filtered.filter(libro => libro.genero === filterGenero);
    }

    // Ordenar
    filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'titulo':
          comparison = a.titulo.localeCompare(b.titulo);
          break;
        case 'autor':
          comparison = (a.autor || '').localeCompare(b.autor || '');
          break;
        case 'fecha':
          comparison = (a.fechaAgregado || 0) - (b.fechaAgregado || 0);
          break;
        case 'calificacion':
          comparison = (a.calificacion || 0) - (b.calificacion || 0);
          break;
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return filtered;
  }, [libros, searchTerm, filterEstado, filterGenero, sortBy, sortOrder]);

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'leido': return 'bg-green-500';
      case 'leyendo': return 'bg-blue-500';
      case 'tbr': return 'bg-yellow-500';
      case 'wishlist': return 'bg-purple-500';
      case 'abandonado': return 'bg-red-500';
      case 'comprado': return 'bg-emerald-500';
      case 'prestado': return 'bg-orange-500';
      default: return 'bg-gray-500';
    }
  };

  const getEstadoText = (estado: string) => {
    switch (estado) {
      case 'leido': return 'Leído';
      case 'leyendo': return 'Leyendo';
      case 'tbr': return 'TBR';
      case 'wishlist': return 'Wishlist';
      case 'abandonado': return 'Abandonado';
      case 'comprado': return 'Comprado';
      case 'prestado': return 'Prestado';
      default: return estado;
    }
  };

  const getBookImage = (libro: Libro) => {
    if (libro.customImage) return libro.customImage;
    if (libro.thumbnail) return libro.thumbnail;
    if (libro.smallThumbnail) return libro.smallThumbnail;
    return '/placeholder-book.png'; // Placeholder image
  };

  const handleBookClick = (libro: Libro) => {
    setSelectedBook(libro);
    onBookClick(libro);
  };

  const handleBookAction = (libro: Libro, action: string) => {
    if (onBookAction) {
      onBookAction(libro, action);
    }
  };

  const estados = ['todos', 'leido', 'leyendo', 'tbr', 'wishlist', 'abandonado', 'comprado', 'prestado'];
  const generos = useMemo(() => {
    const generosSet = new Set(libros.map(l => l.genero).filter(Boolean));
    return ['todos', ...Array.from(generosSet)];
  }, [libros]);

  return (
    <div className="space-y-6">
      {/* Filters and Search */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Search */}
          <div className="lg:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Buscar libros..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>

          {/* Estado Filter */}
          <div>
            <select
              value={filterEstado}
              onChange={(e) => setFilterEstado(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            >
              {estados.map(estado => (
                <option key={estado} value={estado}>
                  {estado === 'todos' ? 'Todos los estados' : getEstadoText(estado)}
                </option>
              ))}
            </select>
          </div>

          {/* Género Filter */}
          <div>
            <select
              value={filterGenero}
              onChange={(e) => setFilterGenero(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            >
              {generos.map(genero => (
                <option key={genero} value={genero}>
                  {genero === 'todos' ? 'Todos los géneros' : genero}
                </option>
              ))}
            </select>
          </div>

          {/* Sort */}
          <div>
            <select
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => {
                const [sort, order] = e.target.value.split('-');
                setSortBy(sort as any);
                setSortOrder(order as any);
              }}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="titulo-asc">Título A-Z</option>
              <option value="titulo-desc">Título Z-A</option>
              <option value="autor-asc">Autor A-Z</option>
              <option value="autor-desc">Autor Z-A</option>
              <option value="fecha-desc">Más recientes</option>
              <option value="fecha-asc">Más antiguos</option>
              <option value="calificacion-desc">Mejor calificados</option>
              <option value="calificacion-asc">Menor calificados</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600 dark:text-gray-300">
          {filteredAndSortedBooks.length} libro{filteredAndSortedBooks.length !== 1 ? 's' : ''} encontrado{filteredAndSortedBooks.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Gallery Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
        <AnimatePresence>
          {filteredAndSortedBooks.map((libro) => (
            <motion.div
              key={libro.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.2 }}
              className="group cursor-pointer"
              onClick={() => handleBookClick(libro)}
            >
              {/* Book Card */}
              <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
                
                {/* Book Cover */}
                <div className="relative aspect-[3/4] overflow-hidden">
                  <img
                    src={getBookImage(libro)}
                    alt={libro.titulo}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = '/placeholder-book.png';
                    }}
                  />
                  
                  {/* Overlay with book info */}
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-300 flex items-center justify-center">
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-center text-white p-4">
                      <h3 className="font-semibold text-sm mb-2 line-clamp-2">
                        {libro.titulo}
                      </h3>
                      {libro.autor && (
                        <p className="text-xs text-gray-200 mb-2">
                          por {libro.autor}
                        </p>
                      )}
                      <div className="flex items-center justify-center gap-2 text-xs">
                        <Eye className="w-3 h-3" />
                        <span>Ver detalles</span>
                      </div>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div className="absolute top-2 left-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium text-white ${getEstadoColor(libro.estado)}`}>
                      {getEstadoText(libro.estado)}
                    </span>
                  </div>

                  {/* Rating */}
                  {libro.calificacion && (
                    <div className="absolute top-2 right-2 bg-black bg-opacity-50 rounded-full p-1">
                      <div className="flex items-center gap-1">
                        <Star className="w-3 h-3 text-yellow-400 fill-current" />
                        <span className="text-xs text-white font-medium">
                          {libro.calificacion}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Favorite Indicator */}
                  {libro.estado === 'wishlist' && (
                    <div className="absolute bottom-2 right-2">
                      <Heart className="w-4 h-4 text-red-500 fill-current" />
                    </div>
                  )}
                </div>

                {/* Book Info */}
                <div className="p-3">
                  <h3 className="font-medium text-gray-900 dark:text-white text-sm line-clamp-2 mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {libro.titulo}
                  </h3>
                  
                  {libro.autor && (
                    <p className="text-xs text-gray-600 dark:text-gray-300 line-clamp-1 mb-2">
                      {libro.autor}
                    </p>
                  )}

                  {/* Additional Info */}
                  <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                    {libro.paginas && (
                      <div className="flex items-center gap-1">
                        <FileText className="w-3 h-3" />
                        <span>{libro.paginas}</span>
                      </div>
                    )}
                    
                    {libro.fechaAgregado && (
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        <span>{format(libro.fechaAgregado, 'MM/yy', { locale: es })}</span>
                      </div>
                    )}
                  </div>

                  {/* Genre Badge */}
                  {libro.genero && (
                    <div className="mt-2">
                      <span className="inline-block px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs rounded-full">
                        {libro.genero}
                      </span>
                    </div>
                  )}
                </div>

                {/* Quick Actions */}
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleBookAction(libro, 'quick-edit');
                    }}
                    className="p-1 bg-white dark:bg-gray-800 rounded-full shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <MoreHorizontal className="w-3 h-3 text-gray-600 dark:text-gray-300" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Empty State */}
      {filteredAndSortedBooks.length === 0 && (
        <div className="text-center py-12">
          <Image className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No se encontraron libros
          </h3>
          <p className="text-gray-600 dark:text-gray-300">
            {searchTerm || filterEstado !== 'todos' || filterGenero !== 'todos'
              ? 'Intenta ajustar los filtros de búsqueda'
              : 'No hay libros en esta vista'}
          </p>
        </div>
      )}
    </div>
  );
};

export default GalleryView;