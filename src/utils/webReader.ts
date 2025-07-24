/**
 * Utility function to open a web reader link with proper mobile and fallback support
 * @param webReaderLink - The URL to the Google Books web reader
 * @param bookTitle - Title of the book for user feedback
 */
export const openWebReader = (webReaderLink: string, bookTitle?: string) => {
  try {
    // For mobile devices, try to open in a new tab/window
    // For desktop, this will open in a new tab
    const newWindow = window.open(webReaderLink, '_blank', 'noopener,noreferrer');
    
    // Check if the window was blocked by popup blocker
    if (!newWindow) {
      // Fallback: try to navigate in the same window
      console.warn('Popup blocked, trying alternative method');
      
      // Create a temporary link element and click it
      const link = document.createElement('a');
      link.href = webReaderLink;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      
      // Temporarily add to DOM and click
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  } catch (error) {
    console.error('Error opening web reader:', error);
    
    // Final fallback: copy link to clipboard if possible
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(webReaderLink).then(() => {
        alert(`No se pudo abrir el lector automáticamente. Se ha copiado el enlace al portapapeles:\n\n${webReaderLink}`);
      }).catch(() => {
        alert(`No se pudo abrir el lector. Enlace:\n\n${webReaderLink}`);
      });
    } else {
      alert(`No se pudo abrir el lector. Enlace:\n\n${webReaderLink}`);
    }
  }
};