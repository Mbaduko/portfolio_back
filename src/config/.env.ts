import dotenv from 'dotenv';

dotenv.config();

interface EnvConfig {
  PORT: number;
  MONGODB_URI: string;
  NODE_ENV: string;
  CLOUDINARY_CLOUD_NAME: string;
  CLOUDINARY_API_KEY: string;
  CLOUDINARY_API_SECRET: string;
  CLOUDINARY_THUMBNAIL_FOLDER: string;
  MAIL_SERVICE?: string;
  MAIL_USER?: string;
  MAIL_PASS?: string;
  ADMIN_EMAIL?: string;
}
const requiredEnvVars = ['MONGODB_URI', 'CLOUDINARY_CLOUD_NAME', 'CLOUDINARY_API_KEY', 'CLOUDINARY_API_SECRET'];
const missingEnvVars = requiredEnvVars.filter((varName) => !process.env[varName]);

if (missingEnvVars.length > 0) {
  throw new Error(
    `Missing required environment variables: ${missingEnvVars.join(', ')}\n` +
    'Please create a .env file with the required variables.'
  );
}

export const env: EnvConfig = {
  PORT: parseInt(process.env.PORT || '4000', 10),
  MONGODB_URI: process.env.MONGODB_URI!,
  NODE_ENV: process.env.NODE_ENV || 'development',
  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME!,
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY!,
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET!,
  CLOUDINARY_THUMBNAIL_FOLDER: process.env.CLOUDINARY_THUMBNAIL_FOLDER || 'thumbnails',
  MAIL_SERVICE: process.env.MAIL_SERVICE,
  MAIL_USER: process.env.MAIL_USER,
  MAIL_PASS: process.env.MAIL_PASS,
  ADMIN_EMAIL: process.env.ADMIN_EMAIL,
};
