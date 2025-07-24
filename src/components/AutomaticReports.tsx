import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  FileText, 
  Calendar, 
  Download, 
  Trash2, 
  BarChart3,
  TrendingUp,
  BookOpen,
  Clock,
  Target,
  Users,
  DollarSign,
  Plus,
  Settings,
  Eye
} from 'lucide-react';
import { useAppState } from '../context/AppStateContext';
import { ReporteAutomatico } from '../types';
import { format, startOfMonth, endOfMonth, startOfYear, endOfYear, subMonths, subYears } from 'date-fns';
import { es } from 'date-fns/locale';

interface AutomaticReportsProps {
  isOpen: boolean;
  onClose: () => void;
}

const AutomaticReports: React.FC<AutomaticReportsProps> = ({ isOpen, onClose }) => {
  const { state, dispatch } = useAppState();
  const [selectedPeriod, setSelectedPeriod] = useState<'mensual' | 'anual'>('mensual');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');

  useEffect(() => {
    // Generar reportes automáticos si están habilitados
    if (state.config.reportesAutomaticos) {
      generateAutomaticReports();
    }
  }, [state.config.reportesAutomaticos]);

  const generateAutomaticReports = () => {
    const now = new Date();
    
    // Generar reporte mensual si no existe para el mes actual
    const currentMonthStart = startOfMonth(now);
    const currentMonthEnd = endOfMonth(now);
    
    const monthlyReportExists = state.reportesAutomaticos.some(report => 
      report.tipo === 'mensual' && 
      report.periodo.inicio === currentMonthStart.getTime() &&
      report.periodo.fin === currentMonthEnd.getTime()
    );
    
    if (!monthlyReportExists) {
      const monthlyData = calculateReportData(currentMonthStart, currentMonthEnd);
      const monthlyReport: ReporteAutomatico = {
        id: Date.now(),
        tipo: 'mensual',
        fechaGeneracion: now.getTime(),
        periodo: {
          inicio: currentMonthStart.getTime(),
          fin: currentMonthEnd.getTime()
        },
        datos: monthlyData
      };
      dispatch({ type: 'GENERAR_REPORTE', payload: monthlyReport });
    }
    
    // Generar reporte anual si no existe para el año actual
    const currentYearStart = startOfYear(now);
    const currentYearEnd = endOfYear(now);
    
    const yearlyReportExists = state.reportesAutomaticos.some(report => 
      report.tipo === 'anual' && 
      report.periodo.inicio === currentYearStart.getTime() &&
      report.periodo.fin === currentYearEnd.getTime()
    );
    
    if (!yearlyReportExists) {
      const yearlyData = calculateReportData(currentYearStart, currentYearEnd);
      const yearlyReport: ReporteAutomatico = {
        id: Date.now() + 1,
        tipo: 'anual',
        fechaGeneracion: now.getTime(),
        periodo: {
          inicio: currentYearStart.getTime(),
          fin: currentYearEnd.getTime()
        },
        datos: yearlyData
      };
      dispatch({ type: 'GENERAR_REPORTE', payload: yearlyReport });
    }
  };

  const calculateReportData = (startDate: Date, endDate: Date) => {
    const startTime = startDate.getTime();
    const endTime = endDate.getTime();
    
    // Filtrar libros por período
    const librosEnPeriodo = state.libros.filter(libro => {
      if (libro.fechaFin) {
        return libro.fechaFin >= startTime && libro.fechaFin <= endTime;
      }
      return false;
    });
    
    const librosLeidos = librosEnPeriodo.filter(libro => libro.estado === 'leido');
    const paginasLeidas = librosLeidos.reduce((sum, libro) => sum + (libro.paginas || 0), 0);
    
    // Calcular tiempo de lectura
    const tiempoLectura = librosLeidos.reduce((sum, libro) => {
      if (libro.fechaInicio && libro.fechaFin) {
        return sum + (libro.fechaFin - libro.fechaInicio);
      }
      return sum;
    }, 0);
    
    // Géneros más leídos
    const generosCount: Record<string, number> = {};
    librosLeidos.forEach(libro => {
      if (libro.genero) {
        generosCount[libro.genero] = (generosCount[libro.genero] || 0) + 1;
      }
    });
    const generosMasLeidos = Object.entries(generosCount)
      .map(([genero, count]) => ({ genero, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
    
    // Autores más leídos
    const autoresCount: Record<string, number> = {};
    librosLeidos.forEach(libro => {
      if (libro.autor) {
        autoresCount[libro.autor] = (autoresCount[libro.autor] || 0) + 1;
      }
    });
    const autoresMasLeidos = Object.entries(autoresCount)
      .map(([autor, count]) => ({ autor, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
    
    // Sagas completadas
    const sagasCompletadas = state.sagas.filter(saga => 
      saga.isComplete && saga.fechaCompletado && 
      saga.fechaCompletado >= startTime && saga.fechaCompletado <= endTime
    ).length;
    
    // Objetivos cumplidos
    const objetivoLibros = state.config.objetivoLecturaAnual || 0;
    const objetivosCumplidos = librosLeidos.length >= objetivoLibros ? 1 : 0;
    
    // Préstamos activos
    const prestamosActivos = state.historialPrestamos.filter(prestamo => 
      prestamo.estado === 'activo' && 
      prestamo.fechaPrestamo >= startTime && prestamo.fechaPrestamo <= endTime
    ).length;
    
    // Valor agregado (puntos/dinero ganados)
    const valorAgregado = state.config.modoDinero ? state.dineroGanado : state.puntosGanados;
    
    return {
      librosLeidos: librosLeidos.length,
      paginasLeidas,
      tiempoLectura: Math.round(tiempoLectura / (1000 * 60 * 60 * 24)), // en días
      generosLeidos: generosMasLeidos,
      autoresLeidos: autoresMasLeidos,
      sagasCompletadas,
      objetivosCumplidos,
      prestamosActivos,
      valorAgregado
    };
  };

  const handleGenerateCustomReport = () => {
    if (!customStartDate || !customEndDate) {
      alert('Por favor selecciona las fechas de inicio y fin');
      return;
    }
    
    const startDate = new Date(customStartDate);
    const endDate = new Date(customEndDate);
    
    if (startDate >= endDate) {
      alert('La fecha de inicio debe ser anterior a la fecha de fin');
      return;
    }
    
    const reportData = calculateReportData(startDate, endDate);
    const customReport: ReporteAutomatico = {
      id: Date.now(),
      tipo: 'personalizado',
      fechaGeneracion: new Date().getTime(),
      periodo: {
        inicio: startDate.getTime(),
        fin: endDate.getTime()
      },
      datos: reportData
    };
    
    dispatch({ type: 'GENERAR_REPORTE', payload: customReport });
    setCustomStartDate('');
    setCustomEndDate('');
  };

  const handleExportReport = (report: ReporteAutomatico, exportFormat: 'json' | 'csv' | 'pdf') => {
    const reportData = {
      ...report,
      periodoTexto: `${format(new Date(report.periodo.inicio), 'dd/MM/yyyy', { locale: es })} - ${format(new Date(report.periodo.fin), 'dd/MM/yyyy', { locale: es })}`,
      fechaGeneracionTexto: format(new Date(report.fechaGeneracion), 'dd/MM/yyyy HH:mm', { locale: es })
    };
    
    if (exportFormat === 'json') {
      const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `reporte_${report.tipo}_${format(new Date(report.periodo.inicio), 'yyyy-MM-dd', { locale: es })}.json`;
      link.click();
    } else if (exportFormat === 'csv') {
      const csvContent = [
        ['Período', reportData.periodoTexto],
        ['Fecha de generación', reportData.fechaGeneracionTexto],
        ['Tipo de reporte', report.tipo],
        [''],
        ['Estadísticas'],
        ['Libros leídos', report.datos.librosLeidos],
        ['Páginas leídas', report.datos.paginasLeidas],
        ['Tiempo de lectura (días)', report.datos.tiempoLectura],
        ['Sagas completadas', report.datos.sagasCompletadas],
        ['Objetivos cumplidos', report.datos.objetivosCumplidos],
        ['Préstamos activos', report.datos.prestamosActivos],
        ['Valor agregado', report.datos.valorAgregado],
        [''],
        ['Géneros más leídos'],
        ...report.datos.generosLeidos.map(g => [g.genero, g.count]),
        [''],
        ['Autores más leídos'],
        ...report.datos.autoresLeidos.map(a => [a.autor, a.count])
      ].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
      
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `reporte_${report.tipo}_${format(new Date(report.periodo.inicio), 'yyyy-MM-dd', { locale: es })}.csv`;
      link.click();
    }
    
    dispatch({ type: 'EXPORTAR_REPORTE', payload: { id: report.id, formato: exportFormat } });
  };

  const handleDeleteReport = (reportId: number) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este reporte?')) {
      dispatch({ type: 'DELETE_REPORTE', payload: { id: reportId } });
    }
  };

  const getReportIcon = (tipo: string) => {
    switch (tipo) {
      case 'mensual': return Calendar;
      case 'anual': return TrendingUp;
      case 'personalizado': return FileText;
      default: return BarChart3;
    }
  };

  const getReportTitle = (report: ReporteAutomatico) => {
    const startDate = format(new Date(report.periodo.inicio), 'MMMM yyyy', { locale: es });
    const endDate = format(new Date(report.periodo.fin), 'MMMM yyyy', { locale: es });
    
    switch (report.tipo) {
      case 'mensual':
        return `Reporte Mensual - ${startDate}`;
      case 'anual':
        return `Reporte Anual - ${format(new Date(report.periodo.inicio), 'yyyy', { locale: es })}`;
      case 'personalizado':
        return `Reporte Personalizado - ${format(new Date(report.periodo.inicio), 'dd/MM/yyyy', { locale: es })} - ${format(new Date(report.periodo.fin), 'dd/MM/yyyy', { locale: es })}`;
      default:
        return 'Reporte';
    }
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
          className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Reportes Automáticos
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            {/* Generate Custom Report */}
            <div className="mb-6 p-4 border border-blue-200 dark:border-blue-700 rounded-lg bg-blue-50 dark:bg-blue-900/20">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Generar Reporte Personalizado
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Fecha de inicio
                  </label>
                  <input
                    type="date"
                    value={customStartDate}
                    onChange={(e) => setCustomStartDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Fecha de fin
                  </label>
                  <input
                    type="date"
                    value={customEndDate}
                    onChange={(e) => setCustomEndDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
                
                <div className="flex items-end">
                  <button
                    onClick={handleGenerateCustomReport}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Generar Reporte
                  </button>
                </div>
              </div>
            </div>

            {/* Reports List */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Reportes Generados ({state.reportesAutomaticos.length})
              </h3>
              
              {state.reportesAutomaticos.length === 0 ? (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No hay reportes generados</p>
                  <p className="text-sm">Los reportes se generan automáticamente cada mes y año</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {state.reportesAutomaticos.map((report) => {
                    const Icon = getReportIcon(report.tipo);
                    
                    return (
                      <div
                        key={report.id}
                        className="border border-gray-200 dark:border-gray-600 rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
                      >
                        {/* Report Header */}
                        <div className="p-4 border-b border-gray-200 dark:border-gray-600">
                          <div className="flex items-center gap-2 mb-2">
                            <Icon className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                            <h4 className="font-medium text-gray-900 dark:text-white">
                              {getReportTitle(report)}
                            </h4>
                          </div>
                          
                          <p className="text-sm text-gray-600 dark:text-gray-300">
                            Generado el {format(new Date(report.fechaGeneracion), 'dd/MM/yyyy HH:mm', { locale: es })}
                          </p>
                        </div>

                        {/* Report Stats */}
                        <div className="p-4">
                          <div className="grid grid-cols-2 gap-3 text-sm">
                            <div className="flex items-center gap-2">
                              <BookOpen className="w-4 h-4 text-blue-500" />
                              <span className="text-gray-600 dark:text-gray-300">
                                {report.datos.librosLeidos} libros
                              </span>
                            </div>
                            
                            <div className="flex items-center gap-2">
                              <FileText className="w-4 h-4 text-green-500" />
                              <span className="text-gray-600 dark:text-gray-300">
                                {report.datos.paginasLeidas} páginas
                              </span>
                            </div>
                            
                            <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4 text-purple-500" />
                              <span className="text-gray-600 dark:text-gray-300">
                                {report.datos.tiempoLectura} días
                              </span>
                            </div>
                            
                            <div className="flex items-center gap-2">
                              <Target className="w-4 h-4 text-orange-500" />
                              <span className="text-gray-600 dark:text-gray-300">
                                {report.datos.sagasCompletadas} sagas
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Report Actions */}
                        <div className="p-4 border-t border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              {report.exportado && (
                                <div className="flex items-center gap-1 text-green-600 text-xs">
                                  <Download className="w-3 h-3" />
                                  <span>Exportado</span>
                                </div>
                              )}
                            </div>
                            
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleExportReport(report, 'json')}
                                className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-md transition-colors"
                                title="Exportar como JSON"
                              >
                                <FileText className="w-4 h-4" />
                              </button>
                              
                              <button
                                onClick={() => handleExportReport(report, 'csv')}
                                className="p-2 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-md transition-colors"
                                title="Exportar como CSV"
                              >
                                <Download className="w-4 h-4" />
                              </button>
                              
                              <button
                                onClick={() => handleDeleteReport(report.id)}
                                className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors"
                                title="Eliminar reporte"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
  );
};

export default AutomaticReports;