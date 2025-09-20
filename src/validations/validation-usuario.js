import Joi from "joi";

export const validateCreateUsuario = Joi.object({
    email: Joi.string()
        .email({ tlds: { allow: false } })
        .max(254)
        .required()
        .messages({
            'string.base': 'El email debe ser texto',
            'string.empty': 'El email no puede estar vacío',
            'string.email': 'Debe proporcionar un email válido',
            'string.max': 'El email no puede tener más de {{#limit}} caracteres',
            'any.required': 'El email es obligatorio'
        }),
    password: Joi.string()
        .min(8)
        .max(128)
        .required()
        .messages({
            'string.base': 'La contraseña debe ser texto',
            'string.empty': 'La contraseña no puede estar vacía',
            'string.min': 'La contraseña debe tener al menos {{#limit}} caracteres',
            'string.max': 'La contraseña no puede tener más de {{#limit}} caracteres',
            'any.required': 'La contraseña es obligatoria'
        }),
    nombre: Joi.string()
        .min(2)
        .max(50)
        .required()
        .messages({
            'string.base': 'El nombre debe ser texto',
            'string.empty': 'El nombre no puede estar vacío',
            'string.min': 'El nombre debe tener al menos {{#limit}} caracteres',
            'string.max': 'El nombre no puede tener más de {{#limit}} caracteres',
            'any.required': 'El nombre es obligatorio'
        }),
    apellido: Joi.string()
        .min(2)
        .max(50)
        .required()
        .messages({
            'string.base': 'El apellido debe ser texto',
            'string.empty': 'El apellido no puede estar vacío',
            'string.min': 'El apellido debe tener al menos {{#limit}} caracteres',
            'string.max': 'El apellido no puede tener más de {{#limit}} caracteres',
            'any.required': 'El apellido es obligatorio'
        })
});