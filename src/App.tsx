import React, { useEffect, useState, useCallback } from 'react';
import { AppStateProvider, useAppState } from './context/AppStateContext';
import { motion } from 'framer-motion';
import { 
  Shield, 
  BookOpen, 
  Heart, 
  Clock, 
  Trophy, 
  Settings,
  Wallet,
  Search,
  BarChart3,
  Database,
  History
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
      const savedPreference = localStorage.getItem('guardianComprasDarkMode');
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
                <Shield className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-lg sm:text-xl font-display font-bold gradient-text">
                Guardián de Compras
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
              title="Bóveda de Recompensas"
              icon={<Wallet className="h-5 w-5" />}
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
                  books={state.wishlist}
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
                  books={state.tbr}
                  type="tbr"
                  emptyMessage="Tu pila está vacía."
                />
              </div>
            </CollapsibleSection>

            {/* History Section */}
            <CollapsibleSection
              title="Historial de Lectura"
              icon={<Trophy className="h-5 w-5" />}
              iconBgColor="bg-amber-100 dark:bg-amber-900/30"
              iconColor="text-amber-600 dark:text-amber-400"
            >
              <BookList 
                books={state.historial}
                type="historial"
                emptyMessage="Aún no has terminado ninguno."
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

          {/* Right Column - Current Book */}
          <div className="lg:col-span-1">
            <CollapsibleSection
              title="Libro Actual"
              icon={<BookOpen className="h-5 w-5" />}
              iconBgColor="bg-primary-100 dark:bg-primary-900/30"
              iconColor="text-primary-600 dark:text-primary-400"
              className="lg:sticky lg:top-24"
            >
              {state.librosActuales.length > 0 ? (
                <BookList
                  books={state.librosActuales}
                  type="actual"
                  emptyMessage=""
                />
              ) : (
                <div className="text-center py-6 sm:py-8">
                  <BookOpen className="h-10 w-10 sm:h-12 sm:w-12 text-slate-400 mx-auto mb-3 sm:mb-4" />
                  <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400">
                    Elige un libro de tu pila para empezar.
                  </p>
                </div>
              )}
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