import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BookOpen, 
  BookMarked, 
  Users, 
  FileText, 
  BarChart3, 
  Settings,
  Share2,
  Quote,
  Image,
  Grid3X3,
  List,
  BookOpenCheck,
  History,
  Download,
  Plus,
  Search,
  Camera,
  Heart,
  Target,
  Calendar,
  TrendingUp,
  Layout,
  Settings as Widget
} from 'lucide-react';
import { useAppState } from '../context/AppStateContext';

interface MainNavigationProps {
  onNavigate: (section: string) => void;
  currentSection: string;
}

const MainNavigation: React.FC<MainNavigationProps> = ({ onNavigate, currentSection }) => {
  const { state } = useAppState();
  const [showSubmenu, setShowSubmenu] = useState<string | null>(null);

  const navigationItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: BarChart3,
      description: 'Vista general de tu biblioteca'
    },
    {
      id: 'books',
      label: 'Libros',
      icon: BookOpen,
      description: 'Gestionar tu colección de libros',
      submenu: [
        { id: 'all-books', label: 'Todos los libros', icon: BookOpen },
        { id: 'add-book', label: 'Añadir libro', icon: Plus },
        { id: 'search-books', label: 'Buscar libros', icon: Search },
        { id: 'scan-book', label: 'Escanear ISBN', icon: Camera }
      ]
    },
    {
      id: 'sagas',
      label: 'Sagas',
      icon: BookMarked,
      description: 'Gestionar series de libros',
      submenu: [
        { id: 'all-sagas', label: 'Todas las sagas', icon: BookMarked },
        { id: 'add-saga', label: 'Crear saga', icon: Plus },
        { id: 'edit-sagas', label: 'Editar sagas', icon: BookOpenCheck }
      ]
    },
    {
      id: 'loans',
      label: 'Préstamos',
      icon: Users,
      description: 'Gestionar préstamos de libros',
      submenu: [
        { id: 'current-loans', label: 'Préstamos activos', icon: Users },
        { id: 'loan-history', label: 'Historial', icon: History },
        { id: 'lend-book', label: 'Prestar libro', icon: Plus }
      ]
    },
    {
      id: 'quotes',
      label: 'Citas',
      icon: Quote,
      description: 'Gestionar citas favoritas',
      submenu: [
        { id: 'all-quotes', label: 'Todas las citas', icon: Quote },
        { id: 'favorite-quotes', label: 'Citas favoritas', icon: Heart },
        { id: 'add-quote', label: 'Añadir cita', icon: Plus }
      ]
    },
    {
      id: 'reports',
      label: 'Reportes',
      icon: FileText,
      description: 'Reportes y estadísticas',
      submenu: [
        { id: 'automatic-reports', label: 'Reportes automáticos', icon: Calendar },
        { id: 'monthly-reports', label: 'Reportes mensuales', icon: TrendingUp },
        { id: 'export-data', label: 'Exportar datos', icon: Download }
      ]
    },
    {
      id: 'views',
      label: 'Vistas',
      icon: Image,
      description: 'Diferentes formas de ver tus libros',
      submenu: [
        { id: 'gallery-view', label: 'Vista galería', icon: Image },
        { id: 'grid-view', label: 'Vista cuadrícula', icon: Grid3X3 },
        { id: 'list-view', label: 'Vista lista', icon: List },
        { id: 'layout-manager', label: 'Gestionar layouts', icon: Layout }
      ]
    },
    {
      id: 'widgets',
      label: 'Widgets',
      icon: Widget,
      description: 'Personalizar tu dashboard',
      submenu: [
        { id: 'widgets-manager', label: 'Gestionar widgets', icon: Widget },
        { id: 'add-widget', label: 'Añadir widget', icon: Plus }
      ]
    },
    {
      id: 'sharing',
      label: 'Compartir',
      icon: Share2,
      description: 'Compartir reseñas y estadísticas',
      submenu: [
        { id: 'share-review', label: 'Compartir reseña', icon: Share2 },
        { id: 'social-sharing', label: 'Redes sociales', icon: Share2 }
      ]
    },
    {
      id: 'goals',
      label: 'Objetivos',
      icon: Target,
      description: 'Gestionar objetivos de lectura',
      submenu: [
        { id: 'reading-goals', label: 'Objetivos de lectura', icon: Target },
        { id: 'progress-tracking', label: 'Seguimiento', icon: TrendingUp }
      ]
    }
  ];

  const handleItemClick = (itemId: string) => {
    if (navigationItems.find(item => item.id === itemId)?.submenu) {
      setShowSubmenu(showSubmenu === itemId ? null : itemId);
    } else {
      onNavigate(itemId);
      setShowSubmenu(null);
    }
  };

  const getStats = () => {
    const totalBooks = state.libros.length;
    const readBooks = state.libros.filter(book => book.estado === 'leido').length;
    const currentLoans = state.historialPrestamos.filter(loan => loan.estado === 'activo').length;
    const totalQuotes = state.libros.reduce((sum, book) => sum + (book.citas?.length || 0), 0);
    
    return { totalBooks, readBooks, currentLoans, totalQuotes };
  };

  const stats = getStats();

  return (
    <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Title */}
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <BookOpen className="h-8 w-8 text-blue-600" />
            </div>
            <div className="ml-3">
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                Guardián de Compras
              </h1>
            </div>
          </div>

          {/* Stats */}
          <div className="hidden md:flex items-center space-x-6">
            <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-300">
              <BookOpen className="w-4 h-4" />
              <span>{stats.totalBooks} libros</span>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-300">
              <BookOpenCheck className="w-4 h-4" />
              <span>{stats.readBooks} leídos</span>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-300">
              <Users className="w-4 h-4" />
              <span>{stats.currentLoans} préstamos</span>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-300">
              <Quote className="w-4 h-4" />
              <span>{stats.totalQuotes} citas</span>
            </div>
          </div>

          {/* Navigation */}
          <nav className="hidden lg:flex items-center space-x-1">
            {navigationItems.map((item) => (
              <div key={item.id} className="relative">
                <button
                  onClick={() => handleItemClick(item.id)}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                    currentSection === item.id
                      ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                      : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-700'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <item.icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </div>
                </button>

                {/* Submenu */}
                {item.submenu && showSubmenu === item.id && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute top-full left-0 mt-1 w-64 bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 z-50"
                    >
                      <div className="py-2">
                        {item.submenu.map((subItem) => (
                          <button
                            key={subItem.id}
                            onClick={() => onNavigate(subItem.id)}
                            className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700 transition-colors duration-200"
                          >
                            <subItem.icon className="w-4 h-4" />
                            <span>{subItem.label}</span>
                          </button>
                        ))}
                      </div>
                    </motion.div>
                )}
              </div>
            ))}
          </nav>

          {/* Mobile Menu Button */}
          <div className="lg:hidden">
            <button
              onClick={() => onNavigate('mobile-menu')}
              className="p-2 rounded-md text-gray-700 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-700"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {currentSection === 'mobile-menu' && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden border-t border-gray-200 dark:border-gray-700"
          >
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navigationItems.map((item) => (
                <div key={item.id}>
                  <button
                    onClick={() => handleItemClick(item.id)}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-700 transition-colors duration-200"
                  >
                    <div className="flex items-center space-x-3">
                      <item.icon className="w-5 h-5" />
                      <span>{item.label}</span>
                    </div>
                    {item.submenu && (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    )}
                  </button>
                  
                  {item.submenu && showSubmenu === item.id && (
                    <div className="ml-8 mt-1 space-y-1">
                      {item.submenu.map((subItem) => (
                        <button
                          key={subItem.id}
                          onClick={() => onNavigate(subItem.id)}
                          className="w-full flex items-center space-x-3 px-3 py-2 rounded-md text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-700 transition-colors duration-200"
                        >
                          <subItem.icon className="w-4 h-4" />
                          <span>{subItem.label}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        )}
    </div>
  );
};

export default MainNavigation;