import usuarioRepository from "../repositories/usuario-repository.js";
import planRepository from "../repositories/plan-repository.js";
import { PLAN_TYPE } from "../constants/plan-constant.js";


const usuarioService = {

    async createUsuarioConPlan(data) {
        let newUsuario = null;
        try {
            // 1. Crear el usuario sin plan
            newUsuario = await usuarioRepository.createUsuario(data);

            // 2. Crear el plan Plus
            const planData = {
                nombre: PLAN_TYPE.PLUS,
                respuestaRestantesIA: 10,
                interaccionesConDocumentosRestantes: 10,
            }
            const newPlan = await planRepository.createPlanPlus(planData);

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
    },

    async upgradePlan(usuario) {
        let newPlan = null;
        try {
            const planData = {
                nombre: PLAN_TYPE.PREMIUM,
            }
            newPlan = await planRepository.createPlanPremium(planData);
            const usuarioActualizado = await usuarioRepository.updateUsuario(
                usuario._id, 
                { plan: newPlan._id }
            );
            await planRepository.deletePlan(usuario.plan._id);
            return usuarioActualizado;
        }
        catch (error) {
            // Solo eliminar el nuevo plan si se creó exitosamente
            if (newPlan && newPlan._id) {
                try {
                    await planRepository.deletePlan(newPlan._id);
                } catch (deleteError) {
                    console.error('Error al eliminar plan tras fallo en upgrade:', deleteError);
                }
            }
            throw error;
        }
    }
}

export default usuarioService;