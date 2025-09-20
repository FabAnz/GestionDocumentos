import usuarioRepository from "../repositories/usuario-repository.js";
import planRepository from "../repositories/plan-repository.js";
import { PLAN_TYPE } from "../constants/plan-constant.js";


const usuarioService = {

    async createUsuarioConPlan(data) {
        let newUsuario = null;
        try {
            // 1. Crear el usuario sin plan
            newUsuario = await usuarioRepository.createUsuario(data);

            // 2. Crear el plan
            const planData = {
                name: PLAN_TYPE.PLUS,
                limiteRespuestasIA: 10,
                limiteInteraccionesConDocumentos: 10,
            }
            const newPlan = await planRepository.createPlan(planData);

            // 3. Actualizar el usuario con el ID del plan
            const usuarioActualizado = await usuarioRepository.updateUsuario(
                newUsuario._id, 
                { plan: newPlan._id }
            );

            return usuarioActualizado;
        } catch (error) {
            // Si falla la creación del plan, eliminar el usuario creado
            if (newUsuario && newUsuario._id) {
                try {
                    await usuarioRepository.deleteUsuario(newUsuario._id);
                } catch (deleteError) {
                    console.error('Error al eliminar usuario tras fallo en creación de plan:', deleteError);
                }
            }
            throw error;
        }
    }
}

export default usuarioService;