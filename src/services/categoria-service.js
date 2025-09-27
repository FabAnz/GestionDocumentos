import categoriaRepository from "../repositories/categoria-repository.js";

const categoriaService = {
    async getCategorias() {
        try {
            const categorias = await categoriaRepository.findCategorias();
            return categorias;
        } catch (error) {
            throw error;
        }
    }
}

export default categoriaService;