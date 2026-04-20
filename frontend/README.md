# MUUA - Galería Virtual del Museo de la Universidad de Antioquia

Aplicación React para la visualización de colecciones de artistas y obras del MUUA con datos de demostración.

## Características

✨ **Galería Interactiva**

- Visualización de artistas y obras de arte con datos de demostración
- Búsqueda en tiempo real (search-as-you-type)
- Filtros dinámicos por técnica, región y año
- Interfaz responsive y moderna

📱 **Experiencia de Usuario**

- Diseño responsive (desktop, tablet, mobile)
- Animaciones suaves y transiciones
- Banner de datos de demostración visible en todo momento
- Navegación intuitiva entre vistas

🎨 **Gestión de Datos**

- Datos ficticios pero verosímiles de 12 artistas de Antioquia
- 24 obras de arte con información completa
- Esquema de datos compatible con PostgreSQL
- Preparado para conexión con backend Spring Boot

## Instalación

### Requisitos Previos

- Node.js (versión 14 o superior)
- npm o yarn

### Pasos

1. **Clonar o descargar el proyecto**

```bash
cd frontend
```

2. **Instalar dependencias**

```bash
npm install
```

3. **Configurar variables de entorno**

```bash
cp .env.example .env.local
```

Editar `.env.local` con la URL del backend:

```
REACT_APP_API_URL=http://localhost:8080/api
```

4. **Iniciar el servidor de desarrollo**

```bash
npm start
```

La aplicación se abrirá en [http://localhost:3000](http://localhost:3000)

## Estructura del Proyecto

```
frontend/
├── public/
│   └── index.html
├── src/
│   ├── components/
│   │   ├── ArtistCard.js         # Tarjeta de artista
│   │   ├── ArtworkCard.js        # Tarjeta de obra de arte
│   │   ├── DemoBanner.js         # Banner de datos de demostración
│   │   ├── FilterPanel.js        # Panel de filtros
│   │   ├── Gallery.js            # Componente principal de galería
│   │   └── SearchBar.js          # Barra de búsqueda
│   ├── data/
│   │   └── demoData.js           # Datos de demostración
│   ├── services/
│   │   └── apiService.js         # Servicios de API
│   ├── styles/
│   │   ├── index.css             # Estilos globales
│   │   ├── Gallery.css
│   │   ├── ArtworkCard.css
│   │   ├── ArtistCard.css
│   │   ├── FilterPanel.css
│   │   ├── SearchBar.css
│   │   ├── DemoBanner.css
│   │   └── App.css
│   ├── App.js
│   └── index.js
├── package.json
├── .gitignore
└── README.md
```

## Datos de Demostración

### Artistas (12 ficticios)

Cada artista incluye:

- Nombre
- Región de Antioquia
- Técnica principal
- Biografía breve
- Imagen placeholder

### Obras de Arte (24)

Cada obra incluye:

- Título
- Artista (ID de referencia)
- Técnica
- Dimensiones
- Año
- Descripción
- Imagen placeholder

### Esquema de Datos

Los datos utilizan el mismo esquema que se usará en PostgreSQL:

**Tabla: artists**

```sql
id (PRIMARY KEY)
name (VARCHAR)
region (VARCHAR)
technique (VARCHAR)
bio (TEXT)
image (VARCHAR)
created_at (TIMESTAMP)
```

**Tabla: artworks**

```sql
id (PRIMARY KEY)
title (VARCHAR)
artist_id (FOREIGN KEY -> artists.id)
technique (VARCHAR)
dimensions (VARCHAR)
year (INTEGER)
description (TEXT)
image (VARCHAR)
created_at (TIMESTAMP)
```

## Funcionalidades

### 1. Búsqueda

- Búsqueda en tiempo real sobre:
  - Nombres de artistas
  - Títulos de obras
  - Técnicas
  - Descripciones
- Interfaz clara con botón de limpieza

### 2. Filtros

- **Por Técnica**: Óleo, escultura, fotografía, etc.
- **Por Región**: Medellín, Envigado, Sabaneta, etc.
- **Por Año**: Filtrado por año de creación
- Múltiples filtros combinables
- Botón para limpiar todos los filtros

### 3. Vistas

- **Vista de Obras**: Galería de todas las obras de arte
- **Vista de Artistas**: Galería de todos los artistas
- **Detalle de Artista**: Obras específicas de un artista

### 4. Banner de Demostración

- Visible y persistente en la parte superior
- Indica claramente que son datos de demostración
- Comunica que el contenido está en construcción

## Conexión con Backend Spring Boot

### Configuración

Actualizar la variable de entorno en `.env.local`:

```
REACT_APP_API_URL=http://localhost:8080/api
```

### Endpoints Esperados

El backend debe proporcionar los siguientes endpoints:

#### Artistas

```
GET /api/artists                    # Obtener todos los artistas
GET /api/artists/{id}              # Obtener artista por ID
GET /api/artists/search?q=query    # Buscar artistas
GET /api/artists/region?region=... # Filtrar por región
GET /api/artists/technique?technique=... # Filtrar por técnica
```

#### Obras

```
GET /api/artworks                         # Obtener todas las obras
GET /api/artworks/{id}                   # Obtener obra por ID
GET /api/artworks/artist/{artistId}      # Obtener obras por artista
GET /api/artworks/search?q=query         # Buscar obras
GET /api/artworks/technique?technique=...# Filtrar por técnica
GET /api/artworks/year?year=...          # Filtrar por año
GET /api/artworks/year-range?startYear=...&endYear=... # Rango de años
```

#### Filtros

```
GET /api/filters                   # Obtener todas las opciones de filtro
GET /api/filters/techniques        # Técnicas disponibles
GET /api/filters/regions           # Regiones disponibles
GET /api/filters/years             # Años disponibles
```

## Build para Producción

```bash
npm run build
```

Esto crea una carpeta `build` optimizada y lista para desplegar.

## Variables de Entorno

Ver `.env.example` para all available options:

```
REACT_APP_API_URL=http://localhost:8080/api  # URL del backend
```

## Tecnologías Utilizadas

- **React 18.2**: Librería UI
- **Axios 1.6**: Cliente HTTP
- **React Icons 4.12**: Iconografía
- **CSS3**: Estilos (Grid, Flexbox, Animaciones)

## Requisitos Cumplidos (HU-01)

✅ **Al ingresar al sitio, la galería muestra mínimo 10 artistas**

- Se muestran 12 artistas ficticios pero verosímiles
- Cada uno con nombre, región, técnica, año e imagen

✅ **Cada obra muestra información completa**

- Título, técnica, dimensiones, año, imagen y nombre del artista

✅ **Banner de datos de demostración**

- "Datos de demostración — contenido en construcción"
- Visible y persistente en la parte superior

✅ **Buscador y filtros funcionales**

- Búsqueda en tiempo real
- Filtros por técnica, región y año
- Funcionan idénticamente con datos reales

✅ **Datos en mismo esquema de base de datos**

- Estructura compatible con PostgreSQL
- Preparado para backend Spring Boot

## Próximos Pasos

1. Crear endpoints en backend Spring Boot
2. Insertar datos de demostración en PostgreSQL
3. Conectar la aplicación con la API backend
4. Reemplazar datos dummy con datos reales
5. Implementar autenticación y autorización

## Soporte

Para reportar problemas o sugerencias, contacta al equipo de desarrollo.

---

**MUUA - Museo de la Universidad de Antioquia**  
Aplicación desarrollada en 2026
