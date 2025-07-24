import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import { 
  X, 
  Plus, 
  BookOpen, 
  Edit, 
  Trash2, 
  Save,
  GripVertical,
  Search,
  Check,
  AlertCircle,
  BookMarked,
  Calendar,
  Star,
  ArrowUp,
  ArrowDown
} from 'lucide-react';
import { useAppState } from '../context/AppStateContext';
import { Saga, Libro } from '../types';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface SagaEditorProps {
  isOpen: boolean;
  onClose: () => void;
  sagaId?: number; // Si se proporciona, edita la saga existente
}

const SagaEditor: React.FC<SagaEditorProps> = ({ isOpen, onClose, sagaId }) => {
  const { state, dispatch } = useAppState();
  const [searchTerm, setSearchTerm] = useState('');
  const [editingSaga, setEditingSaga] = useState<Saga | null>(sagaId ? state.sagas.find(s => s.id === sagaId) || null : null);
  const [newSaga, setNewSaga] = useState<Partial<Saga> | null>(sagaId ? null : {
    nombre: '',
    descripcion: '',
    genero: '',
    autor: '',
    totalLibros: 0,
    libros: [],
    fechaInicio: Date.now(),
    fechaCompletado: undefined,
    isComplete: false,
    notas: ''
  });

  const availableBooks = useMemo(() => {
    return state.libros.filter(libro => 
      !state.sagas.some(saga => 
        saga.id !== sagaId && saga.libros.includes(libro.id)
      ) && (
        !searchTerm || 
        libro.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        libro.autor?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  }, [state.libros, state.sagas, sagaId, searchTerm]);

  const handleSaveSaga = () => {
    if (editingSaga) {
      // Actualizar saga existente
      dispatch({
        type: 'UPDATE_SAGA',
        payload: {
          id: editingSaga.id,
          updates: editingSaga
        }
      });
      setEditingSaga(null);
      onClose();
    } else if (newSaga && newSaga.nombre) {
      // Crear nueva saga
      const saga: Saga = {
        id: Date.now(),
        nombre: newSaga.nombre,
        descripcion: newSaga.descripcion || '',
        genero: newSaga.genero || '',
        autor: newSaga.autor || '',
        totalLibros: newSaga.totalLibros || 0,
        libros: newSaga.libros || [],
        fechaInicio: newSaga.fechaInicio || Date.now(),
        fechaCompletado: newSaga.fechaCompletado,
        isComplete: newSaga.isComplete || false,
        notas: newSaga.notas || ''
      };
      
      dispatch({
        type: 'ADD_SAGA',
        payload: saga
      });
      setNewSaga(null);
      onClose();
    }
  };

  const handleCancel = () => {
    setEditingSaga(null);
    setNewSaga(null);
    onClose();
  };

  const handleAddBookToSaga = (libroId: number) => {
    if (editingSaga) {
      setEditingSaga(prev => prev ? {
        ...prev,
        libros: [...prev.libros, libroId]
      } : null);
    } else if (newSaga) {
      setNewSaga(prev => prev ? {
        ...prev,
        libros: [...(prev.libros || []), libroId]
      } : null);
    }
  };

  const handleRemoveBookFromSaga = (libroId: number) => {
    if (editingSaga) {
      setEditingSaga(prev => prev ? {
        ...prev,
        libros: prev.libros.filter(id => id !== libroId)
      } : null);
    } else if (newSaga) {
      setNewSaga(prev => prev ? {
        ...prev,
        libros: (prev.libros || []).filter(id => id !== libroId)
      } : null);
    }
  };

  const handleReorderBooks = (newOrder: number[]) => {
    if (editingSaga) {
      setEditingSaga(prev => prev ? {
        ...prev,
        libros: newOrder
      } : null);
    } else if (newSaga) {
      setNewSaga(prev => prev ? {
        ...prev,
        libros: newOrder
      } : null);
    }
  };

  const handleMoveBook = (libroId: number, direction: 'up' | 'down') => {
    const currentSaga = editingSaga || newSaga;
    if (!currentSaga || !currentSaga.libros) return;

    const currentIndex = currentSaga.libros.indexOf(libroId);
    if (currentIndex === -1) return;

    const newLibros = [...currentSaga.libros];
    
    if (direction === 'up' && currentIndex > 0) {
      [newLibros[currentIndex], newLibros[currentIndex - 1]] = [newLibros[currentIndex - 1], newLibros[currentIndex]];
    } else if (direction === 'down' && currentIndex < newLibros.length - 1) {
      [newLibros[currentIndex], newLibros[currentIndex + 1]] = [newLibros[currentIndex + 1], newLibros[currentIndex]];
    }

    if (editingSaga) {
      setEditingSaga(prev => prev ? { ...prev, libros: newLibros } : null);
    } else if (newSaga) {
      setNewSaga(prev => prev ? { ...prev, libros: newLibros } : null);
    }
  };

  const getBookById = (libroId: number): Libro | undefined => {
    return state.libros.find(libro => libro.id === libroId);
  };

  const currentSaga = editingSaga || newSaga;
  const sagaBooks = currentSaga?.libros?.map(getBookById).filter(Boolean) || [];

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
          className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <BookMarked className="w-5 h-5" />
              {editingSaga ? `Editar Saga: ${editingSaga.nombre}` : 'Crear Nueva Saga'}
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
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Saga Details */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  Información de la Saga
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Nombre de la Saga *
                    </label>
                    <input
                      type="text"
                      value={currentSaga?.nombre || ''}
                      onChange={(e) => {
                        if (editingSaga) {
                          setEditingSaga(prev => prev ? { ...prev, nombre: e.target.value } : null);
                        } else if (newSaga) {
                          setNewSaga(prev => prev ? { ...prev, nombre: e.target.value } : null);
                        }
                      }}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Descripción
                    </label>
                    <textarea
                      value={currentSaga?.descripcion || ''}
                      onChange={(e) => {
                        if (editingSaga) {
                          setEditingSaga(prev => prev ? { ...prev, descripcion: e.target.value } : null);
                        } else if (newSaga) {
                          setNewSaga(prev => prev ? { ...prev, descripcion: e.target.value } : null);
                        }
                      }}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Género
                      </label>
                      <input
                        type="text"
                        value={currentSaga?.genero || ''}
                        onChange={(e) => {
                          if (editingSaga) {
                            setEditingSaga(prev => prev ? { ...prev, genero: e.target.value } : null);
                          } else if (newSaga) {
                            setNewSaga(prev => prev ? { ...prev, genero: e.target.value } : null);
                          }
                        }}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Autor
                      </label>
                      <input
                        type="text"
                        value={currentSaga?.autor || ''}
                        onChange={(e) => {
                          if (editingSaga) {
                            setEditingSaga(prev => prev ? { ...prev, autor: e.target.value } : null);
                          } else if (newSaga) {
                            setNewSaga(prev => prev ? { ...prev, autor: e.target.value } : null);
                          }
                        }}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Total de Libros
                      </label>
                      <input
                        type="number"
                        value={currentSaga?.totalLibros || ''}
                        onChange={(e) => {
                          if (editingSaga) {
                            setEditingSaga(prev => prev ? { ...prev, totalLibros: parseInt(e.target.value) || 0 } : null);
                          } else if (newSaga) {
                            setNewSaga(prev => prev ? { ...prev, totalLibros: parseInt(e.target.value) || 0 } : null);
                          }
                        }}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                      />
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="is-complete"
                        checked={currentSaga?.isComplete || false}
                        onChange={(e) => {
                          if (editingSaga) {
                            setEditingSaga(prev => prev ? { 
                              ...prev, 
                              isComplete: e.target.checked,
                              fechaCompletado: e.target.checked ? Date.now() : undefined
                            } : null);
                          } else if (newSaga) {
                            setNewSaga(prev => prev ? { 
                              ...prev, 
                              isComplete: e.target.checked,
                              fechaCompletado: e.target.checked ? Date.now() : undefined
                            } : null);
                          }
                        }}
                        className="rounded border-gray-300 dark:border-gray-600"
                      />
                      <label htmlFor="is-complete" className="text-sm text-gray-700 dark:text-gray-300">
                        Saga completada
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Notas
                    </label>
                    <textarea
                      value={currentSaga?.notas || ''}
                      onChange={(e) => {
                        if (editingSaga) {
                          setEditingSaga(prev => prev ? { ...prev, notas: e.target.value } : null);
                        } else if (newSaga) {
                          setNewSaga(prev => prev ? { ...prev, notas: e.target.value } : null);
                        }
                      }}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                </div>
              </div>

              {/* Books Management */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  Libros de la Saga ({sagaBooks.length})
                </h3>

                {/* Current Books */}
                {sagaBooks.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Libros en la saga:
                    </h4>
                    
                    <Reorder.Group
                      axis="y"
                      values={sagaBooks}
                      onReorder={(newOrder) => {
                        const newOrderIds = newOrder.map(book => book.id);
                        handleReorderBooks(newOrderIds);
                      }}
                      className="space-y-2"
                    >
                      {sagaBooks.map((libro, index) => (
                        <Reorder.Item
                          key={libro.id}
                          value={libro}
                          className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 border border-gray-200 dark:border-gray-600"
                        >
                          <div className="flex items-center gap-3">
                            <GripVertical className="w-4 h-4 text-gray-400 cursor-move" />
                            
                            <div className="flex-1">
                              <h5 className="font-medium text-gray-900 dark:text-white text-sm">
                                {libro.titulo}
                              </h5>
                              {libro.autor && (
                                <p className="text-xs text-gray-600 dark:text-gray-300">
                                  {libro.autor}
                                </p>
                              )}
                            </div>
                            
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => handleMoveBook(libro.id, 'up')}
                                disabled={index === 0}
                                className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                                title="Mover arriba"
                              >
                                <ArrowUp className="w-3 h-3" />
                              </button>
                              
                              <button
                                onClick={() => handleMoveBook(libro.id, 'down')}
                                disabled={index === sagaBooks.length - 1}
                                className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                                title="Mover abajo"
                              >
                                <ArrowDown className="w-3 h-3" />
                              </button>
                              
                              <button
                                onClick={() => handleRemoveBookFromSaga(libro.id)}
                                className="p-1 text-red-400 hover:text-red-600"
                                title="Quitar de la saga"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        </Reorder.Item>
                      ))}
                    </Reorder.Group>
                  </div>
                )}

                {/* Add Books */}
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Añadir libros:
                  </h4>
                  
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      placeholder="Buscar libros..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    />
                  </div>

                  <div className="max-h-48 overflow-y-auto space-y-2">
                    {availableBooks.length === 0 ? (
                      <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                        {searchTerm ? 'No se encontraron libros' : 'No hay libros disponibles'}
                      </p>
                    ) : (
                      availableBooks.map(libro => (
                        <div
                          key={libro.id}
                          className="flex items-center justify-between p-2 bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                        >
                          <div className="flex-1">
                            <h5 className="font-medium text-gray-900 dark:text-white text-sm">
                              {libro.titulo}
                            </h5>
                            {libro.autor && (
                              <p className="text-xs text-gray-600 dark:text-gray-300">
                                {libro.autor}
                              </p>
                            )}
                          </div>
                          
                          <button
                            onClick={() => handleAddBookToSaga(libro.id)}
                            className="p-1 text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-900/20 rounded transition-colors"
                            title="Añadir a la saga"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={handleSaveSaga}
                disabled={!currentSaga?.nombre}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Save className="w-4 h-4" />
                {editingSaga ? 'Actualizar Saga' : 'Crear Saga'}
              </button>
              
              <button
                onClick={handleCancel}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <X className="w-4 h-4" />
                Cancelar
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default SagaEditor;