import categoriaService from "../services/categoria-service.js";

export const getCategorias = async (req, res) => {
    try {
        const categorias = await categoriaService.getCategorias();

        res.status(200).json(categorias);
    } catch (error) {
        if (error.statusCode === 404) {
            return res.status(404).json({ message: error.message });
        }
        res.status(500).json({ message: error.message });
    }
}