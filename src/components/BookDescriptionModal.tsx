import React from 'react';
import { Libro } from '../types';
import { motion, AnimatePresence } from 'framer-motion';
import { X, BookOpen, User, FileText, Star, Calendar, Building, Globe, Tag } from 'lucide-react';

interface BookDescriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  book: Libro | null;
}

const BookDescriptionModal: React.FC<BookDescriptionModalProps> = ({ isOpen, onClose, book }) => {
  if (!book) return null;

  return (
    <AnimatePresence>
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
            className="bg-white dark:bg-slate-800 rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden"
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
            <div className="p-4 sm:p-6 space-y-4 sm:space-y-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              {/* Title */}
              <div>
                <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white leading-tight">
                  {book.titulo}
                </h3>
              </div>

              {/* Basic Info Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
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

                {book.publicacion && (
                  <div className="flex items-center space-x-3 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                    <Calendar className="h-4 w-4 text-slate-500 dark:text-slate-400 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Año</p>
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
              </div>

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
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default BookDescriptionModal;