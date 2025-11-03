import { ProjectRepository } from '../../repositories/Project.repository';
import { AppError, handleError } from '../../utils';
import { GraphQLError } from 'graphql/error';
import { deleteImageFromCloudinary, extractPublicIdFromUrl, uploadStreamToCloudinary } from '../../utils/cloudinary';
import { Readable } from 'stream';

const projectRepository = new ProjectRepository();

interface CreateProjectInput {
  title: string;
  description?: string;
  status: string;
  role?: string;
  livelink?: string;
  githublink?: string;
  thumbnail: any; // FileUpload from graphql-upload
  technologies: string[];
}

export const projectResolver = {
  Query: {
    projects: async () => {
      try {
        return await projectRepository.findAll(true);
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
    project: async  (_:any, {id}: {id: string}) => {
      try {
        return await projectRepository.findById(id);
      } catch (error: any) {        
        const errorResponse = handleError(error);
        throw new GraphQLError(errorResponse.message, {
          extensions: {
            code: errorResponse.status >= 400 && errorResponse.status < 500 ? 'BAD_REQUEST' : 'INTERNAL_SERVER_ERROR',
            statusCode: errorResponse.status,
          },
        });
      }
    }
  },

  Mutation: {
    createProject: async (_: any, { input }: { input: CreateProjectInput }) => {
      let thumbnailUrl: string | undefined = undefined;
      try {

        // Handle file upload for thumbnail using graphql-upload
        if (!input.thumbnail) {
          throw new AppError('Thumbnail is required', 400);
        }

        // Get the file from graphql-upload
        const file = await input.thumbnail;
        
        if (!file || typeof file !== 'object' || !('createReadStream' in file)) {
          throw new AppError('Invalid file upload', 400);
        }

        const { createReadStream, filename, mimetype } = file;

        // Validate file type (images only) - check both mimetype and file extension
        const imageMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml', 'image/bmp'];
        const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.bmp'];
        
        const isValidMimeType = mimetype && imageMimeTypes.includes(mimetype.toLowerCase());
        const isValidExtension = filename && imageExtensions.some(ext => 
          filename.toLowerCase().endsWith(ext.toLowerCase())
        );
        
        // Accept if either mimetype or extension is valid (handles cases where mimetype might be incorrectly set)
        if (!isValidMimeType && !isValidExtension) {
          const acceptedFormats = imageExtensions.map(ext => ext.replace('.', '').toUpperCase()).join(', ');
          throw new AppError(
            `Thumbnail must be an image file. Accepted formats: ${acceptedFormats}. Received: ${mimetype || 'unknown mimetype'}, file: ${filename || 'unknown filename'}`,
            400
          );
        }

        // Create readable stream from the uploaded file
        const stream = createReadStream() as Readable;

        // Stream directly to Cloudinary
        thumbnailUrl = await uploadStreamToCloudinary(stream);

        // Create project data with Cloudinary URL
        const projectData = {
          title: input.title,
          description: input.description,
          status: input.status,
          role: input.role,
          livelink: input.livelink,
          githublink: input.githublink,
          thumbnail: thumbnailUrl,
          technologies: input.technologies,
        };

        // Save project via repository and return populated relations
        return await projectRepository.create(projectData, { populate: ['technologies'] });
        
      } catch (error: any) {
        if (thumbnailUrl){
          try {
            await deleteImageFromCloudinary(extractPublicIdFromUrl(thumbnailUrl))
          } catch (err) {
            console.error("Failed deleting image on cloudinary:", err)
          }
        }

        let errorResponse;
        if (error.name === 'ValidationError' 
            && error.errors 
            && error.errors['technologies.0'] 
            && error.errors['technologies.0'].kind === '[ObjectId]'
            && error.errors['technologies.0'].name === 'CastError') {
          errorResponse = handleError(new AppError('Invalid technology ID provided.', 400))
        }
        else
          errorResponse= handleError(error);
        throw new GraphQLError(errorResponse.message, {
          extensions: {
            code: errorResponse.status >= 400 && errorResponse.status < 500 ? 'BAD_REQUEST' : 'INTERNAL_SERVER_ERROR',
            statusCode: errorResponse.status,
          },
        });
      }
    },
  }
};
