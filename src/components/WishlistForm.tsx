import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Heart, Search, Camera, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { useAppState } from '../context/AppStateContext';
import { Libro, BookData } from '../types';
import { fetchBookData } from '../services/googleBooksAPI';
import BookTitleAutocomplete from './BookTitleAutocomplete';
import ISBNInputModal from './ISBNInputModal';
import BarcodeScannerModal from './BarcodeScannerModal';
import DuplicateBookModal from './DuplicateBookModal';

interface WishlistFormProps {
  onOpenConfig?: () => void;
}

const WishlistForm: React.FC<WishlistFormProps> = ({ onOpenConfig }) => {
  const { state, dispatch } = useAppState();
  const [titulo, setTitulo] = useState('');
  const [autor, setAutor] = useState('');
  const [paginas, setPaginas] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const [showISBNInput, setShowISBNInput] = useState(false);
  const [showBarcodeScanner, setShowBarcodeScanner] = useState(false);
  const [isLoadingBook, setIsLoadingBook] = useState(false);
  const [scanStatus, setScanStatus] = useState<'idle' | 'scanning' | 'found' | 'error'>('idle');
  const [scanMessage, setScanMessage] = useState('');
  const [isBookFromScan, setIsBookFromScan] = useState(false);
  const [selectedBookData, setSelectedBookData] = useState<BookData | null>(null);
  
  // Estados para el modal de duplicados
  const [showDuplicateModal, setShowDuplicateModal] = useState(false);
  const [duplicateBook, setDuplicateBook] = useState<Libro | null>(null);
  const [pendingBookData, setPendingBookData] = useState<BookData | null>(null);

  const validateISBN = (isbn: string): boolean => {
    const cleanISBN = isbn.replace(/[-\s]/g, '');
    return cleanISBN.length === 10 || cleanISBN.length === 13;
  };

  const checkForDuplicate = (bookData: BookData): Libro | null => {
    // Buscar por ISBN primero
    if (bookData.isbn) {
      const existingByISBN = state.libros.find(libro => 
        libro.isbn === bookData.isbn
      );
      if (existingByISBN) return existingByISBN;
    }
    
    // Buscar por título y autor
    const existingByTitle = state.libros.find(libro => 
      libro.titulo.toLowerCase() === bookData.titulo.toLowerCase() &&
      (!bookData.autor || !libro.autor || 
       libro.autor.toLowerCase() === bookData.autor.toLowerCase())
    );
    
    return existingByTitle || null;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!titulo.trim()) return;
    
    const newBookData: BookData = {
      titulo: titulo.trim(),
      autor: autor.trim() || undefined,
      paginas: paginas ? parseInt(paginas) : undefined,
      isbn: selectedBookData?.isbn,
      publicacion: selectedBookData?.publicacion,
      editorial: selectedBookData?.editorial,
      descripcion: selectedBookData?.descripcion,
      categorias: selectedBookData?.categorias,
      idioma: selectedBookData?.idioma,
      calificacion: selectedBookData?.calificacion,
      numCalificaciones: selectedBookData?.numCalificaciones,
      genero: selectedBookData?.genero,
      formato: selectedBookData?.formato,
      precio: selectedBookData?.precio
    };
    
    // Verificar si es un duplicado
    const duplicate = checkForDuplicate(newBookData);
    
    if (duplicate) {
      setDuplicateBook(duplicate);
      setPendingBookData(newBookData);
      setShowDuplicateModal(true);
      return;
    }
    
    // Si no es duplicado, agregar directamente
    addBookToWishlist(newBookData);
  };

  const addBookToWishlist = (bookData: BookData) => {
    const nuevoLibro: Libro = {
      id: Date.now(),
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
      numCalificaciones: bookData.numCalificaciones,
      genero: bookData.genero,
      formato: bookData.formato,
      precio: bookData.precio,
      // Campos para imágenes de portada (Google Books API)
      imageLinks: bookData.imageLinks,
      // Campos para acceso a vista previa (Google Books API)
      accessInfo: bookData.accessInfo,
      estado: 'wishlist',
      historialEstados: [{
        estado: 'wishlist',
        fecha: Date.now()
      }],
      lecturas: []
    };
    
    // Debug logs
    console.log('📚 WishlistForm: Creating new book with data:', {
      bookData,
      nuevoLibro,
      imageLinks: bookData.imageLinks,
      accessInfo: bookData.accessInfo
    });
    
    dispatch({ type: 'ADD_BOOK', payload: nuevoLibro });
    
    // Limpiar formulario
    setTitulo('');
    setAutor('');
    setPaginas('');
    setIsExpanded(false);
    setSelectedBookData(null);
    setScanStatus('idle');
    setScanMessage('');
  };

  const handleBookSelect = (bookData: BookData) => {
    // Debug logs
    console.log('📚 WishlistForm: handleBookSelect called with:', {
      bookData,
      imageLinks: bookData.imageLinks,
      accessInfo: bookData.accessInfo,
      hasImageLinks: !!bookData.imageLinks,
      hasAccessInfo: !!bookData.accessInfo
    });
    
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
        console.log('📚 WishlistForm: Book data received from API:', {
          bookData,
          imageLinks: bookData.imageLinks,
          accessInfo: bookData.accessInfo,
          hasImageLinks: !!bookData.imageLinks,
          hasAccessInfo: !!bookData.accessInfo
        });
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

  const handleDuplicateConfirm = () => {
    if (pendingBookData) {
      addBookToWishlist(pendingBookData);
    }
    setShowDuplicateModal(false);
    setDuplicateBook(null);
    setPendingBookData(null);
  };

  const handleDuplicateCancel = () => {
    setShowDuplicateModal(false);
    setDuplicateBook(null);
    setPendingBookData(null);
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
          onOpenConfig={onOpenConfig}
        />
      )}

      {/* Duplicate Book Modal */}
      {duplicateBook && pendingBookData && (
        <DuplicateBookModal
          isOpen={showDuplicateModal}
          onClose={handleDuplicateCancel}
          onConfirm={handleDuplicateConfirm}
          onCancel={handleDuplicateCancel}
          existingBook={duplicateBook}
          newBookData={pendingBookData}
        />
      )}
    </div>
  );
};

export default WishlistForm; 