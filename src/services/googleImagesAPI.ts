// Google Images Search API Service
// Uses Google Custom Search API to search for images

interface GoogleImageSearchResult {
  title: string;
  link: string;
  image: {
    byteSize: number;
    contextLink: string;
    height: number;
    thumbnailHeight: number;
    thumbnailLink: string;
    thumbnailWidth: number;
    width: number;
  };
  snippet: string;
}

interface GoogleImageSearchResponse {
  items?: GoogleImageSearchResult[];
  searchInformation: {
    totalResults: string;
    searchTime: number;
  };
}

class GoogleImagesAPI {
  private apiKey: string;
  private searchEngineId: string;
  private baseUrl = 'https://www.googleapis.com/customsearch/v1';

  constructor() {
    // These should be configured in environment variables
    this.apiKey = process.env.REACT_APP_GOOGLE_SEARCH_API_KEY || '';
    this.searchEngineId = process.env.REACT_APP_GOOGLE_SEARCH_ENGINE_ID || '';
  }

  /**
   * Search for images using Google Custom Search API
   * @param query - Search query
   * @param maxResults - Maximum number of results (default: 10)
   * @returns Promise with search results
   */
  async searchImages(query: string, maxResults: number = 10): Promise<GoogleImageSearchResult[]> {
    if (!this.apiKey || !this.searchEngineId) {
      throw new Error('Google Search API credentials not configured. Please set REACT_APP_GOOGLE_SEARCH_API_KEY and REACT_APP_GOOGLE_SEARCH_ENGINE_ID environment variables.');
    }

    try {
      const params = new URLSearchParams({
        key: this.apiKey,
        cx: this.searchEngineId,
        q: query,
        searchType: 'image',
        num: Math.min(maxResults, 10).toString(), // Google CSE max is 10 per request
        imgType: 'photo',
        imgSize: 'large',
        safe: 'active'
      });

      const response = await fetch(`${this.baseUrl}?${params}`);
      
      if (!response.ok) {
        throw new Error(`Google Search API error: ${response.status} ${response.statusText}`);
      }

      const data: GoogleImageSearchResponse = await response.json();
      
      return data.items || [];
    } catch (error) {
      console.error('Error searching Google Images:', error);
      throw error;
    }
  }

  /**
   * Search for book cover images specifically
   * @param bookTitle - Book title
   * @param author - Book author (optional)
   * @param maxResults - Maximum number of results (default: 10)
   * @returns Promise with search results
   */
  async searchBookCovers(bookTitle: string, author?: string, maxResults: number = 10): Promise<GoogleImageSearchResult[]> {
    let query = `"${bookTitle}" book cover`;
    
    if (author) {
      query += ` "${author}"`;
    }
    
    return this.searchImages(query, maxResults);
  }

  /**
   * Check if the API is properly configured
   * @returns boolean indicating if API is ready to use
   */
  isConfigured(): boolean {
    return !!(this.apiKey && this.searchEngineId);
  }

  /**
   * Get configuration status message
   * @returns string with configuration status
   */
  getConfigurationStatus(): string {
    if (!this.apiKey) {
      return 'Google Search API Key no configurada';
    }
    if (!this.searchEngineId) {
      return 'Google Search Engine ID no configurado';
    }
    return 'Configuración completa';
  }
}

// Export singleton instance
export const googleImagesAPI = new GoogleImagesAPI();
export type { GoogleImageSearchResult, GoogleImageSearchResponse };