import { BookData } from '../types';

// Cache para evitar llamadas repetidas a la API
const bookCache = new Map<string, BookData>();
const searchCache = new Map<string, BookData[]>();

// Configuración de la API
const API_CONFIG = {
  baseUrl: 'https://www.googleapis.com/books/v1/volumes',
  maxResults: 10,
  language: 'es',
  timeout: 10000, // 10 segundos
};

// Función para limpiar el caché periódicamente
const cleanupCache = () => {
  const now = Date.now();
  const maxAge = 30 * 60 * 1000; // 30 minutos
  
  for (const [key, value] of bookCache.entries()) {
    if (now - (value as any).timestamp > maxAge) {
      bookCache.delete(key);
    }
  }
  
  for (const [key, value] of searchCache.entries()) {
    if (now - (value as any).timestamp > maxAge) {
      searchCache.delete(key);
    }
  }
};

// Limpiar caché cada 5 minutos
setInterval(cleanupCache, 5 * 60 * 1000);

// Función para hacer peticiones con timeout
const fetchWithTimeout = async (url: string, options: RequestInit = {}, timeout: number = API_CONFIG.timeout): Promise<Response> => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
};

export const fetchBookData = async (isbn: string): Promise<BookData | null> => {
  try {
    // Clean the ISBN (remove any non-numeric characters except 'X')
    const cleanIsbn = isbn.replace(/[^0-9X]/gi, '');
    
    // Check cache first
    const cacheKey = `isbn_${cleanIsbn}`;
    if (bookCache.has(cacheKey)) {
      const cachedData = bookCache.get(cacheKey);
      console.log('Using cached book data for ISBN:', cleanIsbn);
      return cachedData || null;
    }
    
    // Try multiple search strategies
    const searchQueries = [
      `isbn:${cleanIsbn}`,
      `isbn:${cleanIsbn.replace(/^978/, '')}`, // Try without 978 prefix
      `isbn:978${cleanIsbn}` // Try with 978 prefix
    ];

    let bookData: BookData | null = null;

    for (const query of searchQueries) {
      try {
        const url = `${API_CONFIG.baseUrl}?q=${encodeURIComponent(query)}&langRestrict=${API_CONFIG.language}`;
        const response = await fetchWithTimeout(url);
        
        if (!response.ok) {
          console.warn(`API request failed for query: ${query}`, response.status, response.statusText);
          continue;
        }
        
        const data = await response.json();
        
        if (data.totalItems > 0) {
          const book = data.items[0].volumeInfo;
          
          // Extract and clean the title
          let title = book.title || '';
          if (book.subtitle) {
            title += `: ${book.subtitle}`;
          }
          
          // Extract authors
          let author = '';
          if (book.authors && book.authors.length > 0) {
            author = book.authors.join(', ');
          }
          
          // Extract page count
          let pages: number | undefined;
          if (book.pageCount) {
            pages = book.pageCount;
          } else if (book.printedPageCount) {
            pages = book.printedPageCount;
          }
          
          // Extract publication date
          let publicationYear: number | undefined;
          if (book.publishedDate) {
            const year = parseInt(book.publishedDate.substring(0, 4));
            if (!isNaN(year)) {
              publicationYear = year;
            }
          }
          
          // Extract publisher
          const publisher = book.publisher || '';
          
          // Extract description
          const description = book.description || '';
          
          // Extract categories/genres
          const categories = book.categories || [];
          
          // Extract language
          const language = book.language || '';
          
          // Extract image URLs
          let smallThumbnail: string | undefined;
          let thumbnail: string | undefined;
          if (book.imageLinks) {
            smallThumbnail = book.imageLinks.smallThumbnail;
            thumbnail = book.imageLinks.thumbnail;
            
            // Debug logging for image URLs
            console.log('📸 Image URLs extracted:', {
              smallThumbnail,
              thumbnail,
              rawImageLinks: book.imageLinks
            });
          } else {
            console.log('❌ No imageLinks found in book data, will try Open Library fallback');
            
            // Fallback a Open Library para portadas (usando tamaño L para mejor calidad)
            try {
              const openLibraryCovers = await getOpenLibraryCovers(cleanIsbn);
              if (openLibraryCovers.large || openLibraryCovers.medium || openLibraryCovers.small) {
                // Usar tamaño L para thumbnail (vista principal) y M para smallThumbnail
                smallThumbnail = openLibraryCovers.medium || openLibraryCovers.small;
                thumbnail = openLibraryCovers.large || openLibraryCovers.medium;
                console.log('✅ Got cover fallback from Open Library (using Large size):', {
                  smallThumbnail,
                  thumbnail
                });
              }
            } catch (error) {
              console.warn('⚠️ Open Library cover fallback failed:', error);
            }
          }
          
          // Extract access information
          let viewability: 'NO_PAGES' | 'PARTIAL' | 'ALL_PAGES' | undefined;
          let webReaderLink: string | undefined;
          if (data.items[0].accessInfo) {
            const accessInfo = data.items[0].accessInfo;
            viewability = accessInfo.viewability;
            webReaderLink = accessInfo.webReaderLink;
          }
          
          bookData = {
            titulo: title,
            autor: author || undefined,
            paginas: pages,
            isbn: cleanIsbn,
            publicacion: publicationYear,
            editorial: publisher || undefined,
            descripcion: description || undefined,
            categorias: categories.length > 0 ? categories : undefined,
            idioma: language || undefined,
            smallThumbnail,
            thumbnail,
            viewability,
            webReaderLink
            // No asignar calificación automáticamente - el usuario la pondrá cuando termine el libro
          };
          
          // Cache the result
          (bookData as any).timestamp = Date.now();
          bookCache.set(cacheKey, bookData);
          
          console.log('Book data found and cached:', bookData);
          break; // Found the book, exit the loop
        }
      } catch (error) {
        if (error instanceof Error && error.name === 'AbortError') {
          console.warn(`Request timeout for query: ${query}`);
        } else {
          console.warn(`Error searching with query "${query}":`, error);
        }
        continue;
      }
    }
    
    if (!bookData) {
      console.log('No book data found for ISBN:', cleanIsbn);
      return null;
    }
    
    return bookData;
  } catch (error) {
    console.error('Error al buscar el libro:', error);
    throw new Error('Error al buscar información del libro en Google Books');
  }
};

// Helper function to validate ISBN format
export const validateISBN = (isbn: string): boolean => {
  const cleanIsbn = isbn.replace(/[^0-9X]/gi, '');
  
  if (cleanIsbn.length === 10) {
    // ISBN-10 validation
    let sum = 0;
    for (let i = 0; i < 9; i++) {
      sum += parseInt(cleanIsbn[i]) * (10 - i);
    }
    const lastChar = cleanIsbn[9].toUpperCase();
    const checkDigit = lastChar === 'X' ? 10 : parseInt(lastChar);
    sum += checkDigit;
    return sum % 11 === 0;
  } else if (cleanIsbn.length === 13) {
    // ISBN-13 validation
    let sum = 0;
    for (let i = 0; i < 12; i++) {
      sum += parseInt(cleanIsbn[i]) * (i % 2 === 0 ? 1 : 3);
    }
    const checkDigit = parseInt(cleanIsbn[12]);
    const calculatedCheck = (10 - (sum % 10)) % 10;
    return checkDigit === calculatedCheck;
  }
  
  return false;
};

// Helper function to convert ISBN-10 to ISBN-13
export const convertISBN10To13 = (isbn10: string): string => {
  const cleanIsbn = isbn10.replace(/[^0-9X]/gi, '');
  if (cleanIsbn.length !== 10) return isbn10;
  
  // Convert to ISBN-13 by adding 978 prefix
  const isbn13 = '978' + cleanIsbn.substring(0, 9);
  
  // Calculate check digit
  let sum = 0;
  for (let i = 0; i < 12; i++) {
    sum += parseInt(isbn13[i]) * (i % 2 === 0 ? 1 : 3);
  }
  const checkDigit = (10 - (sum % 10)) % 10;
  
  return isbn13 + checkDigit;
};

// Función para limpiar el caché manualmente
export const clearCache = () => {
  bookCache.clear();
  searchCache.clear();
  console.log('API cache cleared');
};

// Función para obtener estadísticas del caché
export const getCacheStats = () => {
  return {
    bookCacheSize: bookCache.size,
    searchCacheSize: searchCache.size,
    totalCachedItems: bookCache.size + searchCache.size
  };
};

// Función para buscar libros por autor
export const searchBooksByAuthor = async (author: string): Promise<BookData[]> => {
  try {
    if (!author.trim() || author.length < 2) {
      return [];
    }

    const query = `inauthor:"${author.trim()}"`;
    const cacheKey = `author_${author.toLowerCase().trim()}`;
    
    if (searchCache.has(cacheKey)) {
      const cachedData = searchCache.get(cacheKey);
      console.log('Using cached author search results for:', author);
      return cachedData || [];
    }

    const url = `${API_CONFIG.baseUrl}?q=${encodeURIComponent(query)}&langRestrict=${API_CONFIG.language}&maxResults=${API_CONFIG.maxResults}&orderBy=relevance`;
    const response = await fetchWithTimeout(url);

    if (!response.ok) {
      console.warn('API request failed for author search', response.status, response.statusText);
      return [];
    }

    const data = await response.json();
    
    if (data.totalItems === 0) {
      return [];
    }

    const results = await Promise.all(data.items.map(async (item: any) => {
      const book = item.volumeInfo;
      
      let title = book.title || '';
      if (book.subtitle) {
        title += `: ${book.subtitle}`;
      }
      
      let authorName = '';
      if (book.authors && book.authors.length > 0) {
        authorName = book.authors.join(', ');
      }
      
      let pages: number | undefined;
      if (book.pageCount) {
        pages = book.pageCount;
      } else if (book.printedPageCount) {
        pages = book.printedPageCount;
      }
      
      let publicationYear: number | undefined;
      if (book.publishedDate) {
        const year = parseInt(book.publishedDate.substring(0, 4));
        if (!isNaN(year)) {
          publicationYear = year;
        }
      }
      
      let isbn: string | undefined;
      if (book.industryIdentifiers) {
        const isbn13 = book.industryIdentifiers.find((id: any) => id.type === 'ISBN_13');
        const isbn10 = book.industryIdentifiers.find((id: any) => id.type === 'ISBN_10');
        isbn = isbn13?.identifier || isbn10?.identifier;
      }
      
      // Extract image URLs
      let smallThumbnail: string | undefined;
      let thumbnail: string | undefined;
      if (book.imageLinks) {
        smallThumbnail = book.imageLinks.smallThumbnail;
        thumbnail = book.imageLinks.thumbnail;
      } else if (isbn) {
        // Fallback a Open Library para portadas si no hay en Google Books (usando tamaño L)
        try {
          const openLibraryCovers = await getOpenLibraryCovers(isbn);
          if (openLibraryCovers.large || openLibraryCovers.medium || openLibraryCovers.small) {
            // Usar tamaño L para thumbnail (vista principal) y M para smallThumbnail
            smallThumbnail = openLibraryCovers.medium || openLibraryCovers.small;
            thumbnail = openLibraryCovers.large || openLibraryCovers.medium;
            console.log('✅ Got cover fallback from Open Library for author search (Large size):', isbn);
          }
        } catch (error) {
          console.warn('⚠️ Open Library cover fallback failed in author search:', error);
        }
      }
      
      // Extract access information
      let viewability: 'NO_PAGES' | 'PARTIAL' | 'ALL_PAGES' | undefined;
      let webReaderLink: string | undefined;
      if (item.accessInfo) {
        viewability = item.accessInfo.viewability;
        webReaderLink = item.accessInfo.webReaderLink;
      }
      
      return {
        titulo: title,
        autor: authorName || undefined,
        paginas: pages,
        isbn: isbn,
        publicacion: publicationYear,
        editorial: book.publisher || undefined,
        descripcion: book.description || undefined,
        categorias: book.categories?.length > 0 ? book.categories : undefined,
        idioma: book.language || undefined,
        smallThumbnail,
        thumbnail,
        viewability,
        webReaderLink
        // No asignar calificación automáticamente - el usuario la pondrá cuando termine el libro
      };
    }));

    (results as any).timestamp = Date.now();
    searchCache.set(cacheKey, results);
    
    console.log(`Found ${results.length} books by author: ${author}`);
    return results;
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      console.warn('Author search request timeout for:', author);
    } else {
      console.error('Error searching books by author:', error);
    }
    return [];
  }
};

// New function to search books by title for autocomplete
export const searchBooksByTitle = async (query: string): Promise<BookData[]> => {
  try {
    if (!query.trim() || query.length < 2) {
      return [];
    }

    // Check cache first
    const cacheKey = `search_${query.toLowerCase().trim()}`;
    if (searchCache.has(cacheKey)) {
      const cachedData = searchCache.get(cacheKey);
      console.log('Using cached search results for query:', query);
      return cachedData || [];
    }

    const url = `${API_CONFIG.baseUrl}?q=${encodeURIComponent(query)}&langRestrict=${API_CONFIG.language}&maxResults=${API_CONFIG.maxResults}&orderBy=relevance`;
    const response = await fetchWithTimeout(url);

    if (!response.ok) {
      console.warn('API request failed for title search', response.status, response.statusText);
      return [];
    }

    const data = await response.json();
    
    if (data.totalItems === 0) {
      return [];
    }

    const results = await Promise.all(data.items.map(async (item: any) => {
      const book = item.volumeInfo;
      
      // Extract and clean the title
      let title = book.title || '';
      if (book.subtitle) {
        title += `: ${book.subtitle}`;
      }
      
      // Extract authors
      let author = '';
      if (book.authors && book.authors.length > 0) {
        author = book.authors.join(', ');
      }
      
      // Extract page count
      let pages: number | undefined;
      if (book.pageCount) {
        pages = book.pageCount;
      } else if (book.printedPageCount) {
        pages = book.printedPageCount;
      }
      
      // Extract publication date
      let publicationYear: number | undefined;
      if (book.publishedDate) {
        const year = parseInt(book.publishedDate.substring(0, 4));
        if (!isNaN(year)) {
          publicationYear = year;
        }
      }
      
      // Extract publisher
      const publisher = book.publisher || '';
      
      // Extract description
      const description = book.description || '';
      
      // Extract categories/genres
      const categories = book.categories || [];
      
      // Extract language
      const language = book.language || '';
      
      // Extract ISBN if available
      let isbn: string | undefined;
      if (book.industryIdentifiers) {
        const isbn13 = book.industryIdentifiers.find((id: any) => id.type === 'ISBN_13');
        const isbn10 = book.industryIdentifiers.find((id: any) => id.type === 'ISBN_10');
        isbn = isbn13?.identifier || isbn10?.identifier;
      }
      
      // Extract image URLs
      let smallThumbnail: string | undefined;
      let thumbnail: string | undefined;
      if (book.imageLinks) {
        smallThumbnail = book.imageLinks.smallThumbnail;
        thumbnail = book.imageLinks.thumbnail;
      } else if (isbn) {
        // Fallback a Open Library para portadas si no hay en Google Books (usando tamaño L)
        try {
          const openLibraryCovers = await getOpenLibraryCovers(isbn);
          if (openLibraryCovers.large || openLibraryCovers.medium || openLibraryCovers.small) {
            // Usar tamaño L para thumbnail (vista principal) y M para smallThumbnail
            smallThumbnail = openLibraryCovers.medium || openLibraryCovers.small;
            thumbnail = openLibraryCovers.large || openLibraryCovers.medium;
            console.log('✅ Got cover fallback from Open Library for title search (Large size):', isbn);
          }
        } catch (error) {
          console.warn('⚠️ Open Library cover fallback failed in title search:', error);
        }
      }
      
      // Extract access information
      let viewability: 'NO_PAGES' | 'PARTIAL' | 'ALL_PAGES' | undefined;
      let webReaderLink: string | undefined;
      if (item.accessInfo) {
        viewability = item.accessInfo.viewability;
        webReaderLink = item.accessInfo.webReaderLink;
      }
      
      return {
        titulo: title,
        autor: author || undefined,
        paginas: pages,
        isbn: isbn,
        publicacion: publicationYear,
        editorial: publisher || undefined,
        descripcion: description || undefined,
        categorias: categories.length > 0 ? categories : undefined,
        idioma: language || undefined,
        smallThumbnail,
        thumbnail,
        viewability,
        webReaderLink
        // No asignar calificación automáticamente - el usuario la pondrá cuando termine el libro
      };
    }));

    // Cache the results
    (results as any).timestamp = Date.now();
    searchCache.set(cacheKey, results);
    
    console.log(`Found ${results.length} books for query: ${query}`);
    return results;
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      console.warn('Search request timeout for query:', query);
    } else {
      console.error('Error searching books by title:', error);
    }
    return [];
  }
};

// Función de fallback para obtener portadas de Open Library
const getOpenLibraryCovers = async (isbn: string) => {
  const covers = {
    small: '',
    medium: '',
    large: ''
  };

  try {
    const cleanIsbn = isbn.replace(/[^0-9X]/gi, '');
    
    // Intentar primero con los datos del libro para obtener cover ID
    const bookUrl = `https://openlibrary.org/api/books?bibkeys=ISBN:${cleanIsbn}&format=json&jscmd=data`;
    const bookResponse = await fetchWithTimeout(bookUrl);
    
    if (bookResponse.ok) {
      const bookData = await bookResponse.json();
      const bookKey = `ISBN:${cleanIsbn}`;
      
      if (bookData[bookKey] && bookData[bookKey].cover) {
        const coverInfo = bookData[bookKey].cover;
        const coverId = coverInfo.medium || coverInfo.large || coverInfo.small;
        
        if (coverId) {
          // Extraer el ID numérico de la URL de portada
          const coverIdMatch = coverId.match(/\/(\d+)-[SML]\.jpg$/);
          if (coverIdMatch) {
            const numericCoverId = coverIdMatch[1];
            covers.small = `https://covers.openlibrary.org/b/id/${numericCoverId}-S.jpg`;
            covers.medium = `https://covers.openlibrary.org/b/id/${numericCoverId}-M.jpg`;
            covers.large = `https://covers.openlibrary.org/b/id/${numericCoverId}-L.jpg`;
            console.log('📚 Generated Open Library covers using cover ID:', numericCoverId);
            return covers;
          }
        }
      }
    }
    
    // Si no funciona con cover ID, usar directamente el ISBN
    covers.small = `https://covers.openlibrary.org/b/isbn/${cleanIsbn}-S.jpg`;
    covers.medium = `https://covers.openlibrary.org/b/isbn/${cleanIsbn}-M.jpg`;
    covers.large = `https://covers.openlibrary.org/b/isbn/${cleanIsbn}-L.jpg`;
    console.log('📚 Generated Open Library covers using ISBN:', cleanIsbn);
    
    return covers;
  } catch (error) {
    console.error('Error generating Open Library covers:', error);
    return covers;
  }
};

// Función pública para obtener portadas en diferentes tamaños (por defecto Large para mejor calidad)
export const getBookCoversWithFallback = async (isbn: string, size: 'S' | 'M' | 'L' = 'L') => {
  try {
    const cleanIsbn = isbn.replace(/[^0-9X]/gi, '');
    
    // Intentar primero con Google Books
    const googleUrl = `https://www.googleapis.com/books/v1/volumes?q=isbn:${cleanIsbn}`;
    const googleResponse = await fetchWithTimeout(googleUrl);
    
    if (googleResponse.ok) {
      const googleData = await googleResponse.json();
      if (googleData.totalItems > 0) {
        const book = googleData.items[0].volumeInfo;
        if (book.imageLinks) {
          const googleCover = size === 'S' ? book.imageLinks.smallThumbnail : 
                            size === 'M' ? book.imageLinks.thumbnail :
                            // Para tamaño L, priorizar los tamaños más grandes disponibles
                            book.imageLinks.extraLarge || book.imageLinks.large || book.imageLinks.thumbnail;
          
          if (googleCover) {
            console.log('✅ Got cover from Google Books:', googleCover);
            return googleCover;
          }
        }
      }
    }
    
    // Fallback a Open Library
    console.log('🔄 Google Books cover not found, trying Open Library fallback');
    const openLibraryCovers = await getOpenLibraryCovers(cleanIsbn);
    const fallbackCover = size === 'S' ? openLibraryCovers.small :
                         size === 'L' ? openLibraryCovers.large :
                         openLibraryCovers.medium;
    
    if (fallbackCover) {
      console.log('✅ Got cover fallback from Open Library:', fallbackCover);
      return fallbackCover;
    }
    
    console.log('❌ No cover found in either API for ISBN:', cleanIsbn);
    return null;
    
  } catch (error) {
    console.error('Error getting cover with fallback:', error);
    return null;
  }
};