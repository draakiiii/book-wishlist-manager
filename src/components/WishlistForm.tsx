import React, { useState } from 'react';
import { useAppState } from '../context/AppStateContext';
import { motion } from 'framer-motion';
import { Heart, Plus, ShoppingCart, Search, Loader2, CheckCircle, AlertCircle, Camera, Barcode } from 'lucide-react';
import BookTitleAutocomplete from './BookTitleAutocomplete';
import ISBNInputModal from './ISBNInputModal';
import BarcodeScannerModal from './BarcodeScannerModal';
import { BookData, Libro } from '../types';
import { fetchBookData, validateISBN } from '../services/googleBooksAPI';

const WishlistForm: React.FC = () => {
  const { state, dispatch } = useAppState();
  const [titulo, setTitulo] = useState('');
  const [autor, setAutor] = useState('');
  const [paginas, setPaginas] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const [showBarcodeScanner, setShowBarcodeScanner] = useState(false);
  const [showISBNInput, setShowISBNInput] = useState(false);
  const [isLoadingBook, setIsLoadingBook] = useState(false);
  const [scanStatus, setScanStatus] = useState<'idle' | 'scanning' | 'found' | 'error'>('idle');
  const [scanMessage, setScanMessage] = useState('');
  const [isBookFromScan, setIsBookFromScan] = useState(false);
  const [selectedBookData, setSelectedBookData] = useState<BookData | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (titulo.trim()) {
      let nuevoLibro: Libro;
      
      // Si tenemos datos completos del libro seleccionado, usarlos
      if (selectedBookData) {
        nuevoLibro = {
          id: Date.now(),
          titulo: selectedBookData.titulo,
          autor: selectedBookData.autor,
          paginas: selectedBookData.paginas,
          isbn: selectedBookData.isbn,
          publicacion: selectedBookData.publicacion,
          editorial: selectedBookData.editorial,
          descripcion: selectedBookData.descripcion,
          categorias: selectedBookData.categorias,
          idioma: selectedBookData.idioma,
          calificacion: selectedBookData.calificacion,
          numCalificaciones: selectedBookData.numCalificaciones,
          genero: selectedBookData.genero,
          formato: selectedBookData.formato,
          precio: selectedBookData.precio,
          estado: 'wishlist',
          historialEstados: [{
            estado: 'wishlist',
            fecha: Date.now()
          }],
          lecturas: []
        };
      } else {
        // Si no hay datos completos, usar los campos del formulario
        nuevoLibro = {
          id: Date.now(),
          titulo: titulo.trim(),
          autor: autor.trim() || undefined,
          paginas: paginas ? parseInt(paginas) : undefined,
          estado: 'wishlist',
          historialEstados: [{
            estado: 'wishlist',
            fecha: Date.now()
          }],
          lecturas: []
        };
      }

      dispatch({ type: 'ADD_BOOK', payload: nuevoLibro });
      
      // Reset form
      setTitulo('');
      setAutor('');
      setPaginas('');
      setIsExpanded(false);
      setScanStatus('idle');
      setScanMessage('');
      setSelectedBookData(null);
    }
  };

  const handleBookSelect = (bookData: BookData) => {
    setSelectedBookData(bookData);
    setTitulo(bookData.titulo);
    setAutor(bookData.autor || '');
    setPaginas(bookData.paginas?.toString() || '');
    setIsExpanded(true);
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
        setSelectedBookData(bookData);
        setTitulo(bookData.titulo);
        setAutor(bookData.autor || '');
        setPaginas(bookData.paginas?.toString() || '');
        setScanStatus('found');
        setScanMessage('¡Libro encontrado! Completa los detalles y agrega a tu lista de deseos.');
        setIsExpanded(true);
      } else {
        setScanStatus('error');
        setScanMessage('No se encontró información para este ISBN. Puedes agregar el libro manualmente.');
        setIsExpanded(true);
      }
    } catch (error) {
      console.error('Error fetching book data:', error);
      setScanStatus('error');
      setScanMessage('Error al buscar información del libro. Puedes agregarlo manualmente.');
      setIsExpanded(true);
    } finally {
      setIsLoadingBook(false);
      setIsBookFromScan(false);
    }
  };

  const getStatusIcon = () => {
    switch (scanStatus) {
      case 'scanning':
        return <Loader2 className="h-4 w-4 animate-spin" />;
      case 'found':
        return <CheckCircle className="h-4 w-4" />;
      case 'error':
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <Search className="h-4 w-4" />;
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
    <div className="space-y-4">
      {/* Quick Add Section */}
      <div className="bg-white/50 dark:bg-slate-800/50 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-secondary-100 dark:bg-secondary-900/30 rounded-lg">
              <Heart className="h-4 w-4 text-secondary-600 dark:text-secondary-400" />
            </div>
            <h3 className="text-sm font-medium text-slate-900 dark:text-white">
              Agregar a Lista de Deseos
            </h3>
          </div>
          
          <div className="flex items-center space-x-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowISBNInput(true)}
              className="p-2 bg-blue-100 dark:bg-blue-900/30 hover:bg-blue-200 dark:hover:bg-blue-800/30 rounded-lg transition-colors duration-200"
              title="Buscar por ISBN"
            >
              <Search className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowBarcodeScanner(true)}
              className="p-2 bg-green-100 dark:bg-green-900/30 hover:bg-green-200 dark:hover:bg-green-800/30 rounded-lg transition-colors duration-200"
              title="Escanear código de barras"
            >
              <Camera className="h-4 w-4 text-green-600 dark:text-green-400" />
            </motion.button>
          </div>
        </div>

        {/* Quick Add Form */}
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
                              <BookTitleAutocomplete
                  value={titulo}
                  onChange={setTitulo}
                  onBookSelect={handleBookSelect}
                  placeholder="Título del libro"
                />
            </div>
            
            <div>
              <input
                type="text"
                value={autor}
                onChange={(e) => setAutor(e.target.value)}
                placeholder="Autor (opcional)"
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:ring-2 focus:ring-secondary-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <input
              type="number"
              value={paginas}
              onChange={(e) => setPaginas(e.target.value)}
              placeholder="Páginas (opcional)"
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:ring-2 focus:ring-secondary-500 focus:border-transparent"
            />
          </div>

          {/* Scan Status */}
          {scanStatus !== 'idle' && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex items-center space-x-2 p-3 rounded-lg ${
                scanStatus === 'found' ? 'bg-green-100 dark:bg-green-900/30' :
                scanStatus === 'error' ? 'bg-red-100 dark:bg-red-900/30' :
                'bg-blue-100 dark:bg-blue-900/30'
              }`}
            >
              {getStatusIcon()}
              <span className={`text-sm font-medium ${getStatusColor()}`}>
                {scanMessage}
              </span>
            </motion.div>
          )}

          <div className="flex justify-end">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="submit"
              disabled={!titulo.trim() || isLoadingBook}
              className="px-4 py-2 bg-secondary-500 hover:bg-secondary-600 disabled:bg-slate-300 dark:disabled:bg-slate-600 text-white rounded-lg font-medium transition-colors duration-200 flex items-center space-x-2 disabled:cursor-not-allowed"
            >
              <Heart className="h-4 w-4" />
              <span>Agregar a Deseos</span>
            </motion.button>
          </div>
        </form>
      </div>

      {/* Modals */}
      {showISBNInput && (
        <ISBNInputModal
          onClose={() => setShowISBNInput(false)}
          onSearch={handleSearchResult}
        />
      )}

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