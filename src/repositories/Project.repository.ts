import { FilterQuery } from 'mongoose';
import { IProject, Project } from '../models/Project.model';

export class ProjectRepository {
  // Create
  async create(data: Partial<IProject>): Promise<IProject> {
    const project = new Project(data);
    return await project.save();
  }

  // Read
  async findById(id: string, populate = false): Promise<IProject | null> {
    const query = Project.findById(id);
    if (populate) {
      query.populate('technologies');
    }
    return (await query) as IProject | null;
  }

  async findAll(populate = false): Promise<IProject[]> {
    const query = Project.find();
    if (populate) {
      query.populate('technologies');
    }
    return (await query) as IProject[];
  }

  async findOne(filter: FilterQuery<IProject>, populate = false): Promise<IProject | null> {
    const query = Project.findOne(filter);
    if (populate) {
      query.populate('technologies');
    }
    return (await query) as IProject | null;
  }

  // Update
  async updateById(id: string, data: Partial<IProject>): Promise<IProject | null> {
    return (await Project.findByIdAndUpdate(id, data, { new: true, runValidators: true })) as IProject | null;
  }

  async update(filter: FilterQuery<IProject>, data: Partial<IProject>): Promise<IProject | null> {
    return (await Project.findOneAndUpdate(filter, data, { new: true, runValidators: true })) as unknown as IProject | null;
  }

  // Delete
  async deleteById(id: string): Promise<IProject | null> {
    return (await Project.findByIdAndDelete(id)) as IProject | null;
  }

  async delete(filter: FilterQuery<IProject>): Promise<IProject | null> {
    return (await Project.findOneAndDelete(filter)) as IProject | null;
  }
}

