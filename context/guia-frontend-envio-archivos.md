# Guía Frontend: Envío de Archivos al Backend

Esta guía explica cómo el frontend debe enviar archivos (PDF y TXT) al backend para la creación de documentos.

---

## Conceptos Importantes

### ❌ NO puedes enviar archivos como JSON

**Incorrecto:**
```javascript
// Esto NO funciona para archivos
const data = {
  archivo: file,  // ❌ No funciona
  titulo: "Mi documento",
  categoria: "123456"
};

fetch(url, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(data)  // ❌ El archivo no se puede serializar así
});
```

### ✅ Debes usar FormData

**Correcto:**
```javascript
const formData = new FormData();
formData.append('archivo', file);  // ✅ El archivo se agrega directamente
formData.append('titulo', 'Mi documento');
formData.append('categoria', '123456');

fetch(url, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`
    // NO establezcas Content-Type manualmente
  },
  body: formData  // ✅ FormData directamente, sin JSON.stringify()
});
```

---

## ¿Qué es FormData?

`FormData` es una API del navegador que permite construir un conjunto de pares clave/valor que representan campos de formulario y sus valores. Es el formato estándar para enviar archivos a través de HTTP.

### Características importantes:

1. **Maneja archivos nativamente**: Puedes agregar archivos directamente sin necesidad de convertirlos
2. **Content-Type automático**: El navegador establece automáticamente el `Content-Type` como `multipart/form-data` con el boundary correcto
3. **No requiere serialización**: No necesitas usar `JSON.stringify()`

---

## Implementación Paso a Paso

### 1. Obtener el archivo del input

```jsx
import { useState } from 'react';

const DocumentoUpload = () => {
  const [file, setFile] = useState(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  return (
    <input
      type="file"
      accept=".pdf,.txt"
      onChange={handleFileChange}
    />
  );
};
```

### 2. Validar el archivo antes de enviar

```javascript
const validateFile = (file) => {
  // Validar que existe un archivo
  if (!file) {
    return { valid: false, error: 'Debes seleccionar un archivo' };
  }

  // Validar tipo MIME
  const allowedMimes = ['application/pdf', 'text/plain'];
  if (!allowedMimes.includes(file.type)) {
    return { valid: false, error: 'Solo se permiten archivos PDF y TXT' };
  }

  // Validar extensión (por si el navegador no detecta bien el MIME)
  const allowedExtensions = ['.pdf', '.txt'];
  const fileExtension = file.name.toLowerCase().substring(
    file.name.lastIndexOf('.')
  );
  if (!allowedExtensions.includes(fileExtension)) {
    return { valid: false, error: 'Solo se permiten archivos PDF y TXT' };
  }

  // Validar tamaño (ejemplo: máximo 10MB)
  const maxSize = 10 * 1024 * 1024; // 10MB en bytes
  if (file.size > maxSize) {
    return { valid: false, error: 'El archivo no puede ser mayor a 10MB' };
  }

  return { valid: true };
};
```

### 3. Crear FormData y enviar

```javascript
const handleSubmit = async (e) => {
  e.preventDefault();

  // Validar archivo
  const validation = validateFile(file);
  if (!validation.valid) {
    alert(validation.error);
    return;
  }

  // Validar otros campos
  if (!titulo || !categoria) {
    alert('Todos los campos son requeridos');
    return;
  }

  // Crear FormData
  const formData = new FormData();
  
  // Agregar el archivo (el nombre 'archivo' debe coincidir con lo que espera el backend)
  formData.append('archivo', file);
  
  // Agregar los otros campos como strings
  formData.append('titulo', titulo);
  formData.append('categoria', categoria);

  try {
    // Obtener token de autenticación (ajusta según tu implementación)
    const token = localStorage.getItem('token');
    
    if (!token) {
      throw new Error('No hay token de autenticación');
    }

    // Enviar al backend
    const response = await fetch('http://localhost:3000/api/v1/documentos/archivo', {
      method: 'POST',
      headers: {
        // IMPORTANTE: NO establezcas Content-Type manualmente
        // El navegador lo establecerá automáticamente como:
        // 'multipart/form-data; boundary=----WebKitFormBoundary...'
        'Authorization': `Bearer ${token}`
      },
      body: formData  // FormData directamente, NO JSON.stringify()
    });

    // Manejar respuesta
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Error al subir el archivo');
    }

    const documento = await response.json();
    console.log('Documento creado exitosamente:', documento);
    
    // Limpiar formulario
    setFile(null);
    setTitulo('');
    setCategoria('');
    
    return documento;
  } catch (error) {
    console.error('Error al subir archivo:', error);
    alert(error.message || 'Error al subir el archivo');
    throw error;
  }
};
```

---

## Ejemplo Completo en React

```jsx
import { useState } from 'react';

const DocumentoUpload = () => {
  const [file, setFile] = useState(null);
  const [titulo, setTitulo] = useState('');
  const [categoria, setCategoria] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const validateFile = (file) => {
    if (!file) {
      return { valid: false, error: 'Debes seleccionar un archivo' };
    }

    const allowedMimes = ['application/pdf', 'text/plain'];
    const allowedExtensions = ['.pdf', '.txt'];
    const fileExtension = file.name.toLowerCase().substring(
      file.name.lastIndexOf('.')
    );

    if (!allowedMimes.includes(file.type) && 
        !allowedExtensions.includes(fileExtension)) {
      return { valid: false, error: 'Solo se permiten archivos PDF y TXT' };
    }

    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return { valid: false, error: 'El archivo no puede ser mayor a 10MB' };
    }

    return { valid: true };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    // Validar archivo
    const validation = validateFile(file);
    if (!validation.valid) {
      setError(validation.error);
      setLoading(false);
      return;
    }

    // Validar otros campos
    if (!titulo.trim() || !categoria.trim()) {
      setError('Todos los campos son requeridos');
      setLoading(false);
      return;
    }

    // Crear FormData
    const formData = new FormData();
    formData.append('archivo', file);
    formData.append('titulo', titulo.trim());
    formData.append('categoria', categoria.trim());

    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('No hay token de autenticación');
      }

      const response = await fetch('http://localhost:3000/api/v1/documentos/archivo', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
          // NO establezcas Content-Type aquí
        },
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al subir el archivo');
      }

      const documento = await response.json();
      console.log('Documento creado:', documento);
      
      // Limpiar formulario
      setFile(null);
      setTitulo('');
      setCategoria('');
      
      // Mostrar mensaje de éxito o redirigir
      alert('Documento creado exitosamente');
      
    } catch (err) {
      console.error('Error:', err);
      setError(err.message || 'Error al subir el archivo');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label htmlFor="archivo">Archivo (PDF o TXT):</label>
        <input
          id="archivo"
          type="file"
          accept=".pdf,.txt"
          onChange={(e) => setFile(e.target.files[0])}
          disabled={loading}
        />
        {file && (
          <p>Archivo seleccionado: {file.name} ({(file.size / 1024).toFixed(2)} KB)</p>
        )}
      </div>

      <div>
        <label htmlFor="titulo">Título:</label>
        <input
          id="titulo"
          type="text"
          value={titulo}
          onChange={(e) => setTitulo(e.target.value)}
          disabled={loading}
          required
        />
      </div>

      <div>
        <label htmlFor="categoria">Categoría ID:</label>
        <input
          id="categoria"
          type="text"
          value={categoria}
          onChange={(e) => setCategoria(e.target.value)}
          disabled={loading}
          required
        />
      </div>

      {error && <div style={{ color: 'red' }}>{error}</div>}

      <button type="submit" disabled={loading}>
        {loading ? 'Subiendo...' : 'Subir Documento'}
      </button>
    </form>
  );
};

export default DocumentoUpload;
```

---

## Ejemplo con Axios (si usas Axios)

Si estás usando Axios en lugar de fetch nativo:

```javascript
import axios from 'axios';

const handleSubmit = async (e) => {
  e.preventDefault();

  const formData = new FormData();
  formData.append('archivo', file);
  formData.append('titulo', titulo);
  formData.append('categoria', categoria);

  try {
    const token = localStorage.getItem('token');
    
    const response = await axios.post(
      'http://localhost:3000/api/v1/documentos/archivo',
      formData,
      {
        headers: {
          'Authorization': `Bearer ${token}`
          // Axios establece automáticamente el Content-Type correcto
          // para FormData, así que NO lo establezcas manualmente
        }
      }
    );

    console.log('Documento creado:', response.data);
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
  }
};
```

---

## Puntos Críticos a Recordar

### ✅ HACER:

1. **Usar FormData** para enviar archivos
2. **Agregar el archivo directamente** con `formData.append('archivo', file)`
3. **Dejar que el navegador establezca Content-Type** automáticamente
4. **Validar el archivo** antes de enviarlo (tipo, tamaño)
5. **Manejar errores** apropiadamente
6. **Mostrar feedback** al usuario (loading, éxito, error)

### ❌ NO HACER:

1. **NO usar JSON.stringify()** con archivos
2. **NO establecer Content-Type manualmente** cuando usas FormData
3. **NO intentar convertir el archivo a string** antes de enviarlo
4. **NO olvidar el token de autenticación** en los headers
5. **NO enviar archivos sin validar** tipo y tamaño

---

## Endpoint del Backend

**URL:** `POST /api/v1/documentos/archivo`

**Headers requeridos:**
- `Authorization: Bearer {token}`

**Body (FormData):**
- `archivo`: File (PDF o TXT)
- `titulo`: String
- `categoria`: String (ID de la categoría)

**Respuesta exitosa (201):**
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "titulo": "Mi documento",
  "categoria": "507f191e810c19729de860ea",
  "contenido": "Contenido extraído del archivo...",
  "usuario": "507f1f77bcf86cd799439012",
  "createdAt": "2025-01-06T00:00:00.000Z",
  "updatedAt": "2025-01-06T00:00:00.000Z"
}
```

**Errores posibles:**
- `400`: Archivo no válido, campos faltantes, validación fallida
- `401`: Token de autenticación inválido o faltante
- `403`: Límite de interacciones alcanzado
- `409`: Título duplicado
- `500`: Error del servidor

---

## Testing desde el Frontend

Puedes probar el envío de archivos usando la consola del navegador:

```javascript
// Crear un FormData de prueba
const formData = new FormData();

// Crear un archivo de texto de prueba
const blob = new Blob(['Contenido de prueba'], { type: 'text/plain' });
const file = new File([blob], 'test.txt', { type: 'text/plain' });

formData.append('archivo', file);
formData.append('titulo', 'Documento de prueba');
formData.append('categoria', 'ID_DE_CATEGORIA_AQUI');

// Enviar
fetch('http://localhost:3000/api/v1/documentos/archivo', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${tu_token_aqui}`
  },
  body: formData
})
  .then(res => res.json())
  .then(data => console.log('Éxito:', data))
  .catch(err => console.error('Error:', err));
```

---

## Recursos Adicionales

- [MDN: FormData API](https://developer.mozilla.org/es/docs/Web/API/FormData)
- [MDN: Using FormData Objects](https://developer.mozilla.org/es/docs/Web/API/FormData/Using_FormData_Objects)
- [MDN: File API](https://developer.mozilla.org/es/docs/Web/API/File)

---

## Notas para el Equipo de Frontend

1. **Coordinación con Backend**: El nombre del campo del archivo debe ser `'archivo'` (singular) para que coincida con lo que espera el backend con multer.

2. **Manejo de Errores**: El backend puede devolver diferentes tipos de errores. Asegúrate de manejar todos los casos posibles y mostrar mensajes claros al usuario.

3. **UX**: Considera mostrar un indicador de progreso para archivos grandes, aunque el backend procesará el archivo rápidamente.

4. **Validación**: La validación en el frontend es importante para UX, pero el backend también validará. No confíes solo en la validación del frontend.

5. **CORS**: Asegúrate de que la URL del backend esté configurada correctamente y que CORS esté habilitado en el backend (ya está configurado para `http://localhost:5173`).

