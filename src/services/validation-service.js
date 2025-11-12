import categoriaRepository from "../repositories/categoria-repository.js";

const validationService = {
    async validateCategoriaExist(categoriaId) {
        try {
            if (!categoriaId) {
                return {
                    isValid: false,
                    message: "La categoría es obligatoria"
                };
            }
            
            // Verificar que la categoría existe
            const categoriasExistentes = await categoriaRepository.findCategoriasByIds([categoriaId]);
            
            if (categoriasExistentes.length === 0) {
                return {
                    isValid: false,
                    message: "La categoría no existe"
                };
            }
            
            return {
                isValid: true,
                categoria: categoriasExistentes[0]
            };
            
        } catch (error) {
            throw error;
        }
    }
};

export default validationService;
