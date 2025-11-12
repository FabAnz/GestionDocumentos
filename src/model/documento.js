import mongoose from "mongoose";
import documentoBaseSchema from "./schemas/documento-base-schema.js";
import documentoTextoSchema from "./schemas/documento-texto-schema.js";
import documentoImagenSchema from "./schemas/documento-imagen-schema.js";

// Crear el modelo base
const Documento = mongoose.model("Documento", documentoBaseSchema, "documentos");

// Crear los discriminadores para cada tipo de documento
const DocumentoTexto = Documento.discriminator("DocumentoTexto", documentoTextoSchema);
const DocumentoImagen = Documento.discriminator("DocumentoImagen", documentoImagenSchema);

export default Documento;
export { DocumentoTexto, DocumentoImagen };
