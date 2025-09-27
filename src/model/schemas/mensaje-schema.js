import mongoose from "mongoose";
import REMITENTE from "../../constants/mensaje-constant.js";

const mensajeSchema = new mongoose.Schema({
    remitente: {
        type: String,
        enum: {
            values: Object.values(REMITENTE),
            message: "El remitente debe ser uno de los valores válidos: {VALUE}"
        },
        required: [true, "El remitente es obligatorio"]
    },
    contenido: {
        type: String,
        maxlength: [10000, "El contenido del mensaje no puede tener más de 10000 caracteres"],
        minlength: [1, "El contenido del mensaje no puede estar vacío"],
        required: [true, "El contenido del mensaje es obligatorio"]
    }
}, { timestamps: true });

export default mensajeSchema;
