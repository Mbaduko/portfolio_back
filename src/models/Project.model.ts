import mongoose, { Schema, Document } from 'mongoose';
import { ITechnology } from './Technology.model';

export interface IProject extends Document {
  title: string;
  description?: string;
  status: string;
  role?: string;
  livelink?: string;
  githublink?: string;
  thumbnail?: string;
  technologies: ITechnology['_id'][];
}

const ProjectSchema: Schema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      required: true,
      trim: true,
    },
    role: {
      type: String,
      trim: true,
    },
    livelink: {
      type: String,
      trim: true,
    },
    githublink: {
      type: String,
      trim: true,
    },
    thumbnail: {
      type: String,
      trim: true,
    },
    technologies: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Technology',
      },
    ],
  },
  {
    timestamps: true,
  }
);

export const Project = mongoose.model<IProject>('Project', ProjectSchema);

