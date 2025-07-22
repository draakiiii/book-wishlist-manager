import React, { useState } from 'react';
import { useAppState } from '../context/AppStateContext';
import { motion } from 'framer-motion';
import { Heart, Plus, ShoppingCart, Lock } from 'lucide-react';
import BookTitleAutocomplete from './BookTitleAutocomplete';
import { BookData } from '../types';

const WishlistForm: React.FC = () => {
  const { state, dispatch } = useAppState();
  const [titulo, setTitulo] = useState('');
  const [autor, setAutor] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (titulo.trim()) {
      dispatch({ 
        type: 'ADD_TO_WISHLIST', 
        payload: { titulo: titulo.trim(), autor: autor.trim() || undefined } 
      });
      setTitulo('');
      setAutor('');
      setIsExpanded(false);
    }
  };

  const handleBookSelect = (bookData: BookData) => {
    setTitulo(bookData.titulo);
    setAutor(bookData.autor || '');
  };

  // Permitir añadir libros aunque tengas 0 puntos
  const canAddToWishlist = true;

  return (
    <div className="space-y-3 sm:space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2 sm:space-x-3">
          <div className="p-1.5 sm:p-2 bg-secondary-100 dark:bg-secondary-900/30 rounded-lg">
            <Heart className="h-4 w-4 sm:h-5 sm:w-5 text-secondary-600 dark:text-secondary-400" />
          </div>
          <h3 className="text-base sm:text-lg font-semibold text-slate-900 dark:text-white">
            Agregar a Lista de Deseos
          </h3>
        </div>
      </div>

      {/* Status Message */}
      {!state.compraDesbloqueada && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-lg p-3 sm:p-4"
        >
          <div className="flex items-start space-x-2 sm:space-x-3">
            <ShoppingCart className="h-4 w-4 sm:h-5 sm:w-5 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-xs sm:text-sm font-medium text-amber-800 dark:text-amber-200">
                Compra bloqueada
              </p>
              <p className="text-xs sm:text-sm text-amber-700 dark:text-amber-300 mt-1">
                Puedes agregar libros a tu lista de deseos, pero necesitas alcanzar {state.config.objetivo} puntos para poder comprarlos. 
                Actualmente tienes {state.progreso} puntos.
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Form */}
      <motion.div
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: 'auto' }}
        className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden"
      >
        {!isExpanded ? (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setIsExpanded(true)}
            className="w-full p-3 sm:p-4 text-left hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors duration-200"
          >
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className="p-1.5 sm:p-2 bg-secondary-500 rounded-lg">
                <Plus className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
              </div>
              <span className="text-sm sm:text-base text-slate-700 dark:text-slate-300 font-medium">
                Agregar nuevo libro a la lista de deseos
              </span>
            </div>
          </motion.button>
        ) : (
          <form onSubmit={handleSubmit} className="p-3 sm:p-4 space-y-3 sm:space-y-4">
            <div className="grid grid-cols-1 gap-3 sm:gap-4">
              <div className="space-y-1.5 sm:space-y-2">
                <label className="block text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300">
                  Título del Libro
                </label>
                <BookTitleAutocomplete
                  value={titulo}
                  onChange={setTitulo}
                  onBookSelect={handleBookSelect}
                  placeholder="Ej: El Señor de los Anillos"
                />
              </div>
              
              <div className="space-y-1.5 sm:space-y-2">
                <label className="block text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300">
                  Autor
                </label>
                <input
                  type="text"
                  value={autor}
                  onChange={(e) => setAutor(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-secondary-500 focus:border-transparent transition-colors duration-200 text-sm"
                  placeholder="Ej: J.R.R. Tolkien"
                />
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
              <motion.button
                type="submit"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="w-full sm:w-auto px-4 py-2 bg-secondary-500 hover:bg-secondary-600 text-white rounded-lg font-medium transition-colors duration-200 flex items-center justify-center space-x-2 text-sm"
              >
                <Heart className="h-3 w-3 sm:h-4 sm:w-4" />
                <span>Agregar a Lista</span>
              </motion.button>
              
              <motion.button
                type="button"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsExpanded(false)}
                className="w-full sm:w-auto px-4 py-2 bg-slate-500 hover:bg-slate-600 text-white rounded-lg font-medium transition-colors duration-200 text-sm"
              >
                Cancelar
              </motion.button>
            </div>
          </form>
        )}
      </motion.div>

      {/* Success Message */}
      {state.compraDesbloqueada && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-success-50 dark:bg-success-900/20 border border-success-200 dark:border-success-700 rounded-lg p-3 sm:p-4"
        >
          <div className="flex items-start space-x-2 sm:space-x-3">
            <ShoppingCart className="h-4 w-4 sm:h-5 sm:w-5 text-success-600 dark:text-success-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-xs sm:text-sm font-medium text-success-800 dark:text-success-200">
                ¡Compra desbloqueada!
              </p>
              <p className="text-xs sm:text-sm text-success-700 dark:text-success-300 mt-1">
                Puedes comprar libros de tu lista de deseos. Al comprarlo, se gastarán {state.config.objetivo} puntos.
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default WishlistForm; 