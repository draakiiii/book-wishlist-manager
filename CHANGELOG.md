# Changelog

## [Unreleased] - 2024-12-19

### Added
- **Nuevo escáner de códigos de barras con cámara**
  - Creado `BarcodeScannerModal.tsx` con funcionalidad completa de escaneo
  - Integrado con la librería ZXing para detección de códigos ISBN
  - Soporte para múltiples cámaras (frontal/trasera)
  - Validación automática de ISBN-10 e ISBN-13
  - Interfaz moderna con feedback visual en tiempo real
  - Botón "Escanear Código" añadido al formulario TBR

### Changed
- **Mejorado el sistema de entrada de ISBN**
  - Mantenido `ISBNInputModal.tsx` para entrada manual
  - Añadido botón "Escanear Código" junto al botón "Buscar por ISBN"
  - Interfaz responsive con botones organizados verticalmente en móviles
  - Ambos métodos (manual y escaneo) usan la misma función de procesamiento

### Added Dependencies
- `@zxing/library` - Librería principal para detección de códigos de barras
- `@zxing/browser` - Adaptadores para navegadores web

### Features del nuevo BarcodeScannerModal
- Escaneo en tiempo real con la cámara del dispositivo
- Validación automática de formato ISBN
- Prevención de escaneos duplicados
- Feedback visual con mensajes informativos
- Control de múltiples cámaras
- Marco de escaneo visual con animaciones
- Estados de escaneo claros (escaneando, procesando, detenido)
- Manejo de errores robusto
- Interfaz moderna y responsive
- Soporte para tema oscuro/claro

### Beneficios
- Escaneo rápido y preciso de códigos ISBN
- Experiencia de usuario mejorada
- Compatibilidad con dispositivos móviles
- Integración automática con la API de Google Books
- Flexibilidad para elegir entre entrada manual o escaneo

### Próximos pasos
- Soporte para códigos QR
- Historial de libros escaneados
- Mejoras en la detección de códigos dañados
- Modo offline con caché de datos