import mongoose, { Schema, Document } from 'mongoose';

export interface ITechnology extends Document {
  name: string;
  logo?: string;
  level: string;
  experience?: string;
  category: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const TechnologySchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    logo: {
      type: String,
      trim: true,
    },
    level: {
      type: String,
      required: true,
      trim: true,
    },
    experience: {
      type: String,
      trim: true,
    },
    category: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Technology = mongoose.model<ITechnology>('Technology', TechnologySchema);

