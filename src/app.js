import express from "express";
import { xssSanitizer } from "./middlewares/sanitizer-middleware.js";
import v1UsuarioRoutes from "./routes/v1/usuario-routes.js";
import v1DocumentoRoutes from "./routes/v1/documento-routes.js";
import v1MensajeRoutes from "./routes/v1/mensaje-routes.js";
import v1CategoriaRoutes from "./routes/v1/categoria-routes.js";
import initializeApp from "./config/app-initializer.js";

const app = express();

// Inicializar aplicación
await initializeApp();

app.use(express.json());

//middelware sanitizado
app.use(xssSanitizer);

app.use("/api/v1/usuarios", v1UsuarioRoutes);
app.use("/api/v1/documentos", v1DocumentoRoutes);
app.use("/api/v1/mensajes", v1MensajeRoutes);
app.use("/api/v1/categorias", v1CategoriaRoutes);

export default app;