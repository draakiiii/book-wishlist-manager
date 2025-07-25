import React from 'react';
import { 
  Heart, 
  Clock, 
  Trophy, 
  BookOpen,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { useAppState } from '../context/AppStateContext';
import CollapsibleConfig from './CollapsibleConfig';
import CollapsibleSection from './CollapsibleSection';
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
};

export default Dashboard;