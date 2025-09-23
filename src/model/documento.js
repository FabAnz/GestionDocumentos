import mongoose from "mongoose";
import documentoSchema from "./schemas/documento-schema.js";

const Documento = mongoose.model("Documento", documentoSchema, "documentos");

export default Documento;
