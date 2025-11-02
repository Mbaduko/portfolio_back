import { FilterQuery } from 'mongoose';
import { ICertificate, Certificate } from '../models/Certificate.model';

export class CertificateRepository {
  // Create
  async create(data: Partial<ICertificate>): Promise<ICertificate> {
    const certificate = new Certificate(data);
    return await certificate.save();
  }

  // Read
  async findById(id: string): Promise<ICertificate | null> {
    return (await Certificate.findById(id)) as ICertificate | null;
  }

  async findAll(): Promise<ICertificate[]> {
    return (await Certificate.find().sort({ priority: -1, date: -1 })) as ICertificate[];
  }

  async findOne(filter: FilterQuery<ICertificate>): Promise<ICertificate | null> {
    return (await Certificate.findOne(filter)) as ICertificate | null;
  }

  // Update
  async updateById(id: string, data: Partial<ICertificate>): Promise<ICertificate | null> {
    return (await Certificate.findByIdAndUpdate(id, data, { new: true, runValidators: true })) as ICertificate | null;
  }

  async update(filter: FilterQuery<ICertificate>, data: Partial<ICertificate>): Promise<ICertificate | null> {
    return (await Certificate.findOneAndUpdate(filter, data, { new: true, runValidators: true })) as unknown as ICertificate | null;
  }

  // Delete
  async deleteById(id: string): Promise<ICertificate | null> {
    return (await Certificate.findByIdAndDelete(id)) as ICertificate | null;
  }

  async delete(filter: FilterQuery<ICertificate>): Promise<ICertificate | null> {
    return (await Certificate.findOneAndDelete(filter)) as ICertificate | null;
  }
}

