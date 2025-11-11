import mongoose from "mongoose";

const categoriaMensajeSchema = new mongoose.Schema({
    categoria: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Categoria",
        required: [true, "La categoría es obligatoria"]
    },
    usuario: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Usuario",
        required: [true, "El usuario es obligatorio"]
    },
    contador: {
        type: Number,
        default: 0,
        required: [true, "El contador es obligatorio"]
    }
}, { timestamps: true });

export default categoriaMensajeSchema;

