import React, { useState } from 'react';
import { BookOpen } from 'lucide-react';

interface BookCoverImageProps {
  book: {
    imageLinks?: {
      smallThumbnail?: string;
      thumbnail?: string;
    };
    titulo: string;
  };
  isDetailView?: boolean;
  className?: string;
}

const BookCoverImage: React.FC<BookCoverImageProps> = ({ 
  book, 
  isDetailView = false, 
  className = "w-full h-full object-cover rounded-lg" 
}) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  // Determinar qué URL de imagen usar según el contexto
  const getImageUrl = () => {
    if (!book.imageLinks) return null;
    
    if (isDetailView) {
      // En vista de detalle, usar imagen de mayor resolución
      return book.imageLinks.thumbnail || book.imageLinks.smallThumbnail;
    } else {
      // En vista de lista, usar imagen de baja resolución
      return book.imageLinks.smallThumbnail || book.imageLinks.thumbnail;
    }
  };

  const imageUrl = getImageUrl();

  const handleImageLoad = () => {
    setImageLoading(false);
    setImageError(false);
  };

  const handleImageError = () => {
    setImageLoading(false);
    setImageError(true);
  };

  // Si no hay imagen o hubo error, mostrar placeholder
  if (!imageUrl || imageError) {
    return (
      <div className={`bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-800 flex items-center justify-center ${className}`}>
        <div className="text-center p-4">
          <BookOpen className="h-8 w-8 text-slate-400 dark:text-slate-500 mx-auto mb-2" />
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            Portada no disponible
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      {imageLoading && (
        <div className={`absolute inset-0 bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-800 flex items-center justify-center ${className}`}>
          <div className="animate-pulse">
            <BookOpen className="h-6 w-6 text-slate-400 dark:text-slate-500" />
          </div>
        </div>
      )}
      
      <img
        src={imageUrl}
        alt={`Portada de ${book.titulo}`}
        className={`${className} ${imageLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
        onLoad={handleImageLoad}
        onError={handleImageError}
        loading={isDetailView ? 'eager' : 'lazy'}
      />
    </div>
  );
};

export default BookCoverImage;