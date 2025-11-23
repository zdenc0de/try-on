# Try On

Marketplace de moda de segunda mano potenciado con IA. Describe tu estilo y la IA encuentra las prendas perfectas para ti.

## Características

- **Búsqueda Inteligente con Gemini**: Describe lo que buscas en lenguaje natural y la IA encuentra productos relevantes
- **Análisis Automático de Imágenes**: Sube una foto de tu prenda y Gemini genera título, descripción, categoría y tags automáticamente
- **Filtrado de Relevancia**: Doble validación con IA para eliminar resultados irrelevantes
- **Compresión de Imágenes**: Optimización automática de fotos desde móvil (>1MB se comprimen)
- **Perfiles de Vendedores**: Sistema de bazares con catálogos individuales
- **Diseño Responsivo**: UI optimizada para móvil y desktop

## Tech Stack

- **Frontend**: Next.js 15, React 19, Tailwind CSS v4
- **Backend**: Supabase (PostgreSQL + Auth + Storage)
- **IA**: Google Gemini API (`gemini-2.5-flash`)
- **UI**: Lucide Icons, Sonner (toasts)

## Uso de Gemini API

### 1. Búsqueda Inteligente (`app/actions/smart-search.ts`)

**Primera llamada - Expansión de términos:**
```javascript
// Input: "ropa de playa"
// Output: { direct: ["bikini", "shorts", "sandalias"], related: ["verano", "casual"] }
```

**Segunda llamada - Filtrado de relevancia:**
```javascript
// Evalúa cada producto y excluye irrelevantes
// Ej: Un cárdigan NO es ropa de playa → se excluye
```

### 2. Análisis de Imagen (`app/actions/analyze-image.js`)

Procesa imágenes con capacidad multimodal para generar:
- Título descriptivo
- Descripción detallada
- Categoría
- Precio estimado
- 15-20 tags semánticos

### 3. Enriquecimiento de Tags (`app/actions/enrich-tags.ts`)

Mejora los tags existentes de productos para optimizar la búsqueda:
- Materiales, colores, estilos
- Ocasiones de uso
- Temporadas
- Adjetivos descriptivos

## Instalación

```bash
# Clonar repositorio
git clone <repo-url>
cd try-on

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env.local

# Ejecutar en desarrollo
npm run dev
```

## Variables de Entorno

```env
NEXT_PUBLIC_SUPABASE_URL=tu_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_supabase_anon_key
GEMINI_API_KEY=tu_gemini_api_key
```

## Estructura del Proyecto

```
app/
├── actions/           # Server Actions
│   ├── smart-search.ts    # Búsqueda con Gemini
│   ├── analyze-image.js   # Análisis de imágenes
│   ├── enrich-tags.ts     # Enriquecimiento de tags
│   ├── save-product.js    # Guardar productos
│   └── update-avatar.js   # Actualizar avatar
├── components/        # Componentes React
│   ├── Navbar.tsx
│   ├── SearchBar.tsx
│   ├── ProductCard.tsx
│   ├── ProductGrid.tsx
│   ├── PaginatedProductGrid.tsx
│   ├── BazaarShowcase.tsx
│   ├── ImageCarousel.tsx
│   └── SellerForm.jsx
├── buscar/           # Página de resultados
├── producto/[id]/    # Detalle de producto
├── vendedor/[id]/    # Perfil público de vendedor
├── vender/           # Publicar prenda
├── perfil/           # Perfil de usuario
├── login/            # Autenticación
└── admin/enrich/     # Admin: enriquecer tags
```

## Base de Datos (Supabase)

### Tablas

**profiles**
- id, full_name, instagram_handle, avatar_url

**products**
- id, user_id, title, description, category, price, image_url, tags, created_at

### Storage Buckets

- `avatars`: Fotos de perfil
- `products`: Imágenes de productos

## Funcionalidades Clave

### Búsqueda Semántica
1. Usuario escribe: "outfit para concierto"
2. Gemini expande a términos de moda específicos
3. Se buscan productos por tags
4. Gemini filtra resultados irrelevantes
5. Se muestran solo productos relevantes

### Publicar Prenda
1. Usuario sube foto (se comprime si >1MB)
2. Gemini analiza la imagen
3. Se auto-generan título, descripción, tags
4. Usuario revisa y ajusta
5. Se publica el producto

### Compresión de Imágenes
- Fotos >1MB se redimensionan (max 1920px)
- Calidad JPEG al 70%
- Optimizado para fotos de cámara móvil

## Diseño

- **Tema**: Dark mode brutalista
- **Colores**: Negro (#0a0a0a), Naranja (#ff4d00)
- **Tipografía**: Geist Sans + Geist Mono
- **Estilo**: Sin bordes redondeados, uppercase, tracking tight

## Scripts

```bash
npm run dev      # Desarrollo
npm run build    # Build producción
npm run start    # Iniciar producción
npm run lint     # Linter
```

## Equipo

Proyecto desarrollado para hackathon - "Best Use of Gemini API"

---

Hecho con Next.js + Supabase + Gemini API
