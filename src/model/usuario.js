import mongoose from "mongoose";
import usuarioSchema from "./schemas/usuario-schema.js";

const Usuario = mongoose.model("Usuario", usuarioSchema, "usuarios");

export default Usuario;
