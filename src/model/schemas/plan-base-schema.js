import mongoose from "mongoose";
import { PLAN_TYPE } from "../../constants/plan-constant.js";

const planBaseSchema = new mongoose.Schema({
    nombre: {
        type: String,
        required: [true, "El nombre del plan es obligatorio"],
        enum: {
            values: Object.values(PLAN_TYPE),
            message: "El nombre del plan debe ser uno de los valores válidos: {VALUE}"
        },
        trim: true,
        lowercase: true
    }
}, { 
    timestamps: true,
    discriminatorKey: '__type',
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

export default planBaseSchema;
