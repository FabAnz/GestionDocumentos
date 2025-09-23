import express from "express";
import { authMiddleware } from "../../middlewares/auth-middleware.js";
import { validateRequest } from "../../middlewares/validation-middleware.js";
import { validateCreateDocumento } from "../../validations/validation-documento.js";
import reqValidate from "../../constants/request-validation.js";
import { createDocumento } from "../../controllers/documento-controller.js";

const routes = express.Router();

routes.use(authMiddleware);

routes.post("/", validateRequest(validateCreateDocumento, reqValidate.BODY), createDocumento);

export default routes;
