import validationService from "../services/validation-service.js";
import documentoService from "../services/documento-service.js";

export const createDocumento = async (req, res) => {
    try {
        const { titulo, categorias, contenido } = req.body;

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
            contenido
        };

        const documentoGuardado = await documentoService.createDocumento(documentoData, req.user.id);

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