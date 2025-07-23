import React, { useEffect, useState } from 'react';
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
  Users,
  X,
  Share2,
  User,
  LogOut
} from 'lucide-react';
import CollapsibleConfig from './CollapsibleConfig';
import CollapsibleSection from './CollapsibleSection';
import Sidebar from './Sidebar';
import ProgressBar from './ProgressBar';
import WishlistForm from './WishlistForm';
import TBRForm from './TBRForm';
import BookList from './BookList';
import SagaList from './SagaList';
import SagaCompletionNotification from './SagaCompletionNotification';
import AdvancedSearch from './AdvancedSearch';
import AdvancedStatistics from './AdvancedStatistics';
import DataExportImport from './DataExportImport';
import ScanHistory from './ScanHistory';
import ConfigForm from './ConfigForm';
import BulkScanModal from './BulkScanModal';
import UserProfile from './auth/UserProfile';
import { useAppState } from '../context/FirebaseAppStateContext';
import { useAuth } from '../context/AuthContext';

const AppContent: React.FC = () => {
  const { state, dispatch, loading, syncStatus } = useAppState();
  const { currentUser, signOut } = useAuth();
  const [configSidebarOpen, setConfigSidebarOpen] = React.useState(false);
  const [configModalOpen, setConfigModalOpen] = useState(false);
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [statisticsModalOpen, setStatisticsModalOpen] = useState(false);
  const [exportImportModalOpen, setExportImportModalOpen] = useState(false);
  const [scanHistoryModalOpen, setScanHistoryModalOpen] = useState(false);
  const [bulkScanModalOpen, setBulkScanModalOpen] = useState(false);
  const [userProfileOpen, setUserProfileOpen] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);

  // Inicializar searchResults con todos los libros cuando se abre el modal
  useEffect(() => {
    if (searchModalOpen) {
      setSearchResults(state.libros);
    }
  }, [searchModalOpen, state.libros]);

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

  const handleOpenConfig = () => {
    // En móvil, abrir el sidebar de configuración
    // En desktop, abrir el modal de configuración
    if (window.innerWidth < 768) {
      setConfigSidebarOpen(true);
    } else {
      setConfigModalOpen(true);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  // Show loading screen while data is being loaded
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Cargando tu biblioteca...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header with user info and sync status */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                Guardian Compras
              </h1>
              {/* Sync status indicator */}
              <div className="ml-4 flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${
                  syncStatus === 'idle' ? 'bg-green-500' : 
                  syncStatus === 'syncing' ? 'bg-yellow-500 animate-pulse' : 
                  'bg-red-500'
                }`}></div>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {syncStatus === 'idle' ? 'Sincronizado' : 
                   syncStatus === 'syncing' ? 'Sincronizando...' : 
                   'Error de sincronización'}
                </span>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* User menu */}
              <div className="relative">
                <button
                  onClick={() => setUserProfileOpen(!userProfileOpen)}
                  className="flex items-center space-x-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
                >
                  <div className="w-8 h-8 bg-indigo-100 dark:bg-indigo-900 rounded-full flex items-center justify-center">
                    <User className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <span className="hidden sm:block text-sm font-medium">
                    {currentUser?.displayName || currentUser?.email?.split('@')[0] || 'Usuario'}
                  </span>
                </button>
                
                {userProfileOpen && (
                  <div className="absolute right-0 mt-2 w-80 z-50">
                    <UserProfile />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Notifications */}
        {state.sagaNotifications.length > 0 && (
          <div className="mb-6 space-y-2">
            {state.sagaNotifications.map((notification) => (
              <SagaCompletionNotification
                key={notification.id}
                notification={notification}
                onRemove={() => handleRemoveNotification(notification.id)}
              />
            ))}
          </div>
        )}

        {/* Progress Section */}
        <CollapsibleSection
          title="Progreso de Lectura"
          icon={<Trophy className="h-5 w-5" />}
          defaultOpen={true}
        >
          <ProgressBar />
        </CollapsibleSection>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setSearchModalOpen(true)}
            className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow"
          >
            <Search className="h-6 w-6 text-indigo-600 dark:text-indigo-400 mb-2" />
            <h3 className="font-medium text-gray-900 dark:text-white">Buscar Libros</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">Encuentra libros en tu biblioteca</p>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setStatisticsModalOpen(true)}
            className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow"
          >
            <BarChart3 className="h-6 w-6 text-green-600 dark:text-green-400 mb-2" />
            <h3 className="font-medium text-gray-900 dark:text-white">Estadísticas</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">Ver tu progreso detallado</p>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setExportImportModalOpen(true)}
            className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow"
          >
            <Database className="h-6 w-6 text-blue-600 dark:text-blue-400 mb-2" />
            <h3 className="font-medium text-gray-900 dark:text-white">Exportar/Importar</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">Gestionar tus datos</p>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setScanHistoryModalOpen(true)}
            className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow"
          >
            <History className="h-6 w-6 text-purple-600 dark:text-purple-400 mb-2" />
            <h3 className="font-medium text-gray-900 dark:text-white">Historial</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">Ver escaneos recientes</p>
          </motion.button>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* Currently Reading */}
            <CollapsibleSection
              title="Leyendo Actualmente"
              icon={<BookOpen className="h-5 w-5" />}
              defaultOpen={true}
            >
              <BookList
                books={state.libros.filter(book => book.estado === 'leyendo')}
                type="leyendo"
                emptyMessage="No estás leyendo ningún libro actualmente"
              />
            </CollapsibleSection>

            {/* To Be Read */}
            <CollapsibleSection
              title="Por Leer (TBR)"
              icon={<Clock className="h-5 w-5" />}
              defaultOpen={true}
            >
              <BookList
                books={state.libros.filter(book => book.estado === 'tbr')}
                type="tbr"
                emptyMessage="Tu lista de lectura está vacía"
              />
            </CollapsibleSection>

            {/* Completed Books */}
            <CollapsibleSection
              title="Libros Leídos"
              icon={<CheckCircle className="h-5 w-5" />}
              defaultOpen={false}
            >
              <BookList
                books={state.libros.filter(book => book.estado === 'leido')}
                type="leido"
                emptyMessage="Aún no has leído ningún libro"
              />
            </CollapsibleSection>

            {/* Abandoned Books */}
            <CollapsibleSection
              title="Libros Abandonados"
              icon={<XCircle className="h-5 w-5" />}
              defaultOpen={false}
            >
              <BookList
                books={state.libros.filter(book => book.estado === 'abandonado')}
                type="abandonado"
                emptyMessage="No has abandonado ningún libro"
              />
            </CollapsibleSection>
          </div>

          {/* Right Column */}
          <div className="space-y-8">
            {/* Wishlist */}
            <CollapsibleSection
              title="Wishlist"
              icon={<Heart className="h-5 w-5" />}
              defaultOpen={true}
            >
              <BookList
                books={state.libros.filter(book => book.estado === 'wishlist')}
                type="wishlist"
                emptyMessage="Tu wishlist está vacía"
              />
            </CollapsibleSection>

            {/* Sagas */}
            <CollapsibleSection
              title="Sagas"
              icon={<Users className="h-5 w-5" />}
              defaultOpen={true}
            >
              <SagaList />
            </CollapsibleSection>

            {/* Purchased Books */}
            <CollapsibleSection
              title="Libros Comprados"
              icon={<ShoppingCart className="h-5 w-5" />}
              defaultOpen={false}
            >
              <BookList
                books={state.libros.filter(book => book.estado === 'comprado')}
                type="comprado"
                emptyMessage="No has comprado ningún libro"
              />
            </CollapsibleSection>

            {/* Lent Books */}
            <CollapsibleSection
              title="Libros Prestados"
              icon={<Share2 className="h-5 w-5" />}
              defaultOpen={false}
            >
              <BookList
                books={state.libros.filter(book => book.estado === 'prestado')}
                type="prestado"
                emptyMessage="No tienes libros prestados"
              />
            </CollapsibleSection>
          </div>
        </div>
      </main>

      {/* Modals */}
      {configModalOpen && (
        <ConfigForm
          onClose={() => setConfigModalOpen(false)}
          config={state.config}
          onSave={(config) => dispatch({ type: 'SET_CONFIG', payload: config })}
        />
      )}

      {searchModalOpen && (
        <AdvancedSearch
          onClose={() => setSearchModalOpen(false)}
          books={state.libros}
          searchResults={searchResults}
          onSearchResultsChange={setSearchResults}
        />
      )}

      {statisticsModalOpen && (
        <AdvancedStatistics
          onClose={() => setStatisticsModalOpen(false)}
          books={state.libros}
          sagas={state.sagas}
        />
      )}

      {exportImportModalOpen && (
        <DataExportImport
          onClose={() => setExportImportModalOpen(false)}
          state={state}
          onImport={(data) => dispatch({ type: 'IMPORT_DATA', payload: data })}
        />
      )}

      {scanHistoryModalOpen && (
        <ScanHistory
          onClose={() => setScanHistoryModalOpen(false)}
          scanHistory={state.scanHistory}
          onClearHistory={() => dispatch({ type: 'CLEAR_SCAN_HISTORY' })}
        />
      )}

      {bulkScanModalOpen && (
        <BulkScanModal
          onClose={() => setBulkScanModalOpen(false)}
          onBooksFound={(books) => {
            books.forEach(book => dispatch({ type: 'ADD_BOOK', payload: book }));
          }}
        />
      )}

      {/* Mobile Sidebar */}
      <Sidebar
        isOpen={configSidebarOpen}
        onClose={() => setConfigSidebarOpen(false)}
        config={state.config}
        onSave={(config) => dispatch({ type: 'SET_CONFIG', payload: config })}
      />
    </div>
  );
};

export default AppContent;