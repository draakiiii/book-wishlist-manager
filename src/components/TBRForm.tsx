import React, { useState } from 'react';
import { useAppState } from '../context/AppStateContext';
import { motion } from 'framer-motion';
import { Clock, Plus, Camera, BookOpen, Loader2 } from 'lucide-react';
import ScannerModal from './ScannerModal';
import SagaAutocomplete from './SagaAutocomplete';
import { fetchBookData } from '../services/googleBooksAPI';

const TBRForm: React.FC = () => {
  const { dispatch } = useAppState();
  const [titulo, setTitulo] = useState('');
  const [autor, setAutor] = useState('');
  const [paginas, setPaginas] = useState('');
  const [sagaName, setSagaName] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [isLoadingBook, setIsLoadingBook] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (titulo.trim()) {
      const nuevoLibro = {
        id: Date.now(),
        titulo: titulo.trim(),
        autor: autor.trim() || undefined,
        paginas: paginas ? parseInt(paginas) : undefined,
        sagaName: sagaName || undefined
      };

      dispatch({ type: 'ADD_TO_TBR', payload: nuevoLibro });
      
      // Reset form
      setTitulo('');
      setAutor('');
      setPaginas('');
      setSagaName('');
      setIsExpanded(false);
    }
  };

  const handleScanResult = async (result: string) => {
    setShowScanner(false);
    setIsLoadingBook(true);
    
    try {
      // Clean the scanned result (remove any non-numeric characters except for 'X' which is valid in ISBN)
      const cleanIsbn = result.replace(/[^0-9X]/gi, '');
      
      if (cleanIsbn.length < 10 || cleanIsbn.length > 13) {
        alert('Código de barras no válido. Debe ser un ISBN de 10 o 13 dígitos.');
        setIsLoadingBook(false);
        return;
      }
      
      // Fetch book data from Google Books API
      const bookData = await fetchBookData(cleanIsbn);
      
      if (bookData) {
        setTitulo(bookData.titulo);
        setAutor(bookData.autor || '');
        setPaginas(bookData.paginas?.toString() || '');
        setIsExpanded(true); // Expand the form to show the populated data
      } else {
        alert('No se encontró información del libro. Puedes agregarlo manualmente.');
        setIsExpanded(true);
      }
    } catch (error) {
      console.error('Error fetching book data:', error);
      alert('Error al buscar información del libro. Puedes agregarlo manualmente.');
      setIsExpanded(true);
    } finally {
      setIsLoadingBook(false);
    }
  };

  return (
    <div className="space-y-3 sm:space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2 sm:space-x-3">
          <div className="p-1.5 sm:p-2 bg-warning-100 dark:bg-warning-900/30 rounded-lg">
            <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-warning-600 dark:text-warning-400" />
          </div>
          <h3 className="text-base sm:text-lg font-semibold text-slate-900 dark:text-white">
            Agregar a Pila de Lectura
          </h3>
        </div>
      </div>

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
              <div className="p-1.5 sm:p-2 bg-warning-500 rounded-lg">
                <Plus className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
              </div>
              <span className="text-sm sm:text-base text-slate-700 dark:text-slate-300 font-medium">
                Agregar nuevo libro a la pila
              </span>
            </div>
          </motion.button>
        ) : (
          <form onSubmit={handleSubmit} className="p-3 sm:p-4 space-y-3 sm:space-y-4">
            {/* Scanner Button */}
            <div className="flex justify-center">
              <motion.button
                type="button"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowScanner(true)}
                disabled={isLoadingBook}
                className="w-full sm:w-auto px-4 py-2 bg-primary-500 hover:bg-primary-600 disabled:bg-primary-400 text-white rounded-lg font-medium transition-colors duration-200 flex items-center justify-center space-x-2 text-sm"
              >
                {isLoadingBook ? (
                  <>
                    <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 animate-spin" />
                    <span>Buscando libro...</span>
                  </>
                ) : (
                  <>
                    <Camera className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span>Escanear Código de Barras</span>
                  </>
                )}
              </motion.button>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:gap-4">
              {/* Título */}
              <div className="space-y-1.5 sm:space-y-2">
                <label className="block text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300">
                  Título del Libro *
                </label>
                <input
                  type="text"
                  value={titulo}
                  onChange={(e) => setTitulo(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-warning-500 focus:border-transparent transition-colors duration-200 text-sm"
                  placeholder="Ej: El Hobbit"
                  required
                />
              </div>
              
              {/* Autor */}
              <div className="space-y-1.5 sm:space-y-2">
                <label className="block text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300">
                  Autor
                </label>
                <input
                  type="text"
                  value={autor}
                  onChange={(e) => setAutor(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-warning-500 focus:border-transparent transition-colors duration-200 text-sm"
                  placeholder="Ej: J.R.R. Tolkien"
                />
              </div>

              {/* Páginas */}
              <div className="space-y-1.5 sm:space-y-2">
                <label className="block text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300">
                  Número de Páginas
                </label>
                <input
                  type="number"
                  value={paginas}
                  onChange={(e) => setPaginas(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-warning-500 focus:border-transparent transition-colors duration-200 text-sm"
                  placeholder="Ej: 310"
                  min="1"
                />
              </div>

              {/* Saga Name con Autocomplete */}
              <div className="space-y-1.5 sm:space-y-2">
                <label className="block text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300">
                  Nombre de la Saga
                </label>
                <SagaAutocomplete
                  value={sagaName}
                  onChange={setSagaName}
                  placeholder="Ej: El Señor de los Anillos"
                />
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
              <motion.button
                type="submit"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="w-full sm:w-auto px-4 py-2 bg-warning-500 hover:bg-warning-600 text-white rounded-lg font-medium transition-colors duration-200 flex items-center justify-center space-x-2 text-sm"
              >
                <BookOpen className="h-3 w-3 sm:h-4 sm:w-4" />
                <span>Agregar a Pila</span>
              </motion.button>
              
              <motion.button
                type="button"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  setIsExpanded(false);
                  setTitulo('');
                  setAutor('');
                  setPaginas('');
                  setSagaName('');
                }}
                className="w-full sm:w-auto px-4 py-2 bg-slate-500 hover:bg-slate-600 text-white rounded-lg font-medium transition-colors duration-200 text-sm"
              >
                Cancelar
              </motion.button>
            </div>
          </form>
        )}
      </motion.div>

      {/* Scanner Modal */}
      {showScanner && (
        <ScannerModal
          onClose={() => setShowScanner(false)}
          onScan={handleScanResult}
        />
      )}
    </div>
  );
};

export default TBRForm; 