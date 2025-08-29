import React, { useState } from 'react';
import { ColeccionManga } from '../types';
import { useAppState } from '../context/AppStateContext';
import { generateUniqueId } from '../utils/idGenerator';

interface MangaFormProps {
  onClose: () => void;
  coleccion?: ColeccionManga;
  isEditing?: boolean;
}

const MangaForm: React.FC<MangaFormProps> = ({ onClose, coleccion, isEditing = false }) => {
  const { dispatch } = useAppState();
  const [formData, setFormData] = useState({
    titulo: coleccion?.titulo || '',
    autor: coleccion?.autor || '',
    editorial: coleccion?.editorial || '',
    genero: coleccion?.genero || '',
    idioma: coleccion?.idioma || '',
    descripcion: coleccion?.descripcion || '',
    totalTomos: coleccion?.totalTomos || 1,
    precioPorTomo: coleccion?.precioPorTomo || 0,
    precioTotal: coleccion?.precioTotal || 0
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.titulo.trim()) {
      alert('El título es obligatorio');
      return;
    }

    const nuevaColeccion: ColeccionManga = {
      id: coleccion?.id || generateUniqueId(),
      titulo: formData.titulo.trim(),
      autor: formData.autor.trim() || undefined,
      editorial: formData.editorial.trim() || undefined,
      genero: formData.genero.trim() || undefined,
      idioma: formData.idioma.trim() || undefined,
      descripcion: formData.descripcion.trim() || undefined,
      totalTomos: formData.totalTomos,
      tomosComprados: coleccion?.tomosComprados || 0,
      tomosLeidos: coleccion?.tomosLeidos || 0,
      isComplete: coleccion?.isComplete || false,
      fechaCreacion: coleccion?.fechaCreacion || Date.now(),
      fechaCompletado: coleccion?.fechaCompletado,
      precioTotal: formData.precioTotal > 0 ? formData.precioTotal : undefined,
      precioPorTomo: formData.precioPorTomo > 0 ? formData.precioPorTomo : undefined,
      tomos: coleccion?.tomos || []
    };

    if (isEditing) {
      dispatch({ type: 'UPDATE_COLECCION_MANGA', payload: { id: coleccion!.id, updates: nuevaColeccion } });
    } else {
      dispatch({ type: 'ADD_COLECCION_MANGA', payload: nuevaColeccion });
    }

    onClose();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'totalTomos' ? parseInt(value) || 1 : value
    }));
  };

  const handlePrecioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const precio = parseFloat(value) || 0;
    setFormData(prev => ({
      ...prev,
      [name]: precio,
      precioTotal: name === 'precioPorTomo' ? precio * prev.totalTomos : prev.precioTotal
    }));
  };

  const handleTotalTomosChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const totalTomos = parseInt(e.target.value) || 1;
    setFormData(prev => ({
      ...prev,
      totalTomos,
      precioTotal: prev.precioPorTomo > 0 ? prev.precioPorTomo * totalTomos : prev.precioTotal
    }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            {isEditing ? 'Editar Colección' : 'Nueva Colección de Manga'}
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
              Título *
            </label>
            <input
              type="text"
              name="titulo"
              value={formData.titulo}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              placeholder="Título de la colección"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Autor
            </label>
            <input
              type="text"
              name="autor"
              value={formData.autor}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              placeholder="Autor del manga"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Editorial
            </label>
            <input
              type="text"
              name="editorial"
              value={formData.editorial}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              placeholder="Editorial"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Género
            </label>
            <input
              type="text"
              name="genero"
              value={formData.genero}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              placeholder="Género (acción, romance, etc.)"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Idioma
            </label>
            <select
              name="idioma"
              value={formData.idioma}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="">Seleccionar idioma</option>
              <option value="español">Español</option>
              <option value="inglés">Inglés</option>
              <option value="japonés">Japonés</option>
              <option value="francés">Francés</option>
              <option value="alemán">Alemán</option>
              <option value="italiano">Italiano</option>
              <option value="portugués">Portugués</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Número total de tomos
            </label>
            <input
              type="number"
              name="totalTomos"
              value={formData.totalTomos}
              onChange={handleTotalTomosChange}
              min="1"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Precio por tomo (€)
            </label>
            <input
              type="number"
              name="precioPorTomo"
              value={formData.precioPorTomo}
              onChange={handlePrecioChange}
              step="0.01"
              min="0"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              placeholder="0.00"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Precio total de la colección (€)
            </label>
            <input
              type="number"
              name="precioTotal"
              value={formData.precioTotal}
              onChange={handlePrecioChange}
              step="0.01"
              min="0"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              placeholder="0.00"
              readOnly
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Calculado automáticamente: €{(formData.precioPorTomo * formData.totalTomos).toFixed(2)}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Descripción
            </label>
            <textarea
              name="descripcion"
              value={formData.descripcion}
              onChange={handleInputChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              placeholder="Descripción de la colección..."
            />
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="submit"
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors duration-200"
            >
              {isEditing ? 'Actualizar' : 'Crear'}
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

export default MangaForm;