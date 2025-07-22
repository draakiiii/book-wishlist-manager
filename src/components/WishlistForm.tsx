import React, { useState } from 'react';
import { useAppState } from '../context/AppStateContext';
import { motion } from 'framer-motion';
import { Heart, Plus, ShoppingCart, Search, Loader2, CheckCircle, AlertCircle, Camera, Hash } from 'lucide-react';
import BookTitleAutocomplete from './BookTitleAutocomplete';
import { BookData } from '../types';
import { fetchBookData, validateISBN } from '../services/googleBooksAPI';
import BarcodeScannerModal from './BarcodeScannerModal';
import ISBNInputModal from './ISBNInputModal';

const WishlistForm: React.FC = () => {
  const { state, dispatch } = useAppState();
  const [titulo, setTitulo] = useState('');
  const [autor, setAutor] = useState('');
  const [paginas, setPaginas] = useState<number | undefined>(undefined);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showBarcodeScanner, setShowBarcodeScanner] = useState(false);
  const [showISBNInput, setShowISBNInput] = useState(false);
  const [isLoadingBook, setIsLoadingBook] = useState(false);
  const [scanStatus, setScanStatus] = useState<'idle' | 'scanning' | 'found' | 'error'>('idle');
  const [scanMessage, setScanMessage] = useState('');
  const [isBookFromScan, setIsBookFromScan] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (titulo.trim()) {
      dispatch({ 
        type: 'ADD_TO_WISHLIST', 
        payload: { 
          titulo: titulo.trim(), 
          autor: autor.trim() || undefined,
          paginas: paginas
        } 
      });
      setTitulo('');
      setAutor('');
      setPaginas(undefined);
      setIsExpanded(false);
    }
  };

  const handleBookSelect = (bookData: BookData) => {
    setTitulo(bookData.titulo);
    setAutor(bookData.autor || '');
    setPaginas(bookData.paginas);
    
    // Si el libro tiene información completa, añadirlo directamente a la wishlist
    if (bookData.isbn || bookData.descripcion || bookData.editorial) {
      dispatch({ 
        type: 'ADD_TO_WISHLIST', 
        payload: { 
          titulo: bookData.titulo,
          autor: bookData.autor,
          paginas: bookData.paginas,
          isbn: bookData.isbn,
          publicacion: bookData.publicacion,
          editorial: bookData.editorial,
          descripcion: bookData.descripcion,
          categorias: bookData.categorias,
          idioma: bookData.idioma,
          calificacion: bookData.calificacion,
          numCalificaciones: bookData.numCalificaciones
        } 
      });
      setTitulo('');
      setAutor('');
      setPaginas(undefined);
      setIsExpanded(false);
    }
  };

  const handleSearchResult = async (result: string) => {
    setShowISBNInput(false);
    setShowBarcodeScanner(false);
    setIsLoadingBook(true);
    setScanStatus('scanning');
    setScanMessage('Validando ISBN...');
    setIsBookFromScan(true);
    
    try {
      if (!validateISBN(result)) {
        setScanStatus('error');
        setScanMessage('Código de barras no válido. Debe ser un ISBN de 10 o 13 dígitos.');
        setIsLoadingBook(false);
        setIsBookFromScan(false);
        return;
      }
      
      setScanMessage('Buscando información del libro...');
      
      const bookData = await fetchBookData(result);
      
      if (bookData) {
        console.log('Book data received:', bookData);
        
        // Añadir directamente a la wishlist con toda la información
        dispatch({ 
          type: 'ADD_TO_WISHLIST', 
          payload: { 
            titulo: bookData.titulo,
            autor: bookData.autor,
            paginas: bookData.paginas,
            isbn: bookData.isbn,
            publicacion: bookData.publicacion,
            editorial: bookData.editorial,
            descripcion: bookData.descripcion,
            categorias: bookData.categorias,
            idioma: bookData.idioma,
            calificacion: bookData.calificacion,
            numCalificaciones: bookData.numCalificaciones
          } 
        });
        
        setScanStatus('found');
        setScanMessage(`¡Libro añadido a la wishlist: ${bookData.titulo}`);
        
        if (bookData.editorial || bookData.publicacion) {
          const additionalInfo: string[] = [];
          if (bookData.editorial) additionalInfo.push(bookData.editorial);
          if (bookData.publicacion) additionalInfo.push(bookData.publicacion.toString());
          if (additionalInfo.length > 0) {
            setScanMessage(prev => `${prev} (${additionalInfo.join(', ')})`);
          }
        }
        
        // Reset form after a delay
        setTimeout(() => {
          setScanStatus('idle');
          setScanMessage('');
          setIsBookFromScan(false);
        }, 3000);
      } else {
        setScanStatus('error');
        setScanMessage('No se encontró información del libro. Puedes agregarlo manualmente.');
        setIsBookFromScan(false);
      }
    } catch (error) {
      console.error('Error fetching book data:', error);
      setScanStatus('error');
      setScanMessage('Error al buscar información del libro. Puedes agregarlo manualmente.');
      setIsBookFromScan(false);
    } finally {
      setIsLoadingBook(false);
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
          <div className="p-1.5 sm:p-2 bg-secondary-100 dark:bg-secondary-900/30 rounded-lg">
            <Heart className="h-4 w-4 sm:h-5 sm:w-5 text-secondary-600 dark:text-secondary-400" />
          </div>
          <h3 className="text-base sm:text-lg font-semibold text-slate-900 dark:text-white">
            Agregar a Lista de Deseos
          </h3>
        </div>
      </div>

      {/* Status Message */}
      {!state.compraDesbloqueada && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-lg p-3 sm:p-4"
        >
          <div className="flex items-start space-x-2 sm:space-x-3">
            <ShoppingCart className="h-4 w-4 sm:h-5 sm:w-5 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-xs sm:text-sm font-medium text-amber-800 dark:text-amber-200">
                Compra bloqueada
              </p>
              <p className="text-xs sm:text-sm text-amber-700 dark:text-amber-300 mt-1">
                Puedes agregar libros a tu lista de deseos, pero necesitas alcanzar {state.config.objetivo} puntos para poder comprarlos. 
                Actualmente tienes {state.progreso} puntos.
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Scan Status Message */}
      {scanStatus !== 'idle' && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-lg p-3 sm:p-4`}
        >
          <div className="flex items-center space-x-2 sm:space-x-3">
            {getStatusIcon()}
            <div>
              <p className={`text-xs sm:text-sm font-medium ${getStatusColor()}`}>
                {scanStatus === 'scanning' && 'Procesando...'}
                {scanStatus === 'found' && '¡Libro encontrado!'}
                {scanStatus === 'error' && 'Error'}
              </p>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
                {scanMessage}
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Form */}
      <motion.div
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: 'auto' }}
        className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden"
      >
        {!isExpanded ? (
          <div className="p-3 sm:p-4 space-y-3 sm:space-y-4">
            {/* Quick Add Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setIsExpanded(true)}
              className="w-full p-3 sm:p-4 text-left hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors duration-200 rounded-lg border border-slate-200 dark:border-slate-600"
            >
              <div className="flex items-center space-x-2 sm:space-x-3">
                <div className="p-1.5 sm:p-2 bg-secondary-500 rounded-lg">
                  <Plus className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
                </div>
                <span className="text-sm sm:text-base text-slate-700 dark:text-slate-300 font-medium">
                  Agregar manualmente
                </span>
              </div>
            </motion.button>

            {/* Scan Options */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowBarcodeScanner(true)}
                className="p-3 sm:p-4 text-left hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors duration-200 rounded-lg border border-slate-200 dark:border-slate-600"
              >
                <div className="flex items-center space-x-2 sm:space-x-3">
                  <div className="p-1.5 sm:p-2 bg-blue-500 rounded-lg">
                    <Camera className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
                  </div>
                  <span className="text-sm sm:text-base text-slate-700 dark:text-slate-300 font-medium">
                    Escanear código
                  </span>
                </div>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowISBNInput(true)}
                className="p-3 sm:p-4 text-left hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors duration-200 rounded-lg border border-slate-200 dark:border-slate-600"
              >
                <div className="flex items-center space-x-2 sm:space-x-3">
                  <div className="p-1.5 sm:p-2 bg-green-500 rounded-lg">
                    <Hash className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
                  </div>
                  <span className="text-sm sm:text-base text-slate-700 dark:text-slate-300 font-medium">
                    Introducir ISBN
                  </span>
                </div>
              </motion.button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-3 sm:p-4 space-y-3 sm:space-y-4">
            <div className="grid grid-cols-1 gap-3 sm:gap-4">
              <div className="space-y-1.5 sm:space-y-2">
                <label className="block text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300">
                  Título del Libro
                </label>
                <BookTitleAutocomplete
                  value={titulo}
                  onChange={setTitulo}
                  onBookSelect={handleBookSelect}
                  placeholder="Ej: El Señor de los Anillos"
                />
              </div>
              
              <div className="space-y-1.5 sm:space-y-2">
                <label className="block text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300">
                  Autor
                </label>
                <input
                  type="text"
                  value={autor}
                  onChange={(e) => setAutor(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-secondary-500 focus:border-transparent transition-colors duration-200 text-sm"
                  placeholder="Ej: J.R.R. Tolkien"
                />
              </div>
              
              {paginas && (
                <div className="space-y-1.5 sm:space-y-2">
                  <label className="block text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300">
                    Páginas (detectado automáticamente)
                  </label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="number"
                      value={paginas}
                      onChange={(e) => setPaginas(e.target.value ? parseInt(e.target.value) : undefined)}
                      className="flex-1 px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-secondary-500 focus:border-transparent transition-colors duration-200 text-sm"
                      placeholder="Número de páginas"
                      min="1"
                    />
                    <div className="px-3 py-2 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-lg text-xs font-medium">
                      ✓ Auto
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
              <motion.button
                type="submit"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="w-full sm:w-auto px-4 py-2 bg-secondary-500 hover:bg-secondary-600 text-white rounded-lg font-medium transition-colors duration-200 flex items-center justify-center space-x-2 text-sm"
              >
                <Heart className="h-3 w-3 sm:h-4 sm:w-4" />
                <span>Agregar a Lista</span>
              </motion.button>
              
              <motion.button
                type="button"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  setIsExpanded(false);
                  setTitulo('');
                  setAutor('');
                  setPaginas(undefined);
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

      {/* Success Message */}
      {state.compraDesbloqueada && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-success-50 dark:bg-success-900/20 border border-success-200 dark:border-success-700 rounded-lg p-3 sm:p-4"
        >
          <div className="flex items-start space-x-2 sm:space-x-3">
            <ShoppingCart className="h-4 w-4 sm:h-5 sm:w-5 text-success-600 dark:text-success-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-xs sm:text-sm font-medium text-success-800 dark:text-success-200">
                ¡Compra desbloqueada!
              </p>
              <p className="text-xs sm:text-sm text-success-700 dark:text-success-300 mt-1">
                Puedes comprar libros de tu lista de deseos. Al comprarlo, se gastarán {state.config.objetivo} puntos.
              </p>
            </div>
          </div>
        </motion.div>
      )}

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

export default WishlistForm; 