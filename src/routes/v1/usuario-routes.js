import express from "express";
import { createUsuario, loginUsuario, upgradePlan } from "../../controllers/usuario-controller.js";
import { validateRequest } from "../../middlewares/validation-middleware.js";
import { validateCreateUsuario, validateLoginUsuario } from "../../validations/validation-usuario.js";
import reqValidate from "../../constants/request-validation.js";
import { authMiddleware } from "../../middlewares/auth-middleware.js";
import { validateUpgradePlan } from "../../middlewares/upgrade-plan-middleware.js";
import { loginLimiter } from "../../middlewares/rate-limit-middleware.js";

const routes = express.Router();

routes.post("/registro", validateRequest(validateCreateUsuario, reqValidate.BODY), createUsuario);
routes.post("/login", loginLimiter, validateRequest(validateLoginUsuario, reqValidate.BODY), loginUsuario);
routes.put("/upgrade-plan", authMiddleware, validateUpgradePlan, upgradePlan);

export default routes;