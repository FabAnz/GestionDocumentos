import Mensaje from "../model/mensaje.js";
import Chat from "../model/chat.js";

const mensajeRepository = {
    async getMensajesPrueba() {
        const mensajes = await Chat.findOne({ idCliente: "cliente-prueba" })
            .populate('mensajes')
            .select('mensajes')
            .limit(30);
        return mensajes;
    },
    async createMensaje(mensajeData) {
        const mensaje = new Mensaje(mensajeData);
        const mensajeGuardado = await mensaje.save();
        return mensajeGuardado;
    }
}

export default mensajeRepository;