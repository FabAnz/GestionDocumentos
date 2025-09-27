import Joi from "joi";

export const validateCreateMensaje = Joi.object({
    idCliente: Joi.string().required().messages({
        'string.base': 'El ID del cliente debe ser texto',
        'string.empty': 'El ID del cliente no puede estar vacío',
        'any.required': 'El ID del cliente es obligatorio',
        'string.pattern.base': 'El ID del cliente debe ser un ObjectId válido'
    }),
    contenido: Joi.string().max(10000).required().messages({
        'string.base': 'El contenido debe ser texto',
        'string.empty': 'El contenido no puede estar vacío',
        'any.required': 'El contenido es obligatorio',
        'string.max': 'El contenido no puede tener más de 10000 caracteres'
    })
}).options({ presence: 'required' });