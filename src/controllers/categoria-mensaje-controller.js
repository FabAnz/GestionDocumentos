import categoriaMensajeService from "../services/categoria-mensaje-service.js";

export const getCategoriaMensajesByUsuario = async (req, res) => {
    try {
        const categoriaMensajes = await categoriaMensajeService.getCategoriaMensajesByUsuario(req.user.id);

        if (!categoriaMensajes || categoriaMensajes.length === 0) {
            return res.status(404).json({ message: "No se encontraron categorías de mensajes para este usuario" });
        }

        res.status(200).json(categoriaMensajes);
    } catch (error) {
        if (error.statusCode === 404) {
            return res.status(404).json({ message: error.message });
        }
        res.status(500).json({ message: error.message });
    }
}

