import swaggerJSDoc from 'swagger-jsdoc';
import { env } from './env.config';

const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'SIH PS 44 - Academia-Industry Collaboration & Skill Intelligence Platform API',
    version: '1.0.0',
    description:
      'Backend REST API for SIH Problem Statement 44: Academia–Industry Collaboration & Skill Intelligence Platform.',
    contact: {
      name: 'SIH PS 44 Backend Team',
    },
  },
  servers: [
    {
      url: `http://localhost:${env.PORT}/api/v1`,
      description: 'Local Development Server (v1)',
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Enter your JWT token in the format Bearer <token>',
      },
    },
    schemas: {
      ApiResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          message: { type: 'string', example: 'Operation successful' },
          data: { type: 'object' },
        },
      },
      ApiErrorResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: false },
          message: { type: 'string', example: 'Error description' },
          errors: {
            type: 'array',
            items: { type: 'object' },
            example: [],
          },
        },
      },
    },
  },
};

const options: swaggerJSDoc.Options = {
  swaggerDefinition,
  apis: ['./src/routes/*.ts', './dist/routes/*.js'],
};

export const swaggerSpec = swaggerJSDoc(options);
