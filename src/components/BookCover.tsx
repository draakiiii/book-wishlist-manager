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
  const [fallbackImageUrl, setFallbackImageUrl] = useState<string | null>(null);
  const [imageReady, setImageReady] = useState(false);

  // Choose appropriate image URL based on context and size
  // Priority: customImage > API images based on context
  const getImageUrl = () => {
    console.log('🖼️ Getting image URL for book:', book.titulo, {
      hasCustomImage: !!book.customImage,
      customImageLength: book.customImage?.length,
      thumbnail: !!book.thumbnail,
      smallThumbnail: !!book.smallThumbnail
    });
    
    // Always prioritize custom user image if available
    if (book.customImage) {
      console.log('✅ Using custom image for:', book.titulo);
      return book.customImage;
    }
    
    // Fall back to API images based on context
    const apiImage = (context === 'detail' || context === 'gallery' || size === 'large') 
      ? book.thumbnail || book.smallThumbnail 
      : book.smallThumbnail || book.thumbnail;
    
    console.log('📚 Using API image for:', book.titulo, apiImage ? 'Yes' : 'No');
    return apiImage;
  };

  const imageUrl = getImageUrl();

  // Optimize image URLs for better quality based on source
  const optimizeImageUrl = (url: string | undefined): string | undefined => {
    if (!url) {
      console.log('⚠️ No URL provided to optimize for book:', book.titulo);
      return url;
    }
    
    // Check if it's a Google Books URL
    if (url.includes('books.google.com') || url.includes('books.googleusercontent.com')) {
      console.log('🔧 Optimizing Google Books URL:', url);
      
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
      
      console.log('✅ Optimized Google Books URL:', optimizedUrl);
      return optimizedUrl;
    }
    
    // Check if it's an OpenLibrary URL
    if (url.includes('covers.openlibrary.org')) {
      console.log('🔧 Optimizing OpenLibrary URL:', url);
      
      // For large view, ensure we're using the largest available size
      // OpenLibrary URLs have format: .../id/12345-S.jpg, .../id/12345-M.jpg, .../id/12345-L.jpg
      // or .../isbn/1234567890123-S.jpg, etc.
      
      // Try to upgrade to larger size if we're not already using the largest
      let optimizedUrl = url;
      
      // If we have a small or medium size, try to get the large version
      if (url.includes('-S.jpg')) {
        optimizedUrl = url.replace('-S.jpg', '-L.jpg');
        console.log('🔄 Upgrading from Small to Large:', optimizedUrl);
      } else if (url.includes('-M.jpg')) {
        optimizedUrl = url.replace('-M.jpg', '-L.jpg');
        console.log('🔄 Upgrading from Medium to Large:', optimizedUrl);
      }
      
      console.log('✅ Optimized OpenLibrary URL:', optimizedUrl);
      return optimizedUrl;
    }
    
    return url;
  };

  // Function to check if a Google Books URL actually has an image
  const checkImageAvailability = async (url: string): Promise<boolean> => {
    try {
      const response = await fetch(url, { method: 'HEAD' });
      return response.ok;
    } catch (error) {
      console.warn('Error checking image availability:', error);
      return false;
    }
  };

  // Function to get OpenLibrary fallback URL - now using the improved API
  const getOpenLibraryFallback = async (isbn: string): Promise<string | null> => {
    if (!isbn) return null;
    
    try {
      // Import the improved function from OpenLibrary API
      const { getBestAvailableCover } = await import('../services/openLibraryAPI');
      
      // Try to get the large size cover for the best quality
      const coverUrl = await getBestAvailableCover(isbn, 'L');
      
      if (coverUrl) {
        console.log('✅ Got OpenLibrary fallback using improved API:', coverUrl);
        return coverUrl;
      }
      
      console.log('❌ No OpenLibrary fallback found for ISBN:', isbn);
      return null;
      
    } catch (error) {
      console.warn('Error getting OpenLibrary fallback:', error);
      
      // Fallback to the old method if the new API fails
      const cleanIsbn = isbn.replace(/[^0-9X]/gi, '');
      const directUrl = `https://covers.openlibrary.org/b/isbn/${cleanIsbn}-L.jpg`;
      console.log('🔄 Using direct OpenLibrary fallback as last resort:', directUrl);
      return directUrl;
    }
  };

  // Get the best quality image available for the large view modal
  const getBestQualityImage = () => {
    // Priority order for large view: customImage > thumbnail > smallThumbnail
    console.log('🔍 Selecting best quality image for:', book.titulo);
    console.log('📊 Available images:', {
      customImage: book.customImage ? 'Yes' : 'No',
      thumbnail: book.thumbnail || 'Not available',
      smallThumbnail: book.smallThumbnail || 'Not available'
    });
    
    // Always prioritize custom user image if available
    if (book.customImage) {
      console.log('✅ Selected: Custom image (highest priority)');
      return book.customImage;
    }
    
    // For API images, prioritize the highest quality available
    // Check if we have both thumbnail and smallThumbnail to choose the best
    if (book.thumbnail && book.smallThumbnail) {
      // If both are available, choose the one that's likely to be higher quality
      // Google Books thumbnail is usually better than smallThumbnail
      // For OpenLibrary, check if thumbnail is already large size
      if (book.thumbnail.includes('covers.openlibrary.org') && book.thumbnail.includes('-L.jpg')) {
        console.log('✅ Selected: OpenLibrary Large thumbnail');
        return book.thumbnail; // Already optimized
      } else if (book.thumbnail.includes('books.google.com')) {
        console.log('✅ Selected: Google Books thumbnail (will optimize)');
        return optimizeImageUrl(book.thumbnail);
      } else {
        // For other cases, optimize the thumbnail
        console.log('✅ Selected: Thumbnail (will optimize)');
        return optimizeImageUrl(book.thumbnail);
      }
    }
    
    // If only thumbnail is available
    if (book.thumbnail) {
      console.log('✅ Selected: Available thumbnail (will optimize)');
      return optimizeImageUrl(book.thumbnail);
    }
    
    // If only smallThumbnail is available, try to upgrade it
    if (book.smallThumbnail) {
      console.log('⚠️ Selected: Small thumbnail (will try to upgrade)');
      return optimizeImageUrl(book.smallThumbnail);
    }
    
    // Fallback to the current imageUrl (shouldn't happen if we have any image)
    console.log('❌ Selected: General fallback imageUrl');
    return optimizeImageUrl(imageUrl);
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
  const handleViewLarge = async () => {
    console.log('🖼️ Starting large view process for book:', book.titulo);
    console.log('📊 Image sources available:', {
      customImage: book.customImage ? 'Yes' : 'No',
      thumbnail: book.thumbnail || 'Not available',
      smallThumbnail: book.smallThumbnail || 'Not available',
      isbn: book.isbn || 'Not available'
    });
    
    setShowMenu(false);
    // Reset large image states
    setLargeImageLoading(true);
    setLargeImageError(false);
    setFallbackImageUrl(null);
    setImageReady(false);
    
    // Start background verification and fallback process
    await startImageVerification();
    
    // Only open modal after verification is complete
    console.log('✅ Image verification complete, opening modal');
    setShowLargeView(true);
  };

  // Background image verification and fallback process
  const startImageVerification = async () => {
    const bestImage = getBestQualityImage();
    
    // If we have a custom image, no verification needed
    if (book.customImage) {
      console.log('✅ Using custom image, no verification needed');
      setLargeImageLoading(false); // Show the custom image
      setImageReady(true); // Ready to show the image
      return;
    }
    
    // If we have a Google Books URL, verify it first
    if (bestImage && bestImage.includes('books.google.com') && book.isbn) {
      console.log('🔍 Starting background verification for Google Books URL...');
      
      try {
        // Start verification in background
        const verificationPromise = checkImageAvailability(bestImage);
        
        // Set a timeout to avoid waiting too long
        const timeoutPromise = new Promise<boolean>((resolve) => {
          setTimeout(() => {
            console.log('⏰ Verification timeout, proceeding with fallback...');
            resolve(false);
          }, 2000); // 2 second timeout
        });
        
        // Race between verification and timeout
        const isAvailable = await Promise.race([verificationPromise, timeoutPromise]);
        
        if (!isAvailable) {
          console.log('⚠️ Google Books image not available, getting OpenLibrary fallback...');
          const fallbackUrl = await getOpenLibraryFallback(book.isbn);
          if (fallbackUrl) {
            console.log('✅ Got OpenLibrary fallback, switching to:', fallbackUrl);
            setFallbackImageUrl(fallbackUrl);
            // Image is ready to show
            setLargeImageLoading(false);
            setLargeImageError(false);
            setImageReady(true); // Ready to show the fallback image
          } else {
            // No fallback available, show error
            setLargeImageLoading(false);
            setLargeImageError(true);
            setImageReady(false);
          }
        } else {
          console.log('✅ Google Books image is available');
          // Image is ready to show
          setLargeImageLoading(false);
          setImageReady(true); // Ready to show the image
        }
      } catch (error) {
        console.warn('Error in background verification:', error);
        // If verification fails, try fallback anyway
        if (book.isbn) {
          console.log('🔄 Verification failed, trying fallback...');
          const fallbackUrl = await getOpenLibraryFallback(book.isbn);
          if (fallbackUrl) {
            console.log('✅ Got OpenLibrary fallback after error:', fallbackUrl);
            setFallbackImageUrl(fallbackUrl);
            setLargeImageLoading(false);
            setLargeImageError(false);
            setImageReady(true); // Ready to show the fallback image
          } else {
            // No fallback available, show error
            setLargeImageLoading(false);
            setLargeImageError(true);
            setImageReady(false);
          }
        } else {
          // No ISBN available, show error
          setLargeImageLoading(false);
          setLargeImageError(true);
          setImageReady(false);
        }
      }
    } else {
      // No Google Books URL or no ISBN, try to show what we have
      if (bestImage) {
        console.log('✅ Using available image without verification');
        setLargeImageLoading(false); // Image is ready to show
        setImageReady(true); // Ready to show the image
      } else {
        console.log('❌ No image available');
        setLargeImageLoading(false);
        setLargeImageError(true);
        setImageReady(false);
      }
    }
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
            {/* Loading state for large image - only show if we're still loading */}
            {largeImageLoading && !largeImageError && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                  <p className="text-slate-600 dark:text-slate-400">
                    {fallbackImageUrl ? 'Cargando imagen alternativa...' : 'Cargando imagen...'}
                  </p>
                  {fallbackImageUrl && (
                    <p className="text-xs text-slate-500 dark:text-slate-500 mt-2">
                      Buscando la mejor calidad disponible
                    </p>
                  )}
                </div>
              </div>
            )}
            
            {/* Error state for large image */}
            {largeImageError && (
              <div className="flex items-center justify-center p-8">
                <div className="text-center">
                  <BookOpen className="h-16 w-16 mx-auto text-slate-400 mb-4" />
                  <p className="text-slate-600 dark:text-slate-400">Error al cargar la imagen</p>
                </div>
              </div>
            )}

            {/* Large image - clean and centered */}
            {!largeImageError && imageReady && (
              <img
                src={fallbackImageUrl || getBestQualityImage()}
                alt={`Portada de ${book.titulo}`}
                className="max-w-full max-h-[90vh] object-contain rounded-lg opacity-100 transition-opacity duration-300"
                style={{ maxWidth: '100%', maxHeight: '90vh' }}
                onLoad={() => {
                  console.log('✅ Large image loaded successfully for:', book.titulo, fallbackImageUrl ? '(using fallback)' : '');
                  setLargeImageLoading(false);
                  setLargeImageError(false);
                  setImageReady(true);
                }}
                onError={async (e) => {
                  console.error('❌ Large image failed to load for:', book.titulo, e);
                  
                  // If we don't have a fallback URL yet and we have an ISBN, try to get one
                  if (!fallbackImageUrl && book.isbn && !largeImageError) {
                    console.log('🔄 Image failed, trying OpenLibrary fallback...');
                    try {
                      const fallbackUrl = await getOpenLibraryFallback(book.isbn);
                      if (fallbackUrl) {
                        console.log('✅ Got fallback URL, retrying with:', fallbackUrl);
                        setFallbackImageUrl(fallbackUrl);
                        setLargeImageLoading(true);
                        setLargeImageError(false);
                        setImageReady(false);
                        return; // Don't set error state, let it retry
                      }
                    } catch (fallbackError) {
                      console.warn('Fallback also failed:', fallbackError);
                    }
                  }
                  
                  setLargeImageLoading(false);
                  setLargeImageError(true);
                  setImageReady(false);
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
          {hasImage && (
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