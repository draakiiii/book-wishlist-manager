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
import { useDialog } from '../hooks/useDialog';
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
    // Verificar si el sistema de puntos está habilitado
    if (state.config.sistemaPuntosHabilitado) {
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
      onDelete(book.id);
    } else {
      dispatch({ type: 'DELETE_BOOK', payload: book.id });
    }
  };

  const handleShowDescription = () => {
    setShowDescriptionModal(true);
  };

  const getTypeColor = () => {
    switch (type) {
      case 'tbr':
        return 'border-warning-300 dark:border-warning-600 bg-warning-50 dark:bg-warning-900/20';
      case 'leyendo':
        return 'border-primary-300 dark:border-primary-600 bg-primary-50 dark:bg-primary-900/20';
      case 'leido':
        return 'border-success-300 dark:border-success-600 bg-success-50 dark:bg-success-900/20';
      case 'abandonado':
        return 'border-red-300 dark:border-red-600 bg-red-50 dark:bg-red-900/20';
      case 'wishlist':
        return 'border-secondary-300 dark:border-secondary-600 bg-secondary-50 dark:bg-secondary-900/20';
      case 'comprado':
        return 'border-blue-300 dark:border-blue-600 bg-blue-50 dark:bg-blue-900/20';
      case 'prestado':
        return 'border-purple-300 dark:border-purple-600 bg-purple-50 dark:bg-purple-900/20';
      default:
        return 'border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900/20';
    }
  };

  const getTypeIcon = () => {
    switch (type) {
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
      case 'prestado':
        return <Users className="h-4 w-4 text-purple-600 dark:text-purple-400" />;
      default:
        return <BookOpen className="h-4 w-4 text-slate-600 dark:text-slate-400" />;
    }
  };

  const getTypeLabel = () => {
    switch (type) {
      case 'tbr':
        return 'TBR';
      case 'leyendo':
        return 'Leyendo';
      case 'leido':
        return 'Leído';
      case 'abandonado':
        return 'Abandonado';
      case 'wishlist':
        return 'Deseos';
      case 'comprado':
        return 'Comprado';
      case 'prestado':
        return 'Prestado';
      default:
        return type;
    }
  };

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

      {/* Book Info */}
      <div className="space-y-2 sm:space-y-3">
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
          {type === 'tbr' && (
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
          {type === 'leyendo' && (
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
          {type === 'leido' && (
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
          {type === 'wishlist' && (
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
          {type === 'comprado' && (
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

          {/* Lent Books Actions */}
          {type === 'prestado' && (
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
          {(type === 'tbr' || type === 'leido' || type === 'comprado') && !book.prestado && (
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