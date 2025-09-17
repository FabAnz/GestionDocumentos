import Plan from "../model/plan.js";

const planRepository = {

    async createPlan(data) {
        try {
            const newPlan = new Plan(data);
            return await newPlan.save();
        } catch (error) {
            console.log('No se pudo crear el plan en la base de datos', error);
        }
    }
}

export default planRepository;