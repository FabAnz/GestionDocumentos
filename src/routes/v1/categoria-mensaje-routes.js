import express from "express";
import { authMiddleware } from "../../middlewares/auth-middleware.js";
import { getCategoriaMensajesByUsuario } from "../../controllers/categoria-mensaje-controller.js";

const routes = express.Router();

routes.use(authMiddleware);

routes.get("/", getCategoriaMensajesByUsuario);

export default routes;

