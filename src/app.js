import express from "express";
import dotenv from "dotenv";
import { xssSanitizer } from "./middlewares/sanitizer-middleware.js";
import v1UsuarioRoutes from "./routes/v1/usuario-routes.js";
import v1DocumentoRoutes from "./routes/v1/documento-routes.js";
import { connectMongo } from "./config/mongo-config.js";
import v1MensajeRoutes from "./routes/v1/mensaje-routes.js";

dotenv.config();

const app = express();
const port = process.env.PORT;

connectMongo();

app.use(express.json());

//middelware sanitizado
app.use(xssSanitizer);

app.use("/api/v1/usuarios", v1UsuarioRoutes);
app.use("/api/v1/documentos", v1DocumentoRoutes);
app.use("/api/v1/mensajes", v1MensajeRoutes);

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

//En fase final
//TODO: Se debe crear un workflow en n8n por usuario
//TODO: Ponerle seguridad al webhook de n8n
//TODO: Conectar a bd en linea mongoDB Atlas