import express from "express";
import dotenv from "dotenv";
import { xssSanitizer } from "./middlewares/sanitizer-middleware.js";
import v1UsuarioRoutes from "./routes/v1/usuario-routes.js";
import { connectMongo } from "./config/mongo-config.js";

dotenv.config();

const app = express();
const port = process.env.PORT;

connectMongo();

app.use(express.json());

//middelware sanitizado
app.use(xssSanitizer);

app.use("/api/v1/usuarios", v1UsuarioRoutes);

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});


//TODO: validar datos del usuario antes de crearlo
//TODO: validar datos del plan antes de crearlo
//TODO: manejar errores de la base de datos
//TODO: conectar a REDIS