import { Task, CreateTaskDTO, UpdateTaskDTO } from './types';
import { TaskModel, ITask } from './models/Task';
import { escapeRegex } from './util/escapeRegex';

/** Helper to convert Mongoose doc to Task API response */
function mapTask(doc: ITask): Task {
  return {
    id: doc._id.toString(),
    title: doc.title,
    description: doc.description,
    priority: doc.priority,
    importance: doc.importance,
    createdAt: doc.createdAt.toISOString(),
    deadline: doc.deadline,
    done: doc.done,
    deletedAt: doc.deletedAt?.toISOString() || null,
  };
}

/** MongoDB based task store */
export class TaskStore {
  async getAll(userId: string): Promise<Task[]> {
    const tasks = await TaskModel.find({ userId, deletedAt: null }).sort({ createdAt: -1 });
    return tasks.map(mapTask);
  }

  async getArchived(userId: string): Promise<Task[]> {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(0, 0, 0, 0);

    const tasks = await TaskModel.find({
      userId,
      deletedAt: null,
      $or: [{ createdAt: { $lt: yesterday } }, { done: true }],
    }).sort({ createdAt: -1 });

    return tasks.map(mapTask);
  }

  async create(userId: string, dto: CreateTaskDTO): Promise<Task> {
    // Duplicate check (non-deleted tasks in the same quadrant)
    const duplicate = await TaskModel.findOne({
      userId,
      title: { $regex: new RegExp(`^${escapeRegex(dto.title)}$`, 'i') },
      priority: dto.priority,
      importance: dto.importance,
      done: false,
      deletedAt: null,
    });

    if (duplicate) {
      throw new Error(`A task with title "${dto.title}" already exists in the same quadrant.`);
    }

    const doc = await TaskModel.create({
      userId,
      ...dto,
      createdAt: new Date(),
      done: false,
      deletedAt: null,
    });

    return mapTask(doc);
  }

  async update(userId: string, taskId: string, dto: UpdateTaskDTO): Promise<Task> {
    const updated = await TaskModel.findOneAndUpdate(
      { _id: taskId, userId, deletedAt: null },
      { $set: dto },
      { new: true }
    );

    if (!updated) throw new Error('Task not found');
    return mapTask(updated);
  }

  async delete(userId: string, taskId: string): Promise<void> {
    const result = await TaskModel.updateOne(
      { _id: taskId, userId, deletedAt: null },
      { $set: { deletedAt: new Date() } }
    );

    if (result.matchedCount === 0) throw new Error('Task not found');
  }
}

export const store = new TaskStore();
