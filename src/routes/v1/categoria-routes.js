import express from "express";
import { authMiddleware } from "../../middlewares/auth-middleware.js";
import { getCategorias } from "../../controllers/categoria-controller.js";

const routes = express.Router();

routes.use(authMiddleware);

routes.get("/", getCategorias);

export default routes;