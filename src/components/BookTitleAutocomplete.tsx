import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Search, BookOpen, Loader2, Star } from 'lucide-react';
import { searchBooksByTitle } from '../services/googleBooksAPI';
import { BookData } from '../types';

interface BookTitleAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  onBookSelect?: (bookData: BookData) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  disableAutocomplete?: boolean;
}

const BookTitleAutocomplete: React.FC<BookTitleAutocompleteProps> = ({
  value,
  onChange,
  onBookSelect,
  placeholder = "Ej: El Hobbit",
  className = "",
  disabled = false,
  disableAutocomplete = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState(value);
  const [suggestions, setSuggestions] = useState<BookData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [debouncedValue, setDebouncedValue] = useState(value);
  const [justSelected, setJustSelected] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Sync internal state with prop value
  useEffect(() => {
    setInputValue(value);
    setDebouncedValue(value);
  }, [value]);

  // Debounce the search to avoid too many API calls
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(inputValue);
    }, 300);

    return () => clearTimeout(timer);
  }, [inputValue]);

  // Search for books when debounced value changes
  useEffect(() => {
    const searchBooks = async () => {
      if (disabled || disableAutocomplete || debouncedValue.trim().length < 2 || justSelected) {
        setSuggestions([]);
        setIsOpen(false);
        return;
      }

      setIsLoading(true);
      try {
        const results = await searchBooksByTitle(debouncedValue);
        setSuggestions(results);
        setIsOpen(results.length > 0);
      } catch (error) {
        console.error('Error searching books:', error);
        setSuggestions([]);
        setIsOpen(false);
      } finally {
        setIsLoading(false);
      }
    };

    searchBooks();
  }, [debouncedValue, disabled, disableAutocomplete, justSelected]);

  // Handle click outside
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
    if (disabled) return;
    
    const newValue = e.target.value;
    setInputValue(newValue);
    onChange(newValue);
    
    // Reset justSelected flag when user starts typing manually
    if (justSelected) {
      setJustSelected(false);
    }
    
    // Close autocomplete if disabled
    if (disableAutocomplete) {
      setIsOpen(false);
    }
  };

  const handleBookSelect = (book: BookData) => {
    setInputValue(book.titulo);
    setDebouncedValue(book.titulo); // Set debounced value to prevent re-search
    setJustSelected(true); // Mark that we just selected a book
    onChange(book.titulo);
    setIsOpen(false);
    
    if (onBookSelect) {
      onBookSelect(book);
    }
    
    // Reset the justSelected flag after a longer delay to prevent immediate re-opening
    setTimeout(() => {
      setJustSelected(false);
    }, 2000);
  };

  const handleInputFocus = () => {
    if (disabled || disableAutocomplete || justSelected) return;
    
    // Only show suggestions if user is actively typing and there are suggestions
    if (inputValue.trim().length >= 2 && suggestions.length > 0) {
      setIsOpen(true);
    }
  };

  const handleInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsOpen(false);
    } else if (e.key === 'Enter' && isOpen && suggestions.length > 0) {
      e.preventDefault();
      handleBookSelect(suggestions[0]);
    }
  };

  const formatBookInfo = (book: BookData) => {
    const info: string[] = [];
    if (book.autor) info.push(book.autor);
    if (book.paginas) info.push(`${book.paginas} págs`);
    if (book.publicacion) info.push(book.publicacion.toString());
    return info.join(' • ');
  };

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
          disabled={disabled}
          className={`w-full px-3 py-2 pr-10 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-warning-500 focus:border-transparent transition-colors duration-200 text-sm ${
            disabled ? 'opacity-50 cursor-not-allowed' : ''
          }`}
          placeholder={disabled ? 'Libro detectado por escáner' : placeholder}
        />
        <div className="absolute inset-y-0 right-0 flex items-center pr-3">
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin text-warning-500" />
          ) : (
            <Search className="h-4 w-4 text-slate-400" />
          )}
        </div>
      </div>

      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.15 }}
          className="absolute z-50 w-full mt-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg max-h-80 overflow-y-auto"
        >
          {suggestions.length > 0 && (
            <div className="py-1">
              {suggestions.map((book, index) => (
                <motion.button
                  key={index}
                  whileHover={{ backgroundColor: 'rgba(245, 158, 11, 0.1)' }}
                  onClick={() => handleBookSelect(book)}
                  className="w-full px-3 py-3 text-left hover:bg-warning-50 dark:hover:bg-warning-900/20 transition-colors duration-150 border-b border-slate-100 dark:border-slate-700 last:border-b-0"
                >
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 p-1.5 bg-warning-100 dark:bg-warning-900/30 rounded-lg">
                      <BookOpen className="h-4 w-4 text-warning-600 dark:text-warning-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <h4 className="text-sm font-medium text-slate-900 dark:text-white truncate">
                          {book.titulo}
                        </h4>
                        {book.calificacion && (
                          <div className="flex items-center space-x-1">
                            <Star className="h-3 w-3 text-yellow-500 fill-current" />
                            <span className="text-xs text-slate-500 dark:text-slate-400">
                              {book.calificacion.toFixed(1)}
                            </span>
                          </div>
                        )}
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-400 mb-1">
                        {formatBookInfo(book)}
                      </p>
                      {book.editorial && (
                        <p className="text-xs text-slate-500 dark:text-slate-500">
                          {book.editorial}
                        </p>
                      )}
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>
          )}
          
          {suggestions.length === 0 && !isLoading && debouncedValue.trim().length >= 2 && (
            <div className="py-4 px-3 text-center">
              <BookOpen className="h-8 w-8 text-slate-400 mx-auto mb-2" />
              <p className="text-sm text-slate-500 dark:text-slate-400">
                No se encontraron libros con ese título
              </p>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                Puedes agregarlo manualmente
              </p>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
};

export default BookTitleAutocomplete;