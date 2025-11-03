import { Application } from 'express';
import { json } from 'body-parser';
import cors from 'cors';
import graphqlUploadExpress from 'graphql-upload/graphqlUploadExpress.mjs';

export const expressLoader = (app: Application) => {
  app.use(cors());
  
  // Handle file uploads before JSON parsing
  app.use(graphqlUploadExpress());
  
  app.use(json());
  app.get('/health', (req, res) => res.send('Server is healthy'));
};

