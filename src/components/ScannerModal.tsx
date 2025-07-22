import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { X, Camera, Zap, ZapOff, RotateCcw, Focus } from 'lucide-react';
import { Html5Qrcode, Html5QrcodeScanType, Html5QrcodeSupportedFormats } from 'html5-qrcode';

interface ScannerModalProps {
  onClose: () => void;
  onScan: (result: string) => void;
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
  
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const videoElementRef = useRef<HTMLDivElement>(null);

  const handleScanResult = useCallback((result: string) => {
    setStatusMessage('¡Código detectado!');
    setLastScanTime(new Date());
    onScan(result);
  }, [onScan]);

  const handleCloseModal = useCallback(() => {
    if (scannerRef.current) {
      scannerRef.current.stop().then(() => {
        scannerRef.current = null;
      }).catch(console.error);
    }
    onClose();
  }, [onClose]);

  // Get available cameras
  useEffect(() => {
    const getCameras = async () => {
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = devices.filter(device => device.kind === 'videoinput');
        setCameraDevices(videoDevices);
        
        // Prefer back camera on mobile
        const backCamera = videoDevices.find(device => 
          device.label.toLowerCase().includes('back') || 
          device.label.toLowerCase().includes('posterior') ||
          device.label.toLowerCase().includes('environment')
        );
        
        setSelectedCamera(backCamera?.deviceId || videoDevices[0]?.deviceId || '');
      } catch (error) {
        console.error('Error getting cameras:', error);
      }
    };
    
    getCameras();
  }, []);

  useEffect(() => {
    const initScanner = async () => {
      if (!videoElementRef.current || !selectedCamera) return;

      try {
        setStatusMessage('Iniciando cámara...');
        setIsScanning(false);
        
        scannerRef.current = new Html5Qrcode('scanner-container');
        
        const config = {
          fps: 10,
          qrbox: { width: 250, height: 150 },
          aspectRatio: 1.0,
          supportedScanTypes: [
            Html5QrcodeScanType.SCAN_TYPE_CAMERA
          ],
          formatsToSupport: [
            Html5QrcodeSupportedFormats.EAN_13,
            Html5QrcodeSupportedFormats.EAN_8,
            Html5QrcodeSupportedFormats.UPC_A,
            Html5QrcodeSupportedFormats.UPC_E,
            Html5QrcodeSupportedFormats.CODE_128,
            Html5QrcodeSupportedFormats.CODE_39,
            Html5QrcodeSupportedFormats.ITF,
            Html5QrcodeSupportedFormats.QR_CODE
          ]
        };

        await scannerRef.current.start(
          { deviceId: selectedCamera },
          config,
          (decodedText, decodedResult) => {
            setScanAttempts(prev => prev + 1);
            setStatusMessage(`Detectando: ${decodedText.substring(0, 20)}...`);
            handleScanResult(decodedText);
          },
          (errorMessage) => {
            // This is called for every scan attempt, even when no barcode is found
            setScanAttempts(prev => prev + 1);
            if (errorMessage.includes('NotFoundException')) {
              setStatusMessage('Apunta la cámara al código de barras');
            } else {
              console.log('Scan error:', errorMessage);
            }
          }
        );

        setIsScanning(true);
        setStatusMessage('Apunta la cámara al código de barras');
        
        // Check for torch capability
        checkTorchCapability();

      } catch (error: unknown) {
        console.error('Scanner error:', error);
        if ((error as any).name === 'NotAllowedError') {
          setStatusMessage('Error: Has denegado el permiso para usar la cámara.');
        } else {
          setStatusMessage('Error: No se pudo iniciar la cámara.');
        }
      }
    };

    if (selectedCamera) {
      initScanner();
    }

    return () => {
      if (scannerRef.current) {
        scannerRef.current.stop().catch(console.error);
      }
    };
  }, [selectedCamera, handleScanResult]);

  const checkTorchCapability = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { deviceId: selectedCamera } 
      });
      const track = stream.getVideoTracks()[0];
      const capabilities = track.getCapabilities();
      
      if (capabilities && 'torch' in capabilities) {
        setShowTorchButton(true);
      }
      
      // Stop the test stream
      stream.getTracks().forEach(track => track.stop());
    } catch (error) {
      console.log('Torch not available');
    }
  };

  const handleToggleTorch = async () => {
    if (!scannerRef.current) return;
    
    try {
      const newTorchState = !isTorchOn;
      await scannerRef.current.applyVideoConstraints({
        advanced: [{ torch: newTorchState } as any]
      });
      setIsTorchOn(newTorchState);
    } catch (error) {
      console.error('Error toggling torch:', error);
    }
  };

  const handleSwitchCamera = async () => {
    if (!scannerRef.current || cameraDevices.length < 2) return;
    
    try {
      await scannerRef.current.stop();
      const currentIndex = cameraDevices.findIndex(device => device.deviceId === selectedCamera);
      const nextIndex = (currentIndex + 1) % cameraDevices.length;
      setSelectedCamera(cameraDevices[nextIndex].deviceId);
    } catch (error) {
      console.error('Error switching camera:', error);
    }
  };

  const handleTapToFocus = async () => {
    if (!scannerRef.current) return;
    
    try {
      await scannerRef.current.applyVideoConstraints({
        focusMode: 'manual',
        focusDistance: 0.1
      } as any);
      setStatusMessage('Enfoque ajustado');
    } catch (error) {
      console.error('Error focusing:', error);
    }
  };

  const formatScanStats = () => {
    if (scanAttempts === 0) return '';
    
    const attemptsPerSecond = scanAttempts / Math.max(1, (Date.now() - (lastScanTime?.getTime() || Date.now())) / 1000);
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
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
            Escanear Código de Barras
          </h3>
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
            <div 
              id="scanner-container"
              ref={videoElementRef}
              className="w-full h-full"
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
                className="p-2 bg-black/50 hover:bg-black/70 text-white rounded-lg transition-colors duration-200"
              >
                <Focus className="h-4 w-4" />
              </motion.button>
            </div>
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
                className="flex-1 px-4 py-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center space-x-2"
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
              Coloca el código de barras dentro del marco para escanear
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