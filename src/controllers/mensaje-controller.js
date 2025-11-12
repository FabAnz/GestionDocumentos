import mensajeService from "../services/mensaje-service.js";

export const probarChat = async (req, res) => {
    try {
        const { idCliente, contenido } = req.body;
        const mensaje = await mensajeService.probarChat(idCliente, contenido, req.user.id);
        return res.status(200).json(mensaje);
    } catch (error) {
        if (error.statusCode === 403) {
            return res.status(403).json({ message: error.message });
        }
        if (error.statusCode === 404) {
            return res.status(404).json({ message: error.message });
        }
        return res.status(500).json({ message: error.message });
    }
}

export const getMensajesPrueba = async (req, res) => {
    try {
        const mensajes = await mensajeService.getMensajesPrueba();
        if (!mensajes) {
            return res.status(404).json({ message: "No se encontraron mensajes" });
        }
        return res.status(200).json(mensajes);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}