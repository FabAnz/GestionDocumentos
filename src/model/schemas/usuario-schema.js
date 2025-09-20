import mongoose from "mongoose";

const usuarioSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        lowercase: true,
        trim: true,
        match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Ingrese un email valido"],
    },
    password: {
        type: String,
        required: true,
        minlength: [8, "La contraseña debe tener al menos 8 caracteres"]
    },
    nombre: {
        type: String,
        required: true,
    },
    apellido: {
        type: String,
        required: true,
    },
    plan: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Plan",
        required: false,
    },
}, { timestamps: true });

usuarioSchema.index({ email: 1 }, { unique: true });

export default usuarioSchema;