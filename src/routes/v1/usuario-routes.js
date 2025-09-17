import express from "express";
import { createUsuario } from "../../controllers/usuario-controller.js";

const routes = express.Router();

routes.post("/registro", createUsuario);

export default routes;