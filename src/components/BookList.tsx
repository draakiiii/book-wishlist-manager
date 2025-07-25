import React, { useState } from 'react';
import { Libro, BookListType } from '../types';
import BookCard from './BookCard';
import BookEditModal from './BookEditModal';
import { motion } from 'framer-motion';
import { BookOpen, Inbox } from 'lucide-react';
import { useAppState } from '../context/AppStateContext';

interface BookListProps {
  books: Libro[];
  type: BookListType;
  emptyMessage: string;
}

const BookList: React.FC<BookListProps> = ({ books, type, emptyMessage }) => {
  const { dispatch } = useAppState();
  const [editingBook, setEditingBook] = useState<Libro | null>(null);

  const handleDelete = (id: number) => {
    const book = books.find(libro => libro.id === id);
    const confirmDelete = window.confirm(
      `¿Estás seguro de que quieres eliminar "${book?.titulo || 'este libro'}" de tu biblioteca?\n\nEsta acción no se puede deshacer.`
    );
    
    if (confirmDelete) {
      dispatch({ type: 'DELETE_BOOK', payload: id });
    }
  };

  const handleEdit = (book: Libro) => {
    setEditingBook(book);
  };

  const getEmptyMessage = () => {
    switch (type) {
      case 'todos':
        return 'No se encontraron libros que coincidan con los filtros aplicados';
      case 'tbr':
        return 'Agrega libros a tu pila para empezar a leer';
      case 'wishlist':
        return 'Agrega libros a tu lista de deseos';
      case 'leyendo':
        return 'Los libros que estés leyendo aparecerán aquí';
      case 'leido':
        return 'Los libros que termines aparecerán aquí';
      case 'abandonado':
        return 'Los libros que abandones aparecerán aquí';
      case 'comprado':
        return 'Los libros que compres aparecerán aquí';
      case 'prestado':
        return 'Los libros que prestes aparecerán aquí';
      default:
        return 'Agrega libros a tu biblioteca';
    }
  };

  if (books.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-8 sm:py-12"
      >
        <div className="flex flex-col items-center space-y-3 sm:space-y-4">
          <div className="p-3 sm:p-4 bg-slate-100 dark:bg-slate-800 rounded-full">
            <Inbox className="h-6 w-6 sm:h-8 sm:w-8 text-slate-400" />
          </div>
          <div>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 font-medium">
              {emptyMessage}
            </p>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-500 mt-1">
              {getEmptyMessage()}
            </p>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="space-y-3 sm:space-y-4">
      {/* List Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <BookOpen className="h-4 w-4 sm:h-5 sm:w-5 text-slate-600 dark:text-slate-400" />
          <span className="text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300">
            {books.length} {books.length === 1 ? 'libro' : 'libros'}
          </span>
        </div>
      </div>

      {/* Books Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        {books.map((book, index) => (
          <motion.div
            key={book.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <BookCard
              book={book}
              type={type}
              onDelete={handleDelete}
              onEdit={handleEdit}
            />
          </motion.div>
        ))}
      </div>

      {/* Edit Modal */}
      {editingBook && (
        <BookEditModal
          isOpen={!!editingBook}
          onClose={() => setEditingBook(null)}
          book={editingBook}
          listType={type}
        />
      )}
    </div>
  );
};

export default BookList; 