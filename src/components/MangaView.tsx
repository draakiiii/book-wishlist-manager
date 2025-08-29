import React, { useState } from 'react';
import { ColeccionManga, TomoManga, MangaListType } from '../types';
import { useAppState } from '../context/AppStateContext';
import MangaForm from './MangaForm';
import TomoMangaForm from './TomoMangaForm';
import { 
  Plus, 
  Edit, 
  Trash2, 
  BookOpen, 
  ShoppingCart, 
  CheckCircle,
  Star,
  Calendar,
  DollarSign
} from 'lucide-react';

const MangaView: React.FC = () => {
  const { state, dispatch } = useAppState();
  const [showMangaForm, setShowMangaForm] = useState(false);
  const [showTomoForm, setShowTomoForm] = useState(false);
  const [editingColeccion, setEditingColeccion] = useState<ColeccionManga | null>(null);
  const [editingTomo, setEditingTomo] = useState<{ coleccion: ColeccionManga; tomo: TomoManga } | null>(null);
  const [selectedColeccion, setSelectedColeccion] = useState<ColeccionManga | null>(null);
  const [filter, setFilter] = useState<MangaListType>('todos');
  const [searchTerm, setSearchTerm] = useState('');
  const [quickAddInputs, setQuickAddInputs] = useState<{ [key: number]: string }>({});

  const filteredColecciones = state.coleccionesManga.filter(coleccion => {
    const matchesSearch = coleccion.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (coleccion.autor && coleccion.autor.toLowerCase().includes(searchTerm.toLowerCase()));
    
    if (filter === 'todos') return matchesSearch;
    
    return matchesSearch && coleccion.tomos.some(tomo => tomo.estado === filter);
  });

  const handleEditColeccion = (coleccion: ColeccionManga) => {
    setEditingColeccion(coleccion);
    setShowMangaForm(true);
  };

  const handleDeleteColeccion = (id: number) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta colección?')) {
      dispatch({ type: 'DELETE_COLECCION_MANGA', payload: id });
    }
  };

  const handleEditTomo = (coleccion: ColeccionManga, tomo: TomoManga) => {
    setEditingTomo({ coleccion, tomo });
    setShowTomoForm(true);
  };

  const handleDeleteTomo = (coleccionId: number, tomoId: number) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este tomo?')) {
      dispatch({ type: 'DELETE_TOMO_MANGA', payload: { coleccionId, tomoId } });
    }
  };

  const handleEstadoChange = (coleccionId: number, tomoId: number, newEstado: TomoManga['estado']) => {
    dispatch({ 
      type: 'CHANGE_TOMO_MANGA_STATE', 
      payload: { coleccionId, tomoId, newState: newEstado } 
    });
  };

  const handleQuickAddTomo = (coleccionId: number) => {
    const numero = parseInt(quickAddInputs[coleccionId] || '');
    if (numero && numero > 0) {
      // Verificar que no existe ya
      const coleccion = state.coleccionesManga.find(c => c.id === coleccionId);
      if (coleccion) {
        const tomoExistente = coleccion.tomos.find(t => t.numero === numero);
        if (tomoExistente) {
          alert(`El tomo #${numero} ya existe`);
          return;
        }
        
        // Añadir tomo rápidamente
        dispatch({
          type: 'ADD_TOMO_MANGA',
          payload: {
            coleccionId,
            tomo: {
              numero,
              estado: 'wishlist',
              historialEstados: []
            }
          }
        });
        
        // Limpiar input
        setQuickAddInputs(prev => ({ ...prev, [coleccionId]: '' }));
      }
    }
  };

  // Funciones para futuras implementaciones de compra y lectura directa
  // const handleComprarTomo = (coleccionId: number, tomoId: number) => {
  //   const precio = prompt('Introduce el precio del tomo (opcional):');
  //   const precioNum = precio ? parseFloat(precio) : undefined;
  //   
  //   dispatch({ 
  //     type: 'COMPRAR_TOMO_MANGA', 
  //     payload: { coleccionId, tomoId, precio: precioNum } 
  //   });
  // };

  // const handleLeerTomo = (coleccionId: number, tomoId: number) => {
  //   const calificacion = prompt('Introduce tu calificación (1-5, opcional):');
  //   const notas = prompt('Introduce tus notas (opcional):');
  //   
  //   const calificacionNum = calificacion ? parseInt(calificacion) : undefined;
  //   
  //   dispatch({ 
  //     type: 'LEER_TOMO_MANGA', 
  //     payload: { 
  //       coleccionId, 
  //       tomoId, 
  //       calificacion: calificacionNum,
  //       notas: notas || undefined
  //     } 
  //   });
  // };

  const getEstadoColor = (estado: TomoManga['estado']) => {
    switch (estado) {
      case 'wishlist': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'tbr': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'comprado': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'leyendo': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      case 'leido': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'abandonado': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'prestado': return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getEstadoText = (estado: TomoManga['estado']) => {
    switch (estado) {
      case 'wishlist': return 'Wishlist';
      case 'tbr': return 'TBR';
      case 'comprado': return 'Comprado';
      case 'leyendo': return 'Leyendo';
      case 'leido': return 'Leído';
      case 'abandonado': return 'Abandonado';
      case 'prestado': return 'Prestado';
      default: return estado;
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Manga</h1>
        <button
          onClick={() => setShowMangaForm(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center space-x-2 transition-colors duration-200"
        >
          <Plus className="w-5 h-5" />
          <span>Nueva Colección</span>
        </button>
      </div>

      {/* Filtros y búsqueda */}
      <div className="mb-6 space-y-4">
        <div className="flex flex-wrap gap-4">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as MangaListType)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="todos">Todas las colecciones</option>
            <option value="wishlist">Wishlist</option>
            <option value="tbr">TBR</option>
            <option value="comprado">Comprado</option>
            <option value="leyendo">Leyendo</option>
            <option value="leido">Leído</option>
            <option value="abandonado">Abandonado</option>
            <option value="prestado">Prestado</option>
          </select>
          
          <input
            type="text"
            placeholder="Buscar por título o autor..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white flex-1 min-w-64"
          />
        </div>
      </div>

      {/* Lista de colecciones */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredColecciones.map(coleccion => (
          <div
            key={coleccion.id}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-200"
          >
            {/* Header de la colección */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white line-clamp-2">
                  {coleccion.titulo}
                </h3>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEditColeccion(coleccion)}
                    className="text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteColeccion(coleccion.id)}
                    className="text-gray-400 hover:text-red-600 dark:hover:text-red-400"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              {coleccion.autor && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                  Por {coleccion.autor}
                </p>
              )}
              
              <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                <span className="flex items-center">
                  <BookOpen className="w-4 h-4 mr-1" />
                  {coleccion.tomosLeidos}/{coleccion.totalTomos}
                </span>
                <span className="flex items-center">
                  <ShoppingCart className="w-4 h-4 mr-1" />
                  {coleccion.tomosComprados}/{coleccion.totalTomos}
                </span>
                {coleccion.isComplete && (
                  <span className="flex items-center text-green-600 dark:text-green-400">
                    <CheckCircle className="w-4 h-4 mr-1" />
                    Completa
                  </span>
                )}
              </div>
            </div>

            {/* Tomos */}
            <div className="p-4">
              <div className="flex justify-between items-center mb-3">
                <h4 className="font-medium text-gray-900 dark:text-white">Tomos</h4>
                <div className="flex items-center space-x-2">
                  {/* Añadir tomo rápido */}
                  <div className="flex items-center space-x-1">
                    <input
                      type="number"
                      placeholder="#"
                      min="1"
                      value={quickAddInputs[coleccion.id] || ''}
                      onChange={(e) => setQuickAddInputs(prev => ({ ...prev, [coleccion.id]: e.target.value }))}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          handleQuickAddTomo(coleccion.id);
                        }
                      }}
                      className="w-16 px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-600 text-gray-900 dark:text-white"
                    />
                    <button
                      onClick={() => handleQuickAddTomo(coleccion.id)}
                      className="px-2 py-1 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors duration-200"
                    >
                      +
                    </button>
                  </div>
                  
                  {/* Añadir tomo con formulario completo */}
                  <button
                    onClick={() => {
                      setSelectedColeccion(coleccion);
                      setShowTomoForm(true);
                    }}
                    className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium"
                  >
                    + Formulario
                  </button>
                </div>
              </div>
              
              <div className="space-y-2">
                {coleccion.tomos
                  .sort((a, b) => a.numero - b.numero)
                  .map(tomo => (
                    <div
                      key={tomo.id}
                      className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded-md"
                    >
                      <div className="flex items-center space-x-3">
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          #{tomo.numero}
                        </span>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getEstadoColor(tomo.estado)}`}>
                          {getEstadoText(tomo.estado)}
                        </span>
                        {tomo.calificacion && tomo.calificacion > 0 && (
                          <span className="flex items-center text-yellow-600 dark:text-yellow-400">
                            <Star className="w-3 h-3 mr-1" />
                            {tomo.calificacion}
                          </span>
                        )}
                      </div>
                      
                      <div className="flex items-center space-x-1">
                        <select
                          value={tomo.estado}
                          onChange={(e) => handleEstadoChange(coleccion.id, tomo.id, e.target.value as TomoManga['estado'])}
                          className="text-xs border border-gray-300 dark:border-gray-600 rounded px-1 py-1 bg-white dark:bg-gray-600 text-gray-900 dark:text-white"
                        >
                          <option value="wishlist">Wishlist</option>
                          <option value="tbr">TBR</option>
                          <option value="comprado">Comprado</option>
                          <option value="leyendo">Leyendo</option>
                          <option value="leido">Leído</option>
                          <option value="abandonado">Abandonado</option>
                          <option value="prestado">Prestado</option>
                        </select>
                        
                        <button
                          onClick={() => handleEditTomo(coleccion, tomo)}
                          className="text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 p-1"
                          title="Editar tomo"
                        >
                          <Edit className="w-3 h-3" />
                        </button>
                        
                        {/* Botón rápido para marcar como comprado */}
                        {!tomo.fechaCompra && (
                          <button
                            onClick={() => {
                              const precio = prompt('Introduce el precio del tomo (opcional):');
                              const precioNum = precio ? parseFloat(precio) : undefined;
                              
                              dispatch({ 
                                type: 'COMPRAR_TOMO_MANGA', 
                                payload: { coleccionId: coleccion.id, tomoId: tomo.id, precio: precioNum } 
                              });
                            }}
                            className="text-gray-400 hover:text-green-600 dark:hover:text-green-400 p-1"
                            title="Marcar como comprado"
                          >
                            <ShoppingCart className="w-3 h-3" />
                          </button>
                        )}
                        
                        <button
                          onClick={() => handleDeleteTomo(coleccion.id, tomo.id)}
                          className="text-gray-400 hover:text-red-600 dark:hover:text-red-400 p-1"
                          title="Eliminar tomo"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                
                {coleccion.tomos.length === 0 && (
                  <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                    No hay tomos añadidos
                  </p>
                )}
              </div>
              
              {/* Información adicional */}
              <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
                <div className="grid grid-cols-2 gap-2 text-xs text-gray-500 dark:text-gray-400">
                  {coleccion.editorial && (
                    <span className="flex items-center">
                      <BookOpen className="w-3 h-3 mr-1" />
                      {coleccion.editorial}
                    </span>
                  )}
                  {coleccion.genero && (
                    <span className="flex items-center">
                      <Star className="w-3 h-3 mr-1" />
                      {coleccion.genero}
                    </span>
                  )}
                  {coleccion.precioTotal && (
                    <span className="flex items-center">
                      <DollarSign className="w-3 h-3 mr-1" />
                      €{coleccion.precioTotal.toFixed(2)}
                    </span>
                  )}
                  {coleccion.fechaCreacion && (
                    <span className="flex items-center">
                      <Calendar className="w-3 h-3 mr-1" />
                      {new Date(coleccion.fechaCreacion).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredColecciones.length === 0 && (
        <div className="text-center py-12">
          <BookOpen className="w-16 h-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No hay colecciones de manga
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            {searchTerm || filter !== 'todos' 
              ? 'No se encontraron colecciones con los filtros aplicados'
              : 'Comienza añadiendo tu primera colección de manga'
            }
          </p>
          {!searchTerm && filter === 'todos' && (
            <button
              onClick={() => setShowMangaForm(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
            >
              Añadir colección
            </button>
          )}
        </div>
      )}

      {/* Modales */}
      {showMangaForm && (
        <MangaForm
          onClose={() => {
            setShowMangaForm(false);
            setEditingColeccion(null);
          }}
          coleccion={editingColeccion || undefined}
          isEditing={!!editingColeccion}
        />
      )}

      {showTomoForm && (
        <TomoMangaForm
          onClose={() => {
            setShowTomoForm(false);
            setEditingTomo(null);
            setSelectedColeccion(null);
          }}
          coleccionId={editingTomo?.coleccion.id || selectedColeccion?.id || 0}
          tomo={editingTomo?.tomo}
          isEditing={!!editingTomo}
        />
      )}
    </div>
  );
};

export default MangaView;