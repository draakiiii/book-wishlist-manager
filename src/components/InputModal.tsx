import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, AlertCircle } from 'lucide-react';

export interface InputModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  placeholder?: string;
  defaultValue?: string;
  onConfirm: (value: string) => void;
  confirmText?: string;
  cancelText?: string;
  type?: 'text' | 'number';
  required?: boolean;
}

const InputModal: React.FC<InputModalProps> = ({
  isOpen,
  onClose,
  title,
  message,
  placeholder = '',
  defaultValue = '',
  onConfirm,
  confirmText = 'Aceptar',
  cancelText = 'Cancelar',
  type = 'text',
  required = false
}) => {
  const [value, setValue] = useState(defaultValue);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setValue(defaultValue);
      setError('');
    }
  }, [isOpen, defaultValue]);

  const handleConfirm = () => {
    if (required && !value.trim()) {
      setError('Este campo es obligatorio');
      return;
    }
    
    onConfirm(value);
    onClose();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleConfirm();
    }
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
        className="relative bg-white dark:bg-slate-800 rounded-xl shadow-2xl max-w-md w-full mx-4 border border-slate-200 dark:border-slate-700"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center space-x-3">
            <AlertCircle className="h-6 w-6 text-blue-500" />
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
              {title}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors duration-200"
          >
            <X className="h-5 w-5 text-slate-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4">
          <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
            {message}
          </p>
          
          <input
            type={type}
            value={value}
            onChange={(e) => {
              setValue(e.target.value);
              if (error) setError('');
            }}
            onKeyPress={handleKeyPress}
            placeholder={placeholder}
            className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              error ? 'border-red-500' : 'border-slate-300 dark:border-slate-600'
            }`}
            autoFocus
          />
          
          {error && (
            <p className="text-red-500 text-sm mt-2 flex items-center space-x-1">
              <AlertCircle className="h-4 w-4" />
              <span>{error}</span>
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-3 p-4 border-t border-slate-200 dark:border-slate-700">
          <button
            onClick={onClose}
            className="px-4 py-2 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg font-medium transition-colors duration-200"
          >
            {cancelText}
          </button>
          <button
            onClick={handleConfirm}
            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors duration-200"
          >
            {confirmText}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default InputModal;