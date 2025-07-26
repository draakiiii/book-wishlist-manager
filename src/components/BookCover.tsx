import React, { useState, Fragment, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { BookOpen, Eye, Upload, X } from 'lucide-react';
import { Libro } from '../types';

interface BookCoverProps {
  book: Libro;
  size?: 'small' | 'medium' | 'large';
  className?: string;
  context?: 'list' | 'detail' | 'gallery'; // Helps determine which image to prioritize
  onImageUpdate?: (bookId: number, imageUrl: string) => void; // Callback for image updates
}

const BookCover: React.FC<BookCoverProps> = ({ 
  book, 
  size = 'medium', 
  className = '', 
  context = 'list',
  onImageUpdate
}) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);
  const [showMenu, setShowMenu] = useState(false);
  const [showLargeView, setShowLargeView] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [largeImageLoading, setLargeImageLoading] = useState(true);
  const [largeImageError, setLargeImageError] = useState(false);

  // Choose appropriate image URL based on context and size
  // Priority: customImage > API images based on context
  const getImageUrl = () => {
    console.log('🖼️ Getting image URL for book:', book.titulo, {
      hasCustomImage: !!book.customImage,
      customImageLength: book.customImage?.length,
      thumbnail: !!book.thumbnail,
      smallThumbnail: !!book.smallThumbnail
    });
    
    // Always prioritize custom user image if available and valid
    if (book.customImage && isValidImageUrl(book.customImage)) {
      console.log('✅ Using custom image for:', book.titulo);
      return book.customImage;
    }
    
    // Fall back to API images based on context, but validate them
    const preferredImage = (context === 'detail' || context === 'gallery' || size === 'large') 
      ? book.thumbnail || book.smallThumbnail 
      : book.smallThumbnail || book.thumbnail;
    
    if (preferredImage && isValidImageUrl(preferredImage)) {
      console.log('📚 Using API image for:', book.titulo, 'Yes (valid)');
      return preferredImage;
    }
    
    // Try the other image if the preferred one is invalid
    const fallbackImage = (context === 'detail' || context === 'gallery' || size === 'large') 
      ? book.smallThumbnail || book.thumbnail 
      : book.thumbnail || book.smallThumbnail;
    
    if (fallbackImage && isValidImageUrl(fallbackImage)) {
      console.log('📚 Using fallback API image for:', book.titulo, 'Yes (valid)');
      return fallbackImage;
    }
    
    console.log('❌ No valid image URL found for:', book.titulo);
    return undefined;
  };

  const imageUrl = getImageUrl();

  // Optimize Google Books image URLs for better quality
  const optimizeImageUrl = (url: string | undefined): string | undefined => {
    if (!url) {
      console.log('⚠️ optimizeImageUrl called with empty URL');
      return url;
    }
    
    // Check if it's a Google Books URL
    if (url.includes('books.google.com') || url.includes('books.googleusercontent.com')) {
      console.log('🔧 Optimizing Google Books URL:', url);
      
      try {
        // For large view, we want maximum quality
        // Replace zoom=1 with zoom=0 (larger), zoom=5 with zoom=2 (larger)
        // Remove edge=curl which can reduce quality
        // Add maxwidth and maxheight for better scaling
        let optimizedUrl = url
          .replace(/zoom=5/g, 'zoom=1')  // Change small thumbnail zoom to larger
          .replace(/zoom=1/g, 'zoom=0')  // Change thumbnail zoom to maximum
          .replace(/&edge=curl/g, '')    // Remove curl effect
          .replace(/edge=curl&/g, '');   // Remove curl effect at start
        
        // Add quality parameters if not present
        if (!optimizedUrl.includes('maxwidth')) {
          optimizedUrl += '&maxwidth=800';
        }
        if (!optimizedUrl.includes('maxheight')) {
          optimizedUrl += '&maxheight=1200';
        }
        
        console.log('✅ Optimized URL:', optimizedUrl);
        return optimizedUrl;
      } catch (error) {
        console.error('❌ Error optimizing URL:', error);
        return url; // Return original URL if optimization fails
      }
    }
    
    console.log('📎 Non-Google Books URL, returning as-is:', url);
    return url;
  };

  // Validate if a URL is a valid image URL
  const isValidImageUrl = (url: string | undefined): boolean => {
    if (!url || url.trim() === '') return false;
    
    // Check for data URLs (base64 images)
    if (url.startsWith('data:image/')) return true;
    
    // Check for HTTP/HTTPS URLs
    if (url.startsWith('http://') || url.startsWith('https://')) {
      try {
        new URL(url); // Validate URL format
        return true;
      } catch {
        return false;
      }
    }
    
    return false;
  };

  // Get the best quality image available for the large view modal
  const getBestQualityImage = () => {
    // Priority order for large view: customImage > thumbnail > smallThumbnail
    console.log('🔍 Selecting best quality image for:', book.titulo);
    console.log('📊 Available images:', {
      customImage: book.customImage ? 'Yes (valid)' : 'No',
      thumbnail: book.thumbnail ? `Yes (${isValidImageUrl(book.thumbnail) ? 'valid' : 'invalid'})` : 'Not available',
      smallThumbnail: book.smallThumbnail ? `Yes (${isValidImageUrl(book.smallThumbnail) ? 'valid' : 'invalid'})` : 'Not available'
    });
    
    if (book.customImage && isValidImageUrl(book.customImage)) {
      console.log('✅ Selected: Custom image');
      return book.customImage;
    }
    if (book.thumbnail && isValidImageUrl(book.thumbnail)) {
      console.log('✅ Selected: High resolution thumbnail');
      const optimized = optimizeImageUrl(book.thumbnail);
      return optimized;
    }
    if (book.smallThumbnail && isValidImageUrl(book.smallThumbnail)) {
      console.log('⚠️ Selected: Small thumbnail (fallback) - optimizing...');
      const optimized = optimizeImageUrl(book.smallThumbnail);
      return optimized;
    }
    
    // If we reach here, there's no valid image available
    console.log('❌ No valid image available for large view');
    return null;
  };

  // Size configurations
  const sizeClasses = {
    small: 'w-8 h-10',
    medium: 'w-16 h-20',
    large: 'w-32 h-44'
  };

  // Check if this is being used in gallery view (compact variant)
  const isGalleryView = context === 'gallery' || className.includes('compact') || className.includes('gallery');

  // Placeholder text based on size
  const placeholderText = {
    small: '',
    medium: isGalleryView ? 'Sin portada' : 'Sin portada',
    large: 'Portada no disponible'
  };

  // Icon size based on component size
  const iconSize = {
    small: 'h-3 w-3',
    medium: isGalleryView ? 'h-6 w-6' : 'h-4 w-4',
    large: 'h-8 w-8'
  };

  // Handle click on cover to show menu (only for medium and large sizes)
  const handleCoverClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (size !== 'small') {
      setShowMenu(true);
    }
  };

  // Handle file upload
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && onImageUpdate) {
      setIsUploading(true);
      
      // Compress and resize image before saving
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
          onImageUpdate(book.id, compressedImage);
          setIsUploading(false);
          setShowMenu(false);
        })
        .catch((error) => {
          console.error('Error compressing image:', error);
          setIsUploading(false);
          alert('Error al procesar la imagen. Por favor, inténtalo de nuevo.');
        });
    }
  };

  // Handle view large image
  const handleViewLarge = () => {
    setShowLargeView(true);
    setShowMenu(false);
    // Reset large image states
    setLargeImageLoading(true);
    setLargeImageError(false);
  };

  // Handle keyboard events and body scroll
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (showMenu) {
          setShowMenu(false);
        }
        if (showLargeView) {
          setShowLargeView(false);
        }
      }
    };

    if (showMenu || showLargeView) {
      document.addEventListener('keydown', handleKeyDown);
      // Prevent body scroll when modal is open
      if (showLargeView) {
        document.body.style.overflow = 'hidden';
      }
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      // Restore body scroll
      document.body.style.overflow = '';
    };
  }, [showMenu, showLargeView]);

  // Large Image Modal Component
  const LargeImageModal = () => {
    if (!showLargeView) return null;

    const bestQualityImage = getBestQualityImage();

    const modalContent = (
      <div
        className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm"
        onClick={() => setShowLargeView(false)}
        style={{ opacity: 0, animation: 'fadeIn 0.3s ease-out forwards' }}
      >
        <div
          className="relative max-w-4xl max-h-[90vh] rounded-lg shadow-2xl overflow-hidden"
          onClick={(e) => e.stopPropagation()}
          style={{ opacity: 0, transform: 'scale(0.9)', animation: 'modalAppear 0.3s ease-out forwards' }}
        >
          {/* Close button */}
          <button
            onClick={() => setShowLargeView(false)}
            className="absolute top-3 right-3 z-20 p-2 bg-black/60 hover:bg-black/80 text-white rounded-full transition-colors shadow-lg"
          >
            <X className="h-5 w-5" />
          </button>
          
          {/* Image container - centered and clean */}
          <div className="relative bg-slate-50 dark:bg-slate-900 flex items-center justify-center min-h-[400px]">
            {/* No image available state */}
            {!bestQualityImage && (
              <div className="flex items-center justify-center p-8">
                <div className="text-center">
                  <BookOpen className="h-16 w-16 mx-auto text-slate-400 mb-4" />
                  <p className="text-slate-600 dark:text-slate-400 text-lg font-medium mb-2">Imagen no disponible</p>
                  <p className="text-slate-500 dark:text-slate-500 text-sm">
                    Esta portada no está disponible en alta resolución
                  </p>
                </div>
              </div>
            )}

            {/* Loading state for large image */}
            {bestQualityImage && largeImageLoading && !largeImageError && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                  <p className="text-slate-600 dark:text-slate-400">Cargando imagen...</p>
                </div>
              </div>
            )}
            
            {/* Error state for large image */}
            {bestQualityImage && largeImageError && (
              <div className="flex items-center justify-center p-8">
                <div className="text-center">
                  <BookOpen className="h-16 w-16 mx-auto text-slate-400 mb-4" />
                  <p className="text-slate-600 dark:text-slate-400 text-lg font-medium mb-2">Error al cargar la imagen</p>
                  <p className="text-slate-500 dark:text-slate-500 text-sm">
                    No se pudo cargar la imagen en alta resolución
                  </p>
                </div>
              </div>
            )}

            {/* Large image - clean and centered */}
            {bestQualityImage && (
              <img
                src={bestQualityImage}
                alt={`Portada de ${book.titulo}`}
                className={`max-w-full max-h-[90vh] object-contain rounded-lg ${largeImageLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
                style={{ maxWidth: '100%', maxHeight: '90vh' }}
                onLoad={() => {
                  setLargeImageLoading(false);
                  setLargeImageError(false);
                }}
                onError={() => {
                  setLargeImageLoading(false);
                  setLargeImageError(true);
                }}
              />
            )}
          </div>
          
          {/* Minimal book info - only title, small and subtle */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
            <h3 className="text-white text-lg font-medium text-center truncate">{book.titulo}</h3>
          </div>
        </div>

        {/* CSS Animations for Modal */}
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

    // Use portal to render modal at document body level
    return ReactDOM.createPortal(modalContent, document.body);
  };

  // Context Menu Component
  const ContextMenu = ({ hasImage }: { hasImage: boolean }) => {
    if (!showMenu || size === 'small') return null;

    // Check if we actually have an image available for large view
    const hasLargeViewImage = getBestQualityImage() !== null;

    return (
      <>
        {/* Backdrop */}
        <div 
          className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm"
          onClick={() => setShowMenu(false)}
          style={{ 
            opacity: 0,
            animation: 'fadeIn 0.2s ease-out forwards'
          }}
        />
        
        {/* Menu */}
        <div
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-slate-200 dark:border-slate-700 p-2 min-w-[160px]"
          style={{ 
            opacity: 0,
            transform: 'translate(-50%, -50%) scale(0.95)',
            animation: 'menuAppear 0.2s ease-out forwards'
          }}
        >
          {hasLargeViewImage && (
            <button
              onClick={handleViewLarge}
              className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-md transition-colors"
            >
              <Eye className="h-4 w-4" />
              <span>Ver en grande</span>
            </button>
          )}
          
          <button
            onClick={() => {
              document.getElementById(`file-input-${book.id}`)?.click();
            }}
            disabled={isUploading}
            className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-md transition-colors disabled:opacity-50"
          >
            <Upload className="h-4 w-4" />
            <span>{isUploading ? 'Subiendo...' : 'Modificar portada'}</span>
          </button>
          
          <input
            id={`file-input-${book.id}`}
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
          />
        </div>

        {/* CSS Animations */}
        <style>{`
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          
          @keyframes menuAppear {
            from { 
              opacity: 0; 
              transform: translate(-50%, -50%) scale(0.95);
            }
            to { 
              opacity: 1; 
              transform: translate(-50%, -50%) scale(1);
            }
          }
        `}</style>
      </>
    );
  };

  if (!imageUrl || imageError) {
    // Placeholder image when no image is available or loading failed
    return (
      <div className="relative">
        <div 
          className={`${sizeClasses[size]} ${className} flex items-center justify-center bg-slate-200 dark:bg-slate-700 rounded-lg border border-slate-300 dark:border-slate-600 ${size !== 'small' ? 'cursor-pointer hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors' : ''}`}
          onClick={handleCoverClick}
        >
          <div className={`text-center ${isGalleryView ? 'p-4 flex flex-col justify-center h-full' : 'p-2'}`}>
            <BookOpen className={`${iconSize[size]} mx-auto text-slate-400 dark:text-slate-500 ${size !== 'small' ? (isGalleryView ? 'mb-3' : 'mb-2') : ''}`} />
            {placeholderText[size] && (
              <span className={`text-slate-400 dark:text-slate-500 leading-none ${size === 'large' ? 'text-sm' : isGalleryView ? 'text-base' : 'text-xs'}`}>
                {placeholderText[size]}
              </span>
            )}
          </div>
        </div>

        <ContextMenu hasImage={false} />
      </div>
    );
  }

  return (
    <div className="relative">
      <div 
        className={`${sizeClasses[size]} ${className} relative overflow-hidden rounded-lg border border-slate-300 dark:border-slate-600 ${size === 'large' ? 'shadow-lg' : 'shadow-sm'} ${size !== 'small' ? 'cursor-pointer hover:opacity-90 transition-opacity' : ''}`}
        onClick={handleCoverClick}
      >
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

      <ContextMenu hasImage={true} />

      <LargeImageModal />
    </div>
  );
};

export default BookCover;