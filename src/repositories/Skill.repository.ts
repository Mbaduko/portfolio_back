import { FilterQuery } from 'mongoose';
import { ISkill, Skill } from '../models/Skill.model';

export class SkillRepository {
  // Create
  async create(data: Partial<ISkill>): Promise<ISkill> {
    const skill = new Skill(data);
    return await skill.save();
  }

  // Read
  async findById(id: string, populate = false): Promise<ISkill | null> {
    const query = Skill.findById(id);
    if (populate) {
      query.populate('technologies');
    }
    return (await query) as ISkill | null;
  }

  async findAll(populate = false): Promise<ISkill[]> {
    const query = Skill.find();
    if (populate) {
      query.populate('technologies');
    }
    return (await query) as ISkill[];
  }

  async findOne(filter: FilterQuery<ISkill>, populate = false): Promise<ISkill | null> {
    const query = Skill.findOne(filter);
    if (populate) {
      query.populate('technologies');
    }
    return (await query) as ISkill | null;
  }

  // Update
  async updateById(id: string, data: Partial<ISkill>): Promise<ISkill | null> {
    return (await Skill.findByIdAndUpdate(id, data, { new: true, runValidators: true })) as ISkill | null;
  }

  async update(filter: FilterQuery<ISkill>, data: Partial<ISkill>): Promise<ISkill | null> {
    return (await Skill.findOneAndUpdate(filter, data, { new: true, runValidators: true })) as unknown as ISkill | null;
  }

  // Delete
  async deleteById(id: string): Promise<ISkill | null> {
    return (await Skill.findByIdAndDelete(id)) as ISkill | null;
  }

  async delete(filter: FilterQuery<ISkill>): Promise<ISkill | null> {
    return (await Skill.findOneAndDelete(filter)) as ISkill | null;
  }
}

