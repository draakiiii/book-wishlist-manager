import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, X, UserPlus, User } from 'lucide-react';

interface LoanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (personName: string) => void;
  bookTitle: string;
}

const LoanModal: React.FC<LoanModalProps> = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  bookTitle 
}) => {
  const [personName, setPersonName] = useState('');
  const [recentPeople, setRecentPeople] = useState<string[]>([]);

  // Cargar personas recientes desde localStorage
  useEffect(() => {
    const saved = localStorage.getItem('recentLoanPeople');
    if (saved) {
      try {
        setRecentPeople(JSON.parse(saved));
      } catch (error) {
        console.error('Error loading recent people:', error);
      }
    }
  }, []);

  const handleConfirm = () => {
    if (personName.trim()) {
      // Guardar en personas recientes
      const updatedPeople = [
        personName.trim(),
        ...recentPeople.filter(p => p.toLowerCase() !== personName.trim().toLowerCase())
      ].slice(0, 5); // Mantener solo las 5 más recientes
      
      setRecentPeople(updatedPeople);
      localStorage.setItem('recentLoanPeople', JSON.stringify(updatedPeople));
      
      onConfirm(personName.trim());
      onClose();
    }
  };

  const handleCancel = () => {
    setPersonName('');
    onClose();
  };

  const selectRecentPerson = (name: string) => {
    setPersonName(name);
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
        className="relative bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center space-x-2">
            <Users className="h-5 w-5 text-purple-500" />
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
              Prestar Libro
            </h3>
          </div>
          <button
            onClick={handleCancel}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors duration-200"
          >
            <X className="h-5 w-5 text-slate-500" />
          </button>
        </div>
        
        {/* Content */}
        <div className="p-6">
          <div className="text-center mb-6">
            <h4 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
              {bookTitle}
            </h4>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              ¿A quién se lo vas a prestar?
            </p>
          </div>

          {/* Input */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Nombre de la persona
            </label>
            <input
              type="text"
              value={personName}
              onChange={(e) => setPersonName(e.target.value)}
              placeholder="Escribe el nombre..."
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              autoFocus
            />
          </div>

          {/* Recent People */}
          {recentPeople.length > 0 && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Personas recientes
              </label>
              <div className="space-y-2">
                {recentPeople.map((name, index) => (
                  <motion.button
                    key={index}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => selectRecentPerson(name)}
                    className="w-full flex items-center space-x-2 p-2 text-left hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors duration-200"
                  >
                    <User className="h-4 w-4 text-slate-500" />
                    <span className="text-sm text-slate-700 dark:text-slate-300">
                      {name}
                    </span>
                  </motion.button>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex space-x-3">
            <button
              onClick={handleCancel}
              className="flex-1 px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors duration-200"
            >
              Cancelar
            </button>
            <button
              onClick={handleConfirm}
              disabled={!personName.trim()}
              className="flex-1 px-4 py-2 bg-purple-500 hover:bg-purple-600 disabled:bg-slate-300 dark:disabled:bg-slate-600 text-white text-sm font-medium rounded-lg transition-colors duration-200 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              <UserPlus className="h-4 w-4" />
              <span>Prestar</span>
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default LoanModal;