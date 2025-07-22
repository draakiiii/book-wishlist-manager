import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Save, BookOpen, Heart } from 'lucide-react';
import { useAppState } from '../context/AppStateContext';
import { Libro } from '../types';
import BookTitleAutocomplete from './BookTitleAutocomplete';
import SagaAutocomplete from './SagaAutocomplete';

interface BookEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  book: Libro;
  listType: 'tbr' | 'wishlist';
}

const BookEditModal: React.FC<BookEditModalProps> = ({ isOpen, onClose, book, listType }) => {
  const { dispatch } = useAppState();
  const [titulo, setTitulo] = useState(book.titulo);
  const [autor, setAutor] = useState(book.autor || '');
  const [paginas, setPaginas] = useState(book.paginas?.toString() || '');
  const [sagaName, setSagaName] = useState(book.sagaName || '');
  const [isbn, setIsbn] = useState(book.isbn || '');
  const [editorial, setEditorial] = useState(book.editorial || '');
  const [idioma, setIdioma] = useState(book.idioma || '');
  const [genero, setGenero] = useState(book.genero || '');
  const [precio, setPrecio] = useState(book.precio?.toString() || '');
  const [calificacion, setCalificacion] = useState(book.calificacion?.toString() || '');
  const [notas, setNotas] = useState(book.notas || '');
  const [showFloatingSave, setShowFloatingSave] = useState(false);

  useEffect(() => {
    if (isOpen && book) {
      setTitulo(book.titulo);
      setAutor(book.autor || '');
      setPaginas(book.paginas?.toString() || '');
      setSagaName(book.sagaName || '');
      setIsbn(book.isbn || '');
      setEditorial(book.editorial || '');
      setIdioma(book.idioma || '');
      setGenero(book.genero || '');
      setPrecio(book.precio?.toString() || '');
      setCalificacion(book.calificacion?.toString() || '');
      setNotas(book.notas || '');
      
      // Check if form is long enough to need floating save button
      setTimeout(() => {
        const form = document.querySelector('form');
        if (form) {
          const scrollHeight = form.scrollHeight;
          const clientHeight = form.clientHeight;
          if (scrollHeight > clientHeight * 1.5) {
            setShowFloatingSave(true);
          }
        }
      }, 100);
    }
  }, [isOpen, book]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const updatedBook: Partial<Libro> = {
      titulo: titulo.trim(),
      autor: autor.trim() || undefined,
      paginas: paginas ? parseInt(paginas) : undefined,
      sagaName: sagaName || undefined,
      isbn: isbn || undefined,
      editorial: editorial || undefined,
      idioma: idioma || undefined,
      genero: genero || undefined,
      precio: precio ? parseFloat(precio) : undefined,
      calificacion: calificacion ? parseInt(calificacion) : undefined,
      notas: notas || undefined
    };

    dispatch({
      type: 'UPDATE_BOOK',
      payload: {
        id: book.id,
        updates: updatedBook,
        listType
      }
    });

    onClose();
  };

  const handleBookSelect = (bookData: any) => {
    setTitulo(bookData.titulo);
    setAutor(bookData.autor || '');
    setPaginas(bookData.paginas?.toString() || '');
    setIsbn(bookData.isbn || '');
    setEditorial(bookData.editorial || '');
    setIdioma(bookData.idioma || '');
    setGenero(bookData.genero || '');
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
        className="relative bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center space-x-2">
            {listType === 'tbr' ? (
              <BookOpen className="h-5 w-5 text-warning-500" />
            ) : (
              <Heart className="h-5 w-5 text-red-500" />
            )}
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
              Editar Libro
            </h3>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
              listType === 'tbr' 
                ? 'bg-warning-100 text-warning-700 dark:bg-warning-900/30 dark:text-warning-400'
                : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
            }`}>
              {listType === 'tbr' ? 'TBR' : 'Wishlist'}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors duration-200"
          >
            <X className="h-5 w-5 text-slate-500" />
          </button>
        </div>

        {/* Form */}
        <form 
          onSubmit={handleSubmit} 
          className="p-4 space-y-4 max-h-[calc(90vh-80px)] overflow-y-auto"
          onScroll={(e) => {
            const target = e.target as HTMLFormElement;
            const scrollTop = target.scrollTop;
            const scrollHeight = target.scrollHeight;
            const clientHeight = target.clientHeight;
            
            // Show floating save button when scrolled down more than 50% of the form
            if (scrollTop > (scrollHeight - clientHeight) * 0.5) {
              setShowFloatingSave(true);
            } else {
              setShowFloatingSave(false);
            }
          }}
        >
          {/* Basic Information */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 border-b border-slate-200 dark:border-slate-700 pb-2">
              Información Básica
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Título */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Título *
                </label>
                <BookTitleAutocomplete
                  value={titulo}
                  onChange={setTitulo}
                  onBookSelect={handleBookSelect}
                  placeholder="Título del libro"
                />
              </div>

              {/* Autor */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Autor
                </label>
                <input
                  type="text"
                  value={autor}
                  onChange={(e) => setAutor(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Autor"
                />
              </div>

              {/* Páginas */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Páginas
                </label>
                <input
                  type="number"
                  value={paginas}
                  onChange={(e) => setPaginas(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Número de páginas"
                  min="1"
                />
              </div>

              {/* Saga */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Saga
                </label>
                <SagaAutocomplete
                  value={sagaName}
                  onChange={setSagaName}
                  placeholder="Nombre de la saga"
                />
              </div>
            </div>
          </div>

          {/* Additional Information */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 border-b border-slate-200 dark:border-slate-700 pb-2">
              Información Adicional
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* ISBN */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  ISBN
                </label>
                <input
                  type="text"
                  value={isbn}
                  onChange={(e) => setIsbn(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="ISBN"
                />
              </div>

              {/* Editorial */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Editorial
                </label>
                <input
                  type="text"
                  value={editorial}
                  onChange={(e) => setEditorial(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Editorial"
                />
              </div>

              {/* Idioma */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Idioma
                </label>
                <input
                  type="text"
                  value={idioma}
                  onChange={(e) => setIdioma(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Idioma"
                />
              </div>

              {/* Género */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Género
                </label>
                <input
                  type="text"
                  value={genero}
                  onChange={(e) => setGenero(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Género"
                />
              </div>

              {/* Precio */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Precio
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={precio}
                  onChange={(e) => setPrecio(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Precio"
                  min="0"
                />
              </div>

              {/* Calificación */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Calificación
                </label>
                <select
                  value={calificacion}
                  onChange={(e) => setCalificacion(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="">Sin calificar</option>
                  <option value="1">⭐ 1</option>
                  <option value="2">⭐⭐ 2</option>
                  <option value="3">⭐⭐⭐ 3</option>
                  <option value="4">⭐⭐⭐⭐ 4</option>
                  <option value="5">⭐⭐⭐⭐⭐ 5</option>
                </select>
              </div>
            </div>

            {/* Notas */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Notas
              </label>
              <textarea
                value={notas}
                onChange={(e) => setNotas(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                placeholder="Notas adicionales sobre el libro..."
              />
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-700/50">
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-lg transition-colors duration-200"
            >
              Cancelar
            </button>
            <button
              type="submit"
              onClick={handleSubmit}
              className="px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg font-medium transition-colors duration-200 flex items-center space-x-2"
            >
              <Save className="h-4 w-4" />
              <span>Guardar Cambios</span>
            </button>
          </div>
        </div>

        {/* Floating Save Button for Mobile */}
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ 
            opacity: showFloatingSave ? 1 : 0, 
            scale: showFloatingSave ? 1 : 0.8 
          }}
          onClick={handleSubmit}
          className="fixed bottom-6 right-6 md:hidden z-50 p-4 bg-primary-500 hover:bg-primary-600 text-white rounded-full shadow-lg transition-colors duration-200"
        >
          <Save className="h-6 w-6" />
        </motion.button>
      </motion.div>
    </motion.div>
  );
};

export default BookEditModal;