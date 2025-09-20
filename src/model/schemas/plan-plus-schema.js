import mongoose from "mongoose";

const planPlusSchema = new mongoose.Schema({
    respuestaRestantesIA: {
        type: Number,
        required: [true, "El límite de respuestas IA es obligatorio"],
        min: [0, "El límite de respuestas IA no puede ser negativo"],
        max: [1000, "El límite de respuestas IA no puede ser mayor a 1000 para Plan Plus"],
        validate: {
            validator: Number.isInteger,
            message: "El límite de respuestas IA debe ser un número entero"
        },
        default: 10
    },
    interaccionesConDocumentosRestantes: {
        type: Number,
        required: [true, "El límite de interacciones con documentos es obligatorio"],
        min: [0, "El límite de interacciones no puede ser negativo"],
        max: [500, "El límite de interacciones no puede ser mayor a 500 para Plan Plus"],
        validate: {
            validator: Number.isInteger,
            message: "El límite de interacciones debe ser un número entero"
        },
        default: 10
    }
});

export default planPlusSchema;
