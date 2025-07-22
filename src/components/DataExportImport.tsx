import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { 
  Download, 
  Upload, 
  FileText, 
  Database, 
  Calendar,
  CheckCircle,
  AlertCircle,
  X,
  Save,
  RefreshCw,
  Trash2,
  Clock,
  HardDrive
} from 'lucide-react';
import { useAppState } from '../context/AppStateContext';
import { ExportData } from '../types';
import { saveAs } from 'file-saver';
import Papa from 'papaparse';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface DataExportImportProps {
  isOpen: boolean;
  onClose: () => void;
}

const DataExportImport: React.FC<DataExportImportProps> = ({ isOpen, onClose }) => {
  const { state, dispatch } = useAppState();
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);
  const [importSuccess, setImportSuccess] = useState<string | null>(null);
  const [selectedFormat, setSelectedFormat] = useState<'json' | 'csv' | 'excel'>('json');

  const exportData = useCallback(async (exportFormat: 'json' | 'csv' | 'excel') => {
    setIsExporting(true);
    setImportError(null);
    setImportSuccess(null);

    try {
      const exportData: ExportData = {
        version: '7.0',
        timestamp: Date.now(),
        config: state.config,
        progreso: state.progreso,
        compraDesbloqueada: state.compraDesbloqueada,
        libros: {
          tbr: state.tbr,
          historial: state.historial,
          wishlist: state.wishlist,
          actual: state.libroActual
        },
        sagas: state.sagas,
        scanHistory: state.scanHistory,
        searchHistory: state.searchHistory,
        lastBackup: state.lastBackup,
        performanceMetrics: state.performanceMetrics
      };

      const timestamp = format(new Date(), 'yyyy-MM-dd_HH-mm-ss', { locale: es });
      let fileName: string;
      let content: string | Blob;

      switch (exportFormat) {
        case 'json':
          fileName = `guardian-compras_backup_${timestamp}.json`;
          content = JSON.stringify(exportData, null, 2);
          break;

        case 'csv':
          fileName = `guardian-compras_backup_${timestamp}.csv`;
          const csvData = [
            ...exportData.libros.tbr.map(book => ({ ...book, tipo: 'TBR' })),
            ...exportData.libros.historial.map(book => ({ ...book, tipo: 'Historial' })),
            ...exportData.libros.wishlist.map(book => ({ ...book, tipo: 'Wishlist' })),
            ...(exportData.libros.actual ? [{ ...exportData.libros.actual, tipo: 'Actual' }] : [])
          ];
          content = Papa.unparse(csvData);
          break;

        case 'excel':
          fileName = `guardian-compras_backup_${timestamp}.xlsx`;
          // For Excel, we'll create a JSON file that can be imported into Excel
          content = JSON.stringify(exportData, null, 2);
          break;

        default:
          throw new Error('Formato no soportado');
      }

      const blob = new Blob([content], { 
        type: exportFormat === 'json' ? 'application/json' : 
              exportFormat === 'csv' ? 'text/csv' : 
              'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      });

      saveAs(blob, fileName);
      
      // Update last backup timestamp
      dispatch({ type: 'SET_LAST_BACKUP', payload: Date.now() });
      
      setImportSuccess(`Datos exportados exitosamente como ${fileName}`);
    } catch (error) {
      console.error('Error exporting data:', error);
      setImportError('Error al exportar los datos. Por favor, intenta de nuevo.');
    } finally {
      setIsExporting(false);
    }
  }, [state, dispatch]);

  const importData = useCallback(async (file: File) => {
    setIsImporting(true);
    setImportError(null);
    setImportSuccess(null);

    try {
      const fileExtension = file.name.split('.').pop()?.toLowerCase();
      let parsedData: any;

      if (fileExtension === 'json') {
        const text = await file.text();
        parsedData = JSON.parse(text);
      } else if (fileExtension === 'csv') {
        const text = await file.text();
        const result = Papa.parse(text, { header: true });
        if (result.errors.length > 0) {
          throw new Error('Error al parsear el archivo CSV');
        }
        parsedData = result.data;
      } else {
        throw new Error('Formato de archivo no soportado. Usa JSON o CSV.');
      }

      // Validate data structure
      if (!parsedData || typeof parsedData !== 'object') {
        throw new Error('Formato de datos inválido');
      }

      // Handle different data formats
      let libros: any = {};
      let sagas: any[] = [];
      let config: any = {};

      if (parsedData.version) {
        // New format with version
        libros = parsedData.libros || {};
        sagas = parsedData.sagas || [];
        config = parsedData.config || {};
      } else if (Array.isArray(parsedData)) {
        // Old format - array of books
        libros = {
          tbr: parsedData.filter((book: any) => book.tipo === 'TBR' || !book.tipo),
          historial: parsedData.filter((book: any) => book.tipo === 'Historial'),
          wishlist: parsedData.filter((book: any) => book.tipo === 'Wishlist'),
          actual: parsedData.find((book: any) => book.tipo === 'Actual') || null
        };
      } else {
        throw new Error('Formato de datos no reconocido');
      }

      // Import data
      dispatch({ 
        type: 'IMPORT_DATA', 
        payload: { 
          libros, 
          sagas, 
          config 
        } 
      });

      setImportSuccess(`Datos importados exitosamente desde ${file.name}`);
    } catch (error) {
      console.error('Error importing data:', error);
      setImportError(error instanceof Error ? error.message : 'Error al importar los datos');
    } finally {
      setIsImporting(false);
    }
  }, [dispatch]);

  const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      importData(file);
    }
    // Reset input
    event.target.value = '';
  }, [importData]);

  const createBackup = useCallback(() => {
    exportData('json');
  }, [exportData]);

  const clearAllData = useCallback(() => {
    if (window.confirm('¿Estás seguro de que quieres eliminar todos los datos? Esta acción no se puede deshacer.')) {
      // Reset to initial state
      dispatch({ type: 'RESET_PROGRESS' });
      // Clear all lists
      dispatch({ type: 'IMPORT_DATA', payload: { libros: { tbr: [], historial: [], wishlist: [], actual: null }, sagas: [] } });
      setImportSuccess('Todos los datos han sido eliminados');
    }
  }, [dispatch]);

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="relative bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-2xl w-full mx-4 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center space-x-2">
            <Database className="h-5 w-5 text-primary-500" />
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
              Exportar e Importar Datos
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors duration-200"
          >
            <X className="h-5 w-5 text-slate-500" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Last Backup Info */}
          {state.lastBackup && (
            <div className="bg-blue-50 dark:bg-blue-900/30 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-blue-500" />
                <span className="text-sm text-blue-700 dark:text-blue-300">
                  Último respaldo: {format(new Date(state.lastBackup), 'dd/MM/yyyy HH:mm', { locale: es })}
                </span>
              </div>
            </div>
          )}

          {/* Export Section */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center space-x-2">
              <Download className="h-5 w-5 text-green-500" />
              <span>Exportar Datos</span>
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <button
                onClick={() => exportData('json')}
                disabled={isExporting}
                className="flex items-center justify-center space-x-2 p-3 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors duration-200 disabled:opacity-50 text-slate-900 dark:text-white"
              >
                <FileText className="h-4 w-4" />
                <span className="text-sm">JSON</span>
              </button>
              
              <button
                onClick={() => exportData('csv')}
                disabled={isExporting}
                className="flex items-center justify-center space-x-2 p-3 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors duration-200 disabled:opacity-50 text-slate-900 dark:text-white"
              >
                <FileText className="h-4 w-4" />
                <span className="text-sm">CSV</span>
              </button>
              
              <button
                onClick={() => exportData('excel')}
                disabled={isExporting}
                className="flex items-center justify-center space-x-2 p-3 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors duration-200 disabled:opacity-50 text-slate-900 dark:text-white"
              >
                <FileText className="h-4 w-4" />
                <span className="text-sm">Excel</span>
              </button>
            </div>

            <button
              onClick={createBackup}
              disabled={isExporting}
              className="w-full flex items-center justify-center space-x-2 p-3 bg-green-500 hover:bg-green-600 disabled:bg-green-400 text-white rounded-lg font-medium transition-colors duration-200"
            >
              {isExporting ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              <span>{isExporting ? 'Exportando...' : 'Crear Respaldo Completo'}</span>
            </button>
          </div>

          {/* Import Section */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center space-x-2">
              <Upload className="h-5 w-5 text-blue-500" />
              <span>Importar Datos</span>
            </h4>
            
            <div className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg p-6 text-center">
              <input
                type="file"
                accept=".json,.csv"
                onChange={handleFileSelect}
                className="hidden"
                id="file-upload"
                disabled={isImporting}
              />
              <label
                htmlFor="file-upload"
                className="cursor-pointer flex flex-col items-center space-y-2"
              >
                <Upload className="h-8 w-8 text-slate-400" />
                <div>
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    {isImporting ? 'Importando...' : 'Haz clic para seleccionar archivo'}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Soporta archivos JSON y CSV
                  </p>
                </div>
              </label>
            </div>
          </div>

          {/* Data Summary */}
          <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-4">
            <h5 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
              Resumen de Datos
            </h5>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-slate-600 dark:text-slate-400">Libros TBR:</span>
                <span className="ml-2 font-medium text-slate-900 dark:text-white">{state.tbr.length}</span>
              </div>
              <div>
                <span className="text-slate-600 dark:text-slate-400">Historial:</span>
                <span className="ml-2 font-medium text-slate-900 dark:text-white">{state.historial.length}</span>
              </div>
              <div>
                <span className="text-slate-600 dark:text-slate-400">Wishlist:</span>
                <span className="ml-2 font-medium text-slate-900 dark:text-white">{state.wishlist.length}</span>
              </div>
              <div>
                <span className="text-slate-600 dark:text-slate-400">Sagas:</span>
                <span className="ml-2 font-medium text-slate-900 dark:text-white">{state.sagas.length}</span>
              </div>
            </div>
          </div>

          {/* Danger Zone */}
          <div className="border border-red-200 dark:border-red-800 rounded-lg p-4">
            <h5 className="text-sm font-medium text-red-700 dark:text-red-300 mb-3">
              Zona de Peligro
            </h5>
            <button
              onClick={clearAllData}
              className="flex items-center space-x-2 px-3 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-medium transition-colors duration-200"
            >
              <Trash2 className="h-4 w-4" />
              <span>Eliminar Todos los Datos</span>
            </button>
          </div>

          {/* Status Messages */}
          {importError && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center space-x-2 p-3 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-lg"
            >
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm">{importError}</span>
            </motion.div>
          )}

          {importSuccess && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center space-x-2 p-3 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-lg"
            >
              <CheckCircle className="h-4 w-4" />
              <span className="text-sm">{importSuccess}</span>
            </motion.div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default DataExportImport;