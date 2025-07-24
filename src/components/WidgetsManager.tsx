import React, { useState } from 'react';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import { 
  X, 
  Plus, 
  Settings, 
  Eye, 
  EyeOff, 
  GripVertical,
  BarChart3,
  Target,
  BookOpen,
  BookMarked,
  Heart,
  Users,
  FileText,
  Trash2,
  Save,
  Cancel
} from 'lucide-react';
import { useAppState } from '../context/AppStateContext';
import { Widget } from '../types';

interface WidgetsManagerProps {
  isOpen: boolean;
  onClose: () => void;
}

const WidgetsManager: React.FC<WidgetsManagerProps> = ({ isOpen, onClose }) => {
  const { state, dispatch } = useAppState();
  const [editingWidget, setEditingWidget] = useState<string | null>(null);
  const [newWidget, setNewWidget] = useState<Partial<Widget> | null>(null);

  const widgetTypes = [
    { 
      id: 'estadisticas', 
      name: 'Estadísticas', 
      icon: BarChart3, 
      description: 'Muestra estadísticas generales de tu biblioteca',
      defaultConfig: { mostrarGraficos: true, mostrarNumeros: true }
    },
    { 
      id: 'objetivos', 
      name: 'Objetivos', 
      icon: Target, 
      description: 'Progreso de tus objetivos de lectura',
      defaultConfig: { mostrarProgreso: true, mostrarFecha: true }
    },
    { 
      id: 'proximasLecturas', 
      name: 'Próximas Lecturas', 
      icon: BookOpen, 
      description: 'Libros que planeas leer próximamente',
      defaultConfig: { maxLibros: 5, mostrarPortadas: true }
    },
    { 
      id: 'sagas', 
      name: 'Sagas', 
      icon: BookMarked, 
      description: 'Estado de tus sagas favoritas',
      defaultConfig: { mostrarProgreso: true, maxSagas: 3 }
    },
    { 
      id: 'wishlist', 
      name: 'Lista de Deseos', 
      icon: Heart, 
      description: 'Libros que quieres comprar',
      defaultConfig: { maxLibros: 5, mostrarPrecios: true }
    },
    { 
      id: 'prestamos', 
      name: 'Préstamos', 
      icon: Users, 
      description: 'Libros prestados y por devolver',
      defaultConfig: { mostrarFechas: true, maxPrestamos: 5 }
    },
    { 
      id: 'reportes', 
      name: 'Reportes', 
      icon: FileText, 
      description: 'Reportes automáticos y estadísticas',
      defaultConfig: { mostrarMensual: true, mostrarAnual: true }
    }
  ];

  const handleReorder = (newOrder: Widget[]) => {
    const orden = newOrder.map(widget => widget.id);
    dispatch({ type: 'REORDER_WIDGETS', payload: { orden } });
  };

  const handleToggleVisibility = (widgetId: string) => {
    const widget = state.widgets.find(w => w.id === widgetId);
    if (widget) {
      dispatch({ 
        type: 'UPDATE_WIDGET', 
        payload: { 
          id: widgetId, 
          updates: { visible: !widget.visible } 
        } 
      });
    }
  };

  const handleEditWidget = (widgetId: string) => {
    setEditingWidget(widgetId);
  };

  const handleSaveWidget = (widgetId: string, updates: Partial<Widget>) => {
    dispatch({ 
      type: 'UPDATE_WIDGET', 
      payload: { id: widgetId, updates } 
    });
    setEditingWidget(null);
  };

  const handleCancelEdit = () => {
    setEditingWidget(null);
    setNewWidget(null);
  };

  const handleAddWidget = () => {
    const availableTypes = widgetTypes.filter(type => 
      !state.widgets.some(widget => widget.tipo === type.id)
    );
    
    if (availableTypes.length > 0) {
      const firstAvailable = availableTypes[0];
      setNewWidget({
        tipo: firstAvailable.id as any,
        titulo: firstAvailable.name,
        visible: true,
        orden: state.widgets.length + 1,
        configuracion: firstAvailable.defaultConfig
      });
    }
  };

  const handleSaveNewWidget = () => {
    if (newWidget && newWidget.tipo && newWidget.titulo) {
      dispatch({ 
        type: 'ADD_WIDGET', 
        payload: {
          id: `${newWidget.tipo}-${Date.now()}`,
          tipo: newWidget.tipo,
          titulo: newWidget.titulo,
          visible: newWidget.visible || true,
          orden: newWidget.orden || state.widgets.length + 1,
          configuracion: newWidget.configuracion
        } as Widget
      });
      setNewWidget(null);
    }
  };

  const handleDeleteWidget = (widgetId: string) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este widget?')) {
      dispatch({ type: 'DELETE_WIDGET', payload: { id: widgetId } });
    }
  };

  const getWidgetIcon = (tipo: string) => {
    const widgetType = widgetTypes.find(wt => wt.id === tipo);
    return widgetType ? widgetType.icon : BarChart3;
  };

  const getWidgetDescription = (tipo: string) => {
    const widgetType = widgetTypes.find(wt => wt.id === tipo);
    return widgetType ? widgetType.description : '';
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Gestión de Widgets
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            {/* Add New Widget */}
            {newWidget ? (
              <div className="mb-6 p-4 border border-blue-200 dark:border-blue-700 rounded-lg bg-blue-50 dark:bg-blue-900/20">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                  Añadir Nuevo Widget
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Tipo de Widget
                    </label>
                    <select
                      value={newWidget.tipo || ''}
                      onChange={(e) => {
                        const selectedType = widgetTypes.find(wt => wt.id === e.target.value);
                        setNewWidget(prev => ({
                          ...prev,
                          tipo: e.target.value as any,
                          titulo: selectedType?.name || '',
                          configuracion: selectedType?.defaultConfig
                        }));
                      }}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    >
                      {widgetTypes
                        .filter(type => !state.widgets.some(widget => widget.tipo === type.id))
                        .map(type => (
                          <option key={type.id} value={type.id}>
                            {type.name}
                          </option>
                        ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Título
                    </label>
                    <input
                      type="text"
                      value={newWidget.titulo || ''}
                      onChange={(e) => setNewWidget(prev => ({ ...prev, titulo: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                </div>
                
                <div className="flex gap-3 mt-4">
                  <button
                    onClick={handleSaveNewWidget}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  >
                    <Save className="w-4 h-4" />
                    Guardar
                  </button>
                  <button
                    onClick={handleCancelEdit}
                    className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <Cancel className="w-4 h-4" />
                    Cancelar
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={handleAddWidget}
                className="mb-6 flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Añadir Widget
              </button>
            )}

            {/* Widgets List */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Widgets Configurados ({state.widgets.length})
              </h3>
              
              <Reorder.Group
                axis="y"
                values={state.widgets}
                onReorder={handleReorder}
                className="space-y-3"
              >
                {state.widgets.map((widget) => {
                  const Icon = getWidgetIcon(widget.tipo);
                  const isEditing = editingWidget === widget.id;
                  
                  return (
                    <Reorder.Item
                      key={widget.id}
                      value={widget}
                      className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 flex-1">
                          <GripVertical className="w-5 h-5 text-gray-400 cursor-move" />
                          
                          <div className="flex items-center gap-3">
                            <Icon className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                            
                            {isEditing ? (
                              <input
                                type="text"
                                value={widget.titulo}
                                onChange={(e) => {
                                  dispatch({
                                    type: 'UPDATE_WIDGET',
                                    payload: {
                                      id: widget.id,
                                      updates: { titulo: e.target.value }
                                    }
                                  });
                                }}
                                className="px-2 py-1 border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-600 dark:text-white"
                              />
                            ) : (
                              <div>
                                <h4 className="font-medium text-gray-900 dark:text-white">
                                  {widget.titulo}
                                </h4>
                                <p className="text-sm text-gray-600 dark:text-gray-300">
                                  {getWidgetDescription(widget.tipo)}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          {/* Visibility Toggle */}
                          <button
                            onClick={() => handleToggleVisibility(widget.id)}
                            className={`p-2 rounded-md transition-colors ${
                              widget.visible
                                ? 'text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20'
                                : 'text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-600'
                            }`}
                            title={widget.visible ? 'Ocultar widget' : 'Mostrar widget'}
                          >
                            {widget.visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                          </button>
                          
                          {/* Edit Button */}
                          <button
                            onClick={() => handleEditWidget(widget.id)}
                            className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-md transition-colors"
                            title="Editar widget"
                          >
                            <Settings className="w-4 h-4" />
                          </button>
                          
                          {/* Delete Button */}
                          <button
                            onClick={() => handleDeleteWidget(widget.id)}
                            className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors"
                            title="Eliminar widget"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      
                      {/* Configuration Panel */}
                      {isEditing && (
                        <div className="mt-4 p-4 bg-white dark:bg-gray-600 rounded-lg border border-gray-200 dark:border-gray-500">
                          <h5 className="font-medium text-gray-900 dark:text-white mb-3">
                            Configuración
                          </h5>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {widget.configuracion && Object.entries(widget.configuracion).map(([key, value]) => (
                              <div key={key}>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                  {key}
                                </label>
                                {typeof value === 'boolean' ? (
                                  <input
                                    type="checkbox"
                                    checked={value}
                                    onChange={(e) => {
                                      const newConfig = {
                                        ...widget.configuracion,
                                        [key]: e.target.checked
                                      };
                                      dispatch({
                                        type: 'UPDATE_WIDGET',
                                        payload: {
                                          id: widget.id,
                                          updates: { configuracion: newConfig }
                                        }
                                      });
                                    }}
                                    className="rounded border-gray-300 dark:border-gray-600"
                                  />
                                ) : (
                                  <input
                                    type="number"
                                    value={value}
                                    onChange={(e) => {
                                      const newConfig = {
                                        ...widget.configuracion,
                                        [key]: parseInt(e.target.value)
                                      };
                                      dispatch({
                                        type: 'UPDATE_WIDGET',
                                        payload: {
                                          id: widget.id,
                                          updates: { configuracion: newConfig }
                                        }
                                      });
                                    }}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-600 dark:text-white"
                                  />
                                )}
                              </div>
                            ))}
                          </div>
                          
                          <div className="flex gap-3 mt-4">
                            <button
                              onClick={() => setEditingWidget(null)}
                              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                            >
                              Guardar
                            </button>
                            <button
                              onClick={handleCancelEdit}
                              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                            >
                              Cancelar
                            </button>
                          </div>
                        </div>
                      )}
                    </Reorder.Item>
                  );
                })}
              </Reorder.Group>
              
              {state.widgets.length === 0 && (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <Settings className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No hay widgets configurados</p>
                  <p className="text-sm">Añade widgets para personalizar tu dashboard</p>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default WidgetsManager;