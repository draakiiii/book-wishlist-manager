# 📱 Pruebas en Móvil - Guardián de Compras

## 🚀 Opciones para probar en móvil

### **Opción 1: Red Local (Más rápido)**

1. **Asegúrate de que tu PC y móvil estén en la misma red WiFi**
2. **Inicia el servidor:**
   ```bash
   npm start
   ```
3. **Abre en tu móvil:** `http://192.168.1.143:3000`

### **Opción 2: ngrok (Acceso desde cualquier lugar)**

#### **Método Automático:**
```bash
# Ejecuta el script automático
./start-mobile.ps1
```

#### **Método Manual:**
1. **Inicia el servidor:**
   ```bash
   npm start
   ```
2. **En otra terminal, ejecuta ngrok:**
   ```bash
   ngrok http 3000
   ```
3. **Copia la URL de ngrok y ábrela en tu móvil**

## 📋 Características para probar en móvil

### ✅ **Funcionalidades principales:**
- [ ] Modo oscuro/claro
- [ ] Agregar libros a TBR
- [ ] Escanear códigos de barras (cámara)
- [ ] Configurar puntos y objetivos
- [ ] Ver progreso de recompensas
- [ ] Gestión de lista de deseos

### 📱 **Optimizaciones móviles:**
- [ ] Diseño responsive
- [ ] Touch-friendly buttons
- [ ] Cámara para escanear códigos
- [ ] Gestos táctiles
- [ ] Navegación optimizada

## 🔧 Solución de problemas

### **Si no puedes acceder desde el móvil:**

1. **Verifica la IP de tu PC:**
   ```bash
   ipconfig
   ```

2. **Asegúrate de que el firewall permita conexiones:**
   - Windows Defender puede bloquear el puerto 3000
   - Agrega una excepción para Node.js

3. **Prueba con ngrok:**
   - Funciona incluso si hay problemas de red local
   - Proporciona HTTPS automáticamente

### **Si la cámara no funciona:**
- Asegúrate de usar HTTPS (ngrok lo proporciona)
- Permite permisos de cámara en el navegador
- Prueba en diferentes navegadores móviles

## 🌐 URLs de prueba

### **Red Local:**
- `http://192.168.1.143:3000`

### **ngrok (se genera automáticamente):**
- Ejemplo: `https://abc123.ngrok.io`

## 📱 Navegadores recomendados

- **Chrome Mobile** (mejor soporte para cámara)
- **Safari** (iOS)
- **Firefox Mobile**
- **Edge Mobile**

## 🎯 Próximos pasos

1. **Probar todas las funcionalidades en móvil**
2. **Optimizar la experiencia táctil**
3. **Implementar PWA (Progressive Web App)**
4. **Agregar notificaciones push**
5. **Optimizar rendimiento móvil** 