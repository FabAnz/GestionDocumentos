import usuarioRepository from "../repositories/usuario-repository.js";
import { PLAN_TYPE } from "../constants/plan-constant.js";

export const validateUpgradePlan = async (req, res, next) => {
    try {
        // Verificar que el usuario está autenticado (debe venir después de authMiddleware)
        if (!req.user || !req.user.id) {
            return res.status(401).json({ 
                message: "Usuario no autenticado" 
            });
        }

        // Obtener el usuario completo con su plan
        const usuario = await usuarioRepository.getUserById(req.user.id);
        if (!usuario) {
            return res.status(404).json({ 
                message: "Usuario no encontrado" 
            });
        }

        // Verificar que el usuario tiene un plan
        if (!usuario.plan) {
            return res.status(400).json({ 
                message: "El usuario no tiene un plan asignado" 
            });
        }

        // Verificar que el plan actual es "plus"
        if (usuario.plan.nombre !== PLAN_TYPE.PLUS) {
            return res.status(400).json({ 
                message: "Actualmente ya cuentas con plan Premium",
                planActual: usuario.plan.nombre,
                planRequeridoParaUpgrade: PLAN_TYPE.PLUS
            });
        }

        // Agregar información del usuario y plan al request para usar en el controlador
        req.usuarioCompleto = usuario;

        // Continuar con el siguiente middleware/controlador
        next();

    } catch (error) {
        console.error("Error en validateUpgradePlan:", error);
        return res.status(500).json({ 
            message: "Error interno del servidor" 
        });
    }
};