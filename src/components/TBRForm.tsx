import React, { useState } from 'react';
import { useAppState } from '../context/AppStateContext';
import { motion } from 'framer-motion';
import { Clock, Plus, Search, BookOpen, Loader2, CheckCircle, AlertCircle, Camera } from 'lucide-react';
import ISBNInputModal from './ISBNInputModal';
import BarcodeScannerModal from './BarcodeScannerModal';
import SagaAutocomplete from './SagaAutocomplete';
import BookTitleAutocomplete from './BookTitleAutocomplete';
import { fetchBookData, validateISBN } from '../services/googleBooksAPI';
import { BookData } from '../types';

const TBRForm: React.FC = () => {
  const { dispatch } = useAppState();
  const [titulo, setTitulo] = useState('');
  const [autor, setAutor] = useState('');
  const [paginas, setPaginas] = useState('');
  const [sagaName, setSagaName] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const [showISBNInput, setShowISBNInput] = useState(false);
  const [showBarcodeScanner, setShowBarcodeScanner] = useState(false);
  const [isLoadingBook, setIsLoadingBook] = useState(false);
  const [scanStatus, setScanStatus] = useState<'idle' | 'scanning' | 'found' | 'error'>('idle');
  const [scanMessage, setScanMessage] = useState('');
  const [isBookFromScan, setIsBookFromScan] = useState(false);

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
      setScanStatus('idle');
      setScanMessage('');
    }
  };

  const handleSearchResult = async (result: string) => {
    setShowISBNInput(false);
    setShowBarcodeScanner(false); // Close barcode scanner modal
    setIsLoadingBook(true);
    setScanStatus('scanning');
    setScanMessage('Validando ISBN...');
    setIsBookFromScan(true); // Mark that this book came from scanning
    
    try {
      // Validate ISBN format
      if (!validateISBN(result)) {
        setScanStatus('error');
        setScanMessage('Código de barras no válido. Debe ser un ISBN de 10 o 13 dígitos.');
        setIsLoadingBook(false);
        setIsBookFromScan(false);
        return;
      }
      
      setScanMessage('Buscando información del libro...');
      
      // Fetch book data from Google Books API
      const bookData = await fetchBookData(result);
      
      if (bookData) {
        console.log('Book data received:', bookData);
        console.log('Setting title to:', bookData.titulo);
        console.log('Setting author to:', bookData.autor);
        console.log('Setting pages to:', bookData.paginas);
        
        setTitulo(bookData.titulo);
        setAutor(bookData.autor || '');
        setPaginas(bookData.paginas?.toString() || '');
        setIsExpanded(true); // Expand the form to show the populated data
        setScanStatus('found');
        setScanMessage(`¡Libro encontrado: ${bookData.titulo}`);
        
        // Show additional book info if available
        if (bookData.editorial || bookData.publicacion) {
          const additionalInfo: string[] = [];
          if (bookData.editorial) additionalInfo.push(bookData.editorial);
          if (bookData.publicacion) additionalInfo.push(bookData.publicacion.toString());
          if (additionalInfo.length > 0) {
            setScanMessage(prev => `${prev} (${additionalInfo.join(', ')})`);
          }
        }
      } else {
        setScanStatus('error');
        setScanMessage('No se encontró información del libro. Puedes agregarlo manualmente.');
        setIsExpanded(true);
        setIsBookFromScan(false);
      }
    } catch (error) {
      console.error('Error fetching book data:', error);
      setScanStatus('error');
      setScanMessage('Error al buscar información del libro. Puedes agregarlo manualmente.');
      setIsExpanded(true);
      setIsBookFromScan(false);
    } finally {
      setIsLoadingBook(false);
    }
  };

  const handleBookSelect = (bookData: BookData) => {
    setTitulo(bookData.titulo);
    setAutor(bookData.autor || '');
    setPaginas(bookData.paginas?.toString() || '');
    setIsExpanded(true);
    setIsBookFromScan(false); // Book came from autocomplete, not scanning
    setScanStatus('found');
    setScanMessage(`¡Libro seleccionado: ${bookData.titulo}`);
    
    // Show additional book info if available
    if (bookData.editorial || bookData.publicacion) {
      const additionalInfo: string[] = [];
      if (bookData.editorial) additionalInfo.push(bookData.editorial);
      if (bookData.publicacion) additionalInfo.push(bookData.publicacion.toString());
      if (additionalInfo.length > 0) {
        setScanMessage(prev => `${prev} (${additionalInfo.join(', ')})`);
      }
    }
  };

  const getStatusIcon = () => {
    switch (scanStatus) {
      case 'scanning':
        return <Loader2 className="h-4 w-4 animate-spin text-blue-500" />;
      case 'found':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Search className="h-4 w-4 text-slate-500" />;
    }
  };

  const getStatusColor = () => {
    switch (scanStatus) {
      case 'scanning':
        return 'text-blue-600 dark:text-blue-400';
      case 'found':
        return 'text-green-600 dark:text-green-400';
      case 'error':
        return 'text-red-600 dark:text-red-400';
      default:
        return 'text-slate-600 dark:text-slate-400';
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
            {/* ISBN Search Buttons */}
            <div className="flex flex-col sm:flex-row justify-center space-y-2 sm:space-y-0 sm:space-x-3">
              <motion.button
                type="button"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowISBNInput(true)}
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
                    <Search className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span>Buscar por ISBN</span>
                  </>
                )}
              </motion.button>
              
              <motion.button
                type="button"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowBarcodeScanner(true)}
                disabled={isLoadingBook}
                className="w-full sm:w-auto px-4 py-2 bg-success-500 hover:bg-success-600 disabled:bg-success-400 text-white rounded-lg font-medium transition-colors duration-200 flex items-center justify-center space-x-2 text-sm"
              >
                <Camera className="h-3 w-3 sm:h-4 sm:w-4" />
                <span>Escanear Código</span>
              </motion.button>
            </div>

            {/* Scan Status */}
            {scanStatus !== 'idle' && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex items-center space-x-2 p-2 rounded-lg text-sm ${
                  scanStatus === 'found' ? 'bg-green-100 dark:bg-green-900/30' :
                  scanStatus === 'error' ? 'bg-red-100 dark:bg-red-900/30' :
                  'bg-blue-100 dark:bg-blue-900/30'
                }`}
              >
                {getStatusIcon()}
                <span className={getStatusColor()}>{scanMessage}</span>
              </motion.div>
            )}

            <div className="grid grid-cols-1 gap-3 sm:gap-4">
              {/* Título con Autocompletado */}
              <div className="space-y-1.5 sm:space-y-2">
                <label className="block text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300">
                  Título del Libro *
                </label>
                <BookTitleAutocomplete
                  value={titulo}
                  onChange={setTitulo}
                  onBookSelect={handleBookSelect}
                  placeholder="Ej: El Hobbit"
                  disableAutocomplete={isBookFromScan}
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
                  setScanStatus('idle');
                  setScanMessage('');
                  setIsBookFromScan(false);
                }}
                className="w-full sm:w-auto px-4 py-2 bg-slate-500 hover:bg-slate-600 text-white rounded-lg font-medium transition-colors duration-200 text-sm"
              >
                Cancelar
              </motion.button>
            </div>
          </form>
        )}
      </motion.div>

      {/* ISBN Input Modal */}
      {showISBNInput && (
        <ISBNInputModal
          onClose={() => setShowISBNInput(false)}
          onSearch={handleSearchResult}
        />
      )}

      {/* Barcode Scanner Modal */}
      {showBarcodeScanner && (
        <BarcodeScannerModal
          onClose={() => setShowBarcodeScanner(false)}
          onScanSuccess={handleSearchResult}
        />
      )}
    </div>
  );
};

export default TBRForm; 