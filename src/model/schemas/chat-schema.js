import mongoose from "mongoose";

const chatSchema = new mongoose.Schema({
    idCliente: {
        type: String,
        required: [true, "El ID del cliente es obligatorio"]
    },
    usuario: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Usuario",
        required: [true, "El usuario es obligatorio"]
    },
    mensajes: {
        type: [mongoose.Schema.Types.ObjectId],
        ref: "Mensaje",
        required: false
    }
}, { timestamps: true });

chatSchema.index({ idCliente: 1, usuario: 1 }, { unique: true });

export default chatSchema;