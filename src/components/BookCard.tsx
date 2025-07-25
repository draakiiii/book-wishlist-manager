import React, { useState } from 'react';
import { useAppState } from '../context/AppStateContext';
import { Libro, BookListType } from '../types';
import { motion } from 'framer-motion';
import { 
  BookOpen, 
  Trash2, 
  Play, 
  CheckCircle, 
  RotateCcw, 
  ShoppingCart,
  Calendar,
  User,
  FileText,
  Star,
  Edit3,
  Eye,
  XCircle,
  Users
} from 'lucide-react';
import BookDescriptionModal from './BookDescriptionModal';
import RatingModal from './RatingModal';
import LoanModal from './LoanModal';
import BookCover from './BookCover';
import { useDialog } from '../hooks/useDialog';
import Dialog from './Dialog';
import InputModal from './InputModal';

interface BookCardProps {
  book: Libro;
  type?: BookListType;
  onDelete?: (id: number) => void;
  onEdit?: (book: Libro) => void;
  variant?: 'full' | 'compact';
}

const BookCard: React.FC<BookCardProps> = ({ book, type, onDelete, onEdit, variant = 'full' }) => {
  const { state, dispatch } = useAppState();
  const { dialog, showError, showConfirm, hideDialog } = useDialog();
  const [showActions, setShowActions] = useState(false);
  const [showDescriptionModal, setShowDescriptionModal] = useState(false);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [showLoanModal, setShowLoanModal] = useState(false);
  const [showInputModal, setShowInputModal] = useState(false);
  const [inputModalConfig, setInputModalConfig] = useState<{
    title: string;
    message: string;
    placeholder: string;
    onConfirm: (value: string) => void;
  } | null>(null);

  // Función para calcular el número del libro en la saga
  const getBookNumberInSaga = (book: Libro): number | null => {
    if (!book.sagaId) return null;
    
    const librosDeLaSaga = state.libros
      .filter(libro => libro.sagaId === book.sagaId)
      .sort((a, b) => a.id - b.id); // Ordenar por ID para mantener consistencia
    
    const bookIndex = librosDeLaSaga.findIndex(libro => libro.id === book.id);
    return bookIndex !== -1 ? bookIndex + 1 : null;
  };

  const handleStartReading = () => {
    dispatch({ type: 'START_READING', payload: { id: book.id } });
  };

  const handleFinishReading = () => {
    setShowRatingModal(true);
  };

  const handleRatingConfirm = (calificacion: number, review: string) => {
    dispatch({ 
      type: 'FINISH_READING', 
      payload: { 
        id: book.id,
        calificacion,
        notas: review || undefined
      } 
    });
  };

  const handleAbandonBook = () => {
    setInputModalConfig({
      title: 'Abandonar libro',
      message: '¿Por qué abandonaste el libro?',
      placeholder: 'Motivo del abandono...',
      onConfirm: (motivo: string) => {
        dispatch({ 
          type: 'ABANDON_BOOK', 
          payload: { id: book.id, motivo: motivo || undefined } 
        });
      }
    });
    setShowInputModal(true);
  };

  const handleChangeState = (newState: Libro['estado']) => {
    dispatch({ 
      type: 'CHANGE_BOOK_STATE', 
      payload: { id: book.id, newState } 
    });
  };

  const handleBuyBook = () => {
    // Verificar si el sistema de puntos/dinero está habilitado
    if (state.config.sistemaPuntosHabilitado) {
      if (state.config.modoDinero) {
        // Modo dinero - calcular costo por páginas
        const paginas = book.paginas || 0;
        const costoPorPagina = state.config.costoPorPagina || 0.25;
        const costoTotal = paginas * costoPorPagina;
        
        if (costoTotal <= 0) {
          showError(
            'Libro sin páginas',
            'No se puede calcular el costo de un libro sin información de páginas.'
          );
          return;
        }
        
        if (state.dineroActual < costoTotal) {
          showError(
            'Dinero insuficiente',
            `Necesitas $${costoTotal.toFixed(2)} para comprar este libro (${paginas} páginas × $${costoPorPagina.toFixed(2)}/página). Tienes $${state.dineroActual.toFixed(2)}.`
          );
          return;
        }
        
        showConfirm(
          'Comprar libro con dinero',
          `¿Quieres comprar "${book.titulo}" por $${costoTotal.toFixed(2)}?\n\nDetalles:\n• Páginas: ${paginas}\n• Costo por página: $${costoPorPagina.toFixed(2)}\n• Costo total: $${costoTotal.toFixed(2)}\n\nDinero actual: $${state.dineroActual.toFixed(2)}\nDinero después de la compra: $${(state.dineroActual - costoTotal).toFixed(2)}`,
          () => {
            dispatch({ 
              type: 'COMPRAR_LIBRO_CON_DINERO', 
              payload: { libroId: book.id } 
            });
          },
          undefined,
          'Comprar',
          'Cancelar'
        );
      } else {
        // Modo puntos
        const puntosNecesarios = state.config.puntosParaComprar || 25;
        
        if (state.puntosActuales < puntosNecesarios) {
          showError(
            'Puntos insuficientes',
            `Necesitas ${puntosNecesarios} puntos para comprar este libro. Tienes ${state.puntosActuales} puntos.`
          );
          return;
        }
        
        showConfirm(
          'Comprar libro con puntos',
          `¿Quieres comprar "${book.titulo}" con ${puntosNecesarios} puntos?\n\nPuntos actuales: ${state.puntosActuales}\nPuntos después de la compra: ${state.puntosActuales - puntosNecesarios}`,
          () => {
            dispatch({ 
              type: 'COMPRAR_LIBRO_CON_PUNTOS', 
              payload: { libroId: book.id } 
            });
          },
          undefined,
          'Comprar',
          'Cancelar'
        );
      }
    } else {
      // Sistema tradicional con precio
      setInputModalConfig({
        title: 'Comprar libro',
        message: '¿Cuánto costó el libro?',
        placeholder: '0.00',
        onConfirm: (precio: string) => {
          dispatch({ 
            type: 'BUY_BOOK', 
            payload: { 
              id: book.id, 
              precio: precio ? parseFloat(precio) : undefined 
            } 
          });
        }
      });
      setShowInputModal(true);
    }
  };

  const handleLoanBook = () => {
    setShowLoanModal(true);
  };

  const handleLoanConfirm = (prestadoA: string) => {
    dispatch({ 
      type: 'LOAN_BOOK', 
      payload: { id: book.id, prestadoA } 
    });
  };

  const handleReturnBook = () => {
    dispatch({ type: 'RETURN_BOOK', payload: { id: book.id } });
  };

  const handleDelete = () => {
    if (onDelete) {
      // If onDelete is provided, use it directly (parent will handle confirmation)
      onDelete(book.id);
    } else {
      // Only show confirmation if no onDelete prop is provided
      showConfirm(
        'Eliminar libro',
        `¿Estás seguro de que quieres eliminar "${book.titulo}" de tu biblioteca?\n\nEsta acción no se puede deshacer.`,
        () => {
          dispatch({ type: 'DELETE_BOOK', payload: book.id });
        },
        undefined,
        'Eliminar',
        'Cancelar'
      );
    }
  };

  const handleImageUpdate = (bookId: number, imageUrl: string) => {
    dispatch({ type: 'UPDATE_BOOK_IMAGE', payload: { id: bookId, customImage: imageUrl } });
  };

  const handleShowDescription = () => {
    setShowDescriptionModal(true);
  };

  const getTypeColor = () => {
    // Si el libro está prestado, usar un color especial pero mantener el color base del estado
    const baseColor = book.prestado ? 'border-purple-300 dark:border-purple-600 bg-purple-50 dark:bg-purple-900/20' : '';
    
    switch (book.estado) {
      case 'tbr':
        return book.prestado ? 'border-warning-300 dark:border-warning-600 bg-warning-50 dark:bg-warning-900/20 ring-2 ring-purple-300 dark:ring-purple-600' : 'border-warning-300 dark:border-warning-600 bg-warning-50 dark:bg-warning-900/20';
      case 'leyendo':
        return book.prestado ? 'border-primary-300 dark:border-primary-600 bg-primary-50 dark:bg-primary-900/20 ring-2 ring-purple-300 dark:ring-purple-600' : 'border-primary-300 dark:border-primary-600 bg-primary-50 dark:bg-primary-900/20';
      case 'leido':
        return book.prestado ? 'border-success-300 dark:border-success-600 bg-success-50 dark:bg-success-900/20 ring-2 ring-purple-300 dark:ring-purple-600' : 'border-success-300 dark:border-success-600 bg-success-50 dark:bg-success-900/20';
      case 'abandonado':
        return book.prestado ? 'border-red-300 dark:border-red-600 bg-red-50 dark:bg-red-900/20 ring-2 ring-purple-300 dark:ring-purple-600' : 'border-red-300 dark:border-red-600 bg-red-50 dark:bg-red-900/20';
      case 'wishlist':
        return book.prestado ? 'border-secondary-300 dark:border-secondary-600 bg-secondary-50 dark:bg-secondary-900/20 ring-2 ring-purple-300 dark:ring-purple-600' : 'border-secondary-300 dark:border-secondary-600 bg-secondary-50 dark:bg-secondary-900/20';
      case 'comprado':
        return book.prestado ? 'border-blue-300 dark:border-blue-600 bg-blue-50 dark:bg-blue-900/20 ring-2 ring-purple-300 dark:ring-purple-600' : 'border-blue-300 dark:border-blue-600 bg-blue-50 dark:bg-blue-900/20';
      default:
        return book.prestado ? 'border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900/20 ring-2 ring-purple-300 dark:ring-purple-600' : 'border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900/20';
    }
  };

  const getTypeIcon = () => {
    switch (book.estado) {
      case 'tbr':
        return <Calendar className="h-4 w-4 text-warning-600 dark:text-warning-400" />;
      case 'leyendo':
        return <BookOpen className="h-4 w-4 text-primary-600 dark:text-primary-400" />;
      case 'leido':
        return <CheckCircle className="h-4 w-4 text-success-600 dark:text-success-400" />;
      case 'abandonado':
        return <XCircle className="h-4 w-4 text-red-600 dark:text-red-400" />;
      case 'wishlist':
        return <Star className="h-4 w-4 text-secondary-600 dark:text-secondary-400" />;
      case 'comprado':
        return <ShoppingCart className="h-4 w-4 text-blue-600 dark:text-blue-400" />;
      default:
        return <BookOpen className="h-4 w-4 text-slate-600 dark:text-slate-400" />;
    }
  };

  const getTypeLabel = () => {
    let baseLabel = '';
    switch (book.estado) {
      case 'tbr':
        baseLabel = 'TBR';
        break;
      case 'leyendo':
        baseLabel = 'Leyendo';
        break;
      case 'leido':
        baseLabel = 'Leído';
        break;
      case 'abandonado':
        baseLabel = 'Abandonado';
        break;
      case 'wishlist':
        baseLabel = 'Deseos';
        break;
      case 'comprado':
        baseLabel = 'Comprado';
        break;
      default:
        baseLabel = book.estado;
    }
    
    // Si está prestado, agregar indicador
    return book.prestado ? `${baseLabel} (Prestado)` : baseLabel;
  };

  // Vista compacta para galería
  if (variant === 'compact') {
    return (
      <>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          whileHover={{ scale: 1.02, y: -2 }}
          className={`relative rounded-xl border-2 p-3 transition-all duration-300 hover:shadow-lg ${getTypeColor()} group`}
        >
          {/* Type Badge */}
          <div className="absolute -top-2 -right-2 z-10">
            <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium bg-white dark:bg-slate-800 border-2 ${getTypeColor().split(' ')[0]}`}>
              {getTypeIcon()}
            </div>
          </div>
          
          {/* Loan Badge */}
          {book.prestado && (
            <div className="absolute -top-2 -left-2 z-10">
              <div className="flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium bg-purple-500 text-white">
                <Users className="h-3 w-3" />
              </div>
            </div>
          )}

          {/* Book Cover */}
          <div className="aspect-[3/4] mb-3">
            <BookCover
              book={book}
              context="gallery"
              onImageUpdate={handleImageUpdate}
              className="w-full h-full object-cover rounded-lg"
            />
          </div>

          {/* Book Info */}
          <div className="space-y-1">
            <h3 className="font-semibold text-sm text-slate-900 dark:text-white line-clamp-2 leading-tight">
              {book.titulo}
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-1">
              {book.autor}
            </p>
            
            {/* Rating */}
            {book.calificacion && book.calificacion > 0 && (
              <div className="flex items-center space-x-1">
                <Star className="h-3 w-3 text-yellow-500 fill-current" />
                <span className="text-xs text-slate-600 dark:text-slate-400">
                  {book.calificacion}
                </span>
              </div>
            )}
          </div>

          {/* Actions overlay */}
          <div className="absolute inset-0 bg-black/50 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center pointer-events-none group-hover:pointer-events-auto">
            <div className="flex space-x-2">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={(e) => {
                  e.stopPropagation();
                  handleShowDescription();
                }}
                className="p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors"
              >
                <Eye className="h-4 w-4" />
              </motion.button>
              
              {onEdit && (
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit(book);
                  }}
                  className="p-2 bg-slate-500 text-white rounded-full hover:bg-slate-600 transition-colors"
                >
                  <Edit3 className="h-4 w-4" />
                </motion.button>
              )}
              
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete();
                }}
                className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
              >
                <Trash2 className="h-4 w-4" />
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Modals para vista compacta */}
        <BookDescriptionModal
          isOpen={showDescriptionModal}
          onClose={() => setShowDescriptionModal(false)}
          book={book}
        />

        <RatingModal
          isOpen={showRatingModal}
          onClose={() => setShowRatingModal(false)}
          onConfirm={handleRatingConfirm}
          bookTitle={book.titulo}
          currentRating={book.calificacion || 0}
          currentReview={book.notas || ''}
        />

        <LoanModal
          isOpen={showLoanModal}
          onClose={() => setShowLoanModal(false)}
          onConfirm={handleLoanConfirm}
          bookTitle={book.titulo}
        />

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

        {inputModalConfig && (
          <InputModal
            isOpen={showInputModal}
            onClose={() => setShowInputModal(false)}
            title={inputModalConfig.title}
            message={inputModalConfig.message}
            placeholder={inputModalConfig.placeholder}
            onConfirm={inputModalConfig.onConfirm}
          />
        )}
      </>
    );
  }

  // Vista completa por defecto
  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ y: -2 }}
        className={`relative rounded-xl border-2 p-3 sm:p-4 transition-all duration-300 hover:shadow-lg ${getTypeColor()}`}
        onMouseEnter={() => setShowActions(true)}
        onMouseLeave={() => setShowActions(false)}
      >
      {/* Type Badge */}
      <div className="absolute top-2 right-2 flex items-center space-x-1 px-2 py-1 bg-white/80 dark:bg-slate-800/80 rounded-full text-xs font-medium">
        {getTypeIcon()}
        <span className="capitalize hidden sm:inline">{getTypeLabel()}</span>
      </div>

      {/* Book Content with Cover */}
      <div className="flex space-x-3 sm:space-x-4">
        {/* Book Cover */}
        <BookCover 
          book={book} 
          size="medium" 
          context="list" 
          className="flex-shrink-0"
          onImageUpdate={handleImageUpdate}
        />
        
        {/* Book Info */}
        <div className="flex-1 space-y-2 sm:space-y-3 min-w-0">
          <div>
            <h3 className="font-semibold text-slate-900 dark:text-white text-base sm:text-lg leading-tight pr-16 sm:pr-20">
              {book.titulo}
            </h3>
            {book.autor && (
              <div className="flex items-center space-x-2 text-slate-600 dark:text-slate-400 mt-1">
                <User className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                <span className="text-xs sm:text-sm truncate">{book.autor}</span>
              </div>
            )}
          </div>

          {/* Book Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 text-xs sm:text-sm">
            {book.paginas && (
              <div className="flex items-center space-x-2">
                <FileText className="h-3 w-3 sm:h-4 sm:w-4 text-slate-500 flex-shrink-0" />
                <span className="text-slate-700 dark:text-slate-300">
                  {book.paginas} páginas
                </span>
              </div>
            )}
            
            {book.sagaName && (
              <div className="flex items-center space-x-2">
                <Star className="h-3 w-3 sm:h-4 sm:w-4 text-amber-500 flex-shrink-0" />
                <span className="text-slate-700 dark:text-slate-300 truncate">
                  {book.sagaName}
                  {(() => {
                    const bookNumber = getBookNumberInSaga(book);
                    return bookNumber ? ` #${bookNumber}` : '';
                  })()}
                </span>
              </div>
            )}

            {book.calificacion && (
              <div className="flex items-center space-x-2">
                <Star className="h-3 w-3 sm:h-4 sm:w-4 text-yellow-500 flex-shrink-0" />
                <span className="text-slate-700 dark:text-slate-300">
                  {book.calificacion}/5
                </span>
              </div>
            )}

            {book.prestado && book.prestadoA && (
              <div className="flex items-center space-x-2">
                <Users className="h-3 w-3 sm:h-4 sm:w-4 text-purple-500 flex-shrink-0" />
                <span className="text-slate-700 dark:text-slate-300 truncate">
                  Prestado a {book.prestadoA}
                </span>
              </div>
            )}
          </div>

          {/* Actions */}
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ 
              opacity: showActions ? 1 : 0, 
              height: showActions ? 'auto' : 0 
            }}
            className="flex flex-wrap gap-1 sm:gap-2 pt-2"
          >
          {/* TBR Actions */}
          {book.estado === 'tbr' && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleStartReading}
              className="flex-1 sm:flex-none px-2 sm:px-3 py-1.5 bg-primary-500 hover:bg-primary-600 text-white rounded-lg text-xs sm:text-sm font-medium transition-colors duration-200 flex items-center justify-center space-x-1"
            >
              <Play className="h-3 w-3" />
              <span>Empezar</span>
            </motion.button>
          )}

          {/* Currently Reading Actions */}
          {book.estado === 'leyendo' && (
            <>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleFinishReading}
                className="flex-1 sm:flex-none px-2 sm:px-3 py-1.5 bg-success-500 hover:bg-success-600 text-white rounded-lg text-xs sm:text-sm font-medium transition-colors duration-200 flex items-center justify-center space-x-1"
              >
                <CheckCircle className="h-3 w-3" />
                <span>Terminar</span>
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleAbandonBook}
                className="flex-1 sm:flex-none px-2 sm:px-3 py-1.5 bg-warning-500 hover:bg-warning-600 text-white rounded-lg text-xs sm:text-sm font-medium transition-colors duration-200 flex items-center justify-center space-x-1"
              >
                <XCircle className="h-3 w-3" />
                <span>Abandonar</span>
              </motion.button>
            </>
          )}

          {/* Read Books Actions */}
          {book.estado === 'leido' && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleChangeState('tbr')}
              className="flex-1 sm:flex-none px-2 sm:px-3 py-1.5 bg-slate-500 hover:bg-slate-600 text-white rounded-lg text-xs sm:text-sm font-medium transition-colors duration-200 flex items-center justify-center space-x-1"
            >
              <RotateCcw className="h-3 w-3" />
              <span>Mover a TBR</span>
            </motion.button>
          )}

          {/* Wishlist Actions */}
          {book.estado === 'wishlist' && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleBuyBook}
              className="flex-1 sm:flex-none px-2 sm:px-3 py-1.5 bg-secondary-500 hover:bg-secondary-600 text-white rounded-lg text-xs sm:text-sm font-medium transition-colors duration-200 flex items-center justify-center space-x-1"
            >
              <ShoppingCart className="h-3 w-3" />
              <span>
                {state.config.sistemaPuntosHabilitado 
                  ? state.config.modoDinero
                    ? (() => {
                        const paginas = book.paginas || 0;
                        const costoPorPagina = state.config.costoPorPagina || 0.25;
                        const costoTotal = paginas * costoPorPagina;
                        return costoTotal > 0 
                          ? `Comprar ($${costoTotal.toFixed(2)})`
                          : 'Comprar';
                      })()
                    : `Comprar (${state.config.puntosParaComprar || 25} pts)`
                  : 'Comprar'
                }
              </span>
            </motion.button>
          )}

          {/* Purchased Books Actions */}
          {book.estado === 'comprado' && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleChangeState('tbr')}
              className="flex-1 sm:flex-none px-2 sm:px-3 py-1.5 bg-primary-500 hover:bg-primary-600 text-white rounded-lg text-xs sm:text-sm font-medium transition-colors duration-200 flex items-center justify-center space-x-1"
            >
              <Play className="h-3 w-3" />
              <span>Empezar</span>
            </motion.button>
          )}

          {/* Return action for lent books */}
          {book.prestado && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleReturnBook}
              className="flex-1 sm:flex-none px-2 sm:px-3 py-1.5 bg-green-500 hover:bg-green-600 text-white rounded-lg text-xs sm:text-sm font-medium transition-colors duration-200 flex items-center justify-center space-x-1"
            >
              <CheckCircle className="h-3 w-3" />
              <span>Devolver</span>
            </motion.button>
          )}

          {/* Loan action for owned books */}
          {(book.estado === 'tbr' || book.estado === 'leido' || book.estado === 'comprado') && !book.prestado && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleLoanBook}
              className="flex-1 sm:flex-none px-2 sm:px-3 py-1.5 bg-purple-500 hover:bg-purple-600 text-white rounded-lg text-xs sm:text-sm font-medium transition-colors duration-200 flex items-center justify-center space-x-1"
            >
              <Users className="h-3 w-3" />
              <span>Prestar</span>
            </motion.button>
          )}

          {/* Edit button for all books */}
          {onEdit && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={(e) => {
                e.stopPropagation();
                onEdit(book);
              }}
              className="flex-1 sm:flex-none px-2 sm:px-3 py-1.5 bg-slate-500 hover:bg-slate-600 text-white rounded-lg text-xs sm:text-sm font-medium transition-colors duration-200 flex items-center justify-center space-x-1"
            >
              <Edit3 className="h-3 w-3" />
              <span>Editar</span>
            </motion.button>
          )}

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={(e) => {
              e.stopPropagation();
              handleDelete();
            }}
            className="flex-1 sm:flex-none px-2 sm:px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white rounded-lg text-xs sm:text-sm font-medium transition-colors duration-200 flex items-center justify-center space-x-1"
          >
            <Trash2 className="h-3 w-3" />
            <span>Eliminar</span>
          </motion.button>

          {/* View button for all books - placed last to be the largest */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={(e) => {
              e.stopPropagation();
              handleShowDescription();
            }}
            className="flex-1 sm:flex-none px-2 sm:px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-xs sm:text-sm font-medium transition-colors duration-200 flex items-center justify-center space-x-1"
          >
            <Eye className="h-3 w-3" />
            <span>Visualizar</span>
          </motion.button>
          </motion.div>
        </div>
      </div>
    </motion.div>

    {/* Description Modal */}
    <BookDescriptionModal
      isOpen={showDescriptionModal}
      onClose={() => setShowDescriptionModal(false)}
      book={book}
    />

    {/* Rating Modal */}
    <RatingModal
      isOpen={showRatingModal}
      onClose={() => setShowRatingModal(false)}
      onConfirm={handleRatingConfirm}
      bookTitle={book.titulo}
      currentRating={book.calificacion || 0}
      currentReview={book.notas || ''}
    />

    {/* Loan Modal */}
    <LoanModal
      isOpen={showLoanModal}
      onClose={() => setShowLoanModal(false)}
      onConfirm={handleLoanConfirm}
      bookTitle={book.titulo}
    />

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

      {/* Input Modal */}
      {showInputModal && inputModalConfig && (
        <InputModal
          isOpen={showInputModal}
          onClose={() => setShowInputModal(false)}
          title={inputModalConfig.title}
          message={inputModalConfig.message}
          placeholder={inputModalConfig.placeholder}
          onConfirm={inputModalConfig.onConfirm}
        />
      )}

    {/* Input Modal */}
    {inputModalConfig && (
      <InputModal
        isOpen={showInputModal}
        onClose={() => setShowInputModal(false)}
        title={inputModalConfig.title}
        message={inputModalConfig.message}
        placeholder={inputModalConfig.placeholder}
        onConfirm={inputModalConfig.onConfirm}
      />
    )}
    </>
  );
};

export default BookCard; 