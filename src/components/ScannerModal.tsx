import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { X, Camera, Zap, ZapOff } from 'lucide-react';
import { BrowserMultiFormatReader } from '@zxing/library';

interface ScannerModalProps {
  onClose: () => void;
  onScan: (result: string) => void;
}

interface MediaStreamControls {
  stream: MediaStream;
}

const ScannerModal: React.FC<ScannerModalProps> = ({ onClose, onScan }) => {
  const [statusMessage, setStatusMessage] = useState('Iniciando cámara...');
  const [showTorchButton, setShowTorchButton] = useState(false);
  const [isTorchOn, setIsTorchOn] = useState(false);
  
  const readerRef = useRef<BrowserMultiFormatReader | null>(null);
  const mediaStreamControlsRef = useRef<MediaStreamControls | null>(null);

  const handleScanResult = useCallback((result: string) => {
    onScan(result);
  }, [onScan]);

  const handleCloseModal = useCallback(() => {
    if (readerRef.current) {
      readerRef.current.reset();
    }
    onClose();
  }, [onClose]);

  useEffect(() => {
    const initScanner = async () => {
      try {
        setStatusMessage('Iniciando cámara...');
        
        readerRef.current = new BrowserMultiFormatReader();
        
        const videoElement = document.getElementById('video-stream') as HTMLVideoElement;
        if (!videoElement) {
          throw new Error('Elemento de video no encontrado');
        }

        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { 
            facingMode: 'environment',
            width: { ideal: 1280 },
            height: { ideal: 720 }
          } 
        });

        videoElement.srcObject = stream;
        mediaStreamControlsRef.current = { stream };

        // Verificar capacidades de flash
        checkTorchCapability(mediaStreamControlsRef.current);

        setStatusMessage('Apunta la cámara al código de barras');

        readerRef.current.decodeFromVideoDevice(
          null,
          'video-stream',
          (result, error) => {
            if (result) {
              setStatusMessage('¡Código detectado!');
              handleScanResult(result.getText());
            } else if (error && (error as any).name !== 'NotFoundException') {
              console.error('Error de escaneo:', error);
              setStatusMessage('Error al escanear el código');
            }
          }
        );

      } catch (error: unknown) {
        console.error(error);
        if ((error as any).name === 'NotAllowedError') {
          setStatusMessage('Error: Has denegado el permiso para usar la cámara.');
        } else {
          setStatusMessage('Error: No se pudo iniciar la cámara.');
        }
      }
    };

    initScanner();

    return () => {
      if (readerRef.current) {
        readerRef.current.reset();
      }
    };
  }, [handleScanResult]); // Ahora incluye la dependencia correcta

  const checkTorchCapability = (controls: MediaStreamControls) => {
    if (controls && controls.stream) {
      const track = controls.stream.getVideoTracks()[0];
      const capabilities = track.getCapabilities();
      // Verificar si torch está disponible de forma segura
      if (capabilities && 'torch' in capabilities) {
        setShowTorchButton(true);
      }
    }
  };

  const handleToggleTorch = () => {
    if (mediaStreamControlsRef.current) {
      const track = mediaStreamControlsRef.current.stream.getVideoTracks()[0];
      const newTorchState = !isTorchOn;
      
      track.applyConstraints({ 
        advanced: [{ torch: newTorchState } as MediaTrackConstraintSet] 
      })
      .then(() => {
        setIsTorchOn(newTorchState);
      })
      .catch((e: unknown) => {
        const error = e as Error;
        console.error('Error al cambiar el estado del flash:', error);
      });
    }
  };

  const handleClose = () => {
    handleCloseModal();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
      onClick={handleClose}
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
            onClick={handleClose}
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
              id="video-stream"
              className="w-full h-full object-cover"
              autoPlay
              playsInline
              muted
            />
            
            {/* Scanner Overlay */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-48 h-32 border-2 border-white rounded-lg relative">
                {/* Corner indicators */}
                <div className="absolute top-0 left-0 w-6 h-6 border-l-4 border-t-4 border-primary-500 rounded-tl-lg"></div>
                <div className="absolute top-0 right-0 w-6 h-6 border-r-4 border-t-4 border-primary-500 rounded-tr-lg"></div>
                <div className="absolute bottom-0 left-0 w-6 h-6 border-l-4 border-b-4 border-primary-500 rounded-bl-lg"></div>
                <div className="absolute bottom-0 right-0 w-6 h-6 border-r-4 border-b-4 border-primary-500 rounded-br-lg"></div>
              </div>
            </div>
          </div>

          {/* Status Message */}
          <div className="text-center">
            <p className="text-sm text-slate-600 dark:text-slate-400">
              {statusMessage}
            </p>
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
              onClick={handleClose}
              className="flex-1 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-colors duration-200"
            >
              Cancelar
            </motion.button>
          </div>

          {/* Instructions */}
          <div className="text-center">
            <p className="text-xs text-slate-500 dark:text-slate-500">
              Coloca el código de barras dentro del marco para escanear
            </p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default ScannerModal; 