import React, { useState } from 'react';
import { TomoManga } from '../types';
import { useAppState } from '../context/AppStateContext';
// import { generateUniqueId } from '../utils/idGenerator';

interface TomoMangaFormProps {
  onClose: () => void;
  coleccionId: number;
  tomo?: TomoManga;
  isEditing?: boolean;
}

const TomoMangaForm: React.FC<TomoMangaFormProps> = ({ onClose, coleccionId, tomo, isEditing = false }) => {
  const { dispatch } = useAppState();
  const [formData, setFormData] = useState({
    numero: tomo?.numero || 1,
    estado: tomo?.estado || 'wishlist',
    fechaCompra: tomo?.fechaCompra ? new Date(tomo.fechaCompra).toISOString().split('T')[0] : '',
    fechaLectura: tomo?.fechaLectura ? new Date(tomo.fechaLectura).toISOString().split('T')[0] : '',
    calificacion: tomo?.calificacion || 0,
    reseña: tomo?.reseña || '',
    notas: tomo?.notas || ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.numero < 1) {
      alert('El número de tomo debe ser mayor a 0');
      return;
    }

    const nuevoTomo: Omit<TomoManga, 'id'> = {
      numero: formData.numero,
      estado: formData.estado as TomoManga['estado'],
      fechaCompra: formData.fechaCompra ? new Date(formData.fechaCompra).getTime() : undefined,
      fechaLectura: formData.fechaLectura ? new Date(formData.fechaLectura).getTime() : undefined,
      calificacion: formData.calificacion > 0 ? formData.calificacion : undefined,
      reseña: formData.reseña.trim() || undefined,
      notas: formData.notas.trim() || undefined,
      historialEstados: []
    };

    if (isEditing && tomo) {
      dispatch({ 
        type: 'UPDATE_TOMO_MANGA', 
        payload: { 
          coleccionId, 
          tomoId: tomo.id, 
          updates: nuevoTomo 
        } 
      });
    } else {
      dispatch({ 
        type: 'ADD_TOMO_MANGA', 
        payload: { 
          coleccionId, 
          tomo: nuevoTomo 
        } 
      });
    }

    onClose();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'numero' || name === 'calificacion' ? parseInt(value) || 0 : value
    }));
  };

  const handleEstadoChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newEstado = e.target.value as TomoManga['estado'];
    setFormData(prev => ({
      ...prev,
      estado: newEstado
    }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            {isEditing ? 'Editar Tomo' : 'Nuevo Tomo'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Número de tomo *
            </label>
            <input
              type="number"
              name="numero"
              value={formData.numero}
              onChange={handleInputChange}
              min="1"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Estado *
            </label>
            <select
              name="estado"
              value={formData.estado}
              onChange={handleEstadoChange}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              required
            >
              <option value="wishlist">Wishlist</option>
              <option value="tbr">TBR</option>
              <option value="comprado">Comprado</option>
              <option value="leyendo">Leyendo</option>
              <option value="leido">Leído</option>
              <option value="abandonado">Abandonado</option>
              <option value="prestado">Prestado</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Fecha de compra
            </label>
            <input
              type="date"
              name="fechaCompra"
              value={formData.fechaCompra}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Fecha de lectura
            </label>
            <input
              type="date"
              name="fechaLectura"
              value={formData.fechaLectura}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Calificación
            </label>
            <select
              name="calificacion"
              value={formData.calificacion}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            >
              <option value={0}>Sin calificar</option>
              <option value={1}>⭐ (1)</option>
              <option value={2}>⭐⭐ (2)</option>
              <option value={3}>⭐⭐⭐ (3)</option>
              <option value={4}>⭐⭐⭐⭐ (4)</option>
              <option value={5}>⭐⭐⭐⭐⭐ (5)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Reseña
            </label>
            <textarea
              name="reseña"
              value={formData.reseña}
              onChange={handleInputChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              placeholder="Tu reseña del tomo..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Notas
            </label>
            <textarea
              name="notas"
              value={formData.notas}
              onChange={handleInputChange}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              placeholder="Notas adicionales..."
            />
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="submit"
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors duration-200"
            >
              {isEditing ? 'Actualizar' : 'Añadir'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-300 hover:bg-gray-400 dark:bg-gray-600 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium py-2 px-4 rounded-md transition-colors duration-200"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TomoMangaForm;