import { TechnologyRepository } from '../../repositories/Technology.repository';
import { AppError, handleError } from '../../utils';
import { GraphQLError } from 'graphql/error';

const technologyRepository = new TechnologyRepository();

interface CreateTechnologyInput {
  name: string;
  logo?: string;
  level: string;
  experience?: string;
  category: string;
}

export const technologyResolver = {
  Query: {
    technologies: async () => {
      try {
        const technologies = await technologyRepository.findAll();
        return technologies.map((tech) => ({
          id: (tech._id as any).toString(),
          name: tech.name,
          logo: tech.logo,
          level: tech.level,
          experience: tech.experience,
          category: tech.category,
          createdAt: tech.createdAt?.toISOString(),
          updatedAt: tech.updatedAt?.toISOString(),
        }));
      } catch (error: any) {
        const errorResponse = handleError(error);
        throw new GraphQLError(errorResponse.message, {
          extensions: {
            code: errorResponse.status >= 400 && errorResponse.status < 500 ? 'BAD_REQUEST' : 'INTERNAL_SERVER_ERROR',
            statusCode: errorResponse.status,
          },
        });
      }
    },
    technology: async (_: any, { id }: { id: string }) => {
      try {
        const technology = await technologyRepository.findById(id);
        if (!technology) {
          throw new AppError(`Technology with id "${id}" not found`, 404);
        }
        return {
          id: (technology._id as any).toString(),
          name: technology.name,
          logo: technology.logo,
          level: technology.level,
          experience: technology.experience,
          category: technology.category,
          createdAt: technology.createdAt?.toISOString(),
          updatedAt: technology.updatedAt?.toISOString(),
        };
      } catch (error: any) {
        const errorResponse = handleError(error);
        throw new GraphQLError(errorResponse.message, {
          extensions: {
            code: errorResponse.status >= 400 && errorResponse.status < 500 ? 'BAD_REQUEST' : 'INTERNAL_SERVER_ERROR',
            statusCode: errorResponse.status,
          },
        });
      }
    },
  },
  Mutation: {
    createTechnology: async (_: any, { input }: { input: CreateTechnologyInput }) => {
      try {
        // Check if technology with same name already exists
        const existing = await technologyRepository.findOne({ name: input.name });
        if (existing) {
          throw new AppError(`Technology with name "${input.name}" already exists`, 409);
        }

        const technology = await technologyRepository.create(input);
        return {
          id: (technology._id as any).toString(),
          name: technology.name,
          logo: technology.logo,
          level: technology.level,
          experience: technology.experience,
          category: technology.category,
          createdAt: technology.createdAt?.toISOString(),
          updatedAt: technology.updatedAt?.toISOString(),
        };
      } catch (error: any) {
        const errorResponse = handleError(error);
        throw new GraphQLError(errorResponse.message, {
          extensions: {
            code: errorResponse.status >= 400 && errorResponse.status < 500 ? 'BAD_REQUEST' : 'INTERNAL_SERVER_ERROR',
            statusCode: errorResponse.status,
          },
        });
      }
    },
  },
};

