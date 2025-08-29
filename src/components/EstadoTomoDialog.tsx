import React, { useState } from 'react';
import { X, CheckCircle, BookOpen, ShoppingCart } from 'lucide-react';

interface EstadoTomoDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (estado: 'comprado' | 'leyendo' | 'leido') => void;
  cantidadTomos: number;
  rangoInicio: number;
  rangoFin: number;
}

const EstadoTomoDialog: React.FC<EstadoTomoDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  cantidadTomos,
  rangoInicio,
  rangoFin
}) => {
  const [estadoSeleccionado, setEstadoSeleccionado] = useState<'comprado' | 'leyendo' | 'leido'>('comprado');

  if (!isOpen) return null;

  const handleConfirm = () => {
    onConfirm(estadoSeleccionado);
    onClose();
  };

  const getEstadoInfo = (estado: 'comprado' | 'leyendo' | 'leido') => {
    switch (estado) {
      case 'comprado':
        return {
          icon: ShoppingCart,
          color: 'bg-yellow-500',
          title: 'Comprado',
          description: 'Tomo adquirido pero no leído'
        };
      case 'leyendo':
        return {
          icon: BookOpen,
          color: 'bg-orange-500',
          title: 'Leyendo',
          description: 'Actualmente en lectura'
        };
      case 'leido':
        return {
          icon: CheckCircle,
          color: 'bg-green-500',
          title: 'Leído',
          description: 'Tomo completado'
        };
    }
  };

  const estadoInfo = getEstadoInfo(estadoSeleccionado);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Seleccionar Estado
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Contenido */}
        <div className="mb-6">
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Se van a añadir <span className="font-semibold">{cantidadTomos} tomos</span> del {rangoInicio} al {rangoFin}.
          </p>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Selecciona en qué estado quieres que se añadan:
          </p>

          {/* Opciones de estado */}
          <div className="space-y-3">
            {(['comprado', 'leyendo', 'leido'] as const).map((estado) => {
              const info = getEstadoInfo(estado);
              return (
                <label
                  key={estado}
                  className={`flex items-center p-3 border-2 rounded-lg cursor-pointer transition-colors ${
                    estadoSeleccionado === estado
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                  }`}
                >
                  <input
                    type="radio"
                    name="estado"
                    value={estado}
                    checked={estadoSeleccionado === estado}
                    onChange={(e) => setEstadoSeleccionado(e.target.value as 'comprado' | 'leyendo' | 'leido')}
                    className="sr-only"
                  />
                  <div className={`w-4 h-4 rounded-full border-2 mr-3 ${
                    estadoSeleccionado === estado
                      ? 'border-blue-500 bg-blue-500'
                      : 'border-gray-300 dark:border-gray-600'
                  }`}>
                    {estadoSeleccionado === estado && (
                      <div className="w-full h-full rounded-full bg-white scale-75"></div>
                    )}
                  </div>
                  <div className="flex items-center flex-1">
                    <div className={`inline-flex items-center justify-center w-8 h-8 rounded-lg ${info.color} mr-3`}>
                      <info.icon className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">
                        {info.title}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {info.description}
                      </div>
                    </div>
                  </div>
                </label>
              );
            })}
          </div>
        </div>

        {/* Botones */}
        <div className="flex space-x-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleConfirm}
            className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            Confirmar
          </button>
        </div>
      </div>
    </div>
  );
};

export default EstadoTomoDialog;