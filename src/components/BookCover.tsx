import React, { useState } from 'react';
import { BookOpen } from 'lucide-react';
import { Libro } from '../types';

interface BookCoverProps {
  book: Libro;
  size?: 'small' | 'medium' | 'large';
  className?: string;
  context?: 'list' | 'detail'; // Helps determine which image to prioritize
}

const BookCover: React.FC<BookCoverProps> = ({ 
  book, 
  size = 'medium', 
  className = '', 
  context = 'list' 
}) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  // Choose appropriate image URL based on context and size
  // For list views, prioritize smallThumbnail for better performance
  // For detail views or large size, prioritize thumbnail for better quality
  const imageUrl = (context === 'detail' || size === 'large') 
    ? book.thumbnail || book.smallThumbnail 
    : book.smallThumbnail || book.thumbnail;

  // Size configurations
  const sizeClasses = {
    small: 'w-8 h-10',
    medium: 'w-16 h-20',
    large: 'w-32 h-44'
  };

  // Placeholder text based on size
  const placeholderText = {
    small: '',
    medium: 'Sin portada',
    large: 'Portada no disponible'
  };

  // Icon size based on component size
  const iconSize = {
    small: 'h-3 w-3',
    medium: 'h-4 w-4',
    large: 'h-8 w-8'
  };

  if (!imageUrl || imageError) {
    // Placeholder image when no image is available or loading failed
    return (
      <div className={`${sizeClasses[size]} ${className} flex items-center justify-center bg-slate-200 dark:bg-slate-700 rounded-lg border border-slate-300 dark:border-slate-600`}>
        <div className="text-center p-2">
          <BookOpen className={`${iconSize[size]} mx-auto text-slate-400 dark:text-slate-500 ${size !== 'small' ? 'mb-1' : ''}`} />
          {placeholderText[size] && (
            <span className={`text-slate-400 dark:text-slate-500 leading-none ${size === 'large' ? 'text-sm' : 'text-xs'}`}>
              {placeholderText[size]}
            </span>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={`${sizeClasses[size]} ${className} relative overflow-hidden rounded-lg border border-slate-300 dark:border-slate-600 ${size === 'large' ? 'shadow-lg' : 'shadow-sm'}`}>
      {imageLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-200 dark:bg-slate-700">
          <div className="animate-pulse">
            <BookOpen className={`${iconSize[size]} text-slate-400`} />
          </div>
        </div>
      )}
      <img
        src={imageUrl}
        alt={`Portada de ${book.titulo}`}
        className="w-full h-full object-cover"
        onLoad={() => setImageLoading(false)}
        onError={() => {
          setImageError(true);
          setImageLoading(false);
        }}
        style={{ display: imageLoading ? 'none' : 'block' }}
      />
    </div>
  );
};

export default BookCover;