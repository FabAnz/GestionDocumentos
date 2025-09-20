import Plan, { PlanPlus } from "../model/plan.js";

const planRepository = {

    async createPlanPlus(data) {
        try {
            const newPlan = new PlanPlus(data);
            return await newPlan.save();
        } catch (error) {
            throw error; // Re-lanzar el error para que se propague
        }
    }
}

export default planRepository;