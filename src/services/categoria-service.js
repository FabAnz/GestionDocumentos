import categoriaRepository from "../repositories/categoria-repository.js";
import { getValue, setValue } from "./redis-service.js";

const categoriaService = {
    async getCategorias() {
        try {

            const cachedCategorias = await getValue("categorias:all");
            if (cachedCategorias) {
                return cachedCategorias;
            }
            const categorias = await categoriaRepository.findCategorias();
            await setValue("categorias:all", categorias, 300);
            return categorias;
        } catch (error) {
            throw error;
        }
    }
}

export default categoriaService;