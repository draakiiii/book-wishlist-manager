import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, ExternalLink, Star, RefreshCw, X } from 'lucide-react';
import { sampleBooks } from '../utils/sampleBookData';
import BookCoverImage from './BookCoverImage';
import BookDescriptionModal from './BookDescriptionModal';
import RatingModal from './RatingModal';
import { clearCache } from '../services/googleBooksAPI';

interface FeatureDemoProps {
  isOpen: boolean;
  onClose: () => void;
}

const FeatureDemo: React.FC<FeatureDemoProps> = ({ isOpen, onClose }) => {
  const [selectedBook, setSelectedBook] = useState<typeof sampleBooks[0] | null>(null);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [ratingBook, setRatingBook] = useState<typeof sampleBooks[0] | null>(null);

  const handleRatingConfirm = (calificacion: number, review: string) => {
    console.log('Rating confirmed:', { calificacion, review });
    setShowRatingModal(false);
    setRatingBook(null);
  };

  const handleReadSample = (book: typeof sampleBooks[0]) => {
    if (book.accessInfo?.webReaderLink) {
      window.open(book.accessInfo.webReaderLink, '_blank');
    }
  };

  const handleClearCache = () => {
    clearCache();
    alert('Caché de la API limpiado. Ahora puedes probar agregando un nuevo libro.');
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="relative bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-t-2xl">
          <div className="flex items-center space-x-3">
            <BookOpen className="h-6 w-6 text-blue-500" />
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              Demostración de Nuevas Funcionalidades
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors duration-200"
          >
            <X className="h-5 w-5 text-slate-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-8">
          <div className="text-center">
            <p className="text-lg text-slate-600 dark:text-slate-400 mb-4">
              Implementación de carga optimizada de imágenes y botón "Leer Muestra"
            </p>
            
            {/* Botón para limpiar caché */}
            <div className="mb-6">
              <button
                onClick={handleClearCache}
                className="flex items-center space-x-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-colors duration-200 mx-auto"
              >
                <RefreshCw className="h-4 w-4" />
                <span>Limpiar Caché de API</span>
              </button>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
                Usa este botón si las imágenes no se muestran correctamente
              </p>
            </div>
          </div>

          {/* Tarea 1: Carga Optimizada de Imágenes */}
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-white flex items-center space-x-2">
              <BookOpen className="h-6 w-6 text-blue-500" />
              <span>Tarea 1: Carga Optimizada de Imágenes</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {sampleBooks.map((book) => (
                <motion.div
                  key={book.id}
                  whileHover={{ y: -4 }}
                  className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-4 space-y-3 border border-slate-200 dark:border-slate-700"
                >
                  <div className="h-48">
                    <BookCoverImage
                      book={book}
                      isDetailView={false}
                      className="w-full h-full object-cover rounded-lg"
                    />
                  </div>

                  <div className="space-y-2">
                    <h3 className="font-semibold text-slate-900 dark:text-white text-sm">
                      {book.titulo}
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-slate-400">
                      {book.autor}
                    </p>

                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-500 dark:text-slate-400">
                        {book.paginas} páginas
                      </span>

                      <button
                        onClick={() => setSelectedBook(book)}
                        className="text-xs bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded transition-colors"
                      >
                        Ver Detalle
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </section>

          {/* Tarea 2: Botón "Leer Muestra" */}
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-white flex items-center space-x-2">
              <ExternalLink className="h-6 w-6 text-green-500" />
              <span>Tarea 2: Botón "Leer Muestra"</span>
            </h2>

            <div className="bg-slate-50 dark:bg-slate-700 rounded-xl p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {sampleBooks.filter(book =>
                  book.accessInfo?.viewability === 'PARTIAL' || book.accessInfo?.viewability === 'ALL_PAGES'
                ).map((book) => (
                  <div key={book.id} className="flex items-center space-x-4 p-4 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-600">
                    <div className="w-16 h-20 flex-shrink-0">
                      <BookCoverImage
                        book={book}
                        isDetailView={false}
                        className="w-full h-full object-cover rounded"
                      />
                    </div>

                    <div className="flex-1">
                      <h4 className="font-medium text-slate-900 dark:text-white text-sm">
                        {book.titulo}
                      </h4>
                      <p className="text-xs text-slate-600 dark:text-slate-400 mb-2">
                        Vista previa: {book.accessInfo?.viewability}
                      </p>

                      <button
                        onClick={() => handleReadSample(book)}
                        className="flex items-center space-x-1 text-xs bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded transition-colors"
                      >
                        <ExternalLink className="h-3 w-3" />
                        <span>Leer Muestra</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Tarea 3: Rating Opcional */}
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-white flex items-center space-x-2">
              <Star className="h-6 w-6 text-yellow-500" />
              <span>Tarea 3: Rating Opcional</span>
            </h2>

            <div className="bg-slate-50 dark:bg-slate-700 rounded-xl p-6">
              <div className="text-center space-y-4">
                <p className="text-slate-600 dark:text-slate-400">
                  Ahora puedes continuar sin poner puntuación en la pantalla de reseña y puntuación.
                </p>

                <button
                  onClick={() => {
                    setRatingBook(sampleBooks[0]);
                    setShowRatingModal(true);
                  }}
                  className="bg-yellow-500 hover:bg-yellow-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                >
                  Probar Rating Modal
                </button>
              </div>
            </div>
          </section>
        </div>

        {/* Modales */}
        {selectedBook && (
          <BookDescriptionModal
            book={selectedBook}
            isOpen={!!selectedBook}
            onClose={() => setSelectedBook(null)}
          />
        )}

        {ratingBook && (
          <RatingModal
            isOpen={showRatingModal}
            onClose={() => {
              setShowRatingModal(false);
              setRatingBook(null);
            }}
            onConfirm={handleRatingConfirm}
            bookTitle={ratingBook.titulo}
            currentRating={0}
            currentReview=""
          />
        )}
      </motion.div>
    </motion.div>
  );
};

export default FeatureDemo;