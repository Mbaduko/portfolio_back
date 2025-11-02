import mongoose, { Schema, Document } from 'mongoose';

export interface IExperience extends Document {
  company: string;
  companyLogo?: string;
  position: string;
  location?: string;
  from: Date;
  to?: Date;
  achievements?: string[];
}

const ExperienceSchema: Schema = new Schema(
  {
    company: {
      type: String,
      required: true,
      trim: true,
    },
    companyLogo: {
      type: String,
      trim: true,
    },
    position: {
      type: String,
      required: true,
      trim: true,
    },
    location: {
      type: String,
      trim: true,
    },
    from: {
      type: Date,
      required: true,
    },
    to: {
      type: Date,
    },
    achievements: [
      {
        type: String,
        trim: true,
      },
    ],
  },
  {
    timestamps: true,
  }
);

export const Experience = mongoose.model<IExperience>('Experience', ExperienceSchema);

