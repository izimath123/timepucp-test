# 🎨 Instalación del Favicon para TIMEPUCP

## Archivos incluidos

1. **favicon.svg** - Logo principal en formato SVG (escalable, mejor calidad)
2. **site.webmanifest** - Configuración para PWA (Progressive Web App)
3. **index.html** - HTML actualizado con los links de favicon

## 📋 Pasos de instalación

### 1. Copiar archivos al proyecto

Coloca estos archivos en la **raíz** de tu proyecto (mismo nivel que index.html):
- `favicon.svg`
- `site.webmanifest`

### 2. Generar imágenes PNG desde el SVG

Necesitas crear las versiones PNG del favicon. Puedes hacerlo de varias formas:

#### Opción A: Usar una herramienta online
1. Ve a https://realfavicongenerator.net/
2. Sube el archivo `favicon.svg`
3. Descarga el paquete completo
4. Extrae y copia estos archivos a la raíz de tu proyecto:
   - `favicon-16x16.png`
   - `favicon-32x32.png`
   - `apple-touch-icon.png` (180x180)
   - `favicon-192x192.png`
   - `favicon-512x512.png`

#### Opción B: Usar Photoshop, GIMP o Inkscape
1. Abre `favicon.svg`
2. Exporta en los siguientes tamaños:
   - 16x16 px → `favicon-16x16.png`
   - 32x32 px → `favicon-32x32.png`
   - 180x180 px → `apple-touch-icon.png`
   - 192x192 px → `favicon-192x192.png`
   - 512x512 px → `favicon-512x512.png`

#### Opción C: Usar ImageMagick (línea de comandos)
```bash
# Instalar ImageMagick primero
convert favicon.svg -resize 16x16 favicon-16x16.png
convert favicon.svg -resize 32x32 favicon-32x32.png
convert favicon.svg -resize 180x180 apple-touch-icon.png
convert favicon.svg -resize 192x192 favicon-192x192.png
convert favicon.svg -resize 512x512 favicon-512x512.png
```

### 3. Reemplazar index.html

Reemplaza tu archivo `index.html` actual con el nuevo que incluye las referencias al favicon.

## 🎨 Personalización del diseño

El favicon actual usa:
- **Color principal**: Azul PUCP (#003DA5)
- **Color secundario**: Naranja (#FF6B00)
- **Diseño**: Reloj analógico con animación

### Para cambiar colores:

Edita el archivo `favicon.svg` y busca:
```svg
<circle cx="256" cy="256" r="256" fill="#003DA5"/>  <!-- Fondo azul PUCP -->
```

Cambia `#003DA5` por tu color preferido.

## ✅ Verificación

Después de implementar:

1. Limpia la caché del navegador (Ctrl + Shift + Del)
2. Recarga la página (Ctrl + F5)
3. Verifica que el ícono aparezca en:
   - Pestaña del navegador
   - Favoritos
   - Pantalla de inicio (móviles)

## 🎯 Alternativas de diseño

Si quieres un diseño diferente, puedo crear:
1. **Cronómetro digital** - Números LED estilo
2. **Reloj de arena** - Minimalista y moderno
3. **Logo PUCP + reloj** - Combinación institucional
4. **Iniciales "TP"** - Monograma de TIMEPUCP

Avísame si quieres que genere alguna de estas alternativas.

## 📱 Compatibilidad

Este favicon es compatible con:
- ✅ Chrome, Edge, Firefox, Safari (escritorio)
- ✅ Chrome, Safari (móvil)
- ✅ Instalación como PWA
- ✅ Modo claro y oscuro

## 🔧 Solución de problemas

**El favicon no aparece:**
1. Verifica que los archivos estén en la raíz del proyecto
2. Limpia caché del navegador
3. Revisa la consola del navegador por errores 404

**Los colores se ven mal:**
- Algunos navegadores convierten SVG a PNG automáticamente
- Usa las versiones PNG si el SVG no se ve bien
