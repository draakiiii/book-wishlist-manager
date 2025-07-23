import React, { useEffect, useState, useCallback } from 'react';
import { AppStateProvider, useAppState } from './context/AppStateContext';
import { motion } from 'framer-motion';
import { 
  BookOpen, 
  Heart, 
  Clock, 
  Trophy, 
  Settings,
  Search,
  BarChart3,
  Database,
  History,
  Book,
  CheckCircle,
  XCircle,
  ShoppingCart,
  Users
} from 'lucide-react';
import CollapsibleConfig from './components/CollapsibleConfig';
import CollapsibleSection from './components/CollapsibleSection';
import Sidebar from './components/Sidebar';
import ProgressBar from './components/ProgressBar';
import WishlistForm from './components/WishlistForm';
import TBRForm from './components/TBRForm';
import BookList from './components/BookList';
import SagaList from './components/SagaList';
import SagaCompletionNotification from './components/SagaCompletionNotification';
import AdvancedSearch from './components/AdvancedSearch';
import AdvancedStatistics from './components/AdvancedStatistics';
import DataExportImport from './components/DataExportImport';
import ScanHistory from './components/ScanHistory';

import './App.css';

const AppContent: React.FC = () => {
  const { state, dispatch } = useAppState();
  const [configSidebarOpen, setConfigSidebarOpen] = React.useState(false);
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [statisticsModalOpen, setStatisticsModalOpen] = useState(false);
  const [exportImportModalOpen, setExportImportModalOpen] = useState(false);
  const [scanHistoryModalOpen, setScanHistoryModalOpen] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);

  useEffect(() => {
    // Aplicar el modo oscuro al body
    document.body.classList.toggle('dark', state.darkMode);
    
    // Aplicar el modo oscuro al html también para mejor compatibilidad
    document.documentElement.classList.toggle('dark', state.darkMode);
    
    // Actualizar el meta theme-color para móviles
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute('content', state.darkMode ? '#1e293b' : '#ffffff');
    }
  }, [state.darkMode]);

  // Escuchar cambios en la preferencia del sistema
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleSystemThemeChange = (e: MediaQueryListEvent) => {
      // Solo cambiar si el usuario no ha establecido una preferencia manual
      const savedPreference = localStorage.getItem('bibliotecaLibrosDarkMode');
      if (savedPreference === null) {
        dispatch({ type: 'SET_DARK_MODE', payload: e.matches });
      }
    };

    mediaQuery.addEventListener('change', handleSystemThemeChange);
    
    return () => {
      mediaQuery.removeEventListener('change', handleSystemThemeChange);
    };
  }, [dispatch]);

  const handleRemoveNotification = (id: number) => {
    dispatch({ type: 'REMOVE_SAGA_NOTIFICATION', payload: { id } });
  };

  // Performance monitoring
  const measurePerformance = useCallback(() => {
    const startTime = performance.now();
    
    return () => {
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      
      // Get memory usage if available
      const memoryUsage = (performance as any).memory?.usedJSHeapSize;
      
      dispatch({
        type: 'SET_PERFORMANCE_METRICS',
        payload: {
          lastRenderTime: renderTime,
          averageRenderTime: 0, // Will be calculated in reducer
          memoryUsage
        }
      });
    };
  }, [dispatch]);

  // Measure performance on each render
  useEffect(() => {
    const cleanup = measurePerformance();
    return cleanup;
  });

  // Filtrar libros por estado
  const librosTBR = state.libros.filter(libro => libro.estado === 'tbr');
  const librosLeyendo = state.libros.filter(libro => libro.estado === 'leyendo');
  const librosLeidos = state.libros.filter(libro => libro.estado === 'leido');
  const librosAbandonados = state.libros.filter(libro => libro.estado === 'abandonado');
  const librosWishlist = state.libros.filter(libro => libro.estado === 'wishlist');
  const librosComprados = state.libros.filter(libro => libro.estado === 'comprado');
  const librosPrestados = state.libros.filter(libro => libro.prestado);

  return (
    <div className="theme-transition min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800 transition-colors duration-300">
      {/* Notificaciones de saga completada */}
      {state.sagaNotifications && state.sagaNotifications.map((notification) => (
        <SagaCompletionNotification
          key={notification.id}
          sagaName={notification.sagaName}
          onClose={() => handleRemoveNotification(notification.id)}
        />
      ))}
      
      {/* Header */}
      <motion.header 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="sticky top-0 z-50 glass-effect border-b border-white/20"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-lg">
                <BookOpen className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-lg sm:text-xl font-display font-bold gradient-text">
                Mi Biblioteca
              </h1>
            </div>
            
            <div className="flex items-center space-x-2">
              {/* Advanced Features Buttons */}
              <div className="flex items-center space-x-1 md:space-x-2">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSearchModalOpen(true)}
                  className="p-1.5 md:p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors duration-200"
                  title="Búsqueda Avanzada"
                >
                  <Search className="h-4 w-4 md:h-5 md:w-5 text-slate-600 dark:text-slate-400" />
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setStatisticsModalOpen(true)}
                  className="p-1.5 md:p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors duration-200"
                  title="Estadísticas Avanzadas"
                >
                  <BarChart3 className="h-4 w-4 md:h-5 md:w-5 text-slate-600 dark:text-slate-400" />
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setExportImportModalOpen(true)}
                  className="p-1.5 md:p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors duration-200"
                  title="Exportar/Importar Datos"
                >
                  <Database className="h-4 w-4 md:h-5 md:w-5 text-slate-600 dark:text-slate-400" />
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setScanHistoryModalOpen(true)}
                  className="p-1.5 md:p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors duration-200"
                  title="Historial de Escaneos"
                >
                  <History className="h-4 w-4 md:h-5 md:w-5 text-slate-600 dark:text-slate-400" />
                </motion.button>
              </div>
              
              {/* Settings button */}
              <button
                onClick={() => setConfigSidebarOpen(true)}
                className="p-1.5 md:p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors duration-200"
              >
                <Settings className="h-4 w-4 md:h-5 md:w-5 text-slate-600 dark:text-slate-400" />
              </button>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-4 sm:space-y-6 lg:space-y-8">
            
            {/* Configuration Section - Desktop Collapsible */}
            <div className="hidden lg:block">
              <CollapsibleConfig />
            </div>

            {/* Progress Section */}
            <CollapsibleSection
              title="Objetivos de Lectura"
              icon={<Trophy className="h-5 w-5" />}
              iconBgColor="bg-success-100 dark:bg-success-900/30"
              iconColor="text-success-600 dark:text-success-400"
            >
              <ProgressBar />
            </CollapsibleSection>

            {/* Wishlist Section */}
            <CollapsibleSection
              title="Lista de Deseos"
              icon={<Heart className="h-5 w-5" />}
              iconBgColor="bg-secondary-100 dark:bg-secondary-900/30"
              iconColor="text-secondary-600 dark:text-secondary-400"
            >
              <WishlistForm />
              <div className="mt-4 sm:mt-6">
                <BookList 
                  books={librosWishlist}
                  type="wishlist"
                  emptyMessage="Tu lista de deseos está vacía."
                />
              </div>
            </CollapsibleSection>

            {/* TBR Section */}
            <CollapsibleSection
              title="Pila de Lectura (TBR)"
              icon={<Clock className="h-5 w-5" />}
              iconBgColor="bg-warning-100 dark:bg-warning-900/30"
              iconColor="text-warning-600 dark:text-warning-400"
            >
              <TBRForm />
              <div className="mt-4 sm:mt-6">
                <BookList 
                  books={librosTBR}
                  type="tbr"
                  emptyMessage="Tu pila está vacía."
                />
              </div>
            </CollapsibleSection>

            {/* Currently Reading Section */}
            <CollapsibleSection
              title="Leyendo Actualmente"
              icon={<BookOpen className="h-5 w-5" />}
              iconBgColor="bg-primary-100 dark:bg-primary-900/30"
              iconColor="text-primary-600 dark:text-primary-400"
            >
              <BookList 
                books={librosLeyendo}
                type="leyendo"
                emptyMessage="No estás leyendo ningún libro actualmente."
              />
            </CollapsibleSection>

            {/* Completed Books Section */}
            <CollapsibleSection
              title="Libros Leídos"
              icon={<CheckCircle className="h-5 w-5" />}
              iconBgColor="bg-green-100 dark:bg-green-900/30"
              iconColor="text-green-600 dark:text-green-400"
            >
              <BookList 
                books={librosLeidos}
                type="leido"
                emptyMessage="Aún no has terminado ningún libro."
              />
            </CollapsibleSection>

            {/* Abandoned Books Section */}
            <CollapsibleSection
              title="Libros Abandonados"
              icon={<XCircle className="h-5 w-5" />}
              iconBgColor="bg-red-100 dark:bg-red-900/30"
              iconColor="text-red-600 dark:text-red-400"
            >
              <BookList 
                books={librosAbandonados}
                type="abandonado"
                emptyMessage="No has abandonado ningún libro."
              />
            </CollapsibleSection>

            {/* Purchased Books Section */}
            <CollapsibleSection
              title="Libros Comprados"
              icon={<ShoppingCart className="h-5 w-5" />}
              iconBgColor="bg-blue-100 dark:bg-blue-900/30"
              iconColor="text-blue-600 dark:text-blue-400"
            >
              <BookList 
                books={librosComprados}
                type="comprado"
                emptyMessage="No has comprado ningún libro."
              />
            </CollapsibleSection>

            {/* Lent Books Section */}
            <CollapsibleSection
              title="Libros Prestados"
              icon={<Users className="h-5 w-5" />}
              iconBgColor="bg-purple-100 dark:bg-purple-900/30"
              iconColor="text-purple-600 dark:text-purple-400"
            >
              <BookList 
                books={librosPrestados}
                type="prestado"
                emptyMessage="No tienes libros prestados."
              />
            </CollapsibleSection>

            {/* Sagas Section */}
            <CollapsibleSection
              title="Mis Sagas"
              icon={<Trophy className="h-5 w-5" />}
              iconBgColor="bg-purple-100 dark:bg-purple-900/30"
              iconColor="text-purple-600 dark:text-purple-400"
            >
              <SagaList />
            </CollapsibleSection>
          </div>

          {/* Right Column - Quick Actions & Stats */}
          <div className="lg:col-span-1">
            {/* Quick Stats */}
            <CollapsibleSection
              title="Resumen de Biblioteca"
              icon={<BarChart3 className="h-5 w-5" />}
              iconBgColor="bg-indigo-100 dark:bg-indigo-900/30"
              iconColor="text-indigo-600 dark:text-indigo-400"
              className="lg:sticky lg:top-24"
            >
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-white/50 dark:bg-slate-800/50 rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                      {state.libros.length}
                    </div>
                    <div className="text-xs text-slate-600 dark:text-slate-400">
                      Total Libros
                    </div>
                  </div>
                  <div className="bg-white/50 dark:bg-slate-800/50 rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                      {librosLeidos.length}
                    </div>
                    <div className="text-xs text-slate-600 dark:text-slate-400">
                      Leídos
                    </div>
                  </div>
                  <div className="bg-white/50 dark:bg-slate-800/50 rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold text-warning-600 dark:text-warning-400">
                      {librosTBR.length}
                    </div>
                    <div className="text-xs text-slate-600 dark:text-slate-400">
                      En TBR
                    </div>
                  </div>
                  <div className="bg-white/50 dark:bg-slate-800/50 rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                      {librosLeyendo.length}
                    </div>
                    <div className="text-xs text-slate-600 dark:text-slate-400">
                      Leyendo
                    </div>
                  </div>
                </div>
                
                <div className="bg-white/50 dark:bg-slate-800/50 rounded-lg p-3">
                  <div className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Próximas Acciones
                  </div>
                  <div className="space-y-2 text-xs">
                    {librosLeyendo.length > 0 && (
                      <div className="flex items-center justify-between">
                        <span>Continuar leyendo</span>
                        <span className="text-primary-600 dark:text-primary-400">
                          {librosLeyendo.length} libro{librosLeyendo.length !== 1 ? 's' : ''}
                        </span>
                      </div>
                    )}
                    {librosPrestados.length > 0 && (
                      <div className="flex items-center justify-between">
                        <span>Libros prestados</span>
                        <span className="text-purple-600 dark:text-purple-400">
                          {librosPrestados.length}
                        </span>
                      </div>
                    )}
                    {state.sagas.filter(s => !s.isComplete && s.count > 0).length > 0 && (
                      <div className="flex items-center justify-between">
                        <span>Sagas activas</span>
                        <span className="text-purple-600 dark:text-purple-400">
                          {state.sagas.filter(s => !s.isComplete && s.count > 0).length}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CollapsibleSection>
          </div>
        </div>
      </main>
      
      {/* Mobile Configuration Sidebar */}
      <Sidebar 
        isOpen={configSidebarOpen} 
        onClose={() => setConfigSidebarOpen(false)} 
      />

      {/* Advanced Search Modal */}
      <AdvancedSearch
        isOpen={searchModalOpen}
        onClose={() => setSearchModalOpen(false)}
        onSearch={setSearchResults}
      />

      {/* Advanced Statistics Modal */}
      <AdvancedStatistics
        isOpen={statisticsModalOpen}
        onClose={() => setStatisticsModalOpen(false)}
      />

      {/* Data Export/Import Modal */}
      <DataExportImport
        isOpen={exportImportModalOpen}
        onClose={() => setExportImportModalOpen(false)}
      />

      {/* Scan History Modal */}
      <ScanHistory
        isOpen={scanHistoryModalOpen}
        onClose={() => setScanHistoryModalOpen(false)}
      />
    </div>
  );
};

const App: React.FC = () => {
  return (
    <AppStateProvider>
      <AppContent />
    </AppStateProvider>
  );
};

export default App; 