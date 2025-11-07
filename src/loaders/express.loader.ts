import { Application } from 'express';
import express from 'express';
import cors from 'cors';
import graphqlUploadExpress from 'graphql-upload/graphqlUploadExpress.mjs';

export const expressLoader = (app: Application) => {
  app.use(cors());
  
  // Use Express's native JSON parser (required for Apollo Server v4+)
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  
  // Handle file uploads
  app.use(graphqlUploadExpress());
  
  app.get('/health', (req, res) => res.send('Server is healthy'));
};

