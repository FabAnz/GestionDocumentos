import usuarioRepository from "../repositories/usuario-repository.js";
import { PLAN_TYPE } from "../constants/plan-constant.js";

export const limiteDocumentos = async (req, res, next) => {
    try {
        const { user } = req;
        const usuario = await usuarioRepository.getUserById(user.id);
        const { nombre, interaccionesConDocumentosRestantes } = usuario.plan;
        if (nombre === PLAN_TYPE.PLUS && interaccionesConDocumentosRestantes <= 0) {
            return res.status(403).json({ message: "Has alcanzado el límite de interacciones con documentos, para continuar con la interacción con documentos, debes actualizar tu plan" });
        }
        next();
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};