import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trophy, X } from 'lucide-react';
import { useAppState } from '../context/FirebaseAppStateContext';

interface SagaCompletionNotificationProps {
  sagaName: string;
  onClose: () => void;
}

const SagaCompletionNotification: React.FC<SagaCompletionNotificationProps> = ({
  sagaName,
  onClose
}) => {
  const { state } = useAppState();

  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 5000); // Auto-close after 5 seconds

    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0, y: -50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -50, scale: 0.9 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="fixed top-4 right-4 z-50 max-w-sm w-full"
    >
      <div className="bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg shadow-2xl border border-green-400 overflow-hidden">
        <div className="p-4">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <div className="p-2 bg-white/20 rounded-lg">
                <Trophy className="h-5 w-5" />
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-semibold">
                ¡Saga Completada!
              </h3>
              <p className="text-green-100 mt-1">
                Has terminado la saga "{sagaName}"
              </p>
              <p className="text-green-200 text-sm mt-2">
                ¡Felicidades por completar esta saga!
              </p>
            </div>
            <button
              onClick={onClose}
              className="flex-shrink-0 p-1 hover:bg-white/20 rounded transition-colors duration-200"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
        
        {/* Progress bar */}
        <div className="h-1 bg-white/20">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: "100%" }}
            transition={{ duration: 5, ease: "linear" }}
            className="h-full bg-white"
          />
        </div>
      </div>
    </motion.div>
  );
};

export default SagaCompletionNotification; 