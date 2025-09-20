import mongoose from "mongoose";

const usuarioSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        lowercase: true,
        trim: true,
        match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Ingrese un email valido"],
        maxlength: [254, "El email no puede tener más de 254 caracteres"]
    },
    password: {
        type: String,
        required: true,
        minlength: [8, "La contraseña debe tener al menos 8 caracteres"],
        maxlength: [128, "La contraseña no puede tener más de 128 caracteres"]
    },
    nombre: {
        type: String,
        required: true,
        minlength: [2, "El nombre debe tener al menos 2 caracteres"],
        maxlength: [50, "El nombre no puede tener más de 50 caracteres"]
    },
    apellido: {
        type: String,
        required: true,
        minlength: [2, "El apellido debe tener al menos 2 caracteres"],
        maxlength: [50, "El apellido no puede tener más de 50 caracteres"]
    },
    plan: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Plan",
        required: false,
    },
}, { timestamps: true });

usuarioSchema.index({ email: 1 }, { unique: true });

export default usuarioSchema;