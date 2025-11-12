import mongoose from "mongoose";
import { PLAN_LIMITS } from "../../constants/plan-constant.js";

const planPlusSchema = new mongoose.Schema({
    respuestaRestantesIA: {
        type: Number,
        required: [true, "El límite de respuestas IA es obligatorio"],
        min: [0, "El límite de respuestas IA no puede ser negativo"],
        max: [PLAN_LIMITS.PLUS.respuestaRestantesIA, "El límite de respuestas IA no puede ser mayor a " + PLAN_LIMITS.PLUS.respuestaRestantesIA + " para Plan Plus"],
        validate: {
            validator: Number.isInteger,
            message: "El límite de respuestas IA debe ser un número entero"
        },
        default: PLAN_LIMITS.PLUS.respuestaRestantesIA
    },
    cantidadMaximaDocumentos: {
        type: Number,
        required: [true, "La cantidad máxima de documentos es obligatoria"],
        min: [0, "La cantidad máxima de documentos no puede ser negativa"],
        max: [PLAN_LIMITS.PLUS.cantidadMaximaDocumentos, "La cantidad máxima de documentos no puede ser mayor a " + PLAN_LIMITS.PLUS.cantidadMaximaDocumentos + " para Plan Plus"],
        validate: {
            validator: Number.isInteger,
            message: "La cantidad máxima de documentos debe ser un número entero"
        },
        default: PLAN_LIMITS.PLUS.cantidadMaximaDocumentos
    },
    interaccionesConDocumentosRestantes: {
        type: Number,
        required: [true, "El límite de interacciones con documentos es obligatorio"],
        min: [0, "El límite de interacciones no puede ser negativo"],
        max: [PLAN_LIMITS.PLUS.cantidadMaximaDocumentos, "El límite de interacciones no puede ser mayor a " + PLAN_LIMITS.PLUS.cantidadMaximaDocumentos + " para Plan Plus"],
        validate: {
            validator: Number.isInteger,
            message: "El límite de interacciones debe ser un número entero"
        },
        default: PLAN_LIMITS.PLUS.cantidadMaximaDocumentos
    }
});

export default planPlusSchema;
