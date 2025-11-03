import { v2 as cloudinary } from 'cloudinary';
import { Readable } from 'stream';
import { env } from '../config/.env';
import { AppError } from './AppError';

// Configure Cloudinary
cloudinary.config({
  cloud_name: env.CLOUDINARY_CLOUD_NAME,
  api_key: env.CLOUDINARY_API_KEY,
  api_secret: env.CLOUDINARY_API_SECRET,
});

/**
 * Upload a file stream directly to Cloudinary
 * @param stream - Readable stream from graphql-upload
 * @param folder - Folder name in Cloudinary (default: 'portfolio')
 * @returns Promise resolving to the secure URL of the uploaded image
 */
export const uploadStreamToCloudinary = async (
  stream: Readable,
  folder: string = env.CLOUDINARY_THUMBNAIL_FOLDER
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: `portfolio/${folder}`,
        resource_type: 'image',
        transformation: [
          { quality: 'auto' },
          { fetch_format: 'auto' },
        ],
      },
      (error, result) => {
        if (error) {
          if (error?.message?.includes('timeout') || error?.message?.includes('Timeout')) {
            return reject(new Error('Please check your internet connection and try again.'));
          }
          if (error?.http_code === 400) {
            return reject(new AppError('File format not supported', 400));
          }
          return reject(new Error(`Thumbnail upload failed`));
        }

        if (!result) {
          return reject(new Error('Thumbnaul upload failed'));
        }
        resolve(result.secure_url);
      }
    );

    stream.on('error', (error) => {
      reject(new Error(`Stream error: ${error.message}`));
    });

    stream.pipe(uploadStream);
  });
};

/**
 * Delete an image from Cloudinary by its public ID
 * @param publicId - Cloudinary public ID of the image (not including folder prefix)
 * @param folder - Folder name where the image is stored (default: 'portfolio')
 * @returns Promise that resolves when deletion is done
 */
export const deleteImageFromCloudinary = async (
  publicId: string,
  folder: string = env.CLOUDINARY_THUMBNAIL_FOLDER
): Promise<void> => {
  const fullPublicId = `portfolio/${folder}/${publicId}`;
  return new Promise((resolve, reject) => {
    cloudinary.uploader.destroy(fullPublicId, { resource_type: 'image' }, (error, result) => {
      if (error) {
        return reject(new Error(`Cloudinary deletion failed: ${error.message}`));
      }
      if (result.result !== 'ok' && result.result !== 'not found') {
        return reject(new Error(`Cloudinary deletion failed: ${JSON.stringify(result)}`));
      }

      resolve();
    });
  });
};

export const extractPublicIdFromUrl = (url: string): string => {
  const filename = url.split('/').pop() || ''
  return filename.split('.').slice(0, -1).join(".") || filename;
};


export default cloudinary;
