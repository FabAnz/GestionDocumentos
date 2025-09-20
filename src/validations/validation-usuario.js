import Joi from "joi";

export const validateCreateUsuario = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
    nombre: Joi.string().required(),
    apellido: Joi.string().required(),
});