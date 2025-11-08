import Joi from "joi";

export const validateCreateDocumento = Joi.object({
    titulo: Joi.string()
        .required()
        .max(200)
        .messages({
            'string.base': 'El título debe ser texto',
            'string.empty': 'El título no puede estar vacío',
            'string.max': 'El título no puede tener más de {{#limit}} caracteres',
            'any.required': 'El título es obligatorio'
        }),
    categoria: Joi.string()
        .pattern(/^[0-9a-fA-F]{24}$/)
        .required()
        .messages({
            'string.base': 'La categoría debe ser texto',
            'string.empty': 'La categoría no puede estar vacía',
            'any.required': 'La categoría es obligatoria',
            'string.pattern.base': 'El ID de categoría debe ser un ObjectId válido'
        }),
    contenido: Joi.string()
        .required()
        .max(12000000)
        .messages({
            'string.base': 'El contenido debe ser texto',
            'string.empty': 'El contenido no puede estar vacío',
            'string.max': 'El contenido no puede tener más de {{#limit}} caracteres',
            'any.required': 'El contenido es obligatorio'
        })
}).options({
    presence: "required"
});

export const validateDocumentoId = Joi.object({
    id: Joi.string()
        .required()
        .messages({
            'string.base': 'El ID debe ser texto',
            'string.empty': 'El ID no puede estar vacío',
            'any.required': 'El ID es obligatorio'
        })
}).options({
    presence: "required"
});

export const validateUpdateDocumento = Joi.object({
    titulo: Joi.string()
        .max(200)
        .messages({
            'string.base': 'El título debe ser texto',
            'string.empty': 'El título no puede estar vacío',
            'string.max': 'El título no puede tener más de {{#limit}} caracteres'
        }),
    categoria: Joi.string()
        .pattern(/^[0-9a-fA-F]{24}$/)
        .messages({
            'string.base': 'La categoría debe ser texto',
            'string.empty': 'La categoría no puede estar vacía',
            'string.pattern.base': 'El ID de categoría debe ser un ObjectId válido'
        }),
    contenido: Joi.string()
        .max(12000000)
        .messages({
            'string.base': 'El contenido debe ser texto',
            'string.empty': 'El contenido no puede estar vacío',
            'string.max': 'El contenido no puede tener más de {{#limit}} caracteres'
        })
}).min(1).messages({
    'object.min': 'Debe enviar al menos un campo para actualizar'
});

export const validateCreateDocumentoFromFile = Joi.object({
    titulo: Joi.string()
        .required()
        .max(200)
        .messages({
            'string.base': 'El título debe ser texto',
            'string.empty': 'El título no puede estar vacío',
            'string.max': 'El título no puede tener más de {{#limit}} caracteres',
            'any.required': 'El título es obligatorio'
        }),
    categoria: Joi.string()
        .pattern(/^[0-9a-fA-F]{24}$/)
        .required()
        .messages({
            'string.base': 'La categoría debe ser texto',
            'string.empty': 'La categoría no puede estar vacía',
            'any.required': 'La categoría es obligatoria',
            'string.pattern.base': 'El ID de categoría debe ser un ObjectId válido'
        })
}).options({
    presence: "required"
});