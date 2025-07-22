import React from 'react';
import { motion } from 'framer-motion';
import { Trophy, BookOpen, CheckCircle, Clock } from 'lucide-react';
import { useAppState } from '../context/AppStateContext';

const SagaList: React.FC = () => {
  const { state } = useAppState();

  const getSagaProgress = (sagaId: number) => {
    const todosLosLibros = [
      ...state.tbr,
      ...state.historial,
      ...state.librosActuales
    ];
    
    const librosDeLaSaga = todosLosLibros.filter(libro => libro.sagaId === sagaId);
    const librosLeidosDeLaSaga = state.historial.filter(libro => libro.sagaId === sagaId);
    
    return {
      total: librosDeLaSaga.length,
      leidos: librosLeidosDeLaSaga.length,
      porcentaje: librosDeLaSaga.length > 0 ? (librosLeidosDeLaSaga.length / librosDeLaSaga.length) * 100 : 0
    };
  };

  const getSagaBooks = (sagaId: number) => {
    const todosLosLibros = [
      ...state.tbr,
      ...state.historial,
      ...state.librosActuales
    ];
    
    return todosLosLibros.filter(libro => libro.sagaId === sagaId);
  };

  if (state.sagas.length === 0) {
    return (
      <div className="text-center py-8">
        <Trophy className="h-12 w-12 text-slate-400 mx-auto mb-4" />
        <p className="text-slate-600 dark:text-slate-400">
          No tienes sagas configuradas aún.
        </p>
        <p className="text-sm text-slate-500 dark:text-slate-500 mt-2">
          Agrega libros con nombres de saga para crearlas automáticamente.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
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
                    const isRead = state.historial.some(l => l.id === book.id);
                    const isCurrent = state.librosActuales.some(l => l.id === book.id);
                    
                    return (
                      <div
                        key={book.id}
                        className={`flex items-center space-x-2 p-2 rounded text-sm ${
                          isRead 
                            ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200' 
                            : isCurrent
                            ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200'
                            : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        {isRead ? (
                          <CheckCircle className="h-3 w-3 flex-shrink-0" />
                        ) : isCurrent ? (
                          <Clock className="h-3 w-3 flex-shrink-0" />
                        ) : (
                          <BookOpen className="h-3 w-3 flex-shrink-0" />
                        )}
                        <span className="truncate">{book.titulo}</span>
                        {book.autor && (
                          <span className="text-xs opacity-75">- {book.autor}</span>
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