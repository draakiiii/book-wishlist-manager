import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Save, BookOpen, Heart } from 'lucide-react';
import { useAppState } from '../context/AppStateContext';
import { Libro, BookListType } from '../types';
import BookTitleAutocomplete from './BookTitleAutocomplete';
import SagaAutocomplete from './SagaAutocomplete';

interface BookEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  book: Libro;
  listType: BookListType;
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
  const [formato, setFormato] = useState(book.formato || 'fisico');
  const [ubicacion, setUbicacion] = useState(book.ubicacion || '');
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
      setFormato(book.formato || 'fisico');
      setUbicacion(book.ubicacion || '');
      
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
      notas: notas || undefined,
      formato: formato as 'fisico' | 'digital' | 'audiolibro',
      ubicacion: ubicacion || undefined
    };

    dispatch({
      type: 'UPDATE_BOOK',
      payload: {
        id: book.id,
        updates: updatedBook
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
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="relative w-full max-w-2xl max-h-[90vh] bg-white dark:bg-slate-800 rounded-xl shadow-xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-primary-100 dark:bg-primary-900/30 rounded-lg">
              <BookOpen className="h-5 w-5 text-primary-600 dark:text-primary-400" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-semibold text-slate-900 dark:text-white">
                Editar Libro
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {book.titulo}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors duration-200"
          >
            <X className="h-5 w-5 text-slate-600 dark:text-slate-400" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 sm:space-y-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300 border-b border-slate-200 dark:border-slate-700 pb-2">
              Información Básica
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Título *
                </label>
                <BookTitleAutocomplete
                  value={titulo}
                  onChange={setTitulo}
                  onBookSelect={handleBookSelect}
                  placeholder="Título del libro"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Autor
                </label>
                <input
                  type="text"
                  value={autor}
                  onChange={(e) => setAutor(e.target.value)}
                  placeholder="Nombre del autor"
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Páginas
                </label>
                <input
                  type="number"
                  value={paginas}
                  onChange={(e) => setPaginas(e.target.value)}
                  placeholder="Número de páginas"
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Formato
                </label>
                <select
                  value={formato}
                  onChange={(e) => setFormato(e.target.value as 'fisico' | 'digital' | 'audiolibro')}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="fisico">Físico</option>
                  <option value="digital">Digital</option>
                  <option value="audiolibro">Audiolibro</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Precio
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={precio}
                  onChange={(e) => setPrecio(e.target.value)}
                  placeholder="Precio"
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Additional Information */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300 border-b border-slate-200 dark:border-slate-700 pb-2">
              Información Adicional
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Saga
                </label>
                <SagaAutocomplete
                  value={sagaName}
                  onChange={setSagaName}
                  placeholder="Nombre de la saga"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  ISBN
                </label>
                <input
                  type="text"
                  value={isbn}
                  onChange={(e) => setIsbn(e.target.value)}
                  placeholder="ISBN del libro"
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Editorial
                </label>
                <input
                  type="text"
                  value={editorial}
                  onChange={(e) => setEditorial(e.target.value)}
                  placeholder="Editorial"
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Idioma
                </label>
                <input
                  type="text"
                  value={idioma}
                  onChange={(e) => setIdioma(e.target.value)}
                  placeholder="Idioma"
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Género
                </label>
                <input
                  type="text"
                  value={genero}
                  onChange={(e) => setGenero(e.target.value)}
                  placeholder="Género"
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>

            {formato === 'fisico' && (
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Ubicación
                </label>
                <input
                  type="text"
                  value={ubicacion}
                  onChange={(e) => setUbicacion(e.target.value)}
                  placeholder="Dónde está guardado el libro"
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            )}
          </div>

          {/* Rating and Notes */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300 border-b border-slate-200 dark:border-slate-700 pb-2">
              Valoración y Notas
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Calificación (1-5)
                </label>
                <input
                  type="number"
                  min="1"
                  max="5"
                  value={calificacion}
                  onChange={(e) => setCalificacion(e.target.value)}
                  placeholder="Calificación"
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Notas
              </label>
              <textarea
                value={notas}
                onChange={(e) => setNotas(e.target.value)}
                placeholder="Notas sobre el libro..."
                rows={4}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
              />
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 p-4 sm:p-6 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors duration-200"
          >
            Cancelar
          </button>
          <button
            type="submit"
            onClick={handleSubmit}
            className="px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white text-sm font-medium rounded-lg transition-colors duration-200 flex items-center space-x-2"
          >
            <Save className="h-4 w-4" />
            <span>Guardar Cambios</span>
          </button>
        </div>

        {/* Floating Save Button */}
        {showFloatingSave && (
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            onClick={handleSubmit}
            className="fixed bottom-6 right-6 z-50 p-4 bg-primary-500 hover:bg-primary-600 text-white rounded-full shadow-lg transition-colors duration-200"
          >
            <Save className="h-5 w-5" />
          </motion.button>
        )}
      </motion.div>
    </motion.div>
  );
};

export default BookEditModal;