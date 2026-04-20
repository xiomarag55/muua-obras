# 🎨 MUUA Gallery - Full Stack Application

Aplicación completa para visualizar y gestionar la colección de arte de la Universidad de Antioquia.

**Estado**: ✅ Completo y funcional

---

## 📋 Descripción

Plataforma web para explorar artistas y obras de arte con:

- ✅ Galería interactiva
- ✅ Búsqueda en tiempo real
- ✅ Filtros avanzados (técnica, región, año)
- ✅ Backend REST API con PostgreSQL
- ✅ Datos de ejemplo (12 artistas, 24 obras)
- ✅ **NUEVO: Docker & Docker Compose** 🐳

---

## 🐳 Quick Start con Docker (2 minutos) ⭐ RECOMENDADO

Opción más rápida y fácil (sin instalar dependencias):

```bash
# Navegar a la carpeta del proyecto
cd aplicacion

# Iniciar todos los servicios
docker-compose up -d

# Abrir en navegador
# http://localhost:3000
```

✅ Listo! La aplicación está corriendo. Ver: [DOCKER_QUICK_START.md](DOCKER_QUICK_START.md)

---

## 🚀 Quick Start Tradicional (5 minutos)

### Prerequisitos

**Opción 1: Con Docker (Recomendado)**

- Docker 20.10+
- Docker Compose 2.0+

**Opción 2: Sin Docker (Requerido)**

- Java 17+
- Maven 3.6+
- Node.js 14+
- PostgreSQL 12+

### Pasos de Instalación

**1. Configurar Base de Datos**

```bash
# Crear base de datos
createdb muua_db

# Cargar datos iniciales
psql -U postgres -d muua_db -f frontend/DATABASE_SETUP.sql
```

**2. Ejecutar Backend**

```bash
cd backend
./run.bat          # Windows
# o
./run.sh           # macOS/Linux
```

Esperar a ver: `Started MuuaGalleryApplication`

**3. Ejecutar Frontend**

```bash
cd frontend
npm install        # Solo primera vez
npm start
```

Abrirá automáticamente http://localhost:3000

---

## 📁 Estructura del Proyecto

```
├── frontend/                (React App - :3000)
│   ├── src/components/      (6 componentes)
│   ├── src/services/        (API client)
│   ├── DATABASE_SETUP.sql   (BD y datos)
│   └── .env.local          (Config)
│
├── backend/                 (Spring Boot - :8080)
│   ├── src/main/java/       (Controllers, Services, Entity)
│   ├── pom.xml              (Dependencias)
│   └── run.bat/run.sh       (Scripts inicio)
│
└── Documentación/
    ├── QUICK_START.md       (Este archivo - empezar aquí)
    ├── SETUP_COMPLETE.md    (Instalación detallada)
    ├── PROJECT_STRUCTURE.md (Estructura completa)
    └── frontend/README.md   (Documentación Frontend)
```

---

## 🔗 URLs Disponibles

### Frontend

- **Aplicación**: http://localhost:3000
- **Desarrollo**: `npm start` en carpeta frontend

### Backend (API REST)

- **Base URL**: http://localhost:8080/api
- **Artistas**: http://localhost:8080/api/artists
- **Obras**: http://localhost:8080/api/artworks
- **Filtros**: http://localhost:8080/api/filters

---

## 📚 Documentación

| Archivo                            | Propósito                        |
| ---------------------------------- | -------------------------------- |
| **QUICK_START.md**                 | Inicio rápido con comandos clave |
| **SETUP_COMPLETE.md**              | Guía paso a paso completa        |
| **PROJECT_STRUCTURE.md**           | Árbol de carpetas explicado      |
| **DOCKER_QUICK_START.md**          | 🐳 Start Docker en 2 minutos     |
| **DOCKER_GUIDE.md**                | 🐳 Guía completa de Docker       |
| **INSTALL_WITH_DOCKER.md**         | 🐳 Instalación detallada Docker  |
| **frontend/README.md**             | Guía React y componentes         |
| **backend/README.md**              | Guía Spring Boot y API           |
| **frontend/DATABASE_SETUP.md**     | Base de datos                    |
| **frontend/HU-01_REQUIREMENTS.md** | Requisitos cumplidos             |

---

## 🎯 Características Completadas

### Frontend

- ✅ Galería con cards de artistas y obras
- ✅ Buscador en tiempo real
- ✅ Filtros por: técnica, región, año
- ✅ Banner visual con datos de demostración
- ✅ Interfaz responsive
- ✅ Integración con API backend

### Backend

- ✅ REST API completa
- ✅ 3 controladores (Artists, Artworks, Filters)
- ✅ Búsqueda avanzada
- ✅ Filtros por múltiples criterios
- ✅ CORS habilitado
- ✅ JPA con PostgreSQL
- ✅ 100% funcional

### Base de Datos

- ✅ Schema PostgreSQL
- ✅ 12 artistas poblados
- ✅ 24 obras pobladas
- ✅ Relaciones configuradas
- ✅ Ready to use

### Docker 🐳

- ✅ docker-compose.yml completo
- ✅ Dockerfile para backend (Spring Boot)
- ✅ Dockerfile para frontend (Nginx)
- ✅ PostgreSQL containerizado
- ✅ Volúmenes persistentes
- ✅ CORS configurado
- ✅ Health checks implementados
- ✅ Variables de entorno (.env.docker, .env.prod)
- ✅ Scripts auxiliares (run.bat, run.sh)
- ✅ Documentación Docker completa

---

## 🧪 Verificar que Todo Funciona

### 1. Backend está corriendo

```bash
curl http://localhost:8080/api/artists
# Debe retornar JSON con 12 artistas
```

### 2. Frontend está corriendo

Abrir http://localhost:3000 en navegador

- Debe ver banner amarillo/rojo "Datos de demostración"
- Debe ver 12 tarjetas de artistas
- Debe ver 24 obras de arte

### 3. Búsqueda funciona

- Escribir en el buscador → Debe filtrar en tiempo real

### 4. Filtros funcionan

- Seleccionar técnica/región/año → Debe filtrar resultados

---

## 🛠️ Comandos Útiles

### Frontend

```bash
cd frontend
npm install              # Instalar dependencias
npm start               # Ejecutar desarrollo
npm build               # Build para producción
npm test                # Correr tests
```

### Backend

```bash
cd backend
mvn clean install       # Instalar dependencias
mvn spring-boot:run    # Ejecutar desarrollo
mvn package            # Empaquetar JAR
mvn test               # Correr tests

# O usar script
./run.bat              # Windows
./run.sh               # macOS/Linux
```

### Base de Datos

```bash
# Crear BD
createdb muua_db

# Cargar datos
psql -U postgres -d muua_db -f frontend/DATABASE_SETUP.sql

# Conectar a BD
psql -U postgres -d muua_db

# Dentro de psql
SELECT COUNT(*) FROM artists;    -- Debe ser 12
SELECT COUNT(*) FROM artworks;   -- Debe ser 24
```

---

## 🐛 Troubleshooting

### "Cannot connect to database"

```bash
# Verificar que PostgreSQL está corriendo
psql -U postgres -c "SELECT 1"

# Reiniciar servicio (Windows)
net start postgresql-x64-15

# Reiniciar servicio (macOS)
brew services restart postgresql

# Reiniciar servicio (Linux)
sudo service postgresql restart
```

### "Port 8080 already in use"

```bash
# Linux/macOS
lsof -i :8080
kill <PID>

# Windows
netstat -ano | findstr :8080
taskkill /PID <PID> /F
```

### "Port 3000 already in use"

```bash
# Linux/macOS
lsof -i :3000
kill <PID>

# Windows (mismo proceso anterior)
```

---

## 📊 Datos Disponibles

### Artistas (12 registros)

- Regiones: Antioquia, Boyacá, Cauca, Córdoba, Cundinamarca, Nariño
- Técnicas: Óleo, Acuarela, Escultura, Grabado, Textil, Mixta

### Obras (24 registros)

- Años: 2018-2023
- Dimensiones variadas
- Descripciones e imágenes

---

## 🏗️ Arquitectura

```
┌──────────────────────────────────────────────────┐
│  Frontend (React 18.2)                           │
│  - Components: Gallery, SearchBar, FilterPanel   │
│  - Services: API HTTP Client                     │
│  - Styles: CSS3 Grid/Flexbox                     │
└────────────────────┬─────────────────────────────┘
                     │ HTTP/JSON
                     ▼
┌──────────────────────────────────────────────────┐
│  Backend (Spring Boot 3.2.0)                     │
│  - Controllers: REST Endpoints                   │
│  - Services: Business Logic                      │
│  - Repositories: Data Access Layer               │
│  - Config: CORS, Security                        │
└────────────────────┬─────────────────────────────┘
                     │ SQL
                     ▼
┌──────────────────────────────────────────────────┐
│  Database (PostgreSQL 12+)                       │
│  - artists table (12 records)                    │
│  - artworks table (24 records)                   │
└──────────────────────────────────────────────────┘
```

---

## 📈 Estadísticas del Proyecto

| Métrica              | Valor          |
| -------------------- | -------------- |
| Componentes React    | 6              |
| Controladores Spring | 3              |
| Líneas de código     | 3000+          |
| Archivos             | 60+            |
| Documentación        | 15+ documentos |
| Datos demo           | 36 registros   |
| API endpoints        | 13             |

---

## 🔐 Seguridad (Desarrollo)

- ✅ CORS habilitado para localhost:3000
- ✅ No hay datos sensibles en source code
- ✅ No hay credenciales hardcodeadas
- ⚠️ Para producción: Actualizar CORS, agregar autenticación

---

## 📝 Licencia

MUUA - Universidad de Antioquia
Proyecto Educativo 2026

---

## 👥 Autor

Xiomara - Fundamentos de Investigación
Semestre 2026

---

## 🎓 Requisitos Académicos

✅ HU-01: Visualizar colección con búsqueda
✅ HU-02: Búsqueda en tiempo real
✅ HU-03: Filtros por criterios
✅ HU-04: Backend REST API

---

## 📞 Soporte

Revisar documentación en orden:

1. **QUICK_START.md** - Problemas de instalación
2. **SETUP_COMPLETE.md** - Configuración detallada
3. **Carpeta correspondiente README.md** - Específico del módulo

---

## ✨ Siguiente Paso

👉 **Ir a QUICK_START.md para instalación en 5 minutos**

---

_Proyecto Completo y Operacional ✅_
