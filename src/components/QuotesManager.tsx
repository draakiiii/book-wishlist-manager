import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Plus, 
  Quote, 
  Heart, 
  HeartOff,
  Edit,
  Trash2,
  Search,
  Filter,
  BookOpen,
  Calendar,
  Save,
  Cancel,
  Copy,
  Check,
  FileText
} from 'lucide-react';
import { useAppState } from '../context/AppStateContext';
import { Cita } from '../types';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface QuotesManagerProps {
  isOpen: boolean;
  onClose: () => void;
  libroId?: number; // Si se proporciona, solo muestra citas de ese libro
}

const QuotesManager: React.FC<QuotesManagerProps> = ({ isOpen, onClose, libroId }) => {
  const { state, dispatch } = useAppState();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterFavorites, setFilterFavorites] = useState(false);
  const [editingQuote, setEditingQuote] = useState<number | null>(null);
  const [newQuote, setNewQuote] = useState<Partial<Cita> | null>(null);
  const [copiedQuote, setCopiedQuote] = useState<number | null>(null);

  // Obtener todas las citas o solo las del libro específico
  const allQuotes = useMemo(() => {
    const quotes: Array<{ libroId: number; libroTitulo: string; cita: Cita }> = [];
    
    state.libros.forEach(libro => {
      if (libroId === undefined || libro.id === libroId) {
        if (libro.citas) {
          libro.citas.forEach(cita => {
            quotes.push({
              libroId: libro.id,
              libroTitulo: libro.titulo,
              cita
            });
          });
        }
      }
    });
    
    return quotes;
  }, [state.libros, libroId]);

  // Filtrar citas
  const filteredQuotes = useMemo(() => {
    let filtered = allQuotes;
    
    if (searchTerm) {
      filtered = filtered.filter(item => 
        item.cita.texto.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.cita.notas?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.libroTitulo.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (filterFavorites) {
      filtered = filtered.filter(item => item.cita.favorita);
    }
    
    return filtered.sort((a, b) => b.cita.fecha - a.cita.fecha);
  }, [allQuotes, searchTerm, filterFavorites]);

  const handleAddQuote = () => {
    if (libroId) {
      setNewQuote({
        texto: '',
        pagina: undefined,
        capitulo: '',
        fecha: Date.now(),
        notas: '',
        favorita: false
      });
    }
  };

  const handleSaveNewQuote = () => {
    if (newQuote && newQuote.texto && libroId) {
      dispatch({
        type: 'ADD_CITA',
        payload: {
          libroId,
          cita: {
            texto: newQuote.texto,
            pagina: newQuote.pagina,
            capitulo: newQuote.capitulo || '',
            fecha: newQuote.fecha || Date.now(),
            notas: newQuote.notas || '',
            favorita: newQuote.favorita || false
          }
        }
      });
      setNewQuote(null);
    }
  };

  const handleEditQuote = (quoteId: number) => {
    setEditingQuote(quoteId);
  };

  const handleSaveQuote = (libroId: number, quoteId: number, updates: Partial<Cita>) => {
    dispatch({
      type: 'UPDATE_CITA',
      payload: {
        libroId,
        citaId: quoteId,
        updates
      }
    });
    setEditingQuote(null);
  };

  const handleDeleteQuote = (libroId: number, quoteId: number) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta cita?')) {
      dispatch({
        type: 'DELETE_CITA',
        payload: {
          libroId,
          citaId: quoteId
        }
      });
    }
  };

  const handleToggleFavorite = (libroId: number, quoteId: number) => {
    dispatch({
      type: 'TOGGLE_CITA_FAVORITA',
      payload: {
        libroId,
        citaId: quoteId
      }
    });
  };

  const handleCopyQuote = async (quote: Cita) => {
    const quoteText = `"${quote.texto}"${quote.pagina ? ` (página ${quote.pagina})` : ''}${quote.capitulo ? ` - ${quote.capitulo}` : ''}`;
    
    try {
      await navigator.clipboard.writeText(quoteText);
      setCopiedQuote(quote.id);
      setTimeout(() => setCopiedQuote(null), 2000);
    } catch (err) {
      console.error('Error al copiar al portapapeles:', err);
    }
  };

  const handleCancelEdit = () => {
    setEditingQuote(null);
    setNewQuote(null);
  };

  const getBookTitle = () => {
    if (libroId) {
      const libro = state.libros.find(l => l.id === libroId);
      return libro?.titulo || 'Libro desconocido';
    }
    return 'Todas las citas';
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
              <Quote className="w-5 h-5" />
              Gestión de Citas - {getBookTitle()}
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
            {/* Add New Quote */}
            {newQuote ? (
              <div className="mb-6 p-4 border border-blue-200 dark:border-blue-700 rounded-lg bg-blue-50 dark:bg-blue-900/20">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                  Añadir Nueva Cita
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Cita *
                    </label>
                    <textarea
                      value={newQuote.texto || ''}
                      onChange={(e) => setNewQuote(prev => ({ ...prev, texto: e.target.value }))}
                      placeholder="Escribe la cita aquí..."
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                      rows={4}
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Página
                      </label>
                      <input
                        type="number"
                        value={newQuote.pagina || ''}
                        onChange={(e) => setNewQuote(prev => ({ ...prev, pagina: e.target.value ? parseInt(e.target.value) : undefined }))}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Capítulo
                      </label>
                      <input
                        type="text"
                        value={newQuote.capitulo || ''}
                        onChange={(e) => setNewQuote(prev => ({ ...prev, capitulo: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Notas (opcional)
                    </label>
                    <textarea
                      value={newQuote.notas || ''}
                      onChange={(e) => setNewQuote(prev => ({ ...prev, notas: e.target.value }))}
                      placeholder="Añade notas sobre esta cita..."
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                      rows={2}
                    />
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="favorite-new"
                      checked={newQuote.favorita || false}
                      onChange={(e) => setNewQuote(prev => ({ ...prev, favorita: e.target.checked }))}
                      className="rounded border-gray-300 dark:border-gray-600"
                    />
                    <label htmlFor="favorite-new" className="text-sm text-gray-700 dark:text-gray-300">
                      Marcar como favorita
                    </label>
                  </div>
                </div>
                
                <div className="flex gap-3 mt-4">
                  <button
                    onClick={handleSaveNewQuote}
                    disabled={!newQuote.texto}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <Save className="w-4 h-4" />
                    Guardar Cita
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
              <div className="mb-6 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  {libroId && (
                    <button
                      onClick={handleAddQuote}
                      className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      Añadir Cita
                    </button>
                  )}
                  
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="filter-favorites"
                      checked={filterFavorites}
                      onChange={(e) => setFilterFavorites(e.target.checked)}
                      className="rounded border-gray-300 dark:border-gray-600"
                    />
                    <label htmlFor="filter-favorites" className="text-sm text-gray-700 dark:text-gray-300">
                      Solo favoritas
                    </label>
                  </div>
                </div>
                
                <div className="text-sm text-gray-600 dark:text-gray-300">
                  {filteredQuotes.length} cita{filteredQuotes.length !== 1 ? 's' : ''}
                </div>
              </div>
            )}

            {/* Search */}
            <div className="mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Buscar citas..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>

            {/* Quotes List */}
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {filteredQuotes.length === 0 ? (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <Quote className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No se encontraron citas</p>
                  {libroId && (
                    <p className="text-sm">Añade tu primera cita para empezar</p>
                  )}
                </div>
              ) : (
                filteredQuotes.map(({ libroId, libroTitulo, cita }) => {
                  const isEditing = editingQuote === cita.id;
                  
                  return (
                    <div
                      key={cita.id}
                      className={`border rounded-lg p-4 transition-all duration-200 ${
                        cita.favorita 
                          ? 'border-yellow-300 bg-yellow-50 dark:bg-yellow-900/20' 
                          : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                      }`}
                    >
                      {/* Quote Header */}
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          {!libroId && (
                            <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">
                              {libroTitulo}
                            </p>
                          )}
                          
                          {isEditing ? (
                            <textarea
                              value={cita.texto}
                              onChange={(e) => {
                                dispatch({
                                  type: 'UPDATE_CITA',
                                  payload: {
                                    libroId,
                                    citaId: cita.id,
                                    updates: { texto: e.target.value }
                                  }
                                });
                              }}
                              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                              rows={3}
                            />
                          ) : (
                            <blockquote className="text-gray-900 dark:text-white italic">
                              "{cita.texto}"
                            </blockquote>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-2 ml-4">
                          <button
                            onClick={() => handleToggleFavorite(libroId, cita.id)}
                            className={`p-2 rounded-md transition-colors ${
                              cita.favorita
                                ? 'text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20'
                                : 'text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20'
                            }`}
                            title={cita.favorita ? 'Quitar de favoritas' : 'Marcar como favorita'}
                          >
                            {cita.favorita ? <Heart className="w-4 h-4" /> : <HeartOff className="w-4 h-4" />}
                          </button>
                          
                          <button
                            onClick={() => handleCopyQuote(cita)}
                            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-md transition-colors"
                            title="Copiar cita"
                          >
                            {copiedQuote === cita.id ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                          </button>
                          
                          <button
                            onClick={() => handleEditQuote(cita.id)}
                            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-md transition-colors"
                            title="Editar cita"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          
                          <button
                            onClick={() => handleDeleteQuote(libroId, cita.id)}
                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors"
                            title="Eliminar cita"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Quote Details */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        {cita.pagina && (
                          <div className="flex items-center gap-2">
                            <BookOpen className="w-4 h-4 text-gray-400" />
                            <span className="text-gray-600 dark:text-gray-300">
                              Página {cita.pagina}
                            </span>
                          </div>
                        )}
                        
                        {cita.capitulo && (
                          <div className="flex items-center gap-2">
                            <FileText className="w-4 h-4 text-gray-400" />
                            <span className="text-gray-600 dark:text-gray-300">
                              {cita.capitulo}
                            </span>
                          </div>
                        )}
                        
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-600 dark:text-gray-300">
                            {format(cita.fecha, 'dd/MM/yyyy', { locale: es })}
                          </span>
                        </div>
                      </div>

                      {/* Quote Notes */}
                      {cita.notas && (
                        <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-md">
                          <p className="text-sm text-gray-700 dark:text-gray-300">
                            {cita.notas}
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default QuotesManager;