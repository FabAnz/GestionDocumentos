import mongoose from "mongoose";
import { planSchema } from "./schemas/plan-schema.js";

const plan = mongoose.model("Plan", planSchema, "planes");

export default plan;