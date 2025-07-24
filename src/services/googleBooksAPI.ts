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
          
          // Extract cover image URL
          let coverUrl: string | undefined;
          if (book.imageLinks) {
            console.log('Image links found:', book.imageLinks);
            // Preferir thumbnail, luego small, luego medium
            coverUrl = book.imageLinks.thumbnail || 
                      book.imageLinks.small || 
                      book.imageLinks.medium ||
                      book.imageLinks.smallThumbnail;
            
            // Convertir URL de HTTP a HTTPS si es necesario
            if (coverUrl && coverUrl.startsWith('http:')) {
              coverUrl = coverUrl.replace('http:', 'https:');
            }
            console.log('Selected cover URL:', coverUrl);
          } else {
            console.log('No image links found for book:', book.title);
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
            portada: coverUrl
            // No asignar calificación automáticamente - el usuario la pondrá cuando termine el libro
          };
          
          console.log('Final bookData with cover:', bookData);
          
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

    const results = data.items.map((item: any) => {
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
      
      // Extract cover image URL
      let coverUrl: string | undefined;
      if (book.imageLinks) {
        // Preferir thumbnail, luego small, luego medium
        coverUrl = book.imageLinks.thumbnail || 
                  book.imageLinks.small || 
                  book.imageLinks.medium ||
                  book.imageLinks.smallThumbnail;
        
        // Convertir URL de HTTP a HTTPS si es necesario
        if (coverUrl && coverUrl.startsWith('http:')) {
          coverUrl = coverUrl.replace('http:', 'https:');
        }
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
        portada: coverUrl
        // No asignar calificación automáticamente - el usuario la pondrá cuando termine el libro
      };
    });

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

// Test function to debug API response
export const testGoogleBooksAPI = async (query: string) => {
  try {
    const url = `${API_CONFIG.baseUrl}?q=${encodeURIComponent(query)}&langRestrict=${API_CONFIG.language}&maxResults=1`;
    console.log('Testing API with URL:', url);
    
    const response = await fetchWithTimeout(url);
    const data = await response.json();
    
    console.log('Raw API response:', data);
    if (data.items && data.items.length > 0) {
      console.log('First book volumeInfo:', data.items[0].volumeInfo);
      console.log('First book imageLinks:', data.items[0].volumeInfo.imageLinks);
    }
    
    return data;
  } catch (error) {
    console.error('Error testing API:', error);
    return null;
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

    const results = data.items.map((item: any) => {
      const book = item.volumeInfo;
      
      console.log('Processing book:', book.title, 'imageLinks:', book.imageLinks);
      
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
      
      // Extract cover image URL
      let coverUrl: string | undefined;
      if (book.imageLinks) {
        // Preferir thumbnail, luego small, luego medium
        coverUrl = book.imageLinks.thumbnail || 
                  book.imageLinks.small || 
                  book.imageLinks.medium ||
                  book.imageLinks.smallThumbnail;
        
        // Convertir URL de HTTP a HTTPS si es necesario
        if (coverUrl && coverUrl.startsWith('http:')) {
          coverUrl = coverUrl.replace('http:', 'https:');
        }
      }
      
      const result = {
        titulo: title,
        autor: author || undefined,
        paginas: pages,
        isbn: isbn,
        publicacion: publicationYear,
        editorial: publisher || undefined,
        descripcion: description || undefined,
        categorias: categories.length > 0 ? categories : undefined,
        idioma: language || undefined,
        portada: coverUrl
        // No asignar calificación automáticamente - el usuario la pondrá cuando termine el libro
      };
      
      console.log('Final result for book:', title, 'portada:', coverUrl);
      return result;
    });

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