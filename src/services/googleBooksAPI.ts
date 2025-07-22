import { BookData } from '../types';

export const fetchBookData = async (isbn: string): Promise<BookData | null> => {
  try {
    // Clean the ISBN (remove any non-numeric characters except 'X')
    const cleanIsbn = isbn.replace(/[^0-9X]/gi, '');
    
    // Try multiple search strategies
    const searchQueries = [
      `isbn:${cleanIsbn}`,
      `isbn:${cleanIsbn.replace(/^978/, '')}`, // Try without 978 prefix
      `isbn:978${cleanIsbn}` // Try with 978 prefix
    ];

    let bookData: BookData | null = null;

    for (const query of searchQueries) {
      try {
        const response = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&langRestrict=es`);
        
        if (!response.ok) {
          console.warn(`API request failed for query: ${query}`);
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
          
          // Extract average rating
          const averageRating = book.averageRating || 0;
          
          // Extract ratings count
          const ratingsCount = book.ratingsCount || 0;
          
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
            calificacion: averageRating > 0 ? averageRating : undefined,
            numCalificaciones: ratingsCount > 0 ? ratingsCount : undefined
          };
          
          console.log('Book data found:', bookData);
          break; // Found the book, exit the loop
        }
      } catch (error) {
        console.warn(`Error searching with query "${query}":`, error);
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

// New function to search books by title for autocomplete
export const searchBooksByTitle = async (query: string): Promise<BookData[]> => {
  try {
    if (!query.trim() || query.length < 2) {
      return [];
    }

    const response = await fetch(
      `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&langRestrict=es&maxResults=10&orderBy=relevance`
    );

    if (!response.ok) {
      console.warn('API request failed for title search');
      return [];
    }

    const data = await response.json();
    
    if (data.totalItems === 0) {
      return [];
    }

    return data.items.map((item: any) => {
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
      
      // Extract average rating
      const averageRating = book.averageRating || 0;
      
      // Extract ratings count
      const ratingsCount = book.ratingsCount || 0;

      // Extract ISBN if available
      let isbn: string | undefined;
      if (book.industryIdentifiers) {
        const isbn13 = book.industryIdentifiers.find((id: any) => id.type === 'ISBN_13');
        const isbn10 = book.industryIdentifiers.find((id: any) => id.type === 'ISBN_10');
        isbn = isbn13?.identifier || isbn10?.identifier;
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
        calificacion: averageRating > 0 ? averageRating : undefined,
        numCalificaciones: ratingsCount > 0 ? ratingsCount : undefined
      };
    });
  } catch (error) {
    console.error('Error searching books by title:', error);
    return [];
  }
}; 