import express from "express";
import helmet from "helmet";
import cors from "cors";
import { xssSanitizer } from "./middlewares/sanitizer-middleware.js";
import v1UsuarioRoutes from "./routes/v1/usuario-routes.js";
import v1DocumentoRoutes from "./routes/v1/documento-routes.js";
import v1MensajeRoutes from "./routes/v1/mensaje-routes.js";
import v1CategoriaRoutes from "./routes/v1/categoria-routes.js";
import v1CategoriaMensajeRoutes from "./routes/v1/categoria-mensaje-routes.js";
import initializeApp from "./config/app-initializer.js";
import { apiLimiter } from "./middlewares/rate-limit-middleware.js";

const app = express();

// Inicializar aplicación
await initializeApp();

// Configurar CORS para permitir conexiones desde el frontend React
// IMPORTANTE: CORS debe estar antes de Helmet para evitar conflictos
app.use(cors({
    origin: [
        "http://localhost:5173",
        "https://gestion-documentos-frontend.vercel.app"
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
}));

// Configurar Helmet para headers de seguridad HTTP
// Deshabilitamos crossOriginResourcePolicy para permitir CORS
app.use(helmet({
    crossOriginResourcePolicy: false
}));

app.use(express.json());

//middelware sanitizado
app.use(xssSanitizer);

app.use(apiLimiter);

app.use("/api/v1/usuarios", v1UsuarioRoutes);
app.use("/api/v1/documentos", v1DocumentoRoutes);
app.use("/api/v1/mensajes", v1MensajeRoutes);
app.use("/api/v1/categorias", v1CategoriaRoutes);
app.use("/api/v1/categoria-mensajes", v1CategoriaMensajeRoutes);

export default app;