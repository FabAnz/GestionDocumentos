import express from "express";
import { authMiddleware } from "../../middlewares/auth-middleware.js";
import { validateRequest } from "../../middlewares/validation-middleware.js";
import { validateCreateDocumento, validateDocumentoId, validateUpdateDocumento, validateCreateDocumentoFromFile } from "../../validations/validation-documento.js";
import reqValidate from "../../constants/request-validation.js";
import { createDocumento, getDocumentos, getDocumentoById, updateDocumento, deleteDocumento } from "../../controllers/documento-controller.js";
import { limiteDocumentos } from "../../middlewares/limite-middleware.js";
import { uploadFile } from "../../middlewares/upload-middleware.js";

const routes = express.Router();

routes.use(authMiddleware);

routes.post("/", limiteDocumentos, uploadFile, validateRequest(validateCreateDocumentoFromFile, reqValidate.BODY), createDocumento);
routes.get("/", getDocumentos);
routes.get("/:id", validateRequest(validateDocumentoId, reqValidate.PARAMS), getDocumentoById);
routes.put("/:id", uploadFile, validateRequest(validateDocumentoId, reqValidate.PARAMS), validateRequest(validateUpdateDocumento, reqValidate.BODY), updateDocumento);
routes.delete("/:id", validateRequest(validateDocumentoId, reqValidate.PARAMS), deleteDocumento);

export default routes;