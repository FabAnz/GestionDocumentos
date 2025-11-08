import mongoose from "mongoose";

const documentoBaseSchema = new mongoose.Schema({
    titulo: {
        type: String,
        required: [true, "El título es obligatorio"],
        maxlength: [200, "El título no puede tener más de 200 caracteres"]
    },
    categoria: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Categoria",
        required: [true, "La categoría es obligatoria"]
    },
    contenido: {
        type: String,
        required: false,
        maxlength: [12000000, "El contenido no puede tener más de 12,000,000 caracteres"]
    },
    usuario: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Usuario",
        required: [true, "El usuario es obligatorio"]
    }
}, { 
    timestamps: true,
    discriminatorKey: '__type',
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

documentoBaseSchema.index({ titulo: 1, usuario: 1 }, { unique: true });

export default documentoBaseSchema;

