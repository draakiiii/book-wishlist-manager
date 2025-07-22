import React, { useState } from 'react';
import { useAppState } from '../context/AppStateContext';
import { Libro } from '../types';
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
  Edit3
} from 'lucide-react';

interface BookCardProps {
  book: Libro;
  type: 'tbr' | 'historial' | 'wishlist' | 'actual';
  onDelete?: (id: number) => void;
  onEdit?: (book: Libro) => void;
}

const BookCard: React.FC<BookCardProps> = ({ book, type, onDelete, onEdit }) => {
  const { state, dispatch } = useAppState();
  const [showActions, setShowActions] = useState(false);

  // Función para calcular el número del libro en la saga
  const getBookNumberInSaga = (book: Libro): number | null => {
    if (!book.sagaId) return null;
    
    const todosLosLibros = [
      ...state.tbr,
      ...state.historial,
      ...(state.libroActual ? [state.libroActual] : [])
    ];
    
    const librosDeLaSaga = todosLosLibros
      .filter(libro => libro.sagaId === book.sagaId)
      .sort((a, b) => a.id - b.id); // Ordenar por ID para mantener consistencia
    
    const bookIndex = librosDeLaSaga.findIndex(libro => libro.id === book.id);
    return bookIndex !== -1 ? bookIndex + 1 : null;
  };

  const handleStartBook = () => {
    dispatch({ type: 'START_BOOK', payload: book.id });
  };

  const handleFinishBook = () => {
    dispatch({ type: 'FINISH_BOOK', payload: book.id });
  };

  const handleAbandonBook = () => {
    dispatch({ type: 'ABANDON_BOOK', payload: book.id });
  };

  const handleMoveBackFromHistory = () => {
    dispatch({ type: 'MOVE_BACK_FROM_HISTORY', payload: book.id });
  };

  const handlePurchaseWishlistBook = () => {
    const pages = prompt('¿Cuántas páginas tiene el libro?');
    if (pages && !isNaN(parseInt(pages))) {
      dispatch({ 
        type: 'PURCHASE_WISHLIST_BOOK', 
        payload: { id: book.id, pages: parseInt(pages) } 
      });
    }
  };

  const handleDelete = () => {
    if (onDelete) {
      onDelete(book.id);
    } else {
      dispatch({ type: 'DELETE_BOOK', payload: { id: book.id, listType: type } });
    }
  };

  const getTypeColor = () => {
    switch (type) {
      case 'tbr':
        return 'border-warning-300 dark:border-warning-600 bg-warning-50 dark:bg-warning-900/20';
      case 'historial':
        return 'border-success-300 dark:border-success-600 bg-success-50 dark:bg-success-900/20';
      case 'wishlist':
        return 'border-secondary-300 dark:border-secondary-600 bg-secondary-50 dark:bg-secondary-900/20';
      case 'actual':
        return 'border-primary-300 dark:border-primary-600 bg-primary-50 dark:bg-primary-900/20';
      default:
        return 'border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900/20';
    }
  };

  const getTypeIcon = () => {
    switch (type) {
      case 'tbr':
        return <Calendar className="h-4 w-4 text-warning-600 dark:text-warning-400" />;
      case 'historial':
        return <CheckCircle className="h-4 w-4 text-success-600 dark:text-success-400" />;
      case 'wishlist':
        return <Star className="h-4 w-4 text-secondary-600 dark:text-secondary-400" />;
      case 'actual':
        return <BookOpen className="h-4 w-4 text-primary-600 dark:text-primary-400" />;
      default:
        return <BookOpen className="h-4 w-4 text-slate-600 dark:text-slate-400" />;
    }
  };

  return (
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
        <span className="capitalize hidden sm:inline">{type}</span>
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
          {type === 'tbr' && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleStartBook}
              className="flex-1 sm:flex-none px-2 sm:px-3 py-1.5 bg-primary-500 hover:bg-primary-600 text-white rounded-lg text-xs sm:text-sm font-medium transition-colors duration-200 flex items-center justify-center space-x-1"
            >
              <Play className="h-3 w-3" />
              <span>Empezar</span>
            </motion.button>
          )}

          {type === 'actual' && (
            <>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleFinishBook}
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
                <RotateCcw className="h-3 w-3" />
                <span>Abandonar</span>
              </motion.button>
            </>
          )}

          {type === 'historial' && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleMoveBackFromHistory}
              className="flex-1 sm:flex-none px-2 sm:px-3 py-1.5 bg-slate-500 hover:bg-slate-600 text-white rounded-lg text-xs sm:text-sm font-medium transition-colors duration-200 flex items-center justify-center space-x-1"
            >
              <RotateCcw className="h-3 w-3" />
              <span>Mover a TBR</span>
            </motion.button>
          )}

          {type === 'wishlist' && state.compraDesbloqueada && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handlePurchaseWishlistBook}
              className="flex-1 sm:flex-none px-2 sm:px-3 py-1.5 bg-secondary-500 hover:bg-secondary-600 text-white rounded-lg text-xs sm:text-sm font-medium transition-colors duration-200 flex items-center justify-center space-x-1"
            >
              <ShoppingCart className="h-3 w-3" />
              <span>Comprar</span>
            </motion.button>
          )}

          {/* Edit button for TBR and Wishlist */}
          {(type === 'tbr' || type === 'wishlist') && onEdit && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onEdit(book)}
              className="flex-1 sm:flex-none px-2 sm:px-3 py-1.5 bg-slate-500 hover:bg-slate-600 text-white rounded-lg text-xs sm:text-sm font-medium transition-colors duration-200 flex items-center justify-center space-x-1"
            >
              <Edit3 className="h-3 w-3" />
              <span>Editar</span>
            </motion.button>
          )}

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleDelete}
            className="flex-1 sm:flex-none px-2 sm:px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white rounded-lg text-xs sm:text-sm font-medium transition-colors duration-200 flex items-center justify-center space-x-1"
          >
            <Trash2 className="h-3 w-3" />
            <span>Eliminar</span>
          </motion.button>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default BookCard; 