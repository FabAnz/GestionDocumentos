import categoriaRepository from "../repositories/categotia-repository.js";
import documentoRepository from "../repositories/documento-repository.js";

export const createDocumento = async (req, res) => {
    try {
        const { titulo, categorias, contenido } = req.body;

        // Validar que todas las categorías existen
        const categoriasExistentes = await categoriaRepository.findCategoriasByIds(categorias);

        if (categoriasExistentes.length !== categorias.length) {
            return res.status(400).json({
                message: "Una o más categorías no existen",
                categoriasValidas: categoriasExistentes.map(cat => ({
                    id: cat._id,
                    nombre: cat.nombre
                }))
            });
        }

        const documentoData = {
            titulo,
            categorias,
            contenido
        };

        const documentoGuardado = await documentoRepository.createDocumento(documentoData);

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

        res.status(500).json({ message: error.message });
    }
};

export const getDocumentos = async (req, res) => {
    try {
        const documentos = await documentoRepository.getAllDocumentos();

        res.status(200).json(documentos);

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getDocumentoById = async (req, res) => {
    try {
        const { id } = req.params;
        
        const documento = await documentoRepository.getDocumentoById(id)

        if (!documento) {
            return res.status(404).json({ message: "Documento no encontrado" });
        }

        res.status(200).json(documento);

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
