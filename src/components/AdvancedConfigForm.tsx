import React, { useState } from 'react';
import { useAppState } from '../context/AppStateContext';
import { useTheme } from '../hooks/useTheme';
import { motion } from 'framer-motion';
import { 
  Settings, 
  Palette, 
  Type, 
  Layout, 
  Eye, 
  Zap, 
  Shield, 
  Bell, 
  ChevronDown,
  ChevronRight,
  Save,
  RotateCcw,
  X
} from 'lucide-react';
import { 
  COLOR_SCHEMES, 
  FONT_CONFIGS, 
  SPACING_CONFIGS, 
  BORDER_CONFIGS, 
  SHADOW_CONFIGS,
  isValidHexColor
} from '../utils/themeConfig';

interface AdvancedConfigFormProps {
  onClose?: () => void;
}

const AdvancedConfigForm: React.FC<AdvancedConfigFormProps> = ({ onClose }) => {
  const { state, dispatch } = useAppState();
  const { isDark, setColorScheme, setCustomTheme, resetTheme } = useTheme();
  const [config, setConfig] = useState(state.config);
  const [expandedSections, setExpandedSections] = useState<string[]>(['theme']);
  const [customColors, setCustomColors] = useState({
    primario: '#0ea5e9',
    secundario: '#3b82f6',
    exito: '#10b981',
    advertencia: '#f59e0b',
    error: '#ef4444',
    fondo: isDark ? '#0f172a' : '#ffffff',
    texto: isDark ? '#f1f5f9' : '#1e293b',
    borde: isDark ? '#334155' : '#e2e8f0',
  });

  const handleConfigChange = (field: keyof typeof config, value: any) => {
    const newConfig = { ...config, [field]: value };
    setConfig(newConfig);
    dispatch({ type: 'SET_CONFIG', payload: newConfig });
  };

  const toggleSection = (section: string) => {
    setExpandedSections(prev => 
      prev.includes(section) 
        ? prev.filter(s => s !== section)
        : [...prev, section]
    );
  };

  const handleColorSchemeChange = (scheme: string) => {
    setColorScheme(scheme);
    handleConfigChange('esquemaColor', scheme);
  };

  const handleCustomColorChange = (colorKey: string, value: string) => {
    if (isValidHexColor(value)) {
      setCustomColors(prev => ({ ...prev, [colorKey]: value }));
      
      const newCustomTheme = {
        nombre: 'Tema Personalizado',
        colores: { ...customColors, [colorKey]: value },
        modoOscuro: isDark
      };
      
      setCustomTheme(newCustomTheme);
      handleConfigChange('temaPersonalizado', newCustomTheme);
    }
  };

  const handleSaveCustomTheme = () => {
    const newCustomTheme = {
      nombre: 'Tema Personalizado',
      colores: customColors,
      modoOscuro: isDark
    };
    
    setCustomTheme(newCustomTheme);
    handleConfigChange('temaPersonalizado', newCustomTheme);
    handleConfigChange('esquemaColor', 'personalizado');
  };

  const handleResetTheme = () => {
    resetTheme();
    handleConfigChange('esquemaColor', 'azul');
    handleConfigChange('temaPersonalizado', undefined);
  };

  const sections = [
    {
      id: 'theme',
      title: 'Temas y Colores',
      icon: <Palette className="h-4 w-4" />,
      content: (
        <div className="space-y-4">
          {/* Esquemas de color predefinidos */}
          <div>
            <label className="block text-sm font-medium mb-2">Esquema de Color</label>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(COLOR_SCHEMES).map(([key, scheme]) => (
                <button
                  key={key}
                  onClick={() => handleColorSchemeChange(key)}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    config.esquemaColor === key
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 rounded-full" style={{ backgroundColor: scheme.light.primary }}></div>
                    <span className="text-sm font-medium">{scheme.name}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Colores personalizados */}
          <div>
            <label className="block text-sm font-medium mb-2">Colores Personalizados</label>
            <div className="grid grid-cols-2 gap-3">
              {Object.entries(customColors).map(([key, value]) => (
                <div key={key} className="space-y-1">
                  <label className="text-xs text-gray-600 dark:text-gray-400 capitalize">
                    {key}
                  </label>
                  <div className="flex space-x-2">
                    <input
                      type="color"
                      value={value}
                      onChange={(e) => handleCustomColorChange(key, e.target.value)}
                      className="w-8 h-8 rounded border cursor-pointer"
                    />
                    <input
                      type="text"
                      value={value}
                      onChange={(e) => handleCustomColorChange(key, e.target.value)}
                      className="flex-1 px-2 py-1 text-sm border rounded"
                      placeholder="#000000"
                    />
                  </div>
                </div>
              ))}
            </div>
            <button
              onClick={handleSaveCustomTheme}
              className="mt-3 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              <Save className="h-4 w-4 inline mr-2" />
              Guardar Tema Personalizado
            </button>
          </div>

          {/* Modo oscuro */}
          <div>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={config.modoOscuro}
                onChange={(e) => handleConfigChange('modoOscuro', e.target.checked)}
                className="rounded"
              />
              <span className="text-sm font-medium">Modo Oscuro</span>
            </label>
          </div>

          {/* Efectos visuales */}
          <div>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={config.efectosVisuales}
                onChange={(e) => handleConfigChange('efectosVisuales', e.target.checked)}
                className="rounded"
              />
              <span className="text-sm font-medium">Efectos Visuales</span>
            </label>
          </div>

          <button
            onClick={handleResetTheme}
            className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            <RotateCcw className="h-4 w-4 inline mr-2" />
            Restablecer Tema
          </button>
        </div>
      )
    },
    {
      id: 'typography',
      title: 'Tipografía',
      icon: <Type className="h-4 w-4" />,
      content: (
        <div className="space-y-4">
          {/* Familia de fuente */}
          <div>
            <label className="block text-sm font-medium mb-2">Familia de Fuente</label>
            <select
              value={config.familiaFuente || 'inter'}
              onChange={(e) => handleConfigChange('familiaFuente', e.target.value)}
              className="w-full px-3 py-2 border rounded-lg"
            >
              {Object.entries(FONT_CONFIGS).map(([key, font]) => (
                <option key={key} value={key}>{font.name}</option>
              ))}
            </select>
          </div>

          {/* Tamaño de fuente */}
          <div>
            <label className="block text-sm font-medium mb-2">Tamaño de Fuente</label>
            <select
              value={config.tamanoFuente || 'normal'}
              onChange={(e) => handleConfigChange('tamanoFuente', e.target.value)}
              className="w-full px-3 py-2 border rounded-lg"
            >
              <option value="pequeno">Pequeño</option>
              <option value="normal">Normal</option>
              <option value="grande">Grande</option>
              <option value="muy-grande">Muy Grande</option>
            </select>
          </div>

          {/* Peso de fuente */}
          <div>
            <label className="block text-sm font-medium mb-2">Peso de Fuente</label>
            <select
              value={config.pesoFuente || 'normal'}
              onChange={(e) => handleConfigChange('pesoFuente', e.target.value)}
              className="w-full px-3 py-2 border rounded-lg"
            >
              <option value="normal">Normal</option>
              <option value="medium">Medium</option>
              <option value="semibold">Semibold</option>
              <option value="bold">Bold</option>
            </select>
          </div>
        </div>
      )
    },
    {
      id: 'layout',
      title: 'Diseño y Layout',
      icon: <Layout className="h-4 w-4" />,
      content: (
        <div className="space-y-4">
          {/* Espaciado */}
          <div>
            <label className="block text-sm font-medium mb-2">Espaciado</label>
            <select
              value={config.espaciadoPersonalizado || 'normal'}
              onChange={(e) => handleConfigChange('espaciadoPersonalizado', e.target.value)}
              className="w-full px-3 py-2 border rounded-lg"
            >
              {Object.entries(SPACING_CONFIGS).map(([key, spacing]) => (
                <option key={key} value={key}>{spacing.name}</option>
              ))}
            </select>
          </div>

          {/* Bordes */}
          <div>
            <label className="block text-sm font-medium mb-2">Estilo de Bordes</label>
            <select
              value={config.bordesRedondeados || 'normal'}
              onChange={(e) => handleConfigChange('bordesRedondeados', e.target.value)}
              className="w-full px-3 py-2 border rounded-lg"
            >
              {Object.entries(BORDER_CONFIGS).map(([key, border]) => (
                <option key={key} value={key}>{border.name}</option>
              ))}
            </select>
          </div>

          {/* Sombras */}
          <div>
            <label className="block text-sm font-medium mb-2">Sombras</label>
            <select
              value={config.sombras || 'normal'}
              onChange={(e) => handleConfigChange('sombras', e.target.value)}
              className="w-full px-3 py-2 border rounded-lg"
            >
              {Object.entries(SHADOW_CONFIGS).map(([key, shadow]) => (
                <option key={key} value={key}>{shadow.name}</option>
              ))}
            </select>
          </div>

          {/* Layout compacto */}
          <div>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={config.layoutCompacto}
                onChange={(e) => handleConfigChange('layoutCompacto', e.target.checked)}
                className="rounded"
              />
              <span className="text-sm font-medium">Layout Compacto</span>
            </label>
          </div>

          {/* Modo minimalista */}
          <div>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={config.modoMinimalista}
                onChange={(e) => handleConfigChange('modoMinimalista', e.target.checked)}
                className="rounded"
              />
              <span className="text-sm font-medium">Modo Minimalista</span>
            </label>
          </div>
        </div>
      )
    },
    {
      id: 'performance',
      title: 'Rendimiento',
      icon: <Zap className="h-4 w-4" />,
      content: (
        <div className="space-y-4">
          <div>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={config.modoAltoRendimiento}
                onChange={(e) => handleConfigChange('modoAltoRendimiento', e.target.checked)}
                className="rounded"
              />
              <span className="text-sm font-medium">Modo Alto Rendimiento</span>
            </label>
          </div>

          <div>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={config.animacionesReducidas}
                onChange={(e) => handleConfigChange('animacionesReducidas', e.target.checked)}
                className="rounded"
              />
              <span className="text-sm font-medium">Reducir Animaciones</span>
            </label>
          </div>

          <div>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={config.cargaLazy}
                onChange={(e) => handleConfigChange('cargaLazy', e.target.checked)}
                className="rounded"
              />
              <span className="text-sm font-medium">Carga Lazy</span>
            </label>
          </div>

          <div>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={config.cacheHabilitado}
                onChange={(e) => handleConfigChange('cacheHabilitado', e.target.checked)}
                className="rounded"
              />
              <span className="text-sm font-medium">Habilitar Cache</span>
            </label>
          </div>
        </div>
      )
    },
    {
      id: 'accessibility',
      title: 'Accesibilidad',
      icon: <Eye className="h-4 w-4" />,
      content: (
        <div className="space-y-4">
          <div>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={config.modoAltoContraste}
                onChange={(e) => handleConfigChange('modoAltoContraste', e.target.checked)}
                className="rounded"
              />
              <span className="text-sm font-medium">Modo Alto Contraste</span>
            </label>
          </div>

          <div>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={config.tamanoTextoAccesible}
                onChange={(e) => handleConfigChange('tamanoTextoAccesible', e.target.checked)}
                className="rounded"
              />
              <span className="text-sm font-medium">Texto Accesible</span>
            </label>
          </div>

          <div>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={config.navegacionTeclado}
                onChange={(e) => handleConfigChange('navegacionTeclado', e.target.checked)}
                className="rounded"
              />
              <span className="text-sm font-medium">Navegación por Teclado</span>
            </label>
          </div>

          <div>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={config.reducirMovimiento}
                onChange={(e) => handleConfigChange('reducirMovimiento', e.target.checked)}
                className="rounded"
              />
              <span className="text-sm font-medium">Reducir Movimiento</span>
            </label>
          </div>
        </div>
      )
    },
    {
      id: 'notifications',
      title: 'Notificaciones',
      icon: <Bell className="h-4 w-4" />,
      content: (
        <div className="space-y-4">
          <div>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={config.notificacionesPush}
                onChange={(e) => handleConfigChange('notificacionesPush', e.target.checked)}
                className="rounded"
              />
              <span className="text-sm font-medium">Notificaciones Push</span>
            </label>
          </div>

          <div>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={config.recordatoriosLectura}
                onChange={(e) => handleConfigChange('recordatoriosLectura', e.target.checked)}
                className="rounded"
              />
              <span className="text-sm font-medium">Recordatorios de Lectura</span>
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Frecuencia de Notificaciones</label>
            <select
              value={config.frecuenciaNotificaciones || 'diaria'}
              onChange={(e) => handleConfigChange('frecuenciaNotificaciones', e.target.value)}
              className="w-full px-3 py-2 border rounded-lg"
            >
              <option value="inmediata">Inmediata</option>
              <option value="diaria">Diaria</option>
              <option value="semanal">Semanal</option>
              <option value="mensual">Mensual</option>
            </select>
          </div>
        </div>
      )
    },
    {
      id: 'privacy',
      title: 'Privacidad',
      icon: <Shield className="h-4 w-4" />,
      content: (
        <div className="space-y-4">
          <div>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={config.modoIncognito}
                onChange={(e) => handleConfigChange('modoIncognito', e.target.checked)}
                className="rounded"
              />
              <span className="text-sm font-medium">Modo Incógnito</span>
            </label>
          </div>

          <div>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={config.noTracking}
                onChange={(e) => handleConfigChange('noTracking', e.target.checked)}
                className="rounded"
              />
              <span className="text-sm font-medium">No Tracking</span>
            </label>
          </div>

          <div>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={config.datosLocalSolo}
                onChange={(e) => handleConfigChange('datosLocalSolo', e.target.checked)}
                className="rounded"
              />
              <span className="text-sm font-medium">Datos Solo Locales</span>
            </label>
          </div>

          <div>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={config.encriptacionDatos}
                onChange={(e) => handleConfigChange('encriptacionDatos', e.target.checked)}
                className="rounded"
              />
              <span className="text-sm font-medium">Encriptación de Datos</span>
            </label>
          </div>
        </div>
      )
    }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <Settings className="h-6 w-6 text-blue-500" />
            <h2 className="text-xl font-semibold">Configuración Avanzada</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-80px)] p-6">
          <div className="space-y-4">
            {sections.map((section) => (
              <div key={section.id} className="border border-gray-200 dark:border-gray-700 rounded-lg">
                <button
                  onClick={() => toggleSection(section.id)}
                  className="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    {section.icon}
                    <span className="font-medium">{section.title}</span>
                  </div>
                  {expandedSections.includes(section.id) ? (
                    <ChevronDown className="h-5 w-5" />
                  ) : (
                    <ChevronRight className="h-5 w-5" />
                  )}
                </button>
                
                {expandedSections.includes(section.id) && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="px-4 pb-4"
                  >
                    {section.content}
                  </motion.div>
                )}
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default AdvancedConfigForm;