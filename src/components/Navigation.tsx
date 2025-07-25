import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Home,
  Book,
  ChevronDown,
  List,
  Grid,
  BarChart3,
  Search,
  History,
  Database,
  Settings,
  Scan,
  Heart,
  Clock,
  Users,
  FileText,
  BookOpen,
  Download
} from 'lucide-react';

// Navigation component with comprehensive dropdown menu
export type NavigationSection = 
  | 'dashboard' 
  | 'books' 
  | 'statistics' 
  | 'search'
  | 'scanning'
  | 'management'
  | 'tools'
  | 'settings';

export type BooksViewMode = 'list' | 'gallery';
export type SearchMode = 'basic' | 'advanced';
export type ScanningMode = 'single' | 'bulk' | 'history';
export type ManagementMode = 'tbr' | 'wishlist' | 'loans' | 'sagas';
export type ToolsMode = 'export' | 'import' | 'backup';

interface NavigationProps {
  currentSection: NavigationSection;
  currentBooksView: BooksViewMode;
  onSectionChange: (section: NavigationSection) => void;
  onBooksViewChange: (view: BooksViewMode) => void;
  onModalOpen?: (modal: string) => void;
}

const Navigation: React.FC<NavigationProps> = ({
  currentSection,
  currentBooksView,
  onSectionChange,
  onBooksViewChange,
  onModalOpen
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
    onSectionChange('books');
    onBooksViewChange(view);
    setIsDropdownOpen(false);
  };

  const handleModalOpen = (modal: string) => {
    if (onModalOpen) {
      onModalOpen(modal);
    }
    setIsDropdownOpen(false);
  };

  const getSectionLabel = () => {
    switch (currentSection) {
      case 'dashboard':
        return 'Dashboard';
      case 'books':
        return `Libros (${currentBooksView === 'list' ? 'Lista' : 'Galería'})`;
      case 'statistics':
        return 'Estadísticas';
      case 'search':
        return 'Búsqueda';
      case 'scanning':
        return 'Escaneo';
      case 'management':
        return 'Gestión';
      case 'tools':
        return 'Herramientas';
      case 'settings':
        return 'Configuración';
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
      case 'statistics':
        return <BarChart3 className="h-4 w-4" />;
      case 'search':
        return <Search className="h-4 w-4" />;
      case 'scanning':
        return <Scan className="h-4 w-4" />;
      case 'management':
        return <Users className="h-4 w-4" />;
      case 'tools':
        return <Database className="h-4 w-4" />;
      case 'settings':
        return <Settings className="h-4 w-4" />;
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
      {isDropdownOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10, scale: 0.95 }}
          transition={{ duration: 0.15 }}
          className="absolute top-full right-0 sm:left-0 sm:right-auto mt-2 w-80 sm:w-72 max-w-[calc(100vw-2rem)] bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 z-50 overflow-hidden max-h-[80vh] overflow-y-auto"
        >
          {/* Dashboard */}
          <div className="p-1.5 sm:p-2">
            <motion.button
              whileHover={{ backgroundColor: 'rgba(59, 130, 246, 0.1)' }}
              onClick={() => handleSectionClick('dashboard')}
              className={`w-full flex items-center space-x-3 px-2 sm:px-3 py-2 sm:py-2.5 rounded-lg transition-colors duration-200 ${
                currentSection === 'dashboard'
                  ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400'
                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
            >
              <Home className="h-4 w-4 sm:h-5 sm:w-5" />
              <div className="flex-1 text-left">
                <div className="font-medium">Dashboard</div>
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  <span className="hidden sm:inline">Pantalla principal con resumen</span>
                  <span className="sm:hidden">Pantalla principal</span>
                </div>
              </div>
            </motion.button>
          </div>

          {/* Separador */}
          <div className="border-t border-slate-200 dark:border-slate-700 my-1" />

          {/* Libros */}
          <div className="p-1.5 sm:p-2">
            <div className="mb-2">
              <div className="flex items-center space-x-2 px-3 py-1">
                <Book className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
                  Biblioteca
                </span>
              </div>
            </div>

            {/* Vista Lista */}
            <motion.button
              whileHover={{ backgroundColor: 'rgba(59, 130, 246, 0.1)' }}
              onClick={() => handleBooksViewClick('list')}
              className={`w-full flex items-center space-x-3 px-2 sm:px-3 py-2 rounded-lg transition-colors duration-200 ml-2 sm:ml-4 ${
                currentSection === 'books' && currentBooksView === 'list'
                  ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
            >
              <List className="h-4 w-4" />
              <div className="flex-1 text-left">
                <div className="text-sm font-medium">Vista Lista</div>
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  <span className="hidden sm:inline">Listado detallado de libros</span>
                  <span className="sm:hidden">Listado detallado</span>
                </div>
              </div>
            </motion.button>

            {/* Vista Galería */}
            <motion.button
              whileHover={{ backgroundColor: 'rgba(59, 130, 246, 0.1)' }}
              onClick={() => handleBooksViewClick('gallery')}
              className={`w-full flex items-center space-x-3 px-2 sm:px-3 py-2 rounded-lg transition-colors duration-200 ml-2 sm:ml-4 mt-1 ${
                currentSection === 'books' && currentBooksView === 'gallery'
                  ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
            >
              <Grid className="h-4 w-4" />
              <div className="flex-1 text-left">
                <div className="text-sm font-medium">Vista Galería</div>
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  <span className="hidden sm:inline">Portadas de libros en cuadrícula</span>
                  <span className="sm:hidden">Vista en cuadrícula</span>
                </div>
              </div>
            </motion.button>
          </div>

          {/* Separador */}
          <div className="border-t border-slate-200 dark:border-slate-700 my-1" />

          {/* Estadísticas */}
          <div className="p-1.5 sm:p-2">
            <motion.button
              whileHover={{ backgroundColor: 'rgba(59, 130, 246, 0.1)' }}
              onClick={() => handleSectionClick('statistics')}
              className={`w-full flex items-center space-x-3 px-2 sm:px-3 py-2 sm:py-2.5 rounded-lg transition-colors duration-200 ${
                currentSection === 'statistics'
                  ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400'
                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
            >
              <BarChart3 className="h-4 w-4 sm:h-5 sm:w-5" />
              <div className="flex-1 text-left">
                <div className="font-medium">Estadísticas</div>
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  <span className="hidden sm:inline">Análisis detallado de tu biblioteca</span>
                  <span className="sm:hidden">Análisis de biblioteca</span>
                </div>
              </div>
            </motion.button>
          </div>

          {/* Separador */}
          <div className="border-t border-slate-200 dark:border-slate-700 my-1" />

          {/* Escaneo */}
          <div className="p-1.5 sm:p-2">
            <div className="mb-2">
              <div className="flex items-center space-x-2 px-3 py-1">
                <Scan className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
                  Escaneo
                </span>
              </div>
            </div>

            {/* Escaneo Individual */}
            <motion.button
              whileHover={{ backgroundColor: 'rgba(59, 130, 246, 0.1)' }}
              onClick={() => handleModalOpen('barcodeScanner')}
              className="w-full flex items-center space-x-3 px-2 sm:px-3 py-2 rounded-lg transition-colors duration-200 ml-2 sm:ml-4 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700"
            >
              <BookOpen className="h-4 w-4" />
              <div className="flex-1 text-left">
                <div className="text-sm font-medium">Escaneo Individual</div>
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  <span className="hidden sm:inline">Escanear un libro por ISBN</span>
                  <span className="sm:hidden">Escanear libro</span>
                </div>
              </div>
            </motion.button>

            {/* Escaneo Masivo */}
            <motion.button
              whileHover={{ backgroundColor: 'rgba(59, 130, 246, 0.1)' }}
              onClick={() => handleModalOpen('bulkScan')}
              className="w-full flex items-center space-x-3 px-2 sm:px-3 py-2 rounded-lg transition-colors duration-200 ml-2 sm:ml-4 mt-1 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700"
            >
              <Database className="h-4 w-4" />
              <div className="flex-1 text-left">
                <div className="text-sm font-medium">Escaneo Masivo</div>
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  <span className="hidden sm:inline">Escanear múltiples libros</span>
                  <span className="sm:hidden">Escaneo múltiple</span>
                </div>
              </div>
            </motion.button>

            {/* Historial de Escaneos */}
            <motion.button
              whileHover={{ backgroundColor: 'rgba(59, 130, 246, 0.1)' }}
              onClick={() => handleModalOpen('scanHistory')}
              className="w-full flex items-center space-x-3 px-2 sm:px-3 py-2 rounded-lg transition-colors duration-200 ml-2 sm:ml-4 mt-1 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700"
            >
              <History className="h-4 w-4" />
              <div className="flex-1 text-left">
                <div className="text-sm font-medium">Historial</div>
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  <span className="hidden sm:inline">Ver historial de escaneos</span>
                  <span className="sm:hidden">Historial</span>
                </div>
              </div>
            </motion.button>
          </div>

          {/* Separador */}
          <div className="border-t border-slate-200 dark:border-slate-700 my-1" />

          {/* Gestión */}
          <div className="p-1.5 sm:p-2">
            <div className="mb-2">
              <div className="flex items-center space-x-2 px-3 py-1">
                <Users className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
                  Gestión
                </span>
              </div>
            </div>

            {/* TBR (To Be Read) */}
            <motion.button
              whileHover={{ backgroundColor: 'rgba(59, 130, 246, 0.1)' }}
              onClick={() => handleModalOpen('tbrForm')}
              className="w-full flex items-center space-x-3 px-2 sm:px-3 py-2 rounded-lg transition-colors duration-200 ml-2 sm:ml-4 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700"
            >
              <Clock className="h-4 w-4" />
              <div className="flex-1 text-left">
                <div className="text-sm font-medium">TBR</div>
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  <span className="hidden sm:inline">Libros por leer</span>
                  <span className="sm:hidden">Por leer</span>
                </div>
              </div>
            </motion.button>

            {/* Wishlist */}
            <motion.button
              whileHover={{ backgroundColor: 'rgba(59, 130, 246, 0.1)' }}
              onClick={() => handleModalOpen('wishlistForm')}
              className="w-full flex items-center space-x-3 px-2 sm:px-3 py-2 rounded-lg transition-colors duration-200 ml-2 sm:ml-4 mt-1 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700"
            >
              <Heart className="h-4 w-4" />
              <div className="flex-1 text-left">
                <div className="text-sm font-medium">Wishlist</div>
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  <span className="hidden sm:inline">Libros deseados</span>
                  <span className="sm:hidden">Deseados</span>
                </div>
              </div>
            </motion.button>

            {/* Sagas */}
            <motion.button
              whileHover={{ backgroundColor: 'rgba(59, 130, 246, 0.1)' }}
              onClick={() => handleModalOpen('sagaList')}
              className="w-full flex items-center space-x-3 px-2 sm:px-3 py-2 rounded-lg transition-colors duration-200 ml-2 sm:ml-4 mt-1 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700"
            >
              <FileText className="h-4 w-4" />
              <div className="flex-1 text-left">
                <div className="text-sm font-medium">Sagas</div>
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  <span className="hidden sm:inline">Gestionar series de libros</span>
                  <span className="sm:hidden">Series</span>
                </div>
              </div>
            </motion.button>
          </div>

          {/* Separador */}
          <div className="border-t border-slate-200 dark:border-slate-700 my-1" />

          {/* Herramientas */}
          <div className="p-1.5 sm:p-2">
            <div className="mb-2">
              <div className="flex items-center space-x-2 px-3 py-1">
                <Database className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
                  Herramientas
                </span>
              </div>
            </div>

            {/* Exportar Datos */}
            <motion.button
              whileHover={{ backgroundColor: 'rgba(59, 130, 246, 0.1)' }}
              onClick={() => handleModalOpen('dataExportImport')}
              className="w-full flex items-center space-x-3 px-2 sm:px-3 py-2 rounded-lg transition-colors duration-200 ml-2 sm:ml-4 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700"
            >
              <Download className="h-4 w-4" />
              <div className="flex-1 text-left">
                <div className="text-sm font-medium">Exportar/Importar</div>
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  <span className="hidden sm:inline">Respaldar y restaurar datos</span>
                  <span className="sm:hidden">Respaldar datos</span>
                </div>
              </div>
            </motion.button>
          </div>

          {/* Separador */}
          <div className="border-t border-slate-200 dark:border-slate-700 my-1" />

          {/* Configuración */}
          <div className="p-1.5 sm:p-2">
            <motion.button
              whileHover={{ backgroundColor: 'rgba(59, 130, 246, 0.1)' }}
              onClick={() => handleModalOpen('configForm')}
              className="w-full flex items-center space-x-3 px-2 sm:px-3 py-2 sm:py-2.5 rounded-lg transition-colors duration-200 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
            >
              <Settings className="h-4 w-4 sm:h-5 sm:w-5" />
              <div className="flex-1 text-left">
                <div className="font-medium">Configuración</div>
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  <span className="hidden sm:inline">Ajustes de la aplicación</span>
                  <span className="sm:hidden">Ajustes</span>
                </div>
              </div>
            </motion.button>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default Navigation;