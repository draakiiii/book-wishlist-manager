import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { X, Camera, Zap, ZapOff, RotateCcw, Focus, AlertCircle, CheckCircle, BookOpen } from 'lucide-react';
import { BrowserMultiFormatReader, Result } from '@zxing/library';

interface ScannerModalProps {
  onClose: () => void;
  onScan: (result: string) => void;
}

interface ScanFeedback {
  type: 'info' | 'success' | 'error' | 'warning';
  message: string;
  timestamp: number;
}

const ScannerModal: React.FC<ScannerModalProps> = ({ onClose, onScan }) => {
  const [statusMessage, setStatusMessage] = useState('Iniciando cámara...');
  const [isScanning, setIsScanning] = useState(false);
  const [showTorchButton, setShowTorchButton] = useState(false);
  const [isTorchOn, setIsTorchOn] = useState(false);
  const [scanAttempts, setScanAttempts] = useState(0);
  const [lastScanTime, setLastScanTime] = useState<Date | null>(null);
  const [cameraDevices, setCameraDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedCamera, setSelectedCamera] = useState<string>('');
  const [currentStream, setCurrentStream] = useState<MediaStream | null>(null);
  const [feedbackMessages, setFeedbackMessages] = useState<ScanFeedback[]>([]);
  const [isFocusing, setIsFocusing] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const scannerRef = useRef<BrowserMultiFormatReader | null>(null);
  const feedbackTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const addFeedback = useCallback((type: ScanFeedback['type'], message: string) => {
    // Clear existing timeout
    if (feedbackTimeoutRef.current) {
      clearTimeout(feedbackTimeoutRef.current);
    }

    const newFeedback: ScanFeedback = {
      type,
      message,
      timestamp: Date.now()
    };
    
    setFeedbackMessages(prev => {
      // Only keep the latest 3 messages to prevent stacking
      const updated = [newFeedback, ...prev.slice(0, 2)];
      return updated;
    });
    
    // Auto-remove after 2 seconds
    feedbackTimeoutRef.current = setTimeout(() => {
      setFeedbackMessages(prev => prev.filter(f => f.timestamp !== newFeedback.timestamp));
    }, 2000);
  }, [feedbackTimeoutRef]);

  const handleScanResult = useCallback((result: string) => {
    addFeedback('success', `¡ISBN detectado: ${result}`);
    setLastScanTime(new Date());
    onScan(result);
  }, [onScan]);

  const handleCloseModal = useCallback(() => {
    // Stop scanner
    if (scannerRef.current) {
      scannerRef.current.reset();
      scannerRef.current = null;
    }
    
    // Stop stream
    if (currentStream) {
      currentStream.getTracks().forEach(track => track.stop());
      setCurrentStream(null);
    }
    
    // Clear video
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    
    // Clear feedback timeout
    if (feedbackTimeoutRef.current) {
      clearTimeout(feedbackTimeoutRef.current);
    }
    
    // Reset states
    setIsInitialized(false);
    setIsScanning(false);
    
    onClose();
  }, [currentStream, onClose]);

  // Get available cameras - only once
  useEffect(() => {
    const getCameras = async () => {
      try {
        addFeedback('info', 'Detectando cámaras...');
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = devices.filter(device => device.kind === 'videoinput');
        setCameraDevices(videoDevices);
        
        // Prefer back camera on mobile
        const backCamera = videoDevices.find(device => 
          device.label.toLowerCase().includes('back') || 
          device.label.toLowerCase().includes('posterior') ||
          device.label.toLowerCase().includes('environment')
        );
        
        const selectedId = backCamera?.deviceId || videoDevices[0]?.deviceId || '';
        setSelectedCamera(selectedId);
        
        if (backCamera) {
          addFeedback('info', `Cámara trasera seleccionada`);
        } else {
          addFeedback('info', `Cámara seleccionada`);
        }
      } catch (error) {
        console.error('Error getting cameras:', error);
        addFeedback('error', 'Error al detectar cámaras');
      }
    };
    
    getCameras();
    
    // Cleanup function
    return () => {
      if (scannerRef.current) {
        scannerRef.current.reset();
        scannerRef.current = null;
      }
      if (currentStream) {
        currentStream.getTracks().forEach(track => track.stop());
      }
    };
  }, []); // Only run once

  // Initialize camera and scanner - only when camera changes
  useEffect(() => {
    if (!selectedCamera || !videoRef.current || isInitialized) return;

    const initCamera = async () => {
      try {
        addFeedback('info', 'Iniciando cámara...');
        setStatusMessage('Iniciando cámara...');
        setIsScanning(false);
        
        // Stop previous stream and scanner
        if (currentStream) {
          currentStream.getTracks().forEach(track => track.stop());
        }
        if (scannerRef.current) {
          scannerRef.current.reset();
          scannerRef.current = null;
        }

        // Get camera stream with better constraints for mobile
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            deviceId: selectedCamera,
            width: { ideal: 1920, min: 1280 },
            height: { ideal: 1080, min: 720 },
            facingMode: 'environment',
            focusMode: 'continuous',
            exposureMode: 'continuous',
            whiteBalanceMode: 'continuous'
          } as any
        });

        setCurrentStream(stream);
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          
          // Wait for video to be ready
          await new Promise((resolve) => {
            if (videoRef.current) {
              videoRef.current.onloadedmetadata = resolve;
            }
          });
        }

        addFeedback('success', 'Cámara iniciada');
        setStatusMessage('Apunta la cámara al código ISBN');
        setIsScanning(true);
        setIsInitialized(true);
        
        // Check for torch capability
        checkTorchCapability(stream);
        
        // Start scanning with ZXing
        startZXingScanner(stream);

      } catch (error: unknown) {
        console.error('Camera error:', error);
        if ((error as any).name === 'NotAllowedError') {
          addFeedback('error', 'Permiso de cámara denegado');
          setStatusMessage('Error: Has denegado el permiso para usar la cámara.');
        } else {
          addFeedback('error', 'Error al iniciar la cámara');
          setStatusMessage('Error: No se pudo iniciar la cámara.');
        }
      }
    };

    initCamera();

    return () => {
      if (scannerRef.current) {
        scannerRef.current.reset();
      }
      if (currentStream) {
        currentStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [selectedCamera]);

  const checkTorchCapability = async (stream: MediaStream) => {
    try {
      const track = stream.getVideoTracks()[0];
      const capabilities = track.getCapabilities();
      
      if (capabilities && 'torch' in capabilities) {
        setShowTorchButton(true);
        addFeedback('info', 'Flash disponible');
      }
    } catch (error) {
      console.log('Torch not available');
    }
  };

  const startZXingScanner = async (stream: MediaStream) => {
    if (!videoRef.current) return;

    try {
      addFeedback('info', 'Iniciando detector...');
      
      // Create new scanner instance
      scannerRef.current = new BrowserMultiFormatReader();
      
      // Wait a bit for video to be fully ready
      await new Promise(resolve => setTimeout(resolve, 500));

      addFeedback('success', 'Detector iniciado - Escaneando...');
      
      // Start decoding
      if (videoRef.current) {
        scannerRef.current.decodeFromVideoDevice(
          selectedCamera,
          videoRef.current,
          (result: Result | null, error: any) => {
            if (result) {
              const scannedText = result.getText();
              
              // Validate ISBN format
              if (isValidISBN(scannedText)) {
                addFeedback('success', `¡ISBN detectado: ${scannedText}`);
                setScanAttempts(prev => prev + 1);
                handleScanResult(scannedText);
              } else {
                addFeedback('warning', `Código detectado pero no es ISBN válido: ${scannedText}`);
                setScanAttempts(prev => prev + 1);
              }
            } else if (error && error.name !== 'NotFoundException') {
              // Only log errors, don't show feedback for every scan attempt
              console.error('Scan error:', error);
            } else {
              // This is called for every scan attempt - just increment counter
              setScanAttempts(prev => prev + 1);
            }
          }
        );
      }

    } catch (error) {
      console.error('ZXing scanner error:', error);
      addFeedback('error', 'Error al iniciar detector');
    }
  };

  const isValidISBN = (text: string): boolean => {
    // Remove any non-numeric characters except 'X' (valid in ISBN-10)
    const cleanText = text.replace(/[^0-9X]/gi, '');
    
    // Check if it's a valid ISBN-10 or ISBN-13
    if (cleanText.length === 10) {
      // ISBN-10 validation
      let sum = 0;
      for (let i = 0; i < 9; i++) {
        sum += parseInt(cleanText[i]) * (10 - i);
      }
      const lastChar = cleanText[9].toUpperCase();
      const checkDigit = lastChar === 'X' ? 10 : parseInt(lastChar);
      sum += checkDigit;
      return sum % 11 === 0;
    } else if (cleanText.length === 13) {
      // ISBN-13 validation
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

  const handleToggleTorch = async () => {
    if (!currentStream) return;
    
    try {
      setIsFocusing(true);
      const track = currentStream.getVideoTracks()[0];
      const newTorchState = !isTorchOn;
      
      await track.applyConstraints({
        advanced: [{ torch: newTorchState } as any]
      });
      
      setIsTorchOn(newTorchState);
      addFeedback('success', newTorchState ? 'Flash activado' : 'Flash desactivado');
    } catch (error) {
      console.error('Error toggling torch:', error);
      addFeedback('error', 'Error al cambiar flash');
    } finally {
      setIsFocusing(false);
    }
  };

  const handleSwitchCamera = async () => {
    if (cameraDevices.length < 2) return;
    
    try {
      addFeedback('info', 'Cambiando cámara...');
      
      // Reset initialization state
      setIsInitialized(false);
      
      // Stop current stream and scanner
      if (currentStream) {
        currentStream.getTracks().forEach(track => track.stop());
        setCurrentStream(null);
      }
      if (scannerRef.current) {
        scannerRef.current.reset();
        scannerRef.current = null;
      }
      
      // Clear video element
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
      
      const currentIndex = cameraDevices.findIndex(device => device.deviceId === selectedCamera);
      const nextIndex = (currentIndex + 1) % cameraDevices.length;
      const nextCamera = cameraDevices[nextIndex];
      
      // Add a small delay to ensure cleanup is complete
      setTimeout(() => {
        setSelectedCamera(nextCamera.deviceId);
        addFeedback('info', `Cambiado a: ${nextCamera.label}`);
      }, 100);
    } catch (error) {
      console.error('Error switching camera:', error);
      addFeedback('error', 'Error al cambiar cámara');
    }
  };

  const handleTapToFocus = async () => {
    if (!currentStream) return;
    
    try {
      setIsFocusing(true);
      addFeedback('info', 'Ajustando enfoque...');
      
      const track = currentStream.getVideoTracks()[0];
      
      // Try different focus modes
      const focusModes = ['manual', 'continuous', 'auto'];
      
      for (const mode of focusModes) {
        try {
          await track.applyConstraints({
            focusMode: mode as any,
            focusDistance: mode === 'manual' ? 0.1 : undefined
          } as any);
          
          addFeedback('success', `Enfoque ajustado: ${mode}`);
          break;
        } catch (e) {
          console.log(`Focus mode ${mode} not supported`);
        }
      }
    } catch (error) {
      console.error('Error focusing:', error);
      addFeedback('error', 'Error al ajustar enfoque');
    } finally {
      setIsFocusing(false);
    }
  };

  const formatScanStats = () => {
    if (scanAttempts === 0) return '';
    
    const timeElapsed = (Date.now() - (lastScanTime?.getTime() || Date.now())) / 1000;
    const attemptsPerSecond = scanAttempts / Math.max(1, timeElapsed);
    return `${scanAttempts} intentos (${attemptsPerSecond.toFixed(1)}/s)`;
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
      onClick={handleCloseModal}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="relative bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center space-x-2">
            <BookOpen className="h-5 w-5 text-primary-500" />
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
              Escanear ISBN
            </h3>
          </div>
          <button
            onClick={handleCloseModal}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors duration-200"
          >
            <X className="h-5 w-5 text-slate-500" />
          </button>
        </div>

        {/* Scanner Content */}
        <div className="p-4 space-y-4">
          {/* Video Container */}
          <div className="relative bg-slate-900 rounded-lg overflow-hidden aspect-video">
            <video 
              ref={videoRef}
              className="w-full h-full object-cover"
              autoPlay
              playsInline
              muted
            />
            
            {/* Scanner Overlay */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-48 h-32 border-2 border-white rounded-lg relative">
                {/* Corner indicators */}
                <div className="absolute top-0 left-0 w-6 h-6 border-l-4 border-t-4 border-primary-500 rounded-tl-lg"></div>
                <div className="absolute top-0 right-0 w-6 h-6 border-r-4 border-t-4 border-primary-500 rounded-tr-lg"></div>
                <div className="absolute bottom-0 left-0 w-6 h-6 border-l-4 border-b-4 border-primary-500 rounded-bl-lg"></div>
                <div className="absolute bottom-0 right-0 w-6 h-6 border-r-4 border-b-4 border-primary-500 rounded-br-lg"></div>
              </div>
            </div>

            {/* Camera Controls Overlay */}
            <div className="absolute top-2 right-2 flex space-x-2">
              {cameraDevices.length > 1 && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleSwitchCamera}
                  className="p-2 bg-black/50 hover:bg-black/70 text-white rounded-lg transition-colors duration-200"
                >
                  <RotateCcw className="h-4 w-4" />
                </motion.button>
              )}
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleTapToFocus}
                disabled={isFocusing}
                className="p-2 bg-black/50 hover:bg-black/70 disabled:bg-black/30 text-white rounded-lg transition-colors duration-200"
              >
                <Focus className={`h-4 w-4 ${isFocusing ? 'animate-spin' : ''}`} />
              </motion.button>
            </div>
          </div>

          {/* Feedback Messages - Limited to 3 */}
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

          {/* Status Message */}
          <div className="text-center space-y-2">
            <p className="text-sm text-slate-600 dark:text-slate-400">
              {statusMessage}
            </p>
            {formatScanStats() && (
              <p className="text-xs text-slate-500 dark:text-slate-500">
                {formatScanStats()}
              </p>
            )}
          </div>

          {/* Controls */}
          <div className="flex space-x-3">
            {showTorchButton && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleToggleTorch}
                disabled={isFocusing}
                className="flex-1 px-4 py-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 disabled:bg-slate-50 dark:disabled:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center space-x-2"
              >
                {isTorchOn ? (
                  <>
                    <ZapOff className="h-4 w-4" />
                    <span>Apagar Flash</span>
                  </>
                ) : (
                  <>
                    <Zap className="h-4 w-4" />
                    <span>Activar Flash</span>
                  </>
                )}
              </motion.button>
            )}
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleCloseModal}
              className="flex-1 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-colors duration-200"
            >
              Cancelar
            </motion.button>
          </div>

          {/* Instructions */}
          <div className="text-center space-y-2">
            <p className="text-xs text-slate-500 dark:text-slate-500">
              Coloca el código ISBN dentro del marco para escanear
            </p>
            <p className="text-xs text-slate-400 dark:text-slate-600">
              Toca el botón de enfoque si la imagen está borrosa
            </p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default ScannerModal; 