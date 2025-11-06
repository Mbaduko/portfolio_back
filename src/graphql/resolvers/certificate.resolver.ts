import { CertificateRepository } from '../../repositories/Certificate.repository';
import { AppError, handleError } from '../../utils';
import { GraphQLError } from 'graphql/error';
import { uploadStreamToCloudinary, deleteImageFromCloudinary, extractPublicIdFromUrl } from '../../utils/cloudinary';
import { Readable } from 'stream';
import mongoose from 'mongoose';

const certificateRepository = new CertificateRepository();

// Map Priority enum to numeric value in model
const PRIORITY_MAP: Record<string, number> = {
  HIGH: 3,
  MEDIUM: 2,
  LOW: 1,
};

export const certificateResolver = {
  Query: {
    certificates: async () => {
      try {
        const certificates = await certificateRepository.findAll();
        return certificates.map((c) => ({
          id: (c._id as any).toString(),
          title: c.title,
          issuer: c.issuer,
          category: c.category,
          priority: Object.keys(PRIORITY_MAP).find(k => PRIORITY_MAP[k] === c.priority) || 'LOW',
          issuedDate: c.date?.toISOString(),
          validUntil: c.validUntil?.toISOString(),
          credentialId: c.credentialId,
          logo: c.logo,
          description: c.description,
          skills: c.skills,
          createdAt: c.createdAt?.toISOString(),
          updatedAt: c.updatedAt?.toISOString(),
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

    certificate: async (_: any, { id }: { id: string }) => {
      try {
        if (!mongoose.Types.ObjectId.isValid(id)) throw new AppError('Invalid certificate id provided', 400);
        const cert = await certificateRepository.findById(id);
        if (!cert) throw new AppError(`Certificate with id \"${id}\" not found`, 404);
        return {
          id: (cert._id as any).toString(),
          title: cert.title,
          issuer: cert.issuer,
          category: cert.category,
          priority: Object.keys(PRIORITY_MAP).find(k => PRIORITY_MAP[k] === cert.priority) || 'LOW',
          issuedDate: cert.date?.toISOString(),
          validUntil: cert.validUntil?.toISOString(),
          credentialId: cert.credentialId,
          logo: cert.logo,
          description: cert.description,
          skills: cert.skills,
          createdAt: cert.createdAt?.toISOString(),
          updatedAt: cert.updatedAt?.toISOString(),
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
    createCertificate: async (_: any, { input }: any) => {
      let uploadedLogoUrl: string | undefined = undefined;
      try {
        // Validate required fields
        if (!input.title || typeof input.title !== 'string' || !input.title.trim()) throw new AppError('Title is required', 400);
        if (!input.issuer || typeof input.issuer !== 'string' || !input.issuer.trim()) throw new AppError('Issuer is required', 400);
        if (!input.category || typeof input.category !== 'string') throw new AppError('Category is required', 400);
        if (!['COMPETITION', 'ACADEMIC', 'RECOGNITION'].includes(input.category)) throw new AppError('Invalid category', 400);
        if (!input.priority || typeof input.priority !== 'string') throw new AppError('Priority is required', 400);
        if (!['HIGH', 'MEDIUM', 'LOW'].includes(input.priority)) throw new AppError('Invalid priority', 400);
        if (!input.issuedDate || isNaN(Date.parse(input.issuedDate))) throw new AppError('Valid issuedDate is required (ISO string)', 400);
        if (input.validUntil && isNaN(Date.parse(input.validUntil))) throw new AppError('If provided, validUntil must be a valid date (ISO string)', 400);

        // Handle optional logo upload
        if (input.logo) {
          const file = await input.logo;
          if (!file || typeof file !== 'object' || !('createReadStream' in file)) throw new AppError('Invalid file upload for logo', 400);
          const { createReadStream, filename, mimetype } = file;

          const imageMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml', 'image/bmp'];
          const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.bmp'];

          const isValidMimeType = mimetype && imageMimeTypes.includes(mimetype.toLowerCase());
          const isValidExtension = filename && imageExtensions.some(ext => filename.toLowerCase().endsWith(ext.toLowerCase()));

          if (!isValidMimeType && !isValidExtension) {
            const acceptedFormats = imageExtensions.map(ext => ext.replace('.', '').toUpperCase()).join(', ');
            throw new AppError(`Logo must be an image. Accepted formats: ${acceptedFormats}. Received: ${mimetype || 'unknown mimetype'}`, 400);
          }

          const stream = createReadStream() as Readable;
          uploadedLogoUrl = await uploadStreamToCloudinary(stream, 'certificate_logos');
        }

        const data: any = {
          title: input.title.trim(),
          issuer: input.issuer.trim(),
          category: input.category,
          priority: PRIORITY_MAP[input.priority] ?? PRIORITY_MAP.LOW,
          date: new Date(input.issuedDate),
          validUntil: input.validUntil ? new Date(input.validUntil) : undefined,
          credentialId: input.credentialId?.trim(),
          logo: uploadedLogoUrl,
          description: input.description?.trim(),
          skills: Array.isArray(input.skills) ? input.skills.map((s: any) => String(s)) : [],
          type: input.type || 'certificate',
          status: input.status || 'active',
        };

        const cert = await certificateRepository.create(data);

        return {
          id: (cert._id as any).toString(),
          title: cert.title,
          issuer: cert.issuer,
          category: cert.category,
          priority: Object.keys(PRIORITY_MAP).find(k => PRIORITY_MAP[k] === cert.priority) || 'LOW',
          issuedDate: cert.date?.toISOString(),
          validUntil: cert.validUntil?.toISOString(),
          credentialId: cert.credentialId,
          logo: cert.logo,
          description: cert.description,
          skills: cert.skills,
          createdAt: cert.createdAt?.toISOString(),
          updatedAt: cert.updatedAt?.toISOString(),
        };
      } catch (error: any) {
        if (uploadedLogoUrl) {
          try {
            await deleteImageFromCloudinary(extractPublicIdFromUrl(uploadedLogoUrl), 'certificate_logos');
          } catch (err) {
            console.error('Failed deleting certificate logo on cloudinary:', err);
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

    updateCertificate: async (_: any, { id, input }: any) => {
      let uploadedLogoUrl: string | undefined = undefined;
      try {
        if (!mongoose.Types.ObjectId.isValid(id)) throw new AppError('Invalid certificate id provided', 400);

        const updateData: any = {};

        if (input.title !== undefined) {
          if (!input.title || !input.title.trim()) throw new AppError('Title cannot be empty', 400);
          updateData.title = input.title.trim();
        }
        if (input.issuer !== undefined) {
          if (!input.issuer || !input.issuer.trim()) throw new AppError('Issuer cannot be empty', 400);
          updateData.issuer = input.issuer.trim();
        }
        if (input.category !== undefined) {
          if (!['COMPETITION', 'ACADEMIC', 'RECOGNITION'].includes(input.category)) throw new AppError('Invalid category', 400);
          updateData.category = input.category;
        }
        if (input.priority !== undefined) {
          if (!['HIGH', 'MEDIUM', 'LOW'].includes(input.priority)) throw new AppError('Invalid priority', 400);
          updateData.priority = PRIORITY_MAP[input.priority];
        }
        if (input.issuedDate !== undefined) {
          if (!input.issuedDate || isNaN(Date.parse(input.issuedDate))) throw new AppError('issuedDate must be a valid date (ISO string)', 400);
          updateData.date = new Date(input.issuedDate);
        }
        if (input.validUntil !== undefined) {
          if (input.validUntil && isNaN(Date.parse(input.validUntil))) throw new AppError('validUntil must be a valid date (ISO string)', 400);
          updateData.validUntil = input.validUntil ? new Date(input.validUntil) : undefined;
        }
        if (input.credentialId !== undefined) updateData.credentialId = input.credentialId?.trim();
        if (input.description !== undefined) updateData.description = input.description?.trim();
        if (input.skills !== undefined) updateData.skills = Array.isArray(input.skills) ? input.skills.map((s: any) => String(s)) : [];
        if (input.type !== undefined) updateData.type = input.type;
        if (input.status !== undefined) updateData.status = input.status;

        // handle logo replacement
        if (input.logo) {
          const file = await input.logo;
          if (!file || typeof file !== 'object' || !('createReadStream' in file)) throw new AppError('Invalid file upload for logo', 400);
          const { createReadStream, filename, mimetype } = file;

          const imageMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml', 'image/bmp'];
          const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.bmp'];

          const isValidMimeType = mimetype && imageMimeTypes.includes(mimetype.toLowerCase());
          const isValidExtension = filename && imageExtensions.some(ext => filename.toLowerCase().endsWith(ext.toLowerCase()));

          if (!isValidMimeType && !isValidExtension) {
            const acceptedFormats = imageExtensions.map(ext => ext.replace('.', '').toUpperCase()).join(', ');
            throw new AppError(`Logo must be an image. Accepted formats: ${acceptedFormats}. Received: ${mimetype || 'unknown mimetype'}`, 400);
          }

          const stream = createReadStream() as Readable;
          uploadedLogoUrl = await uploadStreamToCloudinary(stream, 'certificate_logos');
          updateData.logo = uploadedLogoUrl;
        }

        const updated = await certificateRepository.updateById(id, updateData);
        if (!updated) {
          // If new logo uploaded, delete it because update failed
          if (uploadedLogoUrl) {
            try {
              await deleteImageFromCloudinary(extractPublicIdFromUrl(uploadedLogoUrl), 'certificate_logos');
            } catch (err) {
              console.error('Failed deleting certificate logo on cloudinary after update failure:', err);
            }
          }
          throw new AppError(`Certificate with id \"${id}\" not found`, 404);
        }

        return {
          id: (updated._id as any).toString(),
          title: updated.title,
          issuer: updated.issuer,
          category: updated.category,
          priority: Object.keys(PRIORITY_MAP).find(k => PRIORITY_MAP[k] === updated.priority) || 'LOW',
          issuedDate: updated.date?.toISOString(),
          validUntil: updated.validUntil?.toISOString(),
          credentialId: updated.credentialId,
          logo: updated.logo,
          description: updated.description,
          skills: updated.skills,
          createdAt: updated.createdAt?.toISOString(),
          updatedAt: updated.updatedAt?.toISOString(),
        };
      } catch (error: any) {
        if (uploadedLogoUrl) {
          try {
            await deleteImageFromCloudinary(extractPublicIdFromUrl(uploadedLogoUrl), 'certificate_logos');
          } catch (err) {
            console.error('Failed deleting certificate logo on cloudinary:', err);
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

    deleteCertificate: async (_: any, { id }: { id: string }) => {
      try {
        if (!mongoose.Types.ObjectId.isValid(id)) throw new AppError('Invalid certificate id provided', 400);
        const deleted = await certificateRepository.deleteById(id);
        if (!deleted) throw new AppError(`Certificate with id \"${id}\" not found`, 404);

        // If deleted had a logo, attempt to delete from cloudinary
        if (deleted.logo) {
          try {
            await deleteImageFromCloudinary(extractPublicIdFromUrl(deleted.logo), 'certificate_logos');
          } catch (err) {
            console.error('Failed deleting certificate logo on cloudinary after delete:', err);
          }
        }

        return {
          id: (deleted._id as any).toString(),
          title: deleted.title,
          issuer: deleted.issuer,
          category: deleted.category,
          priority: Object.keys(PRIORITY_MAP).find(k => PRIORITY_MAP[k] === deleted.priority) || 'LOW',
          issuedDate: deleted.date?.toISOString(),
          validUntil: deleted.validUntil?.toISOString(),
          credentialId: deleted.credentialId,
          logo: deleted.logo,
          description: deleted.description,
          skills: deleted.skills,
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
