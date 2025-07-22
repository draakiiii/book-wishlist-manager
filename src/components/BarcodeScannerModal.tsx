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
      addFeedback('info', `Zoom ajustado a ${clampedZoom.toFixed(1)}x`, 1500);
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
    
    return () => {
      stopScanning();
    };
  }, []);

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
          
          {/* Scanning Overlay */}
          {isScanning && !isProcessing && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative">
                {/* Scanning Frame */}
                <div className="w-48 h-32 border-2 border-primary-500 rounded-lg relative">
                  <div className="absolute -top-1 -left-1 w-4 h-4 border-l-2 border-t-2 border-primary-500"></div>
                  <div className="absolute -top-1 -right-1 w-4 h-4 border-r-2 border-t-2 border-primary-500"></div>
                  <div className="absolute -bottom-1 -left-1 w-4 h-4 border-l-2 border-b-2 border-primary-500"></div>
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 border-r-2 border-b-2 border-primary-500"></div>
                  
                  {/* Scanning Line */}
                  <div className="absolute top-0 left-0 w-full h-0.5 bg-primary-500 animate-pulse"></div>
                </div>
                
                {/* Instructions */}
                <div className="mt-4 text-center">
                  <p className="text-white text-sm font-medium">
                    Apunta al código de barras del libro
                  </p>
                  <p className="text-slate-300 text-xs mt-1">
                    El código debe estar dentro del marco
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Processing Overlay */}
          {isProcessing && (
            <div className="absolute inset-0 bg-black/80 flex items-center justify-center">
              <div className="text-center">
                <Loader2 className="h-8 w-8 text-primary-500 animate-spin mx-auto mb-2" />
                <p className="text-white text-sm">Procesando ISBN...</p>
              </div>
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="p-4 space-y-4">
          {/* Camera Controls */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={switchCamera}
              disabled={availableCameras.length <= 1 || isProcessing}
              className="px-3 py-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 disabled:bg-slate-50 dark:disabled:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center space-x-2"
            >
              <RotateCcw className="h-4 w-4" />
              <span className="text-sm">Cámara</span>
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={toggleFlashlight}
              disabled={isProcessing}
              className={`px-3 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center space-x-2 ${
                flashlightEnabled 
                  ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 border border-yellow-300 dark:border-yellow-700' 
                  : 'bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300'
              }`}
            >
              <Zap className="h-4 w-4" />
              <span className="text-sm">Linterna</span>
            </motion.button>
            
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
              className="px-3 py-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center space-x-2"
            >
              {isScanning ? (
                <>
                  <CameraOff className="h-4 w-4" />
                  <span className="text-sm">Detener</span>
                </>
              ) : (
                <>
                  <Camera className="h-4 w-4" />
                  <span>Iniciar</span>
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
            <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Consejos para escanear:
            </h4>
            <ul className="text-xs text-slate-600 dark:text-slate-400 space-y-1">
              <li>• Asegúrate de tener buena iluminación</li>
              <li>• Mantén el código de barras estable</li>
              <li>• El código debe estar dentro del marco rojo</li>
              <li>• Funciona con códigos ISBN de 10 o 13 dígitos</li>
              <li>• Si no enfoca bien, cambia de cámara</li>
              <li>• Mantén una distancia de 10-30 cm del código</li>
            </ul>
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