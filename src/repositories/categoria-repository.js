import Categoria from "../model/categoria.js";
import { notFoundError } from "../errors/404-error.js";

const categoriaRepository = {

    async findCategorias() {
        try {
            const categorias = await Categoria.find();
            if (!categorias || categorias.length === 0) {
                throw notFoundError("Categorías no encontradas");
            }
            return categorias;
        } catch (error) {
            throw error;
        }
    },
    
    async findCategoriasByIds(ids) {
        try {
            const categorias = await Categoria.find({ _id: { $in: ids } });
            if (!categorias || categorias.length === 0) {  
                throw notFoundError("Categorías no encontradas");
            }
            return categorias;
        } catch (error) {
            throw error;
        }
    }
}

export default categoriaRepository;