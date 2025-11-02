import { Application } from 'express';
import { json } from 'body-parser';
import cors from 'cors';

export const expressLoader = (app: Application) => {
  app.use(cors());
  app.use(json());
  app.get('/health', (req, res) => res.send('Server is healthy'));
};

