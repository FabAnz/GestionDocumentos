import express from "express";
import { createUsuario } from "../../controllers/usuario-controller.js";
import { validateRequest } from "../../middlewares/validation-middleware.js";
import { validateCreateUsuario } from "../../validations/validation-usuario.js";
import reqValidate from "../../constants/request-validation.js";

const routes = express.Router();

routes.post("/registro", validateRequest(validateCreateUsuario, reqValidate.BODY), createUsuario);

export default routes;