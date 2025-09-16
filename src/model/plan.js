import mongoose from "mongoose";
import { planSchema } from "./schemas/plan-schema";

const plan = mongoose.model("Plan", planSchema);

export default plan;