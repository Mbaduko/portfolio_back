import { FilterQuery } from 'mongoose';
import { IExperience, Experience } from '../models/Experience.model';

export class ExperienceRepository {
  // Create
  async create(data: Partial<IExperience>): Promise<IExperience> {
    const experience = new Experience(data);
    return await experience.save();
  }

  // Read
  async findById(id: string): Promise<IExperience | null> {
    return (await Experience.findById(id)) as IExperience | null;
  }

  async findAll(): Promise<IExperience[]> {
    return (await Experience.find().sort({ from: -1 })) as IExperience[];
  }

  async findOne(filter: FilterQuery<IExperience>): Promise<IExperience | null> {
    return (await Experience.findOne(filter)) as IExperience | null;
  }

  // Update
  async updateById(id: string, data: Partial<IExperience>): Promise<IExperience | null> {
    return (await Experience.findByIdAndUpdate(id, data, { new: true, runValidators: true })) as IExperience | null;
  }

  async update(filter: FilterQuery<IExperience>, data: Partial<IExperience>): Promise<IExperience | null> {
    return (await Experience.findOneAndUpdate(filter, data, { new: true, runValidators: true })) as unknown as IExperience | null;
  }

  // Delete
  async deleteById(id: string): Promise<IExperience | null> {
    return (await Experience.findByIdAndDelete(id)) as IExperience | null;
  }

  async delete(filter: FilterQuery<IExperience>): Promise<IExperience | null> {
    return (await Experience.findOneAndDelete(filter)) as IExperience | null;
  }
}

