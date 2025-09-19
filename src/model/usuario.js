import mongoose from "mongoose";
import { usuarioSchema } from "./schemas/usuario-schema.js";

const usuario = mongoose.model("Usuario", usuarioSchema, "usuarios");

export default usuario;
