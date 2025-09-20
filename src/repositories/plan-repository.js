import Plan from "../model/plan.js";

const planRepository = {

    async createPlan(data) {
        try {
            const newPlan = new Plan(data);
            return await newPlan.save();
        } catch (error) {
            throw error; // Re-lanzar el error para que se propague
        }
    }
}

export default planRepository;