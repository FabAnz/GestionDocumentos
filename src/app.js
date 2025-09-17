import express from "express";
import dotenv from "dotenv";
import { xssSanitizer } from "./middlewares/sanitizer-middleware.js";
import v1UsuarioRoutes from "./routes/v1/usuario-routes.js";

dotenv.config();

const app = express();
const port = process.env.PORT;

app.use(express.json());

//middelware sanitizado
app.use(xssSanitizer);

app.use("/api/v1/usuarios", v1UsuarioRoutes);

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});


//TODO: conectar a la base de datos
//TODO: probar crear un usuario
//TODO: conectar a REDIS