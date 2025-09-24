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
        if(!documentos || documentos.length === 0) {
            return res.status(404).json({ message: "No se encontraron documentos" });
        }
        res.status(200).json(documentos);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};