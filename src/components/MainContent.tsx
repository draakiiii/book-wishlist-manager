import React, { useState } from 'react';
import { useAppState } from '../context/AppStateContext';
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
  Plus,
  Edit,
  Trash2,
  Eye,
  Download,
  Upload,
  Calendar,
  Target,
  Bookmark,
  Users as UsersIcon,
  MessageSquare,
  FileText,
  Grid,
  List,
  Image,
  BookOpen as BookOpenIcon,
  Settings as SettingsIcon,
  BarChart3 as BarChart3Icon,
  Share2 as Share2Icon,
  Target as TargetIcon,
  Bookmark as BookmarkIcon,
  Users as UsersIcon2,
  MessageSquare as MessageSquareIcon,
  FileText as FileTextIcon,
  Grid as GridIcon,
  List as ListIcon,
  Image as ImageIcon,
  BookOpen as BookOpenIcon2,
  Settings as SettingsIcon2,
  BarChart3 as BarChart3Icon2,
  Share2 as Share2Icon2,
  Target as TargetIcon2,
  Bookmark as BookmarkIcon2,
  Users as UsersIcon3,
  MessageSquare as MessageSquareIcon2,
  FileText as FileTextIcon2,
  Grid as GridIcon2,
  List as ListIcon2,
  Image as ImageIcon2,
  BookOpen as BookOpenIcon3,
  Settings as SettingsIcon3,
  BarChart3 as BarChart3Icon3,
  Share2 as Share2Icon3,
  Target as TargetIcon3,
  Bookmark as BookmarkIcon3,
  Users as UsersIcon4,
  MessageSquare as MessageSquareIcon3,
  FileText as FileTextIcon3,
  Grid as GridIcon3,
  List as ListIcon3,
  Image as ImageIcon3
} from 'lucide-react';

// Import existing components
import CollapsibleConfig from './CollapsibleConfig';
import CollapsibleSection from './CollapsibleSection';
import ProgressBar from './ProgressBar';
import WishlistForm from './WishlistForm';
import TBRForm from './TBRForm';
import BookList from './BookList';
import SagaList from './SagaList';

// Import new components
import ShareReviewModal from './ShareReviewModal';
import LoanHistoryModal from './LoanHistoryModal';
import WidgetsManager from './WidgetsManager';
import LayoutManager from './LayoutManager';
import AutomaticReports from './AutomaticReports';
import QuotesManager from './QuotesManager';
import EditionsManager from './EditionsManager';
import GalleryView from './GalleryView';
import SagaEditor from './SagaEditor';

interface MainContentProps {
  currentSection: string;
  onOpenModal: (modalType: string, data?: any) => void;
}

const MainContent: React.FC<MainContentProps> = ({ currentSection, onOpenModal }) => {
  const { state, dispatch } = useAppState();
  const [modals, setModals] = useState({
    shareReview: false,
    loanHistory: false,
    widgetsManager: false,
    layoutManager: false,
    automaticReports: false,
    quotesManager: false,
    editionsManager: false,
    galleryView: false,
    sagaEditor: false
  });
  const [selectedBook, setSelectedBook] = useState<any>(null);
  const [selectedSaga, setSelectedSaga] = useState<any>(null);

  // Filtrar libros por estado para el dashboard
  const librosTBR = state.libros.filter(libro => libro.estado === 'tbr');
  const librosLeyendo = state.libros.filter(libro => libro.estado === 'leyendo');
  const librosLeidos = state.libros.filter(libro => libro.estado === 'leido');
  const librosAbandonados = state.libros.filter(libro => libro.estado === 'abandonado');
  const librosWishlist = state.libros.filter(libro => libro.estado === 'wishlist');
  const librosPrestados = state.libros.filter(libro => libro.prestado === true);

  const openModal = (modalName: string, data?: any) => {
    setModals(prev => ({ ...prev, [modalName]: true }));
    if (data) {
      if (data.book) setSelectedBook(data.book);
      if (data.saga) setSelectedSaga(data.saga);
    }
  };

  const closeModal = (modalName: string) => {
    setModals(prev => ({ ...prev, [modalName]: false }));
    setSelectedBook(null);
    setSelectedSaga(null);
  };

  const renderContent = () => {
    // Dashboard view (original application layout)
    if (currentSection === 'dashboard') {
      return (
        <div className="space-y-4 sm:space-y-6 lg:space-y-8">
          {/* Configuration Section - Desktop Collapsible */}
          <div className="hidden lg:block">
            <CollapsibleConfig />
          </div>

          {/* Progress Section */}
          {state.config.mostrarSeccionProgreso !== false && (
            <CollapsibleSection
              title="Progreso y Puntos/Dinero"
              icon={<Trophy className="h-5 w-5" />}
              iconBgColor="bg-success-100 dark:bg-success-900/30"
              iconColor="text-success-600 dark:text-success-400"
            >
              <ProgressBar />
            </CollapsibleSection>
          )}

          {/* Wishlist Section */}
          {state.config.mostrarSeccionWishlist !== false && (
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
          )}

          {/* TBR Section */}
          {state.config.mostrarSeccionTBR !== false && (
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
          )}

          {/* Currently Reading Section */}
          {state.config.mostrarSeccionLeyendo !== false && (
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
          )}

          {/* Completed Books Section */}
          {state.config.mostrarSeccionLeidos !== false && (
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
          )}

          {/* Abandoned Books Section */}
          {state.config.mostrarSeccionAbandonados !== false && (
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
          )}

          {/* Sagas Section */}
          {state.config.mostrarSeccionSagas !== false && (
            <CollapsibleSection
              title="Mis Sagas"
              icon={<Trophy className="h-5 w-5" />}
              iconBgColor="bg-purple-100 dark:bg-purple-900/30"
              iconColor="text-purple-600 dark:text-purple-400"
            >
              <SagaList />
            </CollapsibleSection>
          )}
        </div>
      );
    }

    // Books section
    if (currentSection === 'books') {
      return (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Gestión de Libros</h2>
            <div className="flex space-x-2">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => openModal('editionsManager')}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200 flex items-center space-x-2"
              >
                <Plus className="h-4 w-4" />
                <span>Gestionar Ediciones</span>
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => openModal('quotesManager')}
                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors duration-200 flex items-center space-x-2"
              >
                <MessageSquare className="h-4 w-4" />
                <span>Gestionar Citas</span>
              </motion.button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-slate-800 rounded-lg p-6 shadow-lg">
              <h3 className="text-lg font-semibold mb-4">Estadísticas</h3>
              <div className="space-y-2">
                <p>Total: {state.libros.length}</p>
                <p>Leyendo: {librosLeyendo.length}</p>
                <p>Leídos: {librosLeidos.length}</p>
                <p>TBR: {librosTBR.length}</p>
                <p>Wishlist: {librosWishlist.length}</p>
              </div>
            </div>
            
            <div className="bg-white dark:bg-slate-800 rounded-lg p-6 shadow-lg">
              <h3 className="text-lg font-semibold mb-4">Acciones Rápidas</h3>
              <div className="space-y-2">
                <button 
                  onClick={() => onOpenModal('search')}
                  className="w-full text-left p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded"
                >
                  🔍 Búsqueda Avanzada
                </button>
                <button 
                  onClick={() => onOpenModal('bulkScan')}
                  className="w-full text-left p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded"
                >
                  📷 Escaneo Masivo
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    // Sagas section
    if (currentSection === 'sagas') {
      return (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Gestión de Sagas</h2>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => openModal('sagaEditor')}
              className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors duration-200 flex items-center space-x-2"
            >
              <Plus className="h-4 w-4" />
              <span>Crear Nueva Saga</span>
            </motion.button>
          </div>
          
          <SagaList />
        </div>
      );
    }

    // Loans section
    if (currentSection === 'loans') {
      return (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Gestión de Préstamos</h2>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => openModal('loanHistory')}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200 flex items-center space-x-2"
            >
              <History className="h-4 w-4" />
              <span>Ver Historial</span>
            </motion.button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-slate-800 rounded-lg p-6 shadow-lg">
              <h3 className="text-lg font-semibold mb-4">Préstamos Activos</h3>
              <div className="space-y-2">
                {librosPrestados.length > 0 ? (
                  librosPrestados.map(libro => (
                    <div key={libro.id} className="p-2 border rounded">
                      <p className="font-medium">{libro.titulo}</p>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        Prestado a: {libro.prestadoA || 'No especificado'}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-slate-600 dark:text-slate-400">No hay préstamos activos</p>
                )}
              </div>
            </div>
          </div>
        </div>
      );
    }

    // Quotes section
    if (currentSection === 'quotes') {
      return (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Gestión de Citas</h2>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => openModal('quotesManager')}
              className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors duration-200 flex items-center space-x-2"
            >
              <Plus className="h-4 w-4" />
              <span>Gestionar Citas</span>
            </motion.button>
          </div>
          
          <div className="bg-white dark:bg-slate-800 rounded-lg p-6 shadow-lg">
            <h3 className="text-lg font-semibold mb-4">Citas Recientes</h3>
            <div className="space-y-4">
              {state.libros.flatMap(libro => 
                libro.lecturas?.flatMap(lectura => 
                  lectura.citas?.slice(0, 3) || []
                ) || []
              ).slice(0, 5).map(cita => (
                <div key={cita.id} className="p-4 border rounded-lg">
                  <p className="italic">"{cita.texto}"</p>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
                    {cita.fecha ? new Date(cita.fecha).toLocaleDateString() : 'Sin fecha'}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      );
    }

    // Reports section
    if (currentSection === 'reports') {
      return (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Reportes y Estadísticas</h2>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => openModal('automaticReports')}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200 flex items-center space-x-2"
            >
              <BarChart3 className="h-4 w-4" />
              <span>Ver Reportes</span>
            </motion.button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-slate-800 rounded-lg p-6 shadow-lg">
              <h3 className="text-lg font-semibold mb-4">Reportes Automáticos</h3>
              <div className="space-y-2">
                <p>Mensuales: {state.reportesAutomaticos.filter(r => r.tipo === 'mensual').length}</p>
                <p>Anuales: {state.reportesAutomaticos.filter(r => r.tipo === 'anual').length}</p>
              </div>
            </div>
          </div>
        </div>
      );
    }

    // Views section
    if (currentSection === 'views') {
      return (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Vistas y Layouts</h2>
            <div className="flex space-x-2">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => openModal('galleryView')}
                className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors duration-200 flex items-center space-x-2"
              >
                <Image className="h-4 w-4" />
                <span>Vista Galería</span>
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => openModal('layoutManager')}
                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors duration-200 flex items-center space-x-2"
              >
                <Grid className="h-4 w-4" />
                <span>Gestionar Layouts</span>
              </motion.button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-slate-800 rounded-lg p-6 shadow-lg">
              <h3 className="text-lg font-semibold mb-4">Layout Actual</h3>
              <p>{state.layoutActual || 'Grid por defecto'}</p>
            </div>
          </div>
        </div>
      );
    }

    // Widgets section
    if (currentSection === 'widgets') {
      return (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Widgets Configurables</h2>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => openModal('widgetsManager')}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200 flex items-center space-x-2"
            >
              <Settings className="h-4 w-4" />
              <span>Gestionar Widgets</span>
            </motion.button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-slate-800 rounded-lg p-6 shadow-lg">
              <h3 className="text-lg font-semibold mb-4">Widgets Activos</h3>
              <div className="space-y-2">
                {state.widgets.length > 0 ? (
                  state.widgets.map(widget => (
                    <div key={widget.id} className="p-2 border rounded">
                      <p className="font-medium">{widget.titulo}</p>
                      <p className="text-sm text-slate-600 dark:text-slate-400">{widget.tipo}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-slate-600 dark:text-slate-400">No hay widgets configurados</p>
                )}
              </div>
            </div>
          </div>
        </div>
      );
    }

    // Sharing section
    if (currentSection === 'sharing') {
      return (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Compartir y Social</h2>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => openModal('shareReview')}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200 flex items-center space-x-2"
            >
              <Share2 className="h-4 w-4" />
              <span>Compartir Reseña</span>
            </motion.button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-slate-800 rounded-lg p-6 shadow-lg">
              <h3 className="text-lg font-semibold mb-4">Redes Sociales</h3>
              <div className="space-y-2">
                <button className="w-full text-left p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded">
                  📘 Facebook
                </button>
                <button className="w-full text-left p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded">
                  🐦 Twitter
                </button>
                <button className="w-full text-left p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded">
                  📷 Instagram
                </button>
                <button className="w-full text-left p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded">
                  📚 Goodreads
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    // Goals section
    if (currentSection === 'goals') {
      return (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Metas y Objetivos</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-slate-800 rounded-lg p-6 shadow-lg">
              <h3 className="text-lg font-semibold mb-4">Metas de Lectura</h3>
                                   <div className="space-y-2">
                       <p>Libros objetivo: {state.config.objetivoLecturaAnual || 'No establecida'}</p>
                       <p>Páginas objetivo: No configurada</p>
                     </div>
            </div>
          </div>
        </div>
      );
    }

    // Default case
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          Sección no encontrada
        </h2>
        <p className="text-slate-600 dark:text-slate-400">
          La sección "{currentSection}" no está disponible.
        </p>
      </div>
    );
  };

  return (
    <>
      {renderContent()}

      {/* Modals */}
      <ShareReviewModal
        isOpen={modals.shareReview}
        onClose={() => closeModal('shareReview')}
        resena={selectedBook ? {
          id: selectedBook.id,
          libroId: selectedBook.id,
          titulo: selectedBook.titulo,
          autor: selectedBook.autor || 'Autor desconocido',
          calificacion: selectedBook.calificacion || 0,
          reseña: selectedBook.reseña || 'Sin reseña',
          fecha: Date.now(),
          citas: [],
          etiquetas: [],
          publica: true,
          redesSociales: {
            twitter: false,
            facebook: false,
            instagram: false,
            goodreads: false
          }
        } : {
          id: 0,
          libroId: 0,
          titulo: '',
          autor: '',
          calificacion: 0,
          reseña: '',
          fecha: Date.now(),
          citas: [],
          etiquetas: [],
          publica: true,
          redesSociales: {
            twitter: false,
            facebook: false,
            instagram: false,
            goodreads: false
          }
        }}
        onShare={(redes) => {
          console.log('Compartiendo en:', redes);
          closeModal('shareReview');
        }}
      />

      <LoanHistoryModal
        isOpen={modals.loanHistory}
        onClose={() => closeModal('loanHistory')}
      />

      <WidgetsManager
        isOpen={modals.widgetsManager}
        onClose={() => closeModal('widgetsManager')}
      />

      <LayoutManager
        isOpen={modals.layoutManager}
        onClose={() => closeModal('layoutManager')}
      />

      <AutomaticReports
        isOpen={modals.automaticReports}
        onClose={() => closeModal('automaticReports')}
      />

      <QuotesManager
        isOpen={modals.quotesManager}
        onClose={() => closeModal('quotesManager')}
        libroId={selectedBook?.id}
      />

      <EditionsManager
        isOpen={modals.editionsManager}
        onClose={() => closeModal('editionsManager')}
        libroId={selectedBook?.id}
      />

      {modals.galleryView && (
        <GalleryView
          libros={state.libros}
          onBookClick={(libro) => {
            console.log('Libro clickeado:', libro);
            closeModal('galleryView');
          }}
          onBookAction={(libro, action) => {
            console.log('Acción en libro:', action, libro);
          }}
        />
      )}

      <SagaEditor
        isOpen={modals.sagaEditor}
        onClose={() => closeModal('sagaEditor')}
        sagaId={selectedSaga?.id}
      />
    </>
  );
};

export default MainContent;