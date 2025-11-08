import mongoose from "mongoose";

// Schema para documentos de texto (PDF, TXT)
// Mantiene la misma estructura que el documento base, sin campos adicionales
const documentoTextoSchema = new mongoose.Schema({
    contenido: {
        type: String,
        required: [true, "El contenido es obligatorio"],
        maxlength: [12000000, "El contenido no puede tener más de 12,000,000 caracteres"]
    },
});

export default documentoTextoSchema;

