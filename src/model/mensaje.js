import mongoose from "mongoose";
import mensajeSchema from "./schemas/mensaje-schema.js";

const Mensaje = mongoose.model("Mensaje", mensajeSchema, "mensajes");

export default Mensaje;
