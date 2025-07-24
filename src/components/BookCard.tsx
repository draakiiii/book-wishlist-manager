import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  User, 
  FileText, 
  Star, 
  Users, 
  Play, 
  CheckCircle, 
  XCircle, 
  RotateCcw, 
  ShoppingCart, 
  Edit3, 
  Trash2, 
  Eye, 
  BookOpen 
} from 'lucide-react';
import { useAppState } from '../context/AppStateContext';
import { useDialog } from '../hooks/useDialog';
import { Libro, BookListType } from '../types';
import BookDescriptionModal from './BookDescriptionModal';
import RatingModal from './RatingModal';
import LoanModal from './LoanModal';
import Dialog from './Dialog';
import InputModal from './InputModal';

interface BookCardProps {
  book: Libro;
  type: BookListType;
  onDelete?: (id: number) => void;
  onEdit?: (book: Libro) => void;
}

const BookCard: React.FC<BookCardProps> = ({ book, type, onDelete, onEdit }) => {
  const { state, dispatch } = useAppState();
  const { dialog, showError, showConfirm, hideDialog } = useDialog();
  const [showActions, setShowActions] = useState(false);
  const [showDescriptionModal, setShowDescriptionModal] = useState(false);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [showLoanModal, setShowLoanModal] = useState(false);
  const [showInputModal, setShowInputModal] = useState(false);
  const [inputModalConfig, setInputModalConfig] = useState<any>(null);

  const getBookNumberInSaga = (book: Libro): number | null => {
    if (!book.sagaName) return null;
    const sagaBooks = state.libros.filter(l => l.sagaName === book.sagaName);
    const sortedBooks = sagaBooks.sort((a, b) => {
      const aNum = parseInt(a.titulo.match(/#(\d+)/)?.[1] || '0');
      const bNum = parseInt(b.titulo.match(/#(\d+)/)?.[1] || '0');
      return aNum - bNum;
    });
    const bookIndex = sortedBooks.findIndex(l => l.id === book.id);
    return bookIndex >= 0 ? bookIndex + 1 : null;
  };

  const handleStartReading = () => {
    dispatch({ type: 'CHANGE_BOOK_STATE', payload: { id: book.id, newState: 'leyendo' } });
  };

  const handleFinishReading = () => {
    setShowRatingModal(true);
  };

  const handleRatingConfirm = (calificacion: number, review: string) => {
    dispatch({ 
      type: 'CHANGE_BOOK_STATE', 
      payload: { 
        id: book.id, 
        newState: 'leido',
        notas: review
      } 
    });
    // También actualizar la calificación por separado
    dispatch({
      type: 'UPDATE_BOOK',
      payload: {
        id: book.id,
        updates: { calificacion }
      }
    });
    setShowRatingModal(false);
  };

  const handleAbandonBook = () => {
    showConfirm(
      'Abandonar libro',
      `¿Estás seguro de que quieres abandonar "${book.titulo}"?`,
      () => {
        dispatch({ type: 'CHANGE_BOOK_STATE', payload: { id: book.id, newState: 'abandonado' } });
      }
    );
  };

  const handleChangeState = (newState: Libro['estado']) => {
    dispatch({ type: 'CHANGE_BOOK_STATE', payload: { id: book.id, newState } });
  };

  const handleBuyBook = () => {
    if (state.config.sistemaPuntosHabilitado) {
      const puntosNecesarios = state.config.puntosParaComprar || 25;
      if (state.puntos < puntosNecesarios) {
        showError('Puntos insuficientes', `Necesitas ${puntosNecesarios} puntos para comprar este libro. Tienes ${state.puntos} puntos.`);
        return;
      }
      
      showConfirm(
        'Comprar libro',
        `¿Estás seguro de que quieres comprar "${book.titulo}" por ${puntosNecesarios} puntos?`,
        () => {
          dispatch({ type: 'CHANGE_BOOK_STATE', payload: { id: book.id, newState: 'comprado' } });
          dispatch({ type: 'SPEND_POINTS', payload: puntosNecesarios });
        }
      );
    } else {
      dispatch({ type: 'CHANGE_BOOK_STATE', payload: { id: book.id, newState: 'comprado' } });
    }
  };

  const handleLoanBook = () => {
    setInputModalConfig({
      title: 'Prestar libro',
      message: `¿A quién quieres prestar "${book.titulo}"?`,
      placeholder: 'Nombre de la persona',
      onConfirm: (prestadoA: string) => {
        dispatch({ 
          type: 'LOAN_BOOK', 
          payload: { id: book.id, prestadoA } 
        });
        setShowInputModal(false);
      }
    });
    setShowInputModal(true);
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
    showConfirm(
      'Eliminar libro',
      `¿Estás seguro de que quieres eliminar "${book.titulo}"? Esta acción no se puede deshacer.`,
      () => {
        if (onDelete) {
          onDelete(book.id);
        } else {
          dispatch({ type: 'DELETE_BOOK', payload: { id: book.id } });
        }
      }
    );
  };

  const handleShowDescription = () => {
    setShowDescriptionModal(true);
  };

  const getTypeColor = () => {
    switch (book.estado) {
      case 'tbr':
        return 'border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20';
      case 'leyendo':
        return 'border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-900/20';
      case 'leido':
        return 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20';
      case 'abandonado':
        return 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20';
      case 'wishlist':
        return 'border-purple-200 bg-purple-50 dark:border-purple-800 dark:bg-purple-900/20';
      case 'comprado':
        return 'border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-900/20';
      case 'prestado':
        return 'border-indigo-200 bg-indigo-50 dark:border-indigo-800 dark:bg-indigo-900/20';
      default:
        return 'border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800/50';
    }
  };

  const getTypeIcon = () => {
    switch (book.estado) {
      case 'tbr':
        return <Play className="h-3 w-3 text-blue-600 dark:text-blue-400" />;
      case 'leyendo':
        return <FileText className="h-3 w-3 text-yellow-600 dark:text-yellow-400" />;
      case 'leido':
        return <CheckCircle className="h-3 w-3 text-green-600 dark:text-green-400" />;
      case 'abandonado':
        return <XCircle className="h-3 w-3 text-red-600 dark:text-red-400" />;
      case 'wishlist':
        return <Star className="h-3 w-3 text-purple-600 dark:text-purple-400" />;
      case 'comprado':
        return <ShoppingCart className="h-3 w-3 text-orange-600 dark:text-orange-400" />;
      case 'prestado':
        return <Users className="h-3 w-3 text-indigo-600 dark:text-indigo-400" />;
      default:
        return <BookOpen className="h-3 w-3 text-slate-600 dark:text-slate-400" />;
    }
  };

  const getTypeLabel = () => {
    const baseLabel = {
      'tbr': 'TBR',
      'leyendo': 'Leyendo',
      'leido': 'Leído',
      'abandonado': 'Abandonado',
      'wishlist': 'Wishlist',
      'comprado': 'Comprado',
      'prestado': 'Prestado'
    }[book.estado] || 'Desconocido';
    
    return book.prestado ? `${baseLabel} (Prestado)` : baseLabel;
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ y: -2 }}
        className={`relative rounded-xl border-2 transition-all duration-300 hover:shadow-lg book-card ${getTypeColor()} ${
          state.config.mostrarPortadas ? 'p-3 sm:p-4' : 'p-4 sm:p-5'
        }`}
        onMouseEnter={() => setShowActions(true)}
        onMouseLeave={() => setShowActions(false)}
      >
        {/* Type Badge */}
        <div className="absolute top-2 right-2 flex items-center space-x-1 px-2 py-1 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-full text-xs font-medium z-10">
          {getTypeIcon()}
          <span className="capitalize hidden sm:inline">{getTypeLabel()}</span>
        </div>

        {/* Book Content */}
        <div className={`${state.config.mostrarPortadas ? 'flex flex-col sm:flex-row gap-3 sm:gap-4' : 'space-y-3'}`}>
          {/* Cover Image */}
          {state.config.mostrarPortadas && (
            <div className="flex-shrink-0 flex justify-center sm:justify-start">
              {book.portada ? (
                <div className="relative w-20 h-28 sm:w-24 sm:h-32 md:w-28 md:h-36 rounded-lg overflow-hidden shadow-lg">
                  <img
                    src={book.portada}
                    alt={`Portada de ${book.titulo}`}
                    className="w-full h-full object-cover cover-image"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                  {/* Overlay for hover effect */}
                  <div className="absolute inset-0 bg-black/0 hover:bg-black/10 transition-colors duration-300" />
                </div>
              ) : (
                <div className="relative w-20 h-28 sm:w-24 sm:h-32 md:w-28 md:h-36 rounded-lg overflow-hidden shadow-lg bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-800 flex items-center justify-center">
                  <BookOpen className="h-6 w-6 sm:h-8 sm:w-8 text-slate-400" />
                </div>
              )}
            </div>
          )}
          
          {/* Book Info */}
          <div className="flex-1 min-w-0 space-y-2 sm:space-y-3">
            {/* Title and Author */}
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-white book-title leading-tight pr-12 sm:pr-16 line-clamp-2">
                {book.titulo}
              </h3>
              {book.autor && (
                <div className="flex items-center space-x-2 text-slate-600 dark:text-slate-400 mt-1">
                  <User className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                  <span className="book-author truncate">{book.autor}</span>
                </div>
              )}
            </div>

            {/* Book Details Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 sm:gap-2 book-details">
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
              className="flex flex-wrap gap-1.5 sm:gap-2 pt-2 sm:pt-3"
            >
              {/* TBR Actions */}
              {book.estado === 'tbr' && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleStartReading}
                  className="flex-1 sm:flex-none px-3 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 flex items-center justify-center space-x-1.5 shadow-sm hover:shadow-md"
                >
                  <Play className="h-3 w-3 sm:h-4 sm:w-4" />
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
                    className="flex-1 sm:flex-none px-3 py-2 bg-success-500 hover:bg-success-600 text-white rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 flex items-center justify-center space-x-1.5 shadow-sm hover:shadow-md"
                  >
                    <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span>Terminar</span>
                  </motion.button>
                  
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleAbandonBook}
                    className="flex-1 sm:flex-none px-3 py-2 bg-warning-500 hover:bg-warning-600 text-white rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 flex items-center justify-center space-x-1.5 shadow-sm hover:shadow-md"
                  >
                    <XCircle className="h-3 w-3 sm:h-4 sm:w-4" />
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
                      ? `Comprar (${state.config.puntosParaComprar || 25} pts)`
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