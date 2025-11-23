import Joi from 'joi';

// 🔹 Esquema para crear un producto
export const createProductSchema = Joi.object({
  name: Joi.string()
    .trim()
    .min(2)
    .max(100)
    .required()
    .messages({
      'string.empty': 'El nombre es obligatorio',
      'string.min': 'El nombre debe tener al menos 2 caracteres',
      'string.max': 'El nombre no puede exceder los 100 caracteres'
    }),

  description: Joi.string()
    .trim()
    .max(500)
    .allow('')
    .optional()
    .messages({
      'string.empty': 'La descripción es obligatoria',
      'string.max': 'La descripción no puede exceder los 500 caracteres'
    }),

  price: Joi.number()
    .min(0)
    .required()
    .messages({
      'number.base': 'El precio debe ser un número',
      'number.min': 'El precio no puede ser negativo',
      'any.required': 'El precio es obligatorio'
    }),

  category: Joi.string()
    .valid('electronics', 'clothing', 'food', 'books', 'other')
    .required()
    .messages({
      'any.only': 'Categoría no válida',
      'any.required': 'La categoría es obligatoria'
    }),

  sku: Joi.string()
    .trim()
    .max(50)
    .optional()
    .messages({
      'string.max': 'El SKU no puede exceder los 50 caracteres'
    })
});

// 🔹 Esquema para actualizar un producto
export const updateProductSchema = Joi.object({
  name: Joi.string().trim().min(2).max(100),
  description: Joi.string().trim().max(500).allow(''),
  price: Joi.number().min(0),
  sku: Joi.string().trim().max(50),
  category: Joi.string().valid('electronics', 'clothing', 'food', 'books', 'other')
}).min(1).messages({
  'object.min': 'Debe proporcionar al menos un campo para actualizar'
});

// 🔹 Middleware genérico de validación
export const validateSchema = (schema) => (req, res, next) => {
  const { error } = schema.validate(req.body, { abortEarly: true });

  if (error) {
    return res.status(400).json({
      success: false,
      message: 'Error de validación',
      error: error.details[0].message
    });
  }

  next();
};
