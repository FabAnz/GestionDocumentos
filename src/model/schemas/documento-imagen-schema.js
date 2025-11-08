import mongoose from "mongoose";

// Schema para documentos de imagen (JPG, JPEG, PNG)
// Extiende del documento base y agrega la URL de la imagen en Cloudinary
const documentoImagenSchema = new mongoose.Schema({
    urlImagen: {
        type: String,
        required: [true, "La URL de imagen es obligatoria para documentos de imagen"],
        validate: {
            validator: function(v) {
                return /^https?:\/\/.+/.test(v);
            },
            message: 'La URL de imagen debe ser una URL válida'
        }
    }
});

export default documentoImagenSchema;

