import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { ChevronDown, Plus } from 'lucide-react';
import { useAppState } from '../context/AppStateContext';

interface SagaAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

const SagaAutocomplete: React.FC<SagaAutocompleteProps> = ({
  value,
  onChange,
  placeholder = "Ej: El Señor de los Anillos",
  className = ""
}) => {
  const { state, dispatch } = useAppState();
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState(value);
  const [filteredSagas, setFilteredSagas] = useState(state.sagas);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Filtrar sagas basado en el input
  useEffect(() => {
    if (inputValue.trim() === '') {
      setFilteredSagas(state.sagas);
    } else {
      const filtered = state.sagas.filter(saga =>
        saga.name.toLowerCase().includes(inputValue.toLowerCase())
      );
      setFilteredSagas(filtered);
    }
  }, [inputValue, state.sagas]);

  // Manejar clic fuera del componente
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    onChange(newValue);
    setIsOpen(true);
  };

  const handleSagaSelect = (sagaName: string) => {
    setInputValue(sagaName);
    onChange(sagaName);
    setIsOpen(false);
  };

  const handleCreateNewSaga = () => {
    if (inputValue.trim() && !state.sagas.find(s => s.name === inputValue.trim())) {
      dispatch({ type: 'ADD_SAGA', payload: { name: inputValue.trim() } });
    }
    setIsOpen(false);
  };

  const handleInputFocus = () => {
    setIsOpen(true);
  };

  const handleInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsOpen(false);
    } else if (e.key === 'Enter' && isOpen) {
      e.preventDefault();
      const exactMatch = state.sagas.find(s => s.name.toLowerCase() === inputValue.toLowerCase());
      if (exactMatch) {
        handleSagaSelect(exactMatch.name);
      } else if (inputValue.trim()) {
        handleCreateNewSaga();
      }
    }
  };

  const hasExactMatch = state.sagas.some(s => s.name.toLowerCase() === inputValue.toLowerCase());
  const showCreateOption = inputValue.trim() !== '' && !hasExactMatch;

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          onKeyDown={handleInputKeyDown}
          className="w-full px-3 py-2 pr-10 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-secondary-500 focus:border-transparent transition-colors duration-200"
          placeholder={placeholder}
        />
        <div className="absolute inset-y-0 right-0 flex items-center pr-3">
          <ChevronDown 
            className={`h-4 w-4 text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} 
          />
        </div>
      </div>

      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10, scale: 0.95 }}
          transition={{ duration: 0.15 }}
          className="absolute z-50 w-full mt-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg max-h-60 overflow-y-auto"
        >
          {filteredSagas.length > 0 && (
            <div className="py-1">
              {filteredSagas.map((saga) => (
                <motion.button
                  key={saga.id}
                  whileHover={{ backgroundColor: 'rgba(59, 130, 246, 0.1)' }}
                  onClick={() => handleSagaSelect(saga.name)}
                  className="w-full px-3 py-2 text-left text-slate-700 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-slate-700 transition-colors duration-150 flex items-center justify-between"
                >
                  <span className="truncate">{saga.name}</span>
                  <span className="text-xs text-slate-500 dark:text-slate-400 ml-2">
                    {saga.count} libros
                  </span>
                </motion.button>
              ))}
            </div>
          )}
          
          {showCreateOption && (
            <div className="border-t border-slate-200 dark:border-slate-700">
              <motion.button
                whileHover={{ backgroundColor: 'rgba(34, 197, 94, 0.1)' }}
                onClick={handleCreateNewSaga}
                className="w-full px-3 py-2 text-left text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors duration-150 flex items-center space-x-2"
              >
                <Plus className="h-4 w-4" />
                <span>Crear nueva saga: "{inputValue}"</span>
              </motion.button>
            </div>
          )}
          
          {filteredSagas.length === 0 && !showCreateOption && (
            <div className="py-2 px-3 text-sm text-slate-500 dark:text-slate-400">
              No hay sagas disponibles
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
};

export default SagaAutocomplete; 