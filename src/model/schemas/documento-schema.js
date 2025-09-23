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
        required: [true, "Las categorías son obligatorias"],
        validate: {
            validator: async function (categorias) {
                if (!categorias || categorias.length === 0) {
                    return false;
                }

                // Verificar que todas las categorías existen
                const Categoria = mongoose.model('Categoria');
                const categoriasExistentes = await Categoria.countDocuments({
                    _id: { $in: categorias }
                });

                return categoriasExistentes === categorias.length;
            },
            message: "Una o más categorías no existen en la base de datos"
        }
    },
    contenido: {
        type: String,
        required: [true, "El contenido es obligatorio"],
        maxlength: [10000, "El contenido no puede tener más de 10000 caracteres"]
    }
}, {
    timestamps: true
});

export default documentoSchema;