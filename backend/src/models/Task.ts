import mongoose, { Schema, Document } from 'mongoose';
import { Priority, Importance } from '../types';

export interface ITask extends Document {
  userId: string;
  title: string;
  description?: string;
  priority: Priority;
  importance: Importance;
  createdAt: Date;
  deadline?: string;
  done: boolean;
  deletedAt?: Date | null;
}

const TaskSchema: Schema = new Schema({
  userId: { type: String, required: true, index: true },
  title: { type: String, required: true },
  description: { type: String },
  priority: { type: String, enum: ['urgent', 'not urgent'], required: true },
  importance: { type: String, enum: ['important', 'not important'], required: true },
  createdAt: { type: Date, default: Date.now },
  deadline: { type: String },
  done: { type: Boolean, default: false },
  deletedAt: { type: Date, default: null },
});

// Compound index for duplicate check and efficient querying
TaskSchema.index({ userId: 1, deletedAt: 1, createdAt: -1 });

export const TaskModel = mongoose.model<ITask>('Task', TaskSchema);
