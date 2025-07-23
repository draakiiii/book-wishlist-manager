import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Star, X } from 'lucide-react';

interface RatingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (rating: number, review: string) => void;
  bookTitle: string;
  currentRating?: number;
  currentReview?: string;
}

const RatingModal: React.FC<RatingModalProps> = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  bookTitle, 
  currentRating = 0,
  currentReview = ''
}) => {
  const [rating, setRating] = useState(currentRating);
  const [hoverRating, setHoverRating] = useState(0);
  const [review, setReview] = useState(currentReview);

  const handleStarClick = (starRating: number) => {
    setRating(starRating);
  };

  const handleConfirm = () => {
    onConfirm(rating, review);
    onClose();
  };

  const handleCancel = () => {
    setRating(currentRating);
    setReview(currentReview);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="relative bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center space-x-2">
            <Star className="h-5 w-5 text-yellow-500" />
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
              Calificar Libro
            </h3>
          </div>
          <button
            onClick={handleCancel}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors duration-200"
          >
            <X className="h-5 w-5 text-slate-500" />
          </button>
        </div>
        
        {/* Content */}
        <div className="p-6">
          <div className="text-center mb-6">
            <h4 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
              {bookTitle}
            </h4>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              ¿Cómo calificarías este libro?
            </p>
          </div>

          {/* Stars */}
          <div className="flex justify-center items-center space-x-2 mb-6">
            {[1, 2, 3, 4, 5].map((star) => (
              <motion.button
                key={star}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => handleStarClick(star)}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                className="p-1 transition-colors duration-200"
              >
                <Star
                  className={`h-8 w-8 ${
                    star <= (hoverRating || rating)
                      ? 'text-yellow-500 fill-current'
                      : 'text-slate-300 dark:text-slate-600'
                  }`}
                />
              </motion.button>
            ))}
          </div>

          {/* Rating Text */}
          <div className="text-center mb-6">
            <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
              {rating === 0 && 'Sin calificar'}
              {rating === 1 && 'Muy malo'}
              {rating === 2 && 'Malo'}
              {rating === 3 && 'Regular'}
              {rating === 4 && 'Bueno'}
              {rating === 5 && 'Excelente'}
            </p>
            {rating > 0 && (
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {rating} de 5 estrellas
              </p>
            )}
          </div>

          {/* Review */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Tu reseña / opinión
            </label>
            <textarea
              value={review}
              onChange={(e) => setReview(e.target.value)}
              placeholder="Comparte tu opinión sobre este libro..."
              rows={4}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:ring-2 focus:ring-yellow-500 focus:border-transparent resize-none"
            />
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Opcional - Puedes dejarlo vacío si no quieres añadir una reseña
            </p>
          </div>

          {/* Actions */}
          <div className="flex space-x-3">
            <button
              onClick={handleCancel}
              className="flex-1 px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors duration-200"
            >
              Cancelar
            </button>
            <button
              onClick={handleConfirm}
              disabled={rating === 0}
              className="flex-1 px-4 py-2 bg-yellow-500 hover:bg-yellow-600 disabled:bg-slate-300 dark:disabled:bg-slate-600 text-white text-sm font-medium rounded-lg transition-colors duration-200 disabled:cursor-not-allowed"
            >
              Confirmar
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default RatingModal;