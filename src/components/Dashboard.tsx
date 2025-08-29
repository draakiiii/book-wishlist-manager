import React from 'react';
import { 
  Heart, 
  Clock, 
  Trophy, 
  BookOpen,
  CheckCircle,
  XCircle,
  BookOpen as BookOpenIcon
} from 'lucide-react';
import { useAppState } from '../context/AppStateContext';
import CollapsibleConfig from './CollapsibleConfig';
import CollapsibleSection from './CollapsibleSection';
import CollapsibleBookList from './CollapsibleBookList';
import ProgressBar from './ProgressBar';
import WishlistForm from './WishlistForm';
import TBRForm from './TBRForm';
import BookList from './BookList';
import SagaList from './SagaList';

const Dashboard: React.FC = () => {
  const { state } = useAppState();

  // Filtrar libros por estado
  const librosTBR = state.libros.filter(libro => libro.estado === 'tbr');
  const librosLeyendo = state.libros.filter(libro => libro.estado === 'leyendo');
  const librosLeidos = state.libros.filter(libro => libro.estado === 'leido');
  const librosAbandonados = state.libros.filter(libro => libro.estado === 'abandonado');
  const librosWishlist = state.libros.filter(libro => libro.estado === 'wishlist');

  // Filtrar colecciones de manga por estado
  const coleccionesMangaCompletadas = state.coleccionesManga.filter(c => c.isComplete);
  const coleccionesMangaActivas = state.coleccionesManga.filter(c => !c.isComplete);

  return (
    <div className="space-y-4 sm:space-y-6 lg:space-y-8">
      {/* Configuration Section - Desktop Collapsible */}
      <div className="hidden lg:block">
        <CollapsibleConfig />
      </div>

      {/* Progress Section */}
      {state.config.mostrarSeccionProgreso !== false && state.config.sistemaPuntosHabilitado && (
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
          <CollapsibleBookList 
            books={librosWishlist}
            type="wishlist"
            emptyMessage="Tu lista de deseos está vacía."
            sectionName="wishlist"
          />
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
          <CollapsibleBookList 
            books={librosTBR}
            type="tbr"
            emptyMessage="Tu pila está vacía."
            sectionName="tbr"
          />
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
          <CollapsibleBookList 
            books={librosLeyendo}
            type="leyendo"
            emptyMessage="No estás leyendo ningún libro actualmente."
            sectionName="leyendo"
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
          <CollapsibleBookList 
            books={librosLeidos}
            type="leido"
            emptyMessage="Aún no has terminado ningún libro."
            sectionName="leidos"
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
          <CollapsibleBookList 
            books={librosAbandonados}
            type="abandonado"
            emptyMessage="No has abandonado ningún libro."
            sectionName="abandonados"
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

      {/* Manga Section */}
      {state.config.mostrarSeccionManga !== false && (
        <CollapsibleSection
          title="Colecciones de Manga"
          icon={<BookOpenIcon className="h-5 w-5" />}
          iconBgColor="bg-indigo-100 dark:bg-indigo-900/30"
          iconColor="text-indigo-600 dark:text-indigo-400"
        >
          <div className="space-y-4">
            {/* Resumen de manga */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                  {state.coleccionesManga.length}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Colecciones</div>
              </div>
              <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {coleccionesMangaCompletadas.length}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Completadas</div>
              </div>
              <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {state.coleccionesManga.reduce((sum, c) => sum + c.tomosLeidos, 0)}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Tomos leídos</div>
              </div>
            </div>

            {/* Colecciones activas */}
            {coleccionesMangaActivas.length > 0 && (
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-3">Colecciones en progreso</h4>
                <div className="space-y-2">
                  {coleccionesMangaActivas.slice(0, 3).map(coleccion => (
                    <div key={coleccion.id} className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                      <div className="flex justify-between items-center">
                        <span className="font-medium text-gray-900 dark:text-white">{coleccion.titulo}</span>
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {coleccion.tomosLeidos}/{coleccion.totalTomos}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2 mt-2">
                        <div 
                          className="bg-indigo-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${(coleccion.tomosLeidos / coleccion.totalTomos) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Colecciones completadas */}
            {coleccionesMangaCompletadas.length > 0 && (
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-3">Colecciones completadas</h4>
                <div className="space-y-2">
                  {coleccionesMangaCompletadas.slice(0, 3).map(coleccion => (
                    <div key={coleccion.id} className="bg-green-50 dark:bg-green-900/30 p-3 rounded-lg border border-green-200 dark:border-green-700">
                      <div className="flex justify-between items-center">
                        <span className="font-medium text-gray-900 dark:text-white">{coleccion.titulo}</span>
                        <span className="text-sm text-green-600 dark:text-green-400 flex items-center">
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Completada
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {state.coleccionesManga.length === 0 && (
              <div className="text-center py-8">
                <BookOpenIcon className="w-16 h-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  No hay colecciones de manga
                </h3>
                <p className="text-gray-500 dark:text-gray-400">
                  Comienza añadiendo tu primera colección de manga
                </p>
              </div>
            )}
          </div>
        </CollapsibleSection>
      )}
    </div>
  );
};

export default Dashboard;