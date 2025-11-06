import { SkillRepository } from '../../repositories/Skill.repository';
import { AppError, handleError } from '../../utils';
import { GraphQLError } from 'graphql/error';
import mongoose from 'mongoose';

const skillRepository = new SkillRepository();

interface CreateSkillInput {
  title: string;
  description?: string;
  technologies?: string[];
}

interface UpdateSkillInput {
  title?: string;
  description?: string;
  technologies?: string[];
}

export const skillResolver = {
  Query: {
    skills: async () => {
      try {
        const skills = await skillRepository.findAll(true);
        return skills.map((skill) => ({
          id: (skill._id as any).toString(),
          title: skill.title,
          description: skill.description,
          technologies: skill.technologies,
          createdAt: skill.createdAt?.toISOString(),
          updatedAt: skill.updatedAt?.toISOString(),
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
    skill: async (_: any, { id }: { id: string }) => {
      try {
        if (!mongoose.Types.ObjectId.isValid(id)) throw new AppError('Invalid skill id provided', 400);
        const skill = await skillRepository.findById(id, true);
        if (!skill) throw new AppError(`Skill with id \"${id}\" not found`, 404);
        return {
          id: (skill._id as any).toString(),
          title: skill.title,
          description: skill.description,
          technologies: skill.technologies,
          createdAt: skill.createdAt?.toISOString(),
          updatedAt: skill.updatedAt?.toISOString(),
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
    createSkill: async (_: any, { input }: { input: CreateSkillInput }) => {
      try {
        // Validation
        if (!input.title || typeof input.title !== 'string' || !input.title.trim()) {
          throw new AppError('Title is required', 400);
        }

        if (input.technologies && !Array.isArray(input.technologies)) {
          throw new AppError('Technologies must be an array of IDs', 400);
        }

        if (input.technologies) {
          for (const id of input.technologies) {
            if (!mongoose.Types.ObjectId.isValid(id)) {
              throw new AppError(`Invalid technology id: ${id}`, 400);
            }
          }
        }

        const data: any = {
          title: input.title.trim(),
          description: input.description?.trim(),
          technologies: input.technologies || [],
        };

        const skill = await skillRepository.create(data as any, /* populate handled by repository */);

        // populate before returning
        await (skill as any).populate('technologies');

        return {
          id: (skill._id as any).toString(),
          title: skill.title,
          description: skill.description,
          technologies: skill.technologies,
          createdAt: skill.createdAt?.toISOString(),
          updatedAt: skill.updatedAt?.toISOString(),
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

    updateSkill: async (_: any, { id, input }: { id: string; input: UpdateSkillInput }) => {
      try {
        if (!mongoose.Types.ObjectId.isValid(id)) throw new AppError('Invalid skill id provided', 400);

        const updateData: any = {};
        if (input.title !== undefined) {
          if (!input.title || !input.title.trim()) throw new AppError('Title cannot be empty', 400);
          updateData.title = input.title.trim();
        }
        if (input.description !== undefined) updateData.description = input.description?.trim();

        if (input.technologies !== undefined) {
          if (!Array.isArray(input.technologies)) throw new AppError('Technologies must be an array of IDs', 400);
          for (const tid of input.technologies) {
            if (!mongoose.Types.ObjectId.isValid(tid)) throw new AppError(`Invalid technology id: ${tid}`, 400);
          }
          updateData.technologies = input.technologies;
        }

        const updated = await skillRepository.updateById(id, updateData as any);
        if (!updated) throw new AppError(`Skill with id \"${id}\" not found`, 404);

        // populate
        await (updated as any).populate('technologies');

        return {
          id: (updated._id as any).toString(),
          title: updated.title,
          description: updated.description,
          technologies: updated.technologies,
          createdAt: updated.createdAt?.toISOString(),
          updatedAt: updated.updatedAt?.toISOString(),
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

    deleteSkill: async (_: any, { id }: { id: string }) => {
      try {
        if (!mongoose.Types.ObjectId.isValid(id)) throw new AppError('Invalid skill id provided', 400);
        const deleted = await skillRepository.deleteById(id);
        if (!deleted) throw new AppError(`Skill with id \"${id}\" not found`, 404);

        return {
          id: (deleted._id as any).toString(),
          title: deleted.title,
          description: deleted.description,
          technologies: deleted.technologies,
          createdAt: deleted.createdAt?.toISOString(),
          updatedAt: deleted.updatedAt?.toISOString(),
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
