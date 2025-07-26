import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Search, BookOpen, Loader2, Star } from 'lucide-react';
import { searchBooksByTitle } from '../services/bookAPI';
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
  const [justSelected, setJustSelected] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  
  // Referencias para manejo de debounce y cancelación de requests
  const debounceTimerRef = useRef<number | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const lastSearchQueryRef = useRef<string>('');

  // Sync internal state with prop value
  useEffect(() => {
    setInputValue(value);
    lastSearchQueryRef.current = value;
  }, [value]);

  // Función para buscar libros con cancelación de requests previos
  const searchBooks = async (query: string) => {
    if (disabled || disableAutocomplete || query.trim().length < 2 || justSelected) {
      setSuggestions([]);
      setIsOpen(false);
      return;
    }

    // Cancelar request anterior si existe
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Crear nuevo AbortController para este request
    abortControllerRef.current = new AbortController();
    const currentController = abortControllerRef.current;

    setIsLoading(true);
    
    try {
      // Verificar que este query es el más reciente antes de empezar
      if (query !== lastSearchQueryRef.current) {
        return;
      }

      const results = await searchBooksByTitle(query);
      
      // Verificar que el request no fue cancelado y que el query sigue siendo el actual
      if (!currentController.signal.aborted && query === lastSearchQueryRef.current) {
        setSuggestions(results);
        setIsOpen(results.length > 0);
      }
    } catch (error) {
      // Solo mostrar error si no fue por cancelación del request
      if (!currentController.signal.aborted) {
        console.error('Error searching books:', error);
        setSuggestions([]);
        setIsOpen(false);
      }
    } finally {
      // Solo actualizar loading state si el request no fue cancelado
      if (!currentController.signal.aborted) {
        setIsLoading(false);
      }
    }
  };

  // Función para manejar el debounce de búsqueda
  const debouncedSearch = (query: string) => {
    // Limpiar timer anterior si existe
    if (debounceTimerRef.current) {
      window.clearTimeout(debounceTimerRef.current);
    }

    // Actualizar el último query buscado
    lastSearchQueryRef.current = query;

    // Establecer nuevo timer con timeout más largo para mejor detección
    debounceTimerRef.current = window.setTimeout(() => {
      // Verificar que el query no ha cambiado antes de ejecutar la búsqueda
      if (query === lastSearchQueryRef.current) {
        searchBooks(query);
      }
    }, 500); // Aumentado de 300ms a 500ms para mejor detección de cuando el usuario termina de escribir
  };

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

  // Cleanup effect para cancelar requests y timers al desmontar
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        window.clearTimeout(debounceTimerRef.current);
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  // Handle mobile scroll behavior
  useEffect(() => {
    const scrollContainer = scrollContainerRef.current;
    
    if (!scrollContainer || !isOpen) return;

    const handleWheel = (e: WheelEvent) => {
      const scrollTop = scrollContainer.scrollTop;
      const scrollHeight = scrollContainer.scrollHeight;
      const height = scrollContainer.clientHeight;
      
      // If we're at the boundaries, let the page scroll
      if ((scrollTop <= 0 && e.deltaY < 0) || 
          (scrollTop + height >= scrollHeight && e.deltaY > 0)) {
        return;
      }
      
      // Otherwise, prevent page scroll
      e.preventDefault();
    };

    scrollContainer.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      scrollContainer.removeEventListener('wheel', handleWheel);
    };
  }, [isOpen]);

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
      return;
    }

    // Iniciar búsqueda con debounce solo si no acabamos de seleccionar un libro
    if (!justSelected) {
      debouncedSearch(newValue);
    }
  };

  const handleBookSelect = (book: BookData) => {
    // Cancelar cualquier búsqueda en progreso
    if (debounceTimerRef.current) {
      window.clearTimeout(debounceTimerRef.current);
    }
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    setInputValue(book.titulo);
    lastSearchQueryRef.current = book.titulo;
    setJustSelected(true);
    onChange(book.titulo);
    setIsOpen(false);
    setIsLoading(false);
    
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
    
    // Solo mostrar sugerencias si hay texto suficiente y ya tenemos sugerencias cargadas
    if (inputValue.trim().length >= 2 && suggestions.length > 0) {
      setIsOpen(true);
    }
  };

  const handleInputBlur = () => {
    // Don't immediately close on blur to allow clicking on suggestions
    // The click outside handler will take care of closing
  };

  const handleInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsOpen(false);
      // Cancelar búsqueda en progreso
      if (debounceTimerRef.current) {
        window.clearTimeout(debounceTimerRef.current);
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      setIsLoading(false);
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
          onBlur={handleInputBlur}
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
          className="absolute z-50 w-full mt-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg max-h-80 overflow-hidden"
        >
          <div 
            ref={scrollContainerRef}
            className="max-h-80 overflow-y-auto autocomplete-dropdown"
            style={{ 
              overscrollBehavior: 'contain',
              WebkitOverflowScrolling: 'touch'
            }}
          >
            {suggestions.length > 0 && (
              <div className="py-1">
                {suggestions.map((book, index) => (
                  <motion.button
                    key={index}
                    whileHover={{ backgroundColor: 'rgba(245, 158, 11, 0.1)' }}
                    onClick={() => handleBookSelect(book)}
                    className="w-full px-3 py-3 text-left hover:bg-warning-50 dark:hover:bg-warning-900/20 transition-colors duration-150 border-b border-slate-100 dark:border-slate-700 last:border-b-0 touch-manipulation"
                  >
                    <div className="flex items-start space-x-3">
                      {/* Book Cover Thumbnail */}
                      <div className="flex-shrink-0">
                        {book.smallThumbnail ? (
                          <img
                            src={book.smallThumbnail}
                            alt={`Portada de ${book.titulo}`}
                            className="w-8 h-10 object-cover rounded border border-slate-200 dark:border-slate-600"
                            onError={(e) => {
                              // Fallback to icon if image fails to load
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                              const fallback = target.nextElementSibling as HTMLElement;
                              if (fallback) fallback.classList.remove('hidden');
                            }}
                          />
                        ) : null}
                        <div className={`w-8 h-10 flex items-center justify-center bg-warning-100 dark:bg-warning-900/30 rounded border border-slate-200 dark:border-slate-600 ${book.smallThumbnail ? 'hidden' : ''}`}>
                          <BookOpen className="h-4 w-4 text-warning-600 dark:text-warning-400" />
                        </div>
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
            
            {suggestions.length === 0 && !isLoading && lastSearchQueryRef.current.trim().length >= 2 && !justSelected && (
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
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default BookTitleAutocomplete;