import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@as-integrations/express4';
import { Application } from 'express';
import cors from 'cors';
import { json } from 'body-parser';
import { readFileSync } from 'fs';
import { join } from 'path';
import { projectResolver } from './resolvers/project.resolver';

const typeDefs = readFileSync(join(__dirname, './schema/project.graphql'), 'utf8');

const resolvers = {
  Query: {
    ...projectResolver.Query,
  }
};

export const graphqlLoader = async (app: Application) => {
  const server = new ApolloServer({
    typeDefs,
    resolvers,
  });

  await server.start();
  
  app.use(
    '/graphql',
    cors<cors.CorsRequest>(),
    json(),
    expressMiddleware(server, {
      context: async ({ req }) => ({ req }),
    })
  );
};

