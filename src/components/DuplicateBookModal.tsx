import React from 'react';
import { motion } from 'framer-motion';
import { X, AlertTriangle, CheckCircle, BookOpen } from 'lucide-react';
import { Libro } from '../types';

interface DuplicateBookModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  onCancel: () => void;
  existingBook: Libro;
  newBookData: {
    titulo: string;
    autor?: string;
    isbn?: string;
  };
}

const DuplicateBookModal: React.FC<DuplicateBookModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  onCancel,
  existingBook,
  newBookData
}) => {
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
        className="relative bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-md w-full mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
              <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
              Libro Ya Existe
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors duration-200"
          >
            <X className="h-5 w-5 text-slate-500" />
          </button>
        </div>
        
        {/* Content */}
        <div className="p-6">
          <div className="space-y-4">
            <p className="text-slate-700 dark:text-slate-300">
              Ya tienes este libro en tu biblioteca. ¿Quieres agregarlo de todas formas?
            </p>
            
            {/* Existing Book Info */}
            <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <BookOpen className="h-4 w-4 text-slate-500" />
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Libro Existente
                </span>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-slate-900 dark:text-white">
                  {existingBook.titulo}
                </p>
                {existingBook.autor && (
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    {existingBook.autor}
                  </p>
                )}
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Estado: {existingBook.estado}
                </p>
              </div>
            </div>
            
            {/* New Book Info */}
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <CheckCircle className="h-4 w-4 text-blue-500" />
                <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                  Libro a Agregar
                </span>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-slate-900 dark:text-white">
                  {newBookData.titulo}
                </p>
                {newBookData.autor && (
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    {newBookData.autor}
                  </p>
                )}
                {newBookData.isbn && (
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    ISBN: {newBookData.isbn}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
        
        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 p-4 border-t border-slate-200 dark:border-slate-700">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors duration-200"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors duration-200"
          >
            Agregar de Todas Formas
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default DuplicateBookModal;