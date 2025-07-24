import React, { useState, useEffect } from 'react';
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
  Search, 
  Database, 
  Camera, 
  BarChart3, 
  Trophy, 
  Share2, 
  Globe, 
  Code,
  ChevronDown,
  ChevronRight,
  Save,
  RotateCcw
} from 'lucide-react';
import { 
  COLOR_SCHEMES, 
  FONT_CONFIGS, 
  SPACING_CONFIGS, 
  BORDER_CONFIGS, 
  SHADOW_CONFIGS,
  isValidHexColor,
  getContrastRatio
} from '../utils/themeConfig';

interface AdvancedConfigFormProps {
  onClose?: () => void;
}

const AdvancedConfigForm: React.FC<AdvancedConfigFormProps> = ({ onClose }) => {
  const { state, dispatch } = useAppState();
  const { isDark, colorScheme, setColorScheme, setCustomTheme, resetTheme } = useTheme();
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
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Esquema de Color
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {Object.entries(COLOR_SCHEMES).map(([key, scheme]) => (
                <button
                  key={key}
                  onClick={() => handleColorSchemeChange(key)}
                  className={`p-3 rounded-lg border-2 transition-all duration-200 ${
                    colorScheme === key 
                      ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20' 
                      : 'border-slate-200 dark:border-slate-700 hover:border-primary-300'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <div 
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: scheme.light.primary }}
                    />
                    <span className="text-sm font-medium">{scheme.name}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Colores personalizados */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Colores Personalizados
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {Object.entries(customColors).map(([key, value]) => (
                <div key={key} className="space-y-1">
                  <label className="text-xs text-slate-600 dark:text-slate-400 capitalize">
                    {key}
                  </label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="color"
                      value={value}
                      onChange={(e) => handleCustomColorChange(key, e.target.value)}
                      className="w-8 h-8 rounded border border-slate-300 dark:border-slate-600 cursor-pointer"
                    />
                    <input
                      type="text"
                      value={value}
                      onChange={(e) => handleCustomColorChange(key, e.target.value)}
                      className="flex-1 px-2 py-1 text-xs border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-700"
                      placeholder="#000000"
                    />
                  </div>
                </div>
              ))}
            </div>
            <div className="flex space-x-2 mt-3">
              <button
                onClick={handleSaveCustomTheme}
                className="px-3 py-1.5 bg-primary-500 text-white rounded text-sm hover:bg-primary-600 transition-colors"
              >
                <Save className="h-3 w-3 inline mr-1" />
                Guardar Tema
              </button>
              <button
                onClick={handleResetTheme}
                className="px-3 py-1.5 bg-slate-500 text-white rounded text-sm hover:bg-slate-600 transition-colors"
              >
                <RotateCcw className="h-3 w-3 inline mr-1" />
                Resetear
              </button>
            </div>
          </div>

          {/* Modo oscuro */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Modo Oscuro
              </p>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Cambiar entre tema claro y oscuro
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={isDark}
                onChange={() => handleConfigChange('modoOscuro', !isDark)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-primary-600"></div>
            </label>
          </div>
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
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Familia de Fuente
            </label>
            <select
              value={config.familiaFuente || 'inter'}
              onChange={(e) => handleConfigChange('familiaFuente', e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              {Object.entries(FONT_CONFIGS).map(([key, font]) => (
                <option key={key} value={key}>{font.name}</option>
              ))}
            </select>
          </div>

          {/* Tamaño de fuente */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Tamaño de Fuente
            </label>
            <select
              value={config.tamanoFuente || 'normal'}
              onChange={(e) => handleConfigChange('tamanoFuente', e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="pequeno">Pequeño</option>
              <option value="normal">Normal</option>
              <option value="grande">Grande</option>
              <option value="extra-grande">Extra Grande</option>
            </select>
          </div>

          {/* Peso de fuente */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Peso de Fuente
            </label>
            <select
              value={config.pesoFuente || 'normal'}
              onChange={(e) => handleConfigChange('pesoFuente', e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="normal">Normal</option>
              <option value="medio">Medio</option>
              <option value="semi-bold">Semi Bold</option>
              <option value="bold">Bold</option>
            </select>
          </div>
        </div>
      )
    },
    {
      id: 'layout',
      title: 'Layout y Espaciado',
      icon: <Layout className="h-4 w-4" />,
      content: (
        <div className="space-y-4">
          {/* Espaciado */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Espaciado
            </label>
            <select
              value={config.espaciadoPersonalizado || 'normal'}
              onChange={(e) => handleConfigChange('espaciadoPersonalizado', e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              {Object.entries(SPACING_CONFIGS).map(([key, spacing]) => (
                <option key={key} value={key}>{spacing.name}</option>
              ))}
            </select>
          </div>

          {/* Layout compacto */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Layout Compacto
              </p>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Reducir el espaciado entre elementos
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={config.layoutCompacto || false}
                onChange={(e) => handleConfigChange('layoutCompacto', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-primary-600"></div>
            </label>
          </div>

          {/* Mostrar iconos */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Mostrar Iconos
              </p>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Mostrar iconos en las secciones
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={config.mostrarIconos !== false}
                onChange={(e) => handleConfigChange('mostrarIconos', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-primary-600"></div>
            </label>
          </div>
        </div>
      )
    },
    {
      id: 'ui',
      title: 'Interfaz de Usuario',
      icon: <Eye className="h-4 w-4" />,
      content: (
        <div className="space-y-4">
          {/* Bordes redondeados */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Bordes Redondeados
            </label>
            <select
              value={config.bordesRedondeados || 'normal'}
              onChange={(e) => handleConfigChange('bordesRedondeados', e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              {Object.entries(BORDER_CONFIGS).map(([key, border]) => (
                <option key={key} value={key}>{border.name}</option>
              ))}
            </select>
          </div>

          {/* Sombras */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Sombras
            </label>
            <select
              value={config.sombras || 'normal'}
              onChange={(e) => handleConfigChange('sombras', e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              {Object.entries(SHADOW_CONFIGS).map(([key, shadow]) => (
                <option key={key} value={key}>{shadow.name}</option>
              ))}
            </select>
          </div>

          {/* Opacidad de tarjetas */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Opacidad de Tarjetas ({config.opacidadTarjetas || 100}%)
            </label>
            <input
              type="range"
              min="0"
              max="100"
              value={config.opacidadTarjetas || 100}
              onChange={(e) => handleConfigChange('opacidadTarjetas', parseInt(e.target.value))}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer dark:bg-slate-700"
            />
          </div>

          {/* Efecto glass */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Efecto Glass
              </p>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Aplicar efecto de cristal a las tarjetas
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={config.efectoGlass || false}
                onChange={(e) => handleConfigChange('efectoGlass', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-primary-600"></div>
            </label>
          </div>

          {/* Modo minimalista */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Modo Minimalista
              </p>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Simplificar la interfaz
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={config.modoMinimalista || false}
                onChange={(e) => handleConfigChange('modoMinimalista', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-primary-600"></div>
            </label>
          </div>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-primary-100 dark:bg-primary-900/30 rounded-lg">
            <Settings className="h-5 w-5 text-primary-600 dark:text-primary-400" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
              Configuración Avanzada
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Personaliza completamente tu experiencia
            </p>
          </div>
        </div>
      </div>

      {/* Sections */}
      <div className="space-y-4">
        {sections.map((section) => (
          <div key={section.id} className="bg-white/50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700">
            <button
              onClick={() => toggleSection(section.id)}
              className="w-full flex items-center justify-between p-4 text-left hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors rounded-xl"
            >
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-slate-100 dark:bg-slate-700 rounded-lg">
                  {section.icon}
                </div>
                <span className="font-medium text-slate-900 dark:text-white">
                  {section.title}
                </span>
              </div>
              {expandedSections.includes(section.id) ? (
                <ChevronDown className="h-5 w-5 text-slate-500" />
              ) : (
                <ChevronRight className="h-5 w-5 text-slate-500" />
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
  );
};

export default AdvancedConfigForm;