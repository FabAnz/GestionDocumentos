import mongoose from "mongoose";
import planBaseSchema from "./schemas/plan-base-schema.js";
import planPlusSchema from "./schemas/plan-plus-schema.js";
import planPremiumSchema from "./schemas/plan-premium-shema.js";

// Crear el modelo base
const Plan = mongoose.model("Plan", planBaseSchema, "planes");

// Crear los discriminadores para cada tipo de plan
const PlanPlus = Plan.discriminator("PlanPlus", planPlusSchema);
const PlanPremium = Plan.discriminator("PlanPremium", planPremiumSchema);

export default Plan;
export { PlanPlus, PlanPremium };