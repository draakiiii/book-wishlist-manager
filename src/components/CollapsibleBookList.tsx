import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ChevronDown, Eye, EyeOff } from 'lucide-react';
import BookList from './BookList';
import { Libro, BookListType } from '../types';

interface CollapsibleBookListProps {
  books: Libro[];
  type: BookListType;
  emptyMessage: string;
  sectionName: string; // Para crear una clave única de localStorage
  showCount?: boolean; // Mostrar contador de libros
}

const CollapsibleBookList: React.FC<CollapsibleBookListProps> = ({
  books,
  type,
  emptyMessage,
  sectionName,
  showCount = true
}) => {
  // Crear una clave única para localStorage
  const storageKey = `booklist_${sectionName.replace(/\s+/g, '_').toLowerCase()}_expanded`;
  
  // Obtener el estado inicial desde localStorage (por defecto expandido)
  const [isExpanded, setIsExpanded] = useState(() => {
    const saved = localStorage.getItem(storageKey);
    return saved !== null ? JSON.parse(saved) : true;
  });

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  // Guardar el estado en localStorage cuando cambie
  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(isExpanded));
  }, [isExpanded, storageKey]);

  const bookCount = books.length;

  return (
    <div className="mt-4 sm:mt-6">
      {/* Header colapsible solo si hay libros */}
      {bookCount > 0 && (
        <button
          onClick={toggleExpanded}
          className="w-full flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700/50 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors duration-200 mb-3"
        >
          <div className="flex items-center space-x-2">
            {isExpanded ? (
              <EyeOff className="h-4 w-4 text-slate-500 dark:text-slate-400" />
            ) : (
              <Eye className="h-4 w-4 text-slate-500 dark:text-slate-400" />
            )}
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
              {isExpanded ? 'Ocultar' : 'Mostrar'} lista de libros
            </span>
            {showCount && (
              <span className="px-2 py-1 bg-slate-200 dark:bg-slate-600 text-xs font-medium text-slate-600 dark:text-slate-300 rounded-full">
                {bookCount}
              </span>
            )}
          </div>
          <motion.div
            animate={{ rotate: isExpanded ? 0 : 180 }}
            transition={{ duration: 0.2 }}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
          >
            <ChevronDown className="h-4 w-4" />
          </motion.div>
        </button>
      )}

      {/* Lista de libros colapsible */}
      {isExpanded ? (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          transition={{ 
            duration: 0.3, 
            ease: [0.4, 0.0, 0.2, 1],
            opacity: { duration: 0.2 }
          }}
          className="overflow-hidden"
        >
          <BookList 
            books={books}
            type={type}
            emptyMessage={emptyMessage}
          />
        </motion.div>
      ) : (
        bookCount > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2 }}
            className="p-4 text-center bg-slate-50 dark:bg-slate-800/50 rounded-lg border-2 border-dashed border-slate-200 dark:border-slate-600"
          >
            <p className="text-sm text-slate-500 dark:text-slate-400 italic">
              Lista de {bookCount} libro{bookCount !== 1 ? 's' : ''} oculta. Haz clic arriba para mostrar.
            </p>
          </motion.div>
        )
      )}
    </div>
  );
};

export default CollapsibleBookList;