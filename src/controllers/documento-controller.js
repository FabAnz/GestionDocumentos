import validationService from "../services/validation-service.js";
import documentoService from "../services/documento-service.js";
import documentoRepository from "../repositories/documento-repository.js";

export const createDocumento = async (req, res) => {
    try {
        const { titulo, categorias, contenido } = req.body;
        const userId = req.user.id;

        // Validar que todas las categorías existen
        const validacionCategorias = await validationService.validateCategoriasExist(categorias);

        if (!validacionCategorias.isValid) {
            return res.status(400).json({
                message: validacionCategorias.message,
                categoriasValidas: validacionCategorias.categoriasValidas
            });
        }

        const documentoData = {
            titulo,
            categorias,
            contenido,
            usuario: userId
        };

        const documentoGuardado = await documentoService.createDocumento(documentoData);

        res.status(201).json(documentoGuardado);

    } catch (error) {
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

        // Otros errores
        res.status(500).json({ message: error.message });
    }
};

export const getDocumentos = async (req, res) => {
    try {
        const userId = req.user.id;
        const documentos = await documentoRepository.getAllDocumentos(userId);
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
        const documento = await documentoRepository.getDocumentoById(idDocumento, userId);
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
        const data = req.body;
        const userId = req.user.id;

        // Validar que el body no esté vacío
        if (!data || Object.keys(data).length === 0) {
            return res.status(400).json({
                message: "Debe enviar al menos un campo para actualizar"
            });
        }

        // Validar que todas las categorías existen (si se envían)
        if (data.categorias) {
            const validacionCategorias = await validationService.validateCategoriasExist(data.categorias);
            if (!validacionCategorias.isValid) {
                return res.status(400).json({
                    message: validacionCategorias.message,
                    categoriasValidas: validacionCategorias.categoriasValidas
                });
            }
        }

        // Construir objeto con solo los campos enviados
        const documentoData = {};
        if (data.titulo) documentoData.titulo = data.titulo;
        if (data.categorias) documentoData.categorias = data.categorias;
        if (data.contenido) documentoData.contenido = data.contenido;

        const documentoActualizado = await documentoService.updateDocumento(idDocumento, documentoData, userId);

        res.status(200).json(documentoActualizado);

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
        await documentoService.deleteDocumento(idDocumento, userId);
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