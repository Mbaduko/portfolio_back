import { ExperienceRepository } from '../../repositories/Experience.repository';
import { AppError, handleError } from '../../utils';
import { GraphQLError } from 'graphql/error';
import { deleteImageFromCloudinary, extractPublicIdFromUrl, uploadStreamToCloudinary } from '../../utils/cloudinary';
import { Readable } from 'stream';

const experienceRepository = new ExperienceRepository();

interface CreateExperienceInput {
  company: string;
  companyLogo?: any; // FileUpload
  position: string;
  location?: string;
  from: string; // ISO date string
  to?: string; // ISO date string
  achievements?: string[];
}

export const experienceResolver = {
  Query: {
    experiences: async () => {
      try {
        const experiences = await experienceRepository.findAll();
        return experiences.map((exp) => ({
          id: (exp._id as any).toString(),
          company: exp.company,
          companyLogo: exp.companyLogo,
          position: exp.position,
          location: exp.location,
          from: exp.from?.toISOString(),
          to: exp.to?.toISOString(),
          achievements: exp.achievements,
          createdAt: exp.createdAt?.toISOString(),
          updatedAt: exp.updatedAt?.toISOString(),
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

    experience: async (_: any, { id }: { id: string }) => {
      try {
        const exp = await experienceRepository.findById(id);
        if (!exp) return null;
        return {
          id: (exp._id as any).toString(),
          company: exp.company,
          companyLogo: exp.companyLogo,
          position: exp.position,
          location: exp.location,
          from: exp.from?.toISOString(),
          to: exp.to?.toISOString(),
          achievements: exp.achievements,
          createdAt: exp.createdAt?.toISOString(),
          updatedAt: exp.updatedAt?.toISOString(),
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
    createExperience: async (_: any, { input }: { input: CreateExperienceInput }) => {
      let uploadedLogoUrl: string | undefined = undefined;
      try {
        // Basic validation
        if (!input.company || typeof input.company !== 'string' || !input.company.trim()) {
          throw new AppError('Company is required', 400);
        }
        if (!input.position || typeof input.position !== 'string' || !input.position.trim()) {
          throw new AppError('Position is required', 400);
        }
        if (!input.from || isNaN(Date.parse(input.from))) {
          throw new AppError('Valid "from" date is required (ISO string)', 400);
        }
        if (input.to && isNaN(Date.parse(input.to))) {
          throw new AppError('If provided, "to" must be a valid date (ISO string)', 400);
        }

        // Handle optional companyLogo upload
        if (input.companyLogo) {
          const file = await input.companyLogo;
          if (!file || typeof file !== 'object' || !('createReadStream' in file)) {
            throw new AppError('Invalid file upload for companyLogo', 400);
          }

          const { createReadStream, filename, mimetype } = file;

          const imageMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml', 'image/bmp'];
          const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.bmp'];

          const isValidMimeType = mimetype && imageMimeTypes.includes(mimetype.toLowerCase());
          const isValidExtension = filename && imageExtensions.some(ext => filename.toLowerCase().endsWith(ext.toLowerCase()));

          if (!isValidMimeType && !isValidExtension) {
            const acceptedFormats = imageExtensions.map(ext => ext.replace('.', '').toUpperCase()).join(', ');
            throw new AppError(`companyLogo must be an image. Accepted formats: ${acceptedFormats}. Received: ${mimetype || 'unknown mimetype'}`, 400);
          }

          const stream = createReadStream() as Readable;
          uploadedLogoUrl = await uploadStreamToCloudinary(stream, 'company_logos');
        }

        const experienceData: any = {
          company: input.company.trim(),
          companyLogo: uploadedLogoUrl,
          position: input.position.trim(),
          location: input.location?.trim(),
          from: new Date(input.from),
          to: input.to ? new Date(input.to) : undefined,
          achievements: input.achievements || [],
        };

        const experience = await experienceRepository.create(experienceData);

        return {
          id: (experience._id as any).toString(),
          company: experience.company,
          companyLogo: experience.companyLogo,
          position: experience.position,
          location: experience.location,
          from: experience.from?.toISOString(),
          to: experience.to?.toISOString(),
          achievements: experience.achievements,
          createdAt: experience.createdAt?.toISOString(),
          updatedAt: experience.updatedAt?.toISOString(),
        };
      } catch (error: any) {
        // If upload occurred but later failed, attempt to delete uploaded image
        if (uploadedLogoUrl) {
          try {
            await deleteImageFromCloudinary(extractPublicIdFromUrl(uploadedLogoUrl), 'company_logos');
          } catch (err) {
            console.error('Failed deleting company logo on cloudinary:', err);
          }
        }

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
