import mongoose from "mongoose";
import categoriaMensajeSchema from "./schemas/categoria-mensaje-schema.js";

const CategoriaMensaje = mongoose.model("CategoriaMensaje", categoriaMensajeSchema, "categorias-mensajes");

export default CategoriaMensaje;
