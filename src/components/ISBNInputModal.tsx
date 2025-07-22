import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, BookOpen, Search, AlertCircle, CheckCircle } from 'lucide-react';

interface ISBNInputModalProps {
  onClose: () => void;
  onSearch: (isbn: string) => void;
}

interface SearchFeedback {
  type: 'info' | 'success' | 'error' | 'warning';
  message: string;
  timestamp: number;
}

const ISBNInputModal: React.FC<ISBNInputModalProps> = ({ onClose, onSearch }) => {
  const [isbn, setIsbn] = useState('');
  const [isValid, setIsValid] = useState<boolean | null>(null);
  const [feedbackMessages, setFeedbackMessages] = useState<SearchFeedback[]>([]);

  const addFeedback = (type: SearchFeedback['type'], message: string) => {
    const newFeedback: SearchFeedback = {
      type,
      message,
      timestamp: Date.now()
    };
    
    setFeedbackMessages(prev => {
      // Only keep the latest 3 messages
      const updated = [newFeedback, ...prev.slice(0, 2)];
      return updated;
    });
    
    // Auto-remove after 3 seconds
    setTimeout(() => {
      setFeedbackMessages(prev => prev.filter(f => f.timestamp !== newFeedback.timestamp));
    }, 3000);
  };

  const validateISBN = (text: string): boolean => {
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

  const handleISBNChange = (value: string) => {
    // Only allow numbers and X
    const cleanValue = value.replace(/[^0-9X]/gi, '').toUpperCase();
    setIsbn(cleanValue);
    
    if (cleanValue.length >= 10) {
      const valid = validateISBN(cleanValue);
      setIsValid(valid);
      
      if (valid) {
        addFeedback('success', 'ISBN válido detectado');
      } else {
        addFeedback('warning', 'Formato de ISBN no válido');
      }
    } else {
      setIsValid(null);
    }
  };

  const handleSearch = () => {
    if (!isbn.trim()) {
      addFeedback('error', 'Por favor ingresa un ISBN');
      return;
    }
    
    if (!isValid) {
      addFeedback('error', 'El ISBN ingresado no es válido');
      return;
    }
    
    addFeedback('info', 'Buscando información del libro...');
    onSearch(isbn.trim());
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleCloseModal = () => {
    onClose();
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
              Buscar por ISBN
            </h3>
          </div>
          <button
            onClick={handleCloseModal}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors duration-200"
          >
            <X className="h-5 w-5 text-slate-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {/* ISBN Input */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
              Número ISBN
            </label>
            <div className="relative">
              <input
                type="text"
                value={isbn}
                onChange={(e) => handleISBNChange(e.target.value)}
                onKeyPress={handleKeyPress}
                className={`w-full px-4 py-3 border rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors duration-200 text-lg font-mono ${
                  isValid === true ? 'border-green-500' :
                  isValid === false ? 'border-red-500' :
                  'border-slate-300 dark:border-slate-600'
                }`}
                placeholder="Ej: 9788445077528"
                maxLength={17}
                autoFocus
              />
              {isValid === true && (
                <CheckCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-green-500" />
              )}
              {isValid === false && (
                <AlertCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-red-500" />
              )}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Ingresa el código ISBN de 10 o 13 dígitos del libro
            </p>
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
                  <Search className="h-4 w-4" />
                )}
                <span>{feedback.message}</span>
              </motion.div>
            ))}
          </div>

          {/* Instructions */}
          <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-3">
            <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              ¿Dónde encontrar el ISBN?
            </h4>
            <ul className="text-xs text-slate-600 dark:text-slate-400 space-y-1">
              <li>• En la contraportada del libro</li>
              <li>• En la página de derechos de autor</li>
              <li>• En el código de barras (números debajo)</li>
              <li>• Puede tener 10 o 13 dígitos</li>
            </ul>
          </div>

          {/* Actions */}
          <div className="flex space-x-3">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleSearch}
              disabled={!isValid || !isbn.trim()}
              className="flex-1 px-4 py-2 bg-primary-500 hover:bg-primary-600 disabled:bg-primary-400 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors duration-200 flex items-center justify-center space-x-2"
            >
              <Search className="h-4 w-4" />
              <span>Buscar Libro</span>
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleCloseModal}
              className="flex-1 px-4 py-2 bg-slate-500 hover:bg-slate-600 text-white rounded-lg font-medium transition-colors duration-200"
            >
              Cancelar
            </motion.button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default ISBNInputModal;