import express from "express";
import { probarChat } from "../../controllers/mensaje-controller.js";
import { authMiddleware } from "../../middlewares/auth-middleware.js";
import { validateRequest } from "../../middlewares/validation-middleware.js";
import { validateCreateMensaje } from "../../validations/validation-mensaje.js";
import reqValidate from "../../constants/request-validation.js";
import { agregarIdCliente } from "../../middlewares/mensaje-middleware.js";

const routes = express.Router();

routes.use(authMiddleware);

//Endpoint para que el usuario pueda hablar con el chatbot para evaluar el modelo y entrenarlo en las respuestas antes de lanzarlo al público
routes.post("/probar-chat",agregarIdCliente, validateRequest(validateCreateMensaje, reqValidate.BODY), probarChat);


export default routes;