import express from "express";
import { createUsuario, loginUsuario } from "../../controllers/usuario-controller.js";
import { validateRequest } from "../../middlewares/validation-middleware.js";
import { validateCreateUsuario, validateLoginUsuario } from "../../validations/validation-usuario.js";
import reqValidate from "../../constants/request-validation.js";

const routes = express.Router();

routes.post("/registro", validateRequest(validateCreateUsuario, reqValidate.BODY), createUsuario);
routes.post("/login", validateRequest(validateLoginUsuario, reqValidate.BODY), loginUsuario);

export default routes;