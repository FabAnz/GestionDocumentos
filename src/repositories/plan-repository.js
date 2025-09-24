import Plan, { PlanPlus, PlanPremium } from "../model/plan.js";

const planRepository = {

    async createPlanPlus(data) {
        try {
            const newPlan = new PlanPlus(data);
            return await newPlan.save();
        } catch (error) {
            throw error; // Re-lanzar el error para que se propague
        }
    },

    async createPlanPremium(data) {
        try {
            const newPlan = new PlanPremium(data);
            return await newPlan.save();
        } catch (error) {
            throw error; // Re-lanzar el error para que se propague
        }
    },

    async deletePlan(id) {
        try {
            return await Plan.findByIdAndDelete(id);
        } catch (error) {
            throw error; // Re-lanzar el error para que se propague
        }
    },

    async updatePlanPlus(id, data) {
        try {
            return await PlanPlus.findByIdAndUpdate(id, data, { new: true, runValidators: true });
        } catch (error) {
            throw error; // Re-lanzar el error para que se propague
        }
    }
}

export default planRepository;