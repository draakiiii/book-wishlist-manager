import React, { useState, useRef, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { Search, Upload, X, Download, Loader2, AlertCircle, Image as ImageIcon } from 'lucide-react';
import { googleImagesAPI, GoogleImageSearchResult } from '../services/googleImagesAPI';
import { Libro } from '../types';

interface GoogleImagesSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  book: Libro;
  onImageSelect: (imageUrl: string) => void;
}

const GoogleImagesSearchModal: React.FC<GoogleImagesSearchModalProps> = ({
  isOpen,
  onClose,
  book,
  onImageSelect
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<GoogleImageSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [selectedTab, setSelectedTab] = useState<'search' | 'upload'>('search');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isApiConfigured, setIsApiConfigured] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Check API configuration on mount
  useEffect(() => {
    setIsApiConfigured(googleImagesAPI.isConfigured());
  }, []);

  // Initialize search query with book title
  useEffect(() => {
    if (isOpen && book.titulo) {
      setSearchQuery(`"${book.titulo}" portada libro`);
      if (book.autor) {
        setSearchQuery(`"${book.titulo}" "${book.autor}" portada libro`);
      }
    }
  }, [isOpen, book.titulo, book.autor]);

  // Handle search
  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    setSearchError(null);
    setSearchResults([]);

    try {
      const results = await googleImagesAPI.searchBookCovers(book.titulo, book.autor, 20);
      setSearchResults(results);
    } catch (error) {
      console.error('Search error:', error);
      setSearchError(error instanceof Error ? error.message : 'Error al buscar imágenes');
    } finally {
      setIsSearching(false);
    }
  };

  // Handle file upload
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadError(null);

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setUploadError('Por favor selecciona un archivo de imagen válido');
      setIsUploading(false);
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setUploadError('El archivo es demasiado grande. Máximo 5MB');
      setIsUploading(false);
      return;
    }

    // Compress and convert to base64
    const compressImage = (file: File): Promise<string> => {
      return new Promise((resolve, reject) => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();

        img.onload = () => {
          // Calculate new dimensions (max 800px width/height)
          const maxSize = 800;
          let { width, height } = img;

          if (width > height) {
            if (width > maxSize) {
              height = (height * maxSize) / width;
              width = maxSize;
            }
          } else {
            if (height > maxSize) {
              width = (width * maxSize) / height;
              height = maxSize;
            }
          }

          canvas.width = width;
          canvas.height = height;

          // Draw and compress
          ctx?.drawImage(img, 0, 0, width, height);

          // Convert to base64 with compression (0.8 quality)
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.8);
          resolve(compressedDataUrl);
        };

        img.onerror = reject;
        img.src = URL.createObjectURL(file);
      });
    };

    compressImage(file)
      .then((compressedImage) => {
        onImageSelect(compressedImage);
        onClose();
      })
      .catch((error) => {
        console.error('Error compressing image:', error);
        setUploadError('Error al procesar la imagen. Por favor, inténtalo de nuevo.');
      })
      .finally(() => {
        setIsUploading(false);
      });
  };

  // Handle image selection from search results
  const handleImageSelect = (imageUrl: string) => {
    onImageSelect(imageUrl);
    onClose();
  };

  // Handle keyboard events
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
      if (event.key === 'Enter' && selectedTab === 'search' && searchQuery.trim()) {
        handleSearch();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, selectedTab, searchQuery]);

  if (!isOpen) return null;

  const modalContent = (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm"
      onClick={onClose}
      style={{ opacity: 0, animation: 'fadeIn 0.3s ease-out forwards' }}
    >
      <div
        className="relative w-full max-w-4xl max-h-[90vh] bg-white dark:bg-slate-800 rounded-lg shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
        style={{ opacity: 0, transform: 'scale(0.9)', animation: 'modalAppear 0.3s ease-out forwards' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700">
          <div>
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
              Modificar portada de "{book.titulo}"
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
              Busca en Google Images o sube una imagen desde tu dispositivo
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors"
          >
            <X className="h-5 w-5 text-slate-500" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-200 dark:border-slate-700">
          <button
            onClick={() => setSelectedTab('search')}
            className={`flex-1 px-6 py-3 text-sm font-medium transition-colors ${
              selectedTab === 'search'
                ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50 dark:bg-blue-900/20'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Search className="h-4 w-4 inline mr-2" />
            Buscar en Google
          </button>
          <button
            onClick={() => setSelectedTab('upload')}
            className={`flex-1 px-6 py-3 text-sm font-medium transition-colors ${
              selectedTab === 'upload'
                ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50 dark:bg-blue-900/20'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Upload className="h-4 w-4 inline mr-2" />
            Subir archivo
          </button>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[60vh] overflow-y-auto">
          {selectedTab === 'search' ? (
            <div className="space-y-4">
              {/* API Configuration Warning */}
              {!isApiConfigured && (
                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                  <div className="flex items-start">
                    <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5 mr-3" />
                    <div>
                      <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                        API de Google no configurada
                      </h3>
                      <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                        Para usar la búsqueda de Google Images, necesitas configurar las variables de entorno:
                        <br />
                        <code className="bg-yellow-100 dark:bg-yellow-800 px-1 rounded text-xs">
                          REACT_APP_GOOGLE_SEARCH_API_KEY
                        </code>{' '}
                        y{' '}
                        <code className="bg-yellow-100 dark:bg-yellow-800 px-1 rounded text-xs">
                          REACT_APP_GOOGLE_SEARCH_ENGINE_ID
                        </code>
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Search Input */}
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar imágenes..."
                  className="flex-1 px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
                  disabled={!isApiConfigured}
                />
                <button
                  onClick={handleSearch}
                  disabled={!isApiConfigured || isSearching || !searchQuery.trim()}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
                >
                  {isSearching ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Search className="h-4 w-4 mr-2" />
                  )}
                  Buscar
                </button>
              </div>

              {/* Search Error */}
              {searchError && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                  <div className="flex items-start">
                    <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5 mr-3" />
                    <div>
                      <p className="text-sm text-red-700 dark:text-red-300">{searchError}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Search Results */}
              {searchResults.length > 0 && (
                <div>
                  <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-4">
                    Resultados ({searchResults.length})
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {searchResults.map((result, index) => (
                      <div
                        key={index}
                        className="group relative bg-slate-100 dark:bg-slate-700 rounded-lg overflow-hidden cursor-pointer hover:shadow-lg transition-all duration-200"
                        onClick={() => handleImageSelect(result.link)}
                      >
                        <img
                          src={result.image.thumbnailLink}
                          alt={result.title}
                          className="w-full h-32 object-cover group-hover:scale-105 transition-transform duration-200"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                          }}
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-200 flex items-center justify-center">
                          <Download className="h-8 w-8 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                        </div>
                        <div className="p-2">
                          <p className="text-xs text-slate-600 dark:text-slate-400 truncate">
                            {result.title}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* No Results */}
              {!isSearching && searchResults.length === 0 && searchQuery && !searchError && (
                <div className="text-center py-8">
                  <ImageIcon className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                  <p className="text-slate-600 dark:text-slate-400">
                    No se encontraron imágenes para "{searchQuery}"
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {/* Upload Area */}
              <div
                className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg p-8 text-center hover:border-blue-400 dark:hover:border-blue-400 transition-colors cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
                  Subir imagen
                </h3>
                <p className="text-slate-600 dark:text-slate-400 mb-4">
                  Haz clic para seleccionar una imagen o arrastra y suelta aquí
                </p>
                <p className="text-sm text-slate-500 dark:text-slate-500">
                  Formatos: JPG, PNG, GIF • Máximo: 5MB
                </p>
              </div>

              {/* Upload Error */}
              {uploadError && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                  <div className="flex items-start">
                    <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5 mr-3" />
                    <div>
                      <p className="text-sm text-red-700 dark:text-red-300">{uploadError}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Upload Progress */}
              {isUploading && (
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                  <div className="flex items-center">
                    <Loader2 className="h-5 w-5 text-blue-600 dark:text-blue-400 animate-spin mr-3" />
                    <p className="text-sm text-blue-700 dark:text-blue-300">
                      Procesando imagen...
                    </p>
                  </div>
                </div>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t border-slate-200 dark:border-slate-700">
          <button
            onClick={onClose}
            className="px-4 py-2 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
          >
            Cancelar
          </button>
        </div>
      </div>

      {/* CSS Animations */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes modalAppear {
          from { 
            opacity: 0; 
            transform: scale(0.9);
          }
          to { 
            opacity: 1; 
            transform: scale(1);
          }
        }
      `}</style>
    </div>
  );

  return ReactDOM.createPortal(modalContent, document.body);
};

export default GoogleImagesSearchModal;