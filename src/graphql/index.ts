import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@as-integrations/express4';
import { Application } from 'express';
import cors from 'cors';
import { json } from 'body-parser';
import { readFileSync } from 'fs';
import { join } from 'path';
import GraphQLUpload from 'graphql-upload/GraphQLUpload.mjs';
import { projectResolver } from './resolvers/project.resolver';
import { technologyResolver } from './resolvers/technology.resolver';

// Merge all GraphQL schemas
const projectSchema = readFileSync(join(__dirname, './schema/project.graphql'), 'utf8');
const technologySchema = readFileSync(join(__dirname, './schema/technology.graphql'), 'utf8');
const typeDefs = `${projectSchema}\n${technologySchema}`;

const resolvers = {
  Query: {
    ...technologyResolver.Query,
  },
  Mutation: {
    ...technologyResolver.Mutation,
    ...projectResolver.Mutation,
  },
  Upload: GraphQLUpload,
};

export const graphqlLoader = async (app: Application) => {
  const server = new ApolloServer({
    typeDefs,
    resolvers,
    csrfPrevention: {
      requestHeaders: ['content-type', 'x-apollo-operation-name'],
    },
    formatError: (error) => {
      // If it's already a GraphQLError with extensions, return it
      if (error.extensions) {
        return error;
      }
      
      // Otherwise, format it
      return {
        message: error.message,
        extensions: {
          code: error.extensions?.code || 'INTERNAL_SERVER_ERROR',
          statusCode: error.extensions?.statusCode || 500,
        },
      };
    },
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

