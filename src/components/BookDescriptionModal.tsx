import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  X, 
  BookOpen, 
  Clock, 
  Star, 
  Plus, 
  Edit, 
  Trash2,
  Calendar,
  User,
  FileText,
  Globe,
  Book,
  Euro,
  ShoppingCart,
  ExternalLink,
  Download,
  Eye,
  Headphones,
  Award,
  Tag,
  Info,
  Monitor,
  Users,
  MapPin,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { Libro, EstadoLibro, Lectura } from '../types';
import { useAppState } from '../context/AppStateContext';

interface BookDescriptionModalProps {
  book: Libro | null;
  isOpen: boolean;
  onClose: () => void;
}

const BookDescriptionModal: React.FC<BookDescriptionModalProps> = ({ book, isOpen, onClose }) => {
  const { dispatch } = useAppState();
  const [showAddLectura, setShowAddLectura] = useState(false);
  const [newLectura, setNewLectura] = useState({
    fechaInicio: new Date().toISOString().split('T')[0],
    fechaFin: new Date().toISOString().split('T')[0],
    calificacion: 0,
    reseña: '',
    paginasLeidas: book?.paginas || 0,
    notas: ''
  });

  const formatearFecha = (fecha: number) => {
    return new Date(fecha).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatearPrecio = (precio: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR'
    }).format(precio);
  };

  const getEstadoInfo = (estado: Libro['estado']) => {
    const estados = {
      tbr: { label: 'Pendiente de leer', color: 'text-orange-600', bgColor: 'bg-orange-100' },
      leyendo: { label: 'Leyendo', color: 'text-blue-600', bgColor: 'bg-blue-100' },
      leido: { label: 'Leído', color: 'text-green-600', bgColor: 'bg-green-100' },
      abandonado: { label: 'Abandonado', color: 'text-red-600', bgColor: 'bg-red-100' },
      wishlist: { label: 'Lista de deseos', color: 'text-purple-600', bgColor: 'bg-purple-100' },
      comprado: { label: 'Comprado', color: 'text-indigo-600', bgColor: 'bg-indigo-100' },
      prestado: { label: 'Prestado', color: 'text-yellow-600', bgColor: 'bg-yellow-100' }
    };
    return estados[estado] || estados.tbr;
  };

  const handleAddLectura = () => {
    if (!book) return;
    
    const lectura: Omit<Lectura, 'id'> = {
      fechaInicio: new Date(newLectura.fechaInicio).getTime(),
      fechaFin: new Date(newLectura.fechaFin).getTime(),
      calificacion: newLectura.calificacion > 0 ? newLectura.calificacion : undefined,
      reseña: newLectura.reseña || undefined,
      paginasLeidas: newLectura.paginasLeidas || undefined,
      notas: newLectura.notas || undefined
    };

    dispatch({
      type: 'ADD_LECTURA',
      payload: { libroId: book.id, lectura }
    });

    // Reset form
    setNewLectura({
      fechaInicio: new Date().toISOString().split('T')[0],
      fechaFin: new Date().toISOString().split('T')[0],
      calificacion: 0,
      reseña: '',
      paginasLeidas: book.paginas || 0,
      notas: ''
    });
    setShowAddLectura(false);
  };

  const handleDeleteLectura = (lecturaId: number) => {
    if (!book) return;
    
    dispatch({
      type: 'DELETE_LECTURA',
      payload: { libroId: book.id, lecturaId }
    });
  };

  if (!book) return null;

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
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-white dark:bg-slate-800 rounded-2xl shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="sticky top-0 z-10 flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700 bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-lg">
                    <BookOpen className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                      {book.titulo}
                    </h2>
                    {book.autor && (
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        por {book.autor}
                      </p>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  {/* Estado del libro */}
                  <div className="flex items-center space-x-2">
                    <div className={`p-2 rounded-lg bg-slate-100 dark:bg-slate-700 ${estadoInfo.bgColor}`}>
                      {estadoInfo.label}
                    </div>
                  </div>
                  
                  <button
                    onClick={onClose}
                    className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 space-y-6">
                {/* Basic Info Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* Páginas */}
                  {book.paginas && (
                    <div className="flex items-center space-x-3 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                      <div className="p-1.5 bg-slate-100 dark:bg-slate-600 rounded">
                        <span className="text-xs font-medium text-slate-700 dark:text-slate-300">Págs</span>
                      </div>
                      <p className="text-sm font-medium text-slate-900 dark:text-white">{book.paginas}</p>
                    </div>
                  )}

                  {/* Editorial */}
                  {book.editorial && (
                    <div className="flex items-center space-x-3 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                      <div className="p-1.5 bg-slate-100 dark:bg-slate-600 rounded">
                        <span className="text-xs font-medium text-slate-700 dark:text-slate-300">Edit</span>
                      </div>
                      <p className="text-sm font-medium text-slate-900 dark:text-white">{book.editorial}</p>
                    </div>
                  )}

                  {/* Idioma */}
                  {book.idioma && (
                    <div className="flex items-center space-x-3 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                      <div className="p-1.5 bg-slate-100 dark:bg-slate-600 rounded">
                        <span className="text-xs font-medium text-slate-700 dark:text-slate-300">Idioma</span>
                      </div>
                      <p className="text-sm font-medium text-slate-900 dark:text-white">{book.idioma}</p>
                    </div>
                  )}

                  {/* Género */}
                  {book.genero && (
                    <div className="flex items-center space-x-3 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                      <div className="p-1.5 bg-slate-100 dark:bg-slate-600 rounded">
                        <span className="text-xs font-medium text-slate-700 dark:text-slate-300">Género</span>
                      </div>
                      <p className="text-sm font-medium text-slate-900 dark:text-white">{book.genero}</p>
                    </div>
                  )}

                  {/* Formato */}
                  {book.formato && (
                    <div className="flex items-center space-x-3 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                      <div className="p-1.5 bg-slate-100 dark:bg-slate-600 rounded">
                        <span className="text-xs font-medium text-slate-700 dark:text-slate-300">Formato</span>
                      </div>
                      <p className="text-sm font-medium text-slate-900 dark:text-white capitalize">{book.formato}</p>
                    </div>
                  )}

                  {/* Precio */}
                  {book.precio && (
                    <div className="flex items-center space-x-3 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                      <div className="p-1.5 bg-slate-100 dark:bg-slate-600 rounded">
                        <span className="text-xs font-medium text-slate-700 dark:text-slate-300">Precio</span>
                      </div>
                      <p className="text-sm font-medium text-slate-900 dark:text-white">{formatearPrecio(book.precio)}</p>
                    </div>
                  )}

                  {/* Ubicación */}
                  {book.ubicacion && (
                    <div className="flex items-center space-x-3 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                      <div className="p-1.5 bg-slate-100 dark:bg-slate-600 rounded">
                        <span className="text-xs font-medium text-slate-700 dark:text-slate-300">Ubicación</span>
                      </div>
                      <p className="text-sm font-medium text-slate-900 dark:text-white">{book.ubicacion}</p>
                    </div>
                  )}

                  {/* Fecha de publicación */}
                  {book.publicacion && (
                    <div className="flex items-center space-x-3 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                      <div className="p-1.5 bg-slate-100 dark:bg-slate-600 rounded">
                        <span className="text-xs font-medium text-slate-700 dark:text-slate-300">Año</span>
                      </div>
                      <p className="text-sm font-medium text-slate-900 dark:text-white">{book.publicacion}</p>
                    </div>
                  )}

                  {/* Fecha de agregado */}
                  {book.fechaAgregado && (
                    <div className="flex items-center space-x-3 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                      <div className="p-1.5 bg-slate-100 dark:bg-slate-600 rounded">
                        <span className="text-xs font-medium text-slate-700 dark:text-slate-300">Agregado</span>
                      </div>
                      <p className="text-sm font-medium text-slate-900 dark:text-white">{formatearFecha(book.fechaAgregado)}</p>
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
                </div>

                {/* Información adicional de Google Books */}
                {(book.precioVenta || book.fechaPublicacionFormateada || book.disponibleParaVenta || book.vistaPreviaDisponible || book.disponibleEPUB || book.disponiblePDF || book.disponibleTextoVoz || book.dominioPublico || book.clasificacionMadurez || book.categorias || book.isbn13 || book.isbn10) && (
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center space-x-2">
                      <Info className="h-5 w-5 text-blue-500" />
                      <span>Información Adicional</span>
                    </h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {/* Información de precios */}
                      {book.precioVenta && (
                        <div className="flex items-center space-x-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                          <Euro className="h-4 w-4 text-green-600" />
                          <div>
                            <p className="text-sm font-medium text-slate-900 dark:text-white">
                              {book.precioVenta} {book.moneda}
                            </p>
                            {book.precioLista && book.precioLista > book.precioVenta && (
                              <p className="text-xs text-slate-500 line-through">
                                {book.precioLista} {book.moneda}
                              </p>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Fecha de publicación detallada */}
                      {book.fechaPublicacionFormateada && (
                        <div className="flex items-center space-x-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                          <Calendar className="h-4 w-4 text-blue-600" />
                          <div>
                            <p className="text-sm font-medium text-slate-900 dark:text-white">
                              Publicación
                            </p>
                            <p className="text-xs text-slate-600 dark:text-slate-400">
                              {book.fechaPublicacionFormateada}
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Disponibilidad para venta */}
                      {book.disponibleParaVenta && (
                        <div className="flex items-center space-x-3 p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg border border-emerald-200 dark:border-emerald-800">
                          <ShoppingCart className="h-4 w-4 text-emerald-600" />
                          <div>
                            <p className="text-sm font-medium text-slate-900 dark:text-white">
                              Disponible
                            </p>
                            <p className="text-xs text-slate-600 dark:text-slate-400">
                              Para compra
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Vista previa disponible */}
                      {book.vistaPreviaDisponible && (
                        <div className="flex items-center space-x-3 p-3 bg-cyan-50 dark:bg-cyan-900/20 rounded-lg border border-cyan-200 dark:border-cyan-800">
                          <Eye className="h-4 w-4 text-cyan-600" />
                          <div>
                            <p className="text-sm font-medium text-slate-900 dark:text-white">
                              Vista previa
                            </p>
                            <p className="text-xs text-slate-600 dark:text-slate-400">
                              Disponible
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Formatos disponibles */}
                      {(book.disponibleEPUB || book.disponiblePDF) && (
                        <div className="flex items-center space-x-3 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                          <Download className="h-4 w-4 text-purple-600" />
                          <div>
                            <p className="text-sm font-medium text-slate-900 dark:text-white">
                              Formatos
                            </p>
                            <p className="text-xs text-slate-600 dark:text-slate-400">
                              {book.disponibleEPUB && 'EPUB'}
                              {book.disponibleEPUB && book.disponiblePDF && ' + '}
                              {book.disponiblePDF && 'PDF'}
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Texto a voz */}
                      {book.disponibleTextoVoz && (
                        <div className="flex items-center space-x-3 p-3 bg-pink-50 dark:bg-pink-900/20 rounded-lg border border-pink-200 dark:border-pink-800">
                          <Headphones className="h-4 w-4 text-pink-600" />
                          <div>
                            <p className="text-sm font-medium text-slate-900 dark:text-white">
                              Audio
                            </p>
                            <p className="text-xs text-slate-600 dark:text-slate-400">
                              Texto a voz
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Dominio público */}
                      {book.dominioPublico && (
                        <div className="flex items-center space-x-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                          <Award className="h-4 w-4 text-yellow-600" />
                          <div>
                            <p className="text-sm font-medium text-slate-900 dark:text-white">
                              Dominio público
                            </p>
                            <p className="text-xs text-slate-600 dark:text-slate-400">
                              Libre de derechos
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Clasificación de madurez */}
                      {book.clasificacionMadurez && book.clasificacionMadurez !== 'NOT_MATURE' && (
                        <div className="flex items-center space-x-3 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                          <Tag className="h-4 w-4 text-red-600" />
                          <div>
                            <p className="text-sm font-medium text-slate-900 dark:text-white">
                              Clasificación
                            </p>
                            <p className="text-xs text-slate-600 dark:text-slate-400">
                              {book.clasificacionMadurez === 'MATURE' ? 'Adulto' : book.clasificacionMadurez}
                            </p>
                          </div>
                        </div>
                      )}

                      {/* ISBNs adicionales */}
                      {book.isbn13 && (
                        <div className="flex items-center space-x-3 p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg border border-indigo-200 dark:border-indigo-800">
                          <FileText className="h-4 w-4 text-indigo-600" />
                          <div>
                            <p className="text-sm font-medium text-slate-900 dark:text-white">
                              ISBN-13
                            </p>
                            <p className="text-xs font-mono text-slate-600 dark:text-slate-400">
                              {book.isbn13}
                            </p>
                          </div>
                        </div>
                      )}

                      {book.isbn10 && (
                        <div className="flex items-center space-x-3 p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg border border-indigo-200 dark:border-indigo-800">
                          <FileText className="h-4 w-4 text-indigo-600" />
                          <div>
                            <p className="text-sm font-medium text-slate-900 dark:text-white">
                              ISBN-10
                            </p>
                            <p className="text-xs font-mono text-slate-600 dark:text-slate-400">
                              {book.isbn10}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Categorías */}
                    {book.categorias && book.categorias.length > 0 && (
                      <div className="space-y-3">
                        <h5 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                          Categorías
                        </h5>
                        <div className="flex flex-wrap gap-2">
                          {book.categorias.map((categoria, index) => (
                            <span
                              key={index}
                              className="px-3 py-1 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-full text-xs font-medium"
                            >
                              {categoria}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Enlaces externos */}
                    {(book.enlaceVistaPrevia || book.enlaceCompra || book.enlaceInfo) && (
                      <div className="space-y-3">
                        <h5 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                          Enlaces Externos
                        </h5>
                        <div className="flex flex-wrap gap-2">
                          {book.enlaceVistaPrevia && (
                            <button
                              onClick={() => window.open(book.enlaceVistaPrevia, '_blank')}
                              className="flex items-center space-x-2 px-3 py-2 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg text-sm font-medium transition-colors"
                            >
                              <Eye className="h-4 w-4" />
                              <span>Vista previa</span>
                            </button>
                          )}
                          
                          {book.enlaceCompra && (
                            <button
                              onClick={() => window.open(book.enlaceCompra, '_blank')}
                              className="flex items-center space-x-2 px-3 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-sm font-medium transition-colors"
                            >
                              <ShoppingCart className="h-4 w-4" />
                              <span>Comprar</span>
                            </button>
                          )}
                          
                          {book.enlaceInfo && (
                            <button
                              onClick={() => window.open(book.enlaceInfo, '_blank')}
                              className="flex items-center space-x-2 px-3 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg text-sm font-medium transition-colors"
                            >
                              <Info className="h-4 w-4" />
                              <span>Más información</span>
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Descripción */}
                {book.descripcion && (
                  <div className="space-y-3">
                    <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                      Descripción
                    </h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                      {book.descripcion}
                    </p>
                  </div>
                )}

                {/* Notas generales */}
                {book.notas && (
                  <div className="space-y-3">
                    <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                      Notas Generales
                    </h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                      {book.notas}
                    </p>
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

                {/* Múltiples Lecturas */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center space-x-2">
                      <BookOpen className="h-4 w-4" />
                      <span>Lecturas ({book.lecturas?.length || 0})</span>
                    </h4>
                    <button
                      onClick={() => setShowAddLectura(!showAddLectura)}
                      className="flex items-center space-x-1 px-2 py-1 text-xs bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
                    >
                      <Plus className="h-3 w-3" />
                      <span>Añadir Lectura</span>
                    </button>
                  </div>

                  {/* Formulario para añadir nueva lectura */}
                  {showAddLectura && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-700"
                    >
                        <h5 className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-3">
                          Nueva Lectura
                        </h5>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-medium text-blue-800 dark:text-blue-200 mb-1">
                              Fecha de inicio
                            </label>
                            <input
                              type="date"
                              value={newLectura.fechaInicio}
                              onChange={(e) => setNewLectura({...newLectura, fechaInicio: e.target.value})}
                              className="w-full px-2 py-1 text-xs border border-blue-300 dark:border-blue-600 rounded bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-blue-800 dark:text-blue-200 mb-1">
                              Fecha de fin
                            </label>
                            <input
                              type="date"
                              value={newLectura.fechaFin}
                              onChange={(e) => setNewLectura({...newLectura, fechaFin: e.target.value})}
                              className="w-full px-2 py-1 text-xs border border-blue-300 dark:border-blue-600 rounded bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-blue-800 dark:text-blue-200 mb-1">
                              Calificación (1-5)
                            </label>
                            <select
                              value={newLectura.calificacion}
                              onChange={(e) => setNewLectura({...newLectura, calificacion: parseInt(e.target.value)})}
                              className="w-full px-2 py-1 text-xs border border-blue-300 dark:border-blue-600 rounded bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                            >
                              <option value={0}>Sin calificar</option>
                              <option value={1}>1 ⭐</option>
                              <option value={2}>2 ⭐⭐</option>
                              <option value={3}>3 ⭐⭐⭐</option>
                              <option value={4}>4 ⭐⭐⭐⭐</option>
                              <option value={5}>5 ⭐⭐⭐⭐⭐</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-blue-800 dark:text-blue-200 mb-1">
                              Páginas leídas
                            </label>
                            <input
                              type="number"
                              value={newLectura.paginasLeidas}
                              onChange={(e) => setNewLectura({...newLectura, paginasLeidas: parseInt(e.target.value) || 0})}
                              className="w-full px-2 py-1 text-xs border border-blue-300 dark:border-blue-600 rounded bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                            />
                          </div>
                        </div>
                        <div className="mt-3 space-y-2">
                          <div>
                            <label className="block text-xs font-medium text-blue-800 dark:text-blue-200 mb-1">
                              Reseña
                            </label>
                            <textarea
                              value={newLectura.reseña}
                              onChange={(e) => setNewLectura({...newLectura, reseña: e.target.value})}
                              placeholder="Tu opinión sobre esta lectura..."
                              className="w-full px-2 py-1 text-xs border border-blue-300 dark:border-blue-600 rounded bg-white dark:bg-slate-700 text-slate-900 dark:text-white resize-none"
                              rows={2}
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-blue-800 dark:text-blue-200 mb-1">
                              Notas adicionales
                            </label>
                            <textarea
                              value={newLectura.notas}
                              onChange={(e) => setNewLectura({...newLectura, notas: e.target.value})}
                              placeholder="Notas personales..."
                              className="w-full px-2 py-1 text-xs border border-blue-300 dark:border-blue-600 rounded bg-white dark:bg-slate-700 text-slate-900 dark:text-white resize-none"
                              rows={2}
                            />
                          </div>
                        </div>
                        <div className="flex justify-end space-x-2 mt-3">
                          <button
                            onClick={() => setShowAddLectura(false)}
                            className="px-3 py-1 text-xs bg-slate-500 hover:bg-slate-600 text-white rounded transition-colors"
                          >
                            Cancelar
                          </button>
                          <button
                            onClick={handleAddLectura}
                            className="px-3 py-1 text-xs bg-blue-500 hover:bg-blue-600 text-white rounded transition-colors"
                          >
                            Añadir Lectura
                          </button>
                        </div>
                      </motion.div>
                    )}

                  {book.lecturas && book.lecturas.length > 0 && (
                    <div className="space-y-3">
                      {book.lecturas
                        .sort((a, b) => b.fechaFin - a.fechaFin) // Más reciente primero
                        .map((lectura, index) => (
                          <div key={lectura.id} className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex items-center space-x-2">
                                <span className="text-xs font-medium text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30 px-2 py-1 rounded">
                                  Lectura #{book.lecturas.length - index}
                                </span>
                                                                 {lectura.calificacion && (
                                   <div className="flex items-center space-x-1">
                                     {[...Array(5)].map((_, i) => (
                                       <Star
                                         key={i}
                                         className={`h-3 w-3 ${
                                           i < (lectura.calificacion || 0)
                                             ? 'text-yellow-500 fill-current'
                                             : 'text-slate-300 dark:text-slate-600'
                                         }`}
                                       />
                                     ))}
                                     <span className="text-xs text-slate-600 dark:text-slate-400">
                                       {lectura.calificacion}/5
                                     </span>
                                   </div>
                                 )}
                              </div>
                              <div className="flex items-center space-x-2">
                                <span className="text-xs text-slate-500 dark:text-slate-400">
                                  {formatearFecha(lectura.fechaFin)}
                                </span>
                                <button
                                  onClick={() => handleDeleteLectura(lectura.id)}
                                  className="p-1 text-red-500 hover:text-red-700 hover:bg-red-100 dark:hover:bg-red-900/30 rounded transition-colors"
                                  title="Eliminar lectura"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </button>
                              </div>
                            </div>
                            
                            <div className="space-y-2">
                              <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
                                <span>Inicio: {formatearFecha(lectura.fechaInicio)}</span>
                                <span>Fin: {formatearFecha(lectura.fechaFin)}</span>
                              </div>
                              
                              {lectura.paginasLeidas && (
                                <div className="text-xs text-slate-600 dark:text-slate-400">
                                  Páginas leídas: {lectura.paginasLeidas}
                                </div>
                              )}
                              
                              {lectura.reseña && (
                                <div className="mt-2 p-2 bg-white/50 dark:bg-slate-800/50 rounded border-l-2 border-blue-500">
                                  <p className="text-sm text-slate-800 dark:text-slate-200 italic">
                                    "{lectura.reseña}"
                                  </p>
                                </div>
                              )}
                              
                              {lectura.notas && (
                                <div className="text-xs text-slate-600 dark:text-slate-400">
                                  <strong>Notas:</strong> {lectura.notas}
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
    </>
  );
};

export default BookDescriptionModal;