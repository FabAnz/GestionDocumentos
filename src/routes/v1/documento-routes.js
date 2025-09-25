import express from "express";
import { authMiddleware } from "../../middlewares/auth-middleware.js";
import { validateRequest } from "../../middlewares/validation-middleware.js";
import { validateCreateDocumento, validateGetDocumentoById } from "../../validations/validation-documento.js";
import reqValidate from "../../constants/request-validation.js";
import { createDocumento, getDocumentos, getDocumentoById } from "../../controllers/documento-controller.js";
import { limiteDocumentos } from "../../middlewares/limite-middleware.js";

const routes = express.Router();

routes.use(authMiddleware);

routes.post("/", limiteDocumentos, validateRequest(validateCreateDocumento, reqValidate.BODY), createDocumento);
routes.get("/", getDocumentos);
routes.get("/:id", validateRequest(validateGetDocumentoById, reqValidate.PARAMS), getDocumentoById);

export default routes;
//TODO: Falta restar el limite de interacciones con documentos en las modificaciones de documentos