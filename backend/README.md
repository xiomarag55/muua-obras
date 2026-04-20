# MUUA Gallery Backend - Spring Boot API

API REST para la galería virtual del MUUA (Museo de la Universidad de Antioquia).

## Requisitos

- Java 17+
- Maven 3.6+
- PostgreSQL 12+

## Instalación

### 1. Clonar o descargar el proyecto

```bash
cd backend
```

### 2. Configurar PostgreSQL

```bash
# Crear la base de datos
createdb muua_db

# Configurar usuario (si es necesario)
psql -U postgres -c "ALTER USER postgres WITH PASSWORD 'postgres';"
```

### 3. Cargar datos de demostración

```bash
# Desde el proyecto frontend, ejecuta el script SQL
psql -U postgres -d muua_db -f ../frontend/DATABASE_SETUP.sql
```

### 4. Actualizar application.properties (si es necesario)

Edita `src/main/resources/application.properties`:

```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/muua_db
spring.datasource.username=postgres
spring.datasource.password=postgres
```

### 5. Compilar y ejecutar

```bash
# Compilar
mvn clean compile

# Ejecutar
mvn spring-boot:run
```

O si tienes Maven configurado en la terminal:

```bash
mvn spring-boot:run
```

La aplicación estará disponible en: **http://localhost:8080/api**

## Estructura del Proyecto

```
backend/
├── src/main/java/com/muua/gallery/
│   ├── MuuaGalleryApplication.java       (Clase principal)
│   ├── entity/
│   │   ├── Artist.java                   (Entidad Artista)
│   │   └── Artwork.java                  (Entidad Obra)
│   ├── controller/
│   │   ├── ArtistController.java
│   │   ├── ArtworkController.java
│   │   └── FilterController.java
│   ├── service/
│   │   ├── ArtistService.java
│   │   └── ArtworkService.java
│   ├── repository/
│   │   ├── ArtistRepository.java
│   │   └── ArtworkRepository.java
│   ├── dto/
│   │   └── FilterOptionsDTO.java
│   └── config/
│       └── CorsConfig.java
├── src/main/resources/
│   └── application.properties
└── pom.xml
```

## Endpoints Disponibles

### Artistas

```
GET  /api/artists                      # Obtener todos los artistas
GET  /api/artists/{id}                # Obtener artista por ID
GET  /api/artists/search?q=query      # Buscar artistas
GET  /api/artists/region?region=XX    # Filtrar por región
GET  /api/artists/technique?technique=XX  # Filtrar por técnica
```

### Obras de Arte

```
GET  /api/artworks                         # Obtener todas las obras
GET  /api/artworks/{id}                   # Obtener obra por ID
GET  /api/artworks/artist/{artistId}      # Obtener obras de un artista
GET  /api/artworks/search?q=query         # Buscar obras
GET  /api/artworks/technique?technique=XX # Filtrar por técnica
GET  /api/artworks/year?year=2023         # Filtrar por año
GET  /api/artworks/year-range?startYear=2022&endYear=2023  # Rango de años
```

### Filtros

```
GET  /api/filters                    # Obtener todas las opciones de filtro
GET  /api/filters/techniques         # Obtener técnicas disponibles
GET  /api/filters/regions            # Obtener regiones disponibles
GET  /api/filters/years              # Obtener años disponibles
```

## Ejemplos de Uso

### Obtener todos los artistas

```bash
curl http://localhost:8080/api/artists
```

### Buscar artistas

```bash
curl "http://localhost:8080/api/artists/search?q=María"
```

### Obtener obras de un artista

```bash
curl http://localhost:8080/api/artworks/artist/1
```

### Obtener opciones de filtro

```bash
curl http://localhost:8080/api/filters
```

## Configuración CORS

El backend está configurado para permitir solicitudes desde:

- `http://localhost:3000` (Frontend React)
- `http://localhost:8080` (Otros puertos)

Cambiar las URLs en `src/main/java/com/muua/gallery/config/CorsConfig.java` según necesidad.

## Datos de Demostración

La aplicación viene con 12 artistas y 24 obras de demostración cargadas desde el script SQL.

## Tecnologías Utilizadas

- **Spring Boot 3.2.0** - Framework principal
- **Spring Data JPA** - ORM y acceso a datos
- **PostgreSQL** - Base de datos
- **Lombok** - Reducción de boilerplate
- **Maven** - Gestor de dependencias

## Troubleshooting

### Error: "Cannot connect to database"

```bash
# Verificar que PostgreSQL está ejecutando
psql -U postgres -c "SELECT 1"

# Verificar datos de conexión en application.properties
```

### Error: "Table 'artists' does not exist"

```bash
# Ejecutar el script SQL
psql -U postgres -d muua_db -f ../frontend/DATABASE_SETUP.sql
```

### Port 8080 already in use

```bash
# Cambiar el puerto en application.properties
server.port=8081
```

### Maven: "Command not found"

```bash
# Instalar Maven o usar el wrapper
./mvnw spring-boot:run  (en Windows: mvnw.cmd spring-boot:run)
```

## Conectar con Frontend

En el frontend, actualiza `.env.local`:

```
REACT_APP_API_URL=http://localhost:8080/api
```

Luego ejecuta `npm start` en la carpeta frontend.

## Notas Importantes

1. El backend requiere Java 17+
2. PostgreSQL debe estar corriendo
3. Los datos dummy deben estar cargados en la BD
4. CORS está habilitado para localhost:3000
5. El contexto de la aplicación es `/api`

## Próximos Pasos

1. Instalar dependencias: `mvn clean install`
2. Ejecutar la aplicación: `mvn spring-boot:run`
3. Verificar con: `curl http://localhost:8080/api/artists`
4. Conectar frontend actualizando `.env.local`

---

**MUUA Gallery Backend**  
Versión 0.1.0
