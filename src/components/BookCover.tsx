import React, { useState } from 'react';
import { Book } from 'lucide-react';

interface BookCoverProps {
  portadaUrl?: string;
  portadaThumbnail?: string;
  titulo: string;
  className?: string;
  size?: 'small' | 'medium' | 'large';
}

const BookCover: React.FC<BookCoverProps> = ({ 
  portadaUrl, 
  portadaThumbnail, 
  titulo, 
  className = '',
  size = 'medium' 
}) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  const sizeClasses = {
    small: 'w-16 h-20 sm:w-20 sm:h-24',
    medium: 'w-24 h-32 sm:w-28 sm:h-36',
    large: 'w-32 h-40 sm:w-40 sm:h-48'
  };

  const imageUrl = portadaUrl || portadaThumbnail;

  if (!imageUrl || imageError) {
    return (
      <div className={`${sizeClasses[size]} ${className} rounded-lg bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-800 border border-slate-200 dark:border-slate-600 shadow-md flex items-center justify-center`}>
        <Book className="h-8 w-8 sm:h-10 sm:w-10 text-slate-400 dark:text-slate-500" />
      </div>
    );
  }

  return (
    <div className={`${sizeClasses[size]} ${className} relative rounded-lg overflow-hidden shadow-md border border-slate-200 dark:border-slate-600`}>
      {imageLoading && (
        <div className="absolute inset-0 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-800 flex items-center justify-center">
          <div className="animate-pulse">
            <Book className="h-8 w-8 sm:h-10 sm:w-10 text-slate-400 dark:text-slate-500" />
          </div>
        </div>
      )}
      <img
        src={imageUrl}
        alt={`Portada de ${titulo}`}
        className="w-full h-full object-cover transition-opacity duration-300"
        style={{ opacity: imageLoading ? 0 : 1 }}
        onLoad={() => setImageLoading(false)}
        onError={() => {
          setImageError(true);
          setImageLoading(false);
        }}
      />
    </div>
  );
};

export default BookCover;