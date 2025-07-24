import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Twitter, 
  Facebook, 
  Instagram, 
  BookOpen,
  Share2,
  Copy,
  Check,
  ExternalLink
} from 'lucide-react';
import { ResenaCompartible } from '../types';

interface ShareReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  resena: ResenaCompartible;
  onShare: (redes: string[]) => void;
}

const ShareReviewModal: React.FC<ShareReviewModalProps> = ({ 
  isOpen, 
  onClose, 
  resena, 
  onShare 
}) => {
  const [selectedNetworks, setSelectedNetworks] = useState<string[]>([]);
  const [copied, setCopied] = useState(false);
  const [customMessage, setCustomMessage] = useState('');

  const networks = [
    { id: 'twitter', name: 'Twitter', icon: Twitter, color: '#1DA1F2' },
    { id: 'facebook', name: 'Facebook', icon: Facebook, color: '#1877F2' },
    { id: 'instagram', name: 'Instagram', icon: Instagram, color: '#E4405F' },
    { id: 'goodreads', name: 'Goodreads', icon: BookOpen, color: '#372213' }
  ];

  const toggleNetwork = (networkId: string) => {
    setSelectedNetworks(prev => 
      prev.includes(networkId) 
        ? prev.filter(id => id !== networkId)
        : [...prev, networkId]
    );
  };

  const generateShareText = (network: string) => {
    const baseText = `📚 "${resena.titulo}" por ${resena.autor}\n\n`;
    const rating = '⭐'.repeat(resena.calificacion);
    const review = resena.reseña.length > 200 
      ? resena.reseña.substring(0, 200) + '...' 
      : resena.reseña;
    
    switch (network) {
      case 'twitter':
        return `${baseText}${rating}\n\n${review}\n\n#Libros #Lectura`;
      case 'facebook':
        return `${baseText}${rating}\n\n${review}`;
      case 'instagram':
        return `${baseText}${rating}\n\n${review}\n\n#Libros #Lectura #Bookstagram`;
      case 'goodreads':
        return `${baseText}${rating}\n\n${review}`;
      default:
        return `${baseText}${rating}\n\n${review}`;
    }
  };

  const shareToNetwork = (networkId: string) => {
    const text = generateShareText(networkId);
    const url = encodeURIComponent(window.location.href);
    
    let shareUrl = '';
    
    switch (networkId) {
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${url}`;
        break;
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}&quote=${encodeURIComponent(text)}`;
        break;
      case 'instagram':
        // Instagram no tiene URL de compartir directa, mostrar instrucciones
        alert('Para compartir en Instagram:\n1. Copia el texto\n2. Abre Instagram\n3. Crea una nueva publicación\n4. Pega el texto');
        return;
      case 'goodreads':
        shareUrl = `https://www.goodreads.com/review/edit?book_title=${encodeURIComponent(resena.titulo)}&author=${encodeURIComponent(resena.autor)}&rating=${resena.calificacion}&review=${encodeURIComponent(resena.reseña)}`;
        break;
    }
    
    if (shareUrl) {
      window.open(shareUrl, '_blank', 'width=600,height=400');
    }
  };

  const copyToClipboard = async () => {
    const text = generateShareText('twitter'); // Usar formato de Twitter como base
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Error al copiar al portapapeles:', err);
    }
  };

  const handleShare = () => {
    selectedNetworks.forEach(network => {
      shareToNetwork(network);
    });
    onShare(selectedNetworks);
    onClose();
  };

  if (!isOpen) return null;

  return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <Share2 className="w-5 h-5" />
              Compartir Reseña
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Book Info */}
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                {resena.titulo}
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-2">
                por {resena.autor}
              </p>
              <div className="flex items-center gap-2">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className="text-yellow-400">
                      {i < resena.calificacion ? '⭐' : '☆'}
                    </span>
                  ))}
                </div>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {resena.calificacion}/5
                </span>
              </div>
            </div>

            {/* Custom Message */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Mensaje personalizado (opcional)
              </label>
              <textarea
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
                placeholder="Añade un mensaje personalizado a tu reseña..."
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                rows={3}
              />
            </div>

            {/* Network Selection */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Selecciona las redes sociales
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {networks.map((network) => {
                  const Icon = network.icon;
                  const isSelected = selectedNetworks.includes(network.id);
                  
                  return (
                    <button
                      key={network.id}
                      onClick={() => toggleNetwork(network.id)}
                      className={`p-4 rounded-lg border-2 transition-all duration-200 flex flex-col items-center gap-2 ${
                        isSelected
                          ? `border-${network.color} bg-${network.color} bg-opacity-10`
                          : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                      }`}
                    >
                      <Icon 
                        className={`w-6 h-6 ${
                          isSelected ? `text-${network.color}` : 'text-gray-400'
                        }`}
                      />
                      <span className={`text-sm font-medium ${
                        isSelected 
                          ? `text-${network.color}` 
                          : 'text-gray-600 dark:text-gray-300'
                      }`}>
                        {network.name}
                      </span>
                      {isSelected && (
                        <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                          <Check className="w-3 h-3 text-white" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Preview */}
            {selectedNetworks.length > 0 && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
                  Vista previa
                </h3>
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <p className="text-sm text-gray-600 dark:text-gray-300 whitespace-pre-wrap">
                    {generateShareText(selectedNetworks[0])}
                  </p>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <button
                onClick={copyToClipboard}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4" />
                    Copiado
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    Copiar
                  </>
                )}
              </button>
              
              <button
                onClick={handleShare}
                disabled={selectedNetworks.length === 0}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
                Compartir ({selectedNetworks.length})
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
  );
};

export default ShareReviewModal;