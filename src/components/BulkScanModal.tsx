import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Barcode, 
  X, 
  Plus, 
  Trash2, 
  Edit3, 
  Save, 
  CheckCircle, 
  AlertCircle,
  Loader2,
  Camera,
  CameraOff,
  RotateCcw,
  Search
} from 'lucide-react';
import { BrowserMultiFormatReader } from '@zxing/library';
import { useAppState } from '../context/AppStateContext';
import { Libro, BookData } from '../types';
import { validateISBN, fetchBookData } from '../services/googleBooksAPI';

interface ScannedBook {
  id: number;
  isbn: string;
  titulo: string;
  autor: string;
  paginas: string;
  sagaName: string;
  status: 'pending' | 'found' | 'error' | 'loading';
  errorMessage?: string;
  bookData?: BookData;
}

interface BulkScanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBooksAdded: (books: Libro[]) => void;
}

const BulkScanModal: React.FC<BulkScanModalProps> = ({ isOpen, onClose, onBooksAdded }) => {
  const { state, dispatch } = useAppState();
  const [scannedBooks, setScannedBooks] = useState<ScannedBook[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [editingBook, setEditingBook] = useState<number | null>(null);
  const [selectedBooks, setSelectedBooks] = useState<Set<number>>(new Set());
  const [scanMode, setScanMode] = useState<'continuous' | 'single'>('continuous');
  
  const codeReaderRef = useRef<BrowserMultiFormatReader | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const scanningTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isOpen) {
      initializeScanner();
    } else {
      stopScanning();
      setScannedBooks([]);
      setEditingBook(null);
      setSelectedBooks(new Set());
    }
  }, [isOpen]);

  const initializeScanner = async () => {
    try {
      if (!codeReaderRef.current) {
        codeReaderRef.current = new BrowserMultiFormatReader();
      }

      // Request camera permissions
      await navigator.mediaDevices.getUserMedia({ video: true });
    } catch (error) {
      console.error('Error initializing scanner:', error);
    }
  };

  const startScanning = async () => {
    if (!codeReaderRef.current || !videoRef.current) return;

    try {
      setIsScanning(true);
      
      await codeReaderRef.current.decodeFromVideoDevice(
        null,
        videoRef.current,
        (result, error) => {
          if (result) {
            const scannedCode = result.getText();
            handleScannedCode(scannedCode);
            
            if (scanMode === 'single') {
              stopScanning();
            }
          }
        }
      );
    } catch (error) {
      console.error('Error starting scanner:', error);
      setIsScanning(false);
    }
  };

  const stopScanning = () => {
    if (codeReaderRef.current) {
      codeReaderRef.current.reset();
    }
    setIsScanning(false);
    
    if (scanningTimeoutRef.current) {
      clearTimeout(scanningTimeoutRef.current);
      scanningTimeoutRef.current = null;
    }
  };

  const handleScannedCode = async (scannedCode: string) => {
    // Check if book already exists
    if (scannedBooks.some(book => book.isbn === scannedCode)) {
      return; // Already scanned
    }

    const newBook: ScannedBook = {
      id: Date.now() + Math.random(),
      isbn: scannedCode,
      titulo: '',
      autor: '',
      paginas: '',
      sagaName: '',
      status: 'loading'
    };

    setScannedBooks(prev => [...prev, newBook]);

    try {
      if (!validateISBN(scannedCode)) {
        setScannedBooks(prev => prev.map(book => 
          book.id === newBook.id 
            ? { ...book, status: 'error', errorMessage: 'ISBN inválido' }
            : book
        ));
        return;
      }

      const bookData = await fetchBookData(scannedCode);
      
      if (bookData) {
        setScannedBooks(prev => prev.map(book => 
          book.id === newBook.id 
            ? {
                ...book,
                titulo: bookData.titulo,
                autor: bookData.autor || '',
                paginas: bookData.paginas?.toString() || '',
                status: 'found',
                bookData
              }
            : book
        ));
      } else {
        setScannedBooks(prev => prev.map(book => 
          book.id === newBook.id 
            ? { ...book, status: 'error', errorMessage: 'No se encontró información' }
            : book
        ));
      }
    } catch (error) {
      setScannedBooks(prev => prev.map(book => 
        book.id === newBook.id 
          ? { ...book, status: 'error', errorMessage: 'Error al buscar información' }
          : book
      ));
    }
  };

  const updateBook = (id: number, updates: Partial<ScannedBook>) => {
    setScannedBooks(prev => prev.map(book => 
      book.id === id ? { ...book, ...updates } : book
    ));
  };

  const removeBook = (id: number) => {
    setScannedBooks(prev => prev.filter(book => book.id !== id));
    setSelectedBooks(prev => {
      const newSet = new Set(prev);
      newSet.delete(id);
      return newSet;
    });
  };

  const toggleBookSelection = (id: number) => {
    setSelectedBooks(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const addSelectedBooks = () => {
    const booksToAdd: Libro[] = scannedBooks
      .filter(book => selectedBooks.has(book.id) && book.status === 'found')
      .map(book => ({
        id: Date.now() + Math.random(),
        titulo: book.titulo,
        autor: book.autor,
        paginas: parseInt(book.paginas) || undefined,
        sagaName: book.sagaName || undefined,
        isbn: book.isbn,
        fechaAgregado: Date.now()
      }));

    if (booksToAdd.length > 0) {
      booksToAdd.forEach(book => {
        dispatch({ type: 'ADD_TO_TBR', payload: book });
      });
      onBooksAdded(booksToAdd);
      onClose();
    }
  };

  const addAllBooks = () => {
    const validBooks = scannedBooks.filter(book => book.status === 'found');
    setSelectedBooks(new Set(validBooks.map(book => book.id)));
  };

  const clearSelection = () => {
    setSelectedBooks(new Set());
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
        className="relative bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-6xl w-full mx-4 max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center space-x-2">
            <Barcode className="h-5 w-5 text-primary-500" />
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
              Escaneo Múltiple de Libros
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors duration-200"
          >
            <X className="h-5 w-5 text-slate-500" />
          </button>
        </div>

        <div className="flex h-[calc(90vh-80px)]">
          {/* Scanner Panel */}
          <div className="w-1/2 border-r border-slate-200 dark:border-slate-700 flex flex-col">
            <div className="p-4 border-b border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-medium text-slate-900 dark:text-white">Escáner</h4>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setScanMode('single')}
                    className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors duration-200 ${
                      scanMode === 'single' 
                        ? 'bg-primary-500 text-white' 
                        : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    Individual
                  </button>
                  <button
                    onClick={() => setScanMode('continuous')}
                    className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors duration-200 ${
                      scanMode === 'continuous' 
                        ? 'bg-primary-500 text-white' 
                        : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    Continuo
                  </button>
                </div>
              </div>
              
              <div className="flex space-x-2">
                <button
                  onClick={isScanning ? stopScanning : startScanning}
                  className="flex-1 px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg font-medium transition-colors duration-200 flex items-center justify-center space-x-2"
                >
                  {isScanning ? (
                    <>
                      <CameraOff className="h-4 w-4" />
                      <span>Detener</span>
                    </>
                  ) : (
                    <>
                      <Camera className="h-4 w-4" />
                      <span>Iniciar Escáner</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Video Container */}
            <div className="flex-1 relative bg-black">
              <video
                ref={videoRef}
                className="w-full h-full object-cover"
                muted
              />
              
              {isScanning && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="relative">
                    <div className="w-48 h-32 border-2 border-primary-500 rounded-lg relative">
                      <div className="absolute -top-1 -left-1 w-4 h-4 border-l-2 border-t-2 border-primary-500"></div>
                      <div className="absolute -top-1 -right-1 w-4 h-4 border-r-2 border-t-2 border-primary-500"></div>
                      <div className="absolute -bottom-1 -left-1 w-4 h-4 border-l-2 border-b-2 border-primary-500"></div>
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 border-r-2 border-b-2 border-primary-500"></div>
                      <div className="absolute top-0 left-0 w-full h-0.5 bg-primary-500 animate-pulse"></div>
                    </div>
                    <div className="mt-4 text-center">
                      <p className="text-white text-sm font-medium">
                        Modo: {scanMode === 'continuous' ? 'Continuo' : 'Individual'}
                      </p>
                      <p className="text-slate-300 text-xs mt-1">
                        Libros escaneados: {scannedBooks.length}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Books List Panel */}
          <div className="w-1/2 flex flex-col">
            <div className="p-4 border-b border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-medium text-slate-900 dark:text-white">
                  Libros Escaneados ({scannedBooks.length})
                </h4>
                <div className="flex space-x-2">
                  <button
                    onClick={addAllBooks}
                    className="px-3 py-1 bg-green-500 hover:bg-green-600 text-white rounded-lg text-sm font-medium transition-colors duration-200"
                  >
                    Seleccionar Todos
                  </button>
                  <button
                    onClick={clearSelection}
                    className="px-3 py-1 bg-slate-500 hover:bg-slate-600 text-white rounded-lg text-sm font-medium transition-colors duration-200"
                  >
                    Limpiar
                  </button>
                </div>
              </div>
              
              <div className="flex items-center space-x-2 text-sm text-slate-600 dark:text-slate-400">
                <span>Seleccionados: {selectedBooks.size}</span>
                {selectedBooks.size > 0 && (
                  <button
                    onClick={addSelectedBooks}
                    className="px-3 py-1 bg-primary-500 hover:bg-primary-600 text-white rounded-lg font-medium transition-colors duration-200"
                  >
                    Agregar Seleccionados
                  </button>
                )}
              </div>
            </div>

            {/* Books List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {scannedBooks.length === 0 ? (
                <div className="text-center py-8">
                  <Barcode className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                  <p className="text-slate-600 dark:text-slate-400">
                    No hay libros escaneados
                  </p>
                  <p className="text-sm text-slate-500 dark:text-slate-500">
                    Inicia el escáner para comenzar
                  </p>
                </div>
              ) : (
                scannedBooks.map((book) => (
                  <motion.div
                    key={book.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`p-3 rounded-lg border transition-colors duration-200 ${
                      selectedBooks.has(book.id)
                        ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                        : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-700'
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <input
                        type="checkbox"
                        checked={selectedBooks.has(book.id)}
                        onChange={() => toggleBookSelection(book.id)}
                        disabled={book.status !== 'found'}
                        className="mt-1"
                      />
                      
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          {book.status === 'loading' && (
                            <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
                          )}
                          {book.status === 'found' && (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          )}
                          {book.status === 'error' && (
                            <AlertCircle className="h-4 w-4 text-red-500" />
                          )}
                          
                          <span className="font-mono text-sm text-slate-600 dark:text-slate-400">
                            {book.isbn}
                          </span>
                        </div>

                        {editingBook === book.id ? (
                          <div className="space-y-2">
                            <input
                              type="text"
                              value={book.titulo}
                              onChange={(e) => updateBook(book.id, { titulo: e.target.value })}
                              className="w-full px-2 py-1 text-sm border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                              placeholder="Título"
                            />
                            <input
                              type="text"
                              value={book.autor}
                              onChange={(e) => updateBook(book.id, { autor: e.target.value })}
                              className="w-full px-2 py-1 text-sm border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                              placeholder="Autor"
                            />
                            <input
                              type="text"
                              value={book.paginas}
                              onChange={(e) => updateBook(book.id, { paginas: e.target.value })}
                              className="w-full px-2 py-1 text-sm border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                              placeholder="Páginas"
                            />
                            <input
                              type="text"
                              value={book.sagaName}
                              onChange={(e) => updateBook(book.id, { sagaName: e.target.value })}
                              className="w-full px-2 py-1 text-sm border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                              placeholder="Saga"
                            />
                            <div className="flex space-x-2">
                              <button
                                onClick={() => setEditingBook(null)}
                                className="px-2 py-1 bg-green-500 hover:bg-green-600 text-white rounded text-xs"
                              >
                                <Save className="h-3 w-3" />
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div>
                            {book.titulo && (
                              <p className="font-medium text-slate-900 dark:text-white text-sm">
                                {book.titulo}
                              </p>
                            )}
                            {book.autor && (
                              <p className="text-slate-600 dark:text-slate-400 text-sm">
                                {book.autor}
                              </p>
                            )}
                            {book.paginas && (
                              <p className="text-slate-500 dark:text-slate-500 text-xs">
                                {book.paginas} páginas
                              </p>
                            )}
                            {book.errorMessage && (
                              <p className="text-red-600 dark:text-red-400 text-xs">
                                {book.errorMessage}
                              </p>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="flex space-x-1">
                        {book.status === 'found' && (
                          <button
                            onClick={() => setEditingBook(editingBook === book.id ? null : book.id)}
                            className="p-1 hover:bg-slate-200 dark:hover:bg-slate-600 rounded"
                          >
                            <Edit3 className="h-3 w-3 text-slate-500" />
                          </button>
                        )}
                        <button
                          onClick={() => removeBook(book.id)}
                          className="p-1 hover:bg-red-100 dark:hover:bg-red-900/20 rounded"
                        >
                          <Trash2 className="h-3 w-3 text-red-500" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default BulkScanModal;