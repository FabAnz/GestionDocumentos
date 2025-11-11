import categoriaMensajeRepository from "../repositories/categoria-mensaje-repository.js";

const categoriaMensajeService = {
    async getCategoriaMensajesByUsuario(userId) {
        try {
            const categoriaMensajes = await categoriaMensajeRepository.findCategoriaMensajesByUsuario(userId);
            return categoriaMensajes;
        } catch (error) {
            throw error;
        }
    }
}

export default categoriaMensajeService;

