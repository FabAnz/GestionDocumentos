import CategoriaMensaje from "../model/categoria-mensaje.js";
import Categoria from "../model/categoria.js";
import { notFoundError } from "../errors/404-error.js";

const categoriaMensajeRepository = {

    async findCategoriaMensajeByCategoriaAndUsuario(categoriaId, userId) {
        try {
            const categoriaMensaje = await CategoriaMensaje.findOne({
                categoria: categoriaId,
                usuario: userId
            });
            return categoriaMensaje;
        } catch (error) {
            throw error;
        }
    },

    async findCategoriaMensajesByUsuario(userId) {
        try {
            const categoriaMensajes = await CategoriaMensaje.find({
                usuario: userId
            }).populate('categoria');
            return categoriaMensajes;
        } catch (error) {
            throw error;
        }
    },

    async createCategoriaMensaje(data) {
        try {
            const categoriaMensaje = new CategoriaMensaje(data);
            const categoriaMensajeGuardado = await categoriaMensaje.save();
            return categoriaMensajeGuardado;
        } catch (error) {
            throw error;
        }
    },

    async updateCategoriaMensaje(categoriaNombre, userId) {
        try {
            // Buscar la categoría por nombre
            const categoria = await Categoria.findOne({ nombre: categoriaNombre });
            if (!categoria) {
                throw notFoundError("Categoría no encontrada");
            }

            // Buscar CategoriaMensaje por categoria y usuario
            let categoriaMensaje = await this.findCategoriaMensajeByCategoriaAndUsuario(categoria._id, userId);

            if (!categoriaMensaje) {
                // Si no existe, crear nuevo con contador inicializado en 0
                categoriaMensaje = await this.createCategoriaMensaje({
                    categoria: categoria._id,
                    usuario: userId,
                    contador: 0
                });
            }

            // Incrementar contador en 1
            categoriaMensaje.contador += 1;
            const categoriaMensajeActualizado = await categoriaMensaje.save();
            await categoriaMensajeActualizado.populate('categoria');

            return categoriaMensajeActualizado;
        } catch (error) {
            throw error;
        }
    }
}

export default categoriaMensajeRepository;

