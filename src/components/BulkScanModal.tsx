import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Barcode, 
  X, 
  Trash2, 
  Edit3, 
  Save, 
  CheckCircle, 
  AlertCircle,
  Loader2,
  Camera,
  CameraOff,
  RotateCcw,
  List,
  Zap
} from 'lucide-react';
import { BrowserMultiFormatReader } from '@zxing/library';
import { useAppState } from '../context/AppStateContext';
import { Libro, BookData } from '../types';
import { validateISBN, fetchBookData } from '../services/bookAPI';
import { useDialog } from '../hooks/useDialog';
import { generateUniqueId } from '../utils/idGenerator';
import Dialog from './Dialog';

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

interface ScanFeedback {
  type: 'info' | 'success' | 'error' | 'warning';
  message: string;
  timestamp: number;
}

interface BulkScanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBooksAdded: (books: Libro[]) => void;
}

const BulkScanModal: React.FC<BulkScanModalProps> = ({ isOpen, onClose, onBooksAdded }) => {
  const { state, dispatch } = useAppState();
  const { dialog, showError, showConfirm, hideDialog } = useDialog();
  const [scannedBooks, setScannedBooks] = useState<ScannedBook[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [editingBook, setEditingBook] = useState<number | null>(null);
  const [selectedBooks, setSelectedBooks] = useState<Set<number>>(new Set());
  const [scanMode, setScanMode] = useState<'continuous' | 'single'>('continuous');
  const [previousScanMode, setPreviousScanMode] = useState<'continuous' | 'single'>('continuous');
  const [showBooksList, setShowBooksList] = useState(false);
  const [currentCamera, setCurrentCamera] = useState(0);
  const [availableCameras, setAvailableCameras] = useState<MediaDeviceInfo[]>([]);
  const [feedbackMessages, setFeedbackMessages] = useState<ScanFeedback[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);
  const [flashlightEnabled, setFlashlightEnabled] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  
  const codeReaderRef = useRef<BrowserMultiFormatReader | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const scanningTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Use ref to track current scanned books for real-time duplicate detection
  const scannedBooksRef = useRef<ScannedBook[]>([]);

  const addFeedback = (type: ScanFeedback['type'], message: string, duration: number = 3000) => {
    const newFeedback: ScanFeedback = {
      type,
      message,
      timestamp: Date.now()
    };
    
    setFeedbackMessages(prev => {
      const updated = [newFeedback, ...prev.slice(0, 2)];
      return updated;
    });
    
    setTimeout(() => {
      setFeedbackMessages(prev => prev.filter(f => f.timestamp !== newFeedback.timestamp));
    }, duration);
  };

  const toggleFlashlight = async () => {
    if (!videoRef.current) return;
    
    try {
      const stream = videoRef.current.srcObject as MediaStream;
      if (!stream) return;
      
      const track = stream.getVideoTracks()[0];
      if (!track) return;
      
      const capabilities = track.getCapabilities();
      if (!capabilities || !('torch' in capabilities)) {
        addFeedback('warning', 'Esta cámara no soporta linterna');
        return;
      }
      
      const newFlashlightState = !flashlightEnabled;
      await track.applyConstraints({
        advanced: [{ torch: newFlashlightState } as any]
      });
      
      setFlashlightEnabled(newFlashlightState);
      addFeedback('info', newFlashlightState ? 'Linterna activada' : 'Linterna desactivada', 1500);
    } catch (error) {
      console.error('Error toggling flashlight:', error);
      addFeedback('error', 'Error al controlar la linterna');
    }
  };

  const adjustZoom = async (newZoom: number) => {
    if (!videoRef.current) return;
    
    try {
      const stream = videoRef.current.srcObject as MediaStream;
      if (!stream) return;
      
      const track = stream.getVideoTracks()[0];
      if (!track) return;
      
      const capabilities = track.getCapabilities();
      if (!capabilities || !('zoom' in capabilities)) {
        addFeedback('warning', 'Esta cámara no soporta zoom digital');
        return;
      }
      
      const zoomRange = capabilities.zoom as { min: number; max: number };
      const clampedZoom = Math.max(zoomRange.min, Math.min(zoomRange.max, newZoom));
      
      await track.applyConstraints({
        advanced: [{ zoom: clampedZoom } as any]
      });
      
      setZoomLevel(clampedZoom);
      addFeedback('info', `Zoom: ${clampedZoom.toFixed(1)}x`, 1500);
    } catch (error) {
      console.error('Error adjusting zoom:', error);
      addFeedback('error', 'Error al ajustar el zoom');
    }
  };

  const findBestCamera = (cameras: MediaDeviceInfo[]): number => {
    // Use configured default camera if available
    if (state.config.defaultCameraId) {
      const configuredCameraIndex = cameras.findIndex(camera => camera.deviceId === state.config.defaultCameraId);
      if (configuredCameraIndex !== -1) {
        return configuredCameraIndex;
      }
    }
    
    // Use configured camera preference if available (legacy support)
    if (state.config.cameraPreference !== undefined && state.config.cameraPreference < cameras.length) {
      return state.config.cameraPreference;
    }
    
    // Prefer back camera
    const backCamera = cameras.findIndex(camera => 
      camera.label.toLowerCase().includes('back') || 
      camera.label.toLowerCase().includes('posterior') ||
      camera.label.toLowerCase().includes('trasera')
    );
    
    if (backCamera !== -1) return backCamera;
    
    // Fallback to first camera
    return 0;
  };

  const initializeScanner = async () => {
    try {
      if (!codeReaderRef.current) {
        codeReaderRef.current = new BrowserMultiFormatReader();
      }

      // Get available cameras
      const devices = await navigator.mediaDevices.enumerateDevices();
      const cameras = devices.filter(device => device.kind === 'videoinput');
      setAvailableCameras(cameras);

      if (cameras.length === 0) {
        showError(
          'No hay cámaras disponibles',
          'No se encontraron cámaras en tu dispositivo. Verifica que tengas una cámara conectada.'
        );
        return;
      }

      // Verificar si las cámaras han sido verificadas en configuración
      const hasVerifiedCameras = cameras.some(camera => camera.label && camera.label !== '');
      
      if (!hasVerifiedCameras) {
        showConfirm(
          'Verificar cámaras',
          'Para usar el escáner múltiple, primero debes verificar las cámaras disponibles en la configuración. ¿Quieres ir a la configuración ahora?',
          () => {
            // Cerrar el modal del escáner y abrir la configuración
            onClose();
            // Abrir configuración automáticamente
            setTimeout(() => {
              // Buscar y hacer clic en el botón de configuración apropiado
              const isMobile = window.innerWidth < 768;
              const configButton = document.querySelector(
                isMobile ? '[data-mobile-config]' : '[data-desktop-config]'
              ) as HTMLElement;
              
              if (configButton) {
                configButton.click();
              } else {
                // Fallback: buscar cualquier botón de configuración
                const fallbackButton = document.querySelector('[data-config-button]') as HTMLElement;
                if (fallbackButton) {
                  fallbackButton.click();
                }
              }
            }, 100);
          },
          () => {
            // Continuar sin verificar (usar la primera cámara disponible)
            continueInitialization(cameras);
          },
          'Ir a Configuración',
          'Continuar sin verificar'
        );
        return;
      }

      continueInitialization(cameras);
    } catch (error) {
      console.error('Error initializing scanner:', error);
      showError(
        'Error al inicializar el escáner',
        'No se pudo acceder a la cámara. Verifica los permisos de cámara en tu navegador.'
      );
    }
  };

  const continueInitialization = async (cameras: MediaDeviceInfo[]) => {
    try {
      const bestCameraIndex = findBestCamera(cameras);
      setCurrentCamera(bestCameraIndex);

      // Request camera permissions with specific device
      await navigator.mediaDevices.getUserMedia({ 
        video: { 
          deviceId: cameras[bestCameraIndex].deviceId,
          width: { ideal: 1280 },
          height: { ideal: 720 }
        } 
      });

      setIsInitialized(true);
      addFeedback('success', 'Escáner inicializado correctamente', 2000);
    } catch (error) {
      console.error('Error continuing initialization:', error);
      showError(
        'Error al acceder a la cámara',
        'No se pudo obtener acceso a la cámara. Verifica que hayas dado permisos de cámara al navegador.'
      );
    }
  };

  const startScanning = async () => {
    if (!codeReaderRef.current || !videoRef.current || !isInitialized) return;

    try {
      setIsScanning(true);
      addFeedback('info', 'Iniciando escaneo...', 1500);
      
      await codeReaderRef.current.decodeFromVideoDevice(
        availableCameras[currentCamera]?.deviceId || null,
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
      addFeedback('error', 'Error al iniciar el escáner');
    }
  };

  const stopScanning = () => {
    if (codeReaderRef.current) {
      codeReaderRef.current.reset();
    }
    setIsScanning(false);
    addFeedback('info', 'Escaneo detenido', 1500);
    
    if (scanningTimeoutRef.current) {
      clearTimeout(scanningTimeoutRef.current);
      scanningTimeoutRef.current = null;
    }
  };

  const switchCamera = async () => {
    if (availableCameras.length <= 1) {
      addFeedback('warning', 'Solo hay una cámara disponible');
      return;
    }

    const nextCamera = (currentCamera + 1) % availableCameras.length;
    setCurrentCamera(nextCamera);
    
    // Update camera preference in config
    dispatch({ type: 'SET_CAMERA_PREFERENCE', payload: nextCamera });
    
    addFeedback('info', `Cambiando a cámara ${nextCamera + 1}`, 1500);
    
    // Restart scanning with new camera
    if (isScanning) {
      stopScanning();
      setTimeout(() => {
        startScanning();
      }, 500);
    }
  };

  const handleScannedCode = async (scannedCode: string) => {
    // Check if book already exists using ref for real-time detection
    if (scannedBooksRef.current.some(book => book.isbn === scannedCode)) {
      addFeedback('warning', 'Este libro ya fue escaneado');
      
      // Add delay to prevent multiple scans of the same code even for duplicates
      if (scanningTimeoutRef.current) {
        clearTimeout(scanningTimeoutRef.current);
      }
      
      scanningTimeoutRef.current = setTimeout(() => {
        // Resume scanning after delay
      }, 3000); // 3 second delay for duplicates
      
      return;
    }

    // Check if book already exists in the library
    const existingBook = state.libros.find(libro => libro.isbn === scannedCode);
    if (existingBook) {
      addFeedback('warning', `Libro ya existe en biblioteca: ${existingBook.titulo}`);
      
      // Add delay to prevent multiple scans of the same code even for duplicates
      if (scanningTimeoutRef.current) {
        clearTimeout(scanningTimeoutRef.current);
      }
      
      scanningTimeoutRef.current = setTimeout(() => {
        // Resume scanning after delay
      }, 3000); // 3 second delay for duplicates
      
      return;
    }

    // Add delay to prevent multiple scans of the same code
    if (scanningTimeoutRef.current) {
      clearTimeout(scanningTimeoutRef.current);
    }

    const newBook: ScannedBook = {
      id: generateUniqueId(),
      isbn: scannedCode,
      titulo: '',
      autor: '',
      paginas: '',
      sagaName: '',
      status: 'loading'
    };

    setScannedBooks(prev => {
      const newBooks = [...prev, newBook];
      // Update ref for real-time duplicate detection
      scannedBooksRef.current = newBooks;
      return newBooks;
    });
    addFeedback('info', `Escaneado: ${scannedCode}`, 2000);

    try {
      if (!validateISBN(scannedCode)) {
        setScannedBooks(prev => prev.map(book => 
          book.id === newBook.id 
            ? { ...book, status: 'error', errorMessage: 'ISBN inválido' }
            : book
        ));
        addFeedback('error', 'ISBN inválido');
        return;
      }

      const bookData = await fetchBookData(scannedCode);
      
      if (bookData) {
        // Check for duplicates by title and author
        const duplicateByTitle = state.libros.find(libro => 
          libro.titulo.toLowerCase() === bookData.titulo.toLowerCase() &&
          (!bookData.autor || !libro.autor || 
           libro.autor.toLowerCase() === bookData.autor.toLowerCase())
        );
        
        if (duplicateByTitle) {
          setScannedBooks(prev => prev.map(book => 
            book.id === newBook.id 
              ? {
                  ...book,
                  titulo: bookData.titulo,
                  autor: bookData.autor || '',
                  paginas: bookData.paginas?.toString() || '',
                  status: 'error',
                  errorMessage: `Duplicado: ${duplicateByTitle.titulo} (${duplicateByTitle.estado})`,
                  bookData
                }
              : book
          ));
          addFeedback('warning', `Libro duplicado: ${bookData.titulo}`);
        } else {
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
          addFeedback('success', `Encontrado: ${bookData.titulo}`, 2000);
        }
      } else {
        setScannedBooks(prev => prev.map(book => 
          book.id === newBook.id 
            ? { ...book, status: 'error', errorMessage: 'No se encontró información' }
            : book
        ));
        addFeedback('warning', 'No se encontró información del libro');
      }
    } catch (error) {
      setScannedBooks(prev => prev.map(book => 
        book.id === newBook.id 
          ? { ...book, status: 'error', errorMessage: 'Error al buscar información' }
          : book
      ));
      addFeedback('error', 'Error al buscar información');
    }

    // Add delay to prevent multiple scans of the same code
    scanningTimeoutRef.current = setTimeout(() => {
      // Resume scanning after delay
    }, 3000); // 3 second delay

    // Stop scanning if in single mode
    if (scanMode === 'single') {
      stopScanning();
    }
  };

  const updateBook = (id: number, updates: Partial<ScannedBook>) => {
    setScannedBooks(prev => {
      const newBooks = prev.map(book => 
        book.id === id ? { ...book, ...updates } : book
      );
      // Update ref for real-time duplicate detection
      scannedBooksRef.current = newBooks;
      return newBooks;
    });
  };

  const removeBook = (id: number) => {
    setScannedBooks(prev => {
      const newBooks = prev.filter(book => book.id !== id);
      // Update ref for real-time duplicate detection
      scannedBooksRef.current = newBooks;
      return newBooks;
    });
    setSelectedBooks(prev => {
      const newSet = new Set(prev);
      newSet.delete(id);
      return newSet;
    });
    addFeedback('info', 'Libro eliminado de la lista');
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
        id: generateUniqueId(),
        titulo: book.titulo,
        autor: book.autor,
        paginas: parseInt(book.paginas) || undefined,
        sagaName: book.sagaName || undefined,
        isbn: book.isbn,
        fechaAgregado: Date.now(),
        estado: 'tbr',
        historialEstados: [{
          estado: 'tbr',
          fecha: Date.now()
        }],
        lecturas: [],
        // Include image URLs and access info from bookData if available
        smallThumbnail: book.bookData?.smallThumbnail,
        thumbnail: book.bookData?.thumbnail,
        viewability: book.bookData?.viewability,
        webReaderLink: book.bookData?.webReaderLink,
        // Include other book data fields
        editorial: book.bookData?.editorial,
        idioma: book.bookData?.idioma,
        descripcion: book.bookData?.descripcion,
        categorias: book.bookData?.categorias,
        publicacion: book.bookData?.publicacion,
        genero: book.bookData?.genero
      }));

    if (booksToAdd.length > 0) {
      booksToAdd.forEach(book => {
        dispatch({ type: 'ADD_BOOK', payload: book });
      });
      addFeedback('success', `${booksToAdd.length} libros agregados a la TBR`, 3000);
      onBooksAdded(booksToAdd);
      onClose();
    } else {
      addFeedback('warning', 'No hay libros seleccionados para agregar');
    }
  };

  const addAllBooks = () => {
    const validBooks = scannedBooks.filter(book => book.status === 'found');
    setSelectedBooks(new Set(validBooks.map(book => book.id)));
    addFeedback('info', `${validBooks.length} libros seleccionados`);
  };

  const clearSelection = () => {
    setSelectedBooks(new Set());
    addFeedback('info', 'Selección limpiada');
  };

  const handleCloseModal = async () => {
    // Turn off flashlight before closing
    if (flashlightEnabled && videoRef.current) {
      try {
        const stream = videoRef.current.srcObject as MediaStream;
        if (stream) {
          const track = stream.getVideoTracks()[0];
          if (track) {
            await track.applyConstraints({
              advanced: [{ torch: false } as any]
            });
          }
        }
      } catch (error) {
        console.error('Error turning off flashlight:', error);
      }
    }

    stopScanning();
    setScannedBooks([]);
    setEditingBook(null);
    setSelectedBooks(new Set());
    setShowBooksList(false);
    setFeedbackMessages([]);
    setFlashlightEnabled(false);
    onClose();
  };

  useEffect(() => {
    if (isOpen) {
      initializeScanner();
      // Initialize ref with empty array
      scannedBooksRef.current = [];
    } else {
      handleCloseModal();
    }
  }, [isOpen]);

  // Detect mode changes and restart scanner
  useEffect(() => {
    if (isOpen && isInitialized && scanMode !== previousScanMode) {
      // Stop current scanning
      if (isScanning) {
        stopScanning();
      }
      
      // Update previous mode
      setPreviousScanMode(scanMode);
      
      // Restart scanning with new mode after a short delay
      setTimeout(() => {
        if (isOpen) {
          startScanning();
        }
      }, 500);
    }
  }, [scanMode, isOpen, isInitialized, isScanning]);

  if (!isOpen) return null;

  return (
    <>
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
        className="relative bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center space-x-2">
            <Barcode className="h-5 w-5 text-primary-500" />
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
              Escaneo Múltiple
            </h3>
            <span className="text-sm text-slate-500 dark:text-slate-400">
              ({scannedBooks.length} libros)
            </span>
          </div>
          <button
            onClick={handleCloseModal}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors duration-200"
          >
            <X className="h-5 w-5 text-slate-500" />
          </button>
        </div>

        <div className="flex flex-col h-[calc(90vh-80px)]">
          {/* Scanner Section */}
          <div className="relative bg-black">
            <video
              ref={videoRef}
              className="w-full h-64 object-cover"
              muted
            />
            
            {/* Scanning Overlay */}
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

            {/* Camera Controls */}
            <div className="absolute top-4 right-4 flex flex-col space-y-2">
              <button
                onClick={toggleFlashlight}
                className={`p-2 rounded-lg transition-colors duration-200 ${
                  flashlightEnabled 
                    ? 'bg-yellow-500 text-white' 
                    : 'bg-white/20 text-white hover:bg-white/30'
                }`}
              >
                <Zap className="h-4 w-4" />
              </button>
              
              {availableCameras.length > 1 && (
                <button
                  onClick={switchCamera}
                  className="p-2 rounded-lg bg-white/20 text-white hover:bg-white/30 transition-colors duration-200"
                >
                  <RotateCcw className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Zoom Controls */}
            <div className="absolute bottom-4 right-4 bg-white/20 backdrop-blur-sm rounded-lg p-2">
              <div className="flex flex-col space-y-2">
                <button
                  onClick={() => adjustZoom(zoomLevel + 0.5)}
                  className="p-1 rounded bg-white/20 text-white hover:bg-white/30"
                >
                  +
                </button>
                <span className="text-white text-xs text-center">{zoomLevel.toFixed(1)}x</span>
                <button
                  onClick={() => adjustZoom(zoomLevel - 0.5)}
                  className="p-1 rounded bg-white/20 text-white hover:bg-white/30"
                >
                  -
                </button>
              </div>
            </div>

            {/* Feedback Messages */}
            <div className="absolute top-4 left-4 space-y-2">
              {feedbackMessages.map((feedback) => (
                <motion.div
                  key={feedback.timestamp}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className={`px-3 py-2 rounded-lg text-sm font-medium backdrop-blur-sm ${
                    feedback.type === 'success' ? 'bg-green-500/90 text-white' :
                    feedback.type === 'error' ? 'bg-red-500/90 text-white' :
                    feedback.type === 'warning' ? 'bg-yellow-500/90 text-white' :
                    'bg-blue-500/90 text-white'
                  }`}
                >
                  {feedback.message}
                </motion.div>
              ))}
            </div>
          </div>

          {/* Controls Section */}
          <div className="p-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-700/50">
            <div className="flex flex-wrap items-center justify-between gap-3">
              {/* Mode Selection */}
              <div className="flex space-x-2">
                <button
                  onClick={() => setScanMode('single')}
                  className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors duration-200 ${
                    scanMode === 'single' 
                      ? 'bg-primary-500 text-white' 
                      : 'bg-slate-200 dark:bg-slate-600 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  Individual
                </button>
                <button
                  onClick={() => setScanMode('continuous')}
                  className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors duration-200 ${
                    scanMode === 'continuous' 
                      ? 'bg-primary-500 text-white' 
                      : 'bg-slate-200 dark:bg-slate-600 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  Continuo
                </button>
              </div>

              {/* Scanner Controls */}
              <div className="flex space-x-2">
                <button
                  onClick={isScanning ? stopScanning : startScanning}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center space-x-2 ${
                    isScanning 
                      ? 'bg-red-500 hover:bg-red-600 text-white' 
                      : 'bg-primary-500 hover:bg-primary-600 text-white'
                  }`}
                >
                  {isScanning ? (
                    <>
                      <CameraOff className="h-4 w-4" />
                      <span>Detener</span>
                    </>
                  ) : (
                    <>
                      <Camera className="h-4 w-4" />
                      <span>Iniciar</span>
                    </>
                  )}
                </button>
              </div>

              {/* Books List Toggle */}
              <div className="flex space-x-2">
                <button
                  onClick={() => setShowBooksList(!showBooksList)}
                  className="px-3 py-2 bg-slate-500 hover:bg-slate-600 text-white rounded-lg font-medium transition-colors duration-200 flex items-center space-x-2"
                >
                  <List className="h-4 w-4" />
                  <span>Lista ({scannedBooks.length})</span>
                </button>
              </div>
            </div>
          </div>

          {/* Books List Panel */}
          {showBooksList && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="border-t border-slate-200 dark:border-slate-700 overflow-hidden"
            >
              <div className="p-4 bg-slate-50 dark:bg-slate-700/50">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-medium text-slate-900 dark:text-white">
                    Libros Escaneados
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
                
                <div className="flex items-center space-x-2 text-sm text-slate-600 dark:text-slate-400 mb-3">
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

              <div className="max-h-64 overflow-y-auto p-4 space-y-3 scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-600 scrollbar-track-transparent">
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
                                type="number"
                                value={book.paginas}
                                onChange={(e) => updateBook(book.id, { paginas: e.target.value })}
                                className="w-full px-2 py-1 text-sm border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                                placeholder="Páginas"
                                min="1"
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
            </motion.div>
          )}
        </div>
      </motion.div>
    </motion.div>

    {/* Dialog for camera verification */}
    {dialog && (
      <Dialog
        isOpen={dialog.isOpen}
        title={dialog.title}
        message={dialog.message}
        type={dialog.type}
        onConfirm={dialog.onConfirm}
        onCancel={dialog.onCancel}
        onClose={hideDialog}
        confirmText={dialog.confirmText}
        cancelText={dialog.cancelText}
      />
    )}
  </>
  );
};

export default BulkScanModal;