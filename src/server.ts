import express from 'express';
import { env } from './config/.env';
import { connectDB } from './config/db';
import { expressLoader } from './loaders/express.loader';
import { graphqlLoader } from './graphql';

const app = express();

async function bootstrap() {
  expressLoader(app);
  await connectDB();
  await graphqlLoader(app);

  app.listen(env.PORT, () => {
    console.log(`🚀 Server running on http://localhost:${env.PORT}`);
    console.log(`📚 GraphQL at http://localhost:${env.PORT}/graphql`);
  });
}

bootstrap();
