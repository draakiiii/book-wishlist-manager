import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Grid3X3,
  List,
  Image,
  BookOpen,
  Settings,
  Plus,
  Save,
  Trash2,
  Eye,
  Check
} from 'lucide-react';
import { useAppState } from '../context/AppStateContext';
import { Layout } from '../types';

interface LayoutManagerProps {
  isOpen: boolean;
  onClose: () => void;
}

const LayoutManager: React.FC<LayoutManagerProps> = ({ isOpen, onClose }) => {
  const { state, dispatch } = useAppState();
  const [editingLayout, setEditingLayout] = useState<string | null>(null);
  const [newLayout, setNewLayout] = useState<Partial<Layout> | null>(null);

  const layoutTypes = [
    { 
      id: 'grid', 
      name: 'Cuadrícula', 
      icon: Grid3X3, 
      description: 'Libros organizados en una cuadrícula uniforme',
      defaultConfig: {
        columnas: 3,
        tamañoTarjetas: 'mediano',
        mostrarPortadas: true,
        mostrarDetalles: true
      }
    },
    { 
      id: 'lista', 
      name: 'Lista', 
      icon: List, 
      description: 'Libros en formato de lista vertical',
      defaultConfig: {
        mostrarPortadas: true,
        mostrarDetalles: true
      }
    },
    { 
      id: 'galeria', 
      name: 'Galería', 
      icon: Image, 
      description: 'Enfoque en las portadas de los libros',
      defaultConfig: {
        columnas: 4,
        tamañoTarjetas: 'grande',
        mostrarPortadas: true,
        mostrarDetalles: false
      }
    },
    { 
      id: 'estanteria', 
      name: 'Estantería', 
      icon: BookOpen, 
      description: 'Simula una estantería real con libros apilados',
      defaultConfig: {
        mostrarPortadas: true,
        mostrarDetalles: true
      }
    }
  ];

  const handleSetActiveLayout = (layoutId: string) => {
    dispatch({ type: 'SET_LAYOUT_ACTUAL', payload: { id: layoutId } });
  };

  const handleEditLayout = (layoutId: string) => {
    setEditingLayout(layoutId);
  };

  const handleSaveLayout = (layoutId: string, updates: Partial<Layout>) => {
    dispatch({ 
      type: 'UPDATE_LAYOUT', 
      payload: { id: layoutId, updates } 
    });
    setEditingLayout(null);
  };

  const handleCancelEdit = () => {
    setEditingLayout(null);
    setNewLayout(null);
  };

  const handleAddLayout = () => {
    const firstType = layoutTypes[0];
    setNewLayout({
      tipo: firstType.id as any,
      nombre: `Nuevo ${firstType.name}`,
      configuracion: firstType.defaultConfig as any
    });
  };

  const handleSaveNewLayout = () => {
    if (newLayout && newLayout.tipo && newLayout.nombre) {
      const layoutType = layoutTypes.find(lt => lt.id === newLayout.tipo);
      dispatch({ 
        type: 'ADD_LAYOUT', 
        payload: {
          id: `custom-${Date.now()}`,
          tipo: newLayout.tipo,
          nombre: newLayout.nombre,
          configuracion: newLayout.configuracion || layoutType?.defaultConfig as any || {}
        } as Layout
      });
      setNewLayout(null);
    }
  };

  const handleDeleteLayout = (layoutId: string) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este layout?')) {
      dispatch({ type: 'DELETE_LAYOUT', payload: { id: layoutId } });
    }
  };

  const getLayoutIcon = (tipo: string) => {
    const layoutType = layoutTypes.find(lt => lt.id === tipo);
    return layoutType ? layoutType.icon : Grid3X3;
  };

  const getLayoutDescription = (tipo: string) => {
    const layoutType = layoutTypes.find(lt => lt.id === tipo);
    return layoutType ? layoutType.description : '';
  };

  const renderLayoutPreview = (layout: Layout) => {
    const Icon = getLayoutIcon(layout.tipo);
    
    return (
      <div className="p-4 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700">
        <div className="flex items-center gap-2 mb-3">
          <Icon className="w-4 h-4 text-gray-600 dark:text-gray-300" />
          <span className="text-sm font-medium text-gray-900 dark:text-white">
            Vista previa
          </span>
        </div>
        
        <div className={`grid gap-2 ${
          layout.tipo === 'galeria' ? 'grid-cols-4' :
          layout.tipo === 'grid' ? `grid-cols-${layout.configuracion.columnas || 3}` :
          'grid-cols-1'
        }`}>
          {[1, 2, 3, 4].map(i => (
            <div 
              key={i}
              className={`bg-white dark:bg-gray-600 rounded border ${
                layout.tipo === 'galeria' ? 'aspect-[3/4]' :
                layout.tipo === 'lista' ? 'h-16' :
                'aspect-[2/3]'
              }`}
            >
              <div className="w-full h-full bg-gray-200 dark:bg-gray-500 rounded flex items-center justify-center">
                <span className="text-xs text-gray-500 dark:text-gray-400">Libro {i}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  if (!isOpen) return null;

  return (
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
          className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Gestión de Layouts
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
            {/* Add New Layout */}
            {newLayout ? (
              <div className="mb-6 p-4 border border-blue-200 dark:border-blue-700 rounded-lg bg-blue-50 dark:bg-blue-900/20">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                  Crear Nuevo Layout
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Tipo de Layout
                    </label>
                    <select
                      value={newLayout.tipo || ''}
                      onChange={(e) => {
                        const selectedType = layoutTypes.find(lt => lt.id === e.target.value);
                        setNewLayout(prev => ({
                          ...prev,
                          tipo: e.target.value as any,
                          configuracion: selectedType?.defaultConfig as any
                        }));
                      }}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    >
                      {layoutTypes.map(type => (
                        <option key={type.id} value={type.id}>
                          {type.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Nombre
                    </label>
                    <input
                      type="text"
                      value={newLayout.nombre || ''}
                      onChange={(e) => setNewLayout(prev => ({ ...prev, nombre: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                </div>
                
                <div className="flex gap-3 mt-4">
                  <button
                    onClick={handleSaveNewLayout}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  >
                    <Save className="w-4 h-4" />
                    Crear Layout
                  </button>
                  <button
                    onClick={handleCancelEdit}
                    className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <X className="w-4 h-4" />
                    Cancelar
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={handleAddLayout}
                className="mb-6 flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Crear Layout Personalizado
              </button>
            )}

            {/* Layouts Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {state.layouts.map((layout) => {
                const Icon = getLayoutIcon(layout.tipo);
                const isActive = state.layoutActual === layout.id;
                const isEditing = editingLayout === layout.id;
                
                return (
                  <div
                    key={layout.id}
                    className={`border rounded-lg overflow-hidden transition-all duration-200 ${
                      isActive 
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                        : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                    }`}
                  >
                    {/* Layout Header */}
                    <div className="p-4 border-b border-gray-200 dark:border-gray-600">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Icon className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                          {isEditing ? (
                            <input
                              type="text"
                              value={layout.nombre}
                              onChange={(e) => {
                                dispatch({
                                  type: 'UPDATE_LAYOUT',
                                  payload: {
                                    id: layout.id,
                                    updates: { nombre: e.target.value }
                                  }
                                });
                              }}
                              className="px-2 py-1 border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-600 dark:text-white"
                            />
                          ) : (
                            <h3 className="font-medium text-gray-900 dark:text-white">
                              {layout.nombre}
                            </h3>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-1">
                          {isActive && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          )}
                          <button
                            onClick={() => handleEditLayout(layout.id)}
                            className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                            title="Editar layout"
                          >
                            <Settings className="w-4 h-4" />
                          </button>
                          {!layout.id.startsWith('default-') && (
                            <button
                              onClick={() => handleDeleteLayout(layout.id)}
                              className="p-1 text-red-400 hover:text-red-600 transition-colors"
                              title="Eliminar layout"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                      
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        {getLayoutDescription(layout.tipo)}
                      </p>
                    </div>

                    {/* Layout Preview */}
                    <div className="p-4">
                      {renderLayoutPreview(layout)}
                    </div>

                    {/* Layout Actions */}
                    <div className="p-4 border-t border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {isActive ? (
                            <div className="flex items-center gap-1 text-blue-600">
                              <Check className="w-4 h-4" />
                              <span className="text-sm font-medium">Activo</span>
                            </div>
                          ) : (
                            <button
                              onClick={() => handleSetActiveLayout(layout.id)}
                              className="text-sm text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                            >
                              Activar
                            </button>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                          <span>Tipo: {layout.tipo}</span>
                          {layout.configuracion.columnas && (
                            <span>• {layout.configuracion.columnas} cols</span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Configuration Panel */}
                    {isEditing && (
                      <div className="p-4 border-t border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-600">
                        <h5 className="font-medium text-gray-900 dark:text-white mb-3">
                          Configuración
                        </h5>
                        
                        <div className="space-y-3">
                          {layout.configuracion.columnas !== undefined && (
                            <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Columnas
                              </label>
                              <input
                                type="number"
                                min="1"
                                max="6"
                                value={layout.configuracion.columnas}
                                onChange={(e) => {
                                  const newConfig = {
                                    ...layout.configuracion,
                                    columnas: parseInt(e.target.value)
                                  };
                                  dispatch({
                                    type: 'UPDATE_LAYOUT',
                                    payload: {
                                      id: layout.id,
                                      updates: { configuracion: newConfig }
                                    }
                                  });
                                }}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-600 dark:text-white"
                              />
                            </div>
                          )}
                          
                          {layout.configuracion.tamañoTarjetas && (
                            <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Tamaño de tarjetas
                              </label>
                              <select
                                value={layout.configuracion.tamañoTarjetas}
                                onChange={(e) => {
                                  const newConfig = {
                                    ...layout.configuracion,
                                    tamañoTarjetas: e.target.value as any
                                  };
                                  dispatch({
                                    type: 'UPDATE_LAYOUT',
                                    payload: {
                                      id: layout.id,
                                      updates: { configuracion: newConfig }
                                    }
                                  });
                                }}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-600 dark:text-white"
                              >
                                <option value="pequeño">Pequeño</option>
                                <option value="mediano">Mediano</option>
                                <option value="grande">Grande</option>
                              </select>
                            </div>
                          )}
                          
                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              id={`show-covers-${layout.id}`}
                              checked={layout.configuracion.mostrarPortadas}
                              onChange={(e) => {
                                const newConfig = {
                                  ...layout.configuracion,
                                  mostrarPortadas: e.target.checked
                                };
                                dispatch({
                                  type: 'UPDATE_LAYOUT',
                                  payload: {
                                    id: layout.id,
                                    updates: { configuracion: newConfig }
                                  }
                                });
                              }}
                              className="rounded border-gray-300 dark:border-gray-600"
                            />
                            <label htmlFor={`show-covers-${layout.id}`} className="text-sm text-gray-700 dark:text-gray-300">
                              Mostrar portadas
                            </label>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              id={`show-details-${layout.id}`}
                              checked={layout.configuracion.mostrarDetalles}
                              onChange={(e) => {
                                const newConfig = {
                                  ...layout.configuracion,
                                  mostrarDetalles: e.target.checked
                                };
                                dispatch({
                                  type: 'UPDATE_LAYOUT',
                                  payload: {
                                    id: layout.id,
                                    updates: { configuracion: newConfig }
                                  }
                                });
                              }}
                              className="rounded border-gray-300 dark:border-gray-600"
                            />
                            <label htmlFor={`show-details-${layout.id}`} className="text-sm text-gray-700 dark:text-gray-300">
                              Mostrar detalles
                            </label>
                          </div>
                        </div>
                        
                        <div className="flex gap-3 mt-4">
                          <button
                            onClick={() => setEditingLayout(null)}
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
                  </div>
                );
              })}
            </div>
          </div>
        </motion.div>
      </motion.div>
  );
};

export default LayoutManager;