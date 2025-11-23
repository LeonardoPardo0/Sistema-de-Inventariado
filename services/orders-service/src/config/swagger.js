import swaggerJSDoc from 'swagger-jsdoc';
import { SERVICE_NAME, SERVICE_VERSION, PORT } from './env.js';

const swaggerDefinition = {
    openapi: '3.0.0',
    info: {
        title: `${SERVICE_NAME} API`,
        version: SERVICE_VERSION,
        description: 'API para gestión de órdenes de compra. Integra validación de usuarios, productos y stock.',
        contact: {
            name: 'Grupo 3',
            email: 'soporte@microservicios.com'
        }
    },
    servers: [
        {
            url: `http://localhost:${PORT}`,
            description: 'Servidor de desarrollo'
        },
        {
            url: 'http://localhost:80/api',
            description: 'API Gateway'
        }
    ],
    components: {
        securitySchemes: {
            bearerAuth: {
                type: 'http',
                scheme: 'bearer',
                bearerFormat: 'JWT',
                description: 'Ingresa el token JWT obtenido desde Auth Service'
            }
        },
        schemas: {
            Order: {
                type: 'object',
                required: ['userId', 'items', 'totalAmount', 'shippingAddress'],
                properties: {
                    _id: {
                        type: 'string',
                        description: 'ID único de la orden'
                    },
                    userId: {
                        type: 'string',
                        description: 'ID del usuario que realizó la orden'
                    },
                    items: {
                        type: 'array',
                        items: {
                            type: 'object',
                            properties: {
                                productId: {
                                    type: 'string',
                                    description: 'ID del producto'
                                },
                                productName: {
                                    type: 'string',
                                    description: 'Nombre del producto'
                                },
                                quantity: {
                                    type: 'number',
                                    description: 'Cantidad ordenada'
                                },
                                price: {
                                    type: 'number',
                                    description: 'Precio unitario al momento de la orden'
                                }
                            }
                        }
                    },
                    totalAmount: {
                        type: 'number',
                        description: 'Monto total de la orden'
                    },
                    status: {
                        type: 'string',
                        enum: ['pendiente', 'pagada', 'enviada', 'entregada', 'cancelada'],
                        description: 'Estado actual de la orden'
                    },
                    shippingAddress: {
                        type: 'string',
                        description: 'Dirección de envío'
                    },
                    userEmail: {
                        type: 'string',
                        description: 'Email del usuario (auditoría)'
                    },
                    userName: {
                        type: 'string',
                        description: 'Nombre del usuario (auditoría)'
                    },
                    createdAt: {
                        type: 'string',
                        format: 'date-time',
                        description: 'Fecha de creación'
                    },
                    updatedAt: {
                        type: 'string',
                        format: 'date-time',
                        description: 'Fecha de última actualización'
                    }
                }
            },
            SuccessResponse: {
                type: 'object',
                properties: {
                    success: {
                        type: 'boolean',
                        example: true
                    },
                    message: {
                        type: 'string',
                        example: 'Operación exitosa'
                    },
                    data: {
                        type: 'object'
                    }
                }
            },
            ErrorResponse: {
                type: 'object',
                properties: {
                    success: {
                        type: 'boolean',
                        example: false
                    },
                    message: {
                        type: 'string',
                        example: 'Error en la operación'
                    },
                    error: {
                        type: 'string',
                        example: 'Descripción del error'
                    }
                }
            }
        }
    },
    security: [
        {
            bearerAuth: []
        }
    ]
};

const options = {
    swaggerDefinition,
    apis: ['./src/routes/*.js', './src/models/*.js']
};

const swaggerSpec = swaggerJSDoc(options);

export default swaggerSpec;