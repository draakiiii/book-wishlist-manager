import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Trophy, BookOpen, CheckCircle, Clock, BookMarked, BookX, Plus, X } from 'lucide-react';
import { useAppState } from '../context/FirebaseAppStateContext';

const SagaList: React.FC = () => {
  const { state, dispatch } = useAppState();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newSagaName, setNewSagaName] = useState('');
  const [newSagaDescription, setNewSagaDescription] = useState('');
  const [newSagaGenre, setNewSagaGenre] = useState('');
  const [newSagaAuthor, setNewSagaAuthor] = useState('');

  const getSagaProgress = (sagaId: number) => {
    const librosDeLaSaga = state.libros.filter(libro => libro.sagaId === sagaId);
    const librosLeidosDeLaSaga = state.libros.filter(libro => 
      libro.sagaId === sagaId && libro.estado === 'leido'
    );
    
    return {
      total: librosDeLaSaga.length,
      leidos: librosLeidosDeLaSaga.length,
      porcentaje: librosDeLaSaga.length > 0 ? (librosLeidosDeLaSaga.length / librosDeLaSaga.length) * 100 : 0
    };
  };

  const getSagaBooks = (sagaId: number) => {
    return state.libros.filter(libro => libro.sagaId === sagaId);
  };

  const getBookStatusIcon = (estado: string) => {
    switch (estado) {
      case 'leido':
        return <CheckCircle className="h-3 w-3 flex-shrink-0 text-green-600" />;
      case 'leyendo':
        return <Clock className="h-3 w-3 flex-shrink-0 text-blue-600" />;
      case 'abandonado':
        return <BookX className="h-3 w-3 flex-shrink-0 text-red-600" />;
      case 'tbr':
        return <BookMarked className="h-3 w-3 flex-shrink-0 text-slate-600" />;
      default:
        return <BookOpen className="h-3 w-3 flex-shrink-0 text-slate-600" />;
    }
  };

  const getBookStatusClass = (estado: string) => {
    switch (estado) {
      case 'leido':
        return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200';
      case 'leyendo':
        return 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200';
      case 'abandonado':
        return 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200';
      case 'tbr':
        return 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300';
      default:
        return 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300';
    }
  };

  const handleCreateSaga = () => {
    if (!newSagaName.trim()) return;
    
    dispatch({
      type: 'ADD_SAGA',
      payload: {
        name: newSagaName.trim(),
        descripcion: newSagaDescription.trim() || undefined,
        genero: newSagaGenre.trim() || undefined,
        autor: newSagaAuthor.trim() || undefined
      }
    });
    
    // Limpiar formulario
    setNewSagaName('');
    setNewSagaDescription('');
    setNewSagaGenre('');
    setNewSagaAuthor('');
    setShowCreateForm(false);
  };

  const handleCancelCreate = () => {
    setNewSagaName('');
    setNewSagaDescription('');
    setNewSagaGenre('');
    setNewSagaAuthor('');
    setShowCreateForm(false);
  };

  if (state.sagas.length === 0 && !showCreateForm) {
    return (
      <div className="text-center py-8">
        <Trophy className="h-12 w-12 text-slate-400 mx-auto mb-4" />
        <p className="text-slate-600 dark:text-slate-400">
          No tienes sagas configuradas aún.
        </p>
        <p className="text-sm text-slate-500 dark:text-slate-500 mt-2">
          Agrega libros con nombres de saga para crearlas automáticamente.
        </p>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowCreateForm(true)}
          className="mt-4 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors duration-200 flex items-center space-x-2 mx-auto"
        >
          <Plus className="h-4 w-4" />
          <span>Crear Primera Saga</span>
        </motion.button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Botón para crear nueva saga */}
      {!showCreateForm && (
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setShowCreateForm(true)}
          className="w-full p-4 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg hover:border-slate-400 dark:hover:border-slate-500 transition-colors duration-200 flex items-center justify-center space-x-2 text-slate-600 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"
        >
          <Plus className="h-5 w-5" />
          <span className="font-medium">Crear Nueva Saga</span>
        </motion.button>
      )}

      {/* Formulario para crear saga */}
      {showCreateForm && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
              Crear Nueva Saga
            </h3>
            <button
              onClick={handleCancelCreate}
              className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
            >
              <X className="h-5 w-5 text-slate-500" />
            </button>
          </div>
          
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Nombre de la saga *
              </label>
              <input
                type="text"
                value={newSagaName}
                onChange={(e) => setNewSagaName(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Ej: El Señor de los Anillos"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Descripción
              </label>
              <textarea
                value={newSagaDescription}
                onChange={(e) => setNewSagaDescription(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Descripción opcional de la saga..."
                rows={2}
              />
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Género
                </label>
                <input
                  type="text"
                  value={newSagaGenre}
                  onChange={(e) => setNewSagaGenre(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Ej: Fantasía"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Autor
                </label>
                <input
                  type="text"
                  value={newSagaAuthor}
                  onChange={(e) => setNewSagaAuthor(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Ej: J.R.R. Tolkien"
                />
              </div>
            </div>
            
            <div className="flex space-x-3 pt-2">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleCreateSaga}
                disabled={!newSagaName.trim()}
                className="flex-1 px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-slate-300 dark:disabled:bg-slate-600 text-white rounded-lg font-medium transition-colors duration-200 disabled:cursor-not-allowed"
              >
                Crear Saga
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleCancelCreate}
                className="flex-1 px-4 py-2 bg-slate-500 hover:bg-slate-600 text-white rounded-lg font-medium transition-colors duration-200"
              >
                Cancelar
              </motion.button>
            </div>
          </div>
        </motion.div>
      )}

      {state.sagas.map((saga) => {
        const progress = getSagaProgress(saga.id);
        const books = getSagaBooks(saga.id);
        const isComplete = saga.isComplete;
        
        return (
          <motion.div
            key={saga.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-4 rounded-lg border-2 transition-all duration-300 ${
              isComplete 
                ? 'border-green-300 dark:border-green-600 bg-green-50 dark:bg-green-900/20' 
                : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-3">
                {isComplete ? (
                  <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                    <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                  </div>
                ) : (
                  <div className="p-2 bg-slate-100 dark:bg-slate-700 rounded-lg">
                    <BookOpen className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                  </div>
                )}
                <div>
                  <h3 className={`font-semibold ${
                    isComplete 
                      ? 'text-green-800 dark:text-green-200' 
                      : 'text-slate-900 dark:text-white'
                  }`}>
                    {saga.name}
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    {progress.leidos} de {progress.total} libros leídos
                  </p>
                </div>
              </div>
              
              {isComplete && (
                <div className="flex items-center space-x-1 text-green-600 dark:text-green-400">
                  <Trophy className="h-4 w-4" />
                  <span className="text-sm font-medium">¡Completada!</span>
                </div>
              )}
            </div>

            {/* Barra de progreso */}
            <div className="mb-3">
              <div className="flex justify-between text-xs text-slate-600 dark:text-slate-400 mb-1">
                <span>Progreso</span>
                <span>{Math.round(progress.porcentaje)}%</span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progress.porcentaje}%` }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                  className={`h-2 rounded-full ${
                    isComplete 
                      ? 'bg-green-500' 
                      : 'bg-blue-500'
                  }`}
                />
              </div>
            </div>

            {/* Lista de libros */}
            {books.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Libros de la saga:
                </h4>
                <div className="grid grid-cols-1 gap-2">
                  {books.map((book) => {
                    return (
                      <div
                        key={book.id}
                        className={`flex items-center space-x-2 p-2 rounded text-sm ${getBookStatusClass(book.estado)}`}
                      >
                        {getBookStatusIcon(book.estado)}
                        <span className="truncate">{book.titulo}</span>
                        {book.autor && (
                          <span className="text-xs opacity-75">- {book.autor}</span>
                        )}
                        {book.ordenLectura && (
                          <span className="text-xs bg-slate-200 dark:bg-slate-600 px-1 rounded">
                            #{book.ordenLectura}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </motion.div>
        );
      })}
    </div>
  );
};

export default SagaList; 