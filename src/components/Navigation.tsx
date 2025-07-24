import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Home,
  Book,
  ChevronDown,
  List,
  Grid,
  Filter,
  BookOpen
} from 'lucide-react';

export type NavigationSection = 'dashboard' | 'books';
export type BooksViewMode = 'list' | 'gallery';

interface NavigationProps {
  currentSection: NavigationSection;
  currentBooksView: BooksViewMode;
  onSectionChange: (section: NavigationSection) => void;
  onBooksViewChange: (view: BooksViewMode) => void;
}

const Navigation: React.FC<NavigationProps> = ({
  currentSection,
  currentBooksView,
  onSectionChange,
  onBooksViewChange
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Cerrar dropdown al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSectionClick = (section: NavigationSection) => {
    onSectionChange(section);
    setIsDropdownOpen(false);
  };

  const handleBooksViewClick = (view: BooksViewMode) => {
    onBooksViewChange(view);
    setIsDropdownOpen(false);
  };

  const getSectionLabel = () => {
    switch (currentSection) {
      case 'dashboard':
        return 'Dashboard';
      case 'books':
        return `Libros (${currentBooksView === 'list' ? 'Lista' : 'Galería'})`;
      default:
        return 'Dashboard';
    }
  };

  const getSectionIcon = () => {
    switch (currentSection) {
      case 'dashboard':
        return <Home className="h-4 w-4" />;
      case 'books':
        return <Book className="h-4 w-4" />;
      default:
        return <Home className="h-4 w-4" />;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Botón principal del menú */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        className="flex items-center space-x-2 px-3 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors duration-200 text-slate-700 dark:text-slate-300"
      >
        {getSectionIcon()}
        <span className="hidden sm:inline font-medium">{getSectionLabel()}</span>
        <ChevronDown 
          className={`h-4 w-4 transition-transform duration-200 ${
            isDropdownOpen ? 'rotate-180' : ''
          }`} 
        />
      </motion.button>

      {/* Menú desplegable */}
      <AnimatePresence>
        {isDropdownOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full left-0 mt-2 w-64 bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 z-50 overflow-hidden"
          >
            {/* Dashboard */}
            <div className="p-2">
              <motion.button
                whileHover={{ backgroundColor: 'rgba(59, 130, 246, 0.1)' }}
                onClick={() => handleSectionClick('dashboard')}
                className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-colors duration-200 ${
                  currentSection === 'dashboard'
                    ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                }`}
              >
                <Home className="h-5 w-5" />
                <div className="flex-1 text-left">
                  <div className="font-medium">Dashboard</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    Pantalla principal con resumen
                  </div>
                </div>
              </motion.button>
            </div>

            {/* Separador */}
            <div className="border-t border-slate-200 dark:border-slate-700 my-1" />

            {/* Libros */}
            <div className="p-2">
              <div className="mb-2">
                <div className="flex items-center space-x-2 px-3 py-1">
                  <Book className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                  <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
                    Libros
                  </span>
                </div>
              </div>

              {/* Vista Lista */}
              <motion.button
                whileHover={{ backgroundColor: 'rgba(59, 130, 246, 0.1)' }}
                onClick={() => {
                  handleSectionClick('books');
                  handleBooksViewClick('list');
                }}
                className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors duration-200 ml-4 ${
                  currentSection === 'books' && currentBooksView === 'list'
                    ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
                }`}
              >
                <List className="h-4 w-4" />
                <div className="flex-1 text-left">
                  <div className="text-sm font-medium">Vista Lista</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    Listado detallado de libros
                  </div>
                </div>
              </motion.button>

              {/* Vista Galería */}
              <motion.button
                whileHover={{ backgroundColor: 'rgba(59, 130, 246, 0.1)' }}
                onClick={() => {
                  handleSectionClick('books');
                  handleBooksViewClick('gallery');
                }}
                className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors duration-200 ml-4 mt-1 ${
                  currentSection === 'books' && currentBooksView === 'gallery'
                    ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
                }`}
              >
                <Grid className="h-4 w-4" />
                <div className="flex-1 text-left">
                  <div className="text-sm font-medium">Vista Galería</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    Portadas de libros en cuadrícula
                  </div>
                </div>
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Navigation;