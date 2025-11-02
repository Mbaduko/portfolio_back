import mongoose, { Schema, Document } from 'mongoose';
import { ITechnology } from './Technology.model';

export interface ISkill extends Document {
  title: string;
  description?: string;
  technologies: ITechnology['_id'][];
}

const SkillSchema: Schema = new Schema(
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

export const Skill = mongoose.model<ISkill>('Skill', SkillSchema);

