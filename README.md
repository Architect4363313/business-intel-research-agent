# HAP-INTEL

**Honei Audit Profile - Intelligence System**

Sistema de prospección B2B con IA para identificar decision makers y contactos en el sector de hostelería español.

---

## 🎯 Descripción

HAP-INTEL es una aplicación de inteligencia comercial especializada en OSINT (Open-Source Intelligence) para el sector de hostelería. Utiliza Google Gemini AI para:

- ✅ Identificar CFOs, Directores Financieros y decision makers
- ✅ Encontrar emails corporativos y patrones de contacto
- ✅ Analizar el fit de Honei Terminal para cada negocio
- ✅ Generar borradores de email personalizados
- ✅ Proporcionar fuentes verificadas de Google Search
- ✅ Calcular ROI y ahorro potencial

---

## 🚀 Instalación

### Requisitos Previos

- **Node.js** (v18 o superior)
- **API Key de Google Gemini** ([Obtener aquí](https://aistudio.google.com/app/apikey))

### Pasos

1. **Clonar el repositorio**

```bash
git clone <repository-url>
cd HAP-INTEL
```

2. **Instalar dependencias**

```bash
npm install
```

3. **Configurar variables de entorno**

Crea un archivo `.env.local` en la raíz del proyecto:

```bash
cp .env.example .env.local
```

Edita `.env.local` y añade tu configuración:

```env
GEMINI_API_KEY=tu_api_key_de_gemini_aqui
VITE_USER_NAME=Tu Nombre
```

4. **Ejecutar en desarrollo**

```bash
npm run dev
```

La aplicación estará disponible en: `http://localhost:3000`

---

## 🏗️ Build para Producción

```bash
npm run build
npm run preview
```

---

## 📋 Uso

1. **Buscar un negocio**: Introduce el nombre del negocio/grupo y la ciudad
2. **Análisis OSINT**: El sistema buscará automáticamente decision makers, emails y contactos
3. **Revisar resultados**:
   - Valoración de fit de Honei Terminal
   - Lista de decision makers identificados
   - Emails sugeridos con nivel de confianza
   - Borrador de email personalizado
   - Fuentes de verificación
4. **Búsqueda profunda**: Si necesitas más información, usa el botón de Perplexity Deep Analysis
5. **Contactar**: Copia el email o abre Gmail directamente con el mensaje prellenado

---

## 🛠️ Tecnologías

- **React 19** - Framework UI
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **Google Gemini AI** - Motor de inteligencia
- **Google Search Tool** - Búsqueda y verificación

---

## 📁 Estructura del Proyecto

```
HAP-INTEL/
├── components/           # Componentes React
│   ├── BusinessInputForm.tsx
│   ├── ResultsDisplay.tsx
│   ├── HistoryList.tsx
│   ├── LoadingIndicator.tsx
│   └── icons.tsx
├── services/            # Lógica de negocio
│   └── geminiService.ts # Integración con Gemini AI
├── types.ts             # Definiciones TypeScript
├── App.tsx              # Componente principal
├── index.tsx            # Entry point
└── vite.config.ts       # Configuración Vite
```

---

## 🔒 Seguridad

- ✅ API keys en variables de entorno (nunca en el código)
- ✅ `.env.local` en `.gitignore` (no se sube al repositorio)
- ✅ Validación de inputs antes de enviar requests
- ✅ Manejo de errores con mensajes informativos

---

## 🎨 Características

- **Interfaz Nexus Aesthetic**: Diseño profesional B2B con tipografía monoespaciada
- **Historial Local**: Guarda las últimas 20 búsquedas en localStorage
- **Copy to Clipboard**: Copia emails y borradores con un click
- **Gmail Integration**: Abre Gmail con el mensaje prellenado
- **Perplexity Deep Scan**: Búsqueda avanzada para casos complejos
- **Fuentes Verificadas**: Todas las fuentes de Google Search en el sidebar

---

## 📝 Configuración Avanzada

### Personalizar el prompt de Gemini

Edita `services/geminiService.ts` para ajustar el `systemInstruction` y el `prompt` según tus necesidades.

### Cambiar el modelo de IA

Por defecto usa `gemini-3-pro-preview`. Para cambiar el modelo, edita la línea 80 en `geminiService.ts`:

```typescript
model: 'gemini-3-pro-preview',
```

---

## 🐛 Troubleshooting

### Error: "GEMINI_API_KEY no está configurada"

Asegúrate de haber creado el archivo `.env.local` con tu API key válida.

### La búsqueda falla constantemente

- Verifica que tu API key sea válida
- Comprueba que tienes cuota disponible en tu cuenta de Gemini
- Revisa tu conexión a internet

### No se muestran fuentes de Google Search

Esto es normal si Gemini no encontró fuentes relevantes. Prueba con búsquedas más específicas o usa el botón de Perplexity Deep Analysis.

---

## 📄 Licencia

Proyecto privado de Honei.

---

## 👨‍💻 Desarrollo

**Versión**: 1.0.0
**Última actualización**: 2026-01-20

Para contribuir o reportar issues, contacta con el equipo de desarrollo.
