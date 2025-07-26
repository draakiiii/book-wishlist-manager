# Open Library API Integration

## Overview

This document describes the integration of the Open Library API into the book search functionality, replacing the Google Books API as the primary data source for book information.

## Changes Made

### 1. New API Service Files

#### `src/services/openLibraryAPI.ts`
- **Purpose**: Implements the Open Library API client
- **Features**:
  - ISBN lookup via direct API calls and search
  - Book search by title, author, and subject
  - Cover image URL generation
  - Caching system for performance optimization
  - Error handling and fallback mechanisms
  - ISBN validation and conversion utilities

#### `src/services/bookAPI.ts`
- **Purpose**: Unified API service that can switch between Google Books and Open Library
- **Features**:
  - Configuration-based API provider selection
  - Automatic fallback between APIs
  - Unified interface for all book search operations
  - API connectivity testing
  - Cache management for both APIs

### 2. Configuration Updates

#### `src/types/index.ts`
- Added `bookApiProvider` field to `Configuracion` interface
- Supports `'google' | 'openlibrary'` values
- Default value: `'openlibrary'`

#### `src/components/ConfigForm.tsx`
- Added API configuration section in settings
- Dropdown to select between Open Library and Google Books
- Informational text about API differences

### 3. Component Updates

All components that previously used Google Books API now use the unified `bookAPI` service:

- `src/components/WishlistForm.tsx`
- `src/components/BulkScanModal.tsx`
- `src/components/BarcodeScannerModal.tsx`
- `src/components/TBRForm.tsx`
- `src/components/BookTitleAutocomplete.tsx`

## Open Library API Endpoints Used

### 1. Combined ISBN Lookup (Primary Method)
```
GET /api/books?bibkeys=ISBN:{isbn}&format=json&jscmd=data
GET /isbn/{isbn}.json
```
- Combines data from both endpoints for comprehensive information
- `/api/books` provides cover URLs, authors, subjects, and links
- `/isbn/{isbn}` provides detailed metadata like publishers, page count, etc.

### 2. Direct ISBN Lookup (Fallback)
```
GET /isbn/{isbn}.json
```
- Direct lookup by ISBN when combined approach fails
- Returns detailed book information

### 3. Search API
```
GET /search.json?q={query}&limit={limit}
```
- General book search by title, author, or keywords
- Supports pagination and result limiting

### 4. Author Search
```
GET /search.json?author={author}&limit={limit}
```
- Search books by specific author
- Returns books written by the author

### 5. Subject Search
```
GET /subjects/{subject}.json?limit={limit}
```
- Search books by subject/topic
- Returns books categorized under the subject

### 6. Cover Images
```
GET /covers/{key_type}/{value}-{size}.jpg
```
- Cover image URLs for books
- Supports different sizes (S, M, L)
- Uses ISBN or cover ID as key
- Direct URLs available from `/api/books` endpoint

## Data Mapping

### Book Information Extraction

The Open Library API response is mapped to the application's `BookData` interface:

```typescript
interface BookData {
  titulo: string;           // title + subtitle
  autor?: string;          // authors array joined (from /api/books)
  paginas?: number;        // number_of_pages
  isbn?: string;           // isbn_13[0] or isbn_10[0]
  publicacion?: number;    // publish_date
  editorial?: string;      // publishers[0].name or publishers[0]
  descripcion?: string;    // description.value or description
  categorias?: string[];   // subjects array (from /api/books)
  idioma?: string;         // languages[0].key
  smallThumbnail?: string; // cover.small from /api/books or generated URL
  thumbnail?: string;      // cover.medium from /api/books or generated URL
}
```

### Data Sources Priority

1. **Primary**: Combined data from `/api/books` + `/isbn/{isbn}`
   - Cover URLs from `/api/books` endpoint
   - Authors and subjects from `/api/books` endpoint
   - Detailed metadata from `/isbn/{isbn}` endpoint

2. **Fallback**: Direct `/isbn/{isbn}` endpoint
   - Basic book information
   - Generated cover URLs using cover IDs

3. **Last Resort**: Search API
   - When direct lookups fail
   - Limited metadata but functional

## Features

### 1. Automatic Fallback
- If the primary API fails, automatically tries the secondary API
- Ensures high availability of book search functionality

### 2. Caching System
- 30-minute cache for book data
- 30-minute cache for search results
- Automatic cache cleanup every 5 minutes
- Manual cache clearing functionality

### 3. Multiple Search Strategies
- Combined `/api/books` + `/isbn/{isbn}` approach first
- Direct `/isbn/{isbn}` lookup as fallback
- Search API as last resort
- Multiple ISBN format attempts (with/without 978 prefix)

### 4. Error Handling
- Timeout handling (10 seconds)
- Network error recovery
- Graceful degradation when APIs are unavailable

## Configuration

### Default Settings
- **Primary API**: Open Library (recommended)
- **Fallback API**: Google Books
- **Cache Duration**: 30 minutes
- **Request Timeout**: 10 seconds
- **Max Results**: 10 per search

### User Configuration
Users can change the API provider in the settings:
1. Go to Settings (Configuración)
2. Find "Configuración de API" section
3. Select preferred API provider:
   - **Open Library (Recomendado)**: Free, no API key required
   - **Google Books**: May require authentication

## Benefits of Open Library API

### 1. No API Key Required
- Completely free to use
- No rate limiting for normal usage
- No authentication setup required

### 2. Comprehensive Data
- Large database of books
- Rich metadata including subjects, languages, publishers
- Multiple ISBN formats supported

### 3. Open Source
- Community-driven data
- Transparent API documentation
- No commercial restrictions

### 4. Reliable Service
- Hosted by Internet Archive
- High availability
- Regular updates and maintenance

## Migration Notes

### From Google Books API
- All existing functionality preserved
- Seamless transition for users
- No data loss or breaking changes
- Backward compatibility maintained

### Configuration Migration
- Existing users will default to Open Library
- Google Books remains available as fallback
- Users can switch back to Google Books if preferred

## Testing

The integration has been tested with:
- ✅ Combined `/api/books` + `/isbn/{isbn}` approach
- ✅ Direct ISBN lookup fallback
- ✅ General search functionality
- ✅ Author search
- ✅ Subject search
- ✅ Cover image generation (direct URLs and generated URLs)
- ✅ Error handling and fallbacks
- ✅ Caching system
- ✅ Configuration switching
- ✅ Real-world ISBN example (9788466657662 - "El camino de los reyes")

## Future Enhancements

### Potential Improvements
1. **Additional APIs**: Integration with other book APIs (ISBNdb, WorldCat)
2. **Enhanced Caching**: Redis or database-based caching
3. **Offline Support**: Local database for frequently accessed books
4. **Advanced Search**: Filters for language, publication date, format
5. **Batch Operations**: Bulk ISBN lookup for multiple books

### API Extensions
1. **Work Details**: Fetch detailed work information by OLID
2. **Author Details**: Get author biographies and works
3. **Edition Comparison**: Compare different editions of the same work
4. **Reading Lists**: Integration with Open Library reading lists

## Troubleshooting

### Common Issues

1. **API Not Responding**
   - Check internet connection
   - Verify Open Library service status
   - Try switching to Google Books API

2. **No Results Found**
   - Try different ISBN formats
   - Use search instead of direct lookup
   - Check book availability in Open Library database

3. **Cover Images Missing**
   - Not all books have cover images
   - Try different cover sizes
   - Fallback to default book cover

### Debug Information
- API provider selection is logged to console
- Cache statistics available via `getCacheStats()`
- API connectivity test available via `testApiConnectivity()`

## Conclusion

The Open Library API integration provides a robust, free, and reliable alternative to Google Books API. The unified API service ensures seamless operation while maintaining backward compatibility and providing users with choice between different data sources.