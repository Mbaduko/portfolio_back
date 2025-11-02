import { FilterQuery } from 'mongoose';
import { ITechnology, Technology } from '../models/Technology.model';

export class TechnologyRepository {
  // Create
  async create(data: Partial<ITechnology>): Promise<ITechnology> {
    const technology = new Technology(data);
    return await technology.save();
  }

  // Read
  async findById(id: string): Promise<ITechnology | null> {
    return (await Technology.findById(id)) as ITechnology | null;
  }

  async findAll(): Promise<ITechnology[]> {
    return (await Technology.find()) as ITechnology[];
  }

  async findOne(filter: FilterQuery<ITechnology>): Promise<ITechnology | null> {
    return (await Technology.findOne(filter)) as ITechnology | null;
  }

  // Update
  async updateById(id: string, data: Partial<ITechnology>): Promise<ITechnology | null> {
    return (await Technology.findByIdAndUpdate(id, data, { new: true, runValidators: true })) as ITechnology | null;
  }

  async update(filter: FilterQuery<ITechnology>, data: Partial<ITechnology>): Promise<ITechnology | null> {
    return (await Technology.findOneAndUpdate(filter, data, { new: true, runValidators: true })) as unknown as ITechnology | null;
  }

  // Delete
  async deleteById(id: string): Promise<ITechnology | null> {
    return (await Technology.findByIdAndDelete(id)) as ITechnology | null;
  }

  async delete(filter: FilterQuery<ITechnology>): Promise<ITechnology | null> {
    return (await Technology.findOneAndDelete(filter)) as ITechnology | null;
  }
}

