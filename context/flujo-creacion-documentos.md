# Flujo de Creación de Documentos

## Estado Actual

### Flujo Actual (Legacy)

El sistema actualmente recibe documentos con contenido en formato string a través del endpoint de creación.

**Endpoint:** `POST /api/v1/documentos`

**Request Body:**
```json
{
  "titulo": "Título del documento",
  "categoria": "ObjectId de la categoría",
  "contenido": "Contenido del documento en formato string"
}
```

**Proceso:**
1. El controlador (`documento-controller.js`) recibe los datos del body
2. Valida que la categoría existe
3. Crea el objeto `documentoData` con `titulo`, `categoria`, `contenido` y `usuario`
4. El servicio (`documento-service.js`) ejecuta `createDocumento()`:
   - Obtiene el usuario de la BD
   - Crea el documento en MongoDB
   - Actualiza el usuario agregando el documento a su lista
   - Envía el documento completo a n8n mediante `fetchService.post()` con:
     - URL: `RAG_URL_CREAR_MODIFICAR` (variable de entorno)
     - Headers: `Authorization: Bearer {N8N_JWT_TOKEN}`
     - Body: Objeto documento completo en JSON
   - Decrementa las interacciones restantes si el usuario tiene plan PLUS
   - Invalida el caché de documentos del usuario
5. Retorna el documento creado

**Comunicación con n8n:**
- Método: POST
- Content-Type: application/json
- El objeto documento completo se envía como JSON stringificado
- n8n procesa el contenido string y lo almacena en el sistema RAG

---

## Nuevo Flujo Propuesto

### Requisitos

El frontend ahora recibe archivos directamente en los siguientes formatos:
- **Imágenes:** JPG, JPEG, PNG
- **Archivos de texto:** PDF, TXT

### Arquitectura del Nuevo Flujo

Se implementará un **enfoque híbrido** que diferencia el tratamiento según el tipo de archivo:

#### 1. Flujo para Imágenes (JPG, JPEG, PNG)

**Proceso:**
1. El frontend envía el archivo de imagen mediante FormData/multipart
2. El backend recibe el archivo y detecta que es una imagen
3. El backend envía el archivo directamente a n8n como FormData/multipart
4. n8n procesa la imagen con su agente de interpretación
5. n8n devuelve una descripción de la imagen (texto)
6. El backend crea el documento en MongoDB con:
   - `titulo`: proporcionado por el usuario
   - `categoria`: proporcionada por el usuario
   - `contenido`: descripción devuelta por n8n
   - `usuario`: ID del usuario autenticado
7. Se actualiza el usuario y se invalida el caché

**Ventajas:**
- n8n maneja toda la lógica de interpretación de imágenes
- El backend no necesita procesar imágenes
- Mantiene la separación de responsabilidades

**Comunicación con n8n:**
- Método: POST
- Content-Type: multipart/form-data
- El archivo de imagen se envía como FormData
- n8n devuelve un JSON con la descripción de la imagen

#### 2. Flujo para Archivos de Texto (PDF, TXT)

**Proceso:**
1. El frontend envía el archivo mediante FormData/multipart
2. El backend recibe el archivo y detecta que es un archivo de texto
3. El backend lee el contenido del archivo:
   - **PDF:** Usa librería `pdf-parse` para extraer texto
   - **TXT:** Lee el contenido directamente del archivo
4. El backend crea el documento en MongoDB con:
   - `titulo`: proporcionado por el usuario
   - `categoria`: proporcionada por el usuario
   - `contenido`: texto extraído del archivo
   - `usuario`: ID del usuario autenticado
5. Se actualiza el usuario y se invalida el caché
6. Se envía el documento completo a n8n (igual que el flujo actual):
   - Método: POST
   - Content-Type: application/json
   - Body: Objeto documento completo en JSON

**Ventajas:**
- El backend controla la extracción de texto
- Puede validar el contenido antes de enviarlo a n8n
- Mantiene el flujo actual para archivos de texto
- Más fácil de debuggear y auditar
- Menor carga en n8n (solo procesa texto, no archivos)

---

## Cambios Técnicos Necesarios

### 1. Controller (`documento-controller.js`)

**Cambios:**
- Modificar `createDocumento` para recibir archivos mediante `multer` o similar
- Detectar el tipo de archivo según la extensión o MIME type
- Validar que el archivo sea de un tipo soportado
- Manejar dos flujos distintos según el tipo de archivo

**Nuevo Request:**
- FormData con campos:
  - `archivo`: File (obligatorio)
  - `titulo`: String (obligatorio)
  - `categoria`: String/ObjectId (obligatorio)

### 2. Service (`documento-service.js`)

**Cambios:**
- Crear método `createDocumentoFromFile()` que:
  - Detecta el tipo de archivo
  - Para imágenes: envía archivo a n8n y espera descripción
  - Para texto: extrae contenido y crea documento normalmente
- Modificar o crear método auxiliar para enviar archivos a n8n (FormData)
- Mantener `createDocumento()` para compatibilidad con el flujo actual (opcional)

### 3. Fetch Service (`fetch-service.js`)

**Cambios:**
- Agregar método `postFormData()` para enviar archivos como FormData
- Mantener métodos existentes para compatibilidad

**Nuevo método:**
```javascript
async postFormData(url, formData, options = {}) {
    // Envía FormData a n8n
    // Headers: Authorization Bearer token
    // Content-Type: multipart/form-data (se establece automáticamente)
}
```

### 4. Schema (`documento-schema.js`)

**Consideraciones:**
- El schema actual ya soporta el campo `contenido` como String
- Podría agregarse campo opcional `tipoArchivo` o `formatoOriginal` para tracking
- Podría agregarse campo `rutaArchivo` si se decide almacenar archivos temporalmente

### 5. Dependencias Nuevas

**Librerías necesarias:**
- `multer`: Para manejar archivos multipart/form-data
- `pdf-parse`: Para extraer texto de archivos PDF
- `file-type` o similar: Para detectar el tipo MIME del archivo

**Instalación:**
```bash
npm install multer pdf-parse file-type
```

### 6. Variables de Entorno

**Nuevas variables necesarias:**
- `N8N_URL_PROCESAR_IMAGEN`: URL del endpoint de n8n para procesar imágenes
- `MAX_FILE_SIZE`: Tamaño máximo de archivo permitido (opcional)
- `UPLOAD_DIR`: Directorio temporal para almacenar archivos (opcional, si se decide almacenar temporalmente)

---

## Flujo Detallado por Tipo de Archivo

### Imágenes (JPG, JPEG, PNG)

```
Frontend (FormData)
    ↓
Controller (detecta tipo imagen)
    ↓
Service (envía archivo a n8n)
    ↓
n8n (procesa imagen con agente)
    ↓
n8n (devuelve descripción JSON)
    ↓
Service (crea documento con descripción)
    ↓
MongoDB (guarda documento)
    ↓
Service (actualiza usuario, invalida caché)
    ↓
Controller (retorna documento creado)
```

### Archivos de Texto (PDF, TXT)

```
Frontend (FormData)
    ↓
Controller (detecta tipo texto)
    ↓
Service (extrae texto del archivo)
    ↓
Service (crea documento con texto extraído)
    ↓
MongoDB (guarda documento)
    ↓
Service (envía documento a n8n como JSON)
    ↓
n8n (procesa texto y almacena en RAG)
    ↓
Service (actualiza usuario, invalida caché)
    ↓
Controller (retorna documento creado)
```

---

## Decisiones de Diseño

### ¿Por qué enfoque híbrido?

1. **Imágenes:** n8n tiene el agente especializado para interpretar imágenes, por lo que es mejor enviarle el archivo directamente.

2. **Archivos de texto:** El backend puede extraer el texto eficientemente y mantener control sobre el proceso. Además, n8n solo necesita procesar texto, no archivos completos.

### Ventajas del Enfoque

- **Separación de responsabilidades:** Cada componente hace lo que mejor sabe hacer
- **Eficiencia:** No se procesan archivos grandes innecesariamente en n8n
- **Mantenibilidad:** Código más claro y fácil de debuggear
- **Escalabilidad:** El backend puede manejar la carga de extracción de texto
- **Consistencia:** Las imágenes se procesan en n8n, el texto se extrae en el backend

### Consideraciones de Seguridad

- Validar tipos MIME además de extensiones
- Limitar tamaño máximo de archivos
- Sanitizar nombres de archivos
- Validar que los archivos no contengan código malicioso
- Considerar almacenamiento temporal seguro de archivos

### Consideraciones de Performance

- Para archivos grandes, considerar procesamiento asíncrono
- Implementar límites de tamaño por tipo de archivo
- Considerar compresión de imágenes antes de enviar a n8n
- Implementar timeouts para peticiones a n8n

---

## Compatibilidad con Flujo Actual

El flujo actual (recibir contenido como string) puede mantenerse para:
- Compatibilidad con clientes existentes
- Casos de uso donde el contenido ya está procesado
- Testing y desarrollo

Se puede mantener el endpoint actual y crear un nuevo endpoint específico para archivos, o detectar automáticamente si se recibe un archivo o un string.

---

## Próximos Pasos

1. Implementar middleware de multer para recibir archivos
2. Crear utilidad para detectar tipo de archivo
3. Implementar extracción de texto de PDFs
4. Extender fetch-service para soportar FormData
5. Crear método en service para procesar imágenes
6. Actualizar controller para manejar ambos flujos
7. Agregar validaciones de seguridad
8. Implementar manejo de errores específicos por tipo de archivo
9. Agregar tests unitarios e integración
10. Documentar endpoints en API docs

