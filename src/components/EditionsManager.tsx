import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Plus, 
  BookOpen, 
  Edit, 
  Trash2, 
  Save,
  BarChart3,
  Check,
  AlertCircle,
  DollarSign,
  Calendar,
  MapPin,
  FileText
} from 'lucide-react';
import { useAppState } from '../context/AppStateContext';
import { EdicionLibro } from '../types';

interface EditionsManagerProps {
  isOpen: boolean;
  onClose: () => void;
  libroId: number;
}

const EditionsManager: React.FC<EditionsManagerProps> = ({ isOpen, onClose, libroId }) => {
  const { state, dispatch } = useAppState();
  const [newEdition, setNewEdition] = useState<Partial<EdicionLibro> | null>(null);
  const [editingEdition, setEditingEdition] = useState<number | null>(null);
  const [comparingEditions, setComparingEditions] = useState<number[]>([]);

  const libro = state.libros.find(l => l.id === libroId);
  const ediciones = libro?.ediciones || [];

  const handleAddEdition = () => {
    setNewEdition({
      libroId,
      isbn: '',
      editorial: '',
      año: new Date().getFullYear(),
      paginas: libro?.paginas || 0,
      formato: 'fisico',
      idioma: 'español',
      precio: undefined,
      fechaCompra: undefined,
      estado: 'disponible',
      ubicacion: '',
      notas: '',
      imagen: ''
    });
  };

  const handleSaveNewEdition = () => {
    if (newEdition && newEdition.isbn && newEdition.editorial) {
      dispatch({
        type: 'ADD_EDICION',
        payload: {
          libroId,
          edicion: {
            libroId,
            isbn: newEdition.isbn,
            editorial: newEdition.editorial,
            año: newEdition.año || new Date().getFullYear(),
            paginas: newEdition.paginas || 0,
            formato: newEdition.formato || 'fisico',
            idioma: newEdition.idioma || 'español',
            precio: newEdition.precio,
            fechaCompra: newEdition.fechaCompra,
            estado: newEdition.estado || 'disponible',
            ubicacion: newEdition.ubicacion || '',
            notas: newEdition.notas || '',
            imagen: newEdition.imagen || ''
          }
        }
      });
      setNewEdition(null);
    }
  };

  const handleEditEdition = (editionId: number) => {
    setEditingEdition(editionId);
  };

  const handleSaveEdition = (editionId: number, updates: Partial<EdicionLibro>) => {
    dispatch({
      type: 'UPDATE_EDICION',
      payload: {
        edicionId: editionId,
        updates
      }
    });
    setEditingEdition(null);
  };

  const handleDeleteEdition = (editionId: number) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta edición?')) {
      dispatch({
        type: 'DELETE_EDICION',
        payload: { edicionId: editionId }
      });
    }
  };

  const handleToggleCompare = (editionId: number) => {
    setComparingEditions(prev => 
      prev.includes(editionId)
        ? prev.filter(id => id !== editionId)
        : [...prev, editionId]
    );
  };

  const handleCancelEdit = () => {
    setEditingEdition(null);
    setNewEdition(null);
  };

  const getStatusColor = (estado: string) => {
    switch (estado) {
      case 'disponible': return 'text-green-600 bg-green-50 dark:bg-green-900/20';
      case 'prestado': return 'text-blue-600 bg-blue-50 dark:bg-blue-900/20';
      case 'perdido': return 'text-red-600 bg-red-50 dark:bg-red-900/20';
      default: return 'text-gray-600 bg-gray-50 dark:bg-gray-700';
    }
  };

  const getFormatIcon = (formato: string) => {
    switch (formato) {
      case 'fisico': return BookOpen;
      case 'digital': return FileText;
      case 'audiolibro': return FileText;
      default: return BookOpen;
    }
  };

  if (!isOpen || !libro) return null;

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
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <BookOpen className="w-5 h-5" />
                Ediciones de "{libro.titulo}"
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                {ediciones.length} edición{ediciones.length !== 1 ? 'es' : ''} registrada{ediciones.length !== 1 ? 's' : ''}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            {/* Add New Edition */}
            {newEdition ? (
              <div className="mb-6 p-4 border border-blue-200 dark:border-blue-700 rounded-lg bg-blue-50 dark:bg-blue-900/20">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                  Añadir Nueva Edición
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      ISBN *
                    </label>
                    <input
                      type="text"
                      value={newEdition.isbn || ''}
                      onChange={(e) => setNewEdition(prev => ({ ...prev, isbn: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Editorial *
                    </label>
                    <input
                      type="text"
                      value={newEdition.editorial || ''}
                      onChange={(e) => setNewEdition(prev => ({ ...prev, editorial: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Año
                    </label>
                    <input
                      type="number"
                      value={newEdition.año || ''}
                      onChange={(e) => setNewEdition(prev => ({ ...prev, año: parseInt(e.target.value) }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Páginas
                    </label>
                    <input
                      type="number"
                      value={newEdition.paginas || ''}
                      onChange={(e) => setNewEdition(prev => ({ ...prev, paginas: parseInt(e.target.value) }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Formato
                    </label>
                    <select
                      value={newEdition.formato || 'fisico'}
                      onChange={(e) => setNewEdition(prev => ({ ...prev, formato: e.target.value as any }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    >
                      <option value="fisico">Físico</option>
                      <option value="digital">Digital</option>
                      <option value="audiolibro">Audiolibro</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Idioma
                    </label>
                    <select
                      value={newEdition.idioma || 'español'}
                      onChange={(e) => setNewEdition(prev => ({ ...prev, idioma: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    >
                      <option value="español">Español</option>
                      <option value="inglés">Inglés</option>
                      <option value="francés">Francés</option>
                      <option value="alemán">Alemán</option>
                      <option value="italiano">Italiano</option>
                      <option value="portugués">Portugués</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Precio
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={newEdition.precio || ''}
                      onChange={(e) => setNewEdition(prev => ({ ...prev, precio: e.target.value ? parseFloat(e.target.value) : undefined }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Estado
                    </label>
                    <select
                      value={newEdition.estado || 'disponible'}
                      onChange={(e) => setNewEdition(prev => ({ ...prev, estado: e.target.value as any }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    >
                      <option value="disponible">Disponible</option>
                      <option value="prestado">Prestado</option>
                      <option value="perdido">Perdido</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Ubicación
                    </label>
                    <input
                      type="text"
                      value={newEdition.ubicacion || ''}
                      onChange={(e) => setNewEdition(prev => ({ ...prev, ubicacion: e.target.value }))}
                      placeholder="Ej: Estantería A, Caja 3..."
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                </div>
                
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Notas
                  </label>
                  <textarea
                    value={newEdition.notas || ''}
                    onChange={(e) => setNewEdition(prev => ({ ...prev, notas: e.target.value }))}
                    placeholder="Notas adicionales sobre esta edición..."
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    rows={3}
                  />
                </div>
                
                <div className="flex gap-3 mt-4">
                  <button
                    onClick={handleSaveNewEdition}
                    disabled={!newEdition.isbn || !newEdition.editorial}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <Save className="w-4 h-4" />
                    Guardar Edición
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
              <div className="mb-6 flex items-center justify-between">
                <button
                  onClick={handleAddEdition}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Añadir Edición
                </button>
                
                {comparingEditions.length > 0 && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600 dark:text-gray-300">
                      Comparando {comparingEditions.length} edición{comparingEditions.length !== 1 ? 'es' : ''}
                    </span>
                    <button
                      onClick={() => setComparingEditions([])}
                      className="text-sm text-red-600 hover:text-red-700 transition-colors"
                    >
                      Cancelar
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Editions List */}
            <div className="space-y-4">
              {ediciones.length === 0 ? (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No hay ediciones registradas</p>
                  <p className="text-sm">Añade la primera edición para empezar</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {ediciones.map((edicion) => {
                    const isEditing = editingEdition === edicion.id;
                    const isComparing = comparingEditions.includes(edicion.id);
                    const FormatIcon = getFormatIcon(edicion.formato);
                    
                    return (
                      <div
                        key={edicion.id}
                        className={`border rounded-lg overflow-hidden transition-all duration-200 ${
                          isComparing
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                            : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                        }`}
                      >
                        {/* Edition Header */}
                        <div className="p-4 border-b border-gray-200 dark:border-gray-600">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <FormatIcon className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                              <h4 className="font-medium text-gray-900 dark:text-white">
                                {edicion.editorial}
                              </h4>
                            </div>
                            
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleToggleCompare(edicion.id)}
                                className={`p-1 rounded transition-colors ${
                                  isComparing
                                    ? 'text-blue-600 bg-blue-100 dark:bg-blue-900/30'
                                    : 'text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20'
                                }`}
                                title="Comparar edición"
                              >
                                <BarChart3 className="w-4 h-4" />
                              </button>
                              
                              <button
                                onClick={() => handleEditEdition(edicion.id)}
                                className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors"
                                title="Editar edición"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              
                              <button
                                onClick={() => handleDeleteEdition(edicion.id)}
                                className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                                title="Eliminar edición"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(edicion.estado)}`}>
                              {edicion.estado}
                            </span>
                            <span className="text-sm text-gray-600 dark:text-gray-300">
                              {edicion.año}
                            </span>
                          </div>
                        </div>

                        {/* Edition Details */}
                        <div className="p-4">
                          <div className="space-y-3 text-sm">
                            <div className="flex items-center gap-2">
                              <FileText className="w-4 h-4 text-gray-400" />
                              <span className="text-gray-600 dark:text-gray-300">
                                ISBN: {edicion.isbn}
                              </span>
                            </div>
                            
                            <div className="flex items-center gap-2">
                              <BookOpen className="w-4 h-4 text-gray-400" />
                              <span className="text-gray-600 dark:text-gray-300">
                                {edicion.paginas} páginas
                              </span>
                            </div>
                            
                            <div className="flex items-center gap-2">
                              <FileText className="w-4 h-4 text-gray-400" />
                              <span className="text-gray-600 dark:text-gray-300">
                                {edicion.idioma}
                              </span>
                            </div>
                            
                            {edicion.precio && (
                              <div className="flex items-center gap-2">
                                <DollarSign className="w-4 h-4 text-gray-400" />
                                <span className="text-gray-600 dark:text-gray-300">
                                  ${edicion.precio}
                                </span>
                              </div>
                            )}
                            
                            {edicion.ubicacion && (
                              <div className="flex items-center gap-2">
                                <MapPin className="w-4 h-4 text-gray-400" />
                                <span className="text-gray-600 dark:text-gray-300">
                                  {edicion.ubicacion}
                                </span>
                              </div>
                            )}
                          </div>
                          
                          {edicion.notas && (
                            <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-md">
                              <p className="text-sm text-gray-700 dark:text-gray-300">
                                {edicion.notas}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Comparison View */}
            {comparingEditions.length > 1 && (
              <div className="mt-8 p-4 border border-blue-200 dark:border-blue-700 rounded-lg bg-blue-50 dark:bg-blue-900/20">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                  Comparación de Ediciones
                </h3>
                
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200 dark:border-gray-600">
                        <th className="text-left py-2">Propiedad</th>
                        {comparingEditions.map(editionId => {
                          const edicion = ediciones.find(e => e.id === editionId);
                          return (
                            <th key={editionId} className="text-left py-2 px-4">
                              {edicion?.editorial} ({edicion?.año})
                            </th>
                          );
                        })}
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-gray-200 dark:border-gray-600">
                        <td className="py-2 font-medium">ISBN</td>
                        {comparingEditions.map(editionId => {
                          const edicion = ediciones.find(e => e.id === editionId);
                          return (
                            <td key={editionId} className="py-2 px-4">
                              {edicion?.isbn}
                            </td>
                          );
                        })}
                      </tr>
                      <tr className="border-b border-gray-200 dark:border-gray-600">
                        <td className="py-2 font-medium">Páginas</td>
                        {comparingEditions.map(editionId => {
                          const edicion = ediciones.find(e => e.id === editionId);
                          return (
                            <td key={editionId} className="py-2 px-4">
                              {edicion?.paginas}
                            </td>
                          );
                        })}
                      </tr>
                      <tr className="border-b border-gray-200 dark:border-gray-600">
                        <td className="py-2 font-medium">Formato</td>
                        {comparingEditions.map(editionId => {
                          const edicion = ediciones.find(e => e.id === editionId);
                          return (
                            <td key={editionId} className="py-2 px-4">
                              {edicion?.formato}
                            </td>
                          );
                        })}
                      </tr>
                      <tr className="border-b border-gray-200 dark:border-gray-600">
                        <td className="py-2 font-medium">Idioma</td>
                        {comparingEditions.map(editionId => {
                          const edicion = ediciones.find(e => e.id === editionId);
                          return (
                            <td key={editionId} className="py-2 px-4">
                              {edicion?.idioma}
                            </td>
                          );
                        })}
                      </tr>
                      <tr className="border-b border-gray-200 dark:border-gray-600">
                        <td className="py-2 font-medium">Precio</td>
                        {comparingEditions.map(editionId => {
                          const edicion = ediciones.find(e => e.id === editionId);
                          return (
                            <td key={editionId} className="py-2 px-4">
                              {edicion?.precio ? `$${edicion.precio}` : '-'}
                            </td>
                          );
                        })}
                      </tr>
                      <tr>
                        <td className="py-2 font-medium">Estado</td>
                        {comparingEditions.map(editionId => {
                          const edicion = ediciones.find(e => e.id === editionId);
                          return (
                            <td key={editionId} className="py-2 px-4">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(edicion?.estado || 'disponible')}`}>
                                {edicion?.estado}
                              </span>
                            </td>
                          );
                        })}
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
  );
};

export default EditionsManager;