import Mensaje from "../model/mensaje.js";

const mensajeRepository = {
    async createMensaje(mensajeData) {
        const mensaje = new Mensaje(mensajeData);
        const mensajeGuardado = await mensaje.save();
        return mensajeGuardado;
    }
}

export default mensajeRepository;