import validationService from "../services/validation-service.js";
import documentoService from "../services/documento-service.js";
import fileExtractionService from "../services/file-extraction-service.js";
import cloudinaryService from "../services/cloudinary-service.js";
import DOCUMENT_TYPE from "../constants/document-constant.js";

const isImageFile = (file) => {
    const mimeType = file.mimetype;
    const extension = file.originalname.toLowerCase().substring(
        file.originalname.lastIndexOf('.')
    );
    
    const imageMimes = ['image/jpeg', 'image/jpg', 'image/png'];
    const imageExtensions = ['.jpg', '.jpeg', '.png'];
    
    return imageMimes.includes(mimeType) || imageExtensions.includes(extension);
};

export const createDocumento = async (req, res) => {
    try {
        // Verificar que se recibió un archivo
        if (!req.file) {
            return res.status(400).json({
                message: "No se recibió ningún archivo"
            });
        }

        // Obtener campos del FormData
        const { titulo, categoria } = req.body;
        const userId = req.user.id;

        // Validar que titulo y categoria están presentes (ya validado por Joi, pero por seguridad)
        if (!titulo || !categoria) {
            return res.status(400).json({
                message: "El título y la categoría son obligatorios"
            });
        }

        // Validar que la categoría existe
        const validacionCategoria = await validationService.validateCategoriaExist(categoria);

        if (!validacionCategoria.isValid) {
            return res.status(400).json({
                message: validacionCategoria.message
            });
        }

        // Detectar tipo de archivo y procesar según corresponda
        let contenido = "";
        let cloudinaryUrl = null;
        const esImagen = isImageFile(req.file);

        if (esImagen) {
            // Si es imagen, subir a Cloudinary
            try {
                cloudinaryUrl = await cloudinaryService.uploadImage(req.file);
            } catch (error) {
                return res.status(400).json({
                    message: `Error al subir imagen a Cloudinary: ${error.message}`
                });
            }
        } else {
            // Si es archivo de texto (PDF/TXT), extraer texto
            try {
                contenido = await fileExtractionService.extractTextFromFile(req.file);
            } catch (error) {
                return res.status(400).json({
                    message: error.message
                });
            }
            
            // Validar que se extrajo contenido
            if (!contenido || contenido.trim().length === 0) {
                return res.status(400).json({
                    message: "No se pudo extraer contenido del archivo. El archivo puede estar vacío o no contener texto seleccionable."
                });
            }
        }
        
        // Crear documento con el contenido extraído
        // La validación se maneja automáticamente por el schema de Mongoose
        // Se usa DocumentoTexto o DocumentoImagen según el tipo de archivo
        const documentoData = {
            titulo,
            categoria,
            contenido,
            tipo: esImagen ? DOCUMENT_TYPE.IMAGEN : DOCUMENT_TYPE.TEXTO,
            usuario: userId
        };
        
        esImagen && (documentoData.urlImagen = cloudinaryUrl);

        const documentoGuardado = await documentoService.createDocumento(documentoData, esImagen);

        res.status(201).json(documentoGuardado);

    } catch (error) {
        // Los errores de multer ya se manejan en el middleware uploadFile
        // Este catch maneja otros errores que puedan ocurrir después

        // Manejar errores de validación de Mongoose
        if (error.name === 'ValidationError') {
            const errores = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({
                message: "Error de validación",
                errors: errores
            });
        }

        // Manejar error de limite de interacciones con documentos
        if (error.message === "LIMITE_ALCANZADO") {
            return res.status(403).json({ message: "Has alcanzado el límite de interacciones con documentos, para continuar con la interacción con documentos, debes actualizar tu plan" });
        }

        // Manejar error de titulo duplicado
        if (error.code === 11000) {
            return res.status(409).json({
                message: "El titulo ya está registrado"
            });
        }

        if (error.statusCode === 404) {
            return res.status(404).json({ message: error.message });
        }

        // Otros errores
        res.status(500).json({ message: error.message });
    }
};

export const getDocumentos = async (req, res) => {
    try {
        const userId = req.user.id;
        const documentos = await documentoService.getAllDocumentos(userId);
        if (!documentos || documentos.length === 0) {
            return res.status(404).json({ message: "No se encontraron documentos" });
        }
        res.status(200).json(documentos);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getDocumentoById = async (req, res) => {
    try {
        const idDocumento = req.params.id;
        const userId = req.user.id;
        const documento = await documentoService.getDocumentoById(idDocumento, userId);
        if (!documento) {
            return res.status(404).json({ message: "No se encontró el documento" });
        }
        res.status(200).json(documento);
    } catch (error) {
        if (error.statusCode === 403) {
            return res.status(403).json({ message: error.message });
        }
        if (error.statusCode === 404) {
            return res.status(404).json({ message: error.message });
        }
        res.status(500).json({ message: error.message });
    }
};
export const updateDocumento = async (req, res) => {
    try {
        const idDocumento = req.params.id;
        const { titulo, categoria } = req.body;
        const userId = req.user.id;

        // Validar que al menos se envíe un campo para actualizar
        if (!titulo && !categoria && !req.file) {
            return res.status(400).json({
                message: "Debe enviar al menos un campo para actualizar"
            });
        }

        // Obtener documento original para conocer su tipo
        const documentoOriginal = await documentoService.getDocumentoById(idDocumento, userId);
        if (!documentoOriginal) {
            return res.status(404).json({
                message: "No se encontró el documento"
            });
        }

        // Validar que la categoría existe (si se envía)
        if (categoria) {
            const validacionCategoria = await validationService.validateCategoriaExist(categoria);
            if (!validacionCategoria.isValid) {
                return res.status(400).json({
                    message: validacionCategoria.message
                });
            }
        }

        // Construir objeto con los datos a actualizar
        const documentoData = {};
        if (titulo) documentoData.titulo = titulo;
        if (categoria) documentoData.categoria = categoria;

        let esImagenNueva = null;
        let tieneArchivoNuevo = false;
        let urlImagenAnterior = null;
        let cloudinaryUrlNueva = null;

        // Guardar URL de imagen anterior si existe (para eliminarla después si hay cambio de archivo)
        if (documentoOriginal.tipo === DOCUMENT_TYPE.IMAGEN && documentoOriginal.urlImagen) {
            urlImagenAnterior = documentoOriginal.urlImagen;
        }

        // Si hay archivo nuevo, procesarlo
        if (req.file) {
            tieneArchivoNuevo = true;
            let contenido = "";
            let cloudinaryUrl = null;
            esImagenNueva = isImageFile(req.file);

            if (esImagenNueva) {
                // Si es imagen, subir a Cloudinary
                try {
                    cloudinaryUrl = await cloudinaryService.uploadImage(req.file);
                    cloudinaryUrlNueva = cloudinaryUrl;
                    documentoData.urlImagen = cloudinaryUrl;
                } catch (error) {
                    return res.status(400).json({
                        message: `Error al subir imagen a Cloudinary: ${error.message}`
                    });
                }
            } else {
                // Si es archivo de texto (PDF/TXT), extraer texto
                try {
                    contenido = await fileExtractionService.extractTextFromFile(req.file);
                } catch (error) {
                    return res.status(400).json({
                        message: error.message
                    });
                }
                
                // Validar que se extrajo contenido
                if (!contenido || contenido.trim().length === 0) {
                    return res.status(400).json({
                        message: "No se pudo extraer contenido del archivo. El archivo puede estar vacío o no contener texto seleccionable."
                    });
                }
                
                documentoData.contenido = contenido;
            }
            
            documentoData.tipo = esImagenNueva ? DOCUMENT_TYPE.IMAGEN : DOCUMENT_TYPE.TEXTO;
        }

        try {
            const documentoActualizado = await documentoService.updateDocumento(
                idDocumento, 
                documentoData, 
                userId, 
                esImagenNueva !== null ? esImagenNueva : (documentoOriginal.tipo === DOCUMENT_TYPE.IMAGEN),
                tieneArchivoNuevo
            );

            // Si hay cambio de archivo y había una imagen anterior, eliminar la imagen anterior de Cloudinary
            if (tieneArchivoNuevo && urlImagenAnterior) {
                try {
                    await cloudinaryService.deleteFileByUrl(urlImagenAnterior);
                } catch (error) {
                    // Log del error pero no fallar la operación completa
                    console.error('Error al eliminar imagen anterior de Cloudinary:', error);
                }
            }

            res.status(200).json(documentoActualizado);

        } catch (updateError) {
            // Si falla la actualización y se subió una nueva imagen, eliminar la nueva imagen de Cloudinary
            if (cloudinaryUrlNueva) {
                try {
                    await cloudinaryService.deleteFileByUrl(cloudinaryUrlNueva);
                } catch (deleteError) {
                    console.error('Error al eliminar imagen nueva de Cloudinary tras fallo en actualización:', deleteError);
                }
            }
            throw updateError;
        }

    } catch (error) {
        // Manejar errores de validación de Mongoose
        if (error.name === 'ValidationError') {
            const errores = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({
                message: "Error de validación",
                errors: errores
            });
        }

        // Manejar error de bad request
        if (error.statusCode === 400) {
            return res.status(400).json({ message: error.message });
        }

        // Manejar error de permisos
        if (error.statusCode === 403) {
            return res.status(403).json({ message: error.message });
        }

        // Manejar error de documento no encontrado
        if (error.statusCode === 404) {
            return res.status(404).json({ message: error.message });
        }

        // Manejar error de titulo duplicado
        if (error.code === 11000) {
            return res.status(409).json({
                message: "El titulo ya está registrado"
            });
        }

        // Otros errores
        res.status(500).json({ message: error.message });
    }
};

export const deleteDocumento = async (req, res) => {
    try {
        const idDocumento = req.params.id;
        const userId = req.user.id;
        
        // Obtener documento antes de eliminarlo para verificar si tiene imagen
        const documento = await documentoService.getDocumentoById(idDocumento, userId);
        
        // Eliminar documento de la base de datos
        await documentoService.deleteDocumento(idDocumento, userId);
        
        // Si el documento tenía una imagen, eliminar de Cloudinary
        if (documento && documento.tipo === DOCUMENT_TYPE.IMAGEN && documento.urlImagen) {
            try {
                await cloudinaryService.deleteFileByUrl(documento.urlImagen);
            } catch (error) {
                // Log del error pero no fallar la operación completa
                console.error('Error al eliminar imagen de Cloudinary:', error);
            }
        }
        
        res.status(204).json();
    } catch (error) {
        if (error.statusCode === 400) {
            return res.status(400).json({ message: error.message });
        }
        if (error.statusCode === 403) {
            return res.status(403).json({ message: error.message });
        }
        if (error.statusCode === 404) {
            return res.status(404).json({ message: error.message });
        }
        res.status(500).json({ message: error.message });
    }
};