import { Application, Request, Response, NextFunction } from 'express';
import express from 'express';
import cors from 'cors';
import graphqlUploadExpress from 'graphql-upload/graphqlUploadExpress.mjs';
import contactRouter from '../express/routes/contact.route';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from '../config/swagger';
import { handleError } from '../utils';

export const expressLoader = (app: Application) => {
  app.use(cors());
  
  // Use Express's native JSON parser (required for Apollo Server v4+)
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  
  // Handle file uploads
  app.use(graphqlUploadExpress());

  const expressRouter = express.Router();
  // Mount contact REST route
  expressRouter.use('/contact', contactRouter);

  // Swagger UI
  expressRouter.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  // Health check
  app.get('/health', (req, res) => res.send('Server is healthy'));

  app.use("/express", expressRouter);

  // Global error handler that leverages project's handleError utility
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const errorResponse = handleError(err);
    return res.status(errorResponse.status).json({ status: 'failure', message: errorResponse.message });
  });
};

