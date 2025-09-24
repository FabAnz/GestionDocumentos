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
    categorias: Joi.array()
        .items(Joi.string().pattern(/^[0-9a-fA-F]{24}$/))
        .min(1)
        .required()
        .messages({
            'array.base': 'Las categorías deben ser un array',
            'array.min': 'Debe seleccionar al menos una categoría',
            'any.required': 'Las categorías son obligatorias',
            'string.pattern.base': 'El ID de categoría debe ser un ObjectId válido'
        }),
    contenido: Joi.string()
        .required()
        .max(10000)
        .messages({
            'string.base': 'El contenido debe ser texto',
            'string.empty': 'El contenido no puede estar vacío',
            'string.max': 'El contenido no puede tener más de {{#limit}} caracteres',
            'any.required': 'El contenido es obligatorio'
        })
});