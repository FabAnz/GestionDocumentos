import categoriaRepository from "../repositories/categotia-repository.js";

const validationService = {
    async validateCategoriasExist(categoriaIds) {
        try {
            if (!categoriaIds || categoriaIds.length === 0) {
                return {
                    isValid: false,
                    message: "Las categorías son obligatorias"
                };
            }

            // Verificar que todas las categorías existen
            const categoriasExistentes = await categoriaRepository.findCategoriasByIds(categoriaIds);

            if (categoriasExistentes.length !== categoriaIds.length) {
                return {
                    isValid: false,
                    message: "Una o más categorías no existen",
                    categoriasValidas: categoriasExistentes.map(cat => ({
                        id: cat._id,
                        nombre: cat.nombre
                    }))
                };
            }

            return {
                isValid: true,
                categorias: categoriasExistentes
            };

        } catch (error) {
            throw error;
        }
    }
};

export default validationService;
