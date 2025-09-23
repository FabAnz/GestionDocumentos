import Categoria from "../model/categoria.js";

const categoriaRepository = {

    async findCategorias() {
        return await Categoria.find();
    },

    async findCategoriasByIds(ids) {
        return await Categoria.find({ _id: { $in: ids } });
    }
}

export default categoriaRepository;