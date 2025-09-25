import express from "express";
import { authMiddleware } from "../../middlewares/auth-middleware.js";
import { validateRequest } from "../../middlewares/validation-middleware.js";
import { validateCreateDocumento, validateDocumentoId, validateUpdateDocumento } from "../../validations/validation-documento.js";
import reqValidate from "../../constants/request-validation.js";
import { createDocumento, getDocumentos, getDocumentoById, updateDocumento } from "../../controllers/documento-controller.js";
import { limiteDocumentos } from "../../middlewares/limite-middleware.js";

const routes = express.Router();

routes.use(authMiddleware);

routes.post("/", limiteDocumentos, validateRequest(validateCreateDocumento, reqValidate.BODY), createDocumento);
routes.get("/", getDocumentos);
routes.get("/:id", validateRequest(validateDocumentoId, reqValidate.PARAMS), getDocumentoById);
routes.put("/:id", validateRequest(validateDocumentoId, reqValidate.PARAMS), validateRequest(validateUpdateDocumento, reqValidate.BODY), updateDocumento);

export default routes;
//TODO: Falta restar el limite de interacciones con documentos en las modificaciones de documentos