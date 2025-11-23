import swaggerJsdoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Inventory Service API',
      version: '1.0.0',
      description: 'API para la gestión de inventarios y control de stock',
      contact: {
        name: 'API Support',
        email: 'support@inventory.com'
      }
    },
    servers: [
      {
        url: 'http://localhost:3002',
        description: 'Servidor de desarrollo'
      },
      {
        url: 'http://inventory-service:3002',
        description: 'Servidor Docker'
      }
    ],
    tags: [
      {
        name: 'Inventory',
        description: 'Operaciones de gestión de inventario'
      },
      {
        name: 'Stock',
        description: 'Operaciones de control de stock'
      }
    ],
    components: {
      schemas: {
        Inventory: {
          type: 'object',
          required: ['productId', 'productName', 'quantity'],
          properties: {
            productId: {
              type: 'string',
              description: 'ID ',
            },
            productName: {
              type: 'string',
              description: 'Nombre del producto',
            },
            quantity: {
              type: 'integer',
              description: 'Cantidad disponible en stock',
              minimum: 0
            },
            location: {
              type: 'integer',
              description: 'Ubicación del producto en almacén',
            },
          }
        },
        StockUpdate: {
          type: 'object',
          required: ['quantity', 'operation'],
          properties: {
            quantity: {
              type: 'number',
              description: 'Cantidad a agregar o restar',
              minimum: 1
            },
            operation: {
              type: 'integer',
              enum: [1, 2],
              description: 'Tipo de operación: 1=add, 2=subtract'
            }
          }
        },
        SuccessResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean'
            },
            message: {
              type: 'string'
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
              type: 'boolean'
            },
            message: {
              type: 'string'
            },
            error: {
              type: 'string'
            }
          }
        },
        Warehouse: {
          type: 'object',
          required: ['warehouseId', 'name'],
          properties: { 
            name: {
              type: 'string',
              description: 'Nombre del almacén'
            },
            address: {
              type: 'string',
              description: 'Dirección del almacén'
            }
          }
        },
      }
    }
  },
  apis: ['./src/routes/*.js', './src/controllers/*.js']
};

const swaggerSpec = swaggerJsdoc(options);

export default swaggerSpec;