import React from 'react';
import { Libro } from '../types';
import { motion } from 'framer-motion';
import { 
  X, 
  BookOpen, 
  User, 
  FileText, 
  Star, 
  Calendar, 
  Building, 
  Globe, 
  Tag, 
  Euro,
  MapPin,
  Book,
  MessageSquare,
  Users,
  Clock,
  ShoppingCart,
  CheckCircle,
  XCircle,
  RotateCcw
} from 'lucide-react';

interface BookDescriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  book: Libro | null;
}

const BookDescriptionModal: React.FC<BookDescriptionModalProps> = ({ isOpen, onClose, book }) => {
  if (!book) return null;

  // Función para formatear fechas
  const formatearFecha = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Función para formatear precio
  const formatearPrecio = (precio: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR'
    }).format(precio);
  };

  // Función para obtener el estado del libro
  const getEstadoInfo = (estado: string) => {
    switch (estado) {
      case 'tbr':
        return { label: 'Por leer', icon: <BookOpen className="h-4 w-4" />, color: 'text-warning-600' };
      case 'leyendo':
        return { label: 'Leyendo', icon: <BookOpen className="h-4 w-4" />, color: 'text-primary-600' };
      case 'leido':
        return { label: 'Leído', icon: <CheckCircle className="h-4 w-4" />, color: 'text-success-600' };
      case 'abandonado':
        return { label: 'Abandonado', icon: <XCircle className="h-4 w-4" />, color: 'text-red-600' };
      case 'wishlist':
        return { label: 'Lista de deseos', icon: <Star className="h-4 w-4" />, color: 'text-secondary-600' };
      case 'comprado':
        return { label: 'Comprado', icon: <ShoppingCart className="h-4 w-4" />, color: 'text-blue-600' };
      case 'prestado':
        return { label: 'Prestado', icon: <Users className="h-4 w-4" />, color: 'text-purple-600' };
      default:
        return { label: estado, icon: <BookOpen className="h-4 w-4" />, color: 'text-slate-600' };
    }
  };

  const estadoInfo = getEstadoInfo(book.estado);

  return (
    <>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="bg-white dark:bg-slate-800 rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 sm:p-6 border-b border-slate-200 dark:border-slate-700">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-secondary-100 dark:bg-secondary-900/30 rounded-lg">
                  <BookOpen className="h-5 w-5 text-secondary-600 dark:text-secondary-400" />
                </div>
                <h2 className="text-lg sm:text-xl font-semibold text-slate-900 dark:text-white">
                  Detalles del Libro
                </h2>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors duration-200"
              >
                <X className="h-5 w-5 text-slate-500 dark:text-slate-400" />
              </button>
            </div>

            {/* Content */}
            <div className="p-4 sm:p-6 space-y-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              {/* Title and Status */}
              <div className="space-y-3">
                <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white leading-tight">
                  {book.titulo}
                </h3>
                
                {/* Estado del libro */}
                <div className="flex items-center space-x-2">
                  <div className={`p-2 rounded-lg bg-slate-100 dark:bg-slate-700 ${estadoInfo.color}`}>
                    {estadoInfo.icon}
                  </div>
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    {estadoInfo.label}
                  </span>
                </div>
              </div>

              {/* Basic Info Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                {book.autor && (
                  <div className="flex items-center space-x-3 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                    <User className="h-4 w-4 text-slate-500 dark:text-slate-400 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Autor</p>
                      <p className="text-sm font-medium text-slate-900 dark:text-white">{book.autor}</p>
                    </div>
                  </div>
                )}

                {book.paginas && (
                  <div className="flex items-center space-x-3 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                    <FileText className="h-4 w-4 text-slate-500 dark:text-slate-400 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Páginas</p>
                      <p className="text-sm font-medium text-slate-900 dark:text-white">{book.paginas}</p>
                    </div>
                  </div>
                )}

                {book.paginasLeidas && (
                  <div className="flex items-center space-x-3 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                    <FileText className="h-4 w-4 text-slate-500 dark:text-slate-400 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Páginas Leídas</p>
                      <p className="text-sm font-medium text-slate-900 dark:text-white">{book.paginasLeidas}</p>
                    </div>
                  </div>
                )}

                {book.publicacion && (
                  <div className="flex items-center space-x-3 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                    <Calendar className="h-4 w-4 text-slate-500 dark:text-slate-400 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Año Publicación</p>
                      <p className="text-sm font-medium text-slate-900 dark:text-white">{book.publicacion}</p>
                    </div>
                  </div>
                )}

                {book.editorial && (
                  <div className="flex items-center space-x-3 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                    <Building className="h-4 w-4 text-slate-500 dark:text-slate-400 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Editorial</p>
                      <p className="text-sm font-medium text-slate-900 dark:text-white">{book.editorial}</p>
                    </div>
                  </div>
                )}

                {book.idioma && (
                  <div className="flex items-center space-x-3 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                    <Globe className="h-4 w-4 text-slate-500 dark:text-slate-400 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Idioma</p>
                      <p className="text-sm font-medium text-slate-900 dark:text-white">{book.idioma}</p>
                    </div>
                  </div>
                )}

                {book.genero && (
                  <div className="flex items-center space-x-3 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                    <Tag className="h-4 w-4 text-slate-500 dark:text-slate-400 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Género</p>
                      <p className="text-sm font-medium text-slate-900 dark:text-white">{book.genero}</p>
                    </div>
                  </div>
                )}

                {book.formato && (
                  <div className="flex items-center space-x-3 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                    <Book className="h-4 w-4 text-slate-500 dark:text-slate-400 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Formato</p>
                      <p className="text-sm font-medium text-slate-900 dark:text-white capitalize">{book.formato}</p>
                    </div>
                  </div>
                )}

                {book.precio && (
                  <div className="flex items-center space-x-3 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                    <Euro className="h-4 w-4 text-slate-500 dark:text-slate-400 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Precio</p>
                      <p className="text-sm font-medium text-slate-900 dark:text-white">{formatearPrecio(book.precio)}</p>
                    </div>
                  </div>
                )}

                {book.ubicacion && (
                  <div className="flex items-center space-x-3 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                    <MapPin className="h-4 w-4 text-slate-500 dark:text-slate-400 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Ubicación</p>
                      <p className="text-sm font-medium text-slate-900 dark:text-white">{book.ubicacion}</p>
                    </div>
                  </div>
                )}

                {book.calificacion && (
                  <div className="flex items-center space-x-3 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                    <Star className="h-4 w-4 text-amber-500 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Calificación</p>
                      <p className="text-sm font-medium text-slate-900 dark:text-white">
                        {book.calificacion}/5
                        {book.numCalificaciones && (
                          <span className="text-xs text-slate-500 dark:text-slate-400 ml-1">
                            ({book.numCalificaciones} reseñas)
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                )}

                {book.sagaName && (
                  <div className="flex items-center space-x-3 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                    <Star className="h-4 w-4 text-amber-500 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Saga</p>
                      <p className="text-sm font-medium text-slate-900 dark:text-white">{book.sagaName}</p>
                    </div>
                  </div>
                )}

                {book.ordenLectura && (
                  <div className="flex items-center space-x-3 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                    <RotateCcw className="h-4 w-4 text-slate-500 dark:text-slate-400 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Orden en Saga</p>
                      <p className="text-sm font-medium text-slate-900 dark:text-white">#{book.ordenLectura}</p>
                    </div>
                  </div>
                )}

                {book.prestado && book.prestadoA && (
                  <div className="flex items-center space-x-3 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                    <Users className="h-4 w-4 text-purple-500 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Prestado a</p>
                      <p className="text-sm font-medium text-slate-900 dark:text-white">{book.prestadoA}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Fechas importantes */}
              {(book.fechaAgregado || book.fechaInicio || book.fechaFin || book.fechaAbandonado || book.fechaCompra || book.fechaPrestamo) && (
                <div className="space-y-3">
                  <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center space-x-2">
                    <Clock className="h-4 w-4" />
                    <span>Fechas Importantes</span>
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {book.fechaAgregado && (
                      <div className="flex items-center space-x-2 text-sm">
                        <Calendar className="h-3 w-3 text-slate-400" />
                        <span className="text-slate-600 dark:text-slate-400">Agregado:</span>
                        <span className="font-medium text-slate-900 dark:text-white">{formatearFecha(book.fechaAgregado)}</span>
                      </div>
                    )}
                    {book.fechaInicio && (
                      <div className="flex items-center space-x-2 text-sm">
                        <Calendar className="h-3 w-3 text-slate-400" />
                        <span className="text-slate-600 dark:text-slate-400">Inicio lectura:</span>
                        <span className="font-medium text-slate-900 dark:text-white">{formatearFecha(book.fechaInicio)}</span>
                      </div>
                    )}
                    {book.fechaFin && (
                      <div className="flex items-center space-x-2 text-sm">
                        <Calendar className="h-3 w-3 text-slate-400" />
                        <span className="text-slate-600 dark:text-slate-400">Fin lectura:</span>
                        <span className="font-medium text-slate-900 dark:text-white">{formatearFecha(book.fechaFin)}</span>
                      </div>
                    )}
                    {book.fechaAbandonado && (
                      <div className="flex items-center space-x-2 text-sm">
                        <Calendar className="h-3 w-3 text-slate-400" />
                        <span className="text-slate-600 dark:text-slate-400">Abandonado:</span>
                        <span className="font-medium text-slate-900 dark:text-white">{formatearFecha(book.fechaAbandonado)}</span>
                      </div>
                    )}
                    {book.fechaCompra && (
                      <div className="flex items-center space-x-2 text-sm">
                        <Calendar className="h-3 w-3 text-slate-400" />
                        <span className="text-slate-600 dark:text-slate-400">Comprado:</span>
                        <span className="font-medium text-slate-900 dark:text-white">{formatearFecha(book.fechaCompra)}</span>
                      </div>
                    )}
                    {book.fechaPrestamo && (
                      <div className="flex items-center space-x-2 text-sm">
                        <Calendar className="h-3 w-3 text-slate-400" />
                        <span className="text-slate-600 dark:text-slate-400">Prestado:</span>
                        <span className="font-medium text-slate-900 dark:text-white">{formatearFecha(book.fechaPrestamo)}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Categories */}
              {book.categorias && book.categorias.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Tag className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                    <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Categorías</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {book.categorias.map((categoria, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-secondary-100 dark:bg-secondary-900/30 text-secondary-700 dark:text-secondary-300 rounded-full text-xs font-medium"
                      >
                        {categoria}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Notes/Review */}
              {book.notas && (
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <MessageSquare className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                    <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Mi Reseña</p>
                  </div>
                  <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                    <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                      {book.notas}
                    </p>
                  </div>
                </div>
              )}

              {/* Description */}
              {book.descripcion ? (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Descripción</p>
                  <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                    <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                      {book.descripcion}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="p-3 bg-slate-100 dark:bg-slate-700 rounded-full w-fit mx-auto mb-3">
                    <BookOpen className="h-6 w-6 text-slate-400" />
                  </div>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    No hay descripción disponible para este libro
                  </p>
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                    La descripción se añade automáticamente cuando se escanea el ISBN
                  </p>
                </div>
              )}

              {/* ISBN */}
              {book.isbn && (
                <div className="flex items-center space-x-3 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                  <div className="p-1.5 bg-blue-100 dark:bg-blue-900/30 rounded">
                    <span className="text-xs font-mono text-blue-700 dark:text-blue-300">ISBN</span>
                  </div>
                  <p className="text-sm font-mono text-slate-900 dark:text-white">{book.isbn}</p>
                </div>
              )}

              {/* Historial del Libro */}
              {book.historialEstados && book.historialEstados.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center space-x-2">
                    <Clock className="h-4 w-4" />
                    <span>Historial del Libro</span>
                  </h4>
                  <div className="space-y-2">
                    {book.historialEstados
                      .sort((a, b) => a.fecha - b.fecha)
                      .map((estado, index) => (
                        <div key={index} className="flex items-start space-x-3 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                          <div className="flex-shrink-0 w-2 h-2 bg-slate-400 rounded-full mt-2"></div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <p className="text-sm font-medium text-slate-900 dark:text-white">
                                {estado.notas || getEstadoInfo(estado.estado).label}
                              </p>
                              <span className="text-xs text-slate-500 dark:text-slate-400">
                                {formatearFecha(estado.fecha)}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </>
  );
};

export default BookDescriptionModal;