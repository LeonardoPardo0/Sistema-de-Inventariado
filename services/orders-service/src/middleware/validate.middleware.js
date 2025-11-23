import Joi from 'joi';

/**
 * Schema para crear una orden
 */
export const createOrderSchema = Joi.object({
    items: Joi.array()
        .items(
            Joi.object({
                productId: Joi.string()
                    .required()
                    .trim()
                    .messages({
                        'string.empty': 'El ID del producto es obligatorio',
                        'any.required': 'El ID del producto es obligatorio'
                    }),
                quantity: Joi.number()
                    .integer()
                    .min(1)
                    .required()
                    .messages({
                        'number.base': 'La cantidad debe ser un número',
                        'number.min': 'La cantidad debe ser al menos 1',
                        'any.required': 'La cantidad es obligatoria'
                    })
            })
        )
        .min(1)
        .required()
        .messages({
            'array.min': 'La orden debe contener al menos un producto',
            'any.required': 'Los items son obligatorios'
        }),

    shippingAddress: Joi.string()
        .trim()
        .min(10)
        .max(500)
        .required()
        .messages({
            'string.empty': 'La dirección de envío es obligatoria',
            'string.min': 'La dirección debe tener al menos 10 caracteres',
            'string.max': 'La dirección no puede exceder los 500 caracteres',
            'any.required': 'La dirección de envío es obligatoria'
        })
});

/**
 * Schema para actualizar estado de orden
 */
export const updateOrderStatusSchema = Joi.object({
    status: Joi.string()
        .valid('pendiente', 'pagada', 'enviada', 'entregada', 'cancelada')
        .required()
        .messages({
            'any.only': 'Estado no válido. Valores permitidos: pendiente, pagada, enviada, entregada, cancelada',
            'any.required': 'El estado es obligatorio'
        })
});

/**
 * Middleware genérico de validación
 */
export const validateSchema = (schema) => (req, res, next) => {
    const { error } = schema.validate(req.body, {
        abortEarly: false,
        stripUnknown: true
    });

    if (error) {
        const errors = error.details.map(detail => detail.message);

        return res.status(400).json({
            success: false,
            message: 'Error de validación',
            errors: errors
        });
    }

    next();
};