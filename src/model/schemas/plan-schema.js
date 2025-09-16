import mongoose from "mongoose";
import { PLAN_TYPE } from "../../constants/plan-constant";

export const planSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        enum: Object.values(PLAN_TYPE)
    },
    limiteRespuestasIA: {
        type: Number,
        required: true,
    },
    limiteInteraccionesConDocumentos: {
        type: Number,
        required: true,
    },
}, { timestamps: true });