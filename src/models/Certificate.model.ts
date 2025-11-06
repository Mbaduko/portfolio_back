import mongoose, { Schema, Document } from 'mongoose';

export interface ICertificate extends Document {
  title: string;
  issuer: string;
  date: Date;
  category: string;
  type: string;
  logo?: string;
  description?: string;
  skills: string[];
  credentialId?: string;
  status: string;
  validUntil?: Date;
  priority?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

const CertificateSchema: Schema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    issuer: {
      type: String,
      required: true,
      trim: true,
    },
    date: {
      type: Date,
      required: true,
    },
    category: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      required: true,
      trim: true,
    },
    logo: {
      type: String,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    skills: [
      {
        type: String,
        trim: true,
      },
    ],
    credentialId: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      required: true,
      trim: true,
    },
    validUntil: {
      type: Date,
    },
    priority: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

export const Certificate = mongoose.model<ICertificate>('Certificate', CertificateSchema);

