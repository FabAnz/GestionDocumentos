import usuarioRepository from "../repositories/usuario-repository.js";
import planRepository from "../repositories/plan-repository.js";
import { PLAN_TYPE } from "../constants/plan-constant.js";


const usuarioService = {

    async createUsuarioConPlan(data) {

        const planData = {
            name: PLAN_TYPE.PLUS,
            limiteRespuestasIA: 10,
            limiteInteraccionesConDocumentos: 10,
        }

        const newPlan = await planRepository.createPlan(planData);

        const usuarioConPlan = {
            ...data,
            plan: newPlan._id
        }
        const newUsuario = await usuarioRepository.createUsuario(usuarioConPlan);
        return newUsuario;
    }
}

export default usuarioService;