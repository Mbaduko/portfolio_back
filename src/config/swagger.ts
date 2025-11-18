import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Portfolio API',
      version: '1.0.0',
      description: 'REST endpoints for portfolio backend',
    },
  },
  apis: ['./src/express/routes/*.ts'],
};

export const swaggerSpec = swaggerJsdoc(options);
