# 📱 API REST - Sistema de Gestión de Documentos y Chat

API RESTful desarrollada con Node.js y Express que proporciona un sistema completo de gestión de usuarios, documentos y mensajería con diferentes planes de suscripción.

## 🚀 Características

- **Autenticación y Autorización**: Sistema completo con JWT y bcrypt
- **Sistema de Planes**: Implementación de planes Plus y Premium con diferentes límites
- **Gestión de Documentos**: CRUD completo para manejo de documentos
- **Sistema de Mensajería**: Chat integrado con limitaciones por plan
- **Categorización**: Sistema de categorías para organizar contenido
- **Seguridad Avanzada**:
  - Helmet para headers de seguridad HTTP
  - Sanitización XSS
  - Rate limiting
  - Validación de datos con Joi
- **Caché con Redis**: Optimización de rendimiento
- **Base de datos**: MongoDB con Mongoose

## 🛠️ Tecnologías

- **Node.js** - Runtime de JavaScript
- **Express 5** - Framework web
- **MongoDB** - Base de datos NoSQL
- **Mongoose** - ODM para MongoDB
- **Redis** - Sistema de caché
- **JWT** - Autenticación basada en tokens
- **Bcrypt** - Encriptación de contraseñas
- **Helmet** - Seguridad HTTP
- **Joi** - Validación de esquemas
- **Express Rate Limit** - Control de tasa de peticiones
- **XSS** - Protección contra ataques XSS

## 📋 Prerequisitos

- Node.js (v14 o superior)
- MongoDB (local o remoto)
- Redis (local o remoto)
- npm o yarn

## 🔧 Instalación

1. **Clonar el repositorio**
```bash
git clone <url-del-repositorio>
cd App
```

2. **Instalar dependencias**
```bash
npm install
```

3. **Configurar variables de entorno**

Crear un archivo `.env` en la raíz del proyecto con las siguientes variables:

```env
# Puerto del servidor
PORT=3000

# MongoDB
MONGODB_URI=mongodb://localhost:27017/tu-base-de-datos

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# JWT
JWT_SECRET=tu-secreto-jwt-muy-seguro

# Entorno
NODE_ENV=development
```

4. **Inicializar la base de datos con datos de prueba**
```bash
npm run seed
```

## 🚀 Uso

### Desarrollo

```bash
# Modo desarrollo con nodemon (recarga automática)
npm run dev

# Modo desarrollo estándar
npm start
```

### Producción

```bash
npm run start:prod
```

### Scripts disponibles

```bash
# Sembrar datos iniciales
npm run seed

# Sembrar datos en producción (forzado)
npm run seed:force

# Cargar datos de prueba
npm run load:test

# Limpiar datos de prueba
npm run clean:test
```

## 📚 Endpoints de la API

### Usuarios (`/api/v1/usuarios`)
- Registro y autenticación de usuarios
- Gestión de perfiles
- Actualización de planes

### Documentos (`/api/v1/documentos`)
- Crear, leer, actualizar y eliminar documentos
- Asociación de documentos con usuarios
- Limitaciones según plan de suscripción

### Mensajes (`/api/v1/mensajes`)
- Sistema de chat
- Envío y recepción de mensajes
- Control de límites por plan

### Categorías (`/api/v1/categorias`)
- Gestión de categorías
- Organización de contenido

## 🏗️ Estructura del Proyecto

```
App/
├── api/
│   ├── index.js          # Entry point para Vercel
│   └── dev.js            # Entry point para desarrollo
├── src/
│   ├── app.js            # Configuración principal de Express
│   ├── config/           # Configuraciones (MongoDB, Redis)
│   ├── constants/        # Constantes de la aplicación
│   ├── controllers/      # Controladores de rutas
│   ├── errors/           # Clases de error personalizadas
│   ├── middlewares/      # Middlewares personalizados
│   ├── model/            # Modelos de Mongoose
│   │   └── schemas/      # Schemas de Mongoose
│   ├── repositories/     # Capa de acceso a datos
│   ├── routes/           # Definición de rutas
│   │   └── v1/           # Rutas versión 1
│   ├── scripts/          # Scripts de utilidad
│   │   └── seeders/      # Seeders de datos
│   ├── services/         # Lógica de negocio
│   ├── utils/            # Utilidades
│   └── validations/      # Validaciones con Joi
├── package.json
└── vercel.json           # Configuración de Vercel
```

## 🔐 Seguridad

La aplicación implementa múltiples capas de seguridad:

- **Headers de seguridad**: Helmet configura automáticamente headers HTTP seguros
- **Sanitización XSS**: Todo input es sanitizado para prevenir ataques XSS
- **Rate Limiting**: Limitación de peticiones por IP para prevenir abusos
- **Validación de entrada**: Joi valida todos los datos de entrada
- **Autenticación JWT**: Tokens seguros para autenticación
- **Encriptación**: Bcrypt para hash de contraseñas

## 🎯 Planes de Suscripción

### Plan Plus
- Funcionalidades básicas extendidas
- Límites de documentos y mensajes

### Plan Premium
- Todas las funcionalidades
- Límites extendidos
- Características adicionales

## 🌐 Deploy

### Vercel

La aplicación está configurada para ser desplegada en Vercel. El archivo `vercel.json` ya está configurado.

```bash
# Instalar Vercel CLI
npm i -g vercel

# Deploy
vercel
```

Asegúrate de configurar las variables de entorno en el dashboard de Vercel.

## 🤝 Contribución

1. Fork el proyecto
2. Crea tu rama de características (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📝 Licencia

ISC

## 👥 Autor

[Tu nombre aquí]

## 📞 Contacto

Para preguntas o sugerencias, por favor abre un issue en el repositorio.

---

⭐️ Si este proyecto te fue útil, considera darle una estrella en GitHub

