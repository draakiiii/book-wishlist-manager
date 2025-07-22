import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { X, Camera, CameraOff, RotateCcw, AlertCircle, CheckCircle, Loader2, Zap } from 'lucide-react';
import { BrowserMultiFormatReader, Result } from '@zxing/library';
import { useAppState } from '../context/AppStateContext';

interface BarcodeScannerModalProps {
  onClose: () => void;
  onScanSuccess: (isbn: string) => void;
}

interface ScanFeedback {
  type: 'info' | 'success' | 'error' | 'warning';
  message: string;
  timestamp: number;
}

const BarcodeScannerModal: React.FC<BarcodeScannerModalProps> = ({ onClose, onScanSuccess }) => {
  const { state, dispatch } = useAppState();
  const [isScanning, setIsScanning] = useState(false);
  const [currentCamera, setCurrentCamera] = useState(0);
  const [availableCameras, setAvailableCameras] = useState<MediaDeviceInfo[]>([]);
  const [feedbackMessages, setFeedbackMessages] = useState<ScanFeedback[]>([]);
  const [lastScannedCode, setLastScannedCode] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  const [flashlightEnabled, setFlashlightEnabled] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const codeReaderRef = useRef<BrowserMultiFormatReader | null>(null);
  const scanningTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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
      if (!stream) {
        addFeedback('warning', 'No hay stream de cámara activo');
        return;
      }
      
      const track = stream.getVideoTracks()[0];
      if (!track) {
        addFeedback('warning', 'No se pudo acceder a la cámara');
        return;
      }
      
      const capabilities = track.getCapabilities();
      if (!capabilities || !('torch' in capabilities)) {
        addFeedback('warning', 'Esta cámara no tiene linterna', 2000);
        return;
      }
      
      const newFlashlightState = !flashlightEnabled;
      await track.applyConstraints({
        advanced: [{ torch: newFlashlightState } as any]
      });
      
      setFlashlightEnabled(newFlashlightState);
      addFeedback('success', newFlashlightState ? '💡 Flash activado' : '💡 Flash desactivado', 1500);
    } catch (error) {
      console.error('Error toggling flashlight:', error);
      addFeedback('error', 'Error al controlar la linterna');
      setFlashlightEnabled(false); // Reset state on error
    }
  };

  const adjustZoom = async (delta: number) => {
    if (!videoRef.current) return;
    
    try {
      const stream = videoRef.current.srcObject as MediaStream;
      if (!stream) return;
      
      const track = stream.getVideoTracks()[0];
      if (!track) return;
      
      const capabilities = track.getCapabilities();
      if (!capabilities || !('zoom' in capabilities)) {
        if (zoomLevel === 1) { // Only show warning once
          addFeedback('warning', 'Esta cámara no soporta zoom');
        }
        return;
      }
      
      const zoomRange = capabilities.zoom as { min: number; max: number };
      const newZoom = zoomLevel + delta;
      const clampedZoom = Math.max(zoomRange.min, Math.min(zoomRange.max, newZoom));
      
      // Don't apply if zoom hasn't changed
      if (clampedZoom === zoomLevel) {
        if (clampedZoom >= zoomRange.max) {
          addFeedback('info', 'Zoom máximo alcanzado', 1000);
        } else if (clampedZoom <= zoomRange.min) {
          addFeedback('info', 'Zoom mínimo alcanzado', 1000);
        }
        return;
      }
      
      await track.applyConstraints({
        advanced: [{ zoom: clampedZoom } as any]
      });
      
      setZoomLevel(clampedZoom);
      // Only show feedback for significant changes
      if (Math.abs(delta) >= 0.5) {
        addFeedback('info', `Zoom: ${clampedZoom.toFixed(1)}x`, 1000);
      }
    } catch (error) {
      console.error('Error adjusting zoom:', error);
      addFeedback('error', 'Error al ajustar el zoom');
    }
  };

  const validateISBN = (text: string): boolean => {
    const cleanText = text.replace(/[^0-9X]/gi, '');
    
    if (cleanText.length === 10) {
      let sum = 0;
      for (let i = 0; i < 9; i++) {
        sum += parseInt(cleanText[i]) * (10 - i);
      }
      const lastChar = cleanText[9].toUpperCase();
      const checkDigit = lastChar === 'X' ? 10 : parseInt(lastChar);
      sum += checkDigit;
      return sum % 11 === 0;
    } else if (cleanText.length === 13) {
      let sum = 0;
      for (let i = 0; i < 12; i++) {
        sum += parseInt(cleanText[i]) * (i % 2 === 0 ? 1 : 3);
      }
      const checkDigit = parseInt(cleanText[12]);
      const calculatedCheck = (10 - (sum % 10)) % 10;
      return checkDigit === calculatedCheck;
    }
    
    return false;
  };

  const initializeScanner = async () => {
    try {
      if (isInitialized) return;
      
      if (!codeReaderRef.current) {
        codeReaderRef.current = new BrowserMultiFormatReader();
      }

      // Get available cameras
      const devices = await navigator.mediaDevices.enumerateDevices();
      const cameras = devices.filter(device => device.kind === 'videoinput');
      setAvailableCameras(cameras);

      if (cameras.length === 0) {
        addFeedback('error', 'No se encontraron cámaras disponibles');
        return;
      }

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
      console.error('Error initializing scanner:', error);
      addFeedback('error', 'Error al inicializar el escáner');
    }
  };

  const findBestCamera = (cameras: MediaDeviceInfo[]): number => {
    // Use configured camera preference if available
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

  const startScanning = async () => {
    if (!codeReaderRef.current || !videoRef.current || !isInitialized) return;

    try {
      setIsScanning(true);
      addFeedback('info', 'Iniciando escaneo...', 1500);
      
      await codeReaderRef.current.decodeFromVideoDevice(
        availableCameras[currentCamera]?.deviceId || null,
        videoRef.current,
        (result: Result | null, error: any) => {
          if (result) {
            const scannedCode = result.getText();
            
            // Prevent duplicate scans
            if (scannedCode === lastScannedCode) return;
            
            setLastScannedCode(scannedCode);
            addFeedback('success', `Código detectado: ${scannedCode}`, 2000);
            
            // Add to scan history
            const allBooks = [
              ...state.tbr,
              ...state.historial,
              ...state.wishlist,
              ...state.librosActuales
            ];
            const existingBook = allBooks.find(book => book.isbn === scannedCode);
            
            if (state.config.scanHistoryEnabled) {
              dispatch({
                type: 'ADD_SCAN_HISTORY',
                payload: {
                  id: Date.now(),
                  isbn: scannedCode,
                  titulo: existingBook?.titulo,
                  autor: existingBook?.autor,
                  timestamp: Date.now(),
                  success: validateISBN(scannedCode),
                  errorMessage: validateISBN(scannedCode) ? undefined : 'ISBN inválido'
                }
              });
            }
            
            // Validate ISBN
            if (validateISBN(scannedCode)) {
              setIsProcessing(true);
              addFeedback('success', 'ISBN válido detectado. Procesando...', 1500);
              
              // Stop scanning
              stopScanning();
              
              // Process the ISBN and close modal
              setTimeout(() => {
                onScanSuccess(scannedCode);
                onClose();
              }, 1500);
            } else {
              addFeedback('warning', 'Código detectado pero no es un ISBN válido', 2000);
            }
          }
          
          if (error) {
            // Only log errors that are not "no code found" errors
            if (error.name !== 'NotFoundException' && 
                error.name !== 'NoMultiFormatReaderWasFoundException' &&
                !error.message?.includes('No MultiFormat Readers were able to detect')) {
              console.error('Scanning error:', error);
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
    setFlashlightEnabled(false);
    onClose();
  };

  useEffect(() => {
    initializeScanner();
    
    // Keyboard shortcuts
    const handleKeyPress = (event: KeyboardEvent) => {
      if (isProcessing) return;
      
      switch (event.key.toLowerCase()) {
        case ' ': // Space bar to toggle scanning
        case 'enter':
          event.preventDefault();
          if (isScanning) {
            stopScanning();
          } else {
            startScanning();
          }
          break;
        case 'f': // F for flashlight
          event.preventDefault();
          toggleFlashlight();
          break;
        case 'c': // C for camera switch
          event.preventDefault();
          switchCamera();
          break;
        case '+':
        case '=':
          event.preventDefault();
          adjustZoom(0.5);
          break;
        case '-':
        case '_':
          event.preventDefault();
          adjustZoom(-0.5);
          break;
        case 'escape':
          event.preventDefault();
          handleCloseModal();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    
    return () => {
      stopScanning();
      document.removeEventListener('keydown', handleKeyPress);
    };
  }, [isScanning, isProcessing, flashlightEnabled, zoomLevel]);

  // Only start scanning when cameras are available and not already scanning
  useEffect(() => {
    if (availableCameras.length > 0 && !isScanning && isInitialized) {
      startScanning();
    }
  }, [availableCameras, currentCamera, isInitialized]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm"
      onClick={handleCloseModal}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="relative bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-2xl w-full mx-4 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center space-x-2">
            <Camera className="h-5 w-5 text-primary-500" />
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
              Escanear Código de Barras
            </h3>
          </div>
          <button
            onClick={handleCloseModal}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors duration-200"
          >
            <X className="h-5 w-5 text-slate-500" />
          </button>
        </div>

        {/* Camera View */}
        <div className="relative bg-black">
          <video
            ref={videoRef}
            className="w-full h-64 object-cover"
            autoPlay
            playsInline
            muted
          />
          
          {/* Camera Controls */}
          <div className="absolute top-4 right-4 flex flex-col space-y-2">
            {/* Flashlight Button */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={toggleFlashlight}
              disabled={isProcessing}
              className={`p-3 rounded-full backdrop-blur-sm transition-all duration-200 ${
                flashlightEnabled 
                  ? 'bg-yellow-500 text-white shadow-lg shadow-yellow-500/30' 
                  : 'bg-white/20 text-white hover:bg-white/30'
              }`}
            >
              <Zap className="h-5 w-5" />
            </motion.button>
            
            {/* Camera Switch Button */}
            {availableCameras.length > 1 && (
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={switchCamera}
                disabled={isProcessing}
                className="p-3 rounded-full bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm transition-all duration-200"
              >
                <RotateCcw className="h-5 w-5" />
              </motion.button>
            )}
          </div>

          {/* Zoom Controls */}
          <div className="absolute bottom-4 right-4 bg-white/20 backdrop-blur-sm rounded-lg p-2">
            <div className="flex flex-col space-y-2">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => adjustZoom(0.5)}
                disabled={isProcessing}
                className="p-2 rounded bg-white/20 text-white hover:bg-white/30 transition-colors duration-200 font-mono font-bold text-lg"
              >
                +
              </motion.button>
              <span className="text-white text-xs text-center font-mono bg-black/50 rounded px-2 py-1 min-w-[3rem]">
                {zoomLevel.toFixed(1)}x
              </span>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => adjustZoom(-0.5)}
                disabled={isProcessing}
                className="p-2 rounded bg-white/20 text-white hover:bg-white/30 transition-colors duration-200 font-mono font-bold text-lg"
              >
                -
              </motion.button>
            </div>
          </div>
          
          {/* Camera Status Indicators */}
          <div className="absolute top-4 left-4 flex flex-col space-y-2">
            {/* Camera Info */}
            {availableCameras.length > 0 && (
              <div className="bg-black/50 backdrop-blur-sm rounded-lg px-3 py-2">
                <div className="text-white text-xs">
                  <div className="font-medium">Cámara {currentCamera + 1}/{availableCameras.length}</div>
                  <div className="text-slate-300 text-xs truncate max-w-32">
                    {availableCameras[currentCamera]?.label || 'Sin nombre'}
                  </div>
                </div>
              </div>
            )}
            
            {/* Flash Status */}
            {flashlightEnabled && (
              <div className="bg-yellow-500/90 backdrop-blur-sm rounded-lg px-3 py-2">
                <div className="text-white text-xs font-medium flex items-center space-x-1">
                  <Zap className="h-3 w-3" />
                  <span>Flash ON</span>
                </div>
              </div>
            )}
          </div>

          {/* Scanning Overlay */}
          {isScanning && !isProcessing && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative">
                {/* Scanning Frame */}
                <div className="w-56 h-36 border-2 border-primary-400 rounded-lg relative shadow-lg">
                  <div className="absolute -top-1 -left-1 w-6 h-6 border-l-4 border-t-4 border-primary-500 rounded-tl"></div>
                  <div className="absolute -top-1 -right-1 w-6 h-6 border-r-4 border-t-4 border-primary-500 rounded-tr"></div>
                  <div className="absolute -bottom-1 -left-1 w-6 h-6 border-l-4 border-b-4 border-primary-500 rounded-bl"></div>
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 border-r-4 border-b-4 border-primary-500 rounded-br"></div>
                  
                  {/* Scanning Line */}
                  <motion.div 
                    className="absolute left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-primary-400 to-transparent"
                    animate={{ y: [0, 140, 0] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  />
                  
                  {/* Center crosshair */}
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                    <div className="w-4 h-4 border border-primary-400 rounded-full bg-primary-500/20"></div>
                  </div>
                </div>
                
                {/* Instructions */}
                <motion.div 
                  className="mt-6 text-center"
                  animate={{ opacity: [0.7, 1, 0.7] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <p className="text-white text-sm font-medium drop-shadow-lg">
                    📚 Enfoca el código de barras
                  </p>
                  <p className="text-slate-300 text-xs mt-1 drop-shadow">
                    Mantén estable para mejor lectura
                  </p>
                </motion.div>
              </div>
            </div>
          )}

          {/* Not Scanning Overlay */}
          {!isScanning && !isProcessing && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <div className="text-center">
                <Camera className="h-12 w-12 text-white/70 mx-auto mb-4" />
                <p className="text-white text-lg font-medium mb-2">Escáner Listo</p>
                <p className="text-slate-300 text-sm">Presiona "Iniciar Escaneo" para comenzar</p>
                <div className="mt-4 flex items-center justify-center space-x-4 text-white/60 text-xs">
                  <div className="flex items-center space-x-1">
                    <Zap className="h-3 w-3" />
                    <span>Flash</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <RotateCcw className="h-3 w-3" />
                    <span>Cámara</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <span className="font-mono">±</span>
                    <span>Zoom</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Processing Overlay */}
          {isProcessing && (
            <div className="absolute inset-0 bg-black/80 flex items-center justify-center">
              <div className="text-center">
                <Loader2 className="h-12 w-12 text-primary-500 animate-spin mx-auto mb-4" />
                <p className="text-white text-lg font-medium">Procesando ISBN...</p>
                <p className="text-slate-300 text-sm mt-2">Verificando información del libro</p>
              </div>
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="p-4 space-y-4">
          {/* Camera Controls */}
          <div className="flex justify-center">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                if (isScanning) {
                  stopScanning();
                } else {
                  startScanning();
                }
              }}
              disabled={isProcessing}
              className={`px-6 py-3 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center space-x-2 ${
                isScanning 
                  ? 'bg-red-500 hover:bg-red-600 text-white' 
                  : 'bg-primary-500 hover:bg-primary-600 text-white'
              }`}
            >
              {isScanning ? (
                <>
                  <CameraOff className="h-5 w-5" />
                  <span>Detener Escaneo</span>
                </>
              ) : (
                <>
                  <Camera className="h-5 w-5" />
                  <span>Iniciar Escaneo</span>
                </>
              )}
            </motion.button>
          </div>



          {/* Feedback Messages */}
          <div className="space-y-2 max-h-32 overflow-y-auto">
            {feedbackMessages.slice(0, 3).map((feedback) => (
              <motion.div
                key={feedback.timestamp}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className={`flex items-center space-x-2 p-2 rounded-lg text-sm ${
                  feedback.type === 'success' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' :
                  feedback.type === 'error' ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400' :
                  feedback.type === 'warning' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400' :
                  'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
                }`}
              >
                {feedback.type === 'success' ? (
                  <CheckCircle className="h-4 w-4" />
                ) : feedback.type === 'error' ? (
                  <AlertCircle className="h-4 w-4" />
                ) : (
                  <Camera className="h-4 w-4" />
                )}
                <span>{feedback.message}</span>
              </motion.div>
            ))}
          </div>

          {/* Instructions */}
          <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-3">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  💡 Consejos para escanear:
                </h4>
                <ul className="text-xs text-slate-600 dark:text-slate-400 space-y-1">
                  <li>• Buena iluminación es clave</li>
                  <li>• Mantén el código estable en el marco</li>
                  <li>• Distancia óptima: 10-30 cm</li>
                  <li>• Compatible con ISBN 10 y 13 dígitos</li>
                  <li>• Usa la linterna en lugares oscuros</li>
                </ul>
              </div>
              <div>
                <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  ⌨️ Atajos de teclado:
                </h4>
                <ul className="text-xs text-slate-600 dark:text-slate-400 space-y-1">
                  <li>• <kbd className="px-1 py-0.5 bg-slate-200 dark:bg-slate-600 rounded text-xs">Espacio</kbd> - Iniciar/Detener</li>
                  <li>• <kbd className="px-1 py-0.5 bg-slate-200 dark:bg-slate-600 rounded text-xs">F</kbd> - Flash</li>
                  <li>• <kbd className="px-1 py-0.5 bg-slate-200 dark:bg-slate-600 rounded text-xs">C</kbd> - Cambiar cámara</li>
                  <li>• <kbd className="px-1 py-0.5 bg-slate-200 dark:bg-slate-600 rounded text-xs">+/-</kbd> - Zoom</li>
                  <li>• <kbd className="px-1 py-0.5 bg-slate-200 dark:bg-slate-600 rounded text-xs">Esc</kbd> - Cerrar</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Camera Info */}
          {availableCameras.length > 0 && (
            <div className="text-center text-xs text-slate-500 dark:text-slate-400">
              <div className="mb-1">
                Cámara {currentCamera + 1} de {availableCameras.length}
              </div>
              <div className="text-xs">
                {availableCameras[currentCamera]?.label || 'Cámara sin nombre'}
              </div>
              {availableCameras.length > 1 && (
                <div className="mt-1 text-xs text-slate-400">
                  Usa "Cambiar Cámara" si no enfoca bien
                </div>
              )}
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default BarcodeScannerModal;