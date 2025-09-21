import mongoose from "mongoose";
import categoriaSchema from "./schemas/categoria-schema.js";

const Categoria = mongoose.model("Categoria", categoriaSchema, "categorias");

export default Categoria;
