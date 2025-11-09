import dotenv from "dotenv";
import { v2 as cloudinary } from "cloudinary";

dotenv.config();

const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
const uploadPreset = process.env.CLOUDINARY_UPLOAD_PRESET;
const apiKey = process.env.CLOUDINARY_API_KEY;
const apiSecret = process.env.CLOUDINARY_API_SECRET;

// Configurar Cloudinary SDK para operaciones de eliminación
if (cloudName && apiKey && apiSecret) {
    cloudinary.config({
        cloud_name: cloudName,
        api_key: apiKey,
        api_secret: apiSecret
    });
}

const cloudinaryService = {

    async uploadImage(file) {
        try {
            // Validar que existen las variables de entorno
            if (!cloudName || !uploadPreset) {
                throw new Error('Las variables de entorno CLOUDINARY_CLOUD_NAME y CLOUDINARY_UPLOAD_PRESET son requeridas');
            }

            // Crear FormData para enviar el archivo
            const formData = new FormData();
            
            // En Node.js 18+, FormData puede aceptar Buffer directamente
            // Crear un Blob desde el buffer para asegurar compatibilidad
            const blob = new Blob([file.buffer], { type: file.mimetype });
            formData.append('file', blob, file.originalname);
            formData.append('upload_preset', uploadPreset);

            // Construir URL de Cloudinary
            const cloudinaryUrl = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;

            // Enviar archivo a Cloudinary
            const response = await fetch(cloudinaryUrl, {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(`Error al subir imagen a Cloudinary: ${response.status} ${response.statusText}. ${errorData.error?.message || ''}`);
            }

            const data = await response.json();

            // Validar que se recibió la URL segura
            if (!data.secure_url) {
                throw new Error('Cloudinary no devolvió la URL segura de la imagen');
            }

            return data.secure_url;

        } catch (error) {
            // Re-lanzar errores específicos
            if (error.message.includes('Cloudinary') || error.message.includes('CLOUDINARY')) {
                throw error;
            }
            throw new Error(`Error al subir imagen a Cloudinary: ${error.message}`);
        }
    },

    /**
     * Extrae el public_id de una URL de Cloudinary
     * @param {string} url - URL completa de Cloudinary (ej: https://res.cloudinary.com/cloud_name/image/upload/v123456789/folder/public_id.png)
     * @returns {string|null} - El public_id extraído o null si no se puede extraer
     */
    extractPublicId(url) {
        if (!url || typeof url !== 'string') {
            return null;
        }

        try {
            // Patrón para URLs de Cloudinary
            // Formato: https://res.cloudinary.com/{cloud_name}/{resource_type}/upload/{version}/{public_id}.{extension}
            // También puede tener transformaciones: /upload/{transformations}/{version}/{public_id}
            
            // Buscar el patrón después de /upload/
            const uploadMatch = url.match(/\/upload\/(?:[^\/]+\/)*v\d+\/(.+?)(?:\.[^.]+)?$/);
            
            if (uploadMatch && uploadMatch[1]) {
                // El public_id puede incluir carpetas, así que lo devolvemos completo
                return uploadMatch[1];
            }

            // Patrón alternativo: buscar después de /upload/ sin versión
            const uploadMatchAlt = url.match(/\/upload\/(?:[^\/]+\/)*(.+?)(?:\.[^.]+)?$/);
            if (uploadMatchAlt && uploadMatchAlt[1]) {
                return uploadMatchAlt[1];
            }

            return null;
        } catch (error) {
            console.error('Error al extraer public_id de URL:', error);
            return null;
        }
    },

    /**
     * Elimina un archivo de Cloudinary usando el SDK
     * @param {string} publicId - El public_id del archivo a eliminar
     * @param {string} resourceType - Tipo de recurso ('image', 'video', 'raw'). Por defecto 'image'
     * @returns {Promise<Object>} - Resultado de la eliminación
     */
    async deleteFile(publicId, resourceType = 'image') {
        try {
            // Validar que existen las credenciales necesarias
            if (!cloudName || !apiKey || !apiSecret) {
                throw new Error('Las variables de entorno CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY y CLOUDINARY_API_SECRET son requeridas para eliminar archivos');
            }

            if (!publicId) {
                throw new Error('El public_id es requerido para eliminar un archivo');
            }

            // Usar el SDK de Cloudinary para eliminar el archivo
            const result = await cloudinary.uploader.destroy(publicId, {
                resource_type: resourceType
            });

            return result;
        } catch (error) {
            console.error('Error al eliminar archivo de Cloudinary:', error);
            throw new Error(`Error al eliminar archivo de Cloudinary: ${error.message}`);
        }
    },

    /**
     * Elimina un archivo de Cloudinary a partir de su URL
     * @param {string} url - URL completa de Cloudinary
     * @param {string} resourceType - Tipo de recurso ('image', 'video', 'raw'). Por defecto 'image'
     * @returns {Promise<Object>} - Resultado de la eliminación
     */
    async deleteFileByUrl(url, resourceType = 'image') {
        try {
            const publicId = this.extractPublicId(url);
            if (!publicId) {
                throw new Error('No se pudo extraer el public_id de la URL proporcionada');
            }
            return await this.deleteFile(publicId, resourceType);
        } catch (error) {
            throw error;
        }
    }
};

export default cloudinaryService;

