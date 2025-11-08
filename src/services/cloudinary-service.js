import dotenv from "dotenv";

dotenv.config();

const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
const uploadPreset = process.env.CLOUDINARY_UPLOAD_PRESET;

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
    }
};

export default cloudinaryService;

