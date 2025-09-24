import mongoose from "mongoose";

const documentoSchema = new mongoose.Schema({
    titulo: {
        type: String,
        required: [true, "El título es obligatorio"],
        maxlength: [200, "El título no puede tener más de 200 caracteres"]
    },
    categorias: {
        type: [mongoose.Schema.Types.ObjectId],
        ref: "Categoria",
        required: [true, "Las categorías son obligatorias"]
    },
    contenido: {
        type: String,
        required: [true, "El contenido es obligatorio"],
        maxlength: [10000, "El contenido no puede tener más de 10000 caracteres"]
    }
}, {
    timestamps: true
});

documentoSchema.index({ titulo: 1 }, { unique: true });

export default documentoSchema;